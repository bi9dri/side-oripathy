import { expect, type Page } from "@playwright/test";

export const pages = [
	{ name: "top", path: "/" },
	{ name: "converter", path: "/converter" },
	{ name: "erosion_calculator", path: "/erosion-calculator" },
	{ name: "erosion_check", path: "/docs/erosion_check" },
] as const;

export async function openPage(page: Page, path: string) {
	const response = await page.goto(path);
	expect(response?.ok(), `${path} returned non-2xx`).toBe(true);
	await expect(page.locator("html[data-has-hydrated='true']")).toBeAttached();
	await page.evaluate(async () => {
		await document.fonts.ready;
	});
}
