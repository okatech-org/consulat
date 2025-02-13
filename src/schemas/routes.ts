import { Route } from 'next';

export const API_ROUTES = {
  base: '/api' as Route<string>,
  base_auth: '/api/auth' as Route<string>,
  register_api: '/api/auth/register' as Route<string>,
  login_api: '/api/auth/login' as Route<string>,
} as const;

export const ROUTES = {
  base: '/' as Route<string>,

  // Pages d'authentification
  login: '/auth/login' as Route<string>,
  auth_error: '/auth/error' as Route<string>,

  // Pages administratives
  sa: {
    base: '/superadmin' as Route<string>,
    dashboard: '/superadmin/dashboard' as Route<string>,
    countries: '/superadmin/countries' as Route<string>,
    organizations: '/superadmin/organizations' as Route<string>,
    services: '/superadmin/services' as Route<string>,
    users: '/superadmin/users' as Route<string>,
    edit_service: (id: string) => `/superadmin/services/${id}/edit` as Route<string>,
    edit_organization: (id: string) => `/superadmin/organizations/${id}` as Route<string>,
    edit_country: (id: string) => `/superadmin/countries/${id}/edit` as Route<string>,
  },

  // Manager
  manager: {
    dashboard: '/manager' as Route<string>,
    requests: '/manager/requests' as Route<string>,
    appointments: '/manager/appointments' as Route<string>,
    users: '/manager/users' as Route<string>,
    messages: '/manager/messages' as Route<string>,
    notifications: '/manager/notifications' as Route<string>,
    settings: '/manager/settings' as Route<string>,
  },

  admin: {
    base: '/admin' as Route<string>,
    registrations: '/admin/registrations' as Route<string>,
    registrations_review: (id: string) => `/admin/registrations/${id}` as Route<string>,
    appointments: '/admin/appointments' as Route<string>,
    users: '/admin/users' as Route<string>,
    requests: '/admin/requests' as Route<string>,
    services: '/admin/services' as Route<string>,
    settings: '/admin/settings' as Route<string>,
  },

  user: {
    base: '/user' as Route<string>,
    dashboard: '/user/dashboard' as Route<string>,
    requests: '/user/requests' as Route<string>,
    profile: '/user/profile' as Route<string>,
    appointments: '/user/appointments' as Route<string>,
    new_appointment: '/user/appointments/new' as Route<string>,
    documents: '/user/documents' as Route<string>,
    procedures: '/user/procedures' as Route<string>,
    settings: '/user/settings' as Route<string>,
  },

  // Pages utilisateur
  profile: '/user/profile' as Route<string>,
  settings: '/user/settings' as Route<string>,
  documents: '/user/components' as Route<string>,
  services: '/user/services' as Route<string>,
  requests: '/user/requests' as Route<string>,
  service_start: (id: string) => `/user/services/${id}/start` as Route<string>,
  service_edit: (id: string) => `/user/services/${id}/edit` as Route<string>,
  service_view: (id: string) => `/user/services/${id}` as Route<string>,

  // Pages partagées
  dashboard: '/dashboard' as Route<string>,
  help: '/help' as Route<string>,
  feedback: '/feedback' as Route<string>,
  appointments: '/appointments' as Route<string>,

  // Pages publiques
  registration: '/components' as Route<string>,
  unauthorized: '/unauthorized' as Route<string>,
  consular_registration: '/consular-components' as Route<string>,
  privacy_policy: '#' as Route<string>,
  terms: '#' as Route<string>,

  agent: {
    base: '/agent',
    appointments: '/agent/appointments',
    requests: '/agent/requests',
    users: '/agent/users',
  },
} as const;

export type PageRoute = (typeof ROUTES)[keyof typeof ROUTES];
