import { Routes } from '@angular/router';
import { OwnerShellComponent } from './layout/owner-shell/owner-shell.component';

export const OWNER_ROUTES: Routes = [
  {
    path: '',
    component: OwnerShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/home/owner-dashboard.component').then(m => m.OwnerDashboardComponent),
        title: 'Dashboard - FixFlow Owner'
      },
      {
        path: 'technicians',
        loadComponent: () =>
          import('./pages/technicians/technician-list.component').then(m => m.OwnerTechnicianListComponent),
        title: 'Technicians - FixFlow Owner'
      },
      {
        path: 'technicians/add',
        loadComponent: () =>
          import('./pages/technicians/add-technician.component').then(m => m.OwnerAddTechnicianComponent),
        title: 'Add Technician - FixFlow Owner'
      },
      {
        path: 'technicians/:id',
        loadComponent: () =>
          import('./pages/technicians/technician-details.component').then(m => m.TechnicianDetailsComponent),
        title: 'Technician Details - FixFlow Owner'
      },
      {
        path: 'technicians/:id/edit',
        loadComponent: () =>
          import('./pages/technicians/edit-technician.component').then(m => m.EditTechnicianComponent),
        title: 'Edit Technician - FixFlow Owner'
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./pages/jobs/job-records.component').then(m => m.JobRecordsComponent),
        title: 'Job Records - FixFlow Owner'
      },
      {
        path: 'jobs/:id',
        loadComponent: () =>
          import('./pages/jobs/job-record-details.component').then(m => m.JobRecordDetailsComponent),
        title: 'Job Details - FixFlow Owner'
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./pages/invoices/invoice-records.component').then(m => m.InvoiceRecordsComponent),
        title: 'Invoice Records - FixFlow Owner'
      },
      {
        path: 'invoices/:id',
        loadComponent: () =>
          import('./pages/invoices/invoice-details.component').then(m => m.InvoiceDetailsComponent),
        title: 'Invoice Details - FixFlow Owner'
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./pages/feedback/feedback-list.component').then(m => m.FeedbackListComponent),
        title: 'Customer Feedback - FixFlow Owner'
      },
      {
        path: 'feedback/:id',
        loadComponent: () =>
          import('./pages/feedback/feedback-details.component').then(m => m.FeedbackDetailsComponent),
        title: 'Feedback Details - FixFlow Owner'
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/owner-notifications.component').then(m => m.OwnerNotificationsComponent),
        title: 'Notifications - FixFlow Owner'
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/owner-profile.component').then(m => m.OwnerProfileComponent),
        title: 'Profile - FixFlow Owner'
      },
      {
        path: 'profile/personal-info',
        loadComponent: () =>
          import('./pages/profile/personal-information.component').then(m => m.PersonalInformationComponent),
        title: 'Personal Information - FixFlow Owner'
      },
      {
        path: 'profile/help-support',
        loadComponent: () =>
          import('./pages/profile/help-support.component').then(m => m.HelpSupportComponent),
        title: 'Help & Support - FixFlow Owner'
      }
    ]
  }
];
