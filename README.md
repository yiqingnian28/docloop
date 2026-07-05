# docloop

[简体中文](./README.zh-CN.md)

> A project-documentation maintenance mechanism for AI-assisted development: truth is rewritten in place, work-in-progress is frozen per iteration, history leaves the context by default — so the doc tree always stays within what a model's context window can actually handle.

## The problem

AI-era project docs live inside a built-in contradiction:

- agents need **accurate, detailed** context (requirements, design, conventions) to do real work;
- but requirements keep changing, changes cascade (PRD → design → code), change records pile up, and the docs eventually **outgrow the model's context window** — and the humans' patience.

docloop's answer: **layer knowledge by its age, give "change" a home of its own, and enforce size budgets plus periodic health checks so docs can't get fat or rot.**

## Core model

| Layer | Nature | Growth law |
|---|---|---|
| `docs/truth/` | Current design truth, **rewritten** in place | grows only with system complexity |
| `docs/now/` | This iteration's live docs (tasks / change orders / inbox) | grows within an iteration, **cleared** at settle |
| `docs/past/` | Frozen iteration packages, append-only | grows with time, **out of context by default** |

Five invariants (the constitution):

1. **Truth grows with complexity, not time** — rewrite, never append; no timelines inside truth (history belongs to git and `past/`).
2. **`now/` is cleared every iteration** — frozen wholesale into `past/`; the new iteration starts clean.
3. **`past/` stays out of the model context** — the only citable history is each iteration's one-page `summary.md`.
4. **Rule files (AGENTS.md) hold rules only** — project status lives solely in `now/iteration.md`.
5. **Requirement-driven rewrites of the authoritative layer must pass change-order (CH) adjudication** — raw material (meeting notes / chat) never becomes an implementation basis directly.

## The loop

`open iteration → record changes (CH) → lint → settle & freeze` — the four rituals that give docloop its name.

- **Changes flow one way**: inbox (raw, stored as-is) → AI drafts a CH with a **conflict report** (checked against the item ledger, truth incl. decisions, and this iteration's CHs) → a named human adjudicates → only then is the authoritative layer rewritten.
- **Upstream docs (PRD / design specs) enter as anchor + digest + item ledger** — never a full copy. The digest (≤150 lines) handles alignment; the per-item ledger handles completeness: at settle every item must be implemented (with evidence), explicitly deferred, or explicitly rejected. Nothing disappears silently.
- **Size is a hard gauge**: per-file budgets, plus the boot set (what an agent must read to start work) is actually computed per open task and capped.

## Quick start

1. **Install the skill** — copy `skills/docloop/` into your agent's skill directory (Claude Code: `.claude/skills/docloop/`; Codex and others: keep a `skills/` folder in the workspace and route via AGENTS.md).
2. **Initialize a project** — tell the agent:

```text
Use docloop to initialize this project's documentation (init).
```

The init ritual builds the three-layer `docs/` skeleton, writes the AGENTS.md section (boot protocol, rules, sdd-riper path mapping), and opens the first iteration.

3. **Health-check anytime** (zero-dependency, Node ≥18):

```text
node <skill-dir>/scripts/docloop_lint.mjs [project-root]
```

Six checks: structure & naming · size budgets (lines + bytes) · dead links & ID references · rot detection (`verified:` date vs git activity on `code:` globs) · orphaned ledger items · inbox backlog. **Red blocks settlement (exit 1); yellow reminds.**

## Works with sdd-riper

[sdd-riper](https://github.com/huisezhiyin/sdd-riper) drives **how a single task moves forward** (RIPER gates, checkpoints, evidence-based acceptance); docloop governs **where knowledge lives, how it flows, how it ages**. A docloop task package *is* the sdd-riper Feature Spec — the same file, routed via AGENTS.md path mapping. Recommended pairing, not a hard dependency: without sdd-riper the task package degrades to a plain task doc and the mechanism still runs.

## Repository map

| Path | What it is |
|---|---|
| [`skills/docloop/`](skills/docloop/README.md) | The installable skill: kernel (`SKILL.md`), five rituals, all templates, lint script, Codex adapter |
| [`docs/truth/mechanism/`](docs/truth/mechanism/README.md) | The mechanism's full specification — the skill is its distribution; truth wins |
| [`docs/truth/decisions.md`](docs/truth/decisions.md) | Standing decisions (D-001+) |
| [`examples/mini/`](examples/mini/README.md) | Complete two-iteration lifecycle walkthrough (a tiny bookmark manager) |
| [`docs/now/iteration.md`](docs/now/iteration.md) | Current iteration — project status lives only here |

**Self-hosted**: this repository maintains itself with docloop. Its first change order, first settlement and first frozen iteration are real and in the history (`docs/past/`).

## Status

Mechanism v1 landed: spec, skill, lint and example are all in place, self-lint green. Body docs are Chinese-first (decision D-002); this README is the English entry.
