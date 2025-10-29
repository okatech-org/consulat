import { RequestStatus, ProfileCategory, Gender } from '@/convex/lib/constants';
import { ReadonlyURLSearchParams } from 'next/navigation';
import type { CompleteProfile } from '@/convex/lib/types';
import { formatDate } from 'date-fns';
import { capitalize } from '@/lib/utils';
import { env } from '@/env';

const currentAppUrl = `https://consulat.ga`;

function getFileName(item: CompleteProfile) {
  return `${item.firstName?.toLocaleUpperCase()}_${item.lastName}_${item.cardNumber}`;
}

function getFileExtension(item: CompleteProfile) {
  return item.identityPicture?.fileType?.split('/')[1];
}

function getFilePath(item: CompleteProfile) {
  return `${env.NEXT_PUBLIC_DEFAULT_IMAGE_PATH}${getFileName(item)}.${getFileExtension(item)}`;
}

export function adaptProfilesListing(profileItems: CompleteProfile[]) {
  return profileItems.map((item) => {
    const { identityPicture, ...rest } = item;

    return {
      ...rest,
      firstName: capitalize(item.firstName ?? ''),
      lastName: item.lastName?.toLocaleUpperCase() ?? '',
      IDPictureUrl: identityPicture?.fileUrl,
      IDPictureFileName: `${getFileName(item)}`,
      IDPicturePath: getFilePath(item),
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
  const sortBy = searchParams.get('sort')?.split('-')[0] as keyof CompleteProfile;
  const sortOrder = searchParams.get('sort')?.split('-')[1] as 'asc' | 'desc';
  const organisationIdString = searchParams.get('organizationId');

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
    sort: sortBy && sortOrder ? { field: sortBy, order: sortOrder } : undefined,
    organizationId: organisationIdString ? [organisationIdString] : undefined,
    gender: searchParams
      .get('gender')
      ?.split(',')
      .map((gender) => gender as Gender),
    search: searchParams.get('search') ?? '',
  };
}
