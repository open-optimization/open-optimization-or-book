# Prompt for Claude Code — Book 1 finishing run

Copy the block below into Claude Code at the repo root. The agent will
read the working plan, run a four-phase finishing run with
user-approval gates between phases, and stop before pushing.

---

```
You are coordinating the finishing run for Book 1 of an open-source
optimization textbook. The complete plan, agent roles, coordination
model, and phase boundaries are documented at:

  Intro-Math-Programming/baseText/book/BOOK1-FINISHING-AGENT-PLAN.md

Read that file first, in full, before doing anything else. Also read:

  Intro-Math-Programming/baseText/book/ALT-TEXT-AGENT-PLAN.md
  Intro-Math-Programming/baseText/BOOK1-PEER-REVIEW-READINESS.md
  Intro-Math-Programming/baseText/book/alt-text-status.md
  Intro-Math-Programming/baseText/book/alt-text-merger-log.md   (if exists)

The plan defines four phases. You are the orchestrator. Run them in
order, stopping at each phase gate to surface results to me and
wait for explicit approval before proceeding.

Phase 1 — read-only audits, run all four in parallel:
  A. Alt-text quality auditor (samples + anti-pattern scan over
     199 refined bib entries).
  B. \includegraphics inventory agent (catalog all 64 calls, detect
     existing accessibility macro).
  C. Spell-check triage (classify book/spellcheck-suspects.md
     entries; produce whitelist + TYPO shortlist).
  D. Fair-use reviewer (Section 6.3).

  Output: four markdown reports under Intro-Math-Programming/baseText/book/.
  Spawn all four agents in a single message via the Task tool so they
  run concurrently. None of them edit files. After all four return,
  give me a one-page summary of findings and recommendations and ASK
  ME WHETHER TO PROCEED.

Phase 2 — \includegraphics alt-text, map-reduce per source file:
  Only run if I approve. Spawn one writer agent per source-file
  partition, in parallel via Task. Workers write per-file JSON to
  book/includegraphics-drafts/. Then spawn the merger to apply edits
  in-place to the .tex files using whichever accessibility macro the
  Phase 1 inventory agent recommended. Stop and report.

Phase 3 — full compile + visual front-matter render:
  Only run if I approve. Use latexmk -pdf -interaction=nonstopmode if
  available; otherwise pdflatex + biber + pdflatex + pdflatex from
  Intro-Math-Programming/baseText/book/. Extract the new front-matter
  pages and render them to PNG. Report build status and PNG paths.
  Halt on first error.

Phase 4 — staged commits:
  Only run if I approve. Prepare exactly three commits per the split
  documented in the plan (Section 6). Halt between each commit and
  show me the diff line counts plus suggested message before
  committing. Do NOT push under any circumstance — that is my action.

Constraints, repeated for emphasis:
- Workers MUST NOT edit any file the merger will edit later.
- The orchestrator MUST stop and ask between phases.
- The orchestrator MUST NOT push to origin under any circumstance.
- Do not touch NON-DISTRIBUTABLE/, Book-2-only files, LICENSE-Code,
  LICENSE-Content, or unrelated working-tree changes.
- Each spawned agent must be told the absolute path of
  BOOK1-FINISHING-AGENT-PLAN.md and instructed to read its assigned
  section before starting work.

Begin by reading the four context files and reporting:
  1. Your understanding of the four-phase plan in 5-7 lines.
  2. Any blocking questions about the source state.
  3. Your proposed Phase 1 spawn (which four agents, with which
     inputs).

Then wait for my go-ahead before spawning Phase 1.
```

---

## Notes for Robert

- The plan deliberately gates between phases. If you want everything
  to run unattended, after the orchestrator finishes Phase 1 and
  asks for approval you can answer "approve all four phases — only
  stop before commits and before pushing." That's fine; just don't
  let it auto-push.

- If you only want a subset of the work this session — say, just
  Phase 1 (the audits) so you can decide whether the includegraphics
  pass is worth doing — tell the orchestrator "Phase 1 only, stop
  after." It supports that.

- Cost note: Phase 1's four read-only agents are cheap (each reads a
  bounded set of files and writes one report). Phase 2 is the
  expensive part — 64 includegraphics calls means ~10–20 worker
  spawns. Phase 3 is one heavy compile. Total ~30–60 minutes of
  agent time at full scope.

- After completion: spot-check ~5 random includegraphics edits
  before pushing. The Phase-1 quality auditor will have already
  vetted the bib alt-text, but the includegraphics rewrites touch
  source `.tex` files directly so eyeballing matters more.

- If the inventory agent reports that no accessibility macro exists,
  the merger will create `book/preamble/preamble-accessibility.tex`
  and add a single `\input{}` to `book1-main.tex`. Review that small
  preamble change before commit 3.
