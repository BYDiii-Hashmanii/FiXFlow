import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { repeat, retry, takeWhile, throwError, timer } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { RequestOffer } from '../models/customer.models';
import { JobTrackingService } from './job-tracking.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(ApiClientService);
  private readonly tracking = inject(JobTrackingService);

  sendOffer(requestId: string, technicianId: string) {
    return this.api.post<RequestOffer>(API.requests.sendOffer(requestId), { technicianId });
  }

  pollOfferStatus(requestId: string) {
    return this.tracking.trackJob(requestId).pipe(
      retry({
        count: 3,
        delay: (error: unknown, attempt) =>
          error instanceof HttpErrorResponse && error.status > 0 && error.status < 500
            ? throwError(() => error)
            : timer(1000 * 2 ** attempt),
      }),
      repeat({ delay: 5000 }),
      takeWhile(result => result.status === 'waiting' && result.offerStatus === 'pending', true),
    );
  }
}
