import { Routes } from '@angular/router';
import { AppShellComponent } from '../layout/app-shell/app-shell.component';

export const TECHNICIAN_CHILD_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard | FixFlow Technician'
  },
  {
    path: 'requests/:id',
    loadComponent: () => import('./requests/incoming-request/incoming-request.component').then(m => m.IncomingRequestComponent),
    title: 'Incoming Request | FixFlow'
  },
  {
    path: 'requests/:id/decline',
    loadComponent: () => import('./requests/decline-request/decline-request.component').then(m => m.DeclineRequestComponent),
    title: 'Decline Request | FixFlow'
  },
  {
    path: 'requests/:id/declined',
    loadComponent: () => import('./requests/request-declined/request-declined.component').then(m => m.RequestDeclinedComponent),
    title: 'Request Declined | FixFlow'
  },
  {
    path: 'requests/:id/accepted',
    loadComponent: () => import('./requests/request-accepted/request-accepted.component').then(m => m.RequestAcceptedComponent),
    title: 'Request Accepted | FixFlow'
  },
  {
    path: 'jobs',
    loadComponent: () => import('./jobs/my-jobs/my-jobs.component').then(m => m.MyJobsComponent),
    title: 'My Jobs | FixFlow'
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./jobs/job-details/job-details.component').then(m => m.JobDetailsComponent),
    title: 'Job Details | FixFlow'
  },
  {
    path: 'jobs/:id/update',
    loadComponent: () => import('./jobs/update-work/update-work.component').then(m => m.UpdateWorkComponent),
    title: 'Update Work | FixFlow'
  },
  {
    path: 'jobs/:id/complete',
    loadComponent: () => import('./jobs/complete-job/complete-job.component').then(m => m.CompleteJobComponent),
    title: 'Complete Job | FixFlow'
  },
  {
    path: 'jobs/:id/invoice',
    loadComponent: () => import('./jobs/generate-invoice/generate-invoice.component').then(m => m.GenerateInvoiceComponent),
    title: 'Generate Invoice | FixFlow'
  },
  {
    path: 'jobs/:id/invoice-sent',
    loadComponent: () => import('./jobs/invoice-sent/invoice-sent.component').then(m => m.InvoiceSentComponent),
    title: 'Invoice Sent | FixFlow'
  },
  {
    path: 'jobs/:id/closed',
    loadComponent: () => import('./jobs/job-closed/job-closed.component').then(m => m.JobClosedComponent),
    title: 'Job Closed | FixFlow'
  },
  {
    path: 'history',
    loadComponent: () => import('./jobs/job-history/job-history.component').then(m => m.JobHistoryComponent),
    title: 'Job History | FixFlow'
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent),
    title: 'Notifications | FixFlow'
  },
  {
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule.component').then(m => m.ScheduleComponent),
    title: 'Schedule | FixFlow'
  },
  {
    path: 'ratings',
    loadComponent: () => import('./ratings/ratings.component').then(m => m.RatingsComponent),
    title: 'Ratings & Feedback | FixFlow'
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Technician Profile | FixFlow'
  },
  {
    path: 'profile/personal-info',
    loadComponent: () => import('./profile/personal-info/personal-info.component').then(m => m.PersonalInfoComponent),
    title: 'Personal Information | FixFlow'
  },
  {
    path: 'help',
    loadComponent: () => import('./profile/help-support/help-support.component').then(m => m.HelpSupportComponent),
    title: 'Help & Support | FixFlow'
  }
];

export const TECHNICIAN_ROUTES: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: TECHNICIAN_CHILD_ROUTES
  }
];
