import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Trash, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DocumentTemplate, RequestStatus, ServiceStep } from '@prisma/client';
import { Label } from '@/components/ui/label';
import CardContainer from '@/components/layouts/card-container';
import { Fragment } from 'react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface GenerateDocumentSettingsItem {
  id?: string;
  serviceId?: string;
  templateId: string;
  generateOnStatus: RequestStatus[];
}

interface GenerateDocumentSettingsFormProps {
  templates: DocumentTemplate[];
  statuses: RequestStatus[];
  value: GenerateDocumentSettingsItem[];
  onChange: (value: GenerateDocumentSettingsItem[]) => void;
  disabled?: boolean;
  steps: ServiceStep[];
}

export function GenerateDocumentSettingsForm({
  templates,
  statuses,
  value,
  onChange,
  disabled = false,
  steps,
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
        <Fragment key={item.id || idx}>
          <ConfigItem
            index={idx}
            config={item}
            templates={templates}
            statuses={statuses}
            onChange={(config) => handleChange(idx, config)}
            onRemove={() => handleRemove(idx)}
            disabled={disabled}
            steps={steps}
          />
        </Fragment>
      ))}
      <Button type="button" variant="outline" onClick={handleAdd} disabled={disabled}>
        <Plus className="mr-2 size-4" />
        {t('documentGeneration.config.add')}
      </Button>
    </div>
  );
}

function getDynamicFieldsFromDocumentTemplate(template: DocumentTemplate): string[] {
  // Use regex to find all {{fieldName}} patterns
  const matches = template.content.match(/\{\{(.*?)\}\}/g) || [];
  // Remove the curly braces and trim whitespace
  return matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim());
}

export type StepField = {
  label: string;
  name: string;
  stepId: string;
  matchKey?: string;
};

function ConfigItem({
  index,
  config,
  templates,
  steps,
  statuses,
  onChange,
  onRemove,
  disabled,
}: {
  index: number;
  config: GenerateDocumentSettingsItem;
  templates: DocumentTemplate[];
  steps: ServiceStep[];
  statuses: RequestStatus[];
  onChange: (config: GenerateDocumentSettingsItem) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const [matchingFields, setMatchingFields] = useState<StepField[]>([]);
  const t = useTranslations('inputs');
  const selectedTemplate = templates.find((item) => item.id === config.templateId);

  const dynamicFields = selectedTemplate
    ? getDynamicFieldsFromDocumentTemplate(selectedTemplate)
    : [];

  useEffect(() => {
    const stepFields: Array<StepField> = [];

    steps.forEach((step) => {
      step.fields?.forEach((field) => {
        stepFields.push({
          label: field.label,
          name: field.name,
          stepId: step.id,
          matchKey: undefined,
        });
      });
    });

    setMatchingFields(stepFields);
  }, [config.templateId, steps, templates]);

  return (
    <CardContainer
      title={t('documentGeneration.config.title', { index: index + 1 })}
      action={
        <Button variant="ghost" size="sm" onClick={() => onRemove()} disabled={disabled}>
          <Trash className="size-4" />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>{t('documentGeneration.config.template.label')}</Label>
          <MultiSelect<string>
            type="single"
            options={templates.map((tpl) => ({
              label: tpl.name,
              value: tpl.id,
            }))}
            selected={config.templateId}
            onChange={(val) => onChange({ ...config, templateId: val })}
            placeholder={t('documentGeneration.config.template.placeholder')}
            disabled={disabled}
            className="w-max"
          />
        </div>

        {matchingFields.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>{'Attribution des champs'}</Label>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Champs du template :</span>
              {matchingFields.map((field) => (
                <Badge variant={'info'} key={field.name}>
                  {field.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label>{t('documentGeneration.config.status.label')}</Label>
          <MultiSelect<RequestStatus>
            type="multiple"
            options={statuses.map((status) => ({
              label: t(`requestStatus.options.${status}`),
              value: status,
            }))}
            selected={config.generateOnStatus}
            onChange={(val) => onChange({ ...config, generateOnStatus: val })}
            placeholder={t('documentGeneration.config.status.placeholder')}
            disabled={disabled}
            className="w-max"
          />
        </div>
      </div>
    </CardContainer>
  );
}
