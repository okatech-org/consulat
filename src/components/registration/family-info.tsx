import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { MaritalStatus } from '@prisma/client';
import { FamilyInfoFormData } from '@/schemas/registration';
import { Separator } from '@/components/ui/separator';

interface FamilyInfoFormProps {
  form: UseFormReturn<FamilyInfoFormData>;
  onSubmit: (data: FamilyInfoFormData) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
  banner?: React.ReactNode;
}

export function FamilyInfoForm({
  form,
  onSubmit,
  formRef,
  isLoading = false,
  banner,
}: Readonly<FamilyInfoFormProps>) {
  const t_inputs = useTranslations('inputs');

  const maritalStatus = form.watch('maritalStatus');
  const showSpouseFields =
    maritalStatus === MaritalStatus.MARRIED ||
    maritalStatus === MaritalStatus.COHABITING ||
    maritalStatus === MaritalStatus.CIVIL_UNION;

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {banner}
        {/* État civil */}

        <div className={'space-y-6 pt-4'}>
          <div>
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('maritalStatus.label')}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (
                        value !== MaritalStatus.MARRIED &&
                        value !== MaritalStatus.COHABITING &&
                        value !== MaritalStatus.CIVIL_UNION
                      ) {
                        form.setValue('spouseFullName', undefined);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isLoading}>
                        <SelectValue placeholder={t_inputs('maritalStatus.select')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MaritalStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t_inputs(`maritalStatus.options.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* Champs spécifiques si marié(e) */}
            {showSpouseFields && (
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="spouseFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('spouseName.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder={t_inputs('spouseName.placeholder')}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="fatherFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('fatherName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder={t_inputs('fatherName.placeholder')}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motherFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('motherName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder={t_inputs('motherName.placeholder')}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
