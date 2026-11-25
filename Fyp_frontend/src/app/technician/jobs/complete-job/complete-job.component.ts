import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-complete-job',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if (job) {
      <div class="complete-job-page">
        <!-- Desktop Back Navigation -->
        <div class="page-top-nav">
          <a [routerLink]="['/technician/jobs', job.id, 'update']" class="back-link">
            <app-icon name="arrow-left" size="sm"></app-icon>
            <span>Back to Update Work</span>
          </a>
          <span class="job-id-pill">Job #{{ job.id }}</span>
        </div>

        <div class="complete-layout">
          <div class="complete-card card">
            <div class="card-header-icon success">
              <app-icon name="check" size="lg"></app-icon>
            </div>
            <h1 class="complete-title">Complete Job & Final Review</h1>
            <p class="complete-desc">
              Review all parts used, labour hours, and notes before finalizing this job and generating the customer invoice.
            </p>

            <!-- Job & Customer Overview -->
            <div class="summary-box">
              <div class="summary-header">
                <div>
                  <h3 class="job-heading">{{ job.title }}</h3>
                  <span class="customer-sub">{{ job.customer.name }} · {{ job.customer.address }}</span>
                </div>
                <span class="chip chip-orange">Pending Invoice</span>
              </div>

              <!-- Itemized Breakdown -->
              <div class="breakdown-table">
                <div class="table-section-title">Parts & Materials</div>
                @for (part of job.parts; track part.id) {
                  <div class="breakdown-row">
                    <span class="item-name">{{ part.name }} × {{ part.quantity }}</span>
                    <span class="item-price">Rs {{ part.total | number }}</span>
                  </div>
                }

                <div class="table-section-title mt-3">Labour</div>
                <div class="breakdown-row">
                  <span class="item-name">Service visit and repair ({{ job.labourHours }} hrs)</span>
                  <span class="item-price">Rs {{ job.labourCost | number }}</span>
                </div>

                <div class="breakdown-row total-row">
                  <span class="total-label">Total Job Amount</span>
                  <span class="total-value">Rs {{ job.totalCost | number }}</span>
                </div>
              </div>

              <!-- Notes -->
              @if (job.workNotes) {
                <div class="work-notes-preview">
                  <span class="notes-label">Work notes:</span>
                  <p class="notes-body">{{ job.workNotes }}</p>
                </div>
              }

              <!-- Photo Previews (Before & After) -->
              <div class="photos-preview-row">
                <div class="photo-thumbnail">
                  <div class="thumb-header">Before</div>
                  <div class="thumb-box">
                    <app-icon name="camera" size="sm"></app-icon>
                    <span>Inspected</span>
                  </div>
                </div>
                <div class="photo-thumbnail">
                  <div class="thumb-header">After</div>
                  <div class="thumb-box verified">
                    <app-icon name="check" size="sm"></app-icon>
                    <span>Repaired</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="complete-actions">
              <a [routerLink]="['/technician/jobs', job.id, 'update']" class="btn btn-secondary flex-1">
                Edit Details
              </a>
              <button type="button" class="btn btn-primary flex-2" [disabled]="dataService.pending()" (click)="onCompleteAndGenerateInvoice()">
                Complete Job & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .complete-job-page {
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

      .job-id-pill {
        font-size: 0.825rem;
        font-weight: 600;
        color: var(--color-text-muted);
        background-color: #e2e8f0;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
      }
    }

    .complete-layout {
      display: flex;
      justify-content: center;
    }

    .complete-card {
      width: 100%;
      max-width: 620px;
      padding: 32px 28px;
      text-align: center;

      @include mobile {
        padding: 20px 16px;
      }

      .card-header-icon {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-full);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        &.success {
          background-color: #dcfce7;
          color: #16a34a;
        }
      }

      .complete-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .complete-desc {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        margin-bottom: 24px;
      }

      .summary-box {
        text-align: left;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 20px;
        margin-bottom: 24px;

        .summary-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-border-subtle);
          margin-bottom: 14px;

          .job-heading {
            font-size: 1.15rem;
            font-weight: 700;
          }

          .customer-sub {
            font-size: 0.825rem;
            color: var(--color-text-muted);
          }
        }

        .breakdown-table {
          .table-section-title {
            font-size: 0.775rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--color-text-muted);
            margin-bottom: 8px;

            &.mt-3 {
              margin-top: 12px;
            }
          }

          .breakdown-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            padding: 4px 0;
            color: var(--color-text-secondary);

            .item-price {
              font-weight: 600;
              color: var(--color-text-primary);
            }

            &.total-row {
              margin-top: 14px;
              padding-top: 12px;
              border-top: 2px solid var(--color-border);
              font-size: 1.15rem;
              font-weight: 700;

              .total-label {
                color: var(--color-text-primary);
              }

              .total-value {
                color: var(--color-primary);
              }
            }
          }
        }

        .work-notes-preview {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--color-border-subtle);

          .notes-label {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--color-text-muted);
          }

          .notes-body {
            font-size: 0.875rem;
            color: var(--color-text-primary);
            margin-top: 2px;
          }
        }

        .photos-preview-row {
          display: flex;
          gap: 12px;
          margin-top: 16px;

          .photo-thumbnail {
            flex: 1;

            .thumb-header {
              font-size: 0.75rem;
              font-weight: 600;
              color: var(--color-text-muted);
              margin-bottom: 4px;
            }

            .thumb-box {
              height: 56px;
              background-color: #ffffff;
              border: 1px solid var(--color-border);
              border-radius: var(--radius-sm);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              font-size: 0.8rem;
              color: var(--color-text-secondary);

              &.verified {
                border-color: #bbf7d0;
                background-color: #f0fdf4;
                color: #16a34a;
              }
            }
          }
        }
      }

      .complete-actions {
        display: flex;
        gap: 12px;

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }
      }
    }
  `]
})
export class CompleteJobComponent implements OnInit {
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

    this.title.setTitle(`Complete Job #${id} | FixFlow`);
    this.headerService.setHeader({
      title: 'Complete Job',
      showBack: true,
      backUrl: `/technician/jobs/${id}/update`,
      showBell: true
    });
  }

  onCompleteAndGenerateInvoice(): void {
    if (this.job) {
      const id = this.job.id;
      this.dataService.run(() => this.dataService.completeJob(id), () => {
        void this.router.navigate(['/technician/jobs', id, 'invoice']);
      });
    }
  }
}
