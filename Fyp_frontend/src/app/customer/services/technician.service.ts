import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { TechnicianInfo } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class TechnicianService {
  private readonly api = inject(ApiClientService);

  list(categoryId?: string | number) {
    return this.api.get<TechnicianInfo[]>(API.technicians.list, { categoryId });
  }

  autoSelect(requestId: string) {
    return this.api.post<TechnicianInfo>(API.requests.autoSelect(requestId), {});
  }

  getById(id: string | number) {
    return this.api.get<TechnicianInfo>(API.technicians.byId(id));
  }
}
