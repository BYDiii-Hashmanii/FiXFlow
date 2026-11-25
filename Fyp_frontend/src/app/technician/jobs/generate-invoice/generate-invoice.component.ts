import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-generate-invoice',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if (job) {
      <div class="invoice-page">
        <!-- Desktop Back Navigation -->
        <div class="page-top-nav">
          <a [routerLink]="['/technician/jobs', job.id]" class="back-link">
            <app-icon name="arrow-left" size="sm"></app-icon>
            <span>Back to Job</span>
          </a>
          <span class="chip chip-orange">Draft Invoice</span>
        </div>

        <div class="invoice-container">
          <!-- Draft Invoice Card (matches Screen 17 in PDF) -->
          <div class="invoice-card card">
            <!-- Header (Screen 17) -->
            <div class="inv-header">
              <div>
                <span class="inv-number">{{ job.invoiceNumber }}</span>
                <h1 class="inv-title">{{ job.title }}</h1>
                <p class="inv-technician">{{ dataService.technician()?.name }} · {{ dataService.technician()?.company }}</p>
              </div>
              <span class="chip chip-orange">Unpaid</span>
            </div>

            <!-- Parts used (Screen 17) -->
            <div class="inv-section">
              <h3 class="section-title">Parts used</h3>
              <div class="inv-items-list">
                @for (part of job.parts; track part.id) {
                  <div class="inv-line">
                    <span class="name">{{ part.name }} × {{ part.quantity }}</span>
                    <span class="amount">Rs {{ part.total | number }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Labour (Screen 17) -->
            <div class="inv-section">
              <h3 class="section-title">Labour</h3>
              <div class="inv-line">
                <span class="name">Service visit and repair</span>
                <span class="amount">Rs {{ job.labourCost | number }}</span>
              </div>
            </div>

            <!-- Work notes (Screen 17) -->
            <div class="inv-section">
              <h3 class="section-title">Work notes</h3>
              <p class="notes-text">{{ job.workNotes || 'Standard maintenance and diagnostics completed.' }}</p>

              <!-- Before & After badges (Screen 17) -->
              <div class="photos-row">
                <div class="photo-btn">Before</div>
                <div class="photo-btn">After</div>
              </div>
            </div>

            <!-- Total Cost Summary (Screen 17) -->
            <div class="inv-summary">
              <div class="summary-row total-highlight">
                <span class="label">Total cost</span>
                <span class="val">Rs {{ job.totalCost | number }}</span>
              </div>
              <div class="summary-row">
                <span class="label">Payment status</span>
                <span class="val font-semibold text-orange">Unpaid</span>
              </div>
            </div>

            <!-- Primary Action: Send Invoice -->
            <div class="inv-actions">
              <button
                type="button"
                class="btn btn-primary btn-block btn-send-invoice"
                [disabled]="dataService.pending()" (click)="onSendInvoice()"
              >
                Send Invoice to Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .invoice-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;

      @include mobile {
        display: none;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-text-secondary);

        &:hover {
          color: var(--color-primary);
          text-decoration: none;
        }
      }
    }

    .invoice-container {
      display: flex;
      justify-content: center;
    }

    /* Invoice Card matches Screen 17 in PDF */
    .invoice-card {
      width: 100%;
      max-width: 540px;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;

      @include mobile {
        padding: 20px 16px;
      }

      .inv-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border-subtle);

        .inv-number {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .inv-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-top: 2px;
        }

        .inv-technician {
          font-size: 0.825rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }
      }

      .inv-section {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .inv-items-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inv-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.925rem;
          color: var(--color-text-primary);

          .name {
            color: var(--color-text-secondary);
          }

          .amount {
            font-weight: 600;
          }
        }

        .notes-text {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--color-text-primary);
        }

        .photos-row {
          display: flex;
          gap: 12px;
          margin-top: 6px;

          .photo-btn {
            flex: 1;
            height: 48px;
            background-color: #f1f5f9;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-text-secondary);
          }
        }
      }

      .inv-summary {
        border-top: 1px solid var(--color-border-subtle);
        padding-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;

          .label {
            color: var(--color-text-secondary);
          }

          .val {
            font-size: 0.95rem;

            &.font-semibold {
              font-weight: 600;
            }

            &.text-orange {
              color: var(--status-orange-text);
            }
          }

          &.total-highlight {
            .label {
              font-size: 1.15rem;
              font-weight: 700;
              color: var(--color-text-primary);
            }

            .val {
              font-size: 1.4rem;
              font-weight: 800;
              color: var(--color-primary);
            }
          }
        }
      }

      .inv-actions {
        margin-top: 8px;

        .btn-send-invoice {
          height: 50px;
          font-size: 1rem;
        }
      }
    }
  `]
})
export class GenerateInvoiceComponent implements OnInit {
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

    this.title.setTitle(`Invoice ${this.job?.invoiceNumber || ''} | FixFlow`);
    this.headerService.setHeader({
      title: 'Invoice',
      showBack: true,
      backUrl: `/technician/jobs/${id}`,
      showBell: true
    });
  }

  onSendInvoice(): void {
    if (this.job) {
      const id = this.job.id;
      this.dataService.run(() => this.dataService.sendInvoice(id), () => {
        void this.router.navigate(['/technician/jobs', id, 'invoice-sent']);
      });
    }
  }
}
