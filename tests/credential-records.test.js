import assert from "node:assert/strict";
import test from "node:test";
import {
  CredentialCsvError,
  parseCredentialCsv,
} from "../src/credential-records.js";

test("parses aliases, quotes, unambiguous dates, duplicates, invalid rows, and overdue state", () => {
  const csv = [
    "Employee,Certification,Expiration Date,Employee ID",
    '"Alex Example","Lift, Level 2",2027-02-03,E-1',
    '"Alex Example","Lift, Level 2",2027-02-03,E-1',
    'Jordan Sample,First Aid,"September 4, 2025",E-2',
    "Missing Date,Forklift,,E-3",
  ].join("\n");
  const result = parseCredentialCsv(csv, "2026-07-27");
  assert.equal(result.summary.included, 2);
  assert.equal(result.summary.overdue, 1);
  assert.equal(result.summary.duplicates, 1);
  assert.equal(result.summary.invalid, 1);
  assert.equal(result.records[0].sourceRow, 4);
  assert.equal(result.records[1].credentialName, "Lift, Level 2");
});

test("rejects ambiguous slash dates instead of guessing", () => {
  assert.throws(
    () =>
      parseCredentialCsv(
        "employee_name,credential_name,expires_on\nAlex Example,First Aid,01/02/2027",
      ),
    CredentialCsvError,
  );
});

test("returns a friendly error for missing required headers", () => {
  assert.throws(
    () => parseCredentialCsv("name,thing,date\nAlex,First Aid,2027-01-01"),
    /Use columns for employee name/,
  );
});

test("handles a UTF-8 BOM and escaped quote", () => {
  const result = parseCredentialCsv(
    '\uFEFFemployee_name,credential_name,expires_on\n"Alex ""Ace"" Example",CPR,2028-12-01',
  );
  assert.equal(result.records[0].employeeName, 'Alex "Ace" Example');
});
