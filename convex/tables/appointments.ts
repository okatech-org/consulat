import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  addressValidator,
  appointmentStatusValidator,
  appointmentTypeValidator,
  participantValidator,
} from '../lib/validators'

export const appointments = defineTable({
  // Planification
  startAt: v.number(),
  endAt: v.number(),
  timezone: v.string(),

  type: appointmentTypeValidator, // Type-safe avec enum
  status: appointmentStatusValidator,

  // Organisation
  organizationId: v.id('organizations'),
  serviceId: v.optional(v.id('services')),
  requestId: v.optional(v.id('requests')),

  // Participants
  participants: v.array(participantValidator),

  // Lieu
  location: v.optional(addressValidator),

  createdAt: v.number(),
  updatedAt: v.number(),
  cancelledAt: v.optional(v.number()),
})
  .index('by_time', ['startAt'])
  .index('by_organization', ['organizationId'])
  .index('by_status', ['status'])
