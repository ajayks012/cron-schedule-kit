import type { ValidationResult } from './types';

const MONTH_NAMES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const DAY_NAMES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

interface FieldRule {
  name: string;
  min: number;
  max: number;
  allowL?: boolean;
  nameMap?: Record<string, number>;
}

const FIELD_RULES: FieldRule[] = [
  { name: 'Minute', min: 0, max: 59 },
  { name: 'Hour', min: 0, max: 23 },
  { name: 'Day of Month', min: 1, max: 31, allowL: true },
  { name: 'Month', min: 1, max: 12, nameMap: MONTH_NAMES },
  { name: 'Day of Week', min: 0, max: 7, nameMap: DAY_NAMES }, // 7 can represent Sunday
];

function parseFieldVal(val: string, rule: FieldRule): number | null {
  const upper = val.toUpperCase();
  if (rule.nameMap && rule.nameMap[upper] !== undefined) {
    return rule.nameMap[upper];
  }
  const n = parseInt(val, 10);
  if (Number.isNaN(n) || String(n) !== val.trim()) {
    return null;
  }
  return n;
}

function validateFieldToken(token: string, rule: FieldRule): string | null {
  // If 'L' is allowed and token is 'L'
  if (rule.allowL && token.toUpperCase() === 'L') {
    return null;
  }

  // Handle steps: e.g. */5 or 1-10/2 or 5/2
  let base = token;
  let step: number | null = null;
  if (token.includes('/')) {
    const slashParts = token.split('/');
    if (slashParts.length !== 2) {
      return `Invalid step syntax in ${rule.name}: "${token}"`;
    }
    base = slashParts[0];
    step = parseInt(slashParts[1], 10);
    if (Number.isNaN(step) || step <= 0) {
      return `Step value in ${rule.name} must be a positive integer: "${token}"`;
    }
  }

  // Base can be '*'
  if (base === '*') {
    return null;
  }

  // Base can be a range: e.g. 1-5 or MON-FRI
  if (base.includes('-')) {
    const dashParts = base.split('-');
    if (dashParts.length !== 2) {
      return `Invalid range syntax in ${rule.name}: "${base}"`;
    }
    const start = parseFieldVal(dashParts[0], rule);
    const end = parseFieldVal(dashParts[1], rule);
    if (start === null || end === null) {
      return `Invalid range values in ${rule.name}: "${base}"`;
    }
    if (start < rule.min || start > rule.max) {
      return `${rule.name} range start (${start}) must be between ${rule.min} and ${rule.max}`;
    }
    if (end < rule.min || end > rule.max) {
      return `${rule.name} range end (${end}) must be between ${rule.min} and ${rule.max}`;
    }
    if (start > end) {
      return `${rule.name} range start (${start}) cannot be greater than end (${end})`;
    }
    return null;
  }

  // Base is a single value
  const val = parseFieldVal(base, rule);
  if (val === null) {
    return `Invalid value for ${rule.name}: "${base}"`;
  }
  if (val < rule.min || val > rule.max) {
    return `${rule.name} value (${val}) must be between ${rule.min} and ${rule.max}`;
  }

  return null;
}

export function validateCronExpression(rawCron: string): ValidationResult {
  const errors: string[] = [];
  const cron = (rawCron || '').trim();

  if (!cron) {
    return {
      isValid: false,
      errors: ['Cron expression cannot be empty'],
    };
  }

  const parts = cron.split(/\s+/);
  if (parts.length !== 5) {
    return {
      isValid: false,
      errors: [
        `Expected exactly 5 fields (Minute Hour Day-of-Month Month Day-of-Week), found ${parts.length}`,
      ],
    };
  }

  for (let i = 0; i < 5; i++) {
    const part = parts[i];
    const rule = FIELD_RULES[i];

    // Split on commas (list items: e.g. 1,2,5)
    const listTokens = part.split(',');
    for (const token of listTokens) {
      if (!token) {
        errors.push(`Empty item in ${rule.name} list: "${part}"`);
        continue;
      }
      const err = validateFieldToken(token, rule);
      if (err) {
        errors.push(err);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
