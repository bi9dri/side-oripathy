import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { openPage, pages } from "./_pages";

// mobile variants 専用の a11y チェック。タッチターゲット最小サイズ判定 (WCAG 2.5.8 / 2.5.5) は
// 視覚 viewport が mobile のときに意味を持つため、PC 用 a11y.spec.ts とは分離している。
for (const target of pages) {
	test(`a11y (mobile target-size): ${target.name}`, async ({ page }, testInfo) => {
		test.skip(
			testInfo.project.metadata?.variant !== "mobile",
			"target-size は mobile variants 専用",
		);
		await openPage(page, target.path);
		const results = await new AxeBuilder({ page })
			// experimental だが axe-core は wcag22aa として `target-size` を提供している。
			.withRules(["target-size"])
			.analyze();
		expect(results.violations).toEqual([]);
	});
}
