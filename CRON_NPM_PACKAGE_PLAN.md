# Architecture & Implementation Plan: `cron-schedule-kit` (NPM Package)

> **Design Philosophy (Ponytail / Senior Dev Mode)**:  
> - **Zero Runtime Dependencies**: The core engine must be pure TypeScript (< 3 KB gzipped).  
> - **No Monorepo Sprawl**: Keep everything in a single, lean repository with `tsup` and an integrated `/demo` app. No Turborepo, no Nx, no multi-package overhead.  
> - **Dual Entry Points**: Core logic runs anywhere (Node, Bun, Deno, Browser). The React UI component is an opt-in subpath (`cron-schedule-kit/react`).  
> - **Headless First**: Provide both a ready-to-use `<ScheduleSelector />` component and a headless `useScheduleSelector` hook so consumers can style it with Tailwind, vanilla CSS, or their own UI system.

---

## 1. Package Specifications

* **Package Name**: `cron-schedule-kit` (or scoped `@your-org/cron-schedule-kit`)
* **Bundle Targets**: ESM (`.mjs`), CommonJS (`.cjs`), and TypeScript types (`.d.ts`)
* **Peer Dependencies**: `react` >= 18.0.0 (required **only** if importing `/react`)
* **Build Tooling**: `tsup` (esbuild-based, zero-config bundler with dts generation)
* **Testing**: `vitest` (fast, native ESM/TS test runner)

---

## 2. API Contract & Public Exports

### 2.1 Core Subpath (`import { ... } from 'cron-schedule-kit'`)
*Pure JavaScript/TypeScript, 0 dependencies, runs in Node.js or the browser.*

```typescript
// 1. Constants & Presets
export const SCHEDULE_PRESETS: {
  DAILY: '0 1 * * *';
  WEEKLY: '0 1 * * 6';
  MONTHLY: '0 1 1 * *';
};

export const CUSTOM_SCHEDULE_OPTIONS: Array<{
  value: string;
  unit: 'day' | 'week' | 'month';
  interval: number;
  label: string;
}>;

export const WEEKDAY_OPTIONS: Array<{ value: number; label: string }>;
export const DAY_OF_MONTH_OPTIONS: Array<{ value: number | 'L'; label: string }>;
export const getTimeOptions: () => Array<{ value: string; label: string }>;

// 2. Core Functions
export function buildCronExpression(params?: {
  unit?: 'day' | 'week' | 'month';
  interval?: number;
  time?: string;                 // 'HH:mm' (24h)
  weekday?: number;              // 0 (Sun) - 6 (Sat)
  dayOfMonth?: number | 'L';     // 1 - 28 or 'L'
}): string;

export function parseCronExpression(cron: string): {
  type: 'daily' | 'weekly' | 'monthly' | 'custom' | '';
  unit: 'day' | 'week' | 'month';
  interval: number;
  time: string;
  weekday: number;
  dayOfMonth: number | 'L';
  cron: string;
};

export function describeCronExpression(cron: string): string;

export function validateCronExpression(cron: string): {
  isValid: boolean;
  errors: string[];
};

export function getNextExecutions(cron: string, count?: number, startDate?: Date): Date[];
```

---

### 2.2 React Subpath (`import { ... } from 'cron-schedule-kit/react'`)
*Optional UI layer, treeshakeable.*

```tsx
// 1. Ready-to-use Component (includes lightweight CSS)
export interface ScheduleSelectorProps {
  value?: string;
  onChange?: (cron: string) => void;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
}
export function ScheduleSelector(props: ScheduleSelectorProps): JSX.Element;

// 2. Headless Hook (for consumers who want their own custom JSX / Tailwind styles)
export function useScheduleSelector(options: {
  value?: string;
  onChange?: (cron: string) => void;
  disabled?: boolean;
}): {
  scheduleType: string;
  setScheduleType: (type: string) => void;
  custKey: string;
  setCustKey: (key: string) => void;
  time: string;
  setTime: (time: string) => void;
  weekday: number;
  setWeekday: (day: number) => void;
  dayOfMonth: number | 'L';
  setDayOfMonth: (dom: number | 'L') => void;
  description: string;
  needsWeekday: boolean;
  needsDayOfMonth: boolean;
};
```

---

## 3. Repository Structure

Single repository with root build and co-located demo playground:

```text
cron-schedule-kit/
├── src/
│   ├── core/                      # Pure TypeScript logic (0 dependencies)
│   │   ├── constants.ts           # Presets, options, time slots
│   │   ├── builder.ts             # buildCronExpression
│   │   ├── parser.ts              # parseCronExpression
│   │   ├── describer.ts           # describeCronExpression
│   │   ├── validator.ts           # validateCronExpression
│   │   ├── executions.ts          # getNextExecutions (lightweight date math)
│   │   └── types.ts               # Shared TypeScript interfaces
│   ├── react/                     # React UI module
│   │   ├── ScheduleSelector.tsx   # Production-ready schedule selector
│   │   ├── useScheduleSelector.ts # Headless hook for custom UIs
│   │   └── styles.css             # Scoped, self-contained styles (no Tailwind dependency)
│   ├── index.ts                   # Core entry point
│   └── react.ts                   # React entry point
├── test/                          # Unit and integration test suite
│   ├── builder.test.ts
│   ├── parser.test.ts
│   ├── describer.test.ts
│   ├── validator.test.ts
│   └── react.test.tsx
├── demo/                          # Local playground & GitHub Pages interactive demo
│   ├── index.html
│   ├── src/
│   │   ├── App.tsx                # Visual playground, live validator, docs
│   │   └── main.tsx
│   └── vite.config.ts
├── tsup.config.ts                 # Dual ESM/CJS build config
├── vitest.config.ts               # Test configuration
├── tsconfig.json
├── package.json
├── LICENSE
└── README.md
```

---

## 4. `package.json` Configuration

Configured for universal package manager compatibility (Node 16+, Bundlers, TypeScript 5+):

```json
{
  "name": "cron-schedule-kit",
  "version": "1.0.0",
  "description": "Zero-dependency cron expression generator, parser, validator and human describer with optional React component",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.cjs"
      }
    },
    "./react": {
      "import": {
        "types": "./dist/react.d.ts",
        "default": "./dist/react.mjs"
      },
      "require": {
        "types": "./dist/react.d.ts",
        "default": "./dist/react.cjs"
      }
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": [
    "dist"
  ],
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev:demo": "vite --config demo/vite.config.ts",
    "build:demo": "vite build --config demo/vite.config.ts",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run test && npm run build"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "jsdom": "^25.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

---

## 5. Build Configuration (`tsup.config.ts`)

Clean, blazing fast build with automatic `.d.ts` emission:

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  onSuccess: 'cp src/react/styles.css dist/styles.css',
});
```

---

## 6. Implementation Sprints (Senior Dev Roadmap)

### Sprint 1: Project Setup & Core Logic Engine
* **Goal**: Fully tested, zero-dependency cron core engine.
* **Tasks**:
  1. Initialize repo with `package.json`, `tsconfig.json`, `tsup.config.ts`, and `vitest.config.ts`.
  2. Implement `src/core/constants.ts`:
     - `SCHEDULE_PRESETS`
     - `CUSTOM_SCHEDULE_OPTIONS` (11 flat compound options)
     - `WEEKDAY_OPTIONS`
     - `DAY_OF_MONTH_OPTIONS` (1–28 + 'L')
     - `getTimeOptions()` (48 30-min slots in 12h format)
  3. Implement `src/core/builder.ts` (`buildCronExpression` with clamping & sanitization).
  4. Implement `src/core/parser.ts` (`parseCronExpression` with preset matching & split logic).
  5. Implement `src/core/describer.ts` (`describeCronExpression` with 12h AM/PM & ordinal suffixes).
  6. Implement `src/core/validator.ts` (`validateCronExpression` checking 5 parts, ranges, syntax).
  7. Implement `src/core/executions.ts` (lightweight date simulation for next N runs without heavy external dependencies).
  8. Write 100% test coverage in `test/*.test.ts`.

### Sprint 2: React Subpath (Component & Headless Hook)
* **Goal**: Developer-friendly React integration with styling flexibility.
* **Tasks**:
  1. Implement `useScheduleSelector.ts`:
     - Encapsulates the state logic, preset switching, and the **functional updater anti-reset pattern** (`setScheduleType((curr) => curr === 'custom' ? 'custom' : parsed.type)`).
     - Allows consumers to build their own UI with Tailwind, Chakra, Shadcn, or custom JSX.
  2. Implement `ScheduleSelector.tsx`:
     - Scoped, self-contained CSS (`styles.css`).
     - Dropdown for presets, flat frequency picker, conditional weekday/day-of-month, and time picker.
     - Live preview sentence with clock icon.
  3. Add component tests using React Testing Library in `test/react.test.tsx`.

### Sprint 3: Interactive Demo & Docs App (`/demo`)
* **Goal**: A deployable playground website to test, dogfood, and showcase the package.
* **Tasks**:
  1. Configure Vite app inside `demo/`.
  2. Build interactive tabs:
     - **Visual Selector Tab**: Uses the `<ScheduleSelector />` component with copyable output.
     - **Headless Hook Tab**: Demonstrates using `useScheduleSelector` with custom Tailwind styles.
     - **Validator & Explainer Tab**: Real-time cron input field with live syntax badges and English descriptions.
     - **Interactive Cheatsheet**: Quick reference table.
  3. Wire GitHub Pages workflow to auto-deploy the `/demo` build on push to `main`.

### Sprint 4: CI/CD & Publishing Workflow
* **Goal**: Automated testing and single-command npm publishing.
* **Tasks**:
  1. Set up GitHub Actions CI:
     - Run typecheck (`tsc --noEmit`).
     - Run unit tests (`vitest run`).
     - Run build verification (`npm run build`).
  2. Set up GitHub Release / NPM publish action:
     - Runs prepublish checks, builds bundle, publishes with provenance.
  3. Write clean, copy-paste ready `README.md` with installation commands, quickstart examples, and TypeScript API documentation.

---

## 7. Key Engineering Decisions (Ponytail Notes)

1. **Why No Monorepo?**
   A monorepo for a package under 500 lines of code introduces unnecessary tooling (pnpm workspaces, Turborepo configs, duplicated dependencies). Subpath exports (`"."` and `"./react"`) in a single repo provide the exact same user experience with 10x less complexity.
2. **Why Headless Hook + Styled Component?**
   Hardcoded styles cause friction when users want Tailwind CSS or their existing design system. Exporting both `ScheduleSelector` (drop-in) and `useScheduleSelector` (headless) gives instant adoption without forcing design decisions.
3. **Why Scoped Vanilla CSS for React?**
   Using Tailwind or SCSS in a library bundle forces consumers to have specific PostCSS/Sass preprocessors. Plain scoped CSS (`styles.css`) can be imported directly or bypassed in favor of the headless hook.
4. **Zero-Dependency Guarantee**:
   The entire core module has 0 dependencies. Even the upcoming run calculator can be written using native `Date` arithmetic for common 5-part schedules, keeping the bundle size microscopic.
