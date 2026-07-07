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
    <div class="modal-overlay" style="position: relative; min-height: 100vh;">
      <div class="glass-panel" style="width: 100%; max-width: 400px;">
        <div class="text-center mb-4">
          <h2>Welcome Back</h2>
          <p>Log in to access your task tracker.</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" formControlName="username" placeholder="Enter your username">
            <div *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.invalid" class="form-error">
              Username is required
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" formControlName="password" placeholder="Enter your password">
            <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="form-error">
              Password is required
            </div>
          </div>

          <div *ngIf="errorMessage" class="form-error mb-4 text-center">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn btn-primary w-full" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>
        
        <div class="text-center mt-4">
          <p style="font-size: 0.875rem">
            Don't have an account? <a routerLink="/auth/register" style="color: var(--accent-primary); text-decoration: none;">Sign Up</a>
          </p>
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
