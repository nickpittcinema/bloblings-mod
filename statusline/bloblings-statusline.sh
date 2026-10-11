#!/bin/bash
# Optional status line for Claude Code: "2 Bloblings waiting on you" or "All Bloblings happy".
# Wire it in yourself (Claude Code has one status line per user, so the mod doesn't take it over):
#   "statusLine": { "type": "command", "command": "~/.claude/plugins/.../statusline/bloblings-statusline.sh" }
# Read-only, local. Plain text, no colour codes.
dir="$HOME/Library/Application Support/Bloblings/sessions"
[ -d "$dir" ] && command -v jq >/dev/null 2>&1 || { echo "Bloblings"; exit 0; }
shopt -s nullglob
files=("$dir"/*.json)
[ ${#files[@]} -gt 0 ] || { echo "Bloblings"; exit 0; }
n=$(jq -rs --argjson now "$(date +%s)" '[ .[] | select(.parent == null) | select(($now - (.ts / 1000)) < 8 * 3600) | select(.state == "waiting" or .state == "question" or .state == "plan") ] | length' "${files[@]}" 2>/dev/null)
case "$n" in
  ""|0) echo "All Bloblings happy" ;;
  1) echo "1 Blobling waiting on you" ;;
  *) echo "$n Bloblings waiting on you" ;;
esac
