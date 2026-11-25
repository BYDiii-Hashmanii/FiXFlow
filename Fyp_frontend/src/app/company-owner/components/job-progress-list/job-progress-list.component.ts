import { Component, Input } from '@angular/core';

import { JobProgressItem } from '../../models/owner.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-job-progress-list',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="job-progress-card card">
      <h3 class="progress-title">Job progress</h3>

      <div class="timeline">
        @for (step of steps; track step.label; let last = $last) {
          <div class="timeline-step" [class.done]="step.done" [class.last-step]="last">
            <div class="step-indicator">
              <div class="step-circle">
                @if (step.done) {
                  <app-icon name="check" size="sm"></app-icon>
                }
              </div>
              @if (!last) {
                <div class="step-line" [class.active-line]="step.done"></div>
              }
            </div>

            <div class="step-body">
              <span class="step-label">{{ step.label }}</span>
              @if (step.time) {
                <span class="step-time">· {{ step.time }}</span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .job-progress-card {
        padding: 24px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);

        .progress-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 20px 0;
        }

        .timeline {
          display: flex;
          flex-direction: column;

          .timeline-step {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            min-height: 48px;

            &.last-step {
              min-height: auto;
            }

            .step-indicator {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 24px;

              .step-circle {
                width: 22px;
                height: 22px;
                border-radius: var(--radius-full);
                background-color: #e2e8f0;
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: background-color var(--transition-fast);
              }

              .step-line {
                width: 2px;
                flex: 1;
                min-height: 26px;
                background-color: #e2e8f0;

                &.active-line {
                  background-color: #16a34a;
                }
              }
            }

            &.done {
              .step-circle {
                background-color: #16a34a;
              }
            }

            .step-body {
              padding-top: 2px;
              font-size: 0.9rem;
              color: var(--color-text-primary);
              line-height: 1.3;

              .step-label {
                font-weight: 500;
              }

              .step-time {
                color: var(--color-text-muted);
                margin-left: 4px;
              }
            }
          }
        }
      }
    `,
  ],
})
export class OwnerJobProgressListComponent {
  @Input({ required: true }) steps: JobProgressItem[] = [];
}

export { OwnerJobProgressListComponent as JobProgressListComponent };
