import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { CreateTechnicianPayload, EditTechnicianPayload, OwnerTechnician } from '../models/owner.models';

type TechnicianResponse = Omit<OwnerTechnician, 'availabilityNote'>;

function technician(dto: TechnicianResponse): OwnerTechnician {
  return {
    ...dto,
    availabilityNote: { available: 'Available now', busy: 'Busy with job', unavailable: 'Unavailable' }[dto.availability],
  };
}

@Injectable({ providedIn: 'root' })
export class TechnicianManagementService {
  private readonly api = inject(ApiClientService);

  list() {
    return this.api.get<TechnicianResponse[]>(API.owner.technicians).pipe(map(list => list.map(technician)));
  }

  getById(id: string | number) {
    return this.api.get<TechnicianResponse>(API.owner.technicianById(id)).pipe(map(technician));
  }

  create(payload: CreateTechnicianPayload) {
    return this.api.post<TechnicianResponse>(API.owner.technicians, payload).pipe(map(technician));
  }

  update(id: string | number, payload: EditTechnicianPayload) {
    return this.api.put<TechnicianResponse>(API.owner.technicianById(id), payload).pipe(map(technician));
  }
}
