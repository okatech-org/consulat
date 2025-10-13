import type { FunctionReturnType } from 'convex/server';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { api } from '@/convex/_generated/api';

// Type de base pour un profil Convex
export type ConvexProfile = Doc<'profiles'>;

// Type étendu pour un profil avec les documents
export type ConvexProfileWithDocuments = ConvexProfile & {
  documents: Doc<'documents'>[];
};

// Type étendu pour un profil avec l'utilisateur
export type ConvexProfileWithUser = ConvexProfile & {
  user: Doc<'users'>;
};

// Type complet pour un profil avec toutes les relations
export type FullProfile = FunctionReturnType<
  typeof api.functions.profile.getCurrentProfile
>;

// Types pour les mutations
export type CreateConvexProfileInput = {
  userId: Id<'users'>;
  category: string;
  firstName: string;
  lastName: string;
};

export type UpdateConvexProfileInput = {
  profileId: Id<'profiles'>;
  personal?: Partial<ConvexProfile['personal']>;
  family?: Partial<ConvexProfile['family']>;
  professionSituation?: Partial<ConvexProfile['professionSituation']>;
  emergencyContacts?: ConvexProfile['emergencyContacts'];
  residenceCountry?: string;
  consularCard?: Partial<ConvexProfile['consularCard']>;
  status?: string;
};

// Types pour les queries
export type GetConvexProfileInput = {
  profileId: Id<'profiles'>;
};

export type GetConvexProfileByUserInput = {
  userId: Id<'users'>;
};

// Type pour la completion du profil
export type ProfileCompletionSection = {
  name: string;
  percentage: number;
  completed: number;
  total: number;
  missingFields: string[];
};

export type ProfileCompletion = {
  overall: number;
  completedFields: number;
  totalFields: number;
  sections: ProfileCompletionSection[];
};
