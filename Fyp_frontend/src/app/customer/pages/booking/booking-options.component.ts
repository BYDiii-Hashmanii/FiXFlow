import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-options',
  imports: [RouterLink],
  template: `
    <section class="card booking">
      <h1>Book a technician</h1>
      <p>See an available match or choose from the directory.</p>
      <div class="actions">
        <a class="btn btn-primary" [routerLink]="['/customer/booking', requestId, 'auto-select']">Auto Select</a>
        <a class="btn btn-secondary" [routerLink]="['/customer/booking', requestId, 'choose']">Choose Technician</a>
      </div>
      <a [routerLink]="['/customer/requests', requestId, 'track']">Back to request</a>
    </section>
  `,
  styles: [`
    .booking { max-width: 44rem; margin: 1rem auto; padding: clamp(1rem, 4vw, 2rem); }
    .actions { display: flex; gap: .5rem; flex-wrap: wrap; margin-block: 1rem; }
    ul { padding: 0; list-style: none; }
    li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; padding-block: .75rem; }
  `],
})
export class BookingOptionsComponent {
  readonly requestId = inject(ActivatedRoute).snapshot.paramMap.get('id');
}
