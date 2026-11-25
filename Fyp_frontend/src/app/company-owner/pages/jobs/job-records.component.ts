import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyJobService } from '../../services/company-job.service';
import { CompanyJob } from '../../models/owner.models';
import { JobRowComponent } from '../../components/job-row/job-row.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-job-records',
  standalone: true,
  imports: [CommonModule, RouterLink, JobRowComponent, StatusChipComponent, IconComponent],
  template: `
    <div class="job-records-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Job Records</h1>
          <p class="page-subtitle">Track and inspect all service requests assigned to your team</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
          All Jobs ({{ allJobs().length }})
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'active'"
          (click)="setTab('active')"
        >
          Active ({{ activeCount() }})
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'completed'"
          (click)="setTab('completed')"
        >
          Completed ({{ completedCount() }})
        </button>
      </div>

      <!-- Mobile List View -->
      <div class="mobile-job-list">
        @if (filteredJobs().length === 0) {
          <div class="empty-box card">
            <app-icon name="briefcase" size="lg" class="empty-icon"></app-icon>
            <p>No jobs found in this category.</p>
          </div>
        } @else {
          @for (job of filteredJobs(); track job) {
            <app-owner-job-row [job]="job"></app-owner-job-row>
          }
        }
      </div>

      <!-- Desktop Table View -->
      <div class="desktop-table-card card">
        <div class="table-responsive">
          <table class="jobs-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Title & Category</th>
                <th>Customer</th>
                <th>Technician</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredJobs().length === 0) {
                <tr>
                  <td colspan="8" class="text-center empty-cell">
                    No jobs found in this category.
                  </td>
                </tr>
              } @else {
                @for (job of filteredJobs(); track job) {
                  <tr>
                    <td class="font-bold">{{ job.id }}</td>
                    <td>
                      <div class="job-meta-cell">
                        <span class="cell-primary">{{ job.title }}</span>
                        <span class="cell-secondary">{{ job.category }}</span>
                      </div>
                    </td>
                    <td>{{ job.customerName }}</td>
                    <td>
                      <span class="tech-badge">{{ job.technicianName }}</span>
                    </td>
                    <td>{{ job.date }}</td>
                    <td class="font-bold">Rs {{ job.total | number }}</td>
                    <td>
                      <app-status-chip
                        [status]="job.status"
                        [label]="formatStatus(job.status)"
                      ></app-status-chip>
                    </td>
                    <td class="text-right">
                      <a [routerLink]="['/owner/jobs', job.id]" class="view-link">
                        <span>View</span>
                        <app-icon name="chevron-right" size="sm"></app-icon>
                      </a>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .job-records-page {
        padding-bottom: 40px;
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

      .filter-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        overflow-x: auto;
        padding-bottom: 4px;

        .tab-btn {
          padding: 8px 16px;
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);

          &:hover {
            background-color: #f8fafc;
            border-color: #cbd5e1;
          }

          &.active {
            background-color: var(--color-primary);
            color: #ffffff;
            border-color: var(--color-primary);
          }
        }
      }

      .mobile-job-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        @include respond-to(desktop) {
          display: none;
        }
      }

      .desktop-table-card {
        display: none;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        overflow: hidden;

        @include respond-to(desktop) {
          display: block;
        }
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }

      .jobs-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.9rem;

        thead {
          background-color: #f8fafc;
          border-bottom: 1px solid var(--color-border);

          th {
            padding: 14px 16px;
            font-weight: 600;
            color: var(--color-text-secondary);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
        }

        tbody {
          tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background-color var(--transition-fast);

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background-color: #f8fafc;
            }
          }

          td {
            padding: 14px 16px;
            color: var(--color-text-primary);
            vertical-align: middle;
          }
        }

        .font-bold {
          font-weight: 600;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .empty-cell {
          padding: 32px;
          color: var(--color-text-secondary);
        }

        .job-meta-cell {
          display: flex;
          flex-direction: column;

          .cell-primary {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .cell-secondary {
            font-size: 0.8rem;
            color: var(--color-text-secondary);
          }
        }

        .tech-badge {
          display: inline-block;
          padding: 3px 8px;
          background-color: #f1f5f9;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .view-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: var(--color-primary);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .empty-box {
        padding: 32px 20px;
        text-align: center;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        color: var(--color-text-secondary);

        .empty-icon {
          margin-bottom: 10px;
          color: #94a3b8;
        }
      }
    `,
  ],
})
export class JobRecordsComponent implements OnInit {
  private jobService = inject(CompanyJobService);

  allJobs = signal<CompanyJob[]>([]);
  activeTab = signal<'all' | 'active' | 'completed'>('all');

  ngOnInit(): void {
    this.jobService.list().subscribe({
      next: (jobs) => this.allJobs.set(jobs),
    });
  }

  setTab(tab: 'all' | 'active' | 'completed'): void {
    this.activeTab.set(tab);
  }

  filteredJobs(): CompanyJob[] {
    const tab = this.activeTab();
    const jobs = this.allJobs();
    if (tab === 'active') {
      return jobs.filter((j) => j.status === 'in_progress' || j.status === 'accepted');
    }
    if (tab === 'completed') {
      return jobs.filter(
        (j) =>
          j.status === 'completed' || j.status === 'closed_paid' || j.status === 'closed_unpaid',
      );
    }
    return jobs;
  }

  activeCount(): number {
    return this.allJobs().filter((j) => j.status === 'in_progress' || j.status === 'accepted')
      .length;
  }

  completedCount(): number {
    return this.allJobs().filter(
      (j) => j.status === 'completed' || j.status === 'closed_paid' || j.status === 'closed_unpaid',
    ).length;
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
