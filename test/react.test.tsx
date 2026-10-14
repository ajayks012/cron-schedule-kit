import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { ScheduleSelector } from '../src/react/ScheduleSelector';
import { useScheduleSelector } from '../src/react/useScheduleSelector';

describe('ScheduleSelector component', () => {
  it('renders default daily preset with live preview description', () => {
    render(<ScheduleSelector value="0 1 * * *" />);

    const typeSelect = screen.getByLabelText(/Schedule/i) as HTMLSelectElement;
    expect(typeSelect.value).toBe('daily');

    const preview = screen.getByRole('status');
    expect(preview.textContent).toContain('Every day at 01:00 AM');
  });

  it('switches between presets and calls onChange', () => {
    const handleChange = vi.fn();
    render(<ScheduleSelector value="0 1 * * *" onChange={handleChange} />);

    const typeSelect = screen.getByLabelText(/Schedule/i);
    fireEvent.change(typeSelect, { target: { value: 'weekly' } });

    expect(handleChange).toHaveBeenCalledWith('0 1 * * 6');
  });

  it('renders custom schedule pickers when custom is selected', () => {
    const handleChange = vi.fn();
    render(<ScheduleSelector value="0 1 * * *" onChange={handleChange} />);

    const typeSelect = screen.getByLabelText(/Schedule/i);
    fireEvent.change(typeSelect, { target: { value: 'custom' } });

    // Frequency and Time selects should now be visible
    expect(screen.getByLabelText(/Frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/At/i)).toBeInTheDocument();
  });

  it('renders weekday picker when frequency is week:1', () => {
    render(<ScheduleSelector value="0 9 * * 1" />);

    expect(screen.getByLabelText(/Frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/On/i)).toBeInTheDocument();
    const weekdaySelect = screen.getByLabelText(/On/i) as HTMLSelectElement;
    expect(weekdaySelect.value).toBe('1');
  });

  it('renders day of month picker when frequency is month:1', () => {
    render(<ScheduleSelector value="0 10 15 * *" />);

    expect(screen.getByLabelText(/Frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/On the/i)).toBeInTheDocument();
    const domSelect = screen.getByLabelText(/On the/i) as HTMLSelectElement;
    expect(domSelect.value).toBe('15');
  });
});

describe('useScheduleSelector hook', () => {
  it('protects against reset when editing custom schedule (anti-reset)', () => {
    const { result } = renderHook(() =>
      useScheduleSelector({ value: '0 1 * * *' })
    );

    expect(result.current.scheduleType).toBe('daily');

    // Switch to custom mode
    act(() => {
      result.current.setScheduleType('custom');
    });

    expect(result.current.scheduleType).toBe('custom');
  });
});
