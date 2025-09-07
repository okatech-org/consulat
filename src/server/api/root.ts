import { authRouter } from '@/server/api/routers/auth/auth';
import { profileRouter } from '@/server/api/routers/profiles/profile';
import { servicesRouter } from '@/server/api/routers/services/services';
import { documentsRouter } from '@/server/api/routers/documents/documents';
import { appointmentsRouter } from '@/server/api/routers/appointments/appointments';
import { dashboardRouter } from '@/server/api/routers/dashboard/dashboard';
import { requestsRouter } from '@/server/api/routers/requests';
import { agentsRouter } from '@/server/api/routers/agents/agents';
import { countriesRouter } from '@/server/api/routers/countries/countries';
import { organizationsRouter } from '@/server/api/routers/organizations/organizations';
import { notificationsRouter } from '@/server/api/routers/notifications/notifications';
import { feedbackRouter } from '@/server/api/routers/feedbacks/feedback';
import { userRouter } from '@/server/api/routers/users/user';
import { intelligenceRouter } from '@/server/api/routers/intelligence';
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  profile: profileRouter,
  services: servicesRouter,
  documents: documentsRouter,
  appointments: appointmentsRouter,
  dashboard: dashboardRouter,
  requests: requestsRouter,
  agents: agentsRouter,
  countries: countriesRouter,
  organizations: organizationsRouter,
  notifications: notificationsRouter,
  feedback: feedbackRouter,
  user: userRouter,
  intelligence: intelligenceRouter,
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
