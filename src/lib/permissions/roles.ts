import type { RolesConfig } from './types';

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
      view: (user, profile) => profile.assignedOrganizationId === user.organizationId,
      create: () => true,
      update: (user, profile) => profile.assignedOrganizationId === user.organizationId,
      validate: (user, profile) => profile.assignedOrganizationId === user.organizationId,
      viewChild: (user, profile) =>
        profile.assignedOrganizationId === user.organizationId,
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
      view: true,
      validate: true,
    },
    users: {
      view: (user, targetUser) => targetUser.organizationId === user.organizationId,
      create: (user, targetUser) => targetUser.organizationId === user.organizationId,
      update: (user, targetUser) => targetUser.organizationId === user.organizationId,
      manage: (user, targetUser) => targetUser.organizationId === user.organizationId,
    },
    parentalAuthorities: {
      view: true,
      manage: true,
    },
  },
  AGENT: {
    profiles: {
      view: () => true,
      validate: () => true,
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
          user.specializations &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      process: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      update: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      validate: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations &&
          user.specializations.includes(request.serviceCategory)
        );
      },
      complete: (user, request) => {
        return (
          request.organizationId === user.assignedOrganizationId &&
          user.specializations &&
          user.specializations.includes(request.serviceCategory)
        );
      },
    },
    documents: {
      view: true,
      validate: true,
    },
    parentalAuthorities: {
      view: true,
    },
  },
  USER: {
    profiles: {
      view: (user, profile) => profile.userId === user.id,
      create: (user, profile) => profile.userId === user.id,
      update: (user, profile) => profile.userId === user.id,
      viewChild: () => true,
      createChild: (user, profile) => {
        return profile.userId === user.id && profile.category === 'ADULT';
      },
      updateChild: () => true,
    },
    appointments: {
      view: (user, appointment) => appointment.attendeeId === user.id,
      create: true,
      reschedule: (user, appointment) => appointment.attendeeId === user.id,
      cancel: (user, appointment) => appointment.attendeeId === user.id,
    },
    serviceRequests: {
      view: (user, request) => {
        return request.submittedById === user.id;
      },
      create: true,
      update: (user, request) => {
        return request.submittedById === user.id;
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
      view: (user, authority) => {
        const parentUserIds = (authority.parentUsers || []).map((user) => user.id);
        return parentUserIds.includes(user.id);
      },
      create: true,
      update: (user, authority) => {
        const parentUserIds = (authority.parentUsers || []).map((user) => user.id);
        return parentUserIds.includes(user.id);
      },
      delete: (user, authority) => {
        const parentUserIds = (authority.parentUsers || []).map((user) => user.id);
        return parentUserIds.includes(user.id);
      },
    },
  },
  MANAGER: {
    profiles: {
      view: true,
      validate: true,
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
      view: true,
      validate: true,
    },
    users: {
      view: (user, targetUser) => targetUser.organizationId === user.organizationId,
    },
    parentalAuthorities: {
      view: true,
    },
  },
  INTEL_AGENT: {
    profiles: {
      view: true, // Lecture seule de tous les profils
      create: false,
      update: false,
      delete: false,
      validate: false,
      viewChild: true,
      createChild: false,
      updateChild: false,
      deleteChild: false,
    },
    intelligenceNotes: {
      view: true,
      create: true,
      update: (user, note) => note.authorId === user.id,
      delete: (user, note) => note.authorId === user.id,
      viewHistory: true,
    },
    // Toutes les autres permissions à false
    appointments: {
      view: false,
      create: false,
      update: false,
      delete: false,
      reschedule: false,
      cancel: false,
    },
    serviceRequests: {
      view: false,
      create: false,
      update: false,
      delete: false,
      process: false,
      validate: false,
      list: false,
      complete: false,
    },
    organizations: {
      view: false,
      create: false,
      update: false,
      delete: false,
      manage: false,
    },
    consularServices: {
      view: false,
      create: false,
      update: false,
      delete: false,
      configure: false,
    },
    documents: {
      view: true, // Peut voir les documents des profils
      create: false,
      update: false,
      delete: false,
      validate: false,
    },
    users: {
      view: false,
      create: false,
      update: false,
      delete: false,
      manage: false,
    },
    parentalAuthorities: {
      view: true, // Peut voir les autorités parentales
      create: false,
      update: false,
      delete: false,
      manage: false,
    },
  },
  EDUCATION_AGENT: {
    profiles: {
      view: true,
    },
  },
};
