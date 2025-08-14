import { db } from '@/server/db';

/**
 * Vérifie qu'un profil n'a pas déjà une demande d'inscription active
 * @param profileId ID du profil
 * @returns Promise<void> - Lève une erreur si une demande existe déjà
 */
export async function checkExistingRegistrationRequest(profileId: string): Promise<void> {
  // Vérifier le validationRequestId du profil
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: { validationRequestId: true },
  });

  if (profile?.validationRequestId) {
    throw new Error('profile_already_has_validation_request');
  }

  // Vérifier s'il existe déjà une demande d'inscription active
  const existingRequest = await db.serviceRequest.findFirst({
    where: {
      requestedForId: profileId,
      serviceCategory: 'REGISTRATION',
      status: {
        notIn: ['COMPLETED', 'REJECTED'],
      },
    },
    select: { id: true, status: true },
  });

  if (existingRequest) {
    throw new Error(`existing_registration_request:${existingRequest.status}`);
  }
}

/**
 * Vérifie qu'un profil n'a pas déjà une demande d'inscription active (version TRPCError)
 * @param profileId ID du profil
 * @returns Promise<void> - Lève une TRPCError si une demande existe déjà
 */
export async function checkExistingRegistrationRequestTRPC(
  profileId: string,
): Promise<void> {
  try {
    await checkExistingRegistrationRequest(profileId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'unknown_error';

    if (errorMessage === 'profile_already_has_validation_request') {
      const { TRPCError } = await import('@trpc/server');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Ce profil a déjà une demande d'inscription en cours",
      });
    }

    if (errorMessage.startsWith('existing_registration_request:')) {
      const status = errorMessage.split(':')[1];
      const { TRPCError } = await import('@trpc/server');
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Une demande d'inscription est déjà en cours pour ce profil (statut: ${status})`,
      });
    }

    throw error;
  }
}
