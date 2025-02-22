import { RequestStatus, ServiceRequest } from '@prisma/client';
import { FullProfile } from '@/types/profile';
import { calculateProfileCompletion } from '@/lib/utils';

type TransitionCheck = {
  can: boolean;
  reason?: string;
};

export function canSwitchTo(
  targetStatus: RequestStatus,
  request: ServiceRequest,
  profile: FullProfile,
): TransitionCheck {
  const completionRate = calculateProfileCompletion(profile);

  // Règles de transition selon l'état actuel
  switch (request.status) {
    case 'DRAFT':
      if (targetStatus === 'SUBMITTED') {
        return {
          can: completionRate === 100,
          reason: completionRate < 100 ? 'Le profil doit être complet' : undefined,
        };
      }
      break;

    case 'SUBMITTED':
      if (targetStatus === 'PENDING_COMPLETION') {
        return { can: true };
      }
      if (targetStatus === 'VALIDATED') {
        return {
          can: completionRate === 100 && allDocumentsValidated(profile),
          reason: 'Tous les documents doivent être validés',
        };
      }
      if (targetStatus === 'REJECTED') {
        return { can: true };
      }
      break;

    case 'PENDING_COMPLETION':
      if (targetStatus === 'VALIDATED') {
        return {
          can: completionRate === 100 && allDocumentsValidated(profile),
          reason: 'Tous les documents doivent être validés',
        };
      }
      break;

    case 'VALIDATED':
      if (targetStatus === 'CARD_IN_PRODUCTION') {
        return { can: true };
      }
      break;

    case 'CARD_IN_PRODUCTION':
      if (targetStatus === 'READY_FOR_PICKUP') {
        return { can: true };
      }
      break;

    case 'READY_FOR_PICKUP':
      if (targetStatus === 'APPOINTMENT_SCHEDULED') {
        return { can: true };
      }
      break;

    case 'APPOINTMENT_SCHEDULED':
      if (targetStatus === 'COMPLETED') {
        return { can: true };
      }
      break;
  }

  return { can: false, reason: 'Transition non autorisée' };
}

function allDocumentsValidated(profile: FullProfile): boolean {
  const requiredDocs = [
    profile.identityPicture,
    profile.passport,
    profile.birthCertificate,
    profile.residencePermit,
    profile.addressProof,
  ];

  return requiredDocs.every((doc) => doc?.status === 'VALIDATED');
}

export const STATUS_ORDER: RequestStatus[] = [
  'SUBMITTED',
  'PENDING',
  'PENDING_COMPLETION',
  'VALIDATED',
  'CARD_IN_PRODUCTION',
  'READY_FOR_PICKUP',
  'APPOINTMENT_SCHEDULED',
  'COMPLETED',
];
