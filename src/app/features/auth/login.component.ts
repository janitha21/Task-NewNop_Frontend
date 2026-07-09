import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div style="display: flex; min-height: 100vh; width: 100vw; overflow: hidden; background-color: var(--bg-base);">
      <!-- Left side: Background Image -->
      <div style="flex: 1; position: relative; display: none; @media (min-width: 768px) { display: block; }">
        <img src="assets/auth-bg.png" style="width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0;" alt="Background">
        <div style="position: absolute; inset: 0; background: linear-gradient(to right, transparent, var(--bg-base));"></div>
        <div style="position: absolute; bottom: 10%; left: 10%; max-width: 400px;" class="animate-in">
          <h1 style="font-size: 3.5rem; line-height: 1.1; margin-bottom: 16px;">Master Your Workflow.</h1>
          <p style="font-size: 1.1rem; opacity: 0.8;">The most beautiful, professional, and real-time task manager built for power users.</p>
        </div>
      </div>
      
      <!-- Right side: Login Form -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; z-index: 10;">
        <div style="width: 100%; max-width: 400px;" class="animate-in">
          <div class="mb-6">
            <div style="width: 48px; height: 48px; background: var(--accent-primary); border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
            </div>
            <h2 style="font-size: 2rem;">Welcome Back</h2>
            <p>Log in to access your dashboard.</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="glass-panel" style="padding: 32px;">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" formControlName="username" placeholder="Enter your username">
            </div>
            
            <div class="form-group mb-6">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" formControlName="password" placeholder="Enter your password">
            </div>

            <div *ngIf="errorMessage" class="form-error mb-4">
              {{ errorMessage }}
            </div>
            
            <button type="submit" class="btn btn-primary w-full" [disabled]="loginForm.invalid || isLoading" style="padding: 14px; font-size: 1rem;">
              {{ isLoading ? 'Logging in...' : 'Log In' }}
            </button>
          </form>
          
          <div class="text-center mt-6">
            <p style="font-size: 0.95rem">
              Don't have an account? <a routerLink="/auth/register" style="color: var(--accent-primary); text-decoration: none; font-weight: 600;">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.loginForm.getRawValue()).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid username or password';
          console.error(err);
        }
      });
    }
  }
}
