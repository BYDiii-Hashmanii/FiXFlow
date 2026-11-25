import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceRequest } from '../../models/customer.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, StatusChipComponent],
  template: `
    <a [routerLink]="['/customer/requests', request.id]" class="request-card card">
      <div class="card-left">
        <div class="icon-wrap">
          <app-icon [name]="getCategoryIcon(request.category)" size="sm"></app-icon>
        </div>
        <div class="info-wrap">
          <h4 class="request-title">{{ request.description || request.category }}</h4>
          <span class="request-sub">
            @if (request.assignedTechnician) {
              Sent to {{ request.assignedTechnician.name }} · Rs {{ request.estimatedPrice | number }}
            } @else {
              {{ request.createdAt }}
            }
          </span>
        </div>
      </div>
      <app-status-chip [status]="request.status"></app-status-chip>
    </a>
  `,
  styles: [`
    .request-card {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      text-decoration: none;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);

      &:hover {
        border-color: #cbd5e1;
      }

      .card-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background-color: #eff6ff;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-wrap {
          display: flex;
          flex-direction: column;

          .request-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .request-sub {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }
      }
    }
  `]
})
export class RequestCardComponent {
  @Input({ required: true }) request!: ServiceRequest;

  getCategoryIcon(category?: string): string {
    switch (category?.toLowerCase()) {
      case 'plumbing': return 'wrench';
      case 'electrical': return 'sparkles';
      case 'carpentry': return 'hammer';
      case 'appliance': return 'cpu';
      default: return 'wrench';
    }
  }
}
