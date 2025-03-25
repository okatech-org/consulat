import { z } from 'zod';

export enum TranscriptDocumentType {
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  MARRIAGE_CERTIFICATE = 'MARRIAGE_CERTIFICATE',
  DEATH_CERTIFICATE = 'DEATH_CERTIFICATE',
}

export const TranscriptDocumentSchema = z.object({
  // Document information
  documentType: z.nativeEnum(TranscriptDocumentType),
  documentDate: z.date(),
  issuingCountry: z.string().min(1),
  issuingAuthority: z.string().min(1),
  originalLanguage: z.string().min(1),

  // Requester information
  requesterName: z.string().min(1),
  birthDate: z.date(),
  birthPlace: z.string().min(1),
  relationship: z.string().min(1),

  // Additional information
  additionalNotes: z.string().optional(),
});

export type TranscriptDocumentInput = z.infer<typeof TranscriptDocumentSchema>;
