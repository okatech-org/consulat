'use server';

import { getCurrentUser } from '@/actions/user';
import { db } from '@/lib/prisma';
import { tryCatch } from '@/lib/utils';
import { UserRole } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function getManagerDashboardData() {
  const { data, error } = await tryCatch(
    (async () => {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        throw new Error('Unauthorized');
      }

      // Get managed agents
      const managedAgents = await db.user.findMany({
        where: {
          managedByUserId: currentUser.id,
          role: UserRole.AGENT,
        },
        include: {
          _count: {
            select: {
              assignedRequests: true,
            },
          },
        },
      });

      const agentIds = managedAgents.map((agent) => agent.id);

      // Get all requests assigned to managed agents
      const allRequests = await db.serviceRequest.findMany({
        where: {
          assignedToId: {
            in: agentIds,
          },
        },
        include: {
          service: true,
          assignedTo: true,
        },
      });

      // Calculate statistics
      const pendingRequests = allRequests.filter((req) =>
        ['SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(req.status),
      ).length;

      const processingRequests = allRequests.filter((req) =>
        [
          'VALIDATED',
          'CARD_IN_PRODUCTION',
          'DOCUMENT_IN_PRODUCTION',
          'READY_FOR_PICKUP',
          'APPOINTMENT_SCHEDULED',
        ].includes(req.status),
      ).length;

      const completedRequests = allRequests.filter(
        (req) => req.status === 'COMPLETED',
      ).length;

      // Calculate average processing time
      const completedWithTime = allRequests.filter(
        (req) => req.status === 'COMPLETED' && req.completedAt && req.submittedAt,
      );

      const avgProcessingTime =
        completedWithTime.length > 0
          ? completedWithTime.reduce((acc, req) => {
              const time = req.completedAt!.getTime() - req.submittedAt!.getTime();
              return acc + time;
            }, 0) /
            completedWithTime.length /
            (1000 * 60 * 60) // Convert to hours
          : 0;

      // Get recent requests
      const recentRequests = allRequests
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);

      // Get performance metrics for current and previous month
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
      const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));

      const currentMonthCompleted = allRequests.filter(
        (req) =>
          req.status === 'COMPLETED' &&
          req.completedAt &&
          req.completedAt >= currentMonthStart &&
          req.completedAt <= currentMonthEnd,
      ).length;

      const previousMonthCompleted = allRequests.filter(
        (req) =>
          req.status === 'COMPLETED' &&
          req.completedAt &&
          req.completedAt >= previousMonthStart &&
          req.completedAt <= previousMonthEnd,
      ).length;

      const trend =
        previousMonthCompleted > 0
          ? ((currentMonthCompleted - previousMonthCompleted) / previousMonthCompleted) *
            100
          : 0;

      return {
        stats: {
          totalAgents: managedAgents.length,
          pendingRequests,
          processingRequests,
          completedRequests,
          avgProcessingTime: Math.round(avgProcessingTime),
          trend: {
            value: Math.abs(Math.round(trend)),
            isPositive: trend >= 0,
          },
        },
        managedAgents,
        recentRequests,
        requestsByStatus: {
          draft: allRequests.filter((r) => r.status === 'DRAFT').length,
          submitted: allRequests.filter((r) => r.status === 'SUBMITTED').length,
          pending: allRequests.filter((r) => r.status === 'PENDING').length,
          pendingCompletion: allRequests.filter((r) => r.status === 'PENDING_COMPLETION')
            .length,
          validated: allRequests.filter((r) => r.status === 'VALIDATED').length,
          rejected: allRequests.filter((r) => r.status === 'REJECTED').length,
          inProduction: allRequests.filter((r) =>
            ['CARD_IN_PRODUCTION', 'DOCUMENT_IN_PRODUCTION'].includes(r.status),
          ).length,
          readyForPickup: allRequests.filter((r) => r.status === 'READY_FOR_PICKUP')
            .length,
          completed: completedRequests,
        },
      };
    })(),
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function getAgentPerformanceMetrics(agentId: string) {
  const { data, error } = await tryCatch(
    (async () => {
      const currentUser = await getCurrentUser();

      if (!currentUser || currentUser.role !== UserRole.MANAGER) {
        throw new Error('Unauthorized');
      }

      // Verify the agent is managed by this manager
      const agent = await db.user.findFirst({
        where: {
          id: agentId,
          managedByUserId: currentUser.id,
        },
      });

      if (!agent) {
        throw new Error('Agent not found or not managed by current user');
      }

      // Get agent's requests
      const agentRequests = await db.serviceRequest.findMany({
        where: {
          assignedToId: agentId,
        },
      });

      // Calculate metrics
      const completedRequests = agentRequests.filter(
        (r) => r.status === 'COMPLETED',
      ).length;
      const pendingRequests = agentRequests.filter((r) =>
        ['SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(r.status),
      ).length;

      // Calculate average processing time
      const completedWithTime = agentRequests.filter(
        (req) => req.status === 'COMPLETED' && req.completedAt && req.submittedAt,
      );

      const avgProcessingTime =
        completedWithTime.length > 0
          ? completedWithTime.reduce((acc, req) => {
              const time = req.completedAt!.getTime() - req.submittedAt!.getTime();
              return acc + time;
            }, 0) /
            completedWithTime.length /
            (1000 * 60 * 60) // Convert to hours
          : 0;

      return {
        agentId,
        agentName: agent.name || 'Agent',
        completedRequests,
        pendingRequests,
        avgProcessingTime: Math.round(avgProcessingTime),
        totalRequests: agentRequests.length,
      };
    })(),
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function reassignRequest(requestId: string, newAgentId: string) {
  const { data, error } = await tryCatch(
    (async () => {
      const currentUser = await getCurrentUser();

      if (!currentUser || currentUser.role !== UserRole.MANAGER) {
        throw new Error('Unauthorized');
      }

      // Verify the new agent is managed by this manager
      const newAgent = await db.user.findFirst({
        where: {
          id: newAgentId,
          managedByUserId: currentUser.id,
        },
      });

      if (!newAgent) {
        throw new Error('Agent not found or not managed by current user');
      }

      // Update the request
      const updatedRequest = await db.serviceRequest.update({
        where: {
          id: requestId,
        },
        data: {
          assignedToId: newAgentId,
          assignedAt: new Date(),
        },
      });

      // Create action log
      await db.requestAction.create({
        data: {
          type: 'ASSIGNMENT',
          requestId,
          userId: currentUser.id,
          data: {
            previousAgentId: updatedRequest.assignedToId,
            newAgentId,
          },
        },
      });

      return updatedRequest;
    })(),
  );

  if (error) {
    throw error;
  }

  return data;
}
