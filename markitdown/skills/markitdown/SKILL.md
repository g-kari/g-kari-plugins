---
name: markitdown
description: "Microsoft markitdownを使ってPDF・Word・Excel・PowerPoint・画像・HTMLなど様々なファイルをMarkdownに変換するスキル。ローカルファイルパスやURLを指定して変換できる。ユーザーが「markdownに変換」「PDFをmarkdownで読みたい」「このファイルを変換して」「markitdown使って」などと言ったときに使用する。"
---

# markitdown

[microsoft/markitdown](https://github.com/microsoft/markitdown) を使ってファイルやURLをMarkdownに変換するスキル。

対応フォーマット：PDF、Word (.docx)、Excel (.xlsx)、PowerPoint (.pptx)、画像（EXIF/OCR）、HTML、CSV、JSON、XML、ZIP、YouTube URL など。

## ワークフロー

### Step 1: markitdown のインストール確認

```bash
markitdown --version 2>/dev/null || python3 -m markitdown --version 2>/dev/null
```

インストールされていない場合はインストール：

```bash
pip install markitdown[all]
```

`[all]` をつけると OCR・音声書き起こしなど全オプションが有効になる。インストールに失敗する場合はコアのみ `pip install markitdown` を試す。

### Step 2: 変換対象の特定

ユーザーの指示から変換対象を判断する：

| ユーザーの意図 | 対象 |
|---|---|
| ファイルパスを明示 | そのパスをそのまま使用 |
| URLを明示 | そのURLをそのまま使用 |
| カレントディレクトリのファイルに言及 | `ls` で確認してパスを特定 |
| 「このファイル」など曖昧な表現 | ユーザーに確認 |

### Step 3: 変換実行

```bash
# 基本形（stdout に出力）
markitdown <ファイルパスまたはURL>

# ファイルに保存したい場合
markitdown <入力> -o <出力ファイル.md>
```

複数ファイルを変換する場合はループで実行：

```bash
for f in *.pdf; do
  markitdown "$f" -o "${f%.pdf}.md"
done
```

### Step 4: 結果の報告

- 変換結果が短い（5000文字以内）場合はそのまま表示する
- 長い場合は冒頭300文字程度を抜粋して「変換完了しました！出力先: `<パス>`」と報告する
- エラーが発生した場合はエラーメッセージをそのまま共有し、原因を調査する

## コマンドリファレンス

```bash
# ファイル変換
markitdown document.pdf
markitdown report.docx
markitdown data.xlsx
markitdown slides.pptx

# URL変換
markitdown https://example.com/page.html

# ファイルに保存
markitdown input.pdf -o output.md

# パイプ
markitdown document.pdf | head -100
```

## 注意事項

- 画像のOCRには追加依存ライブラリが必要な場合がある（`markitdown[all]` で解決することが多い）
- 非常に大きなファイル（100MB超）は変換に時間がかかる場合がある
- パスワード保護されたファイルは変換不可
- `markitdown` コマンドがPATHにない場合は `python3 -m markitdown` でも動作する
