# Architecture Decision Records (ADR)

このディレクトリには本プロジェクトにおけるアーキテクチャ上の意思決定を記録する ADR を格納する。

## 運用方針

- フォーマット: [MADR](https://adr.github.io/madr/) 風の軽量 Markdown
- ファイル命名: `NNNN-kebab-case-title.md` (例: `0001-test-strategy.md`)
- 連番は重複させない。破棄された ADR も番号は欠番にせず残す
- Status フィールド: `Proposed` → `Accepted` → `Deprecated` / `Superseded by #NNNN`
  - PR マージ後に `Proposed` から `Accepted` へ手動更新する
- 意思決定を覆す場合は既存 ADR を書き換えず、新しい ADR を起票して Supersede する

## 配置理由

リポジトリ直下に配置することで Docusaurus のサイドバー (`docs/` 配下) に露出させず、一般読者向けドキュメントと開発者向け意思決定記録を分離している。

## 索引

- [0001 - テスト戦略](./0001-test-strategy.md) — テストピラミッドの方針、テストランナー選定、モック方針、カバレッジ目標、Phase 分割 (Proposed)
