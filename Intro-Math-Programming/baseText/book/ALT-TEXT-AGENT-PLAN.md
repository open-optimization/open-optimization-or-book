# Alt-text Refinement — Multi-agent Working Plan

**Project:** Book 1 — "Mathematical Programming and Operations Research"
**Author:** Robert Hildebrand
**Goal:** Replace auto-generated alt-text drafts in `00_METADATA.bib` with
hand-quality descriptions for screen-reader accessibility (Anita Walz /
VTech Publishing's #1 peer-review requirement).
**Author license:** CC BY-SA 4.0

This document is the shared brief for any agents (subagents,
collaborators, or future sessions) working on alt-text refinement. Read
this file first before doing anything.

---

## 1. Status quo

A previous session auto-populated draft alt-text for all 232 figures
catalogued in
`Intro-Math-Programming/baseText/optimization/figures/figures-source/00_METADATA.bib`.
Status is recorded in `book/alt-text-status.md`:

| Status | Count | What it means | Action needed |
|---|---|---|---|
| GOOD | 21 | Real alt-text already exists | None |
| CAPTION_DRAFT | 55 | Auto-generated from `\caption{...}` | Quick review (most are fine) |
| CONTEXT_DRAFT | 63 | Auto-generated from preceding paragraph | Edit for visual accuracy |
| PLACEHOLDER | 91 | Chapter-only stub, needs writing | **Primary work** |
| BLANK | 2 | No automated draft possible | Write from scratch |

The CSV `book/alt-text-inventory.csv` has every entry with file/line/status.

The bib file is the source of truth: each entry's `abstract = {...}` field
is what becomes the alt-text. Editing it is the actual deliverable.

---

## 2. What good alt-text looks like

For mathematical figures, alt-text should answer two questions in 1–3
sentences (~50–250 characters):

1. **What does the reader see?** Brief visual description — shapes,
   axes, labels, key coordinates, lines/edges/regions.
2. **What does it mean?** The mathematical or pedagogical point — why
   the figure is in the book at this point in the exposition.

### Examples

**Good (Graphical Method, feasible region):**
> Two-dimensional plot of a feasible region for a linear program: the
> region bounded by lines x_1+x_2=10, x_1=0, x_2=0, and 2x_1+x_2=12,
> shaded blue. The four vertices are labelled (0,0), (6,0), (4,6),
> and (0,10). The red dashed line shows the level set of the
> objective z=3x_1+2x_2 passing through the optimum at (4,6).

**Bad (caption verbatim):**
> Feasible region for Example 6.3.

**Bad (TikZ source bleed):**
> Plot with foreach pos/name in (0,0)/A (1,0)/D ... showing graph G.

**Good (Graph Theory, undirected graph):**
> Undirected graph G with 18 vertices labelled A through R, drawn with
> a roughly grid-like layout. Edges connect adjacent letters in the
> alphabet plus several long-range connections, illustrating that the
> graph's structure is independent of how it is drawn.

### Style rules

- Start with the figure type: "Two-dimensional plot of...", "Tree
  diagram showing...", "Bar chart of...", "Schematic of..."
- Use plain ASCII math (`x_1`, `<=`, `<=`) — the bib value is a string;
  Unicode and inline LaTeX `$...$` are both acceptable, but no `\command{}`.
- Avoid pure caption duplication; complement the caption.
- Avoid coordinates of every node — pick a few salient ones if
  pedagogically useful.
- 250 characters max as a soft limit. If you need more, the figure
  is probably doing too much.

---

## 3. Coordination model — how agents work together

**Constraint:** the bib file
`optimization/figures/figures-source/00_METADATA.bib` is a single
~2,100-line file. Multiple agents writing to it simultaneously will
clobber each other.

**Solution:** map–reduce per chapter.

```
                            ┌──────────────┐
                            │ ORCHESTRATOR │
                            └──────┬───────┘
            partitions 154 entries by chapter, spawns N workers
                                   │
       ┌───────────┬───────────┬───┴───────┬──────────────┐
   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
   │worker │   │worker │   │worker │   │worker │     ...
   │ ch02  │   │ ch05  │   │ ch10  │   │ appB  │
   └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘
       │           │           │           │
       └───────────┴───┬───────┴───────────┘
                      ▼
       writes per-chapter JSON to alt-text-drafts/
                      │
                      ▼
                 ┌──────────┐
                 │  MERGER  │
                 └────┬─────┘
       single pass updates 00_METADATA.bib + writes log
                      │
                      ▼
                ┌──────────┐
                │ VERIFIER │
                └──────────┘
       compiles book1-main.tex; reports any errors
```

### Working directory for output

```
Intro-Math-Programming/baseText/book/alt-text-drafts/
  ch02-modeling.json
  ch05-lp-theory.json
  ...
  appendix-linear-algebra.json
```

Each JSON file is a flat object: `{ "<bibkey>": "<alt-text string>", ... }`.

The merger must NOT touch any entry that isn't present in one of the
worker outputs (preserves GOOD entries and any in-flight author
edits).

---

## 4. Roles in detail

### Orchestrator (single agent)

1. Read this file end-to-end.
2. Read `book/alt-text-status.md` and `book/alt-text-inventory.csv`.
3. Read `BOOK1-PEER-REVIEW-READINESS.md` for project context.
4. Build the chapter partition: group all PLACEHOLDER + CONTEXT_DRAFT
   entries by source `.tex` file's parent directory. Skip GOOD; treat
   CAPTION_DRAFT as low-priority (a separate worker can sweep them
   if time permits).
5. Decide a sensible chapter-set per worker. As a starting point:
   one worker per chapter, but combine very small chapters (< 5
   figures) into a single worker. Cap at ~30 figures per worker.
6. Spawn workers in parallel via `Task`. Each worker gets:
   - This file's path so it can re-read the conventions
   - The chapter key + list of bibkeys it owns
   - The path of the JSON output it must write
7. After all workers complete, spawn the merger.
8. After the merger completes, spawn the verifier.
9. Report final status to the user.

### Worker (one per chapter)

For each bibkey assigned:

1. Read the bib entry from `00_METADATA.bib`. Note the
   `note = {Extracted from <path>, line <N>}` field.
2. Open `book/<path>` and read 30 lines before line N + the
   `\begin{tikzpicture} ... \end{tikzpicture}` that starts at or near
   line N.
3. Identify (a) the figure caption if any, (b) the surrounding prose
   that introduces or follows the figure, (c) the key TikZ elements
   (nodes, draws, plots, axes, labels).
4. Write 1–3 sentences of alt-text per the style rules in Section 2.
5. Append to your worker's JSON output: `{bibkey: alt_text}`.

If a figure is genuinely too complex to describe in ≤250 characters,
write the best 250-char description you can and add a marker
`[NEEDS_AUTHOR_REVIEW]` at the end so the author can revisit. Do not
silently emit a placeholder.

Workers MUST NOT edit `00_METADATA.bib` directly. Only the merger
writes to the bib.

### Merger (single agent)

1. Read every JSON file in `book/alt-text-drafts/`.
2. Build a single map `{bibkey: new_abstract}`.
3. Read `00_METADATA.bib`.
4. For each bibkey, replace the `abstract = {...}` field
   atomically. Preserve all other fields and surrounding whitespace.
5. Verify brace balance is unchanged (bib must remain parseable).
6. Write the bib back.
7. Update `book/alt-text-status.md` to reflect the new counts (GOOD
   should grow by the number of refined entries).
8. Write `book/alt-text-merger-log.md` recording exactly which
   bibkeys were updated and from which JSON.

### Verifier (single agent)

1. Run `pdflatex -draftmode -interaction=nonstopmode -halt-on-error
   book1-main.tex` from `Intro-Math-Programming/baseText/book/`.
2. Capture the last 100 lines of output.
3. If the build errors, report the first error and stop.
4. If the build succeeds, report success + page count.
5. Optionally run a second pass for biblatex / biber.

The verifier does NOT modify any files.

---

## 5. Files to read for context (in priority order)

1. `Intro-Math-Programming/baseText/book/ALT-TEXT-AGENT-PLAN.md` ← this file
2. `Intro-Math-Programming/baseText/book/alt-text-status.md`
3. `Intro-Math-Programming/baseText/book/alt-text-inventory.csv`
4. `Intro-Math-Programming/baseText/BOOK1-PEER-REVIEW-READINESS.md`
5. `Intro-Math-Programming/baseText/FEEDBACK-AND-TODO.md`
6. `LICENSE-ISSUES.md` (repo root) — for context on what's licensed
7. `Intro-Math-Programming/baseText/book/book1-main.tex` — TOC of files

---

## 6. Files / paths agents must NOT touch

- `NON-DISTRIBUTABLE/` — gitignored, license-incompatible content
- `external-sources/Christopher_Griffin_Penn_State_University/` —
  removed in commit 91ee28b; do not re-add files referencing this dir
- `book2-main.tex` and any chapters used only by Book 2 — out of scope
  for this plan
- `LICENSE-Code` and `LICENSE-Content` — canonical license files,
  do not edit

---

## 7. Acceptance criteria

The orchestrator is "done" when:

- Every PLACEHOLDER and BLANK entry has a hand-quality alt-text
  (`abstract = {...}` no longer contains "Manual alt-text required"
  or chapter-only stub language).
- Every CONTEXT_DRAFT entry has been reviewed and either kept,
  edited, or replaced.
- `00_METADATA.bib` parses (brace balance preserved).
- `book1-main.tex` compiles (verifier confirms).
- `book/alt-text-status.md` is updated to reflect new counts.
- A merger log is written.

Anything left as `[NEEDS_AUTHOR_REVIEW]` is acceptable as long as it
is listed explicitly in the final report so the author can do a
single-pass cleanup.

---

## 8. Out of scope (don't do these)

- Writing alt-text for the 64 `\includegraphics` calls (Lyryx logos,
  Applied Finite Math screenshots) — separate task; the pattern
  there is different (uses image filenames, not bib keys).
- Spell-check triage — separate report at
  `book/spellcheck-suspects.md`.
- Editing prose, fixing bugs, restructuring chapters.
- Touching `book/frontmatter/sources-attribution.tex` or
  `book/frontmatter/ai-usage-disclosure.tex` — already done.
- Anything in Book 2.

---

## 9. After completion

The author will:

1. Spot-check ~10 random refined entries for quality.
2. Recompile Book 1 locally and visually inspect the bibliography
   page (which renders the bib).
3. Commit the bib + JSON drafts + status update.

Optional follow-up tasks for a later session: review of the 55
CAPTION_DRAFT entries, alt-text for `\includegraphics` calls,
spell-check triage.
