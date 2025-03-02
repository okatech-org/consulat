'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { Prisma, Profile, RequestStatus } from '@prisma/client';
import { FullProfile, FullProfileInclude } from '@/types';

interface GetProfilesOptions {
  status?: RequestStatus;
  search?: string;
  orderBy?: {
    field: keyof Prisma.ProfileOrderByWithRelationInput;
    direction: 'asc' | 'desc';
  };
}

export interface ProfilesResult {
  profiles: Profile[];
  total: number;
  filters: {
    search?: string;
    status?: RequestStatus;
  };
}

export async function getProfiles(options?: GetProfilesOptions): Promise<ProfilesResult> {
  await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);

  // Construire la requête where
  const where: Prisma.ProfileWhereInput = {
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { nationality: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ],
    }),
  };

  // Construire l'ordre
  const orderBy: Prisma.ProfileOrderByWithRelationInput = options?.orderBy
    ? { [options.orderBy.field]: options.orderBy.direction }
    : { updatedAt: 'desc' };

  try {
    const [profiles, total] = await Promise.all([
      db.profile.findMany({
        where,
        orderBy,
      }),
      db.profile.count({ where }),
    ]);

    return {
      profiles,
      total,
      filters: {
        search: options?.search,
        status: options?.status,
      },
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile');
  }
}

export async function getProfileById(id: string): Promise<FullProfile | null> {
  await checkAuth(['ADMIN', 'SUPER_ADMIN']);

  return db.profile.findUnique({
    where: { id },
    ...FullProfileInclude,
  });
}

interface ValidateProfileInput {
  profileId: string;
  status: RequestStatus;
  notes?: string;
}

export async function validateProfile(input: ValidateProfileInput) {
  try {
    await checkAuth(['ADMIN', 'SUPER_ADMIN']);

    // Vérifier que le profil existe
    const profile = await db.profile.findUnique({
      where: { id: input.profileId },
    });

    if (!profile) {
      return { error: 'Profile not found' };
    }

    // Mettre à jour le profil
    const updatedProfile = await db.profile.update({
      where: { id: input.profileId },
      data: {
        status: input.status,
        validationNotes: input.notes,
        validatedAt: new Date(),
        validatedBy: authResult.user.id,
      },
    });

    return { success: true, data: updatedProfile };
  } catch (error) {
    console.error('Error validating components:', error);
    return { error: 'Failed to validate components' };
  }
}
