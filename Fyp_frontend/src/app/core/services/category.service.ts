import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../api/api-client.service';
import { API } from '../api/api-endpoints';
import { ServiceCategory } from '../models/shared.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiClientService);

  list() {
    return this.api.get<ServiceCategory[]>(API.categories.list);
  }
}
