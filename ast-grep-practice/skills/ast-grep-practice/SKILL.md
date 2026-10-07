---
name: ast-grep-practice
description: "ast-grep の構造検索、プロジェクト固有 lint、安全な rewrite、ルールテストと CI 組み込みに使う。既存 linter で表現できない構文パターンや API 移行を扱う。"
license: MIT
---

# ast-grep Practice

Codex / Claude Code のどちらでも、実際の AST とテストで構造ルールを作る。既存の ESLint / Biome / コンパイラで表現できるルールは既存機能を優先する。

## 最初に確認すること

- ユーザー指定の範囲と対象言語、既存 `sgconfig.yml` / rules / rule-tests を読む
- packageManager と lockfile に合わせる。このリポジトリでは `npm ci --ignore-scripts` で固定の `@ast-grep/cli@0.45.3` を導入し、`npm exec -- ast-grep --version` で確認する
- `sg` という名前は Unix の別コマンドと衝突することがある。常にプロジェクトの `ast-grep` を使う
- 検出から始め、valid / invalid の分類テストを先に書く。必要なら snapshot で位置と fix の結果も固定する
- 読み取りの `run` / `scan` は rewrite 候補を表示できる。`--interactive` は実際に書き換えるモードで、dry-run ではない
- fix は引数評価・副作用・型・参照先が保たれる場合だけ付ける。`--update-all` は承認済み対象のみ。ルール外のファイルを一括更新しない

## 必要な資料だけ読む

- 初期設定・全体ワークフロー・言語別例: [guide.md](references/guide.md)
- CLI、JSON 出力、終了コード: [cli.md](references/cli.md)
- constraints / transform / 構造関係: [rule-yaml.md](references/rule-yaml.md)
- 分類テストと snapshot: [testing.md](references/testing.md)
- AST kind の調べ方: [kind-catalog.md](references/kind-catalog.md)

JSON は `--json=compact`。`--error=<id>` の値は severity ではなくルール ID。例を実プロジェクトへ適用する前に、インストール済みバージョンの `--help` と対象 AST で確認する。

Source: [mizchi/skills](https://github.com/mizchi/skills/tree/62f580819410cb1d398e4d7f234bbd0aad1c1a15/ast-grep-practice), MIT. ローカルで確認した修正は repository の upstream 記録に保存。
