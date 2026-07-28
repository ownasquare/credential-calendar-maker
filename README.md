# Credential Calendar Maker

Credential Calendar Maker turns one credential-expiry CSV into one portable
`.ics` calendar. It is for small-team HR, safety, training, and credential
coordinators who already maintain dates in a spreadsheet and need a consistent
renewal view.

The entire transformation runs in the browser. The app does not upload, store,
score, or transmit employee data and does not connect to an HRIS, LMS, email, or
calendar provider.

## Minimum interaction path

1. Select or drop one CSV. Processing starts automatically.
2. Download the calendar that appears.

The download is the only second action because browsers require an explicit
destination-saving action. There is no Run, Continue, confirmation, navigation,
or View Results interaction.

## CSV contract

Required columns:

```csv
employee_name,credential_name,expires_on
Alex Example,First Aid,2027-02-03
```

Documented aliases include `employee`, `worker name`, `credential`,
`certification`, `expiration date`, `expiry date`, and `renewal date`. Optional
`employee_id` and `email` columns are preserved only for local record identity;
email is not placed in the generated calendar.

Dates may use `YYYY-MM-DD` or an unambiguous English month name such as
`September 4, 2027`. Slash dates are rejected rather than guessed. The parser
keeps the first duplicate employee/credential/date combination and reports
invalid, duplicate, included, and already-overdue row counts.

Each accepted row becomes an all-day event with display alarms 90, 60, 30, and
7 days before the supplied expiration date.

## Run locally

Requirements: Node.js 20 or newer.

```sh
npm install
npm run serve
```

Open `http://127.0.0.1:4173`.

## Validate

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run deps:audit
npm run secrets:scan
npm run license:check
```

`npm run validate` runs the complete local gate.

## Boundaries

Credential Calendar Maker organizes dates supplied by the user. It does not
verify credentials, determine compliance, interpret employment law, assess
eligibility, monitor employees, or recommend hiring, firing, scheduling, or
discipline decisions. Coordinators remain responsible for source accuracy and
their organization’s renewal requirements.

Local test proof and public source publication are not hosted application,
production, provider, payment, customer, demand, usage, or revenue proof.

## License

[MIT](LICENSE)
