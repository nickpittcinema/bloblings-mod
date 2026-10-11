# Bloblings

**A pet for every Claude Code session.** This mod shows who's waiting on you, from inside Claude Code. The free Mac app gives each session a pet at the edge of your screen.

<!-- Hero GIF goes here: a drawer of pets, one lights up, a click lands in the thread. -->

[**Get the Mac app, free →**](https://bloblings.app/?ref=gh)

## Install

Add the marketplace once, then install the plugin:

```bash
claude plugin marketplace add nickpittcinema/bloblings-mod
claude plugin install bloblings@bloblings
```

Then get the app: <https://bloblings.app/?ref=gh>. The app connects itself to Claude Code the first time you open it.

## What you get

**`/bloblings:status`** prints who's waiting on you:

```
2 Bloblings waiting on you.
✋ Landing page · website · needs your OK · 1m
✋ Launch copy · marketing · has a question · 3m
⚙ Finishing the edit · launch film · working: Editing: cuts/scene-04.md · 4m
✓ Website polish · website · finished · 1h 2m
```

Without the app installed, it says so and points you at the download:

```
   ___
  (o o)   No Bloblings here yet.
  /   \   Get the free Mac app, and every Claude Code session gets a pet
 (_____)  that waves when it needs you: https://bloblings.app/?ref=mod
```

**An optional status line.** Claude Code has one status line per user, so the mod doesn't take it over. To show "2 Bloblings waiting on you" (or "All Bloblings happy") under your prompt, point your `statusLine` setting at `statusline/bloblings-statusline.sh` in the installed plugin.

**The app's hook, handled.** The mod registers the Bloblings hook for you. When the app is installed, each Claude Code event reaches it; when the app has already connected itself, the mod stays out of the way. The hook takes a few milliseconds and never blocks Claude.

## Privacy

- **Read-only.** The mod reads the notes the Bloblings app keeps on your Mac and Claude Code's own session list. It writes nothing of its own.
- **Local.** Nothing leaves your Mac. No accounts, no analytics, no network calls.
- **Never approves anything.** Bloblings shows you who's waiting; you answer in Claude Code.

## Scope

This mod is for Claude Code. The Mac app also works with Codex and, through a short guide, other agents. The mod is open source (MIT); the app is free and closed for now.

## Made by Nick Pitt

© 2026 Nick Pitt. Bloblings is an independent project and is not affiliated with, endorsed by or sponsored by Anthropic. Claude and Claude Code are trademarks of Anthropic, PBC. All Bloblings are original characters.
