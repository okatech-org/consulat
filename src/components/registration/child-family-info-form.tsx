'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ParentalRole } from '@/convex/lib/constants';

export interface ChildFamilyInfoFormData {
  parentRole: ParentalRole;
  hasParentalAuthority: boolean;
  otherParentFirstName?: string;
  otherParentLastName?: string;
  otherParentEmail?: string;
  otherParentPhone?: string;
  familySituation?: string;
  otherInformation?: string;
}

interface ChildFamilyInfoFormProps {
  form: UseFormReturn<ChildFamilyInfoFormData>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ChildFamilyInfoForm({
  form,
  onSubmit,
  onBack,
  isLoading = false,
}: ChildFamilyInfoFormProps) {
  const t = useTranslations('user');
  const t_actions = useTranslations('common.actions');
  const hasOtherParent = form.watch('parentRole') !== undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('children.form.family_info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Controller
                name="hasParentalAuthority"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4" data-invalid={fieldState.invalid}>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    <div className="space-y-1 leading-none">
                      <FieldLabel htmlFor="child-family-has-authority">
                        {t('children.form.family_info.has_parental_authority')}
                      </FieldLabel>
                      <FieldDescription>
                        {t(
                          'children.form.family_info.has_parental_authority_description',
                        )}
                      </FieldDescription>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {hasOtherParent && (
                <>
                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    <Controller
                      name="otherParentFirstName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="child-family-other-firstname">
                            {t('children.form.family_info.other_parent_first_name')}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="child-family-other-firstname"
                            value={field.value || ''}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="otherParentLastName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="child-family-other-lastname">
                            {t('children.form.family_info.other_parent_last_name')}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="child-family-other-lastname"
                            value={field.value || ''}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    <Controller
                      name="otherParentEmail"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="child-family-other-email">
                            {t('children.form.family_info.other_parent_email')}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="child-family-other-email"
                            type="email"
                            value={field.value || ''}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="otherParentPhone"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="child-family-other-phone">
                            {t('children.form.family_info.other_parent_phone')}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="child-family-other-phone"
                            value={field.value || ''}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </>
              )}

              <Controller
                name="familySituation"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="child-family-situation">
                      {t('children.form.family_info.family_situation')}
                    </FieldLabel>
                    <FieldDescription>
                      {t('children.form.family_info.family_situation_description')}
                    </FieldDescription>
                    <Textarea
                      {...field}
                      id="child-family-situation"
                      value={field.value || ''}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="otherInformation"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="child-family-other-info">
                      {t('children.form.family_info.other_information')}
                    </FieldLabel>
                    <FieldDescription>
                      {t('children.form.family_info.other_information_description')}
                    </FieldDescription>
                    <Textarea
                      {...field}
                      id="child-family-other-info"
                      value={field.value || ''}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="mobile" onClick={onBack}>
            {t_actions('back')}
          </Button>
          <Button type="submit" size="mobile" weight="medium" disabled={isLoading}>
            {t_actions('next')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
