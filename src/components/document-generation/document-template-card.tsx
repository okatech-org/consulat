'use client';

import { DocumentTemplate } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import CardContainer from '@/components/layouts/card-container';
import { Badge } from '../ui/badge';

interface DocumentTemplateCardProps {
  template: DocumentTemplate;
  onDelete?: (id: string) => void;
  className?: string;
}

export function DocumentTemplateCard({
  template,
  onDelete,
  className,
}: DocumentTemplateCardProps) {
  const t = useTranslations('inputs');

  return (
    <CardContainer
      title={
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{template.name}</h3>
        </div>
      }
      className={cn('group relative overflow-hidden', className)}
      contentClass="flex flex-col gap-2"
    >
      <Badge variant="outline">{t(`userDocument.options.${template.type}`)}</Badge>
      <p className="text-sm text-muted-foreground">{template.description}</p>
      <div className="flex justify-between gap-2 mt-4">
        <Button variant="outline" size="mobile" asChild className="flex-1" leftIcon={<Pencil />}>
          <Link href={ROUTES.dashboard.doc_template_edit(template.id)}>
            {t('documentTemplate.actions.edit')}
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="destructiveOutline"
            size="mobile"
            onClick={() => onDelete(template.id)}
            className="flex-1"
            leftIcon={<Trash2 />}
          >
            {t('documentTemplate.actions.delete')}
          </Button>
        )}
      </div>
    </CardContainer>
  );
}
