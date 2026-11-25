import { ViewportScroller } from '@angular/common';
import { afterNextRender, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AiAnalysis } from '../../models/customer.models';
import { AiAnalysisService } from '../../services/ai-analysis.service';

@Component({
  selector: 'app-try-steps',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="flow-screen repair-flow repair-checklist">
      @if (failure()) { <p class="repair-notice repair-notice-warning" role="alert">{{ failure() }}</p> }
      @if (analysis(); as result) {
        <article class="card repair-panel repair-summary">
          <h1>{{ result.title || 'Repair steps' }}</h1>
          @if (result.state === 'ready' && result.diyAllowed !== false && result.steps.length) {
            <p>Check off each step as you go.</p>
            <div class="repair-progress">
              <label for="repair-progress" aria-live="polite">{{ completed().length }} of {{ result.steps.length }} steps complete</label>
              <progress id="repair-progress" [value]="completed().length" [max]="result.steps.length"></progress>
            </div>
          }
        </article>
        @if (result.state === 'ready' && result.diyAllowed !== false && result.steps.length) {
          <section class="card repair-panel repair-instructions" aria-labelledby="repair-checklist-title">
            <h2 id="repair-checklist-title">Repair checklist</h2>
            <ol class="repair-step-list repair-step-controls">
              @for (step of result.steps; track step.stepNo) {
                <li>
                  <label class="repair-step-control">
                    <input type="checkbox" #check [checked]="completed().includes(step.stepNo)"
                      (change)="toggle(step.stepNo, check.checked)" />
                    <span class="repair-step-marker" aria-hidden="true">
                      <span>{{ step.stepNo }}</span><app-icon name="check" size="sm" />
                    </span>
                    <span>{{ step.instruction }}</span>
                  </label>
                </li>
              }
            </ol>
          </section>
          <div class="repair-notice">
            <app-icon name="wrench" aria-hidden="true" />
            <p>If the issue is fixed, mark it as solved. If it persists, find a technician.</p>
          </div>
        } @else {
          <p class="card repair-panel">Repair steps are unavailable for this request.</p>
        }
      } @else if (!failure()) { <p role="status">Loading repair steps…</p> }
      <div class="repair-actions repair-finish-actions">
        @if (analysis()?.state === 'ready' && analysis()?.diyAllowed !== false && analysis()?.steps?.length) {
          <button class="btn btn-primary" [disabled]="pending()" (click)="solve()">
            <app-icon name="check" size="sm" aria-hidden="true" /> {{ pending() ? 'Saving…' : 'Mark as Solved' }}
          </button>
        }
        <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'options']">
          <app-icon name="wrench" size="sm" aria-hidden="true" /> Find a Technician
        </a>
      </div>
    </section>
  `,
})
export class TryStepsComponent implements OnInit {
  private readonly api = inject(AiAnalysisService);
  private readonly router = inject(Router);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly analysis = signal<AiAnalysis | null>(null);
  readonly failure = signal('');
  readonly pending = signal(false);
  readonly completed = signal<number[]>([]);

  constructor() {
    inject(HeaderService).setHeader({ title: 'Try These Steps', showBack: true, backUrl: '/customer/ai/' + this.id + '/result', showBell: false });
    const viewport = inject(ViewportScroller);
    afterNextRender(() => viewport.scrollToPosition([0, 0]));
  }

  ngOnInit(): void {
    if (!this.id) return;
    this.api.getAnalysis(this.id).subscribe({
      next: item => this.analysis.set(item),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load repair steps.')),
    });
  }

  toggle(step: number, checked: boolean): void {
    this.completed.update(steps => checked ? [...steps, step] : steps.filter(value => value !== step));
  }

  solve(): void {
    const analysis = this.analysis();
    if (!this.id || this.pending() || analysis?.state !== 'ready' || analysis.diyAllowed === false || !analysis.steps.length) return;
    this.pending.set(true);
    this.failure.set('');
    this.api.markSolved(this.id).pipe(finalize(() => this.pending.set(false))).subscribe({
      next: () => void this.router.navigate(['/customer/ai/problem-solved']),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not mark the request as solved.')),
    });
  }
}
