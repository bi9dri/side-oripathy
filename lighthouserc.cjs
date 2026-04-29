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
			// 閾値は lhci collect 実測値 (3 run median) の URL グループ別最悪値から算出:
			// FCP / LCP / TBT: median_ms * 1.2 の天井値を 50 ms 単位で切り上げ (ms)。
			// CLS: median + 0.05、下限 0.1 (unitless)。
			// /docs/ は MDX・コードブロック密度が高く非 docs より遅い傾向がある。
			// Web Vitals "Good" 境界への引き締めは別 issue で追跡する。
			assertMatrix: [
				{
					matchingUrlPattern: ".*",
					assertions: {
						"categories:accessibility": ["error", { minScore: 0.9 }],
						"categories:best-practices": ["error", { minScore: 0.9 }],
						"categories:seo": ["error", { minScore: 0.9 }],
						// ランタイム console.error 検出。
						"errors-in-console": ["error", {}],
						// 全アセット合計バイト数の budget。Phase 3 導入時の暫定上限値 (5MB)。
						"total-byte-weight": ["error", { maxNumericValue: 5_000_000 }],
					},
				},
				{
					matchingUrlPattern: "/docs/",
					assertions: {
						"first-contentful-paint": ["error", { maxNumericValue: 2050 }],
						"largest-contentful-paint": ["error", { maxNumericValue: 3050 }],
						"total-blocking-time": ["error", { maxNumericValue: 350 }],
						"cumulative-layout-shift": ["error", { maxNumericValue: 0.16 }],
					},
				},
				{
					matchingUrlPattern: "^(?!.*/docs/).+",
					assertions: {
						"first-contentful-paint": ["error", { maxNumericValue: 2050 }],
						"largest-contentful-paint": ["error", { maxNumericValue: 3100 }],
						"total-blocking-time": ["error", { maxNumericValue: 350 }],
						"cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
					},
				},
			],
		},
		upload: {
			target: "temporary-public-storage",
		},
	},
};
