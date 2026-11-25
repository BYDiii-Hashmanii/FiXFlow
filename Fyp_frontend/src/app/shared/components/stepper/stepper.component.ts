import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface StepItem {
  label: string;
  sublabel?: string;
  completed: boolean;
  active?: boolean;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="stepper-list">
      @for (step of steps; track step.label; let i = $index) {
        <div
          class="stepper-item"
          [class.completed]="step.completed"
          [class.active]="step.active"
        >
          <div class="step-indicator">
            @if (step.completed) {
              <app-icon name="check" size="sm"></app-icon>
            } @else if (step.active) {
              <span class="pulse-dot"></span>
            } @else {
              <span class="step-number">{{ i + 1 }}</span>
            }
          </div>
          <div class="step-text">
            <span class="step-label">{{ step.label }}</span>
            @if (step.sublabel) {
              <span class="step-sublabel">{{ step.sublabel }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stepper-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      padding-left: 6px;

      &::before {
        content: '';
        position: absolute;
        left: 19px;
        top: 12px;
        bottom: 12px;
        width: 2px;
        background-color: #e2e8f0;
        z-index: 1;
      }

      .stepper-item {
        display: flex;
        align-items: center;
        gap: 14px;
        position: relative;
        z-index: 2;

        .step-indicator {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 2px solid #cbd5e1;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;

          .pulse-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
          }
        }

        .step-text {
          display: flex;
          flex-direction: column;

          .step-label {
            font-size: 0.925rem;
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .step-sublabel {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }
        }

        &.completed {
          .step-indicator {
            background-color: #16a34a;
            border-color: #16a34a;
            color: #ffffff;
          }
        }

        &.active {
          .step-indicator {
            border-color: var(--color-primary);
          }
          .step-label {
            color: var(--color-primary);
          }
        }
      }
    }
  `]
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
}
