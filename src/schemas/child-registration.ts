import * as z from 'zod';
import { ParentalRole } from '@prisma/client';
import { BasicInfoSchema } from './registration';

// Définir les schémas pour les fichiers, similaires à ceux dans registration.ts
const FileListSchema = z.any().refine((files) => {
  // Si on est côté serveur, on skip la validation
  if (typeof window === 'undefined') return true;
  // Si pas de fichier, on retourne false pour déclencher la validation required
  if (!files) return false;
  // Si c'est une FileList, c'est valide
  if (files instanceof FileList) return true;
  // Si c'est déjà un File, c'est valide
  if (files instanceof File) return true;
  // Sinon invalide
  return false;
}, 'messages.errors.doc_invalid');

const DocumentFileSchema = z
  .union([
    // Soit null/undefined
    z.null(),
    // Soit un fichier valide
    FileListSchema.refine(
      (files) => {
        if (typeof window === 'undefined') return true;
        if (!files) return false;
        const file = files instanceof FileList ? files[0] : files;
        if (!file) return false;
        return file.size <= 10 * 1024 * 1024; // 10MB
      },
      { message: 'messages.errors.doc_size_10' },
    ).refine(
      (files) => {
        if (typeof window === 'undefined') return true;
        if (!files) return false;
        const file = files instanceof FileList ? files[0] : files;
        if (!file) return false;
        const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        return acceptedTypes.includes(file.type);
      },
      { message: 'messages.errors.doc_type_image_pdf' },
    ),
  ])
  .refine(
    (files) => {
      // Cette validation vérifie si le fichier est requis
      if (typeof window === 'undefined') return true;
      return files !== null && files !== undefined;
    },
    { message: 'messages.errors.doc_required' },
  );

const DocumentFileSchemaOptional = z.union([
  z.null(),
  FileListSchema.refine(
    (files) => {
      if (typeof window === 'undefined') return true;
      if (!files) return true; // Optionnel donc null/undefined est valide
      const file = files instanceof FileList ? files[0] : files;
      if (!file) return true;
      return file.size <= 10 * 1024 * 1024;
    },
    { message: 'messages.errors.doc_size_10' },
  ).refine(
    (files) => {
      if (typeof window === 'undefined') return true;
      if (!files) return true;
      const file = files instanceof FileList ? files[0] : files;
      if (!file) return true;
      const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      return acceptedTypes.includes(file.type);
    },
    { message: 'messages.errors.doc_type_image_pdf' },
  ),
]);

export const LinkFormSchema = z.object({
  parentRole: z.nativeEnum(ParentalRole, {
    required_error: 'messages.errors.parent_role_required',
  }),
  hasOtherParent: z.boolean({
    required_error: 'messages.errors.has_other_parent_required',
  }),
  otherParentPresent: z.boolean().optional(),
});

export const ChildFamilyInfoSchema = z.object({
  parentRole: z.nativeEnum(ParentalRole),
  hasParentalAuthority: z.boolean({
    required_error: 'messages.errors.parental_authority_required',
  }),
  otherParentFirstName: z.string().optional(),
  otherParentLastName: z.string().optional(),
  otherParentEmail: z.string().email('messages.errors.invalid_email').optional(),
  otherParentPhone: z.string().optional(),
  familySituation: z.string().optional(),
  otherInformation: z.string().optional(),
});

export const ChildDocumentsSchema = z.object({
  birthCertificateFile: DocumentFileSchema,
  passportFile: DocumentFileSchemaOptional,
  parentalAuthorityFile: DocumentFileSchemaOptional,
});

export const ChildCompleteFormSchema = z.object({
  linkInfo: LinkFormSchema,
  basicInfo: BasicInfoSchema.omit({
    passportIssueAuthority: true,
    passportIssueDate: true,
    passportExpiryDate: true,
    cardPin: true,
  }).extend({
    passportNumber: z.string().optional(),
  }),
  familyInfo: ChildFamilyInfoSchema,
  documents: ChildDocumentsSchema,
});

export type LinkFormData = z.infer<typeof LinkFormSchema>;
export type ChildFamilyInfoFormData = z.infer<typeof ChildFamilyInfoSchema>;
export type ChildDocumentsFormData = z.infer<typeof ChildDocumentsSchema>;
export type ChildCompleteFormData = z.infer<typeof ChildCompleteFormSchema>;
