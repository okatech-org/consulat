import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { 
  getAvailableConsularServices,
  getUserServiceRequests,
  getServiceRequestDetails,
  getConsularServiceDetails,
  getConsularService,
  submitServiceRequest
} from '@/actions/services';
import { Prisma } from '@prisma/client';

export const servicesRouter = createTRPCRouter({
  // Récupérer les services consulaires disponibles
  getAvailable: protectedProcedure.query(async () => {
    try {
      const services = await getAvailableConsularServices();
      return services;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération des services',
      });
    }
  }),

  // Récupérer les demandes de service de l'utilisateur
  getUserRequests: protectedProcedure.query(async () => {
    try {
      const requests = await getUserServiceRequests();
      return requests;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération des demandes',
      });
    }
  }),

  // Récupérer une demande de service par ID
  getRequestById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const request = await getServiceRequestDetails(input.id);
        return request;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la récupération de la demande',
        });
      }
    }),

  // Récupérer les détails d'un service consulaire
  getServiceDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const service = await getConsularServiceDetails(input.id);
        return service;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la récupération du service',
        });
      }
    }),

  // Récupérer un service consulaire avec ses étapes
  getService: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const service = await getConsularService(input.id);
        return service;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la récupération du service',
        });
      }
    }),

  // Soumettre une demande de service
  submitRequest: protectedProcedure
    .input(z.object({
      serviceId: z.string(),
      requestedForId: z.string(),
      organizationId: z.string(),
      countryCode: z.string(),
      serviceCategory: z.string(),
      formData: z.record(z.any()).optional(),
      requiredDocuments: z.array(z.object({ id: z.string() })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const request = await submitServiceRequest({
          ...input,
          submittedById: ctx.session.user.id,
          status: 'SUBMITTED',
          priority: 'NORMAL',
          formData: input.formData as Prisma.JsonObject,
          requiredDocuments: input.requiredDocuments?.map(doc => ({ id: doc.id } as any)),
        } as any);
        
        return request;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la soumission de la demande',
        });
      }
    }),
});
