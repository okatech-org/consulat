import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { ActivityType } from '../lib/constants';

export const createWorkflowStep = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    conditions: v.optional(v.any()),
    actions: v.array(v.any()),
    nextSteps: v.optional(v.array(v.string())),
    assigneeRole: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
  },
  handler: (ctx, args) => {
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      stepId,
      name: args.name,
      description: args.description,
      type: args.type,
      conditions: args.conditions,
      actions: args.actions,
      nextSteps: args.nextSteps || [],
      assigneeRole: args.assigneeRole,
      estimatedDuration: args.estimatedDuration,
      createdAt: Date.now(),
    };
  },
});

export const executeWorkflowStep = mutation({
  args: {
    requestId: v.id('requests'),
    stepId: v.string(),
    executedBy: v.id('users'),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('request_not_found');
    }

    const workflowActivity = {
      type: ActivityType.StatusChanged,
      actorId: 'system' as const,
      data: {
        stepId: args.stepId,
        stepData: args.data,
        executedAt: Date.now(),
      },
      timestamp: Date.now(),
    };

    await ctx.db.patch(args.requestId, {
      metadata: {
        ...request.metadata,
        activities: [...request.metadata.activities, workflowActivity],
      },
    });

    return { success: true, activity: workflowActivity };
  },
});

export const getWorkflowProgress = query({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    const workflowActivities = request.metadata.activities.filter(
      (activity) => activity.type === ActivityType.StatusChanged,
    );

    const progress = {
      currentStep: determineCurrentStep(request.status as string),
      completedSteps: workflowActivities.length,
      totalSteps: getTotalStepsForService(request.serviceId as string),
      nextSteps: getNextSteps(request.status as string),
      estimatedCompletion: calculateEstimatedCompletion(workflowActivities),
    };

    return progress;
  },
});

export const getServiceWorkflow = query({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const workflow = defineServiceWorkflow(service.category, service.processing.mode);

    return {
      serviceId: args.serviceId,
      workflow,
      estimatedDuration: calculateWorkflowDuration(workflow),
    };
  },
});

export const validateWorkflowTransition = query({
  args: {
    fromStatus: v.string(),
    toStatus: v.string(),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const validTransitions = getValidTransitions(args.serviceId);
    const isValid = validTransitions[args.fromStatus]?.includes(args.toStatus) || false;

    return {
      isValid,
      allowedTransitions: validTransitions[args.fromStatus] || [],
      requiredActions: getRequiredActionsForTransition(args.fromStatus, args.toStatus),
    };
  },
});

function determineCurrentStep(status: string): string {
  const statusToStep: Record<string, string> = {
    draft: 'document_preparation',
    submitted: 'initial_review',
    pending: 'processing',
    under_review: 'validation',
    in_production: 'production',
    ready_for_pickup: 'delivery',
    completed: 'completed',
  };

  return statusToStep[status] || 'unknown';
}

function getTotalStepsForService(serviceId: string): number {
  return 6;
}

function getNextSteps(currentStatus: string): Array<string> {
  const nextStepsMap: Record<string, Array<string>> = {
    draft: ['submitted'],
    submitted: ['pending', 'rejected'],
    pending: ['under_review', 'rejected'],
    under_review: ['in_production', 'rejected'],
    in_production: ['ready_for_pickup'],
    ready_for_pickup: ['completed'],
  };

  return nextStepsMap[currentStatus] || [];
}

function calculateEstimatedCompletion(activities: Array<any>): number {
  const averageStepTime = 24 * 60 * 60 * 1000;
  const remainingSteps = 6 - activities.length;
  return Date.now() + remainingSteps * averageStepTime;
}

function defineServiceWorkflow(category: string, processingMode: string): Array<any> {
  const baseWorkflow = [
    {
      id: 'document_preparation',
      name: 'Préparation des documents',
      type: 'manual',
    },
    { id: 'initial_review', name: 'Révision initiale', type: 'manual' },
    {
      id: 'processing',
      name: 'Traitement',
      type: processingMode === 'online_only' ? 'automatic' : 'manual',
    },
    { id: 'validation', name: 'Validation', type: 'manual' },
    { id: 'production', name: 'Production', type: 'automatic' },
    { id: 'delivery', name: 'Livraison', type: 'manual' },
  ];

  return baseWorkflow;
}

function calculateWorkflowDuration(workflow: Array<any>): number {
  return workflow.length * 24 * 60 * 60 * 1000;
}

function getValidTransitions(serviceId: string): Record<string, Array<string>> {
  return {
    draft: ['submitted', 'cancelled'],
    submitted: ['pending', 'rejected', 'cancelled'],
    pending: ['under_review', 'rejected', 'cancelled'],
    under_review: ['in_production', 'rejected', 'cancelled'],
    in_production: ['ready_for_pickup'],
    ready_for_pickup: ['completed'],
    completed: [],
    rejected: ['draft', 'cancelled'],
    cancelled: [],
  };
}

function getRequiredActionsForTransition(
  fromStatus: string,
  toStatus: string,
): Array<string> {
  const actionMap: Record<string, Record<string, Array<string>>> = {
    draft: {
      submitted: ['validate_documents', 'check_requirements'],
    },
    submitted: {
      pending: ['assign_agent', 'schedule_review'],
    },
    pending: {
      under_review: ['complete_initial_check'],
    },
    under_review: {
      in_production: ['approve_documents', 'initiate_production'],
    },
    in_production: {
      ready_for_pickup: ['complete_production', 'schedule_delivery'],
    },
    ready_for_pickup: {
      completed: ['confirm_delivery', 'update_records'],
    },
  };

  return actionMap[fromStatus]?.[toStatus] || [];
}
