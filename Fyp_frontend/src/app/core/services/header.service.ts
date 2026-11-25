import { Injectable, signal } from '@angular/core';

export interface HeaderConfig {
  title: string;
  showBack: boolean;
  backUrl?: string;
  showBell?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  readonly config = signal<HeaderConfig>({
    title: 'FixFlow',
    showBack: false,
    showBell: true
  });

  setHeader(config: Partial<HeaderConfig>): void {
    this.config.update(c => ({
      ...c,
      ...config
    }));
  }
}
