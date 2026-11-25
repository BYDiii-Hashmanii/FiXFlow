import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-badge">
            <app-icon name="wrench" size="md"></app-icon>
          </div>
          <h1 class="login-title">FixFlow</h1>
          <p class="login-subtitle">Log in to your technician account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="identifier">Phone number or email</label>
            <input
              id="identifier"
              type="text"
              formControlName="identifier"
              class="form-control"
              placeholder="+92 3XX XXXXXXX or email"
              [class.is-invalid]="isFieldInvalid('identifier')"
            />
            @if (isFieldInvalid('identifier')) {
              <span class="form-error">Please enter your phone number or email</span>
            }
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Password</label>
              <a href="javascript:void(0)" class="forgot-link" (click)="showForgotInfo = !showForgotInfo">Forgot Password?</a>
            </div>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="Enter your password"
              [class.is-invalid]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="form-error">Password must be at least 8 characters</span>
            }
          </div>

          @if (showForgotInfo) {
            <div class="info-alert">
              <span>Contact your company administrator at <strong>Rayyan Repair Services</strong> to reset your password.</span>
            </div>
          }


          @if (loginError) { <p class="form-error" role="alert">{{ loginError }}</p> }
          <button
            type="submit"
            class="btn btn-primary btn-block btn-login"
            [disabled]="loginForm.invalid || isLoggingIn"
          >
            Login
          </button>

          <div class="company-note">
            <span>Company accounts are created by FixFlow. Contact your manager at Rayyan Repair Services.</span>
          </div>

          <div class="portal-switch-card">
            <a routerLink="/roles" class="link-switch">Change role</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .login-page {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background-color: var(--color-page-bg);

      @include mobile {
        padding: 16px;
        align-items: flex-start;
        padding-top: 48px;
      }
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background-color: #ffffff;
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-card);
      padding: 36px 32px;

      @include mobile {
        border: none;
        box-shadow: none;
        background-color: transparent;
        padding: 0;
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;

      .brand-badge {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background-color: var(--color-primary);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
      }

      .login-title {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
        margin-bottom: 6px;
      }

      .login-subtitle {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
      }
    }

    .login-form {
      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .forgot-link {
          font-size: 0.825rem;
          color: var(--color-primary);
          font-weight: 500;
        }
      }

      .info-alert {
        padding: 10px 14px;
        background-color: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: var(--radius-sm);
        color: #1e40af;
        font-size: 0.85rem;
        margin-bottom: 16px;
      }


      .btn-login {
        height: 48px;
        font-size: 1rem;
        margin-top: 8px;
      }

      .login-footer {
        text-align: center;
        margin-top: 24px;
        font-size: 0.9rem;
        color: var(--color-text-secondary);

        a {
          font-weight: 600;
        }
      }

      .portal-switch-card {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--color-border-subtle);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .portal-switch-content {
          width: 100%;
          padding: 12px 14px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;

          .switch-hint {
            font-size: 0.8rem;
            color: #64748b;
          }

          .link-switch {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-primary);
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .link-portal-home {
          font-size: 0.8rem;
          color: #64748b;
          text-decoration: none;

          &:hover {
            color: var(--color-primary);
            text-decoration: underline;
          }
        }
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private title = inject(Title);

  showForgotInfo = false;

  loginForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    this.title.setTitle('Login | FixFlow Technician');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }


  loginError = "";
  isLoggingIn = false;

  onSubmit(): void {
    if (this.isLoggingIn) return;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { identifier, password } = this.loginForm.value;
    this.loginError = "";
    this.isLoggingIn = true;
    this.authService.login(identifier, password).subscribe({
      error: (error: unknown) => {
        this.loginError = errorMessage(error, "Sign-in failed. Please try again.");
        this.isLoggingIn = false;
      },
      complete: () => { this.isLoggingIn = false; },
    });
  }
}
