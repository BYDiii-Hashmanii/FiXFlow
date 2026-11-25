import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { CompanyOwner } from '../models/owner.models';

@Injectable({ providedIn: 'root' })
export class OwnerProfileService {
  private readonly api = inject(ApiClientService);

  get() {
    return this.api.get<CompanyOwner>(API.owner.profile);
  }

  update(data: Partial<CompanyOwner>) {
    const { fullName, phone, email } = data;
    return this.api.put<CompanyOwner>(API.owner.profile, { fullName, phone, email: email === '' ? null : email });
  }
}
