import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { exhaustMap, finalize, take, takeWhile, timer } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';
import { AiAnalysis } from '../../models/customer.models';
import { AiAnalysisService } from '../../services/ai-analysis.service';
import { ProblemReportService } from '../../services/problem-report.service';

@Component({
  selector: 'app-ai-analysis',
  imports: [RouterLink],
  template: `
    <section class="flow-screen">
      <div class="flow-center">
        @if (failure()) {
          <p role="alert">{{ failure() }}</p>
          @if (id || report.draft()) {
            <button class="btn btn-primary" (click)="load()" [disabled]="busy()">Try again</button>
          }
          @if (id) {
            <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'options']">Find a Technician</a>
          } @else {
            <a class="btn btn-secondary" routerLink="/customer/report/review">Back to Review Photo</a>
          }
        } @else {
          <span aria-hidden="true" class="flow-spinner"></span>
          <h1 role="status">{{ id ? 'Analyzing your problem…' : 'Saving your request…' }}</h1>
          <ul class="flow-list">
            <li><span aria-hidden="true">{{ progress()?.visionState ? '✓' : '○' }}</span>
              {{ progress()?.visionState === 'skipped' ? 'No image attached' :
                 progress()?.visionState === 'failed' ? 'Image analysis unavailable' : 'Image analyzed' }}</li>
            <li><span aria-hidden="true">{{ progress()?.visionState === 'ready' || progress()?.state === 'ready' ? '✓' : '○' }}</span> Problem identified</li>
            <li><span aria-hidden="true">{{ progress()?.state === 'ready' ? '✓' : '○' }}</span>
              {{ progress()?.stage === 'guidance' ? 'Checking safe repair steps' : 'Preparing repair guidance' }}</li>
          </ul>
        }
      </div>
    </section>
  `,
})
export class AiAnalysisComponent implements OnInit {
  readonly report = inject(ProblemReportService);
  private readonly analysis = inject(AiAnalysisService);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly failure = signal('');
  readonly busy = signal(false);
  readonly progress = signal<AiAnalysis | null>(null);

  constructor() {
    inject(HeaderService).setHeader({ title: 'AI Analysis', showBack: false, showBell: false });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    if (this.busy()) return;
    this.failure.set('');
    const id = this.id;
    const draft = this.report.draft();
    if (!id && !draft) {
      this.failure.set('Your report was not saved. Return to the report form.');
      return;
    }
    this.busy.set(true);
    if (id) {
      timer(0, 1500).pipe(
        exhaustMap(() => this.analysis.getAnalysis(id)),
        take(120),
        takeWhile(value => value.state === 'pending', true),
        takeUntilDestroyed(this.destroy),
        finalize(() => this.busy.set(false)),
      ).subscribe({
        next: value => {
          this.progress.set(value);
          if (value.state !== 'pending') void this.router.navigate(['/customer/ai', id, 'result'], { replaceUrl: true });
        },
        error: (error: unknown) => this.failure.set(errorMessage(error, 'Unable to check analysis progress.')),
        complete: () => {
          if (this.progress()?.state === 'pending') this.failure.set('Analysis is taking longer than expected.');
        },
      });
    } else if (draft) {
      this.report.createRequest(draft).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(false))).subscribe({
        next: request => {
          this.report.draft.set(null);
          void this.router.navigate(['/customer/ai', request.id, 'analysis'], { replaceUrl: true });
        },
        error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not save your request. Try again.')),
      });
    }
  }
}
