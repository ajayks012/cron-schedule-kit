import { validateCronExpression } from './validator';

type DayMatcher = (dom: number, dow: number, isLastDay: boolean) => boolean;

function parseTokensToSet(field: string, min: number, max: number): Set<number> | 'ALL' {
  if (field === '*') return 'ALL';

  const result = new Set<number>();
  const parts = field.split(',');

  for (const part of parts) {
    if (part === '*') {
      return 'ALL';
    }
    if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2), 10);
      if (step > 0) {
        for (let i = min; i <= max; i += step) {
          result.add(i);
        }
      }
    } else if (part.includes('-')) {
      const [startStr, endAndStep] = part.split('-');
      const [endStr, stepStr] = endAndStep.split('/');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      const step = stepStr ? parseInt(stepStr, 10) : 1;
      if (!Number.isNaN(start) && !Number.isNaN(end) && step > 0) {
        for (let i = start; i <= end; i += step) {
          result.add(i);
        }
      }
    } else if (part.includes('/')) {
      const [startStr, stepStr] = part.split('/');
      const start = parseInt(startStr, 10);
      const step = parseInt(stepStr, 10);
      if (!Number.isNaN(start) && !Number.isNaN(step) && step > 0) {
        for (let i = start; i <= max; i += step) {
          result.add(i);
        }
      }
    } else {
      const val = parseInt(part, 10);
      if (!Number.isNaN(val)) {
        result.add(val);
      }
    }
  }

  return result;
}

export function getNextExecutions(
  cron: string,
  count = 5,
  startDate: Date = new Date(),
): Date[] {
  const validation = validateCronExpression(cron);
  if (!validation.isValid) {
    return [];
  }

  const parts = cron.trim().split(/\s+/);
  const [mStr, hStr, domStr, monStr, dowStr] = parts;

  const minSet = parseTokensToSet(mStr, 0, 59);
  const hourSet = parseTokensToSet(hStr, 0, 23);
  const monSet = parseTokensToSet(monStr, 1, 12);

  const isDomStar = domStr === '*';
  const isDowStar = dowStr === '*';
  const isDomL = domStr.toUpperCase() === 'L';

  const domSet = isDomL ? new Set<number>() : parseTokensToSet(domStr, 1, 31);
  const dowSet = parseTokensToSet(dowStr, 0, 6);

  const matchesMin = (m: number) => minSet === 'ALL' || minSet.has(m);
  const matchesHour = (h: number) => hourSet === 'ALL' || hourSet.has(h);
  const matchesMon = (mon: number) => monSet === 'ALL' || monSet.has(mon);

  const matchesDay: DayMatcher = (dom, dow, isLastDay) => {
    const domMatch = isDomStar || (isDomL ? isLastDay : domSet !== 'ALL' && domSet.has(dom));
    // Standard cron treats 7 as 0 (Sunday)
    const normalizedDow = dow === 7 ? 0 : dow;
    const dowMatch = isDowStar || (dowSet === 'ALL' || dowSet.has(normalizedDow));

    if (isDomStar && isDowStar) return true;
    if (!isDomStar && isDowStar) return domMatch;
    if (isDomStar && !isDowStar) return dowMatch;
    // When both DOM and DOW are specified, standard cron evaluates as OR
    return domMatch || dowMatch;
  };

  const results: Date[] = [];
  const curr = new Date(startDate.getTime());

  // Move forward to start of next minute
  curr.setSeconds(0, 0);
  curr.setMinutes(curr.getMinutes() + 1);

  // Safety limits: max 5 years or 100,000 steps
  const maxYear = curr.getFullYear() + 5;
  let iterations = 0;
  const maxIterations = 100000;

  while (results.length < count && curr.getFullYear() <= maxYear && iterations < maxIterations) {
    iterations++;

    // 1. Month check
    const currentMonth = curr.getMonth() + 1;
    if (!matchesMon(currentMonth)) {
      curr.setMonth(curr.getMonth() + 1, 1);
      curr.setHours(0, 0, 0, 0);
      continue;
    }

    // 2. Day check
    const currentDom = curr.getDate();
    const currentDow = curr.getDay();
    const totalDaysInMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).getDate();
    const isLastDay = currentDom === totalDaysInMonth;

    if (!matchesDay(currentDom, currentDow, isLastDay)) {
      curr.setDate(curr.getDate() + 1);
      curr.setHours(0, 0, 0, 0);
      continue;
    }

    // 3. Hour check
    const currentHour = curr.getHours();
    if (!matchesHour(currentHour)) {
      curr.setHours(curr.getHours() + 1, 0, 0, 0);
      continue;
    }

    // 4. Minute check
    const currentMinute = curr.getMinutes();
    if (matchesMin(currentMinute)) {
      results.push(new Date(curr.getTime()));
    }

    curr.setMinutes(curr.getMinutes() + 1);
  }

  return results;
}
