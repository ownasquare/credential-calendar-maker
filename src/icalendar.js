/**
 * @param {string} value
 */
function escapeIcs(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * @param {string} value
 */
function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * @param {string} line
 */
function foldLine(line) {
  const chunks = [];
  let remaining = line;
  while (remaining.length > 73) {
    chunks.push(remaining.slice(0, 73));
    remaining = ` ${remaining.slice(73)}`;
  }
  chunks.push(remaining);
  return chunks.join("\r\n");
}

/**
 * @param {string} isoDate
 */
function compactDate(isoDate) {
  return isoDate.replaceAll("-", "");
}

/**
 * @param {Array<{employeeName: string, credentialName: string, expiresOn: string, employeeId?: string, sourceRow?: number}>} records
 */
export function buildCredentialCalendar(records) {
  const sorted = [...records].sort(
    (a, b) =>
      a.expiresOn.localeCompare(b.expiresOn) ||
      a.employeeName.localeCompare(b.employeeName) ||
      a.credentialName.localeCompare(b.credentialName),
  );
  const unique = new Map();
  for (const record of sorted) {
    const key = [
      (record.employeeId || record.employeeName).toLowerCase(),
      record.credentialName.toLowerCase(),
      record.expiresOn,
    ].join("|");
    if (!unique.has(key)) unique.set(key, record);
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Credential Calendar Maker//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Credential renewals",
  ];

  for (const [key, record] of unique) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${stableHash(key)}@credential-calendar-maker`,
      `DTSTART;VALUE=DATE:${compactDate(record.expiresOn)}`,
      `SUMMARY:${escapeIcs(`${record.credentialName} renewal — ${record.employeeName}`)}`,
      `DESCRIPTION:${escapeIcs(`Supplied expiration date. Source CSV row ${record.sourceRow ?? "unknown"}.`)}`,
    );
    for (const days of [90, 60, 30, 7]) {
      lines.push(
        "BEGIN:VALARM",
        `TRIGGER:-P${days}D`,
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcs(`${record.credentialName} renewal reminder`)}`,
        "END:VALARM",
      );
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export const calendarFilename = "credential-renewals.ics";
