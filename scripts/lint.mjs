import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["src", "scripts", "tests"];
/** @type {string[]} */
const files = [];

/** @param {string} path */
function visit(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const target = join(path, entry.name);
    if (entry.isDirectory()) visit(target);
    else if ([".js", ".mjs"].includes(extname(target))) files.push(target);
  }
}

for (const root of roots) visit(root);
files.push("playwright.config.js");

for (const file of files) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
  const content = readFileSync(file, "utf8");
  const dynamicEvaluation = ["eval" + "(", "new " + "Function("];
  if (dynamicEvaluation.some((token) => content.includes(token))) {
    throw new Error(`${file} contains unsafe dynamic evaluation.`);
  }
}

console.log(`Static lint passed for ${files.length} JavaScript files.`);
