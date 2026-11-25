import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../auth/auth-state.service';
import { environment } from '../config/environment';

export function apiPath(url: string): string | null {
  const base = new URL(environment.apiUrl, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
  const destination = new URL(url, typeof window === 'undefined' ? base.origin : window.location.origin);
  const prefix = base.pathname.replace(/\/$/, '');
  return destination.origin === base.origin && destination.pathname.startsWith(prefix + '/')
    ? destination.pathname.slice(prefix.length)
    : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const path = apiPath(req.url);
  const token = inject(AuthStateService).token();
  if (token && path && path !== '/auth/login' && path !== '/auth/register') {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
