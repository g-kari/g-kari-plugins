---
name: validate-settings
description: "Claude Code の settings.json または Codex の config.toml を、それぞれの構文と対象バージョンのスキーマで検証するときに使う。設定値を外部へ送信しない。"
---

## 対象フォーマットの選択

`config.toml` / Codex 設定には [Codex の検証手順](references/codex.md) を使う。JSON 設定には以下の Claude Code 手順を使い、Claude 用 JSON Schema やイベント名一覧を Codex に流用しない。

# Validate Settings

Claude Code の `settings.json` / `settings.local.json` を [schemastore.org の JSON Schema](https://json.schemastore.org/claude-code-settings.json) でバリデートするスキル。

## ワークフロー

### Step 1: バリデート対象ファイルの特定

以下の順にファイルを探す。ユーザーが特定のパスを指定した場合はそれを優先する。

| 優先度 | パス | 説明 |
|---|---|---|
| 1 | ユーザー指定パス | 明示的に指定されたファイル |
| 2 | `.claude/settings.local.json` | プロジェクトローカル設定 |
| 3 | `.claude/settings.json` | プロジェクト設定 |
| 4 | `~/.claude/settings.json` | ユーザーグローバル設定 |
| 5 | `~/.claude/settings.local.json` | ユーザーグローバルローカル設定 |

見つかったファイルをすべてバリデート対象とする。ユーザーが「グローバルだけ」「プロジェクトだけ」と指定した場合はフィルタする。

### Step 2: JSON Schema の取得

以下のコマンドでスキーマを取得してキャッシュする：

```bash
curl -s https://json.schemastore.org/claude-code-settings.json -o /tmp/claude-code-settings-schema.json
```

取得に失敗した場合は、既にキャッシュ済みのファイルがあればそれを使う。キャッシュもなければエラーを報告して終了する。

### Step 3: バリデーション実行

各対象ファイルに対して以下を実行する：

#### 3a: JSON構文チェック

まず `jq` でJSON構文を検証する：

```bash
jq empty <対象ファイル> 2>&1
```

構文エラーがあればその内容を報告し、スキーマバリデーションはスキップする。

#### 3b: スキーマバリデーション

`npx ajv-cli validate` でスキーマバリデーションを実行する：

```bash
npx ajv-cli validate -s /tmp/claude-code-settings-schema.json -d <対象ファイル> --spec=draft2020 --all-errors --verbose 2>&1
```

`ajv-cli` が使えない場合は `npx --yes ajv-cli` で自動インストールを試みる。

それも使えない場合は、**フォールバックとして手動バリデーション**を行う：
1. スキーマファイルを読み込む
2. 対象ファイルを読み込む
3. スキーマの `properties` に定義されたキーと対象ファイルのキーを比較し、不明なプロパティを報告
4. `type` フィールドで型チェックを行う

### Step 3c: Hook イベント名の検証

対象の `claude --version` と [Claude Code 公式 hook reference](https://code.claude.com/docs/en/hooks#hook-events) に合わせてイベント名を確認する。古い固定一覧（全25種など）で未知の名前を即エラーにしない。SchemaStore の更新が runtime より遅れている可能性があるため、不一致は対象バージョンと公式資料で確認し、確認できなければ未検証として報告する。

`PreCommit` / `PostEdit` のような独自名を作らず、目的に合う実在イベント・matcher を提案する。この検証のために hooks を実行・登録・許可しない。

### Step 4: 結果の報告

以下の形式で報告する：

```
## Settings Validation 結果

### <ファイルパス>
- ステータス: ✅ 有効 / ❌ エラーあり
- エラー内容（ある場合）:
  - <エラー1の説明>
  - <エラー2の説明>
```

すべてのファイルが有効な場合は以下を報告する：

```
## Settings Validation 結果

すべての設定ファイルが有効です ✅
```

## バリデーション項目

スキーマに基づいて以下を検証する：

- **不明なプロパティ**: スキーマに定義されていないキーの検出
- **型の不一致**: string, number, boolean, array, object の型チェック
- **必須プロパティ**: 必須フィールドの欠落
- **enum値**: 許可された値の範囲チェック（例: `apiProvider` の値）
- **パターン**: 正規表現パターンのマッチング
- **ネスト構造**: hooks, permissions, mcpServers などの深い構造の検証
- **Hook イベント名**: 対象バージョンの公式資料で `hooks` のキーを確認

## 注意事項

- スキーマ取得にネットワークアクセスが必要（初回のみ、以降はキャッシュ利用）
- `npx ajv-cli` は Node.js 環境が必要
- JSON5やコメント付きJSONには非対応（標準JSONのみ）
- `settings.local.json` はgit管理外の想定なので、内容をユーザー以外に共有しないこと
