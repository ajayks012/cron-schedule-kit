import type { BuildCronParams } from './types';

export function buildCronExpression(params: BuildCronParams = {}): string {
  const {
    unit = 'day',
    interval = 1,
    time = '01:00',
    weekday = 6,
    dayOfMonth = 1,
  } = params;

  // 1. Parse & sanitize time (HH:mm)
  let hour = 1;
  let minute = 0;
  if (typeof time === 'string' && time.includes(':')) {
    const parts = time.split(':');
    const parsedH = parseInt(parts[0], 10);
    const parsedM = parseInt(parts[1], 10);
    if (!Number.isNaN(parsedH)) hour = Math.max(0, Math.min(23, parsedH));
    if (!Number.isNaN(parsedM)) minute = Math.max(0, Math.min(59, parsedM));
  }

  // 2. Sanitize interval
  const safeInterval = Math.max(1, Math.floor(Number(interval) || 1));

  // 3. Sanitize weekday (0-6)
  const safeWeekday = Math.max(0, Math.min(6, Math.floor(Number(weekday) ?? 6)));

  // 4. Sanitize dayOfMonth (1-31 or 'L')
  let safeDom: number | 'L' = 1;
  if (typeof dayOfMonth === 'string' && dayOfMonth.trim().toUpperCase() === 'L') {
    safeDom = 'L';
  } else {
    const parsedDom = parseInt(String(dayOfMonth), 10);
    if (!Number.isNaN(parsedDom)) {
      safeDom = Math.max(1, Math.min(31, parsedDom));
    }
  }

  // 5. Build cron parts: [minute, hour, dom, month, dow]
  switch (unit) {
    case 'week':
      return `${minute} ${hour} * * ${safeWeekday}`;

    case 'month':
      if (safeInterval > 1) {
        return `${minute} ${hour} ${safeDom} */${safeInterval} *`;
      }
      return `${minute} ${hour} ${safeDom} * *`;

    case 'day':
    default:
      if (safeInterval > 1) {
        return `${minute} ${hour} */${safeInterval} * *`;
      }
      return `${minute} ${hour} * * *`;
  }
}
