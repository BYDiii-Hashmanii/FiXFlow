import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CustomerAuthService } from '../../services/customer-auth.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="profile-page">
      <div class="profile-container">
        <!-- Profile Header (Screen 25 in PDF) -->
        <div class="profile-header-card card">
          <div class="avatar-large">
            {{ authService.currentUser()?.avatarInitials }}
          </div>
          <h1 class="customer-name">{{ authService.currentUser()?.fullName }}</h1>
          <p class="customer-role">{{ authService.currentUser()?.phone }} · Customer</p>

          <div class="profile-stats-row">
            <div class="stat-item">
              <span class="stat-num">5</span>
              <span class="stat-lbl">Requests</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">1</span>
              <span class="stat-lbl">Active</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">4</span>
              <span class="stat-lbl">Completed</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu (Screen 25 in PDF) -->
        <div class="menu-list card">
          <a routerLink="/customer/profile/personal-info" class="menu-item">
            <div class="item-left">
              <div class="icon-wrap user">
                <app-icon name="user" size="sm"></app-icon>
              </div>
              <span class="item-label">Personal Information</span>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>

          <a routerLink="/customer/history" class="menu-item">
            <div class="item-left">
              <div class="icon-wrap history">
                <app-icon name="clock" size="sm"></app-icon>
              </div>
              <span class="item-label">Request History</span>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>

          <a routerLink="/customer/help" class="menu-item">
            <div class="item-left">
              <div class="icon-wrap help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <span class="item-label">Help & Support</span>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>

          <button type="button" class="menu-item logout-item" (click)="authService.openLogoutModal()">
            <div class="item-left">
              <div class="icon-wrap logout">
                <app-icon name="logout" size="sm"></app-icon>
              </div>
              <span class="item-label">Logout</span>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .profile-page {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .profile-container {
      width: 100%;
      max-width: 540px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .profile-header-card {
      padding: 32px 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .avatar-large {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-full);
        background-color: #dbeafe;
        color: var(--color-primary);
        font-weight: 800;
        font-size: 1.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
      }

      .customer-name {
        font-size: 1.45rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 4px;
      }

      .customer-role {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        margin-bottom: 20px;
      }

      .profile-stats-row {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 320px;
        background-color: #f8fafc;
        border-radius: var(--radius-md);
        padding: 12px 16px;

        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;

          .stat-num {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-text-primary);
          }

          .stat-lbl {
            font-size: 0.75rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
        }

        .stat-divider {
          width: 1px;
          height: 28px;
          background-color: #e2e8f0;
        }
      }
    }

    .menu-list {
      padding: 8px 0;
      overflow: hidden;

      .menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        color: var(--color-text-primary);
        text-decoration: none;
        background: transparent;
        border: none;
        width: 100%;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color var(--transition-fast);

        &:hover {
          background-color: #f8fafc;
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 14px;

          .icon-wrap {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;

            &.user {
              background-color: #eff6ff;
              color: var(--color-primary);
            }

            &.history {
              background-color: #f0fdf4;
              color: #16a34a;
            }

            &.help {
              background-color: #fef3c7;
              color: #d97706;
            }

            &.logout {
              background-color: #fee2e2;
              color: #dc2626;
            }
          }

          .item-label {
            font-size: 0.95rem;
          }
        }

        .chevron {
          color: #94a3b8;
        }

        &.logout-item {
          color: #dc2626;
          border-top: 1px solid #f1f5f9;
          margin-top: 4px;
        }
      }
    }
  `]
})
export class CustomerProfileComponent implements OnInit {
  authService = inject(CustomerAuthService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Profile | FixFlow Customer');
    this.headerService.setHeader({ title: 'Profile', showBack: false });
  }
}
