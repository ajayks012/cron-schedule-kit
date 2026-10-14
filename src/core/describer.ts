import { SCHEDULE_PRESETS, WEEKDAY_OPTIONS } from './constants';

const WEEKDAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function formatTime12(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const hh = String(h12).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${hh}:${mm} ${period}`;
}

function getOrdinal(n: number | string): string {
  if (typeof n === 'string' && n.toUpperCase() === 'L') {
    return 'the last day';
  }
  const num = typeof n === 'number' ? n : parseInt(n, 10);
  if (Number.isNaN(num)) return String(n);

  const j = num % 10;
  const k = num % 100;
  let suffix = 'th';
  if (j === 1 && k !== 11) suffix = 'st';
  else if (j === 2 && k !== 12) suffix = 'nd';
  else if (j === 3 && k !== 13) suffix = 'rd';

  return `the ${num}${suffix}`;
}

export function describeCronExpression(rawCron: string): string {
  const cron = (rawCron || '').trim();
  if (!cron) return 'No schedule configured';

  // 1. Direct Presets
  if (cron === SCHEDULE_PRESETS.DAILY) {
    return 'Every day at 01:00 AM';
  }
  if (cron === SCHEDULE_PRESETS.WEEKLY) {
    return 'Every Saturday at 01:00 AM';
  }
  if (cron === SCHEDULE_PRESETS.MONTHLY) {
    return 'Monthly on the 1st at 01:00 AM';
  }

  const parts = cron.split(/\s+/);
  if (parts.length !== 5) {
    return `Scheduled (${cron})`;
  }

  const [mStr, hStr, domStr, monStr, dowStr] = parts;

  // Common quick patterns
  if (cron === '* * * * *') return 'Every minute';
  if (mStr.startsWith('*/') && hStr === '*' && domStr === '*' && monStr === '*' && dowStr === '*') {
    return `Every ${mStr.slice(2)} minutes`;
  }
  if (mStr === '0' && hStr === '*' && domStr === '*' && monStr === '*' && dowStr === '*') {
    return 'Every hour';
  }
  if (mStr === '0' && hStr.startsWith('*/') && domStr === '*' && monStr === '*' && dowStr === '*') {
    return `Every ${hStr.slice(2)} hours`;
  }

  // Check if minute and hour are fixed numbers
  const m = parseInt(mStr, 10);
  const h = parseInt(hStr, 10);
  const hasFixedTime = !Number.isNaN(m) && !Number.isNaN(h) && !mStr.includes('*') && !hStr.includes('*');
  const timeStr = hasFixedTime ? formatTime12(h, m) : '';

  // Week unit: dow is not '*'
  if (dowStr !== '*' && domStr === '*') {
    const dow = parseInt(dowStr, 10);
    const dayName = WEEKDAY_NAMES[dow] ?? 'day';
    if (timeStr) {
      return `Every week on ${dayName} at ${timeStr}`;
    }
    return `Every week on ${dayName}`;
  }

  // Day unit with step: dom is '*/N'
  if (domStr.startsWith('*/') && dowStr === '*') {
    const interval = domStr.slice(2);
    if (timeStr) {
      return `Every ${interval} days at ${timeStr}`;
    }
    return `Every ${interval} days`;
  }

  // Month unit: dom is a number or 'L'
  if (domStr !== '*' && dowStr === '*') {
    const dayDesc = getOrdinal(domStr);
    let intervalDesc = 'Every month';
    if (monStr.startsWith('*/')) {
      const monInterval = parseInt(monStr.slice(2), 10);
      if (monInterval === 3) {
        intervalDesc = 'Every quarter';
      } else if (monInterval > 1) {
        intervalDesc = `Every ${monInterval} months`;
      }
    }

    if (timeStr) {
      return `${intervalDesc} on ${dayDesc} at ${timeStr}`;
    }
    return `${intervalDesc} on ${dayDesc}`;
  }

  // Daily interval 1
  if (domStr === '*' && dowStr === '*' && monStr === '*') {
    if (timeStr) {
      return `Every day at ${timeStr}`;
    }
  }

  return `Scheduled (${cron})`;
}
