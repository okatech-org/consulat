import type { CompleteProfile } from '@/convex/lib/types';

/**
 * Gets a value from a profile object using a dot-notation path
 * @param profile - The complete profile object
 * @param path - Dot-notation path (e.g., "personal.firstName", "contacts.email")
 * @returns The value at the path or undefined if not found
 *
 * @example
 * getProfileValueByPath(profile, "personal.firstName") // "John"
 * getProfileValueByPath(profile, "contacts.email") // "john@example.com"
 * getProfileValueByPath(profile, "personal.passportInfos.number") // "AB123456"
 */
export function getProfileValueByPath(
  profile: CompleteProfile | null | undefined,
  path: string | undefined,
): unknown {
  if (!profile || !path) {
    return undefined;
  }

  const keys = path.split('.');
  let value: any = profile;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

/**
 * Sets a value in an object using a dot-notation path
 * @param obj - The object to modify
 * @param path - Dot-notation path
 * @param value - The value to set
 *
 * @example
 * const data = {};
 * setValueByPath(data, "personal.firstName", "John");
 * // data is now { personal: { firstName: "John" } }
 */
export function setValueByPath(
  obj: Record<string, any>,
  path: string,
  value: unknown,
): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * Profile path examples for common fields
 * Use these as reference when creating service step fields
 */
export const PROFILE_PATHS = {
  // Personal information
  firstName: 'personal.firstName',
  lastName: 'personal.lastName',
  birthDate: 'personal.birthDate',
  birthPlace: 'personal.birthPlace',
  birthCountry: 'personal.birthCountry',
  gender: 'personal.gender',
  nationality: 'personal.nationality',
  acquisitionMode: 'personal.acquisitionMode',
  nipCode: 'personal.nipCode',

  // Passport information
  passportNumber: 'personal.passportInfos.number',
  passportIssueDate: 'personal.passportInfos.issueDate',
  passportExpiryDate: 'personal.passportInfos.expiryDate',
  passportIssueAuthority: 'personal.passportInfos.issueAuthority',

  // Contact information
  email: 'contacts.email',
  phone: 'contacts.phone',
  address: 'contacts.address',
  addressStreet: 'contacts.address.street',
  addressCity: 'contacts.address.city',
  addressState: 'contacts.address.state',
  addressPostalCode: 'contacts.address.postalCode',
  addressCountry: 'contacts.address.country',

  // Family information
  maritalStatus: 'family.maritalStatus',
  fatherFirstName: 'family.father.firstName',
  fatherLastName: 'family.father.lastName',
  motherFirstName: 'family.mother.firstName',
  motherLastName: 'family.mother.lastName',
  spouseFirstName: 'family.spouse.firstName',
  spouseLastName: 'family.spouse.lastName',

  // Professional information
  workStatus: 'professionSituation.workStatus',
  profession: 'professionSituation.profession',
  employer: 'professionSituation.employer',
  employerAddress: 'professionSituation.employerAddress',
  activityInGabon: 'professionSituation.activityInGabon',

  // Consular card
  consularCardNumber: 'consularCard.cardNumber',
  consularCardIssuedAt: 'consularCard.cardIssuedAt',
  consularCardExpiresAt: 'consularCard.cardExpiresAt',

  // Residence
  residenceCountry: 'residenceCountry',
} as const;

/**
 * Type for profile path keys
 */
export type ProfilePathKey = keyof typeof PROFILE_PATHS;

/**
 * Gets a profile value using a predefined path key
 * @param profile - The complete profile object
 * @param pathKey - Key from PROFILE_PATHS
 * @returns The value at the path or undefined
 */
export function getProfileValue(
  profile: CompleteProfile | null | undefined,
  pathKey: ProfilePathKey,
): unknown {
  return getProfileValueByPath(profile, PROFILE_PATHS[pathKey]);
}
