import { describe, expect, it } from 'vitest';
import { buildCronExpression } from '../src/core/builder';

describe('buildCronExpression', () => {
  it('builds default daily cron expression when called with no arguments', () => {
    expect(buildCronExpression()).toBe('0 1 * * *');
  });

  it('builds daily cron with custom time and interval', () => {
    expect(
      buildCronExpression({
        unit: 'day',
        interval: 1,
        time: '04:30',
      })
    ).toBe('30 4 * * *');

    expect(
      buildCronExpression({
        unit: 'day',
        interval: 3,
        time: '14:00',
      })
    ).toBe('0 14 */3 * *');
  });

  it('builds weekly cron with weekday selection', () => {
    expect(
      buildCronExpression({
        unit: 'week',
        time: '09:15',
        weekday: 1, // Monday
      })
    ).toBe('15 9 * * 1');

    expect(
      buildCronExpression({
        unit: 'week',
        time: '23:30',
        weekday: 6, // Saturday
      })
    ).toBe('30 23 * * 6');
  });

  it('builds monthly cron with day of month and interval', () => {
    expect(
      buildCronExpression({
        unit: 'month',
        time: '10:00',
        dayOfMonth: 15,
        interval: 1,
      })
    ).toBe('0 10 15 * *');

    expect(
      buildCronExpression({
        unit: 'month',
        time: '08:00',
        dayOfMonth: 'L',
        interval: 1,
      })
    ).toBe('0 8 L * *');

    expect(
      buildCronExpression({
        unit: 'month',
        time: '00:00',
        dayOfMonth: 1,
        interval: 3, // quarterly
      })
    ).toBe('0 0 1 */3 *');
  });

  it('clamps and sanitizes out-of-range inputs', () => {
    // Hour > 23 and Minute > 59
    expect(
      buildCronExpression({
        time: '99:99',
      })
    ).toBe('59 23 * * *');

    // Weekday > 6
    expect(
      buildCronExpression({
        unit: 'week',
        weekday: 12,
      })
    ).toBe('0 1 * * 6');

    // Day of month clamp
    expect(
      buildCronExpression({
        unit: 'month',
        dayOfMonth: 50,
      })
    ).toBe('0 1 31 * *');
  });
});
