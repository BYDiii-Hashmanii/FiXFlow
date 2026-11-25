import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyFeedbackService } from '../../services/company-feedback.service';
import { CompanyFeedback } from '../../models/owner.models';
import { RatingSummaryComponent } from '../../components/rating-summary/rating-summary.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-feedback-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingSummaryComponent, IconComponent],
  template: `
    <div class="feedback-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Customer Feedback</h1>
          <p class="page-subtitle">
            Ratings and reviews submitted by customers upon job completion
          </p>
        </div>
      </div>

      <!-- Rating Summary Card (Matches Screen 10) -->
      <div class="summary-wrapper">
        <app-owner-rating-summary
          [averageRating]="summary()?.averageRating ?? 4.7"
          [totalReviews]="summary()?.totalReviews ?? 286"
          label="Company rating · Based on all completed jobs"
        ></app-owner-rating-summary>
      </div>

      <!-- Feedback List -->
      <div class="feedback-list">
        @for (item of reviews(); track item) {
          <div class="feedback-card card">
            <div class="card-top">
              <div class="user-meta">
                <div class="avatar-initials">
                  {{ getInitials(item.customerName) }}
                </div>
                <div class="name-box">
                  <h3 class="customer-name">{{ item.customerName }}</h3>
                  <span class="review-date">{{ item.date }}</span>
                </div>
              </div>
              <div class="stars-row">
                <span class="rating-num">{{ item.rating | number: '1.1-1' }}</span>
                <app-icon name="star" size="sm" class="star-gold"></app-icon>
              </div>
            </div>
            <p class="comment-text">"{{ item.comment }}"</p>
            <div class="card-footer">
              <span class="meta-tag">
                <app-icon name="user" size="xs"></app-icon>
                <span>{{ item.technicianName }}</span>
              </span>
              <span class="meta-tag">
                <app-icon name="briefcase" size="xs"></app-icon>
                <span>{{ item.jobTitle }}</span>
              </span>
              <a [routerLink]="['/owner/feedback', item.id]" class="view-link">
                <span>Details</span>
                <app-icon name="chevron-right" size="xs"></app-icon>
              </a>
            </div>
          </div>
        }

        @if (reviews().length === 0) {
          <div class="empty-state card">
            <p>No feedback reviews yet.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .feedback-page {
        padding-bottom: 40px;
        max-width: 860px;
        margin: 0 auto;

        @include respond-to(desktop) {
          margin: 0;
        }
      }

      .page-header {
        margin-bottom: 20px;

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 4px;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin: 0;
        }
      }

      .summary-wrapper {
        margin-bottom: 24px;
      }

      .feedback-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .feedback-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 20px;
        transition: border-color var(--transition-fast);

        &:hover {
          border-color: #cbd5e1;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .user-meta {
            display: flex;
            align-items: center;
            gap: 12px;

            .avatar-initials {
              width: 40px;
              height: 40px;
              border-radius: var(--radius-full);
              background-color: #eff6ff;
              color: var(--color-primary);
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.9rem;
            }

            .name-box {
              display: flex;
              flex-direction: column;

              .customer-name {
                font-size: 0.95rem;
                font-weight: 600;
                color: var(--color-text-primary);
                margin: 0;
              }

              .review-date {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
              }
            }
          }

          .stars-row {
            display: flex;
            align-items: center;
            gap: 4px;
            background-color: #fef3c7;
            padding: 4px 10px;
            border-radius: var(--radius-full);

            .rating-num {
              font-weight: 700;
              font-size: 0.85rem;
              color: #92400e;
            }

            .star-gold {
              color: #f59e0b;
            }
          }
        }

        .comment-text {
          font-size: 0.925rem;
          color: var(--color-text-primary);
          line-height: 1.5;
          margin: 0 0 16px;
        }

        .card-footer {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;

          .meta-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            color: var(--color-text-secondary);
            background-color: #f8fafc;
            padding: 4px 10px;
            border-radius: var(--radius-sm);
          }

          .view-link {
            margin-left: auto;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-primary);
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .empty-state {
        padding: 32px;
        text-align: center;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class FeedbackListComponent implements OnInit {
  private feedbackService = inject(CompanyFeedbackService);

  summary = signal<{ averageRating: number; totalReviews: number } | null>(null);
  reviews = signal<CompanyFeedback[]>([]);

  ngOnInit(): void {
    this.feedbackService.list().subscribe({
      next: (data) => {
        this.summary.set({
          averageRating: data.averageRating ?? 0,
          totalReviews: data.totalReviews,
        });
        this.reviews.set(data.items);
      },
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
}
