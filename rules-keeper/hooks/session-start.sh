#!/usr/bin/env bash
# rules-keeper: セッション開始時のCLAUDE.md / rules 状態チェック
set -euo pipefail

WARN_THRESHOLD=200
issues=()

# --- CLAUDE.md の存在チェック ---
if [ ! -f "CLAUDE.md" ]; then
  issues+=("⚠ CLAUDE.md が見つかりません。プロジェクトルールの記述を検討してください。")
fi

# --- CLAUDE.md の行数チェック ---
if [ -f "CLAUDE.md" ]; then
  line_count=$(wc -l < "CLAUDE.md")
  if [ "$line_count" -gt "$WARN_THRESHOLD" ]; then
    issues+=("⚠ CLAUDE.md が ${line_count} 行あります（推奨: ${WARN_THRESHOLD} 行以下）。claudemd-optimizer での最適化を検討してください。")
  fi
fi

# --- .claude/rules/ の存在チェック ---
if [ ! -d ".claude/rules" ]; then
  issues+=("💡 .claude/rules/ ディレクトリがありません。ファイルパターン別ルールの活用を検討してください。")
fi

# --- rules ファイルの frontmatter チェック ---
if [ -d ".claude/rules" ]; then
  for f in .claude/rules/*.md; do
    [ -f "$f" ] || continue
    # カンマ区切り paths の検出（旧形式）
    if head -20 "$f" | grep -qE '^paths:\s*".*,.*"'; then
      issues+=("⚠ ${f}: paths がカンマ区切りになっています。YAML リスト形式に変更してください。")
    fi
    # description フィールドの検出（不要）
    if head -20 "$f" | grep -qE '^description:'; then
      issues+=("💡 ${f}: description フィールドは rules では不要です。paths のみで十分です。")
    fi
  done
fi

# --- 結果出力 ---
if [ ${#issues[@]} -gt 0 ]; then
  echo "[rules-keeper] セッション開始チェック:"
  for issue in "${issues[@]}"; do
    echo "  $issue"
  done
else
  echo "[rules-keeper] CLAUDE.md / rules の状態は良好です。"
fi
