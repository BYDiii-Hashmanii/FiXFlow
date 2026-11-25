import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="empty-state-box card">
      <div class="empty-icon-wrap">
        <app-icon [name]="icon" size="lg"></app-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      @if (description) {
        <p class="empty-desc">{{ description }}</p>
      }
      @if (actionLabel) {
        <button type="button" class="btn btn-primary btn-sm action-btn" (click)="actionClick.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-box {
      text-align: center;
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .empty-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-full);
        background-color: #f1f5f9;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
      }

      .empty-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .empty-desc {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        max-width: 340px;
        line-height: 1.5;
      }

      .action-btn {
        margin-top: 8px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'clock';
  @Input() title = 'No items found';
  @Input() description = '';
  @Input() actionLabel = '';

  @Output() actionClick = new EventEmitter<void>();
}
