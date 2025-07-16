'use client';

import { Button } from '@/components/ui/button';
import {
  FileText,
  Calendar,
  ShieldCheck,
  User,
  Lightbulb,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import CardContainer from '@/components/layouts/card-container';
import { useTranslations } from 'next-intl';

export function QuickActions() {
  const t = useTranslations('dashboard.unified.quick_actions');

  const actions = [
    {
      title: t('actions.life_certificate.title'),
      description: t('actions.life_certificate.description'),
      icon: FileText,
      href: ROUTES.user.services + '?categories=CERTIFICATION',
      color: 'bg-blue-500',
    },
    {
      title: t('actions.appointment.title'),
      description: t('actions.appointment.description'),
      icon: Calendar,
      href: ROUTES.user.appointments,
      color: 'bg-green-500',
    },
    {
      title: t('actions.document_legalization.title'),
      description: t('actions.document_legalization.description'),
      icon: ShieldCheck,
      href: ROUTES.user.services + '?categories=CERTIFICATION',
      color: 'bg-purple-500',
    },
    {
      title: t('actions.profile_update.title'),
      description: t('actions.profile_update.description'),
      icon: User,
      href: ROUTES.user.profile,
      color: 'bg-orange-500',
    },
    {
      title: t('actions.various_certificates.title'),
      description: t('actions.various_certificates.description'),
      icon: Lightbulb,
      href: ROUTES.user.services,
      color: 'bg-indigo-500',
    },
    {
      title: t('actions.consular_support.title'),
      description: t('actions.consular_support.description'),
      icon: HelpCircle,
      href: ROUTES.user.contact,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <CardContainer
      title={t('title')}
      subtitle={t('subtitle')}
      action={
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.user.services}>
            {t('view_all_services')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-all duration-200 group"
            >
              <div
                className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white group-hover:scale-105 transition-transform`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </CardContainer>
  );
}
