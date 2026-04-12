# rules-keeper

CLAUDE.md と `.claude/rules/` の整備をゆるくリマインドする Claude Code プラグイン。

## 機能

### セッション開始時チェック（SessionStart hook）
- CLAUDE.md の存在確認
- CLAUDE.md の行数チェック（200行超で警告）
- `.claude/rules/` ディレクトリの存在確認
- rules ファイルの frontmatter 形式チェック

### ファイル編集時リマインド（PostToolUse hook）
- CLAUDE.md 編集時: 行数・分離の提案
- rules ファイル編集時: frontmatter 形式の確認
- コードファイル編集時: rules 未整備の場合にリマインド

### rules-audit スキル
`/rules-audit` で CLAUDE.md と rules の現状を監査し、改善ポイントをレポートする。

## インストール

```bash
/plugin marketplace add g-kari/g-kari-plugins
/plugin install rules-keeper
```

## 設計方針

- **ゆるいリマインド**: エラーではなく提案。作業の邪魔にならない
- **公式準拠**: Claude Code 公式ドキュメントのベストプラクティスに基づく
- **非破壊**: 自動で変更を加えない。変更は claudemd-optimizer に委譲
