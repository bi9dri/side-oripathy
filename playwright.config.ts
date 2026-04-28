import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/visual",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	// VRT / a11y で retry を許すと flaky なレンダリング race が緑化されるため 0 固定。
	// 不安定が顕在化したら原因 (font / animation / network idle) を直接修正する方針。
	retries: 0,
	reporter: "list",
	use: {
		baseURL: "http://localhost:3000",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
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
		// `bun run serve -- --no-open` だと bun の引数転送が脆く、また `docusaurus serve`
		// は `--no-open` を未指定だとローカルでブラウザを自動起動する。bunx 直呼びで明示する。
		command: "bunx docusaurus serve --no-open --port 3000",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
