import { ServiceCategory } from '@/convex/lib/constants';
import type { Route } from 'next';

export const ROUTES = {
  base: '/' as Route<string>,
  intel: {
    base: '/intel' as Route<string>,
    profiles: '/intel/profiles' as Route<string>,
    profile: (id: Id<'profiles'> | Id<'childProfiles'>) =>
      `/intel/profiles/${id}` as Route<string>,
    map: '/intel/map' as Route<string>,
    notes: '/intel/notes' as Route<string>,
    reports: '/intel/reports' as Route<string>,
    analytics: '/intel/analytics' as Route<string>,
    clusters: '/intel/clusters' as Route<string>,
    predictions: '/intel/predictions' as Route<string>,
    competences: '/intel/competences' as Route<string>,
    networks: '/intel/networks' as Route<string>,
    projects: '/intel/projects' as Route<string>,
    associations: '/intel/associations' as Route<string>,
    maps: {
      associations: '/intel/maps/associations' as Route<string>,
    },
  },
  api: {
    base: '/api' as Route<string>,
    base_auth: '/api/auth' as Route<string>,
    register_api: '/api/auth/register' as Route<string>,
    login_api: '/api/auth/login' as Route<string>,
  },

  auth: {
    base: '/auth' as Route<string>,
    login: '/sign-in' as Route<string>,
    signup: '/sign-up' as Route<string>,
    register: '/registration' as Route<string>,
    auth_error: '/sign-in' as Route<string>,
    unauthorized: '/unauthorized' as Route<string>,
  },

  dashboard: {
    base: '/dashboard' as Route<string>,
    notifications: '/dashboard/notifications' as Route<string>,
    requests: '/dashboard/requests' as Route<string>,
    appointments: '/dashboard/appointments' as Route<string>,
    settings: '/dashboard/settings' as Route<string>,
    services: '/dashboard/services' as Route<string>,
    feedback: '/dashboard/feedback' as Route<string>,
    users: '/dashboard/users' as Route<string>,
    user_detail: (id: Id<'users'>) => `/dashboard/users/${id}` as Route<string>,
    edit_service: (id: Id<'services'>) =>
      `/dashboard/services/${id}/edit` as Route<string>,
    new_service: (category: ServiceCategory) =>
      `/dashboard/services/new?category=${category}` as Route<string>,
    services_new: '/dashboard/services/new' as Route<string>,
    registrations_review: (id: Id<'requests'>) =>
      `/dashboard/registrations/${id}` as Route<string>,
    service_requests: (id: Id<'requests'>) =>
      `/dashboard/requests/${id}` as Route<string>,
    service_request_review: (id: Id<'requests'>) =>
      `/dashboard/requests/${id}?review=true` as Route<string>,
    registrations: '/dashboard/registrations' as Route<string>,
    edit_organization: (id: Id<'organizations'>) =>
      `/dashboard/organizations/${id}` as Route<string>,
    countries: '/dashboard/countries' as Route<string>,
    account_settings: '/dashboard/account' as Route<string>,
    profiles: '/dashboard/profiles' as Route<string>,
    profile: (id: Id<'profiles'>) => `/dashboard/profiles/${id}` as Route<string>,
    child_profiles: '/dashboard/child-profiles' as Route<string>,
    child_profile: (id: Id<'childProfiles'>) =>
      `/dashboard/child-profiles/${id}` as Route<string>,
    agents: '/dashboard/agents' as Route<string>,
    agent_detail: (id: Id<'memberships'>) => `/dashboard/agents/${id}` as Route<string>,
    tickets: '/dashboard/tickets' as Route<string>,
  },

  // Pages administratives
  sa: {
    countries: '/dashboard/countries' as Route<string>,
    organizations: '/dashboard/organizations' as Route<string>,
    users: '/dashboard/users' as Route<string>,
    edit_organization: (id: Id<'organizations'>) =>
      `/dashboard/organizations/${id}` as Route<string>,
    edit_country: (id: Id<'countries'>) =>
      `/dashboard/countries/${id}/edit` as Route<string>,
    user_details: (id: Id<'users'>) => `/dashboard/users/${id}` as Route<string>,
  },

  user: {
    base: '/my-space' as Route<string>,
    dashboard: '/my-space' as Route<string>,
    requests: '/my-space/requests' as Route<string>,
    profile: '/my-space/profile' as Route<string>,
    profile_form: '/my-space/profile/form' as Route<string>,
    appointments: '/my-space/appointments' as Route<string>,
    appointments_new: '/my-space/appointments/new' as Route<string>,
    new_appointment: '/my-space/appointments/new' as Route<string>,
    appointment_reschedule: (id: Id<'appointments'>) =>
      `/my-space/appointments/reschedule/${id}` as Route<string>,
    contact: '/my-space/contact' as Route<string>,
    documents: '/my-space/documents' as Route<string>,
    services: '/my-space/services' as Route<string>,
    service_submit: (serviceId?: Id<'services'>) =>
      serviceId
        ? `/my-space/services/submit?serviceId=${serviceId}`
        : ('/my-space/services/submit' as Route<string>),
    new_service_request: (serviceId?: Id<'services'>) =>
      serviceId
        ? `/my-space/services/new?serviceId=${serviceId}`
        : ('/my-space/services/new' as Route<string>),
    service_request_details: (id: Id<'requests'>) =>
      `/my-space/requests/${id}` as Route<string>,
    service_available: '/my-space/services/available' as Route<string>,
    contact_support: '/my-space/contact' as Route<string>,
    settings: '/my-space/settings' as Route<string>,
    notifications: '/my-space/notifications' as Route<string>,
    children: '/my-space/children' as Route<string>,
    child_profile: (id: Id<'childProfiles'>) =>
      `/my-space/children/${id}` as Route<string>,
    account: '/my-space/account' as Route<string>,
    feedback: '/my-space/feedback' as Route<string>,
  },

  listing: {
    profiles: '/listing/profiles' as Route<string>,
    profile: (id: Id<'profiles'> | Id<'childProfiles'>) =>
      `/listing/profiles/${id}` as Route<string>,
    services: '/listing/services' as Route<string>,
    service: (id: Id<'services'>) => `/listing/services/${id}` as Route<string>,
    organizations: '/listing/organizations' as Route<string>,
    organization: (id: Id<'organizations'>) =>
      `/listing/organizations/${id}` as Route<string>,
    countries: '/listing/countries' as Route<string>,
    country: (id: Id<'countries'>) => `/listing/countries/${id}` as Route<string>,
  },

  help: '/help' as Route<string>,
  feedback: '/feedback' as Route<string>,

  unauthorized: '/unauthorized' as Route<string>,
  registration: '/registration' as Route<string>,
  privacy_policy: '#' as Route<string>,
  terms: '#' as Route<string>,
} as const;

export const protectedRoutes = [ROUTES.dashboard.base, ROUTES.user.base];
