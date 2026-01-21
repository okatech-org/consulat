import { Switch } from '@/components/ui/switch';
import { TimeSelect } from '@/components/ui/time-select';
import { Button } from '@/components/ui/button';
import type { Key } from 'react';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';

export const DaySchedule = ({
  day,
  form,
  t,
  fieldName,
}: {
  day: string;
  countryCode?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  fieldName: string;
}) => {
  const slots = form.watch(`${fieldName}.slots`) || [];

  return (
    <div className="space-y-4 rounded-lg bg-muted/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t(`common.schedule.days.${day}`)}</h4>
        <Switch
          checked={form.watch(`${fieldName}.isOpen`)}
          onCheckedChange={(checked) => {
            form.setValue(`${fieldName}.isOpen`, checked);

            if (checked) {
              form.setValue(`${fieldName}.slots`, [{ start: '07:00', end: '20:00' }]);
            }
          }}
        />
      </div>

      {form.watch(`${fieldName}.isOpen`) && (
        <div className="space-y-3">
          {slots.map((_: never, index: Key | null | undefined) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Controller
                    name={`${fieldName}.slots.${index}.start`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`${fieldName}-slot-${index}-start`}>
                          {t('common.schedule.from')}
                        </FieldLabel>
                        <TimeSelect
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          interval={15}
                          startTime="07:00"
                          endTime="20:00"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Controller
                    name={`${fieldName}.slots.${index}.end`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`${fieldName}-slot-${index}-end`}>
                          {t('common.schedule.to')}
                        </FieldLabel>
                        <TimeSelect
                          interval={15}
                          startTime="07:00"
                          endTime="20:00"
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="self-end"
                onClick={() => {
                  const currentSlots = form.watch(`${fieldName}.slots`);
                  form.setValue(
                    `${fieldName}.slots`,
                    currentSlots.filter((_: never, i: number) => i !== index),
                  );
                }}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              const currentSlots = form.watch(`${fieldName}.slots`) || [];
              form.setValue(`${fieldName}.slots`, [
                ...currentSlots,
                { start: '09:00', end: '17:00' },
              ]);
            }}
          >
            {t('common.schedule.add_slot')}
          </Button>
        </div>
      )}
    </div>
  );
};
