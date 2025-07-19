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
  }),
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
  identityPicture: true,
  createdAt: true,
  updatedAt: true,
  cardPin: true,
  status: true,
  category: true,
  gender: true,
  validationRequestId: true,
};

export type ProfileListItemSelectResult = Prisma.ProfileGetPayload<{
  select: typeof ProfileListItemSelect;
}>;
