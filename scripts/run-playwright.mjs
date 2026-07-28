import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const environment = { ...process.env };
delete environment.FORCE_COLOR;
delete environment.NO_COLOR;

const cli = fileURLToPath(
  new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
);
const result = spawnSync(process.execPath, [cli, "test"], {
  env: environment,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
