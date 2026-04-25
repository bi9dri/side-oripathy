import { describe, expect, test } from "bun:test";
import {
	convertCcfolia,
	convertCommands,
	judgeCcfoliaOrPalette,
} from "./converter";

describe("judgeCcfoliaOrPalette", () => {
	test('returns "ccfolia" when JSON has kind === "character"', () => {
		const input = JSON.stringify({ kind: "character", data: {} });
		expect(judgeCcfoliaOrPalette(input)).toBe("ccfolia");
	});

	test('returns "commandPalette" when JSON has kind !== "character"', () => {
		expect(judgeCcfoliaOrPalette(JSON.stringify({ kind: "other" }))).toBe("commandPalette");
	});

	test('returns "commandPalette" when JSON has no kind key', () => {
		expect(judgeCcfoliaOrPalette(JSON.stringify({ foo: 1 }))).toBe("commandPalette");
	});

	test('returns "commandPalette" for plain text', () => {
		expect(judgeCcfoliaOrPalette("3DM<=5 〈＊運動〉")).toBe("commandPalette");
	});

	test('returns "commandPalette" for empty string', () => {
		expect(judgeCcfoliaOrPalette("")).toBe("commandPalette");
	});

	test('returns "commandPalette" for JSON array', () => {
		expect(judgeCcfoliaOrPalette("[]")).toBe("commandPalette");
	});
});

describe("convertCommands — normal", () => {
	test("＊運動 gets erosion-stage penalty formula", () => {
		const output = convertCommands("3DM<=7 〈＊運動〉", "normal");
		expect(output).toContain("3DM<=(7-({侵食段階}*4/5R)) 〈＊運動〉");
	});

	test("武術xxx (startsWith 武術) treated as 運動系", () => {
		const output = convertCommands("5DM<=8 〈武術・白刃〉", "normal");
		expect(output).toContain("5DM<=(8-({侵食段階}*4/5R)) 〈武術・白刃〉");
	});

	test("アーツ skill gets erosion-stage bonus formula", () => {
		const output = convertCommands("4DM<=9 〈アーツ操作〉", "normal");
		expect(output).toContain("4DM<=(9+(({侵食段階}-1)*2/3C)) 〈アーツ操作〉");
	});

	test("other skill gets generic erosion-stage penalty formula", () => {
		const output = convertCommands("2DM<=6 〈観察〉", "normal");
		expect(output).toContain("2DM<=(6-(({侵食段階}-1)*2/3R)) 〈観察〉");
	});

	test("源石侵食判定 is the first line in output", () => {
		const lines = convertCommands("2DM<=5 〈観察〉", "normal").split("\n");
		expect(lines[0]).toContain("〈源石侵食判定〉");
	});

	test("lines not matching regex are ignored", () => {
		const output = convertCommands("not a valid command\n3DM<=5 〈観察〉", "normal");
		expect(output).not.toContain("not a valid command");
		expect(output).toContain("〈観察〉");
	});

	test("∞共鳴 lines in input are stripped before processing", () => {
		const output = convertCommands("1DM<=3 〈∞共鳴〉\n2DM<=5 〈観察〉", "normal");
		expect(output.split("\n").filter((l) => l.includes("∞共鳴")).length).toBe(0);
	});

	test("＊格闘 treated as 運動系", () => {
		expect(convertCommands("3DM<=7 〈＊格闘〉", "normal")).toContain(
			"3DM<=(7-({侵食段階}*4/5R)) 〈＊格闘〉",
		);
	});

	test("＊投擲 treated as 運動系", () => {
		expect(convertCommands("3DM<=7 〈＊投擲〉", "normal")).toContain(
			"3DM<=(7-({侵食段階}*4/5R)) 〈＊投擲〉",
		);
	});

	test("ストレングス treated as 運動系", () => {
		expect(convertCommands("3DM<=7 〈ストレングス〉", "normal")).toContain(
			"3DM<=(7-({侵食段階}*4/5R)) 〈ストレングス〉",
		);
	});

	test("アクロバット treated as 運動系", () => {
		expect(convertCommands("3DM<=7 〈アクロバット〉", "normal")).toContain(
			"3DM<=(7-({侵食段階}*4/5R)) 〈アクロバット〉",
		);
	});

	test("ダイブ treated as 運動系", () => {
		expect(convertCommands("3DM<=7 〈ダイブ〉", "normal")).toContain(
			"3DM<=(7-({侵食段階}*4/5R)) 〈ダイブ〉",
		);
	});

	test("★奥義xxx (startsWith ★奥義) treated as 運動系", () => {
		expect(convertCommands("3DM<=7 〈★奥義・断空〉", "normal")).toContain(
			"3DM<=(7-({侵食段階}*4/5R)) 〈★奥義・断空〉",
		);
	});

	test("★射撃xxx (startsWith ★射撃) treated as 運動系", () => {
		expect(convertCommands("3DM<=7 〈★射撃・狙撃〉", "normal")).toContain(
			"3DM<=(7-({侵食段階}*4/5R)) 〈★射撃・狙撃〉",
		);
	});
});

describe("convertCommands — sarkaz-mercenary", () => {
	test("運動系 is flat (no formula) for sarkaz-mercenary", () => {
		const output = convertCommands("3DM<=7 〈＊運動〉", "sarkaz-mercenary");
		expect(output).toContain("3DM<=7 〈＊運動〉");
	});

	test("アーツ falls through to default and gets bonus formula", () => {
		const output = convertCommands("4DM<=9 〈アーツ操作〉", "sarkaz-mercenary");
		expect(output).toContain("4DM<=(9+(({侵食段階}-1)*2/3C)) 〈アーツ操作〉");
	});

	test("other skill gets generic erosion-stage penalty for sarkaz-mercenary", () => {
		expect(convertCommands("2DM<=6 〈観察〉", "sarkaz-mercenary")).toContain(
			"2DM<=(6-(({侵食段階}-1)*2/3R)) 〈観察〉",
		);
	});
});

describe("convertCommands — seaborn-abyssal", () => {
	test("運動系 gets +1 die formula", () => {
		const output = convertCommands("3DM<=7 〈スピード〉", "seaborn-abyssal");
		expect(output).toContain("(3+1)DM<=7 〈スピード〉");
	});

	test("アーツ is flat for seaborn-abyssal", () => {
		const output = convertCommands("4DM<=9 〈アーツ操作〉", "seaborn-abyssal");
		expect(output).toContain("4DM<=9 〈アーツ操作〉");
	});

	test("other skill is flat for seaborn-abyssal", () => {
		const output = convertCommands("2DM<=6 〈観察〉", "seaborn-abyssal");
		expect(output).toContain("2DM<=6 〈観察〉");
	});

	test("∞共鳴 line is second line (after 源石侵食判定)", () => {
		const lines = convertCommands("2DM<=5 〈観察〉", "seaborn-abyssal").split("\n");
		expect(lines[0]).toContain("〈源石侵食判定〉");
		expect(lines[1]).toContain("〈∞共鳴〉 完全一致");
	});

	test("★射撃xxx gets +1 die for seaborn-abyssal", () => {
		expect(convertCommands("4DM<=8 〈★射撃・狙撃〉", "seaborn-abyssal")).toContain(
			"(4+1)DM<=8 〈★射撃・狙撃〉",
		);
	});
});

const BASE_CCFOLIA = {
	kind: "character",
	data: {
		params: [
			{ label: "身体", value: "4" },
			{ label: "運勢", value: "3" },
		],
		status: [
			{ label: "共鳴", value: "2", max: "9" },
			{ label: "HP", value: "10", max: "10" },
		],
		commands: "3DM<=7 〈＊運動〉\n2DM<=5 〈観察〉",
	},
};

describe("convertCcfolia — normal", () => {
	test("sets 生理的耐性 = 身体 + 運勢 (4+3=7)", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "normal"));
		const param = result.data.params.find((p: { label: string }) => p.label === "生理的耐性");
		expect(param?.value).toBe("7");
	});

	test("adds 侵食度 with initial value 0 and max 100", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "normal"));
		const st = result.data.status.find((s: { label: string }) => s.label === "侵食度");
		expect(st).toMatchObject({ value: "0", max: "100" });
	});

	test("adds 侵食段階 with initial value 0 and max 4", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "normal"));
		const st = result.data.status.find((s: { label: string }) => s.label === "侵食段階");
		expect(st).toMatchObject({ value: "0", max: "4" });
	});

	test("drops 共鳴 from status for normal type", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "normal"));
		const kyoumei = result.data.status.find((s: { label: string }) => s.label === "共鳴");
		expect(kyoumei).toBeUndefined();
	});

	test("output is valid JSON with kind === 'character'", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "normal"));
		expect(result.kind).toBe("character");
	});

	test("commands are converted with normal formula", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "normal"));
		expect(result.data.commands).toContain("〈源石侵食判定〉");
		expect(result.data.commands).toContain("3DM<=(7-({侵食段階}*4/5R)) 〈＊運動〉");
	});
});

describe("convertCcfolia — sarkaz-mercenary", () => {
	test("sets 生理的耐性 = 2", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "sarkaz-mercenary"));
		const param = result.data.params.find((p: { label: string }) => p.label === "生理的耐性");
		expect(param?.value).toBe("2");
	});

	test("sets 侵食度 value to 21 and 侵食段階 value to 2", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "sarkaz-mercenary"));
		const erosion = result.data.status.find((s: { label: string }) => s.label === "侵食度");
		const stage = result.data.status.find((s: { label: string }) => s.label === "侵食段階");
		expect(erosion?.value).toBe("21");
		expect(stage?.value).toBe("2");
	});

	test("commands: 運動系 is flat, other gets penalty", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "sarkaz-mercenary"));
		expect(result.data.commands).toContain("3DM<=7 〈＊運動〉");
		expect(result.data.commands).toContain("2DM<=(5-(({侵食段階}-1)*2/3R)) 〈観察〉");
	});
});

describe("convertCcfolia — seaborn-abyssal", () => {
	test("sets 生理的耐性 = 12", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "seaborn-abyssal"));
		const param = result.data.params.find((p: { label: string }) => p.label === "生理的耐性");
		expect(param?.value).toBe("12");
	});

	test("clamps 共鳴 value to 3 when source < 3", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "seaborn-abyssal"));
		const kyoumei = result.data.status.find((s: { label: string }) => s.label === "共鳴");
		expect(kyoumei?.value).toBe("3");
		expect(kyoumei?.max).toBe("9");
	});

	test("keeps 共鳴 value unchanged when source >= 3", () => {
		const input = structuredClone(BASE_CCFOLIA);
		input.data.status[0] = { label: "共鳴", value: "5", max: "9" };
		const result = JSON.parse(convertCcfolia(JSON.stringify(input), "seaborn-abyssal"));
		const kyoumei = result.data.status.find((s: { label: string }) => s.label === "共鳴");
		expect(kyoumei?.value).toBe("5");
	});

	test("keeps 共鳴 value unchanged when source === 3 (exact boundary)", () => {
		const input = structuredClone(BASE_CCFOLIA);
		input.data.status[0] = { label: "共鳴", value: "3", max: "9" };
		const result = JSON.parse(convertCcfolia(JSON.stringify(input), "seaborn-abyssal"));
		const kyoumei = result.data.status.find((s: { label: string }) => s.label === "共鳴");
		expect(kyoumei?.value).toBe("3");
	});

	test("commands include ∞共鳴 line", () => {
		const result = JSON.parse(convertCcfolia(JSON.stringify(BASE_CCFOLIA), "seaborn-abyssal"));
		expect(result.data.commands).toContain("〈∞共鳴〉");
	});
});
