import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const FileSchema = z
  .any()
  .refine((file) => file?.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
  .refine(
    (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
    'Only .jpg, .png, .pdf files are accepted',
  );

export const DocumentsSchema = z.object({
  documents: z.record(z.string(), FileSchema),
});
