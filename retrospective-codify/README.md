# retrospective-codify

タスク完了時に試行錯誤の学びを抽出し、再利用可能な形に固定するプラグイン。

## 概要

失敗と成功を対応付けて「最初に知るべきだった知見」を言語化し、以下のいずれかに出力します：

- **設計変更** — 型・API設計で誤用を表現できなくできるもの
- **ast-grep ルール** — コード構文レベルで静的検出できるもの
- **テスト・CI・フック** — 実行時・CIで検出できるもの
- **CLAUDE.md ルール** — 短く常時適用できる指針
- **skill** — 手順・文脈判断が必要なもの

## インストール

```bash
claude plugin add g-kari/g-kari-plugins/retrospective-codify
```

## 使い方

タスク完了後に：

```
振り返って
```

または：

```
retrospectして
```

と入力すると、5段階ワークフローが起動します。

## ワークフロー

1. 失敗⇄成功の対応付け
2. 知見を指示形で言語化
3. 出力先を分類（設計変更 / ast-grep / テスト・CI・フック / CLAUDE.md / skill）
4. 既存ルール・スキルとの重複チェック
5. 提案を提示し、承認後に書き出し

## 原則

> 優先順位は「型・API設計で誤用を不可能にする → 静的検出（ast-grep）→ テスト・CI・フックで落とす → 文章ルール」。静的に検出可能なものはプロンプトに書かず、必ず `ast-grep` ルールにする

---

Original skill by [mizchi](https://github.com/mizchi/skills/tree/62f580819410cb1d398e4d7f234bbd0aad1c1a15/retrospective-codify)

Codex では `$retrospective-codify` で明示起動します。現在の upstream に合わせ、タスク完了だけでは自動実行しません。
