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
#     CLAUDE_NOTIFY_DISPLAY       表示モード: toast (デフォルト) / browser / wpf / both
#     CLAUDE_NOTIFY_DURATION      表示秒数 (デフォルト: 5)
#     CLAUDE_NOTIFY_CLICKTHROUGH  wpfモードでクリックを透過するか: false (デフォルト) / true
#
#   イベント別設定（例: Stop イベント）:
#     CLAUDE_NOTIFY_STOP_IMAGE_DIR
#     CLAUDE_NOTIFY_STOP_AUDIO_DIR
#     CLAUDE_NOTIFY_STOP_TITLE
#     CLAUDE_NOTIFY_STOP_TEXT
#     CLAUDE_NOTIFY_STOP_DISPLAY

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
DISPLAY_MODE=$(get_config DISPLAY "toast")
DURATION=$(get_config DURATION "5")
CLICKTHROUGH=$(get_config CLICKTHROUGH "false")

# 画像をランダムピック
IMAGE_LINUX_PATH=""
IMAGE_WIN_PATH=""
if [ -d "$IMAGE_DIR" ]; then
    mapfile -t images < <(find "$IMAGE_DIR" -maxdepth 1 -type f \( \
        -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" \
    \) 2>/dev/null)
    if [ ${#images[@]} -gt 0 ]; then
        IMAGE_LINUX_PATH="${images[$RANDOM % ${#images[@]}]}"
        IMAGE_WIN_PATH=$(wslpath -w "$IMAGE_LINUX_PATH" 2>/dev/null)
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

# ----- WPF 透過ウィンドウ -----
_notify_wpf() {
    local PS1_FILE="/tmp/claude-notify-wpf-$$.ps1"
    local clickthrough_code=""
    if [ "$CLICKTHROUGH" = "true" ]; then
        clickthrough_code='
    $helper = New-Object System.Windows.Interop.WindowInteropHelper($w)
    $hwnd = $helper.Handle
    $cur = [WinAPI]::GetWindowLong($hwnd, -20)
    [WinAPI]::SetWindowLong($hwnd, -20, $cur -bor 0x80000 -bor 0x20) | Out-Null'
    fi

    cat > "$PS1_FILE" << PSEOF
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

Add-Type @'
using System;
using System.Runtime.InteropServices;
public class WinAPI {
    [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr h, int i);
    [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr h, int i, int v);
}
'@

\$w = New-Object System.Windows.Window
\$w.WindowStyle        = 'None'
\$w.AllowsTransparency = \$true
\$w.Background         = [System.Windows.Media.Brushes]::Transparent
\$w.WindowState        = 'Maximized'
\$w.Topmost            = \$true

\$grid = New-Object System.Windows.Controls.Grid

$(if [ -n "$IMAGE_WIN_PATH" ]; then cat << IMGEOF
\$bmp = New-Object System.Windows.Media.Imaging.BitmapImage
\$bmp.BeginInit()
\$bmp.UriSource = [Uri]'${IMAGE_WIN_PATH}'
\$bmp.EndInit()
\$img = New-Object System.Windows.Controls.Image
\$img.Source  = \$bmp
\$img.Stretch = 'Uniform'
\$img.HorizontalAlignment = 'Center'
\$img.VerticalAlignment   = 'Center'
\$grid.Children.Add(\$img) | Out-Null
IMGEOF
fi)

\$sp = New-Object System.Windows.Controls.StackPanel
\$sp.VerticalAlignment   = 'Bottom'
\$sp.HorizontalAlignment = 'Center'
\$sp.Margin = [System.Windows.Thickness]::new(0, 0, 0, 40)

\$t1 = New-Object System.Windows.Controls.TextBlock
\$t1.Text       = '${TITLE}'
\$t1.Foreground = [System.Windows.Media.Brushes]::White
\$t1.FontSize   = 28
\$t1.FontWeight = 'Bold'
\$t1.HorizontalAlignment = 'Center'
\$t1.Effect = [System.Windows.Media.Effects.DropShadowEffect]@{ Color='Black'; BlurRadius=8; ShadowDepth=2 }

\$t2 = New-Object System.Windows.Controls.TextBlock
\$t2.Text       = '${TEXT}'
\$t2.Foreground = [System.Windows.Media.Brushes]::White
\$t2.FontSize   = 18
\$t2.Opacity    = 0.75
\$t2.HorizontalAlignment = 'Center'
\$t2.Effect = [System.Windows.Media.Effects.DropShadowEffect]@{ Color='Black'; BlurRadius=6; ShadowDepth=1 }
\$t2.Margin = [System.Windows.Thickness]::new(0, 8, 0, 0)

\$sp.Children.Add(\$t1) | Out-Null
\$sp.Children.Add(\$t2) | Out-Null
\$grid.Children.Add(\$sp) | Out-Null

\$w.Content = \$grid
${clickthrough_code}

\$w.Add_MouseLeftButtonDown({ \$w.Close() })

\$timer = New-Object System.Windows.Threading.DispatcherTimer
\$timer.Interval = [TimeSpan]::FromSeconds(${DURATION})
\$timer.Add_Tick({ \$w.Close() })
\$timer.Start()

$(if [ -n "$AUDIO_WIN_PATH" ]; then cat << AUDIOEOF
\$media = New-Object System.Windows.Media.MediaPlayer
\$media.Open([Uri]'${AUDIO_WIN_PATH}')
\$media.Play()
AUDIOEOF
fi)

\$w.ShowDialog() | Out-Null
PSEOF

    local WIN_PS1
    WIN_PS1=$(wslpath -w "$PS1_FILE" 2>/dev/null)
    powershell.exe -NoProfile -WindowStyle Hidden -NonInteractive -File "$WIN_PS1" 2>/dev/null &
    { sleep $(( DURATION + 10 )) && rm -f "$PS1_FILE"; } &
}

# ----- ブラウザ表示 -----
_notify_browser() {
    local html_file="/tmp/claude-notify-$$.html"
    local img_tag=""
    local audio_tag=""

    if [ -n "$IMAGE_WIN_PATH" ]; then
        local img_url
        img_url="file:///$(echo "$IMAGE_WIN_PATH" | sed 's/\\/\//g')"
        img_tag="<img src=\"${img_url}\" alt=\"\">"
    fi

    if [ -n "$AUDIO_WIN_PATH" ]; then
        local audio_url
        audio_url="file:///$(echo "$AUDIO_WIN_PATH" | sed 's/\\/\//g')"
        audio_tag="<audio src=\"${audio_url}\" autoplay></audio>"
    fi

    cat > "$html_file" << HTMLEOF
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    background: #0a0a0a;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    overflow: hidden;
    font-family: 'Segoe UI', sans-serif;
    animation: fadeIn .4s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  .fade-out { animation: fadeOut .5s ease forwards; }
  img {
    max-width: 100vw; max-height: 85vh;
    object-fit: contain;
  }
  .text-block {
    margin-top: 24px;
    text-align: center;
    color: #fff;
  }
  .title { font-size: 1.6rem; font-weight: 600; letter-spacing: .05em; }
  .body  { font-size: 1.1rem; opacity: .7; margin-top: 6px; }
  .bar {
    position: fixed; bottom: 0; left: 0;
    height: 4px; background: #fff;
    width: 100%;
    transform-origin: left;
    animation: shrink ${DURATION}s linear forwards;
  }
  @keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }
</style>
</head>
<body>
  ${img_tag}
  <div class="text-block">
    <div class="title">${TITLE}</div>
    <div class="body">${TEXT}</div>
  </div>
  <div class="bar"></div>
  ${audio_tag}
  <script>
    const ms = ${DURATION} * 1000;
    setTimeout(() => {
      document.body.classList.add('fade-out');
      setTimeout(() => window.close(), 500);
    }, ms);
  </script>
</body>
</html>
HTMLEOF

    local win_html
    win_html=$(wslpath -w "$html_file" 2>/dev/null)
    explorer.exe "$win_html" 2>/dev/null &

    # ブラウザが読み込んでから削除
    { sleep $(( DURATION + 5 )) && rm -f "$html_file"; } &
}

# ----- トースト通知 (BurntToast 優先、フォールバックで WinRT 直接) -----
_notify_burntoast() {
    local cmd="New-BurntToastNotification -Text '$TITLE','$TEXT'"
    [ -n "$IMAGE_WIN_PATH" ] && cmd+=" -HeroImage '$IMAGE_WIN_PATH'"
    powershell.exe -NoProfile -NonInteractive -c "$cmd" 2>/dev/null &
}

_notify_winrt_fallback() {
    local imgel=""
    [ -n "$IMAGE_WIN_PATH" ] && imgel="<image placement='hero' src='${IMAGE_WIN_PATH}'/>"
    local PS1_FILE="/tmp/claude-notify-$$.ps1"
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
    sleep 3 && rm -f "$PS1_FILE" &
}

_notify_toast() {
    if powershell.exe -NoProfile -NonInteractive -c "Get-Module -ListAvailable BurntToast" 2>/dev/null | grep -q "BurntToast"; then
        _notify_burntoast
    else
        _notify_winrt_fallback
    fi
}

# ----- 表示モードで分岐 -----
case "$DISPLAY_MODE" in
    browser) _notify_browser ;;
    wpf)     _notify_wpf ;;
    both)    _notify_toast; _notify_browser ;;
    *)       _notify_toast ;;
esac

# ----- 音声再生 (mpv.exe 優先、フォールバックで PowerShell SoundPlayer) -----
# browser/wpf モードは内部で音声再生するのでスキップ
if [ -n "$AUDIO_WIN_PATH" ] && [[ "$DISPLAY_MODE" != "browser" && "$DISPLAY_MODE" != "wpf" ]]; then
    if command -v "$MPV_PATH" &>/dev/null 2>&1; then
        "$MPV_PATH" --no-video --really-quiet "$AUDIO_WIN_PATH" &
    else
        powershell.exe -NoProfile -NonInteractive -c "
            \$p = '$AUDIO_WIN_PATH'
            if (\$p -match '\.wav\$') {
                (New-Object System.Media.SoundPlayer(\$p)).PlaySync()
            } else {
                Add-Type -AssemblyName presentationCore
                \$m = [System.Windows.Media.MediaPlayer]::new()
                \$m.Open([Uri]\$p); \$m.Play(); Start-Sleep 10
            }
        " 2>/dev/null &
    fi
fi
