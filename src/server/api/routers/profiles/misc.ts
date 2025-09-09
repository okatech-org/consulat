import { Gender, RequestStatus, ProfileCategory, Prisma } from '@prisma/client';
import { z } from 'zod';

export const GetProfileListInput = z.object({
  search: z.string().optional(),
  status: z.array(z.nativeEnum(RequestStatus)).optional(),
  category: z.array(z.nativeEnum(ProfileCategory)).optional(),
  gender: z.array(z.nativeEnum(Gender)).optional(),
  organizationId: z.array(z.string()).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sort: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']),
  }).optional(),
  
  // Filtres d'intelligence avancés
  hasIntelligenceNotes: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  ageMin: z.number().optional(),
  ageMax: z.number().optional(),
  nationality: z.string().optional(),
  hasDualNationality: z.boolean().optional(),
  riskLevel: z.string().optional(),
  surveillanceStatus: z.string().optional(),
  flagged: z.boolean().optional(),
  vip: z.boolean().optional(),
  sensitive: z.boolean().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  hasCoordinates: z.boolean().optional(),
  childrenCountMin: z.number().optional(),
  childrenCountMax: z.number().optional(),
});

export const ProfileListItemSelect: Prisma.ProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  cardNumber: true,
  email: true,
  phoneNumber: true,
  cardIssuedAt: true,
  cardExpiresAt: true,
  identityPicture: {
    select: {
      id: true,
      fileUrl: true,
      fileType: true,
    }
  },
  birthDate: true,
  nationality: true,
  createdAt: true,
  updatedAt: true,
  cardPin: true,
  status: true,
  category: true,
  gender: true,
  validationRequestId: true,
  // Relations nécessaires pour les filtres d'intelligence
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    }
  },
  address: {
    select: {
      id: true,
      firstLine: true,
      secondLine: true,
      city: true,
      zipCode: true,
      country: true,
    }
  },
  intelligenceNotes: {
    select: {
      id: true,
      type: true,
      priority: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
    take: 3, // Limiter aux 3 dernières notes
  },
  _count: {
    select: {
      intelligenceNotes: true,
    }
  }
};

export type ProfileListItemSelectResult = Prisma.ProfileGetPayload<{
  select: typeof ProfileListItemSelect;
}>;
