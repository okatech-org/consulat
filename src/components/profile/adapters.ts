import { RequestStatus, ProfileCategory, Gender } from '@prisma/client';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { BaseProfile, GetProfilesOptions, ProfilesArrayItem } from './types';
import { formatDate } from 'date-fns';
import { capitalize } from '@/lib/utils';

const currentAppUrl = `https://consulat.ga`;

export function adaptProfilesListing(profileItems: BaseProfile[]): ProfilesArrayItem[] {
  return profileItems.map((item) => {
    const { identityPicture, ...rest } = item;

    return {
      ...rest,
      firstName: capitalize(item.firstName ?? ''),
      lastName: item.lastName?.toLocaleUpperCase() ?? '',
      IDPictureUrl: identityPicture?.fileUrl,
      IDPictureFileName: `${item.firstName?.toLocaleUpperCase()}_${item.lastName}_${item.cardNumber}.${identityPicture?.fileType}`,
      shareUrl: `${currentAppUrl}/listing/profiles/${item.id}`,
      cardIssuedAt: item.cardIssuedAt
        ? formatDate(item.cardIssuedAt, 'dd/MM/yyyy')
        : undefined,
      cardExpiresAt: item.cardExpiresAt
        ? formatDate(item.cardExpiresAt, 'dd/MM/yyyy')
        : undefined,
    };
  });
}

export function adaptSearchParams(
  searchParams: ReadonlyURLSearchParams,
): GetProfilesOptions {
  const sortBy = searchParams.get('sortBy') as keyof BaseProfile;
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

  return {
    status: searchParams
      .get('status')
      ?.split(',')
      .map((status) => status as RequestStatus),
    category: searchParams
      .get('category')
      ?.split(',')
      .map((category) => category as ProfileCategory),
    page: Math.max(1, Number(searchParams.get('page') || '1')),
    limit: Math.max(1, Number(searchParams.get('limit') || '10')),
    sort: sortBy && sortOrder ? [sortBy, sortOrder] : undefined,
    organizationId: searchParams.get('organizationId') ?? '',
    gender: searchParams
      .get('gender')
      ?.split(',')
      .map((gender) => gender as Gender),
    search: searchParams.get('search') ?? '',
  };
}
