import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-rating-summary',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="rating-summary-card card">
      <div class="rating-display">
        <span class="rating-value">{{ averageRating | number:'1.1-1' }}</span>
        <app-icon name="star" size="md" class="gold-star"></app-icon>
      </div>
      <p class="rating-sub">
        {{ label || 'Company rating · ' + totalReviews + ' reviews' }}
      </p>
    </div>
  `,
  styles: [`
    .rating-summary-card {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background-color: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);

      .rating-display {
        display: flex;
        align-items: center;
        gap: 8px;

        .rating-value {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .gold-star {
          color: #f59e0b;
        }
      }

      .rating-sub {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin: 6px 0 0 0;
      }
    }
  `]
})
export class OwnerRatingSummaryComponent {
  @Input() averageRating = 4.7;
  @Input() totalReviews = 286;
  @Input() label?: string;
}

export { OwnerRatingSummaryComponent as RatingSummaryComponent };
