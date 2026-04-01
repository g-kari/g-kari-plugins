# webauthn-front-design

katasu.me インスパイアのフロントエンドデザインシステムをプロジェクトに適用する Claude Code プラグイン。

## 概要

WebAuthn TODO アプリで使用しているデザインシステムをそのまま別プロジェクトに取り込めるスキルです。CSS 変数・コンポーネントクラス・HTML パターン・Google フォント設定を一式提供します。

## デザインの特徴

| 項目 | 内容 |
|---|---|
| カラーパレット | 温かみのある低彩度ブラウン系（katasu.me インスパイア） |
| フォント | Reddit Sans + IBM Plex Sans JP |
| アニメーション | cubic-bezier(0.16, 1, 0.3, 1) の弾むような ease |
| レイアウト | 768px 中央寄せ シングルカラム |
| 角丸 | 12px / 8px の2段階 |

## 主要な CSS 変数

```css
--color-bg: #fefbfb;      /* ページ背景 */
--color-text: #483030;    /* 本文・見出し */
--color-muted: #a39696;   /* サブテキスト */
--color-border: #dfd7d7;  /* ボーダー */
--color-surface: #f2f0f0; /* 入力フィールド背景 */
--color-accent: #73862d;  /* アクセント（オリーブグリーン） */
--color-danger: #ff340b;  /* 削除・エラー */
--radius: 12px;
--radius-sm: 8px;
```

## コンポーネント

- `.btn-primary` / `.btn-ghost` — プライマリ・ゴーストボタン
- `.btn-sm` / `.btn-lg` / `.btn-full` — サイズバリアント
- `.card` — カードコンテナ
- `.tab-btn` — タブボタン
- `.form-group` — フォームグループ（label + input）
- `.interactive-scale` / `.interactive-scale-sm` — ホバースケールエフェクト

## 使い方

```
WebAuthnのデザインを適用して
katasu.meスタイルにして
CSSシステムを入れて
```

スキルを呼び出すと、CSS 変数・コンポーネント定義・HTML パターンをプロジェクトのスタイルファイルに追加する手順を案内します。
