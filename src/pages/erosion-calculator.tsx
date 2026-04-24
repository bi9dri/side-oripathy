import React, { useMemo, useState } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";
import style from "./erosion-calculator.module.css";

import { calcDistribution } from "../lib/erosion-calculator";

export default function ErosionCalculator(): React.ReactElement {
	const { siteConfig } = useDocusaurusContext();
	const [erosionLevel, setErosionLevel] = useState(0);
	const [tolerance, setTolerance] = useState(6);
	const [danger, setDanger] = useState(3);

	const { dist, numDice, expectedValue } = useMemo(
		() => calcDistribution(erosionLevel, tolerance, danger),
		[erosionLevel, tolerance, danger],
	);

	const maxProb = Math.max(...dist);
	const displayRows = dist
		.map((prob, count) => ({ count, prob }))
		.filter(({ prob }) => prob >= 0.001);

	const bcdiceCommand = `${numDice}R10[>=${tolerance}]<=${danger}`;

	return (
		<Layout
			title={`源石侵食判定計算機 | ${siteConfig.title}`}
			description="侵食度・生理的耐性・危険度を入力して、源石侵食判定の成功数ごとの確率を計算します。"
		>
			<main>
				<section className={clsx("container", style.calculator)}>
					<h1 className={style.heading}>源石侵食判定計算機</h1>
					<p className={style.instruction}>
						侵食度・生理的耐性・危険度を入力すると、源石侵食判定の成功数（侵食度の上昇値）になる確率を一覧表示します。
					</p>

					<div className={style.inputGrid}>
						<div className={style.fieldGroup}>
							<label className={style.label} htmlFor="erosionLevel">
								侵食度
							</label>
							<input
								id="erosionLevel"
								className={style.input}
								type="number"
								min={0}
								max={100}
								value={erosionLevel}
								onChange={(e) =>
									setErosionLevel(Math.max(0, Math.min(100, Number(e.target.value))))
								}
							/>
							<span className={style.hint}>0〜100</span>
						</div>

						<div className={style.fieldGroup}>
							<label className={style.label} htmlFor="tolerance">
								生理的耐性
							</label>
							<input
								id="tolerance"
								className={style.input}
								type="number"
								min={2}
								max={12}
								value={tolerance}
								onChange={(e) => setTolerance(Math.max(2, Math.min(12, Number(e.target.value))))}
							/>
							<span className={style.hint}>2〜12（【身体】+【運勢】）</span>
						</div>

						<div className={style.fieldGroup}>
							<label className={style.label} htmlFor="danger">
								危険度
							</label>
							<input
								id="danger"
								className={style.input}
								type="number"
								min={1}
								max={10}
								value={danger}
								onChange={(e) => setDanger(Math.max(1, Math.min(10, Number(e.target.value))))}
							/>
							<span className={style.hint}>1〜10（ディーラーが指定）</span>
						</div>
					</div>

					<div className={style.commandBlock}>
						<span className={style.commandLabel}>BCDiceコマンド</span>
						<code className={style.command}>{bcdiceCommand}</code>
						<span className={style.commandMeta}>
							ダイス数: {numDice}個（侵食度{erosionLevel}÷5切り捨て+1）
						</span>
					</div>

					<div className={style.resultSection}>
						<h2 className={style.subheading}>確率分布</h2>
						<p className={style.expectedValue}>
							期待値: <strong>{expectedValue.toFixed(2)}</strong>
						</p>

						<div className={style.tableWrapper}>
							<table className={style.table}>
								<thead>
									<tr>
										<th className={style.tdCount}>成功数（侵食度上昇量）</th>
										<th className={style.tdProb}>確率</th>
										<th className={style.tdBar} />
									</tr>
								</thead>
								<tbody>
									{displayRows.map(({ count, prob }) => (
										<tr key={count}>
											<td className={style.tdCount}>{count}</td>
											<td className={style.tdProb}>{(prob * 100).toFixed(1)}%</td>
											<td className={style.tdBar}>
												<div
													className={style.bar}
													style={{
														width: `${(prob / maxProb) * 100}%`,
													}}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</main>
		</Layout>
	);
}
