/** Format an ISO timestamp for display. Pass a time zone when the source is a forecast. */
export function formatDateTime(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(date);
}

export function formatHour(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    timeZone,
  }).format(date);
}

/** Calendar dates from Open-Meteo (`YYYY-MM-DD`) are formatted at noon UTC so the day does not shift. */
export function formatDay(date: string): string {
  const parsed = Date.parse(`${date.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(parsed)) {
    return date;
  }
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(parsed));
}
