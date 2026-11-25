import { ProtectedPhotoComponent } from '../../../shared/components/protected-photo.component';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { JobRequest } from '../../../core/models/request.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-incoming-request',
  standalone: true,
  imports: [ProtectedPhotoComponent, CommonModule, RouterLink, IconComponent],
  template: `
    @if (request) {
      <div class="incoming-request-page">
        <!-- Desktop Breadcrumb / Back button -->
        <div class="page-top-nav">
          <a routerLink="/technician/dashboard" class="back-link">
            <app-icon name="arrow-left" size="sm"></app-icon>
            <span>Back to Dashboard</span>
          </a>
          <span class="request-id-badge">ID: #{{ request.id }}</span>
        </div>

        <div class="request-layout">
          <!-- Left Column: Photo & Customer Information -->
          <div class="col-left">
            @if (request.photoUrl) {
              <div class="photo-card card"><app-protected-photo [path]="request.photoUrl" label="Customer report photo"></app-protected-photo></div>
            }

            <!-- Customer & Location Card -->
            <div class="customer-card card">
              <h3 class="card-subtitle">Customer & Location</h3>
              <div class="customer-profile">
                <div class="cust-avatar">{{ request.customer.avatarInitials }}</div>
                <div class="cust-details">
                  <h4 class="cust-name">{{ request.customer.name }}</h4>
                  <p class="cust-phone">{{ request.customer.phone }}</p>
                </div>
              </div>
              <div class="location-box">
                <div class="loc-item">
                  <app-icon name="map-pin" size="sm"></app-icon>
                  <div>
                    <span class="loc-address">{{ request.customer.address }}</span>
                    <span class="loc-dist">({{ request.customer.distance }})</span>
                  </div>
                </div>
                <div class="loc-item">
                  <app-icon name="clock" size="sm"></app-icon>
                  <div>
                    <span class="loc-time">Access window: <strong>{{ request.accessTime }}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Details & Actions -->
          <div class="col-right">
            <div class="details-card card">
              <div class="details-header">
                <div>
                  <h1 class="job-title">{{ request.title }}</h1>
                  <div class="badge-row">
                    <span class="chip chip-blue">{{ request.category }}</span>
                    <span class="chip chip-orange">{{ request.urgency }}</span>
                  </div>
                </div>
                <div class="payout-badge">
                  <span class="payout-label">Estimated Payout</span>
                  <span class="payout-val">Rs {{ request.estimatedPay | number }}</span>
                </div>
              </div>

              <div class="description-section">
                <h4 class="section-label">Problem description</h4>
                <p class="description-text">{{ request.description }}</p>
              </div>

              <div class="specs-grid">
                <div class="spec-box">
                  <span class="spec-label">Service Category</span>
                  <span class="spec-value">{{ request.category }}</span>
                </div>
                <div class="spec-box">
                  <span class="spec-label">Preferred Time</span>
                  <span class="spec-value">{{ request.accessTime }}</span>
                </div>
                <div class="spec-box">
                  <span class="spec-label">Service Fee</span>
                  <span class="spec-value">Rs {{ request.estimatedPay | number }} / visit</span>
                </div>
                <div class="spec-box">
                  <span class="spec-label">Parts Extra</span>
                  <span class="spec-value">Approved via invoice</span>
                </div>
              </div>

              <div class="actions-container">
                <a [routerLink]="['/technician/requests', request.id, 'decline']" class="btn btn-secondary btn-decline">
                  Decline
                </a>
                <button type="button" class="btn btn-primary btn-accept" (click)="onAccept()" [disabled]="dataService.pending() || request.status !== 'pending'">
                  Accept Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="not-found-card card">
        <app-icon name="alert-circle" size="lg"></app-icon>
        <h2>Request Not Found</h2>
        <p>This request may have expired or already been assigned to another technician.</p>
        <a routerLink="/technician/dashboard" class="btn btn-primary">Return to Dashboard</a>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .incoming-request-page {
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

      .request-id-badge {
        font-size: 0.825rem;
        font-weight: 600;
        color: var(--color-text-muted);
        background-color: #e2e8f0;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
      }
    }

    .request-layout {
      display: flex;
      flex-direction: column;
      gap: 16px;

      @include desktop {
        display: grid;
        grid-template-columns: 1fr 1.25fr;
        gap: 24px;
        align-items: start;
      }
    }

    .col-left, .col-right {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Photo Card */
    .photo-card {
      padding: 0;
      overflow: hidden;

      .photo-placeholder {
        width: 100%;
        height: 220px;
        background-color: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;

        @include desktop {
          height: 260px;
        }

        .photo-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;

          .mock-img-svg {
            width: 90px;
            height: 90px;
          }

          .photo-label {
            font-size: 0.85rem;
            color: var(--color-text-muted);
            font-weight: 500;
          }
        }
      }
    }

    /* Customer Card */
    .customer-card {
      .card-subtitle {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        margin-bottom: 12px;
      }

      .customer-profile {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;

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

        .cust-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .cust-phone {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
      }

      .location-box {
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .loc-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);

          .loc-dist {
            margin-left: 4px;
            color: var(--color-text-muted);
          }
        }
      }
    }

    /* Details Card */
    .details-card {
      .details-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border-subtle);

        .job-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 8px;
        }

        .badge-row {
          display: flex;
          gap: 8px;
        }

        .payout-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;

          .payout-label {
            font-size: 0.75rem;
            color: var(--color-text-muted);
          }

          .payout-val {
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--color-primary);
          }
        }
      }

      .description-section {
        margin-bottom: 20px;

        .section-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
        }

        .description-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--color-text-primary);
        }
      }

      .specs-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 28px;
        background-color: #f8fafc;
        border-radius: var(--radius-md);
        padding: 14px;
        border: 1px solid var(--color-border);

        .spec-box {
          display: flex;
          flex-direction: column;

          .spec-label {
            font-size: 0.775rem;
            color: var(--color-text-muted);
          }

          .spec-value {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--color-text-primary);
          }
        }
      }

      .actions-container {
        display: flex;
        gap: 12px;

        @include mobile {
          position: fixed;
          bottom: calc(#{$mobile-nav-height} + env(safe-area-inset-bottom, 0px));
          left: 0;
          right: 0;
          padding: 12px 16px;
          background-color: #ffffff;
          border-top: 1px solid var(--color-border);
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
          z-index: 30;
        }

        .btn-decline {
          flex: 1;
        }

        .btn-accept {
          flex: 2;
        }
      }
    }

    .not-found-card {
      text-align: center;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
  `]
})
export class IncomingRequestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  request?: JobRequest;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.dataService.read(this.dataService.getRequestById(id), request => { this.request = request; });

    this.title.setTitle(`Incoming Request: ${this.request?.title || 'Job'} | FixFlow`);
    this.headerService.setHeader({
      title: 'Incoming Request',
      showBack: true,
      backUrl: '/technician/dashboard',
      showBell: false
    });
  }

  onAccept(): void {
    if (this.request) {
      const request = this.request;
      this.dataService.run(() => this.dataService.acceptRequest(request), () => {
        void this.router.navigate(['/technician/requests', request.id, 'accepted']);
      });
    }
  }
}
