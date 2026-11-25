import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" [class.center-on-mobile]="centerOnMobile" (click)="onBackdropClick()">
        <div class="modal-dialog" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <div class="modal-body-content">
            @if (icon) {
              <div class="modal-icon-wrap" [class.danger]="variant === 'danger'" [class.success]="variant === 'success'">
                <app-icon [name]="icon" size="lg"></app-icon>
              </div>
            }
            <h3 class="modal-title">{{ title }}</h3>
            @if (message) {
              <p class="modal-message">{{ message }}</p>
            }
            <ng-content></ng-content>
          </div>

          <div class="modal-footer-actions">
            <button
              type="button"
              class="btn btn-secondary modal-btn"
              (click)="cancelled.emit()"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn modal-btn"
              [ngClass]="variant === 'danger' ? 'btn-danger' : 'btn-primary'"
              (click)="confirm.emit()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;

      @include mobile {
        align-items: flex-end;
        padding: 0;

        &.center-on-mobile { align-items: center; padding: 16px; }
        &.center-on-mobile .modal-dialog { max-width: 420px; border-radius: var(--radius-xl); }
      }
    }

    .modal-dialog {
      background-color: #ffffff;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-modal);
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      @include mobile {
        max-width: 100%;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .modal-body-content {
      padding: 28px 24px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .modal-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-full);
        background-color: #eff6ff;
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        &.danger {
          background-color: #fee2e2;
          color: #dc2626;
        }

        &.success {
          background-color: #dcfce7;
          color: #16a34a;
        }
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 8px;
      }

      .modal-message {
        font-size: 0.925rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }
    }

    .modal-footer-actions {
      padding: 14px 24px 24px;
      display: flex;
      gap: 12px;

      @include mobile {
        padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
      }

      .modal-btn {
        flex: 1;
        min-height: 48px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() centerOnMobile = false;
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'primary' | 'danger' | 'success' = 'primary';
  @Input() icon?: string;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.isOpen) {
      this.cancelled.emit();
    }
  }

  onBackdropClick() {
    this.cancelled.emit();
  }
}
