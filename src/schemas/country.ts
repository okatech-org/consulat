import { CountryCode, CountryStatus } from '@/convex/lib/constants';
import { z } from 'zod';

export const countrySchema = z.object({
  countryId: z.string().optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  code: z.enum(CountryCode),
  status: z.enum(CountryStatus).default(CountryStatus.Active),
  flag: z.string().nullable().optional(),
});

export type CountrySchemaInput = z.infer<typeof countrySchema>;
