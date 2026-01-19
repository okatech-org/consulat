import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Clerk Authentication
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SECRET: z.string().optional(),

    CONVEX_DEPLOYMENT: z.string(),

    // AI APIs
    GEMINI_API_KEY: z.string(),
    REMOVEBG_API_KEY: z.string(),

    // Twilio
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    TWILIO_PHONE_NUMBER: z.string(),

    // Resend
    RESEND_API_KEY: z.string(),
    RESEND_SENDER: z.email(),
    TECHNICAL_CONTACT_EMAIL: z.email(),

    // Country Configuration
    BASE_COUNTRY_CODE: z.string().default('GA'),
    RESIDENT_COUNTRY_CODE: z.string().default('FR'),

    // Organization
    NEXT_ORG_LOGO: z.url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BASE_COUNTRY_CODE: z.string().default('GA'),
    NEXT_PUBLIC_RESIDENT_COUNTRY_CODE: z.string().default('FR'),
    NEXT_PUBLIC_URL: z.url(),
    NEXT_PUBLIC_ORG_LOGO: z.url(),
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_DEFAULT_IMAGE_PATH: z.string().optional(),
    NEXT_PUBLIC_GEMINI_API_KEY: z.string(),

    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CONVEX_URL: z.url(),
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    REMOVEBG_API_KEY: process.env.REMOVEBG_API_KEY,
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
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,

    // Clerk Authentication
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
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
