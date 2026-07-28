# Credential Calendar Maker completion record

Date: 2026-07-27
Claim: `20260727T171118-0700-lane12-credential-calendar-maker`
Lane: 12 — People and workforce operations

## Delivered outcome

A local-first browser tool converts one credential-expiry CSV into one
downloadable renewal calendar with deterministic 90-, 60-, 30-, and 7-day
display reminders. Selection triggers processing automatically and the result
appears on the same surface.

## Interaction budget

Shortest path: select/drop the CSV, then download the result. Both interactions
are essential: the first supplies source data and the second saves the artifact.
No redundant run, continue, confirmation, navigation, setup, login, settings,
or result-opening action exists.

## Validation evidence

- Environment: macOS 26.3, Node v23.6.0, npm 11.6.0, Playwright
  1.62.0.
- `npm ci`: passed with zero vulnerabilities.
- `npm run validate`: passed.
- Unit tests: 7/7 passed.
- Playwright E2E: 5/5 passed, covering automatic generation, download,
  malformed-input recovery, forbidden controls, keyboard focus, no horizontal
  overflow, and phone/tablet/desktop light/dark rendering.
- Package smoke: `npm pack --dry-run` passed with 29 intended source,
  documentation, and fixture files.
- In-app Browser: correct local URL/title, meaningful DOM, no overlay, empty
  warning/error console, automatic success, and friendly recovery passed.
- Screenshot inspection: six final captures inspected; no clipping, overlap,
  blank state, unreadable text, or overflow found.
- Data integrity: invented fixtures only; no real employee data.
- Warning triage: all dependency, rendered-state, assertion, and color-control
  warnings fixed at the cause; none suppressed.
- Receipt: `proof/validation-receipt.json`.

## Commit evidence

- App path:
  `/Users/fortunevieyra/Documents/Github/ai-projects/factory-apps/lane-12/credential-calendar-maker`
- Branch: `main`
- Validated source commit:
  `db247623054ecd8a414a32f98b5ed7851fbd7613`
- Source commit paths: 31 repository files covering application source, tests,
  scripts, open-source documentation, product decisions, completion/handoff
  records, fixtures, lockfile, and validation receipt.
- Validation commands: `npm ci`, `npm run validate`,
  `npm pack --dry-run`, `git diff --cached --check`.
- The staged diff check found two Markdown hard-break spaces in this document;
  the evidence-only follow-up removes them and is rechecked before publication.
- The exact final publication SHA is recorded by the scoped publisher,
  immutable completed-app registry record, and Lane 12 closeout. A file cannot
  contain the SHA of the commit that contains its own final-SHA update.

## Push evidence

Pending authorized scoped publication after the clean local commit.

## Proof labels

- Local proof: passed
- GitHub publication proof: pending
- Hosted proof: not run
- Production proof: not run
- Provider proof: not run
- Payment proof: not run
- Demand proof: public pain evidence only; no customer, usage, or revenue proof

## Safety boundary

The app organizes user-supplied dates. It does not verify credentials, determine
compliance, interpret employment law, score or monitor employees, or recommend
employment actions.
