import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { TECHNICIAN_ROUTES } from './technician/technician.routes';

export const routes: Routes = [
  // 1. Single App-Level Splash (FixFlow logo, 1.5s timer -> /roles or role home)
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./auth/splash/splash.component').then(m => m.SplashComponent),
    title: 'FixFlow'
  },

  // 2. Role Selection Screen (/roles)
  {
    path: 'roles',
    loadComponent: () => import('./auth/role-selection/role-selection.component').then(m => m.RoleSelectionComponent),
    title: 'Select Role - FixFlow'
  },

  // 3. Unified Role-Specific Login Routes (/login/:role)
  {
    path: 'login/customer',
    loadComponent: () => import('./customer/pages/auth/login/login.component').then(m => m.CustomerLoginComponent),
    title: 'Customer Login - FixFlow'
  },
  {
    path: 'login/technician',
    loadComponent: () => import('./technician/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Technician Login - FixFlow'
  },
  {
    path: 'login/owner',
    loadComponent: () => import('./company-owner/pages/auth/owner-login/owner-login.component').then(m => m.OwnerLoginComponent),
    title: 'Owner Login - FixFlow'
  },
  {
    path: 'login',
    pathMatch: 'full',
    redirectTo: 'roles'
  },

  { path: 'customer/login', pathMatch: 'full', redirectTo: 'login/customer' },
  {
    path: 'customer/sign-up',
    loadComponent: () => import('./customer/pages/auth/sign-up/sign-up.component').then(m => m.CustomerSignUpComponent),
  },

  // 4. Customer Portal (all /customer/* routes, wrapped in CustomerShellComponent)
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard('customer')],
    loadChildren: () => import('./customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
  },

  // 5. Technician Portal explicitly under /technician (wrapped in AppShellComponent)
  {
    path: 'technician',
    canActivate: [authGuard, roleGuard('technician')],
    children: TECHNICIAN_ROUTES
  },

  // 6. Company Owner Portal under /owner (wrapped in OwnerShellComponent)
  {
    path: 'owner',
    canActivate: [authGuard, roleGuard('owner')],
    loadChildren: () => import('./company-owner/owner.routes').then(m => m.OWNER_ROUTES)
  },

  // 8. Fallback 404
  {
    path: '**',
    loadComponent: () => import('./technician/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 Not Found - FixFlow'
  }
];
