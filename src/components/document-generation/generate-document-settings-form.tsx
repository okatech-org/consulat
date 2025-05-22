import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Trash, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DocumentTemplate, RequestStatus, ServiceStep } from '@prisma/client';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CardContainer from '@/components/layouts/card-container';
import { useMemo, useCallback, useState, useEffect } from 'react';

// Types
interface FieldMapping {
  name: string;
  stepId: string;
}

interface GenerateDocumentSettingsItem {
  id?: string;
  serviceId?: string;
  templateId: string;
  generateOnStatus: RequestStatus[];
  settings?: {
    matchings?: Record<string, FieldMapping>;
  };
  // Legacy support - can be removed once all data is migrated
  matchings?: Record<string, FieldMapping>;
}

interface StepField {
  label: string;
  name: string;
  stepId: string;
}

interface GenerateDocumentSettingsFormProps {
  templates: DocumentTemplate[];
  statuses: RequestStatus[];
  value: GenerateDocumentSettingsItem[];
  onChange: (value: GenerateDocumentSettingsItem[]) => void;
  disabled?: boolean;
  steps: ServiceStep[];
}

// Utility functions
const extractDynamicFields = (template: DocumentTemplate): string[] => {
  if (!template.content || typeof template.content !== 'string') return [];
  const matches = template.content.match(/\{\{(.*?)\}\}/g) || [];
  return matches.map((match) => match.replace(/\{\{|\}\}/g, '').trim());
};

const extractStepFields = (steps: ServiceStep[]): StepField[] => {
  return steps.flatMap((step) => {
    if (!step.fields || !Array.isArray(step.fields)) return [];

    return step.fields
      .filter(
        (field): field is { name: string; label: string } =>
          typeof field === 'object' &&
          field !== null &&
          'name' in field &&
          'label' in field &&
          typeof field.name === 'string' &&
          typeof field.label === 'string',
      )
      .map((field) => ({
        label: field.label,
        name: field.name,
        stepId: step.id,
      }));
  });
};

// Main component
export function GenerateDocumentSettingsForm({
  templates,
  statuses,
  value,
  onChange,
  disabled = false,
  steps,
}: GenerateDocumentSettingsFormProps) {
  const t = useTranslations('inputs');

  const stepFields = useMemo(() => extractStepFields(steps), [steps]);

  const handleItemChange = useCallback(
    (index: number, updates: Partial<GenerateDocumentSettingsItem>) => {
      onChange(value.map((item, i) => (i === index ? { ...item, ...updates } : item)));
    },
    [value, onChange],
  );

  const handleAdd = useCallback(() => {
    onChange([
      ...value,
      {
        templateId: '',
        generateOnStatus: [],
        settings: { matchings: {} },
      },
    ]);
  }, [value, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  return (
    <div className="space-y-4">
      {value.map((item, index) => (
        <ConfigItem
          key={item.id || index}
          index={index}
          config={item}
          templates={templates}
          statuses={statuses}
          stepFields={stepFields}
          onChange={(updates) => handleItemChange(index, updates)}
          onRemove={() => handleRemove(index)}
          disabled={disabled}
        />
      ))}

      <Button type="button" variant="outline" onClick={handleAdd} disabled={disabled}>
        <Plus className="mr-2 size-4" />
        {t('documentGeneration.config.add')}
      </Button>
    </div>
  );
}

// Config item component
interface ConfigItemProps {
  index: number;
  config: GenerateDocumentSettingsItem;
  templates: DocumentTemplate[];
  statuses: RequestStatus[];
  stepFields: StepField[];
  onChange: (updates: Partial<GenerateDocumentSettingsItem>) => void;
  onRemove: () => void;
  disabled: boolean;
}

function ConfigItem({
  index,
  config,
  templates,
  statuses,
  stepFields,
  onChange,
  onRemove,
  disabled,
}: ConfigItemProps) {
  const t = useTranslations('inputs');

  // Get current mappings from config (support both new and legacy structure)
  const currentMappings = config.settings?.matchings || config.matchings || {};

  // Local state for mappings
  const [matchings, setMatchings] =
    useState<Record<string, FieldMapping>>(currentMappings);

  // Get selected template
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === config.templateId),
    [templates, config.templateId],
  );

  // Extract dynamic fields from selected template
  const dynamicFields = useMemo(
    () => (selectedTemplate ? extractDynamicFields(selectedTemplate) : []),
    [selectedTemplate],
  );

  // Update local mappings when config changes externally
  useEffect(() => {
    const newMappings = config.settings?.matchings || config.matchings || {};
    setMatchings(newMappings);
  }, [config.settings?.matchings, config.matchings]);

  // Handle template change
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const newTemplate = templates.find((template) => template.id === templateId);
      const newDynamicFields = newTemplate ? extractDynamicFields(newTemplate) : [];

      // Reset mappings when template changes, keeping only existing mappings for fields that still exist
      const filteredMappings: Record<string, FieldMapping> = {};
      newDynamicFields.forEach((field) => {
        if (matchings[field]) {
          filteredMappings[field] = matchings[field];
        }
      });

      setMatchings(filteredMappings);
      onChange({
        templateId,
        settings: {
          ...config.settings,
          matchings: filteredMappings,
        },
      });
    },
    [templates, matchings, onChange, config.settings],
  );

  // Handle field mapping change
  const handleFieldMappingChange = useCallback(
    (field: string, selectedValue: string) => {
      let newMappings = { ...matchings };

      if (!selectedValue) {
        delete newMappings[field];
      } else {
        const [name, stepId] = selectedValue.split('|');
        if (name && stepId) {
          newMappings[field] = { name, stepId };
        }
      }

      setMatchings(newMappings);
      onChange({
        settings: {
          ...config.settings,
          matchings: newMappings,
        },
      });
    },
    [matchings, onChange, config.settings],
  );

  // Get current mapping value for a field
  const getMappingValue = useCallback(
    (field: string): string => {
      const mapping = matchings[field];
      return mapping ? `${mapping.name}|${mapping.stepId}` : '';
    },
    [matchings],
  );

  return (
    <CardContainer
      title={t('documentGeneration.config.title', { index: index + 1 })}
      action={
        <Button variant="ghost" size="sm" onClick={onRemove} disabled={disabled}>
          <Trash className="size-4" />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Template Selection */}
        <div className="flex flex-col gap-2">
          <Label>{t('documentGeneration.config.template.label')}</Label>
          <MultiSelect<string>
            type="single"
            options={templates.map((template) => ({
              label: template.name,
              value: template.id,
            }))}
            selected={config.templateId}
            onChange={handleTemplateChange}
            placeholder={t('documentGeneration.config.template.placeholder')}
            disabled={disabled}
            className="w-max"
          />
        </div>

        {/* Status Selection */}
        <div className="flex flex-col gap-2">
          <Label>{t('documentGeneration.config.status.label')}</Label>
          <MultiSelect<RequestStatus>
            type="multiple"
            options={statuses.map((status) => ({
              label: t(`requestStatus.options.${status}`),
              value: status,
            }))}
            selected={config.generateOnStatus}
            onChange={(generateOnStatus) => onChange({ generateOnStatus })}
            placeholder={t('documentGeneration.config.status.placeholder')}
            disabled={disabled}
            className="w-max"
          />
        </div>

        {/* Dynamic Field Mapping */}
        {dynamicFields.length > 0 && (
          <FieldMappingSection
            dynamicFields={dynamicFields}
            stepFields={stepFields}
            getValue={getMappingValue}
            onChange={handleFieldMappingChange}
            disabled={disabled}
          />
        )}
      </div>
    </CardContainer>
  );
}

// Field mapping section component
interface FieldMappingSectionProps {
  dynamicFields: string[];
  stepFields: StepField[];
  getValue: (field: string) => string;
  onChange: (field: string, value: string) => void;
  disabled: boolean;
}

function FieldMappingSection({
  dynamicFields,
  stepFields,
  getValue,
  onChange,
  disabled,
}: FieldMappingSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>Attribution des champs dynamiques</Label>
      <div className="flex flex-col gap-2">
        {dynamicFields.map((dynamicField) => (
          <div key={dynamicField} className="flex items-center gap-2">
            <Badge variant="info">{dynamicField}</Badge>
            <MultiSelect<string>
              type="single"
              options={stepFields.map((field) => ({
                label: field.label,
                value: `${field.name}|${field.stepId}`,
              }))}
              selected={getValue(dynamicField)}
              onChange={(value) => onChange(dynamicField, value)}
              placeholder="Sélectionner un champ du formulaire..."
              disabled={disabled}
              className="w-max"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
