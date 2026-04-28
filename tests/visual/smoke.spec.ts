import { argosScreenshot } from "@argos-ci/playwright";
import { expect, test } from "@playwright/test";

import { pages } from "./_pages";

test.beforeAll(() => {
	if (!process.env.ARGOS_TOKEN) {
		// CI では Argos 連携を必須にする (token rotation / typo を緑で見逃さないため)。
		// ローカルは capture-only モードを許容するが、操作者が認識できるよう warn を出す。
		if (process.env.CI) {
			throw new Error("ARGOS_TOKEN is required in CI: VRT cannot perform diffing without it.");
		}
		console.warn("[VRT] ARGOS_TOKEN absent — running in capture-only mode (no diffing).");
	}
});

for (const target of pages) {
	test(`VRT: ${target.name}`, async ({ page }) => {
		const response = await page.goto(target.path);
		expect(response?.ok(), `${target.path} returned non-2xx`).toBe(true);
		await expect(page.locator("body")).toBeVisible();
		await page.waitForLoadState("networkidle");
		await page.evaluate(async () => {
			await document.fonts.ready;
		});
		await argosScreenshot(page, target.name);
	});
}
