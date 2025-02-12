'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  format,
  isBefore,
  startOfToday,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { generateBaseSlotsFromSchedule, generateTimeSlots } from '@/actions/appointments';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SelectSingleEventHandler } from 'react-day-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TradFormMessage } from '@/components/ui/form';

interface TimeSlotPickerProps {
  consulateId: string;
  duration: number;
  onSelect: (data: { date: Date; time: string }) => void;
  isLoading?: boolean;
  selectedDate?: Date | null;
  selectedTime?: string | null;
}

type ViewMode = 'day' | 'week';

export function TimeSlotPicker({
  consulateId,
  duration,
  onSelect,
  selectedDate,
  selectedTime,
}: TimeSlotPickerProps) {
  const t = useTranslations('appointments.datetime');

  const [date, setDate] = useState<Date | undefined>(selectedDate ?? undefined);
  const [time, setTime] = useState<string | null>(selectedTime ?? null);
  const [slots, setSlots] = useState<Date[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Fonction pour désactiver les dates passées et weekends
  const disableDate = (date: Date) => {
    const today = startOfToday();
    return isBefore(date, today) || [0, 6].includes(date.getDay());
  };

  // Charger les créneaux disponibles pour une période donnée
  const loadSlots = async (startDate: Date, endDate: Date) => {
    setLoadingSlots(true);
    try {
      const availableSlots = await generateBaseSlotsFromSchedule({
        consulateId,
        date: startDate,
        duration,
      });
      setSlots(availableSlots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Charger les créneaux disponibles quand une date est sélectionnée
  const handleDateSelect: SelectSingleEventHandler = (newDate) => {
    setDate(newDate ?? undefined);
    setTime(null);

    if (!newDate) {
      setSlots([]);
      return;
    }

    if (viewMode === 'day') {
      loadSlots(newDate, newDate);
    } else {
      const weekStart = startOfWeek(newDate, { locale: fr });
      const weekEnd = endOfWeek(newDate, { locale: fr });
      loadSlots(weekStart, weekEnd);
    }
  };

  // Gérer la sélection d'un créneau
  const handleTimeSelect = (slotDate: Date, slotTime: string) => {
    setTime(slotTime);
    onSelect({ date: slotDate, time: slotTime });
  };

  const renderTimeSlots = (day: Date) => {
    const daySlots = slots.filter(
      (slot) => format(slot, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'),
    );

    if (daySlots.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-4 text-center text-muted-foreground">
          <p>{t('no_slots')}</p>
          <p className="text-sm">{t('no_slots_description')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 p-1">
        {daySlots.map((slot) => (
          <Button
            type="button"
            key={slot.toISOString()}
            variant={time === format(slot, 'HH:mm') ? 'default' : 'outline'}
            onClick={() => handleTimeSelect(day, format(slot, 'HH:mm'))}
            className="w-full"
          >
            {format(slot, 'HH:mm')}
          </Button>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    if (!date) return null;

    const weekStart = startOfWeek(date, { locale: fr });
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(date, { locale: fr }),
    });

    return (
      <div className="grid grid-cols-5 gap-4">
        {weekDays.slice(0, 5).map((day) => (
          <Card key={day.toISOString()}>
            <CardContent className="p-3">
              <div className="mb-2 text-center font-medium">
                {format(day, 'EEEE d MMMM', { locale: fr })}
              </div>
              {renderTimeSlots(day)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        disabled={disableDate}
        locale={fr}
        className="rounded-md border"
      />

      {date && (
        <Card>
          <CardContent className="pt-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="day">{t('view.day')}</TabsTrigger>
                <TabsTrigger value="week">{t('view.week')}</TabsTrigger>
              </TabsList>

              {loadingSlots ? (
                <div className="flex h-[200px] items-center justify-center">
                  <Loader className="size-6 animate-spin" />
                </div>
              ) : (
                <>
                  <TabsContent value="day">
                    <ScrollArea className="h-[300px]">{renderTimeSlots(date)}</ScrollArea>
                  </TabsContent>
                  <TabsContent value="week">
                    <ScrollArea className="h-[500px]">{renderWeekView()}</ScrollArea>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!date && <TradFormMessage className="text-center text-muted-foreground" />}
    </div>
  );
}
