# Credential Calendar Maker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn one local credential-expiry CSV into one portable renewal calendar without accounts, settings, or employment decisions.

**Architecture:** A static single-screen browser app delegates deterministic work to two side-effect-free JavaScript modules: one parses and classifies CSV rows, and one creates RFC 5545-shaped calendar text. The UI owns only file selection, state transitions, and a browser download. A tiny Node server supports local and Playwright validation.

**Tech Stack:** Semantic HTML, mobile-first CSS, browser JavaScript modules, Node.js test runner, TypeScript checkJs, ESLint, Prettier, and Playwright E2E.

---

### Task 1: Establish the repository and quality contracts

**Files:**

- Create: `package.json`
- Create: `.gitignore`
- Create: `scripts/serve.mjs`
- Create: `eslint.config.js`
- Create: `tsconfig.json`
- Create: `playwright.config.js`

- [ ] Add deterministic scripts for local serving, unit tests, E2E, formatting, linting, types, dependency audit, secret scan, license audit, and full validation.
- [ ] Keep runtime dependency-free and pin the small development toolchain through `package-lock.json`.
- [ ] Verify `npm install` and `npm run serve` expose only the intended single screen.

### Task 2: Specify and implement credential parsing

**Files:**

- Create: `tests/credential-records.test.js`
- Create: `src/credential-records.js`

- [ ] First write tests for quoted CSV fields, documented aliases, strict dates, missing values, duplicates, overdue rows, and friendly file-level errors.
- [ ] Run `node --test tests/credential-records.test.js` and confirm the missing module or implementation causes the failure.
- [ ] Implement bounded local CSV parsing with source-row provenance.
- [ ] Accept ISO dates and unambiguous English month-name dates; reject slash dates rather than guessing locale.
- [ ] Preserve records without scoring, judging, or inferring employment eligibility.
- [ ] Re-run the focused test until it passes.

### Task 3: Specify and implement calendar generation

**Files:**

- Create: `tests/icalendar.test.js`
- Create: `src/icalendar.js`

- [ ] First write tests for deterministic ordering, stable UIDs, escaping, all-day events, four fixed alarms, line folding, and duplicate-free events.
- [ ] Run `node --test tests/icalendar.test.js` and confirm the missing module or implementation causes the failure.
- [ ] Implement deterministic calendar text with CRLF line endings and a browser-safe filename.
- [ ] Represent supplied dates and labels without legal or compliance conclusions.
- [ ] Re-run the focused test until it passes.

### Task 4: Build the minimum-interaction workflow

**Files:**

- Create: `index.html`
- Create: `src/app.js`
- Create: `src/styles.css`

- [ ] Add one large drag-and-drop/file-picker surface.
- [ ] Start the safe local transformation automatically when the file is selected or dropped; do not add a redundant Run, Continue, or confirmation action.
- [ ] Show concise working, success, and recovery states without navigation, settings, selects, credentials, or secondary input.
- [ ] Keep the generated `.ics` download on the same centered surface.
- [ ] Add automatic high-contrast light and dark appearance with phone-first layout and restrained motion.

### Task 5: Complete automated behavior coverage

**Files:**

- Create: `tests/e2e/app.spec.js`
- Create: `tests/fixtures/credential-expiries.csv`

- [ ] Test page identity, the two-action interaction budget, a successful real upload-to-download flow, and invalid-file recovery.
- [ ] Assert selecting or dropping the input automatically initiates processing and the result renders without a separate action.
- [ ] Assert no login, credential, setting, select, or forbidden secondary surface exists.
- [ ] Capture phone, tablet, and desktop proof in light and dark modes outside committed source.

### Task 6: Document the product and evidence boundaries

**Files:**

- Create: `README.md`
- Create: `LICENSE`
- Create: `SECURITY.md`
- Create: `CONTRIBUTING.md`
- Create: `CHANGELOG.md`
- Create: `docs/product/architecture-and-decisions.md`
- Create: `docs/product/monetization-hypothesis.md`
- Create: `docs/credential-calendar-maker/2026-07-27-completion.md`
- Create: `docs/handoffs/2026-07-27-codex-credential-calendar-maker.handoff.mdc`

- [ ] Document the exact CSV contract, local-data boundary, limitations, install/run/test commands, architecture, security reporting, and contribution workflow.
- [ ] Separate local proof from hosted, production, provider, payment, and demand proof.
- [ ] State that the app organizes supplied dates and does not determine compliance, eligibility, hiring, firing, or employment status.

### Task 7: Validate, commit, publish, and close state

**Files:**

- Create: `proof/validation-receipt.json`
- Update: `docs/credential-calendar-maker/2026-07-27-completion.md`
- Update: `docs/handoffs/2026-07-27-codex-credential-calendar-maker.handoff.mdc`

- [ ] Run `npm ci`, `npm run validate`, and the real browser workflow.
- [ ] Inspect every responsive light/dark screenshot and record console/accessibility results.
- [ ] Record environment, fixtures, data integrity, localhost integrity, warnings, and the exact validation commands.
- [ ] Commit the clean `main` worktree and capture the local SHA and committed paths.
- [ ] Publish only through the scoped GitHub helper, verify public `main` equals local HEAD, and record the receipt.
- [ ] Write the immutable completed-app registry record, empty the durable queue, call `complete-app`, and refresh handoffs.
