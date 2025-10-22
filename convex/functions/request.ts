import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { validateRequest } from '../helpers/validation';
import { ActivityType, RequestPriority, RequestStatus, UserRole } from '../lib/constants';
import { Doc } from '../_generated/dataModel';
import { query } from '../_generated/server';
import { requestStatusValidator, requestPriorityValidator } from '../lib/validators';

export const createRequest = mutation({
  args: {
    serviceId: v.id('services'),
    requesterId: v.id('users'),
    profileId: v.optional(v.id('profiles')),
    priority: v.optional(requestPriorityValidator),
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
      assignedAgentId: undefined,
      notes: [],
      metadata: {
        submittedAt: undefined,
        completedAt: undefined,
        assignedAt: undefined,
        activities: [],
      },
      generatedDocuments: [],
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
    status: v.optional(requestStatusValidator),
    requesterId: v.optional(v.id('users')),
    assignedAgentId: v.optional(v.id('memberships')),
    serviceId: v.optional(v.id('services')),
    priority: v.optional(requestPriorityValidator),
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
    } else if (args.assignedAgentId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_assigned', (q) => q.eq('assignedAgentId', args.assignedAgentId!))
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
  args: { assignedAgentId: v.id('memberships') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_assigned', (q) => q.eq('assignedAgentId', args.assignedAgentId))
      .order('desc')
      .collect();
  },
});

export const getRequestsByStatus = query({
  args: { status: requestStatusValidator },
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
    status: v.optional(requestStatusValidator),
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
    return await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.userId))
      .order('desc')
      .collect();
  },
});

export const updateRequest = mutation({
  args: {
    requestId: v.id('requests'),
    status: v.optional(requestStatusValidator),
    priority: v.optional(requestPriorityValidator),
    formData: v.optional(v.record(v.string(), v.any())),
    documentIds: v.optional(v.array(v.id('documents'))),
    assignedAgentId: v.optional(v.id('memberships')),
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

    const updateData: Partial<Doc<'requests'>> & Record<string, unknown> = {
      ...(args.status && { status: args.status }),
      ...(args.priority !== undefined && {
        priority: args.priority,
      }),
      ...(args.formData && { formData: args.formData }),
      ...(args.documentIds && { documentIds: args.documentIds }),
      ...(args.assignedAgentId && { assignedAgentId: args.assignedAgentId }),
    };

    const now = Date.now();
    let metadataChanged = false;
    const newMetadata = { ...existingRequest.metadata };

    if (args.assignedAgentId) {
      newMetadata.assignedAt = now;
      metadataChanged = true;
    }

    // Ajouter une activité pour les changements de statut
    if (args.status && args.status !== existingRequest.status) {
      newMetadata.activities = [
        ...existingRequest.metadata.activities,
        {
          type: ActivityType.StatusChanged,
          actorId: args.assignedAgentId || existingRequest.assignedAgentId,
          data: {
            from: existingRequest.status,
            to: args.status,
          },
          timestamp: now,
        },
      ];
      metadataChanged = true;
    }

    await ctx.db.patch(args.requestId, {
      ...updateData,
      ...(metadataChanged ? { metadata: newMetadata } : {}),
    });
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
      metadata: {
        ...request.metadata,
        submittedAt: Date.now(),
        activities: [
          ...request.metadata.activities,
          {
            type: ActivityType.RequestSubmitted,
            actorId: request.assignedAgentId,
            data: {},
            timestamp: Date.now(),
          },
        ],
      },
    });

    return args.requestId;
  },
});

export const assignRequest = mutation({
  args: {
    requestId: v.id('requests'),
    assignedAgentId: v.id('memberships'),
    assignedById: v.id('memberships'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await ctx.db.patch(args.requestId, {
      assignedAgentId: args.assignedAgentId,
      metadata: {
        ...request.metadata,
        assignedAt: Date.now(),
        activities: [
          ...request.metadata.activities,
          {
            type: ActivityType.RequestAssigned,
            actorId: args.assignedById,
            data: { assignedAgentId: args.assignedAgentId },
            timestamp: Date.now(),
          },
        ],
      },
    });

    return args.requestId;
  },
});

export const autoAssignRequestToAgent = mutation({
  args: {
    requestId: v.id('requests'),
    serviceId: v.id('services'),
    organizationId: v.id('organizations'),
    countryCode: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error('Request not found');
    }

    const agents = await ctx.db
      .query('memberships')
      .withIndex('by_role_and_organization', (q) =>
        q.eq('role', UserRole.Agent).eq('organizationId', args.organizationId),
      )
      .filter((q) => q.eq(q.field('assignedServices'), [args.serviceId]))
      .collect();

    if (agents.length === 0) {
      console.error(
        'Could not find any agents for organization to auto-assign request',
        args.requestId,
      );
      return;
    }

    const agentWithActiveRequestsCount = await Promise.all(
      agents.map(async (agent) => {
        const activeRequestsCount = await ctx.db
          .query('requests')
          .withIndex('by_assigned', (q) => q.eq('assignedAgentId', agent._id))
          .filter((q) => q.not(q.eq(q.field('status'), RequestStatus.Completed)))
          .filter((q) => q.not(q.eq(q.field('status'), RequestStatus.Rejected)))
          .filter((q) => q.not(q.eq(q.field('status'), RequestStatus.Cancelled)))
          .collect();
        return {
          ...agent,
          activeRequestsCount: activeRequestsCount.length,
        };
      }),
    );

    const bestAgent = agentWithActiveRequestsCount.sort((a, b) => {
      return b.activeRequestsCount - a.activeRequestsCount;
    })[0];

    await ctx.db.patch(args.requestId, {
      assignedAgentId: bestAgent._id,
    });
  },
});

export const completeRequest = mutation({
  args: {
    requestId: v.id('requests'),
    completedById: v.id('memberships'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await ctx.db.patch(args.requestId, {
      status: RequestStatus.Completed,
      metadata: {
        ...request.metadata,
        completedAt: Date.now(),
        activities: [
          ...request.metadata.activities,
          {
            type: ActivityType.RequestCompleted,
            actorId: args.completedById,
            data: {},
            timestamp: Date.now(),
          },
        ],
      },
    });

    return args.requestId;
  },
});

export const addRequestDocument = mutation({
  args: {
    requestId: v.id('requests'),
    documentId: v.id('documents'),
    addedById: v.id('memberships'),
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
      metadata: {
        ...request.metadata,
        activities: [
          ...request.metadata.activities,
          {
            type: ActivityType.DocumentUploaded,
            actorId: args.addedById,
            data: { documentId: args.documentId },
            timestamp: Date.now(),
          },
        ],
      },
    });

    return args.requestId;
  },
});

export const addRequestNote = mutation({
  args: {
    requestId: v.id('requests'),
    note: v.object({
      type: v.union(v.literal('internal'), v.literal('feedback')),
      content: v.string(),
    }),
    addedById: v.id('memberships'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await ctx.db.patch(args.requestId, {
      metadata: {
        ...request.metadata,
        activities: [
          ...request.metadata.activities,
          {
            type: ActivityType.CommentAdded,
            actorId: args.addedById,
            data: { note: args.note.content, type: args.note.type },
            timestamp: Date.now(),
          },
        ],
      },
    });

    return args.requestId;
  },
});

/**
 * Get enriched requests list with filtering, sorting, and pagination
 */
export const getRequestsListEnriched = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.array(requestStatusValidator)),
    priority: v.optional(v.array(requestPriorityValidator)),
    serviceCategory: v.optional(v.array(v.string())),
    organizationId: v.optional(v.array(v.id('organizations'))),
    assignedToId: v.optional(v.array(v.id('memberships'))),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const limit = args.limit ?? 10;
    const skip = (page - 1) * limit;

    // Start with all requests
    let requests = await ctx.db.query('requests').order('desc').collect();

    // Filter by status
    if (args.status && args.status.length > 0) {
      requests = requests.filter((req) => args.status!.includes(req.status));
    }

    // Filter by priority
    if (args.priority && args.priority.length > 0) {
      requests = requests.filter((req) => args.priority!.includes(req.priority));
    }

    // Filter by serviceCategory
    if (args.serviceCategory && args.serviceCategory.length > 0) {
      const services = await ctx.db.query('services').collect();
      const servicesByCategory = services
        .filter((s) => args.serviceCategory!.includes(s.category))
        .map((s) => s._id);
      requests = requests.filter((req) => servicesByCategory.includes(req.serviceId));
    }

    // Filter by organizationId
    if (args.organizationId && args.organizationId.length > 0) {
      requests = requests.filter((req) =>
        args.organizationId!.includes((req as any).organizationId || 'unknown'),
      );
    }

    // Filter by assignedToId
    if (args.assignedToId && args.assignedToId.length > 0) {
      requests = requests.filter(
        (req) => req.assignedAgentId && args.assignedToId!.includes(req.assignedAgentId),
      );
    }

    // Filter by search term (firstName, lastName, email, phone, cardNumber, passportNumber, service name)
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      requests = requests.filter((req) => {
        const requestNumber = req.number.toLowerCase().includes(searchTerm);
        return requestNumber;
      });
    }

    // Get total count before pagination
    const total = requests.length;

    // Sort
    const sortBy = args.sortBy ?? 'createdAt';
    const sortOrder = args.sortOrder ?? 'desc';

    requests.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortBy === 'createdAt') {
        aVal = a.metadata.submittedAt;
        bVal = b.metadata.submittedAt;
      } else if (sortBy === 'status') {
        aVal = a.status;
        bVal = b.status;
      } else if (sortBy === 'priority') {
        aVal = a.priority;
        bVal = b.priority;
      } else {
        aVal = (a as any)[sortBy] ?? '';
        bVal = (b as any)[sortBy] ?? '';
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const paginatedRequests = requests.slice(skip, skip + limit);

    // Enrich requests with related data
    const enrichedRequests = await Promise.all(
      paginatedRequests.map(async (req) => {
        const [service, requester, organization, assignedAgent] = await Promise.all([
          ctx.db.get(req.serviceId),
          ctx.db.get(req.requesterId),
          req.serviceId
            ? (ctx.db.get(req.serviceId as any) as any)
            : Promise.resolve(null),
          req.assignedAgentId ? ctx.db.get(req.assignedAgentId) : Promise.resolve(null),
        ]);

        return {
          ...req,
          service: service || undefined,
          requester: requester || undefined,
          organization: organization || undefined,
          assignedAgent: assignedAgent || undefined,
        };
      }),
    );

    return {
      items: enrichedRequests,
      total,
      page,
      limit,
    };
  },
});

/**
 * Update status for a single request
 */
export const updateRequestStatus = mutation({
  args: {
    requestId: v.id('requests'),
    status: requestStatusValidator,
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const newMetadata = { ...request.metadata };
    const now = Date.now();

    newMetadata.activities = [
      ...request.metadata.activities,
      {
        type: ActivityType.StatusChanged,
        actorId: request.assignedAgentId,
        data: {
          from: request.status,
          to: args.status,
        },
        timestamp: now,
      },
    ];

    await ctx.db.patch(args.requestId, {
      status: args.status,
      metadata: newMetadata,
    });

    return args.requestId;
  },
});

/**
 * Assign a request to an agent
 */
export const assignRequestToAgent = mutation({
  args: {
    requestId: v.id('requests'),
    agentId: v.id('memberships'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const newMetadata = { ...request.metadata };
    const now = Date.now();

    newMetadata.assignedAt = now;
    newMetadata.activities = [
      ...request.metadata.activities,
      {
        type: ActivityType.RequestAssigned,
        actorId: args.agentId,
        data: { assignedAgentId: args.agentId },
        timestamp: now,
      },
    ];

    await ctx.db.patch(args.requestId, {
      assignedAgentId: args.agentId,
      metadata: newMetadata,
    });

    return args.requestId;
  },
});
