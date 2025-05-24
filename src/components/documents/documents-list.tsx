'use client';

import { useTranslations } from 'next-intl';
import { DocumentCard } from './document-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import { AppUserDocument } from '@/types';

interface DocumentsListProps {
  documents: AppUserDocument[];
}

export function DocumentsList({ documents }: DocumentsListProps) {
  const t = useTranslations('documents');

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t('empty.title')}
        description={t('empty.description')}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
}
