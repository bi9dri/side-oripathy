import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./index.module.css";

export default function Home(): ReactNode {
	const { siteConfig } = useDocusaurusContext();
	return (
		<Layout
			title={`${siteConfig.title}`}
			description="アークナイツ×エモクロアTRPG サイド・オリパシー"
		>
			<main className={styles.terminal} role="main">
				<div className={styles.terminalFrame}>
					<header className={styles.terminalHeader}>
						<span className={styles.systemLabel} aria-hidden="true">
							RHODES ISLAND // TERMINAL ACCESS
						</span>
						<span className={styles.statusIndicator} aria-hidden="true">
							<span className={styles.statusDot} />
							SYSTEM ONLINE
						</span>
					</header>
					<div className={styles.terminalBody}>
						<Heading as="h1" className={clsx(styles.title, "prts-reveal")}>
							{siteConfig.title}
						</Heading>
						<p className={clsx(styles.subtitle, "prts-fade-in")}>{siteConfig.tagline}</p>
						<p className={clsx(styles.description, "prts-fade-in")}>
							エモクロアTRPGでアークナイツの世界を冒険するための追加ルール
						</p>
						<nav
							className={clsx(styles.buttons, "prts-fade-in")}
							aria-label="メインナビゲーション"
						>
							<Link
								className={clsx("button button--primary button--lg", styles.ctaButton)}
								to="/docs/intro"
							>
								ルールを読む
							</Link>
							<Link
								className={clsx("button button--secondary button--lg", styles.ctaButton)}
								to="/converter"
							>
								キャラクターをコンバートする
							</Link>
						</nav>
					</div>
				</div>
			</main>
		</Layout>
	);
}
