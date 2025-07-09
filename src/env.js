import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VONAGE_API_KEY: z.string(),
    VONAGE_API_SECRET: z.string(),
    VONAGE_APPLICATION_ID: z.string(),
    VONAGE_PRIVATE_KEY: z.string(),

    // UploadThing
    UPLOADTHING_TOKEN: z.string(),

    // AI APIs
    OPENAI_API_KEY: z.string(),
    GEMINI_API_KEY: z.string(),

    // SMS Provider Configuration
    SMS_PROVIDER: z.enum(['twilio', 'vonage']).default('twilio'),

    // Twilio
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    TWILIO_PHONE_NUMBER: z.string(),

    // Resend
    RESEND_API_KEY: z.string(),
    RESEND_SENDER: z.string().email(),
    TECHNICAL_CONTACT_EMAIL: z.string().email(),

    // Country Configuration
    BASE_COUNTRY_CODE: z.string().default('GA'),
    RESIDENT_COUNTRY_CODE: z.string().default('FR'),

    // Organization
    NEXT_ORG_LOGO: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BASE_COUNTRY_CODE: z.string().default('GA'),
    NEXT_PUBLIC_RESIDENT_COUNTRY_CODE: z.string().default('FR'),
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_ORG_LOGO: z.string().url(),
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_DEFAULT_IMAGE_PATH: z.string().optional(),
    NEXT_PUBLIC_GEMINI_API_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VONAGE_API_KEY: process.env.VONAGE_API_KEY,
    VONAGE_API_SECRET: process.env.VONAGE_API_SECRET,
    VONAGE_APPLICATION_ID: process.env.VONAGE_APPLICATION_ID,
    VONAGE_PRIVATE_KEY: process.env.VONAGE_PRIVATE_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SMS_PROVIDER: process.env.SMS_PROVIDER,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_SENDER: process.env.RESEND_SENDER,
    TECHNICAL_CONTACT_EMAIL: process.env.TECHNICAL_CONTACT_EMAIL,
    BASE_COUNTRY_CODE: process.env.BASE_COUNTRY_CODE,
    RESIDENT_COUNTRY_CODE: process.env.RESIDENT_COUNTRY_CODE,
    NEXT_ORG_LOGO: process.env.NEXT_ORG_LOGO,
    NEXT_PUBLIC_BASE_COUNTRY_CODE: process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE,
    NEXT_PUBLIC_RESIDENT_COUNTRY_CODE: process.env.NEXT_PUBLIC_RESIDENT_COUNTRY_CODE,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_ORG_LOGO: process.env.NEXT_PUBLIC_ORG_LOGO,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_DEFAULT_IMAGE_PATH: process.env.NEXT_PUBLIC_DEFAULT_IMAGE_PATH,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
