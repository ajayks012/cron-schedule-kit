import { describe, expect, it } from 'vitest';
import {
  cronFromUtc,
  cronToUtc,
  shiftCronTimezone,
} from '../src/core/timezone';

describe('timezone shifting', () => {
  it('shifts daily schedule across midnight from IST to UTC', () => {
    // IST is UTC+05:30 -> offsetMinutes is 330
    // 01:00 AM IST -> shifts -330m to previous day 19:30 UTC
    expect(cronToUtc('0 1 * * *', 330)).toBe('30 19 * * *');
    expect(cronFromUtc('30 19 * * *', 330)).toBe('0 1 * * *');
  });

  it('shifts weekly schedule with day of week rollback', () => {
    // Saturday 01:00 AM IST (dow=6) -> Friday 19:30 UTC (dow=5)
    expect(cronToUtc('0 1 * * 6', 330)).toBe('30 19 * * 5');
    expect(cronFromUtc('30 19 * * 5', 330)).toBe('0 1 * * 6');
  });

  it('shifts monthly schedule on 1st before 05:30 AM to last day "L"', () => {
    // 01:00 AM on 1st of month IST -> crosses midnight backward to last day of month 'L' in UTC
    expect(cronToUtc('0 1 1 * *', 330)).toBe('30 19 L * *');
    // Hydrating 'L' UTC + 5:30 -> 01:00 AM on 1st of month in IST
    expect(cronFromUtc('30 19 L * *', 330)).toBe('0 1 1 * *');

    // Midnight on 1st IST
    expect(cronToUtc('0 0 1 * *', 330)).toBe('30 18 L * *');
    expect(cronFromUtc('30 18 L * *', 330)).toBe('0 0 1 * *');
  });

  it('preserves same day when time is >= 05:30 AM IST', () => {
    // 05:30 AM IST -> 00:00 UTC (same day)
    expect(cronToUtc('30 5 1 * *', 330)).toBe('0 0 1 * *');
    expect(cronFromUtc('0 0 1 * *', 330)).toBe('30 5 1 * *');

    // 10:00 AM IST -> 04:30 AM UTC (same day)
    expect(cronToUtc('0 10 1 * *', 330)).toBe('30 4 1 * *');
    expect(cronFromUtc('30 4 1 * *', 330)).toBe('0 10 1 * *');
  });

  it('shifts mid-month dates (15th IST -> 14th UTC)', () => {
    expect(cronToUtc('0 1 15 * *', 330)).toBe('30 19 14 * *');
    expect(cronFromUtc('30 19 14 * *', 330)).toBe('0 1 15 * *');
  });
});
