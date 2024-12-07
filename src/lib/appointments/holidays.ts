interface Holiday {
  date: Date
  name: string
  type: 'NATIONAL' | 'CONSULAR'
}

export const FRENCH_HOLIDAYS_2024: Holiday[] = [
  { date: new Date(2024, 0, 1), name: "Jour de l'an", type: 'NATIONAL' },
  { date: new Date(2024, 3, 1), name: "Lundi de Pâques", type: 'NATIONAL' },
]

export const GABONESE_HOLIDAYS_2024: Holiday[] = [
  { date: new Date(2024, 7, 17), name: "Fête nationale", type: 'NATIONAL' },
]

export function isHoliday(date: Date): boolean {
  const allHolidays = [...FRENCH_HOLIDAYS_2024, ...GABONESE_HOLIDAYS_2024]
  return allHolidays.some(holiday =>
    holiday.date.getFullYear() === date.getFullYear() &&
    holiday.date.getMonth() === date.getMonth() &&
    holiday.date.getDate() === date.getDate()
  )
}