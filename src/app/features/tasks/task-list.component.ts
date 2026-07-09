import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDto, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskFormComponent } from './task-form.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, FormsModule],
  template: `
    <div class="glass-panel">
      <div class="flex justify-between items-center mb-4">
        <h3>Tasks</h3>
        <button class="btn btn-primary" (click)="openForm()">+ New Task</button>
      </div>
      
      <div class="flex justify-between mb-4 gap-4">
        <select class="form-input" style="max-width: 200px" [(ngModel)]="statusFilter" (change)="loadTasks()">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--glass-border);">
              <th style="padding: 12px; color: var(--text-secondary);">Title</th>
              <th style="padding: 12px; color: var(--text-secondary);">Status</th>
              <th style="padding: 12px; color: var(--text-secondary);">Due Date</th>
              <th style="padding: 12px; color: var(--text-secondary); text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of tasks()" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 12px;">
                <div style="font-weight: 500">{{ task.title }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted)">{{ task.description | slice:0:50 }}<span *ngIf="task.description && task.description.length > 50">...</span></div>
              </td>
              <td style="padding: 12px;">
                <span class="badge" [ngClass]="'badge-' + task.status.toLowerCase().replace('_', '-')">
                  {{ task.status.replace('_', ' ') }}
                </span>
              </td>
              <td style="padding: 12px; color: var(--text-secondary);">
                {{ task.dueDate | date:'medium' }}
              </td>
              <td style="padding: 12px; text-align: right;">
                <button class="btn btn-secondary" style="padding: 6px 12px; margin-right: 8px;" (click)="editTask(task)">Edit</button>
                <button class="btn btn-danger" style="padding: 6px 12px;" (click)="deleteTask(task.uuid!)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="tasks().length === 0">
              <td colspan="4" class="text-center" style="padding: 24px; color: var(--text-muted);">
                No tasks found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="flex justify-between items-center mt-4" *ngIf="totalPages() > 1">
        <button class="btn btn-secondary" [disabled]="currentPage() === 0" (click)="changePage(-1)">Previous</button>
        <span style="color: var(--text-secondary)">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
        <button class="btn btn-secondary" [disabled]="currentPage() >= totalPages() - 1" (click)="changePage(1)">Next</button>
      </div>
    </div>

    <app-task-form 
      [isOpen]="isFormOpen()" 
      [task]="selectedTask()"
      (formClosed)="closeForm()"
      (taskSaved)="loadTasks()">
    </app-task-form>
  `
})
export class TaskListComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private wsService = inject(WebsocketService);
  private authService = inject(AuthService);

  tasks = signal<TaskDto[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  statusFilter = '';

  isFormOpen = signal(false);
  selectedTask = signal<TaskDto | null>(null);
  
  private wsSubscriptions: Subscription[] = [];

  ngOnInit() {
    this.loadTasks();
    this.setupWebSockets();
  }

  ngOnDestroy() {
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTasks() {
    const status = this.statusFilter ? (this.statusFilter as TaskStatus) : undefined;

    const request$ = this.authService.isAdmin()
      ? this.taskService.getAllTasks(this.currentPage(), 10, status)
      : this.taskService.getMyTasks(this.currentPage(), 10, status);

    request$.subscribe(page => {
      this.tasks.set(page.content);
      this.totalPages.set(page.totalPages);
    });
  }

  setupWebSockets() {
    if (this.wsService.rxStomp) {
      const sub1 = this.wsService.rxStomp.watch('/topic/tasks').subscribe((message) => {
        const updatedTask: TaskDto = JSON.parse(message.body);
        
        // If not admin, verify ownership before updating list
        if (!this.authService.isAdmin() && updatedTask.ownerUuid !== this.authService.currentUser()?.uuid) {
           return;
        }
        
        this.tasks.update(currentTasks => {
          const idx = currentTasks.findIndex(t => t.uuid === updatedTask.uuid);
          if (idx !== -1) {
            const newTasks = [...currentTasks];
            newTasks[idx] = updatedTask;
            return newTasks;
          } else if (this.currentPage() === 0) {
            // New task, add to top if on first page
            return [updatedTask, ...currentTasks].slice(0, 10);
          }
          return currentTasks;
        });
      });

      const sub2 = this.wsService.rxStomp.watch('/topic/tasks/deleted').subscribe((message) => {
        const deletedUuid = message.body.replace(/"/g, ''); // body might be a plain UUID string or JSON
        this.tasks.update(currentTasks => currentTasks.filter(t => t.uuid !== deletedUuid));
      });

      this.wsSubscriptions.push(sub1, sub2);
    }
  }

  changePage(delta: number) {
    this.currentPage.update(p => p + delta);
    this.loadTasks();
  }

  openForm() {
    this.selectedTask.set(null);
    this.isFormOpen.set(true);
  }

  editTask(task: TaskDto) {
    this.selectedTask.set(task);
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.selectedTask.set(null);
  }

  deleteTask(uuid: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(uuid).subscribe(() => {
        this.loadTasks();
      });
    }
  }
}
