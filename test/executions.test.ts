import { describe, expect, it } from 'vitest';
import { getNextExecutions } from '../src/core/executions';

describe('getNextExecutions', () => {
  it('returns empty array for invalid cron', () => {
    expect(getNextExecutions('invalid-cron')).toEqual([]);
  });

  it('computes next 5 executions for daily schedule', () => {
    const base = new Date('2026-01-01T00:00:00.000Z');
    // Set explicit UTC dates or local dates
    const runs = getNextExecutions('0 1 * * *', 3, base);
    expect(runs.length).toBe(3);
    expect(runs[0].getHours()).toBe(1);
    expect(runs[0].getMinutes()).toBe(0);
    expect(runs[1].getHours()).toBe(1);
    expect(runs[2].getHours()).toBe(1);
  });

  it('computes next executions for weekly schedule', () => {
    const base = new Date('2026-01-01T00:00:00.000Z');
    const runs = getNextExecutions('0 10 * * 6', 2, base); // Saturday at 10:00
    expect(runs.length).toBe(2);
    expect(runs[0].getDay()).toBe(6);
    expect(runs[0].getHours()).toBe(10);
    expect(runs[1].getDay()).toBe(6);
  });

  it('computes next executions for last day of month "L"', () => {
    const base = new Date('2026-01-01T00:00:00');
    const runs = getNextExecutions('0 0 L * *', 3, base);
    expect(runs.length).toBe(3);
    // Jan has 31 days
    expect(runs[0].getMonth()).toBe(0);
    expect(runs[0].getDate()).toBe(31);
    // Feb in 2026 has 28 days
    expect(runs[1].getMonth()).toBe(1);
    expect(runs[1].getDate()).toBe(28);
    // Mar has 31 days
    expect(runs[2].getMonth()).toBe(2);
    expect(runs[2].getDate()).toBe(31);
  });
});
