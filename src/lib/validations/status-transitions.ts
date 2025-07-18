import { ProfileCategory, RequestStatus } from '@prisma/client';
import { calculateChildProfileCompletion, calculateProfileCompletion } from '@/lib/utils';
import type { RequestDetails } from '@/server/api/routers/requests/misc';
import type { FullProfile } from '@/server/api/routers/profiles/profile';

type TransitionCheck = {
  can: boolean;
  reason?: string;
};

export function canSwitchTo(
  targetStatus: RequestStatus,
  request: RequestDetails,
  profile: FullProfile,
  allow: boolean = false,
): TransitionCheck {
  if (allow) return { can: true };

  const completionRate =
    profile.category === ProfileCategory.MINOR
      ? calculateChildProfileCompletion(profile)
      : calculateProfileCompletion(profile);

  switch (targetStatus) {
    case RequestStatus.VALIDATED:
      if (completionRate < 100) {
        return { can: false, reason: 'incomplete_profile' };
      }
      if (!allDocumentsValidated(profile, profile.category)) {
        return { can: false, reason: 'incomplete_documents' };
      }
      return { can: true };
    case RequestStatus.DOCUMENT_IN_PRODUCTION:
      if (completionRate < 100) {
        return { can: false, reason: 'incomplete_profile' };
      }
      if (!allDocumentsValidated(profile, profile.category)) {
        return { can: false, reason: 'incomplete_documents' };
      }
      return { can: true };
    case RequestStatus.COMPLETED:
      if (completionRate < 100) {
        return { can: false, reason: 'incomplete_profile' };
      }
      if (!allDocumentsValidated(profile, profile.category)) {
        return { can: false, reason: 'incomplete_documents' };
      }

      return { can: true };
    default:
      return { can: true };
  }
}

function allDocumentsValidated(profile: FullProfile, category: ProfileCategory): boolean {
  const requiredDocs =
    category === ProfileCategory.MINOR
      ? [profile.identityPicture, profile.birthCertificate]
      : [
          profile.identityPicture,
          profile.passport,
          profile.birthCertificate,
          profile.addressProof,
        ];

  return requiredDocs.every((doc) => doc?.status === 'VALIDATED');
}

export const STATUS_ORDER: RequestStatus[] = [
  'SUBMITTED',
  'PENDING',
  'VALIDATED',
  'DOCUMENT_IN_PRODUCTION',
  'READY_FOR_PICKUP',
  'COMPLETED',
];
