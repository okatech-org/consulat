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

  switch (targetStatus) {
    case RequestStatus.VALIDATED:
      if (completionRate < 100) {
        return { can: false, reason: 'incomplete_profile' };
      }
      if (!allDocumentsValidated(profile)) {
        return { can: false, reason: 'incomplete_documents' };
      }
      return { can: true };
    case RequestStatus.COMPLETED:
      if (completionRate < 100) {
        return { can: false, reason: 'incomplete_profile' };
      }
      if (!allDocumentsValidated(profile)) {
        return { can: false, reason: 'incomplete_documents' };
      }
      if (request.appointment?.status !== 'COMPLETED') {
        return { can: false, reason: 'incomplete_appointment' };
      }
      return { can: true };
    default:
      return { can: true };
  }
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
  'COMPLETED',
  'REJECTED',
];
