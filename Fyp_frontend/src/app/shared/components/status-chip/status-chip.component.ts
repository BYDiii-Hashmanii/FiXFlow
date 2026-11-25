import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="chip" [ngClass]="computedClass">
      <span class="chip-dot"></span>
      <span class="chip-label">{{ label || statusText }}</span>
    </span>
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.775rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;

      .chip-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
      }

      &.chip-green {
        background-color: var(--status-green-bg);
        color: var(--status-green-text);
      }

      &.chip-orange {
        background-color: var(--status-orange-bg);
        color: var(--status-orange-text);
      }

      &.chip-grey {
        background-color: var(--status-grey-bg);
        color: var(--status-grey-text);
      }

      &.chip-red {
        background-color: var(--status-red-bg);
        color: var(--status-red-text);
      }

      &.chip-blue {
        background-color: var(--status-blue-bg);
        color: var(--status-blue-text);
      }
    }
  `]
})
export class StatusChipComponent {
  @Input() status = '';
  @Input() label = '';
  @Input() variant?: 'green' | 'orange' | 'grey' | 'red' | 'blue';

  get computedClass(): string {
    if (this.variant) {
      return `chip-${this.variant}`;
    }

    const s = this.status.toLowerCase();
    if (['paid', 'accepted', 'closed_paid', 'closed', 'completed', 'active', 'solved', 'solved_by_customer'].includes(s)) {
      return 'chip-green';
    }
    if (['waiting', 'in_progress', 'pending', 'unpaid', 'medium'].includes(s)) {
      return 'chip-orange';
    }
    if (['declined', 'cancelled', 'urgent', 'high'].includes(s)) {
      return 'chip-red';
    }
    if (['draft', 'inactive'].includes(s)) {
      return 'chip-grey';
    }
    return 'chip-blue';
  }

  get statusText(): string {
    switch (this.status) {
      case 'closed_paid': return 'Closed · Paid';
      case 'in_progress': return 'Work in progress';
      case 'solved_by_customer': return 'Solved by customer';
      case 'waiting': return 'Waiting';
      case 'accepted': return 'Accepted';
      case 'completed': return 'Completed';
      case 'unpaid': return 'Unpaid';
      case 'paid': return 'Paid';
      case 'declined': return 'Declined';
      case 'draft': return 'Draft';
      default: return this.status;
    }
  }
}
