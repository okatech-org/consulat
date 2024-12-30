import * as z from 'zod'

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'identifier_required'),
  type: z.enum(['EMAIL', 'PHONE']),
  otp: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'EMAIL') {
    if (!z.string().email().safeParse(data.identifier).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'invalid_email',
        path: ['identifier'],
      })
    }
  } else if (data.type === 'PHONE') {
    // Mise à jour de la validation du téléphone pour accepter le format international
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(data.identifier)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'invalid_phone',
        path: ['identifier'],
      })
    }
  }
})

export type LoginInput = z.infer<typeof LoginSchema>