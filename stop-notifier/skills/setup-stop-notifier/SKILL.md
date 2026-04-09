---
name: setup-stop-notifier
description: "stop-notifier プラグインのセットアップスキル。notify.shを~/.local/bin/claude-stop-notifyにインストールし、BurntToast・mpv.exeの導入手順を案内する。ユーザーが「stop-notifierをセットアップ」「通知スクリプトをインストール」などと言ったときに使用する。"
---

# Setup Stop Notifier

`stop-notifier` プラグインの通知スクリプトをインストールするスキル。

## ワークフロー

### Step 1: インストール先ディレクトリの確認

```bash
mkdir -p ~/.local/bin
```

### Step 2: notify.sh を ~/.local/bin/claude-stop-notify にコピー

プラグインの `scripts/notify.sh` の内容を `~/.local/bin/claude-stop-notify` として書き出す。

### Step 3: 実行権限を付与

```bash
chmod +x ~/.local/bin/claude-stop-notify
```

### Step 4: PATH 確認

```bash
echo $PATH | grep -q "$HOME/.local/bin" || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### Step 5: BurntToast のインストール（推奨）

BurntToast があると画像付きトースト通知が使えて綺麗。なければ WinRT 直接呼び出しにフォールバックする（画像も使えるが手書き XML）。

```bash
powershell.exe -NoProfile -c "Install-Module -Name BurntToast -Force -Scope CurrentUser"
```

インストール確認：
```bash
powershell.exe -NoProfile -c "Get-Module -ListAvailable BurntToast"
```

### Step 6: mpv.exe のインストール（推奨）

mpv.exe があると WAV/MP3/M4A/OGG/FLAC ほぼ全形式の音声再生が使える。なければ PowerShell の SoundPlayer (WAV のみ) / MediaPlayer (MP3 等) にフォールバックする。

**winget でインストール:**
```bash
powershell.exe -NoProfile -c "winget install mpv-player.mpv"
```

**または mpv.io から手動ダウンロードして** 任意の場所に配置し、パスを設定：
```bash
echo 'export CLAUDE_NOTIFY_MPV_PATH="/mnt/c/tools/mpv/mpv.exe"' >> ~/.bashrc
```

### Step 7: 画像・音声ディレクトリの作成（任意）

```bash
mkdir -p ~/claude-waiting-images  # PNG / JPG / GIF → ランダムでトーストに表示
mkdir -p ~/claude-waiting-sounds  # WAV / MP3 / M4A / OGG / FLAC → ランダムで再生
```

### Step 8: 動作確認

```bash
source ~/.bashrc
claude-stop-notify Stop
```

Windowsトースト通知が表示されれば成功。

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
