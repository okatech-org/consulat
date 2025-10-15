import * as z from 'zod';
import { ParentalRole } from '@/convex/lib/constants';
import { BasicInfoSchema, DocumentsSchema } from './registration';
import { PhoneNumberSchema, NameSchema } from './inputs';

export const LinkInfoSchema = z
  .object({
    firstName: NameSchema,
    lastName: NameSchema,
    parentRole: z.enum(Object.values(ParentalRole)),
    hasOtherParent: z.boolean(),
    otherParentFirstName: z.string().optional(),
    otherParentLastName: z.string().optional(),
    otherParentEmail: z.string().email().optional(),
    otherParentPhone: PhoneNumberSchema.optional(),
    otherParentRole: z.enum(Object.values(ParentalRole)).optional(),
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

// Child basic info schema (simplified version without passport fields)
export const ChildBasicInfoSchema = BasicInfoSchema.omit({
  passportInfos: true,
}).extend({
  passportInfos: z
    .object({
      number: z
        .string()
        .min(8)
        .max(9)
        .regex(/^[A-Z0-9]{8,9}$/)
        .optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      issueAuthority: z.string().min(2).max(100).optional(),
    })
    .optional(),
});

export const ChildCompleteFormSchema = z.object({
  link: LinkInfoSchema,
  basicInfo: ChildBasicInfoSchema,
  documents: DocumentsSchema,
});

export type LinkFormData = z.infer<typeof LinkInfoSchema>;
export type ChildBasicInfoFormData = z.infer<typeof ChildBasicInfoSchema>;
export type ChildDocumentsFormData = z.infer<typeof DocumentsSchema>;
export type ChildCompleteFormData = z.infer<typeof ChildCompleteFormSchema>;
