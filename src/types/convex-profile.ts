import type { FunctionReturnType } from 'convex/server';
import type { api } from '@/convex/_generated/api';

// Type complet pour un profil avec toutes les relations
export type CompleteProfile = FunctionReturnType<
  typeof api.functions.profile.getCurrentProfile
>;
