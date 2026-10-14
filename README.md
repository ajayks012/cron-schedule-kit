# cron-schedule-kit ⏰

> **Zero-dependency (< 3 KB gzipped) 5-part cron generator, parser, validator, and human-readable describer — with headless and drop-in React components.**

[![CI](https://github.com/ajayks012/cron-schedule-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/ajayks012/cron-schedule-kit/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()

---

## 🌟 Features

* 🚀 **Zero Runtime Dependencies**: Pure TypeScript engine under 3 KB gzipped. Runs seamlessly in Node.js, Bun, Deno, and all modern browsers.
* 🧩 **Headless First**: Includes `useScheduleSelector` headless hook for bespoke styling with Tailwind CSS, Chakra, Shadcn, or CSS Modules.
* 🎨 **Drop-in React Component**: Opt-in `<ScheduleSelector />` component with scoped, self-contained CSS via `cron-schedule-kit/react`.
* 🗣️ **Natural Language Explainer**: Translates standard 5-part expressions into human-readable English with 12-hour AM/PM times and ordinal dates (e.g., *"Every quarter on the 1st at 02:30 PM"*).
* 🛡️ **Syntax & Range Validator**: Validates fields, steps (`*/N`), ranges (`1-5`), lists (`1,2,5`), and `'L'` (last day of month).
* ⏱️ **Upcoming Run Calculator**: Fast, lightweight date arithmetic computing the next $N$ execution timestamps.
* 🌐 **Timezone Shift & "L" Engine**: Bidirectional UTC $\leftrightarrow$ Local conversion that handles midnight rollovers and dynamic last-day (`'L'`) mappings.
* 📦 **Universal Dual Bundle**: ESM (`.mjs`), CommonJS (`.cjs`), and full TypeScript definitions (`.d.ts`).

---

## 📦 Installation

```bash
# npm
npm install cron-schedule-kit

# pnpm
pnpm add cron-schedule-kit

# yarn
yarn add cron-schedule-kit
```

---

## 🚀 Quickstart: Core Engine (Pure JS/TS)

The core module has **zero runtime dependencies** and works anywhere:

```typescript
import {
  buildCronExpression,
  parseCronExpression,
  describeCronExpression,
  validateCronExpression,
  getNextExecutions,
  cronToUtc,
  cronFromUtc,
} from 'cron-schedule-kit';

// 1. Build cron expressions
const daily = buildCronExpression({ unit: 'day', time: '01:00' });
// => "0 1 * * *"

const weekly = buildCronExpression({ unit: 'week', weekday: 6, time: '01:00' });
// => "0 1 * * 6"

const monthly = buildCronExpression({ unit: 'month', dayOfMonth: 15, time: '14:30' });
// => "30 14 15 * *"

const lastDay = buildCronExpression({ unit: 'month', dayOfMonth: 'L', time: '00:00' });
// => "0 0 L * *"

// 2. Describe in plain English
describeCronExpression('0 1 * * 6');
// => "Every Saturday at 01:00 AM"

describeCronExpression('30 14 1 */3 *');
// => "Every quarter on the 1st at 02:30 PM"

// 3. Parse existing cron into structured state
const parsed = parseCronExpression('30 19 L * *');
// => { type: 'custom', unit: 'month', time: '19:30', dayOfMonth: 'L', interval: 1, ... }

// 4. Validate syntax
const { isValid, errors } = validateCronExpression('*/10 0-23/2 * * *');
// => { isValid: true, errors: [] }

// 5. Calculate upcoming executions
const nextDates = getNextExecutions('0 1 * * *', 3);
// => [ Date, Date, Date ]

// 6. Shift across timezones (e.g. IST +05:30 to UTC)
cronToUtc('0 1 1 * *', 330);
// => "30 19 L * *" (1st day < 05:30 AM IST shifts to last day 'L' in UTC)
```

---

## ⚛️ React Integration

Import from the subpath `cron-schedule-kit/react`. React is treated as an optional peer dependency so non-React users never pull React into their dependencies.

### 1. Ready-to-Use Component

Drop `<ScheduleSelector />` directly into your forms or settings panels:

```tsx
import { useState } from 'react';
import { ScheduleSelector } from 'cron-schedule-kit/react';
import 'cron-schedule-kit/styles.css';

export function ScheduleSettings() {
  const [cron, setCron] = useState('0 1 * * *');

  return (
    <div style={{ maxWidth: 480 }}>
      <h3>Automation Schedule</h3>
      <ScheduleSelector
        value={cron}
        onChange={(nextCron) => {
          setCron(nextCron);
          console.log('Updated cron:', nextCron);
        }}
        showPreview={true}
      />
    </div>
  );
}
```

### 2. Headless Hook (`useScheduleSelector`)

If you want custom Tailwind CSS, Shadcn, or your own UI system, use the headless hook:

```tsx
import { useScheduleSelector } from 'cron-schedule-kit/react';
import { CUSTOM_SCHEDULE_OPTIONS, WEEKDAY_OPTIONS, DAY_OF_MONTH_OPTIONS, getTimeOptions } from 'cron-schedule-kit';

export function CustomTailwindSchedulePicker({ value, onChange }) {
  const {
    scheduleType,
    setScheduleType,
    custKey,
    setCustKey,
    time,
    setTime,
    weekday,
    setWeekday,
    dayOfMonth,
    setDayOfMonth,
    description,
    needsWeekday,
    needsDayOfMonth,
  } = useScheduleSelector({ value, onChange });

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-white">
      {/* Type Picker */}
      <div className="flex gap-2">
        {['daily', 'weekly', 'monthly', 'custom'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setScheduleType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              scheduleType === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Custom Frequency Controls */}
      {scheduleType === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <select
            value={custKey}
            onChange={(e) => setCustKey(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
          >
            {CUSTOM_SCHEDULE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {needsWeekday && (
            <select
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
            >
              {WEEKDAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {needsDayOfMonth && (
            <select
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value === 'L' ? 'L' : Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
            >
              {DAY_OF_MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
          >
            {getTimeOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Live Description */}
      <p className="text-sm text-indigo-400 font-medium">⏰ {description}</p>
    </div>
  );
}
```

---

## 🌐 Timezone Conversions & The "L" Engine

When converting schedules between user local time (e.g., IST `UTC+05:30`) and UTC backend engines:
* If a monthly job is scheduled for the **1st of the month at 01:00 AM IST**, shifting by `-330 minutes` crosses midnight backward into the previous month.
* In UTC, this must trigger on the **last day of the preceding month** (`'L'`).
* `cron-schedule-kit` handles this seamlessly:

| Local Schedule (IST) | UI Time | UTC Payload (`cronToUtc`) | Local Hydration (`cronFromUtc`) | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Daily** | 01:00 AM | `30 19 * * *` | `0 1 * * *` | 19:30 UTC previous day |
| **Weekly (Sat)** | 01:00 AM | `30 19 * * 5` | `0 1 * * 6` | Saturday rolls back to Friday |
| **Monthly (1st)** | 01:00 AM | `30 19 L * *` | `0 1 1 * *` | **1st &lt; 05:30 AM rolls back to 'L'** |
| **Monthly (1st)** | 10:00 AM | `30 4 1 * *` | `0 10 1 * *` | Stays on 1st of month |
| **Monthly (15th)** | 01:00 AM | `30 19 14 * *` | `0 1 15 * *` | 15th rolls back to 14th |

---

## 📚 API Reference

### Core Functions (`cron-schedule-kit`)

* **`buildCronExpression(params?: BuildCronParams): string`**  
  Constructs a 5-part cron string (`M H DOM MON DOW`). Clamps inputs safely.
* **`parseCronExpression(cron: string): ParsedSchedule`**  
  Deconstructs a cron string into structured units, intervals, times, and presets.
* **`describeCronExpression(cron: string): string`**  
  Generates concise human-readable English text with 12h time and ordinal suffixes.
* **`validateCronExpression(cron: string): { isValid: boolean; errors: string[] }`**  
  Checks field count, numerical bounds, step syntax, and character tokens.
* **`getNextExecutions(cron: string, count?: number, startDate?: Date): Date[]`**  
  Calculates the next $N$ execution dates matching the schedule (handles `'L'`).
* **`cronToUtc(cron: string, offsetMinutes?: number): string`**  
  Converts a cron string from local time to UTC.
* **`cronFromUtc(cron: string, offsetMinutes?: number): string`**  
  Converts a cron string from UTC back to local time.
* **`shiftCronTimezone(cron: string, deltaMinutes: number): string`**  
  Low-level engine shifting cron fields across midnight boundaries.

### React Exports (`cron-schedule-kit/react`)

* **`<ScheduleSelector {...props} />`**: Ready-to-use schedule selector component.
* **`useScheduleSelector(options)`**: Headless hook with built-in anti-reset state protection.

---

## 🛠️ Development & Testing

```bash
# Run unit & integration test suite (Vitest)
npm run test

# Type check
npm run typecheck

# Build library bundle (tsup)
npm run build

# Start interactive demo playground (Vite)
npm run dev

# Build demo playground
npm run build:demo
```

---

## 📄 License

[MIT](LICENSE) © 2026
