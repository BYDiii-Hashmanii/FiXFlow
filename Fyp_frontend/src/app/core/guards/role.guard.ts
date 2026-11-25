import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state.service';
import { Role } from '../models/shared.models';

export function roleGuard(required: Role): CanActivateFn {
  return () => {
    const auth = inject(AuthStateService);
    const role = auth.role();
    if (auth.isLoggedIn() && role === required) return true;
    const router = inject(Router);
    return role
      ? router.parseUrl(auth.getHomeRoute(role))
      : router.createUrlTree(['/login', required]);
  };
}
