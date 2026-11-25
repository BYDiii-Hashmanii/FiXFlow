import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobTrackingService, TrackingInfo } from '../../services/job-tracking.service';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';

const statusLabels: Record<TrackingInfo['status'], string> = {
  ai_analysis: 'Ready to book', waiting: 'Waiting for technician', declined: 'Technician declined',
  accepted: 'Accepted', in_progress: 'Work in progress', completed: 'Work completed',
  closed_paid: 'Closed and paid', cancelled: 'Cancelled', solved_by_customer: 'Solved',
};

@Component({
  selector: 'app-track-job',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Track Job</h1>
      @if (statusError()) {
        <p role="alert">{{ statusError() }}</p>
        <button class="btn btn-secondary" (click)="load()">Try again</button>
      } @else if (record(); as request) {
        <article class="card flow-card flow-row">
          <div><h2>{{ request.title || 'Service request' }}</h2><p class="flow-muted">Request #{{ request.requestId }}</p></div>
          <span class="flow-badge" role="status">{{ labels[request.status] }}</span>
        </article>
        @if (request.declineReason) {
          <p>Reason: {{ request.declineReason.replaceAll('_', ' ') }}</p>
        }
        <article class="card flow-card">
          <h2>Progress</h2>
          <ol class="flow-list">
            @for (event of events(request); track event.title) {
              <li>
                <span [class.flow-success]="event.when" class="flow-badge" aria-hidden="true">{{ event.when ? '✓' : '○' }}</span>
                <div>{{ event.title }} @if (event.when) { · <time [attr.datetime]="event.when">{{ event.when | date:'shortTime' }}</time> }</div>
              </li>
            }
          </ol>
        </article>
        @if (request.technician; as tech) {
          <article class="card flow-card flow-person"><span class="flow-avatar">{{ tech.avatarInitials }}</span><div>
            <strong>{{ tech.name }}</strong><p class="flow-muted">{{ tech.company }}</p>
          </div></article>
        }
        @if (!request.invoiceId && (request.jobStatus === 'accepted' || request.jobStatus === 'in_progress' || request.invoiceEligible)) {
          <p class="flow-note">When the work is completed, your invoice will arrive here and in Notifications.</p>
        }
        <div class="flow-actions">
          @if (request.retryAllowed || request.status === 'ai_analysis') {
            <a class="btn btn-primary" [routerLink]="['/customer/booking', request.requestId, 'choose']">Choose a technician</a>
          }
          @if (request.invoiceId) {
            <a class="btn btn-primary" [routerLink]="['/customer/invoices', request.invoiceId]">View invoice</a>
          }
          <button class="btn btn-secondary" (click)="load()" [disabled]="loading()">Refresh</button>
          <a class="btn btn-secondary" routerLink="/customer/requests">Back to My Requests</a>
        </div>
      } @else {
        <p role="status">Loading request…</p>
      }
    </section>
  `,
})
export class TrackJobComponent implements OnInit {
  private readonly tracking = inject(JobTrackingService);
  private readonly route = inject(ActivatedRoute);
  private readonly header = inject(HeaderService);
  private readonly destroy = inject(DestroyRef);
  readonly record = signal<TrackingInfo | null>(null);
  readonly statusError = signal('');
  readonly loading = signal(false);
  readonly labels = statusLabels;

  ngOnInit(): void {
    this.header.setHeader({ title: 'Track Job', showBack: true, backUrl: '/customer/requests', showBell: false });
    this.load();
  }

  events(record: TrackingInfo) {
    const time = record.timeline;
    return [
      { title: 'Request Accepted', when: time.acceptedAt },
      { title: 'Work Started', when: time.startedAt },
      { title: 'Work Completed', when: time.completedAt },
    ];
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || this.loading()) return;
    this.loading.set(true);
    this.statusError.set('');
    this.tracking.trackJob(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: result => this.record.set(result),
      error: (error: unknown) => {
        this.statusError.set(errorMessage(error, 'Could not load this request.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
