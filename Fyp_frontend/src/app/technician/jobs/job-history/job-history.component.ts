import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-job-history',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="job-history-page">
      <!-- Desktop Header & Stats Summary -->
      <div class="history-header">
        <div>
          <h1 class="page-title">Job History</h1>
          <p class="page-sub">Historical record of all completed and settled maintenance jobs</p>
        </div>

        <div class="history-summary-pills">
          <div class="summary-pill">
            <span class="label">Total Settled</span>
            <span class="val">Rs {{ totalEarnings() | number }}</span>
          </div>
          <div class="summary-pill">
            <span class="label">Completed Jobs</span>
            <span class="val">{{ completedJobs().length }}</span>
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="card history-table-card">
        <div class="table-responsive">
          <table class="history-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Customer & Address</th>
                <th>Completion Date</th>
                <th>Invoice #</th>
                <th>Total Paid</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (job of completedJobs(); track job.id) {
                <tr>
                  <td>
                    <div class="job-info-cell">
                      <span class="job-title">{{ job.title }}</span>
                      <span class="job-category">{{ job.category }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="customer-info-cell">
                      <span class="cust-name">{{ job.customer.name }}</span>
                      <span class="cust-addr">{{ job.customer.address }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="date-text">{{ job.invoiceDate }}</span>
                  </td>
                  <td>
                    <span class="invoice-number-tag">{{ job.invoiceNumber }}</span>
                  </td>
                  <td>
                    <span class="amount-val">Rs {{ job.totalCost | number }}</span>
                  </td>
                  <td>
                    <span class="chip chip-green">Paid</span>
                  </td>
                  <td class="text-right">
                    <a [routerLink]="['/technician/jobs', job.id, 'closed']" class="btn btn-secondary btn-sm">
                      View Receipt
                    </a>
                  </td>
                </tr>
              }
              @if (completedJobs().length === 0) {
                <tr>
                  <td colspan="7" class="empty-cell">
                    No completed jobs found yet.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile List View (matches Screen 24 History in PDF) -->
      <div class="mobile-history-list">
        @for (job of completedJobs(); track job.id) {
          <a [routerLink]="['/technician/jobs', job.id, 'closed']" class="card mobile-history-item">
            <div class="history-item-content">
              <div class="item-icon-box">
                <app-icon name="file-text" size="sm"></app-icon>
              </div>
              <div class="item-text">
                <h3 class="item-title">{{ job.title }}</h3>
                <span class="item-subtitle">{{ dataService.technician()?.company }} · Rs {{ job.totalCost | number }}</span>
              </div>
            </div>
            <span class="chip chip-green">Paid</span>
          </a>
        }
        @if (completedJobs().length === 0) {
          <div class="card empty-card">
            <p>No job history available.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .job-history-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .history-header {
      display: flex;
      flex-direction: column;
      gap: 16px;

      @include tablet-up {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .page-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .page-sub {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }

      .history-summary-pills {
        display: flex;
        gap: 12px;

        .summary-pill {
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 8px 16px;
          display: flex;
          flex-direction: column;

          .label {
            font-size: 0.725rem;
            color: var(--color-text-muted);
          }

          .val {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-primary);
          }
        }
      }
    }

    /* Desktop Table */
    .history-table-card {
      display: none;
      padding: 0;
      overflow: hidden;

      @include desktop {
        display: block;
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }

      .history-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;

        th {
          background-color: #f8fafc;
          padding: 14px 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          border-bottom: 1px solid var(--color-border);
        }

        td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border-subtle);
          vertical-align: middle;
          font-size: 0.9rem;
        }

        tbody tr:hover {
          background-color: #f8fafc;
        }

        .job-info-cell {
          display: flex;
          flex-direction: column;

          .job-title {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .job-category {
            font-size: 0.775rem;
            color: var(--color-text-muted);
          }
        }

        .customer-info-cell {
          display: flex;
          flex-direction: column;

          .cust-name {
            font-weight: 500;
            color: var(--color-text-primary);
          }

          .cust-addr {
            font-size: 0.775rem;
            color: var(--color-text-muted);
          }
        }

        .invoice-number-tag {
          font-family: monospace;
          font-size: 0.825rem;
          color: var(--color-text-secondary);
          background-color: #f1f5f9;
          padding: 3px 6px;
          border-radius: var(--radius-xs);
        }

        .amount-val {
          font-weight: 700;
          color: var(--color-primary);
        }

        .empty-cell {
          text-align: center;
          padding: 40px;
          color: var(--color-text-muted);
        }
      }
    }

    /* Mobile List (matches Screen 24 in PDF) */
    .mobile-history-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      @include desktop {
        display: none;
      }

      .mobile-history-item {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        text-decoration: none;

        .history-item-content {
          display: flex;
          align-items: center;
          gap: 14px;

          .item-icon-box {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            background-color: #eff6ff;
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .item-text {
            display: flex;
            flex-direction: column;

            .item-title {
              font-size: 0.975rem;
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .item-subtitle {
              font-size: 0.8rem;
              color: var(--color-text-muted);
            }
          }
        }
      }

      .empty-card {
        text-align: center;
        padding: 32px;
        color: var(--color-text-muted);
      }
    }
  `]
})
export class JobHistoryComponent implements OnInit {
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Job History | FixFlow Technician');
    this.headerService.setHeader({
      title: 'History',
      showBack: true,
      backUrl: '/technician/profile',
      showBell: true
    });
  }

  completedJobs(): Job[] {
    return this.dataService.completedJobs();
  }

  totalEarnings(): number {
    return this.completedJobs().reduce((sum, j) => sum + j.totalCost, 0);
  }
}
