import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OwnerNotificationService } from '../../services/owner-notification.service';
import { OwnerNotification } from '../../models/owner.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-notifications',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifications</h1>
          <p class="page-subtitle">Alerts and activity updates across your service operations</p>
        </div>

        @if (unreadCount() > 0) {
          <button (click)="markAllAsRead()" class="mark-all-btn">Mark all as read</button>
        }
      </div>

      <div class="notifications-list">
        @for (item of notifications(); track item) {
          <div
            class="notif-card card"
            [class.unread]="!item.read"
            (click)="handleNotificationClick(item)"
          >
            <div class="notif-icon-wrap" [ngClass]="getIconClass(item.type)">
              <app-icon [name]="getIconName(item.type)" size="sm"></app-icon>
            </div>
            <div class="notif-content">
              <div class="title-row">
                <h3 class="notif-title">{{ item.title }}</h3>
                <span class="notif-time">{{ item.createdAt }}</span>
              </div>
              <p class="notif-message">{{ item.message }}</p>
            </div>
            @if (!item.read) {
              <div class="unread-dot" aria-label="Unread notification"></div>
            }
          </div>
        }

        @if (notifications().length === 0) {
          <div class="empty-state card">
            <app-icon name="bell" size="lg" class="empty-bell"></app-icon>
            <p>No notifications yet.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .notifications-page {
        padding-bottom: 40px;
        max-width: 800px;
        margin: 0 auto;

        @include respond-to(desktop) {
          margin: 0;
        }
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;

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

        .mark-all-btn {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: var(--radius-sm);

          &:hover {
            background-color: #eff6ff;
          }
        }
      }

      .notifications-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .notif-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 16px 18px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        position: relative;
        transition:
          background-color var(--transition-fast),
          border-color var(--transition-fast);

        &:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        &.unread {
          border-left: 3px solid var(--color-primary);
          background-color: #f8fbff;
        }

        .notif-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.type-feedback {
            background-color: #fef3c7;
            color: #d97706;
          }

          &.type-invoice {
            background-color: #ecfdf5;
            color: #059669;
          }

          &.type-job {
            background-color: #eff6ff;
            color: #2563eb;
          }

          &.type-technician {
            background-color: #f5f3ff;
            color: #7c3aed;
          }

          &.type-availability {
            background-color: #f1f5f9;
            color: #475569;
          }
        }

        .notif-content {
          flex: 1;

          .title-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4px;

            .notif-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--color-text-primary);
              margin: 0;
            }

            .notif-time {
              font-size: 0.8rem;
              color: var(--color-text-secondary);
              white-space: nowrap;
            }
          }

          .notif-message {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
            margin: 0;
            line-height: 1.4;
          }
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 6px;
        }
      }

      .empty-state {
        padding: 40px;
        text-align: center;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);

        .empty-bell {
          margin-bottom: 12px;
          color: #94a3b8;
        }
      }
    `,
  ],
})
export class OwnerNotificationsComponent implements OnInit {
  private notifService = inject(OwnerNotificationService);
  private router = inject(Router);

  notifications = signal<OwnerNotification[]>([]);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notifService.list().subscribe({
      next: (data) => this.notifications.set(data),
    });
  }

  unreadCount(): number {
    return this.notifications().filter((n) => !n.read).length;
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe({
      next: () => this.loadNotifications(),
    });
  }

  handleNotificationClick(notif: OwnerNotification): void {
    if (!notif.read) {
      this.notifService.markAsRead(notif.id).subscribe();
    }
    if (notif.link) {
      this.router.navigateByUrl(notif.link);
    }
  }

  getIconName(type: string): string {
    switch (type) {
      case 'feedback':
        return 'star';
      case 'invoice':
        return 'file-text';
      case 'job':
        return 'briefcase';
      case 'technician':
        return 'user';
      case 'availability':
        return 'clock';
      default:
        return 'bell';
    }
  }

  getIconClass(type: string): string {
    return `type-${type}`;
  }
}
