# Architecture and product decisions

## Outcome

Turn one coordinator-owned credential-expiry CSV into one portable renewal
calendar. The app faithfully organizes supplied data; it does not evaluate a
worker or infer whether a credential is valid.

## Architecture

- `src/credential-records.js` parses bounded UTF-8 CSV text, maps documented
  header aliases, normalizes strict dates, sorts records, and classifies
  duplicate, invalid, and overdue rows.
- `src/icalendar.js` generates deterministic RFC 5545-shaped calendar text,
  escapes user-supplied labels, folds long lines, assigns stable local UIDs, and
  adds fixed display alarms.
- `src/app.js` owns file selection, automatic local processing, status updates,
  Blob lifecycle, and download availability.
- `scripts/serve.mjs` serves static files only for local use and E2E proof.

There are no runtime packages, remote APIs, model calls, databases, cookies,
analytics, accounts, or provider credentials.

## Minimum-interaction decision

Shortest successful click/tap path from a loaded page:

1. Select/drop the CSV. This supplies the only required information and
   automatically advances the task.
2. Activate the generated download link. This is essential because the user
   chooses when and where to save a file.

Processing starts automatically because it is local, reversible, and
unsurprising. A Run/Make button would repeat the file selection intent. Results
render immediately on the same surface, so Continue, confirmation, navigation,
and View Results actions were removed. No extra input is intrinsic: column
aliases, reminder offsets, output name, appearance, and ordering have safe
defaults.

## Date and reminder decisions

- ISO `YYYY-MM-DD` and written English month dates are accepted.
- Slash dates are rejected because their locale is ambiguous.
- Reminder offsets are fixed at 90, 60, 30, and 7 days to preserve the
  no-settings workflow and match the qualified pain evidence.
- Overdue means only that the supplied date precedes today; it is a date
  classification, not an employment, validity, eligibility, or legal
  conclusion.

## Boundaries

The tool does not verify source truth, renew a credential, message a worker,
connect to a calendar, determine compliance, interpret law, or make hiring,
firing, discipline, or scheduling decisions.
