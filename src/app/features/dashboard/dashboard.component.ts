import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { TaskListComponent } from '../tasks/task-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  template: `
    <div style="min-height: 100vh; padding: 24px;">
      <div class="glass-panel mb-4 flex justify-between items-center" style="padding: 16px 24px;">
        <div class="flex items-center gap-4">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.25rem;">
            {{ authService.currentUser()?.username?.charAt(0)?.toUpperCase() }}
          </div>
          <div>
            <h3 style="margin-bottom: 0;">Welcome, {{ authService.currentUser()?.username }}</h3>
            <p style="margin-bottom: 0; font-size: 0.875rem; color: var(--text-secondary);">Role: <span class="badge" style="background: rgba(255,255,255,0.1)">{{ authService.currentUser()?.role?.name?.replace('ROLE_', '') }}</span></p>
          </div>
        </div>
        
        <button class="btn btn-secondary" (click)="authService.logout()">Log Out</button>
      </div>

      <div style="display: grid; gap: 24px; grid-template-columns: 1fr;">
        <app-task-list></app-task-list>
      </div>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
}
