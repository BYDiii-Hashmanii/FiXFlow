import { ViewportScroller } from '@angular/common';
import { afterNextRender, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ProblemReportService } from '../../services/problem-report.service';

@Component({
  selector: 'app-review-photo',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="flow-screen repair-flow">
      @if (report.draft(); as entry) {
        <article class="card repair-panel">
          <div class="repair-review-grid">
            <figure class="repair-photo">
              @if (entry.photoPreview) {
                <img [src]="entry.photoPreview" alt="Maintenance problem photo" />
              } @else {
                <div class="repair-photo-empty">
                  <app-icon name="camera" size="lg" aria-hidden="true" />
                  <p>No photo attached</p>
                </div>
              }
            </figure>
            <div class="repair-review-fields">
              <h1>Review your report</h1>
              <div class="form-group">
                <label for="review-description">Problem description <span>(optional)</span></label>
                <textarea class="form-control" id="review-description" #description maxlength="2000" rows="3"
                  placeholder="Describe what you noticed"
                  [value]="entry.description" (input)="update('description', description.value)"></textarea>
              </div>
              <div class="form-group">
                <label for="review-access">Access time</label>
                <input class="form-control" id="review-access" #access maxlength="100" placeholder="e.g. Today, 2:30 PM"
                  [value]="entry.accessTime" (input)="update('accessTime', access.value)" />
              </div>
            </div>
          </div>
          <div class="repair-actions repair-review-actions">
            <a class="btn btn-secondary" routerLink="/customer/report" (click)="retake()">
              <app-icon name="camera" size="sm" aria-hidden="true" /> {{ entry.photo ? 'Retake' : 'Add Photo' }}
            </a>
            @if (entry.photo || entry.description.trim()) {
              <a class="btn btn-primary" routerLink="/customer/ai/analysis">
                Continue <app-icon name="chevron-right" size="sm" aria-hidden="true" />
              </a>
            } @else {
              <button class="btn btn-primary" disabled>Continue</button>
            }
          </div>
        </article>
      } @else {
        <article class="card repair-panel repair-state">
          <p role="alert">Your draft is unavailable.</p>
          <a class="btn btn-primary" routerLink="/customer/report">Return to report</a>
        </article>
      }
    </section>
  `,
})
export class ReviewPhotoComponent {
  readonly report = inject(ProblemReportService);

  constructor() {
    inject(HeaderService).setHeader({ title: 'Review Photo', showBack: true, backUrl: '/customer/report', showBell: false });
    const viewport = inject(ViewportScroller);
    afterNextRender(() => viewport.scrollToPosition([0, 0]));
  }

  update(field: 'description' | 'accessTime', value: string): void {
    this.report.draft.update(entry => entry ? { ...entry, [field]: value } : null);
  }

  retake(): void {
    this.report.draft.update(entry => entry ? { ...entry, photo: null, photoPreview: null } : null);
  }
}
