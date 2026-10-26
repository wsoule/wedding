// A one-event iCalendar (.ics) file, the format every calendar app imports:
// tapping it on an iPhone opens "Add to Calendar", Android hands it to the
// calendar app, and Outlook or Apple Calendar import it on a computer.

type CalendarEvent = {
  uid: string;
  start: string;
  end: string;
  title: string;
  location: string;
  description: string;
  url: string;
  now?: Date;
};

const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// Lines may be at most 75 bytes; longer ones continue on the next line after
// a single space.
function fold(line: string): string {
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (Buffer.byteLength(current + ch) > limit) {
      out.push(current);
      current = "";
    }
    current += ch;
  }
  out.push(current);
  return out.join("\r\n ");
}

export function buildIcs(e: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jaden & Wyat//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${utc(e.now ?? new Date())}`,
    `DTSTART:${utc(new Date(e.start))}`,
    `DTEND:${utc(new Date(e.end))}`,
    `SUMMARY:${escape(e.title)}`,
    `LOCATION:${escape(e.location)}`,
    `DESCRIPTION:${escape(e.description)}`,
    `URL:${e.url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(`Tomorrow: ${e.title}`)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
