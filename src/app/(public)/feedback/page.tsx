'use client';

import { FeedbackForm } from '@/components/ui/feedback-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FeedbackPage() {
  const t = useTranslations('feedback');
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">{t('form.title')}</h1>
          <p className="text-muted-foreground">{t('form.description')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
          <FeedbackForm isOpen={showForm} onOpenChange={setShowForm} />
        </div>
      </div>
    </div>
  );
}
