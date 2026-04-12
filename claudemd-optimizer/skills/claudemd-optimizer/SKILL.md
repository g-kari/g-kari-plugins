---
name: claudemd-optimizer
description: "CLAUDE.mdを公式ベストプラクティスに基づいて分析・最適化するスキル。内容を5カテゴリ（KEEP/RULES/SKILLS/HOOKS/REMOVE）に分類し、.claude/rulesへの移行、skillsへの分離、hooksの設定、冗長コンテンツの削除を提案・実行する。ユーザーが「CLAUDE.mdを最適化して」「CLAUDE.mdを圧縮して」「rulesに移行して」「claudemdが長い」「注意資源を節約」などと言ったときに使用する。"
---

# CLAUDE.md Optimizer

Claude Code 公式ドキュメントのベストプラクティスに基づき、CLAUDE.md を最適化するスキル。

**根拠となる公式原則:**
- 「CLAUDE.mdはすべてのセッションで読み込まれるため、広く適用されるもののみを含める」
- 「各行について『これを削除するとClaudeが間違いを犯しますか？』と問う」
- 「膨らんだCLAUDE.mdファイルはClaudeがあなたの実際の指示を無視するようにする」
- 「CLAUDE.mdファイルあたり200行以下を目標」

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
- `.claude/skills/` ディレクトリの存在
- 他の階層のCLAUDE.mdファイル（矛盾チェック用）

#### CLAUDE.md の配置場所（5箇所）

CLAUDE.mdは以下の場所に配置でき、すべてマージして適用される：

| 場所 | 用途 |
|---|---|
| `~/.claude/CLAUDE.md` | ユーザー個人の共通設定（全プロジェクト共通） |
| プロジェクトルート `CLAUDE.md` | プロジェクト全体の設定（チーム共有） |
| 親ディレクトリの `CLAUDE.md` | モノレポのルートなど |
| 子ディレクトリの `CLAUDE.md` | サブパッケージ固有のルール |
| Enterprise managed policy | 組織の管理ポリシー（settings.json経由） |

**矛盾チェック**: 複数のCLAUDE.mdが存在する場合、内容が矛盾していないか確認する。矛盾がある場合はユーザーに報告して解消方法を提案する。

### Step 2: 注意コスト分析

CLAUDE.mdの各セクション・各行を以下の **5カテゴリ** に分類する：

#### KEEP（CLAUDE.mdに残す）
セッション開始直後から必要で、かつ**Claudeの行動を変える**内容：
- **Bashコマンド**: Claudeが推測できないdev/build/test/lintコマンド
- **デフォルトと異なるコードスタイル**: プロジェクト固有のスタイルルール
- **テスト指示**: 推奨テストランナーとテスト方針
- **リポジトリのエチケット**: ブランチ命名規約、PR規約、コミット規約
- **アーキテクチャ決定**: プロジェクト固有の設計方針
- **環境の癖**: 必須環境変数、特殊な設定
- **落とし穴**: 一般的な落とし穴や明白でない動作
- **Skills/subagentsの名前**: 利用可能なスキルのディスカバリー用リスト
- **行動原則・パーソナリティ指定**（3〜5行）
- **プロジェクト固有の制約・禁止事項**

#### RULES（`.claude/rules/` に移動）
**特定のファイルパターンでのみ適用すべき**指示：
- コーディング規約・スタイルガイド → `rules/coding-style.md`
- テスト方針・テストの書き方 → `rules/testing.md`
- コミットメッセージ・PR規約 → `rules/git.md`
- インフラ・IaC関連 → `rules/infra.md`
- API・エンドポイント設計 → `rules/api.md`

#### SKILLS（`.claude/skills/` に移動）
**ドメイン知識や低頻度ワークフロー**：
- 特定の技術ドメインの詳細知識
- 低頻度だが手順が複雑なワークフロー
- 外部ツール連携の手順書
- ユーザーが明示的に呼び出す作業手順

#### HOOKS（`.claude/settings.json` のhooksに設定）
**毎回確実に実行すべき検証・フォーマット**の指示：
- 「コミット前にlintを実行すること」→ `PreToolUse` hook（matcher: `Bash`）
- 「ビルドが通ることを確認すること」→ `PostToolUse` hook（matcher: `Edit|Write`）
- 「フォーマットを整えること」→ `PostToolUse` hook（matcher: `Edit|Write`）
- 「型チェックを実行すること」→ `PostToolUse` hook（matcher: `Edit|Write`）

#### REMOVE（削除）
以下は書かなくてよい：
- **Claudeがコードを読むことで理解できるもの**
- **標準言語規約**（Claude既知のベストプラクティス）
- **詳細なAPIドキュメント**（`@docs/api.md` リンクで代替）
- **ファイルごとのコードベースの説明**
- **頻繁に変わる情報**
- **長い説明またはチュートリアル**
- **「きれいなコードを書く」のような自明なプラクティス**
- **linterで自動強制可能なルール**（Prettier/ESLintなど）
- **冗長な説明・同じ内容の繰り返し**
- **過去のbugfix経緯**（コード・gitログに残っている）
- **使い方の説明**（README向けの内容）

### Step 3: 移行プランの提示

分析結果をユーザーに提示する：

```
## CLAUDE.md 最適化プラン

### 現状
- 行数: XXX行（目標: 200行以下）
- 推定トークン数: 約XXXトークン

### 分析結果

| カテゴリ | 件数 | 内容（抜粋） |
|---|---|---|
| KEEP | X件 | Bashコマンド、アーキテクチャ決定、落とし穴 |
| RULES | X件 | コーディング規約→coding-style.md、テスト方針→testing.md |
| SKILLS | X件 | ドメイン知識→skills/domain.md |
| HOOKS | X件 | lint実行→PreToolUse、ビルドチェック→PostToolUse |
| REMOVE | X件 | 一般的ベストプラクティスX項目、冗長な説明X項目 |

### 最適化後の見込み
- CLAUDE.md: XXX行 → XX行（XX%削減）
- 作成される rules ファイル: X個
- 作成される skills ファイル: X個
- 追加される hooks: X個

### 作成ファイル一覧
- `.claude/rules/coding-style.md`（paths: src/**/*.ts）
- `.claude/rules/testing.md`（paths: **/*.test.*）
- `.claude/skills/<skill-name>/SKILL.md`
- `.claude/settings.json`（hooksを追加）
```

ユーザーに確認を取り、承認を得てから Step 4 に進む。

### Step 4: 移行の実行

ユーザーの承認後、以下の順序で実行する：

#### 4-1. rules ファイルの作成

`.claude/rules/` ディレクトリを作成し、各rulesファイルを生成する。

rulesファイルのフォーマット（YAML リスト形式）：
```markdown
---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# <ルール名>

<CLAUDE.mdから移動した内容>
```

**重要**: frontmatter には `paths` のみを指定する。`description` フィールドは不要。

`paths` を指定することで、該当ファイルを編集する時だけルールが注入される。
`paths` を省略すると、すべてのコンテキストで適用される（git規約など）。

#### 4-2. skills ファイルの作成

ドメイン知識や低頻度ワークフローを `.claude/skills/` に分離する：
```markdown
---
name: <skill-name>
description: "<スキルの説明>"
---

<CLAUDE.mdから移動した内容>
```

#### 4-3. hooks の設定

`.claude/settings.json` が存在する場合はhooksキーを追加・マージする。存在しない場合は新規作成する。

hooksの例：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$TOOL_INPUT\" | grep -q 'git commit'; then npm run lint; fi"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
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

#### 4-4. CLAUDE.md の書き換え

KEEP カテゴリの内容のみを残した圧縮版 CLAUDE.md を生成する。

**`@imports` による分割**も検討する。CLAUDE.md が200行を超えそうな場合：
```markdown
# CLAUDE.md

@docs/coding-conventions.md
@docs/architecture.md
```

`@path/to/file` 構文で別ファイルの内容をインポートできる。大きなCLAUDE.mdを論理的に分割するのに有効。

元の CLAUDE.md は `.claude/CLAUDE.md.bak` にバックアップしてから上書きする。

#### 4-5. 移行サマリーの報告

```
## 最適化完了！

### 変更内容
- CLAUDE.md: XXX行 → XX行（XX%削減）
- 作成: `.claude/rules/coding-style.md`
- 作成: `.claude/rules/testing.md`
- 作成: `.claude/skills/<skill-name>/SKILL.md`
- 追加: `.claude/settings.json` hooks（PreToolUse, PostToolUse）
- バックアップ: `.claude/CLAUDE.md.bak`

### 期待される効果
- セッション後半でのルール遵守度が向上
- コーディング規約は該当ファイル編集時のみ注入され、注意希釈を防止
- ドメイン知識はスキルとして必要時のみ参照される
- 検証がhooksで自動化されClaudeへの指示が不要に
```

## 注意事項

- CLAUDE.md のバックアップを必ず取ってから書き換える（`.claude/CLAUDE.md.bak`）
- `.claude/settings.json` の既存 hooks 設定は上書きせずマージする
- paths 指定が適切かユーザーに確認を取ること（プロジェクト構造によって異なる）
- hooks に設定するコマンドはプロジェクトの `package.json` 等に存在するコマンドのみ使用する
- 移行後にユーザーが動作確認できるよう、変更内容を明確に報告する
- 元の CLAUDE.md に戻したい場合は `.claude/CLAUDE.md.bak` から復元できることを伝える
- 複数のCLAUDE.mdが存在する場合は矛盾がないか確認する
- 200行以下を目標にするが、プロジェクトの複雑さに応じて柔軟に判断する

## 使用例

```
ユーザー: 「CLAUDE.mdが長くなってきたので最適化して」
→ カレントディレクトリの CLAUDE.md を分析し、移行プランを提示

ユーザー: 「~/.claude/CLAUDE.md を圧縮したい」
→ 指定パスの CLAUDE.md を対象に分析・最適化

ユーザー: 「コーディング規約の部分だけ rules に移行して」
→ 対象セクションを特定し、適切な rules ファイルに移行

ユーザー: 「ドメイン知識をスキルに分離したい」
→ 対象セクションを特定し、.claude/skills/ にスキルファイルを作成
```
