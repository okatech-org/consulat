import { AnalysisFieldItem } from '@/lib/utils';
import { DocumentType } from '@prisma/client';

export const documentFieldsToAnalyze: AnalysisFieldItem[] = [];

// Configuration spécifique par type de document
export const documentSpecificFields: Record<DocumentType, string[]> = {
  [DocumentType.PASSPORT]: [
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
  [DocumentType.BIRTH_CERTIFICATE]: ['fatherFullName', 'motherFullName'],
  [DocumentType.RESIDENCE_PERMIT]: ['profession', 'workStatus'],
  [DocumentType.PROOF_OF_ADDRESS]: ['address'],
  [DocumentType.IDENTITY_CARD]: ['firstName', 'lastName', 'gender', 'birthDate'],
  [DocumentType.MARRIAGE_CERTIFICATE]: ['maritalStatus', 'spouseFullName'],
  [DocumentType.DEATH_CERTIFICATE]: [],
  [DocumentType.DIVORCE_DECREE]: ['maritalStatus'],
  [DocumentType.NATIONALITY_CERTIFICATE]: ['nationality', 'acquisitionMode'],
  [DocumentType.OTHER]: [],
  [DocumentType.VISA_PAGES]: ['passportNumber'],
  [DocumentType.EMPLOYMENT_PROOF]: ['profession', 'employer', 'workStatus'],
  [DocumentType.NATURALIZATION_DECREE]: ['nationality', 'acquisitionMode'],
  [DocumentType.IDENTITY_PHOTO]: [],
  [DocumentType.CONSULAR_CARD]: ['firstName', 'lastName'],
};

/**
 * Helper function to get relevant fields for a specific document type
 */
export function getFieldsForDocument(
  documentType: keyof typeof documentSpecificFields,
): AnalysisFieldItem[] {
  const fieldNames = documentSpecificFields[documentType];
  return documentFieldsToAnalyze.filter((field) => fieldNames.includes(field.name));
}

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
