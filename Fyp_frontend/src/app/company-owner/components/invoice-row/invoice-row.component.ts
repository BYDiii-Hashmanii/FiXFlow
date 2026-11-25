import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyInvoice } from '../../models/owner.models';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-invoice-row',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusChipComponent, IconComponent],
  template: `
    <a [routerLink]="['/owner/invoices', invoice.id]" class="invoice-row-card card">
      <div class="row-left">
        <div class="icon-wrap">
          <app-icon name="file-text" size="sm"></app-icon>
        </div>
        <div class="row-meta">
          <h3 class="inv-id">{{ invoice.id }}</h3>
          <span class="inv-sub">{{ invoice.jobTitle }} · {{ invoice.technicianName }}</span>
          <div class="chip-mobile">
            <app-status-chip [status]="invoice.status" [label]="statusLabel"></app-status-chip>
          </div>
        </div>
      </div>

      <div class="row-right">
        <span class="inv-amount">Rs {{ invoice.total | number }}</span>
        <div class="chip-desktop">
          <app-status-chip [status]="invoice.status" [label]="statusLabel"></app-status-chip>
        </div>
      </div>
    </a>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .invoice-row-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      text-decoration: none;
      color: inherit;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: #ffffff;
      transition: background-color var(--transition-fast), border-color var(--transition-fast);

      &:hover {
        background-color: #f8fafc;
        border-color: #cbd5e1;
      }

      .row-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;

        .icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background-color: #eff6ff;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .row-meta {
          min-width: 0;

          .inv-id {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 0;
          }

          .inv-sub {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-top: 2px;
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .chip-mobile {
            margin-top: 6px;
            display: block;

            @include tablet {
              display: none;
            }
          }
        }
      }

      .row-right {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-shrink: 0;

        .inv-amount {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .chip-desktop {
          display: none;

          @include tablet {
            display: block;
          }
        }
      }
    }
  `]
})
export class OwnerInvoiceRowComponent {
  @Input({ required: true }) invoice!: CompanyInvoice;

  get statusLabel(): string {
    return this.invoice.status === 'paid' ? 'Paid' : 'Unpaid';
  }
}

export { OwnerInvoiceRowComponent as InvoiceRowComponent };
