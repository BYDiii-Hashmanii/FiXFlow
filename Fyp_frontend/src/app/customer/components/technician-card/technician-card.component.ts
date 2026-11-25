import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianInfo } from '../../models/customer.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-technician-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="tech-card card" [class.best-match]="technician.isBestMatch">
      <div class="tech-header">
        <div class="tech-avatar">{{ technician.avatarInitials }}</div>
        <div class="tech-info">
          <h4 class="tech-name">{{ technician.name }}</h4>
          <span class="tech-company">{{ technician.company }}</span>
          <div class="tech-rating">
            <app-icon name="star" size="sm"></app-icon>
            <span class="rating-num">{{ technician.rating ?? 'N/A' }}</span>
            <span class="rating-count">({{ technician.reviewCount }} reviews)</span>
          </div>
        </div>
      </div>

      <div class="tech-meta-row">
        <div class="rate-box">
          <span class="rate-val">Rs {{ technician.rate | number }}</span>
          <span class="rate-lbl">/ visit</span>
        </div>
        <span
          class="avail-pill"
          [class.avail-now]="technician.availability === 'available'"
          [class.avail-later]="technician.availability === 'busy'"
        >
          {{ technician.availability === 'available' ? 'Available now' : 'Unavailable' }}
        </span>
      </div>

      @if (showSelectButton) {
        <button
          type="button"
          class="btn btn-primary btn-block select-btn"
          (click)="selected.emit(technician)"
        >
          {{ buttonText }}
        </button>
      }
    </div>
  `,
  styles: [`
    .tech-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);

      &.best-match {
        border-color: var(--color-primary);
      }

      .tech-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .tech-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background-color: #dbeafe;
          color: #1e40af;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tech-info {
          display: flex;
          flex-direction: column;

          .tech-name {
            font-size: 1rem;
            font-weight: 700;
            color: var(--color-text-primary);
          }

          .tech-company {
            font-size: 0.825rem;
            color: var(--color-text-muted);
          }

          .tech-rating {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #f59e0b;
            font-size: 0.8rem;
            margin-top: 2px;

            .rating-num {
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .rating-count {
              color: var(--color-text-muted);
            }
          }
        }
      }

      .tech-meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px solid var(--color-border-subtle);

        .rate-box {
          .rate-val {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--color-text-primary);
          }
          .rate-lbl {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-left: 2px;
          }
        }

        .avail-pill {
          font-size: 0.775rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          background-color: #f1f5f9;
          color: #475569;

          &.avail-now {
            background-color: #dcfce7;
            color: #15803d;
          }

          &.avail-later {
            background-color: #fef3c7;
            color: #b45309;
          }
        }
      }

      .select-btn {
        height: 44px;
        font-size: 0.925rem;
      }
    }
  `]
})
export class TechnicianCardComponent {
  @Input({ required: true }) technician!: TechnicianInfo;
  @Input() showSelectButton = true;
  @Input() buttonText = 'Request Technician';

  @Output() selected = new EventEmitter<TechnicianInfo>();
}
