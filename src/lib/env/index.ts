import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    AUTH_SECRET: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
    POSTGRES_URL: z.string().url(),
    OPENAI_API_KEY: z.string().startsWith('sk-'),
    CONVERT_API_KEY: z.string().startsWith('secret_'),
    BASE_COUNTRY_CODE: z.string().length(2),
    RESIDENT_COUNTRY_CODE: z.string().length(2),

    // Email configuration
    RESEND_API_KEY: z.string().startsWith('re_'),
    RESEND_SENDER: z.string().email(),
    TECHNICAL_CONTACT_EMAIL: z.string().email().optional(),

    // SMS Provider configuration
    SMS_PROVIDER: z.enum(['twilio', 'vonage']),

    // Twilio configuration
    TWILIO_ACCOUNT_SID: z.string().startsWith('AC'),
    TWILIO_AUTH_TOKEN: z.string().min(1),
    TWILIO_PHONE_NUMBER: z.string().startsWith('+'),

    // Vonage configuration
    VONAGE_API_KEY: z.string().min(1),
    VONAGE_API_SECRET: z.string().min(1),
    VONAGE_PHONE_NUMBER: z.string().startsWith('+'),
    NEXT_ORG_LOGO: z.string().url(),

    // BetterAuth configuration
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BASE_COUNTRY_CODE: z.string().length(2),
    NEXT_PUBLIC_RESIDENT_COUNTRY_CODE: z.string().length(2),
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_ORG_LOGO: z.string().url(),
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
    NEXT_PUBLIC_DEFAULT_IMAGE_PATH: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    POSTGRES_URL: process.env.POSTGRES_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CONVERT_API_KEY: process.env.CONVERT_API_KEY,
    BASE_COUNTRY_CODE: process.env.BASE_COUNTRY_CODE,
    RESIDENT_COUNTRY_CODE: process.env.RESIDENT_COUNTRY_CODE,

    // Email configuration
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_SENDER: process.env.RESEND_SENDER,
    TECHNICAL_CONTACT_EMAIL: process.env.TECHNICAL_CONTACT_EMAIL,

    // SMS Provider configuration
    SMS_PROVIDER: process.env.SMS_PROVIDER,

    // Twilio configuration
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

    // Vonage configuration
    VONAGE_API_KEY: process.env.VONAGE_API_KEY,
    VONAGE_API_SECRET: process.env.VONAGE_API_SECRET,
    VONAGE_PHONE_NUMBER: process.env.VONAGE_PHONE_NUMBER,

    // BetterAuth configuration
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

    NEXT_ORG_LOGO: process.env.NEXT_ORG_LOGO,

    // Public variables
    NEXT_PUBLIC_BASE_COUNTRY_CODE: process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE,
    NEXT_PUBLIC_RESIDENT_COUNTRY_CODE: process.env.NEXT_PUBLIC_RESIDENT_COUNTRY_CODE,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_ORG_LOGO: process.env.NEXT_PUBLIC_ORG_LOGO,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_DEFAULT_IMAGE_PATH: process.env.NEXT_PUBLIC_DEFAULT_IMAGE_PATH,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
