import { errorMessage } from '../../../../core/interceptors/error.interceptor';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CustomerAuthService } from '../../../services/customer-auth.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-customer-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="signup-page">
      <div class="signup-card card">
        <div class="signup-header">
          <div class="top-back">
            <a routerLink="/customer/login" class="back-btn" aria-label="Back to login">
              <app-icon name="arrow-left" size="sm"></app-icon>
            </a>
            <h1 class="header-title">Create Account</h1>
          </div>
          <p class="header-subtitle">
            Create your own FixFlow account to report problems and book technicians.
          </p>
        </div>

        <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()" class="signup-form">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              formControlName="fullName"
              class="form-control"
              placeholder="Enter your full name"
              [class.is-invalid]="isFieldInvalid('fullName')"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              id="phone"
              type="text"
              formControlName="phone"
              class="form-control"
              placeholder="+92 3XX XXXXXXX"
              [class.is-invalid]="isFieldInvalid('phone')"
            />
          </div>

          <div class="form-group">
            <label for="email">Email (optional)</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-control"
              placeholder="name@example.com"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="Create a password"
              [class.is-invalid]="isFieldInvalid('password')"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="form-control"
              placeholder="Re-enter your password"
              [class.is-invalid]="isFieldInvalid('confirmPassword')"
            />
            @if (signUpForm.errors?.['passwordMismatch'] && signUpForm.get('confirmPassword')?.touched) {
              <span class="form-error">Passwords do not match</span>
            }
          </div>

          @if (submitError) { <p class="form-error" role="alert">{{ submitError }}</p> }
          <button
            type="submit"
            class="btn btn-primary btn-block btn-signup"
            [disabled]="signUpForm.invalid || isSubmitting"
          >
            Create Account
          </button>

          <div class="signup-footer">
            <span>Already have an account? </span>
            <a routerLink="/customer/login">Log in</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .signup-page {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background-color: var(--color-page-bg);

      @include mobile {
        padding: 16px;
        align-items: flex-start;
        padding-top: 24px;
      }
    }

    .signup-card {
      width: 100%;
      max-width: 480px;
      padding: 32px 28px;

      @include mobile {
        border: none;
        box-shadow: none;
        background-color: transparent;
        padding: 0;
      }

      .signup-header {
        margin-bottom: 24px;

        .top-back {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .back-btn {
            color: var(--color-text-primary);
            display: flex;
          }

          .header-title {
            font-size: 1.45rem;
            font-weight: 700;
          }
        }

        .header-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
      }

      .btn-signup {
        height: 48px;
        font-size: 1rem;
        margin-top: 12px;
      }

      .signup-footer {
        text-align: center;
        margin-top: 20px;
        font-size: 0.9rem;
        color: var(--color-text-secondary);

        a {
          font-weight: 600;
        }
      }
    }
  `]
})
export class CustomerSignUpComponent {
  private fb = inject(FormBuilder);
  private auth = inject(CustomerAuthService);
  private router = inject(Router);
  private title = inject(Title);

  signUpForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor() {
    this.title.setTitle('Create Account | FixFlow Customer');
  }

  passwordMatchValidator(g: FormGroup) {
    const p = g.get('password')?.value;
    const cp = g.get('confirmPassword')?.value;
    return p === cp ? null : { passwordMismatch: true };
  }

  isFieldInvalid(name: string): boolean {
    const f = this.signUpForm.get(name);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  submitError = "";
  isSubmitting = false;

  onSubmit(): void {
    if (this.isSubmitting) return;
    if (this.signUpForm.valid) {
      const { fullName, phone, email, password } = this.signUpForm.value;
      this.submitError = "";
      this.isSubmitting = true;
      this.auth.register({ fullName, phone, email: email || undefined, password }).subscribe({
        error: (error: unknown) => {
          this.submitError = errorMessage(error, "Registration failed. Please try again.");
          this.isSubmitting = false;
        },
        complete: () => { this.isSubmitting = false; },
      });
    }
  }
}
