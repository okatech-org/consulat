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

  // Pages utilisateur
  profile: '/components' as Route<string>,
  profile_edit: '/components/edit' as Route<string>,
  settings: '/settings' as Route<string>,
  documents: '/components' as Route<string>,
  services: '/services' as Route<string>,
  requests: '/services/requests' as Route<string>,
  service_start: (id: string) => `/services/${id}/start` as Route<string>,
  service_edit: (id: string) => `/services/${id}/edit` as Route<string>,
  service_view: (id: string) => `/services/${id}` as Route<string>,

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