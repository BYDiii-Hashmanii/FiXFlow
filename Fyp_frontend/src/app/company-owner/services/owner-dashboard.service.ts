import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { OwnerDashboardData } from '../models/owner.models';
import { companyJob, OwnerJobResponse } from './company-job.service';

@Injectable({ providedIn: 'root' })
export class OwnerDashboardService {
  private readonly api = inject(ApiClientService);

  getDashboardData() {
    return this.api.get<Omit<OwnerDashboardData, 'recentJobs'> & { recentJobs: OwnerJobResponse[] }>(
      API.owner.dashboard,
    ).pipe(map(data => ({ ...data, recentJobs: data.recentJobs.map(companyJob) })));
  }
}
