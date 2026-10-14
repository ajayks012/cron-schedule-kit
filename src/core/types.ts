export type ScheduleUnit = 'day' | 'week' | 'month';

export type SchedulePresetType = 'daily' | 'weekly' | 'monthly';

export type ScheduleType = SchedulePresetType | 'custom' | '';

export interface CustomScheduleOption {
  value: string;
  unit: ScheduleUnit;
  interval: number;
  label: string;
}

export interface WeekdayOption {
  value: number;
  label: string;
}

export interface DayOfMonthOption {
  value: number | 'L';
  label: string;
}

export interface TimeOption {
  value: string;
  label: string;
}

export interface BuildCronParams {
  unit?: ScheduleUnit;
  interval?: number;
  time?: string; // 'HH:mm' in 24h format (e.g., '01:00')
  weekday?: number; // 0 (Sun) - 6 (Sat)
  dayOfMonth?: number | 'L'; // 1 - 31 or 'L'
}

export interface ParsedSchedule {
  type: ScheduleType;
  unit: ScheduleUnit;
  interval: number;
  time: string; // 'HH:mm' in 24h format
  weekday: number;
  dayOfMonth: number | 'L';
  cron: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
