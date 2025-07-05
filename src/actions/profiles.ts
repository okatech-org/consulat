'use server';

import { db } from '@/server/db';
import {
  type Profile,
  Gender,
  MaritalStatus,
  ProfileCategory,
  RequestStatus,
  WorkStatus,
  type UserDocument,
} from '@prisma/client';
import { checkAuth } from '@/lib/auth/action';
import { tryCatch } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import type { FullProfile } from '@/types/profile';

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
  residenceCountyCode?: string;
}

export interface PaginatedProfiles {
  items: (Profile & {
    identityPicture: UserDocument | null;
  })[];
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
    residenceCountyCode,
  } = options;

  // Ensure page is a positive number
  const safePage = Math.max(1, Number(page));
  const safeLimit = Math.max(1, Number(limit));

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

  if (residenceCountyCode && residenceCountyCode.length > 0) {
    where.residenceCountyCode = { in: [residenceCountyCode] };
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
          identityPicture: true,
        },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
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

/**
 * Get a list of profiles with basic public information
 */
export async function getPublicProfiles(): Promise<FullProfile[]> {
  try {
    const profiles = await db.profile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        residenceCountyCode: true,
        identityPicture: {
          select: {
            fileUrl: true,
          },
        },
      },
      where: {
        firstName: {
          not: null,
        },
        lastName: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return profiles as FullProfile[];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

/**
 * Get a single profile by ID with different levels of information based on user role
 */
export async function getProfileById(
  profileId: string,
  userId?: string,
  userRoles?: string[],
): Promise<FullProfile | null> {
  try {
    // Basic profile query with limited public information
    const profileQuery = {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      residenceCountyCode: true,
      identityPicture: {
        select: {
          fileUrl: true,
        },
      },
    };

    // For authenticated users, include contact information
    if (userId) {
      Object.assign(profileQuery, {
        email: true,
        phoneNumber: true,
      });
    }

    // For admin users and country managers
    if (
      userRoles &&
      (userRoles.includes('ADMIN') ||
        userRoles.includes('MANAGER') ||
        userRoles.includes('AGENT'))
    ) {
      // Get the user to check country assignment
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { countryCode: true, roles: true },
      });

      // For country-specific admins, check if the profile is in their country
      const isCountryMatch =
        user?.countryCode &&
        user.countryCode === (await getProfileCountryCode(profileId));

      // If country match or super admin, include all profile data
      if (isCountryMatch || userRoles.includes('SUPER_ADMIN')) {
        Object.assign(profileQuery, {
          // Additional personal information
          gender: true,
          birthPlace: true,
          birthCountry: true,
          nationality: true,
          maritalStatus: true,
          workStatus: true,
          acquisitionMode: true,

          // Documents
          passport: true,
          birthCertificate: true,
          residencePermit: true,
          addressProof: true,

          // Contact information
          address: true,

          // Family information
          fatherFullName: true,
          motherFullName: true,
          spouseFullName: true,

          // Professional information
          profession: true,
          employer: true,
          employerAddress: true,

          // Metadata
          createdAt: true,
          updatedAt: true,
        });
      }
    }

    const profile = await db.profile.findUnique({
      where: { id: profileId },
      select: profileQuery,
    });

    return profile as FullProfile;
  } catch (error) {
    console.error(`Error fetching profile ${profileId}:`, error);
    return null;
  }
}

/**
 * Helper function to get a profile's country code
 */
async function getProfileCountryCode(profileId: string): Promise<string | null> {
  try {
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      select: { residenceCountyCode: true },
    });

    return profile?.residenceCountyCode || null;
  } catch (error) {
    console.error(`Error getting profile country code for ${profileId}:`, error);
    return null;
  }
}
