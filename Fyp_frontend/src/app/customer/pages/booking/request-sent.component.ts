import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { Subscription } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { BookingService } from '../../services/booking.service';
import { TrackingInfo } from '../../services/job-tracking.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-request-sent',
  imports: [RouterLink, DecimalPipe],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Request Sent</h1>
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
        @if (requestId) { <button class="btn btn-secondary" (click)="watch()">Try again</button> }
      } @else {
        <div class="sent-heading">
          <span class="flow-symbol flow-avatar" aria-hidden="true">➤</span>
          <h2>Request sent</h2>
          <p class="flow-muted" role="status">Waiting for technician response.</p>
        </div>
      }
      @if (record(); as item) {
        <article class="card flow-card">
          <dl>
            <dt>Technician</dt><dd>{{ item.technician?.name ?? 'N/A' }}</dd>
            <dt>Company</dt><dd>{{ item.technician?.company ?? 'N/A' }}</dd>
            <dt>Price</dt><dd>{{ item.offeredPrice === null ? 'N/A' : 'Rs ' + (item.offeredPrice | number) }}</dd>
            <dt>Request status</dt><dd><span class="flow-badge flow-warning">Waiting for response</span></dd>
          </dl>
        </article>
      }
      <div class="flow-actions">
        @if (requestId) { <a class="btn btn-primary" [routerLink]="['/customer/requests', requestId, 'track']">Track Request</a> }
        <a class="btn btn-secondary" routerLink="/customer/home">Back to Home</a>
      </div>
    </section>
  `,
  styles: ['.sent-heading { display: grid; justify-items: center; gap: .5rem; padding: 1.5rem 0 .75rem; text-align: center; }'],
})
export class RequestSentComponent implements OnInit {
  private readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly failure = signal('');
  readonly record = signal<TrackingInfo | null>(null);
  readonly requestId = this.route.snapshot.paramMap.get('id');
  private subscription?: Subscription;

  constructor() {
    inject(HeaderService).setHeader({ title: 'Request Sent', showBack: true, backUrl: '/customer/requests', showBell: false });
  }

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
        if (state.status === 'waiting' && state.offerStatus === 'pending') this.record.set(state);
        if (state.status === 'declined' || ['accepted', 'in_progress', 'completed', 'closed_paid'].includes(state.status)) {
          const path = state.status === 'declined' ? 'technician-declined' : 'request-accepted';
          void this.router.navigate(['/customer/booking', id, path]);
        } else if (state.status !== 'waiting' || state.offerStatus !== 'pending') {
          void this.router.navigate(['/customer/requests', id, 'track']);
        }
      },
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not refresh the request status.')),
    });
  }
}
