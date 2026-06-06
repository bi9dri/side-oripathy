import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: "アークナイツ×エモクロアTRPG サイド・オリパシー",
	tagline: "エモクロアTRPG追加ルール",
	favicon: "img/favicon.ico",

	url: "https://side-oripathy.bidri.dev",
	baseUrl: "/",

	organizationName: "bidri",
	projectName: "side-oripathy",

	onBrokenLinks: "throw",
	markdown: {
		hooks: {
			onBrokenMarkdownLinks: "warn",
		},
	},

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "ja",
		locales: ["ja"],
	},

	headTags: [
		// Noto Sans JP (Google Fonts) — 日本語フォントを CDN の動的サブセットで配信する。
		// preconnect でハンドシェイクを前倒しし、media=print → onload で all に切替えることで
		// render-blocking を避けつつ webfont を適用する (display=swap で fallback を即時描画)。
		{
			tagName: "link",
			attributes: { rel: "preconnect", href: "https://fonts.googleapis.com" },
		},
		{
			tagName: "link",
			attributes: {
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossorigin: "anonymous",
			},
		},
		{
			tagName: "link",
			attributes: {
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap",
				media: "print",
				onload: "this.media='all'",
			},
		},
		{
			tagName: "link",
			attributes: { rel: "apple-touch-icon", sizes: "180x180", href: "/img/apple-touch-icon.png" },
		},
		{
			tagName: "link",
			attributes: {
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/img/favicon-32x32.png",
			},
		},
		{
			tagName: "link",
			attributes: {
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/img/favicon-16x16.png",
			},
		},
		{
			tagName: "link",
			attributes: { rel: "manifest", href: "/img/site.webmanifest" },
		},
	],

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
				gtag: {
					trackingID: "G-YT5ST8BYXJ",
					anonymizeIP: true,
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		image: "img/icon.webp",
		colorMode: {
			defaultMode: "dark",
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: "アークナイツ×エモクロアTRPG サイド・オリパシー",
			items: [
				{
					type: "docSidebar",
					sidebarId: "rulesSidebar",
					position: "left",
					label: "ルール",
				},
				{
					to: "/converter",
					position: "left",
					label: "コンバーター",
				},
				{
					to: "/erosion-calculator",
					position: "left",
					label: "侵食判定計算機",
				},
				{
					href: "https://github.com/bi9dri/side-oripathy",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			copyright: `© ${new Date().getFullYear()} bidri // SIDE:ORIPATHY TERMINAL`,
		},
		prism: {
			theme: prismThemes.dracula,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
