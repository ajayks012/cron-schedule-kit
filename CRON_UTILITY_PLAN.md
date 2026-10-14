# Project Plan: Cron Studio (Cron Generator, Validator & Explainer)

A standalone web application to visually generate, validate, parse, and describe 5-part cron expressions from scratch, featuring an intuitive schedule selector and real-time bidirectional synchronization.

---

## 1. Executive Summary & Goals

### 1.1 Objective
Build a lightweight, developer-focused web utility for working with standard 5-part cron expressions (`Minute Hour Day-of-Month Month Day-of-Week`). The application provides:
1. **Visual Schedule Generator**: A flat, user-friendly schedule picker with preset buttons, intuitive compound frequency selections, conditional day pickers, and a 30-minute time slot selector.
2. **Two-Way Synchronization**: Typing a raw cron expression immediately hydrates the visual pickers; adjusting visual pickers immediately constructs and updates the raw cron string.
3. **Expression Validator & Linter**: Validates 5-part cron syntax, token values, bounds, and provides clear error feedback.
4. **Natural Language Explainer**: Translates any valid expression into clear, readable English (with 12-hour AM/PM formatting, ordinal suffixes, and interval translations).
5. **Upcoming Execution Timetable**: Previews the next 5–10 trigger times based on the active schedule.

---

## 2. Core Specification & Architecture

### 2.1 Presets & Data Constants (`src/core/constants.ts`)

* **Schedule Presets (`SCHEDULE_PRESETS`)**:
  * `DAILY`: `'0 1 * * *'` (Every day at 01:00 AM)
  * `WEEKLY`: `'0 1 * * 6'` (Every Saturday at 01:00 AM)
  * `MONTHLY`: `'0 1 1 * *'` (Every month on the 1st at 01:00 AM)

* **Custom Frequency Options (`CUSTOM_SCHEDULE_OPTIONS`)**:
  Flat, user-friendly options encoding unit and interval together:
  * `{ value: 'day:1', unit: 'day', interval: 1, label: 'Every day' }`
  * `{ value: 'day:2', unit: 'day', interval: 2, label: 'Every 2 days' }`
  * `{ value: 'day:3', unit: 'day', interval: 3, label: 'Every 3 days' }`
  * `{ value: 'day:7', unit: 'day', interval: 7, label: 'Every 7 days' }`
  * `{ value: 'day:14', unit: 'day', interval: 14, label: 'Every 14 days' }`
  * `{ value: 'day:30', unit: 'day', interval: 30, label: 'Every 30 days' }`
  * `{ value: 'week:1', unit: 'week', interval: 1, label: 'Every week (pick a day)' }`
  * `{ value: 'month:1', unit: 'month', interval: 1, label: 'Every month (pick a day)' }`
  * `{ value: 'month:2', unit: 'month', interval: 2, label: 'Every 2 months (pick a day)' }`
  * `{ value: 'month:3', unit: 'month', interval: 3, label: 'Every quarter — 3 months (pick a day)' }`
  * `{ value: 'month:6', unit: 'month', interval: 6, label: 'Every 6 months (pick a day)' }`

* **Weekday Options (`WEEKDAY_OPTIONS`)**:
  * `1`: Monday, `2`: Tuesday, `3`: Wednesday, `4`: Thursday, `5`: Friday, `6`: Saturday, `0`: Sunday

* **Day of Month Options (`DAY_OF_MONTH_OPTIONS`)**:
  * Safe calendar range 1st through 28th with ordinal suffixes (`1st`, `2nd`, `3rd`, `4th` ... `28th`).
  * Special `'L'` option for "Last day" of the month.

* **Time Slots Generator (`getTimeOptions()`)**:
  * Generates 48 discrete 30-minute time slots across 24 hours (`00:00` to `23:30`).
  * Display labels formatted in 12-hour AM/PM: `12:00 AM`, `12:30 AM` ... `11:30 PM`.

---

### 2.2 Core Logic Modules

#### A. Builder Module (`src/core/builder.ts` $\rightarrow$ `buildCronExpression`)
Constructs a valid 5-part cron string (`M H DOM MON DOW`):
* **Parameters**:
  ```typescript
  interface BuildCronParams {
    unit?: 'day' | 'week' | 'month';
    interval?: number;
    time?: string;                 // 'HH:mm' (24-hour)
    weekday?: number;              // 0 (Sun) - 6 (Sat)
    dayOfMonth?: number | 'L';     // 1 - 28 or 'L'
  }
  ```
* **Logic**:
  * Extracts hour (`0-23`) and minute (`0-59`) from `time`.
  * **Day Unit**:
    * Interval $= 1 \rightarrow$ `M H * * *`
    * Interval $> 1 \rightarrow$ `M H */N * *`
  * **Week Unit**:
    * `M H * * DOW` (where `DOW` is 0–6)
  * **Month Unit**:
    * Interval $= 1 \rightarrow$ `M H DOM * *`
    * Interval $> 1 \rightarrow$ `M H DOM */N *`
    * Supports `'L'` for day of month (`M H L * *` or `M H L */N *`)

#### B. Parser Module (`src/core/parser.ts` $\rightarrow$ `parseCronExpression`)
Parses any 5-part cron string back into structured parameters for UI hydration:
* **Preset Matching**:
  * Detects exact presets (`DAILY`, `WEEKLY`, `MONTHLY`) and sets corresponding `type`.
* **Field Extraction**:
  * Splits into `[minute, hour, dayOfMonth, month, dayOfWeek]`.
  * Formats `time` as padded `HH:mm`.
* **Unit & Interval Inversion**:
  * If `dayOfWeek !== '*'` $\rightarrow$ unit `'week'`, extracts `weekday`, defaults interval to 1.
  * If `dayOfMonth !== '*'` and not step $\rightarrow$ unit `'month'`, extracts interval from `month` field (`*/N` or 1), dayOfMonth (1–28 or `'L'`).
  * If `dayOfMonth` is `*` or `*/N` $\rightarrow$ unit `'day'`, extracts interval from `dayOfMonth` field.
* **Return Shape**:
  ```typescript
  interface ParsedSchedule {
    type: 'daily' | 'weekly' | 'monthly' | 'custom' | '';
    unit: 'day' | 'week' | 'month';
    interval: number;
    time: string;
    weekday: number;
    dayOfMonth: number | 'L';
    cron: string;
  }
  ```

#### C. Describer Module (`src/core/describer.ts` $\rightarrow$ `describeCronExpression`)
Generates clear human-readable descriptions:
* Extracts time formatted in 12-hour format: `hh:mm AM/PM`.
* Handles standard presets:
  * `"Every day at 01:00 AM"`
  * `"Every Saturday at 01:00 AM"`
  * `"Monthly on the 1st at 01:00 AM"`
* Handles custom schedules:
  * Day: `"Every day at {time}"` or `"Every {N} days at {time}"`
  * Week: `"Every week on {WeekdayName} at {time}"`
  * Month: `"Every month on the {day} at {time}"`, `"Every quarter on the {day} at {time}"`, `"Every {N} months on the {day} at {time}"`
  * Formats day suffixes (`1st`, `2nd`, `3rd`, etc.) and `'L'` as `"last day"`.
  * Fallback: `"Scheduled ({cron})"`.

#### D. Validator Module (`src/core/validator.ts` $\rightarrow$ `validateCronExpression`)
* Tokenizes into 5 parts: `[Minute] [Hour] [Day of Month] [Month] [Day of Week]`.
* Validates field counts (must be exactly 5 whitespace-separated tokens).
* Checks allowable characters: digits, `*`, `/`, `-`, `,`, and `'L'`.
* Validates bounds:
  * Minute: $0 - 59$
  * Hour: $0 - 23$
  * Day of Month: $1 - 31$ or `'L'`
  * Month: $1 - 12$
  * Day of Week: $0 - 6$
* Returns validation result:
  ```typescript
  interface ValidationResult {
    isValid: boolean;
    errors: Array<{ field?: string; message: string }>;
  }
  ```

---

### 2.3 User Interface & Schedule Selector Component

#### A. Schedule Selector Component (`src/components/ScheduleSelector/ScheduleSelector.tsx`)
A dedicated component implementing the guided schedule configuration workflow:
1. **Top-Level Type Picker**:
   * Dropdown options: `None`, `Daily`, `Weekly`, `Monthly`, `Custom...`.
   * Selecting a preset automatically assigns the preset string and displays an inline description with a clock icon.
2. **Custom Configuration Card**:
   * **Frequency Selector**: Single pick dropdown matching `CUSTOM_SCHEDULE_OPTIONS`.
   * **Conditional Day Pickers**:
     * Shows **"On"** weekday selector when `unit === 'week'`.
     * Shows **"On the"** day-of-month selector (1–28 or Last day) when `unit === 'month'`.
   * **"At" Time Picker**: Dropdown of 30-minute intervals (`getTimeOptions()`).
3. **Anti-Reset State Protection**:
   * Employs functional state updates for `scheduleType`:
     ```typescript
     setScheduleType((current) => (current === 'custom' ? 'custom' : parsed.type));
     ```
     This prevents custom schedules that happen to match preset strings (e.g., `0 1 * * 6`) from unintentionally flipping back to preset mode during edits.
4. **Live Inline Description Preview**:
   * Displays formatted sentence preview with clock icon.

#### B. Raw Cron Editor & Two-Way Synchronizer
* Monospaced input field displaying the raw 5-part string.
* Interactive token chips highlighting active fields:
  `[Minute]` `[Hour]` `[Day of Month]` `[Month]` `[Day of Week]`.
* Instant bidirectional synchronization:
  * Editing the raw text updates the visual selector dropdowns.
  * Adjusting the visual selector dropdowns updates the raw text input.

#### C. Upcoming Runs Calendar
* Computes and displays the next 5–10 execution timestamps.
* Displays formatted date, time, and relative countdown ("in 2 hours", "tomorrow at 1:00 AM").

---

## 3. Technology Stack & Project Structure

### 3.1 Recommended Tech Stack
* **Framework**: React 18 / 19 with Vite.
* **Language**: TypeScript (strict mode).
* **Styling**: CSS Modules or Tailwind CSS.
* **Icons**: Lucide React (`Clock`, `Copy`, `Check`, `AlertCircle`, `Calendar`).
* **Execution Calculator**: `croner` or standard date simulation for next run times.
* **Testing**: Vitest + React Testing Library.

### 3.2 Target Repository Structure

```text
cron-studio/
├── src/
│   ├── core/                      # Pure TypeScript cron engine
│   │   ├── constants.ts           # Presets, options, weekdays, day-of-month, time slots
│   │   ├── builder.ts             # buildCronExpression
│   │   ├── parser.ts              # parseCronExpression
│   │   ├── describer.ts           # describeCronExpression
│   │   ├── validator.ts           # validateCronExpression
│   │   ├── executions.ts          # Next N runs calculation
│   │   ├── types.ts               # Core interfaces and types
│   │   └── __tests__/
│   │       ├── builder.test.ts
│   │       ├── parser.test.ts
│   │       ├── describer.test.ts
│   │       └── validator.test.ts
│   ├── components/
│   │   ├── ScheduleSelector/      # Visual schedule input component
│   │   │   ├── ScheduleSelector.tsx
│   │   │   └── ScheduleSelector.module.scss
│   │   ├── CronEditor/
│   │   │   ├── RawCronInput.tsx   # Monospaced input with token highlighting
│   │   │   ├── FieldChips.tsx     # 5-field token breakdown indicators
│   │   │   └── ValidationBadge.tsx# Valid/Invalid status indicator
│   │   ├── LivePreview/
│   │   │   ├── DescriptionCard.tsx# Human-readable sentence display
│   │   │   └── NextRunsList.tsx   # Upcoming execution timestamps
│   │   ├── Cheatsheet/
│   │   │   └── CheatsheetModal.tsx# Quick reference guide for cron syntax
│   │   └── Header.tsx             # Navbar with copy button, mode toggle
│   ├── hooks/
│   │   └── useCronState.ts        # Two-way synchronization state hook
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 4. Implementation Roadmap

### Phase 1: Core Engine & Test Suite
1. Create `src/core/constants.ts` with `SCHEDULE_PRESETS`, `CUSTOM_SCHEDULE_OPTIONS`, `WEEKDAY_OPTIONS`, `DAY_OF_MONTH_OPTIONS`, and `getTimeOptions`.
2. Implement `src/core/builder.ts` with `buildCronExpression`.
3. Implement `src/core/parser.ts` with `parseCronExpression`.
4. Implement `src/core/describer.ts` with `describeCronExpression`.
5. Implement `src/core/validator.ts` with syntax and bounds checking.
6. Write unit tests in Vitest covering builder, parser, describer, and validator with 100% test coverage.

### Phase 2: ScheduleSelector Component
1. Build `ScheduleSelector.tsx` and `ScheduleSelector.module.scss`.
2. Implement top-level schedule type picker (`None`, `Daily`, `Weekly`, `Monthly`, `Custom...`).
3. Implement custom schedule card with compound frequency selector, conditional weekday and day-of-month pickers, and 30-minute time picker.
4. Implement anti-reset state hydration pattern.

### Phase 3: Raw Input & Bidirectional Synchronizer
1. Create `RawCronInput.tsx` with field badge chips.
2. Create `useCronState.ts` hook managing two-way synchronization between raw string and structured state.
3. Integrate `ValidationBadge.tsx` displaying real-time syntax and range errors.

### Phase 4: Explainer, Timeline & Polishing
1. Build `DescriptionCard.tsx` displaying the generated English description.
2. Build `NextRunsList.tsx` showing the next 5–10 trigger times.
3. Add one-click "Copy Cron Expression" with toast feedback.
4. Add Cron Syntax Cheatsheet modal.

---

## 5. Test Specifications

### 5.1 Unit Tests for Core Engine
* **Builder**:
  * Default params $\rightarrow$ `'0 1 * * *'`
  * Day unit with interval $1 \rightarrow$ `'0 1 * * *'`, interval $2 \rightarrow$ `'0 1 */2 * *'`
  * Week unit with weekday $6 \rightarrow$ `'0 1 * * 6'`, weekday $1 \rightarrow$ `'0 1 * * 1'`
  * Month unit with day $15$, interval $1 \rightarrow$ `'0 1 15 * *'`
  * Month unit with day `'L'`, interval $3 \rightarrow$ `'0 1 L */3 *'`
* **Parser**:
  * Exact presets $\rightarrow$ returns `'daily'`, `'weekly'`, `'monthly'`
  * `'0 1 * * 6'` $\rightarrow$ detects week unit, weekday 6
  * `'30 19 L * *'` $\rightarrow$ detects month unit, dayOfMonth `'L'`, interval 1
  * `'0 15 */3 * *'` $\rightarrow$ detects day unit, interval 3
* **Describer**:
  * `'0 1 * * *'` $\rightarrow$ `"Every day at 01:00 AM"`
  * `'0 1 * * 6'` $\rightarrow$ `"Every Saturday at 01:00 AM"`
  * `'0 1 1 * *'` $\rightarrow$ `"Monthly on the 1st at 01:00 AM"`
  * `'0 15 */3 * *'` $\rightarrow$ `"Every 3 days at 03:00 PM"`
  * `'0 1 L */3 *'` $\rightarrow$ `"Every quarter on the last day at 01:00 AM"`
* **Validator**:
  * Valid expressions $\rightarrow$ `{ isValid: true, errors: [] }`
  * Missing fields (`* * * *`) $\rightarrow$ `{ isValid: false, errors: ['Expected 5 fields'] }`
  * Invalid hour (`0 25 * * *`) $\rightarrow$ `{ isValid: false, errors: ['Hour must be between 0 and 23'] }`

---

## 6. Quickstart Commands for the New Repo

```bash
# 1. Create Vite React + TypeScript project
npm create vite@latest cron-studio -- --template react-ts

# 2. Navigate and install dependencies
cd cron-studio
npm install

# 3. Install icons, cron runner, and test runner
npm install lucide-react croner clsx
npm install -D vitest @testing-library/react jsdom

# 4. Start local development server
npm run dev
```
