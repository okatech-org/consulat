import * as z from 'zod';
import { ParentalRole } from '@prisma/client';
import { BasicInfoSchema, DocumentsSchema } from './registration';
import { PhoneSchema } from './inputs';

export const LinkInfoSchema = z
  .object({
    parentRole: z.nativeEnum(ParentalRole),
    hasOtherParent: z.boolean(),
    otherParentFirstName: z.string().optional(),
    otherParentLastName: z.string().optional(),
    otherParentEmail: z.string().email().optional(),
    otherParentPhone: PhoneSchema.optional(),
    otherParentRole: z.nativeEnum(ParentalRole).optional(),
  })
  .refine(
    (data) => {
      // Si hasOtherParent est true, tous les champs otherParent sont requis
      if (data.hasOtherParent) {
        return !!(
          data.otherParentFirstName &&
          data.otherParentLastName &&
          data.otherParentEmail &&
          data.otherParentPhone &&
          data.otherParentRole
        );
      }
      return true;
    },
    {
      message: 'messages.errors.other_parent_fields_required',
      path: [
        'otherParentFirstName',
        'otherParentLastName',
        'otherParentEmail',
        'otherParentPhone',
        'otherParentRole',
      ],
    },
  );

export const ChildCompleteFormSchema = z.object({
  linkInfo: LinkInfoSchema,
  basicInfo: BasicInfoSchema,
  documents: DocumentsSchema,
});

export type LinkFormData = z.infer<typeof LinkInfoSchema>;
export type BasicInfoSchema = z.infer<typeof BasicInfoSchema>;
export type ChildDocumentsFormData = z.infer<typeof DocumentsSchema>;
export type ChildCompleteFormData = z.infer<typeof ChildCompleteFormSchema>;
