import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { CompanyJob, InvoiceLine } from '../models/owner.models';

export interface OwnerJobResponse {
  id: string;
  jobTitle: string | null;
  category: string;
  customer: { id: string; name: string; phone: string };
  technician: { id: string; name: string };
  scheduledDate: string;
  grandTotal: number;
  status: 'closed' | 'in_progress' | 'accepted' | 'completed' | 'cancelled';
  invoiceStatus: 'draft' | 'unpaid' | 'paid' | null;
  accessTime: string | null;
  description: string | null;
  timeline: { title: string; time: string; completed: boolean }[];
  invoiceId: string | null;
  parts: InvoiceLine[];
  labourTotal: number;
}

export function companyJob(dto: OwnerJobResponse): CompanyJob {
  return {
    id: dto.id, title: dto.jobTitle ?? '', category: dto.category,
    customerId: dto.customer.id, customerName: dto.customer.name, customerPhone: dto.customer.phone,
    technicianId: dto.technician.id, technicianName: dto.technician.name,
    date: dto.scheduledDate, total: dto.grandTotal,
    status: dto.status === 'closed' ? (dto.invoiceStatus === 'paid' ? 'closed_paid' : 'closed_unpaid') : dto.status,
    accessTime: dto.accessTime ?? '', description: dto.description ?? '',
    progressSteps: dto.timeline.map(step => ({ label: step.title, time: step.time, done: step.completed })),
    invoiceId: dto.invoiceId ?? undefined, parts: dto.parts, labourCost: dto.labourTotal,
  };
}

@Injectable({ providedIn: 'root' })
export class CompanyJobService {
  private readonly api = inject(ApiClientService);

  list(status?: string) {
    return this.api.get<OwnerJobResponse[]>(API.owner.jobs, { status: status === 'all' ? undefined : status })
      .pipe(map(items => items.map(companyJob)));
  }

  getById(id: string | number) {
    return this.api.get<OwnerJobResponse>(API.owner.jobById(id)).pipe(map(companyJob));
  }
}
