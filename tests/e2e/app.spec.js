import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fixture = fileURLToPath(
  new URL("../fixtures/credential-expiries.csv", import.meta.url),
);

test("minimum-interaction CSV flow creates a downloadable calendar", async ({
  page,
}) => {
  /** @type {string[]} */
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const started = Date.now();
  await page.goto("/");
  await expect(page).toHaveTitle("Credential Calendar Maker");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "renewal dates",
  );
  await expect(page.locator('input[type="file"]')).toHaveCount(1);
  await expect(page.locator("select")).toHaveCount(0);
  await expect(page.locator("button")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Drop your CSV/ })).toHaveCount(
    1,
  );
  await page.locator('input[type="file"]').setInputFiles(fixture);
  await expect(page.getByText("Your renewal calendar is ready.")).toBeVisible();
  await expect(page.getByText(/2 included/)).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: /Download credential-renewals/ })
    .click();
  const downloaded = await downloadPromise;
  expect(downloaded.suggestedFilename()).toBe("credential-renewals.ics");
  expect(Date.now() - started).toBeLessThan(10_000);
  expect(errors).toEqual([]);
});

test("invalid CSV gives one friendly recovery sentence", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "wrong.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("name,date\nAlex,2027-01-01"),
  });
  await expect(page.getByRole("status")).toContainText(
    "Use columns for employee name, credential name, and expiration date, then try again.",
  );
});

test("contains no forbidden setup or employment-decision controls", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText(/login|sign up|api key|hire|fire/i)).toHaveCount(
    0,
  );
  await expect(page.locator("nav, select, textarea, button")).toHaveCount(0);
});

test("upload surface is keyboard reachable with a visible focus state", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator("#csv-file")).toBeFocused();
  const focus = await page.locator("#drop-zone").evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(focus.outlineStyle).not.toBe("none");
  expect(focus.outlineWidth).not.toBe("0px");
  await expect(page.getByRole("status")).toHaveAttribute("aria-live", "polite");
});

test("responsive light and dark states remain readable without overflow", async ({
  page,
}) => {
  const proofDirectory =
    process.env.PROOF_DIR ||
    join(process.cwd(), "test-results", "visual-proof");
  mkdirSync(proofDirectory, { recursive: true });
  const viewports = [
    { name: "phone", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 1000 },
  ];
  /** @type {Array<"light" | "dark">} */
  const colorSchemes = ["light", "dark"];
  for (const colorScheme of colorSchemes) {
    await page.emulateMedia({ colorScheme });
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Drop your CSV/ }),
      ).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
      await page.screenshot({
        path: join(proofDirectory, `${viewport.name}-${colorScheme}.png`),
        fullPage: true,
      });
    }
  }
});
