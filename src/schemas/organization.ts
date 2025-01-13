import { z } from 'zod'
import { OrganizationType, OrganizationStatus } from '@prisma/client'
import { Country } from '@/types/country'
import { AddressSchema, EmailSchema, PhoneSchema, PictureFileSchema } from '@/schemas/inputs'

export const organizationSchema = z.object({
  name: z.string().min(1, 'messages.errors.name_required'),
  type: z.nativeEnum(OrganizationType),
  status: z.nativeEnum(OrganizationStatus),
  countryIds: z.array(z.string()).min(1, 'messages.errors.countries_required'),
  adminEmail: z.string().email('messages.errors.invalid_email')
})

export type CreateOrganizationInput = z.infer<typeof organizationSchema>

export const updateOrganizationSchema = organizationSchema.partial().omit({ adminEmail: true })

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>

// Schémas de base
const ContactSchema = z.object({
  address: AddressSchema,
  phone: PhoneSchema,
  email: EmailSchema,
  website: z.string().url("messages.errors.invalid_url").optional(),
})

const ScheduleSchema = z.object({
  monday: z.object({
    open: z.string().min(1, "messages.errors.required"),
    close: z.string().min(1, "messages.errors.required"),
  }),
  tuesday: z.object({
    open: z.string().min(1, "messages.errors.required"),
    close: z.string().min(1, "messages.errors.required"),
  }),
  wednesday: z.object({
    open: z.string().min(1, "messages.errors.required"),
    close: z.string().min(1, "messages.errors.required"),
  }),
  thursday: z.object({
    open: z.string().min(1, "messages.errors.required"),
    close: z.string().min(1, "messages.errors.required"),
  }),
  friday: z.object({
    open: z.string().min(1, "messages.errors.required"),
    close: z.string().min(1, "messages.errors.required"),
  }),
  saturday: z.object({
    open: z.string().min(1, "messages.errors.required"),
    close: z.string().min(1, "messages.errors.required"),
  }),
  sunday: z.object({
    open: z.string().min(1, "messages.errors.required"),
    close: z.string().min(1, "messages.errors.required"),
  }),
})

const HolidaySchema = z.object({
  date: z.string().min(1, "messages.errors.required"),
  name: z.string().min(1, "messages.errors.required"),
})

const ClosureSchema = z.object({
  start: z.string().min(1, "messages.errors.required"),
  end: z.string().min(1, "messages.errors.required"),
  reason: z.string().min(1, "messages.errors.required"),
})

const CountrySettingsSchema = z.object({
  settings: z.object({
    logo: z.string().url("messages.errors.invalid_url").optional(),
    contact: ContactSchema,
    schedule: ScheduleSchema,
    holidays: z.array(HolidaySchema),
    closures: z.array(ClosureSchema),
  }),
})

// Fonction pour générer le schéma dynamiquement
export function generateOrganizationSettingsSchema(countries: Country[]) {
  // Créer un objet pour le schéma metadata
  const metadataShape: Record<string, z.ZodTypeAny> = {}

  // Ajouter chaque pays au schéma
  countries.forEach(country => {
    metadataShape[country.code] = CountrySettingsSchema
  })

  // Retourner le schéma complet
  return z.object({
    name: z.string().min(1, "messages.errors.required"),
    logo: z.string().url("messages.errors.invalid_url").optional(),
    logoFile: PictureFileSchema.optional(),
    metadata: z.object(metadataShape),
  })
}

// Type pour les données du formulaire
export type OrganizationSettingsFormData = z.infer<ReturnType<typeof generateOrganizationSettingsSchema>>

export function getDefaultValues(countries: Country[]): OrganizationSettingsFormData {
  const defaultSchedule = {
    open: "09:00",
    close: "17:00",
  }

  const defaultMetadata = countries.reduce((acc, country) => {
    acc[country.code] = {
      settings: {
        logo: "",
        contact: {
          address: {
            firstLine: "",
            secondLine: "",
            city: "",
            zipCode: "",
            country: country.name.toLowerCase()
          },
          phone: "",
          email: "",
          website: "",
        },
        schedule: {
          monday: defaultSchedule,
          tuesday: defaultSchedule,
          wednesday: defaultSchedule,
          thursday: defaultSchedule,
          friday: defaultSchedule,
          saturday: defaultSchedule,
          sunday: defaultSchedule,
        },
        holidays: [],
        closures: [],
      },
    }
    return acc
    // eslint-disable-next-line
  }, {} as Record<string, any>)

  return {
    name: "",
    logo: "",
    metadata: defaultMetadata,
  }
}