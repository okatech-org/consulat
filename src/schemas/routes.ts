import { ServiceCategory } from '@prisma/client';
import type { Route } from 'next';

export const ROUTES = {
  base: '/' as Route<string>,
  api: {
    base: '/api' as Route<string>,
    base_auth: '/api/auth' as Route<string>,
    register_api: '/api/auth/register' as Route<string>,
    login_api: '/api/auth/login' as Route<string>,
  },

  auth: {
    base: '/auth' as Route<string>,
    login: '/auth/login' as Route<string>,
    register: '/registration' as Route<string>,
    auth_error: '/auth/error' as Route<string>,
    unauthorized: '/auth/unauthorized' as Route<string>,
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
    edit_service: (id: string) => `/dashboard/services/${id}/edit` as Route<string>,
    new_service: (category: ServiceCategory) =>
      `/dashboard/services/new?category=${category}` as Route<string>,
    services_new: '/dashboard/services/new' as Route<string>,
    registrations_review: (id: string) =>
      `/dashboard/registrations/${id}` as Route<string>,
    service_requests: (id: string) => `/dashboard/requests/${id}` as Route<string>,
    service_request_review: (id: string) =>
      `/dashboard/requests/${id}?review=true` as Route<string>,
    registrations: '/dashboard/registrations' as Route<string>,
    edit_organization: (id: string) => `/dashboard/organizations/${id}` as Route<string>,
    countries: '/dashboard/countries' as Route<string>,
    account_settings: '/dashboard/account' as Route<string>,
    profiles: '/dashboard/profiles' as Route<string>,
    doc_templates: '/dashboard/document-templates' as Route<string>,
    doc_template_edit: (id: string) =>
      `/dashboard/document-templates/${id}` as Route<string>,
    agents: '/dashboard/agents' as Route<string>,
    agent_detail: (id: string) => `/dashboard/agents/${id}` as Route<string>,
  },

  // Pages administratives
  sa: {
    countries: '/dashboard/countries' as Route<string>,
    organizations: '/dashboard/organizations' as Route<string>,
    edit_organization: (id: string) => `/dashboard/organizations/${id}` as Route<string>,
    edit_country: (id: string) => `/dashboard/countries/${id}/edit` as Route<string>,
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
    appointment_reschedule: (id: string) =>
      `/my-space/appointments/reschedule/${id}` as Route<string>,
    contact: '/my-space/contact' as Route<string>,
    documents: '/my-space/documents' as Route<string>,
    services: '/my-space/services' as Route<string>,
    service_submit: (serviceId?: string) =>
      serviceId
        ? `/my-space/services/submit?serviceId=${serviceId}`
        : ('/my-space/services/submit' as Route<string>),
    new_service_request: (serviceId?: string) =>
      serviceId
        ? `/my-space/services/new?serviceId=${serviceId}`
        : ('/my-space/services/new' as Route<string>),
    service_request_details: (id: string) => `/my-space/requests/${id}` as Route<string>,
    service_available: '/my-space/services/available' as Route<string>,
    contact_support: '/my-space/contact' as Route<string>,
    settings: '/my-space/settings' as Route<string>,
    notifications: '/my-space/notifications' as Route<string>,
    children: '/my-space/children' as Route<string>,
    new_child: '/my-space/children/new' as Route<string>,
    child_profile: (id: string) => `/my-space/children/${id}` as Route<string>,
    account: '/my-space/account' as Route<string>,
    feedback: '/my-space/feedback' as Route<string>,
  },

  listing: {
    profiles: '/listing/profiles' as Route<string>,
    profile: (id: string) => `/listing/profiles/${id}` as Route<string>,
    services: '/listing/services' as Route<string>,
    service: (id: string) => `/listing/services/${id}` as Route<string>,
    organizations: '/listing/organizations' as Route<string>,
    organization: (id: string) => `/listing/organizations/${id}` as Route<string>,
    countries: '/listing/countries' as Route<string>,
    country: (id: string) => `/listing/countries/${id}` as Route<string>,
  },

  help: '/help' as Route<string>,
  feedback: '/feedback' as Route<string>,

  unauthorized: '/unauthorized' as Route<string>,
  registration: '/registration' as Route<string>,
  privacy_policy: '#' as Route<string>,
  terms: '#' as Route<string>,
} as const;

export const protectedRoutes = [ROUTES.dashboard.base, ROUTES.user.base];
