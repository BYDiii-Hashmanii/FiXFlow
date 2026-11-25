import { NgTemplateOutlet, PercentPipe, TitleCasePipe, ViewportScroller } from '@angular/common';
import { afterNextRender, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AiAnalysis } from '../../models/customer.models';
import { AiAnalysisService } from '../../services/ai-analysis.service';

@Component({
  selector: 'app-ai-result',
  imports: [RouterLink, NgTemplateOutlet, PercentPipe, TitleCasePipe, IconComponent],
  template: `
    <section class="flow-screen repair-flow">
      @if (failure()) {
        <article class="card repair-panel repair-state">
          <p role="alert">{{ failure() }}</p>
          <button class="btn btn-secondary" (click)="ngOnInit()">Try again</button>
        </article>
      } @else if (result(); as analysis) {
        @if (analysis.visionState === 'no_detection' || analysis.visionState === 'failed') {
          <div class="repair-notice">
            <app-icon name="alert-circle" aria-hidden="true" />
            <p>{{ analysis.visionState === 'failed' ? 'Photo analysis was unavailable.' : 'No supported problem was detected in the photo.' }}
              @if (analysis.provenance === 'llama') { Guidance is based on your description. }
            </p>
          </div>
        }
        @switch (analysis.state) {
          @case ('ready') {
            <article class="card repair-panel repair-summary">
              <div class="repair-summary-heading">
                <h1>{{ analysis.title }}</h1>
                @if (analysis.urgency) {
                  <span class="chip" [class.chip-orange]="analysis.urgency === 'medium'"
                    [class.chip-green]="analysis.urgency === 'low'" [class.chip-red]="analysis.urgency === 'high'">
                    {{ analysis.urgency | titlecase }} urgency
                  </span>
                }
              </div>
              <p>{{ analysis.summary }}</p>
              <dl class="repair-metadata">
                <div><dt>Category</dt><dd>{{ analysis.category }}</dd></div>
                @if (analysis.visionState === 'ready' && analysis.confidence !== null) {
                  <div><dt>Detection confidence</dt><dd>{{ analysis.confidence | percent }}</dd></div>
                }
              </dl>
            </article>
            <div class="repair-guidance" [class.with-steps]="analysis.steps.length > 0">
              @if (analysis.steps.length) {
                <section class="card repair-panel repair-instructions" aria-labelledby="safe-instructions">
                  <h2 id="safe-instructions">Safe repair instructions</h2>
                  <ol class="repair-step-list">
                    @for (step of analysis.steps; track step.stepNo) {
                      <li><span class="repair-step-marker" aria-hidden="true">{{ step.stepNo }}</span>{{ step.instruction }}</li>
                    }
                  </ol>
                </section>
              }
              <div class="repair-next">
                @if (analysis.safetyNote) {
                  <aside class="repair-notice repair-notice-warning" aria-labelledby="safety-note">
                    <app-icon name="alert-circle" aria-hidden="true" />
                    <div><h2 id="safety-note">Safety note</h2><p>{{ analysis.safetyNote }}</p></div>
                  </aside>
                }
                <ng-container [ngTemplateOutlet]="nextActions" />
              </div>
            </div>
          }
          @case ('no_detection') { <p class="card repair-panel">There was not enough information to generate repair guidance.</p> }
          @case ('failed') { <p class="card repair-panel">Repair guidance is unavailable. You can still find a technician.</p> }
          @default {
            <div class="card repair-panel repair-state">
              <p role="status">Analysis is still in progress.</p>
              <a [routerLink]="['/customer/ai', id, 'analysis']">View analysis progress</a>
            </div>
          }
        }
      } @else {
        <p role="status">Loading analysis…</p>
      }
      @if (result()?.state !== 'ready' || failure()) {
        <ng-container [ngTemplateOutlet]="nextActions" />
      }
    </section>
    <ng-template #nextActions>
      <div class="repair-actions">
        @if (canTrySteps()) {
          <a class="btn btn-primary" [routerLink]="['/customer/ai', id, 'try-steps']">
            Try These Steps <app-icon name="chevron-right" size="sm" aria-hidden="true" />
          </a>
        }
        <a class="btn" [class.btn-secondary]="canTrySteps()" [class.btn-primary]="!canTrySteps()"
          [routerLink]="['/customer/booking', id, 'options']">
          <app-icon name="wrench" size="sm" aria-hidden="true" /> Find a Technician
        </a>
      </div>
    </ng-template>
  `,
})
export class AiResultComponent implements OnInit {
  private readonly api = inject(AiAnalysisService);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly result = signal<AiAnalysis | null>(null);
  readonly failure = signal('');
  readonly canTrySteps = computed(() => {
    const analysis = this.result();
    return analysis?.state === 'ready' && analysis.steps.length > 0;
  });

  constructor() {
    inject(HeaderService).setHeader({ title: 'AI Result', showBack: true, backUrl: '/customer/requests', showBell: false });
    const viewport = inject(ViewportScroller);
    afterNextRender(() => viewport.scrollToPosition([0, 0]));
  }

  ngOnInit(): void {
    if (!this.id) return;
    this.failure.set('');
    this.api.getAnalysis(this.id).subscribe({
      next: analysis => this.result.set(analysis),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load analysis.')),
    });
  }
}
