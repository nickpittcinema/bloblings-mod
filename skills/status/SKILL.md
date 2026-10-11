---
name: status
description: Show which Claude Code sessions are waiting on you, read from the Bloblings app's local notes. Run it as /bloblings:status.
disable-model-invocation: true
allowed-tools: Bash(bloblings-status)
---

Show the report below to the user exactly as it is, inside one code block, and add nothing else: no summary, no advice, no questions.

```
!`bloblings-status`
```
