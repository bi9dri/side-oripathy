export interface DocNavItem {
	slug: string;
	title: string;
	sidebarPosition?: number;
}

export interface TocHeading {
	depth: number;
	slug: string;
	text: string;
}

export function extractTitleFromMarkdown(body: string, fallback: string): string {
	let inFence = false;
	for (const rawLine of body.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (line.startsWith("```") || line.startsWith("~~~")) {
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			continue;
		}
		const match = line.match(/^#\s+(.+)$/);
		if (match) {
			return match[1].trim();
		}
	}
	return fallback;
}

export function sortDocs<T extends DocNavItem>(docs: readonly T[]): T[] {
	return [...docs].sort((a, b) => {
		const posA = a.sidebarPosition ?? Number.POSITIVE_INFINITY;
		const posB = b.sidebarPosition ?? Number.POSITIVE_INFINITY;
		if (posA !== posB) {
			return posA - posB;
		}
		return a.slug.localeCompare(b.slug);
	});
}

export function getPagination(
	sortedDocs: readonly DocNavItem[],
	currentSlug: string,
): { prev: DocNavItem | null; next: DocNavItem | null } {
	const index = sortedDocs.findIndex((doc) => doc.slug === currentSlug);
	if (index === -1) {
		return { prev: null, next: null };
	}
	return {
		prev: index > 0 ? sortedDocs[index - 1] : null,
		next: index < sortedDocs.length - 1 ? sortedDocs[index + 1] : null,
	};
}

export function filterTocHeadings(headings: readonly TocHeading[], maxLevel = 3): TocHeading[] {
	return headings.filter((heading) => heading.depth >= 2 && heading.depth <= maxLevel);
}
