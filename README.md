# アークナイツ×エモクロアTRPG サイド・オリパシー

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-success)](https://side-oripathy.bidri.dev)
[![License](https://img.shields.io/github/license/bi9dri/side-oripathy)](https://side-oripathy.bidri.dev/docs/licence)

## 概要

『アークナイツ×エモクロアTRPG サイド・オリパシー』は、スマートフォンゲーム『アークナイツ』の世界観を使った[エモクロアTRPG](https://emoklore.com/)の追加ルールです。このプロジェクトは、そのルールブックと各種ツールを公開するドキュメントサイトです。

### 主な機能

- **📖 ルールドキュメント**: アークナイツの世界観に基づいたエモクロアTRPGの追加ルール
- **🔄 キャラクターシートコンバーター**: 既存のキャラクターシートを「サイド・オリパシー」用に変換
  - CCFOLIA形式に対応
  - チャットパレット形式に対応

## サイトへのアクセス

**🌐 公開サイト: [https://side-oripathy.bidri.dev](https://side-oripathy.bidri.dev)**

ルールブックの閲覧やキャラクターシートの変換は上記サイトから直接行えます。

## フィードバック・問い合わせ

**💬 報告、質問、提案などは[Issues](https://github.com/bi9dri/side-oripathy/issues)までお気軽にどうぞ**


---

## 開発者向け情報

このプロジェクトは[Docusaurus](https://docusaurus.io/)を使った静的サイトジェネレーターです。

### 必要な環境

- [Bun](https://bun.sh/) 1.3.8以上（パッケージマネージャー）
- Node.js互換ランタイム

### セットアップ

```bash
# 依存パッケージのインストール
bun install
```

### 開発コマンド

```bash
# 開発サーバーの起動（http://localhost:3000）
bun run start

# プロダクションビルド
bun run build

# ビルド済みサイトのプレビュー
bun run serve

# コードの品質チェック
bun run --bun lint       # Lintチェック
bun run --bun format     # フォーマット
bun run --bun typecheck  # 型チェック

# 依存パッケージのアップデート確認
bun run --bun ncu
```

### プロジェクト構成

```
.
├── docs/              # Markdownによるルールドキュメント
├── src/
│   ├── pages/         # Reactページコンポーネント
│   │   └── converter.tsx  # キャラクターシートコンバーター
│   └── components/    # 再利用可能なMDXコンポーネント
├── static/            # 静的アセット（画像など）
├── docusaurus.config.ts  # Docusaurus設定ファイル
└── sidebars.ts        # サイドバー自動生成設定
```

### デプロイ

`main`ブランチへのプッシュで、GitHub Actionsを通じて自動的にGitHub Pagesへデプロイされます。

### 技術スタック

- **フレームワーク**: Docusaurus
- **UI**: React
- **言語**: TypeScript
- **ランタイム**: Bun
- **Linter/Formatter**: oxlint (with type-check) / oxfmt
- **デプロイ**: GitHub Pages

### コントリビューション

プルリクエストを歓迎します。大きな変更を行う場合は、まずissueを作成して変更内容について議論してください。

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトのライセンスについては、[LICENSE](https://side-oripathy.bidri.dev/docs/licence)を参照してください。

## クレジット

- **アークナイツ**: © Hypergryph / Studio Montagne / Yostar
- **エモクロアTRPG**: [emoklore.com](https://emoklore.com/)
- Built with [Docusaurus](https://docusaurus.io/)
