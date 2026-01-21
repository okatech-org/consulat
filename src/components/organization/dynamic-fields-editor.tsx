import { Button } from '@/components/ui/button';
import {
  fieldTypes,
  type ServiceField,
  type ServiceFieldType,
} from '@/types/consular-service';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import TagsInput from '@/components/ui/tags-input';
import { Switch } from '@/components/ui/switch';
import type { ProfileField } from '@/types/profile';
import { ServiceFieldSchema } from '@/schemas/consular-service';
import { MultiSelect } from '@/components/ui/multi-select';

interface DynamicFieldsEditorProps {
  fields: ServiceField[];
  onChange: (fields: ServiceField[]) => void;
  profileFields: ProfileField[];
}

export function DynamicFieldsEditor({
  fields,
  onChange,
  profileFields,
}: DynamicFieldsEditorProps) {
  const t_inputs = useTranslations('inputs');
  const t = useTranslations('services');
  const t_common = useTranslations('common');

  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);

  const fieldForm = useForm<ServiceField>({
    resolver: zodResolver(ServiceFieldSchema),
    defaultValues: {
      name: '',
      type: 'text',
      label: '',
      description: '',
      required: false,
    },
  });

  const handleAddField = (data: ServiceField) => {
    if (editingFieldIndex === -1) {
      onChange([...fields, data]);
    } else {
      const newFields = [...fields];
      newFields[editingFieldIndex] = data;
      onChange(newFields);
    }
    setShowFieldDialog(false);
    fieldForm.reset();
  };

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index);
    fieldForm.reset(fields[index]);
    setShowFieldDialog(true);
  };

  const handleDeleteField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Liste des champs */}
      {fields.map((field, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{field.label}</h4>
              <p className="text-sm text-muted-foreground">
                {t_inputs(`serviceFieldType.options.${field.type}`)}
                {field.required && ' • ' + t('form.steps.step.fields.required')}
                {field.profileField &&
                  ` • ${t('form.steps.step.fields.mapped_to', {
                    field: t_inputs(`profile.${field.profileField}`),
                  })}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditField(index)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteField(index)}
              />
            </div>
          </div>
        </Card>
      ))}

      {/* Bouton d'ajout */}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setEditingFieldIndex(-1);
          fieldForm.reset();
          setShowFieldDialog(true);
        }}
      >
        {t('form.steps.step.fields.add')}
      </Button>

      {/* Dialog d'édition de champ */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFieldIndex === -1
                ? t('form.steps.step.fields.add')
                : t('form.steps.step.fields.edit')}
            </DialogTitle>
          </DialogHeader>

          <Form {...fieldForm}>
            <form ref={formRef} className="space-y-4">
              {/* Mapping avec un champ de profil */}
              <Field name="profileField">
                <FieldLabel>{t('form.steps.step.fields.profile_mapping')}</FieldLabel>
                <MultiSelect<string>
                  options={profileFields.map((f) => ({
                    value: f.path,
                    label: t_inputs(`profile.${f.path}`),
                  }))}
                  selected={fieldForm.watch('profileField')}
                  onChange={(value) => {
                    const pField = profileFields.find((f) => f.path === value);

                    fieldForm.setValue('profileField', value);

                    if (pField) {
                      fieldForm.setValue('name', pField.path);
                      fieldForm.setValue(
                        'label',
                        t_inputs(`profile.${pField?.path}`),
                      );
                      fieldForm.setValue('type', pField.type as ServiceFieldType);
                    }
                  }}
                  type={'single'}
                />
                <FieldDescription>
                  {t('form.steps.step.fields.profile_mapping_description')}
                </FieldDescription>
                <FieldError />
              </Field>

                <Field name="name">
                <FieldLabel>{t('form.steps.step.fields.name')}</FieldLabel>
                <Input
                  disabled={fieldForm.watch('profileField') !== undefined}
                  {...fieldForm.register('name')}
                  value={fieldForm.watch('name') || ''}
                />
                <FieldError />
              </Field>

              <Field name="label">
                <FieldLabel>{t('form.steps.step.fields.label')}</FieldLabel>
                <Input
                  {...fieldForm.register('label')}
                  value={fieldForm.watch('label') || ''}
                />
                <FieldError />
              </Field>

              <Field name="description">
                <FieldLabel>{t('form.steps.step.fields.description')}</FieldLabel>
                <Input
                  {...fieldForm.register('description')}
                  value={fieldForm.watch('description') || ''}
                />
                <FieldError />
              </Field>

              <Field name="type">
                <FieldLabel>{t('form.steps.step.fields.type')}</FieldLabel>
                <MultiSelect<ServiceFieldType>
                  disabled={fieldForm.watch('profileField') !== undefined}
                  options={fieldTypes.map((type) => ({
                    value: type,
                    label: t_inputs(`serviceFieldType.options.${type}`),
                  }))}
                  selected={fieldForm.watch('type')}
                  onChange={(value) => {
                    fieldForm.setValue('type', value);
                  }}
                  type={'single'}
                />
                <FieldError />
              </Field>

              <Field name="required" className="flex items-center gap-2">
                <Switch
                  checked={fieldForm.watch('required')}
                  onCheckedChange={(checked) => fieldForm.setValue('required', checked)}
                />
                <FieldLabel>{t('form.steps.step.fields.required')}</FieldLabel>
                <FieldError />
              </Field>

              {/* Options supplémentaires selon le type */}
              {fieldForm.watch('type') === 'select' && (
                <Field name="options">
                  <FieldLabel>{t('form.steps.step.fields.options')}</FieldLabel>
                  <TagsInput
                    value={fieldForm.watch('options')?.map((o) => o.value) || []}
                    onChange={(values) => {
                      fieldForm.setValue('options', values.map((v) => ({ value: v, label: v })));
                    }}
                  />
                  <FieldError />
                </Field>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFieldDialog(false)}
                >
                  {t_common('actions.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const errors = fieldForm.formState.errors;
                    if (Object.entries(errors).length === 0) {
                      handleAddField(fieldForm.getValues());
                    }
                  }}
                >
                  {editingFieldIndex === -1
                    ? t_common('actions.add')
                    : t_common('actions.update')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
