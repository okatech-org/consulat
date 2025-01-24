import { z } from 'zod';
import { DocumentFileSchema } from './inputs';

export const ProfileDocumentsSchema = z.object({
  passportFile: DocumentFileSchema,
  birthCertificateFile: DocumentFileSchema,
  residencePermitFile: DocumentFileSchema.optional(),
  addressProofFile: DocumentFileSchema,
});

export type ProfileDocumentsFormData = z.infer<typeof ProfileDocumentsSchema>;
