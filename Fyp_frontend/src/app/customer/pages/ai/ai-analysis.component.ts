import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { ProblemReportService } from '../../services/problem-report.service';

@Component({
  selector: 'app-ai-analysis',
  imports: [RouterLink],
  template: `
    <section class="card analysis">
      <h1>Submitting your request</h1>
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
        @if (hasDraft()) { <button class="btn btn-primary" (click)="submit()" [disabled]="pending()">Try again</button> }
      } @else {
        <p role="status">Saving your request…</p>
      }
      <a class="btn btn-secondary" routerLink="/customer/report">Back to report</a>
    </section>
  `,
  styles: ['.analysis { max-width: 38rem; padding: 1.25rem; margin: 1rem auto; } .btn { margin: .25rem; }'],
})
export class AiAnalysisComponent implements OnInit {
  private readonly report = inject(ProblemReportService);
  private readonly router = inject(Router);
  readonly failure = signal('');
  readonly pending = signal(false);
  readonly hasDraft = this.report.draft.asReadonly();

  ngOnInit(): void { this.submit(); }

  submit(): void {
    const draft = this.report.draft();
    if (this.pending()) return;
    if (!draft) {
      this.failure.set('Your report was not saved. Return to the report form.');
      return;
    }
    this.pending.set(true);
    this.failure.set('');
    this.report.createRequest(draft).subscribe({
      next: request => {
        this.report.draft.set(null);
        void this.router.navigate(['/customer/ai', request.id, 'result']);
      },
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not save your request. Try again.'));
        this.pending.set(false);
      },
      complete: () => this.pending.set(false),
    });
  }
}
