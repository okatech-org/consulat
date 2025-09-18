'use client';

import type { SessionUser } from '@/types';
import { useUser } from '@clerk/nextjs';
import type { UserRole } from '@prisma/client';

export function useCurrentUser() {
  const user = useUser();
  const userData: SessionUser = {
    id: (user.user?.publicMetadata?.userId as string) || user.user?.id || '',
    email: user.user?.primaryEmailAddress?.emailAddress || null,
    name: user.user?.fullName,
    image: user.user?.imageUrl || null,
    roles: user.user?.publicMetadata?.roles as UserRole[],
    profileId: user.user?.publicMetadata?.profileId as string | undefined,
    assignedOrganizationId: user.user?.publicMetadata?.assignedOrganizationId as
      | string
      | undefined,
    organizationId: user.user?.publicMetadata?.organizationId as string | undefined,
    countryCode: user.user?.publicMetadata?.countryCode as string | undefined,
  };
  return {
    user: userData,
  };
}
