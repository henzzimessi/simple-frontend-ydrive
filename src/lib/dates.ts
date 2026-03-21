import {
  startOfWeek,
  addDays,
  format,
  isToday as dateFnsIsToday,
} from 'date-fns'

/** Returns the Monday of the week containing `date`. */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

/** Returns the 7 dates [Mon, Tue, Wed, Thu, Fri, Sat, Sun] for a given week start. */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/** Returns a human-readable week range, e.g. "Mar 18 – Mar 24, 2026". */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
}

/** Returns an ISO date key string 'yyyy-MM-dd' for a given date. */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Returns true if the given date is today. */
export function isToday(date: Date): boolean {
  return dateFnsIsToday(date)
}
