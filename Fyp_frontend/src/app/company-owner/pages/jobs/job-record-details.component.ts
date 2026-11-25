import { Component, OnInit, signal, inject } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyJobService } from '../../services/company-job.service';
import { CompanyJob } from '../../models/owner.models';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { JobProgressListComponent } from '../../components/job-progress-list/job-progress-list.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-job-record-details',
  standalone: true,
  imports: [RouterLink, StatusChipComponent, JobProgressListComponent, IconComponent],
  template: `
    @if (job()) {
      <div class="page-container">
        <!-- Top nav header -->
        <div class="page-header">
          <a routerLink="/owner/jobs" class="back-btn" aria-label="Back to jobs">
            <app-icon name="arrow-left" size="md"></app-icon>
          </a>
          <div class="header-titles">
            <div class="id-row">
              <h1 class="page-title">{{ job()!.id }}</h1>
              <app-status-chip
                [status]="job()!.status"
                [label]="formatStatus(job()!.status)"
              ></app-status-chip>
            </div>
            <p class="job-category">{{ job()!.category }} · {{ job()!.date }}</p>
          </div>
        </div>
        <!-- Two column desktop layout -->
        <div class="details-grid">
          <!-- Left Column: Job & Customer Details -->
          <div class="left-col">
            <div class="info-card card">
              <h2 class="card-title">{{ job()!.title }}</h2>
              <p class="job-desc">{{ job()!.description }}</p>
              <div class="divider"></div>
              <h3 class="section-heading">Assigned Personnel</h3>
              <div class="person-row">
                <div class="avatar-sm">
                  <app-icon name="user" size="sm"></app-icon>
                </div>
                <div class="person-info">
                  <span class="person-name">{{ job()!.technicianName }}</span>
                  <span class="person-role">Technician</span>
                </div>
              </div>
              <div class="divider"></div>
              <h3 class="section-heading">Customer Information</h3>
              <div class="person-row">
                <div class="avatar-sm customer-av">
                  <app-icon name="user" size="sm"></app-icon>
                </div>
                <div class="person-info">
                  <span class="person-name">{{ job()!.customerName }}</span>
                  <span class="person-phone">{{ job()!.customerPhone }}</span>
                </div>
              </div>
              <div class="detail-item">
                <span class="label">Access Time</span>
                <span class="val">{{ job()!.accessTime }}</span>
              </div>
              @if (job()!.invoiceId) {
                <div class="invoice-box">
                  <div class="invoice-info">
                    <span class="inv-label">Invoice Generated</span>
                    <span class="inv-id">{{ job()!.invoiceId }}</span>
                  </div>
                  <a
                    [routerLink]="['/owner/invoices', job()!.invoiceId]"
                    class="btn btn-outline-primary"
                  >
                    <span>View Invoice</span>
                    <app-icon name="chevron-right" size="sm"></app-icon>
                  </a>
                </div>
              }
            </div>
          </div>
          <!-- Right Column: Progress Timeline -->
          <div class="right-col">
            <div class="progress-card card">
              <h3 class="section-heading">Job Status & Progress</h3>
              <app-owner-job-progress-list
                [steps]="job()!.progressSteps"
              ></app-owner-job-progress-list>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Loading job record...</p>
      </div>
    }
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .page-container {
        padding-bottom: 40px;
      }

      .page-header {
        display: flex;
        align-items: flex-start;
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
          flex-shrink: 0;

          &:hover {
            background-color: #f1f5f9;
          }
        }

        .header-titles {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .id-row {
            display: flex;
            align-items: center;
            gap: 12px;

            .page-title {
              font-size: 1.45rem;
              font-weight: 700;
              color: var(--color-text-primary);
              margin: 0;
            }
          }

          .job-category {
            font-size: 0.9rem;
            color: var(--color-text-secondary);
            margin: 0;
          }
        }
      }

      .details-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;

        @include respond-to(desktop) {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
          align-items: start;
        }
      }

      .info-card,
      .progress-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 24px;
      }

      .card-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin: 0 0 8px;
      }

      .job-desc {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
        margin: 0 0 16px;
      }

      .divider {
        height: 1px;
        background-color: var(--color-border);
        margin: 18px 0;
      }

      .section-heading {
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 14px;
      }

      .person-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .avatar-sm {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: #eff6ff;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;

          &.customer-av {
            background-color: #f1f5f9;
            color: #475569;
          }
        }

        .person-info {
          display: flex;
          flex-direction: column;

          .person-name {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .person-role,
          .person-phone {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
          }
        }
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        font-size: 0.9rem;

        .label {
          color: var(--color-text-secondary);
        }

        .val {
          font-weight: 600;
          color: var(--color-text-primary);
        }
      }

      .invoice-box {
        margin-top: 20px;
        padding: 16px;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .invoice-info {
          display: flex;
          flex-direction: column;

          .inv-label {
            font-size: 0.8rem;
            color: var(--color-text-secondary);
          }

          .inv-id {
            font-weight: 700;
            color: var(--color-text-primary);
          }
        }

        .btn-outline-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background-color: #ffffff;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all var(--transition-fast);

          &:hover {
            background-color: var(--color-primary);
            color: #ffffff;
          }
        }
      }

      .loading-state {
        padding: 40px;
        text-align: center;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class JobRecordDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(CompanyJobService);

  job = signal<CompanyJob | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobService.getById(id).subscribe({
        next: (res) => this.job.set(res),
      });
    }
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'closed_paid':
        return 'Paid';
      case 'closed_unpaid':
        return 'Unpaid';
      case 'in_progress':
        return 'In Progress';
      case 'accepted':
        return 'Accepted';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  }
}
