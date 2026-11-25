import { Component, OnInit, signal, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { OwnerProfileService } from '../../services/owner-profile.service';
import { OwnerAuthService } from '../../services/owner-auth.service';
import { CompanyOwner } from '../../models/owner.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    @if (profile()) {
      <div class="profile-page">
        <div class="page-header">
          <h1 class="page-title">Profile</h1>
          <p class="page-subtitle">Manage company account settings and support preferences</p>
        </div>
        <!-- Owner Profile Summary Card -->
        <div class="profile-card card">
          <div class="avatar-large">
            {{ profile()!.avatarInitials }}
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ profile()!.fullName }}</h2>
            <span class="role-badge">Company Owner</span>
            <p class="company-name">{{ profile()!.company }}</p>
            <div class="contact-details">
              <span class="contact-item">
                <app-icon name="phone" size="xs"></app-icon>
                <span>{{ profile()!.phone }}</span>
              </span>
              <span class="contact-item">
                <app-icon name="mail" size="xs"></app-icon>
                <span>{{ profile()!.email }}</span>
              </span>
            </div>
          </div>
        </div>
        <!-- Menu Navigation Links -->
        <div class="menu-list card">
          <a routerLink="/owner/profile/personal-info" class="menu-item">
            <div class="menu-left">
              <div class="menu-icon-wrap">
                <app-icon name="user" size="sm"></app-icon>
              </div>
              <div class="menu-text">
                <span class="menu-title">Personal Information</span>
                <span class="menu-desc">Edit name, contact phone, and email address</span>
              </div>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>
          <a routerLink="/owner/profile/help-support" class="menu-item">
            <div class="menu-left">
              <div class="menu-icon-wrap">
                <app-icon name="help-circle" size="sm"></app-icon>
              </div>
              <div class="menu-text">
                <span class="menu-title">Help & Support</span>
                <span class="menu-desc">Helpline numbers, contact email, and FAQs</span>
              </div>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </a>
          <button (click)="openLogout()" class="menu-item logout-item">
            <div class="menu-left">
              <div class="menu-icon-wrap logout-icon-wrap">
                <app-icon name="log-out" size="sm"></app-icon>
              </div>
              <div class="menu-text">
                <span class="menu-title logout-text">Log Out</span>
                <span class="menu-desc">Sign out of your manager session</span>
              </div>
            </div>
            <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
          </button>
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Loading profile...</p>
      </div>
    }
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .profile-page {
        padding-bottom: 40px;
        max-width: 680px;
        margin: 0 auto;

        @include respond-to(desktop) {
          margin: 0;
        }
      }

      .page-header {
        margin-bottom: 24px;

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 4px;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin: 0;
        }
      }

      .profile-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 28px 24px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        margin-bottom: 24px;

        @include respond-to(tablet) {
          flex-direction: row;
          align-items: center;
          text-align: left;
          gap: 24px;
        }

        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background-color: #eff6ff;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.85rem;
          font-weight: 700;
          margin-bottom: 16px;
          flex-shrink: 0;

          @include respond-to(tablet) {
            margin-bottom: 0;
          }
        }

        .profile-info {
          display: flex;
          flex-direction: column;

          .profile-name {
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 0 0 4px;
          }

          .role-badge {
            display: inline-block;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--color-primary);
            background-color: #eff6ff;
            padding: 2px 10px;
            border-radius: var(--radius-full);
            margin-bottom: 6px;
            align-self: center;

            @include respond-to(tablet) {
              align-self: flex-start;
            }
          }

          .company-name {
            font-size: 0.95rem;
            color: var(--color-text-secondary);
            margin: 0 0 12px;
          }

          .contact-details {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 14px;

            @include respond-to(tablet) {
              justify-content: flex-start;
            }

            .contact-item {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-size: 0.85rem;
              color: var(--color-text-secondary);
            }
          }
        }
      }

      .menu-list {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        overflow: hidden;

        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          text-decoration: none;
          color: inherit;
          border-bottom: 1px solid #f1f5f9;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-left: none;
          border-right: none;
          border-top: none;
          transition: background-color var(--transition-fast);

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f8fafc;
          }

          .menu-left {
            display: flex;
            align-items: center;
            gap: 14px;

            .menu-icon-wrap {
              width: 40px;
              height: 40px;
              border-radius: var(--radius-full);
              background-color: #f1f5f9;
              color: var(--color-text-primary);
              display: flex;
              align-items: center;
              justify-content: center;

              &.logout-icon-wrap {
                background-color: #fef2f2;
                color: #dc2626;
              }
            }

            .menu-text {
              display: flex;
              flex-direction: column;

              .menu-title {
                font-weight: 600;
                font-size: 0.95rem;
                color: var(--color-text-primary);

                &.logout-text {
                  color: #dc2626;
                }
              }

              .menu-desc {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
              }
            }
          }

          .chevron {
            color: #94a3b8;
          }
        }
      }

      .loading-state {
        padding: 40px;
        text-align: center;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class OwnerProfileComponent implements OnInit {
  private profileService = inject(OwnerProfileService);
  private authService = inject(OwnerAuthService);

  profile = signal<CompanyOwner | null>(null);

  ngOnInit(): void {
    this.profileService.get().subscribe({
      next: (data) => this.profile.set(data),
    });
  }

  openLogout(): void {
    this.authService.showLogoutModal.set(true);
  }
}
