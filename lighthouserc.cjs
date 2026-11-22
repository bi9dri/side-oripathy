function resolveChromePath() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	try {
		const path = require("@playwright/test").chromium.executablePath();
		if (path && require("node:fs").existsSync(path)) return path;
	} catch {}
	return undefined;
}

module.exports = {
	ci: {
		collect: {
			staticDistDir: "./dist",
			url: [
				"http://localhost/index.html",
				"http://localhost/converter/index.html",
				"http://localhost/erosion-calculator/index.html",
				"http://localhost/docs/erosion_check/index.html",
			],
			numberOfRuns: 3,
			...(resolveChromePath() ? { chromePath: resolveChromePath() } : {}),
			settings: {
				chromeFlags: "--no-sandbox --disable-dev-shm-usage",
			},
		},
		assert: {
			assertMatrix: [
				{
					matchingUrlPattern: ".*",
					assertions: {
						"categories:accessibility": ["error", { minScore: 0.9 }],
						"categories:best-practices": ["error", { minScore: 0.9 }],
						"categories:seo": ["error", { minScore: 0.9 }],
						"errors-in-console": ["warn", {}],
						"total-byte-weight": ["error", { maxNumericValue: 5_000_000 }],
					},
				},
				{
					matchingUrlPattern: "/docs/",
					assertions: {
						"first-contentful-paint": ["error", { maxNumericValue: 2050 }],
						"largest-contentful-paint": ["warn", { maxNumericValue: 3050 }],
						"total-blocking-time": ["warn", { maxNumericValue: 350 }],
						"cumulative-layout-shift": ["warn", { maxNumericValue: 0.16 }],
					},
				},
				{
					matchingUrlPattern: "^(?!.*/docs/).+",
					assertions: {
						"first-contentful-paint": ["error", { maxNumericValue: 2050 }],
						"largest-contentful-paint": ["error", { maxNumericValue: 3100 }],
						"total-blocking-time": ["error", { maxNumericValue: 450 }],
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
