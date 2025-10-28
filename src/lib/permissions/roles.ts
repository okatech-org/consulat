import type { RolesConfig } from './types';

export const ROLES: RolesConfig = {
  super_admin: {
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
      complete: true,
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
    childProfiles: {
      view: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
    intelligenceNotes: {
      view: true,
      create: true,
      update: true,
      delete: true,
      viewHistory: true,
    },
  },
  admin: {
    profiles: {
      view: true,
      create: true,
      update: true,
      validate: true,
      viewChild: true,
    },
    appointments: {
      view: true,
      create: true,
      update: true,
      reschedule: true,
      cancel: true,
    },
    serviceRequests: {
      list: true,
      view: true,
      process: true,
      validate: true,
      complete: true,
    },
    organizations: {
      view: true,
      update: true,
      manage: true,
    },
    consularServices: {
      view: true,
      update: true,
      configure: true,
    },
    documents: {
      view: true,
      validate: true,
    },
    users: {
      view: true,
      create: true,
      update: true,
      manage: true,
    },
    intelligenceNotes: {
      view: true,
      create: true,
      update: true,
      delete: true,
      viewHistory: true,
    },
  },
  agent: {
    profiles: {
      view: true,
      validate: true,
    },
    appointments: {
      view: (user, appointment) => {
        const userParticipant = appointment.participants.find(
          (p) => p.userId === user._id,
        );
        return !!userParticipant && userParticipant.role === 'agent';
      },
      update: (user, appointment) => {
        const userParticipant = appointment.participants.find(
          (p) => p.userId === user._id,
        );
        return !!userParticipant && userParticipant.role === 'agent';
      },
      reschedule: (user, appointment) => {
        const userParticipant = appointment.participants.find(
          (p) => p.userId === user._id,
        );
        return !!userParticipant && userParticipant.role === 'agent';
      },
    },
    serviceRequests: {
      list: true,
      view: true,
      process: true,
      update: true,
      validate: true,
      complete: true,
    },
    documents: {
      view: true,
      validate: true,
    },
  },
  user: {
    profiles: {
      view: (user, profile) => profile.userId === user._id,
      create: (user, profile) => profile.userId === user._id,
      update: (user, profile) => profile.userId === user._id,
      viewChild: true,
      createChild: true,
      updateChild: true,
    },
    appointments: {
      view: (user, appointment) => {
        return appointment.participants.some((p) => p.userId === user._id);
      },
      create: true,
      reschedule: (user, appointment) => {
        const userParticipant = appointment.participants.find(
          (p) => p.userId === user._id,
        );
        return !!userParticipant && userParticipant.role === 'attendee';
      },
      cancel: (user, appointment) => {
        const userParticipant = appointment.participants.find(
          (p) => p.userId === user._id,
        );
        return !!userParticipant && userParticipant.role === 'attendee';
      },
    },
    serviceRequests: {
      view: (user, request) => {
        return request.requesterId === user.profileId;
      },
      create: true,
      update: (user, request) => {
        return request.requesterId === user.profileId;
      },
    },
    documents: {
      view: (user, doc) => {
        return doc.ownerId === user._id || doc.ownerId === user.profileId;
      },
      create: (user, doc) => {
        return doc.ownerId === user._id || doc.ownerId === user.profileId;
      },
      update: (user, doc) => {
        return doc.ownerId === user._id || doc.ownerId === user.profileId;
      },
    },
    consularServices: {
      view: true,
    },
    organizations: {
      view: true,
    },
  },
  manager: {
    profiles: {
      view: true,
      validate: true,
    },
    appointments: {
      view: true,
      update: true,
      reschedule: true,
      cancel: true,
    },
    serviceRequests: {
      list: true,
      view: true,
      process: true,
      validate: true,
      complete: true,
    },
    documents: {
      view: true,
      validate: true,
    },
    users: {
      view: true,
    },
    intelligenceNotes: {
      view: true,
      viewHistory: true,
    },
  },
  intel_agent: {
    profiles: {
      view: true,
      viewChild: true,
    },
    intelligenceNotes: {
      view: true,
      create: true,
      update: (user, note) => note.authorId === user._id,
      delete: (user, note) => note.authorId === user._id,
      viewHistory: true,
    },
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
      view: true,
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
  },
  education_agent: {
    profiles: {
      view: true,
    },
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
      view: true,
    },
    consularServices: {
      view: false,
    },
    documents: {
      view: false,
    },
    users: {
      view: false,
    },
  },
};
