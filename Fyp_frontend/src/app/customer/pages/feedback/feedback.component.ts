import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { FeedbackService } from '../../services/feedback.service';
import { HeaderService } from '../../../core/services/header.service';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-customer-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StarRatingComponent],
  template: `
    <div class="feedback-page">
      <div class="feedback-card card">
        <!-- Technician Card (Matches Screen 20 in PDF) -->
        <div class="tech-box">
          <div class="avatar">HM</div>
          <div class="details">
            <h3 class="name">Hamza Malik</h3>
            <span class="company">Rayyan Repair Services</span>
          </div>
        </div>

        <div class="rating-prompt-section">
          <h2 class="prompt-title">How was the service?</h2>
          <app-star-rating
            [rating]="rating"
            size="lg"
            (ratingChange)="onRatingChange($event)"
          ></app-star-rating>
        </div>

        <form [formGroup]="feedbackForm" (ngSubmit)="onSubmit()" class="feedback-form">
          <div class="form-group">
            <label for="comment">Write feedback</label>
            <input
              id="comment"
              type="text"
              formControlName="comment"
              class="form-control"
              placeholder="Quick and tidy work. The leak is fixed."
            />
          </div>

          <p class="feedback-disclaimer">
            Your rating updates the technician's rating and reviews, and your company owner can see it.
          </p>

          <!-- Actions (Screen 20 in PDF) -->
          <div class="actions-group">
            @if (failure) { <p role="alert">{{ failure }}</p> }
            <button type="submit" [disabled]="pending || rating < 1" class="btn btn-primary btn-block btn-action">
              Submit Feedback
            </button>
            <button type="button" class="btn btn-secondary btn-block btn-action" (click)="onSkip()">
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .feedback-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(85vh - #{$topbar-height});
      padding: 16px;
    }

    .feedback-card {
      width: 100%;
      max-width: 480px;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      @include mobile {
        border: none;
        box-shadow: none;
        background: transparent;
        padding: 16px 8px;
      }

      .tech-box {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #dbeafe;
          color: #1e40af;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .details {
          .name {
            font-size: 1.05rem;
            font-weight: 700;
          }

          .company {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }
      }

      .rating-prompt-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        text-align: center;

        .prompt-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
      }

      .feedback-form {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .feedback-disclaimer {
          font-size: 0.825rem;
          color: var(--color-text-muted);
          line-height: 1.45;
        }

        .actions-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;

          .btn-action {
            height: 48px;
            font-size: 1rem;
          }
        }
      }
    }
  `]
})
export class CustomerFeedbackComponent implements OnInit {
  private fb = inject(FormBuilder);
  private feedbackService = inject(FeedbackService);
  private headerService = inject(HeaderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  jobId = "";
  rating = 0;
  pending = false;
  failure = "";

  feedbackForm: FormGroup = this.fb.group({
    comment: ['']
  });

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') ?? '';
    this.title.setTitle('Feedback | FixFlow');
    this.headerService.setHeader({
      title: 'Feedback',
      showBack: true,
      backUrl: '/customer/home',
      showBell: false
    });
  }

  onRatingChange(stars: number): void {
    this.rating = stars;
  }

  onSubmit(): void {
    if (!this.jobId || this.pending || this.rating < 1) return;
    this.pending = true;
    this.failure = '';
    this.feedbackService.submitReview(this.jobId, this.rating, this.feedbackForm.value.comment).subscribe({
      next: () => void this.router.navigate(['/customer/requests', this.jobId, 'track']),
      error: (error: unknown) => { this.failure = errorMessage(error, 'Could not submit feedback.'); this.pending = false; },
      complete: () => { this.pending = false; },
    });
  }

  onSkip(): void {
    this.router.navigate(['/customer/home']);
  }
}
