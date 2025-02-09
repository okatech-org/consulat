import {
  LayoutDashboard,
  FileText,
  User,
  Files,
  ClipboardList,
  Plus,
  Calendar,
} from 'lucide-react';

// ... reste des imports

export default async function UserSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const t = await getTranslations('user.nav');

  const navigation = [
    {
      title: t('dashboard'),
      href: ROUTES.user.dashboard,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: t('requests'),
      href: ROUTES.user.requests,
      icon: <FileText className="size-4" />,
    },
    {
      title: t('appointments'),
      href: ROUTES.user.appointments,
      icon: <Calendar className="size-4" />,
    },
    {
      title: t('profile'),
      href: ROUTES.user.profile,
      icon: <User className="size-4" />,
    },
    // ... reste des items de navigation
  ];

  // ... reste du composant
}
