import { CategoryService } from '../../../core/services/category.service';
import { ServiceCategory } from '../../../core/models/shared.models';
import { Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TechnicianManagementService } from '../../services/technician-management.service';
import { HeaderService } from '../../../core/services/header.service';
import { Availability } from '../../../core/models/shared.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-add-technician',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="add-tech-page">
      <div class="page-top-nav">
        <a routerLink="/owner/technicians" class="back-link">
          <app-icon name="arrow-left" size="sm"></app-icon>
          <span>Add Technician</span>
        </a>
      </div>

      <div class="form-card-container">
        <!-- Add Technician Form (Matches Screen 4 in PDF) -->
        <div class="form-card card">
          <form [formGroup]="techForm" (ngSubmit)="onSubmit()" class="tech-form">
            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                class="form-control"
                placeholder="Enter technician's full name"
                [class.is-invalid]="isFieldInvalid('fullName')"
              />
              @if (isFieldInvalid('fullName')) {
                <span class="field-error">Full name is required (min 3 characters)</span>
              }
            </div>

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
                <span class="field-error"
                  >Please enter a valid Pakistani phone number (+92 3XX XXXXXXX)</span
                >
              }
            </div>

            <div class="form-group">
              <label for="categoryId">Service category</label>
              <select class="form-control" id="categoryId" formControlName="categoryId">
                <option value="">Select a category</option>
                @for (item of categories; track item.id) {
                  <option [value]="item.id">{{ item.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="password">Initial password</label
              ><input
                id="password"
                class="form-control"
                type="password"
                formControlName="password"
                autocomplete="new-password"
              />
            </div>

            <div class="form-group">
              <label for="serviceRate">Price / service rate</label>
              <div class="rate-input-wrap">
                <span class="rate-prefix">Rs</span>
                <input
                  id="serviceRate"
                  type="number"
                  formControlName="serviceRate"
                  class="form-control rate-control"
                  placeholder="0"
                  min="1"
                  [class.is-invalid]="isFieldInvalid('serviceRate')"
                />
                <span class="rate-suffix">/ visit</span>
              </div>
              @if (isFieldInvalid('serviceRate')) {
                <span class="field-error">Please enter a valid rate greater than 0</span>
              }
            </div>

            <div class="form-group">
              <label>Availability</label>
              <div
                class="availability-buttons"
                role="radiogroup"
                aria-label="Technician availability"
              >
                @for (opt of availabilityOptions; track opt.value) {
                  <button
                    type="button"
                    class="btn-avail"
                    [class.active]="selectedAvailability === opt.value"
                    (click)="selectedAvailability = opt.value"
                    role="radio"
                    [attr.aria-checked]="selectedAvailability === opt.value"
                  >
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>

            <div class="info-note">
              <span
                >The technician gets a login and accepts or declines customer requests
                themselves.</span
              >
            </div>

            @if (errorMessage()) {
              <div class="error-banner">
                {{ errorMessage() }}
              </div>
            }

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary btn-block btn-create"
                [disabled]="techForm.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <span>Creating Account...</span>
                } @else {
                  <span>Create Account</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .add-tech-page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
      }

      .page-top-nav {
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-primary);
          font-size: 1.15rem;
          font-weight: 700;
          text-decoration: none;

          &:hover {
            color: var(--color-primary);
          }
        }
      }

      .form-card {
        padding: 24px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);

        @include tablet {
          padding: 32px;
        }
      }

      .tech-form {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;

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

          .rate-input-wrap {
            display: flex;
            align-items: center;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            background-color: #ffffff;
            overflow: hidden;

            .rate-prefix {
              padding: 0 14px;
              font-size: 0.95rem;
              color: var(--color-text-secondary);
              font-weight: 600;
              background-color: #f8fafc;
              border-right: 1px solid var(--color-border);
              height: 46px;
              display: flex;
              align-items: center;
            }

            .rate-control {
              border: none;
              border-radius: 0;
              flex: 1;

              &:focus {
                box-shadow: none;
              }
            }

            .rate-suffix {
              padding: 0 14px;
              font-size: 0.85rem;
              color: var(--color-text-muted);
              background-color: #f8fafc;
              border-left: 1px solid var(--color-border);
              height: 46px;
              display: flex;
              align-items: center;
            }
          }

          .field-error {
            font-size: 0.75rem;
            color: #ef4444;
          }
        }

        .availability-buttons {
          display: flex;
          gap: 10px;

          .btn-avail {
            flex: 1;
            height: 44px;
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
            background-color: #ffffff;
            font-size: 0.875rem;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            transition: all var(--transition-fast);

            &:hover {
              border-color: var(--color-primary);
              color: var(--color-primary);
            }

            &.active {
              background-color: var(--color-primary);
              border-color: var(--color-primary);
              color: #ffffff;
              font-weight: 600;
            }
          }
        }

        .info-note {
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          font-size: 0.825rem;
          color: #1e40af;
          line-height: 1.4;
        }

        .error-banner {
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background-color: #fee2e2;
          color: #b91c1c;
          font-size: 0.825rem;
        }

        .form-actions {
          margin-top: 8px;

          .btn-create {
            height: 48px;
            font-size: 1rem;
            font-weight: 600;
          }
        }
      }
    `,
  ],
})
export class OwnerAddTechnicianComponent implements OnInit {
  private fb = inject(FormBuilder);
  private techService = inject(TechnicianManagementService);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private title = inject(Title);

  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');

  availabilityOptions: { value: Availability; label: string }[] = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'unavailable', label: 'Unavailable' },
  ];
  selectedAvailability: Availability = 'available';

  techForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^(?:\+92|0)[3-9]\d{9}$/)]],
    categoryId: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    serviceRate: [null, [Validators.required, Validators.min(1)]],
  });

  private readonly categoryService = inject(CategoryService);
  categories: ServiceCategory[] = [];

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: () => this.errorMessage.set('Could not load service categories.'),
    });
    this.title.setTitle('Add Technician | FixFlow');
    this.headerService.setHeader({
      title: 'Add Technician',
      showBack: true,
      backUrl: '/owner/technicians',
    });
  }

  isFieldInvalid(name: string): boolean {
    const f = this.techForm.get(name);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  onSubmit(): void {
    if (this.isSaving()) return;
    if (this.techForm.invalid) {
      this.techForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formVal = this.techForm.value;
    this.techService
      .create({
        fullName: formVal.fullName,
        password: formVal.password,
        phone: formVal.phone,
        categoryId: formVal.categoryId,
        serviceRate: Number(formVal.serviceRate),
        availability: this.selectedAvailability,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/owner/technicians']);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.message || 'Failed to create technician account.');
        },
      });
  }
}
