import { Route } from 'next'

export const API_ROUTES = {
  base: '/api' as Route<string>,
  base_auth: '/api/auth' as Route<string>,
  register_api: '/api/auth/register' as Route<string>,
  login_api: '/api/auth/login' as Route<string>,
} as const

export const ROUTES = {
  base: '/' as Route<string>,

  // Pages d'authentification
  login: '/auth/login' as Route<string>,
  auth_error: '/auth/error' as Route<string>,

  // Pages administratives
  superadmin: {
    base: '/superadmin' as Route<string>,
    dashboard: '/superadmin/dashboard' as Route<string>,
    countries: '/superadmin/countries' as Route<string>,
    organizations: '/superadmin/organizations' as Route<string>,
    services: '/superadmin/services' as Route<string>,
    users: '/superadmin/users' as Route<string>,
    edit_service: (id: string) => `/superadmin/services/${id}/edit` as Route<string>,
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

  // Pages utilisateur
  profile: '/user/profile' as Route<string>,
  settings: '/user/settings' as Route<string>,
  documents: '/user/components' as Route<string>,
  services: '/user/services' as Route<string>,
  requests: '/user/requests' as Route<string>,
  service_start: (id: string) => `/user/services/${id}/start` as Route<string>,
  service_edit: (id: string) => `/user/services/${id}/edit` as Route<string>,
  service_view: (id: string) => `/user/services/${id}` as Route<string>,

  // Pages actions
  admin: '/actions' as Route<string>,
  admin_dashboard: '/actions' as Route<string>,
  admin_users: '/actions/users' as Route<string>,
  admin_requests: '/actions/requests' as Route<string>,
  admin_settings: '/actions/settings' as Route<string>,
  admin_profiles: '/actions/profiles' as Route<string>,
  admin_profiles_review: (id: string) => `/admin/profiles/${id}/review` as Route<string>,

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
} as const

export type PageRoute = (typeof ROUTES)[keyof typeof ROUTES]