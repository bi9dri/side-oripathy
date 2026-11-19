import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { openPage, pages } from "./_pages";

for (const target of pages) {
	test(`a11y (mobile target-size): ${target.name}`, async ({ page }, testInfo) => {
		test.skip(
			testInfo.project.metadata?.variant !== "mobile",
			"target-size は mobile variants 専用",
		);
		await openPage(page, target.path);
		const results = await new AxeBuilder({ page }).withRules(["target-size"]).analyze();
		expect(results.violations).toEqual([]);
	});
}
