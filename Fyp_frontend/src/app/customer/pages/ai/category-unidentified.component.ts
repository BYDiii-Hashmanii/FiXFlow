import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-category-unidentified',
  imports: [RouterLink, IconComponent],
  template: `
    <article class="card unidentified">
      <span class="status-icon" aria-hidden="true"><app-icon name="alert-circle" size="lg" /></span>
      <h1>Category not identified</h1>
      <p>We couldn’t match your report to a service category. Your report is saved in My Requests.</p>
      @if (safetyNote(); as note) {
        <aside class="safety"><strong>Safety note</strong><p>{{ note }}</p></aside>
      }
      <a class="btn btn-primary" routerLink="/customer/home">Back to Home</a>
    </article>
  `,
  styles: [`
    .unidentified {
      display: grid;
      justify-items: center;
      gap: .875rem;
      width: min(100%, 32rem);
      margin-inline: auto;
      padding: clamp(1.25rem, 5vw, 2rem);
      text-align: center;
    }
    .status-icon {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-full);
      color: var(--color-primary);
      background: var(--color-primary-light);
    }
    .safety {
      width: 100%;
      padding: .75rem;
      border: 1px solid var(--status-orange-border);
      border-radius: var(--radius-md);
      background: var(--status-orange-bg);
      color: var(--status-orange-text);
      text-align: start;
    }
    .safety p { color: inherit; }
    .btn { width: min(100%, 16rem); }
  `],
})
export class CategoryUnidentifiedComponent {
  readonly safetyNote = input<string | null>();
}
