import { userRoleValidator } from '../lib/validators';
import { v } from 'convex/values';
import { query } from '../_generated/server';

type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  data: any;
};

export const globalSearch = query({
  args: {
    searchTerm: v.string(),
    entityTypes: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchLower = args.searchTerm.toLowerCase();
    const limit = args.limit || 20;
    const results: Array<SearchResult> = [];

    if (!args.entityTypes || args.entityTypes.includes('users')) {
      const users = await ctx.db.query('users').collect();
      const matchingUsers = users
        .filter(
          (user) =>
            (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
            (user.email && user.email.toLowerCase().includes(searchLower)),
        )
        .slice(0, limit)
        .map((user) => ({
          type: 'user',
          id: user._id,
          title:
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            user.email ||
            'Utilisateur sans nom',
          subtitle: user.email,
          data: user,
        }));
      results.push(...matchingUsers);
    }

    if (!args.entityTypes || args.entityTypes.includes('organizations')) {
      const organizations = await ctx.db.query('organizations').collect();
      const matchingOrgs = organizations
        .filter(
          (org) =>
            org.name.toLowerCase().includes(searchLower) ||
            org.code.toLowerCase().includes(searchLower),
        )
        .slice(0, limit)
        .map((org) => ({
          type: 'organization',
          id: org._id,
          title: org.name,
          subtitle: org.code,
          data: org,
        }));
      results.push(...matchingOrgs);
    }

    if (!args.entityTypes || args.entityTypes.includes('services')) {
      const services = await ctx.db.query('services').collect();
      const matchingServices = services
        .filter(
          (service) =>
            service.name.toLowerCase().includes(searchLower) ||
            service.code.toLowerCase().includes(searchLower) ||
            (service.description &&
              service.description.toLowerCase().includes(searchLower)),
        )
        .slice(0, limit)
        .map((service) => ({
          type: 'service',
          id: service._id,
          title: service.name,
          subtitle: service.description || service.code,
          data: service,
        }));
      results.push(...matchingServices);
    }

    if (!args.entityTypes || args.entityTypes.includes('requests')) {
      const requests = await ctx.db.query('requests').collect();
      const matchingRequests = requests
        .filter((request) => request.number.toLowerCase().includes(searchLower))
        .slice(0, limit)
        .map((request) => ({
          type: 'request',
          id: request._id,
          title: request.number,
          subtitle: `Statut: ${request.status}`,
          data: request,
        }));
      results.push(...matchingRequests);
    }

    if (!args.entityTypes || args.entityTypes.includes('documents')) {
      const documents = await ctx.db.query('documents').collect();
      const matchingDocuments = documents
        .filter(
          (doc) =>
            doc.fileName.toLowerCase().includes(searchLower) ||
            doc.type.toString().toLowerCase().includes(searchLower),
        )
        .slice(0, limit)
        .map((doc) => ({
          type: 'document',
          id: doc._id,
          title: doc.fileName,
          subtitle: doc.type.toString(),
          data: doc,
        }));
      results.push(...matchingDocuments);
    }

    if (!args.entityTypes || args.entityTypes.includes('profiles')) {
      const profiles = await ctx.db.query('profiles').collect();
      const matchingProfiles = profiles
        .filter(
          (profile) =>
            (profile.personal.firstName &&
              profile.personal.firstName.toLowerCase().includes(searchLower)) ||
            (profile.personal.lastName &&
              profile.personal.lastName.toLowerCase().includes(searchLower)) ||
            (profile.consularCard.cardNumber &&
              profile.consularCard.cardNumber.toLowerCase().includes(searchLower)),
        )
        .slice(0, limit)
        .map((profile) => ({
          type: 'profile',
          id: profile._id,
          title:
            `${profile.personal.firstName || ''} ${profile.personal.lastName || ''}`.trim() ||
            'Profil sans nom',
          subtitle: profile.consularCard.cardNumber,
          data: profile,
        }));
      results.push(...matchingProfiles);
    }

    if (!args.entityTypes || args.entityTypes.includes('appointments')) {
      const appointments = await ctx.db.query('appointments').collect();
      const matchingAppointments = appointments
        .filter((appointment) =>
          appointment.type.toString().toLowerCase().includes(searchLower),
        )
        .slice(0, limit)
        .map((appointment) => ({
          type: 'appointment',
          id: appointment._id,
          title: `${appointment.type} - ${new Date(appointment.startAt).toLocaleDateString()}`,
          subtitle: `Statut: ${appointment.status}`,
          data: appointment,
        }));
      results.push(...matchingAppointments);
    }

    return results.slice(0, limit);
  },
});

export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    role: v.optional(userRoleValidator),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query('users').collect();
    const searchLower = args.searchTerm.toLowerCase();

    if (args.role) {
      users = users.filter((user) => user.roles.includes(args.role!));
    }

    if (args.status) {
      users = users.filter((user) => user.status === args.status);
    }

    const matchingUsers = users.filter(
      (user) =>
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phoneNumber && user.phoneNumber.includes(searchLower)),
    );

    return matchingUsers.slice(0, args.limit || 50);
  },
});

export const searchOrganizations = query({
  args: {
    searchTerm: v.string(),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let organizations = await ctx.db.query('organizations').collect();
    const searchLower = args.searchTerm.toLowerCase();

    if (args.type) {
      organizations = organizations.filter((org) => org.type === args.type);
    }

    if (args.status) {
      organizations = organizations.filter((org) => org.status === args.status);
    }

    const matchingOrgs = organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(searchLower) ||
        org.code.toLowerCase().includes(searchLower),
    );

    return matchingOrgs.slice(0, args.limit || 50);
  },
});

export const searchServices = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(v.string()),
    organizationId: v.optional(v.id('organizations')),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let services = await ctx.db.query('services').collect();
    const searchLower = args.searchTerm.toLowerCase();

    if (args.category) {
      services = services.filter((service) => service.category === args.category);
    }

    if (args.organizationId) {
      services = services.filter(
        (service) => service.organizationId === args.organizationId,
      );
    }

    if (args.status) {
      services = services.filter((service) => service.status === args.status);
    }

    const matchingServices = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchLower) ||
        service.code.toLowerCase().includes(searchLower) ||
        (service.description && service.description.toLowerCase().includes(searchLower)),
    );

    return matchingServices.slice(0, args.limit || 50);
  },
});
