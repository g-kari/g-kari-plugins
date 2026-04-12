# commit

git commit のワークフローを自動化する Claude Code プラグイン。

## 機能

- 差分の分析とコミット対象の判断
- プロジェクト固有のチェックコマンドを自動検出・実行
- 既存のコミットスタイルに合わせたメッセージ生成
- シークレットファイルの誤コミット防止

## 使い方

```bash
/commit              # 差分からメッセージを自動生成してコミット
/commit -m '修正'    # メッセージを指定してコミット
/commit --push       # コミット後に push も実行
```

## インストール

```bash
/plugin marketplace add g-kari/g-kari-plugins
/plugin install commit
```

## 設計方針

- **安全第一**: `--no-verify`, `--amend`, `git add .` は使わない
- **プロジェクト適応**: コミットスタイルとチェックコマンドを自動検出
- **最小限の介入**: 引数なしでも差分から適切にコミットできる
