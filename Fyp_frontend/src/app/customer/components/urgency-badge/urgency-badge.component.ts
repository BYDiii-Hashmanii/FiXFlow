import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Urgency } from '../../models/customer.models';

@Component({
  selector: 'app-urgency-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="urgency-badge" [ngClass]="urgencyClass">
      {{ urgencyLabel }}
    </span>
  `,
  styles: [`
    .urgency-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.775rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;

      &.urgency-medium {
        background-color: var(--status-orange-bg);
        color: var(--status-orange-text);
      }

      &.urgency-high {
        background-color: var(--status-red-bg);
        color: var(--status-red-text);
      }

      &.urgency-low {
        background-color: var(--status-green-bg);
        color: var(--status-green-text);
      }
    }
  `]
})
export class UrgencyBadgeComponent {
  @Input() urgency: Urgency = 'medium';

  get urgencyClass(): string {
    return `urgency-${this.urgency}`;
  }

  get urgencyLabel(): string {
    switch (this.urgency) {
      case 'medium': return 'Medium urgency';
      case 'high': return 'High urgency';
      case 'low': return 'Low urgency';
      default: return `${this.urgency} urgency`;
    }
  }
}
