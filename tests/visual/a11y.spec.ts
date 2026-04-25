import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
	{ name: "top", path: "/" },
	{ name: "converter", path: "/converter" },
	{ name: "erosion_check", path: "/docs/erosion_check" },
] as const;

// Phase 3 導入時点で既知の違反。スタイリング修正は別 PR で対応する。
// - color-contrast: converter のボタン / erosion_check の admonition / code 等
// - link-in-text-block: 本文中リンクが下線なし且つ周囲テキストとのコントラスト不足
const baselineDisabledRules = ["color-contrast", "link-in-text-block"];

for (const target of pages) {
	test(`a11y: ${target.name}`, async ({ page }, testInfo) => {
		test.skip(testInfo.project.name.includes("mobile"), "a11y は PC variants のみ実行");
		await page.goto(target.path);
		await expect(page.locator("body")).toBeVisible();
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa"])
			.disableRules(baselineDisabledRules)
			.analyze();
		expect(results.violations).toEqual([]);
	});
}
