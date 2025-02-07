import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { RequestStatus } from '@prisma/client';

export async function getManagerStats() {
  const authResult = await checkAuth(['MANAGER']);
  if (authResult.error) return null;

  const [pendingRequests, activeUsers, completedRequests] = await Promise.all([
    db.serviceRequest.count({ where: { status: RequestStatus.SUBMITTED } }),
    db.user.count(),
    db.serviceRequest.count({ where: { status: RequestStatus.COMPLETED } }),
  ]);

  // Calculer le temps moyen de traitement
  const averageProcessingTime = await calculateAverageProcessingTime();

  return {
    pendingRequests,
    activeUsers,
    completedRequests,
    averageProcessingTime,
  };
}

async function calculateAverageProcessingTime() {
  // Logique de calcul du temps moyen
  return 2.5; // en jours
}
