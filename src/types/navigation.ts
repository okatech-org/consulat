import { UserRole } from '@prisma/client';
import type { Route } from 'next';
import type { LucideProps } from 'lucide-react';
import type { ReactElement } from 'react';

export type NavItem = {
  title: string;
  href: Route<string>;
  icon: ReactElement<LucideProps>;
  roles?: UserRole[];
  items?: Omit<NavItem, 'icon' | 'items'>[];
  isActive?: boolean;
};
