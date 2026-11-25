import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { environment } from '../../core/config/environment';

@Component({
  selector: 'app-protected-photo',
  template: `
    @if (source()) {
      <img [src]="source()" [alt]="label()" />
    } @else if (failed()) {
      <span role="status">Photo unavailable.</span>
    } @else {
      <span role="status">Loading photo…</span>
    }
  `,
  styles: ['img { display: block; max-width: 100%; max-height: 16rem; object-fit: contain; }'],
})
export class ProtectedPhotoComponent {
  private readonly http = inject(HttpClient);
  readonly path = input.required<string>();
  readonly label = input('Service photo');
  readonly source = signal<string | null>(null);
  readonly failed = signal(false);

  constructor() {
    effect(onCleanup => {
      const path = this.path();
      this.source.set(null);
      this.failed.set(false);
      if (!path.startsWith('/uploads/')) {
        this.failed.set(true);
        return;
      }
      let objectUrl: string | undefined;
      const subscription = this.http.get(environment.apiUrl + path, { responseType: 'blob' }).subscribe({
        next: image => {
          objectUrl = URL.createObjectURL(image);
          this.source.set(objectUrl);
        },
        error: () => this.failed.set(true),
      });
      onCleanup(() => {
        subscription.unsubscribe();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      });
    });
  }
}
