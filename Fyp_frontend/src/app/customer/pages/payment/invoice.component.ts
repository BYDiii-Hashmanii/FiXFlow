import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { InvoiceService } from '../../services/invoice.service';
import { HeaderService } from '../../../core/services/header.service';
import { InvoiceInfo, PaymentMethod } from '../../models/customer.models';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-customer-invoice',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  template: `
    @if (failure) { <p role="alert">{{ failure }}</p> }
    @if (loading) { <p role="status">Loading invoice?</p> }
    @if (invoice) {
      <div class="customer-invoice-page">
        <div class="invoice-container">
          <!-- Invoice Card (Matches Screen 17 in PDF) -->
          <div class="invoice-card card">
            <div class="inv-header">
              <div>
                <span class="inv-id">{{ invoice.id }}</span>
                <h1 class="inv-title">{{ invoice.jobTitle }}</h1>
                <span class="inv-sub">{{ invoice.technician.name }} · {{ invoice.technician.company }}</span>
              </div>
              <span
                class="chip"
                [class.chip-orange]="invoice.status === 'unpaid'"
                [class.chip-green]="invoice.status === 'paid'"
              >
                {{ invoice.status | titlecase }}
              </span>
            </div>

            <!-- Parts used (Screen 17) -->
            <div class="inv-section">
              <h3 class="section-title">Parts used</h3>
              <div class="parts-list">
                @for (part of invoice.parts; track part.id) {
                  <div class="part-row">
                    <span class="name">{{ part.name }} × {{ part.quantity }}</span>
                    <span class="cost">Rs {{ part.total | number }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Labour (Screen 17) -->
            <div class="inv-section">
              <h3 class="section-title">Labour</h3>
              <div class="part-row">
                <span class="name">Service visit and repair</span>
                <span class="cost">Rs {{ invoice.labourCost | number }}</span>
              </div>
            </div>

            <!-- Work notes (Screen 17) -->
            <div class="inv-section">
              <h3 class="section-title">Work notes</h3>
              <p class="notes-text">{{ invoice.workNotes }}</p>

              <!-- Before / After buttons (Screen 17) -->
              <div class="photos-row">
                <div class="photo-btn">Before</div>
                <div class="photo-btn">After</div>
              </div>
            </div>

            <!-- Total Cost Summary (Screen 17) -->
            <div class="inv-summary">
              <div class="total-line">
                <span class="total-lbl">Total cost</span>
                <span class="total-amount">Rs {{ invoice.totalCost | number }}</span>
              </div>
              <div class="status-line">
                <span class="status-lbl">Payment status</span>
                <span class="status-val" [class.text-orange]="invoice.status === 'unpaid'" [class.text-green]="invoice.status === 'paid'">
                  {{ invoice.status | titlecase }}
                </span>
              </div>
            </div>

            <!-- Pay Bill Action (Screen 17) -->
            @if (invoice.status === 'unpaid') {
              <label for="paymentMethod">Payment method</label>
              <select id="paymentMethod" #paymentSelect (change)="setMethod(paymentSelect.value)" [disabled]="paying">
                <option value="card">Card</option><option value="cash">Cash</option>
                <option value="jazzcash">JazzCash</option><option value="easypaisa">Easypaisa</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
              <div class="inv-actions">
                <button type="button" class="btn btn-primary btn-block btn-pay" (click)="openPaymentModal()" [disabled]="paying">
                  Pay Bill
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Screen 18: Confirm Payment Modal (Matches Screen 18 in PDF) -->
      @if (showPaymentModal) {
        <app-confirm-modal
          [isOpen]="true"
          title="Confirm payment?"
          [message]="'Pay Rs ' + (invoice.totalCost | number) + ' for ' + invoice.id + '.'"
          confirmText="Confirm"
          cancelText="Cancel"
          (confirm)="onConfirmPayment()"
          (cancelled)="showPaymentModal = false"
        ></app-confirm-modal>
      }
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .customer-invoice-page {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .invoice-container {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .invoice-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;

      @include mobile {
        padding: 18px 16px;
      }

      .inv-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border-subtle);

        .inv-id {
          font-size: 0.825rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .inv-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .inv-sub {
          font-size: 0.85rem;
          color: var(--color-text-muted);
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

        .parts-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .part-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.925rem;

          .name {
            color: var(--color-text-secondary);
          }

          .cost {
            font-weight: 600;
            color: var(--color-text-primary);
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

        .total-line {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .total-lbl {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--color-text-primary);
          }

          .total-amount {
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--color-primary);
          }
        }

        .status-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;

          .status-lbl { color: var(--color-text-muted); }
          .status-val { font-weight: 600; }
          .text-orange { color: var(--status-orange-text); }
          .text-green { color: var(--status-green-text); }
        }
      }

      .inv-actions {
        margin-top: 8px;

        .btn-pay {
          height: 50px;
          font-size: 1rem;
        }
      }
    }
  `]
})
export class CustomerInvoiceComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private headerService = inject(HeaderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);

  invoice?: InvoiceInfo;
  showPaymentModal = false;
  failure = '';
  loading = true;
  paying = false;
  method: PaymentMethod = 'card';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.headerService.setHeader({ title: 'Invoice', showBack: true, backUrl: '/customer/requests', showBell: false });
    if (!id) {
      this.failure = 'Invoice not found.';
      this.loading = false;
      return;
    }
    this.title.setTitle('Invoice #' + id + ' | FixFlow');
    this.invoiceService.getInvoice(id).subscribe({
      next: invoice => {
        this.invoice = invoice;
        this.loading = false;
        this.headerService.setHeader({ title: 'Invoice', showBack: true, backUrl: '/customer/requests/' + invoice.requestId + '/track', showBell: false });
      },
      error: (error: unknown) => {
        this.failure = errorMessage(error, 'Could not load the invoice.');
        this.loading = false;
      },
    });
  }

  setMethod(value: string): void {
    const methods: PaymentMethod[] = ['card', 'cash', 'jazzcash', 'easypaisa', 'bank_transfer'];
    const method = methods.find(item => item === value);
    if (method) this.method = method;
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  onConfirmPayment(): void {
    if (!this.invoice || this.paying) return;
    this.paying = true;
    this.failure = '';
    this.showPaymentModal = false;
    this.invoiceService.payBill(this.invoice.id, this.method).subscribe({
      next: payment => void this.router.navigate(['/customer/payment-receipt', payment.invoiceId]),
      error: (error: unknown) => {
        this.failure = errorMessage(error, 'Payment could not be recorded. Please try again.');
        this.paying = false;
      },
      complete: () => { this.paying = false; },
    });
  }
}
