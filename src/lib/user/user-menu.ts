import { UserRole } from '@prisma/client';
import { LucideIcon } from 'lucide-react';

export function useUserMenu(userRole: UserRole) {
  const { t } = useTranslation();
  const menu = getUserMenu(userRole);
  return menu;
}

export function getUserMenu(userRole: UserRole): {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
} {
  switch (userRole) {
    case UserRole.SUPER_ADMIN:
      return [];
    case UserRole.ADMIN:
      return [];
    case UserRole.AGENT:
      return [];
    case UserRole.USER:
      return [];
    default:
      return [];
  }
}

const adminNavigation = [
  {
    title: 'Dashboard',
    url: ROUTES.dashboard.base,
  },
];

const data = {
  teams: [
    {
      name: 'Consulat',
      logo: GalleryVerticalEnd,
      plan: 'FR',
    },
  ],
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: TerminalSquare,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
};
