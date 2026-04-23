# retrospective-codify

タスク完了時に試行錯誤の学びを抽出し、再利用可能な形に固定するプラグイン。

## 概要

失敗と成功を対応付けて「最初に知るべきだった知見」を言語化し、以下のいずれかに出力します：

- **ast-grep ルール** — コード構文レベルで静的検出できるもの
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
3. 出力先を分類（ast-grep / CLAUDE.md / skill）
4. 既存ルール・スキルとの重複チェック
5. 提案を提示し、承認後に書き出し

## 原則

> 静的に検出可能なものはプロンプトに書かず、必ず `ast-grep` ルールにする

---

Original skill by [mizchi](https://github.com/mizchi/chezmoi-dotfiles)
