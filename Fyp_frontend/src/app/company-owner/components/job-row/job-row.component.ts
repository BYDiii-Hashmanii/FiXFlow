import { Component, Input } from '@angular/core';

import { RouterLink } from '@angular/router';
import { CompanyJob } from '../../models/owner.models';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-job-row',
  standalone: true,
  imports: [RouterLink, StatusChipComponent, IconComponent],
  template: `
    <a [routerLink]="['/owner/jobs', job.id]" class="job-row-card card">
      <div class="row-left">
        <div class="icon-wrap">
          <app-icon name="briefcase" size="sm"></app-icon>
        </div>
        <div class="row-meta">
          <h3 class="job-title">{{ job.title }}</h3>
          <span class="job-sub">{{ job.technicianName }} · {{ job.date }}</span>
        </div>
      </div>

      <div class="row-right">
        <app-status-chip [status]="job.status" [label]="statusLabel"></app-status-chip>
      </div>
    </a>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .job-row-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        text-decoration: none;
        color: inherit;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background-color: #ffffff;
        transition:
          background-color var(--transition-fast),
          border-color var(--transition-fast);

        &:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        .row-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;

          .icon-wrap {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-md);
            background-color: #eff6ff;
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .row-meta {
            min-width: 0;

            .job-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--color-text-primary);
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .job-sub {
              font-size: 0.8rem;
              color: var(--color-text-muted);
              margin-top: 2px;
              display: block;
            }
          }
        }

        .row-right {
          flex-shrink: 0;
          margin-left: 12px;
        }
      }
    `,
  ],
})
export class OwnerJobRowComponent {
  @Input({ required: true }) job!: CompanyJob;

  get statusLabel(): string {
    switch (this.job.status) {
      case 'closed_paid':
        return 'Closed · Paid';
      case 'in_progress':
        return 'In progress';
      case 'closed_unpaid':
        return 'Closed · Unpaid';
      case 'accepted':
        return 'Accepted';
      case 'completed':
        return 'Completed';
      default:
        return this.job.status;
    }
  }
}

export { OwnerJobRowComponent as JobRowComponent };
