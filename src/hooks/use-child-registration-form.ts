import { useState } from 'react';
import type { Id } from '@/convex/_generated/dataModel';

export function useChildRegistrationForm() {
  const [childProfileId, setChildProfileId] = useState<Id<'childProfiles'> | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  return {
    childProfileId,
    setChildProfileId,
    isLoading,
    setIsLoading,
    error,
    setError,
  };
}
