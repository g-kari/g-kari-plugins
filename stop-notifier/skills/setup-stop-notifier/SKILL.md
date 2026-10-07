---
name: setup-stop-notifier
description: "stop-notifier プラグインのセットアップスキル。BurntToast・mpv.exeの導入手順を案内する。ユーザーが「stop-notifierをセットアップ」「通知スクリプトをインストール」などと言ったときに使用する。"
---

## ホストと環境

このスキルの通知スクリプトは WSL2 + Windows 用。まず `powershell.exe` / `wslpath` の存在を確認し、Linux/macOS のクラウド環境で Windows ツールを導入しない。Claude 用 hooks は維持しているが、Codex では自動登録しない。Codex の場合は依存導入・ユーザー指定のスクリプトパスでの手動テストまでを行い、Codex 自動通知設定を完了したと報告しない。hook 登録を別途依頼されたら対象バージョンの公式仕様・許可を確認する。

# Setup Stop Notifier

`stop-notifier` プラグインの依存ツールをインストールするスキル。

Claude Code ではプラグインの hooks を利用します（ホストの信頼・許可設定に従う）。Codex ではこの配布の hooks は無効です。
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

Claude Code で hooks が許可・有効なら、応答完了時に通知する。Codex では自動通知は設定されない。
手動テストする場合：

```bash
bash "/verified/path/to/stop-notifier/scripts/notify.sh" Stop
```

## 完了後のメッセージ

Codex では「Windows 用依存の確認・手動テスト完了。自動通知 hooks は未設定」と結果に合わせて伝える。以下の自動通知文は、Claude Code で hooks が有効なことを確認した場合のみ使う。

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
