export type TextType = "ccfolia" | "commandPalette";
export type ConvertType = "normal" | "sarkaz-mercenary" | "seaborn-abyssal";

export const judgeCcfoliaOrPalette = (text: string): TextType => {
	try {
		const jsonObj = JSON.parse(text);
		if (jsonObj && jsonObj.kind === "character") {
			return "ccfolia";
		}
	} catch {}
	return "commandPalette";
};

const convertLine = (line: string, convertType: ConvertType): string => {
	const m = line.match(/(\d+)DM<=(\d+)\s〈(.*?)〉/);
	if (!m) return line;

	const [, level, judge, skill] = m;

	/* 運動系技能 */
	if (
		["＊運動", "スピード", "ストレングス", "アクロバット", "ダイブ", "＊格闘", "＊投擲"].includes(
			skill,
		) ||
		skill.startsWith("武術") ||
		skill.startsWith("★奥義") ||
		skill.startsWith("★射撃")
	) {
		switch (convertType) {
			case "sarkaz-mercenary":
				return `${level}DM<=${judge} 〈${skill}〉`;
			case "seaborn-abyssal":
				return `(${level}+1)DM<=${judge} 〈${skill}〉`;
			default:
				return `${level}DM<=(${judge}-({侵食段階}*4/5R)) 〈${skill}〉`;
		}
	}

	/* アーツ */
	if (skill.startsWith("アーツ")) {
		switch (convertType) {
			case "seaborn-abyssal":
				return `${level}DM<=${judge} 〈${skill}〉`;
			default:
				return `${level}DM<=(${judge}+(({侵食段階}-1)*2/3C)) 〈${skill}〉`;
		}
	}

	/* その他の技能 */
	switch (convertType) {
		case "seaborn-abyssal":
			return `${level}DM<=${judge} 〈${skill}〉`;
		default:
			return `${level}DM<=(${judge}-(({侵食段階}-1)*2/3R)) 〈${skill}〉`;
	}
};

export const convertCommands = (text: string, convertType: ConvertType): string => {
	const lines = text
		.split("\n")
		.filter((line) => line.indexOf("∞共鳴") === -1)
		.map((line) => convertLine(line, convertType));

	if (convertType === "seaborn-abyssal") {
		lines.unshift("({共鳴}*2)DM<={強度} 〈∞共鳴〉 完全一致");
	}

	lines.unshift("({侵食度}/5F+1)R10[>={生理的耐性}]<={危険度} 〈源石侵食判定〉");

	return lines.join("\n");
};

export const convertCcfolia = (text: string, convertType: ConvertType): string => {
	const jsonObj = JSON.parse(text);

	const srcParams: { [key: string]: number } = {};
	for (const param of jsonObj.data.params) {
		srcParams[param.label] = Number.parseInt(param.value);
	}

	switch (convertType) {
		case "normal":
			srcParams["生理的耐性"] = srcParams["身体"] + srcParams["運勢"];
			break;
		case "sarkaz-mercenary":
			srcParams["生理的耐性"] = 2;
			break;
		case "seaborn-abyssal":
			srcParams["生理的耐性"] = 12;
			break;
	}

	const params = [];
	for (const param in srcParams) {
		params.push({
			label: param,
			value: srcParams[param].toString(),
		});
	}

	const status = [];
	for (const st of jsonObj.data.status) {
		if (st.label === "共鳴") {
			if (convertType === "seaborn-abyssal") {
				status.push({
					label: "共鳴",
					value: Number.parseInt(st.value) >= 3 ? st.value : "3",
					max: "9",
				});
			}
			continue;
		}
		status.push(st);
	}

	switch (convertType) {
		case "sarkaz-mercenary":
			status.push(
				{
					label: "侵食度",
					value: "21",
					max: "100",
				},
				{
					label: "侵食段階",
					value: "2",
					max: "4",
				},
			);
			break;
		default:
			status.push(
				{
					label: "侵食度",
					value: "0",
					max: "100",
				},
				{
					label: "侵食段階",
					value: "0",
					max: "4",
				},
			);
	}

	return JSON.stringify({
		kind: "character",
		data: {
			...jsonObj.data,
			params,
			status,
			commands: convertCommands(jsonObj.data.commands, convertType),
		},
	});
};
