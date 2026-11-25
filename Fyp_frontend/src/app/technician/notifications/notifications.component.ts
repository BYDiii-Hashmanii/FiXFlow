import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../core/services/data.service';
import { HeaderService } from '../../core/services/header.service';
import { NotificationItem } from '../../core/models/technician.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="notifications-page">
      <div class="notif-page-header">
        <div>
          <h1 class="page-title">Notifications</h1>
          <p class="page-sub">System updates, job alerts, and payment confirmations</p>
        </div>
        @if (dataService.unreadNotificationsCount() > 0) {
          <button type="button" class="btn btn-secondary btn-sm" (click)="dataService.markNotificationsRead()" [disabled]="dataService.pending()">
            <app-icon name="check" size="sm"></app-icon>
            <span>Mark all as read</span>
          </button>
        }
      </div>

      <!-- Notifications List (matches Screen 23 in PDF) -->
      <div class="notifications-list">
        @for (item of dataService.notifications(); track item.id) {
          <div
            class="notif-card card"
            [class.unread]="item.unread"
            (click)="onNotificationClick(item)"
          >
            <div class="notif-icon-box" [class]="item.type">
              @switch (item.type) {
                @case ('request') { <app-icon name="check" size="sm"></app-icon> }
                @case ('invoice') { <app-icon name="file-text" size="sm"></app-icon> }
                @case ('payment') { <app-icon name="dollar" size="sm"></app-icon> }
                @case ('rating') { <app-icon name="star" size="sm"></app-icon> }
                @default { <app-icon name="alert-circle" size="sm"></app-icon> }
              }
            </div>

            <div class="notif-content">
              <div class="notif-top">
                <h3 class="notif-title">{{ item.title }}</h3>
                <span class="notif-time">{{ item.time }}</span>
              </div>
              <p class="notif-message">{{ item.message }}</p>
            </div>

            @if (item.unread) {
              <span class="unread-dot"></span>
            }
          </div>
        }

        @if (dataService.notifications().length === 0) {
          <div class="card empty-notifs">
            <app-icon name="bell" size="lg"></app-icon>
            <h3>No notifications yet</h3>
            <p>You're all caught up with your updates and job alerts.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .notifications-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 720px;
      margin: 0 auto;
      width: 100%;
    }

    .notif-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .page-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .page-sub {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }
    }

    /* Notification Cards (Matches Screen 23 in PDF) */
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .notif-card {
        padding: 16px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        cursor: pointer;
        position: relative;
        transition: transform var(--transition-fast), background-color var(--transition-fast);

        &:hover {
          background-color: #fafbfc;
        }

        &.unread {
          border-left: 3px solid var(--color-primary);
          background-color: #f8fafc;
        }

        .notif-icon-box {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #eff6ff;
          color: var(--color-primary);
          flex-shrink: 0;

          &.invoice {
            background-color: #fef3c7;
            color: #d97706;
          }

          &.payment {
            background-color: #dcfce7;
            color: #16a34a;
          }

          &.rating {
            background-color: #fce7f3;
            color: #db2777;
          }
        }

        .notif-content {
          flex: 1;

          .notif-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;

            .notif-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .notif-time {
              font-size: 0.775rem;
              color: var(--color-text-muted);
            }
          }

          .notif-message {
            font-size: 0.875rem;
            line-height: 1.45;
            color: var(--color-text-secondary);
          }
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: var(--color-primary);
          position: absolute;
          top: 18px;
          right: 16px;
        }
      }

      .empty-notifs {
        text-align: center;
        padding: 48px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--color-text-muted);
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Notifications | FixFlow Technician');
    this.headerService.setHeader({
      title: 'Notifications',
      showBack: false,
      showBell: false
    });
  }

  onNotificationClick(item: NotificationItem): void {
    if (item.unread) this.dataService.markNotificationRead(item.id);
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
  }
}
