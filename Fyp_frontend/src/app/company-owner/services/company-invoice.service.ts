import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { CompanyInvoice } from '../models/owner.models';

type OwnerInvoiceResponse = Omit<CompanyInvoice, 'total' | 'labourCost' | 'createdAt' | 'paymentDate' | 'workNotes'> & {
  amount: number;
  labourTotal: number;
  date: string;
  paidAt: string | null;
  workNotes: string | null;
};

function invoice(dto: OwnerInvoiceResponse): CompanyInvoice {
  return { ...dto, total: dto.amount, labourCost: dto.labourTotal, createdAt: dto.date,
    paymentDate: dto.paidAt ?? undefined, workNotes: dto.workNotes ?? undefined };
}

@Injectable({ providedIn: 'root' })
export class CompanyInvoiceService {
  private readonly api = inject(ApiClientService);

  list(status?: string) {
    return this.api.get<OwnerInvoiceResponse[]>(API.owner.invoices, { status: status === 'all' ? undefined : status })
      .pipe(map(items => items.map(invoice)));
  }

  getById(id: string | number) {
    return this.api.get<OwnerInvoiceResponse>(API.owner.invoiceById(id)).pipe(map(invoice));
  }
}
