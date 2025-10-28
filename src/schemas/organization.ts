import { z } from 'zod';
import { Organization } from '@/convex/lib/types';
import { OrganizationType, OrganizationStatus } from '@/convex/lib/constants';
import { EmailSchema, PhoneSchema } from '@/schemas/inputs';

export const organizationSchema = z.object({
  name: z.string().min(1, 'messages.errors.name_required'),
  code: z.string().optional(),
  type: z.nativeEnum(OrganizationType),
  status: z.nativeEnum(OrganizationStatus),
  countryIds: z.array(z.string()).min(1, 'messages.errors.countries_required'),
  adminEmail: z.string().email('messages.errors.invalid_email'),
});

export type CreateOrganizationInput = z.infer<typeof organizationSchema>;

export const updateOrganizationSchema = organizationSchema
  .partial()
  .omit({ adminEmail: true });

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

// Time slot for schedule
const TimeSlotSchema = z.object({
  start: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'messages.errors.invalid_time_format')
    .min(1, 'messages.errors.required'),
  end: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'messages.errors.invalid_time_format')
    .min(1, 'messages.errors.required'),
});

// Day schedule
const DayScheduleSchema = z.object({
  isOpen: z.boolean().default(false),
  slots: z.array(TimeSlotSchema).default([]),
});

// Weekly schedule
const ScheduleSchema = z.object({
  monday: DayScheduleSchema,
  tuesday: DayScheduleSchema,
  wednesday: DayScheduleSchema,
  thursday: DayScheduleSchema,
  friday: DayScheduleSchema,
  saturday: DayScheduleSchema,
  sunday: DayScheduleSchema,
});

// Address
const AddressSchema = z.object({
  street: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

// Contact info
const ContactSchema = z.object({
  address: AddressSchema.optional(),
  phone: PhoneSchema.optional(),
  email: EmailSchema.optional(),
  website: z.string().url('messages.errors.invalid_url').optional().or(z.literal('')),
});

// Holiday (stored as object in form, converted to timestamp on submit)
const HolidaySchema = z.object({
  date: z.string().min(1, 'messages.errors.date_required'),
  name: z.string().min(1, 'messages.errors.name_required'),
});

// Closure (stored as object in form, converted to timestamp on submit)
const ClosureSchema = z.object({
  start: z.string().min(1, 'messages.errors.start_date_required'),
  end: z.string().min(1, 'messages.errors.end_date_required'),
  reason: z.string().min(1, 'messages.errors.reason_required'),
});

// Consular card configuration
const ConsularCardSchema = z.object({
  rectoModelUrl: z.string().optional(),
  versoModelUrl: z.string().optional(),
});

// Country-specific settings (matches Convex structure)
const CountrySettingsSchema = z.object({
  countryCode: z.string(),
  contact: ContactSchema.optional(),
  schedule: ScheduleSchema.optional(),
  holidays: z.array(HolidaySchema).default([]),
  closures: z.array(ClosureSchema).default([]),
  consularCard: ConsularCardSchema.optional(),
});

// Main organization settings form schema
export const organizationSettingsSchema = z.object({
  name: z.string().min(1, 'messages.errors.name_required'),
  logo: z.string().optional(),
  type: z.nativeEnum(OrganizationType),
  status: z.nativeEnum(OrganizationStatus),
  countryCodes: z.array(z.string()).min(1, 'messages.errors.countries_required'),
  settings: z.array(CountrySettingsSchema),
});

export type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>;

// Helper function to get default values from organization
export function getDefaultValues(
  organization: Organization | null,
): OrganizationSettingsFormData {
  if (!organization) {
    throw new Error('Organization is required');
  }

  const defaultSchedule: z.infer<typeof DayScheduleSchema> = {
    isOpen: false,
    slots: [
      {
        start: '09:00',
        end: '17:00',
      },
    ],
  };

  const defaultWeeklySchedule: z.infer<typeof ScheduleSchema> = {
    monday: defaultSchedule,
    tuesday: defaultSchedule,
    wednesday: defaultSchedule,
    thursday: defaultSchedule,
    friday: defaultSchedule,
    saturday: defaultSchedule,
    sunday: defaultSchedule,
  };

  // Transform settings from Convex format to form format
  const settings = (organization.countryCodes || []).map((countryCode) => {
    const existingSettings = organization.settings?.find(
      (s) => s.countryCode === countryCode,
    );

    return {
      countryCode: countryCode as string,
      contact: existingSettings?.contact
        ? {
            address: existingSettings.contact.address
              ? {
                  street: existingSettings.contact.address.street,
                  complement: existingSettings.contact.address.complement,
                  city: existingSettings.contact.address.city,
                  postalCode: existingSettings.contact.address.postalCode,
                  country: existingSettings.contact.address.country as string,
                }
              : undefined,
            phone: existingSettings.contact.phone,
            email: existingSettings.contact.email,
            website: existingSettings.contact.website,
          }
        : undefined,
      schedule: existingSettings?.schedule || defaultWeeklySchedule,
      // Convert timestamps back to date/name objects for holidays
      holidays:
        existingSettings?.holidays?.map((timestamp) => {
          const date = new Date(timestamp);
          return {
            date: date.toISOString().split('T')[0] || '',
            name: '', // We don't store names in the new structure, so default to empty
          };
        }) || [],
      // Convert timestamps back to date/reason objects for closures
      closures:
        existingSettings?.closures?.map((timestamp) => {
          const date = new Date(timestamp);
          return {
            start: date.toISOString().split('T')[0] || '',
            end: date.toISOString().split('T')[0] || '',
            reason: '', // We don't store reasons in the new structure, so default to empty
          };
        }) || [],
      consularCard: existingSettings?.consularCard,
    };
  });

  return {
    name: organization.name,
    logo: organization.logo,
    type: organization.type,
    status: organization.status,
    countryCodes: organization.countryCodes || [],
    settings,
  };
}

// Type exports for use in components
export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type DaySchedule = z.infer<typeof DayScheduleSchema>;
export type WeeklySchedule = z.infer<typeof ScheduleSchema>;
export type Holiday = z.infer<typeof HolidaySchema>;
export type Closure = z.infer<typeof ClosureSchema>;
export type CountrySettings = z.infer<typeof CountrySettingsSchema>;
