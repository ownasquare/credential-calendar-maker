import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const excluded = new Set([
  ".git",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mdc",
  ".mjs",
]);
const sensitiveAssignment =
  /(api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][^"']{8,}["']/i;
/** @type {string[]} */
const findings = [];

/** @param {string} path */
function visit(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const target = join(path, entry.name);
    if (entry.isDirectory()) {
      visit(target);
    } else if (
      textExtensions.has(extname(target)) ||
      entry.name === "LICENSE"
    ) {
      const lines = readFileSync(target, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        if (sensitiveAssignment.test(line))
          findings.push(`${target}:${index + 1}`);
      });
    }
  }
}

visit(".");
if (findings.length > 0)
  throw new Error(`Potential secrets found at ${findings.join(", ")}`);
console.log("Secret scan passed.");
