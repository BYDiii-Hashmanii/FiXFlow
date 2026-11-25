import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="role-selection-page">
      <div class="content-wrapper">
        <!-- Brand Header -->
        <header class="page-header">
          <div class="brand-badge">
            <app-icon name="wrench" size="lg"></app-icon>
          </div>
          <h1 class="brand-title">FixFlow</h1>
          <p class="brand-subtitle">Smart Maintenance Management</p>
          <div class="select-pill">Choose your portal to continue</div>
        </header>

        <!-- Role Selection Cards -->
        <div class="roles-grid">
          <!-- Customer Role Card -->
          <div class="role-card card">
            <div class="role-icon-wrap customer-icon">
              <app-icon name="user" size="lg"></app-icon>
            </div>
            <div class="role-body">
              <span class="role-tag">Customer</span>
              <h2 class="role-title">I Need a Repair</h2>
              <p class="role-desc">
                Report maintenance issues, get AI diagnosis, choose verified technicians, and track repairs.
              </p>
              <ul class="role-points">
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Upload photo & AI issue diagnosis</span>
                </li>
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Select top-rated verified technicians</span>
                </li>
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Track job status and pay invoices</span>
                </li>
              </ul>
            </div>
            <a routerLink="/login/customer" class="btn btn-customer">
              <span>Customer Portal</span>
              <app-icon name="chevron-right" size="sm"></app-icon>
            </a>
          </div>

          <!-- Technician Role Card -->
          <div class="role-card card">
            <div class="role-icon-wrap technician-icon">
              <app-icon name="wrench" size="lg"></app-icon>
            </div>
            <div class="role-body">
              <span class="role-tag">Technician</span>
              <h2 class="role-title">Service Specialist</h2>
              <p class="role-desc">
                Accept incoming requests, manage active jobs, log materials and labour, and issue customer invoices.
              </p>
              <ul class="role-points">
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Accept or decline repair requests</span>
                </li>
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Log parts, labor and job notes</span>
                </li>
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Issue instant itemized invoices</span>
                </li>
              </ul>
            </div>
            <a routerLink="/login/technician" class="btn btn-technician">
              <span>Technician Portal</span>
              <app-icon name="chevron-right" size="sm"></app-icon>
            </a>
          </div>

          <!-- Company Owner Role Card -->
          <div class="role-card card">
            <div class="role-icon-wrap owner-icon">
              <app-icon name="briefcase" size="lg"></app-icon>
            </div>
            <div class="role-body">
              <span class="role-tag">Company Owner</span>
              <h2 class="role-title">Operations Manager</h2>
              <p class="role-desc">
                Add and manage technicians, review company service records, inspect invoices, and track ratings.
              </p>
              <ul class="role-points">
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Manage technicians and availability</span>
                </li>
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Review all company jobs and invoices</span>
                </li>
                <li>
                  <app-icon name="check" size="xs"></app-icon>
                  <span>Monitor overall customer satisfaction</span>
                </li>
              </ul>
            </div>
            <a routerLink="/login/owner" class="btn btn-owner">
              <span>Owner Portal</span>
              <app-icon name="chevron-right" size="sm"></app-icon>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .role-selection-page {
      min-height: 100dvh;
      background-color: var(--color-background);
      padding: 32px 16px 48px;
      display: flex;
      justify-content: center;
      align-items: center;

      @include respond-to(tablet) {
        padding: 48px 24px;
      }
    }

    .content-wrapper {
      width: 100%;
      max-width: 1140px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 36px;

      .brand-badge {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-xl);
        background-color: #eff6ff;
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;
        border: 1px solid #bfdbfe;
      }

      .brand-title {
        font-size: 2rem;
        font-weight: 800;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
        margin: 0 0 6px;
      }

      .brand-subtitle {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 0 0 16px;
      }

      .select-pill {
        display: inline-block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-primary);
        background-color: #eff6ff;
        border: 1px solid #bfdbfe;
        padding: 4px 16px;
        border-radius: var(--radius-full);
      }
    }

    .roles-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;

      @include respond-to(desktop) {
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
    }

    .role-card {
      background-color: #ffffff;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);

      &:hover {
        transform: translateY(-2px);
        border-color: #cbd5e1;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
      }

      .role-icon-wrap {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;

        &.customer-icon {
          background-color: #eff6ff;
          color: #2563eb;
        }

        &.technician-icon {
          background-color: #ecfdf5;
          color: #059669;
        }

        &.owner-icon {
          background-color: #f5f3ff;
          color: #7c3aed;
        }
      }

      .role-body {
        flex: 1;

        .role-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          display: block;
          margin-bottom: 4px;
        }

        .role-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 10px;
        }

        .role-desc {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin: 0 0 20px;
        }

        .role-points {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;

          li {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.85rem;
            color: var(--color-text-primary);

            app-icon {
              color: var(--color-primary);
              flex-shrink: 0;
            }
          }
        }
      }

      .btn {
        width: 100%;
        min-height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        border-radius: var(--radius-md);
        text-decoration: none;
        transition: background-color var(--transition-fast);

        &.btn-customer {
          background-color: var(--color-primary);
          color: #ffffff;

          &:hover {
            background-color: var(--color-primary-dark);
          }
        }

        &.btn-technician {
          background-color: #059669;
          color: #ffffff;

          &:hover {
            background-color: #047857;
          }
        }

        &.btn-owner {
          background-color: #7c3aed;
          color: #ffffff;

          &:hover {
            background-color: #6d28d9;
          }
        }
      }
    }
  `]
})
export class RoleSelectionComponent implements OnInit {
  private router = inject(Router);
  private authState = inject(AuthStateService);

  ngOnInit(): void {
    if (this.authState.isLoggedIn()) {
      const role = this.authState.role();
      if (role) {
        this.router.navigate([this.authState.getHomeRoute(role)]);
      }
    }
  }
}
