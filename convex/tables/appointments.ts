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
      id: v.union(v.id('profiles'), v.id('memberships')),
      userId: v.id('users'),
      role: participantRoleValidator,
      status: participantStatusValidator,
    }),
  ),

  // Lieu
  location: v.optional(addressValidator),

  actions: v.array(
    v.object({
      authorId: v.union(v.id('users'), v.id('profiles')),
      type: v.union(v.literal('cancel'), v.literal('reschedule')),
      date: v.number(),
      reason: v.optional(v.string()),
    }),
  ),
})
  .index('by_time', ['startAt'])
  .index('by_organization', ['organizationId'])
  .index('by_status', ['status']);
