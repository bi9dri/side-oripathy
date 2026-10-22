import { expect, test } from "@playwright/test";

import { pages } from "./_pages";

for (const target of pages) {
	test(`VRT: ${target.name}`, async ({ page }) => {
		const response = await page.goto(target.path);
		expect(response?.ok(), `${target.path} returned non-2xx`).toBe(true);
		await expect(page.locator("body")).toBeVisible();
		await page.waitForLoadState("networkidle");
		await page.evaluate(async () => {
			await document.fonts.ready;
		});
		await expect(page).toHaveScreenshot(`${target.name}.png`, { fullPage: true });
	});
}
