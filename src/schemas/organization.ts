import { z } from 'zod';
import { Organization } from '@/types/organization';
import { OrganizationType, OrganizationStatus } from '@prisma/client';
import { Country } from '@/types/country';
import { EmailSchema, PhoneSchema, PictureFileSchema } from '@/schemas/inputs';
import { CountryCode } from '@/lib/autocomplete-datas';

export const organizationSchema = z.object({
  name: z.string().min(1, 'messages.errors.name_required'),
  type: z.nativeEnum(OrganizationType),
  status: z.nativeEnum(OrganizationStatus),
  countryIds: z
    .array(z.nativeEnum(CountryCode))
    .min(1, 'messages.errors.countries_required'),
  adminEmail: z.string().email('messages.errors.invalid_email'),
});

export type CreateOrganizationInput = z.infer<typeof organizationSchema>;

export const updateOrganizationSchema = organizationSchema
  .partial()
  .omit({ adminEmail: true });

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

const TimeSlotSchema = z
  .object({
    start: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'messages.errors.invalid_time_format')
      .min(1, 'messages.errors.required'),
    end: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'messages.errors.invalid_time_format')
      .min(1, 'messages.errors.required'),
  })
  .optional();

const DayScheduleSchema = z
  .object({
    isOpen: z.boolean().default(false),
    slots: z.array(TimeSlotSchema).default([]),
  })
  .optional();

const ScheduleSchema = z
  .object({
    monday: DayScheduleSchema,
    tuesday: DayScheduleSchema,
    wednesday: DayScheduleSchema,
    thursday: DayScheduleSchema,
    friday: DayScheduleSchema,
    saturday: DayScheduleSchema,
    sunday: DayScheduleSchema,
  })
  .optional();

const AddressSchema = z
  .object({
    firstLine: z.string().min(1, 'messages.errors.address_line_required').optional(),
    secondLine: z.string().optional(),
    city: z.string().min(1, 'messages.errors.city_required').optional(),
    zipCode: z.string().min(1, 'messages.errors.zipcode_required').optional(),
    country: z.string().min(1, 'messages.errors.country_required').optional(),
  })
  .optional();

const ContactSchema = z
  .object({
    address: AddressSchema,
    phone: PhoneSchema.optional(),
    email: EmailSchema.optional(),
    website: z.string().url('messages.errors.invalid_url').optional(),
  })
  .optional();

const HolidaySchema = z
  .object({
    date: z.string().min(1, 'messages.errors.date_required').optional(),
    name: z.string().min(1, 'messages.errors.name_required').optional(),
  })
  .optional();

const ClosureSchema = z
  .object({
    start: z.string().min(1, 'messages.errors.start_date_required').optional(),
    end: z.string().min(1, 'messages.errors.end_date_required').optional(),
    reason: z.string().min(1, 'messages.errors.reason_required').optional(),
  })
  .optional();

const CountrySettingsSchema = z.object({
  settings: z
    .object({
      logo: z.string().optional(),
      logoFile: z.any().optional(),
      contact: ContactSchema,
      schedule: ScheduleSchema,
      holidays: z.array(HolidaySchema).optional().default([]),
      closures: z.array(ClosureSchema).optional().default([]),
      consularCard: z
        .object({
          rectoModelUrl: z.string().optional(),
          versoModelUrl: z.string().optional(),
          rectoModel: PictureFileSchema.optional(),
          versoModel: PictureFileSchema.optional(),
        })
        .optional(),
    })
    .optional(),
});

export function generateOrganizationSettingsSchema(countries: Country[]) {
  const metadataShape: Record<CountryCode, typeof CountrySettingsSchema> = {} as Record<
    CountryCode,
    typeof CountrySettingsSchema
  >;

  countries.forEach((country) => {
    metadataShape[country.code as CountryCode] = CountrySettingsSchema;
  });

  return z.object({
    name: z.string().min(1, 'messages.errors.name_required'),
    logo: z.string().optional(),
    logoFile: z.any().optional(),
    type: z.nativeEnum(OrganizationType).optional(),
    status: z.nativeEnum(OrganizationStatus).optional(),
    countryIds: z
      .array(z.nativeEnum(CountryCode))
      .min(1, 'messages.errors.countries_required'),
    metadata: z.object(metadataShape).optional(),
  });
}

// Type pour les données du formulaire
export type OrganizationSettingsFormData = z.infer<
  ReturnType<typeof generateOrganizationSettingsSchema>
>;

export function getDefaultValues(
  organization: Organization,
): OrganizationSettingsFormData {
  const defaultSchedule = {
    isOpen: false,
    slots: [
      {
        start: '09:00',
        end: '17:00',
      },
    ],
  };

  const defaultMetadata = organization.countries.reduce(
    (acc, country) => {
      // Récupérer les données existantes pour ce pays
      const existingCountryData = organization.metadata?.[country.code]?.settings;

      acc[country.code] = {
        settings: {
          logo: existingCountryData?.logo ?? undefined,
          contact: {
            address: {
              firstLine: existingCountryData?.contact?.address?.firstLine ?? undefined,
              secondLine: existingCountryData?.contact?.address?.secondLine ?? undefined,
              city: existingCountryData?.contact?.address?.city ?? undefined,
              zipCode: existingCountryData?.contact?.address?.zipCode ?? undefined,
              country: country.name.toLowerCase(),
            },
            phone: existingCountryData?.contact?.phone ?? undefined,
            email: existingCountryData?.contact?.email ?? undefined,
            website: existingCountryData?.contact?.website ?? undefined,
          },
          schedule: {
            monday: existingCountryData?.schedule?.monday || defaultSchedule,
            tuesday: existingCountryData?.schedule?.tuesday || defaultSchedule,
            wednesday: existingCountryData?.schedule?.wednesday || defaultSchedule,
            thursday: existingCountryData?.schedule?.thursday || defaultSchedule,
            friday: existingCountryData?.schedule?.friday || defaultSchedule,
            saturday: existingCountryData?.schedule?.saturday || defaultSchedule,
            sunday: existingCountryData?.schedule?.sunday || defaultSchedule,
          },
          holidays: existingCountryData?.holidays || [],
          closures: existingCountryData?.closures || [],
          consularCard: existingCountryData?.consularCard ?? undefined,
        },
      };
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return {
    name: organization.name ?? undefined,
    logo: organization.logo ?? undefined,
    logoFile: undefined,
    countryIds: organization.countries.map((c) => c.id) ?? [],
    type: organization.type,
    status: organization.status,
    metadata: defaultMetadata,
  };
}

export interface OrganizationMetadataTimeSlot {
  start: string;
  end: string;
}

export interface OrganizationMetadataDaySchedule {
  isOpen: boolean;
  slots?: OrganizationMetadataTimeSlot[];
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type OrganizationMetadataSchedule = Record<
  WeekDay,
  OrganizationMetadataDaySchedule
>;

export interface OrganizationMetadataHoliday {
  date: string;
  name: string;
}

export interface OrganizationMetadataAddress {
  firstLine: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface OrganizationMetadataContact {
  address: OrganizationMetadataAddress;
  phone: string;
  email: string;
  website: string;
}

export interface OrganizationMetadataSettings {
  logo: string | null;
  contact: OrganizationMetadataContact;
  schedule: OrganizationMetadataSchedule;
  holidays: OrganizationMetadataHoliday[];
  consularCard: {
    rectoModelUrl?: string;
    versoModelUrl?: string;
    rectoModel?: any;
    versoModel?: any;
  } | null;
}

export interface CountryMetadataCurrency {
  code: string;
  symbol: string;
  format: string;
  symbolPosition: 'before' | 'after';
}

export interface CountryMetadataLanguage {
  defaultLocale: string;
  locales: string[];
}

export interface CountryMetadata {
  currency: CountryMetadataCurrency;
  language: CountryMetadataLanguage;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timeZone: string;
  holidays?: OrganizationMetadataHoliday[];
}

export interface OrganizationMetadata {
  [countryCode: string]: {
    settings: OrganizationMetadataSettings;
  };
}

export interface OrganizationCountryInfos extends Organization {
  settings: OrganizationMetadataSettings;
}
