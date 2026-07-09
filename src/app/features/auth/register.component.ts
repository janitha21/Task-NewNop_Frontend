import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div style="display: flex; min-height: 100vh; width: 100vw; overflow: hidden; background-color: var(--bg-base);">
      <!-- Left side: Background Image -->
      <div style="flex: 1; position: relative; display: none; @media (min-width: 768px) { display: block; }">
        <img src="assets/auth-bg.png" style="width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0;" alt="Background">
        <div style="position: absolute; inset: 0; background: linear-gradient(to right, transparent, var(--bg-base));"></div>
        <div style="position: absolute; bottom: 10%; left: 10%; max-width: 400px;" class="animate-in">
          <h1 style="font-size: 3.5rem; line-height: 1.1; margin-bottom: 16px;">Join the Elite.</h1>
          <p style="font-size: 1.1rem; opacity: 0.8;">Create an account to start managing your projects with unparalleled speed and clarity.</p>
        </div>
      </div>
      
      <!-- Right side: Register Form -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; z-index: 10;">
        <div style="width: 100%; max-width: 400px;" class="animate-in">
          <div class="mb-6">
            <div style="width: 48px; height: 48px; background: var(--accent-primary); border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            </div>
            <h2 style="font-size: 2rem;">Create Account</h2>
            <p>Sign up to get started instantly.</p>
          </div>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="glass-panel" style="padding: 32px;">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" formControlName="username" placeholder="Choose a username">
            </div>
            
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" formControlName="email" placeholder="Enter your email">
            </div>
            
            <div class="form-group mb-6">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" formControlName="password" placeholder="Create a strong password">
            </div>

            <div *ngIf="errorMessage" class="form-error mb-4">
              {{ errorMessage }}
            </div>
            
            <button type="submit" class="btn btn-primary w-full" [disabled]="registerForm.invalid || isLoading" style="padding: 14px; font-size: 1rem;">
              {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
            </button>
          </form>
          
          <div class="text-center mt-6">
            <p style="font-size: 0.95rem">
              Already have an account? <a routerLink="/auth/login" style="color: var(--accent-primary); text-decoration: none; font-weight: 600;">Log In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.register(this.registerForm.getRawValue()).subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
          console.error(err);
        }
      });
    }
  }
}
