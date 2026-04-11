import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import clsx from "clsx";
import { type ReactNode, useState } from "react";

import style from "./converter.module.css";

type TextType = "ccfolia" | "commandPalette" | "unknown";
type ConvertType = "normal" | "sarkaz-mercenary" | "seaborn-abyssal";

const judgeCcfoliaOrPalette = (text: string): TextType => {
	try {
		const jsonObj = JSON.parse(text);
		if (jsonObj && jsonObj.kind === "character") {
			return "ccfolia";
		}
	} catch {}
	return "commandPalette";
};

const convertCommands = (text: string, convertType: ConvertType): string => {
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
		if (cmd.skill === "∞共鳴") {
			continue;
		}

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

const convertCcfolia = (text: string, convertType: ConvertType): string => {
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

export default function Converter(): ReactNode {
	const { siteConfig } = useDocusaurusContext();
	const [convertType, setConvertType] = useState<ConvertType>("normal");
	const [inputText, setInputText] = useState<string>("");
	const [outputText, setOutputText] = useState<string>("");
	const [copyButtonText, setCopyButtonText] = useState<string>("コピー");

	const onChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputText(event.target.value);
	};

	const handleConvert = () => {
		const textType = judgeCcfoliaOrPalette(inputText);
		switch (textType) {
			case "ccfolia":
				setOutputText(convertCcfolia(inputText, convertType));
				break;
			case "commandPalette":
				setOutputText(convertCommands(inputText, convertType));
				break;
			default:
				setOutputText("不明な形式です");
		}
	};

	const handleCopy = () => {
		navigator.clipboard
			.writeText(outputText)
			.then(() => {
				setCopyButtonText("クリップボードにコピーしました");
				setTimeout(() => {
					setCopyButtonText("コピー");
				}, 5000);
			})
			.catch((err) => {
				console.error("クリップボードへのコピーに失敗しました:", err);
			});
	};

	return (
		<Layout
			title={`コンバーター | ${siteConfig.title}`}
			description="アークナイツ×エモクロアTRPG サイド・オリパシー コンバーター"
		>
			<main>
				<section className={clsx("container", style.converter)} aria-labelledby="converter-heading">
					<h1 id="converter-heading" className={style.heading}>
						コンバーター
					</h1>
					<p className={style.instruction}>
						エモクロアTRPGのキャラクターシートから、チャットパレットまたはCCFOLIA形式でコピーしたものを貼り付けて「コンバート」を押してください。
					</p>

					<div className={style.fieldGroup}>
						<label htmlFor="input" className={style.label}>
							入力
						</label>
						<textarea
							id="input"
							className={style.textarea}
							value={inputText}
							onChange={onChangeInput}
							placeholder="CCFOLIAデータまたはチャットパレットを貼り付け"
						/>
					</div>

					<div className={style.fieldGroup}>
						<label htmlFor="convertType" className={style.label}>
							変換タイプ
						</label>
						<select
							id="convertType"
							className={style.select}
							value={convertType}
							onChange={(e) => setConvertType(e.target.value as ConvertType)}
						>
							<option value="normal">通常</option>
							<option value="sarkaz-mercenary">サルカズ傭兵</option>
							<option value="seaborn-abyssal">アビサル</option>
						</select>
					</div>

					<button type="button" className={style.convertButton} onClick={() => handleConvert()}>
						コンバート
					</button>

					<div className={style.fieldGroup}>
						<label htmlFor="output" className={style.label}>
							出力
						</label>
						<textarea
							id="output"
							className={style.textarea}
							readOnly
							value={outputText}
							aria-live="polite"
							aria-label="変換結果"
						/>
					</div>

					<button
						type="button"
						className={style.copyButton}
						onClick={() => handleCopy()}
						aria-live="polite"
					>
						{copyButtonText}
					</button>
				</section>
			</main>
		</Layout>
	);
}
