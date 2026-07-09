import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDto, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserDto } from '../../core/models/user.model';
import { TaskFormComponent } from './task-form.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, FormsModule],
  template: `
    <div class="glass-panel" style="padding: 32px;">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 style="font-size: 1.5rem; margin-bottom: 4px;">Task Overview</h3>
          <p style="margin: 0; font-size: 0.95rem;">Manage and track all project deliverables.</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           New Task
        </button>
      </div>
      
      <div class="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div class="flex gap-4 items-center">
          <div class="flex items-center gap-2">
            <select class="form-input" style="max-width: 180px; padding: 10px 14px; font-size: 0.9rem;" [(ngModel)]="statusFilter" (change)="loadTasks()">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <button *ngIf="statusFilter" class="btn btn-secondary" style="padding: 6px 10px;" (click)="statusFilter = ''; loadTasks()" title="Clear Status Filter">✕</button>
          </div>

          <ng-container *ngIf="authService.isAdmin()">
            <div class="flex gap-2" style="background: rgba(0,0,0,0.2); padding: 4px; border-radius: 12px; border: 1px solid var(--glass-border);">
              <button class="btn" [class.btn-primary]="viewMode === 'ALL'" [class.btn-secondary]="viewMode !== 'ALL'" (click)="setViewMode('ALL')" style="padding: 6px 14px; font-size: 0.85rem; border: none; box-shadow: none;">All Tasks</button>
              <button class="btn" [class.btn-primary]="viewMode === 'MY_TASKS'" [class.btn-secondary]="viewMode !== 'MY_TASKS'" (click)="setViewMode('MY_TASKS')" style="padding: 6px 14px; font-size: 0.85rem; border: none; box-shadow: none;">My Tasks</button>
            </div>
            <div class="flex items-center gap-2" *ngIf="viewMode === 'ALL'">
              <input list="usersList" class="form-input" style="max-width: 220px; padding: 10px 14px; font-size: 0.9rem;" [(ngModel)]="selectedUserEmail" (change)="loadTasks()" placeholder="Search user email...">
              <button *ngIf="selectedUserEmail" class="btn btn-secondary" style="padding: 6px 10px;" (click)="selectedUserEmail = ''; loadTasks()" title="Clear User Filter">✕</button>
            </div>
            <datalist id="usersList">
              <option *ngFor="let u of users()" [value]="u.email">{{ u.username }}</option>
            </datalist>
          </ng-container>
        </div>
      </div>

      <div class="overflow-x-auto" style="border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--glass-border);">
              <th style="padding: 16px; color: var(--text-secondary); font-weight: 500; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Task Details</th>
              <th style="padding: 16px; color: var(--text-secondary); font-weight: 500; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Dates</th>
              <th style="padding: 16px; color: var(--text-secondary); font-weight: 500; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Status</th>
              <th style="padding: 16px; color: var(--text-secondary); font-weight: 500; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of tasks()" style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 16px;">
                <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 4px;">{{ task.title }}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ task.description }}</div>
              </td>
              <td style="padding: 16px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-secondary);" title="Created At">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    {{ task.createdAt ? (task.createdAt | date:'short') : 'N/A' }}
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem; color: var(--text-primary);" title="Due Date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {{ task.dueDate | date:'short' }}
                  </div>
                </div>
              </td>
              <td style="padding: 16px;">
                <!-- Professional Inline Status Update -->
                <select 
                  class="status-select-inline" 
                  [ngClass]="task.status.toLowerCase()"
                  [ngModel]="task.status" 
                  (ngModelChange)="updateTaskStatus(task, $event)">
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </td>
              <td style="padding: 16px; text-align: right;">
                <div class="flex justify-end gap-2">
                  <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" (click)="editTask(task)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit
                  </button>
                  <button class="btn btn-danger" style="padding: 6px; display: flex; align-items: center; justify-content: center;" (click)="deleteTask(task.uuid!)" title="Delete Task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="tasks().length === 0">
              <td colspan="4" class="text-center" style="padding: 48px; color: var(--text-muted);">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5;">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span style="font-size: 1.1rem;">No tasks found. Get started by creating a new one!</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="flex justify-between items-center mt-6" *ngIf="totalPages() > 1">
        <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" [disabled]="currentPage() === 0" (click)="changePage(-1)">Previous</button>
        <span style="color: var(--text-secondary); font-size: 0.9rem;">Page <strong style="color: white">{{ currentPage() + 1 }}</strong> of {{ totalPages() }}</span>
        <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" [disabled]="currentPage() >= totalPages() - 1" (click)="changePage(1)">Next</button>
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
  authService = inject(AuthService);
  private userService = inject(UserService);

  tasks = signal<TaskDto[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  statusFilter = '';
  
  users = signal<UserDto[]>([]);
  selectedUserEmail = '';
  viewMode: 'ALL' | 'MY_TASKS' = 'ALL';

  isFormOpen = signal(false);
  selectedTask = signal<TaskDto | null>(null);
  
  private wsSubscriptions: Subscription[] = [];

  ngOnInit() {
    this.loadTasks();
    this.setupWebSockets();
    
    if (this.authService.isAdmin()) {
      this.userService.getAllUsers().subscribe(users => {
        this.users.set(users);
      });
    }
  }

  ngOnDestroy() {
    this.wsSubscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTasks() {
    const status = this.statusFilter ? (this.statusFilter as TaskStatus) : undefined;
    
    let ownerUuid: string | undefined = undefined;
    if (this.authService.isAdmin() && this.viewMode === 'ALL' && this.selectedUserEmail) {
      const user = this.users().find(u => u.email === this.selectedUserEmail);
      if (user) {
        ownerUuid = user.uuid;
      }
    }

    const request$ = (this.authService.isAdmin() && this.viewMode === 'ALL')
      ? this.taskService.getAllTasks(this.currentPage(), 10, status, ownerUuid)
      : this.taskService.getMyTasks(this.currentPage(), 10, status);

    request$.subscribe(page => {
      this.tasks.set(page.content);
      this.totalPages.set(page.totalPages);
    });
  }

  setViewMode(mode: 'ALL' | 'MY_TASKS') {
    this.viewMode = mode;
    this.currentPage.set(0);
    if (mode === 'MY_TASKS') {
      this.selectedUserEmail = ''; 
    }
    this.loadTasks();
  }

  updateTaskStatus(task: TaskDto, newStatus: string) {
    const updatedTask = { ...task, status: newStatus as TaskStatus };
    this.taskService.updateTask(task.uuid!, updatedTask).subscribe({
      next: () => {
        // Websockets will broadcast the change to everyone, but we can also locally update it just in case
        this.tasks.update(current => 
          current.map(t => t.uuid === task.uuid ? updatedTask : t)
        );
      },
      error: (err) => console.error('Failed to update status', err)
    });
  }

  setupWebSockets() {
    if (this.wsService.rxStomp) {
      const sub1 = this.wsService.rxStomp.watch('/topic/tasks').subscribe((message) => {
        const updatedTask: TaskDto = JSON.parse(message.body);
        
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
            return [updatedTask, ...currentTasks].slice(0, 10);
          }
          return currentTasks;
        });
      });

      const sub2 = this.wsService.rxStomp.watch('/topic/tasks/deleted').subscribe((message) => {
        const deletedUuid = message.body.replace(/"/g, ''); 
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
