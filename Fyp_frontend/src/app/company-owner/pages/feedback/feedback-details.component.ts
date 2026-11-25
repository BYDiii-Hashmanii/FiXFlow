import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyFeedbackService } from '../../services/company-feedback.service';
import { CompanyFeedback } from '../../models/owner.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-feedback-details',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if (feedback()) {
      <div class="page-container">
        <!-- Page Header -->
        <div class="page-header">
          <a routerLink="/owner/feedback" class="back-btn" aria-label="Back to feedback list">
            <app-icon name="arrow-left" size="md"></app-icon>
          </a>
          <h1 class="page-title">Feedback Details</h1>
        </div>
        <div class="details-card card">
          <!-- Customer & Date Header -->
          <div class="customer-section">
            <div class="avatar-circle">
              {{ getInitials(feedback()!.customerName) }}
            </div>
            <div class="customer-info">
              <h2 class="customer-name">{{ feedback()!.customerName }}</h2>
              <span class="feedback-date">Submitted on {{ feedback()!.date }}</span>
            </div>
            <div class="rating-badge">
              <span class="rating-num">{{ feedback()!.rating | number: '1.1-1' }}</span>
              <app-icon name="star" size="sm" class="star-icon"></app-icon>
            </div>
          </div>
          <div class="divider"></div>
          <!-- Feedback comment text -->
          <div class="comment-section">
            <h3 class="section-label">Review Comment</h3>
            <p class="comment-body">"{{ feedback()!.comment }}"</p>
          </div>
          <div class="divider"></div>
          <!-- Associated Job & Technician Information -->
          <div class="metadata-grid">
            <div class="meta-item">
              <span class="item-label">Assigned Technician</span>
              <span class="item-value">{{ feedback()!.technicianName }}</span>
            </div>
            <div class="meta-item">
              <span class="item-label">Job Reference</span>
              <a [routerLink]="['/owner/jobs', feedback()!.jobId]" class="item-link">
                {{ feedback()!.jobTitle }} ({{ feedback()!.jobId }})
              </a>
            </div>
            <div class="meta-item">
              <span class="item-label">Invoice Number</span>
              <a [routerLink]="['/owner/invoices', feedback()!.invoiceId]" class="item-link">
                {{ feedback()!.invoiceId }}
              </a>
            </div>
          </div>
          <!-- Info note -->
          <div class="info-note">
            <app-icon name="info" size="sm"></app-icon>
            <span>Feedback is submitted by the customer upon job completion.</span>
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Loading feedback details...</p>
      </div>
    }
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .page-container {
        padding-bottom: 40px;
        max-width: 760px;
        margin: 0 auto;

        @include respond-to(desktop) {
          margin: 0;
        }
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 24px;

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          text-decoration: none;

          &:hover {
            background-color: #f1f5f9;
          }
        }

        .page-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
      }

      .details-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 28px;
      }

      .customer-section {
        display: flex;
        align-items: center;
        gap: 16px;

        .avatar-circle {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background-color: #eff6ff;
          color: var(--color-primary);
          font-weight: 700;
          font-size: 1.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-info {
          flex: 1;

          .customer-name {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 0 0 4px;
          }

          .feedback-date {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
          }
        }

        .rating-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #fef3c7;
          padding: 6px 14px;
          border-radius: var(--radius-full);

          .rating-num {
            font-weight: 700;
            color: #92400e;
            font-size: 1rem;
          }

          .star-icon {
            color: #f59e0b;
          }
        }
      }

      .divider {
        height: 1px;
        background-color: var(--color-border);
        margin: 20px 0;
      }

      .comment-section {
        .section-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          margin: 0 0 10px;
          letter-spacing: 0.03em;
        }

        .comment-body {
          font-size: 1.05rem;
          color: var(--color-text-primary);
          line-height: 1.6;
          margin: 0;
          font-style: italic;
        }
      }

      .metadata-grid {
        display: flex;
        flex-direction: column;
        gap: 14px;

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;

          .item-label {
            color: var(--color-text-secondary);
          }

          .item-value {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .item-link {
            font-weight: 600;
            color: var(--color-primary);
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .info-note {
        margin-top: 24px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background-color: #f8fafc;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        color: var(--color-text-secondary);
      }

      .loading-state {
        padding: 40px;
        text-align: center;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class FeedbackDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private feedbackService = inject(CompanyFeedbackService);

  feedback = signal<CompanyFeedback | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.feedbackService.getById(id).subscribe({
        next: (data) => this.feedback.set(data),
      });
    }
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
