import { createAuthClient } from 'better-auth/react';
import {
  emailOTPClient,
  inferAdditionalFields,
  phoneNumberClient,
} from 'better-auth/client/plugins';
import { auth } from './auth';

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    phoneNumberClient(),
    inferAdditionalFields<typeof auth>({}),
  ],
});
