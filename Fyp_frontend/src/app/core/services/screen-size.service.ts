import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
  private platformId = inject(PLATFORM_ID);

  private mobileQuery?: MediaQueryList;
  private tabletQuery?: MediaQueryList;
  private desktopQuery?: MediaQueryList;

  readonly isMobile = signal<boolean>(false);
  readonly isTablet = signal<boolean>(false);
  readonly isDesktop = signal<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.mobileQuery = window.matchMedia('(max-width: 767.98px)');
      this.tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023.98px)');
      this.desktopQuery = window.matchMedia('(min-width: 1024px)');

      this.updateState();

      const listener = () => this.updateState();
      this.mobileQuery.addEventListener('change', listener);
      this.tabletQuery.addEventListener('change', listener);
      this.desktopQuery.addEventListener('change', listener);
    }
  }

  private updateState(): void {
    if (this.mobileQuery && this.tabletQuery && this.desktopQuery) {
      this.isMobile.set(this.mobileQuery.matches);
      this.isTablet.set(this.tabletQuery.matches);
      this.isDesktop.set(this.desktopQuery.matches);
    }
  }
}
