import { inject } from '@angular/core';
import { CanActivateFn, PRIMARY_OUTLET, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStateService);
  if (auth.isLoggedIn()) return true;
  const router = inject(Router);
  const portal = router.parseUrl(state.url).root.children[PRIMARY_OUTLET]?.segments[0]?.path;
  return portal === 'customer' || portal === 'technician' || portal === 'owner'
    ? router.createUrlTree(['/login', portal])
    : router.createUrlTree(['/roles']);
};
