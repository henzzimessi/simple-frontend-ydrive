export type Priority = "normal" | "important" | "urgent";

export interface Shift {
  id: string;
  startMinutes: number; // minutes from midnight, e.g. 540 = 9:00 AM
  endMinutes: number; // minutes from midnight, e.g. 1020 = 5:00 PM
  title?: string;
  priority?: Priority;
}

// key: ISO date string 'yyyy-MM-dd'
export type WeekSchedule = Record<string, Shift[]>;

export interface NewShiftPayload {
  startMinutes: number;
  endMinutes: number;
  title?: string;
  priority?: Priority;
}

export interface AddShiftResult {
  ok: boolean;
  error?: string;
}
