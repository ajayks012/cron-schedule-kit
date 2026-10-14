import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CUSTOM_SCHEDULE_OPTIONS,
  SCHEDULE_PRESETS,
} from '../core/constants';
import { buildCronExpression } from '../core/builder';
import { parseCronExpression } from '../core/parser';
import { describeCronExpression } from '../core/describer';
import type { ScheduleUnit } from '../core/types';

export interface UseScheduleSelectorOptions {
  value?: string;
  onChange?: (cron: string) => void;
  disabled?: boolean;
}

export interface UseScheduleSelectorReturn {
  scheduleType: string;
  setScheduleType: (type: string | ((curr: string) => string)) => void;
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
  activeCron: string;
}

export function useScheduleSelector({
  value = SCHEDULE_PRESETS.DAILY,
  onChange,
  disabled = false,
}: UseScheduleSelectorOptions = {}): UseScheduleSelectorReturn {
  const initialParsed = useMemo(() => parseCronExpression(value), []);

  const [scheduleType, setScheduleTypeState] = useState<string>(() => {
    if (!value) return 'none';
    return initialParsed.type || 'daily';
  });

  const [custKey, setCustKey] = useState<string>(() => {
    const unit = initialParsed.unit || 'day';
    const interval = initialParsed.interval || 1;
    const match = CUSTOM_SCHEDULE_OPTIONS.find(
      (opt) => opt.unit === unit && opt.interval === interval
    );
    return match ? match.value : 'day:1';
  });

  const [time, setTime] = useState<string>(initialParsed.time || '01:00');
  const [weekday, setWeekday] = useState<number>(initialParsed.weekday ?? 6);
  const [dayOfMonth, setDayOfMonth] = useState<number | 'L'>(initialParsed.dayOfMonth ?? 1);

  // Track internal changes to avoid feedback loops
  const isInternalChange = useRef(false);
  const lastEmittedValue = useRef(value);

  // Determine current unit and interval from custKey
  const currentCustOption = useMemo(() => {
    return (
      CUSTOM_SCHEDULE_OPTIONS.find((opt) => opt.value === custKey) ||
      CUSTOM_SCHEDULE_OPTIONS[0]
    );
  }, [custKey]);

  const needsWeekday = scheduleType === 'custom' && currentCustOption.unit === 'week';
  const needsDayOfMonth = scheduleType === 'custom' && currentCustOption.unit === 'month';

  // Compute active cron expression
  const activeCron = useMemo(() => {
    if (scheduleType === 'none') return '';
    if (scheduleType === 'daily') return SCHEDULE_PRESETS.DAILY;
    if (scheduleType === 'weekly') return SCHEDULE_PRESETS.WEEKLY;
    if (scheduleType === 'monthly') return SCHEDULE_PRESETS.MONTHLY;

    return buildCronExpression({
      unit: currentCustOption.unit as ScheduleUnit,
      interval: currentCustOption.interval,
      time,
      weekday,
      dayOfMonth,
    });
  }, [scheduleType, currentCustOption, time, weekday, dayOfMonth]);

  const description = useMemo(() => {
    if (scheduleType === 'none') return 'No schedule configured';
    return describeCronExpression(activeCron);
  }, [activeCron, scheduleType]);

  // Sync external `value` changes into state
  useEffect(() => {
    if (value === lastEmittedValue.current) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    lastEmittedValue.current = value;
    if (!value) {
      setScheduleTypeState('none');
      return;
    }

    const parsed = parseCronExpression(value);
    // Anti-reset pattern: preserve custom mode if user was customizing
    setScheduleTypeState((curr) => (curr === 'custom' ? 'custom' : parsed.type || 'custom'));

    const match = CUSTOM_SCHEDULE_OPTIONS.find(
      (opt) => opt.unit === parsed.unit && opt.interval === parsed.interval
    );
    if (match) {
      setCustKey(match.value);
    }
    if (parsed.time) setTime(parsed.time);
    if (parsed.weekday !== undefined) setWeekday(parsed.weekday);
    if (parsed.dayOfMonth !== undefined) setDayOfMonth(parsed.dayOfMonth);
  }, [value]);

  // Notify parent on internal state changes
  useEffect(() => {
    if (disabled) return;
    if (activeCron !== lastEmittedValue.current) {
      lastEmittedValue.current = activeCron;
      isInternalChange.current = true;
      onChange?.(activeCron);
    }
  }, [activeCron, onChange, disabled]);

  const setScheduleType = useCallback(
    (typeOrFn: string | ((curr: string) => string)) => {
      setScheduleTypeState((prev) => {
        const next = typeof typeOrFn === 'function' ? typeOrFn(prev) : typeOrFn;
        return next;
      });
    },
    []
  );

  return {
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
    activeCron,
  };
}
