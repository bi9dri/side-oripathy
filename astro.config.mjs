import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import remarkDirective from "remark-directive";

import { remarkOripathyDirectives } from "./src/lib/remark-directives.ts";

export default defineConfig({
	site: "https://side-oripathy.bidri.dev",
	output: "static",
	markdown: {
		processor: unified({
			remarkPlugins: [remarkDirective, remarkOripathyDirectives],
		}),
		shikiConfig: {
			theme: "dracula",
		},
	},
	vite: {
		build: {
			cssTarget: ["chrome111", "firefox113", "safari16.4"],
		},
	},
});
