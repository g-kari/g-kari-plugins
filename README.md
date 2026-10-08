# g-kari-plugins

Claude Code と Codex 向けのスキル・プラグイン集。同じ `skills/` を両ホストで利用し、ホスト固有の指示と設定を区別します。

## Codex へのインストール

Codex CLI のプラグイン機能でマーケットプレイスを登録し、必要なプラグインだけ追加します。

```bash
codex plugin marketplace add g-kari/g-kari-plugins --ref main
codex plugin list --marketplace g-kari-plugins --available
codex plugin add ast-grep-practice@g-kari-plugins
codex plugin add gh-fix-ci@g-kari-plugins
codex plugin add playwright-test@g-kari-plugins
codex plugin add security-audit@g-kari-plugins
```

インストール後は新しいセッションで `$ast-grep-practice` などを指定するか、自然言語で依頼します。CLI の `/skills` でも確認できます。Codex のデスクトップアプリでは登録したマーケットプレイスからプラグインを選択します。IDE 拡張で単独スキルを使う場合は、対象の `skills/<name>/` をプロジェクトの `.agents/skills/` または個人の `~/.agents/skills/` に配置します。同名スキルの二重インストールは避けてください。

ローカル開発版を確認する場合:

```bash
codex plugin marketplace add /absolute/path/to/g-kari-plugins
```

`.agents/plugins/marketplace.json` は repo ルートを基準に既存のプラグインフォルダを参照します。各プラグインの root `plugin.json` は Agent Plugins 1.0、`.codex-plugin/plugin.json` は互換用です。

## Claude Code へのインストール

既存のマーケットプレイスとプラグイン名は引き続き利用できます。

```text
/plugin marketplace add g-kari/g-kari-plugins
/plugin install ast-grep-practice@g-kari-plugins
```

## プラグイン一覧

| Plugin | Skill | 用途・前提 |
|---|---|---|
| security-audit | security-audit | Cloudflare のソース主導監査。Node.js / 並列サブエージェント。対象コード実行にはネットワーク遮断・環境 allowlist・書込隔離・資源制限の OS sandbox が必須 |
| ast-grep-practice | ast-grep-practice | AST 構造検索、lint、rewrite、分類・snapshot テスト。ローカル ast-grep |
| gh-fix-ci | gh-fix-ci | GitHub Actions の PR 失敗診断と依頼された修正。既存 GitHub 接続 / gh |
| playwright-test | playwright-test | E2E、web-first assertion、ネットワーク、ダイアログ、CI。対象プロジェクトの Playwright |
| copilot-review | copilot-review | Copilot による5観点の差分レビュー。Copilot CLI とコード送信の許可 |
| plan-review | plan-review | Copilot による計画・設計の5観点レビュー。Copilot CLI |
| claudemd-optimizer | claudemd-optimizer | CLAUDE.md または Codex AGENTS.md の整理 |
| rules-keeper | rules-audit | ホストごとの指示・スキルの監査 |
| validate-settings | validate-settings | Claude JSON / Codex TOML を対象別に検証 |
| commit | commit | 差分、既存チェック、個別ステージング、コミット |
| retrospective-codify | retrospective-codify | 明示依頼された学びの固定、4段階の重複確認 |
| anything-else | anything-else | セッション終了時の関連Issue・未着手タスク・Issue作成案・テスト／軽微な整理の確認 |
| markitdown | markitdown | Microsoft MarkItDown で各種ファイルを Markdown に変換 |
| stop-notifier | setup-stop-notifier | WSL2 + Windows の通知依存導入と手動テスト |
| webauthn-front-design | front-design | katasu.me インスパイアの既存 CSS デザインシステム |

`rules-keeper` と `stop-notifier` の既存 hooks は Claude 用として保持しています。Codex 配布では `hooks: []` として明示的に無効です。スキルをインストールしただけで Codex の自動通知・自動リマインダーが設定されるわけではありません。Windows 通知はこの Linux クラウド環境では実行していません。

## ast-grep と開発環境

Node.js 22+ と Python 3 を使い、公式 npm パッケージをプロジェクト内に固定して導入します。グローバルな `sg` は別コマンドの場合があるため使用しません。

```bash
npm ci --ignore-scripts
npm exec -- ast-grep --version
npm run test:ast-grep
npm run check
```

`@ast-grep/cli` は 0.45.3、YAML パーサーは 2.9.1 に固定しています。`--ignore-scripts` でもプラットフォーム別の公式バイナリが解決できることを検証済みです。別プロジェクトで ast-grep を追加するときは、そのプロジェクトの packageManager と lockfile を優先します。

## 更新と検証

- metadata 変更後: `npm run sync:metadata`
- 検証: `npm run check`、`git diff --check`
- Codex 実機能のローカル検証: `npm run test:codex`（Codex CLI 必須、隔離した HOME を使用）
- upstream とライセンス: [docs/upstream.md](docs/upstream.md)
- 変更履歴: [CHANGELOG.md](CHANGELOG.md)

公式仕様: [Codex skills](https://developers.openai.com/codex/skills)、[プラグイン構造・マーケットプレイス](https://developers.openai.com/plugins/build/plugins)。

security-audit は固定 upstream を同梱したスキル専用プラグインです。インストールだけでは監査は始まりません。通常はガイダンス、明示したコードベース監査では六段階フローを使います。sandbox の全条件を満たせない場合、対象コードを実行せず needs_validation として報告します。API キー、MCP サーバー、外部サービス接続、hook は追加しません。
