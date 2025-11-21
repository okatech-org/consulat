import { CountryCode } from './constants';
import { countryCodes } from './countryCodes';

export const countryCodeFromPhoneNumber = (phoneNumber: string) => {
  const countryDetails = countryCodes.find((country) =>
    phoneNumber.startsWith(country.dial_code),
  );
  return countryDetails ? (countryDetails.code as CountryCode) : undefined;
};

interface ProfileCompletionResult {
  overall: number;
  sections: Array<{
    name: string;
    completion: number;
    total: number;
    completed: number;
    missingFields: string[];
  }>;
  totalFields: number;
  completedFields: number;
  canSubmit: boolean;
}

export function calculateProfileCompletion(profile: any): ProfileCompletionResult {
  let totalFields = 0;
  let completedFields = 0;
  const sections: Array<{
    name: string;
    completion: number;
    total: number;
    completed: number;
    missingFields: string[];
  }> = [];

  // Helper to check if a value is filled
  const isFilled = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object') {
      return Object.values(value).some((v) => isFilled(v));
    }
    return true;
  };

  // Personal Information - Required fields
  const personalFields = [
    { key: 'firstName', value: profile.personal.firstName },
    { key: 'lastName', value: profile.personal.lastName },
    { key: 'birthDate', value: profile.personal.birthDate },
    { key: 'birthPlace', value: profile.personal.birthPlace },
    { key: 'birthCountry', value: profile.personal.birthCountry },
    { key: 'gender', value: profile.personal.gender },
    { key: 'nationality', value: profile.personal.nationality },
  ];
  const personalCompleted = personalFields.filter((f) => isFilled(f.value)).length;
  const personalMissing = personalFields
    .filter((f) => !isFilled(f.value))
    .map((f) => f.key);
  totalFields += personalFields.length;
  completedFields += personalCompleted;
  sections.push({
    name: 'Personal Information',
    completion: Math.round((personalCompleted / personalFields.length) * 100),
    total: personalFields.length,
    completed: personalCompleted,
    missingFields: personalMissing,
  });

  // Contact Information
  const contactFields = [
    { key: 'email', value: profile.contacts.email },
    { key: 'phone', value: profile.contacts.phone },
    { key: 'address', value: profile.contacts.address },
  ];
  const contactCompleted = contactFields.filter((f) => isFilled(f.value)).length;
  const contactMissing = contactFields
    .filter((f) => !isFilled(f.value))
    .map((f) => f.key);
  totalFields += contactFields.length;
  completedFields += contactCompleted;
  sections.push({
    name: 'Contact Information',
    completion: Math.round((contactCompleted / contactFields.length) * 100),
    total: contactFields.length,
    completed: contactCompleted,
    missingFields: contactMissing,
  });

  // Family Information
  const familyFields = [
    { key: 'maritalStatus', value: profile.family.maritalStatus },
    { key: 'father', value: profile.family.father },
    { key: 'mother', value: profile.family.mother },
  ];

  // Add spouse if married
  if (
    profile.family.maritalStatus === 'MARRIED' ||
    profile.family.maritalStatus === 'COHABITING' ||
    profile.family.maritalStatus === 'CIVIL_UNION'
  ) {
    familyFields.push({ key: 'spouse', value: profile.family.spouse });
  }

  const familyCompleted = familyFields.filter((f) => isFilled(f.value)).length;
  const familyMissing = familyFields.filter((f) => !isFilled(f.value)).map((f) => f.key);
  totalFields += familyFields.length;
  completedFields += familyCompleted;
  sections.push({
    name: 'Family Information',
    completion: Math.round((familyCompleted / familyFields.length) * 100),
    total: familyFields.length,
    completed: familyCompleted,
    missingFields: familyMissing,
  });

  // Professional Situation
  const professionFields = [
    { key: 'workStatus', value: profile.professionSituation.workStatus },
  ];

  // Add work-related fields if employed
  if (
    profile.professionSituation.workStatus === 'EMPLOYEE' ||
    profile.professionSituation.workStatus === 'SELF_EMPLOYED' ||
    profile.professionSituation.workStatus === 'ENTREPRENEUR'
  ) {
    professionFields.push(
      { key: 'profession', value: profile.professionSituation.profession },
      { key: 'employer', value: profile.professionSituation.employer },
      { key: 'employerAddress', value: profile.professionSituation.employerAddress },
    );
  }

  const professionCompleted = professionFields.filter((f) => isFilled(f.value)).length;
  const professionMissing = professionFields
    .filter((f) => !isFilled(f.value))
    .map((f) => f.key);
  totalFields += professionFields.length;
  completedFields += professionCompleted;
  sections.push({
    name: 'Professional Situation',
    completion: Math.round((professionCompleted / professionFields.length) * 100),
    total: professionFields.length,
    completed: professionCompleted,
    missingFields: professionMissing,
  });

  // Emergency Contacts (at least one required)
  const hasEmergencyContact =
    profile.emergencyContacts && profile.emergencyContacts.length > 0;
  totalFields += 1;
  if (hasEmergencyContact) completedFields += 1;
  sections.push({
    name: 'Emergency Contacts',
    completion: hasEmergencyContact ? 100 : 0,
    total: 1,
    completed: hasEmergencyContact ? 1 : 0,
    missingFields: hasEmergencyContact ? [] : ['emergencyContact'],
  });

  // Residence Country
  const hasResidenceCountry = isFilled(profile.residenceCountry);
  totalFields += 1;
  if (hasResidenceCountry) completedFields += 1;

  const overall = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  const canSubmit = overall >= 80; // Allow submission at 80% completion

  return {
    overall,
    sections,
    totalFields,
    completedFields,
    canSubmit,
  };
}

export function calculateChildProfileCompletion(profile: any): ProfileCompletionResult {
  let totalFields = 0;
  let completedFields = 0;
  const sections: Array<{
    name: string;
    completion: number;
    total: number;
    completed: number;
    missingFields: string[];
  }> = [];

  // Helper to check if a value is filled
  const isFilled = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object') {
      return Object.values(value).some((v) => isFilled(v));
    }
    return true;
  };

  // Personal Information - Required fields for children
  const personalFields = [
    { key: 'firstName', value: profile.personal.firstName },
    { key: 'lastName', value: profile.personal.lastName },
    { key: 'birthDate', value: profile.personal.birthDate },
    { key: 'birthPlace', value: profile.personal.birthPlace },
    { key: 'birthCountry', value: profile.personal.birthCountry },
    { key: 'gender', value: profile.personal.gender },
    { key: 'nationality', value: profile.personal.nationality },
  ];
  const personalCompleted = personalFields.filter((f) => isFilled(f.value)).length;
  const personalMissing = personalFields
    .filter((f) => !isFilled(f.value))
    .map((f) => f.key);
  totalFields += personalFields.length;
  completedFields += personalCompleted;
  sections.push({
    name: 'Personal Information',
    completion: Math.round((personalCompleted / personalFields.length) * 100),
    total: personalFields.length,
    completed: personalCompleted,
    missingFields: personalMissing,
  });

  // Parents (at least one required)
  const hasParents = profile.parents && profile.parents.length > 0;
  totalFields += 1;
  if (hasParents) completedFields += 1;
  sections.push({
    name: 'Parental Information',
    completion: hasParents ? 100 : 0,
    total: 1,
    completed: hasParents ? 1 : 0,
    missingFields: hasParents ? [] : ['parent'],
  });

  // Residence Country
  const hasResidenceCountry = isFilled(profile.residenceCountry);
  totalFields += 1;
  if (hasResidenceCountry) completedFields += 1;

  const overall = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  const canSubmit = overall >= 80; // Allow submission at 80% completion

  return {
    overall,
    sections,
    totalFields,
    completedFields,
    canSubmit,
  };
}
