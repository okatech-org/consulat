'use client';

import { createContext, useContext } from 'react';
import type { RoleData } from '@/types/role-data';

export const RoleDataContext = createContext<RoleData | null>(null);

export function useRoleDataContext(): RoleData | null {
  return useContext(RoleDataContext);
}

interface RoleBasedDataProviderProps {
  children: React.ReactNode;
  initialData: RoleData | null;
}

export function RoleBasedDataProvider({
  children,
  initialData,
}: RoleBasedDataProviderProps) {
  return (
    <RoleDataContext.Provider value={initialData}>{children}</RoleDataContext.Provider>
  );
}
