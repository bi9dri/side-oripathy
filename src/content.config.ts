import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./docs" }),
	schema: z.object({
		sidebar_position: z.number().optional(),
		toc_max_heading_level: z.number().optional(),
		title: z.string().optional(),
		description: z.string().optional(),
	}),
});

export const collections = { docs };
