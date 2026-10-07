---
name: playwright-test
description: "Playwright E2E テストの作成・レビュー・CI 設定に使う。web-first assertion、ネットワーク待機、ダイアログ、認証、drag-and-drop、shard/retry の不安定さを扱う。"
license: MIT
---

# Playwright Test

Codex / Claude Code で既存の Playwright プロジェクトに合わせてテストを実装する。詳しい API 例・設定テンプレートが必要なときは [guide.md](references/guide.md) を読む。

1. 適用される AGENTS.md / CLAUDE.md、既存 config、packageManager、lockfile、対象の挙動を読む。テンプレートで既存設定を丸ごと置き換えない。
2. 既存依存を使い、必要な追加や browser install は実環境の許可に従う。ライブアカウントの変更・送信・購入を E2E テストの副作用にしない。
3. role / label locator と web-first assertion を優先する。固定 sleep や `networkidle` で画面の準備完了を代用しない。
4. 応答・ダウンロード・popup の Promise をトリガー前に登録する。UI が目的なら API 呼び出しがない場合も通る UI assertion を使う。
5. 成功だけでなく Cancel、Close、戻る/進む、二重クリック、中断と再試行、ダイアログ閉鎖後の状態も対象に応じて確認する。
6. storageState、HAR、trace は認証・個人データを含み得る。合成データを使い、auth ファイルは Git 管理外に置く。新しい継続アクセスの作成や機密データの共有をテスト依頼から推測しない。
7. 対象テストを実行し、既存の必要な集約チェックも確認する。再試行成功を flaky と区別し、実行済み/失敗/未実行を明確に報告する。

Source: [mizchi/skills](https://github.com/mizchi/skills/tree/62f580819410cb1d398e4d7f234bbd0aad1c1a15/playwright-test), MIT.
