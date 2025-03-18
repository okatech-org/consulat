import * as z from 'zod';
import { ParentalRole } from '@prisma/client';
import { BasicInfoSchema, DocumentsSchema } from './registration';
import { PhoneNumberSchema } from './inputs';

export const LinkInfoSchema = z
  .object({
    parentRole: z.nativeEnum(ParentalRole),
    hasOtherParent: z.boolean(),
    otherParentFirstName: z.string().optional(),
    otherParentLastName: z.string().optional(),
    otherParentEmail: z.string().email().optional(),
    otherParentPhone: PhoneNumberSchema.optional(),
    otherParentRole: z.nativeEnum(ParentalRole).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasOtherParent) {
      if (!data.otherParentFirstName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.required',
          path: ['otherParentFirstName'],
        });
      }
      if (!data.otherParentLastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.required',
          path: ['otherParentLastName'],
        });
      }
      if (!data.otherParentEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.required',
          path: ['otherParentEmail'],
        });
      }
      if (!data.otherParentPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.required',
          path: ['otherParentPhone'],
        });
      }
      if (!data.otherParentRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.required',
          path: ['otherParentRole'],
        });
      }
    }
  });

export const ChildCompleteFormSchema = z.object({
  linkInfo: LinkInfoSchema,
  basicInfo: BasicInfoSchema,
  documents: DocumentsSchema,
});

export type LinkFormData = z.infer<typeof LinkInfoSchema>;
export type BasicInfoSchema = z.infer<typeof BasicInfoSchema>;
export type ChildDocumentsFormData = z.infer<typeof DocumentsSchema>;
export type ChildCompleteFormData = z.infer<typeof ChildCompleteFormSchema>;
