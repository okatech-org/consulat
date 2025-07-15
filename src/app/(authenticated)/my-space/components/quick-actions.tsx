'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  ShieldCheck, 
  User, 
  Lightbulb, 
  HelpCircle, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export function QuickActions() {
  const actions = [
    {
      title: 'Certificat de vie',
      description: 'Obtenez votre certificat de vie pour vos démarches de pension',
      icon: FileText,
      href: ROUTES.user.service_available,
      color: 'bg-blue-500',
    },
    {
      title: 'Prendre un rendez-vous',
      description: 'Planifiez votre visite au consulat',
      icon: Calendar,
      href: ROUTES.user.appointments,
      color: 'bg-green-500',
    },
    {
      title: 'Légalisation de document',
      description: 'Faites légaliser vos documents officiels',
      icon: ShieldCheck,
      href: ROUTES.user.service_available,
      color: 'bg-purple-500',
    },
    {
      title: 'Mise à jour du profil',
      description: 'Complétez ou modifiez vos informations personnelles',
      icon: User,
      href: ROUTES.user.profile,
      color: 'bg-orange-500',
    },
    {
      title: 'Attestations diverses',
      description: 'Demandez vos attestations de résidence, revenus, etc.',
      icon: Lightbulb,
      href: ROUTES.user.service_available,
      color: 'bg-indigo-500',
    },
    {
      title: 'Support consulaire',
      description: 'Contactez notre équipe pour toute assistance',
      icon: HelpCircle,
      href: ROUTES.user.feedback,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Services et Actions</h2>
          <p className="text-muted-foreground text-sm">Accédez rapidement à vos services</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.user.service_available}>
            Voir tous les services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
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
    </Card>
  );
}