'use client';

import { FeedbackForm } from '@/components/ui/feedback-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function FeedbackPage() {
  const t = useTranslations('feedback');
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="container mx-auto py-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{t('form.title')}</h1>
          <p className="text-muted-foreground">{t('form.description')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
          <FeedbackForm isOpen={showForm} onOpenChange={setShowForm} />
        </div>
      </div>
    </div>
  );
}
