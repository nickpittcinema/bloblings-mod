// Bloblings exact sensor. Runs inside Claude Code and writes one small JSON record per session
// to the Bloblings app's folder, so the pets change state the moment Claude does: a permission
// prompt the instant the dialog opens (cleared when it's answered), a question the instant
// AskUserQuestion is drawn, a turn the user started versus one Claude Code started by itself
// (a background task finishing), plus tokens, cost and the helpers' states.
// Watch-only: it never answers, approves or changes anything. Nothing leaves the Mac.
import type { Register } from 'claude-code'

type State = 'idle' | 'working' | 'waiting' | 'question' | 'plan' | 'done' | 'ended'
type Pending = { tool: string; detail: string; since: number; agentId?: string }
type Dialog = { kind: 'question' | 'plan'; text: string; since: number }

const USER_ORIGINS = new Set(['composer', 'bridge', 'sdk'])
const DIALOG_TOOLS = new Set(['AskUserQuestion', 'ExitPlanMode'])

// The session's state, shared by the hooks below (starts over on a reload).
let sessionId = ''
let dir = ''
let cwd = ''
let model = ''
let since = 0
let lastState: State = 'idle'
let lastUserPrompt = 0
let nextOrigin = 'composer'
let turn: { id: string; origin: string; startedAt: number } | null = null
let turnIsUsers = false
let userTurnDone = false
let usage: { tokens?: number; window?: number; percent?: number; usd?: number } | null = null
let helpers: { id: string; description: string; status: string }[] = []
// Tool calls the person is being asked about, by tool_use_id: the permission dialog is open.
const asks = new Map<string, Pending>()
// Dialog tools (a question, a plan) in flight, by tool_use_id.
const dialogs = new Map<string, Dialog>()

function detailOf(tool: string, input: unknown): string {
  const i = (input ?? {}) as Record<string, unknown>
  for (const key of ['description', 'file_path', 'notebook_path', 'url', 'pattern', 'query']) {
    const v = i[key]
    if (typeof v === 'string' && v.trim()) return v.length > 120 ? v.slice(0, 120) : v
  }
  return tool
}

function stateNow(): State {
  if (asks.size > 0) return 'waiting'
  for (const d of dialogs.values()) return d.kind === 'plan' ? 'plan' : 'question'
  if (turn && turnIsUsers) return 'working'
  if (userTurnDone) return 'done'
  return 'idle'
}

async function write($: any, ended = false) {
  if (!sessionId || !dir) return
  const now = await $.clock.now()
  const state: State = ended ? 'ended' : stateNow()
  if (state !== lastState) { lastState = state; since = now }
  const firstAsk = asks.size > 0 ? [...asks.values()][0] : null
  const firstDialog = dialogs.size > 0 ? [...dialogs.values()][0] : null
  const record = {
    version: 1, id: sessionId, ts: now, since, state,
    prompt: firstAsk,
    question: firstDialog ? { text: firstDialog.text, since: firstDialog.since } : null,
    turn, lastUserPrompt, usage, helpers, cwd, model,
  }
  try { await $.fs.write(`${dir}/${sessionId}.json`, JSON.stringify(record)) } catch {}
}

async function refreshUsage($: any) {
  try {
    const u = await $.session.usage()
    usage = { tokens: u.context?.tokens, window: u.context?.window, percent: u.context?.percent, usd: u.cost?.usd }
  } catch {}
}

async function refreshHelpers($: any) {
  try {
    const list = await $.agent.list()
    helpers = list.map((a: any) => ({ id: a.id, description: a.description, status: a.status }))
  } catch {}
}

async function start($: any) {
  sessionId = await $.session.id()
  cwd = await $.session.cwd()
  model = await $.session.model()
  const home = await $.env.get('HOME')
  dir = `${home}/Library/Application Support/Bloblings/exact`
  try { await $.process.run(['/bin/mkdir', '-p', dir]) } catch {}
  try { await $.process.run(['/bin/chmod', '700', dir]) } catch {}
  since = await $.clock.now()
  await refreshUsage($)
  await write($)
  // The record is the user's alone, like the app's own status files.
  try { await $.process.run(['/bin/chmod', '600', `${dir}/${sessionId}.json`]) } catch {}
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    try { await start($) } catch {}
    return result
  })

  on('prompt.submit', async ($, e, next) => {
    nextOrigin = e.origin?.kind ?? 'unclassified'
    if (USER_ORIGINS.has(nextOrigin)) {
      lastUserPrompt = await $.clock.now()
      userTurnDone = false
      // The person typed: anything they were being asked is over, whatever order events land in.
      asks.clear(); dialogs.clear()
    }
    const result = await next(e)
    await write($)
    return result
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    if (!(e as any).agentId) {
      turn = { id: e.turnId, origin: nextOrigin, startedAt: await $.clock.now() }
      turnIsUsers = USER_ORIGINS.has(nextOrigin)
      await write($)
    }
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const id = (e as any).tool_use_id as string | undefined
    const tool = (e as any).tool as string
    if (id && DIALOG_TOOLS.has(tool)) {
      let text = tool === 'ExitPlanMode' ? 'Plan ready for your approval' : 'Has a question'
      const qs = (e as any).questions
      if (Array.isArray(qs) && qs[0] && typeof qs[0].question === 'string') text = qs[0].question
      dialogs.set(id, { kind: tool === 'ExitPlanMode' ? 'plan' : 'question', text, since: await $.clock.now() })
      await write($)
    }
    if (tool === 'Agent') await refreshHelpers($)
    try {
      return await next(e)
    } finally {
      if (id) { asks.delete(id); dialogs.delete(id) }
      for (const [k, a] of asks) if (k.startsWith(`${tool}@`) && a.tool === tool) asks.delete(k)
      if (tool === 'Agent') await refreshHelpers($)
      await write($)
    }
  }).catch(($, e, next) => next(e))

  // The permission dialog is actually on screen: Claude Code raises PermissionRequest only then
  // (a verdict of "ask" that auto mode's reviewer settles silently never reaches it).
  on('classic.PermissionRequest' as any, async ($: any, e: any, next: any) => {
    const tool = typeof e.tool_name === 'string' ? e.tool_name : 'tool'
    const id = typeof e.tool_use_id === 'string' ? e.tool_use_id : `${tool}@${await $.clock.now()}`
    if (!DIALOG_TOOLS.has(tool)) {
      asks.set(id, { tool, detail: detailOf(tool, e.tool_input), since: await $.clock.now(), agentId: typeof e.agent_id === 'string' ? e.agent_id : undefined })
      await write($)
    }
    return next(e)
  }).catch(($: any, e: any, next: any) => next(e))

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (!(e as any).agentId) {
      if (turnIsUsers) userTurnDone = true
      turn = null
      await refreshUsage($)
      await refreshHelpers($)
      await write($)
    }
    return result
  })

  on('session.end', async ($, e, next) => {
    await write($, true)
    return next(e)
  })
}
