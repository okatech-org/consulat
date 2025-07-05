import { authRouter } from '@/server/api/routers/auth';
import { userRouter } from '@/server/api/routers/user';
import { profileRouter } from '@/server/api/routers/profile';
import { servicesRouter } from '@/server/api/routers/services';
import { documentsRouter } from '@/server/api/routers/documents';
import { appointmentsRouter } from '@/server/api/routers/appointments';
import { dashboardRouter } from '@/server/api/routers/dashboard';
import { requestsRouter } from '@/server/api/routers/requests';
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  profile: profileRouter,
  services: servicesRouter,
  documents: documentsRouter,
  appointments: appointmentsRouter,
  dashboard: dashboardRouter,
  requests: requestsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
