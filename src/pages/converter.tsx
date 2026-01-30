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
	} catch (e) {}
	return "commandPalette";
};

const convertCommands = (text: string): string => {
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
		if (
			["＊運動", "スピード", "ストレングス", "アクロバット", "ダイブ", "＊格闘", "＊投擲"].includes(
				cmd.skill,
			) ||
			cmd.skill.startsWith("武術") ||
			cmd.skill.startsWith("★奥義") ||
			cmd.skill.startsWith("★射撃")
		) {
			commands.push(`${cmd.level}DM<=(${cmd.judge}-({侵食段階}*4/5R)) 〈${cmd.skill}〉`);
			continue;
		}
		if (cmd.skill.startsWith("アーツ")) {
			commands.push(`${cmd.level}DM<=(${cmd.judge}+(({侵食段階}-1)*2/3C)) 〈${cmd.skill}〉`);
			continue;
		}
		commands.push(`${cmd.level}DM<=(${cmd.judge}-(({侵食段階}-1)*2/3R)) 〈${cmd.skill}〉`);
	}
	commands.unshift("({侵食度}/{生理的耐性}F+1)DM<= 〈源石侵食判定〉");

	return commands.join("\n");
};

const convertCcfolia = (text: string): string => {
	const jsonObj = JSON.parse(text);

	const srcParams = {};
	for (const param of jsonObj.data.params) {
		srcParams[param.label] = Number.parseInt(param.value);
	}
	// biome-ignore lint/complexity/useLiteralKeys: unicode keys
	srcParams["生理的耐性"] = srcParams["身体"] + srcParams["運勢"];

	const params = [];
	for (const param in srcParams) {
		params.push({
			label: param,
			value: srcParams[param].toString(),
		});
	}

	const status = [];
	for (const st of jsonObj.data.status) {
		if (st.label === "共鳴") continue;
		status.push(st);
	}
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

	return JSON.stringify({
		kind: "character",
		data: {
			...jsonObj.data,
			params,
			status,
			commands: convertCommands(jsonObj.data.commands),
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
		if (textType === "ccfolia") {
			setOutputText(convertCcfolia(inputText));
		} else if (textType === "commandPalette") {
			setOutputText(convertCommands(inputText));
		} else {
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
				<div className={clsx("container", style.converter)}>
					<p>
						エモクロアTRPGのキャラクターシートから、チャットパレットまたはCCFOLIA形式でコピーしたものを上に貼り付けて「コンバート」を押してください。
					</p>
					<textarea
						id="input"
						className={style.textarea}
						value={inputText}
						onChange={onChangeInput}
					/>
					<select
						id="convertType"
						className={style.select}
						value={convertType}
						onChange={(e) => setConvertType(e.target.value as ConvertType)}
					>
						<option value="normal">通常</option>
						<option value="sarkaz-mercenary">サルカズ傭兵（未対応）</option>
						<option value="seaborn-abyssal">アビサル（未対応）</option>
					</select>
					<button
						type="button"
						id="convert"
						className="button button--primary button--lg"
						onClick={() => handleConvert()}
					>
						コンバート
					</button>
					<textarea id="output" className={style.textarea} readOnly value={outputText} />
					<button
						type="button"
						id="copy"
						className="button button--secondary button--lg"
						onClick={() => handleCopy()}
					>
						{copyButtonText}
					</button>
				</div>
			</main>
		</Layout>
	);
}
