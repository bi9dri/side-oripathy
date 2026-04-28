const { chromium } = require("@playwright/test");

module.exports = {
	ci: {
		collect: {
			staticDistDir: "./build",
			url: [
				"http://localhost/index.html",
				"http://localhost/converter/index.html",
				"http://localhost/erosion-calculator/index.html",
				"http://localhost/docs/erosion_check/index.html",
			],
			numberOfRuns: 3,
			chromePath: chromium.executablePath(),
			settings: {
				chromeFlags: "--no-sandbox --disable-dev-shm-usage",
			},
		},
		assert: {
			// TEMPORARY (Phase 3): ローカル実測値に基づく暫定ベースライン。
			// 本 PR の趣旨はテスト基盤導入であり、閾値の妥当性検証は scope 外。
			// 性能はページ毎に特性差が大きいため URL 別に閾値を設定する。
			// /docs/erosion_check は MDX コンポーネント / コードブロック / admonition が多く 0.6 程度で推移。
			// TODO(phase4+): observed-floor をベースラインにする現方式は退行検知能力が低いため、
			// `current - delta` 方式 or 個別 audit (FCP/LCP/TBT/CLS) の数値 assertion へ移行する。
			assertMatrix: [
				{
					matchingUrlPattern: ".*",
					assertions: {
						"categories:accessibility": ["error", { minScore: 0.9 }],
						"categories:best-practices": ["error", { minScore: 0.9 }],
						"categories:seo": ["error", { minScore: 0.9 }],
					},
				},
				{
					matchingUrlPattern: "/docs/",
					assertions: {
						"categories:performance": ["error", { minScore: 0.6 }],
					},
				},
				{
					matchingUrlPattern: "^(?!.*\\/docs\\/).+",
					assertions: {
						"categories:performance": ["error", { minScore: 0.7 }],
					},
				},
			],
		},
		upload: {
			target: "temporary-public-storage",
		},
	},
};
