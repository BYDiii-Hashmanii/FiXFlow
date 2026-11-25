import { PercentPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { exhaustMap, take, takeWhile, timer } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { AiAnalysis } from '../../models/customer.models';
import { AiAnalysisService } from '../../services/ai-analysis.service';

@Component({
  selector: 'app-ai-result',
  imports: [RouterLink, PercentPipe],
  template: `
    <section class="card result">
      <h1>Photo analysis</h1>
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
      } @else if (result(); as analysis) {
        @switch (analysis.state) {
          @case ('ready') {
            <h2>{{ analysis.title }}</h2>
            <p>{{ analysis.summary }}</p>
            <p>Detected category {{ analysis.detectedCategory ?? 'N/A' }} · Confidence {{ (analysis.confidence | percent) ?? 'N/A' }}</p>
            @if (analysis.safetyNote) { <p>{{ analysis.safetyNote }}</p> }
            @if (analysis.steps.length) {
              <a class="btn btn-primary" [routerLink]="['/customer/ai', id, 'try-steps']">View repair steps</a>
            }
          }
          @case ('no_detection') { <p>No supported issue was identified. You can still book a technician.</p> }
          @case ('failed') { <p>Photo analysis is unavailable. You can still book a technician.</p> }
          @default { <p role="status">Photo analysis is pending. You can book a technician while it runs.</p> }
        }
      } @else {
        <p role="status">Loading analysis…</p>
      }
      <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'options']">Book a technician</a>
      <a [routerLink]="['/customer/requests', id, 'track']">Track request</a>
    </section>
  `,
  styles: ['.result { max-width: 42rem; margin: 1rem auto; padding: clamp(1rem, 4vw, 2rem); } a { margin: .25rem; }'],
})
export class AiResultComponent implements OnInit {
  private readonly api = inject(AiAnalysisService);
  private readonly destroy = inject(DestroyRef);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly result = signal<AiAnalysis | null>(null);
  readonly failure = signal('');

  ngOnInit(): void {
    const id = this.id;
    if (!id) return;
    timer(0, 1500).pipe(
      exhaustMap(() => this.api.getAnalysis(id)),
      take(16),
      takeWhile(item => item.state === 'pending', true),
      takeUntilDestroyed(this.destroy),
    ).subscribe({
      next: analysis => this.result.set(analysis),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load analysis.')),
    });
  }
}
