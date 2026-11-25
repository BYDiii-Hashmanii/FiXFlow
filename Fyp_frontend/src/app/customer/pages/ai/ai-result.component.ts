import { NgTemplateOutlet, PercentPipe, TitleCasePipe, ViewportScroller } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AiAnalysis } from '../../models/customer.models';
import { AiAnalysisService } from '../../services/ai-analysis.service';
import { RequestService } from '../../services/request.service';
import { CategoryUnidentifiedComponent } from './category-unidentified.component';

@Component({
  selector: 'app-ai-result',
  imports: [RouterLink, NgTemplateOutlet, PercentPipe, TitleCasePipe, IconComponent, CategoryUnidentifiedComponent],
  template: `
    <section class="flow-screen repair-flow">
      @if (failure()) {
        <article class="card repair-panel repair-state">
          <p role="alert">{{ failure() }}</p>
          <button class="btn btn-secondary" (click)="ngOnInit()">Try again</button>
        </article>
      } @else if (unidentified()) {
        <app-category-unidentified [safetyNote]="result()?.safetyNote" />
      } @else if (result(); as analysis) {
        @if (analysis.visionState === 'no_detection' || analysis.visionState === 'failed' || analysis.visionState === 'uncertain') {
          <div class="repair-notice">
            <app-icon name="alert-circle" aria-hidden="true" />
            <p>{{ analysis.visionState === 'failed' ? 'Photo analysis was unavailable.' : analysis.visionState === 'uncertain' ?
                'The photo did not identify the problem with enough confidence.' : 'No supported problem was detected in the photo.' }}
              @if (analysis.provenance === 'llama') { Guidance is based on your description. }
            </p>
          </div>
        }
        @if (analysis.title || analysis.urgency) {
            <article class="card repair-panel repair-summary">
              <div class="repair-summary-heading">
                <h1>{{ analysis.title || 'Maintenance report' }}</h1>
                @if (analysis.urgency) {
                  <span class="chip" [class.chip-orange]="analysis.urgency === 'medium'"
                    [class.chip-green]="analysis.urgency === 'low'" [class.chip-red]="analysis.urgency === 'high'">
                    {{ analysis.urgency | titlecase }} urgency
                  </span>
                }
              </div>
              @if (analysis.visionState === 'ready' && analysis.detectedDisplayName) {
                <p class="flow-muted">Detected: {{ analysis.detectedDisplayName }} ({{ analysis.confidence | percent }})</p>
              }
              @if (analysis.summary) { <p>{{ analysis.summary }}</p> }
              <dl class="repair-metadata">
                <div><dt>{{ analysis.state === 'needs_category' ? 'Your category' : 'Category' }}</dt><dd>{{ analysis.category }}</dd></div>
              </dl>
            </article>
        }
        @switch (analysis.state) {
          @case ('needs_category') {
            <article class="card repair-panel repair-state">
              <h2>Confirm the service category</h2>
              <p>We detected {{ analysis.detectedDisplayName }} ({{ analysis.suggestedCategory }}),
                but you selected {{ analysis.customerCategory }}. Which is correct?</p>
              <div class="repair-actions">
                <button class="btn btn-primary" [disabled]="savingCategory()" (click)="chooseCategory(analysis.suggestedCategoryId)">
                  Use {{ analysis.suggestedCategory }}
                </button>
                <button class="btn btn-secondary" [disabled]="savingCategory()" (click)="chooseCategory(analysis.customerCategoryId)">
                  Keep {{ analysis.customerCategory }}
                </button>
              </div>
              @if (categoryFailure()) { <p role="alert">{{ categoryFailure() }}</p> }
            </article>
            <ng-container [ngTemplateOutlet]="safetyNote" [ngTemplateOutletContext]="{ $implicit: analysis.safetyNote }" />
          }
          @case ('ready') {
            <div class="repair-guidance" [class.with-steps]="canTrySteps()">
              @if (canTrySteps()) {
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
                <ng-container [ngTemplateOutlet]="safetyNote" [ngTemplateOutletContext]="{ $implicit: analysis.safetyNote }" />
                <ng-container [ngTemplateOutlet]="nextActions" />
              </div>
            </div>
          }
          @case ('no_detection') { <p class="card repair-panel">There was not enough information to generate repair guidance.</p> }
          @case ('uncertain') { <p class="card repair-panel">There was not enough information to generate repair guidance.</p> }
          @case ('failed') {
            <ng-container [ngTemplateOutlet]="safetyNote" [ngTemplateOutletContext]="{ $implicit: analysis.safetyNote }" />
            <p class="card repair-panel">Repair guidance is unavailable. You can still find a technician.</p>
          }
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
      @if (!unidentified() && result()?.state !== 'ready' && result()?.state !== 'needs_category') {
        <ng-container [ngTemplateOutlet]="nextActions" />
      }
    </section>
    <ng-template #safetyNote let-note>
      @if (note) {
        <aside class="repair-notice repair-notice-warning" aria-labelledby="safety-note">
          <app-icon name="alert-circle" aria-hidden="true" />
          <div><h2 id="safety-note">Safety note</h2><p>{{ note }}</p></div>
        </aside>
      }
    </ng-template>
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
  private readonly requests = inject(RequestService);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly result = signal<AiAnalysis | null>(null);
  readonly failure = signal('');
  readonly savingCategory = signal(false);
  readonly categoryFailure = signal('');
  readonly unidentified = computed(() => {
    const analysis = this.result();
    return !!analysis?.categoryChoiceRequired && analysis.categorySource === 'customer' && analysis.state !== 'pending';
  });
  readonly canTrySteps = computed(() => {
    const analysis = this.result();
    return analysis?.state === 'ready' && analysis.diyAllowed !== false && analysis.steps.length > 0;
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

  chooseCategory(categoryId: number | null): void {
    if (!this.id || categoryId === null || this.savingCategory()) return;
    this.categoryFailure.set('');
    this.savingCategory.set(true);
    this.requests.changeCategory(this.id, categoryId).pipe(
      takeUntilDestroyed(this.destroy), finalize(() => this.savingCategory.set(false)),
    ).subscribe({
      next: () => void this.router.navigate(['/customer/ai', this.id, 'analysis'], { replaceUrl: true }),
      error: (error: unknown) => this.categoryFailure.set(errorMessage(error, 'Could not save your category choice.')),
    });
  }
}
