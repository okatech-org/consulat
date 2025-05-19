import { z } from 'zod';
import { DocumentType } from '@prisma/client';

export const CreateDocumentTemplateSchema = z.object({
  name: z
    .string({
      required_error: 'messages.errors.field_required',
    })
    .min(2, 'messages.errors.field_too_short')
    .max(100, 'messages.errors.field_too_long'),

  description: z.string().optional(),

  type: z.nativeEnum(DocumentType, {
    required_error: 'messages.errors.field_required',
  }),

  content: z.record(z.any()).optional(),

  metadata: z.record(z.any()).optional(),

  organizationId: z.string({
    required_error: 'messages.errors.field_required',
  }),
});

export type CreateDocumentTemplateInput = z.infer<typeof CreateDocumentTemplateSchema>;
