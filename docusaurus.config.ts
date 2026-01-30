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
	onBrokenMarkdownLinks: "warn",

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "ja",
		locales: ["ja"],
	},

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
		image: "img/docusaurus-social-card.jpg",
		navbar: {
			title: "アークナイツ×エモクロアTRPG サイド・オリパシー",
			// logo: {
			//   alt: 'My Site Logo',
			//   src: 'img/logo.svg',
			// },
			items: [
				{
					type: "docSidebar",
					sidebarId: "rulesSidebar",
					position: "left",
					label: "ルール",
				},
				{
					href: "/converter",
					position: "left",
					label: "コンバーター",
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
			copyright: `Copyright © ${new Date().getFullYear()} bidri. Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
