import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="star-rating" [class.interactive]="!readonly">
      @for (star of [1, 2, 3, 4, 5]; track star) {
        <button
          type="button"
          class="star-btn"
          [disabled]="readonly"
          (mouseenter)="onHover(star)"
          (mouseleave)="onHover(0)"
          (click)="onSelect(star)"
          [attr.aria-label]="star + ' stars'"
        >
          <span class="star-icon" [class.filled]="isFilled(star)">
            <app-icon name="star" [size]="size"></app-icon>
          </span>
        </button>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &.interactive .star-btn {
        cursor: pointer;
        transition: transform 0.15s ease;

        &:hover {
          transform: scale(1.15);
        }
      }

      .star-btn {
        background: transparent;
        border: none;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:disabled {
          cursor: default;
        }

        .star-icon {
          color: #cbd5e1;
          display: flex;
          transition: color 0.15s ease;

          &.filled {
            color: #f59e0b;
          }
        }
      }
    }
  `]
})
export class StarRatingComponent {
  @Input() rating = 5;
  @Input() readonly = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() ratingChange = new EventEmitter<number>();

  hoveredRating = 0;

  isFilled(star: number): boolean {
    const active = this.hoveredRating > 0 ? this.hoveredRating : this.rating;
    return star <= active;
  }

  onHover(star: number): void {
    if (!this.readonly) {
      this.hoveredRating = star;
    }
  }

  onSelect(star: number): void {
    if (!this.readonly) {
      this.rating = star;
      this.ratingChange.emit(star);
    }
  }
}
