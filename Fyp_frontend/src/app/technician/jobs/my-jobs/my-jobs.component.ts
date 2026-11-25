import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="my-jobs-page">
      <!-- Top header bar for desktop -->
      <div class="jobs-page-header">
        <div>
          <h1 class="page-main-title">My Jobs</h1>
          <p class="page-main-sub">Manage and track your active and past maintenance service calls</p>
        </div>

        <!-- Filter Tabs (Matches Screen 21 in PDF) -->
        <div class="segment-tabs" role="tablist">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'all'"
            (click)="setTab('all')"
            role="tab"
          >
            All ({{ dataService.jobs().length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'active'"
            (click)="setTab('active')"
            role="tab"
          >
            Active ({{ dataService.activeJobs().length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'completed'"
            (click)="setTab('completed')"
            role="tab"
          >
            Completed ({{ dataService.completedJobs().length }})
          </button>
        </div>
      </div>

      <!-- Desktop Table View (>= 1024px) -->
      <div class="desktop-table-card card">
        <div class="table-responsive">
          <table class="jobs-table">
            <thead>
              <tr>
                <th>Job & Category</th>
                <th>Customer</th>
                <th>Scheduled Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (job of filteredJobs; track job.id) {
                <tr>
                  <td>
                    <div class="job-cell">
                      <div class="job-icon-box">
                        <app-icon [name]="getCategoryIcon(job.category)" size="sm"></app-icon>
                      </div>
                      <div class="job-meta">
                        <span class="job-name">{{ job.title }}</span>
                        <span class="job-cat">{{ job.category }} · #{{ job.id }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="customer-cell">
                      <span class="cust-name">{{ job.customer.name }}</span>
                      <span class="cust-loc">{{ job.customer.address }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="date-text">{{ job.accessTime }}</span>
                  </td>
                  <td>
                    <span class="amount-text font-bold">Rs {{ job.totalCost | number }}</span>
                  </td>
                  <td>
                    <span
                      class="chip"
                      [class.chip-green]="job.status === 'completed' || job.status === 'closed' || job.status === 'accepted'"
                      [class.chip-orange]="job.status === 'in_progress'"
                    >
                      {{ job.status === 'closed' ? 'Closed - Paid' : (job.status === 'in_progress' ? 'In progress' : (job.status === 'completed' ? 'Completed' : 'Accepted')) }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="table-actions">
                      <a [routerLink]="['/technician/jobs', job.id]" class="btn btn-secondary btn-sm" title="View details">
                        View
                      </a>
                      @if (job.status === 'in_progress') {
                        <a [routerLink]="['/technician/jobs', job.id, 'update']" class="btn btn-primary btn-sm" title="Update work">
                          Update
                        </a>
                      } @else if (job.status === 'completed') {
                        <a [routerLink]="['/technician/jobs', job.id, 'invoice']" class="btn btn-primary btn-sm">
                          Invoice
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              }
              @if (filteredJobs.length === 0) {
                <tr>
                  <td colspan="6" class="empty-table-cell">
                    No jobs found in this tab.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card List View (< 1024px, matches Screen 21 in PDF) -->
      <div class="mobile-cards-list">
        @for (job of filteredJobs; track job.id) {
          <a [routerLink]="['/technician/jobs', job.id]" class="mobile-job-card card">
            <div class="mobile-card-top">
              <div class="icon-title-group">
                <div class="job-icon-box">
                  <app-icon [name]="getCategoryIcon(job.category)" size="sm"></app-icon>
                </div>
                <div class="job-info">
                  <h3 class="job-title">{{ job.title }}</h3>
                  <span class="job-date">{{ job.accessTime }}</span>
                </div>
              </div>
              <span
                class="chip"
                [class.chip-green]="job.status === 'completed' || job.status === 'closed' || job.status === 'accepted'"
                [class.chip-orange]="job.status === 'in_progress'"
              >
                {{ job.status === 'closed' ? 'Closed · Paid' : (job.status === 'in_progress' ? 'In progress' : 'Accepted') }}
              </span>
            </div>

            <div class="mobile-card-bottom">
              <span class="customer-tag">{{ job.customer.name }}</span>
              <span class="price-tag">Rs {{ job.totalCost | number }}</span>
            </div>
          </a>
        }
        @if (filteredJobs.length === 0) {
          <div class="card empty-mobile-card">
            <p>No jobs found in this category.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .my-jobs-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .jobs-page-header {
      display: flex;
      flex-direction: column;
      gap: 16px;

      @include tablet-up {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .page-main-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .page-main-sub {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }
    }

    /* Segmented Tabs (Matches Screen 21 in PDF) */
    .segment-tabs {
      display: flex;
      background-color: #e2e8f0;
      padding: 4px;
      border-radius: var(--radius-full);
      gap: 4px;
      width: 100%;

      @include tablet-up {
        width: auto;
      }

      .tab-btn {
        flex: 1;
        padding: 8px 18px;
        border-radius: var(--radius-full);
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        background-color: transparent;
        transition: all var(--transition-fast);
        white-space: nowrap;
        text-align: center;

        &.active {
          background-color: #ffffff;
          color: var(--color-primary);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }
      }
    }

    /* Desktop Table View (>= 1024px) */
    .desktop-table-card {
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

      .jobs-table {
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

        .job-cell {
          display: flex;
          align-items: center;
          gap: 12px;

          .job-icon-box {
            width: 38px;
            height: 38px;
            border-radius: var(--radius-md);
            background-color: #eff6ff;
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .job-meta {
            display: flex;
            flex-direction: column;

            .job-name {
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .job-cat {
              font-size: 0.775rem;
              color: var(--color-text-muted);
            }
          }
        }

        .customer-cell {
          display: flex;
          flex-direction: column;

          .cust-name {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .cust-loc {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }

        .amount-text {
          font-weight: 700;
          color: var(--color-primary);
        }

        .table-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .empty-table-cell {
          text-align: center;
          padding: 40px;
          color: var(--color-text-muted);
        }
      }
    }

    /* Mobile Cards View (< 1024px, Screen 21 in PDF) */
    .mobile-cards-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      @include desktop {
        display: none;
      }

      .mobile-job-card {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        text-decoration: none;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);

        &:active {
          transform: scale(0.99);
        }

        .mobile-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;

          .icon-title-group {
            display: flex;
            align-items: center;
            gap: 12px;

            .job-icon-box {
              width: 40px;
              height: 40px;
              border-radius: var(--radius-md);
              background-color: #eff6ff;
              color: var(--color-primary);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .job-info {
              .job-title {
                font-size: 1rem;
                font-weight: 600;
                color: var(--color-text-primary);
                margin-bottom: 2px;
              }

              .job-date {
                font-size: 0.8rem;
                color: var(--color-text-muted);
              }
            }
          }
        }

        .mobile-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid var(--color-border-subtle);

          .customer-tag {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
          }

          .price-tag {
            font-size: 1rem;
            font-weight: 700;
            color: var(--color-primary);
          }
        }
      }

      .empty-mobile-card {
        text-align: center;
        padding: 32px;
        color: var(--color-text-muted);
      }
    }
  `]
})
export class MyJobsComponent implements OnInit {
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  activeTab: 'all' | 'active' | 'completed' = 'all';

  ngOnInit(): void {
    this.title.setTitle('My Jobs | FixFlow Technician');
    this.headerService.setHeader({
      title: 'My Jobs',
      showBack: false,
      showBell: true
    });
  }

  setTab(tab: 'all' | 'active' | 'completed'): void {
    this.activeTab = tab;
  }

  get filteredJobs(): Job[] {
    const jobs = this.dataService.jobs();
    if (this.activeTab === 'active') {
      return this.dataService.activeJobs();
    }
    if (this.activeTab === 'completed') {
      return this.dataService.completedJobs();
    }
    return jobs;
  }

  getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'plumbing': return 'wrench';
      case 'electrical': return 'clock';
      case 'carpentry': return 'briefcase';
      default: return 'wrench';
    }
  }
}
