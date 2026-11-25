import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Availability } from '../../../core/models/shared.models';

@Component({
  selector: 'app-availability-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="avail-chip" [ngClass]="chipClass">
      <span class="chip-dot"></span>
      <span class="chip-label">{{ displayLabel }}</span>
    </span>
  `,
  styles: [`
    .avail-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.775rem;
      font-weight: 600;
      white-space: nowrap;

      .chip-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
      }

      &.chip-available {
        background-color: var(--status-green-bg);
        color: var(--status-green-text);
      }

      &.chip-busy {
        background-color: var(--status-orange-bg);
        color: var(--status-orange-text);
      }

      &.chip-unavailable {
        background-color: var(--status-grey-bg);
        color: var(--status-grey-text);
      }
    }
  `]
})
export class AvailabilityChipComponent {
  @Input() availability: Availability = 'available';
  @Input() label?: string;

  get chipClass(): string {
    switch (this.availability) {
      case 'available': return 'chip-available';
      case 'busy': return 'chip-busy';
      case 'unavailable': return 'chip-unavailable';
      default: return 'chip-available';
    }
  }

  get displayLabel(): string {
    if (this.label) return this.label;
    switch (this.availability) {
      case 'available': return 'Available now';
      case 'busy': return 'Busy';
      case 'unavailable': return 'Unavailable';
      default: return 'Available';
    }
  }
}
