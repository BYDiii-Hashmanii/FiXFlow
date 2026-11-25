import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { OfferStatus, RequestStatus, TechnicianInfo } from '../models/customer.models';

export interface TrackingInfo {
  id: string;
  requestId: string;
  jobId: string | null;
  title: string | null;
  category: string;
  accessTime: string | null;
  offeredPrice: number | null;
  status: RequestStatus | 'declined';
  offerStatus: OfferStatus | null;
  previousTechnicianIds: string[];
  declineReason: string | null;
  retryAllowed: boolean;
  jobStatus: 'accepted' | 'in_progress' | 'completed' | 'closed' | 'cancelled' | null;
  invoiceId: string | null;
  invoiceEligible: boolean;
  technician: TechnicianInfo | null;
  timeline: {
    sentAt: string | null;
    respondedAt: string | null;
    acceptedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    closedAt: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class JobTrackingService {
  private readonly api = inject(ApiClientService);

  trackJob(id: string) {
    return this.api.get<TrackingInfo>(API.requests.track(id));
  }
}
