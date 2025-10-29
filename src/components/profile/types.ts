import {
  Gender,
  ProfileCategory,
  RequestStatus,
  type CompleteProfile,
} from '@/convex/lib/constants';

export type ProfilesArrayItem = Pick<
  CompleteProfile,
  'id' | 'cardNumber' | 'category' | 'userId' | 'status'
> & {
  IDPictureUrl?: string;
  IDPictureFileName: string;
  IDPicturePath: string;
  shareUrl: string;
  cardIssuedAt?: string;
  cardExpiresAt?: string;
  firstName: string;
  lastName: string;
  createdAt: number;
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
    field: keyof CompleteProfile;
    order: 'asc' | 'desc';
  };
}

export interface PaginatedProfiles {
  items: ProfilesArrayItem[];
  total: number;
}
