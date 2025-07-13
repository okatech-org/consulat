import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const userRouter = createTRPCRouter({
  getDocumentsCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.userDocument.count({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return count;
  }),

  getChildrenCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.parentalAuthority.count({
      where: {
        parentUserId: ctx.session.user.id,
      },
    });
    return count;
  }),

  getUpcomingAppointmentsCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.appointment.count({
      where: {
        attendeeId: ctx.session.user.id,
        status: 'CONFIRMED',
        startTime: {
          gte: new Date(),
        },
      },
    });
    return count;
  }),

  getActiveRequestsCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.serviceRequest.count({
      where: {
        submittedById: ctx.session.user.id,
        status: {
          in: [
            'DRAFT',
            'SUBMITTED',
            'EDITED',
            'PENDING',
            'PENDING_COMPLETION',
            'VALIDATED',
            'CARD_IN_PRODUCTION',
          ],
        },
      },
    });
    return count;
  }),
});
