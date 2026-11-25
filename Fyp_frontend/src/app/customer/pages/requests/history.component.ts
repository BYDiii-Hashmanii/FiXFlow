import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RequestService } from '../../services/request.service';
import { HeaderService } from '../../../core/services/header.service';
import { ServiceRequest } from '../../models/customer.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-customer-history',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="history-page">
      <div class="history-container">
        <!-- History List (Matches Screen 24 in PDF) -->
        <div class="history-list">
          @for (item of historyItems; track item.id) {
            <a [routerLink]="['/customer/requests', item.id]" class="history-card card">
              <div class="card-left">
                <div class="icon-wrap">
                  <app-icon [name]="getCategoryIcon(item.category)" size="sm"></app-icon>
                </div>
                <div class="info-meta">
                  <h3 class="job-title">{{ item.description || item.category }}</h3>
                  <span class="job-sub">
                    {{ item.assignedTechnician?.company || 'Rayyan Repair Services' }} · Rs {{ item.estimatedPrice | number }}
                  </span>
                </div>
              </div>
              <span class="chip chip-green">Paid</span>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .history-page {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .history-container {
      width: 100%;
      max-width: 620px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .history-card {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        text-decoration: none;
        transition: transform var(--transition-fast), border-color var(--transition-fast);

        &:hover {
          border-color: #cbd5e1;
        }

        .card-left {
          display: flex;
          align-items: center;
          gap: 14px;

          .icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            background-color: #eff6ff;
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .info-meta {
            display: flex;
            flex-direction: column;

            .job-title {
              font-size: 0.975rem;
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .job-sub {
              font-size: 0.8rem;
              color: var(--color-text-muted);
            }
          }
        }
      }
    }
  `]
})
export class CustomerHistoryComponent implements OnInit {
  private requestService = inject(RequestService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  historyItems: ServiceRequest[] = [];

  ngOnInit(): void {
    this.title.setTitle('History | FixFlow');
    this.headerService.setHeader({
      title: 'History',
      showBack: true,
      backUrl: '/customer/profile',
      showBell: true
    });

    this.requestService.getHistory().subscribe(items => {
      this.historyItems = items;
    });
  }

  getCategoryIcon(cat?: string): string {
    switch (cat?.toLowerCase()) {
      case 'plumbing': return 'wrench';
      case 'electrical': return 'sparkles';
      case 'carpentry': return 'hammer';
      default: return 'wrench';
    }
  }
}
