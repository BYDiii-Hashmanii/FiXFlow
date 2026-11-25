import { Component, OnInit, signal, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OwnerProfileService } from '../../services/owner-profile.service';
import { CompanyOwner } from '../../models/owner.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-personal-information',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    @if (profile()) {
      <div class="personal-info-page">
        <div class="page-top-nav">
          <a routerLink="/owner/profile" class="back-link">
            <app-icon name="arrow-left" size="sm"></app-icon>
            <span>Profile</span>
          </a>
        </div>
        <div class="form-card-container">
          <div class="form-card card">
            <h1 class="page-title">Personal Information</h1>
            <p class="page-subtitle">Update your personal contact details</p>
            <form [formGroup]="infoForm" (ngSubmit)="onSubmit()" class="info-form">
              <!-- Full Name (Editable) -->
              <div class="form-group">
                <label for="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  formControlName="fullName"
                  class="form-control"
                  placeholder="Your full name"
                  [class.is-invalid]="isFieldInvalid('fullName')"
                />
                @if (isFieldInvalid('fullName')) {
                  <span class="field-error"> Full name is required </span>
                }
              </div>
              <!-- Phone (Editable) -->
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  formControlName="phone"
                  class="form-control"
                  placeholder="+92 3XX XXXXXXX"
                  [class.is-invalid]="isFieldInvalid('phone')"
                />
                @if (isFieldInvalid('phone')) {
                  <span class="field-error"> Please enter a valid phone number </span>
                }
              </div>
              <!-- Email (Editable) -->
              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-control"
                  placeholder="name@company.com"
                  [class.is-invalid]="isFieldInvalid('email')"
                />
                @if (isFieldInvalid('email')) {
                  <span class="field-error"> Please enter a valid email address </span>
                }
              </div>
              <!-- Role (Read Only) -->
              <div class="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value="Company Owner"
                  disabled
                  class="form-control readonly-input"
                />
                <span class="field-hint">Managed by system administrator</span>
              </div>
              <!-- Company (Read Only) -->
              <div class="form-group">
                <label>Company</label>
                <input
                  type="text"
                  [value]="profile()!.company"
                  disabled
                  class="form-control readonly-input"
                />
              </div>
              <!-- Success Alert -->
              @if (successMessage()) {
                <div class="alert alert-success" role="alert">
                  <app-icon name="check-circle" size="sm"></app-icon>
                  <span>{{ successMessage() }}</span>
                </div>
              }
              <div class="form-actions">
                <a routerLink="/owner/profile" class="btn btn-secondary"> Cancel </a>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="isSubmitting() || infoForm.invalid"
                >
                  @if (isSubmitting()) {
                    <span>Saving...</span>
                  } @else {
                    <span>Save Changes</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Loading personal information...</p>
      </div>
    }
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .personal-info-page {
        padding-bottom: 40px;
      }

      .page-top-nav {
        margin-bottom: 20px;

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;

          &:hover {
            color: var(--color-primary);
          }
        }
      }

      .form-card-container {
        display: flex;
        justify-content: center;
      }

      .form-card {
        width: 100%;
        max-width: 560px;
        padding: 28px 24px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);

        @include respond-to(tablet) {
          padding: 32px;
        }
      }

      .page-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin: 0 0 4px;
      }

      .page-subtitle {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin: 0 0 24px;
      }

      .info-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .field-hint {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }
      }

      .form-control {
        width: 100%;
        height: 46px;
        padding: 10px 14px;
        font-size: 0.95rem;
        color: var(--color-text-primary);
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        &.is-invalid {
          border-color: #ef4444;
        }

        &.readonly-input {
          background-color: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
        }
      }

      .field-error {
        font-size: 0.8rem;
        color: #ef4444;
      }

      .alert-success {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        background-color: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        font-size: 0.875rem;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 10px;

        @include respond-to(mobile) {
          flex-direction: column-reverse;
        }

        .btn {
          flex: 1;
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          border-radius: var(--radius-md);
          text-decoration: none;
          cursor: pointer;
          border: none;

          &.btn-secondary {
            background-color: #f1f5f9;
            color: var(--color-text-primary);
            border: 1px solid var(--color-border);

            &:hover {
              background-color: #e2e8f0;
            }
          }

          &.btn-primary {
            background-color: var(--color-primary);
            color: #ffffff;

            &:hover:not(:disabled) {
              background-color: var(--color-primary-dark);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
      }

      .loading-state {
        padding: 40px;
        text-align: center;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class PersonalInformationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(OwnerProfileService);

  profile = signal<CompanyOwner | null>(null);
  isSubmitting = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  infoForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.profileService.get().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.infoForm.patchValue({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
        });
      },
    });
  }

  private initForm(): void {
    this.infoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.infoForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    const val = this.infoForm.value;
    this.profileService
      .update({
        fullName: val.fullName,
        phone: val.phone,
        email: val.email,
      })
      .subscribe({
        next: (updated) => {
          this.isSubmitting.set(false);
          this.profile.set(updated);
          this.successMessage.set('Profile updated successfully.');
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }
}
