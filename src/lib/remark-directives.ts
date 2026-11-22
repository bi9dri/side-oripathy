export interface MarkdownNodeData {
	directiveLabel?: boolean;
	hName?: string;
	hProperties?: Record<string, unknown>;
}

export interface MarkdownNode {
	type: string;
	name?: string;
	value?: string;
	data?: MarkdownNodeData;
	children?: MarkdownNode[];
}

const ADMONITION_LABELS: Record<string, string> = {
	note: "NOTE",
	tip: "TIP",
};

function transformNode(node: MarkdownNode): void {
	if (node.type === "containerDirective" && node.name && node.name in ADMONITION_LABELS) {
		node.data = {
			...node.data,
			hName: "aside",
			hProperties: {
				className: ["admonition", `admonition--${node.name}`],
			},
		};
		const children = node.children ?? [];
		const firstChild = children[0];
		if (firstChild?.data?.directiveLabel) {
			firstChild.data = {
				...firstChild.data,
				hName: "p",
				hProperties: {
					className: ["admonition-title"],
				},
			};
		} else {
			node.children = [
				{
					type: "paragraph",
					data: {
						hName: "p",
						hProperties: {
							className: ["admonition-title"],
						},
					},
					children: [{ type: "text", value: ADMONITION_LABELS[node.name] }],
				},
				...children,
			];
		}
	} else if (node.type === "containerDirective" && node.name === "memo") {
		node.data = {
			...node.data,
			hName: "div",
			hProperties: {
				className: ["c-memo"],
			},
		};
	} else if (
		(node.type === "leafDirective" || node.type === "containerDirective") &&
		node.name === "expression"
	) {
		node.data = {
			...node.data,
			hName: "p",
			hProperties: {
				className: ["c-expression"],
			},
		};
	}

	if (node.children) {
		for (const child of node.children) {
			transformNode(child);
		}
	}
}

export function remarkOripathyDirectives() {
	return (tree: MarkdownNode): void => {
		transformNode(tree);
	};
}
