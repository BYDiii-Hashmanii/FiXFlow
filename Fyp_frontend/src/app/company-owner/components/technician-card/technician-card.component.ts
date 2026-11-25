import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OwnerTechnician } from '../../models/owner.models';
import { AvailabilityChipComponent } from '../availability-chip/availability-chip.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-technician-card',
  standalone: true,
  imports: [CommonModule, RouterLink, AvailabilityChipComponent, IconComponent],
  template: `
    <a [routerLink]="['/owner/technicians', technician.id]" class="tech-card card">
      <div class="tech-card-header">
        <div class="avatar-circle">
          {{ technician.avatarInitials }}
        </div>
        <div class="tech-info">
          <h3 class="tech-name">{{ technician.name }}</h3>
          <span class="tech-cat">{{ technician.serviceCategory }}</span>
          <div class="tech-rating">
            <app-icon name="star" size="sm" class="star-icon"></app-icon>
            <span class="rating-num">{{ technician.rating | number:'1.1-1' }}</span>
            <span class="reviews-count">({{ technician.reviewCount }} reviews)</span>
          </div>
        </div>
        <div class="avail-wrapper">
          <app-availability-chip
            [availability]="technician.availability"
            [label]="technician.availabilityNote"
          ></app-availability-chip>
        </div>
      </div>

      <div class="tech-card-footer">
        <span class="rate-label">Service rate</span>
        <span class="rate-value">Rs {{ technician.serviceRate | number }} / visit</span>
      </div>
    </a>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .tech-card {
      display: flex;
      flex-direction: column;
      padding: 18px 20px;
      text-decoration: none;
      color: inherit;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background-color: #ffffff;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        border-color: #bfdbfe;
      }

      .tech-card-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        position: relative;

        .avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background-color: #eff6ff;
          color: var(--color-primary);
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tech-info {
          flex: 1;
          min-width: 0;

          .tech-name {
            font-size: 1rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 0 0 2px 0;
          }

          .tech-cat {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            display: block;
            margin-bottom: 6px;
          }

          .tech-rating {
            display: flex;
            align-items: center;
            gap: 4px;

            .star-icon {
              color: #f59e0b;
            }

            .rating-num {
              font-size: 0.8rem;
              font-weight: 700;
              color: var(--color-text-primary);
            }

            .reviews-count {
              font-size: 0.775rem;
              color: var(--color-text-muted);
            }
          }
        }

        .avail-wrapper {
          flex-shrink: 0;
        }
      }

      .tech-card-footer {
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid var(--color-border-subtle);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .rate-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .rate-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
      }
    }
  `]
})
export class OwnerTechnicianCardComponent {
  @Input({ required: true }) technician!: OwnerTechnician;
}
