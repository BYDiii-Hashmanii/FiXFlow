import { CategoryService } from '../../../core/services/category.service';
import { ServiceCategory } from '../../models/customer.models';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ProblemReportService } from '../../services/problem-report.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-report-problem',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="report-problem-page">
      <form [formGroup]="reportForm" (ngSubmit)="onSubmit()" class="report-form card">
        <!-- Category selection (matches Screen 5 in PDF) -->
        <div class="section-group">
          <label class="section-label">Problem category</label>
          @if (categoryError()) {
            <p role="alert">{{ categoryError() }}</p>
            <button type="button" class="btn btn-secondary" (click)="loadCategories()">Try Again</button>
          }
          <div class="category-chips-grid">
            @for (cat of categories(); track cat.id) {
              <button
                type="button"
                class="cat-chip"
                [class.selected]="reportForm.get('categoryId')?.value === cat.id"
                (click)="selectCategory(cat.id)" [attr.aria-pressed]="reportForm.get('categoryId')?.value === cat.id"
              >
                {{ cat.name }}
              </button>
            }
          </div>
        </div>

        <!-- Issue description (Screen 5) -->
        <div class="form-group">
          <label for="description">Describe the issue</label>
          <textarea
            id="description"
            formControlName="description"
            class="form-control"
            rows="3"
            placeholder="Water is leaking from the pipe under the kitchen sink."
            [class.is-invalid]="isFieldInvalid('description')"
          ></textarea>
        </div>

        <!-- Add Photo upload with camera/gallery (Screen 5) -->
        <div class="form-group photo-section">
          <label for="requestPhoto">Add a photo</label>
          @if (photoError()) { <p id="requestPhotoError" role="alert">{{ photoError() }}</p> }
          <input
            #fileInput id="requestPhoto" [attr.aria-describedby]="photoError() ? 'requestPhotoError' : null"
            type="file"
            accept="image/*"
            capture="environment"
            class="hidden-file-input"
            (change)="onFileSelected($event)"
          />

          @if (!photoPreview()) {
            <button type="button" class="photo-upload-placeholder" (click)="fileInput.click()">
              <app-icon name="camera" size="md"></app-icon>
              <span>Take photo or choose from gallery</span>
            </button>
          } @else {
            <div class="photo-preview-box">
              <img [src]="photoPreview()" alt="Problem photo preview" class="preview-img" />
              <button type="button" class="btn-remove-photo" aria-label="Remove selected photo" (click)="clearPhoto()">
                <app-icon name="x" size="sm"></app-icon>
              </button>
            </div>
          }
        </div>

        <!-- Access time (Screen 5) -->
        <div class="form-group">
          <label for="accessTime">Access time</label>
          <input
            id="accessTime"
            type="text"
            formControlName="accessTime"
            class="form-control"
            placeholder="Today, 2:30 PM"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-block btn-continue"
          [disabled]="reportForm.invalid || (!selectedFile && !reportForm.get('description')?.value?.trim()) || (selectedFile && !photoPreview())"
        >
          Continue to AI Analysis
        </button>
      </form>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .report-problem-page {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .report-form {
      width: 100%;
      max-width: $form-max-width;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;

      @include mobile {
        padding: 16px;
        box-shadow: none;
        border: none;
        background: transparent;
      }

      .section-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .section-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .category-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .cat-chip {
            padding: 8px 16px;
            border-radius: var(--radius-full);
            background-color: #f1f5f9;
            color: var(--color-text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid var(--color-border);
            cursor: pointer;
            transition: all var(--transition-fast);

            &:hover {
              background-color: #e2e8f0;
            }

            &.selected {
              background-color: var(--color-primary);
              color: #ffffff;
              border-color: var(--color-primary);
              font-weight: 600;
            }
          }
        }
      }

      .hidden-file-input {
        display: none;
      }

      .photo-upload-placeholder {
        height: 120px;
        border: 2px dashed #cbd5e1;
        border-radius: var(--radius-lg);
        background-color: #f8fafc;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--color-text-muted);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          border-color: var(--color-primary);
          background-color: #eff6ff;
          color: var(--color-primary);
        }
      }

      .photo-preview-box {
        position: relative;
        height: 180px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--color-border);

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-remove-photo {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background-color: rgba(15, 23, 42, 0.7);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .btn-continue {
        height: 48px;
        font-size: 1rem;
        margin-top: 8px;
      }
    }
  `]
})
export class ReportProblemComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ProblemReportService);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private title = inject(Title);

  private categoryService = inject(CategoryService);
  private readonly destroy = inject(DestroyRef);
  readonly categories = signal<ServiceCategory[]>([]);
  readonly categoryError = signal('');
  readonly photoError = signal('');
  readonly photoPreview = signal<string | null>(null);
  selectedFile: File | null = null;

  reportForm: FormGroup = this.fb.group({
    categoryId: ['', Validators.required],
    description: ['', Validators.maxLength(2000)],
    accessTime: ['', Validators.maxLength(100)]
  });

  ngOnInit(): void {
    this.title.setTitle('Report Problem | FixFlow');
    this.headerService.setHeader({
      title: 'Report Problem',
      showBack: true,
      backUrl: '/customer/home',
      showBell: false
    });

    this.loadCategories();
    const draft = this.reportService.draft();
    if (draft) {
      this.reportForm.patchValue({
        categoryId: draft.categoryId,
        description: draft.description,
        accessTime: draft.accessTime
      });
      this.photoPreview.set(draft.photoPreview ?? null);
      this.selectedFile = draft.photo || null;
    }
  }

  loadCategories(): void {
    this.categoryError.set('');
    this.categoryService.list().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: categories => this.categories.set(categories),
      error: () => this.categoryError.set('Could not load service categories.'),
    });
  }

  selectCategory(cat: string): void {
    this.reportForm.patchValue({ categoryId: cat });
  }

  isFieldInvalid(name: string): boolean {
    const f = this.reportForm.get(name);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/") || selected.size > 5 * 1024 * 1024) {
        this.clearPhoto();
        this.photoError.set('Choose an image that is 5 MB or smaller.');
        input.value = "";
        return;
      }
      this.photoError.set('');
      this.photoPreview.set(null);
      this.selectedFile = selected;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.selectedFile === selected) this.photoPreview.set(e.target?.result as string);
      };
      reader.onerror = () => {
        if (this.selectedFile !== selected) return;
        this.clearPhoto();
        this.photoError.set('Could not read this image.');
      };
      reader.readAsDataURL(selected);
    }
  }

  clearPhoto(): void {
    this.photoError.set('');
    this.photoPreview.set(null);
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (this.reportForm.valid && (this.selectedFile ? this.photoPreview() : this.reportForm.value.description?.trim())) {
      const category = this.categories().find(item => item.id === this.reportForm.value.categoryId);
      if (!category) return;
      this.reportService.draft.set({
        categoryId: category.id,
        category: category.name,
        description: this.reportForm.value.description,
        accessTime: this.reportForm.value.accessTime,
        photo: this.selectedFile,
        photoPreview: this.photoPreview()
      });
      this.router.navigate(['/customer/report/review']);
    }
  }
}
