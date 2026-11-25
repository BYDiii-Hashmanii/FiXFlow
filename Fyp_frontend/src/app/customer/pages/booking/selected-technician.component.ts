import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { TechnicianInfo } from '../../models/customer.models';
import { BookingService } from '../../services/booking.service';
import { RequestService } from '../../services/request.service';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-selected-technician',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="card booking">
      <h1>Confirm technician</h1>
      @if (failure()) { <p role="alert">{{ failure() }}</p> }
      @if (selected(); as tech) {
        <p>{{ tech.name }} · {{ tech.company }}</p>
        <p>{{ tech.serviceCategory }} · Rating {{ tech.rating ?? 'N/A' }} · Rs {{ tech.rate | number }}</p>
        <button class="btn btn-primary" [disabled]="pending()" (click)="send()">Send request</button>
      } @else if (!failure()) {
        <p role="status">Loading technician…</p>
      }
      <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'choose']">Choose another technician</a>
    </section>
  `,
  styles: [`
    .booking { max-width: 44rem; margin: 1rem auto; padding: clamp(1rem, 4vw, 2rem); }
    .actions { display: flex; gap: .5rem; flex-wrap: wrap; margin-block: 1rem; }
    ul { padding: 0; list-style: none; }
    li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; padding-block: .75rem; }
  `],
})
export class SelectedTechnicianComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly directory = inject(TechnicianService);
  private readonly booking = inject(BookingService);
  private readonly requests = inject(RequestService);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly selected = signal<TechnicianInfo | null>(null);
  readonly pending = signal(false);
  readonly failure = signal('');

  ngOnInit(): void {
    const techId = this.route.snapshot.paramMap.get('techId');
    if (!this.id || !techId) return;
    forkJoin([this.requests.getById(this.id), this.directory.getById(techId)]).subscribe({
      next: ([request, tech]) => {
        if (request.categoryId !== tech.categoryId || tech.availability !== 'available') {
          this.failure.set('This technician is unavailable for the request.');
        } else {
          this.selected.set(tech);
        }
      },
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load this selection.')),
    });
  }

  send(): void {
    const tech = this.selected();
    if (!this.id || !tech || this.pending()) return;
    this.failure.set('');
    this.pending.set(true);
    this.booking.sendOffer(this.id, tech.id).subscribe({
      next: () => void this.router.navigate(['/customer/booking', this.id, 'request-sent']),
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not send the request. Try again.'));
        this.pending.set(false);
      },
      complete: () => this.pending.set(false),
    });
  }
}
