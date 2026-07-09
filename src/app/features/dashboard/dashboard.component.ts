import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { TaskListComponent } from '../tasks/task-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  template: `
    <div style="min-height: 100vh; padding-top: 80px; position: relative;">
      
      <!-- Top Navbar -->
      <nav style="position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(6, 9, 19, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 0 32px;">
        
        <div class="flex items-center gap-2">
          <div style="width: 32px; height: 32px; background: var(--accent-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          </div>
          <h2 style="font-size: 1.2rem; margin: 0; font-weight: 700; letter-spacing: -0.02em;">TaskMaster PRO</h2>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2" style="padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 99px; border: 1px solid var(--glass-border);">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary), #4f46e5); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem; color: white;">
              {{ authService.currentUser()?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <span style="font-size: 0.9rem; font-weight: 500;">{{ authService.currentUser()?.username }}</span>
            <span class="badge" style="background: rgba(255,255,255,0.1); padding: 2px 8px; font-size: 0.65rem;">{{ authService.currentUser()?.role?.name?.replace('ROLE_', '') }}</span>
          </div>
          <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;" (click)="authService.logout()">Log Out</button>
        </div>
      </nav>

      <div style="max-width: 1200px; margin: 0 auto; padding: 24px;">
        <!-- Hero Section -->
        <div class="animate-in mb-6" style="margin-top: 16px;">
          <p style="color: var(--accent-primary); font-weight: 600; margin-bottom: 4px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em;">{{ currentDate | date:'EEEE, MMMM d' }}</p>
          <h1 style="font-size: 2.5rem;">Welcome back, {{ authService.currentUser()?.username }}!</h1>
          <p style="font-size: 1.1rem; opacity: 0.8;">Here is what's happening with your projects today.</p>
        </div>

        <!-- Task List -->
        <div class="animate-in" style="animation-delay: 0.1s; animation-fill-mode: both;">
          <app-task-list></app-task-list>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  currentDate = new Date();
  
  ngOnInit() {
    // Refresh date component if kept open for days
    setInterval(() => { this.currentDate = new Date(); }, 60000);
  }
}
