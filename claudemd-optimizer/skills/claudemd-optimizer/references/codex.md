# Codex の AGENTS.md 最適化

1. ユーザー指定の対象を優先する。指定がなければ、作業ディレクトリから Git ルートまでの `AGENTS.override.md` / `AGENTS.md` と関連する子ディレクトリの指示を調べる。ユーザー共通の対象を頼まれた場合のみ `${CODEX_HOME:-$HOME/.codex}` の指示も調べる。
2. 適用範囲と優先順位を保持する。同じ階層では `AGENTS.override.md` が優先され、より深い階層の指示はその範囲で優先される。別階層を無差別に統合しない。
3. 各記述を KEEP（必須のコマンド・制約・落とし穴）、SCOPED（対象ディレクトリの AGENTS.md）、SKILLS（低頻度の手順を `.agents/skills/<name>/SKILL.md`）、CHECKS（既存 lint/test/CI）、REMOVE（重複・自明）に分類する。セキュリティ・アクセス・ユーザー制約は削除候補にしない。
4. 移動元・移動先と理由を短く提示する。実行が依頼された範囲は進め、分析のみなら変更しない。新しい hooks や権限変更は別の判断が必要。
5. 差分で復元できる形を保ち、非 Git 管理なら上書き前にバックアップする。新しい SKILL.md に name / description を入れ、リンク先とチェックコマンドを検証する。

Claude の `.claude/rules/*.md` の paths frontmatter、`@file` 自動 import を Codex が同じように処理するとは考えない。ファイル別の制約は階層 AGENTS.md、ドメイン手順は skills、コマンド実行の許可ルールは Codex rules の別機能として扱う。200 行は任意の読みやすさ目安で、Codex の保証や上限ではない。

公式資料: [AGENTS.md](https://developers.openai.com/codex/guides/agents-md), [Skills](https://developers.openai.com/codex/skills), [Rules](https://developers.openai.com/codex/rules).
