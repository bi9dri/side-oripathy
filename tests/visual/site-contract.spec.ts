import { expect, test } from "@playwright/test";

import { openPage } from "./_pages";

const docPages = [
	{ slug: "intro", title: "はじめに" },
	{ slug: "licence", title: "ライセンス等" },
	{ slug: "overview", title: "概要" },
	{ slug: "arknights_words", title: "アークナイツの世界観・用語" },
	{ slug: "erosion_level", title: "〈侵食度〉" },
	{ slug: "erosion_check", title: "【源石侵食判定】" },
	{ slug: "arts_skill", title: "〈アーツ〉技能" },
	{ slug: "arts_backlash_check", title: "【アーツ反動判定】" },
	{ slug: "arts_hyperdrive", title: "アーツの【ハイパードライブ】" },
	{ slug: "acute_oripathy_seizure", title: "【急性感染発作】" },
	{ slug: "terminal_stage_handling", title: "侵食段階末期の処理" },
	{ slug: "optional_expansion_rules", title: "追加の追加ルール" },
] as const;

const allRoutes = [
	"/",
	"/converter",
	"/erosion-calculator",
	...docPages.map((doc) => `/docs/${doc.slug}`),
] as const;

function normalizePath(pathname: string): string {
	const trimmed = pathname.replace(/\/+$/, "");
	return trimmed === "" ? "/" : trimmed;
}

test.describe("site contract", () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(
			testInfo.project.name !== "chromium-pc-dark",
			"サイト構造の契約テストは PC ダーク代表環境のみで実行",
		);
	});

	test("all routes render with heading, metadata, and GA4", async ({ page }) => {
		for (const route of allRoutes) {
			await openPage(page, route);
			await expect(page.locator("h1").first()).toBeVisible();
			expect(await page.title()).not.toBe("");
			const description = await page
				.locator('meta[name="description"]')
				.first()
				.getAttribute("content");
			expect(description?.trim().length ?? 0).toBeGreaterThan(0);
			await expect(
				page.locator('script[src*="googletagmanager.com/gtag/js?id=G-YT5ST8BYXJ"]'),
			).toBeAttached();
			await expect(page.locator("body")).not.toContainText("@site/src/components/");
		}
	});

	test("trailing slash routes resolve cleanly", async ({ page }) => {
		await openPage(page, "/docs/erosion_level/");
		await expect(page.getByRole("heading", { level: 1, name: "〈侵食度〉" })).toBeVisible();
	});

	test("top page exposes main navigation and primary CTAs", async ({ page }) => {
		await openPage(page, "/");

		const topNav = page.getByRole("navigation", { name: "ナビゲーション", exact: true });
		await expect(topNav.getByRole("link", { name: "ルール", exact: true })).toBeVisible();
		await expect(topNav.getByRole("link", { name: "コンバーター", exact: true })).toBeVisible();
		await expect(topNav.getByRole("link", { name: "侵食判定計算機", exact: true })).toBeVisible();
		await expect(topNav.getByRole("link", { name: /^GitHub/ })).toHaveAttribute(
			"href",
			"https://github.com/bi9dri/side-oripathy",
		);

		const main = page.getByRole("main");
		await expect(main.getByRole("link", { name: "ルールを読む" })).toHaveAttribute(
			"href",
			/\/docs\/intro\/?$/,
		);
		await expect(main.getByRole("link", { name: "キャラクターをコンバートする" })).toHaveAttribute(
			"href",
			/\/converter\/?$/,
		);
		await expect(page.getByRole("contentinfo")).toContainText("SIDE:ORIPATHY TERMINAL");
	});

	test("docs sidebar preserves sidebar_position order and pagination links", async ({ page }) => {
		await openPage(page, "/docs/intro");

		const sidebar = page.getByRole("navigation", { name: "ドキュメントのサイドバー" });
		const sidebarTitles = await sidebar.getByRole("link").allTextContents();
		expect(sidebarTitles.map((text) => text.trim())).toEqual(docPages.map((doc) => doc.title));

		const firstPagination = page.getByRole("navigation", { name: "ドキュメントページ" });
		await expect(firstPagination.getByRole("link")).toHaveCount(1);
		await expect(firstPagination.getByRole("link").first()).toHaveAttribute(
			"href",
			/\/docs\/licence\/?$/,
		);

		await openPage(page, "/docs/erosion_check");
		const middlePagination = page.getByRole("navigation", { name: "ドキュメントページ" });
		await expect(middlePagination.getByRole("link")).toHaveCount(2);
		await expect(middlePagination.getByRole("link").nth(0)).toHaveAttribute(
			"href",
			/\/docs\/erosion_level\/?$/,
		);
		await expect(middlePagination.getByRole("link").nth(1)).toHaveAttribute(
			"href",
			/\/docs\/arts_skill\/?$/,
		);

		await openPage(page, "/docs/optional_expansion_rules");
		const lastPagination = page.getByRole("navigation", { name: "ドキュメントページ" });
		await expect(lastPagination.getByRole("link")).toHaveCount(1);
		await expect(lastPagination.getByRole("link").first()).toHaveAttribute(
			"href",
			/\/docs\/terminal_stage_handling\/?$/,
		);
	});

	test("toc_max_heading_level restricts TOC depth on erosion_check", async ({ page }) => {
		await openPage(page, "/docs/erosion_check");

		const tocLinks = await page
			.locator('nav[aria-label="目次"] a, .table-of-contents a')
			.allTextContents();
		const normalizedToc = tocLinks.map((text) => text.trim());
		expect(normalizedToc).toEqual(["判定方法", "例", "危険度の指針"]);
	});

	test("special document elements render correctly", async ({ page }) => {
		await openPage(page, "/docs/erosion_check");
		await expect(page.locator(".c-expression")).toContainText("源石侵食判定（危険度3）");
		expect(await page.locator(".c-memo").count()).toBeGreaterThanOrEqual(2);
		await expect(page.locator("article")).toContainText("BCDiceコマンド");
		await expect(page.locator("article")).toContainText("非感染者への特則");
		await expect(page.locator("article")).toContainText("描写と処理の例");

		await openPage(page, "/docs/erosion_level");
		const table = page.locator("article table").first();
		await expect(table).toContainText("侵食段階");
		await expect(table).toContainText("侵食度");
		await expect(table).toContainText("非感染");
		await expect(table).toContainText("軽度");
		await expect(table).toContainText("中等度");
		await expect(table).toContainText("重度");
		await expect(table).toContainText("末期");
		await expect(table).toContainText("死亡");

		await openPage(page, "/docs/terminal_stage_handling");
		await expect(page.locator("article")).toContainText("オペレーション オリジニウムダスト");

		await openPage(page, "/docs/licence");
		const image = page.locator("article").getByRole("img", { name: "ダイスタス・コモンズ" });
		await expect(image).toBeVisible();
		const loadedWidth = await image.evaluate((el: HTMLImageElement) => el.naturalWidth);
		expect(loadedWidth).toBeGreaterThan(0);
	});

	test("all internal links and fragment anchors resolve across the entire site", async ({
		page,
		request,
	}) => {
		const idsByPath = new Map<string, Set<string>>();
		const linksToVerify: Array<{ from: string; href: string }> = [];

		for (const route of allRoutes) {
			await openPage(page, route);
			const snapshot = await page.evaluate(() => {
				const ids = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
				const hrefs = Array.from(document.querySelectorAll("a[href]"))
					.map((el) => el.getAttribute("href") ?? "")
					.filter((href) => href.startsWith("/") || href.startsWith("#"));
				return { ids, hrefs };
			});

			idsByPath.set(normalizePath(route), new Set(snapshot.ids));
			for (const href of snapshot.hrefs) {
				linksToVerify.push({ from: route, href });
			}
		}

		const checkedPaths = new Set<string>(idsByPath.keys());
		const brokenLinks: string[] = [];

		for (const { from, href } of linksToVerify) {
			if (href === "#") {
				continue;
			}
			const resolved = new URL(href, `http://localhost:3000${from}`);
			const targetPath = normalizePath(resolved.pathname);
			const fragment = resolved.hash ? decodeURIComponent(resolved.hash.slice(1)) : "";

			if (!checkedPaths.has(targetPath)) {
				const res = await request.get(resolved.pathname);
				if (!res.ok()) {
					brokenLinks.push(`${from} -> ${href} (HTTP ${res.status()})`);
					continue;
				}
				checkedPaths.add(targetPath);
			}

			if (fragment) {
				const targetIds = idsByPath.get(targetPath);
				if (!targetIds || !targetIds.has(fragment)) {
					brokenLinks.push(`${from} -> ${href} (missing #${fragment} on ${targetPath})`);
				}
			}
		}

		expect(brokenLinks).toEqual([]);
	});
});
