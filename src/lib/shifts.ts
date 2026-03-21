import { format, addMinutes, startOfDay } from "date-fns";
import type { Shift } from "../types";

/**
 * Parses an HTML time input value ("HH:mm") into minutes from midnight.
 * Returns -1 for empty or malformed strings.
 */
export function parseTimeInput(value: string): number {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return -1;
  const [hours, minutes] = value.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return -1;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to a display string like "9:00 AM".
 * Uses a fixed format (not browser locale) for testability and consistency.
 */
export function minutesToDisplay(minutes: number): string {
  return format(addMinutes(startOfDay(new Date()), minutes), "h:mm a");
}

/**
 * Converts minutes from midnight to an HH:mm input value.
 */
export function minutesToTimeInput(minutes: number): string {
  const clamped = Math.max(0, Math.min(1439, minutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Returns true if a new shift [start, end) overlaps any existing shift.
 * Uses strict inequalities — adjacent shifts are allowed:
 *   e.g. [540, 600) and [600, 660) share a boundary but do NOT overlap.
 */
export function hasOverlap(
  existing: Shift[],
  start: number,
  end: number,
): boolean {
  return existing.some((s) => start < s.endMinutes && end > s.startMinutes);
}

/**
 * Returns a new array of shifts sorted by startMinutes ascending.
 * Pure function — does not mutate the input.
 */
export function sortShifts(shifts: Shift[]): Shift[] {
  return [...shifts].sort((a, b) => a.startMinutes - b.startMinutes);
}
