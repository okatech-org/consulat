import { User, Consulate, Country, UserRole } from '@prisma/client'
import { FullProfile } from '@/types'
import { ConsularService } from '@/types/consular-service'

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

// src/lib/ai/types.ts
export interface ChatContext {
  user: {
    isAuthenticated: boolean;
    role?: UserRole;
    profile?: FullProfile;
  };
  consulate?: {
    name: string;
    availableServices: ConsularService[];
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}