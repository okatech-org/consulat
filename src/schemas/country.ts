import { z } from 'zod';

export const countrySchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  code: z.string().min(2, 'Le code pays doit contenir exactement 2 caractères'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  flag: z.string().nullable().optional(),
  metadata: z
    .object({
      currencyCode: z.string().optional(),
      currencySymbol: z.string().optional(),
      currencyFormat: z.string().optional(),
      currencySymbolPosition: z.enum(['before', 'after']).optional(),
      defaultLocale: z.string().optional(),
      locales: z.array(z.string()).optional(),
      dateFormat: z.string().optional(),
      timeFormat: z.string().optional(),
      timeZone: z.string().optional(),
      addressFormatFieldsOrder: z.array(z.string()).optional(),
      addressFormatRequiredFields: z.array(z.string()).optional(),
      holidays: z
        .array(
          z.object({
            date: z.string().optional(),
            name: z.string().optional(),
          }),
        )
        .optional(),
    })
    .nullable()
    .optional(),
});

export type CountrySchemaInput = z.infer<typeof countrySchema>;
