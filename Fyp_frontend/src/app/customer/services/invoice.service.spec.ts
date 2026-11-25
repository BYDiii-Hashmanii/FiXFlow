import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../core/config/environment';
import { PaymentInfo } from '../models/customer.models';
import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
  it('submits the method and loads the authoritative receipt by invoice ID', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(InvoiceService);
    const http = TestBed.inject(HttpTestingController);
    const invoicePath = environment.apiUrl + '/invoices/INV-TEST';
    const receipt: PaymentInfo = {
      id: '77', invoiceId: 'INV-TEST', jobId: 'FF-TEST', requestId: 'FF-TEST',
      amount: 175, method: 'cash', paidAt: '2026-03-01T12:00:00Z', receiptNumber: 'REC-2026-0077',
    };
    let result: PaymentInfo | undefined;
    service.payBill('INV-TEST', 'cash').subscribe(value => { result = value; });
    const pay = http.expectOne({ method: 'POST', url: invoicePath + '/pay' });
    expect(pay.request.body).toEqual({ method: 'cash' });
    pay.flush({ success: true, data: receipt });
    expect(result).toEqual(receipt);
    service.getReceipt('INV-TEST').subscribe(value => { result = value; });
    http.expectOne({ method: 'GET', url: invoicePath + '/receipt' }).flush({ success: true, data: receipt });
    expect(result?.jobId).toBe('FF-TEST');
    http.verify();
  });
});
