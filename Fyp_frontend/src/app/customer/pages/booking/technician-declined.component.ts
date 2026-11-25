import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { JobTrackingService, TrackingInfo } from '../../services/job-tracking.service';

@Component({
  selector: 'app-technician-declined',
  imports: [RouterLink],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Request Update</h1>
      @if (failure()) {
        <p class="flow-warning" role="alert">{{ failure() }}</p>
        <button class="btn btn-secondary" (click)="load()">Try Again</button>
      } @else if (record(); as request) {
        @if (request.retryAllowed) {
          <div class="flow-outcome">
            <span class="flow-symbol flow-warning" aria-hidden="true">!</span>
            <h2>Technician is unavailable.</h2>
            <p class="flow-muted">{{ request.technician?.name ?? 'The technician' }} can’t take this job right now. Your request is open for rebooking.</p>
            @if (request.declineReason) { <p class="flow-muted">Reason: {{ request.declineReason.replaceAll('_', ' ') }}</p> }
          </div>
          <div class="flow-actions">
            <a class="btn btn-primary" [routerLink]="['/customer/booking', request.requestId, 'choose']">Choose Another Technician</a>
            <a class="btn btn-secondary" [routerLink]="['/customer/booking', request.requestId, 'auto-select']">Try Auto Select</a>
          </div>
        } @else {
          <a class="btn btn-primary" [routerLink]="['/customer/requests', request.requestId, 'track']">Track Request</a>
        }
      } @else {
        <p role="status">Loading request…</p>
      }
    </section>
  `,
})
export class TechnicianDeclinedComponent implements OnInit {
  private readonly tracker = inject(JobTrackingService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly failure = signal('');
  readonly record = signal<TrackingInfo | null>(null);

  constructor() {
    inject(HeaderService).setHeader({ title: 'Request Update', showBack: true, backUrl: '/customer/requests', showBell: false });
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
