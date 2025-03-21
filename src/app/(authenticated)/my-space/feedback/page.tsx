'use client';

import { FeedbackForm } from '@/components/ui/feedback-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/layouts/page-container';

export default function FeedbackPage() {
  const t = useTranslations('feedback');
  const [showForm, setShowForm] = useState(true);

  return (
    <PageContainer title={t('form.title')} description={t('form.description')}>
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <FeedbackForm isOpen={showForm} onOpenChange={setShowForm} />
      </div>
    </PageContainer>
  );
}
