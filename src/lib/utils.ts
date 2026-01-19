import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CountryIndicator } from '@/lib/autocomplete-datas';
import type { UseFormReturn } from 'react-hook-form';
import type { DateTimeFormatOptions } from 'next-intl';
import { useLocale } from 'next-intl';
import type { Locale } from 'date-fns/locale';
import { es, fr, enUS } from 'date-fns/locale';
import { format } from 'date-fns';
import messages from '@/i18n/messages/fr/messages';

import type { Primitive } from 'type-fest';
import { ROUTES } from '@/schemas/routes';
import type { Doc } from 'convex/_generated/dataModel';
import { ProfileStatus, UserRole } from 'convex/lib/constants';
import type { CompleteProfile } from '@/convex/lib/types';
import { MaritalStatus, WorkStatus } from '@/convex/lib/constants';
import type { RegistrationStep } from '@/components/registration/registration-form';
import type { OrganizationListItem } from '@/components/organization/organizations-table';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type VCardData = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  emails?: { value: string }[];
  phones?: string[];
  addresses?: {
    firstLine: string;
    secondLine?: string | null;
    city: string;
    zipCode?: string | null;
    country: string;
  }[];
  socialLinks?: { type: string; url: string }[];
  links?: { url: string }[];
  note?: string;
  photoUrl?: string;
};

export function generateVCardString(data: VCardData): string {
  let vCardString = `BEGIN:VCARD\nVERSION:3.0\nPRODID:-//Apple Inc.//macOS 14.4//EN\n`;

  if (data.firstName && data.lastName) {
    vCardString += `N:${data.lastName};${data.firstName};;;\n`;
    vCardString += `FN:${data.firstName} ${data.lastName}\n`;
  }

  if (data.fullName) {
    vCardString += `NICKNAME:${data.fullName}\n`;
  }

  if (data.title) {
    vCardString += `ORG:${data.title};\n`;
  }

  if (data.emails) {
    data.emails.forEach((email) => {
      vCardString += `EMAIL;type=INTERNET;type=pref:${email.value}\n`;
    });
  }

  if (data.phones) {
    data.phones.forEach((phone) => {
      vCardString += `TEL;type=CELL;type=VOICE;type=pref:${phone}\n`;
    });
  }

  if (data.addresses) {
    data.addresses.forEach((address, index) => {
      const addressType = index === 0 ? 'WORK;type=pref' : 'HOME';
      vCardString += `ADR;type=${addressType}:;;${address.firstLine};${address.city};;${address.zipCode};${address.country}\n`;
    });
  }

  if (data.socialLinks) {
    data.socialLinks.forEach((socialLink, index) => {
      vCardString += `item${index + 1}.URL;type=pref:${socialLink.url}\n`;
      vCardString += `item${index + 1}.X-ABLabel:${socialLink.type}\n`;
    });
  }

  if (data.links) {
    data.links?.forEach((link, index) => {
      const linkType = index === 0 ? 'pref' : '';
      vCardString += `item${index + 1}.URL;type=${linkType.toLocaleUpperCase()}:${link.url}\n`;
      if (linkType === 'pref') {
        vCardString += `item${index + 1}.X-ABLabel:_$!<HomePage>!$_\n`;
      }
    });
  }

  if (data.note) vCardString += `NOTE:${data.note}\n`;

  vCardString += `END:VCARD`;

  return vCardString;
}

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
export const ACCEPTED_FILE_TYPES = ['image/*', 'application/pdf'];

export const phoneRegex = new RegExp(
  /(?:([+]\d{1,4})[-.\s]?)?(?:[(](\d{1,3})[)][-.\s]?)?(\d{1,4})[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})/g,
);

export function checkFileSize(files: FileList | File[] | undefined, size: number) {
  if (!files?.[0]) return true;
  return files[0].size <= size;
}

export function checkFileType(files: FileList | File[] | undefined, types: string[]) {
  if (!files?.[0]) return true;
  return types.includes(files[0].type);
}

export type CountryItem = {
  name: string;
  code: string;
  flag?: string;
};

export const weekDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export interface DocumentField {
  name: keyof CompleteProfile;
  description: string;
  required?: boolean;
  type?: 'string' | 'date' | 'address';
}

export type AnalysisField = {
  type: 'string' | 'date' | 'object' | 'array' | 'boolean';
  description?: string;
  enum?: string[];
  properties?: AnalysisFieldItem[];
};

export type AnalysisFieldItem = Record<string, AnalysisField>;

const STORAGE_KEY = 'consular_form_data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveFormData(data: any) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving form data:', error);
  }
}

export function loadFormData() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading form data:', error);
    return null;
  }
}

export function clearFormData() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
}

export function useFormStorage() {
  const loadSavedData = () => {
    return loadFormData();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveData = (data: any) => {
    saveFormData(data);
  };

  const clearData = () => {
    clearFormData();
  };

  return {
    loadSavedData,
    saveData,
    clearData,
  };
}

export interface ProfileCompletionResult {
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

export function calculateProfileCompletion(
  profile: CompleteProfile,
): ProfileCompletionResult {
  let totalFields = 0;
  let completedFields = 0;
  const sections: Array<{
    name: RegistrationStep;
    completion: number;
    total: number;
    completed: number;
    missingFields: string[];
  }> = [];

  if (!profile) {
    return {
      overall: 0,
      sections: [],
      totalFields: 0,
      completedFields: 0,
      canSubmit: false,
    };
  }

  // Helper to check if a value is filled
  const isFilled = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object') {
      return Object.values(value).some((v) => isFilled(v));
    }
    return true;
  };

  // Documents - Only check required documents
  const documentFields = [
    {
      key: 'birthCertificate',
      value: profile.birthCertificate,
      required: true,
    },
    {
      key: 'addressProof',
      value: profile.addressProof,
      required: true,
    },
    {
      key: 'passport',
      value: profile.passport,
      required: false,
    },
  ];

  const requiredDocFields = documentFields.filter((f) => f.required);
  const requiredDocsCompleted = requiredDocFields.filter((f) => isFilled(f.value)).length;

  const documentMissing = requiredDocFields
    .filter((f) => !isFilled(f.value))
    .map((f) => f.key);

  // Completion is based on REQUIRED documents only
  const documentsCompletionPercentage = Math.round(
    (requiredDocsCompleted / requiredDocFields.length) * 100,
  );

  totalFields += requiredDocFields.length;
  completedFields += requiredDocsCompleted;

  sections.push({
    name: 'documents',
    completion: documentsCompletionPercentage,
    total: requiredDocFields.length,
    completed: requiredDocsCompleted,
    missingFields: documentMissing,
  });

  // Personal Information - Required fields
  const personalFields = [
    { key: 'firstName', value: profile.personal.firstName },
    { key: 'lastName', value: profile.personal.lastName },
    { key: 'birthDate', value: profile.personal.birthDate },
    { key: 'birthPlace', value: profile.personal.birthPlace },
    { key: 'birthCountry', value: profile.personal.birthCountry },
    { key: 'gender', value: profile.personal.gender },
    { key: 'nationality', value: profile.personal.nationality },
    // Identity picture is part of Basic Info step
    { key: 'identityPicture', value: profile.identityPicture },
  ];

  const personalCompleted = personalFields.filter((f) => isFilled(f.value)).length;
  const personalMissing = personalFields
    .filter((f) => !isFilled(f.value))
    .map((f) => f.key);
  totalFields += personalFields.length;
  completedFields += personalCompleted;
  sections.push({
    name: 'basic-info',
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
    name: 'contact-info',
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
    profile.family.maritalStatus === MaritalStatus.Married ||
    profile.family.maritalStatus === MaritalStatus.Cohabiting ||
    profile.family.maritalStatus === MaritalStatus.CivilUnion
  ) {
    familyFields.push({ key: 'spouse', value: profile.family.spouse });
  }

  const familyCompleted = familyFields.filter((f) => isFilled(f.value)).length;
  const familyMissing = familyFields.filter((f) => !isFilled(f.value)).map((f) => f.key);
  totalFields += familyFields.length;
  completedFields += familyCompleted;
  sections.push({
    name: 'family-info',
    completion: Math.round((familyCompleted / familyFields.length) * 100),
    total: familyFields.length,
    completed: familyCompleted,
    missingFields: familyMissing,
  });

  // Professional Situation
  const professionFields: Array<{ key: string; value: unknown }> = [
    { key: 'workStatus', value: profile.professionSituation.workStatus },
  ];

  // Add work-related fields if employed
  if (
    profile.professionSituation.workStatus === WorkStatus.Employee ||
    profile.professionSituation.workStatus === WorkStatus.SelfEmployed ||
    profile.professionSituation.workStatus === WorkStatus.Entrepreneur
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
    name: 'professional-info',
    completion: Math.round((professionCompleted / professionFields.length) * 100),
    total: professionFields.length,
    completed: professionCompleted,
    missingFields: professionMissing,
  });

  // Residence Country
  const hasResidenceCountry = isFilled(profile.residenceCountry);
  totalFields += 1;
  if (hasResidenceCountry) completedFields += 1;

  const overall = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  const canSubmit = overall === 100 && profile.status === ProfileStatus.Draft;

  return {
    overall,
    sections,
    totalFields,
    completedFields,
    canSubmit,
  };
}

/**
 * Maps a field path to its human-readable label using translations.
 * Handles nested paths like "address.street" by looking up "inputs.<fieldPath>.label".
 */
export function getFieldLabel(fieldPath: string, t: (key: string) => string): string {
  // Map of known field keys to their translation paths
  const fieldLabelMap: Record<string, string> = {
    firstName: 'inputs.firstName.label',
    lastName: 'inputs.lastName.label',
    birthDate: 'inputs.birthDate.label',
    birthPlace: 'inputs.birthPlace.label',
    birthCountry: 'inputs.birthCountry.label',
    gender: 'inputs.gender.label',
    nationality: 'inputs.nationality.label',
    identityPicture: 'inputs.identityPicture.label',
    passport: 'inputs.passport.label',
    birthCertificate: 'inputs.birthCertificate.label',
    residencePermit: 'inputs.residencePermit.label',
    addressProof: 'inputs.addressProof.label',
    email: 'inputs.email.label',
    phone: 'inputs.phone.label',
    address: 'inputs.address.label',
    'address.street': 'inputs.address.street.label',
    'address.city': 'inputs.address.city.label',
    'address.postalCode': 'inputs.address.postalCode.label',
    'address.country': 'inputs.address.country.label',
    maritalStatus: 'inputs.maritalStatus.label',
    father: 'inputs.fatherName.label',
    'father.firstName': 'inputs.firstName.label',
    'father.lastName': 'inputs.lastName.label',
    mother: 'inputs.motherName.label',
    'mother.firstName': 'inputs.firstName.label',
    'mother.lastName': 'inputs.lastName.label',
    spouse: 'inputs.spouseName.label',
    'spouse.firstName': 'inputs.firstName.label',
    'spouse.lastName': 'inputs.lastName.label',
    workStatus: 'inputs.workStatus.label',
    profession: 'inputs.profession.label',
    employer: 'inputs.employer.label',
    employerAddress: 'inputs.employerAddress.label',
    activityInGabon: 'inputs.activityInGabon.label',
  };

  const translationKey = fieldLabelMap[fieldPath];
  if (translationKey) {
    try {
      return t(translationKey);
    } catch {
      return fieldPath;
    }
  }

  // Handle emergency contacts (e.g. emergencyContacts.0.firstName)
  if (fieldPath.startsWith('emergencyContacts.')) {
    const parts = fieldPath.split('.');
    // parts[0] = emergencyContacts
    // parts[1] = index
    // parts[2...] = field
    if (parts.length >= 3) {
      const index = parseInt(parts[1], 10) + 1;
      const subField = parts.slice(2).join('.');

      // Map subfields to their translations
      const subFieldLabelMap: Record<string, string> = {
        firstName: 'inputs.firstName.label',
        lastName: 'inputs.lastName.label',
        relationship: 'inputs.familyLink.label',
        phoneNumber: 'inputs.phone.label',
        email: 'inputs.email.label',
        'address.street': 'inputs.address.street.label',
        'address.city': 'inputs.address.city.label',
        'address.country': 'inputs.address.country.label',
        'address.postalCode': 'inputs.address.postalCode.label',
        'address.complement': 'inputs.address.complement.label',
      };

      const subKey = subFieldLabelMap[subField];
      const label = subKey ? t(subKey) : subField;
      return `Contact d'urgence ${index} - ${label}`;
    }
    return "Contacts d'urgence";
  }

  // Fallback: try to guess based on common patterns
  return fieldPath.split('.').pop() || fieldPath;
}

/**
 * Recursively extracts all keys with errors from the errors object.
 * Returns an array of dot-notation paths like ['firstName', 'emergencyContacts.0.firstName']
 */
export function getInvalidFields(errors: any, prefix = ''): string[] {
  return Object.keys(errors).reduce((acc: string[], key) => {
    const value = errors[key];
    const path = prefix ? `${prefix}.${key}` : key;

    // React Hook Form error object has a 'message' property if it's a leaf error
    if (value && typeof value === 'object' && 'message' in value) {
      acc.push(path);
    } else if (value && typeof value === 'object') {
      // Recurse for nested objects/arrays
      acc.push(...getInvalidFields(value, path));
    }

    return acc;
  }, []);
}

export function calculateChildProfileCompletion(
  profile: Doc<'childProfiles'>,
): ProfileCompletionResult {
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

export function filterUneditedKeys<T extends Record<string, unknown>>(
  data: T,
  dirtyFields: UseFormReturn<T>['formState']['dirtyFields'],
  omit: (keyof T)[] = [],
): Partial<T> | undefined {
  if (!dirtyFields || !data) {
    return {};
  }

  const editedKeys = [...omit, ...Object.keys(dirtyFields)];

  Object.entries(data).forEach(([key]) => {
    if (!editedKeys.includes(key)) {
      delete data[key as keyof T];
    }
  });

  return data;
}

export function useDateLocale() {
  'use client';

  const locale = useLocale();

  function formatDate(
    date: Date | string | null | undefined,
    formatStr?: string,
    locale?: Locale,
    options?: DateTimeFormatOptions,
  ) {
    // Handle null, undefined, or empty string values
    if (!date) return '-';

    // Try to create a valid date
    try {
      const dateObj = new Date(date);
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) return '-';

      return format(dateObj, formatStr ?? 'PPP', {
        locale: locale ?? fr,
        ...options,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  }

  return {
    locale,
    formatDate,
  };
}

export async function safePromise<T, E = Error>(
  promise: Promise<T>,
): Promise<[E, null] | [null, T]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [error as E, null];
  }
}

export type ErrorMessageKey = keyof typeof messages.errors;

export async function tryCatch<T>(
  promise: Promise<T>,
): Promise<{ error: (Error & { message: ErrorMessageKey }) | null; data: T | null }> {
  try {
    const result = await promise;
    return { error: null, data: result };
  } catch (error) {
    return { error: error as Error & { message: ErrorMessageKey }, data: null };
  }
}

export function currentFnsLocale(localeString: string): Locale {
  switch (localeString) {
    case 'fr':
      return fr;
    case 'es':
      return es;
    default:
      return enUS;
  }
}

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param birthDate Date de naissance au format string
 * @returns L'âge en années
 */
export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;

  const today = new Date();
  const birthDateObj = new Date(birthDate);

  // Vérifier si la date est valide
  if (isNaN(birthDateObj.getTime())) return 0;

  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  // Si le mois de naissance n'est pas encore passé ou si c'est le même mois mais que le jour n'est pas encore passé
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  return age;
}

/**
 * Extrait les champs spécifiés d'un objet
 * @param object Objet source
 * @param fields Liste des champs à extraire
 * @returns Objet contenant uniquement les champs spécifiés et non null/undefined
 */
export function extractFieldsFromObject<T extends Record<string, unknown>>(
  object: T | null | undefined,
  fields: (keyof T)[],
): Partial<T> {
  if (!object) return {} as Partial<T>;

  return fields.reduce((acc, field) => {
    if (field in object && object[field] !== undefined && object[field] !== null) {
      acc[field] = object[field];
    }
    return acc;
  }, {} as Partial<T>);
}

type Valuable<T> = { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] };

export function getValuable<T extends object, V = Valuable<T>>(obj: T): V {
  if (!obj || typeof obj !== 'object') return {} as V;

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => {
        // Filter out null, undefined, and empty strings
        if (
          v === null ||
          typeof v === 'undefined' ||
          (typeof v === 'string' && !v.length)
        ) {
          return false;
        }

        // Handle objects recursively (but not arrays or dates)
        if (
          typeof v === 'object' &&
          v !== null &&
          !Array.isArray(v) &&
          !(v instanceof Date)
        ) {
          const cleanedObj = getValuable(v as object);
          // Filter out empty objects
          return Object.keys(cleanedObj).length > 0;
        }

        return true;
      })
      .map(([k, v]) => {
        // Process nested objects recursively
        if (
          typeof v === 'object' &&
          v !== null &&
          !Array.isArray(v) &&
          !(v instanceof Date)
        ) {
          return [k, getValuable(v as object)];
        }
        return [k, v];
      }),
  ) as V;
}

/**
 * Retire les valeurs nulles ou undefined d'un objet et de ses sous-objets récursivement
 * @param object Objet source
 * @returns Nouvel objet sans les valeurs nulles ou undefined
 */
export function removeNullOrUndefined<T extends Record<string, unknown>>(
  object: T,
): Partial<T> {
  const result = { ...object };

  for (const key in result) {
    if (result[key] === null || result[key] === undefined) {
      // Use type assertion to handle the type compatibility issue
      result[key] = undefined as unknown as T[Extract<keyof T, string>];
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Skip Date objects
      if (result[key] instanceof Date) {
        continue;
      }

      const cleanedValue = removeNullOrUndefined(
        result[key] as Record<string, unknown>,
      ) as T[Extract<keyof T, string>];

      // Check if the cleaned object is empty (has no properties)
      if (
        typeof cleanedValue === 'object' &&
        cleanedValue !== null &&
        !(cleanedValue instanceof Date) &&
        Object.keys(cleanedValue as object).length === 0
      ) {
        // Use type assertion to handle the type compatibility issue
        result[key] = undefined as unknown as T[Extract<keyof T, string>];
      } else {
        result[key] = cleanedValue;
      }
    }
  }

  return result;
}

/**
 * Retire récursivement les valeurs nulles ou undefined d'un objet et de ses sous-objets
 * @param object Objet source
 * @returns Nouvel objet sans les valeurs nulles ou undefined
 */
export function removeNullValues<T extends Record<string, unknown>>(
  object: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(object)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => {
        // Remove null, undefined, and empty objects
        if (value == null) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        return true;
      })
      .map(([key, value]) => [
        key,
        value && typeof value === 'object'
          ? removeNullValues(value as Record<string, unknown>)
          : value,
      ]),
  ) as Partial<T>;
}

export type PhoneParts = [CountryIndicator, string];

export function retrievePhoneNumber(phoneNumber: string): PhoneParts {
  const parts = phoneNumber.split('-') as [CountryIndicator, string];

  return parts;
}

/*
 * [Generic way to convert all instances of null to undefined in TypeScript](https://stackoverflow.com/q/50374869)
 *
 * This only works with JS objects hence the file name *Object*Values
 *
 * ["I intend to stop using `null` in my JS code in favor of `undefined`"](https://github.com/sindresorhus/meta/discussions/7)
 * [Proposal: NullToUndefined and UndefinedToNull](https://github.com/sindresorhus/type-fest/issues/603)
 *
 * Types implementation inspired by:
 * - https://github.com/sindresorhus/type-fest/blob/v2.12.2/source/delimiter-cased-properties-deep.d.ts
 * - https://github.com/sindresorhus/type-fest/blob/v2.12.2/source/readonly-deep.d.ts
 *
 * https://gist.github.com/tkrotoff/a6baf96eb6b61b445a9142e5555511a0
 */

export type NullToUndefined<T> = T extends null
  ? undefined
  : // eslint-disable-next-line
    T extends Primitive | Function | Date | RegExp
    ? T
    : T extends (infer U)[]
      ? NullToUndefined<U>[]
      : T extends Map<infer K, infer V>
        ? Map<K, NullToUndefined<V>>
        : T extends Set<infer U>
          ? Set<NullToUndefined<U>>
          : T extends object
            ? { [K in keyof T]: NullToUndefined<T[K]> }
            : unknown;

export type UndefinedToNull<T> = T extends undefined
  ? null
  : // eslint-disable-next-line
    T extends Primitive | Function | Date | RegExp
    ? T
    : T extends (infer U)[]
      ? UndefinedToNull<U>[]
      : T extends Map<infer K, infer V>
        ? Map<K, UndefinedToNull<V>>
        : T extends Set<infer U>
          ? Set<NullToUndefined<U>>
          : T extends object
            ? { [K in keyof T]: UndefinedToNull<T[K]> }
            : unknown;

function _nullToUndefined<T>(obj: T): NullToUndefined<T> {
  if (obj === null) {
    // eslint-disable-next-line
    return undefined as any;
  }

  if (typeof obj === 'object') {
    if (obj instanceof Map) {
      obj.forEach((value, key) => obj.set(key, _nullToUndefined(value)));
    } else {
      for (const key in obj) {
        // eslint-disable-next-line
        obj[key] = _nullToUndefined(obj[key]) as any;
      }
    }
  }

  // eslint-disable-next-line
  return obj as any;
}

/**
 * Recursively converts all null values to undefined.
 *
 * @param obj object to convert
 * @returns a copy of the object with all its null values converted to undefined
 */
export function nullToUndefined<
  T,
  // Can cause: "Type instantiation is excessively deep and possibly infinite."
  //extends Jsonifiable
>(obj: T) {
  return _nullToUndefined(structuredClone(obj));
}

function _undefinedToNull<T>(obj: T): UndefinedToNull<T> {
  if (obj === undefined) {
    // eslint-disable-next-line
    return null as any;
  }

  if (typeof obj === 'object') {
    if (obj instanceof Map) {
      obj.forEach((value, key) => obj.set(key, _undefinedToNull(value)));
    } else {
      for (const key in obj) {
        // eslint-disable-next-line
        obj[key] = _undefinedToNull(obj[key]) as any;
      }
    }
  }

  // eslint-disable-next-line
  return obj as any;
}

/**
 * Recursively converts all undefined values to null.
 *
 * @param obj object to convert
 * @returns a copy of the object with all its undefined values converted to null
 */
export function undefinedToNull<T>(obj: T) {
  return _undefinedToNull(structuredClone(obj));
}

/**
 * Recursively remove all undefined values
 *
 * @param obj object to convert
 * @returns a copy of the object with all its undefined values removed
 */
// eslint-disable-next-line
export function removeUndefined<T extends Record<string, any>>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((element) => removeUndefined<T>(element)) as unknown as T;
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // eslint-disable-next-line
  return Object.keys(obj).reduce((acc: any, key: string) => {
    const value = obj[key];
    if (value !== undefined) {
      acc[key] = removeUndefined<T>(value);
    }
    return acc;
  }, {});
}

export function capitalize(str: string): string {
  if (!str) return str;

  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Table utilities for handling data tables across the application
 */

/**
 * Adapts search parameters from a URL query string to a structured object
 * @param searchParams The URL search parameters
 * @returns A formatted object with pagination, sorting, and filtering parameters
 */
export function adaptTableSearchParams(searchParams: URLSearchParams | null) {
  if (!searchParams) {
    return {
      page: 1,
      limit: 10,
    };
  }

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);
  const sort = searchParams.get('sort') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  // Extract custom filter parameters (excluding standard ones)
  const params: Record<string, string | string[]> = {};
  searchParams.forEach((value, key) => {
    if (!['page', 'limit', 'sort', 'search'].includes(key)) {
      // Check if the value contains commas, indicating it should be an array
      if (value.includes(',')) {
        params[key] = value.split(',');
      } else {
        params[key] = value;
      }
    }
  });

  return {
    page,
    limit,
    sort,
    search,
    ...params,
  };
}

/**
 * Type for options when changing table parameters
 */
export type TableParamOption = {
  type: 'page' | 'limit' | 'sort' | 'filter';
  name?: string;
  value: string | number | null;
};

/**
 * Creates a function to navigate with updated URL parameters for tables
 * @param pathname Current path
 * @param router Next.js router
 * @returns A function to navigate with updated parameters
 */
export function createTableParamNavigator(
  pathname: string,
  router: { push: (url: string) => void },
) {
  return (params: URLSearchParams) => {
    const url = `${pathname}?${params.toString()}`;
    router.push(url);
  };
}

/**
 * Updates URL parameters for tables based on the provided option
 * @param queryParams Current query parameters
 * @param option The parameter option to apply
 * @param navigate Function to navigate with the updated parameters
 */
export function handleTableParamChange(
  queryParams: URLSearchParams | null,
  option: TableParamOption,
  navigate: (params: URLSearchParams) => void,
) {
  const params = new URLSearchParams(queryParams?.toString() || '');

  if (option.type === 'sort') {
    if (option.value) {
      params.set('sort', option.value.toString());
    } else {
      params.delete('sort');
    }
  } else if (option.type === 'filter') {
    if (option.name && option.value) {
      params.set(option.name, option.value.toString());
    } else if (option.name) {
      params.delete(option.name);
    }
  } else {
    if (option.value) {
      params.set(option.type, option.value.toString());
    } else {
      params.delete(option.type);
    }
  }
  // Use setTimeout to avoid React update during render errors
  setTimeout(() => navigate(params), 0);
}

/**
 * Creates a function to handle sorting changes
 * @param handleParamChange Function to handle parameter changes
 * @returns A function to handle sorting changes
 */
export function createSortHandler(handleParamChange: (option: TableParamOption) => void) {
  return (property: string, direction: string) => {
    handleParamChange({ type: 'sort', value: `${property}-${direction}` });
  };
}

/**
 * Creates a function to handle page changes
 * @param handleParamChange Function to handle parameter changes
 * @returns A function to handle page changes
 */
export function createPageHandler(handleParamChange: (option: TableParamOption) => void) {
  return (pageIndex: number) => {
    handleParamChange({ type: 'page', value: pageIndex });
  };
}

/**
 * Creates a function to handle page size changes
 * @param handleParamChange Function to handle parameter changes
 * @returns A function to handle page size changes
 */
export function createLimitHandler(
  handleParamChange: (option: TableParamOption) => void,
) {
  return (limit: number) => {
    handleParamChange({ type: 'limit', value: limit });
  };
}

/**
 * Downloads files as a zip archive
 * @param items Array of items with url and name properties
 * @param setIsLoading Function to set loading state
 */
export async function downloadFilesAsZip(
  items: Array<{ url: string; name: string }>,
  setIsLoading: (isLoading: boolean) => void,
) {
  const JSZip = await import('jszip').then((mod) => mod.default);
  setIsLoading(true);
  const zip = new JSZip();

  try {
    // Create an array of promises for fetching files
    const filePromises = items.map(async (item) => {
      const { url, name } = item;
      if (!url) return null;

      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'same-origin',
        });

        if (!response.ok) {
          console.error(
            `Error fetching ${url}: ${response.status} ${response.statusText}`,
          );
          return null;
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          console.error('Empty blob received for:', name);
          return null;
        }

        // Determine file extension based on blob type
        let extension = '.jpg'; // Default
        if (blob.type) {
          const mimeType = blob.type.toLowerCase();
          if (mimeType.includes('png')) {
            extension = '.png';
          } else if (mimeType.includes('gif')) {
            extension = '.gif';
          } else if (mimeType.includes('webp')) {
            extension = '.webp';
          } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
            extension = '.jpg';
          } else if (mimeType.includes('svg')) {
            extension = '.svg';
          } else if (mimeType.includes('bmp')) {
            extension = '.bmp';
          } else if (mimeType.includes('pdf')) {
            extension = '.pdf';
          }
        }

        // Ensure the filename has no path separators
        // Get only the filename part without any directory structure
        const cleanedName = name.split(/[\\/]/).pop() || name;
        const fileNameWithExt = `${cleanedName}${extension}`;

        return { fileName: fileNameWithExt, blob };
      } catch (error) {
        console.error(`Error downloading ${url}:`, error);
        return null;
      }
    });

    const files = (await Promise.all(filePromises)).filter(Boolean);

    // Add each file to the zip file
    files.forEach((file) => {
      if (file) {
        zip.file(file.fileName, file.blob);
      }
    });

    // Generate the zip file
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Create a download link and trigger the download
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `export-${dateStr}_${timeStr}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error creating zip file:', error);
  } finally {
    setIsLoading(false);
  }
}

export function getOrganizationIdFromUser(currentUser: any | null): string | undefined {
  if (!currentUser) {
    return undefined;
  }

  if (currentUser.roles.includes('SUPER_ADMIN')) {
    return undefined;
  }

  if (currentUser.organizationId) {
    return currentUser.organizationId;
  }

  if (currentUser.assignedOrganizationId) {
    return currentUser.assignedOrganizationId;
  }

  return undefined;
}

export const getOrganizationFromId = (
  organisations: OrganizationListItem[],
  organizationId: string | null,
) => {
  if (!organizationId) return undefined;
  return organisations.find((o) => o._id === organizationId);
};

export function getDashboardUrl(user: Doc<'users'> | null) {
  const dashboardUrl: Record<UserRole, string> = {
    [UserRole.Admin]: ROUTES.dashboard.base,
    [UserRole.Agent]: ROUTES.dashboard.base,
    [UserRole.Manager]: ROUTES.dashboard.base,
    [UserRole.SuperAdmin]: ROUTES.dashboard.base,
    [UserRole.IntelAgent]: ROUTES.intel.base,
    [UserRole.User]: ROUTES.user.base,
    [UserRole.EducationAgent]: ROUTES.dashboard.base,
  };
  if (!user) {
    return ROUTES.user.base;
  }
  if (!user?.roles) {
    return ROUTES.user.base;
  }

  return dashboardUrl[user?.roles[0] as UserRole];
}
