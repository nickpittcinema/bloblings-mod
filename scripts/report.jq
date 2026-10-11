# Bloblings report: one line per Claude Code session seen in the last 8 hours, waiting ones first.
# Input (slurped): the app's status records (have "id") and Claude Code's own session registry
# entries (have "sessionId" and "name"), which carry the thread names.
def ago: ($now - (. / 1000 | floor)) as $s
  | if $s < 60 then "\($s)s"
    elif $s < 3600 then "\(($s / 60) | floor)m"
    else "\(($s / 3600) | floor)h \((($s % 3600) / 60) | floor)m" end;
def waiting: .state == "waiting" or .state == "question" or .state == "plan";
def state_label:
  if .state == "waiting" then "needs your OK"
  elif .state == "question" then "has a question"
  elif .state == "plan" then "plan ready for you"
  elif .state == "done" then "finished"
  elif .state == "idle" then "idle"
  elif .state == "working" then "working" + (if .detail then ": " + (.detail | .[0:60]) else "" end)
  elif .state == "start" then "starting"
  else .state end;
def mark: if waiting then "✋" elif .state == "done" then "✓" elif .state == "working" then "⚙" else "·" end;
( [ .[] | select(has("sessionId")) | { key: .sessionId, value: (.name // "") } ] | from_entries ) as $names
| [ .[] | select(has("id")) | select(.parent == null) | select(($now - (.ts / 1000)) < 8 * 3600)
    | . + { title: ((.title // $names[.id] // "") | if . == "" then "Untitled thread" else . end) } ] as $all
| ($all | map(select(waiting)) | length) as $waiting
| ( if ($all | length) == 0 then "No Bloblings out in the last 8 hours."
    elif $waiting == 0 then "All Bloblings happy: nothing waiting on you."
    elif $waiting == 1 then "1 Blobling waiting on you."
    else "\($waiting) Bloblings waiting on you." end ),
  ( $all
    | sort_by((if waiting then 0 else 1 end), -(.ts))
    | .[]
    | "\(mark) \(.title) · \(.project // "") · \(state_label) · \((.since // .ts) | ago)" )
