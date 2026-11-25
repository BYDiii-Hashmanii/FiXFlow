import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { User } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class CustomerProfileService {
  private readonly api = inject(ApiClientService);

  getProfile() {
    return this.api.get<User>(API.users.me);
  }

  updateProfile(data: Partial<Pick<User, 'fullName' | 'phone' | 'email' | 'address'>>) {
    return this.api.put<User>(API.users.me, { ...data, email: data.email === '' ? null : data.email });
  }
}
