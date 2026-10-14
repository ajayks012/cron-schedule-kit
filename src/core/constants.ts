import type {
  CustomScheduleOption,
  DayOfMonthOption,
  TimeOption,
  WeekdayOption,
} from './types';

export const SCHEDULE_PRESETS = {
  DAILY: '0 1 * * *',
  WEEKLY: '0 1 * * 6',
  MONTHLY: '0 1 1 * *',
} as const;

export const CUSTOM_SCHEDULE_OPTIONS: readonly CustomScheduleOption[] = [
  { value: 'day:1', unit: 'day', interval: 1, label: 'Every day' },
  { value: 'day:2', unit: 'day', interval: 2, label: 'Every 2 days' },
  { value: 'day:3', unit: 'day', interval: 3, label: 'Every 3 days' },
  { value: 'day:7', unit: 'day', interval: 7, label: 'Every 7 days' },
  { value: 'day:14', unit: 'day', interval: 14, label: 'Every 14 days' },
  { value: 'day:30', unit: 'day', interval: 30, label: 'Every 30 days' },
  { value: 'week:1', unit: 'week', interval: 1, label: 'Every week (pick a day)' },
  { value: 'month:1', unit: 'month', interval: 1, label: 'Every month (pick a day)' },
  { value: 'month:2', unit: 'month', interval: 2, label: 'Every 2 months (pick a day)' },
  { value: 'month:3', unit: 'month', interval: 3, label: 'Every quarter — 3 months (pick a day)' },
  { value: 'month:6', unit: 'month', interval: 6, label: 'Every 6 months (pick a day)' },
] as const;

export const WEEKDAY_OPTIONS: readonly WeekdayOption[] = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
] as const;

function getOrdinalSuffix(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

export const DAY_OF_MONTH_OPTIONS: readonly DayOfMonthOption[] = [
  ...Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    return { value: day, label: getOrdinalSuffix(day) };
  }),
  { value: 'L', label: 'Last day' },
] as const;

export function getTimeOptions(): TimeOption[] {
  const options: TimeOption[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      const value = `${hh}:${mm}`;

      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayHourStr = String(displayHour).padStart(2, '0');
      const label = `${displayHourStr}:${mm} ${period}`;

      options.push({ value, label });
    }
  }
  return options;
}
