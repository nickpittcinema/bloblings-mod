# Bloblings

**A pet for every Claude Code session.** A Claude Code mod that tells you which sessions are
waiting on you, plus a free Mac app that gives each one a little pet at the edge of your screen.

<!-- Hero GIF: a drawer of pets, one lights up, a click lands in the thread. 5 to 8 s, under 5 MB. -->

[**Get the free Mac app →**](https://bloblings.app/?ref=gh) · [See the one-click demo](https://bloblings.app/?ref=gh#jump)

## Install the mod

```bash
claude plugin marketplace add nickpittcinema/bloblings-mod
claude plugin install bloblings@bloblings
```

Then type **`/bloblings:status`** in any Claude Code session.

## What it does

**`/bloblings:status`** shows who's waiting on you, across every session and project:

```
2 Bloblings waiting on you.
✋ Landing page · website · needs your OK · 1m
✋ Launch copy · marketing · has a question · 3m
⚙ Finishing the edit · launch film · working: Editing: cuts/scene-04.md · 4m
✓ Website polish · website · finished · 1h 2m
```

The ones that need you come first. When nothing does, it says **"All Bloblings happy."**

**An optional status line.** Show "2 Bloblings waiting on you" under your prompt. Claude Code has
one status line per user, so the mod never takes yours over: you switch it on yourself (see
[Status line](#status-line)).

## Do I need the app?

**For anything to show, yes.** The mod reads the notes the Bloblings app keeps on your Mac. Without
the app, `/bloblings:status` just says hello:

```
 ╭─────╮
 │ ▮ ▮ │   No Bloblings here yet.
 │  ◡  │   Get the free Mac app, and every Claude Code session gets a pet
 ╰─┬─┬─╯   that waves when it needs you: https://bloblings.app/?ref=mod
```

**The app** puts a drawer on the edge of your screen with a pet for every session. It types while
the session edits, reads, hammers away at tests, and lights up when a session needs your OK or has
a question. One click opens that thread. It also works with Codex. Free, for macOS 15 or later.

## Status line

Claude Code shows one status line, set in `~/.claude/settings.json`. The installed plugin keeps
its script under a versioned folder, so point the setting at a command that finds the newest
installed copy each time it runs. No copy step, and it keeps working after updates:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \"$(ls -d \"$HOME\"/.claude/plugins/cache/bloblings/bloblings/*/ | sort -V | tail -1)statusline/bloblings-statusline.sh\""
  }
}
```

It prints `2 Bloblings waiting on you`, `1 Blobling waiting on you`, or `All Bloblings happy`.
Plain text, no colour codes. If you already have a status line, add that command to it instead
of replacing it.

## Privacy

- **Read-only.** The mod reads the Bloblings app's notes and Claude Code's own session list on your
  Mac. It writes nothing of its own.
- **Local.** Nothing leaves your Mac. No accounts, no analytics, no network calls.
- **Never approves anything.** Bloblings shows you who's waiting. You answer in Claude Code.
- **Plays nicely with your hooks.** The mod adds the Bloblings hook beside yours. If the app has
  already connected itself, the mod stays out of the way. The hook takes a few milliseconds and
  never slows Claude down. It only turns away a new helper if you've set a limit in the app.

## Check your download

The Mac app is signed with Nick Pitt's Apple Developer ID and notarised by Apple. Before you open
it, you can check that your copy is the real one. Its signing team must be **3Q6R3YFMWP**:

```bash
codesign -dv /Applications/Bloblings.app 2>&1 | grep TeamIdentifier
```

The download's SHA-256 should match the one listed here (`shasum -a 256 Bloblings-*.dmg`):

| Version | SHA-256 of the .dmg |
|---|---|
| 1.0.26 | `2f1d041de2649222410ed2b032d660d1d021de422ea46893da989257dcfc6cf5` |
| 1.0.25 | `e57b7983c6563c14e6e2bf8b5973954a68358047246f276a21bf4589af9880a5` |
| 1.0.22 | `bbfb8573922fcfaf959b8c6434d9972283215e1e2a119370c19af4956f4ff94f` |
| 1.0.21 | `0a8cbe324070445fce20701e2497f975e4656a7f63df231d4f63b546d492cf27` |
| 1.0.20 | `24a857523d00b00f4e8e5b1cd5c89ee2674537ad57db1aa4bf9e2492ecb36433` |
| 1.0.19 | `41367d0c2743567cdc3bc1a8245e6a7829f6ead7f03e6ec7ef95fd00109df477` |
| 1.0.18 | `2007ff01c51800cdf8a68289f5e5875c605e4c1afdf6cf3edb8ed4dc998940af` |

If either doesn't match, don't open it, and please open an issue here.

## Found a bug or want a feature?

Email [hello@bloblings.app](mailto:hello@bloblings.app), or [open an issue](https://github.com/nickpittcinema/bloblings-mod/issues).

## FAQ

**Why a mod and an app?** The mod lives inside Claude Code, so you can check from wherever you're
typing. The app lives at the edge of your screen, so you see it while you're in another app
entirely.

**Windows or Linux?** The app is Mac only for now. Without it, the mod has nothing to show.

**Is it open source?** The mod is, under MIT: everything in this repo. The app is free and closed
for now.

**Codex?** The app works with Codex. This mod is for Claude Code.

## Made by Nick Pitt

© 2026 Nick Pitt. Bloblings is an independent project and is not affiliated with, endorsed by or
sponsored by Anthropic. Claude and Claude Code are trademarks of Anthropic, PBC. All Bloblings are
original characters.
