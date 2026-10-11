#!/bin/bash
# Bloblings mod hook: hands each Claude Code event to the Bloblings app's own hook script,
# when the app is installed and hasn't already registered that script itself.
# Read-only, local, never blocks: prints nothing and always exits 0.
exec >/dev/null 2>&1
app_hook="$HOME/Library/Application Support/Bloblings/hook/status.sh"
[ -x "$app_hook" ] || exit 0
# The app connected itself (its hook is in settings.json): it already gets every event.
/usr/bin/grep -qs "Bloblings/hook/status.sh" "$HOME/.claude/settings.json" && exit 0
exec "$app_hook"
