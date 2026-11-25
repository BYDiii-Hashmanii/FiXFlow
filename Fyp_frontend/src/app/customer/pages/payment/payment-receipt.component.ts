import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';
import { PaymentInfo } from '../../models/customer.models';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-payment-receipt',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <section class="receipt card">
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
        <button class="btn btn-secondary" (click)="load()">Try again</button>
      } @else if (payment(); as receipt) {
        <h1>Payment receipt</h1>
        <dl>
          <dt>Receipt</dt><dd>{{ receipt.receiptNumber }}</dd>
          <dt>Invoice</dt><dd>{{ receipt.invoiceId }}</dd>
          <dt>Amount</dt><dd>{{ receipt.amount | currency:'PKR':'code' }}</dd>
          <dt>Method</dt><dd>{{ receipt.method.replaceAll('_', ' ') }}</dd>
          <dt>Paid on</dt><dd>{{ receipt.paidAt | date:'medium' }}</dd>
        </dl>
        <a class="btn btn-primary" [routerLink]="['/customer/feedback', receipt.jobId]">Leave feedback</a>
        <a class="btn btn-secondary" [routerLink]="['/customer/requests', receipt.requestId, 'track']">Track request</a>
      } @else {
        <p role="status">Loading receipt…</p>
      }
    </section>
  `,
  styles: [`
    .receipt { max-width: 34rem; padding: clamp(1rem, 4vw, 2rem); margin: 1rem auto; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: .75rem; margin-block: 1.5rem; }
    dd { margin: 0; overflow-wrap: anywhere; }
    a { margin: .25rem; }
  `],
})
export class PaymentReceiptComponent implements OnInit {
  private readonly invoice = inject(InvoiceService);
  private readonly route = inject(ActivatedRoute);
  private readonly header = inject(HeaderService);
  readonly payment = signal<PaymentInfo | null>(null);
  readonly failure = signal('');

  ngOnInit(): void {
    this.header.setHeader({ title: 'Payment receipt', showBack: true, backUrl: '/customer/requests' });
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.failure.set('');
    this.invoice.getReceipt(id).subscribe({
      next: receipt => this.payment.set(receipt),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load the receipt.')),
    });
  }
}
