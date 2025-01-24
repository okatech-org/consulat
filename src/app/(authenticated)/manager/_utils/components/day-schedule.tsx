import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TimeSelect } from '@/components/ui/time-select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Key } from 'react';

export const DaySchedule = ({
  day,
  countryCode,
  form,
  t,
}: {
  day: string;
  countryCode: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) => {
  const slots =
    form.watch(`metadata.${countryCode}.settings.schedule.${day}.slots`) || [];

  return (
    <div className="space-y-4 rounded-lg bg-muted/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t(`organization.schedule.days.${day}`)}</h4>
        <Switch
          checked={form.watch(`metadata.${countryCode}.settings.schedule.${day}.isOpen`)}
          onCheckedChange={(checked) => {
            form.setValue(
              `metadata.${countryCode}.settings.schedule.${day}.isOpen`,
              checked,
            );
          }}
        />
      </div>

      {form.watch(`metadata.${countryCode}.settings.schedule.${day}.isOpen`) && (
        <div className="space-y-3">
          {slots.map((_: never, index: Key | null | undefined) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <TimeSelect
                    value={form.watch(
                      `metadata.${countryCode}.settings.schedule.${day}.slots.${index}.start`,
                    )}
                    onValueChange={(value) => {
                      form.setValue(
                        `metadata.${countryCode}.settings.schedule.${day}.slots.${index}.start`,
                        value,
                      );
                    }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <TimeSelect
                    value={form.watch(
                      `metadata.${countryCode}.settings.schedule.${day}.slots.${index}.end`,
                    )}
                    onValueChange={(value) => {
                      form.setValue(
                        `metadata.${countryCode}.settings.schedule.${day}.slots.${index}.end`,
                        value,
                      );
                    }}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="self-end"
                onClick={() => {
                  const currentSlots = form.watch(
                    `metadata.${countryCode}.settings.schedule.${day}.slots`,
                  );
                  form.setValue(
                    `metadata.${countryCode}.settings.schedule.${day}.slots`,
                    currentSlots.filter((_: never, i: number) => i !== index),
                  );
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              const currentSlots =
                form.watch(`metadata.${countryCode}.settings.schedule.${day}.slots`) ||
                [];
              form.setValue(`metadata.${countryCode}.settings.schedule.${day}.slots`, [
                ...currentSlots,
                { start: '09:00', end: '17:00' },
              ]);
            }}
          >
            {t('organization.schedule.add_slot')}
          </Button>
        </div>
      )}
    </div>
  );
};
