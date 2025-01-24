'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';

export interface TimeSelectProps extends React.ComponentPropsWithoutRef<typeof Select> {
  interval?: number; // Intervalle en minutes entre les horaires
  startTime?: string; // Format "HH:mm"
  endTime?: string; // Format "HH:mm"
  excludedTimes?: string[]; // Horaires à exclure
  className?: string;
}

export function TimeSelect({
  interval = 30,
  startTime = '09:00',
  endTime = '17:00',
  excludedTimes = [],
  className,
  ...props
}: TimeSelectProps) {
  // Générer les horaires disponibles
  const generateTimeSlots = React.useCallback(() => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    for (let minutes = start; minutes <= end; minutes += interval) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      if (!excludedTimes.includes(time)) {
        slots.push(time);
      }
    }

    return slots;
  }, [interval, startTime, endTime, excludedTimes]);

  const timeSlots = React.useMemo(() => generateTimeSlots(), [generateTimeSlots]);

  return (
    <Select {...props}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Sélectionnez un horaire" />
      </SelectTrigger>
      <SelectContent>
        {timeSlots.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
