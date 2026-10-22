import { expect, test } from "@playwright/test";

import { openPage, pages } from "./_pages";

for (const target of pages) {
	test(`VRT: ${target.name}`, async ({ page }) => {
		await openPage(page, target.path);
		await expect(page).toHaveScreenshot(`${target.name}.png`, { fullPage: true });
	});
}
