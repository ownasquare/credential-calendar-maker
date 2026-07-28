import { readFileSync } from "node:fs";

const license = readFileSync(new URL("../LICENSE", import.meta.url), "utf8");
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
if (!license.includes("MIT License") || packageJson.license !== "MIT") {
  throw new Error("MIT license metadata is incomplete.");
}
console.log("MIT license check passed.");
