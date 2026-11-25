import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-owner-category-chip-group, app-category-chip-group',
  standalone: true,
  imports: [],
  template: `
    <div class="category-chip-group" role="radiogroup" aria-label="Service category">
      @for (cat of categories; track cat) {
        <button
          type="button"
          class="cat-chip"
          [class.active]="cat === selected"
          [disabled]="readonly"
          (click)="onSelect(cat)"
          role="radio"
          [attr.aria-checked]="cat === selected"
        >
          {{ cat }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .category-chip-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .cat-chip {
        min-height: 44px;
        padding: 8px 18px;
        border-radius: var(--radius-full);
        border: 1px solid var(--color-border);
        background-color: #ffffff;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all var(--transition-fast);
        display: inline-flex;
        align-items: center;
        justify-content: center;

        &:hover:not(:disabled) {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: #f0f7ff;
        }

        &.active {
          background-color: var(--color-primary);
          border-color: var(--color-primary);
          color: #ffffff;
          font-weight: 600;
        }

        &:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        &:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
      }
    `,
  ],
})
export class CategoryChipGroupComponent {
  @Input() categories: string[] = ['Plumbing', 'Electrical', 'AC Repair', 'Carpentry', 'Appliance'];
  @Input() selected = 'Plumbing';
  @Input() readonly = false;
  @Output() selectedChange = new EventEmitter<string>();

  onSelect(cat: string): void {
    if (this.readonly) return;
    this.selected = cat;
    this.selectedChange.emit(cat);
  }
}
