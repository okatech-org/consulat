import type { Doc, Id } from '../_generated/dataModel'

// Interface pour la pagination
export interface PaginationOptions {
  limit?: number
  cursor?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  items: Array<T>
  nextCursor?: string
  hasMore: boolean
  total?: number
}

// Helper pour la pagination avec curseur
export async function paginateWithCursor<T>(
  query: any,
  options: PaginationOptions = {},
): Promise<PaginatedResult<T>> {
  const { limit = 20, cursor, order = 'desc' } = options

  let q = query.order(order)

  if (cursor) {
    q = q.paginate({ cursor, numItems: limit })
  } else {
    q = q.take(limit)
  }

  const results = await q.collect()

  return {
    items: results,
    nextCursor:
      results.length === limit ? results[results.length - 1]._id : undefined,
    hasMore: results.length === limit,
  }
}

// Helper pour la pagination avec offset (moins efficace mais plus simple)
export async function paginateWithOffset<T>(
  query: any,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResult<T>> {
  const offset = (page - 1) * limit

  const results = await query.order('desc').collect()

  const paginatedResults = results.slice(offset, offset + limit)

  return {
    items: paginatedResults,
    hasMore: offset + limit < results.length,
    total: results.length,
  }
}

// Helper spécialisé pour les demandes avec filtres
export async function paginateRequests(
  ctx: { db: any },
  filters: {
    userId?: Id<'users'>
    organizationId?: Id<'organizations'>
    status?: string
    priority?: number
  },
  options: PaginationOptions = {},
): Promise<PaginatedResult<Doc<'requests'>>> {
  const { limit = 20, cursor, order = 'desc' } = options

  let query = ctx.db.query('requests')

  // Appliquer les filtres
  if (filters.userId) {
    query = query.withIndex('by_requester', (q: any) =>
      q.eq('requesterId', filters.userId),
    )
  }

  if (filters.status) {
    query = query.withIndex('by_status', (q: any) =>
      q.eq('status', filters.status),
    )
  }

  if (filters.priority !== undefined && filters.status) {
    query = query.withIndex('by_priority_status', (q: any) =>
      q.eq('priority', filters.priority).eq('status', filters.status),
    )
  }

  return await paginateWithCursor(query, { limit, cursor, order })
}

// Helper pour les services avec filtres
export async function paginateServices(
  ctx: { db: any },
  filters: {
    organizationId?: Id<'organizations'>
    category?: string
    status?: string
  },
  options: PaginationOptions = {},
): Promise<PaginatedResult<Doc<'services'>>> {
  const { limit = 20, cursor, order = 'desc' } = options

  let query = ctx.db.query('services')

  if (filters.organizationId) {
    query = query.withIndex('by_organization', (q: any) =>
      q.eq('organizationId', filters.organizationId),
    )
  }

  if (filters.category) {
    query = query.withIndex('by_category', (q: any) =>
      q.eq('category', filters.category),
    )
  }

  if (filters.status) {
    query = query.withIndex('by_status', (q: any) =>
      q.eq('status', filters.status),
    )
  }

  return await paginateWithCursor(query, { limit, cursor, order })
}
