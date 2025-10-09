import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { addressValidator } from '../lib/validators'
import { AppointmentStatus, AppointmentType, ParticipantRole, ParticipantStatus } from '../lib/constants'

export const appointments = defineTable({
  // Planification
  startAt: v.number(),
  endAt: v.number(),
  timezone: v.string(),

  type: v.union(
    v.literal(AppointmentType.DocumentSubmission),
    v.literal(AppointmentType.DocumentCollection),
    v.literal(AppointmentType.Interview),
    v.literal(AppointmentType.MarriageCeremony),
    v.literal(AppointmentType.Emergency),
    v.literal(AppointmentType.Other),
    v.literal(AppointmentType.Consultation),
  ),
  status: v.union(
    v.literal(AppointmentStatus.Pending),
    v.literal(AppointmentStatus.Scheduled),
    v.literal(AppointmentStatus.Confirmed),
    v.literal(AppointmentStatus.Completed),
    v.literal(AppointmentStatus.Cancelled),
    v.literal(AppointmentStatus.Missed),
    v.literal(AppointmentStatus.Rescheduled),
  ),

  // Organisation
  organizationId: v.id('organizations'),
  serviceId: v.optional(v.id('services')),
  requestId: v.optional(v.id('requests')),

  // Participants
  participants: v.array(
    v.object({
      userId: v.id("users"),
      role: v.union(
        v.literal(ParticipantRole.Attendee),
        v.literal(ParticipantRole.Agent),
        v.literal(ParticipantRole.Organizer),
      ),
      status: v.union(
        v.literal(ParticipantStatus.Confirmed),
        v.literal(ParticipantStatus.Tentative),
        v.literal(ParticipantStatus.Declined),
      ),
    })
  ),

  // Lieu
  location: v.optional(addressValidator),

  createdAt: v.number(),
  updatedAt: v.number(),
  cancelledAt: v.optional(v.number()),
})
  .index('by_time', ['startAt'])
  .index('by_organization', ['organizationId'])
  .index('by_status', ['status'])
