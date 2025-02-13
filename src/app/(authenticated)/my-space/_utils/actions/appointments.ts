'use server';

import { db } from '@/lib/prisma';

export async function getAvailableServices(countryCode: string) {
  const countryData = await db.country.findUnique({
    where: {
      code: countryCode,
    },
    include: {
      availableServices: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  return countryData?.availableServices ?? [];
}
