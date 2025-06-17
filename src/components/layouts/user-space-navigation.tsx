'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, FileText, Calendar, Bell, Settings } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface UserSpaceNavigationProps {
  className?: string;
  showQuickActions?: boolean;
}

export function UserSpaceNavigation({
  className,
  showQuickActions = true,
}: UserSpaceNavigationProps) {
  const pathname = usePathname();

  // Configuration des sections de l'espace utilisateur
  const navigationItems: NavigationItem[] = [
    {
      key: 'dashboard',
      label: 'Tableau de bord',
      href: ROUTES.user.dashboard,
      icon: Home,
      description: "Vue d'ensemble de votre espace personnel",
    },
    {
      key: 'profile',
      label: 'Profil',
      href: ROUTES.user.profile,
      icon: User,
      description: 'Gérer vos informations personnelles',
    },
    {
      key: 'appointments',
      label: 'Rendez-vous',
      href: ROUTES.user.appointments,
      icon: Calendar,
      description: 'Planifier et gérer vos rendez-vous',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      href: ROUTES.user.notifications,
      icon: Bell,
      description: 'Vos alertes et messages importants',
    },
    {
      key: 'account',
      label: 'Compte',
      href: ROUTES.user.account,
      icon: Settings,
      description: 'Paramètres de votre compte',
    },
  ];

  const currentSection = navigationItems.find((item) => pathname.startsWith(item.href));

  return (
    <div className={cn('space-y-4', className)}>
      {/* Navigation rapide entre sections (optionnelle) */}
      {showQuickActions && (
        <div className="hidden md:flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Accès rapide:
          </span>
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Button
                key={item.key}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                asChild
                className={cn('transition-all duration-200', isActive && 'shadow-sm')}
              >
                <Link href={item.href} className="flex items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      )}

      {/* Indicateur de section actuelle avec description */}
      {currentSection && (
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <div className="p-2 bg-primary/10 rounded-md">
            <currentSection.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground">{currentSection.label}</h2>
            {currentSection.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentSection.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
