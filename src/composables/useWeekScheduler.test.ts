import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWeekScheduler } from "./useWeekScheduler";
import { formatDateKey } from "../lib/dates";

describe("useWeekScheduler", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "id-1") });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("initializes with 7 days and zero total shifts", () => {
    const scheduler = useWeekScheduler();

    expect(scheduler.weekDays.value).toHaveLength(7);
    expect(scheduler.totalWeekShifts.value).toBe(0);
  });

  it("adds shifts and sorts by start time", () => {
    const scheduler = useWeekScheduler();
    const dateKey = formatDateKey(scheduler.weekDays.value[0]);

    scheduler.addShift(dateKey, { startMinutes: 600, endMinutes: 660 });
    scheduler.addShift(dateKey, { startMinutes: 540, endMinutes: 600 });

    const shifts = scheduler.getShiftsForDay(dateKey);
    expect(shifts).toHaveLength(2);
    expect(shifts[0].startMinutes).toBe(540);
    expect(shifts[1].startMinutes).toBe(600);
  });

  it("rejects invalid times and overlapping shifts", () => {
    const scheduler = useWeekScheduler();
    const dateKey = formatDateKey(scheduler.weekDays.value[0]);

    const invalid = scheduler.addShift(dateKey, {
      startMinutes: 600,
      endMinutes: 600,
    });
    expect(invalid.ok).toBe(false);

    const first = scheduler.addShift(dateKey, {
      startMinutes: 540,
      endMinutes: 600,
    });
    expect(first.ok).toBe(true);

    const overlap = scheduler.addShift(dateKey, {
      startMinutes: 570,
      endMinutes: 630,
    });
    expect(overlap.ok).toBe(false);
  });

  it("tracks total shifts across the current week", () => {
    const scheduler = useWeekScheduler();
    const day1 = formatDateKey(scheduler.weekDays.value[0]);
    const day2 = formatDateKey(scheduler.weekDays.value[3]);

    scheduler.addShift(day1, { startMinutes: 540, endMinutes: 600 });
    scheduler.addShift(day2, { startMinutes: 600, endMinutes: 660 });

    expect(scheduler.totalWeekShifts.value).toBe(2);
  });

  it("updates an existing shift by id", () => {
    const scheduler = useWeekScheduler();
    const dateKey = formatDateKey(scheduler.weekDays.value[0]);

    scheduler.addShift(dateKey, {
      startMinutes: 540,
      endMinutes: 600,
      title: "Old",
    });
    const shiftId = scheduler.getShiftsForDay(dateKey)[0].id;

    const result = scheduler.updateShift(dateKey, shiftId, {
      startMinutes: 600,
      endMinutes: 660,
      title: "Updated",
      priority: "important",
    });

    expect(result.ok).toBe(true);
    const updated = scheduler.getShiftsForDay(dateKey)[0];
    expect(updated.title).toBe("Updated");
    expect(updated.priority).toBe("important");
  });

  it("removes a shift by id", () => {
    const scheduler = useWeekScheduler();
    const dateKey = formatDateKey(scheduler.weekDays.value[0]);

    scheduler.addShift(dateKey, { startMinutes: 540, endMinutes: 600 });
    const shiftId = scheduler.getShiftsForDay(dateKey)[0].id;

    scheduler.removeShift(dateKey, shiftId);
    expect(scheduler.getShiftsForDay(dateKey)).toHaveLength(0);
  });
  it("navigates between weeks and back to today", () => {
    const scheduler = useWeekScheduler();
    const initialRange = scheduler.weekRangeLabel.value;

    scheduler.navigateNext();
    expect(scheduler.weekRangeLabel.value).not.toBe(initialRange);

    scheduler.navigatePrev();
    expect(scheduler.weekRangeLabel.value).toBe(initialRange);

    scheduler.navigateNext();
    scheduler.goToToday();
    expect(scheduler.weekRangeLabel.value).toBe(initialRange);
  });
});
