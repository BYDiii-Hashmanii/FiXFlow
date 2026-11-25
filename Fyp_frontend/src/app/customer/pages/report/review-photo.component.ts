import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProblemReportService } from '../../services/problem-report.service';

@Component({
  selector: 'app-review-photo',
  imports: [RouterLink],
  template: `
    <section class="card review">
      <h1>Review your report</h1>
      @if (draft(); as entry) {
        @if (entry.photoPreview) { <img [src]="entry.photoPreview" alt="Photo attached to the maintenance request" /> }
        <p><strong>{{ entry.category }}</strong></p>
        <p>{{ entry.description }}</p>
        @if (entry.accessTime) { <p>{{ entry.accessTime }}</p> }
        <a class="btn btn-primary" routerLink="/customer/ai/analysis">Save request</a>
        <a class="btn btn-secondary" routerLink="/customer/report">Edit report</a>
      } @else {
        <p>Your draft is unavailable.</p>
        <a class="btn btn-primary" routerLink="/customer/report">Return to report</a>
      }
    </section>
  `,
  styles: ['.review { max-width: 38rem; margin: 1rem auto; padding: 1.25rem; } img { max-width: 100%; max-height: 16rem; } a { margin: .25rem; }'],
})
export class ReviewPhotoComponent {
  readonly draft = inject(ProblemReportService).draft.asReadonly();
}
