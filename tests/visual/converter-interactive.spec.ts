import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { openPage } from "./_pages";

const samplePalette = `2DM<=6 〈観察〉
3DM<=7 〈＊運動〉`;

test.describe("converter interactive (filled state)", () => {
	test("VRT: converter_filled", async ({ page }) => {
		await openPage(page, "/converter");

		await page.locator("#input").fill(samplePalette);
		await page.getByRole("button", { name: "コンバート" }).click();

		await expect(page.locator("#output")).not.toHaveValue("");

		await expect(page).toHaveScreenshot("converter-filled.png", { fullPage: true });
	});

	test("a11y: converter_filled", async ({ page }, testInfo) => {
		test.skip(testInfo.project.metadata?.variant === "mobile", "a11y は PC variants のみ実行");

		await openPage(page, "/converter");
		await page.locator("#input").fill(samplePalette);
		await page.getByRole("button", { name: "コンバート" }).click();
		await expect(page.locator("#output")).not.toHaveValue("");

		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
