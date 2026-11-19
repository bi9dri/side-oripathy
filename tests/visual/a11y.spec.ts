import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { openPage, pages } from "./_pages";

const baselineDisabledRules = ["color-contrast", "link-in-text-block"];

for (const target of pages) {
	test(`a11y: ${target.name}`, async ({ page }, testInfo) => {
		test.skip(testInfo.project.metadata?.variant === "mobile", "a11y は PC variants のみ実行");
		await openPage(page, target.path);
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.disableRules(baselineDisabledRules)
			.analyze();
		expect(results.violations).toEqual([]);
	});
}
