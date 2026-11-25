import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { InvoiceInfo, PaymentInfo, PaymentMethod } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly api = inject(ApiClientService);

  getInvoice(id: string) {
    return this.api.get<InvoiceInfo>(API.invoices.byId(id));
  }

  payBill(id: string, method: PaymentMethod) {
    return this.api.post<PaymentInfo>(API.invoices.pay(id), { method });
  }

  getReceipt(id: string) {
    return this.api.get<PaymentInfo>(API.invoices.receipt(id));
  }
}
