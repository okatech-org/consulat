import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { CountryStatus } from '../lib/constants'

export const countries = defineTable({
  name: v.string(),
  code: v.string(),
  status: v.union(
    v.literal(CountryStatus.Active),
    v.literal(CountryStatus.Inactive),
  ),
  flag: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_code', ['code'])
  .index('by_status', ['status'])
