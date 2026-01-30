# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

アークナイツ×エモクロアTRPG「サイド・オリパシー」の追加ルールを公開するDocusaurusベースのドキュメントサイト。日本語のTRPGルールブックとキャラクターシートコンバーターを提供している。

## 開発コマンド

```bash
# パッケージマネージャー: bun (v1.3.8)
bun install          # 依存関係のインストール
bun run start        # 開発サーバー起動
bun run build        # プロダクションビルド（buildディレクトリに出力）
bun run serve        # ビルド済みサイトのプレビュー

# 品質チェック（oxlint/oxfmtはbunランタイムで実行）
bun run --bun lint      # oxlintによるリント
bun run --bun format    # oxfmtによるフォーマット
bun run --bun typecheck # 型チェック
```

## アーキテクチャ

- **docs/**: Markdownによるルールドキュメント（サイドバーは`sidebars.ts`で自動生成）
- **src/pages/converter.tsx**: CCFOLIAおよびチャットパレット形式のキャラクターシートを「サイド・オリパシー」用に変換するコンバーター
- **src/components/**: ドキュメント内で使用するMDXコンポーネント（`Expression`、`Memo`）

## コーディング規約

- フォーマッタはoxfmt、リンターはoxlintを使用
- インデントはタブ（`.oxfmtrc.json`で設定）
- CSS、JSON、Markdown、YAMLファイルはフォーマット対象外

## デプロイ

mainブランチへのプッシュでGitHub Pagesに自動デプロイされる。
