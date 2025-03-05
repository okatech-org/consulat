// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_URL: z.string().url(),
  POSTGRES_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  UPLOADTHING_SECRET: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  BASE_COUNTRY_CODE: z.string().min(1),
  NEXT_PUBLIC_BASE_COUNTRY_CODE: z.string().min(1),
  RESIDENT_COUNTRY_CODE: z.string().min(1),
  NEXT_PUBLIC_RESIDENT_COUNTRY_CODE: z.string().min(1),
});

// Type d'environnement validé
export type Env = z.infer<typeof envSchema>;

// Fonction de validation
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    // @ts-expect-error ZodError est un type de Zod
    console.error('❌ Invalid environment variables:', error.errors);
    throw new Error('Invalid environment variables');
  }
}

// Créer un objet d'environnement validé
export const env = validateEnv();

// Pour le typage, créer un fichier de déclaration séparé
// src/types/env.d.ts
declare global {
  type ProcessEnv = z.infer<typeof envSchema>;
}
