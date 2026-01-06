import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const locale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? "ja";

const title = ((): string => {
	switch (locale) {
		case "en":
			return "Arknights × Emoklore TRPG: Side Oripathy";
		default:
			return "アークナイツ×エモクロアTRPG サイド・オリパシー";
	}
})();

const tagline = ((): string => {
	switch (locale) {
		case "en":
			return "Emoklore TRPG Expansion Rules";
		default:
			return "エモクロアTRPG追加ルール";
	}
})();

const config: Config = {
	title: title,
	tagline: tagline,
	favicon: "img/favicon.ico",

	// Set the production url of your site here
	url: "https://side-oripathy.bidri.dev",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: "/",

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: "bidri", // Usually your GitHub org/user name.
	projectName: "emoklore-arknights-side-oripathy", // Usually your repo name.

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
		locales: ["ja", "en"],
		localeConfigs: {
			en: {
				htmlLang: "en-US",
			},
		},
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
		// Replace with your project's social card
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
					type: "localeDropdown",
					position: "right",
				},
				{
					href: "https://github.com/bi9dri/emoklore-arknights-side-oripathy",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			// links: [
			//   {
			//     // title: 'Docs',
			//     items: [
			//       {
			//         label: 'ルール',
			//         to: '/docs/intro',
			//       },
			//     ],
			//   },
			//   {
			//     // title: 'More',
			//     items: [
			//       {
			//         label: 'GitHub',
			//         href: 'https://github.com/bi9dri/emoklore-arknights-side-oripathy',
			//       },
			//     ],
			//   },
			// ],
			copyright: `Copyright © ${new Date().getFullYear()} bidri. Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
