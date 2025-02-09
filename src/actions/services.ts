'use server';

import { db } from '@/lib/prisma';
import { getCurrentUser } from './user';

export async function getAvailableServices() {
  const user = await getCurrentUser();
  if (!user?.countryId) {
    throw new Error('User country not found');
  }

  // Récupérer les services disponibles pour le pays de l'utilisateur
  const services = await db.consularService.findMany({
    where: {
      isActive: true,
      countries: {
        some: {
          id: user.countryId,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return services;
}
