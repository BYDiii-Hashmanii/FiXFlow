import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepairStep } from '../../models/customer.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-repair-step-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="repair-step-list">
      @for (step of steps; track step.stepNo) {
        <div
          class="step-item"
          [class.interactive]="interactive"
          [class.checked]="step.completed"
          (click)="toggleStep(step)"
        >
          <div class="checkbox-circle" [class.checked]="step.completed">
            @if (step.completed) {
              <app-icon name="check" size="sm"></app-icon>
            } @else {
              <span class="step-num">{{ step.stepNo }}</span>
            }
          </div>
          <span class="step-text" [class.done]="step.completed">{{ step.instruction }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .repair-step-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .step-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        transition: all var(--transition-fast);

        &.interactive {
          cursor: pointer;

          &:hover {
            border-color: #cbd5e1;
            background-color: #f8fafc;
          }
        }

        &.checked {
          background-color: #f0fdf4;
          border-color: #bbf7d0;
        }

        .checkbox-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          flex-shrink: 0;

          &.checked {
            background-color: #16a34a;
            border-color: #16a34a;
            color: #ffffff;
          }
        }

        .step-text {
          font-size: 0.925rem;
          font-weight: 500;
          color: var(--color-text-primary);
          line-height: 1.4;

          &.done {
            color: #15803d;
            font-weight: 600;
          }
        }
      }
    }
  `]
})
export class RepairStepListComponent {
  @Input() steps: RepairStep[] = [];
  @Input() interactive = false;

  @Output() stepToggled = new EventEmitter<RepairStep>();

  toggleStep(step: RepairStep): void {
    if (this.interactive) {
      step.completed = !step.completed;
      this.stepToggled.emit(step);
    }
  }
}
