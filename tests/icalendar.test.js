import assert from "node:assert/strict";
import test from "node:test";
import { buildCredentialCalendar, calendarFilename } from "../src/icalendar.js";

const records = [
  {
    sourceRow: 3,
    employeeName: "Jordan; Sample",
    credentialName: "First Aid, Advanced",
    expiresOn: "2027-09-04",
    employeeId: "E-2",
  },
  {
    sourceRow: 2,
    employeeName: "Alex Example",
    credentialName: "Lift\\Level\nTwo",
    expiresOn: "2027-02-03",
    employeeId: "E-1",
  },
];

test("builds deterministic all-day events with four alarms apiece", () => {
  const first = buildCredentialCalendar(records);
  const second = buildCredentialCalendar([...records].reverse());
  assert.equal(first, second);
  assert.match(first, /BEGIN:VCALENDAR\r\nVERSION:2.0/);
  assert.match(first, /DTSTART;VALUE=DATE:20270203/);
  assert.equal((first.match(/BEGIN:VEVENT/g) ?? []).length, 2);
  assert.equal((first.match(/BEGIN:VALARM/g) ?? []).length, 8);
  for (const days of [90, 60, 30, 7])
    assert.match(first, new RegExp(`TRIGGER:-P${days}D`));
});

test("escapes text, folds long lines, and removes duplicate events", () => {
  const long = {
    ...records[0],
    employeeName: `${records[0].employeeName} with an intentionally very long display name`,
  };
  const calendar = buildCredentialCalendar([long, long]);
  assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 1);
  assert.match(calendar, /First Aid\\, Advanced renewal/);
  assert.match(calendar, /Jordan\\; Sample/);
  assert.ok(calendar.split("\r\n").every((line) => line.length <= 74));
});

test("uses a portable calendar filename", () => {
  assert.equal(calendarFilename, "credential-renewals.ics");
});
