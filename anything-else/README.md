# anything-else

開発セッションの終わりに、関連Issue・未着手タスク、まだIssueになっていない保留事項、差分に即したテストや軽微な整理を確認するスキル。

## Codex

```bash
codex plugin marketplace add g-kari/g-kari-plugins --ref main
codex plugin add anything-else@g-kari-plugins
```

新しいセッションで `$anything-else` または「このセッションのやり残しを確認して」と依頼します。

## Claude Code

```text
/plugin marketplace add g-kari/g-kari-plugins
/plugin install anything-else@g-kari-plugins
/anything-else:anything-else
```

既にマーケットプレイスを登録している場合は、各ホストで更新してからインストールします。同じ `skills/anything-else/` を両ホストで使います。

## 動作範囲

- 現在のリポジトリ、提供された会話、利用可能なGit／Issue連携を読み取って整理します。
- Issue作成コマンドや更新内容、追加テスト、軽微な整理を提案します。実行は該当操作への別途の依頼・許可に従います。
- GitやIssue連携が使えない場合、確認できなかった範囲を明記して会話から作業を続けます。未コミット変更は保持します。
- 自動起動、hooks、MCPサーバー、新たなログイン・依存導入は不要です。インストールだけでセッション終了時に自動実行されることはありません。

## 検証

repoルートで `npm run check` と `npm run test:codex` を実行します。`tests/anything-else.test.mjs` はメタデータと指示の契約を確認する静的テストです。モデル応答の意味的な動作は [評価シナリオ](evals.md) で確認します。
