import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../auth/auth-state.service';
import { apiPath } from './auth.interceptor';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStateService);
  return next(req).pipe(catchError((error: HttpErrorResponse) => {
    const path = apiPath(req.url);
    if (error.status === 401 && path && path !== '/auth/login' && path !== '/auth/register') {
      auth.expireSession();
    }
    return throwError(() => error);
  }));
};

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const message: unknown = error.error?.message;
    return typeof message === 'string' ? message : fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
