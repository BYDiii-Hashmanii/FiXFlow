import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-job-closed',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if (job) {
      <div class="result-page-container">
        <!-- Receipt Card (matches Screen 19 Payment Receipt in PDF) -->
        <div class="result-card card">
          <div class="status-circle success">
            <app-icon name="check" size="lg"></app-icon>
          </div>

          <h1 class="result-title">Payment successful</h1>
          <p class="result-desc">Your job has been closed.</p>

          <!-- Receipt Details Table (Screen 19) -->
          <div class="receipt-table">
            <div class="receipt-row">
              <span class="label">Invoice number</span>
              <span class="value font-semibold">{{ job.invoiceNumber }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Job</span>
              <span class="value">{{ job.title }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Total paid</span>
              <span class="value price">Rs {{ job.totalCost | number }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Payment date</span>
              <span class="value">{{ job.invoiceDate }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Status</span>
              <span class="value">
                <span class="chip chip-green">Closed — Paid</span>
              </span>
            </div>
          </div>

          <!-- Action buttons (Screen 19) -->
          <div class="action-buttons">
            <a routerLink="/technician/history" class="btn btn-primary btn-block">
              View in Job History
            </a>
            <a routerLink="/technician/dashboard" class="btn btn-secondary btn-block">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .result-page-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(85vh - #{$topbar-height});
      padding: 16px;
    }

    .result-card {
      width: 100%;
      max-width: 480px;
      padding: 36px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      @include mobile {
        padding: 24px 16px;
      }

      .status-circle {
        width: 76px;
        height: 76px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;

        &.success {
          background-color: #dcfce7;
          color: #16a34a;
        }
      }

      .result-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 6px;
      }

      .result-desc {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        margin-bottom: 28px;
      }

      .receipt-table {
        width: 100%;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 18px;
        margin-bottom: 28px;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--color-border-subtle);

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .label {
            color: var(--color-text-muted);
          }

          .value {
            color: var(--color-text-primary);

            &.font-semibold {
              font-weight: 600;
            }

            &.price {
              font-size: 1.1rem;
              font-weight: 700;
              color: var(--color-primary);
            }
          }
        }
      }

      .action-buttons {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class JobClosedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  dataService = inject(DataService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  job?: Job;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.dataService.read(this.dataService.getJobById(id), job => {
      this.job = job;
      this.changeDetector.markForCheck();
    });

    this.title.setTitle('Job Closed | FixFlow');
    this.headerService.setHeader({
      title: 'Payment Receipt',
      showBack: true,
      backUrl: '/technician/dashboard',
      showBell: true
    });
  }
}
