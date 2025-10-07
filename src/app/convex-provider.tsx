'use client';

import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { env } from '@/env';
import { useAuth } from '@clerk/nextjs';

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL as string);

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
