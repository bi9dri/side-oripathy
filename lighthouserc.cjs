const { chromium } = require("@playwright/test");

module.exports = {
	ci: {
		collect: {
			staticDistDir: "./build",
			url: [
				"http://localhost/index.html",
				"http://localhost/converter/index.html",
				"http://localhost/docs/erosion_check/index.html",
			],
			numberOfRuns: 3,
			chromePath: chromium.executablePath(),
			settings: {
				chromeFlags: "--no-sandbox --disable-dev-shm-usage",
			},
		},
		assert: {
			// Phase 3 導入時点のローカル実測値に基づくベースライン。
			// 性能はページ毎に特性差が大きいため URL 別に閾値を設定する。
			// /docs/erosion_check は MDX コンポーネント / コードブロック / admonition が多く 0.63〜0.67 で推移。
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
