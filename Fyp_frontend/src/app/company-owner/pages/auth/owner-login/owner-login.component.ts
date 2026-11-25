import { errorMessage } from '../../../../core/interceptors/error.interceptor';
import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { OwnerAuthService } from '../../../services/owner-auth.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="login-page">
      <div class="login-card card">
        <div class="login-header">
          <div class="brand-badge">
            <app-icon name="wrench" size="md"></app-icon>
          </div>
          <h1 class="login-title">FixFlow</h1>
          <p class="login-subtitle">Company Owner login</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="identifier">Phone number or email</label>
            <input
              id="identifier"
              type="text"
              formControlName="identifier"
              class="form-control"
              placeholder="+92 3XX XXXXXXX"
              [class.is-invalid]="isFieldInvalid('identifier')"
            />
            @if (isFieldInvalid('identifier')) {
              <span class="form-error">Please enter a valid phone number or email</span>
            }
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Password</label>
              <a href="javascript:void(0)" class="forgot-link" (click)="showForgot = !showForgot"
                >Forgot Password?</a
              >
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

          @if (showForgot) {
            <div class="info-alert">
              <span
                >Contact FixFlow platform administration to reset your company manager
                credentials.</span
              >
            </div>
          }

          @if (loginError) {
            <p class="form-error" role="alert">{{ loginError }}</p>
          }
          <button
            type="submit"
            class="btn btn-primary btn-block btn-login"
            [disabled]="loginForm.invalid || isLoggingIn"
          >
            @if (isLoggingIn) {
              <span>Logging in...</span>
            } @else {
              <span>Login</span>
            }
          </button>

          <div class="company-note">
            <span>Company accounts are created by FixFlow.</span>
          </div>

          <div class="portal-switch-card">
            <a routerLink="/roles" class="link-switch">Change role</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
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
        padding: 32px 28px;
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        background-color: #ffffff;

        @include mobile {
          padding: 24px 20px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 28px;

          .brand-badge {
            width: 52px;
            height: 52px;
            border-radius: var(--radius-md);
            background-color: var(--color-primary);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          }

          .login-title {
            font-size: 1.65rem;
            font-weight: 800;
            color: var(--color-text-primary);
            margin-bottom: 4px;
          }

          .login-subtitle {
            font-size: 0.9rem;
            color: var(--color-text-muted);
          }
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;

          label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-text-secondary);
          }

          .label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .forgot-link {
              font-size: 0.8rem;
              color: var(--color-primary);
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }
            }
          }

          .form-control {
            height: 46px;
            padding: 0 14px;
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
            font-size: 0.95rem;
            background-color: #ffffff;
            font-family: inherit;
            transition:
              border-color var(--transition-fast),
              box-shadow var(--transition-fast);

            &:focus {
              outline: none;
              border-color: var(--color-primary);
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
            }

            &.is-invalid {
              border-color: #ef4444;
            }
          }

          .form-error {
            font-size: 0.75rem;
            color: #ef4444;
          }
        }

        .info-alert {
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          font-size: 0.8rem;
          color: #1d4ed8;
        }

        .btn-login {
          height: 48px;
          font-size: 1rem;
          font-weight: 600;
        }

        .company-note {
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .portal-switch-card {
          text-align: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--color-border-subtle);

          .link-switch {
            font-size: 0.85rem;
            color: var(--color-primary);
            text-decoration: none;
            font-weight: 500;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    `,
  ],
})
export class OwnerLoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(OwnerAuthService);
  private router = inject(Router);
  private title = inject(Title);

  showForgot = false;

  loginForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.title.setTitle('Company Owner Login | FixFlow');
  }

  isFieldInvalid(name: string): boolean {
    const f = this.loginForm.get(name);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  loginError = '';
  isLoggingIn = false;

  onSubmit(): void {
    if (this.isLoggingIn) return;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { identifier, password } = this.loginForm.value;
    this.loginError = '';
    this.isLoggingIn = true;
    this.auth.login(identifier, password).subscribe({
      error: (error: unknown) => {
        this.loginError = errorMessage(error, 'Sign-in failed. Please try again.');
        this.isLoggingIn = false;
      },
      complete: () => {
        this.isLoggingIn = false;
      },
    });
  }
}
