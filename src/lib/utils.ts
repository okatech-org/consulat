import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Profile } from '@prisma/client';
import { phoneCountries } from '@/lib/autocomplete-datas';
import { FullProfile } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { DateTimeFormatOptions, useLocale } from 'next-intl';
import { es, fr, enUS, Locale } from 'date-fns/locale';
import { format } from 'date-fns';
import messages from '@/i18n/messages/fr/messages';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type VCardData = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  emails?: { value: string }[];
  phones?: { value: string }[];
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
      vCardString += `TEL;type=CELL;type=VOICE;type=pref:${phone.value}\n`;
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

export const APP_NAME = 'Consulat';
export const APP_DEFAULT_TITLE = 'Consulat - Les services consulaires à votre portée';
export const APP_TITLE_TEMPLATE = '%s - Consulat';
export const APP_DESCRIPTION =
  "Consulat vous permet de partager vos informations de contact simplement et sans contact par QR Code, en NFC ou en lien direct. Vous pouvez aussi acceder à un vaste réseau de professionnels et d'entreprises gabonais.";

export type CountryItem = {
  name: string;
  code: string;
  flag?: string;
};

export async function getApiCountries(): Promise<CountryItem[]> {
  const response = await fetch(
    'https://countryapi.io/api/all?apikey=RE7Qb252spEs0eBJvTemFwaH4SE0C5lcmyzYuwkX',
  );

  const data = await response.json();

  return data.map((country: { name: { common: string }; cca2: string }) => ({
    name: country.name.common,
    code: country.cca2,
  }));
}

export async function getCountryCode(name: string): Promise<string | null> {
  const response = await fetch(
    `https://restcountries.com/v3.1/name/${name}?fields=name,cca2`,
  );
  const data = await response.json();

  return data[0]?.cca2 ?? name;
}

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
  name: string;
  description: string;
  required?: boolean;
  type?: 'string' | 'date' | 'address';
}

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

export interface ProfileFieldStatus {
  required: {
    total: number;
    completed: number;
    fields: Array<{
      key: keyof FullProfile;
      completed: boolean;
    }>;
  };
  optional: {
    total: number;
    completed: number;
    fields: Array<{
      key: keyof FullProfile;
      completed: boolean;
    }>;
  };
}

const profileFields: Array<keyof FullProfile> = [
  'firstName',
  'lastName',
  'birthDate',
  'nationality',
  'gender',
  'identityPicture',
  'passport',
  'birthCertificate',
  'phoneId',
  'address',
  'addressProof',
  'residentContact',
  'homeLandContact',
  'maritalStatus',
  'activityInGabon',
  'workStatus',
  'fatherFullName',
  'motherFullName',
] as const;

const childProfileFields = [
  { key: 'firstName', name: 'first_name' },
  { key: 'lastName', name: 'last_name' },
  { key: 'birthDate', name: 'birth_date' },
  { key: 'nationality', name: 'nationality' },
  { key: 'gender', name: 'gender' },
  { key: 'identityPicture', name: 'identity_photo' },
  { key: 'birthCertificate', name: 'birth_certificate' },
] as const;

export function getProfileFieldsStatus(profile: FullProfile | null): ProfileFieldStatus {
  if (!profile) {
    return {
      required: { total: 0, completed: 0, fields: [] },
      optional: { total: 0, completed: 0, fields: [] },
    };
  }

  const requiredFields = [...profileFields];

  if (profile.workStatus === 'EMPLOYEE') {
    requiredFields.push('employer');
    requiredFields.push('profession');
    requiredFields.push('employerAddress');
  }

  if (profile.maritalStatus === 'MARRIED' || profile.maritalStatus === 'COHABITING') {
    requiredFields.push('spouseFullName');
  }

  const requiredStatus = requiredFields.map((field) => ({
    key: field,
    completed: !!profile[field],
  }));

  return {
    required: {
      total: requiredFields.length,
      completed: requiredStatus.filter((f) => f.completed).length,
      fields: requiredStatus.sort((a, b) =>
        a.completed === b.completed ? 0 : a.completed ? 1 : -1,
      ),
    },
    optional: {
      total: 0,
      completed: 0,
      fields: [],
    },
  };
}

export function getChildProfileFieldsStatus(profile: Profile | null): ProfileFieldStatus {
  if (!profile) {
    return {
      required: { total: 0, completed: 0, fields: [] },
      optional: { total: 0, completed: 0, fields: [] },
    };
  }

  const requiredFields = [...childProfileFields];

  const requiredStatus = requiredFields.map((field) => ({
    ...field,
    completed: !!profile[field.key as keyof Profile],
  }));

  return {
    required: {
      total: requiredFields.length,
      completed: requiredStatus.filter((f) => f.completed).length,
      fields: requiredStatus.sort((a, b) =>
        a.completed === b.completed ? 0 : a.completed ? 1 : -1,
      ),
    },
    optional: {
      total: 0,
      completed: 0,
      fields: [],
    },
  };
}

export const extractNumber = (
  fullPhoneNumber: string | { countryCode: string; number: string },
) => {
  // Si c'est déjà un objet avec countryCode et number, le retourner tel quel
  if (
    typeof fullPhoneNumber === 'object' &&
    fullPhoneNumber.countryCode &&
    fullPhoneNumber.number
  ) {
    return {
      countryCode: fullPhoneNumber.countryCode,
      number: fullPhoneNumber.number,
    };
  }

  // Si c'est une chaîne, la traiter
  if (typeof fullPhoneNumber === 'string') {
    const countryCodes = phoneCountries.map((country) => country.value);
    let countryCode = '';
    let number = fullPhoneNumber;

    for (const code of countryCodes) {
      if (fullPhoneNumber.startsWith(code)) {
        countryCode = code;
        number = fullPhoneNumber.slice(code.length).trim();
        break;
      }
    }

    return { countryCode, number };
  }

  // Valeur par défaut si le format n'est pas reconnu
  return {
    countryCode: '',
    number: '',
  };
};

export function calculateProfileCompletion(profile: FullProfile | null): number {
  if (!profile) return 0;

  const requiredFields = [...profileFields];

  if (profile.workStatus === 'EMPLOYEE') {
    requiredFields.push('employer');
    requiredFields.push('profession');
    requiredFields.push('employerAddress');
  }

  if (profile.maritalStatus === 'MARRIED' || profile.maritalStatus === 'COHABITING') {
    requiredFields.push('spouseFullName');
  }

  const completedRequired = requiredFields.filter(
    (field) => profile[field] !== null && profile[field] !== '',
  ).length;

  const totalWeight = requiredFields.length;
  return Math.round((completedRequired / totalWeight) * 100);
}

export function calculateChildProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0;

  const requiredFields = [...childProfileFields];

  const completedRequired = requiredFields
    .map((item) => item.key)
    .filter(
      (field) =>
        profile[field as keyof Profile] !== null &&
        profile[field as keyof Profile] !== '',
    ).length;

  const totalWeight = requiredFields.length;
  return Math.round((completedRequired / totalWeight) * 100);
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
    date: Date | string,
    formatStr?: string,
    locale?: Locale,
    options?: DateTimeFormatOptions,
  ) {
    return format(new Date(date), formatStr ?? 'PPP', {
      locale: locale ?? fr,
      ...options,
    });
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
 * @returns Objet contenant uniquement les champs spécifiés
 */
export function extractFieldsFromObject<T extends Record<string, unknown>>(
  object: T,
  fields: (keyof T)[],
): Partial<T> {
  return fields.reduce((acc, field) => {
    acc[field] = object[field];
    return acc;
  }, {} as Partial<T>);
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
