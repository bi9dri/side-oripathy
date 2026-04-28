import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { pages } from "./_pages";

// Phase 3 導入時点で既知の違反。スタイリング修正は Phase 4+ の follow-up で別 PR 対応予定。
// - color-contrast: converter のボタン / erosion_check の admonition / code 等
// - link-in-text-block: 本文中リンクが下線なし且つ周囲テキストとのコントラスト不足
// TODO(phase4): 個別 selector 修正後に baselineDisabledRules を空配列に戻し、最終的に削除する。
const baselineDisabledRules = ["color-contrast", "link-in-text-block"];

for (const target of pages) {
	test(`a11y: ${target.name}`, async ({ page }, testInfo) => {
		test.skip(testInfo.project.metadata?.variant === "mobile", "a11y は PC variants のみ実行");
		const response = await page.goto(target.path);
		expect(response?.ok(), `${target.path} returned non-2xx`).toBe(true);
		await expect(page.locator("body")).toBeVisible();
		await page.waitForLoadState("networkidle");
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.disableRules(baselineDisabledRules)
			.analyze();
		expect(results.violations).toEqual([]);
	});
}
