export function shiftCronTimezone(cron: string, deltaMinutes: number): string {
  if (!cron || deltaMinutes === 0) return cron;

  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;

  const [mStr, hStr, domStr, monStr, dowStr] = parts;

  // If minute or hour are wildcards/steps/lists, shifting is ambiguous
  const minute = parseInt(mStr, 10);
  const hour = parseInt(hStr, 10);
  if (Number.isNaN(minute) || Number.isNaN(hour) || mStr.includes('*') || hStr.includes('*')) {
    return cron;
  }

  const totalMinutes = hour * 60 + minute + deltaMinutes;
  const dayDelta = Math.floor(totalMinutes / 1440);
  const newTotalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  const newHour = Math.floor(newTotalMinutes / 60);
  const newMinute = newTotalMinutes % 60;

  let newDom = domStr;
  let newDow = dowStr;

  if (dayDelta !== 0) {
    // Shift weekday
    if (dowStr !== '*') {
      const parsedDow = parseInt(dowStr, 10);
      if (!Number.isNaN(parsedDow)) {
        newDow = String(((parsedDow + dayDelta) % 7 + 7) % 7);
      }
    }

    // Shift day of month
    if (domStr !== '*' && !domStr.startsWith('*/')) {
      if (domStr === '1' && dayDelta === -1) {
        // Crossing midnight backwards from 1st of month -> dynamic last day 'L'
        newDom = 'L';
      } else if (domStr.toUpperCase() === 'L' && dayDelta === 1) {
        // Crossing midnight forwards from last day of month -> 1st of month
        newDom = '1';
      } else if (domStr.toUpperCase() !== 'L') {
        const parsedDom = parseInt(domStr, 10);
        if (!Number.isNaN(parsedDom)) {
          const shifted = parsedDom + dayDelta;
          if (shifted < 1) {
            newDom = 'L';
          } else if (shifted > 31) {
            newDom = '1';
          } else {
            newDom = String(shifted);
          }
        }
      }
    }
  }

  return `${newMinute} ${newHour} ${newDom} ${monStr} ${newDow}`;
}

export function cronToUtc(cron: string, offsetMinutes?: number): string {
  const offset = offsetMinutes !== undefined
    ? offsetMinutes
    : -new Date().getTimezoneOffset();
  return shiftCronTimezone(cron, -offset);
}

export function cronFromUtc(cron: string, offsetMinutes?: number): string {
  const offset = offsetMinutes !== undefined
    ? offsetMinutes
    : -new Date().getTimezoneOffset();
  return shiftCronTimezone(cron, offset);
}
