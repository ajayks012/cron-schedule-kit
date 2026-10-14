# cronHelper Documentation

`cronHelper.js` provides lightweight utilities for generating, parsing, describing, and converting 5-part cron expressions between browser local time (IST) and UTC.

---

## 1. Cron Expression Format

Standard 5-part cron syntax:

```text
┌───────────── Minute (0 - 59)
│ ┌─────────── Hour (0 - 23)
│ │ ┌───────── Day of Month (1 - 28, or "L" for last day)
│ │ │ ┌─────── Month (1 - 12, *, or */N)
│ │ │ │ ┌───── Day of Week (0 - 6, Sunday=0 … Saturday=6)
│ │ │ │ │
* * * * *
```

---

## 2. API Reference

### `buildCronExpression(params)`
Builds a standard 5-part cron string from UI parameters.

```javascript
buildCronExpression({
  unit = 'day',        // 'day' | 'week' | 'month'
  interval = 1,        // e.g. 1, 2, 3, 7, 14, 30
  time = '01:00',      // 'HH:mm' in 24-hour format
  weekday = 6,         // 0 (Sun) - 6 (Sat)
  dayOfMonth = 1,      // 1 - 28 or 'L'
});
```

* **Day unit**: `n === 1` $\rightarrow$ `M H * * *`, `n > 1` $\rightarrow$ `M H */n * *`
* **Week unit**: `M H * * DOW`
* **Month unit**: `n === 1` $\rightarrow$ `M H DOM * *`, `n > 1` $\rightarrow$ `M H DOM */n *`

---

### `parseCronExpression(cron)`
Parses a 5-part cron string back into structured configuration parameters for UI state hydration.

```javascript
parseCronExpression('30 19 L * *');
// Returns:
// {
//   type: 'custom',
//   unit: 'month',
//   interval: 1,
//   time: '19:30',
//   weekday: 6,
//   dayOfMonth: 'L',
//   cron: '30 19 L * *'
// }
```

Matches presets directly:
* `0 1 * * *` $\rightarrow$ `type: 'daily'`
* `0 1 * * 6` $\rightarrow$ `type: 'weekly'`
* `0 1 1 * *` $\rightarrow$ `type: 'monthly'`

---

### `describeCronExpression(cron)`
Returns a concise human-readable description for UI preview.

```javascript
describeCronExpression('0 1 * * *');    // "Every day at 01:00 AM"
describeCronExpression('0 1 * * 6');    // "Every Saturday at 01:00 AM"
describeCronExpression('0 1 1 * *');    // "Monthly on the 1st at 01:00 AM"
describeCronExpression('0 0 L * *');    // "Every month on the last day at 12:00 AM"
describeCronExpression('30 15 */2 * *');// "Every 2 days at 03:30 PM"
```

---

### `cronToUtc(cron, [offsetMinutes])`
Converts a cron expression from local browser timezone (IST) to UTC.
* `offsetMinutes`: Defaults to `-new Date().getTimezoneOffset()` (+330 for IST).
* Shifts time backward by `offsetMinutes` (`-330m`).

```javascript
cronToUtc('0 1 * * *');   // "30 19 * * *"
cronToUtc('0 1 1 * *');   // "30 19 L * *" (1st day < 05:30 AM IST -> last day 'L' UTC)
cronToUtc('0 10 1 * *');  // "30 4 1 * *"  (>= 05:30 AM IST -> same day)
```

---

### `cronFromUtc(cron, [offsetMinutes])`
Converts a cron expression from UTC back to local browser timezone (IST).
* `offsetMinutes`: Defaults to `-new Date().getTimezoneOffset()` (+330 for IST).
* Shifts time forward by `offsetMinutes` (`+330m`).

```javascript
cronFromUtc('30 19 * * *');  // "0 1 * * *"
cronFromUtc('30 19 L * *');  // "0 1 1 * *" (last day 'L' UTC + 5:30 -> 1st day IST)
cronFromUtc('30 4 1 * *');   // "0 10 1 * *"
```

---

### `shiftCronTimezone(cron, deltaMinutes)`
Low-level engine that shifts minutes, hours, weekdays, and days of month across midnight boundaries.

```javascript
shiftCronTimezone('0 1 * * 6', -330); // "30 19 * * 5" (Sat 01:00 -> Fri 19:30)
```

---

## 3. Timezone & "L" (Last Day of Month) Logic

### Why "L" is used
When a user schedules a monthly refresh for the **1st of the month** at a time **before 05:30 AM IST** (e.g., 01:00 AM IST):
* IST is UTC+05:30.
* Converting to UTC subtracts 5 hours 30 minutes, crossing midnight backwards (`dayDelta = -1`).
* In UTC, the run time falls on the **last day of the preceding month**.
* Because month lengths vary (28, 29, 30, 31 days), the standard cron token **`L`** represents the dynamic last day of the month.

### Conversion Matrix (IST $\leftrightarrow$ UTC)

| Schedule in UI (IST) | UI Time | UTC Payload Sent to API | Edit Hydration (UTC $\rightarrow$ IST) | Explanation |
| :--- | :--- | :--- | :--- | :--- |
| **Daily** | 01:00 AM | `30 19 * * *` | `0 1 * * *` | Rewinds 5h 30m to previous day 19:30 UTC |
| **Weekly (Sat)** | 01:00 AM | `30 19 * * 5` | `0 1 * * 6` | Saturday (6) rewinds to Friday (5) |
| **Monthly (1st)** | 01:00 AM | `30 19 L * *` | `0 1 1 * *` | **1st day < 05:30 AM $\rightarrow$ Last day ("L") UTC** |
| **Monthly (1st)** | 12:00 AM | `30 18 L * *` | `0 0 1 * *` | **Midnight on 1st $\rightarrow$ Last day ("L") UTC** |
| **Monthly (1st)** | 05:30 AM | `0 0 1 * *` | `30 5 1 * *` | $\ge$ 05:30 AM stays on 1st of month |
| **Monthly (1st)** | 10:00 AM | `30 4 1 * *` | `0 10 1 * *` | $\ge$ 05:30 AM stays on 1st of month |
| **Monthly (15th)** | 01:00 AM | `30 19 14 * *` | `0 1 15 * *` | 15th rewinds to 14th |
| **Custom (Last Day)** | 12:00 AM | `30 18 L * *` | `0 0 L * *` | Explicit "L" preserved |

---

## 4. UI Integration Points

1. **`CreateSegment/index.jsx`**:
   * **On Fetch (Edit / Clone)**:
     ```javascript
     setSchedule(cronFromUtc(segData.cron_expression || ''));
     ```
   * **On Save (API Payload)**:
     ```javascript
     cron_expression: cronToUtc(schedule),
     ```

2. **`ScheduleSelector.jsx`**:
   * Operates completely in browser timezone (IST).
   * Displays local time slots (`getTimeOptions()`) and days (`DAY_OF_MONTH_OPTIONS` including `'L'`).
   * Provides real-time description preview via `describeCronExpression`.
