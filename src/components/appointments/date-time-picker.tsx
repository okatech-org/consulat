'use client';

import { Calendar } from '@/components/ui/calendar';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isBefore, startOfToday } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { TimeSlot } from '@prisma/client';
import { getAvailableSlots } from '@/actions/appointments';

interface DateTimePickerProps {
  organizationId: string;
  countryCode: string;
  serviceId: string;
  value?: { date: Date; time: string };
  onChange: (value: { date: Date; time: string }) => void;
}

export function DateTimePicker({
  organizationId,
  countryCode,
  serviceId,
  value,
  onChange,
}: DateTimePickerProps) {
  const t = useTranslations('user.dashboard.appointments');
  const [date, setDate] = useState<Date | undefined>(value?.date);
  const [time, setTime] = useState<string | undefined>(value?.time);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSlots() {
      if (!date) return;

      setIsLoading(true);
      try {
        const availableSlots = await getAvailableSlots({
          date,
          organizationId,
          countryCode,
          serviceId,
        });
        setSlots(availableSlots);
      } catch (error) {
        console.error('Error loading slots:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSlots();
  }, [date, organizationId, countryCode, serviceId]);

  return (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP', { locale: fr }) : t('date_picker.select_date')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={fr}
            disabled={(date) => isBefore(date, startOfToday())}
          />
        </PopoverContent>
      </Popover>

      {date && (
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : slots.length > 0 ? (
              <ScrollArea className="h-40">
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.startTime.toISOString()}
                      variant={
                        time === format(slot.startTime, 'HH:mm') ? 'default' : 'outline'
                      }
                      onClick={() => {
                        setTime(format(slot.startTime, 'HH:mm'));
                        onChange({
                          date,
                          time: format(slot.startTime, 'HH:mm'),
                        });
                      }}
                      className="w-full"
                    >
                      {format(slot.startTime, 'HH:mm')}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">{t('date_picker.no_slots')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
