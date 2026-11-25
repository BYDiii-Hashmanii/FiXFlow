import { Component, OnInit, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { OwnerDashboardService } from '../../services/owner-dashboard.service';
import { HeaderService } from '../../../core/services/header.service';
import { OwnerDashboardData } from '../../models/owner.models';
import { OwnerJobRowComponent } from '../../components/job-row/job-row.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [RouterLink, OwnerJobRowComponent, LoaderComponent],
  template: `
    <div class="dashboard-page">
      @if (loading()) {
        <app-loader></app-loader>
      } @else if (data()) {
        <!-- Greeting Card (Matches Screen 2 in PDF) -->
        <div class="greeting-card card">
          <div class="avatar-circle">
            {{ data()!.greeting.avatarInitials }}
          </div>
          <div class="greeting-text">
            <h2 class="user-name">Hello, {{ data()!.greeting.name }}</h2>
            <span class="company-name">{{ data()!.greeting.company }}</span>
          </div>
        </div>

        <!-- 3 Stat Cards in One Row (Matches Screen 2 in PDF) -->
        <div class="stat-cards-grid">
          <div class="stat-card card">
            <span class="stat-value">{{ data()!.stats.totalTechnicians }}</span>
            <span class="stat-label">Total Technicians</span>
          </div>

          <div class="stat-card card">
            <span class="stat-value">{{ data()!.stats.activeJobs }}</span>
            <span class="stat-label">Active Jobs</span>
          </div>

          <div class="stat-card card">
            <span class="stat-value">{{ data()!.stats.completedJobs }}</span>
            <span class="stat-label">Completed Jobs</span>
          </div>
        </div>

        <!-- Primary Add Technician Action Button -->
        <div class="action-btn-row">
          <a routerLink="/owner/technicians/add" class="btn btn-primary btn-block btn-add">
            Add Technician
          </a>
        </div>

        <!-- Desktop Two-Column Layout: Jobs on left, Shortcuts on right -->
        <div class="dashboard-grid">
          <!-- Recent Company Jobs Section -->
          <div class="jobs-section">
            <div class="section-header">
              <h3 class="section-title">Recent company jobs</h3>
              <a routerLink="/owner/jobs" class="view-all-link">View all</a>
            </div>

            <div class="jobs-list">
              @for (job of data()!.recentJobs; track job.id) {
                <app-owner-job-row [job]="job"></app-owner-job-row>
              }
            </div>
          </div>

          <!-- Shortcuts Section -->
          <div class="shortcuts-section">
            <h3 class="section-title desktop-only-title">Management</h3>
            <div class="shortcuts-row">
              <a routerLink="/owner/invoices" class="btn btn-secondary flex-1 btn-shortcut">
                Invoices
              </a>
              <a routerLink="/owner/feedback" class="btn btn-secondary flex-1 btn-shortcut">
                Feedback
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .dashboard-page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      }

      /* Greeting Card */
      .greeting-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 20px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);

        .avatar-circle {
          width: 44px;
          height: 44px;
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

        .greeting-text {
          .user-name {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 0;
          }

          .company-name {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-top: 2px;
            display: block;
          }
        }
      }

      /* 3 Stat Cards in One Row */
      .stat-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        @include tablet {
          gap: 16px;
        }

        .stat-card {
          padding: 16px 12px;
          text-align: center;
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .stat-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--color-text-primary);
            line-height: 1;

            @include tablet {
              font-size: 1.75rem;
            }
          }

          .stat-label {
            font-size: 0.725rem;
            font-weight: 500;
            color: var(--color-text-muted);
            margin-top: 6px;
            line-height: 1.2;

            @include tablet {
              font-size: 0.8rem;
            }
          }
        }
      }

      .action-btn-row {
        .btn-add {
          height: 46px;
          font-size: 0.95rem;
          font-weight: 600;
        }
      }

      /* Multi-column grid on desktop */
      .dashboard-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;

        @include desktop {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: start;
        }
      }

      .jobs-section {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .section-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 0;
          }

          .view-all-link {
            font-size: 0.85rem;
            color: var(--color-primary);
            text-decoration: none;
            font-weight: 600;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }

      .shortcuts-section {
        .desktop-only-title {
          display: none;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 12px 0;

          @include desktop {
            display: block;
          }
        }

        .shortcuts-row {
          display: flex;
          gap: 12px;

          @include desktop {
            flex-direction: column;
          }

          .btn-shortcut {
            height: 46px;
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
          }
        }
      }
    `,
  ],
})
export class OwnerDashboardComponent implements OnInit {
  private dashboardService = inject(OwnerDashboardService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  loading = signal<boolean>(true);
  data = signal<OwnerDashboardData | null>(null);

  ngOnInit(): void {
    this.title.setTitle('Company Dashboard | FixFlow');
    this.headerService.setHeader({ title: 'Dashboard', showBack: false });

    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
