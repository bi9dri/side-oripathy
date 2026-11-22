import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/visual",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 4 : undefined,
	maxFailures: process.env.CI ? 10 : undefined,
	reporter: [
		process.env.CI ? ["github"] : ["list"],
		["html", { outputFolder: "playwright-report", open: "never" }],
	],
	expect: {
		toHaveScreenshot: {
			maxDiffPixels: 100,
			stylePath: "tests/visual/vrt.css",
		},
	},
	snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}",
	use: {
		baseURL: "http://localhost:3000",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		launchOptions: {
			args: ["--disable-lcd-text", "--font-render-hinting=none"],
		},
	},
	projects: [
		{
			name: "chromium-pc-light",
			use: { ...devices["Desktop Chrome"], colorScheme: "light" },
			metadata: { variant: "pc" },
		},
		{
			name: "chromium-pc-dark",
			use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
			metadata: { variant: "pc" },
		},
		{
			name: "chromium-mobile-light",
			use: { ...devices["Pixel 5"], colorScheme: "light" },
			metadata: { variant: "mobile" },
		},
		{
			name: "chromium-mobile-dark",
			use: { ...devices["Pixel 5"], colorScheme: "dark" },
			metadata: { variant: "mobile" },
		},
	],
	webServer: {
		command: "bun run serve -- --port 3000",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
