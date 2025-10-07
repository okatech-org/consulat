import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { validateRequest } from '../../helpers/validation'
import {
  ActivityType,
  RequestActionType,
  RequestStatus,
} from '../../lib/constants'
import type { RequestPriority } from '../../lib/constants'

export const updateRequest = mutation({
  args: {
    requestId: v.id('requests'),
    status: v.optional(v.string()),
    priority: v.optional(v.number()),
    formData: v.optional(v.any()),
    documentIds: v.optional(v.array(v.id('documents'))),
    assignedToId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const existingRequest = await ctx.db.get(args.requestId)
    if (!existingRequest) {
      throw new Error('Request not found')
    }

    // Validation si des champs critiques sont modifiés
    if (args.priority !== undefined) {
      const requestData = {
        serviceId: existingRequest.serviceId,
        requesterId: existingRequest.requesterId,
        priority: args.priority,
      }

      const validationErrors = validateRequest(requestData)
      if (validationErrors.length > 0) {
        throw new Error(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
        )
      }
    }

    const updateData = {
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
    }

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
      ]

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
      ]
    }

    await ctx.db.patch(args.requestId, updateData)
    return args.requestId
  },
})

export const submitRequest = mutation({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    if (request.status !== RequestStatus.Draft) {
      throw new Error('Only draft requests can be submitted')
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
    })

    return args.requestId
  },
})

export const assignRequest = mutation({
  args: {
    requestId: v.id('requests'),
    assignedToId: v.id('users'),
    assignedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
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
    })

    return args.requestId
  },
})

export const completeRequest = mutation({
  args: {
    requestId: v.id('requests'),
    completedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
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
    })

    return args.requestId
  },
})

export const addRequestDocument = mutation({
  args: {
    requestId: v.id('requests'),
    documentId: v.id('documents'),
    addedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    if (request.documentIds.includes(args.documentId)) {
      throw new Error('Document already exists in request')
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
    })

    return args.requestId
  },
})

export const addRequestNote = mutation({
  args: {
    requestId: v.id('requests'),
    note: v.string(),
    addedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
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
    })

    return args.requestId
  },
})
