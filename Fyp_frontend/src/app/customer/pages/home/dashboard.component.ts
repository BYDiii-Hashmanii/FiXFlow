import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CustomerAuthService } from '../../services/customer-auth.service';
import { RequestService } from '../../services/request.service';
import { HeaderService } from '../../../core/services/header.service';
import { ServiceRequest } from '../../models/customer.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { RequestCardComponent } from '../../components/request-card/request-card.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, RequestCardComponent],
  template: `
    <div class="dashboard-page">
      <!-- Greeting Card (Matches Screen 4 in PDF) -->
      <section class="user-greeting-card card">
        <div class="greeting-left">
          <div class="avatar-circle">
            {{ authService.currentUser()?.avatarInitials }}
          </div>
          <div class="greeting-text">
            <h1 class="user-name">Hello, {{ authService.currentUser()?.fullName }}</h1>
            <span class="user-role-badge">Customer</span>
          </div>
        </div>
      </section>

      <!-- What problem are you facing? Hero Card (Screen 4 in PDF) -->
      <section class="report-hero-card card">
        <div class="hero-icon-box">
          <app-icon name="wrench" size="md"></app-icon>
        </div>
        <h2 class="hero-title">What problem are you facing?</h2>
        <p class="hero-subtitle">Take a photo and let FixFlow analyze it.</p>
        <a routerLink="/customer/report" class="btn btn-primary btn-block btn-report">
          Report Problem
        </a>
      </section>

      <!-- Active request Section (Screen 4 in PDF) -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h3 class="section-heading">Active request</h3>
        </div>
        @if (activeRequest) {
          <app-request-card [request]="activeRequest"></app-request-card>
        }
      </section>

      <!-- Recent requests Section (Screen 4 in PDF) -->
      <section class="dashboard-section">
        <div class="section-title-row">
          <h3 class="section-heading">Recent requests</h3>
          <a routerLink="/customer/requests" class="view-all-link">View all</a>
        </div>
        <div class="recent-requests-list">
          @for (req of recentRequests; track req.id) {
            <app-request-card [request]="req"></app-request-card>
          }
        </div>
      </section>

      <!-- Bottom Navigation Buttons (Matches Screen 4 in PDF) -->
      <div class="dashboard-shortcut-buttons">
        <a routerLink="/customer/history" class="btn btn-secondary flex-1">
          History
        </a>
        <a routerLink="/customer/profile" class="btn btn-secondary flex-1">
          Profile
        </a>
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
      max-width: 720px;
      margin: 0 auto;

      @include desktop {
        max-width: 1000px;
      }
    }

    /* Greeting Card */
    .user-greeting-card {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .greeting-left {
        display: flex;
        align-items: center;
        gap: 14px;

        .avatar-circle {
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
        }

        .user-role-badge {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
      }
    }

    /* What problem are you facing? Hero Card (Screen 4) */
    .report-hero-card {
      padding: 32px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);

      .hero-icon-box {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        background-color: #eff6ff;
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .hero-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 6px;
      }

      .hero-subtitle {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        margin-bottom: 24px;
      }

      .btn-report {
        max-width: 320px;
        height: 48px;
        font-size: 1rem;
      }
    }

    /* Dashboard Sections */
    .dashboard-section {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .section-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .section-heading {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .view-all-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-primary);
        }
      }

      .recent-requests-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }

    /* Bottom shortcuts (Screen 4 in PDF) */
    .dashboard-shortcut-buttons {
      display: flex;
      gap: 14px;
      margin-top: 8px;

      .flex-1 { flex: 1; }
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  authService = inject(CustomerAuthService);
  requestService = inject(RequestService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  activeRequest?: ServiceRequest;
  recentRequests: ServiceRequest[] = [];

  ngOnInit(): void {
    this.title.setTitle('FixFlow | Customer Dashboard');
    this.headerService.setHeader({
      title: 'FixFlow',
      showBack: false,
      showBell: true
    });

    this.requestService.list('all').subscribe(reqs => {
      this.activeRequest = reqs.find(r => r.status === 'waiting' || r.status === 'in_progress');
      this.recentRequests = reqs.filter(r => r.status === 'closed_paid');
    });
  }
}
