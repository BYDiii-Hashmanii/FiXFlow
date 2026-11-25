import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-invoice-sent',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if (job) {
      <div class="result-page-container">
        <div class="result-card card">
          <div class="status-circle success">
            <app-icon name="check" size="lg"></app-icon>
          </div>

          <h1 class="result-title">Invoice Sent!</h1>
          <p class="result-desc">
            Invoice <strong>{{ job.invoiceNumber }}</strong> for <strong>Rs {{ job.totalCost | number }}</strong>
            has been delivered to <strong>{{ job.customer.name }}</strong>.
          </p>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Customer</span>
              <span class="info-val font-semibold">{{ job.customer.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Access Time</span>
              <span class="info-val">{{ job.accessTime }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Due</span>
              <span class="info-val price">Rs {{ job.totalCost | number }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="chip chip-orange" role="status">{{ job.paymentStatus === 'paid' ? 'Paid' : 'Awaiting payment' }}</span>
            </div>
          </div>

          <div class="actions-group">
            <button type="button" class="btn btn-primary btn-block btn-payment-status" (click)="refreshPaymentStatus()">
              Refresh payment status
            </button>
            <a routerLink="/technician/dashboard" class="btn btn-secondary btn-block">
              Back to Dashboard
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
        width: 72px;
        height: 72px;
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
        margin-bottom: 8px;
      }

      .result-desc {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        margin-bottom: 24px;
      }

      .info-box {
        width: 100%;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 16px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;

          .info-label {
            color: var(--color-text-muted);
          }

          .info-val {
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

      .actions-group {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .btn-payment-status {
          height: 48px;
          font-size: 0.95rem;
        }
      }
    }
  `]
})
export class InvoiceSentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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

    this.title.setTitle('Invoice Sent | FixFlow');
    this.headerService.setHeader({
      title: 'Invoice Sent',
      showBack: false,
      showBell: true
    });
  }

  refreshPaymentStatus(): void {
    if (!this.job) return;
    this.dataService.read(this.dataService.getJobById(this.job.id), job => {
      this.job = job;
      this.changeDetector.markForCheck();
      if (job.status === 'closed') void this.router.navigate(['/technician/jobs', job.id, 'closed']);
    });
  }
}
