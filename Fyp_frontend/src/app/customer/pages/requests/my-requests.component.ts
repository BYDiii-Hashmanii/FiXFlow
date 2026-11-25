import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RequestService } from '../../services/request.service';
import { HeaderService } from '../../../core/services/header.service';
import { ServiceRequest } from '../../models/customer.models';
import { RequestCardComponent } from '../../components/request-card/request-card.component';


@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, RequestCardComponent],
  template: `
    <div class="my-requests-page">
      <div class="requests-header-row">
        <div>
          <h1 class="page-title">My Requests</h1>
          <p class="page-sub">Track your active maintenance jobs and history</p>
        </div>

        <!-- Segmented Tab Bar (Matches Screen 21 in PDF) -->
        <div class="tabs-segment" role="tablist">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'all'"
            (click)="setTab('all')"
          >
            All
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'active'"
            (click)="setTab('active')"
          >
            Active
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab === 'completed'"
            (click)="setTab('completed')"
          >
            Completed
          </button>
        </div>
      </div>

      <!-- Desktop Table View (>= 1024px) -->
      <div class="desktop-table-card card">
        <table class="requests-table">
          <thead>
            <tr>
              <th>Problem & Category</th>
              <th>Technician</th>
              <th>Access Time</th>
              <th>Estimated Cost</th>
              <th>Status</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (req of requests; track req.id) {
              <tr>
                <td>
                  <div class="job-meta">
                    <span class="job-title">{{ req.description || req.category }}</span>
                    <span class="job-cat">{{ req.category }} · #{{ req.id }}</span>
                  </div>
                </td>
                <td>
                  <span class="tech-name">{{ req.assignedTechnician?.name || 'Unassigned' }}</span>
                </td>
                <td>
                  <span class="time-lbl">{{ req.accessTime }}</span>
                </td>
                <td>
                  <span class="price-val">{{ (req.estimatedPrice === null || req.estimatedPrice === undefined) ? 'N/A' : ('Rs ' + (req.estimatedPrice | number)) }}</span>
                </td>
                <td>
                  <span
                    class="chip"
                    [class.chip-green]="req.status === 'closed_paid' || req.status === 'completed'"
                    [class.chip-orange]="req.status === 'waiting' || req.status === 'in_progress'"
                  >
                    {{ req.status === 'ai_analysis' ? 'Ready to book' : (req.status.replaceAll('_', ' ') | titlecase) }}
                  </span>
                </td>
                <td class="text-right">
                  <a [routerLink]="['/customer/requests', req.id]" class="btn btn-secondary btn-sm">
                    View
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile List View (< 1024px, matches Screen 21 in PDF) -->
      <div class="mobile-requests-list">
        @for (req of requests; track req.id) {
          <app-request-card [request]="req"></app-request-card>
        }
        @if (requests.length === 0) {
          <div class="card empty-box">
            <p>No requests found in this section.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .my-requests-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 720px;
      margin: 0 auto;

      @include desktop {
        max-width: 1000px;
      }
    }

    .requests-header-row {
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
    }

    .tabs-segment {
      display: flex;
      background-color: #e2e8f0;
      padding: 4px;
      border-radius: var(--radius-full);
      gap: 4px;

      .tab-btn {
        flex: 1;
        padding: 8px 20px;
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

    /* Desktop Table */
    .desktop-table-card {
      display: none;
      padding: 0;
      overflow: hidden;

      @include desktop {
        display: block;
      }

      .requests-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;

        th {
          background-color: #f8fafc;
          padding: 14px 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--color-border);
        }

        td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border-subtle);
          font-size: 0.9rem;
        }

        tbody tr:hover {
          background-color: #f8fafc;
        }

        .job-meta {
          display: flex;
          flex-direction: column;

          .job-title {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .job-cat {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }

        .price-val {
          font-weight: 700;
          color: var(--color-primary);
        }
      }
    }

    /* Mobile List */
    .mobile-requests-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      @include desktop {
        display: none;
      }

      .empty-box {
        text-align: center;
        padding: 32px;
        color: var(--color-text-muted);
      }
    }
  `]
})
export class MyRequestsComponent implements OnInit {
  private requestService = inject(RequestService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  activeTab: 'all' | 'active' | 'completed' = 'all';
  requests: ServiceRequest[] = [];

  ngOnInit(): void {
    this.title.setTitle('My Requests | FixFlow');
    this.headerService.setHeader({
      title: 'My Requests',
      showBack: false,
      showBell: true
    });
    this.loadRequests();
  }

  setTab(tab: 'all' | 'active' | 'completed'): void {
    this.activeTab = tab;
    this.loadRequests();
  }

  private loadRequests(): void {
    this.requestService.list(this.activeTab).subscribe(data => {
      this.requests = data;
    });
  }
}
