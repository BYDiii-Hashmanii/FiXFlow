import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { InvoiceInfo, PaymentInfo } from '../../models/customer.models';
import { InvoiceService } from '../../services/invoice.service';
import { CustomerInvoiceComponent } from './invoice.component';

describe('Customer invoice', () => {
  it('loads the invoice, cancels without paying, then confirms using the real invoice ID', async () => {
    const result = new Subject<InvoiceInfo>();
    const payment = new Subject<PaymentInfo>();
    const payBill = vi.fn(() => payment);
    TestBed.configureTestingModule({
      imports: [CustomerInvoiceComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'INV-42' }) } } },
        { provide: InvoiceService, useValue: { getInvoice: () => result, payBill } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CustomerInvoiceComponent);
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement;
    const click = (label: string) => {
      const button = [...body.querySelectorAll('button')].find(item => item.textContent?.trim() === label);
      expect(button).toBeDefined();
      button?.click();
    };
    expect(body.textContent).toContain('Loading invoice');
    result.next({
      id: 'INV-42', jobId: 'FF-42', requestId: 'FF-42', jobTitle: 'Repair tap', parts: [], photos: [],
      technician: { name: 'Test technician', company: 'Test company' } as InvoiceInfo['technician'],
      labourCost: 2550, totalCost: 2550, status: 'unpaid', workNotes: 'Seal replaced', createdAt: '2026-11-25',
    });
    await fixture.whenStable();
    expect(body.textContent).toContain('Seal replaced');
    click('Pay Bill');
    await fixture.whenStable();
    expect(body.querySelector('[role="dialog"]')?.textContent).toContain('Pay Rs 2,550 for INV-42.');
    click('Cancel');
    await fixture.whenStable();
    expect(body.querySelector('[role="dialog"]')).toBeNull();
    expect(payBill).not.toHaveBeenCalled();
    click('Pay Bill');
    await fixture.whenStable();
    click('Confirm');
    expect(payBill).toHaveBeenCalledExactlyOnceWith('INV-42', 'card');

    payment.next({
      id: '1', invoiceId: 'INV-42', requestId: 'FF-42', jobId: 'FF-42', amount: 2550,
      method: 'card', paidAt: '2026-11-25T12:00:00Z', receiptNumber: 'REC-2026-0001',
    });
    payment.complete();
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith(['/customer/payment-receipt', 'INV-42']);
    expect(body.textContent).toContain('Paid');
  });
});
