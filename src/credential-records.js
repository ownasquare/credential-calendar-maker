const REQUIRED_FIELDS = ["employeeName", "credentialName", "expiresOn"];

const HEADER_ALIASES = {
  employeeName: ["employee_name", "employee name", "employee", "worker name"],
  credentialName: [
    "credential_name",
    "credential name",
    "credential",
    "certification",
    "certification name",
  ],
  expiresOn: [
    "expires_on",
    "expires on",
    "expiry date",
    "expiration date",
    "expires",
    "renewal date",
  ],
  employeeId: ["employee_id", "employee id", "worker id"],
  email: ["email", "employee email"],
};

export class CredentialCsvError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "CredentialCsvError";
  }
}

/**
 * @param {string} text
 * @returns {string[][]}
 */
function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted)
    throw new CredentialCsvError(
      "This CSV has an unfinished quoted value. Fix it and try again.",
    );
  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

/**
 * @param {string} value
 * @returns {string | null}
 */
function parseDate(value) {
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const [, year, month, day] = iso;
    const candidate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (
      candidate.getUTCFullYear() === Number(year) &&
      candidate.getUTCMonth() + 1 === Number(month) &&
      candidate.getUTCDate() === Number(day)
    ) {
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  const words =
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i.exec(
      trimmed,
    );
  if (!words) return null;
  const monthIndex = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].indexOf(words[1].toLowerCase());
  const candidate = new Date(
    Date.UTC(Number(words[3]), monthIndex, Number(words[2])),
  );
  if (
    candidate.getUTCFullYear() !== Number(words[3]) ||
    candidate.getUTCMonth() !== monthIndex ||
    candidate.getUTCDate() !== Number(words[2])
  ) {
    return null;
  }
  return candidate.toISOString().slice(0, 10);
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * @param {string} text
 * @param {string} [today]
 */
export function parseCredentialCsv(
  text,
  today = new Date().toISOString().slice(0, 10),
) {
  if (new Blob([text]).size > 5_000_000) {
    throw new CredentialCsvError(
      "This CSV is too large. Choose one under 5 MB and try again.",
    );
  }

  const rows = parseCsvRows(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) {
    throw new CredentialCsvError(
      "This CSV needs a header and at least one credential row.",
    );
  }

  const headers = rows[0].map(normalizeHeader);
  /** @type {Record<string, number>} */
  const indexes = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const index = headers.findIndex((header) => aliases.includes(header));
    if (index >= 0) indexes[field] = index;
  }
  if (REQUIRED_FIELDS.some((field) => indexes[field] === undefined)) {
    throw new CredentialCsvError(
      "Use columns for employee name, credential name, and expiration date, then try again.",
    );
  }

  const records = [];
  const invalid = [];
  const duplicates = [];
  const seen = new Set();

  for (let index = 1; index < rows.length; index += 1) {
    const values = rows[index];
    const sourceRow = index + 1;
    const employeeName = (values[indexes.employeeName] ?? "").trim();
    const credentialName = (values[indexes.credentialName] ?? "").trim();
    const rawDate = (values[indexes.expiresOn] ?? "").trim();
    const expiresOn = parseDate(rawDate);
    if (!employeeName || !credentialName || !expiresOn) {
      invalid.push({ sourceRow, reason: "missing or invalid required value" });
      continue;
    }

    const employeeId =
      indexes.employeeId === undefined
        ? ""
        : (values[indexes.employeeId] ?? "").trim();
    const email =
      indexes.email === undefined ? "" : (values[indexes.email] ?? "").trim();
    const duplicateKey = [
      (employeeId || employeeName).toLowerCase(),
      credentialName.toLowerCase(),
      expiresOn,
    ].join("|");
    if (seen.has(duplicateKey)) {
      duplicates.push({ sourceRow, reason: "duplicate credential date" });
      continue;
    }
    seen.add(duplicateKey);
    records.push({
      sourceRow,
      employeeName,
      credentialName,
      expiresOn,
      employeeId,
      email,
      overdue: expiresOn < today,
    });
  }

  if (records.length === 0) {
    throw new CredentialCsvError(
      "No usable credential dates were found. Fix the CSV and try again.",
    );
  }

  records.sort(
    (a, b) =>
      a.expiresOn.localeCompare(b.expiresOn) ||
      a.employeeName.localeCompare(b.employeeName) ||
      a.credentialName.localeCompare(b.credentialName),
  );
  return {
    records,
    summary: {
      included: records.length,
      overdue: records.filter((record) => record.overdue).length,
      duplicates: duplicates.length,
      invalid: invalid.length,
    },
    duplicates,
    invalid,
  };
}
