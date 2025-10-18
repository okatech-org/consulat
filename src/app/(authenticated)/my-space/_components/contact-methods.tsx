'use client';

import CardContainer from '@/components/layouts/card-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, MapPin, AlertTriangle, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { ChatToggle } from '@/components/chat/chat-toggle';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export function ContactMethods() {
  const t = useTranslations('dashboard.contact');
  const profile = useQuery(api.functions.profile.getCurrentProfile);
  const organization = useQuery(
    api.functions.organization.getOrganizationsByCountry,
    profile?.residenceCountry ? { countryCode: profile.residenceCountry } : 'skip',
  );

  if (organization === null) {
    return (
      <div className="space-y-6">
        <CardContainer
          title={t('no_organization.title')}
          className="border-amber-200 bg-amber-50"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-amber-800">{t('no_organization.description')}</p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href={ROUTES.registration}>{t('no_organization.action')}</Link>
            </Button>
          </div>
        </CardContainer>

        <CardContainer title={t('support.title')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 text-center hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{t('support.chat.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('support.chat.description')}
              </p>
              <div className="flex justify-center">
                <ChatToggle
                  customIcon={
                    <Button className="w-full">{t('support.chat.action')}</Button>
                  }
                />
              </div>
            </Card>

            <Card className="p-6 text-center hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{t('support.feedback.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('support.feedback.description')}
              </p>
              <Button className="w-full" asChild>
                <Link href={ROUTES.user.feedback}>{t('support.feedback.action')}</Link>
              </Button>
            </Card>
          </div>
        </CardContainer>
      </div>
    );
  }

  if (organization === undefined) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const contactData = organization?.[0]?.settings.find(
    (setting) => setting.countryCode === profile?.residenceCountry,
  );

  // Formatage des horaires
  const formatSchedule = () => {
    if (!contactData?.schedule) return t('info.hours_unavailable');

    const days: WeekDay[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const openDays = days.filter((day) => {
      const daySchedule = contactData.schedule?.[day];
      return daySchedule?.isOpen;
    });

    if (openDays.length === 0) return t('info.closed');

    // Grouper les jours consécutifs avec les mêmes horaires
    const groupedDays: WeekDay[][] = [];
    if (openDays.length > 0) {
      let currentGroup = [openDays[0]!];

      for (let i = 1; i < openDays.length; i++) {
        const currentDay = contactData.schedule[openDays[i]!];
        const previousDay = contactData.schedule[openDays[i - 1]!];

        if (
          currentDay &&
          previousDay &&
          JSON.stringify(currentDay.slots) === JSON.stringify(previousDay.slots)
        ) {
          currentGroup.push(openDays[i]!);
        } else {
          groupedDays.push(currentGroup);
          currentGroup = [openDays[i]!];
        }
      }
      groupedDays.push(currentGroup);
    }

    return groupedDays
      .map((group) => {
        const firstDay = group[0];
        const lastDay = group[group.length - 1];
        const daySchedule = contactData.schedule?.[firstDay!];

        if (!daySchedule || !firstDay || !lastDay) return '';

        const dayRange =
          group.length === 1
            ? t(`days.${firstDay}`)
            : `${t(`days.${firstDay}`)} - ${t(`days.${lastDay}`)}`;

        const timeSlots = (daySchedule.slots || [])
          .map((slot: { start: string; end: string }) => `${slot.start} - ${slot.end}`)
          .join(', ');

        return `${dayRange}: ${timeSlots}`;
      })
      .filter(Boolean)
      .join('\n');
  };

  const contactMethods = [
    {
      title: t('methods.emergency.title'),
      description: t('methods.emergency.description'),
      icon: AlertTriangle,
      action: t('methods.emergency.action'),
      href: `tel:${contactData?.contact?.phone || '#'}`,
      color: 'bg-red-500',
    },
    {
      title: t('methods.chat.title'),
      description: t('methods.chat.description'),
      icon: MessageCircle,
      action: t('methods.chat.action'),
      isChat: true,
      color: 'bg-blue-500',
    },
    {
      title: t('methods.email.title'),
      description: t('methods.email.description'),
      icon: Mail,
      action: t('methods.email.action'),
      href: `mailto:${contactData?.contact?.email || '#'}`,
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

  const formatAddress = () => {
    if (!contactData?.contact?.address) return t('info.address_unavailable');

    const { street, city, postalCode, country } = contactData.contact.address;
    return `${street}\n${postalCode} ${city}, ${country}`;
  };

  return (
    <>
      <CardContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <Card
                key={index}
                className="p-6 text-center hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{method.description}</p>

                {method.isChat ? (
                  <div className="flex justify-center">
                    <ChatToggle
                      customIcon={
                        <div className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                          {method.action}
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <Button className="w-full" asChild>
                    <a href={method.href}>{method.action}</a>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </CardContainer>

      <CardContainer
        className="bg-muted/50"
        title={t('info.title')}
        contentClass="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="flex justify-between items-start p-3 bg-background rounded">
          <span className="font-medium">{t('info.address')}</span>
          <span className="text-muted-foreground text-right text-sm whitespace-pre-line">
            {formatAddress()}
          </span>
        </div>
        <div className="flex justify-between items-start p-3 bg-background rounded">
          <span className="font-medium">{t('info.phone')}</span>
          <span className="text-muted-foreground">
            {contactData?.contact?.phone || t('info.phone_unavailable')}
          </span>
        </div>
        <div className="flex justify-between items-start p-3 bg-background rounded">
          <span className="font-medium">{t('info.email')}</span>
          <span className="text-muted-foreground">
            {contactData?.contact?.email || t('info.email_unavailable')}
          </span>
        </div>
        <div className="flex justify-between items-start p-3 bg-background rounded">
          <span className="font-medium">{t('info.hours')}</span>
          <span className="text-muted-foreground text-right text-sm whitespace-pre-line">
            {formatSchedule()}
          </span>
        </div>
        {contactData?.contact?.website && (
          <div className="flex justify-between items-start p-3 bg-background rounded md:col-span-2">
            <span className="font-medium">{t('info.website')}</span>
            <a
              href={contactData.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {contactData.contact.website}
            </a>
          </div>
        )}
      </CardContainer>

      <CardContainer title={t('support.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 text-center hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('support.chat.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('support.chat.description')}
            </p>
            <div className="flex justify-center">
              <ChatToggle
                customIcon={
                  <div className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    {t('support.chat.action')}
                  </div>
                }
              />
            </div>
          </Card>

          <Card className="p-6 text-center hover:border-primary transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('support.feedback.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('support.feedback.description')}
            </p>
            <Button className="w-full" asChild>
              <Link href={ROUTES.user.feedback}>{t('support.feedback.action')}</Link>
            </Button>
          </Card>
        </div>
      </CardContainer>
    </>
  );
}
