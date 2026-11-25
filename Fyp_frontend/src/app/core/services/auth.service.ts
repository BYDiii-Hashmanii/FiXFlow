import { inject, Injectable, signal } from '@angular/core';
import { AuthStateService } from '../auth/auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = inject(AuthStateService);
  readonly currentUser = this.authState.user;
  readonly isLoggedIn = this.authState.isLoggedIn;

  login(identifier: string, password: string) {
    return this.authState.login(identifier, password, 'technician');
  }

  readonly showLogoutModal = signal(false);

  openLogoutModal(): void {
    this.showLogoutModal.set(true);
  }

  closeLogoutModal(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    this.closeLogoutModal();
    this.authState.logout();
  }
}
