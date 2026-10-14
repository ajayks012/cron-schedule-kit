import { describe, expect, it } from 'vitest';
import { describeCronExpression } from '../src/core/describer';

describe('describeCronExpression', () => {
  it('describes presets', () => {
    expect(describeCronExpression('0 1 * * *')).toBe('Every day at 01:00 AM');
    expect(describeCronExpression('0 1 * * 6')).toBe('Every Saturday at 01:00 AM');
    expect(describeCronExpression('0 1 1 * *')).toBe('Monthly on the 1st at 01:00 AM');
  });

  it('describes custom daily schedules', () => {
    expect(describeCronExpression('30 15 */2 * *')).toBe('Every 2 days at 03:30 PM');
    expect(describeCronExpression('0 0 * * *')).toBe('Every day at 12:00 AM');
  });

  it('describes custom weekly schedules', () => {
    expect(describeCronExpression('0 9 * * 1')).toBe('Every week on Monday at 09:00 AM');
    expect(describeCronExpression('30 18 * * 5')).toBe('Every week on Friday at 06:30 PM');
  });

  it('describes custom monthly schedules with ordinals and L', () => {
    expect(describeCronExpression('0 10 15 * *')).toBe('Every month on the 15th at 10:00 AM');
    expect(describeCronExpression('0 0 L * *')).toBe('Every month on the last day at 12:00 AM');
    expect(describeCronExpression('30 14 1 */3 *')).toBe('Every quarter on the 1st at 02:30 PM');
    expect(describeCronExpression('0 8 20 */6 *')).toBe('Every 6 months on the 20th at 08:00 AM');
  });

  it('describes recurring minute and hourly schedules', () => {
    expect(describeCronExpression('* * * * *')).toBe('Every minute');
    expect(describeCronExpression('*/15 * * * *')).toBe('Every 15 minutes');
    expect(describeCronExpression('0 * * * *')).toBe('Every hour');
    expect(describeCronExpression('0 */4 * * *')).toBe('Every 4 hours');
  });

  it('handles empty or unrecognized input', () => {
    expect(describeCronExpression('')).toBe('No schedule configured');
    expect(describeCronExpression('invalid cron format')).toBe('Scheduled (invalid cron format)');
  });
});
