import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { countryCodeValidator, countryStatusValidator } from '../lib/validators';

export const countries = defineTable({
  name: v.string(),
  code: countryCodeValidator,
  status: countryStatusValidator,
  flag: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),
})
  .index('by_code', ['code'])
  .index('by_status', ['status']);
