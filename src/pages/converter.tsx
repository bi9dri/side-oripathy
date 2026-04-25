import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import clsx from "clsx";
import { type ReactNode, useState } from "react";

import {
	type ConvertType,
	convertCcfolia,
	convertCommands,
	judgeCcfoliaOrPalette,
} from "../lib/converter";
import style from "./converter.module.css";

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
