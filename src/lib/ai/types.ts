import { Consulate, Country, User } from '@prisma/client'
import { FullProfile } from '@/types'
import { ConsularService } from '@/types/consular-service'

export type ChatContext = {
  user?: User;
  profile?: FullProfile;
  consulate?: Consulate & { availableServices: ConsularService[], countries: Country[] };
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