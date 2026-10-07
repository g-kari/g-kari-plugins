# Codex 指示構成の監査

ユーザー指定の対象を読み、作業ディレクトリから Git ルートまでの AGENTS.override.md / AGENTS.md、対象配下の階層指示、`.agents/skills/*/SKILL.md` とその参照を確認する。個人共通設定の監査が依頼されたときのみ Codex home と `$HOME/.agents/skills` も調べる。

- 同階層 override の優先と、子ディレクトリの適用範囲を区別する
- ユーザー制約や必須チェックの欠落・衝突、冗長な説明、存在しないコマンドを報告する
- スキルの name / description / 相対リンクと重複名を確認する
- `.codex/rules` のコマンド許可ルールを Claude の paths 付き散文 rules と混同しない
- 200 行という Claude の目安を Codex の必須条件にしない
- 監査と改善案が基本。修正を依頼された範囲のみ変更し、確認が必要な権限・hooks 変更は別途扱う

大きな指示整理は `$claudemd-optimizer` の Codex 向け手順を利用できる。存在しないスキルを呼び出す前提にはしない。

公式資料: [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Skills](https://developers.openai.com/codex/skills).
