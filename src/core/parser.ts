import { SCHEDULE_PRESETS } from './constants';
import type { ParsedSchedule, ScheduleUnit } from './types';

export function parseCronExpression(rawCron: string): ParsedSchedule {
  const cron = (rawCron || '').trim();

  // 1. Preset direct matching
  if (cron === SCHEDULE_PRESETS.DAILY) {
    return {
      type: 'daily',
      unit: 'day',
      interval: 1,
      time: '01:00',
      weekday: 6,
      dayOfMonth: 1,
      cron,
    };
  }

  if (cron === SCHEDULE_PRESETS.WEEKLY) {
    return {
      type: 'weekly',
      unit: 'week',
      interval: 1,
      time: '01:00',
      weekday: 6,
      dayOfMonth: 1,
      cron,
    };
  }

  if (cron === SCHEDULE_PRESETS.MONTHLY) {
    return {
      type: 'monthly',
      unit: 'month',
      interval: 1,
      time: '01:00',
      weekday: 6,
      dayOfMonth: 1,
      cron,
    };
  }

  // 2. Tokenize 5 fields
  const parts = cron.split(/\s+/);
  if (parts.length !== 5) {
    return {
      type: '',
      unit: 'day',
      interval: 1,
      time: '01:00',
      weekday: 6,
      dayOfMonth: 1,
      cron,
    };
  }

  const [mStr, hStr, domStr, monStr, dowStr] = parts;

  // 3. Time extraction
  let time = '01:00';
  const parsedH = parseInt(hStr, 10);
  const parsedM = parseInt(mStr, 10);
  if (!Number.isNaN(parsedH) && !Number.isNaN(parsedM) && !hStr.includes('*') && !mStr.includes('*')) {
    const hh = String(Math.max(0, Math.min(23, parsedH))).padStart(2, '0');
    const mm = String(Math.max(0, Math.min(59, parsedM))).padStart(2, '0');
    time = `${hh}:${mm}`;
  }

  // 4. Inversion logic for unit & interval
  let unit: ScheduleUnit = 'day';
  let interval = 1;
  let weekday = 6;
  let dayOfMonth: number | 'L' = 1;

  if (dowStr !== '*') {
    unit = 'week';
    const parsedDow = parseInt(dowStr, 10);
    weekday = Number.isNaN(parsedDow) ? 6 : Math.max(0, Math.min(6, parsedDow));
    interval = 1;
    dayOfMonth = 1;
  } else if (domStr !== '*') {
    if (domStr.startsWith('*/')) {
      unit = 'day';
      interval = parseInt(domStr.slice(2), 10) || 1;
      dayOfMonth = 1;
      weekday = 6;
    } else {
      unit = 'month';
      if (domStr.toUpperCase() === 'L') {
        dayOfMonth = 'L';
      } else {
        const parsedDom = parseInt(domStr, 10);
        dayOfMonth = Number.isNaN(parsedDom) ? 1 : Math.max(1, Math.min(31, parsedDom));
      }
      if (monStr.startsWith('*/')) {
        interval = parseInt(monStr.slice(2), 10) || 1;
      } else {
        interval = 1;
      }
      weekday = 6;
    }
  } else {
    // Both dom and dow are '*'
    if (monStr.startsWith('*/')) {
      unit = 'month';
      interval = parseInt(monStr.slice(2), 10) || 1;
      dayOfMonth = 1;
      weekday = 6;
    } else {
      unit = 'day';
      interval = 1;
      dayOfMonth = 1;
      weekday = 6;
    }
  }

  return {
    type: 'custom',
    unit,
    interval,
    time,
    weekday,
    dayOfMonth,
    cron,
  };
}
