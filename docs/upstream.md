# Upstream とローカル変更

確認日: 2026-10-07。GitHub API から取得したソースを Git blob hash と照合しています。

## 今回取り込んだもの

すべて [mizchi/skills の固定コミット](https://github.com/mizchi/skills/tree/62f580819410cb1d398e4d7f234bbd0aad1c1a15) から取得しました。

| Skill | License | 扱い |
|---|---|---|
| ast-grep-practice | MIT | 新規追加。必須指定された構造 lint / rewrite / テスト手順 |
| gh-fix-ci | Apache-2.0 | 新規追加。既存 GitHub Actions 失敗の診断・修正 |
| playwright-test | MIT | 新規追加。ブラウザ E2E の安定したテスト設計 |
| retrospective-codify | MIT | 既存日本語版へ現行の metadata、明示起動、4段階 dedup を反映 |

MIT は upstream README の「個別 LICENSE がなければ MIT」という明示を根拠としています。元の README と各ディレクトリを `third_party/mizchi-skills/62f580819410cb1d398e4d7f234bbd0aad1c1a15/` に保存し、Apache の全文と MIT の通知を各プラグインにも含めています。未変更 snapshot の SHA-256 と Git blob SHA、取得元とローカル修正は `upstream-lock.json` に記録しています。これらは実行用の追加スキルではありません。

既存 retrospective の参照元 `mizchi/chezmoi-dotfiles` は現行ツリーからスキルが移動しています。現在の取得元を `mizchi/skills/retrospective-codify` に更新し、元の日本語構成・承認後の書き出しを保持しました。

## 検証して修正した点

- ast-grep: `--format json` を実在する `--json=compact` に修正
- ast-grep: `--error=<...>` は severity 閾値ではなく rule ID として説明
- ast-grep: TypeScript の存在しない async field を AST に一致する条件へ変更
- ast-grep: Go 例の重複 `has` キーと expression-list 階層を修正
- ast-grep: `$_` の非 capture を fix に流用する危険な lodash 例を検出専用へ変更
- ast-grep: `--interactive` を dry-run と呼ばない。書き換えなしの preview と区別
- ast-grep: 未登録ルール/実行0件が exit 0 になる挙動を検証し、登録済み Red stub と CI 出力 guard を説明
- ast-grep: CI で commit 済み snapshot を再検証し、誤った fix を分類テストだけで通さない
- Playwright: 存在しない `expect.configure({ flaky: true })` の説明を現行の `failOnFlakyTests` とバージョン条件に変更
- Playwright: `networkidle` の待機例を UI readiness assertion へ変更し、popup の待機をトリガー前へ変更
- Playwright: 設定の browser projects と CI の install を揃え、認証 setup 例の import を補完
- gh helper: `gh pr checks` の failure / pending 終了コード 1 / 8 に付随する JSON を受理。pending / unknown / no-check を green と報告しない。外部サービスの `/runs/` URL を GitHub Actions と誤判定しない

全ての完全な ast-grep YAML 例はローカル CLI で schema/AST 条件を読み込めることを確認しています。代表例は実際の分類・rewrite snapshot も検証します。独立した TypeScript forward-test では generic・optional method・コメント・spread を含む引数が保持される callee-only 移行も確認しています。すべてのサンプルの意味を任意のプロジェクトで保証するものではありません。

## 選択しなかったもの

- Cloudflare deploy/CD: mizchi の `cf` と typed config、場合によって MoonBit を前提とするため、既存 Wrangler 環境へそのまま導入しない
- Stryker: Node 24 / pnpm / Vitest patch など追加前提が多いため今回の小さな導入範囲から除外
- frontend-review-hygiene: upstream が参照する補助スクリプト・チェックリストが取得ツリーに存在しないため除外
- commit / review / issue 系の重複: 既存の g-kari カスタマイズを維持

## 次に更新するとき

1. upstream の現在の commit と、対象ディレクトリの license / resources の変更を確認する。
2. 保存済み未変更 snapshot と新 upstream を比較し、`upstream-lock.json` の adaptations と現在の runtime skill を合わせて3者比較する。
3. ツール名・引数・参照が実在するか確認し、必要な変更だけ反映する。upstream scripts を読まずに実行しない。
4. 元 snapshot と hash、commit、ライセンス証拠、ローカル差分を更新する。
5. `npm run sync:metadata`、`npm run check`、`npm run test:codex` を実行する。バージョンを同期し、新しい commit の CI を確認する。

既存 Microsoft MarkItDown や katasu.me のリンクはツール・デザインの参照で、取得元 Skill の識別子ではありません。存在しない upstream Skill を推定して置換していません。
