import { Routes } from '@angular/router';
import { CustomerShellComponent } from './layout/customer-shell/customer-shell.component';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: CustomerShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'splash',
        pathMatch: 'full',
        redirectTo: 'home'
      },



      // Home & Problem Reporting (Screens 4, 5, 6)
      {
        path: 'home',
        loadComponent: () => import('./pages/home/dashboard.component').then(m => m.CustomerDashboardComponent),
        title: 'Home | FixFlow Customer'
      },
      {
        path: 'report',
        loadComponent: () => import('./pages/report/report-problem.component').then(m => m.ReportProblemComponent),
        title: 'Report Problem | FixFlow'
      },
      {
        path: 'report/review',
        loadComponent: () => import('./pages/report/review-photo.component').then(m => m.ReviewPhotoComponent),
        title: 'Review Photo | FixFlow'
      },

      // AI Diagnosis Flow (Screens 7, 8, 8A, 8B)
      {
        path: 'ai/analysis',
        loadComponent: () => import('./pages/ai/ai-analysis.component').then(m => m.AiAnalysisComponent),
        title: 'AI Analysis | FixFlow'
      },
      {
        path: 'ai/:id/analysis',
        loadComponent: () => import('./pages/ai/ai-analysis.component').then(m => m.AiAnalysisComponent),
        title: 'AI Analysis | FixFlow',
      },
      {
        path: 'ai/:id/result',
        loadComponent: () => import('./pages/ai/ai-result.component').then(m => m.AiResultComponent),
        title: 'AI Result | FixFlow'
      },
      {
        path: 'ai/:id/try-steps',
        loadComponent: () => import('./pages/ai/try-steps.component').then(m => m.TryStepsComponent),
        title: 'Repair Steps | FixFlow'
      },
      {
        path: 'ai/problem-solved',
        loadComponent: () => import('./pages/ai/problem-solved.component').then(m => m.ProblemSolvedComponent),
        title: 'Problem Solved | FixFlow'
      },

      // Booking Flow (Screens 9, 10, 11, 12, 13, 14, 15)
      {
        path: 'booking/:id/options',
        loadComponent: () => import('./pages/booking/booking-options.component').then(m => m.BookingOptionsComponent),
        title: 'Booking Options | FixFlow'
      },
      {
        path: 'booking/:id/auto-select',
        loadComponent: () => import('./pages/booking/auto-select.component').then(m => m.AutoSelectComponent),
        title: 'Auto Finding Technician | FixFlow'
      },
      {
        path: 'booking/:id/selected/:techId',
        loadComponent: () => import('./pages/booking/selected-technician.component').then(m => m.SelectedTechnicianComponent),
        title: 'Matched Technician | FixFlow'
      },
      {
        path: 'booking/:id/choose',
        loadComponent: () => import('./pages/booking/choose-technician.component').then(m => m.ChooseTechnicianComponent),
        title: 'Choose Technician | FixFlow'
      },
      {
        path: 'booking/:id/request-sent',
        loadComponent: () => import('./pages/booking/request-sent.component').then(m => m.RequestSentComponent),
        title: 'Request Sent | FixFlow'
      },
      {
        path: 'booking/:id/technician-declined',
        loadComponent: () => import('./pages/booking/technician-declined.component').then(m => m.TechnicianDeclinedComponent),
        title: 'Technician Declined | FixFlow'
      },
      {
        path: 'booking/:id/request-accepted',
        loadComponent: () => import('./pages/booking/request-accepted.component').then(m => m.CustomerRequestAcceptedComponent),
        title: 'Request Accepted | FixFlow'
      },

      // Tracking & Jobs (Screen 16)
      {
        path: 'requests/:id/track',
        loadComponent: () => import('./pages/jobs/track-job.component').then(m => m.TrackJobComponent),
        title: 'Track Service | FixFlow'
      },

      // Payment, Invoices & Feedback (Screens 17, 18, 19, 20)
      {
        path: 'invoices/:id',
        loadComponent: () => import('./pages/payment/invoice.component').then(m => m.CustomerInvoiceComponent),
        title: 'Invoice Details | FixFlow'
      },
      {
        path: 'payment-receipt/:id',
        loadComponent: () => import('./pages/payment/payment-receipt.component').then(m => m.PaymentReceiptComponent),
        title: 'Payment Receipt | FixFlow'
      },
      {
        path: 'feedback/:id',
        loadComponent: () => import('./pages/feedback/feedback.component').then(m => m.CustomerFeedbackComponent),
        title: 'Rate & Review | FixFlow'
      },

      // Requests & History (Screens 21, 22, 24)
      {
        path: 'requests',
        loadComponent: () => import('./pages/requests/my-requests.component').then(m => m.MyRequestsComponent),
        title: 'My Requests | FixFlow'
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./pages/requests/request-details.component').then(m => m.CustomerRequestDetailsComponent),
        title: 'Request Details | FixFlow'
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/requests/history.component').then(m => m.CustomerHistoryComponent),
        title: 'Service History | FixFlow'
      },

      // Notifications (Screen 23)
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.CustomerNotificationsComponent),
        title: 'Notifications | FixFlow Customer'
      },

      // Profile & Support (Screens 25, 26, 27)
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.CustomerProfileComponent),
        title: 'Customer Profile | FixFlow'
      },
      {
        path: 'profile/personal-info',
        loadComponent: () => import('./pages/profile/personal-info.component').then(m => m.CustomerPersonalInfoComponent),
        title: 'Personal Information | FixFlow'
      },
      {
        path: 'help',
        loadComponent: () => import('./pages/profile/help-support.component').then(m => m.CustomerHelpSupportComponent),
        title: 'Help & Support | FixFlow'
      }
    ]
  }
];
