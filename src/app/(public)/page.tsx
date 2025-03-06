import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { CalendarIcon, CheckCircle, ScrollText, Shield, Users } from 'lucide-react';
import React from 'react';
import { IdCardIcon } from '@radix-ui/react-icons';
import { CTASection } from '@/app/(public)/cta-section';
import { SelectRegistrationCountryForm } from '@/components/registration/registration-form';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getTranslations } from 'next-intl/server';

export default async function LandingPage() {
  const t = await getTranslations('home');

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 to-background px-4 py-20">
        <div className="container relative z-10 mx-auto flex flex-col items-center text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            {t('hero.title')}
            <br />
            <span className="text-primary">{t('hero.title_highlight')}</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t('hero.description')}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="#features"
              className={buttonVariants({
                variant: 'default',
                size: 'lg',
                className: 'rounded-full',
              })}
            >
              {t('hero.discover_features')}
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'lg',
                    className: 'rounded-full',
                  })}
                >
                  {t('hero.start_registration')}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="sr-only">
                  {t('hero.start_registration')}
                </DialogTitle>
                <SelectRegistrationCountryForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            {t('features.title')}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Shield className="size-10 text-primary" />}
              title={t('features.cards.security.title')}
              description={t('features.cards.security.description')}
            />
            <FeatureCard
              icon={<Users className="size-10 text-primary" />}
              title={t('features.cards.community.title')}
              description={t('features.cards.community.description')}
            />
            <FeatureCard
              icon={<CheckCircle className="size-10 text-primary" />}
              title={t('features.cards.simplicity.title')}
              description={t('features.cards.simplicity.description')}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            {t('services.title')}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title={t('services.cards.card.title')}
              description={t('services.cards.card.description')}
              icon={<IdCardIcon className={'size-8'} />}
            />
            <ServiceCard
              title={t('services.cards.documents.title')}
              description={t('services.cards.documents.description')}
              icon={<ScrollText className={'size-8'} />}
            />
            <ServiceCard
              title={t('services.cards.appointments.title')}
              description={t('services.cards.appointments.description')}
              icon={<CalendarIcon className={'size-8'} />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

// Components
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ServiceCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-background p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
