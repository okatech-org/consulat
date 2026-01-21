/**
 * Utility functions for generating autocomplete attribute values
 * Based on MDN documentation: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete
 */

export type AutocompleteSection =
  | 'shipping'
  | 'billing'
  | 'section-emergency-contact-1'
  | 'section-emergency-contact-2'
  | 'section-spouse'
  | 'section-employer'
  | 'section-parent-1'
  | 'section-parent-2';

export type AutocompleteContactType = 'home' | 'work' | 'mobile' | 'fax' | 'pager';

/**
 * Generates an autocomplete value with optional section and contact type
 * Format: [section-*] [shipping|billing] [contact-type] field-name
 */
export function getAutocompleteValue(
  fieldName: string,
  options?: {
    section?: AutocompleteSection;
    contactType?: AutocompleteContactType;
    isBilling?: boolean;
    isShipping?: boolean;
  }
): string {
  const parts: string[] = [];

  // Add section prefix if provided
  if (options?.section) {
    parts.push(options.section);
  }

  // Add shipping/billing prefix if provided
  if (options?.isShipping) {
    parts.push('shipping');
  } else if (options?.isBilling) {
    parts.push('billing');
  }

  // Add contact type for email/tel fields
  if (options?.contactType && (fieldName === 'email' || fieldName === 'tel')) {
    parts.push(options.contactType);
  }

  // Add the field name
  parts.push(fieldName);

  return parts.join(' ');
}

/**
 * Common autocomplete mappings for standard form fields
 */
export const autocompleteMap: Record<string, string> = {
  // Personal information
  firstName: 'given-name',
  lastName: 'family-name',
  fullName: 'name',
  name: 'name',
  email: 'email',
  phone: 'tel',
  phoneNumber: 'tel',
  tel: 'tel',
  birthDate: 'bday',
  birthPlace: 'bday',
  gender: 'sex',
  nationality: 'country',
  country: 'country-name',
  countryCode: 'country',

  // Address fields
  street: 'street-address',
  addressLine1: 'address-line1',
  addressLine2: 'address-line2',
  complement: 'address-line2',
  city: 'address-level2',
  postalCode: 'postal-code',
  zipCode: 'postal-code',
  state: 'address-level1',
  region: 'address-level1',

  // Professional
  organization: 'organization',
  organizationName: 'organization',
  company: 'organization',
  jobTitle: 'organization-title',
  profession: 'organization-title',

  // Documents
  documentNumber: 'off', // Sensitive data, should not autocomplete
  passportNumber: 'off',
  idNumber: 'off',
  nipCode: 'off',

  // Passwords
  password: 'new-password',
  currentPassword: 'current-password',
  newPassword: 'new-password',
  confirmPassword: 'new-password',
};

/**
 * Gets autocomplete value for a field name
 */
export function getAutocompleteForField(
  fieldName: string,
  options?: {
    section?: AutocompleteSection;
    contactType?: AutocompleteContactType;
    isBilling?: boolean;
    isShipping?: boolean;
  }
): string {
  // Check if field name is in the map
  const mappedValue = autocompleteMap[fieldName];
  if (mappedValue) {
    // If it's 'off', return it directly
    if (mappedValue === 'off') {
      return 'off';
    }
    // Otherwise, use the mapped value as the field name
    return getAutocompleteValue(mappedValue, options);
  }

  // Try to find a partial match (e.g., "firstName" -> "given-name")
  const lowerFieldName = fieldName.toLowerCase();
  for (const [key, value] of Object.entries(autocompleteMap)) {
    if (lowerFieldName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerFieldName)) {
      if (value === 'off') {
        return 'off';
      }
      return getAutocompleteValue(value, options);
    }
  }

  // Default: use the field name as-is
  return getAutocompleteValue(fieldName, options);
}

/**
 * Helper to get autocomplete for emergency contact fields
 */
export function getEmergencyContactAutocomplete(
  fieldName: string,
  contactIndex: 0 | 1,
  contactType?: AutocompleteContactType
): string {
  const section: AutocompleteSection =
    contactIndex === 0 ? 'section-emergency-contact-1' : 'section-emergency-contact-2';
  return getAutocompleteForField(fieldName, { section, contactType });
}

/**
 * Helper to get autocomplete for address fields
 */
export function getAddressAutocomplete(
  fieldName: string,
  options?: {
    section?: AutocompleteSection;
    isBilling?: boolean;
    isShipping?: boolean;
  }
): string {
  return getAutocompleteForField(fieldName, options);
}
