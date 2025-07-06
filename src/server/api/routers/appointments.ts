import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { AppointmentSchema } from '@/schemas/appointment';
import { AppointmentStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { 
  createAppointment as createAppointmentAction,
  getUserAppointments as getUserAppointmentsAction,
  getAppointment as getAppointmentAction,
  cancelAppointment as cancelAppointmentAction,
  rescheduleAppointment as rescheduleAppointmentAction,
  completeAppointment as completeAppointmentAction,
  missAppointment as missAppointmentAction,
  getAvailableTimeSlots as getAvailableTimeSlotsAction,
  getAvailableServices as getAvailableServicesAction,
} from '@/actions/appointments';

export const appointmentsRouter = createTRPCRouter({
  // Récupérer les rendez-vous de l'utilisateur
  getUserAppointments: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
      agentId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const params = {
        userId: input?.userId || ctx.session.user.id,
        agentId: input?.agentId,
      };
      
      const result = await getUserAppointmentsAction(params);
      
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error || 'Failed to fetch appointments',
        });
      }
      
      return result.data;
    }),

  // Récupérer un rendez-vous par ID
  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const appointment = await getAppointmentAction(input.id);
      
      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }
      
      return appointment;
    }),

  // Créer un nouveau rendez-vous
  create: protectedProcedure
    .input(AppointmentSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ input, ctx }) => {
      try {
        const appointment = await createAppointmentAction({
          ...input,
          attendeeId: input.attendeeId || ctx.session.user.id,
        });
        
        return appointment;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Failed to create appointment',
        });
      }
    }),

  // Annuler un rendez-vous
  cancel: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur peut annuler ce rendez-vous
      const appointment = await getAppointmentAction(input.id);
      
      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }
      
      // Vérifier les permissions
      if (appointment.attendeeId !== ctx.session.user.id && 
          appointment.agentId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to cancel this appointment',
        });
      }
      
      const result = await cancelAppointmentAction(input.id);
      
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error || 'Failed to cancel appointment',
        });
      }
      
      return result.appointment;
    }),

  // Reprogrammer un rendez-vous
  reschedule: protectedProcedure
    .input(z.object({
      id: z.string(),
      newDate: z.date(),
      newStartTime: z.date(),
      newEndTime: z.date(),
      newAgentId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur peut reprogrammer ce rendez-vous
      const appointment = await getAppointmentAction(input.id);
      
      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }
      
      // Vérifier les permissions
      if (appointment.attendeeId !== ctx.session.user.id && 
          appointment.agentId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to reschedule this appointment',
        });
      }
      
      const result = await rescheduleAppointmentAction(
        input.id,
        input.newDate,
        input.newStartTime,
        input.newEndTime,
        input.newAgentId
      );
      
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error || 'Failed to reschedule appointment',
        });
      }
      
      return result.appointment;
    }),

  // Marquer un rendez-vous comme terminé (pour les agents)
  complete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur peut marquer ce rendez-vous comme terminé
      const appointment = await getAppointmentAction(input.id);
      
      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }
      
      // Seul l'agent assigné peut marquer le rendez-vous comme terminé
      if (appointment.agentId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to complete this appointment',
        });
      }
      
      try {
        const completedAppointment = await completeAppointmentAction(input.id);
        return completedAppointment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to complete appointment',
        });
      }
    }),

  // Marquer un rendez-vous comme manqué (pour les agents)
  markAsMissed: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur peut marquer ce rendez-vous comme manqué
      const appointment = await getAppointmentAction(input.id);
      
      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        });
      }
      
      // Seul l'agent assigné peut marquer le rendez-vous comme manqué
      if (appointment.agentId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to mark this appointment as missed',
        });
      }
      
      try {
        const missedAppointment = await missAppointmentAction(input.id);
        return missedAppointment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to mark appointment as missed',
        });
      }
    }),

  // Récupérer les créneaux disponibles
  getAvailableTimeSlots: protectedProcedure
    .input(z.object({
      serviceId: z.string(),
      organizationId: z.string(),
      countryCode: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      duration: z.number().min(15).max(480), // 15 minutes à 8 heures
      agentId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const timeSlots = await getAvailableTimeSlotsAction(
          input.serviceId,
          input.organizationId,
          input.countryCode,
          input.startDate,
          input.endDate,
          input.duration,
          input.agentId
        );
        
        return timeSlots;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch available time slots',
        });
      }
    }),

  // Récupérer les services disponibles pour un pays
  getAvailableServices: protectedProcedure
    .input(z.object({
      countryCode: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const services = await getAvailableServicesAction(input.countryCode);
        return services;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch available services',
        });
      }
    }),

  // Récupérer les statistiques des rendez-vous (pour le dashboard)
  getStats: protectedProcedure
    .input(z.object({
      agentId: z.string().optional(),
      organizationId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: {
        agentId?: string;
        organizationId?: string;
        OR?: Array<{ attendeeId: string } | { agentId: string }>;
        date?: { gte: Date; lte: Date };
      } = {};
      
      if (input.agentId) {
        whereClause.agentId = input.agentId;
      } else if (input.organizationId) {
        whereClause.organizationId = input.organizationId;
      } else {
        // Si aucun filtre spécifique, utiliser l'utilisateur courant
        whereClause.OR = [
          { attendeeId: ctx.session.user.id },
          { agentId: ctx.session.user.id },
        ];
      }
      
      if (input.startDate && input.endDate) {
        whereClause.date = {
          gte: input.startDate,
          lte: input.endDate,
        };
      }
      
      const [
        totalAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        missedAppointments,
      ] = await Promise.all([
        ctx.db.appointment.count({ where: whereClause }),
        ctx.db.appointment.count({ 
          where: { ...whereClause, status: AppointmentStatus.CONFIRMED } 
        }),
        ctx.db.appointment.count({ 
          where: { ...whereClause, status: AppointmentStatus.COMPLETED } 
        }),
        ctx.db.appointment.count({ 
          where: { ...whereClause, status: AppointmentStatus.CANCELLED } 
        }),
        ctx.db.appointment.count({ 
          where: { ...whereClause, status: AppointmentStatus.MISSED } 
        }),
      ]);
      
      return {
        totalAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        missedAppointments,
        completionRate: totalAppointments > 0 
          ? Math.round((completedAppointments / totalAppointments) * 100) 
          : 0,
      };
    }),
}); 