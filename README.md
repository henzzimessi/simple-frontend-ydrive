# Weekly Scheduler

A frontend-only weekly scheduling interface built with Vue 3, TypeScript, Vite, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build
npx vitest run    # run unit tests
```

## Features

- 7-day week view (Monday–Sunday)
- Navigate between weeks with previous/next controls
- Jump to the current week with a Today button
- Total schedules count shown for the selected week
- Today's column is visually highlighted
- Day headers reflect highest priority of scheduled shifts
- Add schedules via a modal per day
- Edit schedules via double-click and modal form
- Delete schedules with confirmation
- Optional title (max 50 chars) and priority (normal/important/urgent)
- Shifts render immediately and are always displayed in chronological order
- Validates end time is after start time (submit button disabled otherwise)
- Prevents overlapping shifts within the same day with an inline error message
- Responsive layout: stacked on mobile, 7-column grid on large screens
- No backend, no persistence — local state only (resets on refresh)

## Architecture

### State: `src/composables/useWeekScheduler.ts`

All reactive state and actions live in a single composable. This is the idiomatic Vue 3 pattern — it keeps logic independently testable and cleanly separated from the UI layer.

- `weekStart` — a `Ref<Date>` tracking the current week's Monday
- `schedule` — a `Ref<WeekSchedule>` (map of ISO date key → sorted `Shift[]`)
- `addShift` — validates, checks overlaps, inserts, and returns `{ ok, error }`
- `updateShift` — validates, checks overlaps (excluding itself), updates by id
- `removeShift` — removes a shift by id
- Sort invariant is maintained **on write** — reads are always O(1)

### Pure Utilities

- `src/lib/shifts.ts` — `hasOverlap`, `sortShifts`, `minutesToDisplay`, `minutesToTimeInput`, `parseTimeInput`
  No Vue imports. Fully unit-tested with 26 cases covering overlap boundary rules, sort correctness, and time formatting.
- `src/lib/dates.ts` — `getWeekStart`, `getWeekDays`, `formatWeekRange`, `formatDateKey`, `isToday`
  Thin wrappers around `date-fns` with consistent, predictable output.

### Component Tree

```
App.vue
  WeekHeader.vue        week range label + prev/next navigation
  WeekGrid.vue          7-column responsive grid
    DayColumn.vue       day header, shift list, empty state
      ShiftCard.vue     shift display card (double-click to edit)
      AddShiftForm.vue  form for add/edit (used in modals)
```

### Data Model

```typescript
interface Shift {
  id: string           // crypto.randomUUID()
  startMinutes: number // minutes from midnight, e.g. 540 = 9:00 AM
  endMinutes: number
  title?: string        // optional label
  priority?: 'normal' | 'important' | 'urgent'
}

type WeekSchedule = Record<string, Shift[]> // key: 'yyyy-MM-dd'
```

Storing time as **minutes from midnight** keeps sorting and overlap math as simple integer arithmetic, and avoids string parsing at runtime.

## Key Design Decisions

**Why a composable instead of Pinia?**
The application has one logical concern — a week schedule. A composable is the correct scope — no global store dependency for something that doesn't need to be shared across unrelated parts of a large app.

**Why minutes from midnight?**
Overlap detection and sorting reduce to integer comparisons. No string parsing, no timezone concerns, and the display format is a single pure function call.

**Why are adjacent shifts allowed?**
A shift ending at 10:00 AM and a new shift starting at 10:00 AM share a boundary but don't overlap. The overlap check uses strict inequalities: `start < existingEnd && end > existingStart`. This is correct interval math for a scheduling tool.

**Why sort on write, not on read?**
`addShift` sorts the array before storing. `getShiftsForDay` is a plain array read (O(1)). Shifts are added infrequently and read on every render, so maintaining the sort invariant on write is the right trade-off.

**Why `{ ok, error }` return from `addShift`?**
Returning a result object keeps `AddShiftForm` simple — no try/catch, no coupling to exception types. The composable owns the error strings; the form just displays them.

**Why `todayDateKey` instead of `isCurrentWeek: boolean`?**
A week-level boolean can't identify which specific column is today. Each `DayColumn` receives its own `dateKey` and compares: `:is-today="formatDateKey(day) === todayDateKey"`. This is precise and requires no additional computed state.

## Assumptions

- **Same-day shifts only.** Overnight shifts (e.g. 10:00 PM – 2:00 AM) are implicitly rejected because `endMinutes > startMinutes` fails.
- **Adjacent shifts are valid** (see overlap rule above).
- **Times are local browser time.** No timezone conversions applied.
- **No persistence.** State resets on page refresh, per the assessment spec.

## Out of Scope (per spec)

- No drag-and-drop
- No backend or persistence
- No overnight / cross-day shifts
