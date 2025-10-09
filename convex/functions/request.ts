import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { validateRequest } from '../helpers/validation';
import {
  ActivityType,
  RequestActionType,
  RequestPriority,
  RequestStatus,
} from '../lib/constants';
import { Doc } from '../_generated/dataModel';
import { query } from '../_generated/server';
import { getUserRequestsHelper } from '../helpers/relationships';

export const createRequest = mutation({
  args: {
    serviceId: v.id('services'),
    requesterId: v.id('users'),
    profileId: v.optional(v.id('profiles')),
    priority: v.optional(v.number()),
    formData: v.optional(v.record(v.string(), v.any())),
    documentIds: v.optional(v.array(v.id('documents'))),
  },
  handler: async (ctx, args) => {
    const requestData = {
      serviceId: args.serviceId,
      requesterId: args.requesterId,
      priority: args.priority,
    };

    const validationErrors = validateRequest(requestData);
    if (validationErrors.length > 0) {
      throw new Error(
        `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
      );
    }

    // Générer un numéro de demande unique
    const requestCount = await ctx.db.query('requests').collect();
    const requestNumber = `REQ-${String(requestCount.length + 1).padStart(6, '0')}`;

    const requestId = await ctx.db.insert('requests', {
      number: requestNumber,
      serviceId: args.serviceId,
      requesterId: args.requesterId,
      profileId: args.profileId,
      status: RequestStatus.Draft,
      priority: args.priority || RequestPriority.Normal,
      formData: args.formData,
      documentIds: args.documentIds || [],
      assignedToId: undefined,
      assignedAt: undefined,
      activities: [
        {
          type: ActivityType.RequestCreated,
          actorId: args.requesterId,
          data: { requestNumber },
          timestamp: Date.now(),
        },
      ],
      actions: [],
      submittedAt: undefined,
      completedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return requestId;
  },
});

export const getCurrentRequest = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return null;

    const current: Doc<'requests'> | null = await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.userId))
      .order('desc')
      .first();

    if (!current) return null;

    const [service] = await Promise.all([ctx.db.get(current.serviceId)]);

    return {
      ...current,
      service,
    };
  },
});

export const getRecentRequests = query({
  args: { limit: v.optional(v.number()), userId: v.id('users') },
  handler: async (ctx, args) => {
    if (!args.userId) return [];

    const limit = args.limit ?? 5;

    const requests: Array<Doc<'requests'>> = await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.userId))
      .order('desc')
      .take(limit);

    const enriched = await Promise.all(
      requests.map(async (r) => ({
        ...r,
        service: await ctx.db.get(r.serviceId),
      })),
    );

    return enriched;
  },
});

export const getRequest = query({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const getRequestByNumber = query({
  args: { number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_number', (q) => q.eq('number', args.number))
      .first();
  },
});

export const getAllRequests = query({
  args: {
    status: v.optional(v.string()),
    requesterId: v.optional(v.id('users')),
    assignedToId: v.optional(v.id('users')),
    serviceId: v.optional(v.id('services')),
    priority: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let requests: Array<Doc<'requests'>> = [];

    if (args.requesterId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_requester', (q) => q.eq('requesterId', args.requesterId!))
        .order('desc')
        .collect();
    } else if (args.assignedToId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_assigned', (q) => q.eq('assignedToId', args.assignedToId))
        .order('desc')
        .collect();
    } else if (args.serviceId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_service', (q) => q.eq('serviceId', args.serviceId!))
        .order('desc')
        .collect();
    } else if (args.priority !== undefined && args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_priority_status', (q) =>
          q.eq('priority', args.priority!).eq('status', args.status!),
        )
        .order('desc')
        .collect();
    } else if (args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      requests = await ctx.db.query('requests').order('desc').collect();
    }

    return args.limit ? requests.slice(0, args.limit) : requests;
  },
});

export const getRequestsByRequester = query({
  args: { requesterId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.requesterId))
      .order('desc')
      .collect();
  },
});

export const getRequestsByAssignee = query({
  args: { assignedToId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_assigned', (q) => q.eq('assignedToId', args.assignedToId))
      .order('desc')
      .collect();
  },
});

export const getRequestsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect();
  },
});

export const getRequestsByService = query({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_service', (q) => q.eq('serviceId', args.serviceId))
      .order('desc')
      .collect();
  },
});

export const searchRequests = query({
  args: {
    searchTerm: v.string(),
    requesterId: v.optional(v.id('users')),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests: Array<Doc<'requests'>> = [];

    if (args.requesterId && args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_requester', (q) => q.eq('requesterId', args.requesterId!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .collect();
    } else if (args.requesterId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_requester', (q) => q.eq('requesterId', args.requesterId!))
        .collect();
    } else if (args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect();
    } else {
      requests = await ctx.db.query('requests').collect();
    }

    return requests.filter((request) =>
      request.number.toLowerCase().includes(args.searchTerm.toLowerCase()),
    );
  },
});

export const getUserRequests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await getUserRequestsHelper(ctx, args.userId);
  },
});

export const updateRequest = mutation({
  args: {
    requestId: v.id('requests'),
    status: v.optional(v.string()),
    priority: v.optional(v.number()),
    formData: v.optional(v.record(v.string(), v.any())),
    documentIds: v.optional(v.array(v.id('documents'))),
    assignedToId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const existingRequest = await ctx.db.get(args.requestId);
    if (!existingRequest) {
      throw new Error('Request not found');
    }

    // Validation si des champs critiques sont modifiés
    if (args.priority !== undefined) {
      const requestData = {
        serviceId: existingRequest.serviceId,
        requesterId: existingRequest.requesterId,
        priority: args.priority,
      };

      const validationErrors = validateRequest(requestData);
      if (validationErrors.length > 0) {
        throw new Error(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
        );
      }
    }

    const updateData: any = {
      ...(args.status && { status: args.status as RequestStatus }),
      ...(args.priority !== undefined && {
        priority: args.priority as RequestPriority,
      }),
      ...(args.formData && { formData: args.formData }),
      ...(args.documentIds && { documentIds: args.documentIds }),
      ...(args.assignedToId && {
        assignedToId: args.assignedToId,
        assignedAt: Date.now(),
      }),
      updatedAt: Date.now(),
    };

    // Ajouter une activité pour les changements de statut
    if (args.status && args.status !== existingRequest.status) {
      updateData.activities = [
        ...existingRequest.activities,
        {
          type: ActivityType.StatusChanged,
          actorId: args.assignedToId || existingRequest.requesterId,
          data: {
            from: existingRequest.status,
            to: args.status,
          },
          timestamp: Date.now(),
        },
      ];

      // Ajouter une action
      updateData.actions = [
        ...existingRequest.actions,
        {
          type: RequestActionType.StatusChange,
          data: {
            from: existingRequest.status,
            to: args.status,
          },
          userId: args.assignedToId || existingRequest.requesterId,
          createdAt: Date.now(),
        },
      ];
    }

    await ctx.db.patch(args.requestId, updateData);
    return args.requestId;
  },
});

export const submitRequest = mutation({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== RequestStatus.Draft) {
      throw new Error('Only draft requests can be submitted');
    }

    await ctx.db.patch(args.requestId, {
      status: RequestStatus.Submitted,
      submittedAt: Date.now(),
      activities: [
        ...request.activities,
        {
          type: ActivityType.RequestSubmitted,
          actorId: request.requesterId,
          data: {},
          timestamp: Date.now(),
        },
      ],
      actions: [
        ...request.actions,
        {
          type: RequestActionType.StatusChange,
          data: {
            from: RequestStatus.Draft,
            to: RequestStatus.Submitted,
          },
          userId: request.requesterId,
          createdAt: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

export const assignRequest = mutation({
  args: {
    requestId: v.id('requests'),
    assignedToId: v.id('users'),
    assignedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await ctx.db.patch(args.requestId, {
      assignedToId: args.assignedToId,
      assignedAt: Date.now(),
      activities: [
        ...request.activities,
        {
          type: ActivityType.RequestAssigned,
          actorId: args.assignedById,
          data: { assignedToId: args.assignedToId },
          timestamp: Date.now(),
        },
      ],
      actions: [
        ...request.actions,
        {
          type: RequestActionType.Assignment,
          data: { assignedToId: args.assignedToId },
          userId: args.assignedById,
          createdAt: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

export const completeRequest = mutation({
  args: {
    requestId: v.id('requests'),
    completedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await ctx.db.patch(args.requestId, {
      status: RequestStatus.Completed,
      completedAt: Date.now(),
      activities: [
        ...request.activities,
        {
          type: ActivityType.RequestCompleted,
          actorId: args.completedById,
          data: {},
          timestamp: Date.now(),
        },
      ],
      actions: [
        ...request.actions,
        {
          type: RequestActionType.Completed,
          data: {},
          userId: args.completedById,
          createdAt: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

export const addRequestDocument = mutation({
  args: {
    requestId: v.id('requests'),
    documentId: v.id('documents'),
    addedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.documentIds.includes(args.documentId)) {
      throw new Error('Document already exists in request');
    }

    await ctx.db.patch(args.requestId, {
      documentIds: [...request.documentIds, args.documentId],
      activities: [
        ...request.activities,
        {
          type: ActivityType.DocumentUploaded,
          actorId: args.addedById,
          data: { documentId: args.documentId },
          timestamp: Date.now(),
        },
      ],
      actions: [
        ...request.actions,
        {
          type: RequestActionType.DocumentAdded,
          data: { documentId: args.documentId },
          userId: args.addedById,
          createdAt: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});

export const addRequestNote = mutation({
  args: {
    requestId: v.id('requests'),
    note: v.string(),
    addedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await ctx.db.patch(args.requestId, {
      activities: [
        ...request.activities,
        {
          type: ActivityType.CommentAdded,
          actorId: args.addedById,
          data: { note: args.note },
          timestamp: Date.now(),
        },
      ],
      actions: [
        ...request.actions,
        {
          type: RequestActionType.NoteAdded,
          data: { note: args.note },
          userId: args.addedById,
          createdAt: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});
