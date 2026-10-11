const DOW = ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'] as const;
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;

export function heroDateParts(iso: string): { dow: string; day: string; month: string } {
  const parts = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = parts
    ? new Date(`${parts[1]}-${parts[2]}-${parts[3]}T12:00:00-03:00`)
    : new Date(iso);
  return {
    dow: DOW[d.getDay()],
    day: String(d.getDate()).padStart(2, '0'),
    month: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
  };
}

const TZ = 'America/Argentina/Buenos_Aires';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Wall-clock parts from an offset ISO like 2026-11-07T21:00:00-03:00 */
function localParts(iso: string): { y: number; mo: number; d: number; h: number; mi: number } {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) {
    const dt = new Date(iso);
    return { y: dt.getFullYear(), mo: dt.getMonth() + 1, d: dt.getDate(), h: dt.getHours(), mi: dt.getMinutes() };
  }
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]), h: Number(m[4]), mi: Number(m[5]) };
}

function addHours(p: ReturnType<typeof localParts>, hours: number): ReturnType<typeof localParts> {
  const dt = new Date(p.y, p.mo - 1, p.d, p.h + hours, p.mi);
  return { y: dt.getFullYear(), mo: dt.getMonth() + 1, d: dt.getDate(), h: dt.getHours(), mi: dt.getMinutes() };
}

function localStamp(p: ReturnType<typeof localParts>): string {
  return `${p.y}${pad(p.mo)}${pad(p.d)}T${pad(p.h)}${pad(p.mi)}00`;
}

function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function googleCalendarUrl(
  title: string,
  startIso: string,
  location: string,
  details: string,
): string {
  const start = localParts(startIso);
  const end = addHours(start, 5);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${localStamp(start)}/${localStamp(end)}`,
    details,
    location,
    ctz: TZ,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcs(
  title: string,
  startIso: string,
  location: string,
  details: string,
): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mis XV//Invitacion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:xv-${utcStamp(start)}@cjespelet.github.io`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(details)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.join('\r\n')}\r\n`;
}
