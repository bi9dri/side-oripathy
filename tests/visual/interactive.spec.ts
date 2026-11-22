import { expect, test } from "@playwright/test";

import { openPage } from "./_pages";

const samplePalette = `2DM<=6 〈観察〉
3DM<=7 〈＊運動〉`;

const sampleCcfolia = JSON.stringify({
	kind: "character",
	data: {
		name: "テスト共鳴者",
		params: [
			{ label: "身体", value: "4" },
			{ label: "器用", value: "3" },
			{ label: "精神", value: "5" },
			{ label: "五感", value: "4" },
			{ label: "知力", value: "4" },
			{ label: "魅力", value: "3" },
			{ label: "社会", value: "3" },
			{ label: "運勢", value: "3" },
		],
		status: [
			{ label: "共鳴", value: "2", max: "9" },
			{ label: "HP", value: "10", max: "10" },
		],
		commands: "3DM<=7 〈＊運動〉\n2DM<=5 〈観察〉",
	},
});

test.describe("converter behavior", () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(
			testInfo.project.name !== "chromium-pc-dark",
			"機能テストは PC ダーク代表環境のみで実行",
		);
	});

	test("converts command palette across all convert types", async ({ page }) => {
		await openPage(page, "/converter");

		await page.locator("#input").fill(samplePalette);
		await page.getByRole("button", { name: "コンバート" }).click();
		await expect(page.locator("#output")).toHaveValue(/〈源石侵食判定〉/);
		await expect(page.locator("#output")).toHaveValue(
			/3DM<=\(7-\(\{侵食段階\}\*4\/5R\)\) 〈＊運動〉/,
		);

		await page.locator("#convertType").selectOption("sarkaz-mercenary");
		await page.getByRole("button", { name: "コンバート" }).click();
		await expect(page.locator("#output")).toHaveValue(/3DM<=7 〈＊運動〉/);

		await page.locator("#convertType").selectOption("seaborn-abyssal");
		await page.getByRole("button", { name: "コンバート" }).click();
		await expect(page.locator("#output")).toHaveValue(/〈∞共鳴〉/);
	});

	test("converts CCFOLIA JSON across all convert types", async ({ page }) => {
		await openPage(page, "/converter");

		await page.locator("#input").fill(sampleCcfolia);
		await page.getByRole("button", { name: "コンバート" }).click();
		const normalResult = JSON.parse(await page.locator("#output").inputValue());
		expect(normalResult.kind).toBe("character");
		expect(
			normalResult.data.params.find((p: { label: string }) => p.label === "生理的耐性")?.value,
		).toBe("7");
		expect(
			normalResult.data.status.find((s: { label: string }) => s.label === "共鳴"),
		).toBeUndefined();

		await page.locator("#convertType").selectOption("sarkaz-mercenary");
		await page.getByRole("button", { name: "コンバート" }).click();
		const sarkazResult = JSON.parse(await page.locator("#output").inputValue());
		expect(
			sarkazResult.data.params.find((p: { label: string }) => p.label === "生理的耐性")?.value,
		).toBe("2");
		expect(
			sarkazResult.data.status.find((s: { label: string }) => s.label === "侵食度")?.value,
		).toBe("21");

		await page.locator("#convertType").selectOption("seaborn-abyssal");
		await page.getByRole("button", { name: "コンバート" }).click();
		const abyssalResult = JSON.parse(await page.locator("#output").inputValue());
		expect(
			abyssalResult.data.params.find((p: { label: string }) => p.label === "生理的耐性")?.value,
		).toBe("12");
		expect(
			abyssalResult.data.status.find((s: { label: string }) => s.label === "共鳴")?.value,
		).toBe("3");
	});

	test("copies converted output to clipboard and updates button label", async ({
		page,
		context,
	}) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await openPage(page, "/converter");

		await page.locator("#input").fill(samplePalette);
		await page.getByRole("button", { name: "コンバート" }).click();
		const expectedOutput = await page.locator("#output").inputValue();

		const copyButton = page.getByRole("button", { name: "コピー" });
		await copyButton.click();
		await expect(
			page.getByRole("button", { name: "クリップボードにコピーしました" }),
		).toBeVisible();

		const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboardText).toBe(expectedOutput);
	});
});

test.describe("erosion calculator behavior", () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(
			testInfo.project.name !== "chromium-pc-dark",
			"機能テストは PC ダーク代表環境のみで実行",
		);
	});

	test("updates BCDice command, expected value, and probability table on input change", async ({
		page,
	}) => {
		await openPage(page, "/erosion-calculator");

		await expect(page.locator("code")).toHaveText("1R10[>=6]<=3");
		await expect(page.getByRole("main")).toContainText("ダイス数: 1個");
		expect(await page.locator("tbody tr").count()).toBeGreaterThan(0);

		await page.locator("#erosionLevel").fill("40");
		await page.locator("#tolerance").fill("5");
		await page.locator("#danger").fill("4");

		await expect(page.locator("code")).toHaveText("9R10[>=5]<=4");
		await expect(page.getByRole("main")).toContainText("ダイス数: 9個");
		const expectedText = await page.locator("strong").first().textContent();
		expect(Number(expectedText)).toBeGreaterThan(5);
	});

	test("clamps out-of-range inputs to valid bounds", async ({ page }) => {
		await openPage(page, "/erosion-calculator");

		await page.locator("#erosionLevel").fill("150");
		await expect(page.locator("#erosionLevel")).toHaveValue("100");
		await expect(page.locator("code")).toHaveText("21R10[>=6]<=3");

		await page.locator("#tolerance").fill("99");
		await expect(page.locator("#tolerance")).toHaveValue("12");

		await page.locator("#danger").fill("99");
		await expect(page.locator("#danger")).toHaveValue("10");
	});
});

test.describe("theme toggle and mobile navigation", () => {
	test("toggles color theme and persists across reload", async ({ page }, testInfo) => {
		test.skip(
			testInfo.project.name !== "chromium-pc-dark",
			"テーマ切替テストは PC ダーク代表環境のみで実行",
		);

		await openPage(page, "/");
		const html = page.locator("html");
		const initialTheme = await html.getAttribute("data-theme");
		expect(initialTheme).toBe("dark");

		const toggleButton = page.getByRole("button", { name: /ダークモードを切り替える|テーマ切替/ });
		await toggleButton.click();

		let toggledTheme = await html.getAttribute("data-theme");
		if (toggledTheme === initialTheme) {
			await toggleButton.click();
			toggledTheme = await html.getAttribute("data-theme");
		}
		expect(toggledTheme).toBe("light");

		await page.reload();
		await expect(html).toHaveAttribute("data-theme", "light");
	});

	test("opens mobile navigation menu and navigates to tools", async ({ page }, testInfo) => {
		test.skip(
			testInfo.project.name !== "chromium-mobile-dark",
			"モバイルナビゲーションテストはモバイル環境のみで実行",
		);

		await openPage(page, "/");
		await page.getByRole("button", { name: /ナビゲーションバーを開く|メニューを開く/ }).click();
		const converterLink = page.getByRole("link", { name: "コンバーター" }).first();
		await expect(converterLink).toBeVisible();
		await converterLink.click();
		await expect(page).toHaveURL(/\/converter\/?$/);
		await expect(page.getByRole("heading", { level: 1, name: "コンバーター" })).toBeVisible();
	});
});
