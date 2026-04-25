import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/visual",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: "list",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium-pc-light",
			use: { ...devices["Desktop Chrome"], colorScheme: "light" },
		},
		{
			name: "chromium-pc-dark",
			use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
		},
		{
			name: "chromium-mobile-light",
			use: { ...devices["Pixel 5"], colorScheme: "light" },
		},
		{
			name: "chromium-mobile-dark",
			use: { ...devices["Pixel 5"], colorScheme: "dark" },
		},
	],
	webServer: {
		command: "bun run serve -- --no-open",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
