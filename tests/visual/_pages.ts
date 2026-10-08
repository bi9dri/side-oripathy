export const pages = [
	{ name: "top", path: "/" },
	{ name: "converter", path: "/converter" },
	{ name: "erosion_calculator", path: "/erosion-calculator" },
	{ name: "erosion_check", path: "/docs/erosion_check" },
] as const;

/**
 * VRT の light/dark 比較対象。admonition / Expression / Memo / 表 / コードブロック /
 * サイドバー / TOC を1ページに含む erosion_check のみを選び、Argos snapshot 数を抑える。
 * それ以外のページは既定テーマ (dark) のみ撮影する。
 */
export function capturesTheme(name: string, theme: string): boolean {
	return theme === "dark" || name === "erosion_check";
}
