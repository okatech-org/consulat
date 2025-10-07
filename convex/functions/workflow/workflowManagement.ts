import { v } from 'convex/values'
import { mutation, query } from '../../_generated/server'
import { ActivityType, RequestStatus } from '../../lib/constants'

export const createWorkflowStep = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // 'manual', 'automatic', 'conditional'
    conditions: v.optional(v.any()),
    actions: v.array(v.any()),
    nextSteps: v.optional(v.array(v.string())),
    assigneeRole: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
  },
  handler: (ctx, args) => {
    // Cette fonction créerait des étapes de workflow
    // Pour l'instant, on simule avec une structure simple
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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
    }
  },
})

export const executeWorkflowStep = mutation({
  args: {
    requestId: v.id('requests'),
    stepId: v.string(),
    executedBy: v.id('users'),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    // Simuler l'exécution d'une étape de workflow
    const workflowActivity = {
      type: ActivityType.StatusChanged,
      actorId: args.executedBy,
      data: {
        stepId: args.stepId,
        stepData: args.data,
        executedAt: Date.now(),
      },
      timestamp: Date.now(),
    }

    await ctx.db.patch(args.requestId, {
      activities: [...request.activities, workflowActivity],
      updatedAt: Date.now(),
    })

    return { success: true, activity: workflowActivity }
  },
})

export const getWorkflowProgress = query({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    // Analyser les activités pour déterminer le progrès du workflow
    const workflowActivities = request.activities.filter(
      (activity) => activity.type === ActivityType.StatusChanged,
    )

    const progress = {
      currentStep: determineCurrentStep(request.status as string),
      completedSteps: workflowActivities.length,
      totalSteps: getTotalStepsForService(request.serviceId as string),
      nextSteps: getNextSteps(request.status as string),
      estimatedCompletion: calculateEstimatedCompletion(workflowActivities),
    }

    return progress
  },
})

export const getServiceWorkflow = query({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)
    if (!service) {
      throw new Error('Service not found')
    }

    // Définir le workflow basé sur le type de service
    const workflow = defineServiceWorkflow(
      service.category as string,
      service.processingMode as string,
    )

    return {
      serviceId: args.serviceId,
      workflow,
      estimatedDuration: calculateWorkflowDuration(workflow),
    }
  },
})

export const validateWorkflowTransition = query({
  args: {
    fromStatus: v.string(),
    toStatus: v.string(),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)
    if (!service) {
      throw new Error('Service not found')
    }

    // Définir les transitions valides basées sur le service
    const validTransitions = getValidTransitions(args.serviceId)
    const isValid = validTransitions[args.fromStatus].includes(args.toStatus)

    return {
      isValid,
      allowedTransitions: validTransitions[args.fromStatus],
      requiredActions: getRequiredActionsForTransition(
        args.fromStatus,
        args.toStatus,
      ),
    }
  },
})

// Fonctions utilitaires
function determineCurrentStep(status: string): string {
  const statusToStep: Record<string, string> = {
    draft: 'document_preparation',
    submitted: 'initial_review',
    pending: 'processing',
    under_review: 'validation',
    in_production: 'production',
    ready_for_pickup: 'delivery',
    completed: 'completed',
  }

  return statusToStep[status] || 'unknown'
}

function getTotalStepsForService(serviceId: string): number {
  // Définir le nombre d'étapes selon le type de service
  return 6 // Valeur par défaut
}

function getNextSteps(currentStatus: string): Array<string> {
  const nextStepsMap: Record<string, Array<string>> = {
    draft: ['submitted'],
    submitted: ['pending', 'rejected'],
    pending: ['under_review', 'rejected'],
    under_review: ['in_production', 'rejected'],
    in_production: ['ready_for_pickup'],
    ready_for_pickup: ['completed'],
  }

  return nextStepsMap[currentStatus]
}

function calculateEstimatedCompletion(activities: Array<any>): number {
  // Calculer le temps estimé de completion basé sur les activités
  const averageStepTime = 24 * 60 * 60 * 1000 // 24 heures par étape
  const remainingSteps = 6 - activities.length
  return Date.now() + remainingSteps * averageStepTime
}

function defineServiceWorkflow(
  category: string,
  processingMode: string,
): Array<any> {
  // Définir le workflow selon la catégorie et le mode de traitement
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
  ]

  return baseWorkflow
}

function calculateWorkflowDuration(workflow: Array<any>): number {
  // Calculer la durée totale du workflow
  return workflow.length * 24 * 60 * 60 * 1000 // 24 heures par étape
}

function getValidTransitions(serviceId: string): Record<string, Array<string>> {
  // Définir les transitions valides pour un service
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
  }
}

function getRequiredActionsForTransition(
  fromStatus: string,
  toStatus: string,
): Array<string> {
  // Définir les actions requises pour une transition
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
  }

  return actionMap[fromStatus][toStatus]
}
