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
  NotificationType,
} from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { env } from '@/lib/env/index';

// Options pour la récupération des demandes
export interface GetRequestsOptions extends ServiceRequestFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getServiceRequestsByUser(userId: string) {
  await checkAuth();

  const requests = await db.serviceRequest.findMany({
    where: {
      OR: [{ submittedById: userId }, { assignedToId: userId }],
    },
    ...FullServiceRequestInclude,
  });

  return requests;
}

/**
 * Récupérer les demandes de services avec filtres et pagination
 */
export async function getServiceRequests(
  options?: GetRequestsOptions,
): Promise<PaginatedServiceRequests> {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']);

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

  // Ensure page is a positive number
  const safePage = Math.max(1, Number(page));
  const safeLimit = Math.max(1, Number(limit));

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
        { submittedBy: { name: { contains: search, mode: 'insensitive' } } },
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

    ...(authResult.user.roles.includes(UserRole.ADMIN) && {
      organizationId: authResult.user.organizationId,
    }),
  };

  try {
    const [requests, total] = await Promise.all([
      db.serviceRequest.findMany({
        where,
        ...FullServiceRequestInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      db.serviceRequest.count({ where }),
    ]);

    return {
      items: requests as FullServiceRequest[],
      total,
      page: safePage,
      limit: safeLimit,
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
      },
      ...FullServiceRequestInclude,
    });

    if (notes) {
      await db.note.create({
        data: {
          content: notes,
          type: NoteType.FEEDBACK,
          serviceRequest: {
            connect: { id: requestId },
          },
          author: {
            connect: { id: authResult.user.id },
          },
        },
      });
    }

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
          lastActionBy: authResult.user.id,
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
  await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);

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
export async function getServiceRequest(id: string): Promise<FullServiceRequest> {
  await checkAuth(['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']);

  const request = await db.serviceRequest.findUnique({
    where: { id },
    ...FullServiceRequestInclude,
  });

  if (!request) {
    throw new Error('messages.error.not_found', { cause: 'SERVICE_REQUEST_NOT_FOUND' });
  }

  return {
    ...request,
    requiredDocuments: request.requiredDocuments.map((document) => ({
      ...document,
      metadata: JSON.parse(document.metadata as string) as Record<string, unknown>,
    })),
  };
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

    // Récupérer le profil pour avoir l'userId
    const request = await db.serviceRequest.findUnique({
      where: { id: input.requestId },
      include: {
        submittedBy: true,
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
        authorId: authResult.user.id,
        serviceRequestId: input.requestId,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Si c'est un feedback, créer une notification pour l'utilisateur
    if (input.type === 'FEEDBACK') {
      await notify({
        userId: request.submittedById,
        type: NotificationType.FEEDBACK,
        title: `Nouveau message du service consulaire`,
        message: `Bonjour ${request.submittedBy.name}, vous avez reçu un nouveau message : \n\n ${input.content}`,
        channels: [
          NotificationChannel.APP,
          NotificationChannel.EMAIL,
          NotificationChannel.SMS,
        ],
        // Ajouter l'email si disponible
        ...(request.submittedBy.email && { email: request.submittedBy.email }),
        ...(request.submittedBy.phoneNumber && {
          phoneNumber: request.submittedBy.phoneNumber,
        }),
        // Ajouter des actions si nécessaire
        actions: [
          {
            label: t('notification.actions.view_request'),
            url: `${env.NEXT_PUBLIC_URL}${ROUTES.user.requests}/${request.id}`,
            primary: true,
          },
        ],
        // Ajouter des métadonnées utiles
        metadata: {
          requestId: request.id,
          noteId: note.id,
          noteType: input.type,
        },
      });
    }

    revalidatePath(`${ROUTES.dashboard.requests}`);

    return { success: true, data: note };
  } catch (error) {
    console.error('Error adding note:', error);
    return { error: 'Failed to add note' };
  }
}
