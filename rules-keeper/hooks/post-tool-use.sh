#!/usr/bin/env bash
# rules-keeper: ファイル編集後のリマインド
# PostToolUse (Edit|Write|Bash) で呼ばれる
set -euo pipefail

# TOOL_INPUT から編集対象ファイルを推定
TARGET="${TOOL_INPUT:-}"

# CLAUDE.md への直接編集を検知
if echo "$TARGET" | grep -q "CLAUDE\.md"; then
  echo "[rules-keeper] CLAUDE.md を編集しました。以下を確認してください:"
  echo "  - 200行以下に収まっていますか？"
  echo "  - ファイルパターン固有のルールは .claude/rules/ に分離できませんか？"
  echo "  - ドメイン知識は .claude/skills/ に分離できませんか？"
fi

# rules ファイルの編集を検知
if echo "$TARGET" | grep -q "\.claude/rules/"; then
  echo "[rules-keeper] rules ファイルを編集しました。frontmatter の paths が YAML リスト形式か確認してください。"
fi

# 新しいディレクトリパターンの作成を検知（rules に追加すべきかも）
if echo "$TARGET" | grep -qE "\.(ts|tsx|js|jsx|py|go|rs|rb)$"; then
  # 対象ファイルのディレクトリに対応する rule があるかチェック
  if [ -d ".claude/rules" ]; then
    file_dir=$(echo "$TARGET" | grep -oE '[^"]*\.(ts|tsx|js|jsx|py|go|rs|rb)' | head -1 | xargs dirname 2>/dev/null || true)
    if [ -n "$file_dir" ] && [ "$file_dir" != "." ]; then
      rule_count=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l)
      if [ "$rule_count" -eq 0 ]; then
        echo "[rules-keeper] 💡 .claude/rules/ にルールファイルがありません。このプロジェクトのコーディング規約を rules に整理すると効果的です。"
      fi
    fi
  fi
fi
