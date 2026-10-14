import React, { useMemo, useState } from 'react';
import {
  ScheduleSelector,
  useScheduleSelector,
} from 'cron-schedule-kit/react';
import 'cron-schedule-kit/styles.css';
import {
  CUSTOM_SCHEDULE_OPTIONS,
  DAY_OF_MONTH_OPTIONS,
  SCHEDULE_PRESETS,
  WEEKDAY_OPTIONS,
  cronFromUtc,
  cronToUtc,
  describeCronExpression,
  getNextExecutions,
  getTimeOptions,
  validateCronExpression,
} from 'cron-schedule-kit';
import './demo.css';

export function App() {
  const [activeTab, setActiveTab] = useState<'visual' | 'headless' | 'validator' | 'docs'>('visual');

  // Tab 1 state: Visual Component
  const [visualCron, setVisualCron] = useState<string>('0 1 * * *');
  const [copiedVisual, setCopiedVisual] = useState(false);

  // Tab 3 state: Validator & Explainer
  const [customInputCron, setCustomInputCron] = useState<string>('30 14 */2 * *');
  const [timezoneOffset, setTimezoneOffset] = useState<number>(330); // 330m = IST

  // Copy helper
  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Next executions for Tab 1
  const visualNextRuns = useMemo(() => {
    return getNextExecutions(visualCron, 5);
  }, [visualCron]);

  // Validation & explainer for Tab 3
  const validationResult = useMemo(() => {
    return validateCronExpression(customInputCron);
  }, [customInputCron]);

  const customDescription = useMemo(() => {
    return describeCronExpression(customInputCron);
  }, [customInputCron]);

  const customNextRuns = useMemo(() => {
    return validationResult.isValid ? getNextExecutions(customInputCron, 5) : [];
  }, [customInputCron, validationResult.isValid]);

  const convertedUtc = useMemo(() => {
    return cronToUtc(customInputCron, timezoneOffset);
  }, [customInputCron, timezoneOffset]);

  const convertedBackLocal = useMemo(() => {
    return cronFromUtc(convertedUtc, timezoneOffset);
  }, [convertedUtc, timezoneOffset]);

  // Token breakdown helper
  const getTokenChips = (cronStr: string) => {
    const parts = (cronStr || '').trim().split(/\s+/);
    return [
      { name: 'Minute', val: parts[0] || '-' },
      { name: 'Hour', val: parts[1] || '-' },
      { name: 'Day of Month', val: parts[2] || '-' },
      { name: 'Month', val: parts[3] || '-' },
      { name: 'Day of Week', val: parts[4] || '-' },
    ];
  };

  return (
    <div className="demo-app">
      {/* Header */}
      <header className="demo-header">
        <div className="demo-badge">
          <span>⚡</span>
          <span>Zero Runtime Dependencies &bull; Pure TypeScript</span>
        </div>
        <h1 className="demo-title">cron-schedule-kit</h1>
        <p className="demo-subtitle">
          Microscopic, zero-dependency cron expression builder, parser, validator, and human describer
          with headless and drop-in React components.
        </p>

        <div className="demo-stats">
          <div className="demo-stat-pill">Bundle: <strong>&lt; 3 KB</strong> gzipped</div>
          <div className="demo-stat-pill">Core Dependencies: <strong>0</strong></div>
          <div className="demo-stat-pill">Targets: <strong>ESM + CJS + TS</strong></div>
          <div className="demo-stat-pill">React: <strong>Opt-in (/react)</strong></div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="demo-tabs" aria-label="Demo Navigation Tabs">
        <button
          id="tab-btn-visual"
          className={`demo-tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
          onClick={() => setActiveTab('visual')}
        >
          🎨 Ready-to-Use Component
        </button>
        <button
          id="tab-btn-headless"
          className={`demo-tab-btn ${activeTab === 'headless' ? 'active' : ''}`}
          onClick={() => setActiveTab('headless')}
        >
          🧩 Headless Hook (Tailwind / Custom)
        </button>
        <button
          id="tab-btn-validator"
          className={`demo-tab-btn ${activeTab === 'validator' ? 'active' : ''}`}
          onClick={() => setActiveTab('validator')}
        >
          🔍 Validator & Timezone Shifter
        </button>
        <button
          id="tab-btn-docs"
          className={`demo-tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          📖 Cheatsheet & Documentation
        </button>
      </nav>

      {/* TAB 1: Visual Drop-in Component */}
      {activeTab === 'visual' && (
        <div className="demo-grid-2">
          <div className="demo-card">
            <div className="demo-card-header">
              <h2 className="demo-card-title">Interactive Component</h2>
              <span className="demo-stat-pill">Subpath: cron-schedule-kit/react</span>
            </div>
            <p className="demo-card-desc">
              A drop-in schedule picker with built-in presets, conditional pickers, and live preview.
            </p>

            {/* Drop-in Component */}
            <ScheduleSelector
              value={visualCron}
              onChange={(next) => setVisualCron(next)}
            />

            {/* Cron Output */}
            <div className="cron-output-box">
              <div className="cron-output-main">
                <div>
                  <div className="field-chip-name">Constructed Cron Expression</div>
                  <div className="cron-raw-text">{visualCron || '(none)'}</div>
                </div>
                <button
                  id="btn-copy-cron"
                  className={`btn-copy ${copiedVisual ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(visualCron, setCopiedVisual)}
                >
                  {copiedVisual ? '✓ Copied' : 'Copy Cron'}
                </button>
              </div>

              {/* 5-part Field Chips */}
              <div className="cron-fields-row">
                {getTokenChips(visualCron).map((chip) => (
                  <div key={chip.name} className="field-chip">
                    <span className="field-chip-name">{chip.name}</span>
                    <span className="field-chip-val">{chip.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="demo-card">
            <div className="demo-card-header">
              <h2 className="demo-card-title">Live Upcoming Executions</h2>
              <span className="demo-stat-pill">getNextExecutions()</span>
            </div>
            <p className="demo-card-desc">
              Real-time calculation of upcoming trigger timestamps based on the active schedule.
            </p>

            <div className="next-runs-list">
              {visualNextRuns.length > 0 ? (
                visualNextRuns.map((date, idx) => (
                  <div key={idx} className="next-run-item">
                    <span className="next-run-date">
                      {date.toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="next-run-badge">Run #{idx + 1}</span>
                  </div>
                ))
              ) : (
                <div className="next-run-item" style={{ justifyContent: 'center' }}>
                  No upcoming runs scheduled
                </div>
              )}
            </div>

            <h3 className="demo-card-title" style={{ marginTop: '12px', fontSize: '1rem' }}>
              Quick Usage Code
            </h3>
            <pre className="code-block">
{`import { ScheduleSelector } from 'cron-schedule-kit/react';
import 'cron-schedule-kit/styles.css';

function MyScheduleConfig() {
  const [cron, setCron] = useState('0 1 * * *');

  return (
    <ScheduleSelector
      value={cron}
      onChange={setCron}
    />
  );
}`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: Headless Hook */}
      {activeTab === 'headless' && <HeadlessHookDemo />}

      {/* TAB 3: Validator & Timezone Shifter */}
      {activeTab === 'validator' && (
        <div className="demo-grid-2">
          <div className="demo-card">
            <div className="demo-card-header">
              <h2 className="demo-card-title">Live Syntax Validator & Explainer</h2>
              <span className="demo-stat-pill">validateCronExpression()</span>
            </div>

            <div>
              <label htmlFor="custom-cron-input" className="field-chip-name" style={{ display: 'block', marginBottom: '6px' }}>
                Type or Paste any 5-Part Cron String:
              </label>
              <input
                id="custom-cron-input"
                type="text"
                className="demo-input"
                value={customInputCron}
                onChange={(e) => setCustomInputCron(e.target.value)}
                placeholder="e.g. */15 0-23/2 1-5 * *"
              />
            </div>

            {/* Validation Badge */}
            <div className={`validation-card ${validationResult.isValid ? 'valid' : 'invalid'}`}>
              <span>{validationResult.isValid ? '✓' : '⚠️'}</span>
              <span>
                {validationResult.isValid
                  ? 'Valid 5-part cron syntax'
                  : validationResult.errors.join('; ')}
              </span>
            </div>

            {/* Description */}
            <div className="cron-output-box">
              <div className="field-chip-name">Natural Language Description</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#38bdf8' }}>
                {customDescription}
              </div>
            </div>

            {/* Field breakdown */}
            <div className="cron-fields-row">
              {getTokenChips(customInputCron).map((chip) => (
                <div key={chip.name} className="field-chip">
                  <span className="field-chip-name">{chip.name}</span>
                  <span className="field-chip-val">{chip.val}</span>
                </div>
              ))}
            </div>

            <div className="next-runs-list" style={{ marginTop: '10px' }}>
              <div className="field-chip-name">Next Upcoming Runs:</div>
              {customNextRuns.slice(0, 3).map((d, i) => (
                <div key={i} className="next-run-item">
                  <span className="next-run-date">
                    {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                    {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="next-run-badge">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timezone Converter Card */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h2 className="demo-card-title">Timezone Shifter & "L" Engine</h2>
              <span className="demo-stat-pill">cronToUtc() / cronFromUtc()</span>
            </div>
            <p className="demo-card-desc">
              Seamlessly shift expressions across midnight boundaries with automated dynamic <strong>'L' (Last Day of Month)</strong> mapping.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="tz-offset-select" className="field-chip-name">
                Select Client Timezone Offset:
              </label>
              <select
                id="tz-offset-select"
                className="demo-input"
                value={timezoneOffset}
                onChange={(e) => setTimezoneOffset(Number(e.target.value))}
              >
                <option value={330}>India Standard Time (IST, UTC+05:30, +330m)</option>
                <option value={-300}>US Eastern Time (EST, UTC-05:00, -300m)</option>
                <option value={-480}>US Pacific Time (PST, UTC-08:00, -480m)</option>
                <option value={60}>Central European Time (CET, UTC+01:00, +60m)</option>
                <option value={540}>Japan Standard Time (JST, UTC+09:00, +540m)</option>
              </select>
            </div>

            <table className="demo-table" style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Direction</th>
                  <th>Cron Expression</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: '#38bdf8', fontWeight: 600 }}>Local Schedule</td>
                  <td><code>{customInputCron}</code></td>
                  <td>{customDescription}</td>
                </tr>
                <tr>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>UTC Payload</td>
                  <td><code>{convertedUtc}</code></td>
                  <td>Sent to backend worker</td>
                </tr>
                <tr>
                  <td style={{ color: '#a5b4fc', fontWeight: 600 }}>Hydrated Local</td>
                  <td><code>{convertedBackLocal}</code></td>
                  <td>Lossless round-trip</td>
                </tr>
              </tbody>
            </table>

            <div className="validation-card valid" style={{ marginTop: '10px' }}>
              <span>💡</span>
              <span>
                <strong>1st of month edge case handled:</strong> When local schedule is 1st of month at &lt; 05:30 AM IST, UTC rewinds to <strong>'L' (last day of preceding month)</strong> automatically.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Cheatsheet & Documentation */}
      {activeTab === 'docs' && <DocsAndCheatsheet />}
    </div>
  );
}

// Headless Hook Demonstration Component
function HeadlessHookDemo() {
  const [cron, setCron] = useState<string>('0 1 * * 6');
  const timeOptions = useMemo(() => getTimeOptions(), []);

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
  } = useScheduleSelector({
    value: cron,
    onChange: setCron,
  });

  return (
    <div className="demo-grid-2">
      <div className="demo-card">
        <div className="demo-card-header">
          <h2 className="demo-card-title">Custom Tailwind-style UI</h2>
          <span className="demo-stat-pill">useScheduleSelector</span>
        </div>
        <p className="demo-card-desc">
          Build any completely custom UI without being constrained by existing CSS classes.
        </p>

        {/* Custom Pill-style Type buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['daily', 'weekly', 'monthly', 'custom'].map((t) => (
            <button
              key={t}
              type="button"
              id={`headless-type-${t}`}
              onClick={() => setScheduleType(t)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
                background: scheduleType === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Custom Inputs */}
        {scheduleType === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <div>
              <label className="field-chip-name" style={{ display: 'block', marginBottom: '4px' }}>
                Frequency:
              </label>
              <select
                className="demo-input"
                value={custKey}
                onChange={(e) => setCustKey(e.target.value)}
              >
                {CUSTOM_SCHEDULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {needsWeekday && (
              <div>
                <label className="field-chip-name" style={{ display: 'block', marginBottom: '4px' }}>
                  Weekday:
                </label>
                <select
                  className="demo-input"
                  value={weekday}
                  onChange={(e) => setWeekday(Number(e.target.value))}
                >
                  {WEEKDAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {needsDayOfMonth && (
              <div>
                <label className="field-chip-name" style={{ display: 'block', marginBottom: '4px' }}>
                  Day of Month:
                </label>
                <select
                  className="demo-input"
                  value={dayOfMonth}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDayOfMonth(v === 'L' ? 'L' : Number(v));
                  }}
                >
                  {DAY_OF_MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="field-chip-name" style={{ display: 'block', marginBottom: '4px' }}>
                Time:
              </label>
              <select
                className="demo-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="cron-output-box">
          <div className="field-chip-name">Active Schedule Output</div>
          <div className="cron-raw-text">{cron}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{description}</div>
        </div>
      </div>

      <div className="demo-card">
        <h2 className="demo-card-title">How to Use the Hook</h2>
        <p className="demo-card-desc">
          Drop the hook into any Tailwind, Chakra, or Shadcn component.
        </p>

        <pre className="code-block">
{`import { useScheduleSelector } from 'cron-schedule-kit/react';

function CustomTailwindPicker({ value, onChange }) {
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
    <div className="space-y-4">
      {/* Your custom design system buttons/inputs */}
      <span className="text-sm font-medium">{description}</span>
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
}

// Cheatsheet & Documentation Component
function DocsAndCheatsheet() {
  return (
    <div className="demo-grid-2">
      <div className="demo-card">
        <h2 className="demo-card-title">Standard 5-Part Cron Syntax</h2>
        <p className="demo-card-desc">
          Format: <code>Minute Hour Day-of-Month Month Day-of-Week</code>
        </p>

        <table className="demo-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Allowed Values</th>
              <th>Special Characters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Minute</td>
              <td><code>0 - 59</code></td>
              <td><code>* / - ,</code></td>
            </tr>
            <tr>
              <td>2. Hour</td>
              <td><code>0 - 23</code></td>
              <td><code>* / - ,</code></td>
            </tr>
            <tr>
              <td>3. Day of Month</td>
              <td><code>1 - 31, L</code></td>
              <td><code>* / - , L</code></td>
            </tr>
            <tr>
              <td>4. Month</td>
              <td><code>1 - 12 (JAN-DEC)</code></td>
              <td><code>* / - ,</code></td>
            </tr>
            <tr>
              <td>5. Day of Week</td>
              <td><code>0 - 6 (SUN-SAT)</code></td>
              <td><code>* / - ,</code></td>
            </tr>
          </tbody>
        </table>

        <h3 className="demo-card-title" style={{ marginTop: '16px', fontSize: '1rem' }}>
          Special Characters Reference
        </h3>
        <table className="demo-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>*</code></td>
              <td>Any / every value</td>
              <td><code>* * * * *</code> (every minute)</td>
            </tr>
            <tr>
              <td><code>/</code></td>
              <td>Step intervals</td>
              <td><code>*/15 * * * *</code> (every 15 mins)</td>
            </tr>
            <tr>
              <td><code>-</code></td>
              <td>Inclusive range</td>
              <td><code>0 9-17 * * 1-5</code> (work hours)</td>
            </tr>
            <tr>
              <td><code>,</code></td>
              <td>Value list</td>
              <td><code>0 0 1,15 * *</code> (1st and 15th)</td>
            </tr>
            <tr>
              <td><code>L</code></td>
              <td>Last day of the month</td>
              <td><code>0 1 L * *</code> (last day at 1 AM)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="demo-card">
        <h2 className="demo-card-title">Installation & Package API</h2>
        <p className="demo-card-desc">
          Install the zero-dependency core package with any package manager:
        </p>

        <pre className="code-block">
{`# npm
npm install cron-schedule-kit

# pnpm
pnpm add cron-schedule-kit

# yarn
yarn add cron-schedule-kit`}
        </pre>

        <h3 className="demo-card-title" style={{ marginTop: '16px', fontSize: '1rem' }}>
          Core API Exports
        </h3>
        <pre className="code-block">
{`import {
  buildCronExpression,
  parseCronExpression,
  describeCronExpression,
  validateCronExpression,
  getNextExecutions,
  cronToUtc,
  cronFromUtc,
  SCHEDULE_PRESETS,
} from 'cron-schedule-kit';

// 1. Build
buildCronExpression({ unit: 'week', weekday: 1, time: '09:00' });
// -> '0 9 * * 1'

// 2. Describe
describeCronExpression('0 9 * * 1');
// -> 'Every week on Monday at 09:00 AM'

// 3. Validate
validateCronExpression('0 9 * * 1');
// -> { isValid: true, errors: [] }

// 4. Next executions
getNextExecutions('0 9 * * 1', 5);
// -> [ Date, Date, Date, Date, Date ]

// 5. Timezone convert (IST to UTC)
cronToUtc('0 1 1 * *', 330);
// -> '30 19 L * *'`}
        </pre>
      </div>
    </div>
  );
}
