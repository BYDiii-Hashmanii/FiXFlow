import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { ApiClientService } from '../api/api-client.service';
import { API } from '../api/api-endpoints';
import { Role, User } from '../models/shared.models';

export interface SessionUser extends Omit<User, 'role'> {
  role: Role;
  company?: string;
}

interface SignedInUser extends SessionUser {
  token: string;
}

const tokenKey = 'fixflow_token';
const roleKey = 'fixflow_role';
const sessionKeys = [tokenKey, roleKey, 'fixflow_user', 'fixflow_owner_user'];

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly router = inject(Router);
  private readonly api = inject(ApiClientService);
  private readonly userSignal = signal<SessionUser | null>(null);
  private readonly tokenSignal = signal(this.storage?.getItem(tokenKey) ?? null);

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isLoggedIn = computed(() => !!this.user() && !!this.token());

  private get storage(): Storage | undefined {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  }

  async restore(): Promise<void> {
    if (!this.token()) return;
    try {
      this.userSignal.set(await firstValueFrom(this.api.get<SessionUser>(API.auth.me)));
    } catch {
      this.clearSession();
    }
  }

  login(phoneOrEmail: string, password: string, expectedRole: Role) {
    return this.api.post<SignedInUser>(API.auth.login, { phoneOrEmail, password }).pipe(
      map(response => this.openSession(response, expectedRole)),
    );
  }

  register(payload: { fullName: string; phone: string; email?: string; password: string }) {
    return this.api.post<SignedInUser>(API.auth.register, payload).pipe(
      map(response => this.openSession(response, 'customer')),
    );
  }

  private openSession(response: SignedInUser, expectedRole: Role): SessionUser {
    const { token, ...user } = response;
    if (!token || user.role !== expectedRole) {
      throw new Error('This account does not have access to this portal.');
    }
    this.clearSession();
    this.storage?.setItem(tokenKey, token);
    this.storage?.setItem(roleKey, user.role);
    this.tokenSignal.set(token);
    this.userSignal.set(user);
    void this.router.navigateByUrl(this.getHomeRoute(user.role));
    return user;
  }

  updateUser(user: User): void {
    const current = this.user();
    if (current && user.id === current.id && user.role === current.role) {
      this.userSignal.set({ ...current, ...user, role: current.role });
    }
  }

  clearSession(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    sessionKeys.forEach(key => this.storage?.removeItem(key));
  }

  expireSession(): void {
    const role = this.role() ?? this.storage?.getItem(roleKey);
    this.clearSession();
    if (role === 'customer' || role === 'technician' || role === 'owner') {
      void this.router.navigate(['/login', role]);
    }
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/roles']);
  }

  getHomeRoute(role: Role): string {
    return { customer: '/customer/home', technician: '/technician/dashboard', owner: '/owner/dashboard' }[role];
  }
}
