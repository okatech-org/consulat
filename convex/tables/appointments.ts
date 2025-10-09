import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressValidator,
  appointmentStatusValidator,
  appointmentTypeValidator,
  participantRoleValidator,
  participantStatusValidator,
} from '../lib/validators';

export const appointments = defineTable({
  // Planification
  startAt: v.number(),
  endAt: v.number(),
  timezone: v.string(),

  type: appointmentTypeValidator,
  status: appointmentStatusValidator,

  // Organisation
  organizationId: v.id('organizations'),
  serviceId: v.optional(v.id('services')),
  requestId: v.optional(v.id('requests')),

  // Participants
  participants: v.array(
    v.object({
      userId: v.id('users'),
      role: participantRoleValidator,
      status: participantStatusValidator,
    }),
  ),

  // Lieu
  location: v.optional(addressValidator),

  createdAt: v.number(),
  updatedAt: v.number(),
  cancelledAt: v.optional(v.number()),
})
  .index('by_time', ['startAt'])
  .index('by_organization', ['organizationId'])
  .index('by_status', ['status']);
