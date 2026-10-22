# 0002 - VRT baseline をリポジトリで管理する

- Status: Proposed
- Date: 2026-10-22
- Supersedes: [0001 - テスト戦略](./0001-test-strategy.md) のうち Visual Regression の基盤に Argos CI を使う決定

## Context

[0001](./0001-test-strategy.md) では Visual Regression の基盤に [Argos CI](https://argos-ci.com) を採用した。Docusaurus 公式と同じ構成で PR コメント UX も良く、baseline をリポジトリに置かずに済む点が決め手だった。

しかし実際に運用すると、このリポジトリの VRT は 4 ページ × 4 variants 程度しかなく、Argos の比較・レビュー機能に対して以下のコストが見合わなくなった。

- `ARGOS_TOKEN` の管理と、token 欠落時に spec を fail させる特別扱い
- スクリーンショットの upload step と、comparison の合否が Argos 側の GitHub チェックに依存する構造
- default branch で build が走るまで PR に baseline が無い (orphan build) ため、最初の PR で比較できない
- SaaS の無料枠・pricing 変更リスク

Playwright 標準の `expect(page).toHaveScreenshot()` は、baseline をリポジトリにコミットするだけで同一の比較ができる。baseline の総量も数十枚・数 MB 程度に収まる見込みで、git 管理のコストは無視できる。

## Decision

### 1. Argos を廃止し、Playwright 標準のスナップショット比較に戻す

`@argos-ci/playwright` / `@argos-ci/cli` への依存を削除し、`argosScreenshot()` を `expect(page).toHaveScreenshot()` に置き換える。撮影中だけ適用する CSS は `tests/visual/vrt.css` に置き、`expect.toHaveScreenshot.stylePath` から読み込む。

### 2. baseline は `{platform}` 付きでリポジトリにコミットする

`snapshotPathTemplate` に `{projectName}` と `{platform}` を含め、viewport × theme × OS ごとにファイルを分ける。コミットするのは CI (Linux) が生成する `-linux.png` のみとし、`-win32.png` / `-darwin.png` は `.gitignore` で除外する。ローカル描画はフォントに依存するため、比較の正はあくまで Linux。

差分しきい値は `maxDiffPixels: 100` (画像サイズに依存しない絶対値) とする。

### 3. baseline の更新は `main` の CI が行う

- PR: 比較のみ。差分があれば job が失敗し、`vrt-diff` artifact (HTML レポート + trace) をアップロードする
- 意図した差分: PR に `vrt:accepted` ラベルを付ける。`labeled` イベントで job が再実行され、ラベルを検出したら比較をスキップして成功し、ラベルを消費する。承認後に積んだコミットは改めて検証される
- `main`: `--update-snapshots` で再生成し、別 job (`vrt-baselines`) が ruleset の bypass に登録した deploy key で baseline だけを `[skip ci]` 付きで push する。`GITHUB_TOKEN` は `contents: read` のまま

deploy key を使うのは、ruleset の bypass が actor 単位で GitHub Actions を指定できないため。PR コードを実行する job に push 権限を渡さないよう、コミットは別 job に分離する。

### 4. 承認フローは同一リポジトリのブランチに限定する

fork PR では `GITHUB_TOKEN` が read-only になりラベルを外せない。fork PR の意図した差分は、メンテナが Linux で `test/visual/e2e:update` を実行して baseline を含めるか、マージ後の `main` 自動更新に任せる。

## Consequences

### Positive

- SaaS への依存と token 管理が消え、比較ロジックが Playwright に一本化される
- PR の時点で baseline が必ず存在し、orphan build の待ちが無くなる
- 差分レビューが `vrt-diff` artifact (expected / actual / diff) で完結する
- 意図した差分の承認と baseline 更新が、ラベル 1 つで完結する

### Negative

- baseline PNG がリポジトリに入る (現状のスイートで数 MB 程度)
- `@playwright/test` や Chromium の更新で全 baseline が一斉に変わるため、Renovate PR で `vrt:accepted` を付けて `main` で再生成する運用が必要
- Linux 以外の環境では初回実行が全滅する (platform 別 baseline が無いため)

### Neutral

- ruleset に baseline 更新 job 用の deploy key bypass と、`vrt` の status check を追加する必要がある
- リポジトリに `vrt:accepted` ラベルを作成する必要がある

## References

- [Argos CI](https://argos-ci.com/)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright `snapshotPathTemplate`](https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template)
