import { CategoryService } from '../../../core/services/category.service';
import { ServiceCategory } from '../../../core/models/shared.models';
import { Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TechnicianManagementService } from '../../services/technician-management.service';
import { Availability } from '../../../core/models/shared.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { OwnerTechnician } from '../../models/owner.models';

@Component({
  selector: 'app-owner-edit-technician',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    @if (technician()) {
      <div class="edit-tech-page">
        <div class="page-top-nav">
          <a [routerLink]="['/owner/technicians', techId]" class="back-link">
            <app-icon name="arrow-left" size="sm"></app-icon>
            <span>Technician Details</span>
          </a>
        </div>
        <div class="form-card-container">
          <div class="form-card card">
            <h2 class="form-title">Edit Technician</h2>
            <p class="form-subtitle">Update technician profile, category and service rates</p>
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
                <label for="serviceRate">Service Rate (Rs per visit)</label>
                <div class="input-with-prefix">
                  <span class="prefix">Rs</span>
                  <input
                    id="serviceRate"
                    type="number"
                    formControlName="serviceRate"
                    class="form-control with-prefix"
                    placeholder="1500"
                    min="0"
                    step="100"
                    [class.is-invalid]="isFieldInvalid('serviceRate')"
                  />
                </div>
                @if (isFieldInvalid('serviceRate')) {
                  <span class="field-error">Rate must be a positive number</span>
                }
              </div>
              <div class="form-group">
                <label for="availability">Availability Status</label>
                <select
                  id="availability"
                  formControlName="availability"
                  class="form-control select-control"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              @if (errorMessage()) {
                <div class="alert alert-danger" role="alert">
                  {{ errorMessage() }}
                </div>
              }
              <div class="form-actions">
                <a [routerLink]="['/owner/technicians', techId]" class="btn btn-secondary">
                  Cancel
                </a>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="isSubmitting() || techForm.invalid"
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
        <p>Loading technician details...</p>
      </div>
    }
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .edit-tech-page {
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
          transition: color var(--transition-fast);

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

      .form-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin: 0 0 4px;
      }

      .form-subtitle {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin: 0 0 24px;
      }

      .tech-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
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
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast);

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        &.is-invalid {
          border-color: #ef4444;
        }
      }

      .select-control {
        cursor: pointer;
      }

      .input-with-prefix {
        display: flex;
        align-items: center;
        position: relative;

        .prefix {
          position: absolute;
          left: 14px;
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          pointer-events: none;
        }

        .with-prefix {
          padding-left: 42px;
        }
      }

      .field-error {
        font-size: 0.8rem;
        color: #ef4444;
      }

      .alert-danger {
        padding: 12px 14px;
        border-radius: var(--radius-md);
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
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
          transition: background-color var(--transition-fast);
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
export class EditTechnicianComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private techService = inject(TechnicianManagementService);

  techId = '';
  technician = signal<OwnerTechnician | null>(null);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  techForm!: FormGroup;

  private readonly categoryService = inject(CategoryService);
  categories: ServiceCategory[] = [];

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: () => this.errorMessage.set('Could not load service categories.'),
    });
    this.techId = this.route.snapshot.paramMap.get('id') || '';
    this.initForm();
    if (this.techId) {
      this.loadTechnician(this.techId);
    }
  }

  private initForm(): void {
    this.techForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+92|0)?3\d{2}[-\s]?\d{7}$/)]],
      categoryId: ['', Validators.required],
      serviceRate: [1500, [Validators.required, Validators.min(0)]],
      availability: ['available', [Validators.required]],
    });
  }

  private loadTechnician(id: string): void {
    this.techService.getById(id).subscribe({
      next: (tech) => {
        if (tech) {
          this.technician.set(tech);

          this.techForm.patchValue({
            fullName: tech.name,
            phone: tech.phone,
            categoryId: String(tech.categoryId),
            serviceRate: tech.serviceRate,
            availability: tech.availability,
          });
        }
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.techForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.techForm.invalid) {
      this.techForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const val = this.techForm.value;
    this.techService
      .update(this.techId, {
        fullName: val.fullName,
        phone: val.phone,
        categoryId: val.categoryId,
        serviceRate: Number(val.serviceRate),
        availability: val.availability as Availability,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/owner/technicians', this.techId]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.message || 'Failed to update technician.');
        },
      });
  }
}
