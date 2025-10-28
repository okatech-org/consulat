export function convertDateToTimestamp(dateStr: unknown): number | undefined {
  if (!dateStr || typeof dateStr !== 'string') return undefined;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date.getTime();
  } catch {
    return undefined;
  }
}

export function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
): T {
  const output: Record<string, unknown> = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      output[key] = mergeDeep(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else if (sourceValue !== undefined && sourceValue !== null && sourceValue !== '') {
      output[key] = sourceValue;
    }
  });

  return output as T;
}

export interface ProfileUpdateData {
  personal?: {
    firstName?: string;
    lastName?: string;
    birthDate?: number;
    birthPlace?: string;
    birthCountry?: string;
    gender?: 'male' | 'female';
    nationality?: string;
    acquisitionMode?: string;
    passportInfos?: {
      number?: string;
      issueDate?: number;
      expiryDate?: number;
      issueAuthority?: string;
    };
    nipCode?: string;
  };
  contacts?: {
    email?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
      state?: string;
      complement?: string;
    };
  };
  family?: {
    maritalStatus?: string;
    father?: {
      firstName?: string;
      lastName?: string;
    };
    mother?: {
      firstName?: string;
      lastName?: string;
    };
    spouse?: {
      firstName?: string;
      lastName?: string;
    };
  };
  professionSituation?: {
    workStatus?: string;
    profession?: string;
    employer?: string;
    employerAddress?: string;
    activityInGabon?: string;
  };
}
