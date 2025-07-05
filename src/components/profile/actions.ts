'use server';

import { checkAuth } from '@/lib/auth/action';
import { Prisma } from '@prisma/client';
import { GetProfilesOptions, PaginatedProfiles } from './types';
import { tryCatch } from '@/lib/utils';
import { db } from '@/server/db';
import { adaptProfilesListing } from './adapters';
import { BaseProfileInclude } from './includes';

export async function getProfiles(
  options: GetProfilesOptions,
): Promise<PaginatedProfiles> {
  const { user } = await checkAuth();

  const isAdmin = user?.roles.includes('ADMIN') || user?.roles.includes('SUPER_ADMIN');

  const {
    search,
    status,
    category,
    page = 1,
    limit = 10,
    organizationId,
    gender,
    sort,
  } = options;

  const where: Prisma.ProfileWhereInput = {};

  // Apply filters
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status && status.length > 0) {
    where.status = { in: status };
  } else {
    where.status = { not: 'DRAFT' };
  }

  if (category && category.length > 0) {
    where.category = { in: category };
  }

  if (gender && gender.length > 0) {
    where.gender = { in: gender };
  }

  // Apply organization filter for admins
  if (isAdmin && organizationId) {
    where.assignedOrganizationId = { in: organizationId };
  }

  const result = await tryCatch(
    db.$transaction([
      db.profile.count({ where }),
      db.profile.findMany({
        where,
        ...BaseProfileInclude,
        ...(sort && {
          orderBy: {
            [sort.field]: sort.order,
          },
        }),
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]),
  );

  if (result.error) {
    console.error('Error fetching profiles:', result.error);
    return { items: [], total: 0 };
  }

  if (!result.data) {
    return { items: [], total: 0 };
  }

  const [total, items] = result.data;

  return {
    items: adaptProfilesListing(items),
    total,
  };
}
