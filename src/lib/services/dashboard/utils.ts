import { Profile } from '@prisma/client'

export function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0

  const requiredFields = [
    'firstName',
    'lastName',
    'birthDate',
    'birthPlace',
    'nationality',
    'gender',
    'phone',
    'address',
    'identityPicture',
    'passport'
  ]

  let optionalFields = [
    'profession',
    'employer',
    'spouseFullName',
    'addressInGabon'
  ]

  if (profile.workStatus === 'EMPLOYEE') {
    requiredFields.push('employer')
    optionalFields = optionalFields.filter(field => field !== 'employer')
  }

  if (profile.maritalStatus === 'MARRIED' || profile.maritalStatus === 'COHABITING') {
    requiredFields.push('spouseFullName')
    optionalFields = optionalFields.filter(field => field !== 'spouseFullName')
  }

  console.log({ requiredFields, optionalFields })

  const completedRequired = requiredFields.filter(field =>
    profile[field as keyof Profile] !== null &&
    profile[field as keyof Profile] !== ''
  ).length

  const completedOptional = optionalFields.filter(field =>
    profile[field as keyof Profile] !== null &&
    profile[field as keyof Profile] !== ''
  ).length

  const totalWeight = requiredFields.length * 2 + optionalFields.length
  const completedWeight = completedRequired * 2 + completedOptional

  return Math.round((completedWeight / totalWeight) * 100)
}