import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { AiAnalysis } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class AiAnalysisService {
  private readonly api = inject(ApiClientService);

  getAnalysis(id: string) {
    return this.api.get<AiAnalysis>(API.requests.analysis(id));
  }

  markSolved(id: string) {
    return this.api.post<{ success: boolean }>(API.requests.markSolved(id), {});
  }
}
