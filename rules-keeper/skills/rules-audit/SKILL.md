---
name: rules-audit
description: "CLAUDE.mdと.claude/rules/の現状を監査し、改善ポイントを報告するスキル。「rulesを監査して」「CLAUDE.mdの状態を確認」「rules auditして」などと言ったときに使用する。"
---

# Rules Audit

CLAUDE.md と `.claude/rules/` の現状を監査し、改善ポイントを報告するスキル。

## ワークフロー

### Step 1: 現状の収集

以下の情報を収集する：

1. **CLAUDE.md の状態**
   - 存在する全 CLAUDE.md ファイルのパスと行数
   - `~/.claude/CLAUDE.md`（グローバル）
   - プロジェクトルート `CLAUDE.md`
   - 子ディレクトリの `CLAUDE.md`

2. **rules の状態**
   - `.claude/rules/` 内の全ファイル
   - 各ファイルの frontmatter（paths の形式チェック）
   - カバーしているファイルパターン

3. **hooks の状態**
   - `.claude/settings.json` の hooks 設定
   - `.claude/settings.local.json` の hooks 設定

4. **skills の状態**
   - `.claude/skills/` 内のスキルファイル

### Step 2: 分析

収集した情報を以下の観点で分析する：

| チェック項目 | 基準 |
|---|---|
| CLAUDE.md の行数 | 200行以下が推奨 |
| rules の frontmatter 形式 | `paths` は YAML リスト形式 |
| rules の不要フィールド | `description` は不要 |
| 複数 CLAUDE.md の矛盾 | 同じトピックで異なる指示がないか |
| CLAUDE.md の REMOVE 候補 | Claude が推測可能な内容、linter で強制可能な内容 |
| KEEP すべき内容の欠落 | Bash コマンド、落とし穴、スキル名が記載されているか |
| hooks の活用状況 | 手動実行の指示が hooks 化できないか |

### Step 3: レポート出力

```
## Rules Audit レポート

### サマリー
- CLAUDE.md: X個（合計 XXX 行）
- Rules: X個
- Skills: X個
- Hooks: X個

### 問題点
1. ⚠ CLAUDE.md が XXX 行（推奨: 200行以下）
2. ⚠ rules/xxx.md: paths がカンマ区切り（YAML リスト形式に変更推奨）
3. 💡 「npm run lint を実行」→ hooks 化を検討

### 改善提案
- claudemd-optimizer を実行して CLAUDE.md を最適化
- xxx セクションを .claude/rules/xxx.md に分離
- yyy の手動指示を PostToolUse hook に変換
```

### Step 4: 改善の実行（オプション）

ユーザーが希望する場合、以下を実行する：
- frontmatter の形式修正（カンマ区切り → YAML リスト）
- 不要フィールドの削除
- claudemd-optimizer の呼び出し提案

## 注意事項

- このスキルは**監査と報告**が主目的。大きな変更は claudemd-optimizer に委譲する
- 変更を加える前に必ずユーザーの承認を得る
- `.claude/CLAUDE.md.bak` がある場合、前回の最適化履歴として参考にする
