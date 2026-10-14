import { describe, expect, it } from 'vitest';
import { parseCronExpression } from '../src/core/parser';

describe('parseCronExpression', () => {
  it('identifies standard daily preset', () => {
    const res = parseCronExpression('0 1 * * *');
    expect(res).toEqual({
      type: 'daily',
      unit: 'day',
      interval: 1,
      time: '01:00',
      weekday: 6,
      dayOfMonth: 1,
      cron: '0 1 * * *',
    });
  });

  it('identifies standard weekly preset', () => {
    const res = parseCronExpression('0 1 * * 6');
    expect(res).toEqual({
      type: 'weekly',
      unit: 'week',
      interval: 1,
      time: '01:00',
      weekday: 6,
      dayOfMonth: 1,
      cron: '0 1 * * 6',
    });
  });

  it('identifies standard monthly preset', () => {
    const res = parseCronExpression('0 1 1 * *');
    expect(res).toEqual({
      type: 'monthly',
      unit: 'month',
      interval: 1,
      time: '01:00',
      weekday: 6,
      dayOfMonth: 1,
      cron: '0 1 1 * *',
    });
  });

  it('inverts custom day intervals', () => {
    const res = parseCronExpression('30 14 */3 * *');
    expect(res.type).toBe('custom');
    expect(res.unit).toBe('day');
    expect(res.interval).toBe(3);
    expect(res.time).toBe('14:30');
  });

  it('inverts custom weekly schedules', () => {
    const res = parseCronExpression('15 9 * * 1');
    expect(res.type).toBe('custom');
    expect(res.unit).toBe('week');
    expect(res.weekday).toBe(1);
    expect(res.time).toBe('09:15');
  });

  it('inverts custom monthly schedules including "L"', () => {
    const res1 = parseCronExpression('0 10 15 * *');
    expect(res1.type).toBe('custom');
    expect(res1.unit).toBe('month');
    expect(res1.dayOfMonth).toBe(15);
    expect(res1.interval).toBe(1);

    const res2 = parseCronExpression('0 8 L * *');
    expect(res2.type).toBe('custom');
    expect(res2.unit).toBe('month');
    expect(res2.dayOfMonth).toBe('L');

    const res3 = parseCronExpression('0 0 1 */3 *');
    expect(res3.type).toBe('custom');
    expect(res3.unit).toBe('month');
    expect(res3.interval).toBe(3);
  });

  it('handles invalid or empty strings gracefully', () => {
    const res = parseCronExpression('');
    expect(res.type).toBe('');
    expect(res.cron).toBe('');
  });
});
