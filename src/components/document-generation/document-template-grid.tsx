'use client';

import { DocumentTemplate } from '@prisma/client';
import { DocumentTemplateCard } from './document-template-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DocumentTemplateGridProps {
  templates: DocumentTemplate[];
  onDelete?: (id: string) => void;
  className?: string;
}

export function DocumentTemplateGrid({
  templates,
  onDelete,
  className,
}: DocumentTemplateGridProps) {
  const t = useTranslations('inputs');

  if (!templates.length) {
    return (
      <EmptyState
        icon={FileText}
        title={t('documentTemplate.empty.title')}
        description={t('documentTemplate.empty.description')}
      />
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <DocumentTemplateCard
            key={template.id}
            template={template}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
