import { z } from 'zod'

export const countrySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  code: z.string().min(2, 'Le code pays doit contenir exactement 2 caractères'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  flag: z.string().nullable().optional()
})