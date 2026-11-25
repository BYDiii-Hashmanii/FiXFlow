import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../core/services/data.service';
import { HeaderService } from '../../core/services/header.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="dashboard-page">
      <!-- Greeting Banner (matches Screen 4 in PDF) -->
      <section class="greeting-card">
        <div class="greeting-user">
          <div class="user-avatar-circle">
            {{ dataService.technician()?.initials }}
          </div>
          <div class="user-info">
            <h1 class="user-name">Hello, {{ dataService.technician()?.name }}</h1>
            <p class="user-meta">{{ dataService.technician()?.company }} · Technician</p>
          </div>
        </div>
        <button
          type="button"
          class="status-pill-btn"
          [class.online]="dataService.technician()?.isAvailable"
          (click)="dataService.toggleAvailability()"
        >
          <span class="dot"></span>
          <span>{{ dataService.technician()?.isAvailable ? 'Available now' : 'Offline' }}</span>
        </button>
      </section>

      <!-- 4 Stat Cards (1 row on desktop, 2x2 or scroll on mobile) -->
      <section class="stats-grid" aria-label="Quick statistics">
        <div class="stat-card">
          <div class="stat-icon earnings">
            <app-icon name="dollar" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Today's Earnings</span>
            <span class="stat-value">Rs {{ dataService.technician()?.todayEarnings | number }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active-jobs">
            <app-icon name="briefcase" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Active Jobs</span>
            <span class="stat-value">{{ dataService.activeJobs().length }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending-requests">
            <app-icon name="clock" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Pending Requests</span>
            <span class="stat-value">{{ dataService.pendingRequests().length }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rating">
            <app-icon name="star" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Rating</span>
            <span class="stat-value">{{ dataService.technician()?.rating ?? 'N/A' }} <small>({{ dataService.technician()?.totalReviews }})</small></span>
          </div>
        </div>
      </section>

      <!-- Main Columns: Incoming Request & Recent Activity -->
      <div class="dashboard-columns">
        <!-- Incoming Request Column -->
        <div class="col-main">
          <div class="section-header">
            <h2 class="section-title">Incoming Request</h2>
            @if (dataService.pendingRequests().length > 0) {
              <span class="chip chip-orange">New Request</span>
            }
          </div>

          @if (dataService.pendingRequests().length > 0) {
            @for (req of dataService.pendingRequests(); track req.id) {
              <div class="request-hero-card">
                <div class="req-header">
                  <div class="req-title-group">
                    <span class="chip chip-blue">{{ req.category }}</span>
                    <span class="chip chip-orange">{{ req.urgency }}</span>
                  </div>
                  <span class="req-time">{{ req.createdAt }}</span>
                </div>

                <div class="req-body">
                  <h3 class="req-job-title">{{ req.title }}</h3>
                  <p class="req-desc">{{ req.description }}</p>

                  <div class="customer-preview-box">
                    <div class="customer-avatar">{{ req.customer.avatarInitials }}</div>
                    <div class="customer-info">
                      <div class="customer-name">{{ req.customer.name }}</div>
                      <div class="customer-distance">
                        <app-icon name="map-pin" size="sm"></app-icon>
                        <span>{{ req.customer.address }} ({{ req.customer.distance }})</span>
                      </div>
                    </div>
                  </div>

                  <div class="meta-row">
                    <div class="meta-item">
                      <span class="meta-label">Access Time</span>
                      <span class="meta-val">{{ req.accessTime }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Estimated Payout</span>
                      <span class="meta-val price">Rs {{ req.estimatedPay | number }}</span>
                    </div>
                  </div>
                </div>

                <div class="req-actions">
                  <a [routerLink]="['/technician/requests', req.id, 'decline']" class="btn btn-secondary flex-1">
                    Decline
                  </a>
                  <a [routerLink]="['/technician/requests', req.id]" class="btn btn-primary flex-2">
                    View Request
                  </a>
                </div>
              </div>
            }
          } @else {
            <div class="card empty-state">
              <app-icon name="check" size="lg"></app-icon>
              <h3>All caught up!</h3>
              <p>No pending job requests right now. Keep your status set to "Available now" to receive new jobs.</p>
            </div>
          }
        </div>

        <!-- Recent Jobs Column -->
        <div class="col-side">
          <div class="section-header">
            <h2 class="section-title">Recent Jobs</h2>
            <a routerLink="/technician/jobs" class="view-all-link">View all</a>
          </div>

          <div class="recent-jobs-list">
            @for (job of dataService.jobs().slice(0, 3); track job.id) {
              <div class="recent-job-card">
                <div class="job-card-header">
                  <div class="job-title-group">
                    <h4 class="job-card-title">{{ job.title }}</h4>
                    <span class="job-card-customer">{{ job.customer.name }} · {{ job.accessTime }}</span>
                  </div>
                  <span
                    class="chip"
                    [class.chip-green]="job.status === 'completed' || job.status === 'closed' || job.status === 'accepted'"
                    [class.chip-orange]="job.status === 'in_progress'"
                  >
                    {{ job.status === 'closed' ? 'Closed - Paid' : (job.status === 'in_progress' ? 'Work in progress' : 'Accepted') }}
                  </span>
                </div>

                <div class="job-card-footer">
                  <span class="job-card-price">Rs {{ job.totalCost | number }}</span>
                  <a [routerLink]="['/technician/jobs', job.id]" class="btn btn-secondary btn-sm">
                    Open Details
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Quick Navigation shortcuts -->
          <div class="quick-nav-card card">
            <h3 class="quick-title">Quick Actions</h3>
            <div class="quick-links-grid">
              <a routerLink="/technician/schedule" class="quick-btn">
                <app-icon name="calendar" size="md"></app-icon>
                <span>Today's Schedule</span>
              </a>
              <a routerLink="/technician/history" class="quick-btn">
                <app-icon name="file-text" size="md"></app-icon>
                <span>Job History</span>
              </a>
              <a routerLink="/technician/ratings" class="quick-btn">
                <app-icon name="star" size="md"></app-icon>
                <span>Ratings & Feedback</span>
              </a>
              <a routerLink="/technician/profile" class="quick-btn">
                <app-icon name="user" size="md"></app-icon>
                <span>My Profile</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Greeting Card (matches Screen 4 in PDF) */
    .greeting-card {
      background-color: #ffffff;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-card);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      @include mobile {
        flex-direction: column;
        align-items: flex-start;
      }

      .greeting-user {
        display: flex;
        align-items: center;
        gap: 14px;

        .user-avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background-color: #dbeafe;
          color: var(--color-primary);
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .user-meta {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
      }

      .status-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: var(--radius-full);
        background-color: #f1f5f9;
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
        font-size: 0.85rem;
        font-weight: 600;
        transition: all var(--transition-fast);

        .dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: #94a3b8;
        }

        &.online {
          background-color: #dcfce7;
          color: #15803d;
          border-color: #bbf7d0;

          .dot {
            background-color: #22c55e;
            box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
          }
        }
      }
    }

    /* 4 Stat Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      @include desktop {
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }

      .stat-card {
        background-color: #ffffff;
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-card);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 14px;

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;

          &.earnings {
            background-color: #dbeafe;
            color: #2563eb;
          }

          &.active-jobs {
            background-color: #dcfce7;
            color: #16a34a;
          }

          &.pending-requests {
            background-color: #fef3c7;
            color: #d97706;
          }

          &.rating {
            background-color: #fce7f3;
            color: #db2777;
          }
        }

        .stat-content {
          display: flex;
          flex-direction: column;

          .stat-label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            font-weight: 500;
          }

          .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-text-primary);

            small {
              font-size: 0.8rem;
              font-weight: 500;
              color: var(--color-text-muted);
            }
          }
        }
      }
    }

    /* Multi-Column Layout on Desktop */
    .dashboard-columns {
      display: flex;
      flex-direction: column;
      gap: 24px;

      @include desktop {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 24px;
      }
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .section-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .view-all-link {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-primary);
      }
    }

    /* Incoming Request Hero Card */
    .request-hero-card {
      background-color: #ffffff;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-card);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .req-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .req-title-group {
          display: flex;
          gap: 8px;
        }

        .req-time {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
      }

      .req-job-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 6px;
      }

      .req-desc {
        font-size: 0.925rem;
        color: var(--color-text-secondary);
        margin-bottom: 14px;
      }

      .customer-preview-box {
        display: flex;
        align-items: center;
        gap: 12px;
        background-color: #f8fafc;
        padding: 12px;
        border-radius: var(--radius-md);
        margin-bottom: 14px;

        .customer-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: #e2e8f0;
          color: #334155;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-name {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.925rem;
        }

        .customer-distance {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-top: 1px solid var(--color-border-subtle);
        border-bottom: 1px solid var(--color-border-subtle);

        .meta-item {
          display: flex;
          flex-direction: column;

          .meta-label {
            font-size: 0.775rem;
            color: var(--color-text-muted);
          }

          .meta-val {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text-primary);

            &.price {
              color: var(--color-primary);
              font-size: 1.05rem;
            }
          }
        }
      }

      .req-actions {
        display: flex;
        gap: 12px;
        margin-top: 4px;

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }
      }
    }

    .empty-state {
      padding: 36px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      h3 { font-size: 1.15rem; }
      p { font-size: 0.9rem; max-width: 320px; }
    }

    /* Recent Jobs List */
    .recent-jobs-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;

      .recent-job-card {
        background-color: #ffffff;
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-card);
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .job-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;

          .job-card-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-text-primary);
            margin-bottom: 2px;
          }

          .job-card-customer {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }

        .job-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid var(--color-border-subtle);

          .job-card-price {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--color-primary);
          }
        }
      }
    }

    /* Quick navigation shortcuts */
    .quick-nav-card {
      padding: 18px;

      .quick-title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .quick-links-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background-color: #f8fafc;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);

          &:hover {
            background-color: #eff6ff;
            border-color: #bfdbfe;
            color: var(--color-primary);
          }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dataService = inject(DataService);
  headerService = inject(HeaderService);
  title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('FixFlow | Technician Dashboard');
    this.headerService.setHeader({
      title: 'FixFlow',
      showBack: false,
      showBell: true
    });
  }
}
