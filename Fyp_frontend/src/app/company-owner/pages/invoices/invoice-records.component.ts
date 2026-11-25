import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyInvoiceService } from '../../services/company-invoice.service';
import { CompanyInvoice } from '../../models/owner.models';
import { InvoiceRowComponent } from '../../components/invoice-row/invoice-row.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-invoice-records',
  standalone: true,
  imports: [CommonModule, RouterLink, InvoiceRowComponent, StatusChipComponent, IconComponent],
  template: `
    <div class="invoices-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Invoice Records</h1>
          <p class="page-subtitle">View invoices, parts list, labour charges and payment status</p>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
          All ({{ allInvoices().length }})
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'paid'" (click)="setTab('paid')">
          Paid ({{ paidCount() }})
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab() === 'unpaid'"
          (click)="setTab('unpaid')"
        >
          Unpaid ({{ unpaidCount() }})
        </button>
      </div>

      <!-- Mobile List View -->
      <div class="mobile-list">
        @if (filteredInvoices().length === 0) {
          <div class="empty-box card">
            <app-icon name="file-text" size="lg" class="empty-icon"></app-icon>
            <p>No invoices found in this category.</p>
          </div>
        } @else {
          @for (invoice of filteredInvoices(); track invoice) {
            <app-owner-invoice-row [invoice]="invoice"></app-owner-invoice-row>
          }
        }
      </div>

      <!-- Desktop Table View -->
      <div class="desktop-table-card card">
        <div class="table-responsive">
          <table class="invoices-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Job Title</th>
                <th>Customer</th>
                <th>Technician</th>
                <th>Created Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredInvoices().length === 0) {
                <tr>
                  <td colspan="8" class="text-center empty-cell">No invoices found.</td>
                </tr>
              } @else {
                @for (inv of filteredInvoices(); track inv) {
                  <tr>
                    <td class="font-bold">{{ inv.id }}</td>
                    <td>{{ inv.jobTitle }}</td>
                    <td>{{ inv.customerName }}</td>
                    <td>
                      <span class="tech-badge">{{ inv.technicianName }}</span>
                    </td>
                    <td>{{ inv.createdAt }}</td>
                    <td class="font-bold">Rs {{ inv.total | number }}</td>
                    <td>
                      <app-status-chip
                        [status]="inv.status"
                        [label]="formatStatus(inv.status)"
                      ></app-status-chip>
                    </td>
                    <td class="text-right">
                      <a [routerLink]="['/owner/invoices', inv.id]" class="view-link">
                        <span>View</span>
                        <app-icon name="chevron-right" size="sm"></app-icon>
                      </a>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .invoices-page {
        padding-bottom: 40px;
      }

      .page-header {
        margin-bottom: 20px;

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 4px;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin: 0;
        }
      }

      .filter-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;

        .tab-btn {
          padding: 8px 16px;
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            background-color: #f8fafc;
          }

          &.active {
            background-color: var(--color-primary);
            color: #ffffff;
            border-color: var(--color-primary);
          }
        }
      }

      .mobile-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        @include respond-to(desktop) {
          display: none;
        }
      }

      .desktop-table-card {
        display: none;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        overflow: hidden;

        @include respond-to(desktop) {
          display: block;
        }
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }

      .invoices-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.9rem;

        thead {
          background-color: #f8fafc;
          border-bottom: 1px solid var(--color-border);

          th {
            padding: 14px 16px;
            font-weight: 600;
            color: var(--color-text-secondary);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
        }

        tbody {
          tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background-color var(--transition-fast);

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background-color: #f8fafc;
            }
          }

          td {
            padding: 14px 16px;
            color: var(--color-text-primary);
            vertical-align: middle;
          }
        }

        .font-bold {
          font-weight: 600;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .empty-cell {
          padding: 32px;
          color: var(--color-text-secondary);
        }

        .tech-badge {
          display: inline-block;
          padding: 3px 8px;
          background-color: #f1f5f9;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .view-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: var(--color-primary);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .empty-box {
        padding: 32px 20px;
        text-align: center;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        color: var(--color-text-secondary);

        .empty-icon {
          margin-bottom: 10px;
          color: #94a3b8;
        }
      }
    `,
  ],
})
export class InvoiceRecordsComponent implements OnInit {
  private invoiceService = inject(CompanyInvoiceService);

  allInvoices = signal<CompanyInvoice[]>([]);
  activeTab = signal<'all' | 'paid' | 'unpaid'>('all');

  ngOnInit(): void {
    this.invoiceService.list().subscribe({
      next: (res) => this.allInvoices.set(res),
    });
  }

  setTab(tab: 'all' | 'paid' | 'unpaid'): void {
    this.activeTab.set(tab);
  }

  filteredInvoices(): CompanyInvoice[] {
    const tab = this.activeTab();
    const invs = this.allInvoices();
    if (tab === 'paid') {
      return invs.filter((i) => i.status === 'paid');
    }
    if (tab === 'unpaid') {
      return invs.filter((i) => i.status === 'unpaid');
    }
    return invs;
  }

  paidCount(): number {
    return this.allInvoices().filter((i) => i.status === 'paid').length;
  }

  unpaidCount(): number {
    return this.allInvoices().filter((i) => i.status === 'unpaid').length;
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
