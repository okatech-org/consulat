'use server';

import { db } from '@/lib/prisma';
import {
  Profile,
  Gender,
  MaritalStatus,
  ProfileCategory,
  RequestStatus,
  WorkStatus,
} from '@prisma/client';
import { checkAuth } from '@/lib/auth/action';
import { tryCatch } from '@/lib/utils';
import { Prisma } from '@prisma/client';

export interface GetProfilesOptions {
  search?: string;
  status?: RequestStatus[];
  category?: ProfileCategory[];
  gender?: Gender[];
  maritalStatus?: MaritalStatus[];
  workStatus?: WorkStatus[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
}

export interface PaginatedProfiles {
  items: Profile[];
  total: number;
}

export async function getProfiles(
  options: GetProfilesOptions,
): Promise<PaginatedProfiles> {
  const { user } = await checkAuth();

  const isAdmin = user?.roles.includes('ADMIN') || user?.roles.includes('SUPER_ADMIN');

  const {
    search,
    status,
    category,
    gender,
    maritalStatus,
    workStatus,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate,
    endDate,
    organizationId,
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
  }

  if (category && category.length > 0) {
    where.category = { in: category };
  }

  if (gender && gender.length > 0) {
    where.gender = { in: gender };
  }

  if (maritalStatus && maritalStatus.length > 0) {
    where.maritalStatus = { in: maritalStatus };
  }

  if (workStatus && workStatus.length > 0) {
    where.workStatus = { in: workStatus };
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  } else if (startDate) {
    where.createdAt = { gte: startDate };
  } else if (endDate) {
    where.createdAt = { lte: endDate };
  }

  // Apply organization filter for admins
  if (isAdmin && organizationId) {
    where.assignedOrganizationId = organizationId;
  }

  const result = await tryCatch(
    db.$transaction([
      db.profile.count({ where }),
      db.profile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
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
    items,
    total,
  };
}
