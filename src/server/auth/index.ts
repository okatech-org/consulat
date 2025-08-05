import NextAuth from 'next-auth';
import { cache } from 'react';

// Import de la configuration unifiée Twilio Verify
import { unifiedAuthConfig } from './unified-config';

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(unifiedAuthConfig);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
