import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderService } from '../../core/services/header.service';
import { ScreenSizeService } from '../../core/services/screen-size.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IconComponent
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss']
})
export class AppShellComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  headerService = inject(HeaderService);
  screenSize = inject(ScreenSizeService);
  router = inject(Router);

  isAuthPage = false;

  constructor() {
    this.checkCurrentRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(event => {
      this.checkCurrentRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkCurrentRoute(url: string): void {
    const cleanUrl = url.split('?')[0];
    this.isAuthPage =
      cleanUrl === '/splash' ||
      cleanUrl === '/login' ||
      cleanUrl === '/technician/splash' ||
      cleanUrl === '/technician/login' ||
      cleanUrl === '/technician' ||
      cleanUrl.endsWith('/splash') ||
      cleanUrl.endsWith('/login') ||
      cleanUrl === '/' ||
      cleanUrl === '';
  }

  goBack(): void {
    const config = this.headerService.config();
    if (config.backUrl) {
      this.router.navigateByUrl(config.backUrl);
    } else {
      window.history.back();
    }
  }

  toggleOnline(): void {
    this.dataService.toggleAvailability();
  }
}
