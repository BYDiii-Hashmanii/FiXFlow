import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { JobRequest } from '../../../core/models/request.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-request-accepted',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="result-page-container">
      <div class="result-card card">
        <div class="status-circle success">
          <app-icon name="check" size="lg"></app-icon>
        </div>

        <h1 class="result-title">Request accepted</h1>

        <!-- Customer & Service Card (matches Screen 15 in PDF) -->
        <div class="summary-card">
          <div class="user-row">
            <div class="user-avatar">{{ request?.customer?.avatarInitials || '' }}</div>
            <div class="user-info">
              <h4 class="user-name">{{ request?.customer?.name || 'N/A' }}</h4>
              <p class="user-company">{{ dataService.technician()?.company }}</p>
              <div class="rating-stars">
                <app-icon name="star" size="sm"></app-icon>
                <span>{{ dataService.technician()?.rating }} ({{ dataService.technician()?.totalReviews }} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Details Table -->
        <div class="details-table">
          <h3 class="table-heading">Job details</h3>
          <div class="detail-row">
            <span class="detail-label">Job</span>
            <span class="detail-val font-semibold">{{ request?.title || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Category</span>
            <span class="detail-val">{{ request?.category || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Access time</span>
            <span class="detail-val font-semibold">{{ request?.accessTime || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Price</span>
            <span class="detail-val font-semibold">{{ request ? ('Rs ' + (request.estimatedPay | number) + ' / visit') : 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-val">
              <span class="chip chip-green">Accepted</span>
            </span>
          </div>
        </div>

        <div class="action-buttons">
          <a [routerLink]="['/technician/jobs', jobId]" class="btn btn-primary btn-block">
            Track Job
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .result-page-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(85vh - #{$topbar-height});
      padding: 16px;
    }

    .result-card {
      width: 100%;
      max-width: 480px;
      padding: 36px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      @include mobile {
        padding: 24px 16px;
      }

      .status-circle {
        width: 76px;
        height: 76px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;

        &.success {
          background-color: #dcfce7;
          color: #16a34a;
        }
      }

      .result-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 24px;
      }

      .summary-card {
        width: 100%;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 16px;
        margin-bottom: 20px;
        text-align: left;

        .user-row {
          display: flex;
          align-items: center;
          gap: 14px;

          .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-full);
            background-color: #dbeafe;
            color: #1e40af;
            font-weight: 700;
            font-size: 1.05rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .user-info {
            .user-name {
              font-size: 1.05rem;
              font-weight: 700;
              color: var(--color-text-primary);
            }

            .user-company {
              font-size: 0.85rem;
              color: var(--color-text-muted);
            }

            .rating-stars {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #f59e0b;
              font-size: 0.8rem;
              margin-top: 2px;

              span {
                color: var(--color-text-secondary);
              }
            }
          }
        }
      }

      .details-table {
        width: 100%;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 18px;
        margin-bottom: 28px;
        text-align: left;

        .table-heading {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-border-subtle);

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .detail-label {
            font-size: 0.875rem;
            color: var(--color-text-muted);
          }

          .detail-val {
            font-size: 0.925rem;
            color: var(--color-text-primary);

            &.font-semibold {
              font-weight: 600;
            }
          }
        }
      }

      .action-buttons {
        width: 100%;
      }
    }
  `]
})
export class RequestAcceptedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  dataService = inject(DataService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  jobId = '';
  request?: JobRequest;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.jobId = id;
    this.dataService.read(this.dataService.getRequestById(id), request => {
      this.request = request;
      this.changeDetector.markForCheck();
    });

    this.title.setTitle('Request Accepted | FixFlow');
    this.headerService.setHeader({
      title: 'Request Accepted',
      showBack: false,
      showBell: true
    });
  }
}
