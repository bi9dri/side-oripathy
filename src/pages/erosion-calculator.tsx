import React, { useMemo, useState } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";
import style from "./erosion-calculator.module.css";

const MAX_TERMS = 60;

/**
 * 1個のd10について、4カテゴリの確率を計算する
 * - p_s:  成功のみ（≤危険度 かつ <生理的耐性）
 * - p_r:  振り足しのみ（≥生理的耐性 かつ >危険度）
 * - p_sr: 成功かつ振り足し（≤危険度 かつ ≥生理的耐性）
 * - p_n:  何も起きない（上記以外）
 */
function computePerDieProbabilities(danger: number, tolerance: number) {
	let successOnly = 0;
	let rerollOnly = 0;
	let both = 0;

	for (let v = 1; v <= 10; v++) {
		const isSuccess = v <= danger;
		const isReroll = v >= tolerance;
		if (isSuccess && isReroll) {
			both++;
		} else if (isSuccess) {
			successOnly++;
		} else if (isReroll) {
			rerollOnly++;
		}
	}

	return {
		p_s: successOnly / 10,
		p_r: rerollOnly / 10,
		p_sr: both / 10,
		p_n: (10 - successOnly - rerollOnly - both) / 10,
	};
}

/**
 * 1ダイスの総成功数（振り足し連鎖含む）の確率分布を返す
 *
 * 確率母関数: f(z) = (p_n + p_s·z) / (1 - p_r - p_sr·z)
 * 展開: α = p_sr / (1 - p_r) として
 *   P(S=0) = p_n / (1 - p_r)
 *   P(S=m) = α^(m-1) · (p_n·α + p_s) / (1 - p_r)  （m ≥ 1）
 */
function singleDieDist(danger: number, tolerance: number): number[] {
	const { p_s, p_r, p_sr, p_n } = computePerDieProbabilities(danger, tolerance);
	const dist = Array.from<number>({ length: MAX_TERMS }).fill(0);
	const denom = 1 - p_r;

	dist[0] = p_n / denom;

	if (p_sr === 0) {
		// 振り足し+成功の重複なし → 各ダイスの最大成功数は1
		if (MAX_TERMS > 1) {
			dist[1] = p_s / denom;
		}
	} else {
		const alpha = p_sr / denom;
		const coeff = (p_n * alpha + p_s) / denom;
		let alphaPow = 1;
		for (let m = 1; m < MAX_TERMS; m++) {
			dist[m] = alphaPow * coeff;
			alphaPow *= alpha;
			if (alphaPow < 1e-12) {
				break;
			}
		}
	}

	return dist;
}

/** 多項式の積（上位の項はMAX_TERMSで切り捨て） */
function polyMultiply(a: number[], b: number[]): number[] {
	const len = Math.min(a.length + b.length - 1, MAX_TERMS);
	const result = Array.from<number>({ length: len }).fill(0);
	for (let i = 0; i < a.length; i++) {
		if (a[i] === 0) {
			continue;
		}
		for (let j = 0; j < b.length && i + j < MAX_TERMS; j++) {
			result[i + j] += a[i] * b[j];
		}
	}
	return result;
}

/** 多項式の累乗（繰り返し二乗法） */
function polyPow(a: number[], n: number): number[] {
	if (n === 0) {
		return [1];
	}
	if (n === 1) {
		return a;
	}
	const half = polyPow(a, Math.floor(n / 2));
	const squared = polyMultiply(half, half);
	return n % 2 === 0 ? squared : polyMultiply(squared, a);
}

/** 確率分布と期待値を計算する */
function calcDistribution(erosionLevel: number, tolerance: number, danger: number) {
	const numDice = Math.floor(erosionLevel / 5) + 1;
	const singleDist = singleDieDist(danger, tolerance);
	const totalDist = polyPow(singleDist, numDice);

	let expectedValue = 0;
	for (let i = 0; i < totalDist.length; i++) {
		expectedValue += i * totalDist[i];
	}

	return { dist: totalDist, numDice, expectedValue };
}

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
