import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { AiAnalysis } from '../../models/customer.models';
import { AiAnalysisService } from '../../services/ai-analysis.service';

@Component({
  selector: 'app-try-steps',
  imports: [RouterLink],
  template: `
    <section class="card steps">
      <h1>Repair steps</h1>
      @if (failure()) { <p role="alert">{{ failure() }}</p> }
      @if (analysis(); as result) {
        @if (result.state === 'ready') {
          <p>{{ result.safetyNote }}</p>
          <ol>
            @for (step of result.steps; track step.stepNo) {
              <li><label><input type="checkbox" /> {{ step.instruction }}</label></li>
            }
          </ol>
          <button class="btn btn-primary" [disabled]="pending()" (click)="solve()">Mark as solved</button>
        } @else {
          <p>Repair steps are unavailable for this request.</p>
        }
      }
      <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'options']">Book a technician</a>
    </section>
  `,
  styles: ['.steps { max-width: 42rem; margin: 1rem auto; padding: 1.25rem; } li { padding: .375rem 0; } .btn { margin: .25rem; }'],
})
export class TryStepsComponent implements OnInit {
  private readonly api = inject(AiAnalysisService);
  private readonly router = inject(Router);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly analysis = signal<AiAnalysis | null>(null);
  readonly failure = signal('');
  readonly pending = signal(false);

  ngOnInit(): void {
    if (!this.id) return;
    this.api.getAnalysis(this.id).subscribe({
      next: item => this.analysis.set(item),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load repair steps.')),
    });
  }

  solve(): void {
    if (!this.id || this.pending()) return;
    this.pending.set(true);
    this.failure.set('');
    this.api.markSolved(this.id).subscribe({
      next: () => void this.router.navigate(['/customer/ai/problem-solved']),
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not mark the request as solved.'));
        this.pending.set(false);
      },
      complete: () => this.pending.set(false),
    });
  }
}
