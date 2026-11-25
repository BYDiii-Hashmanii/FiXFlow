import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick()">
        <div class="modal-dialog" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          @if (title) {
            <div class="modal-header">
              <h3 class="modal-title">{{ title }}</h3>
              @if (showClose) {
                <button type="button" class="btn-close" (click)="dismissed.emit()" aria-label="Close">
                  <app-icon name="x" size="sm"></app-icon>
                </button>
              }
            </div>
          }
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (hasFooter) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
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
      }
    }

    .modal-dialog {
      background-color: #ffffff;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-modal);
      width: 100%;
      max-width: 480px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      @include mobile {
        max-width: 100%;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        max-height: 90dvh;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--color-border-subtle);

      .modal-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .btn-close {
        color: var(--color-text-muted);
        padding: 6px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color var(--transition-fast), color var(--transition-fast);

        &:hover {
          background-color: var(--color-border-subtle);
          color: var(--color-text-primary);
        }
      }
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
    }

    .modal-footer {
      padding: 14px 20px 18px;
      background-color: #fafbfc;
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;

      @include mobile {
        padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px));
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
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showClose = true;
  @Input() hasFooter = true;
  @Input() closeOnBackdrop = true;

  @Output() dismissed = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.isOpen) {
      this.dismissed.emit();
    }
  }

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.dismissed.emit();
    }
  }
}
