'use server';

import { CountryCode } from '@/lib/autocomplete-datas';
import { db } from '@/lib/prisma';
import {
  ServiceCategory,
  User,
  RequestActionType,
  ServiceRequest,
  NotificationType,
  PrismaClient,
} from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '@/schemas/routes';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { env } from '@/lib/env';

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
    },
  });

  if (!request || request.organizationId !== organizationId) {
    throw new Error('request_not_found');
  }

  // Si déjà assigné, on ne réassigne pas
  if (request.assignedTo) {
    throw new Error('request_already_assigned');
  }

  const agents = await getAvailableAgents(
    organizationId,
    countryCode,
    request.serviceCategory,
  );

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
  serviceCategory: ServiceCategory,
): Promise<Array<Agent>> {
  const agents = await db.user.findMany({
    where: {
      assignedOrganizationId: organizationId,
      roles: { has: 'AGENT' },
      linkedCountries: {
        some: {
          code: countryCode,
        },
      },
      specializations: {
        has: serviceCategory,
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
    },
  });

  return agents;
}
