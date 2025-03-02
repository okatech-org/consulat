'use client';

import { useTranslations } from 'next-intl';
import { ChildCompleteFormData } from '@/schemas/child-registration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChildReviewFields } from './child-review-fields';

interface ChildReviewFormProps {
  data: ChildCompleteFormData;
  onEdit: (step: number) => void;
}

export function ChildReviewForm({ data, onEdit }: ChildReviewFormProps) {
  const t = useTranslations('registration');

  const sections = [
    {
      key: 'linkInfo',
      title: t('child_review.link_info'),
      data: data.linkInfo,
      step: 0,
    },
    {
      key: 'documents',
      title: t('review.documents'),
      data: data.documents,
      step: 1,
    },
    {
      key: 'basicInfo',
      title: t('review.basic_info'),
      data: data.basicInfo,
      step: 2,
    },
  ] as const;

  return (
    <div className="space-y-4 md:space-y-6">
      {sections.map((section) => (
        <ChildReviewSection
          key={section.key}
          id={section.key}
          title={section.title}
          data={section.data}
          onEdit={() => onEdit(section.step)}
        />
      ))}
    </div>
  );
}

function ChildReviewSection<T extends keyof ChildCompleteFormData>({
  title,
  data,
  onEdit,
  id,
}: {
  title: string;
  id: T;
  data: ChildCompleteFormData[T];
  onEdit: () => void;
}) {
  const t = useTranslations('registration');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={'text-md'}>{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="size-4" />
          {t('actions.edit')}
        </Button>
      </CardHeader>
      <CardContent>
        <ChildReviewFields id={id} data={data} />
      </CardContent>
    </Card>
  );
}
