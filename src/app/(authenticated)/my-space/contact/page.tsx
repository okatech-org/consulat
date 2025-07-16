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
    <PageContainer
      title={t('title')}
      description={t('description')}
      action={
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.user.dashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Link>
        </Button>
      }
    >
      <ContactMethods />
    </PageContainer>
  );
}
