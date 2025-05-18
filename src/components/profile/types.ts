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

export interface GetProfilesOptions {
  search?: string;
  status?: RequestStatus[];
  category?: ProfileCategory[];
  page?: number;
  limit?: number;
  gender?: Gender[];
  sort?: [keyof BaseProfile, 'asc' | 'desc'];
  organizationId?: string;
}

export interface PaginatedProfiles {
  items: ProfilesArrayItem[];
  total: number;
  page: number;
  limit: number;
}

export type PaginationOption = {
  type: 'page' | 'limit';
  value: number;
};

export type SortOption = {
  type: 'sort';
  value: string;
};

export type ParamsFilterOption = {
  type: 'filter';
  name: string;
  value: string;
};

export type ArrayOption = PaginationOption | SortOption | ParamsFilterOption;
