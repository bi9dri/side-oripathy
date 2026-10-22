import { expect, type Page } from "@playwright/test";

export const pages = [
	{ name: "top", path: "/" },
	{ name: "converter", path: "/converter" },
	{ name: "erosion_calculator", path: "/erosion-calculator" },
	{ name: "erosion_check", path: "/docs/erosion_check" },
] as const;

// VRT / a11y の前処理。`networkidle` はリクエストが 500ms 静かになるまで待つため、
// ページごとに 0.5 秒の固定費が乗る。Docusaurus は hydration 完了時に
// <html data-has-hydrated="true"> を立てるので、それを合図にする。レイアウトの
// 収束は toHaveScreenshot の連続フレーム一致に任せる。
export async function openPage(page: Page, path: string) {
	const response = await page.goto(path);
	expect(response?.ok(), `${path} returned non-2xx`).toBe(true);
	await expect(page.locator("html[data-has-hydrated='true']")).toBeAttached();
	await page.evaluate(async () => {
		await document.fonts.ready;
	});
}
