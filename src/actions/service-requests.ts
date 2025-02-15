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
} from '@/types/service-request';
import {
  Prisma,
  RequestStatus,
  ServicePriority,
  RequestActionType,
  UserRole,
} from '@prisma/client';
import { hasRole, withPermission } from '@/lib/permissions/utils';

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
export const getServiceRequests = withPermission(
  'serviceRequests',
  'view',
  async (user, options?: GetRequestsOptions): Promise<PaginatedServiceRequests> => {
    const {
      search,
      status,
      priority,
      category,
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
      ...(category && { service: { category: { in: category } } }),
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
      ...(hasRole(user, UserRole.AGENT) && {
        OR: [
          { assignedToId: user.id },
          { assignedToId: null, organizationId: user.assignedOrganizationId },
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
        items: requests,
        total,
        page,
        limit,
        hasMore: total > page * limit,
      };
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw new Error('Failed to fetch service requests');
    }
  },
);

/**
 * Assigner une demande à un agent
 */
export async function assignServiceRequest(requestId: string, agentId: string) {
  const authResult = await checkAuth(['ADMIN', 'MANAGER']);
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

    // Mettre à jour la demande
    const updatedRequest = await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedToId: agentId,
        assignedAt: new Date(),
        status: RequestStatus.ASSIGNED,
        lastActionAt: new Date(),
        lastActionBy: authResult.user.id,
        actions: {
          create: {
            type: RequestActionType.ASSIGNMENT,
            userId: authResult.user.id,
            data: { agentId },
          },
        },
      },
      ...FullServiceRequestInclude,
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
              RequestStatus.ASSIGNED,
              RequestStatus.IN_REVIEW,
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
