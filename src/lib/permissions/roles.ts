import { RolesConfig } from './types';

export const ROLES: RolesConfig = {
  SUPER_ADMIN: {
    profiles: {
      view: true,
      create: true,
      update: true,
      delete: true,
      validate: true,
      viewChild: true,
      createChild: true,
      updateChild: true,
      deleteChild: true,
    },
    appointments: {
      view: true,
      create: true,
      update: true,
      delete: true,
      reschedule: true,
      cancel: true,
    },
    serviceRequests: {
      view: true,
      create: true,
      update: true,
      delete: true,
      process: true,
      validate: true,
      list: true,
    },
    organizations: {
      view: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
    consularServices: {
      view: true,
      create: true,
      update: true,
      delete: true,
      configure: true,
    },
    documents: {
      view: true,
      create: true,
      update: true,
      delete: true,
      validate: true,
    },
    users: {
      view: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
    parentalAuthorities: {
      view: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
  },
  ADMIN: {
    profiles: {
      view: (user, profile) => profile.organizationId === user.organizationId,
      create: (user, profile) => profile.organizationId === user.organizationId,
      update: (user, profile) => profile.organizationId === user.organizationId,
      validate: (user, profile) => profile.organizationId === user.organizationId,
      viewChild: (user, profile) => profile.organizationId === user.organizationId,
    },
    appointments: {
      view: (user, appointment) => appointment.organizationId === user.organizationId,
      create: (user, appointment) => appointment.organizationId === user.organizationId,
      update: (user, appointment) => appointment.organizationId === user.organizationId,
      reschedule: (user, appointment) =>
        appointment.organizationId === user.organizationId,
      cancel: (user, appointment) => appointment.organizationId === user.organizationId,
    },
    serviceRequests: {
      list: true,
      view: (user, request) => request.organizationId === user.organizationId,
      process: (user, request) => request.organizationId === user.organizationId,
      validate: (user, request) => request.organizationId === user.organizationId,
    },
    organizations: {
      view: (user, org) => org.id === user.organizationId,
      update: (user, org) => org.id === user.organizationId,
      manage: (user, org) => org.id === user.organizationId,
    },
    consularServices: {
      view: (user, service) => service.organizationId === user.organizationId,
      update: (user, service) => service.organizationId === user.organizationId,
      configure: (user, service) => service.organizationId === user.organizationId,
    },
    documents: {
      view: (user, doc) => doc.organizationId === user.organizationId,
      validate: (user, doc) => doc.organizationId === user.organizationId,
    },
    users: {
      view: (user, targetUser) => targetUser.organizationId === user.organizationId,
      create: (user, targetUser) => targetUser.organizationId === user.organizationId,
      update: (user, targetUser) => targetUser.organizationId === user.organizationId,
      manage: (user, targetUser) => targetUser.organizationId === user.organizationId,
    },
    parentalAuthorities: {
      view: (user, authority) =>
        authority.parentProfile.organizationId === user.organizationId,
      manage: (user, authority) =>
        authority.parentProfile.organizationId === user.organizationId,
    },
  },
  AGENT: {
    profiles: {
      view: (user, profile) => {
        return (
          profile.organizationId === user.organizationId &&
          user.linkedCountries.some((country) => country.code === profile.countryCode)
        );
      },
      validate: (user, profile) => {
        return (
          profile.organizationId === user.organizationId &&
          user.linkedCountries.some((country) => country.code === profile.countryCode)
        );
      },
    },
    appointments: {
      view: (user, appointment) => {
        return (
          appointment.organizationId === user.organizationId &&
          (appointment.agentId === user.id || !appointment.agentId)
        );
      },
      update: (user, appointment) => appointment.agentId === user.id,
      reschedule: (user, appointment) => appointment.agentId === user.id,
    },
    serviceRequests: {
      list: true,
      view: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      process: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      update: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      validate: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      complete: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations.includes(request.serviceCategory)
        );
      },
    },
    documents: {
      view: true,
      validate: true,
    },
    parentalAuthorities: {
      view: (user, authority) => {
        return (
          authority.parentProfile.organizationId === user.organizationId &&
          user.linkedCountries.some(
            (country) => country.code === authority.parentProfile.countryCode,
          )
        );
      },
    },
  },
  USER: {
    profiles: {
      view: (user, profile) => profile.userId === user.id,
      create: (user, profile) => profile.userId === user.id,
      update: (user, profile) => profile.userId === user.id,
      viewChild: (user, profile) => {
        return profile.parentalAuthorityChildren?.some(
          (authority) => authority.parentProfile.userId === user.id && authority.isActive,
        );
      },
      createChild: (user, profile) => {
        return profile.userId === user.id && profile.category === 'ADULT';
      },
      updateChild: (user, profile) => {
        return profile.parentalAuthorityChildren?.some(
          (authority) => authority.parentProfile.userId === user.id && authority.isActive,
        );
      },
    },
    appointments: {
      view: (user, appointment) => appointment.attendeeId === user.id,
      create: true,
      reschedule: (user, appointment) => appointment.attendeeId === user.id,
      cancel: (user, appointment) => appointment.attendeeId === user.id,
    },
    serviceRequests: {
      view: (user, request) => {
        return (
          request.submittedById === user.id ||
          request.requestedFor?.parentalAuthorityChildren?.some(
            (authority) =>
              authority.parentProfile.userId === user.id && authority.isActive,
          )
        );
      },
      create: true,
      update: (user, request) => {
        return (
          request.submittedById === user.id ||
          request.requestedFor?.parentalAuthorityChildren?.some(
            (authority) =>
              authority.parentProfile.userId === user.id && authority.isActive,
          )
        );
      },
    },
    documents: {
      view: (user, doc) => doc.userId === user.id,
      create: (user, doc) => doc.userId === user.id,
      update: (user, doc) => doc.userId === user.id,
    },
    consularServices: {
      view: true,
    },
    organizations: {
      view: true,
    },
    parentalAuthorities: {
      view: (user, authority) => authority.parentProfile.userId === user.id,
      create: (user, authority) => authority.parentProfile.userId === user.id,
      update: (user, authority) => authority.parentProfile.userId === user.id,
      delete: (user, authority) => authority.parentProfile.userId === user.id,
    },
  },
  MANAGER: {
    profiles: {
      view: (user, profile) => profile.organizationId === user.organizationId,
      validate: (user, profile) => profile.organizationId === user.organizationId,
    },
    appointments: {
      view: (user, appointment) => appointment.organizationId === user.organizationId,
      update: (user, appointment) => appointment.organizationId === user.organizationId,
      reschedule: (user, appointment) =>
        appointment.organizationId === user.organizationId,
      cancel: (user, appointment) => appointment.organizationId === user.organizationId,
    },
    serviceRequests: {
      list: true,
      view: (user, request) => request.organizationId === user.organizationId,
      process: (user, request) => request.organizationId === user.organizationId,
      validate: (user, request) => request.organizationId === user.organizationId,
    },
    documents: {
      view: (user, doc) => doc.organizationId === user.organizationId,
      validate: (user, doc) => doc.organizationId === user.organizationId,
    },
    users: {
      view: (user, targetUser) => targetUser.organizationId === user.organizationId,
    },
    parentalAuthorities: {
      view: (user, authority) =>
        authority.parentProfile?.organizationId === user.organizationId,
    },
  },
};
