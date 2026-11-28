import { describe, expect, test } from "bun:test";
import { extractTitleFromMarkdown, filterTocHeadings, getPagination, sortDocs } from "./docs-nav";

describe("extractTitleFromMarkdown", () => {
	test("extracts first H1 heading from markdown body", () => {
		const body = "\n# 【源石侵食判定】\n\n## 判定方法\n";
		expect(extractTitleFromMarkdown(body, "erosion_check")).toBe("【源石侵食判定】");
	});

	test("ignores hash lines inside fenced code blocks", () => {
		const body =
			"```sh\n# not a heading\n```\n\n~~~md\n# also not a heading\n~~~\n\n# 本物の見出し\n";
		expect(extractTitleFromMarkdown(body, "fallback")).toBe("本物の見出し");
	});

	test("returns fallback when no H1 heading exists", () => {
		const body = "## 小見出しのみ\n\n本文";
		expect(extractTitleFromMarkdown(body, "fallback")).toBe("fallback");
	});
});

describe("sortDocs", () => {
	test("sorts docs ascending by sidebarPosition ahead of slug and falls back to slug", () => {
		const sorted = sortDocs([
			{ slug: "a-late", title: "A", sidebarPosition: 3 },
			{ slug: "z-first", title: "Z", sidebarPosition: 1 },
			{ slug: "b-first", title: "B", sidebarPosition: 1 },
			{ slug: "z-none", title: "Z2" },
			{ slug: "d-none", title: "D" },
		]);
		expect(sorted.map((item) => item.slug)).toEqual([
			"b-first",
			"z-first",
			"a-late",
			"d-none",
			"z-none",
		]);
	});
});

describe("getPagination", () => {
	const items = [
		{ slug: "intro", title: "はじめに" },
		{ slug: "licence", title: "ライセンス等" },
		{ slug: "overview", title: "概要" },
	];

	test("returns only next for the first document", () => {
		expect(getPagination(items, "intro")).toEqual({
			prev: null,
			next: { slug: "licence", title: "ライセンス等" },
		});
	});

	test("returns both prev and next for a middle document", () => {
		expect(getPagination(items, "licence")).toEqual({
			prev: { slug: "intro", title: "はじめに" },
			next: { slug: "overview", title: "概要" },
		});
	});

	test("returns only prev for the last document", () => {
		expect(getPagination(items, "overview")).toEqual({
			prev: { slug: "licence", title: "ライセンス等" },
			next: null,
		});
	});

	test("returns nulls when current slug is not found", () => {
		expect(getPagination(items, "missing")).toEqual({
			prev: null,
			next: null,
		});
	});
});

describe("filterTocHeadings", () => {
	const headings = [
		{ depth: 1, slug: "title", text: "タイトル" },
		{ depth: 2, slug: "h2-a", text: "判定方法" },
		{ depth: 3, slug: "h3-a", text: "危険度" },
		{ depth: 4, slug: "h4-a", text: "詳細" },
		{ depth: 2, slug: "h2-b", text: "危険度の指針" },
	];

	test("includes depths 2..3 by default", () => {
		expect(filterTocHeadings(headings).map((h) => h.text)).toEqual([
			"判定方法",
			"危険度",
			"危険度の指針",
		]);
	});

	test("restricts maximum heading depth when maxLevel is provided", () => {
		expect(filterTocHeadings(headings, 2).map((h) => h.text)).toEqual(["判定方法", "危険度の指針"]);
	});
});
