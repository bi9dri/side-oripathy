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

export const convertCommands = (text: string, convertType: ConvertType): string => {
	const srcCommands = text.split("\n").filter((cmd) => cmd.indexOf("∞共鳴") === -1);
	const commandsMap: {
		skill: string;
		level: string;
		judge: string;
	}[] = [];
	for (const cmd of srcCommands) {
		const m = cmd.match(/(\d+)DM<=(\d+)\s〈(.*?)〉/);
		if (m) {
			commandsMap.push({
				skill: m[3],
				level: m[1],
				judge: m[2],
			});
		}
	}

	const commands = [];
	for (const cmd of commandsMap) {
		/* 運動系技能 */
		if (
			["＊運動", "スピード", "ストレングス", "アクロバット", "ダイブ", "＊格闘", "＊投擲"].includes(
				cmd.skill,
			) ||
			cmd.skill.startsWith("武術") ||
			cmd.skill.startsWith("★奥義") ||
			cmd.skill.startsWith("★射撃")
		) {
			switch (convertType) {
				case "sarkaz-mercenary":
					commands.push(`${cmd.level}DM<=${cmd.judge} 〈${cmd.skill}〉`);
					break;
				case "seaborn-abyssal":
					commands.push(`(${cmd.level}+1)DM<=${cmd.judge} 〈${cmd.skill}〉`);
					break;
				default:
					commands.push(`${cmd.level}DM<=(${cmd.judge}-({侵食段階}*4/5R)) 〈${cmd.skill}〉`);
			}
			continue;
		}

		/* アーツ */
		if (cmd.skill.startsWith("アーツ")) {
			switch (convertType) {
				case "seaborn-abyssal":
					commands.push(`${cmd.level}DM<=${cmd.judge} 〈${cmd.skill}〉`);
					break;
				default:
					commands.push(`${cmd.level}DM<=(${cmd.judge}+(({侵食段階}-1)*2/3C)) 〈${cmd.skill}〉`);
			}
			continue;
		}

		/* その他の技能 */
		switch (convertType) {
			case "seaborn-abyssal":
				commands.push(`${cmd.level}DM<=${cmd.judge} 〈${cmd.skill}〉`);
				break;
			default:
				commands.push(`${cmd.level}DM<=(${cmd.judge}-(({侵食段階}-1)*2/3R)) 〈${cmd.skill}〉`);
		}
	}

	if (convertType === "seaborn-abyssal") {
		commands.unshift("({共鳴}*2)DM<={強度} 〈∞共鳴〉 完全一致");
	}

	commands.unshift("({侵食度}/5F+1)R10[>={生理的耐性}]<={危険度} 〈源石侵食判定〉");

	return commands.join("\n");
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
