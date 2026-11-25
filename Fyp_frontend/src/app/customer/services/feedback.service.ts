import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { ReviewInfo } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly api = inject(ApiClientService);

  submitReview(jobId: string, rating: number, comment = '') {
    return this.api.post<ReviewInfo>(API.reviews.create(jobId), { rating, comment });
  }
}
