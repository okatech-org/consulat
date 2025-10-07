import type { Doc, Id } from '../../_generated/dataModel'

// Helper pour la gestion des erreurs avec Sentry
export function withSentryInstrumentation<T extends Array<any>, R>(
  fn: (...args: T) => Promise<R>,
  name: string,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error(`Error in ${name}:`, error)
      throw error
    }
  }
}

// Helper pour la pagination avancée avec filtres
export interface AdvancedPaginationOptions {
  limit?: number
  cursor?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, any>
  search?: string
  sortBy?: string
}

export interface AdvancedPaginatedResult<T> {
  items: Array<T>
  nextCursor?: string
  hasMore: boolean
  total?: number
  facets?: Record<string, Record<string, number>>
}

// Helper pour la validation des permissions
export interface PermissionCheck {
  userId: Id<'users'>
  resourceType: string
  resourceId?: string
  action: string
}

export async function checkPermissions(
  ctx: { db: any },
  check: PermissionCheck,
): Promise<boolean> {
  const user = await ctx.db.get(check.userId)
  if (!user) return false

  // Vérifier les rôles administrateurs
  if (user.roles.includes('admin') || user.roles.includes('super_admin')) {
    return true
  }

  // Vérifier les permissions spécifiques selon le type de ressource
  switch (check.resourceType) {
    case 'request':
      return await checkRequestPermissions(ctx, check)
    case 'document':
      return await checkDocumentPermissions(ctx, check)
    case 'organization':
      return await checkOrganizationPermissions(ctx, check)
    default:
      return false
  }
}

async function checkRequestPermissions(
  ctx: { db: any },
  check: PermissionCheck,
): Promise<boolean> {
  if (!check.resourceId) return false

  const request = await ctx.db.get(check.resourceId as Id<'requests'>)
  if (!request) return false

  // L'utilisateur peut voir ses propres demandes
  if (request.requesterId === check.userId) {
    return check.action === 'read'
  }

  // Vérifier les permissions d'agent
  const user = await ctx.db.get(check.userId)
  if (user?.roles.includes('agent')) {
    return ['read', 'update', 'assign'].includes(check.action)
  }

  return false
}

async function checkDocumentPermissions(
  ctx: { db: any },
  check: PermissionCheck,
): Promise<boolean> {
  if (!check.resourceId) return false

  const document = await ctx.db.get(check.resourceId as Id<'documents'>)
  if (!document) return false

  // Vérifier si l'utilisateur est le propriétaire
  if (document.ownerId === check.userId.toString()) {
    return true
  }

  // Vérifier les permissions d'agent
  const user = await ctx.db.get(check.userId)
  if (user?.roles.includes('agent')) {
    return ['read', 'validate'].includes(check.action)
  }

  return false
}

async function checkOrganizationPermissions(
  ctx: { db: any },
  check: PermissionCheck,
): Promise<boolean> {
  if (!check.resourceId) return false

  // Vérifier l'appartenance à l'organisation
  const membership = await ctx.db
    .query('memberships')
    .filter((q: any) => q.eq(q.field('userId'), check.userId))
    .filter((q: any) => q.eq(q.field('organizationId'), check.resourceId))
    .filter((q: any) => q.eq(q.field('status'), 'active'))
    .first()

  return !!membership
}

// Helper pour la génération de rapports
export interface ReportOptions {
  startDate?: number
  endDate?: number
  organizationId?: Id<'organizations'>
  groupBy?: string
  includeDetails?: boolean
}

export async function generateRequestReport(
  ctx: { db: any },
  options: ReportOptions,
): Promise<any> {
  let requests = await ctx.db.query('requests').collect()

  // Appliquer les filtres
  if (options.startDate) {
    requests = requests.filter((r: any) => r.createdAt >= options.startDate!)
  }
  if (options.endDate) {
    requests = requests.filter((r: any) => r.createdAt <= options.endDate!)
  }
  if (options.organizationId) {
    // Filtrer par organisation via les services
    const orgServices = await ctx.db
      .query('services')
      .withIndex('by_organization', (q: any) =>
        q.eq('organizationId', options.organizationId),
      )
      .collect()

    const serviceIds = orgServices.map((s: any) => s._id)
    requests = requests.filter((r: any) => serviceIds.includes(r.serviceId))
  }

  // Grouper les données
  const report = {
    summary: {
      total: requests.length,
      byStatus: groupBy(requests, 'status'),
      byService: await groupRequestsByService(ctx, requests),
      byMonth: groupByMonth(requests),
    },
    details: options.includeDetails ? requests : undefined,
  }

  return report
}

// Helper pour la gestion des conflits de rendez-vous
export async function findAppointmentConflicts(
  ctx: { db: any },
  organizationId: Id<'organizations'>,
  startAt: number,
  endAt: number,
  excludeAppointmentId?: Id<'appointments'>,
): Promise<Array<Doc<'appointments'>>> {
  const appointments = await ctx.db
    .query('appointments')
    .withIndex('by_organization', (q: any) =>
      q.eq('organizationId', organizationId),
    )
    .collect()

  return appointments.filter((appointment: any) => {
    if (excludeAppointmentId && appointment._id === excludeAppointmentId) {
      return false
    }

    if (appointment.status === 'cancelled') {
      return false
    }

    // Vérifier le chevauchement
    return (
      (startAt >= appointment.startAt && startAt < appointment.endAt) ||
      (endAt > appointment.startAt && endAt <= appointment.endAt) ||
      (startAt <= appointment.startAt && endAt >= appointment.endAt)
    )
  })
}

// Helper pour la validation des données
export interface ValidationRule {
  field: string
  validator: (value: any) => boolean
  message: string
}

export function validateData(
  data: any,
  rules: Array<ValidationRule>,
): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = []

  for (const rule of rules) {
    const value = data[rule.field]
    if (!rule.validator(value)) {
      errors.push({ field: rule.field, message: rule.message })
    }
  }

  return errors
}

// Helper pour la gestion des fichiers
export interface FileUploadOptions {
  maxSize?: number
  allowedTypes?: Array<string>
  generateThumbnail?: boolean
}

export function validateFileUpload(
  file: { name: string; type: string; size: number },
  options: FileUploadOptions,
): { isValid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024,
    allowedTypes = ['image/*', 'application/pdf'],
  } = options

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds maximum allowed size' }
  }

  const isAllowedType = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })

  if (!isAllowedType) {
    return { isValid: false, error: 'File type not allowed' }
  }

  return { isValid: true }
}

// Fonctions utilitaires
function groupBy<T>(array: Array<T>, key: keyof T): Record<string, number> {
  return array.reduce(
    (groups, item) => {
      const value = String(item[key])
      groups[value] = (groups[value] || 0) + 1
      return groups
    },
    {} as Record<string, number>,
  )
}

function groupByMonth<T extends { createdAt: number }>(
  array: Array<T>,
): Record<string, number> {
  return array.reduce(
    (groups, item) => {
      const date = new Date(item.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      groups[monthKey] = (groups[monthKey] || 0) + 1
      return groups
    },
    {} as Record<string, number>,
  )
}

async function groupRequestsByService(
  ctx: { db: any },
  requests: Array<Doc<'requests'>>,
): Promise<Record<string, number>> {
  const serviceGroups: Record<string, number> = {}

  for (const request of requests) {
    const service = await ctx.db.get(request.serviceId)
    const serviceName = service?.name || 'Service inconnu'
    serviceGroups[serviceName] = (serviceGroups[serviceName] || 0) + 1
  }

  return serviceGroups
}

// Helper pour la gestion des notifications en lot
export interface BulkNotificationOptions {
  userIds: Array<Id<'users'>>
  type: string
  title: string
  content: string
  channels: Array<string>
  scheduledFor?: number
}

export async function sendBulkNotifications(
  ctx: { db: any },
  options: BulkNotificationOptions,
): Promise<Array<Id<'notifications'>>> {
  const notificationIds: Array<Id<'notifications'>> = []

  for (const userId of options.userIds) {
    const notificationId = await ctx.db.insert('notifications', {
      userId,
      type: options.type,
      title: options.title,
      content: options.content,
      status: 'pending',
      readAt: undefined,
      channels: options.channels,
      deliveryStatus: {
        app: false,
        email: false,
        sms: false,
      },
      scheduledFor: options.scheduledFor,
      sentAt: undefined,
      relatedId: undefined,
      relatedType: undefined,
      createdAt: Date.now(),
      expiresAt: undefined,
    })

    notificationIds.push(notificationId)
  }

  return notificationIds
}

// Helper pour la gestion des erreurs métier
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

export function throwBusinessError(
  message: string,
  code: string,
  details?: any,
): never {
  throw new BusinessError(message, code, details)
}
