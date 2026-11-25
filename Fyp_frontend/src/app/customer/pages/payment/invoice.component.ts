import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ProtectedPhotoComponent } from '../../../shared/components/protected-photo.component';
import { InvoiceInfo } from '../../models/customer.models';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-customer-invoice',
  imports: [DatePipe, DecimalPipe, TitleCasePipe, RouterLink, ConfirmModalComponent, ProtectedPhotoComponent],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Invoice</h1>
      @if (failure()) {
        <p class="flow-warning" role="alert">{{ failure() }}</p>
        @if (!invoice()) { <button class="btn btn-secondary" (click)="load()">Try Again</button> }
      }
      @if (loading()) { <p role="status">Loading invoice…</p> }
      @if (invoice(); as item) {
        <article class="card flow-card flow-row">
          <div>
            <strong>{{ item.id }}</strong>
            <h2>{{ item.jobTitle || 'Service request' }}</h2>
            <p class="flow-muted">{{ item.technician.name }} · {{ item.technician.company }}</p>
          </div>
          <span class="flow-badge" [class.flow-warning]="item.status === 'unpaid'" [class.flow-success]="item.status === 'paid'">{{ item.status | titlecase }}</span>
        </article>
        <article class="card flow-card flow-stack invoice-details">
          <section>
            <h2>Parts used</h2>
            @for (part of item.parts; track part.id) {
              <div class="flow-row"><span>{{ part.name }} × {{ part.quantity }}</span><strong>Rs {{ part.total | number }}</strong></div>
            } @empty { <p class="flow-muted">No parts were added.</p> }
          </section>
          <section>
            <h2>Labour</h2>
            <div class="flow-row"><span>Service visit and repair</span><strong>Rs {{ item.labourCost | number }}</strong></div>
          </section>
          <section>
            <h2>Work notes</h2>
            <p class="flow-muted">{{ item.workNotes || 'No work notes were added.' }}</p>
            <div class="invoice-photos">
              @for (type of photoTypes; track type) {
                <div class="invoice-photo">
                  <strong>{{ type | titlecase }}</strong>
                  @for (photo of item.photos; track photo.id) {
                    @if (photo.type === type) { <app-protected-photo [path]="photo.url" [label]="(type | titlecase) + ' repair'" /> }
                  }
                  @if (!hasPhoto(item, type)) { <span class="flow-muted">No photo</span> }
                </div>
              }
            </div>
          </section>
        </article>
        <article class="card flow-card">
          <dl>
            <dt><strong>Total cost</strong></dt><dd class="flow-accent">Rs {{ item.totalCost | number }}</dd>
            <dt>Payment status</dt><dd>{{ item.status | titlecase }}</dd>
            @if (item.paidAt) { <dt>Paid on</dt><dd>{{ item.paidAt | date:'medium' }}</dd> }
          </dl>
        </article>
        <div class="flow-actions">
          @if (item.status === 'unpaid') {
            <button class="btn btn-primary" (click)="showPaymentModal.set(true)" [disabled]="paying()">
              {{ paying() ? 'Recording payment…' : 'Pay Bill' }}
            </button>
          } @else if (item.status === 'paid') {
            <a class="btn btn-secondary" [routerLink]="['/customer/payment-receipt', item.id]">View Receipt</a>
          }
        </div>
        @if (showPaymentModal()) {
          <app-confirm-modal
            [isOpen]="true"
            [centerOnMobile]="true"
            title="Confirm payment?"
            [message]="'Pay Rs ' + (item.totalCost | number) + ' for ' + item.id + '.'"
            confirmText="Confirm"
            cancelText="Cancel"
            (confirm)="onConfirmPayment()"
            (cancelled)="showPaymentModal.set(false)"
          />
        }
      }
    </section>
  `,
  styles: [`
    .invoice-details section + section { border-top: 1px solid var(--color-border-subtle); padding-top: .65rem; }
    .invoice-details .flow-row + .flow-row { margin-top: .35rem; }
    .invoice-photos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin-top: .5rem; }
    .invoice-photo { display: grid; justify-items: center; gap: .25rem; padding: .45rem; background: #e8eff8; border-radius: .5rem; text-align: center; }
  `],
})
export class CustomerInvoiceComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly headerService = inject(HeaderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly destroy = inject(DestroyRef);

  readonly invoice = signal<InvoiceInfo | null>(null);
  readonly showPaymentModal = signal(false);
  readonly failure = signal('');
  readonly loading = signal(false);
  readonly paying = signal(false);
  readonly photoTypes = ['before', 'after'] as const;

  ngOnInit(): void {
    this.headerService.setHeader({ title: 'Invoice', showBack: true, backUrl: '/customer/requests', showBell: false });
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.failure.set('Invoice not found.');
      return;
    }
    if (this.loading()) return;
    this.failure.set('');
    this.loading.set(true);
    this.title.setTitle('Invoice #' + id + ' | FixFlow');
    this.invoiceService.getInvoice(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: invoice => {
        this.invoice.set(invoice);
        this.loading.set(false);
        this.headerService.setHeader({ title: 'Invoice', showBack: true, backUrl: '/customer/requests/' + invoice.requestId + '/track', showBell: false });
      },
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not load the invoice.'));
        this.loading.set(false);
      },
    });
  }

  hasPhoto(invoice: InvoiceInfo, type: 'before' | 'after'): boolean {
    return invoice.photos.some(photo => photo.type === type);
  }

  onConfirmPayment(): void {
    const invoice = this.invoice();
    if (!invoice || invoice.status !== 'unpaid' || this.paying()) return;
    this.paying.set(true);
    this.failure.set('');
    this.showPaymentModal.set(false);
    this.invoiceService.payBill(invoice.id, 'card').pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: payment => {
        this.invoice.set({ ...invoice, status: 'paid', paidAt: payment.paidAt });
        void this.router.navigate(['/customer/payment-receipt', payment.invoiceId]);
      },
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Payment could not be recorded. Please try again.'));
        this.paying.set(false);
      },
      complete: () => this.paying.set(false),
    });
  }
}
