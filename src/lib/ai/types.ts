import { Consulate, Country, User } from '@prisma/client';
import { FullProfile } from '@/types';
import { ConsularServiceItem } from '@/types/consular-service';

export type ChatContext = {
  user?: User;
  profile?: FullProfile;
  consulate?: Consulate & {
    availableServices: ConsularServiceItem[];
    countries: Country[];
  };
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
