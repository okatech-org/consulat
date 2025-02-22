'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import {
  ServiceRequestFilters,
  PaginatedServiceRequests,
  FullServiceRequestInclude,
  ServiceRequestStats,
  FullServiceRequest,
} from '@/types/service-request';
import {
  Prisma,
  RequestStatus,
  ServicePriority,
  RequestActionType,
  UserRole,
  ServiceRequest,
  NoteType,
} from '@prisma/client';
import { getTranslations } from 'next-intl/server';

// Options pour la récupération des demandes
export interface GetRequestsOptions extends ServiceRequestFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Récupérer les demandes de services avec filtres et pagination
 */
export async function getServiceRequests(
  options?: GetRequestsOptions,
): Promise<PaginatedServiceRequests> {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);
  if (authResult.error || !authResult.user) {
    throw new Error(authResult.error || 'Unauthorized');
  }

  const {
    search,
    status,
    priority,
    serviceCategory,
    assignedToId,
    organizationId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options || {};

  // Construire la requête where
  const where: Prisma.ServiceRequestWhereInput = {
    // Filtres de base
    ...(status && { status: { in: status } }),
    ...(priority && { priority: { in: priority } }),
    ...(serviceCategory && { service: { category: { in: serviceCategory } } }),
    ...(assignedToId && { assignedToId }),
    ...(organizationId && { organizationId }),
    ...(startDate && { createdAt: { gte: startDate } }),
    ...(endDate && { createdAt: { lte: endDate } }),

    // Recherche
    ...(search && {
      OR: [
        { submittedBy: { firstName: { contains: search, mode: 'insensitive' } } },
        { submittedBy: { lastName: { contains: search, mode: 'insensitive' } } },
        { submittedBy: { email: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),

    // Filtres selon le rôle
    ...(authResult.user.roles.includes(UserRole.AGENT) && {
      OR: [
        { assignedToId: authResult.user.id },
        { assignedToId: null, organizationId: authResult.user.assignedOrganizationId },
      ],
    }),
  };

  try {
    const [requests, total] = await Promise.all([
      db.serviceRequest.findMany({
        where,
        ...FullServiceRequestInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.serviceRequest.count({ where }),
    ]);

    return {
      items: requests as FullServiceRequest[],
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error('Error fetching service requests:', error);
    throw new Error('Failed to fetch service requests');
  }
}

/**
 * Assigner une demande à un agent
 */
export async function assignServiceRequest(requestId: string, agentId: string) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    throw new Error(authResult.error || 'Unauthorized');
  }

  try {
    const [request, agent] = await Promise.all([
      db.serviceRequest.findUnique({ where: { id: requestId } }),
      db.user.findFirst({
        where: {
          id: agentId,
          roles: { has: UserRole.AGENT },
        },
      }),
    ]);

    if (!request || !agent) {
      throw new Error('Request or agent not found');
    }

    const shouldUpdateStatus = request.status === RequestStatus.SUBMITTED;

    const updatedRequest = await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedToId: agentId,
        assignedAt: new Date(),
        lastActionAt: new Date(),
        lastActionBy: authResult.user.id,
        ...(shouldUpdateStatus && {
          status: RequestStatus.PENDING,
        }),
        actions: {
          create: {
            type: shouldUpdateStatus
              ? RequestActionType.STATUS_CHANGE
              : RequestActionType.ASSIGNMENT,
            userId: authResult.user.id,
            data: { agentId },
          },
        },
      },
    });

    revalidatePath(ROUTES.dashboard.requests);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('Error assigning service request:', error);
    throw new Error('Failed to assign service request');
  }
}

/**
 * Mettre à jour le statut d'une demande
 */
export async function updateServiceRequestStatus(
  requestId: string,
  status: RequestStatus,
  notes?: string,
) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);
  if (authResult.error || !authResult.user) {
    throw new Error(authResult.error || 'Unauthorized');
  }

  try {
    const updatedRequest = await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        status,
        lastActionAt: new Date(),
        lastActionBy: authResult.user.id,
        ...(status === RequestStatus.COMPLETED && { completedAt: new Date() }),
        actions: {
          create: {
            type: RequestActionType.STATUS_CHANGE,
            userId: authResult.user.id,
            data: { status, notes },
          },
        },
        ...(notes && {
          notes: {
            create: {
              content: notes,
              type: NoteType.INTERNAL,
              authorId: authResult.user.id,
            },
          },
        }),
      },
      ...FullServiceRequestInclude,
    });

    revalidatePath(ROUTES.dashboard.requests);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('Error updating service request status:', error);
    throw new Error('Failed to update service request status');
  }
}

/**
 * Mettre à jour la requette
 */
export async function updateServiceRequest(
  data: Partial<ServiceRequest> & {
    id: string;
    organizationId?: string | null;
    assignedToId?: string | null;
  },
) {
  const authResult = await checkAuth(['ADMIN', 'MANAGER', 'SUPER_ADMIN']);
  if (authResult.error) return { error: authResult.error };

  if (!data.id) {
    return { error: 'Service request ID is required' };
  }

  try {
    const updatedRequest = await db.$transaction(async (tx) => {
      // Extraction des relations
      const { assignedToId, organizationId, ...requestData } = data;

      // Mise à jour de la demande principale
      const request = await tx.serviceRequest.update({
        where: { id: data.id },
        data: {
          ...Object.fromEntries(
            Object.entries(requestData).filter(([key]) => key !== 'serviceId'),
          ),
          ...(organizationId && {
            organization: { connect: { id: organizationId } },
          }),
          ...(assignedToId && {
            assignedTo: { connect: { id: assignedToId } },
            assignedAt: new Date(),
          }),
          lastActionAt: new Date(),
          lastActionBy: authResult.user?.id,
        },
        ...FullServiceRequestInclude,
      });

      // Journalisation des modifications
      await tx.requestAction.create({
        data: {
          type: RequestActionType.STATUS_CHANGE,
          userId: authResult.user?.id ?? data.lastActionBy!,
          requestId: data.id,
          data: {
            updates: Object.keys(requestData),
          },
        },
      });

      return request;
    });

    revalidatePath(ROUTES.dashboard.requests);
    return { data: updatedRequest };
  } catch (error) {
    console.error('Error updating service request:', error);
    return { error: 'Failed to update service request' };
  }
}

/**
 * Obtenir les statistiques des demandes
 */
export async function getServiceRequestStats(): Promise<ServiceRequestStats> {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);
  if (authResult.error) {
    throw new Error(authResult.error);
  }

  try {
    const [
      total,
      statusStats,
      priorityStats,
      completedToday,
      pendingUrgent,
      agentsStats,
    ] = await Promise.all([
      db.serviceRequest.count(),
      db.serviceRequest.groupBy({
        by: ['status'],
        _count: true,
      }),
      db.serviceRequest.groupBy({
        by: ['priority'],
        _count: true,
      }),
      db.serviceRequest.count({
        where: {
          status: RequestStatus.COMPLETED,
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.serviceRequest.count({
        where: {
          priority: ServicePriority.URGENT,
          status: {
            in: [
              RequestStatus.SUBMITTED,
              RequestStatus.PENDING,
              RequestStatus.PENDING_COMPLETION,
            ],
          },
        },
      }),
      // Get average processing time from agents
      db.user.aggregate({
        where: {
          roles: { has: UserRole.AGENT },
          averageProcessingTime: { not: null },
        },
        _avg: {
          averageProcessingTime: true,
        },
      }),
    ]);

    return {
      total,
      byStatus: Object.fromEntries(
        statusStats.map((stat) => [stat.status, stat._count]),
      ) as Record<RequestStatus, number>,
      byPriority: Object.fromEntries(
        priorityStats.map((stat) => [stat.priority, stat._count]),
      ) as Record<ServicePriority, number>,
      averageProcessingTime: agentsStats._avg?.averageProcessingTime ?? 0,
      completedToday,
      pendingUrgent,
    };
  } catch (error) {
    console.error('Error fetching service request stats:', error);
    throw new Error('Failed to fetch service request stats');
  }
}

/**
 * Récupérer une demande de service par son ID
 */
export async function getServiceRequest(id: string) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);
  if (authResult.error || !authResult.user) {
    throw new Error(authResult.error || 'Unauthorized');
  }

  try {
    const request = await db.serviceRequest.findUnique({
      where: { id },
      ...FullServiceRequestInclude,
    });

    if (!request) {
      return null;
    }

    return request;
  } catch (error) {
    console.error('Error fetching service request:', error);
    throw new Error('Failed to fetch service request');
  }
}

interface AddNoteInput {
  requestId: string;
  content: string;
  type: NoteType;
}

export async function addServiceRequestNote(input: AddNoteInput) {
  const t = await getTranslations('admin.registrations.review.notes');

  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'AGENT']);
    if (authResult.error || !authResult.user) {
      return { error: authResult.error };
    }

    // Récupérer le profil pour avoir l'userId
    const request = await db.serviceRequest.update({
      where: { id: input.requestId },
      data: {
        notes: {
          create: {
            content: input.content,
            type: input.type,
            authorId: authResult.user.id,
          },
        },
      },
    });

    if (!request) {
      return { error: 'Request not found' };
    }

    // Créer la note
    const note = await db.note.create({
      data: {
        content: input.content,
        type: input.type,
        requestId: input.requestId,
        createdBy: authResult.user.id,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Si c'est un feedback, créer une notification pour l'utilisateur
    if (input.type === 'FEEDBACK') {
      await createNotification({
        userId: profile.userId,
        type: 'PROFILE_FEEDBACK',
        title: t('notification.title'),
        message: input.content,
        profileId: input.profileId,
      });
    }

    revalidatePath(`${ROUTES.dashboard.requests}`);

    return { success: true, data: note };
  } catch (error) {
    console.error('Error adding note:', error);
    return { error: 'Failed to add note' };
  }
}
