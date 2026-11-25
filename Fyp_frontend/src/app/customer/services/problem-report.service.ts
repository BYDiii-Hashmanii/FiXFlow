import { effect, inject, Injectable, signal } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { ProblemReportPayload, ServiceRequest } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class ProblemReportService {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthStateService);
  readonly draft = signal<ProblemReportPayload | null>(null);

  constructor() {
    effect(() => {
      if (!this.auth.isLoggedIn() || this.auth.role() !== 'customer') this.draft.set(null);
    });
  }

  createRequest(input: ProblemReportPayload) {
    const data = new FormData();
    data.set('categoryId', input.categoryId);
    data.set('description', input.description);
    data.set('accessTime', input.accessTime);
    if (input.photo) data.set('photo', input.photo);
    return this.api.upload<ServiceRequest>(API.requests.create, data);
  }
}
