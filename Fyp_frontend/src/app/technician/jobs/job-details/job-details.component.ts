import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if (job) {
      <div class="job-details-page">
        <!-- Breadcrumb / Back on desktop -->
        <div class="page-top-nav">
          <a routerLink="/technician/jobs" class="back-link">
            <app-icon name="arrow-left" size="sm"></app-icon>
            <span>Back to My Jobs</span>
          </a>
          <div class="header-badges">
            <span class="job-id-pill">Job #{{ job.id }}</span>
            <span
              class="chip"
              [class.chip-green]="job.status === 'completed' || job.status === 'closed' || job.status === 'accepted'"
              [class.chip-orange]="job.status === 'in_progress'"
            >
              {{ job.status === 'closed' ? 'Closed - Paid' : (job.status === 'in_progress' ? 'Work in progress' : (job.status === 'completed' ? 'Completed' : 'Accepted')) }}
            </span>
          </div>
        </div>

        <div class="job-details-grid">
          <!-- Left Column: Status card, Progress tracker, Customer info -->
          <div class="col-left">
            <!-- Job Header Card (matches Screen 16 Track Job in PDF) -->
            <div class="job-overview-card card">
              <div class="overview-header">
                <div>
                  <h1 class="job-title">{{ job.title }}</h1>
                  <span class="job-subtitle">Request #{{ job.requestId }}</span>
                </div>
                <span
                  class="chip"
                  [class.chip-green]="job.status === 'closed' || job.status === 'completed'"
                  [class.chip-orange]="job.status === 'in_progress' || job.status === 'accepted'"
                >
                  {{ job.status === 'closed' ? 'Closed' : (job.status === 'in_progress' ? 'Work in progress' : 'Accepted') }}
                </span>
              </div>

              <!-- Progress Steps (matches Screen 16 in PDF) -->
              <div class="progress-section">
                <h3 class="section-title">Progress</h3>
                <div class="progress-timeline">
                  @for (step of job.timeline; track step.title) {
                    <div class="timeline-item" [class.completed]="step.completed">
                      <div class="step-indicator">
                        @if (step.completed) {
                          <app-icon name="check" size="sm"></app-icon>
                        } @else {
                          <span class="step-dot"></span>
                        }
                      </div>
                      <div class="step-content">
                        <span class="step-title">{{ step.title }}</span>
                        @if (step.time) {
                          <span class="step-time"> · {{ step.time }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Customer Details (matches Screen 16) -->
              <div class="customer-card-box">
                <div class="cust-row">
                  <div class="cust-avatar">{{ job.customer.avatarInitials }}</div>
                  <div class="cust-info">
                    <h4 class="cust-name">{{ job.customer.name }}</h4>
                    <span class="cust-company">{{ dataService.technician()?.company }}</span>
                  </div>
                  <a [href]="'tel:' + job.customer.phone" class="phone-btn" title="Call customer">
                    <app-icon name="phone" size="sm"></app-icon>
                  </a>
                </div>
                <div class="cust-meta">
                  <div class="meta-item">
                    <app-icon name="map-pin" size="sm"></app-icon>
                    <span>{{ job.customer.address }} ({{ job.customer.distance }})</span>
                  </div>
                  <div class="meta-item">
                    <app-icon name="clock" size="sm"></app-icon>
                    <span>Access time: {{ job.accessTime }}</span>
                  </div>
                </div>
              </div>

              <!-- Info callout box (Screen 16) -->
              <div class="info-callout">
                <app-icon name="alert-circle" size="sm"></app-icon>
                <span>When the work is completed, your invoice will arrive here and in Notifications.</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Work summary, parts, actions -->
          <div class="col-right">
            <!-- Active Work Summary Card -->
            <div class="work-summary-card card">
              <h3 class="card-title">Work & Estimates</h3>

              <div class="work-status-banner">
                <div class="banner-item">
                  <span class="label">Current Status</span>
                  <span class="val font-semibold">{{ job.workStatusNote }}</span>
                </div>
                <div class="banner-item">
                  <span class="label">Expected Completion</span>
                  <span class="val">{{ job.expectedCompletion }}</span>
                </div>
              </div>

              <!-- Parts list preview -->
              <div class="parts-preview-box">
                <div class="parts-header">
                  <span class="label">Parts Used ({{ job.parts.length }})</span>
                  <span class="val">Rs {{ getPartsTotal() | number }}</span>
                </div>
                <div class="parts-items">
                  @for (part of job.parts; track part.id) {
                    <div class="part-row">
                      <span>{{ part.name }} × {{ part.quantity }}</span>
                      <span class="part-cost">Rs {{ part.total | number }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Labour & Total -->
              <div class="cost-summary-box">
                <div class="summary-line">
                  <span>Labour (Service visit & repair)</span>
                  <span>Rs {{ job.labourCost | number }}</span>
                </div>
                <div class="summary-line total-line">
                  <span>Total Amount</span>
                  <span class="total-price">Rs {{ job.totalCost | number }}</span>
                </div>
              </div>

              <!-- Action buttons based on status -->
              <div class="job-action-buttons">
                @if (job.status === 'accepted') {
                  <button type="button" class="btn btn-primary btn-block btn-start" [disabled]="dataService.pending()" (click)="onStartJob()">
                    Start Job
                  </button>
                } @else if (job.status === 'in_progress') {
                  <a [routerLink]="['/technician/jobs', job.id, 'update']" class="btn btn-primary btn-block">
                    Update Work & Parts
                  </a>
                  <a [routerLink]="['/technician/jobs', job.id, 'complete']" class="btn btn-secondary btn-block">
                    Complete Job
                  </a>
                } @else if (job.status === 'completed') {
                  <a [routerLink]="['/technician/jobs', job.id, 'invoice']" class="btn btn-primary btn-block">
                    Generate / View Invoice
                  </a>
                } @else if (job.status === 'closed') {
                  <a [routerLink]="['/technician/jobs', job.id, 'closed']" class="btn btn-primary btn-block">
                    View Payment Receipt
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="card not-found-box">
        <app-icon name="alert-circle" size="lg"></app-icon>
        <h2>Job Not Found</h2>
        <p>Could not find the requested job record.</p>
        <a routerLink="/technician/jobs" class="btn btn-primary">Back to My Jobs</a>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .job-details-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;

      @include mobile {
        display: none;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-text-secondary);

        &:hover {
          color: var(--color-primary);
          text-decoration: none;
        }
      }

      .header-badges {
        display: flex;
        align-items: center;
        gap: 10px;

        .job-id-pill {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--color-text-muted);
          background-color: #e2e8f0;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
        }
      }
    }

    .job-details-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;

      @include desktop {
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 24px;
        align-items: start;
      }
    }

    .col-left, .col-right {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Job Overview Card (matches Screen 16 in PDF) */
    .job-overview-card {
      .overview-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border-subtle);

        .job-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .job-subtitle {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
      }

      .progress-section {
        padding: 20px 0;
        border-bottom: 1px solid var(--color-border-subtle);

        .section-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 14px;
        }

        .progress-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          padding-left: 8px;

          &::before {
            content: '';
            position: absolute;
            left: 21px;
            top: 10px;
            bottom: 10px;
            width: 2px;
            background-color: #e2e8f0;
            z-index: 1;
          }

          .timeline-item {
            display: flex;
            align-items: center;
            gap: 16px;
            position: relative;
            z-index: 2;

            .step-indicator {
              width: 28px;
              height: 28px;
              border-radius: var(--radius-full);
              background-color: #ffffff;
              border: 2px solid #cbd5e1;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;

              .step-dot {
                width: 8px;
                height: 8px;
                border-radius: var(--radius-full);
                background-color: #cbd5e1;
              }
            }

            .step-content {
              font-size: 0.925rem;
              color: var(--color-text-secondary);

              .step-title {
                font-weight: 600;
              }

              .step-time {
                color: var(--color-text-muted);
                font-size: 0.825rem;
              }
            }

            &.completed {
              .step-indicator {
                background-color: #16a34a;
                border-color: #16a34a;
              }

              .step-content {
                color: var(--color-text-primary);
              }
            }
          }
        }
      }

      .customer-card-box {
        padding: 16px 0;
        border-bottom: 1px solid var(--color-border-subtle);

        .cust-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .cust-avatar {
            width: 44px;
            height: 44px;
            border-radius: var(--radius-full);
            background-color: #e0e7ff;
            color: #3730a3;
            font-weight: 700;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cust-info {
            flex: 1;

            .cust-name {
              font-size: 1rem;
              font-weight: 700;
            }

            .cust-company {
              font-size: 0.8rem;
              color: var(--color-text-muted);
            }
          }

          .phone-btn {
            width: 38px;
            height: 38px;
            border-radius: var(--radius-full);
            background-color: #eff6ff;
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color var(--transition-fast);

            &:hover {
              background-color: #dbeafe;
            }
          }
        }

        .cust-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background-color: #f8fafc;
          padding: 12px;
          border-radius: var(--radius-md);

          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: var(--color-text-secondary);
          }
        }
      }

      .info-callout {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        background-color: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: var(--radius-md);
        color: #1d4ed8;
        font-size: 0.825rem;
        margin-top: 16px;
      }
    }

    /* Right Column: Work & Estimates */
    .work-summary-card {
      .card-title {
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .work-status-banner {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        margin-bottom: 20px;

        .banner-item {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 0.775rem;
            color: var(--color-text-muted);
          }

          .val {
            font-size: 0.9rem;
            color: var(--color-text-primary);

            &.font-semibold {
              font-weight: 600;
              color: var(--color-primary);
            }
          }
        }
      }

      .parts-preview-box {
        margin-bottom: 20px;

        .parts-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }

        .parts-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background-color: #f8fafc;
          border-radius: var(--radius-md);
          padding: 10px 14px;

          .part-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: var(--color-text-primary);

            .part-cost {
              font-weight: 600;
            }
          }
        }
      }

      .cost-summary-box {
        border-top: 1px solid var(--color-border-subtle);
        padding-top: 14px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--color-text-secondary);

          &.total-line {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--color-text-primary);
            border-top: 1px solid var(--color-border-subtle);
            padding-top: 10px;
            margin-top: 4px;

            .total-price {
              color: var(--color-primary);
            }
          }
        }
      }

      .job-action-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .btn-start {
          height: 48px;
          font-size: 1rem;
        }
      }
    }

    .not-found-box {
      text-align: center;
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
  `]
})
export class JobDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  job?: Job;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.dataService.read(this.dataService.getJobById(id), job => { this.job = job; });

    this.title.setTitle(`Job #${id}: ${this.job?.title || 'Details'} | FixFlow`);
    this.headerService.setHeader({
      title: 'Track Job',
      showBack: true,
      backUrl: '/technician/jobs',
      showBell: true
    });
  }

  getPartsTotal(): number {
    return this.job ? this.job.parts.reduce((sum, p) => sum + p.total, 0) : 0;
  }

  onStartJob(): void {
    if (this.job) {
      const id = this.job.id;
      this.dataService.run(() => this.dataService.startJob(id), () => {
        void this.router.navigate(['/technician/jobs', id, 'update']);
      });
    }
  }
}
