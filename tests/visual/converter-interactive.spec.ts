import AxeBuilder from "@axe-core/playwright";
import { argosScreenshot } from "@argos-ci/playwright";
import { expect, test } from "@playwright/test";

// chat palette サンプル: converter.test.ts のフィクスチャと同形式の最小構成。
// 検証目的なのでエモクロアの実シート全体ではなく、変換が走る最低限の入力を用いる。
const samplePalette = `2DM<=6 〈観察〉
3DM<=7 〈＊運動〉`;

// Phase 3 で a11y.spec.ts と揃えた baseline 抑止ルール。Phase 4+ で個別修正予定。
const baselineDisabledRules = ["color-contrast", "link-in-text-block"];

test.describe("converter interactive (filled state)", () => {
	test("VRT: converter_filled", async ({ page }) => {
		const response = await page.goto("/converter");
		expect(response?.ok(), "/converter returned non-2xx").toBe(true);
		await expect(page.locator("body")).toBeVisible();

		await page.locator("#input").fill(samplePalette);
		await page.getByRole("button", { name: "コンバート" }).click();

		// 出力 textarea に変換結果が反映されるまで待つ。
		await expect(page.locator("#output")).not.toHaveValue("");

		await page.evaluate(async () => {
			await document.fonts.ready;
		});
		await argosScreenshot(page, "converter_filled");
	});

	test("a11y: converter_filled", async ({ page }, testInfo) => {
		test.skip(testInfo.project.name.includes("mobile"), "a11y は PC variants のみ実行");

		const response = await page.goto("/converter");
		expect(response?.ok(), "/converter returned non-2xx").toBe(true);
		await page.locator("#input").fill(samplePalette);
		await page.getByRole("button", { name: "コンバート" }).click();
		await expect(page.locator("#output")).not.toHaveValue("");

		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.disableRules(baselineDisabledRules)
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
