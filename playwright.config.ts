import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/visual",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	// VRT / a11y で retry を許すと flaky なレンダリング race が緑化されるため 0 固定。
	// 不安定が顕在化したら原因 (font / animation / network idle) を直接修正する方針。
	retries: 0,
	// ubuntu-latest は 4 vCPU。Playwright の既定 (コア数の半分) では 2 つしか使わないため、
	// VRT 20 枚 + a11y の実行を 4 worker に広げる。context ごとに viewport / theme は
	// 隔離され、webServer は読み取り専用で共有できる。
	workers: process.env.CI ? 4 : undefined,
	// baseline 総入れ替え (Chromium 更新など) や dev server 不調のとき、全テストを
	// 最後まで走らせずに打ち切る。4 worker が並行して失敗し得るので余裕を持たせる。
	maxFailures: process.env.CI ? 10 : undefined,
	// baseline はリポジトリにコミットし、Playwright が自前で比較する。
	// 生成・更新の責任は CI (Linux) が持つ。
	reporter: [
		process.env.CI ? ["github"] : ["list"],
		["html", { outputFolder: "playwright-report", open: "never" }],
	],
	expect: {
		toHaveScreenshot: {
			// アンチエイリアス等のレンダリング微差は許容しつつ、小さな退行は検出する。
			// 画像サイズに依存しない絶対値で判定する。
			maxDiffPixels: 100,
			// 撮影中だけ textarea のリサイズを無効化する (vrt.css のコメント参照)。
			stylePath: "tests/visual/vrt.css",
		},
	},
	// OS ごとに描画が異なるため `{platform}` で baseline を分ける。コミットするのは
	// CI (Linux) が生成するものだけで、他は .gitignore で除外する。
	snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}",
	use: {
		baseURL: "http://localhost:3000",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		// サブピクセル描画とフォントヒンティングを切り、同じ baseline を共有する範囲で
		// glyph 差を減らす。
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
		// `bun run serve -- --no-open` だと bun の引数転送が脆く、また `docusaurus serve`
		// は `--no-open` を未指定だとローカルでブラウザを自動起動する。bunx 直呼びで明示する。
		command: "bunx docusaurus serve --no-open --port 3000",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
