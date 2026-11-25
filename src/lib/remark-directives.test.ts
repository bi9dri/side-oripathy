import { describe, expect, test } from "bun:test";
import { type MarkdownNode, remarkOripathyDirectives } from "./remark-directives";

function runPlugin(tree: MarkdownNode): MarkdownNode {
	const transform = remarkOripathyDirectives();
	transform(tree);
	return tree;
}

describe("remarkOripathyDirectives", () => {
	test("transforms :::note[title] container directive into aside admonition with title", () => {
		const tree: MarkdownNode = {
			type: "root",
			children: [
				{
					type: "containerDirective",
					name: "note",
					children: [
						{
							type: "paragraph",
							data: { directiveLabel: true },
							children: [{ type: "text", value: "非感染者への特則" }],
						},
						{
							type: "paragraph",
							children: [{ type: "text", value: "本文テキスト" }],
						},
					],
				},
			],
		};

		runPlugin(tree);
		const node = tree.children?.[0];
		expect(node?.data?.hName).toBe("aside");
		expect(node?.data?.hProperties).toEqual({
			className: ["admonition", "admonition--note"],
		});
		const titleNode = node?.children?.[0];
		expect(titleNode?.data?.hName).toBe("p");
		expect(titleNode?.data?.hProperties).toEqual({
			className: ["admonition-title"],
		});
		expect(titleNode?.children?.[0]?.value).toBe("非感染者への特則");
	});

	test("transforms :::tip[title] container directive into tip admonition", () => {
		const tree: MarkdownNode = {
			type: "root",
			children: [
				{
					type: "containerDirective",
					name: "tip",
					children: [
						{
							type: "paragraph",
							data: { directiveLabel: true },
							children: [{ type: "text", value: "BCDiceコマンド" }],
						},
						{
							type: "code",
							value: "({侵食度}/5F+1)R10[>={生理的耐性}]<={危険度}",
						},
					],
				},
			],
		};

		runPlugin(tree);
		const node = tree.children?.[0];
		expect(node?.data?.hName).toBe("aside");
		expect(node?.data?.hProperties).toEqual({
			className: ["admonition", "admonition--tip"],
		});
		expect(node?.children?.[0]?.data?.hProperties).toEqual({
			className: ["admonition-title"],
		});
		expect(node?.children?.[1]?.type).toBe("code");
	});

	test("inserts fallback title when admonition has no explicit directive label", () => {
		const tree: MarkdownNode = {
			type: "root",
			children: [
				{
					type: "containerDirective",
					name: "note",
					children: [
						{
							type: "paragraph",
							children: [{ type: "text", value: "ラベルなし本文" }],
						},
					],
				},
			],
		};

		runPlugin(tree);
		const node = tree.children?.[0];
		expect(node?.children?.length).toBe(2);
		expect(node?.children?.[0]).toEqual({
			type: "paragraph",
			data: {
				hName: "p",
				hProperties: {
					className: ["admonition-title"],
				},
			},
			children: [{ type: "text", value: "NOTE" }],
		});
	});

	test("inserts TIP fallback title even when tip admonition has no children", () => {
		const tree: MarkdownNode = {
			type: "root",
			children: [
				{
					type: "containerDirective",
					name: "tip",
				},
			],
		};

		runPlugin(tree);
		const node = tree.children?.[0];
		expect(node?.children).toEqual([
			{
				type: "paragraph",
				data: {
					hName: "p",
					hProperties: {
						className: ["admonition-title"],
					},
				},
				children: [{ type: "text", value: "TIP" }],
			},
		]);
	});

	test("transforms :::memo container directive into div.c-memo", () => {
		const tree: MarkdownNode = {
			type: "root",
			children: [
				{
					type: "containerDirective",
					name: "memo",
					children: [
						{
							type: "paragraph",
							children: [{ type: "text", value: "制作者メモ" }],
						},
					],
				},
			],
		};

		runPlugin(tree);
		const node = tree.children?.[0];
		expect(node?.data?.hName).toBe("div");
		expect(node?.data?.hProperties).toEqual({
			className: ["c-memo"],
		});
		expect(node?.children?.[0]?.children?.[0]?.value).toBe("制作者メモ");
	});

	test("transforms ::expression[...] leaf and :::expression container directives into p.c-expression while ignoring textDirective", () => {
		const tree: MarkdownNode = {
			type: "root",
			children: [
				{
					type: "leafDirective",
					name: "expression",
					children: [{ type: "text", value: "源石侵食判定（危険度3）" }],
				},
				{
					type: "containerDirective",
					name: "expression",
					children: [{ type: "paragraph", children: [{ type: "text", value: "ブロック式" }] }],
				},
				{
					type: "textDirective",
					name: "expression",
					children: [{ type: "text", value: "インライン対象外" }],
				},
			],
		};

		runPlugin(tree);
		const leaf = tree.children?.[0];
		expect(leaf?.data?.hName).toBe("p");
		expect(leaf?.data?.hProperties).toEqual({
			className: ["c-expression"],
		});
		expect(leaf?.children?.[0]?.value).toBe("源石侵食判定（危険度3）");

		const container = tree.children?.[1];
		expect(container?.data?.hName).toBe("p");
		expect(container?.data?.hProperties).toEqual({
			className: ["c-expression"],
		});

		const textDir = tree.children?.[2];
		expect(textDir?.data).toBeUndefined();
	});

	test("leaves unknown directives untouched while still traversing nested children", () => {
		const tree: MarkdownNode = {
			type: "root",
			children: [
				{
					type: "containerDirective",
					name: "unknown",
					children: [
						{
							type: "containerDirective",
							name: "memo",
							children: [
								{
									type: "paragraph",
									children: [{ type: "text", value: "ネストされたメモ" }],
								},
							],
						},
					],
				},
			],
		};

		runPlugin(tree);
		const outer = tree.children?.[0];
		expect(outer?.data).toBeUndefined();
		const inner = outer?.children?.[0];
		expect(inner?.data?.hName).toBe("div");
		expect(inner?.data?.hProperties).toEqual({ className: ["c-memo"] });
	});
});
