import { Organization, AppointmentType } from '@prisma/client';
import { addMinutes, setMinutes, setHours, isWithinInterval, format } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// Durées par type de rendez-vous (en minutes)
export const APPOINTMENT_DURATIONS: Record<AppointmentType, number> = {
  DOCUMENT_COLLECTION: 15,
  DOCUMENT_SUBMISSION: 30,
  FIRST_REGISTRATION: 45,
  INTERVIEW: 45,
  MARRIAGE_CEREMONY: 60,
  EMERGENCY: 60,
  OTHER: 30,
};

// Quotas journaliers par durée
export const DAILY_QUOTAS: Record<number, number> = {
  15: 12, // 12 créneaux de 15min par jour
  30: 8,  // 8 créneaux de 30min par jour
  45: 6,  // 6 créneaux de 45min par jour
  60: 4,  // 4 créneaux de 60min par jour
};

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];
}

interface OrganizationSchedule {
  [day: string]: DaySchedule;
}

interface Holiday {
  date: string;
  name: string;
}

interface Closure {
  start: string;
  end: string;
  reason: string;
}

export function isHolidayOrClosure(
  date: Date,
  organization: Organization,
  countryCode: string
): boolean {
  const metadata = organization.metadata as any;
  const settings = metadata?.settings?.[countryCode];
  
  if (!settings) return false;

  const { holidays = [], closures = [] } = settings;

  // Vérifier les jours fériés
  const isHoliday = holidays.some((holiday: Holiday) => 
    format(new Date(holiday.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );

  // Vérifier les fermetures exceptionnelles
  const isClosure = closures.some((closure: Closure) => 
    isWithinInterval(date, {
      start: new Date(closure.start),
      end: new Date(closure.end)
    })
  );

  return isHoliday || isClosure;
}

export function getDaySchedule(
  date: Date,
  organization: Organization,
  countryCode: string
): DaySchedule | null {
  const metadata = organization.metadata as any;
  const settings = metadata?.settings?.[countryCode];
  
  if (!settings?.schedule) return null;

  const schedule = settings.schedule as OrganizationSchedule;
  const dayOfWeek = date.getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  return schedule[days[dayOfWeek]] || null;
}

export function generateAvailableSlots(
  date: Date,
  organization: Organization,
  countryCode: string,
  appointmentType: AppointmentType
): Date[] {
  // Récupérer le fuseau horaire du pays
  const countryMetadata = organization.countries.find(c => c.code === countryCode)?.metadata as any;
  const timeZone = countryMetadata?.timeZone || 'UTC';

  // Convertir la date en tenant compte du fuseau horaire
  const zonedDate = utcToZonedTime(date, timeZone);

  // Vérifier si c'est un jour férié ou une fermeture
  if (isHolidayOrClosure(zonedDate, organization, countryCode)) {
    return [];
  }

  // Récupérer les horaires du jour
  const daySchedule = getDaySchedule(zonedDate, organization, countryCode);
  if (!daySchedule || !daySchedule.isOpen) {
    return [];
  }

  const duration = APPOINTMENT_DURATIONS[appointmentType];
  const slots: Date[] = [];
  const quota = DAILY_QUOTAS[duration] || 8; // Quota par défaut si non spécifié

  // Générer les créneaux pour chaque plage horaire
  daySchedule.slots.forEach(({ start, end }) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    let currentSlot = setMinutes(setHours(zonedDate, startHour), startMinute);
    const endTime = setMinutes(setHours(zonedDate, endHour), endMinute);

    while (currentSlot < endTime && slots.length < quota) {
      // Convertir le créneau en UTC pour le stockage
      const utcSlot = zonedTimeToUtc(currentSlot, timeZone);
      slots.push(utcSlot);
      currentSlot = addMinutes(currentSlot, duration);
    }
  });

  return slots;
} 