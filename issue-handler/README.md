# issue-handler

GitHub Issue の作成・一覧・処理を自動化するプラグイン。

## 特徴

- `gh` CLI で Issue 作成・一覧・処理・クローズ
- プロンプトインジェクション対策の安全機構内蔵
- 定期的な一括処理に対応

## 安全機構

外部ユーザーが作成した Issue にはプロンプトインジェクションのリスクがあるため、以下のルールで処理可否を判定します：

| 条件 | 処理 |
|---|---|
| 自分が作成した Issue | OK |
| 自分が `/approve` コメント済み | OK |
| それ以外 | スキップ |

ラベルではなくコメントを使う理由：ラベルは Write 権限があれば誰でも付与可能ですが、コメントの author は GitHub が保証するため偽装できません。

## インストール

```bash
claude plugin add g-kari/g-kari-plugins/issue-handler
```

## 使い方

```
Issue作って: ○○のバグ修正
Issue一覧見せて
Issue #12 を対応して
open issueを片付けて
```

## 前提条件

- `gh` CLI がインストール・認証済みであること
