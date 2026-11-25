import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [class.overlay]="overlay">
      <div class="spinner"></div>
      @if (message) {
        <span class="loader-message">{{ message }}</span>
      }
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 32px 16px;

      &.overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(2px);
        z-index: 1000;
      }

      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e2e8f0;
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .loader-message {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-text-secondary);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {
  @Input() message = '';
  @Input() overlay = false;
}
