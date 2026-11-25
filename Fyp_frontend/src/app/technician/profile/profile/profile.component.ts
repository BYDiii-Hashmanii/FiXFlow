import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="profile-page">
      <div class="profile-container">
        <!-- Profile Header (matches Screen 25 in PDF) -->
        <div class="profile-header-card card">
          <div class="avatar-large">
            {{ dataService.technician()?.initials }}
          </div>
          <h1 class="technician-name">{{ dataService.technician()?.name }}</h1>
          <p class="technician-role">{{ dataService.technician()?.company }} · Technician</p>

          <div class="profile-stats-row">
            <div class="stat-item">
              <span class="stat-num">{{ dataService.technician()?.rating }}</span>
              <span class="stat-lbl">Rating</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ dataService.completedJobs().length }}</span>
              <span class="stat-lbl">Jobs Done</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ dataService.technician()?.totalReviews }}</span>
              <span class="stat-lbl">Reviews</span>
            </div>
          </div>
        </div>

        <!-- Menu Navigation List (matches Screen 25 in PDF) -->
        <div class="menu-list card">
          <a routerLink="/technician/profile/personal-info" class="menu-item">
            <div class="item-left">
              <div class="icon-wrap user">
                <app-icon name="user" size="sm"></app-icon>
              </div>
              <span class="item-label">Personal Information</span>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>

          <a routerLink="/technician/ratings" class="menu-item">
            <div class="item-left">
              <div class="icon-wrap star">
                <app-icon name="star" size="sm"></app-icon>
              </div>
              <span class="item-label">Ratings & Feedback</span>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>

          <a routerLink="/technician/history" class="menu-item">
            <div class="item-left">
              <div class="icon-wrap history">
                <app-icon name="file-text" size="sm"></app-icon>
              </div>
              <span class="item-label">Job History</span>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>

          <a routerLink="/technician/help" class="menu-item">
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

    /* Profile Header (matches Screen 25 in PDF) */
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

      .technician-name {
        font-size: 1.45rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 4px;
      }

      .technician-role {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        margin-bottom: 20px;
      }

      .profile-stats-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding-top: 16px;
        border-top: 1px solid var(--color-border-subtle);

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .stat-num {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--color-text-primary);
          }

          .stat-lbl {
            font-size: 0.775rem;
            color: var(--color-text-muted);
          }
        }

        .stat-divider {
          width: 1px;
          height: 28px;
          background-color: var(--color-border);
        }
      }
    }

    /* Menu Navigation List (matches Screen 25 in PDF) */
    .menu-list {
      padding: 6px;
      display: flex;
      flex-direction: column;

      .menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        text-decoration: none;
        transition: background-color var(--transition-fast);
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        cursor: pointer;

        &:hover {
          background-color: #f8fafc;
        }

        &:active {
          background-color: #f1f5f9;
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
              color: #2563eb;
            }

            &.star {
              background-color: #fef3c7;
              color: #d97706;
            }

            &.history {
              background-color: #f1f5f9;
              color: #475569;
            }

            &.help {
              background-color: #f0fdf4;
              color: #16a34a;
            }

            &.logout {
              background-color: #fee2e2;
              color: #dc2626;
            }
          }

          .item-label {
            font-size: 0.95rem;
            font-weight: 500;
          }
        }

        .chevron {
          color: #94a3b8;
        }

        &.logout-item {
          .item-label {
            color: #dc2626;
            font-weight: 600;
          }
        }
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Profile | FixFlow Technician');
    this.headerService.setHeader({
      title: 'Profile',
      showBack: false,
      showBell: true
    });
  }
}
