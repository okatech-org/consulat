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
import { Pencil, Plus, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import TagsInput from '@/components/ui/tags-input';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ProfileField } from '@/types';
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
                leftIcon={<Pencil className="size-4" />}
                onClick={() => handleEditField(index)}
              />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash className="size-4" />}
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
        leftIcon={<Plus className="size-4" />}
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
              <FormField
                control={fieldForm.control}
                name="profileField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.steps.step.fields.profile_mapping')}</FormLabel>
                    <FormControl>
                      <MultiSelect<string>
                        options={profileFields.map((f) => ({
                          value: f.key,
                          label: t_inputs(`profile.${f.key}`),
                        }))}
                        selected={field.value}
                        onChange={(value) => {
                          const pField = profileFields.find((f) => f.key === value);

                          field.onChange(value);

                          if (pField) {
                            fieldForm.setValue('name', pField.key);
                            fieldForm.setValue(
                              'label',
                              t_inputs(`profile.${pField?.key}`),
                            );
                            fieldForm.setValue('type', pField.type);
                            fieldForm.setValue('required', pField?.required);
                          }
                        }}
                        type={'single'}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('form.steps.step.fields.profile_mapping_description')}
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={fieldForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.steps.step.fields.name')}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={fieldForm.watch('profileField') !== undefined}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fieldForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.steps.step.fields.label')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fieldForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.steps.step.fields.description')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fieldForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.steps.step.fields.type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <MultiSelect<ServiceFieldType>
                          disabled={fieldForm.watch('profileField') !== undefined}
                          options={fieldTypes.map((type) => ({
                            value: type,
                            label: t_inputs(`serviceFieldType.options.${type}`),
                          }))}
                          selected={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          type={'single'}
                        />
                      </FormControl>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t_inputs(`serviceFieldType.options.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fieldForm.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t('form.steps.step.fields.required')}</FormLabel>
                  </FormItem>
                )}
              />

              {/* Options supplémentaires selon le type */}
              {fieldForm.watch('type') === 'select' && (
                <FormField
                  control={fieldForm.control}
                  name="options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.steps.step.fields.options')}</FormLabel>
                      <TagsInput
                        value={field.value?.map((o) => o.value) || []}
                        onChange={(values) => {
                          field.onChange(values.map((v) => ({ value: v, label: v })));
                        }}
                      />
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
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
