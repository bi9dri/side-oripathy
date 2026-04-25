import { argosScreenshot } from "@argos-ci/playwright";
import { expect, test } from "@playwright/test";

const pages = [
	{ name: "top", path: "/" },
	{ name: "converter", path: "/converter" },
	{ name: "erosion_check", path: "/docs/erosion_check" },
] as const;

for (const target of pages) {
	test(`VRT: ${target.name}`, async ({ page }) => {
		await page.goto(target.path);
		await expect(page.locator("body")).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		await argosScreenshot(page, target.name);
	});
}
