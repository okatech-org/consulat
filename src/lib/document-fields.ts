import { DocumentField } from '@/lib/utils';

export const documentFieldsToAnalyze: DocumentField[] = [
  // Informations de base
  {
    name: 'firstName',
    description: 'First name of the person as written on the document',
    required: true,
    type: 'string',
  },
  {
    name: 'passportNumber',
    description: 'Passport number',
    required: true,
    type: 'string',
  },
  {
    name: 'passportIssueDate',
    description: 'Date of issue of the passport in YYYY-MM-DD format',
    required: true,
    type: 'date',
  },
  {
    name: 'passportExpiryDate',
    description: 'Date of expiry of the passport in YYYY-MM-DD format',
    required: true,
    type: 'date',
  },
  {
    name: 'passportIssueAuthority',
    description: 'Authority that issued the passport',
    required: true,
    type: 'string',
  },
  {
    name: 'lastName',
    description: 'Last name of the person as written on the document',
    required: true,
    type: 'string',
  },
  {
    name: 'gender',
    description: 'Gender of the person. Must be exactly "MALE" or "FEMALE"',
    required: true,
    type: 'string',
  },
  {
    name: 'birthDate',
    description: 'Date of birth in YYYY-MM-DD format',
    required: true,
    type: 'date',
  },
  {
    name: 'birthPlace',
    description: 'Place of birth (city name)',
    required: true,
    type: 'string',
  },
  {
    name: 'birthCountry',
    description: 'Country of birth (e.g. "france")',
    required: true,
    type: 'string',
  },
  {
    name: 'nationality',
    description: 'Nationality as written on the document (e.g. "france")',
    required: true,
    type: 'string',
  },
  // Address
  {
    name: 'address',
    description:
      'Complete address with the following structure: firstLine (address line 1), secondLine (address line 2), city, zipCode, country, e.g. { "firstLine": "123 Main St", "secondLine": "Apt 1", "city": "Springfield", "zipCode": "12345", "country": "united_states" }',
    type: 'address',
    required: true,
  },
  {
    name: 'fatherFullName',
    description: 'Full name of the father',
    type: 'string',
  },
  {
    name: 'motherFullName',
    description: 'Full name of the mother',
    type: 'string',
  },
  // Informations professionnelles
  {
    name: 'workStatus',
    description:
      'Work status, must be one of: "EMPLOYEE", "ENTREPRENEUR", "UNEMPLOYED", "RETIRED", "STUDENT", "OTHER"',
    type: 'string',
  },
  {
    name: 'profession',
    description: 'Current profession or occupation (job title)',
    type: 'string',
  },
];

// Configuration spécifique par type de document
export const documentSpecificFields = {
  passportFile: [
    'firstName',
    'lastName',
    'gender',
    'birthDate',
    'birthPlace',
    'birthCountry',
    'nationality',
    'passportNumber',
    'passportIssueDate',
    'passportExpiryDate',
    'passportIssueAuthority',
  ],
  birthCertificateFile: ['fatherFullName', 'motherFullName'],
  residencePermitFile: ['profession', 'workStatus'],
  addressProofFile: ['address'],
};

// Sections of the registration form
export type FormSection = 'basicInfo' | 'contactInfo' | 'familyInfo' | 'professionalInfo';

/**
 * Configuration of fields that should never be automatically updated by document analysis
 * This protects sensitive or manually entered fields from being overwritten
 *
 * You can use dot notation for nested fields, such as 'residentContact.address.country'
 */
export const blacklistedAnalysisFields: Record<FormSection, string[]> = {
  basicInfo: [
    'residentContact.address.country',
    'homeLandContact.address.country',
    'residenceCountyCode',
    'email',
    'phoneNumber',
  ],
  contactInfo: [
    'residentContact.address.country',
    'homeLandContact.address.country',
    'residenceCountyCode',
    'email',
    'phoneNumber',
  ],
  familyInfo: [
    'residentContact.address.country',
    'homeLandContact.address.country',
    'residenceCountyCode',
    'email',
    'phoneNumber',
  ],
  professionalInfo: [
    'residentContact.address.country',
    'homeLandContact.address.country',
    'residenceCountyCode',
    'email',
    'phoneNumber',
  ],
};

/**
 * Helper function to get relevant fields for a specific document type
 */
export function getFieldsForDocument(
  documentType: keyof typeof documentSpecificFields,
): DocumentField[] {
  const fieldNames = documentSpecificFields[documentType];
  return documentFieldsToAnalyze.filter((field) => fieldNames.includes(field.name));
}

/**
 * Checks if a field is blacklisted for automatic updates
 *
 * @param section The form section (basicInfo, contactInfo, etc.)
 * @param fieldPath The field path to check, can be a simple field name or a dot notation path
 * for nested objects (e.g., 'residentContact.address.country')
 * @returns boolean indicating if the field should not be updated
 */
export function isFieldBlacklisted(section: FormSection, fieldPath: string): boolean {
  // If section doesn't exist in the configuration, nothing is blacklisted
  if (!blacklistedAnalysisFields[section]) return false;

  // Check for exact match (entire field path)
  if (blacklistedAnalysisFields[section].includes(fieldPath)) {
    return true;
  }

  // Check if any parent object is blacklisted
  // For example, if 'residentContact' is blacklisted, then 'residentContact.address.country' should also be blacklisted
  const parts = fieldPath.split('.');

  if (parts.length > 1) {
    // Check all possible parent paths
    for (let i = 1; i < parts.length; i++) {
      const parentPath = parts.slice(0, i).join('.');
      if (blacklistedAnalysisFields[section].includes(parentPath)) {
        return true;
      }
    }
  }

  return false;
}
