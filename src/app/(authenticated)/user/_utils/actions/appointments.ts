'use server';

import { db } from '@/lib/prisma';

export async function getAvailableServices(countryId: string) {
  const services = await db.consularService.findMany({
    where: {
      isActive: true,
      countryId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return services;
}
