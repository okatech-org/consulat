import { RequestStatus } from '@prisma/client';
import { FullProfile } from '@/types/profile';
import { calculateProfileCompletion } from '@/lib/utils';
import { FullServiceRequest } from '@/types/service-request';

type TransitionCheck = {
  can: boolean;
  reason?: string;
};

export function canSwitchTo(
  targetStatus: RequestStatus,
  request: FullServiceRequest,
  profile: FullProfile,
): TransitionCheck {
  const completionRate = calculateProfileCompletion(profile);

  switch (request.status) {
    case 'VALIDATED':
      if (completionRate < 100) {
        return { can: false, reason: 'incomplete_profile' };
      }

      if (!allDocumentsValidated(profile)) {
        return { can: false, reason: 'incomplete_documents' };
      }

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
    case 'COMPLETED':
      if (completionRate < 100) {
        return { can: false, reason: 'incomplete_profile' };
      }

      if (!allDocumentsValidated(profile)) {
        return { can: false, reason: 'incomplete_documents' };
      }

      if (request.appointment?.status !== 'COMPLETED') {
        return { can: false, reason: 'appointment_not_completed' };
      }

      return { can: true };
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
  'VALIDATED',
  'READY_FOR_PICKUP',
  'APPOINTMENT_SCHEDULED',
  'COMPLETED',
];
