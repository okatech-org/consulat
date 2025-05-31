import { Gender, Prisma, ProfileCategory, RequestStatus } from '@prisma/client';
import { BaseProfileInclude } from './includes';

export type BaseProfile = Prisma.ProfileGetPayload<typeof BaseProfileInclude>;

export type ProfilesArrayItem = Pick<
  BaseProfile,
  | 'id'
  | 'cardNumber'
  | 'cardPin'
  | 'category'
  | 'userId'
  | 'status'
  | 'firstName'
  | 'lastName'
  | 'createdAt'
  | 'validationRequestId'
> & {
  IDPictureUrl?: string;
  IDPictureFileName: string;
  IDPicturePath: string;
  shareUrl: string;
  cardIssuedAt?: string;
  cardExpiresAt?: string;
};

export type ProfilesFilters = {
  search?: string;
  status?: RequestStatus[];
  category?: ProfileCategory[];
  gender?: Gender[];
  organizationId?: string[];
};

export interface GetProfilesOptions extends ProfilesFilters {
  page?: number;
  limit?: number;
  sort?: {
    field: keyof BaseProfile;
    order: 'asc' | 'desc';
  };
}

export interface PaginatedProfiles {
  items: ProfilesArrayItem[];
  total: number;
}
