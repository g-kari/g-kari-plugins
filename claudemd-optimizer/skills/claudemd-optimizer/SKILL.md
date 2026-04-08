---
name: claudemd-optimizer
description: "CLAUDE.mdを注意資源の観点から分析・最適化するスキル。内容を4カテゴリ（KEEP/RULES/HOOKS/REMOVE）に分類し、.claude/rulesへの移行、hooksの設定、冗長コンテンツの削除を提案・実行する。ユーザーが「CLAUDE.mdを最適化して」「CLAUDE.mdを圧縮して」「rulesに移行して」「claudemdが長い」「注意資源を節約」などと言ったときに使用する。"
---

# CLAUDE.md Optimizer

LLMの注意メカニズムの特性を踏まえ、CLAUDE.mdを最適化するスキル。

**根拠となる原則（Qiita記事より）:**
- CLAUDE.mdはUser Messageとして注入されるため、長くなるほど各行への注意が希釈される
- セッション後半では位置バイアスにより遵守度が低下する
- 特定ファイル作業時のみ必要なルールは `.claude/rules/` で直近注入した方が効果が高い
- linterで強制可能な内容はClaudeへの指示として書く必要がない

## 最初にやること

**必ず `EnterPlanMode` ツールを呼び出してから作業を開始すること。** 分析・プラン提示まではPlanモードで行い、ユーザーの承認後に `ExitPlanMode` で実行に移る。

## ワークフロー

### Step 1: 対象 CLAUDE.md の特定

ユーザーの指示からCLAUDE.mdの場所を判断する：

| ユーザーの意図 | 対象ファイル |
|---|---|
| パスを明示 | 指定されたパスのCLAUDE.md |
| 「このプロジェクトの」「ここの」 | カレントディレクトリの CLAUDE.md |
| 指定なし | カレントディレクトリ → 見つからなければ `~/.claude/CLAUDE.md` |

CLAUDE.mdが存在しない場合はユーザーにパスを尋ねる。

合わせて以下も確認する：
- `.claude/rules/` ディレクトリの存在と既存ファイル
- `.claude/settings.json` の存在とhooks設定

### Step 2: 注意コスト分析

CLAUDE.mdの各セクション・各行を以下の4カテゴリに分類する：

#### KEEP（CLAUDE.mdに残す）
セッション開始直後から必要で、かつ**Claudeの思考・行動プロセスを変える**内容：
- プロジェクト概要（1〜3行）
- 技術スタック（バージョン付き、5行以内）
- 行動原則・パーソナリティ指定（3〜5行）
  - 例: 「3ステップ以上のタスクは必ずPlanモードで開始する」
  - 例: 「動作を証明できるまでタスク完了とマークしない」
- プロジェクト固有の制約・禁止事項

#### RULES（`.claude/rules/` に移動）
**特定のファイル・作業コンテキストでのみ必要**な内容：
- コーディング規約・スタイルガイド → `rules/coding-style.md`
  - paths: `src/**/*.ts,src/**/*.tsx,src/**/*.js`
- テスト方針・テストの書き方 → `rules/testing.md`
  - paths: `**/*.test.*,**/*.spec.*,**/__tests__/**`
- コミットメッセージ・PR規約 → `rules/git.md`
  - paths: なし（git操作全般に適用）
- インフラ・IaC関連 → `rules/infra.md`
  - paths: `**/Dockerfile,**/docker-compose.*,**/terraform/**,**/*.tf`
- API・エンドポイント設計 → `rules/api.md`
  - paths: `**/routes/**,**/controllers/**,**/handlers/**`

#### HOOKS（`.claude/settings.json` のhooksに設定）
**自動実行すべき検証・フォーマット**の指示：
- 「コミット前にlintを実行すること」→ PreCommit hook
- 「ビルドが通ることを確認すること」→ PostEdit hook
- 「フォーマットを整えること」→ PostEdit hook
- 「型チェックを実行すること」→ PostEdit hook

#### REMOVE（削除）
以下は書かなくてよい：
- Claudeが既知の一般的ベストプラクティス（「エラーハンドリングを適切に」等）
- Prettier/ESLintで自動強制可能なスタイルルール
- 冗長な説明・同じ内容の繰り返し
- 過去のbugfix経緯（コード・gitログに残っている）
- 使い方の説明（README向けの内容）

### Step 3: 移行プランの提示

分析結果をユーザーに提示する：

```
## CLAUDE.md 最適化プラン

### 現状
- 行数: XXX行
- 推定トークン数: 約XXXトークン

### 分析結果

| カテゴリ | 件数 | 内容（抜粋） |
|---|---|---|
| KEEP | X件 | プロジェクト概要、技術スタック、行動原則 |
| RULES | X件 | コーディング規約→coding-style.md、テスト方針→testing.md |
| HOOKS | X件 | lint実行→PreCommit、ビルドチェック→PostEdit |
| REMOVE | X件 | 一般的ベストプラクティスX項目、冗長な説明X項目 |

### 最適化後の見込み
- CLAUDE.md: XXX行 → XX行（XX%削減）
- 作成される rules ファイル: X個
- 追加される hooks: X個

### 作成ファイル一覧
- `.claude/rules/coding-style.md`（paths: src/**/*.ts）
- `.claude/rules/testing.md`（paths: **/*.test.*）
- `.claude/settings.json`（hooksを追加）
```

ユーザーに確認を取り、承認を得てから Step 4 に進む。

### Step 4: 移行の実行

ユーザーの承認後、以下の順序で実行する：

#### 4-1. rules ファイルの作成

`.claude/rules/` ディレクトリを作成し、各rulesファイルを生成する。

rulesファイルのフォーマット：
```markdown
---
description: <このルールの簡潔な説明>
paths: <対象ファイルのglobパターン（カンマ区切り）>
---

# <ルール名>

<CLAUDE.mdから移動した内容>
```

`paths` を指定することで、該当ファイルを編集する時だけルールが注入される。

#### 4-2. hooks の設定

`.claude/settings.json` が存在する場合はhooksキーを追加・マージする。存在しない場合は新規作成する。

hooksの例：
```json
{
  "hooks": {
    "PreCommit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint"
          }
        ]
      }
    ],
    "PostEdit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npm run type-check"
          }
        ]
      }
    ]
  }
}
```

既存の hooks 設定がある場合は上書きせず、追加する形でマージする。

#### 4-3. CLAUDE.md の書き換え

KEEP カテゴリの内容のみを残した圧縮版 CLAUDE.md を生成する。

圧縮版のテンプレート：
```markdown
# CLAUDE.md

## プロジェクト概要
<1〜3行>

## 技術スタック
<バージョン付きで5行以内>

## 行動原則
<3〜5行。Claudeの思考プロセスを変える原則のみ>

## プロジェクト構造
<最小限の構造説明>
```

元の CLAUDE.md は `.claude/CLAUDE.md.bak` にバックアップしてから上書きする。

#### 4-4. 移行サマリーの報告

```
## 最適化完了！

### 変更内容
- CLAUDE.md: XXX行 → XX行（XX%削減）
- 作成: `.claude/rules/coding-style.md`
- 作成: `.claude/rules/testing.md`
- 追加: `.claude/settings.json` hooks（PreCommit, PostEdit）
- バックアップ: `.claude/CLAUDE.md.bak`

### 期待される効果
- セッション後半でのルール遵守度が向上
- コーディング規約は該当ファイル編集時のみ注入され、注意希釈を防止
- lintチェックが自動化されClaudeへの指示が不要に
```

## 注意事項

- CLAUDE.md のバックアップを必ず取ってから書き換える（`.claude/CLAUDE.md.bak`）
- `.claude/settings.json` の既存 hooks 設定は上書きせずマージする
- paths 指定が適切かユーザーに確認を取ること（プロジェクト構造によって異なる）
- hooks に設定するコマンドはプロジェクトの `package.json` 等に存在するコマンドのみ使用する
- 移行後にユーザーが動作確認できるよう、変更内容を明確に報告する
- 元の CLAUDE.md に戻したい場合は `.claude/CLAUDE.md.bak` から復元できることを伝える

## 使用例

```
ユーザー: 「CLAUDE.mdが長くなってきたので最適化して」
→ カレントディレクトリの CLAUDE.md を分析し、移行プランを提示

ユーザー: 「~/.claude/CLAUDE.md を圧縮したい」
→ 指定パスの CLAUDE.md を対象に分析・最適化

ユーザー: 「コーディング規約の部分だけ rules に移行して」
→ 対象セクションを特定し、適切な rules ファイルに移行
```
