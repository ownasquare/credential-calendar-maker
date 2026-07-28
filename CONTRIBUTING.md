# Contributing

Contributions should preserve the narrow local-first outcome and the
minimum-interaction path.

1. Create a branch from `main`.
2. Install with `npm ci`.
3. Add focused tests before changing parsing or calendar behavior.
4. Run `npm run validate`.
5. Open a pull request describing the user-visible change and synthetic test
   data.

Do not add accounts, analytics, remote uploads, live provider integrations,
employee scoring, monitoring, legal conclusions, or automated employment
decisions. New interactions require an outcome-level justification in the
product decision document.
