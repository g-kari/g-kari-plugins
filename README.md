# g-kari-plugins

Claude Code プラグインマーケットプレイス。

## インストール

```
/plugin marketplace add g-kari/g-kari-plugins
```

## プラグイン一覧

### copilot-review

GitHub Copilot CLI (`copilot -p`) を使って、観点別に並列コードレビューを実行するプラグイン。

5つのサブエージェントが同時にレビューを実行し、多角的にコードの問題を検出します。

| 観点 | 検出対象 |
|---|---|
| バグ・ロジック | バグ、エッジケース、型の不整合 |
| セキュリティ | インジェクション、認証不備、OWASP Top 10 |
| エラーハンドリング | 未処理例外、リソースリーク |
| パフォーマンス | N+1クエリ、計算量、メモリ効率 |
| 可読性・保守性 | 命名、複雑性、設計パターン |

```
/plugin install copilot-review@g-kari-plugins
```

#### 前提条件

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli) がインストール済みであること

#### 使い方

```
レビューして
PR #123をcopilotでレビューして
mainとの差分をセキュリティ重点でレビューして
```

### webauthn-front-design

katasu.me インスパイアのフロントエンドデザインシステムをプロジェクトに適用するプラグイン。
CSS 変数・コンポーネント定義・HTML パターンをそのまま利用可能。

```
/plugin install webauthn-front-design@g-kari-plugins
```

#### 使い方

```
WebAuthnのデザインを適用して
katasu.meスタイルにして
CSSシステムを入れて
```
