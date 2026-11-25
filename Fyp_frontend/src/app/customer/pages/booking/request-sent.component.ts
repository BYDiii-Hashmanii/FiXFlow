import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-request-sent',
  imports: [RouterLink],
  template: `
    <section class="card waiting">
      <h1>Technician request</h1>
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
        @if (requestId) { <button class="btn btn-secondary" (click)="watch()">Try again</button> }
      } @else {
        <p role="status">Waiting for the technician to respond.</p>
      }
      @if (requestId) {
        <a class="btn btn-primary" [routerLink]="['/customer/requests', requestId, 'track']">Track request</a>
      }
      <a class="btn btn-secondary" routerLink="/customer/requests">My requests</a>
    </section>
  `,
  styles: ['.waiting { max-width: 36rem; margin: 1rem auto; padding: 1.25rem; } .btn { margin: .25rem; }'],
})
export class RequestSentComponent implements OnInit {
  private readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly failure = signal('');
  readonly requestId = this.route.snapshot.paramMap.get('id');
  private subscription?: Subscription;

  ngOnInit(): void {
    this.watch();
  }

  watch(): void {
    const id = this.requestId;
    if (!id) {
      this.failure.set('Open a request from My requests to track its status.');
      return;
    }
    this.subscription?.unsubscribe();
    this.failure.set('');
    this.subscription = this.booking.pollOfferStatus(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: state => {
        if (state.status === 'declined' || ['accepted', 'in_progress', 'completed', 'closed_paid'].includes(state.status)) {
          const path = state.status === 'declined' ? 'technician-declined' : 'request-accepted';
          void this.router.navigate(['/customer/booking', id, path]);
        } else if (state.status !== 'waiting') {
          void this.router.navigate(['/customer/requests', id, 'track']);
        }
      },
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not refresh the request status.')),
    });
  }
}
