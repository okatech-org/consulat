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
  profile: '/profile' as Route<string>,
  profile_edit: '/profile/edit' as Route<string>,
  settings: '/settings' as Route<string>,
  documents: '/documents' as Route<string>,
  services: '/services' as Route<string>,
  requests: '/services/requests' as Route<string>,
  service_start: (id: string) => `/services/${id}/start` as Route<string>,
  service_edit: (id: string) => `/services/${id}/edit` as Route<string>,
  service_view: (id: string) => `/services/${id}` as Route<string>,

  // Pages admin
  admin: '/admin' as Route<string>,
  admin_dashboard: '/admin' as Route<string>,
  admin_users: '/admin/users' as Route<string>,
  admin_requests: '/admin/requests' as Route<string>,
  admin_settings: '/admin/settings' as Route<string>,
  admin_profiles: '/admin/profiles' as Route<string>,
  admin_profiles_review: (id: string) => `/admin/profiles/${id}/review` as Route<string>,

    // Pages partagées
  dashboard: '/dashboard' as Route<string>,
  help: '/help' as Route<string>,
  feedback: '/feedback' as Route<string>,
  appointments: '/appointments' as Route<string>,

  // Pages publiques
  registration: '/registration' as Route<string>,
  unauthorized: '/unauthorized' as Route<string>,
  consular_registration: '/consular-registration' as Route<string>,
  privacy_policy: '#' as Route<string>,
  terms: '#' as Route<string>,
} as const

export type PageRoute = (typeof ROUTES)[keyof typeof ROUTES]