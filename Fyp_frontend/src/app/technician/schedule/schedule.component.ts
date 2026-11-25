import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../core/services/data.service';
import { HeaderService } from '../../core/services/header.service';
import { ScheduleItem } from '../../core/models/technician.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="schedule-page">
      <!-- Page Header & Tab Segment -->
      <div class="schedule-header">
        <div>
          <h1 class="page-title">Schedule</h1>
          <p class="page-sub">Your daily appointment itinerary and upcoming service bookings</p>
        </div>

        <div class="segment-tabs" role="tablist">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'today'"
            (click)="setTab('today')"
            role="tab"
          >
            Today ({{ todaySchedule.length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'upcoming'"
            (click)="setTab('upcoming')"
            role="tab"
          >
            Upcoming ({{ upcomingSchedule.length }})
          </button>
        </div>
      </div>

      <!-- Schedule Timeline Feed -->
      <div class="schedule-timeline">
        @for (item of currentItems; track item.id) {
          <div class="schedule-item-card card">
            <div class="time-column">
              <span class="slot-time">{{ item.timeSlot }}</span>
              <span class="slot-date">{{ item.date }}</span>
            </div>

            <div class="divider-line"></div>

            <div class="info-column">
              <div class="info-top">
                <h3 class="item-title">{{ item.title }}</h3>
                <span
                  class="chip"
                  [class.chip-orange]="item.status === 'in_progress'"
                  [class.chip-blue]="item.status === 'scheduled'"
                  [class.chip-green]="item.status === 'completed'"
                >
                  {{ item.status === 'in_progress' ? 'In progress' : (item.status === 'completed' ? 'Completed' : 'Scheduled') }}
                </span>
              </div>

              <div class="customer-info-line">
                <span class="cust-name font-semibold">{{ item.customerName }}</span>
                <span class="separator">·</span>
                <div class="address-box">
                  <app-icon name="map-pin" size="sm"></app-icon>
                  <span>{{ item.address }}</span>
                </div>
              </div>

              <div class="item-actions">
                <a [routerLink]="['/technician/jobs', item.jobId]" class="btn btn-secondary btn-sm">
                  View Job Details
                </a>
                @if (item.status === 'in_progress') {
                  <a [routerLink]="['/technician/jobs', item.jobId, 'update']" class="btn btn-primary btn-sm">
                    Update Work
                  </a>
                }
              </div>
            </div>
          </div>
        }

        @if (currentItems.length === 0) {
          <div class="card empty-schedule">
            <app-icon name="calendar" size="lg"></app-icon>
            <h3>No visits scheduled</h3>
            <p>You have no appointments booked for this timeframe.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .schedule-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .schedule-header {
      display: flex;
      flex-direction: column;
      gap: 16px;

      @include tablet-up {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .page-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .page-sub {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }

      .segment-tabs {
        display: flex;
        background-color: #e2e8f0;
        padding: 4px;
        border-radius: var(--radius-full);
        gap: 4px;
        width: 100%;

        @include tablet-up {
          width: auto;
        }

        .tab-btn {
          flex: 1;
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          background-color: transparent;
          transition: all var(--transition-fast);
          white-space: nowrap;
          text-align: center;

          &.active {
            background-color: #ffffff;
            color: var(--color-primary);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          }
        }
      }
    }

    /* Schedule Timeline */
    .schedule-timeline {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .schedule-item-card {
        padding: 20px;
        display: flex;
        gap: 20px;

        @include mobile {
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }

        .time-column {
          display: flex;
          flex-direction: column;
          min-width: 150px;

          .slot-time {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--color-primary);
          }

          .slot-date {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }

        .divider-line {
          width: 1px;
          background-color: var(--color-border);

          @include mobile {
            display: none;
          }
        }

        .info-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;

          .info-top {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .item-title {
              font-size: 1.1rem;
              font-weight: 700;
              color: var(--color-text-primary);
            }
          }

          .customer-info-line {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.875rem;
            color: var(--color-text-secondary);
            flex-wrap: wrap;

            .cust-name {
              color: var(--color-text-primary);
            }

            .separator {
              color: var(--color-text-muted);
            }

            .address-box {
              display: flex;
              align-items: center;
              gap: 4px;
              color: var(--color-text-muted);
            }
          }

          .item-actions {
            display: flex;
            gap: 10px;
            margin-top: 8px;
          }
        }
      }

      .empty-schedule {
        text-align: center;
        padding: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--color-text-muted);
      }
    }
  `]
})
export class ScheduleComponent implements OnInit {
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  activeTab: 'today' | 'upcoming' = 'today';

  ngOnInit(): void {
    this.title.setTitle('Schedule | FixFlow Technician');
    this.headerService.setHeader({
      title: 'Schedule',
      showBack: false,
      showBell: true
    });
  }

  setTab(tab: 'today' | 'upcoming'): void {
    this.activeTab = tab;
  }

  get todaySchedule(): ScheduleItem[] {
    return this.dataService.schedule().filter(s => s.isToday);
  }

  get upcomingSchedule(): ScheduleItem[] {
    return this.dataService.schedule().filter(s => !s.isToday);
  }

  get currentItems(): ScheduleItem[] {
    return this.activeTab === 'today' ? this.todaySchedule : this.upcomingSchedule;
  }
}
