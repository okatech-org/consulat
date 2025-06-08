'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Home,
  User,
  FileText,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
      key: 'documents',
      label: 'Documents',
      href: ROUTES.user.documents,
      icon: FileText,
      description: 'Vos documents et pièces justificatives',
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

  // Génération des breadcrumbs basés sur le pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      {
        label: 'Accueil',
        href: '/',
        isActive: false,
      },
    ];

    if (segments.includes('my-space')) {
      breadcrumbs.push({
        label: 'Mon Espace',
        href: ROUTES.user.dashboard,
        isActive: segments.length === 1 || segments[segments.length - 1] === 'my-space',
      });

      // Ajouter des breadcrumbs spécifiques selon la section
      const currentSection = segments[segments.length - 1];
      if (currentSection) {
        const sectionItem = navigationItems.find(
          (item) => item.href.includes(currentSection) || item.key === currentSection,
        );

        if (sectionItem && !breadcrumbs.some((b) => b.href === sectionItem.href)) {
          breadcrumbs.push({
            label: sectionItem.label,
            href: sectionItem.href,
            isActive: true,
          });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentSection = navigationItems.find((item) => pathname.startsWith(item.href));

  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs contextuels */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem key={breadcrumb.href}>
                {index === breadcrumbs.length - 1 || breadcrumb.isActive ? (
                  <BreadcrumbPage className="font-medium">
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link
                        href={breadcrumb.href}
                        className="hover:text-primary transition-colors"
                      >
                        {breadcrumb.label}
                      </Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Aide contextuelle */}
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <HelpCircle className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Aide</span>
        </Button>
      </div>

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
