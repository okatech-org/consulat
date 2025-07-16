'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';

export function ContactMethods() {
  const t = useTranslations('dashboard.contact');
  
  const contactMethods = [
    {
      title: t('methods.emergency.title'),
      description: t('methods.emergency.description'),
      icon: Phone,
      action: t('methods.emergency.action'),
      href: 'tel:+33123456789',
      color: 'bg-red-500',
    },
    {
      title: t('methods.chat.title'),
      description: t('methods.chat.description'),
      icon: MessageCircle,
      action: t('methods.chat.action'),
      href: ROUTES.user.feedback,
      color: 'bg-blue-500',
    },
    {
      title: t('methods.email.title'),
      description: t('methods.email.description'),
      icon: Mail,
      action: t('methods.email.action'),
      href: 'mailto:contact@consulat.ga',
      color: 'bg-green-500',
    },
    {
      title: t('methods.consulate.title'),
      description: t('methods.consulate.description'),
      icon: MapPin,
      action: t('methods.consulate.action'),
      href: ROUTES.user.appointments,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Méthodes de contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{method.description}</p>
              <Button asChild>
                <a href={method.href}>{method.action}</a>
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Informations de contact */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('info.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">{t('info.address')}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {t('info.address_value')}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">{t('info.phone')}</h4>
              <p className="text-sm text-muted-foreground">{t('info.phone_value')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">{t('info.email')}</h4>
              <p className="text-sm text-muted-foreground">{t('info.email_value')}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">{t('info.hours')}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {t('info.hours_value')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}