'use client';

import { createContext, useContext } from 'react';
import type { RoleData } from '@/types/role-data';

export const RoleDataContext = createContext<RoleData | null>(null);

export function useRoleDataContext(): RoleData | null {
  return useContext(RoleDataContext);
}
