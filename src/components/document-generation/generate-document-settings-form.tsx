import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DocumentTemplate, RequestStatus } from '@prisma/client';
import { Label } from '@/components/ui/label';

interface GenerateDocumentSettingsItem {
  templateId: string;
  generateOnStatus: RequestStatus[];
}

interface GenerateDocumentSettingsFormProps {
  templates: DocumentTemplate[];
  statuses: RequestStatus[];
  value: GenerateDocumentSettingsItem[];
  onChange: (value: GenerateDocumentSettingsItem[]) => void;
  disabled?: boolean;
}

export function GenerateDocumentSettingsForm({
  templates,
  statuses,
  value,
  onChange,
  disabled = false,
}: GenerateDocumentSettingsFormProps) {
  const t = useTranslations('inputs');

  const handleChange = (index: number, item: Partial<GenerateDocumentSettingsItem>) => {
    const newValue = value.map((v, i) => (i === index ? { ...v, ...item } : v));
    onChange(newValue);
  };

  const handleAdd = () => {
    onChange([...value, { templateId: '', generateOnStatus: [] }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {value.map((item, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">
              {t('documentGeneration.config.title', { index: idx + 1 })}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(idx)}
              disabled={disabled}
            >
              <Trash className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('documentGeneration.config.template.label')}</Label>
              <MultiSelect<string>
                type="single"
                options={templates.map((tpl) => ({
                  label: tpl.name,
                  value: tpl.id,
                }))}
                selected={item.templateId}
                onChange={(val) => handleChange(idx, { templateId: val })}
                placeholder={t('documentGeneration.config.template.placeholder')}
                disabled={disabled}
                className="w-max"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('documentGeneration.config.status.label')}</Label>
              <MultiSelect<RequestStatus>
                type="multiple"
                options={statuses.map((status) => ({
                  label: t(`requestStatus.options.${status}`),
                  value: status,
                }))}
                selected={item.generateOnStatus}
                onChange={(val) => handleChange(idx, { generateOnStatus: val })}
                placeholder={t('documentGeneration.config.status.placeholder')}
                disabled={disabled}
                className="w-max"
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={handleAdd} disabled={disabled}>
        <Plus className="mr-2 size-4" />
        {t('documentGeneration.config.add')}
      </Button>
    </div>
  );
}
