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
    <div class="modal-overlay" style="position: relative; min-height: 100vh;">
      <div class="glass-panel" style="width: 100%; max-width: 400px;">
        <div class="text-center mb-4">
          <h2>Create Account</h2>
          <p>Sign up to start tracking tasks.</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" formControlName="username" placeholder="Choose a username">
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" formControlName="email" placeholder="Enter your email">
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" formControlName="password" placeholder="Create a password">
          </div>

          <div *ngIf="errorMessage" class="form-error mb-4 text-center">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn btn-primary w-full" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Registering...' : 'Sign Up' }}
          </button>
        </form>
        
        <div class="text-center mt-4">
          <p style="font-size: 0.875rem">
            Already have an account? <a routerLink="/auth/login" style="color: var(--accent-primary); text-decoration: none;">Log In</a>
          </p>
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
    password: ['', [Validators.required, Validators.minLength(4)]]
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
          this.errorMessage = err.status === 409 ? 'Username or Email already exists' : 'Registration failed';
          console.error(err);
        }
      });
    }
  }
}
