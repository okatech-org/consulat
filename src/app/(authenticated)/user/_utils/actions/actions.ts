'use server';

import { ConsularService } from '@prisma/client';

import { checkAuth } from '@/lib/auth/action';
import { db } from '@/lib/prisma';

export async function getRegistrationServiceForUser(
  countryId: string,
): Promise<ConsularService | null> {
  const authResult = await checkAuth();
  if (authResult.error) return null;
  
  const service = await db.consularService.findFirst({
    where: {
      countryId,
      category: 'REGISTRATION',
    },
  });

  console.log('service', service);

  return service;
}
