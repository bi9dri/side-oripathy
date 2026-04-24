# 0001 - テスト戦略

- Status: Proposed
- Date: 2026-04-25
- Issue: [#76](https://github.com/bi9dri/side-oripathy/issues/76)

## Context

本リポジトリは Docusaurus 3.9.2 製の静的サイトで、`main` への push が GitHub Pages に自動デプロイされる。そのため **`bun run build` を通過した変更でも描画が壊れていれば即本番障害** に繋がる。現在テストコードは一切存在せず、依存更新スキル (`.claude/skills/update-dependencies/SKILL.md`) の検証も `typecheck` / `lint` / `format` / `build` のみで、以下のリスクを捕捉できていない。

- `src/pages/converter.tsx` の CCFOLIA / チャットパレット変換ロジック回帰
- MDX コンポーネント (`src/components/expression.tsx`, `memo.tsx`) の描画回帰
- 依存更新に伴う UI 表示崩れ (ビルド成功でも描画が破綻するケース)
- TRPG ルール解説文の用語ゆれ、冗長表現、文体混在、リンク rot

本プロジェクトは **静的コンテンツが大半を占め、UI/UX と文章そのものが品質の中核** である。ゆえに古典的テストピラミッド (単体テストを底辺に積み重ねる形) は当プロジェクトの性質に合わず、「ロジックは薄く、プレゼンテーションと文章に厚くゲートを敷く」戦略が ROI 的に有利となる。

本 ADR は Issue #76 Phase 0 の成果物として、テスト戦略全体を定める。個別 Phase の実装は別 PR / 別セッションで進める。

## Decision

### 1. テスト戦略は 3 軸並列構造を採用

本プロジェクトのテストは以下 3 軸を **並列に独立した品質ゲート** として扱う。古典的ピラミッドの「層の比率」は採用しない。Docusaurus 公式も視覚回帰について同様の考え方で運用している ([Upgrading frontend dependencies with confidence using VRT](https://docusaurus.io/blog/upgrading-frontend-dependencies-with-confidence-using-visual-regression-testing))。

#### 軸 1: Testing Trophy (ロジック品質)

[Kent C. Dodds - The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) の考え方に基づき、以下を担保する。

- **Static**: TypeScript strict + oxlint (既存)
- **Unit**: `src/pages/converter.tsx` から抽出する純粋関数 3 本 (`judgeCcfoliaOrPalette`, `convertCommands`, `convertCcfolia`) の入力/出力検証
- **Integration**: converter UI の入力→変換→出力フロー (Playwright、Phase 4)
- **E2E**: 主要導線 (トップ / converter / 主要 rule ページ) の最小限の到達確認 (Playwright、Phase 3 に含む)

#### 軸 2: Content Quality Gates (文章品質) — 編集者の校正/推敲の自動化

TRPG ルール解説が中核であるため、文章そのものの品質を独立の軸として扱う。

- **Prose lint**: `textlint` + `textlint-plugin-mdx` + `textlint-rule-preset-ja-technical-writing` + `textlint-rule-no-mix-dearu-desumasu`
  - Docusaurus v3 は `.md` も MDX 扱いとなるため `textlint-plugin-mdx` が必須
  - `<Expression>` / `<Memo>` など MDX コンポーネント箇所は必要に応じて `<!-- textlint-disable -->` で除外
- **将来拡張**: `textlint-rule-prh` (プロジェクト固有用語辞書、内容は別作業で蓄積) + reviewdog による PR コメント
- **Link rot**: `lychee` で外部リンク切れを検出
- **却下ツールと理由**:
  - **Vale**: 日本語 morphology に非対応 (長年の "goal" で未達)
  - **RedPen**: 2020 以降 dormant、JVM 依存も過剰
  - **cspell**: whitespace tokenizer で日本語不適
  - **jReadability を CI fail ゲート化**: L2 学習者向け設計で native 文章に対して過剰判定になる。メトリクスとして追跡するのは可、ゲートとして使うのは不可

#### 軸 3: Visual Quality Gates (表示品質)

静的サイト表示そのものの品質を担保する。

- **Visual Regression**: Playwright + [Argos CI](https://argos-ci.com) (無料枠 5,000 snapshots / 月、Docusaurus 公式も採用)
  - 背景: OSS 小規模プロジェクトでは Argos が "Docusaurus 公式と同じ構成" となり、PR コメント UX も良好
- **Accessibility**: `@axe-core/playwright` を E2E 実行内で同時にチェック
- **Performance / SEO / Best practices**: Lighthouse CI (`@lhci/cli`) で PR に budget チェック

### 2. Phase 分割 (元 Issue から見直し)

| Phase | 内容 | PR 粒度 |
|---|---|---|
| 0 | 本 ADR | 本 PR |
| 1 | `bun test` セットアップ + `src/lib/converter/` へのロジック抽出 + 単体テスト + `test` スクリプト追加 | 1 PR |
| 2 | **Content Quality Gates 導入** — textlint Tier 1 (preset-ja-technical-writing + plugin-mdx + no-mix-dearu-desumasu) + lychee、**最初はローカル実行のみ** → Tier 2 (prh 用語辞書 + reviewdog PR コメント) へ段階導入 | 1 PR (Tier 1/2 で分割可) |
| 3 | **Visual Quality Gates 導入** — Playwright + Argos CI + `@axe-core/playwright` + Lighthouse CI。実装ボリューム大のため独立、最初はローカル実行のみ → 段階的に CI 化 | 1 PR (必要なら更に小分け) |
| 4 | UI 結合テスト + `.claude/skills/update-dependencies/SKILL.md` 検証チェーン更新 + `CLAUDE.md` / `README` コマンド追記 | 1 PR |
| 5 (別 issue) | Quality スコア可視化 (PR コメント vs 公開ダッシュボード vs 非公開ダッシュボード) | 別 issue で検討 |

#### 元 Issue #76 からの変更点

- **元 Issue Phase 4 (「E2E/視覚回帰を別 Issue へ切り出す」) は取り下げ**、本 ADR Phase 3 に格上げした
  - 理由: 本プロジェクトの品質中核は UI/UX + 文章であり、視覚回帰は付随物ではなく本丸
- **Content Quality Gates (軸 3) を新規追加** し、Phase 2 として Visual より先に配置した
  - 理由: (1) textlint Tier 1 は実装 2–3 時間の軽量作業 (2) 既存ドキュメントの誤用を即検出できる高 ROI (3) Visual は Playwright + Argos の構築が重く独立スコープが妥当
- Phase 1 と Phase 2 / 3 は独立で並行可。ただし **Phase 1 を先行する** ことを推奨 (ロジックが薄くて早期に終わり、Phase 4 の結合テスト基盤として流用できる)

### 3. テストランナーは `bun test` を採用 (エスケープハッチあり)

- **採用**: `bun test`
  - 追加依存ゼロ (Bun 1.3.9 が既にパッケージマネージャ、`@types/bun` 導入済)
  - Jest 互換 API のため将来の移行コストが低い
  - TypeScript をネイティブ実行、`bun test --coverage` でカバレッジ取得可
- **却下**:
  - **Vitest**: Docusaurus は webpack ベースで Vite 連携の恩恵なし、追加依存が管理負債
  - **Jest**: TypeScript transformer 必須、Bun 環境との親和性が低く設定重量級
- **撤退条件**: 以下のいずれかに該当した場合は再検討し、別 ADR (0002 以降) を起票する
  1. 3 件以上の互換性回避策が必要になったとき (例: `@testing-library/react` 非互換、snapshot 形式差、mock API 挙動差異)
  2. `bun test --coverage` が CI で要求されるレポート形式を出せないとき
  3. GitHub Actions 上で bun test 特有のフレークが頻発するとき
- **付随決定**:
  - `.oxlintrc.json:28-30` の `vitest` 設定は Phase 1 で削除する (未使用のため)
  - DOM が必要になった時点で `happy-dom` を追加依存として導入する
  - Phase 3 の Playwright / LHCI / axe、Phase 2 の textlint / lychee は独立ツールチェーンであり、本決定の影響範囲外

### 4. モック方針 — 観測可能な振る舞いをテストする

| 対象 | モック可否 | 備考 |
|---|---|---|
| 純粋関数 (converter ロジック 3 本) | **不可** | 入力/出力で完結、モックしたら何もテストしていないに等しい |
| `navigator.clipboard` 等ブラウザ API | **必要時のみスタブ** | Playwright 実ブラウザ実行時は不要 |
| 時刻 (`Date.now` / `setTimeout`) | **必要時のみ** | `handleCopy` の 5 秒後リセット等で必要なら Bun の `setSystemTime` / fake timers |
| `fetch` / 外部 API | **現状 N/A** | 現時点で外部 API 呼び出しなし。将来追加時は MSW 等で network レベルスタブを基本とする |
| React hooks 単体 | **不可** | 内部状態は `@testing-library` の「ユーザ視点」で検証する |
| `useDocusaurusContext` 等 Docusaurus hook | **結合テスト時のみ** | Playwright 実ブラウザ実行なら不要 |

#### 禁止事項

- **カバレッジ稼ぎ目的のモック** (呼び出し確認のみでアサーション空、等)
- **「モックしたら通った」で満足すること** — 依存更新時の回帰検知が目的であり、モックで隠蔽すると意味を失う
- **実装詳細のモック** (private 関数、内部変数) — public API のみをテスト対象とする

#### PR レビュー基準

新規テストに mock が含まれる場合、レビュアは以下 3 点を確認する。

1. なぜモックが必要かコメント等で説明されているか (外部 API / 時刻 / 副作用の隔離、のいずれか)
2. モック先が実装詳細ではなく、public API 境界であるか
3. モックなしで書き直せないか 1 度考え直したか

### 5. カバレッジ目標 80% (目安、CI 強制しない)

- **分母**: `src/lib/**` (Phase 1 で抽出するロジック) および将来追加される純粋ロジックモジュール
- **除外対象** (VRT / ビルド成功で担保するため):
  - `src/pages/**` (React ルーティング / ページ)
  - `src/components/**` (MDX 用 presentational)
  - `src/theme/**` (存在すれば Docusaurus swizzle)
  - `*.d.ts` / 型定義のみのファイル
  - `docusaurus.config.ts`, `sidebars.ts`
  - `scripts/**` (ビルドスクリプト類)
- **80% の根拠**:
  - 100% にしない理由: 残り 20% の獲得コストが指数関数的、かつ意味のないアサーションによる数字稼ぎ inflation を招く
  - 80% は業界一般の実用線であり、converter ロジック 3 本のゴールデンパス + 主要エッジケースで自然に到達する水準
- **運用**:
  - 厳守ではなく **目安**。Phase 1 時点では CI で強制 fail にしない
  - PR 単位で低下した場合は PR 本文で理由を記載する
  - CI 強制化の是非は Phase 1 完了後に再検討する
  - レポート形式 (lcov 等) は本 ADR では指定せず、Phase 1 実装時に必要に応じて決定する

### 6. Quality 可視化は段階的に導入する

- **定量化は Phase 2 / 3 で達成する** (textlint / lychee / LHCI / Argos / axe の標準機能により、PR 単位の数値ゲートは最小コストで実現できる)
  - **初期はローカル実行のみ** とし、CI 化は段階的に移行する (textlint Tier 1 → Tier 2、Visual もローカル → CI の順)
- **可視化手段の選定は Phase 5 (別 Issue) で行う**。現時点の候補:
  - 候補 1: PR コメント方式 (LHCI / Argos / reviewdog 標準機能、実装ほぼゼロ)
  - 候補 2: 公開ページ `/quality` (LHCI JSON を蓄積してスコア推移を可視化、TRPG 読者層のニーズは薄い)
  - 候補 3: 非公開ダッシュボード (LHCI server 自前ホスト等、運用コスト重)
- **本 ADR の結論**: 段階を踏む。まずローカル実行のみ → PR コメント → 公開ダッシュボードの順で必要性を評価する

### 7. ADR の配置場所はリポジトリ直下 `adr/`

- **却下案**:
  - `docs/adr/`: Docusaurus サイドバーに載ってしまい `sidebars.ts` の調整が必要、かつ一般読者向け情報ではないため不適
  - `.claude/adr/`: Claude 固有ツール設定と混在し、一般的な ADR 慣習 (`adr/` or `docs/adr/`) からも外れる
  - `docs/decisions/`: 同様にサイドバー露出問題
- **採用**: `adr/` (リポジトリ直下)
  - サイト非公開、一般的な ADR 配置慣習に準拠、ツール類と独立したトップレベル

## Consequences

### Positive

- 依存更新時の回帰検知力が向上し、自動デプロイに対する安心感が高まる
- UI/UX + 文章品質の両面で回帰を自動検知できる
- converter ロジックに対する refactor 耐性が確保される
- 編集者による校正作業の一部を自動化できる
- PR 単位で品質メトリクスが定量化される

### Negative

- Phase 1 〜 4 の初期整備コストが発生する
- テストおよび textlint ルールの保守コストが増える
- Argos CI など SaaS への依存が増える (無料枠の範囲内だが、将来的な pricing 変更リスクは残る)
- textlint 導入初期は既存ドキュメントへの指摘が多くなり、ルール調整とのトレードオフが発生する

### Neutral

- Quality 可視化手段の決定は別 Issue (Phase 5) に持ち越す
- `bun test` 撤退条件に該当した場合は別 ADR を起票する
- `textlint-rule-prh` の用語辞書内容は本 ADR では決めず、別作業で蓄積する

## References

- [Issue #76 - テスト戦略の策定とテストコード導入](https://github.com/bi9dri/side-oripathy/issues/76)
- [Kent C. Dodds - The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Docusaurus Blog - Upgrading frontend dependencies with confidence using Visual Regression Testing](https://docusaurus.io/blog/upgrading-frontend-dependencies-with-confidence-using-visual-regression-testing)
- [Argos CI](https://argos-ci.com/)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [textlint](https://textlint.org/) / [textlint-rule-preset-ja-technical-writing](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing)
- [lychee](https://github.com/lycheeverse/lychee)
- [MADR - Markdown Any Decision Records](https://adr.github.io/madr/)
