import { describe, expect, it } from 'vitest';
import { validateCronExpression } from '../src/core/validator';

describe('validateCronExpression', () => {
  it('validates correct cron expressions', () => {
    expect(validateCronExpression('0 1 * * *').isValid).toBe(true);
    expect(validateCronExpression('30 4 15 6 3').isValid).toBe(true);
    expect(validateCronExpression('*/10 0-23/2 * * *').isValid).toBe(true);
    expect(validateCronExpression('0 0 L * *').isValid).toBe(true);
    expect(validateCronExpression('0 0 1,15 * 1-5').isValid).toBe(true);
  });

  it('rejects empty or whitespace only strings', () => {
    const res = validateCronExpression('   ');
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('cannot be empty');
  });

  it('rejects expressions with incorrect field count', () => {
    const res1 = validateCronExpression('* * * *');
    expect(res1.isValid).toBe(false);
    expect(res1.errors[0]).toContain('Expected exactly 5 fields');

    const res2 = validateCronExpression('* * * * * *');
    expect(res2.isValid).toBe(false);
    expect(res2.errors[0]).toContain('Expected exactly 5 fields');
  });

  it('detects out of bounds field values', () => {
    const res1 = validateCronExpression('60 1 * * *');
    expect(res1.isValid).toBe(false);
    expect(res1.errors[0]).toContain('Minute value (60) must be between 0 and 59');

    const res2 = validateCronExpression('0 25 * * *');
    expect(res2.isValid).toBe(false);
    expect(res2.errors[0]).toContain('Hour value (25) must be between 0 and 23');

    const res3 = validateCronExpression('0 0 35 * *');
    expect(res3.isValid).toBe(false);
    expect(res3.errors[0]).toContain('Day of Month value (35) must be between 1 and 31');

    const res4 = validateCronExpression('0 0 * 13 *');
    expect(res4.isValid).toBe(false);
    expect(res4.errors[0]).toContain('Month value (13) must be between 1 and 12');
  });

  it('detects invalid range and step syntaxes', () => {
    const res1 = validateCronExpression('0 15-10 * * *');
    expect(res1.isValid).toBe(false);
    expect(res1.errors[0]).toContain('cannot be greater than end');

    const res2 = validateCronExpression('0 0 * * */0');
    expect(res2.isValid).toBe(false);
    expect(res2.errors[0]).toContain('must be a positive integer');
  });
});
