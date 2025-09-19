import { createTRPCContext } from '@/server/api/trpc';

export const createContext = createTRPCContext;

export type Context = Awaited<ReturnType<typeof createContext>>;
