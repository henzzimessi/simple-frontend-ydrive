import { describe, it, expect } from "vitest";
import {
  hasOverlap,
  sortShifts,
  minutesToDisplay,
  parseTimeInput,
  minutesToTimeInput,
} from "./shifts";
import type { Shift } from "../types";

function shift(id: string, start: number, end: number): Shift {
  return {
    id,
    startMinutes: start,
    endMinutes: end,
    title: undefined,
    priority: "normal",
  };
}

describe("hasOverlap", () => {
  it("returns false for empty existing array", () => {
    expect(hasOverlap([], 540, 600)).toBe(false);
  });

  it("returns false for non-overlapping shifts with a gap", () => {
    const existing = [shift("a", 540, 600)];
    expect(hasOverlap(existing, 660, 720)).toBe(false);
  });

  it("returns false for adjacent shifts (boundary rule)", () => {
    // [540, 600) and new [600, 660) share a boundary — should NOT overlap
    const existing = [shift("a", 540, 600)];
    expect(hasOverlap(existing, 600, 660)).toBe(false);
  });

  it("returns false when new shift ends exactly where existing starts", () => {
    const existing = [shift("a", 600, 660)];
    expect(hasOverlap(existing, 540, 600)).toBe(false);
  });

  it("returns true for partial overlap (new starts inside existing)", () => {
    const existing = [shift("a", 540, 660)];
    expect(hasOverlap(existing, 600, 720)).toBe(true);
  });

  it("returns true when new shift is fully contained within existing", () => {
    const existing = [shift("a", 540, 720)];
    expect(hasOverlap(existing, 600, 660)).toBe(true);
  });

  it("returns true for identical time ranges", () => {
    const existing = [shift("a", 540, 660)];
    expect(hasOverlap(existing, 540, 660)).toBe(true);
  });

  it("returns true when new shift spans entire existing shift", () => {
    const existing = [shift("a", 600, 660)];
    expect(hasOverlap(existing, 540, 720)).toBe(true);
  });

  it("returns true for overlap with one of multiple existing shifts", () => {
    const existing = [shift("a", 480, 540), shift("b", 660, 720)];
    expect(hasOverlap(existing, 600, 700)).toBe(true);
  });
});

describe("sortShifts", () => {
  it("returns shifts already in order unchanged", () => {
    const shifts = [shift("a", 480, 540), shift("b", 600, 660)];
    const sorted = sortShifts(shifts);
    expect(sorted[0].id).toBe("a");
    expect(sorted[1].id).toBe("b");
  });

  it("sorts shifts in reverse order correctly", () => {
    const shifts = [
      shift("a", 720, 780),
      shift("b", 480, 540),
      shift("c", 600, 660),
    ];
    const sorted = sortShifts(shifts);
    expect(sorted.map((s) => s.id)).toEqual(["b", "c", "a"]);
  });

  it("handles a single-item array", () => {
    const shifts = [shift("a", 540, 600)];
    expect(sortShifts(shifts)).toHaveLength(1);
  });

  it("does not mutate the original array", () => {
    const shifts = [shift("a", 720, 780), shift("b", 480, 540)];
    sortShifts(shifts);
    expect(shifts[0].id).toBe("a"); // original order preserved
  });
});

describe("minutesToDisplay", () => {
  it("converts 0 to 12:00 AM", () => {
    expect(minutesToDisplay(0)).toBe("12:00 AM");
  });

  it("converts 540 to 9:00 AM", () => {
    expect(minutesToDisplay(540)).toBe("9:00 AM");
  });

  it("converts 750 to 12:30 PM", () => {
    expect(minutesToDisplay(750)).toBe("12:30 PM");
  });

  it("converts 1020 to 5:00 PM", () => {
    expect(minutesToDisplay(1020)).toBe("5:00 PM");
  });

  it("converts 1439 to 11:59 PM", () => {
    expect(minutesToDisplay(1439)).toBe("11:59 PM");
  });
});

describe("parseTimeInput", () => {
  it('parses "09:30" to 570', () => {
    expect(parseTimeInput("09:30")).toBe(570);
  });

  it('parses "00:00" to 0', () => {
    expect(parseTimeInput("00:00")).toBe(0);
  });

  it('parses "23:59" to 1439', () => {
    expect(parseTimeInput("23:59")).toBe(1439);
  });

  it("returns -1 for empty string", () => {
    expect(parseTimeInput("")).toBe(-1);
  });

  it("returns -1 for malformed string", () => {
    expect(parseTimeInput("invalid")).toBe(-1);
  });
});

describe("minutesToTimeInput", () => {
  it("formats 0 as 00:00", () => {
    expect(minutesToTimeInput(0)).toBe("00:00");
  });

  it("formats 75 as 01:15", () => {
    expect(minutesToTimeInput(75)).toBe("01:15");
  });

  it("clamps above max to 23:59", () => {
    expect(minutesToTimeInput(2000)).toBe("23:59");
  });
});
