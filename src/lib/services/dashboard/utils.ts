import { Profile } from '@prisma/client';

export function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0;

  const requiredFields = [
    'firstName',
    'lastName',
    'birthDate',
    'nationality',
    'gender',
    'identityPicture',
    'passport',
    'birthCertificate',
    'phone',
    'address',
    'addressProof',
    'addressInGabon',
    'activityInGabon',
    'maritalStatus',
    'addressInGabon',
    'activityInGabon',
    'maritalStatus',
  ];

  if (profile.workStatus === 'EMPLOYEE') {
    requiredFields.push('employer');
    requiredFields.push('profession');
  }

  if (profile.maritalStatus === 'MARRIED' || profile.maritalStatus === 'COHABITING') {
    requiredFields.push('spouseFullName');
  }

  const completedRequired = requiredFields.filter(
    (field) =>
      profile[field as keyof Profile] !== null && profile[field as keyof Profile] !== '',
  ).length;

  const totalWeight = requiredFields.length;
  return Math.round((completedRequired / totalWeight) * 100);
}
