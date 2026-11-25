import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { JobTrackingService, TrackingInfo } from '../../services/job-tracking.service';

@Component({
  selector: 'app-request-accepted',
  imports: [RouterLink],
  template: `
    <section class="card outcome">
      <h1>Request accepted</h1>
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
      } @else if (record(); as request) {
        @if (request.technician; as technician) { <p>{{ technician.name }} · {{ technician.company }}</p> }
        
        <a class="btn btn-secondary" [routerLink]="['/customer/requests', request.requestId, 'track']">Track request</a>
      } @else {
        <p role="status">Loading request…</p>
      }
      <a class="btn btn-secondary" routerLink="/customer/requests">My requests</a>
    </section>
  `,
  styles: ['.outcome { max-width: 36rem; margin: 1rem auto; padding: 1.25rem; }.btn { margin: .25rem; }'],
})
export class CustomerRequestAcceptedComponent implements OnInit {
  private readonly tracker = inject(JobTrackingService);
  private readonly route = inject(ActivatedRoute);
  readonly failure = signal('');
  readonly record = signal<TrackingInfo | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.failure.set('Open a request from My requests.');
      return;
    }
    this.tracker.trackJob(id).subscribe({
      next: item => this.record.set(item),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load the request.')),
    });
  }
}
