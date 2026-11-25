import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { ServiceRequest } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly api = inject(ApiClientService);

  list(tab: 'all' | 'active' | 'completed' = 'all') {
    return this.api.get<ServiceRequest[]>(API.requests.list, { tab });
  }

  getById(id: string) {
    return this.api.get<ServiceRequest>(API.requests.byId(id));
  }

  changeCategory(id: string, categoryId: number) {
    return this.api.patch<ServiceRequest>(API.requests.category(id), { categoryId });
  }

  getHistory() {
    return this.api.get<ServiceRequest[]>(API.requests.list, { status: 'closed_paid' });
  }
}
