import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { ServiceRequest, TechnicianInfo } from '../../models/customer.models';
import { JobTrackingService } from '../../services/job-tracking.service';
import { RequestService } from '../../services/request.service';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-choose-technician',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="card booking">
      <h1>Choose a technician</h1>
      @if (request(); as item) { <p>{{ item.category }}</p> }
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
        <button class="btn btn-secondary" (click)="load()">Try again</button>
      } @else if (loading()) {
        <p role="status">Loading technicians…</p>
      } @else {
        <ul>
          @for (tech of technicians(); track tech.id) {
            <li>
              <div><strong>{{ tech.name }}</strong><br />{{ tech.company }} · Rating {{ tech.rating ?? 'N/A' }} · Rs {{ tech.rate | number }}</div>
              <a class="btn btn-primary" [routerLink]="['/customer/booking', requestId, 'selected', tech.id]">Choose</a>
            </li>
          } @empty { <li>No other technicians are available in this category.</li> }
        </ul>
      }
      <a [routerLink]="['/customer/booking', requestId, 'options']">Booking options</a>
    </section>
  `,
  styles: [`
    .booking { max-width: 44rem; margin: 1rem auto; padding: clamp(1rem, 4vw, 2rem); }
    .actions { display: flex; gap: .5rem; flex-wrap: wrap; margin-block: 1rem; }
    ul { padding: 0; list-style: none; }
    li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; padding-block: .75rem; }
  `],
})
export class ChooseTechnicianComponent implements OnInit {
  private readonly api = inject(TechnicianService);
  private readonly requests = inject(RequestService);
  private readonly tracking = inject(JobTrackingService);
  private readonly destroy = inject(DestroyRef);
  readonly requestId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly request = signal<ServiceRequest | null>(null);
  readonly technicians = signal<TechnicianInfo[]>([]);
  readonly failure = signal('');
  readonly loading = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.requestId;
    if (!id || this.loading()) return;
    this.failure.set('');
    this.loading.set(true);
    this.requests.getById(id).pipe(
      tap(request => this.request.set(request)),
      switchMap(request => forkJoin([this.api.list(request.categoryId), this.tracking.trackJob(id)])),
      takeUntilDestroyed(this.destroy),
    ).subscribe({
      next: ([people, tracked]) => {
        this.technicians.set(people.filter(person =>
          person.availability === 'available' && !tracked.previousTechnicianIds.includes(person.id),
        ));
      },
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not load the technician directory.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
