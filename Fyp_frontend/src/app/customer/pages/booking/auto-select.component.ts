import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-auto-select',
  imports: [RouterLink],
  template: `
    <section class="card booking">
      <h1>Auto Select</h1>
      <p>Find an available technician in your service category.</p>
      @if (failure()) { <p role="alert">{{ failure() }}</p> }
      <div class="actions">
        <button class="btn btn-primary" [disabled]="loading()" (click)="find()">{{ loading() ? 'Finding a match…' : 'Find a technician' }}</button>
        <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'choose']">Choose manually</a>
      </div>
    </section>
  `,
  styles: [`
    .booking { max-width: 44rem; margin: 1rem auto; padding: clamp(1rem, 4vw, 2rem); }
    .actions { display: flex; gap: .5rem; flex-wrap: wrap; margin-block: 1rem; }
    ul { padding: 0; list-style: none; }
    li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; padding-block: .75rem; }
  `],
})
export class AutoSelectComponent {
  private readonly api = inject(TechnicianService);
  private readonly router = inject(Router);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly loading = signal(false);
  readonly failure = signal('');

  find(): void {
    if (!this.id || this.loading()) return;
    this.failure.set('');
    this.loading.set(true);
    this.api.autoSelect(this.id).subscribe({
      next: tech => void this.router.navigate(['/customer/booking', this.id, 'selected', tech.id]),
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'No available technician was found.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
