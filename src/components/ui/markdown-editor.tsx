import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { useTranslations } from 'next-intl';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const t = useTranslations('notifications');
  const [preview, setPreview] = React.useState(false);

  return (
    <div>
      <div className="mb-2 flex justify-between">
        <label className="text-sm font-medium">{t('form.content')}</label>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="text-sm text-blue-500 hover:underline"
        >
          {preview ? t('form.edit') : t('form.preview')}
        </button>
      </div>
      {preview ? (
        <div className="prose prose-sm min-h-[200px] rounded border p-2">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('form.content_placeholder')}
          rows={10}
        />
      )}
      <p className="mt-1 text-sm text-gray-500">{t('form.markdown_support_info')}</p>
    </div>
  );
}
