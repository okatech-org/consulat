'use client';

import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { NoteType } from '@prisma/client';

interface ValidationNotesProps {
  onSubmit: (data: { content: string; type: NoteType }) => Promise<void>;
  isLoading?: boolean;
  defaultType?: NoteType;
}

export function ValidationNotes({
  onSubmit,
  isLoading = false,
  defaultType = 'INTERNAL',
}: ValidationNotesProps) {
  const t = useTranslations('admin.registrations.review.notes');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>(defaultType);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit({ content, type });
    setContent('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('type')}</Label>
        <Select value={type} onValueChange={(value) => setType(value as NoteType)}>
          <SelectTrigger>
            <SelectValue placeholder={t('select_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INTERNAL">{t('types.internal')}</SelectItem>
            <SelectItem value="FEEDBACK">{t('types.feedback')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('content')}</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t(
            type === 'INTERNAL' ? 'internal_placeholder' : 'feedback_placeholder',
          )}
          className="min-h-[100px]"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !content.trim()}
        className="w-full"
      >
        {t('add')}
      </Button>
    </div>
  );
}
