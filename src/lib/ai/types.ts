import { User, Consulate, Country } from '@prisma/client'
import { FullProfile } from '@/types'

export type UserContext = {
  user: User | null;
  profile?: FullProfile;
  consulate?: Consulate & {
    countries: Omit<Country, "consulateId">[];
  } | null;
};

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AssistantResponse = {
  message: string;
  suggestedActions?: string[];
  error?: string;
};