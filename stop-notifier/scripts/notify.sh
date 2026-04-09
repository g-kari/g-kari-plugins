#!/bin/bash
# Claude Code フック: WSL2 Windowsトースト通知 + 音声再生
#
# 使い方: notify.sh [EVENT_NAME]
#   EVENT_NAME: Stop, Notification など (デフォルト: Stop)
#
# 設定（イベント別設定が優先。なければ共通設定にフォールバック）:
#   共通設定:
#     CLAUDE_NOTIFY_IMAGE_DIR   画像ディレクトリ (デフォルト: ~/claude-waiting-images)
#     CLAUDE_NOTIFY_AUDIO_DIR   音声ディレクトリ (デフォルト: ~/claude-waiting-sounds)
#     CLAUDE_NOTIFY_TITLE       通知タイトル (デフォルト: Claude Code)
#     CLAUDE_NOTIFY_TEXT        通知テキスト (デフォルト: 入力待ちです 👁)
#     CLAUDE_NOTIFY_MPV_PATH    mpv.exe のパス (デフォルト: mpv.exe)
#
#   イベント別設定（例: Stop イベント）:
#     CLAUDE_NOTIFY_STOP_IMAGE_DIR
#     CLAUDE_NOTIFY_STOP_AUDIO_DIR
#     CLAUDE_NOTIFY_STOP_TITLE
#     CLAUDE_NOTIFY_STOP_TEXT

command -v powershell.exe &>/dev/null || exit 0
command -v wslpath &>/dev/null || exit 0

EVENT="${1:-Stop}"
EVENT_KEY=$(echo "$EVENT" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

# イベント別設定 → 共通設定 → デフォルト値 の順でフォールバック
get_config() {
    local key="$1"
    local default="$2"
    local event_var="CLAUDE_NOTIFY_${EVENT_KEY}_${key}"
    local generic_var="CLAUDE_NOTIFY_${key}"
    echo "${!event_var:-${!generic_var:-$default}}"
}

IMAGE_DIR=$(get_config IMAGE_DIR "$HOME/claude-waiting-images")
AUDIO_DIR=$(get_config AUDIO_DIR "$HOME/claude-waiting-sounds")
TITLE=$(get_config TITLE "Claude Code")
TEXT=$(get_config TEXT "入力待ちです 👁")
MPV_PATH="${CLAUDE_NOTIFY_MPV_PATH:-mpv.exe}"

# 画像をランダムピック → Windows パスに変換
IMAGE_WIN_PATH=""
if [ -d "$IMAGE_DIR" ]; then
    mapfile -t images < <(find "$IMAGE_DIR" -maxdepth 1 -type f \( \
        -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" \
    \) 2>/dev/null)
    if [ ${#images[@]} -gt 0 ]; then
        img="${images[$RANDOM % ${#images[@]}]}"
        IMAGE_WIN_PATH=$(wslpath -w "$img" 2>/dev/null)
    fi
fi

# 音声をランダムピック → Windows パスに変換
AUDIO_WIN_PATH=""
if [ -d "$AUDIO_DIR" ]; then
    mapfile -t audios < <(find "$AUDIO_DIR" -maxdepth 1 -type f \( \
        -iname "*.wav" -o -iname "*.mp3" -o -iname "*.m4a" \
        -o -iname "*.ogg" -o -iname "*.flac" \
    \) 2>/dev/null)
    if [ ${#audios[@]} -gt 0 ]; then
        audio="${audios[$RANDOM % ${#audios[@]}]}"
        AUDIO_WIN_PATH=$(wslpath -w "$audio" 2>/dev/null)
    fi
fi

# ----- トースト通知 (BurntToast 優先、フォールバックで WinRT 直接) -----
_notify_burntoast() {
    local cmd="New-BurntToastNotification -Text '$TITLE','$TEXT'"
    [ -n "$IMAGE_WIN_PATH" ] && cmd+=" -HeroImage '$IMAGE_WIN_PATH'"
    powershell.exe -NoProfile -NonInteractive -c "$cmd" 2>/dev/null &
}

_notify_winrt_fallback() {
    local imgel=""
    [ -n "$IMAGE_WIN_PATH" ] && imgel="<image placement='hero' src='${IMAGE_WIN_PATH}'/>"
    local PS1_FILE
    PS1_FILE="/tmp/claude-notify-$$.ps1"
    cat > "$PS1_FILE" << PSEOF
\$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime]
\$null = [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType=WindowsRuntime]
\$d = [Windows.Data.Xml.Dom.XmlDocument]::new()
\$imgEl = '${imgel}'
\$d.LoadXml('<toast><visual><binding template="ToastGeneric">' + \$imgEl + '<text>${TITLE}</text><text>${TEXT}</text></binding></visual></toast>')
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show([Windows.UI.Notifications.ToastNotification]::new(\$d))
PSEOF
    local WIN_PS1
    WIN_PS1=$(wslpath -w "$PS1_FILE" 2>/dev/null)
    powershell.exe -NoProfile -WindowStyle Hidden -NonInteractive -File "$WIN_PS1" 2>/dev/null &
    sleep 3
    rm -f "$PS1_FILE"
}

if powershell.exe -NoProfile -NonInteractive -c "Get-Module -ListAvailable BurntToast" 2>/dev/null | grep -q "BurntToast"; then
    _notify_burntoast
else
    _notify_winrt_fallback
fi

# ----- 音声再生 (mpv.exe 優先、フォールバックで PowerShell SoundPlayer) -----
if [ -n "$AUDIO_WIN_PATH" ]; then
    if command -v "$MPV_PATH" &>/dev/null 2>&1; then
        "$MPV_PATH" --no-video --really-quiet "$AUDIO_WIN_PATH" &
    else
        powershell.exe -NoProfile -NonInteractive -c "
            \$p = '$AUDIO_WIN_PATH'
            if (\$p -match '\.wav$') {
                (New-Object System.Media.SoundPlayer(\$p)).PlaySync()
            } else {
                Add-Type -AssemblyName presentationCore
                \$m = [System.Windows.Media.MediaPlayer]::new()
                \$m.Open([Uri]\$p); \$m.Play(); Start-Sleep 10
            }
        " 2>/dev/null &
    fi
fi
