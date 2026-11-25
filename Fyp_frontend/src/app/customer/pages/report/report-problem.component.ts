import { CategoryService } from '../../../core/services/category.service';
import { ServiceCategory } from '../../models/customer.models';
import { Component, DestroyRef, ElementRef, OnInit, effect, inject, signal, viewChild } from '@angular/core';
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

        <div class="form-group photo-section" role="group" aria-labelledby="photo-label">
          <span class="section-label" id="photo-label">Add a photo</span>
          @if (photoError()) { <p id="requestPhotoError" role="alert">{{ photoError() }}</p> }
          <input
            #fileInput id="requestPhoto" [attr.aria-describedby]="photoError() ? 'requestPhotoError' : null"
            type="file"
            accept="image/*"
            class="hidden-file-input"
            (change)="onFileSelected($event)"
          />
          <input #nativeCamera type="file" accept="image/*" capture="environment" class="hidden-file-input"
            (change)="onFileSelected($event)" />

          @if (cameraOpen()) {
            <div class="camera-panel" role="group" aria-label="Camera">
              <video #cameraVideo aria-label="Live camera preview" autoplay muted playsinline (loadeddata)="cameraReady.set(true)"></video>
              @if (!cameraReady()) { <p role="status">Starting camera…</p> }
              <div class="photo-actions">
                <button type="button" class="btn btn-secondary" (click)="closeCamera()">Cancel</button>
                <button type="button" class="btn btn-primary" [disabled]="!cameraReady() || capturing()" (click)="capturePhoto()">
                  <app-icon name="camera" size="sm" aria-hidden="true" /> Capture Photo
                </button>
              </div>
            </div>
          } @else if (photoPreview()) {
            <div class="photo-preview-box">
              <img [src]="photoPreview()" alt="Problem photo preview" class="preview-img" />
              <button type="button" class="btn-remove-photo" aria-label="Remove selected photo" (click)="clearPhoto()">
                <app-icon name="x" size="sm"></app-icon>
              </button>
            </div>
          }
          @if (!cameraOpen()) {
            <div class="photo-actions">
              <button type="button" class="btn btn-secondary" (click)="openCamera(nativeCamera)">
                <app-icon name="camera" size="sm" aria-hidden="true" /> {{ photoPreview() ? 'Retake Photo' : 'Take Photo' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="fileInput.click()">
                <app-icon name="file-text" size="sm" aria-hidden="true" /> Choose from Gallery
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
          [disabled]="cameraOpen() || reportForm.invalid || (!selectedFile && !reportForm.get('description')?.value?.trim()) || (selectedFile && !photoPreview())"
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

      .section-label { font-size: .875rem; font-weight: 600; color: var(--color-text-secondary); }
      .photo-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr));
        gap: .5rem;
        .btn { padding-inline: .625rem; }
      }
      .camera-panel {
        display: grid;
        gap: .5rem;
        video {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          max-height: 18rem;
          border-radius: var(--radius-md);
          background-color: var(--color-text-primary);
          object-fit: contain;
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
  readonly cameraOpen = signal(false);
  readonly cameraReady = signal(false);
  readonly capturing = signal(false);
  private readonly cameraStream = signal<MediaStream | null>(null);
  private readonly cameraVideo = viewChild<ElementRef<HTMLVideoElement>>('cameraVideo');
  private cameraRequest = 0;
  selectedFile: File | null = null;

  reportForm: FormGroup = this.fb.group({
    categoryId: ['', Validators.required],
    description: ['', Validators.maxLength(2000)],
    accessTime: ['', Validators.maxLength(100)]
  });

  constructor() {
    effect(() => {
      const video = this.cameraVideo()?.nativeElement;
      if (video) video.srcObject = this.cameraStream();
    });
    this.destroy.onDestroy(() => this.closeCamera());
  }

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
    input.value = '';
    if (selected) this.setPhoto(selected);
  }

  async openCamera(nativeInput: HTMLInputElement): Promise<void> {
    this.photoError.set('');
    if (!navigator.mediaDevices?.getUserMedia) {
      nativeInput.click();
      return;
    }
    const request = ++this.cameraRequest;
    this.cameraOpen.set(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } });
      if (request === this.cameraRequest) this.cameraStream.set(stream);
      else stream.getTracks().forEach(track => track.stop());
    } catch {
      if (request !== this.cameraRequest) return;
      this.closeCamera();
      this.photoError.set('Could not open the camera. Check camera permissions or choose a photo from your gallery.');
    }
  }

  closeCamera(): void {
    this.cameraRequest++;
    this.cameraStream()?.getTracks().forEach(track => track.stop());
    this.cameraStream.set(null);
    this.cameraReady.set(false);
    this.cameraOpen.set(false);
    this.capturing.set(false);
  }

  capturePhoto(): void {
    const video = this.cameraVideo()?.nativeElement;
    if (!video?.videoWidth || !video.videoHeight || this.capturing()) return;
    const frame = document.createElement('canvas');
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    frame.width = Math.max(1, Math.round(video.videoWidth * scale));
    frame.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = frame.getContext('2d');
    if (!context) {
      this.photoError.set('Could not capture the photo. Try again or choose a photo from your gallery.');
      return;
    }
    context.drawImage(video, 0, 0, frame.width, frame.height);
    const request = this.cameraRequest;
    this.capturing.set(true);
    frame.toBlob(blob => {
      if (request !== this.cameraRequest) return;
      this.capturing.set(false);
      if (blob) {
        this.closeCamera();
        this.setPhoto(new File([blob], 'report-photo.jpg', { type: 'image/jpeg' }));
      } else {
        this.photoError.set('Could not capture the photo. Try again or choose a photo from your gallery.');
      }
    }, 'image/jpeg', .85);
  }

  private setPhoto(selected: File): void {
    if (!selected.type.startsWith('image/') || selected.size > 5 * 1024 * 1024) {
      this.photoError.set('Choose an image that is 5 MB or smaller.');
      return;
    }
    this.photoError.set('');
    this.photoPreview.set(null);
    this.selectedFile = selected;
    const reader = new FileReader();
    reader.onload = () => {
      if (this.selectedFile === selected && typeof reader.result === 'string') this.photoPreview.set(reader.result);
    };
    reader.onerror = () => {
      if (this.selectedFile !== selected) return;
      this.clearPhoto();
      this.photoError.set('Could not read this image.');
    };
    reader.readAsDataURL(selected);
  }

  clearPhoto(): void {
    this.photoError.set('');
    this.photoPreview.set(null);
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (this.cameraOpen()) return;
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
