import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyInvoiceService } from '../../services/company-invoice.service';
import { CompanyInvoice } from '../../models/owner.models';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-invoice-details',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusChipComponent, IconComponent],
  template: `
    @if (invoice()) {
      <div class="page-container">
        <!-- Page Header -->
        <div class="page-header">
          <a routerLink="/owner/invoices" class="back-btn" aria-label="Back to invoices">
            <app-icon name="arrow-left" size="md"></app-icon>
          </a>
          <div class="header-titles">
            <div class="id-row">
              <h1 class="page-title">{{ invoice()!.id }}</h1>
              <app-status-chip
                [status]="invoice()!.status"
                [label]="formatStatus(invoice()!.status)"
              ></app-status-chip>
            </div>
            <p class="job-ref">Job: {{ invoice()!.jobTitle }} · {{ invoice()!.jobId }}</p>
          </div>
        </div>
        <!-- Info Notice Banner -->
        <div class="view-notice-banner">
          <app-icon name="info" size="sm"></app-icon>
          <span>View only. The technician sends invoices directly to the customer.</span>
        </div>
        <div class="content-grid">
          <!-- Main Invoice Document -->
          <div class="invoice-card card">
            <div class="invoice-meta-section">
              <div class="meta-block">
                <span class="meta-label">Customer</span>
                <span class="meta-val">{{ invoice()!.customerName }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-label">Technician</span>
                <span class="meta-val">{{ invoice()!.technicianName }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-label">Date Issued</span>
                <span class="meta-val">{{ invoice()!.createdAt }}</span>
              </div>
              @if (invoice()!.paymentDate) {
                <div class="meta-block">
                  <span class="meta-label">Payment Date</span>
                  <span class="meta-val">{{ invoice()!.paymentDate }}</span>
                </div>
              }
            </div>
            <div class="divider"></div>
            <!-- Parts / Items Table -->
            <h3 class="section-title">Parts & Materials</h3>
            <div class="table-container">
              <table class="parts-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @for (part of invoice()!.parts; track part) {
                    <tr>
                      <td>{{ part.name }}</td>
                      <td class="text-center">{{ part.quantity }}</td>
                      <td class="text-right">Rs {{ part.unitPrice | number }}</td>
                      <td class="text-right font-medium">Rs {{ part.total | number }}</td>
                    </tr>
                  }
                  @if (invoice()!.parts.length === 0) {
                    <tr>
                      <td colspan="4" class="text-center empty-parts">No separate parts billed.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="divider"></div>
            <!-- Summary & Totals -->
            <div class="totals-section">
              <div class="total-row">
                <span class="label">Parts Subtotal</span>
                <span class="val">Rs {{ partsSubtotal() | number }}</span>
              </div>
              <div class="total-row">
                <span class="label">Labour Charges</span>
                <span class="val">Rs {{ invoice()!.labourCost | number }}</span>
              </div>
              <div class="total-row grand-total">
                <span class="label">Grand Total</span>
                <span class="val">Rs {{ invoice()!.total | number }}</span>
              </div>
            </div>
            @if (invoice()!.workNotes) {
              <div class="work-notes-box">
                <span class="notes-label">Technician Work Notes</span>
                <p class="notes-text">{{ invoice()!.workNotes }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Loading invoice details...</p>
      </div>
    }
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .page-container {
        padding-bottom: 40px;
        max-width: 860px;
        margin: 0 auto;

        @include respond-to(desktop) {
          margin: 0;
        }
      }

      .page-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 20px;

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          text-decoration: none;
          flex-shrink: 0;

          &:hover {
            background-color: #f1f5f9;
          }
        }

        .header-titles {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .id-row {
            display: flex;
            align-items: center;
            gap: 12px;

            .page-title {
              font-size: 1.45rem;
              font-weight: 700;
              color: var(--color-text-primary);
              margin: 0;
            }
          }

          .job-ref {
            font-size: 0.9rem;
            color: var(--color-text-secondary);
            margin: 0;
          }
        }
      }

      .view-notice-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: var(--radius-md);
        color: #166534;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 20px;
      }

      .invoice-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 24px;

        @include respond-to(tablet) {
          padding: 32px;
        }
      }

      .invoice-meta-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        @include respond-to(tablet) {
          grid-template-columns: repeat(4, 1fr);
        }

        .meta-block {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .meta-label {
            font-size: 0.8rem;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }

          .meta-val {
            font-weight: 600;
            color: var(--color-text-primary);
            font-size: 0.95rem;
          }
        }
      }

      .divider {
        height: 1px;
        background-color: var(--color-border);
        margin: 24px 0;
      }

      .section-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 16px;
      }

      .table-container {
        overflow-x: auto;
      }

      .parts-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;

        th {
          padding: 10px 12px;
          text-align: left;
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          border-bottom: 1px solid var(--color-border);
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          color: var(--color-text-primary);
        }

        .font-medium {
          font-weight: 600;
        }

        .text-center {
          text-align: center;
        }

        .text-right {
          text-align: right;
        }

        .empty-parts {
          padding: 20px;
          color: var(--color-text-secondary);
        }
      }

      .totals-section {
        max-width: 320px;
        margin-left: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--color-text-secondary);

          .val {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          &.grand-total {
            padding-top: 10px;
            border-top: 2px solid var(--color-border);
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--color-text-primary);

            .val {
              color: var(--color-primary);
              font-size: 1.25rem;
            }
          }
        }
      }

      .work-notes-box {
        margin-top: 24px;
        padding: 16px;
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);

        .notes-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .notes-text {
          font-size: 0.9rem;
          color: var(--color-text-primary);
          line-height: 1.5;
          margin: 0;
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
export class InvoiceDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private invoiceService = inject(CompanyInvoiceService);

  invoice = signal<CompanyInvoice | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getById(id).subscribe({
        next: (res) => this.invoice.set(res),
      });
    }
  }

  partsSubtotal(): number {
    const inv = this.invoice();
    if (!inv || !inv.parts) return 0;
    return inv.parts.reduce((sum, p) => sum + (p.total || p.quantity * p.unitPrice), 0);
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'unpaid':
        return 'Unpaid';
      default:
        return status;
    }
  }
}
