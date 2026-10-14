import React, { useMemo } from 'react';
import {
  CUSTOM_SCHEDULE_OPTIONS,
  DAY_OF_MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
  getTimeOptions,
} from '../core/constants';
import { useScheduleSelector } from './useScheduleSelector';

export interface ScheduleSelectorProps {
  value?: string;
  onChange?: (cron: string) => void;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
}

export function ScheduleSelector({
  value,
  onChange,
  disabled = false,
  className = '',
  showPreview = true,
}: ScheduleSelectorProps): React.JSX.Element {
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
  } = useScheduleSelector({ value, onChange, disabled });

  const timeOptions = useMemo(() => getTimeOptions(), []);

  return (
    <div className={`csk-container ${className}`.trim()}>
      <div className="csk-row">
        <div className="csk-field">
          <label className="csk-label" htmlFor="csk-type-select">
            Schedule
          </label>
          <select
            id="csk-type-select"
            className="csk-select"
            value={scheduleType}
            disabled={disabled}
            onChange={(e) => setScheduleType(e.target.value)}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom...</option>
          </select>
        </div>

        {scheduleType === 'custom' && (
          <div className="csk-custom-card">
            <div className="csk-field">
              <label className="csk-label" htmlFor="csk-frequency-select">
                Frequency
              </label>
              <select
                id="csk-frequency-select"
                className="csk-select"
                value={custKey}
                disabled={disabled}
                onChange={(e) => setCustKey(e.target.value)}
              >
                {CUSTOM_SCHEDULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {needsWeekday && (
              <div className="csk-field">
                <label className="csk-label" htmlFor="csk-weekday-select">
                  On
                </label>
                <select
                  id="csk-weekday-select"
                  className="csk-select"
                  value={weekday}
                  disabled={disabled}
                  onChange={(e) => setWeekday(Number(e.target.value))}
                >
                  {WEEKDAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {needsDayOfMonth && (
              <div className="csk-field">
                <label className="csk-label" htmlFor="csk-dom-select">
                  On the
                </label>
                <select
                  id="csk-dom-select"
                  className="csk-select"
                  value={dayOfMonth}
                  disabled={disabled}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDayOfMonth(v === 'L' ? 'L' : Number(v));
                  }}
                >
                  {DAY_OF_MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="csk-field">
              <label className="csk-label" htmlFor="csk-time-select">
                At
              </label>
              <select
                id="csk-time-select"
                className="csk-select"
                value={time}
                disabled={disabled}
                onChange={(e) => setTime(e.target.value)}
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {showPreview && scheduleType !== 'none' && (
        <div className="csk-preview" role="status">
          <svg
            className="csk-preview-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{description}</span>
        </div>
      )}
    </div>
  );
}
