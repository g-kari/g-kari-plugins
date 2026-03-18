# plan-review

GitHub Copilot CLI を使って実装計画・設計ドキュメントを観点別に並列レビューする Claude Code プラグイン。

## 概要

実装計画や設計ドキュメントを5つの専門サブエージェントが同時にレビューし、多角的な視点から問題を検出します。

| 観点 | 内容 |
|---|---|
| 実現可能性・技術リスク | 技術的な実現可能性、依存関係のリスク、見積もりの妥当性 |
| アーキテクチャ・設計品質 | 設計の一貫性、結合度、既知のアンチパターン |
| 網羅性・考慮漏れ | 要件の漏れ、エッジケース、外部依存の考慮 |
| セキュリティ・データ保護 | 認証・認可、機密データ、コンプライアンス |
| スケーラビリティ・運用性 | 負荷対応、監視設計、障害復旧、デプロイ戦略 |

## インストール

```bash
claude plugin marketplace add g-kari/g-kari-plugins
```

## 使い方

### 基本的な使い方

```
# ファイルを指定してレビュー
/plan-review path/to/plan.md

# 最新のプランをレビュー（~/.claude/plans/ から自動検出）
/plan-review

# 特定の観点のみレビュー
/plan-review path/to/plan.md セキュリティだけ見て
```

### 会話中での使用

Claude Code との会話中に計画内容を貼り付けて「この計画をレビューして」と指示するだけでも動作します。

## 前提条件

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli) がインストール済みであること
  ```bash
  gh extension install github/gh-copilot
  ```

## copilot-review との違い

| 項目 | plan-review | copilot-review |
|---|---|---|
| 入力ソース | プランファイル・設計ドキュメント | git diff・PR差分 |
| 一時ファイル | `/tmp/plan-review-content.md` | `/tmp/copilot-review-diff.patch` |
| レビュー観点 | 実現可能性・アーキテクチャ・網羅性・セキュリティ・スケーラビリティ | バグ・セキュリティ・エラーハンドリング・パフォーマンス・可読性 |

## ライセンス

MIT
