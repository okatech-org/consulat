'use server';

import { db } from '@/server/db';
import { checkAuth } from '@/lib/auth/action';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import {
  type ServiceRequestFilters,
  FullServiceRequestInclude,
  type ServiceRequestStats,
  type FullServiceRequest,
} from '@/types/service-request';
import {
  Prisma,
  RequestStatus,
  ServicePriority,
  RequestActionType,
  UserRole,
  type ServiceRequest,
  NoteType,
  NotificationType,
} from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { env } from '@/env';

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

const ServiceRequestListItemSelect: Prisma.ServiceRequestSelect = {
  id: true,
  status: true,
  priority: true,
  serviceCategory: true,
  createdAt: true,
  updatedAt: true,
  submittedBy: true,
  requestedFor: {
    include: {
      identityPicture: true,
    },
  },
  assignedTo: true,
  organization: true,
  country: true,
};

export type ServiceRequestListItem = Prisma.ServiceRequestGetPayload<{
  select: typeof ServiceRequestListItemSelect;
}>;

export interface PaginatedServiceRequests {
  items: ServiceRequestListItem[];
  total: number;
}

/**
 * Récupérer les demandes de services avec filtres et pagination
 */
export async function getServiceRequestsList(
  options?: GetRequestsOptions,
): Promise<PaginatedServiceRequests> {
  const { user } = await checkAuth(['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']);

  const {
    search,
    status,
    priority,
    serviceCategory,
    assignedToId,
    organizationId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options || {};

  const where: Prisma.ServiceRequestWhereInput = {};

  if (user.roles.includes(UserRole.AGENT)) {
    where.assignedToId = { in: [user.id] };
  }

  if (status) where.status = { in: status };
  if (priority) where.priority = { in: priority };
  if (serviceCategory) where.serviceCategory = { in: serviceCategory };
  if (assignedToId && !user.roles.includes(UserRole.MANAGER)) {
    where.assignedToId = { in: assignedToId };
  }
  if (organizationId) where.organizationId = { in: organizationId };

  if (search) {
    where.OR = [
      { requestedFor: { firstName: { contains: search, mode: 'insensitive' } } },
      { requestedFor: { lastName: { contains: search, mode: 'insensitive' } } },
      { requestedFor: { email: { contains: search, mode: 'insensitive' } } },
      { requestedFor: { phoneNumber: { contains: search, mode: 'insensitive' } } },
      { requestedFor: { cardNumber: { contains: search, mode: 'insensitive' } } },
      { requestedFor: { passportNumber: { contains: search, mode: 'insensitive' } } },
      { service: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [requests, total] = await Promise.all([
    db.serviceRequest.findMany({
      where,
      select: ServiceRequestListItemSelect,
      ...(sortBy && {
        orderBy:
          sortBy === 'firstName' || sortBy === 'lastName'
            ? { requestedFor: { [sortBy]: sortOrder } }
            : { [sortBy]: sortOrder },
      }),
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.serviceRequest.count({ where }),
  ]);

  return {
    items: requests,
    total,
  };
}

/**
 * Assigner une demande à un agent
 */
export async function assignServiceRequest(requestId: string, agentId: string) {
  const authResult = await checkAuth(['ADMIN', 'MANAGER', 'SUPER_ADMIN']);

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
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']);

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
  await checkAuth();

  const request = await db.serviceRequest.findUnique({
    where: { id },
    ...FullServiceRequestInclude,
  });

  if (!request) {
    throw new Error('messages.error.not_found', {
      cause: 'SERVICE_REQUEST_NOT_FOUND',
    });
  }
  // Type assertion remains useful, assuming FullServiceRequest type will be fixed
  const typedRequest = request as unknown as FullServiceRequest;

  // Parse metadata for each document if metadata exists and is a string
  // This map operates on the structure included by Prisma
  typedRequest.requiredDocuments = typedRequest.requiredDocuments.map((doc) => {
    let parsedMetadata = doc.metadata; // Default to original
    if (typeof doc.metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(doc.metadata);
      } catch (error) {
        console.error(`Failed to parse metadata for document ${doc.id}:`, error);
      }
    }
    // Return the document with potentially parsed metadata
    // The structure (including validatedBy) is preserved from the Prisma fetch
    return { ...doc, metadata: parsedMetadata };
  });

  return typedRequest;
}

interface AddNoteInput {
  requestId: string;
  content: string;
  type: NoteType;
}

export async function addServiceRequestNote(input: AddNoteInput) {
  const t = await getTranslations('admin.registrations.review.notes');

  try {
    const authResult = await checkAuth();

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
