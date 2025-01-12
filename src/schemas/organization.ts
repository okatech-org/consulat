import { z } from 'zod'
import { OrganizationType, OrganizationStatus } from '@prisma/client'

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