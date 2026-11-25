import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceInfo } from '../../models/customer.models';

@Component({
  selector: 'app-invoice-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="invoice-summary-card card">
      <div class="summary-header">
        <div>
          <span class="inv-num">{{ invoice.id }}</span>
          <h3 class="inv-title">{{ invoice.jobTitle }}</h3>
          <span class="inv-tech">{{ invoice.technician.name }} · {{ invoice.technician.company }}</span>
        </div>
        <span
          class="chip"
          [class.chip-orange]="invoice.status === 'unpaid'"
          [class.chip-green]="invoice.status === 'paid'"
        >
          {{ invoice.status === 'unpaid' ? 'Unpaid' : 'Paid' }}
        </span>
      </div>

      <div class="summary-section">
        <h4 class="section-title">Parts used</h4>
        <div class="items-list">
          @for (part of invoice.parts; track part.id) {
            <div class="item-line">
              <span>{{ part.name }} × {{ part.quantity }}</span>
              <span class="font-semibold">Rs {{ part.total | number }}</span>
            </div>
          }
        </div>
      </div>

      <div class="summary-section">
        <h4 class="section-title">Labour</h4>
        <div class="item-line">
          <span>Service visit and repair</span>
          <span class="font-semibold">Rs {{ invoice.labourCost | number }}</span>
        </div>
      </div>

      <div class="summary-footer">
        <div class="total-row">
          <span class="total-label">Total cost</span>
          <span class="total-price">Rs {{ invoice.totalCost | number }}</span>
        </div>
        <div class="status-row">
          <span class="status-label">Payment status</span>
          <span class="status-val" [class.text-orange]="invoice.status === 'unpaid'" [class.text-green]="invoice.status === 'paid'">
            {{ invoice.status === 'unpaid' ? 'Unpaid' : 'Paid' }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-summary-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--color-border-subtle);

        .inv-num {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .inv-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .inv-tech {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
      }

      .summary-section {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .section-title {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--color-text-primary);

          .font-semibold {
            font-weight: 600;
          }
        }
      }

      .summary-footer {
        border-top: 1px solid var(--color-border-subtle);
        padding-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.15rem;
          font-weight: 700;

          .total-price {
            color: var(--color-primary);
          }
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;

          .text-orange { color: var(--status-orange-text); font-weight: 600; }
          .text-green { color: var(--status-green-text); font-weight: 600; }
        }
      }
    }
  `]
})
export class InvoiceSummaryComponent {
  @Input({ required: true }) invoice!: InvoiceInfo;
}
