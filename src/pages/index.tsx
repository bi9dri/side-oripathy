import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./index.module.css";
import Translate, { translate } from "@docusaurus/Translate";

export default function Home(): ReactNode {
	const { siteConfig } = useDocusaurusContext();
	return (
		<Layout
			title={`${siteConfig.title}`}
			description={translate({ message: "アークナイツ×エモクロアTRPG サイド・オリパシー" })}
		>
			<main className={clsx("hero hero--primary", styles.heroBanner)}>
				<div className="container">
					<Heading as="h1" className="hero__title">
						{translate({ message: siteConfig.title })}
					</Heading>
					<p className="hero__subtitle">{translate({ message: siteConfig.tagline })}</p>
					<div className={styles.buttons}>
						<Link
							className="button button--secondary button--lg"
							to="/docs/intro"
						>
							<Translate>ルールを読む</Translate>
						</Link>
						<Link
							className="button button--secondary button--lg"
							to="/converter"
						>
							<Translate>キャラクターをコンバートする</Translate>
						</Link>
					</div>
				</div>
			</main>
		</Layout>
	);
}
