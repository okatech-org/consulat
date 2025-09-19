'use server';

import type { CountryCode } from '@/lib/autocomplete-datas';
import { db } from '@/server/db';
import {
  type User,
  RequestActionType,
  type ServiceRequest,
  NotificationType,
  PrismaClient,
  Prisma,
  UserRole,
} from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '@/schemas/routes';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { checkAuth } from '@/lib/auth/action';
import { tryCatch } from '@/lib/utils';
import { env } from '@/env';

type Agent = User & { assignedRequests: ServiceRequest[] };

export async function assignAgentToRequest(
  requestId: string,
  organizationId: string,
  countryCode: CountryCode,
  dbTx: PrismaClient,
) {
  const t = await getTranslations();
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      assignedTo: true,
      appointments: {
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'],
          },
        },
      },
    },
  });

  if (!request || request.organizationId !== organizationId) {
    throw new Error('request_not_found');
  }

  // Si déjà assigné, on ne réassigne pas
  if (request.assignedTo) {
    throw new Error('request_already_assigned');
  }

  const agents = await getAvailableAgents(organizationId, countryCode, request.serviceId);

  if (agents.length === 0) {
    throw new Error('no_agents_available');
  }

  // Algorithme d'assignation basé sur plusieurs facteurs
  const assignedAgent = await selectBestAgent(agents, request.priority);

  // Assigner la requête à l'agent
  const updatedRequest = await dbTx.serviceRequest.update({
    where: { id: requestId },
    data: {
      assignedToId: assignedAgent.id,
      assignedAt: new Date(),
      status: 'PENDING',
      lastActionAt: new Date(),
      lastActionBy: assignedAgent.id,
    },
  });

  // Assign the request to the agent in the appointments
  const appointmentsUpdatePromises = request.appointments.map((appointment) =>
    dbTx.appointment.update({
      where: { id: appointment.id },
      data: {
        agentId: assignedAgent.id,
      },
    }),
  );

  const appointmentsUpdateResult = await tryCatch(
    Promise.all(appointmentsUpdatePromises),
  );

  if (appointmentsUpdateResult.error) {
    throw new Error('failed_to_assign_agent_to_appointments');
  }

  await Promise.all([
    // Créer une action pour tracer l'assignation
    await dbTx.requestAction.create({
      data: {
        type: RequestActionType.ASSIGNMENT,
        requestId: requestId,
        userId: assignedAgent.id,
        data: {
          previousStatus: request.status,
          newStatus: 'PENDING',
        },
      },
    }),
    // créer une notification pour l'agent
    await notify({
      userId: assignedAgent.id,
      type: NotificationType.REQUEST_NEW,
      title: t('agent.notifications.REQUEST_NEW.title'),
      message: t('agent.notifications.REQUEST_NEW.message', {
        requestType: request.serviceCategory,
      }),
      channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
      email: assignedAgent.email || undefined,
      actions: [
        {
          label: t('agent.notifications.REQUEST_NEW.see_request'),
          url: `${env.NEXT_PUBLIC_URL}${ROUTES.dashboard.service_requests(request.id)}`,
          primary: true,
        },
      ],
      metadata: {
        requestId: request.id,
        requestType: request.serviceCategory,
        organizationId: organizationId,
        countryCode: countryCode,
      },
    }),
  ]);

  return updatedRequest;
}

export async function assignRequestToAgent(requestId: string, agentId: string) {
  const t = await getTranslations();
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error('request_not_found');
  }

  // Assigner la requête à l'agent
  const updatedRequest = await db.serviceRequest.update({
    where: { id: requestId },
    data: {
      assignedToId: agentId,
      assignedAt: new Date(),
      status: 'PENDING',
      lastActionAt: new Date(),
      lastActionBy: agentId,
    },
    include: {
      assignedTo: true,
    },
  });

  await Promise.all([
    // Créer une action pour tracer l'assignation
    await db.requestAction.create({
      data: {
        type: RequestActionType.ASSIGNMENT,
        requestId: requestId,
        userId: agentId,
        data: {
          previousStatus: request.status,
          newStatus: 'PENDING',
        },
      },
    }),
    // créer une notification pour l'agent
    await notify({
      userId: agentId,
      type: NotificationType.REQUEST_NEW,
      title: t('agent.notifications.REQUEST_NEW.title'),
      message: t('agent.notifications.REQUEST_NEW.message', {
        requestType: request.serviceCategory,
      }),
      channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
      email: updatedRequest.assignedTo?.email || undefined,
      actions: [
        {
          label: t('agent.notifications.REQUEST_NEW.see_request'),
          url: `${env.NEXT_PUBLIC_URL}${ROUTES.dashboard.service_requests(request.id)}`,
          primary: true,
        },
      ],
      metadata: {
        requestId: request.id,
        requestType: request.serviceCategory,
        organizationId: request.organizationId,
        countryCode: request.countryCode,
      },
    }),
  ]);
}

// Fonction helper pour sélectionner le meilleur agent
async function selectBestAgent(agents: Agent[], requestPriority: string): Promise<Agent> {
  // Calculer un score pour chaque agent
  const agentScores = agents.map((agent) => {
    const activeRequestsCount = agent.assignedRequests.length;
    const maxRequests = agent.maxActiveRequests || 10; // Valeur par défaut si non définie

    // Facteurs de score
    const workloadScore = 1 - activeRequestsCount / maxRequests; // Plus bas = plus chargé
    const performanceScore = calculatePerformanceScore(agent);
    const experienceScore = agent.completedRequests / 100; // Normalisé à 1

    // Score final pondéré
    const finalScore =
      workloadScore * 0.4 + // 40% importance
      performanceScore * 0.3 + // 30% importance
      experienceScore * 0.3; // 30% importance

    return { agent, score: finalScore };
  });

  // Trier par score et sélectionner le meilleur
  const sortedAgents = agentScores.sort((a, b) => b.score - a.score);

  if (sortedAgents.length === 0) {
    throw new Error('no_qualified_agents_available');
  }

  // Si la requête est urgente, prendre le meilleur agent disponible
  if (requestPriority === 'URGENT') {
    const urgentAgent = sortedAgents[0];
    if (!urgentAgent) throw new Error('no_urgent_agent_available');
    return urgentAgent.agent;
  }

  // Pour les requêtes standard, ajouter un peu de randomisation parmi les 3 meilleurs
  const topAgents = sortedAgents.slice(0, Math.min(3, sortedAgents.length));
  if (topAgents.length === 0) {
    throw new Error('no_agents_available_after_filtering');
  }

  const randomIndex = Math.floor(Math.random() * topAgents.length);
  const selectedAgent = topAgents[randomIndex];
  if (!selectedAgent) throw new Error('failed_to_select_random_agent');
  return selectedAgent.agent;
}

// Helper pour calculer le score de performance
function calculatePerformanceScore(agent: User): number {
  if (!agent.averageProcessingTime) return 0.5; // Score moyen par défaut

  // Convertir le temps moyen de traitement en score (plus bas = meilleur)
  const avgTimeScore = Math.max(0, 1 - agent.averageProcessingTime / (24 * 7)); // Normalisé sur une semaine

  return avgTimeScore;
}

export async function getAvailableAgents(
  organizationId: string,
  countryCode: CountryCode,
  serviceId: string,
): Promise<Array<Agent>> {
  const agents = await db.user.findMany({
    where: {
      assignedOrganizationId: organizationId,
      linkedCountries: {
        some: {
          code: countryCode,
        },
      },
      assignedServices: {
        some: {
          id: serviceId,
        },
      },
    },
    include: {
      assignedRequests: {
        where: {
          status: {
            notIn: ['COMPLETED', 'REJECTED'],
          },
        },
      },
      assignedServices: true,
    },
  });

  return agents;
}

// Options pour la récupération des demandes
export interface AgentsListRequestOptions {
  search?: string;
  assignedServices?: string[];
  linkedCountries?: string[];
  assignedOrganizationId?: string[];
  managedByUserId?: string[];
  page: number;
  limit: number;
  sortBy?: {
    direction: 'asc' | 'desc';
    field: 'assignedServices' | 'country' | 'organizationId';
  };
}

const AgentListItemSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  roles: true,
  assignedServices: true,
  linkedCountries: true,
  assignedOrganizationId: true,
  managedByUserId: true,
};

export type AgentListItem = Prisma.UserGetPayload<{
  select: typeof AgentListItemSelect;
}>;

export interface AgentsListResult {
  items: AgentListItem[];
  total: number;
}

/**
 * Récupérer les demandes de services avec filtres et pagination
 */
export async function getAgentsList(
  options?: AgentsListRequestOptions,
): Promise<AgentsListResult> {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  const {
    search,
    assignedServices,
    linkedCountries,
    assignedOrganizationId,
    managedByUserId,
    page = 1,
    limit = 10,
    sortBy,
  } = options || {};

  const where: Prisma.UserWhereInput = {
    OR: [{ roles: { has: 'AGENT' } }, { roles: { has: 'MANAGER' } }],
  };

  if (managedByUserId) {
    where.managedByUserId = { in: managedByUserId };
  }

  if (assignedServices)
    where.assignedServices = { some: { id: { in: assignedServices } } };
  if (linkedCountries)
    where.linkedCountries = { some: { code: { in: linkedCountries } } };
  if (assignedOrganizationId)
    where.assignedOrganizationId = { in: assignedOrganizationId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [items, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: AgentListItemSelect,
        ...(sortBy && {
          orderBy: {
            [sortBy.field]: sortBy.direction,
          },
        }),
      }),
      db.user.count({ where }),
    ]);

    return {
      items,
      total,
    };
  } catch (error) {
    console.error('Error fetching service requests:', error);
    throw new Error('Failed to fetch service requests');
  }
}

const AgentDetailsSelect: Prisma.UserSelect = {
  ...AgentListItemSelect,
  assignedRequests: {
    select: {
      id: true,
      status: true,
      priority: true,
      serviceCategory: true,
      createdAt: true,
      assignedAt: true,
    },
  },
  specializations: true,
  availability: true,
  completedRequests: true,
  averageProcessingTime: true,
  managedByUserId: true,
  managedAgents: {
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      linkedCountries: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      assignedServices: {
        select: {
          id: true,
          name: true,
        },
      },
      completedRequests: true,
      averageProcessingTime: true,
      assignedRequests: {
        where: {
          status: {
            notIn: ['COMPLETED', 'REJECTED'],
          },
        },
        select: {
          id: true,
          status: true,
        },
      },
    },
  },
};

export type AgentDetails = Prisma.UserGetPayload<{
  select: typeof AgentDetailsSelect;
}>;

export async function getAgentDetails(id: string): Promise<AgentDetails> {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  const agent = await db.user.findUnique({
    where: { id },
    select: AgentDetailsSelect,
  });

  if (!agent) {
    throw new Error('agent_not_found');
  }

  return agent;
}

interface UpdateAgentData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  countryIds?: string[];
  serviceIds?: string[];
  managedByUserId?: string | null;
  roles?: UserRole[];
  managedAgentIds?: string[];
}

export async function updateAgent(id: string, data: UpdateAgentData) {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  try {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.email) {
      updateData.email = data.email;
    }

    if (data.phoneNumber) {
      updateData.phoneNumber = data.phoneNumber;
    }

    if (data.managedByUserId) {
      updateData.managedBy = {
        connect: {
          id: data.managedByUserId,
        },
      };
    }

    if (data.roles) {
      updateData.roles = data.roles;
    }

    if (data.countryIds) {
      updateData.linkedCountries = {
        set: data.countryIds.map((id) => ({ id })),
      };
    }

    if (data.serviceIds) {
      updateData.assignedServices = {
        set: data.serviceIds.map((id) => ({ id })),
      };
    }

    // Handle managed agents for managers
    if (data.managedAgentIds && data.roles?.includes('MANAGER')) {
      // Update the managed agents to have this manager
      await db.user.updateMany({
        where: {
          id: { in: data.managedAgentIds },
        },
        data: {
          managedByUserId: id,
        },
      });

      // Remove manager from agents no longer managed
      const currentManagedAgents = await db.user.findMany({
        where: { managedByUserId: id },
        select: { id: true },
      });

      const agentsToRemove = currentManagedAgents
        .filter((agent) => !data.managedAgentIds!.includes(agent.id))
        .map((agent) => agent.id);

      if (agentsToRemove.length > 0) {
        await db.user.updateMany({
          where: {
            id: { in: agentsToRemove },
          },
          data: {
            managedByUserId: null,
          },
        });
      }
    }

    const updatedAgent = await db.user.update({
      where: { id },
      data: updateData,
      select: AgentDetailsSelect,
    });

    return updatedAgent;
  } catch (error) {
    console.error('Failed to update agent:', error);
    throw new Error('Failed to update agent');
  }
}

export async function getServicesForOrganization(organizationId?: string) {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  const where: Prisma.ConsularServiceWhereInput = {
    isActive: true,
    ...(organizationId && { organizationId }),
  };

  return db.consularService.findMany({
    where,
    select: {
      id: true,
      name: true,
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
