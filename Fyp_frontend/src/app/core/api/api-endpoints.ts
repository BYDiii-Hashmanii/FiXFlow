/**
 * Centralized API endpoints for FixFlow REST API.
 * All HTTP request URLs must reference this constant.
 */
export const API = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me'
  },
  users: {
    me: '/users/me'
  },
  categories: {
    list: '/categories'
  },
  requests: {
    list: '/requests',
    create: '/requests',
    byId: (id: number | string) => `/requests/${id}`,
    analysis: (id: number | string) => `/requests/${id}/analysis`,
    markSolved: (id: number | string) => `/requests/${id}/solved`,
    autoSelect: (id: number | string) => `/requests/${id}/auto-select`,
    sendOffer: (id: number | string) => `/requests/${id}/offers`,
    track: (id: number | string) => `/requests/${id}/track`,
  },
  technicians: {
    list: '/technicians',
    byId: (id: number | string) => `/technicians/${id}`
  },
  invoices: {
    pay: (id: number | string) => `/invoices/${id}/pay`,
    receipt: (id: number | string) => '/invoices/' + id + '/receipt',
    byId: (id: number | string) => `/invoices/${id}`
  },
  reviews: {
    create: (jobId: number | string) => `/jobs/${jobId}/review`
  },
  notifications: {
    list: '/notifications',
    read: (id: number | string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all'
  },
  owner: {
    dashboard: '/owner/dashboard',
    technicians: '/owner/technicians',
    technicianById: (id: number | string) => `/owner/technicians/${id}`,
    jobs: '/owner/jobs',
    jobById: (id: number | string) => `/owner/jobs/${id}`,
    invoices: '/owner/invoices',
    invoiceById: (id: number | string) => `/owner/invoices/${id}`,
    feedback: '/owner/feedback',
    feedbackById: (id: number | string) => `/owner/feedback/${id}`,
    notifications: '/owner/notifications',
    profile: '/owner/profile'
  }
} as const;
