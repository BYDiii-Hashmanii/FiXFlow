import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { CompanyFeedback } from '../models/owner.models';

export interface CompanyFeedbackSummary {
  averageRating: number | null;
  totalReviews: number;
  items: CompanyFeedback[];
}

@Injectable({ providedIn: 'root' })
export class CompanyFeedbackService {
  private readonly api = inject(ApiClientService);

  list() {
    return this.api.get<{ averageRating: number | null; totalReviews: number; reviews: CompanyFeedback[] }>(
      API.owner.feedback,
    ).pipe(map(dto => ({ averageRating: dto.averageRating, totalReviews: dto.totalReviews, items: dto.reviews })));
  }

  getById(id: string | number) {
    return this.api.get<CompanyFeedback>(API.owner.feedbackById(id));
  }
}
