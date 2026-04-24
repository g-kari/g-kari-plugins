---
name: setup-stop-notifier
description: "stop-notifier プラグインのセットアップスキル。BurntToast・mpv.exeの導入手順を案内する。ユーザーが「stop-notifierをセットアップ」「通知スクリプトをインストール」などと言ったときに使用する。"
---

# Setup Stop Notifier

`stop-notifier` プラグインの依存ツールをインストールするスキル。

プラグインインストール後、hooks は自動で有効になります。
BurntToast と mpv.exe を入れると通知品質が上がります。

## ワークフロー

### Step 1: BurntToast のインストール（推奨）

BurntToast があると画像付きトースト通知が使えて綺麗。なければ WinRT 直接呼び出しにフォールバックする（画像も使えるが手書き XML）。

```bash
powershell.exe -NoProfile -c "Install-Module -Name BurntToast -Force -Scope CurrentUser"
```

インストール確認：
```bash
powershell.exe -NoProfile -c "Get-Module -ListAvailable BurntToast"
```

### Step 2: mpv.exe のインストール（推奨）

mpv.exe があると WAV/MP3/M4A/OGG/FLAC ほぼ全形式の音声再生が使える。なければ PowerShell の SoundPlayer (WAV のみ) / MediaPlayer (MP3 等) にフォールバックする。

**winget でインストール:**
```bash
powershell.exe -NoProfile -c "winget install mpv-player.mpv"
```

**または mpv.io から手動ダウンロードして** 任意の場所に配置し、パスを設定：
```bash
echo 'export CLAUDE_NOTIFY_MPV_PATH="/mnt/c/tools/mpv/mpv.exe"' >> ~/.bashrc
```

### Step 3: 画像・音声ディレクトリの作成（任意）

```bash
mkdir -p ~/claude-waiting-images  # PNG / JPG / GIF → ランダムでトーストに表示
mkdir -p ~/claude-waiting-sounds  # WAV / MP3 / M4A / OGG / FLAC → ランダムで再生
```

### Step 4: 動作確認

プラグインインストール済みであれば、Claude が応答を完了するたびに自動で通知が飛ぶ。
手動テストする場合：

```bash
bash "$(claude plugin path stop-notifier)/scripts/notify.sh" Stop
```

## 完了後のメッセージ

```
セットアップ完了！

Claude が応答を終えるたびに Windows トースト通知が表示されます。

画像: ~/claude-waiting-images/ に PNG/JPG/GIF を置く
音声: ~/claude-waiting-sounds/ に WAV/MP3/OGG 等を置く

カスタマイズ（~/.bashrc に追加）:
  export CLAUDE_NOTIFY_IMAGE_DIR=~/your-images
  export CLAUDE_NOTIFY_AUDIO_DIR=~/your-sounds
  export CLAUDE_NOTIFY_MPV_PATH="/mnt/c/tools/mpv/mpv.exe"
  export CLAUDE_NOTIFY_TITLE="Your Title"
  export CLAUDE_NOTIFY_TEXT="Your Message"

イベント別設定（例: Stop だけ別画像フォルダ）:
  export CLAUDE_NOTIFY_STOP_IMAGE_DIR=~/stop-images
  export CLAUDE_NOTIFY_NOTIFICATION_TEXT="通知きたよ"
```
