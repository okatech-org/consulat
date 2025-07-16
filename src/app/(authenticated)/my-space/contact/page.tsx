'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { ContactMethods } from '../_components/contact-methods';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('dashboard.contact');
  
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.dashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        <ContactMethods />
      </div>
    </PageContainer>
  );
}
