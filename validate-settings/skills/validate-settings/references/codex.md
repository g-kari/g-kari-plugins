# Codex config.toml の検証

1. ユーザー指定パスを優先する。指定がなければ対象プロジェクトの `.codex/config.toml` と `${CODEX_HOME:-$HOME/.codex}/config.toml` を確認する。ファイル内容に認証情報が含まれ得るため、ローカルで検証し外部に送らない。
2. Python 3.11+ の `tomllib`（または既存の TOML パーサー）で構文を確認する。パスを引数として安全に渡す。

```bash
python3 -c 'import sys,tomllib; tomllib.load(open(sys.argv[1],"rb")); print("TOML syntax OK")' /path/to/config.toml
```

3. `codex --version` に対応する公式 config schema を取得できるなら、パースした値を既存の JSON Schema validator で検証する。公式リポジトリの同バージョン・タグを優先し、最新版との差を明示する。新しい validator の導入が必要なら環境の許可に従う。ネットワークやスキーマが使えなければ構文検証までと明記する。
4. [公式設定リファレンス](https://developers.openai.com/codex/config-reference) と [公式 schema](https://github.com/openai/codex/blob/main/codex-rs/config/config.schema.json) で型・未知キー・モデル/ツール設定を調べる。検証のために実セッション、ログイン、MCP サーバーを起動したり権限設定を変えたりしない。
5. 対象、構文とスキーマの結果、未検証の部分、具体的な修正候補を報告する。設定修正の依頼がなければ編集しない。
