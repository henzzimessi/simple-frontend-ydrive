import { ref, computed } from "vue";
import { addDays, subDays } from "date-fns";
import {
  getWeekStart,
  getWeekDays,
  formatWeekRange,
  formatDateKey,
} from "../lib/dates";
import { hasOverlap, sortShifts } from "../lib/shifts";
import type {
  Shift,
  WeekSchedule,
  NewShiftPayload,
  AddShiftResult,
} from "../types";

export function useWeekScheduler() {
  const schedule = ref<WeekSchedule>({});
  const weekStart = ref<Date>(getWeekStart(new Date()));

  const weekDays = computed<Date[]>(() => getWeekDays(weekStart.value));
  const weekRangeLabel = computed<string>(() =>
    formatWeekRange(weekStart.value),
  );
  const totalWeekShifts = computed<number>(() =>
    weekDays.value.reduce((total, day) => {
      const dateKey = formatDateKey(day);
      return total + (schedule.value[dateKey]?.length ?? 0);
    }, 0),
  );

  /**
   * ISO date key for today. Each DayColumn compares its own dateKey to this
   * to determine whether to show the "today" highlight style.
   */
  const todayDateKey = computed<string>(() => formatDateKey(new Date()));

  function navigatePrev(): void {
    weekStart.value = subDays(weekStart.value, 7);
  }

  function navigateNext(): void {
    weekStart.value = addDays(weekStart.value, 7);
  }

  function goToToday(): void {
    weekStart.value = getWeekStart(new Date());
  }

  /**
   * Returns shifts for a given day, already sorted by startMinutes.
   * Sorting invariant is maintained on write (in addShift), so this is O(1).
   */
  function getShiftsForDay(dateKey: string): Shift[] {
    return schedule.value[dateKey] ?? [];
  }

  /**
   * Attempts to add a new shift to the given day.
   * Returns { ok: true } on success or { ok: false, error } if validation fails.
   * Validates end > start and checks for overlaps with existing shifts.
   */
  function addShift(dateKey: string, payload: NewShiftPayload): AddShiftResult {
    const { startMinutes, endMinutes, title, priority } = payload;

    if (endMinutes <= startMinutes) {
      return { ok: false, error: "End time must be after start time" };
    }

    const existing = getShiftsForDay(dateKey);

    if (hasOverlap(existing, startMinutes, endMinutes)) {
      return { ok: false, error: "This shift overlaps an existing shift" };
    }

    const newShift: Shift = {
      id: crypto.randomUUID(),
      startMinutes,
      endMinutes,
      title: title?.trim() || undefined,
      priority: priority ?? "normal",
    };

    // Maintain sort invariant on write so reads are always O(1)
    schedule.value[dateKey] = sortShifts([...existing, newShift]);

    return { ok: true };
  }

  /**
   * Updates an existing shift in a given day by id.
   * Validates end > start and checks for overlaps excluding the shift itself.
   */
  function updateShift(
    dateKey: string,
    shiftId: string,
    payload: NewShiftPayload,
  ): AddShiftResult {
    const { startMinutes, endMinutes, title, priority } = payload;

    if (endMinutes <= startMinutes) {
      return { ok: false, error: "End time must be after start time" };
    }

    const existing = getShiftsForDay(dateKey);
    const target = existing.find((shift) => shift.id === shiftId);

    if (!target) {
      return { ok: false, error: "Shift not found" };
    }

    const others = existing.filter((shift) => shift.id !== shiftId);

    if (hasOverlap(others, startMinutes, endMinutes)) {
      return { ok: false, error: "This shift overlaps an existing shift" };
    }

    const updated: Shift = {
      ...target,
      startMinutes,
      endMinutes,
      title: title?.trim() || undefined,
      priority: priority ?? "normal",
    };

    schedule.value[dateKey] = sortShifts([...others, updated]);

    return { ok: true };
  }

  /**
   * Removes a shift from a given day by id.
   */
  function removeShift(dateKey: string, shiftId: string): void {
    const existing = getShiftsForDay(dateKey);
    const next = existing.filter((shift) => shift.id !== shiftId);
    if (next.length === 0) {
      const { [dateKey]: _removed, ...rest } = schedule.value;
      schedule.value = rest;
    } else {
      schedule.value[dateKey] = next;
    }
  }

  return {
    weekDays,
    weekRangeLabel,
    totalWeekShifts,
    todayDateKey,
    navigatePrev,
    navigateNext,
    goToToday,
    getShiftsForDay,
    addShift,
    updateShift,
    removeShift,
  };
}
