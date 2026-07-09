import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskDto, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen">
      <div class="glass-panel" style="width: 100%; max-width: 500px;">
        <div class="flex justify-between items-center mb-4">
          <h3>{{ task?.uuid ? 'Edit Task' : 'New Task' }}</h3>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 1.25rem;" (click)="close()">×</button>
        </div>

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" formControlName="title" placeholder="Task title">
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input" formControlName="description" rows="3" placeholder="Task description"></textarea>
          </div>
          
          <div class="flex gap-4 mb-4">
            <div class="form-group w-full">
              <label class="form-label">Status</label>
              <select class="form-input" formControlName="status">
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <div class="form-group w-full">
              <label class="form-label">Due Date</label>
              <input #dateInput type="datetime-local" class="form-input" formControlName="dueDate" [min]="minDate" (click)="dateInput.showPicker()" style="cursor: pointer;">
            </div>
          </div>

          <div *ngIf="errorMessage" class="form-error mb-4 text-center" style="color: #ff6b6b;">
            {{ errorMessage }}
          </div>

          <div class="flex justify-between mt-4">
            <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid || isLoading">
              {{ isLoading ? 'Saving...' : 'Save Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TaskFormComponent {
  @Input() isOpen = false;
  @Input() set task(val: TaskDto | null) {
    this._task = val;
    if (val) {
      this.taskForm.patchValue({
        title: val.title,
        description: val.description,
        status: val.status,
        dueDate: new Date(val.dueDate).toISOString().slice(0, 16)
      });
    } else {
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      const tzOffset = defaultDate.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(defaultDate.getTime() - tzOffset)).toISOString().slice(0, 16);
      
      this.taskForm.reset({ status: TaskStatus.PENDING, dueDate: localISOTime });
    }
  }
  
  get task() { return this._task; }
  private _task: TaskDto | null = null;

  @Output() formClosed = new EventEmitter<void>();
  @Output() taskSaved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  taskForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: [TaskStatus.PENDING, Validators.required],
    dueDate: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  get minDate(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  close() {
    this.formClosed.emit();
    this.taskForm.reset();
    this.errorMessage = '';
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isLoading = true;
      const formValue = this.taskForm.getRawValue();
      const taskData: TaskDto = {
        ...this._task,
        title: formValue.title,
        description: formValue.description,
        status: formValue.status as TaskStatus,
        dueDate: new Date(formValue.dueDate).toISOString()
      };

      const request = this._task?.uuid
        ? this.taskService.updateTask(this._task.uuid, taskData)
        : this.taskService.createTask(taskData);

      request.subscribe({
        next: () => {
          this.isLoading = false;
          this.taskSaved.emit();
          this.close();
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 400 && err.error?.message) {
            this.errorMessage = err.error.message.replace('Validation Failed: ', '');
          } else if (err.error?.message) {
            this.errorMessage = 'Server Error: ' + err.error.message;
          } else {
            this.errorMessage = 'An error occurred while saving the task.';
          }
          console.error(err);
        }
      });
    }
  }
}
