import { UserRole } from '@prisma/client';
import { Route } from 'next';
import { LucideProps } from 'lucide-react';
import { ReactElement } from 'react';

export type NavItem = {
  title: string;
  href: Route<string>;
  icon: ReactElement<LucideProps>;
  roles?: UserRole[];
  items?: Omit<NavItem, 'icon' | 'items'>[];
  isActive?: boolean;
};
