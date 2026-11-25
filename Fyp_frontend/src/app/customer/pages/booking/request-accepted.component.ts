import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { JobTrackingService, TrackingInfo } from '../../services/job-tracking.service';

@Component({
  selector: 'app-request-accepted',
  imports: [RouterLink, DecimalPipe],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Request Accepted</h1>
      @if (failure()) {
        <p class="flow-warning" role="alert">{{ failure() }}</p>
        <button class="btn btn-secondary" (click)="load()">Try Again</button>
      } @else if (record(); as request) {
        @if (request.offerStatus === 'accepted') {
          <div class="flow-outcome">
            <span class="flow-symbol flow-success" aria-hidden="true">✓</span>
            <h2>Request accepted</h2>
          </div>
          @if (request.technician; as tech) {
            <article class="card flow-card flow-person"><span class="flow-avatar">{{ tech.avatarInitials }}</span><div>
              <strong>{{ tech.name }}</strong>
              <p class="flow-muted">{{ tech.company }}</p>
              <p>★ {{ tech.rating ?? 'N/A' }} ({{ tech.reviewCount }} reviews)</p>
            </div></article>
          }
          <article class="card flow-card flow-stack">
            <h2>Job details</h2>
            <dl>
              <dt>Job</dt><dd>{{ request.title || request.requestId }}</dd>
              <dt>Category</dt><dd>{{ request.category }}</dd>
              <dt>Access time</dt><dd>{{ request.accessTime || 'N/A' }}</dd>
              <dt>Price</dt><dd>{{ request.offeredPrice === null ? 'N/A' : 'Rs ' + (request.offeredPrice | number) + ' / visit' }}</dd>
              <dt>Status</dt><dd><span class="flow-badge flow-success">Accepted</span></dd>
            </dl>
          </article>
        }
        <div class="flow-actions">
          <a class="btn btn-primary" [routerLink]="['/customer/requests', request.requestId, 'track']">Track Job</a>
        </div>
      } @else {
        <p role="status">Loading request…</p>
      }
    </section>
  `,
})
export class CustomerRequestAcceptedComponent implements OnInit {
  private readonly tracker = inject(JobTrackingService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly failure = signal('');
  readonly record = signal<TrackingInfo | null>(null);

  constructor() {
    inject(HeaderService).setHeader({ title: 'Request Accepted', showBack: true, backUrl: '/customer/requests', showBell: false });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.failure.set('Open a request from My requests.');
      return;
    }
    this.failure.set('');
    this.tracker.trackJob(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: item => this.record.set(item),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load the request.')),
    });
  }
}
