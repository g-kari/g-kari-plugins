---
name: front-design
description: "WebAuthn TODOアプリのフロントエンドデザインシステム（katasu.meインスパイア）をプロジェクトに適用するスキル。CSS変数・コンポーネントクラス・HTMLパターン・Googleフォントを丸ごとプロジェクトに取り込む。「デザインを適用して」「katasu.meスタイルにして」「CSSシステムを入れて」「WebAuthnのデザインを使いたい」などと言ったときに使用する。"
---

# WebAuthn Front Design

katasu.me にインスパイアされたデザインシステムを現在のプロジェクトに適用するスキル。
CSS 変数・コンポーネントクラス・HTML パターンをそのまま利用できる。

## デザインの特徴

- **カラーパレット**: 温かみのある低彩度ブラウン系（katasu.me インスパイア）
- **フォント**: Reddit Sans + IBM Plex Sans JP（日本語対応）
- **アニメーション**: `cubic-bezier(0.16, 1, 0.3, 1)` の弾むような ease
- **最大幅**: 768px 中央寄せのシングルカラムレイアウト
- **角丸**: 12px / 8px の2段階

---

## Step 1: Google Fonts の読み込み

`<head>` に以下を追加する：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Reddit+Sans:ital,wdth,wght@0,75..100,200..900;1,75..100,200..900&family=IBM+Plex+Sans+JP:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

CSS ファイルの先頭に `@import` する場合：

```css
@import url("https://fonts.googleapis.com/css2?family=Reddit+Sans:ital,wdth,wght@0,75..100,200..900;1,75..100,200..900&family=IBM+Plex+Sans+JP:wght@300;400;500;600;700&display=swap");
```

---

## Step 2: CSS 変数の定義

`:root` に以下の変数を追加する：

```css
:root {
  /* カラーパレット (katasu.me インスパイア) */
  --color-bg: #fefbfb;
  --color-text: #483030;
  --color-muted: #a39696;
  --color-border: #dfd7d7;
  --color-surface: #f2f0f0;
  --color-accent: #73862d;
  --color-danger: #ff340b;
  --color-sunday: #e05252;
  --color-saturday: #4a90d9;
  --font-size-base: 16px;

  /* フォント */
  --font: "Reddit Sans", "IBM Plex Sans JP", BlinkMacSystemFont, sans-serif;

  /* アニメーション */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --transition: all 0.4s var(--ease);

  /* レイアウト */
  --max-w: 768px;
  --radius: 12px;
  --radius-sm: 8px;
}
```

---

## Step 3: ベーススタイルの適用

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: var(--font);
  border: none;
}
```

---

## Step 4: コンポーネントクラスの追加

### インタラクション (katasu.me スケールエフェクト)

```css
.interactive-scale {
  transition: var(--transition);
}
.interactive-scale:hover {
  transform: scale(1.05);
}
.interactive-scale:active {
  transform: scale(0.95);
}

.interactive-scale-sm {
  transition: var(--transition);
}
.interactive-scale-sm:hover {
  transform: scale(1.02);
}
.interactive-scale-sm:active {
  transform: scale(0.98);
}
```

### ボタン

```css
/* プライマリボタン: 黒背景・白文字 */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 22px;
  background: var(--color-text);
  color: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: var(--transition);
  white-space: nowrap;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.85;
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-primary.btn-lg {
  padding: 13px 30px;
  font-size: 1rem;
  border-radius: var(--radius);
}
.btn-primary.btn-full {
  width: 100%;
}

/* ゴーストボタン: 透明背景・ボーダー */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  color: var(--color-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition);
  white-space: nowrap;
  text-decoration: none;
}
.btn-ghost:hover {
  color: var(--color-text);
  background: var(--color-surface);
}
.btn-ghost.btn-lg {
  padding: 12px 26px;
  font-size: 1rem;
  border-radius: var(--radius);
}
.btn-ghost.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}
```

### カード

```css
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
}
```

### タブ

```css
.tab-btn {
  padding: 8px 16px;
  background: transparent;
  color: var(--color-muted);
  border-bottom: 2px solid transparent;
  border-radius: 0;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition);
  white-space: nowrap;
}
.tab-btn.active,
.tab-btn:hover {
  color: var(--color-text);
  border-bottom-color: var(--color-accent);
}
```

### フォームグループ

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-muted);
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font);
  font-size: 0.95rem;
  color: var(--color-text);
  transition: border-color 0.2s;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--color-accent);
}
```

### ヘッダー

```css
#site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 1.25rem;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: var(--transition);
}
.logo:hover {
  opacity: 0.75;
}
```

---

## HTML パターン

### ページ全体の構成

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>アプリ名</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Reddit+Sans:ital,wdth,wght@0,75..100,200..900;1,75..100,200..900&family=IBM+Plex+Sans+JP:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <header id="site-header">
      <div class="header-inner">
        <a href="/" class="logo">
          <span>🔐</span>
          <span>アプリ名</span>
        </a>
        <nav class="header-nav">
          <button class="btn-ghost btn-sm">操作ボタン</button>
        </nav>
      </div>
    </header>

    <main>
      <!-- コンテンツ -->
    </main>
  </body>
</html>
```

### ボタンの使い分け

```html
<!-- メインアクション -->
<button class="btn-primary">登録する</button>
<button class="btn-primary btn-lg">大きなCTA</button>
<button class="btn-primary btn-full">全幅ボタン</button>

<!-- サブアクション -->
<button class="btn-ghost">キャンセル</button>
<button class="btn-ghost btn-sm">小さいボタン</button>
<a href="/github" class="btn-ghost btn-sm">GitHub</a>

<!-- インタラクションエフェクト付き -->
<button class="btn-primary interactive-scale">ホバーで拡大</button>
<div class="card interactive-scale-sm">カードのホバー効果</div>
```

### カードレイアウト

```html
<div class="card">
  <h2>タイトル</h2>
  <p>コンテンツ</p>
</div>
```

### フォーム

```html
<form>
  <div class="form-group">
    <label for="username">ユーザー名</label>
    <input id="username" type="text" placeholder="例: alice" />
  </div>
  <div class="form-group">
    <label for="memo">メモ</label>
    <textarea id="memo" rows="4"></textarea>
  </div>
  <button type="submit" class="btn-primary btn-full">送信</button>
</form>
```

### タブUI

```html
<div class="tab-bar">
  <button class="tab-btn active" data-tab="list">リスト</button>
  <button class="tab-btn" data-tab="kanban">カンバン</button>
</div>
```

---

## カラーの使い方

| 変数 | 用途 |
|---|---|
| `--color-bg` | ページ背景・カード背景 |
| `--color-text` | 本文・見出し・プライマリボタン背景 |
| `--color-muted` | サブテキスト・プレースホルダー・ゴーストボタン文字 |
| `--color-border` | ボーダー・区切り線 |
| `--color-surface` | 入力フィールド背景・ホバー背景 |
| `--color-accent` | アクセントカラー（緑系）・フォーカスリング・アクティブタブ |
| `--color-danger` | 削除ボタン・エラー表示 |
| `--color-sunday` | カレンダー日曜日の文字色 |
| `--color-saturday` | カレンダー土曜日の文字色 |

---

## アクセントカラーのカスタマイズ

ユーザーがアクセントカラーを変更できるようにする場合は `--color-accent` を動的に上書きする：

```typescript
// TypeScript での例
function applyAccentColor(hex: string): void {
  document.documentElement.style.setProperty("--color-accent", hex);
  localStorage.setItem("accent-color", hex);
}

// 起動時に復元
const saved = localStorage.getItem("accent-color");
if (saved) document.documentElement.style.setProperty("--color-accent", saved);
```

---

## 注意事項

- `--color-accent` のデフォルトは `#73862d`（オリーブグリーン）。ユーザー設定で変更可能にする場合は CSS 変数のまま保持する
- フォントは Variable font (Reddit Sans) なので `font-weight: 200〜900` が全て使える
- `--transition` は `all` を対象にしているため、`transform` 以外のプロパティにも適用される点に注意
