import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NotificationService } from '../../services/notification.service';
import { HeaderService } from '../../../core/services/header.service';
import { AppNotification } from '../../models/customer.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-customer-notifications',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="notifications-page">
      <div class="notif-page-header">
        <div>
          <h1 class="page-title">Notifications</h1>
          <p class="page-sub">Updates on your maintenance requests, technician status, and invoices</p>
        </div>
        @if (unreadCount > 0) {
          <button type="button" class="btn btn-secondary btn-sm" (click)="onMarkAllRead()" [disabled]="pending">
            <app-icon name="check" size="sm"></app-icon>
            <span>Mark all as read</span>
          </button>
        }
      </div>

      <!-- Notifications List (Screen 23 in PDF) -->
      <div class="notifications-list">
        @if (failure || notificationService.failure()) { <p role="alert">{{ failure || notificationService.failure() }}</p> }
        @for (item of notificationService.notifications(); track item.id) {
          <div
            class="notif-card card"
            [class.unread]="!item.read"
            (click)="onNotificationClick(item)"
          >
            <div class="notif-icon-box" [class]="item.type">
              @switch (item.type) {
                @case ('accepted') { <app-icon name="check" size="sm"></app-icon> }
                @case ('invoice_ready') { <app-icon name="file-text" size="sm"></app-icon> }
                @case ('payment_received') { <app-icon name="dollar" size="sm"></app-icon> }
                @case ('technician_declined') { <app-icon name="alert-circle" size="sm"></app-icon> }
                @default { <app-icon name="bell" size="sm"></app-icon> }
              }
            </div>

            <div class="notif-content">
              <div class="notif-top">
                <h3 class="notif-title">{{ item.title }}</h3>
                <span class="notif-time">{{ item.createdAt }}</span>
              </div>
              <p class="notif-message">{{ item.message }}</p>
            </div>

            @if (!item.read) {
              <span class="unread-dot"></span>
            }
          </div>
        }

        @if (notificationService.notifications().length === 0) {
          <div class="card empty-notifs">
            <app-icon name="bell" size="lg"></app-icon>
            <h3>No notifications yet</h3>
            <p>You're all caught up with your service updates and alerts.</p>
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

          &.invoice_ready {
            background-color: #fef3c7;
            color: #d97706;
          }

          &.payment_received {
            background-color: #dcfce7;
            color: #16a34a;
          }

          &.technician_declined {
            background-color: #fee2e2;
            color: #dc2626;
          }
        }

        .notif-content {
          flex: 1;
          min-width: 0;

          .notif-top {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 4px;

            .notif-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .notif-time {
              font-size: 0.75rem;
              color: var(--color-text-muted);
              white-space: nowrap;
            }
          }

          .notif-message {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            line-height: 1.4;
            margin: 0;
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

      .empty-notifs {
        padding: 48px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--color-text-muted);

        h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        p {
          font-size: 0.85rem;
          margin: 0;
        }
      }
    }
  `]
})
export class CustomerNotificationsComponent implements OnInit {
  notificationService = inject(NotificationService);
  private headerService = inject(HeaderService);
  private router = inject(Router);
  private title = inject(Title);

  pending = false;
  failure = "";

  get unreadCount(): number {
    return this.notificationService.notifications().filter(n => !n.read).length;
  }

  ngOnInit(): void {
    this.title.setTitle('Notifications | FixFlow Customer');
    this.headerService.setHeader({ title: 'Notifications', showBack: false });
  }

  onMarkAllRead(): void {
    if (this.pending) return;
    this.pending = true;
    this.notificationService.markAllAsRead().subscribe({
      error: (error: unknown) => { this.failure = errorMessage(error, "Could not mark notifications as read."); this.pending = false; },
      complete: () => { this.pending = false; },
    });
  }

  onNotificationClick(item: AppNotification): void {
    if (!item.read) {
      this.notificationService.markAsRead(item.id).subscribe({
        error: (error: unknown) => { this.failure = errorMessage(error, "Could not mark the notification as read."); },
      });
    }
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
  }
}
