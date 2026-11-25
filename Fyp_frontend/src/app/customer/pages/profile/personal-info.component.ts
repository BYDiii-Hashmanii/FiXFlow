import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CustomerProfileService } from '../../services/customer-profile.service';
import { CustomerAuthService } from '../../services/customer-auth.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-customer-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="personal-info-page">
      <div class="page-top-nav">
        <a routerLink="/customer/profile" class="back-link">
          <app-icon name="arrow-left" size="sm"></app-icon>
          <span>Back to Profile</span>
        </a>
      </div>

      <div class="info-card-container">
        <!-- Personal Information Card (Screen 26 in PDF) -->
        <div class="info-card card">
          <h1 class="card-title">Personal Information</h1>
          <p class="card-subtitle">Manage your personal details and primary service address</p>

          <form [formGroup]="infoForm" (ngSubmit)="onSubmit()" class="info-form">
            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                class="form-control"
                placeholder="e.g. Raja Abubakar"
              />
              @if (infoForm.get('fullName')?.touched && infoForm.get('fullName')?.invalid) {
                <span class="field-error">Full name is required</span>
              }
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                class="form-control"
                placeholder="e.g. +92 300 1234567"
              />
              @if (infoForm.get('phone')?.touched && infoForm.get('phone')?.invalid) {
                <span class="field-error">Valid phone number is required</span>
              }
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="e.g. raja.abubakar@example.com"
              />
              @if (infoForm.get('email')?.touched && infoForm.get('email')?.invalid) {
                <span class="field-error">Please enter a valid email address</span>
              }
            </div>

            <div class="form-group">
              <label for="address">Address / Location</label>
              <input
                id="address"
                type="text"
                formControlName="address"
                class="form-control"
                placeholder="e.g. House 42, Street 8, F-10/2, Islamabad"
              />
              @if (infoForm.get('address')?.touched && infoForm.get('address')?.invalid) {
                <span class="field-error">Address is required for service dispatch</span>
              }
            </div>

            <div class="info-note">
              <app-icon name="alert-circle" size="sm"></app-icon>
              <span>Your address is only shared with assigned technicians once you confirm a service booking.</span>
            </div>

            @if (saved) {
              <div class="save-toast">
                <app-icon name="check" size="sm"></app-icon>
                <span>Information updated successfully!</span>
              </div>
            }

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="infoForm.invalid || isSaving"
              >
                @if (isSaving) {
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
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .personal-info-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }

    .page-top-nav {
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--color-primary);
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .info-card-container {
      width: 100%;
    }

    .info-card {
      padding: 24px;

      @include tablet {
        padding: 32px;
      }

      .card-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 4px;
      }

      .card-subtitle {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin-bottom: 24px;
      }
    }

    .info-form {
      display: flex;
      flex-direction: column;
      gap: 18px;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .form-control {
          height: 46px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: #fff;
          font-size: 0.95rem;
          color: var(--color-text-primary);
          font-family: inherit;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

          &:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          }
        }

        .field-error {
          font-size: 0.75rem;
          color: #dc2626;
        }
      }

      .info-note {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        background-color: #eff6ff;
        color: #1e40af;
        font-size: 0.8rem;
        line-height: 1.4;
      }

      .save-toast {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: var(--radius-md);
        background-color: #dcfce7;
        color: #166534;
        font-size: 0.85rem;
        font-weight: 500;
      }

      .form-actions {
        margin-top: 8px;

        .btn {
          width: 100%;
          height: 48px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: var(--radius-md);
        }
      }
    }
  `]
})
export class CustomerPersonalInfoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(CustomerProfileService);
  private authService = inject(CustomerAuthService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  infoForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+0-9\s-]{10,15}$/)]],
    email: ['', [Validators.email]],
    address: ['', [Validators.required]]
  });

  saved = false;
  isSaving = false;

  ngOnInit(): void {
    this.title.setTitle('Personal Information | FixFlow Customer');
    this.headerService.setHeader({ title: 'Personal Info', showBack: true, backUrl: '/customer/profile' });

    const user = this.authService.currentUser();
    this.infoForm.patchValue({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || ''
    });
  }

  onSubmit(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formVals = this.infoForm.value;

    this.profileService.updateProfile(formVals).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.saved = true;
        this.authService.updateUser(updated);
        setTimeout(() => (this.saved = false), 3500);
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }
}
