# Book 1 Finishing Run — Multi-agent Working Plan

**Project:** "Mathematical Programming and Operations Research" (Book 1 of 2)
**Author:** Robert Hildebrand
**Goal:** Close the remaining peer-review-readiness items so Book 1 is
ready for submission to VTech Publishing's review cycle (target:
mid-August).
**Predecessor plan:** `book/ALT-TEXT-AGENT-PLAN.md` (already executed:
199 figures refined in `00_METADATA.bib`).

This document is the shared brief for any agents working on the
finishing run. **Read this file first** before doing anything.

---

## 1. What's already done

- License compliance for Book 1 closed in source; Griffin file
  deletions committed and pushed (commit 91ee28b on origin/master).
- New front-matter chapters written and wired in: `sources-attribution.tex`
  and `ai-usage-disclosure.tex` (both still uncommitted as of session start).
- Auto-populated draft alt-text for 232 bib entries; subsequent
  multi-agent run refined 199 of them. **Bib parses cleanly. Nothing
  committed yet.**
- Spell-check triage report generated at `book/spellcheck-suspects.md`.
- Project status documented in `BOOK1-PEER-REVIEW-READINESS.md`.

## 2. What this run must do

Five workstreams, coordinated as three phases:

| Workstream | Phase | Mode | Agent type |
|---|---|---|---|
| A. Audit the 199 refined alt-text entries | 1 | Read-only | Quality auditor |
| B. Inventory + classify 64 `\includegraphics` calls | 1 | Read-only | Inventory agent |
| C. Triage `spellcheck-suspects.md` | 1 | Read-only | Spell-check triage |
| D. Fair-use review of Section 6.3 | 1 | Read-only | Fair-use reviewer |
| E. Write alt-text for `\includegraphics` calls | 2 | Edits | Map-reduce writers + merger |
| F. Full compile + visual-render of new front matter | 3 | Read + render | Verifier |
| G. Stage commits per recommended split | 4 | Edits .git | Commit assistant |

**Phase boundaries are user-approval gates.** The orchestrator MUST stop
after each phase, surface results to the user, and wait for explicit
approval before proceeding to the next phase.

---

## 3. Phase 1 — read-only audits (run in parallel)

All four agents run concurrently. None of them edit files. Each produces
a single Markdown report.

### A. Alt-text quality auditor

**Input:** `optimization/figures/figures-source/00_METADATA.bib`,
`book/alt-text-status.md`, `book/alt-text-merger-log.md`.

**Job:**

1. Identify the 199 entries that the previous merger updated (use the
   merger log as the authoritative list).
2. Sample 12 entries: 3 random, 3 longest, 3 shortest, 3 from chapters
   the previous run flagged as hardest (Graph Theory, Linear Algebra
   Appendix).
3. For each sample, fetch the corresponding TikZ source from the file
   referenced in the entry's `note` field and produce a side-by-side:
   bibkey · file:line · alt-text · TikZ summary (first 200 chars
   stripped of comments).
4. Run an automated scan over **all 199 refined entries** for these
   anti-patterns:
   - Length under 30 characters or over 400 characters
   - Contains `\\` (LaTeX command bleed)
   - Contains 3+ pairs of parens with comma-numbers (TikZ coordinate bleed)
   - Contains `foreach` or other TikZ keywords
   - Identical to another entry's alt-text (likely template duplication)
5. Output: `book/alt-text-audit-report.md` with the sample table, the
   anti-pattern findings, and a recommended verdict (PASS / NEEDS
   REWORK / NEEDS PARTIAL REWORK with specific bibkeys).

**Done when:** report written, recommendation is clear, no edits made.

### B. `\includegraphics` inventory agent

**Input:** all `.tex` files compiled into `book1-main.tex` (start from
that file and recursively follow `\input{}`).

**Job:**

1. Find every `\includegraphics[...]{path}` call and record:
   `file_path`, `line_no`, `image_path`, surrounding `\caption{}` text
   if any, and 100 chars of preceding prose.
2. Group calls into buckets by image directory:
   - `figures/Lyryx*` and `figures/component-*` — Lyryx OER component logos
   - `figures/cc-by*` — CC license badges
   - `applied-finite-mathematics/images/*` — Sekhon-Bloom screenshots
   - `figures/*` other — author's own figures
   - everything else — flag separately
3. **Detect the existing accessibility macro.** Search the preamble
   (`packages-and-commands.tex` and `book/preamble/*.tex`) for any
   wrapper macro that accepts alt-text — examples to look for:
   `\accessibleimage`, `\includegraphictikz`, `\includefiguretikz`,
   `\pdftooltip`, `\Alt`, `\alttext`, or anything with a description
   argument. Report which macros exist and which one Phase 2 should use.
   If none exist, propose a minimal macro definition.
4. Output: `book/includegraphics-inventory.md` (markdown table grouped
   by bucket) and `book/includegraphics-inventory.json` (structured
   form: `[{file, line, image, bucket, caption, preceding_prose}, ...]`).

**Done when:** every call is catalogued, bucket counts match the total,
the recommended macro pattern is documented.

### C. Spell-check triage agent

**Input:** `book/spellcheck-suspects.md`, `book/spellcheck-suspects.csv`.

**Job:**

1. Walk every entry in the CSV.
2. Classify each token into one of:
   `TYPO` (real misspelling, propose fix), `DOMAIN_TERM` (OR/math/CS
   jargon — add to whitelist), `PROPER_NOUN` (person/place/software —
   add to whitelist), `COMPOUND` (hyphenated valid word like
   `non-dominated`), `LATEX_BLEED` (env name, key, file extension that
   slipped through stripping — improve stripping, not the text), or
   `UNCLEAR` (flag for author).
3. For TYPO entries, propose a correction (use the suggestion column
   from the existing report as a starting point) and the file:line of
   the first occurrence so the author can verify.
4. Output:
   - `book/spellcheck-triage.md` — classified report grouped by
     category, with TYPO entries sorted by frequency desc.
   - `book/spellcheck-whitelist.txt` — newline-separated list of
     DOMAIN_TERM + PROPER_NOUN + COMPOUND tokens, ready to be loaded
     into a future spell-check pass.
5. **Do not** edit any source `.tex` file. The author will review and
   apply typo fixes.

**Done when:** every suspect classified, whitelist generated, TYPO list
is short enough for the author to triage in under an hour.

### D. Fair-use reviewer

**Input:** the file containing Section 6.3 (likely under
`book/part1-linear-programming/ch06-graphical/` or wherever the
graphical method's assignment-problem section lives — the agent must
locate it by searching for "assignment problem" or "Section 6.3" or
"§6.3" markers).

**Job:**

1. Locate the section in the source.
2. Identify any borrowed material: cited references, paraphrased
   passages, included figures with non-author authorship in
   `00_METADATA.bib`, or text that closely tracks an external source.
3. Check whether each borrowed item meets fair-use criteria:
   transformative use, limited extent, properly cited.
4. Per Anita's guidance: "No verbatim copying. Snippets OK if
   summarizing/paraphrasing."
5. Output: `book/section-6.3-fair-use-review.md` with: section
   location, list of borrowed items, fair-use assessment for each,
   recommended actions (rewrite / add citation / replace figure / OK
   as is).

**Done when:** the report exists and the recommendations are concrete.

### Phase 1 gate

After all four agents complete, the orchestrator presents a single
summary to the user:

- Auditor verdict on alt-text (PASS/NEEDS REWORK)
- Includegraphics counts by bucket + recommended macro
- Spell-check counts: total, TYPO count (the only number that requires
  author action), whitelist size
- Fair-use verdict for §6.3 (OK / needs minor edits / needs rewrite)

The user then decides whether to:

- Proceed to Phase 2 as-is
- Send specific items back for rework (e.g., re-run alt-text for
  certain chapters)
- Skip Phase 2 entirely (e.g., if includegraphics work isn't
  in-scope for this round)

---

## 4. Phase 2 — `\includegraphics` alt-text (map-reduce, edits)

Triggered only after Phase 1 user approval.

### Coordination model

Same map-reduce pattern as the bib alt-text run, but the partition is
**per source `.tex` file**, not per chapter, because each
`\includegraphics` lives at a specific line inside a specific file and
the merger must edit that file in-place.

```
                    ┌──────────────┐
                    │ ORCHESTRATOR │
                    └──────┬───────┘
            partitions inventory by source file
                           │
       ┌───────────┬───────┴────┬──────────────┐
   ┌───▼────┐  ┌───▼────┐  ┌───▼────┐
   │writer  │  │writer  │  │writer  │     ...
   │file A  │  │file B  │  │file C  │
   └───┬────┘  └───┬────┘  └───┬────┘
       │           │           │
       └───────────┴───┬───────┘
                       ▼
       writes per-file JSON to includegraphics-drafts/
                       │
                       ▼
                ┌──────────┐
                │  MERGER  │
                └────┬─────┘
       single pass updates each .tex file with alt-text wrapper
                       │
                       ▼
                ┌──────────┐
                │ VERIFIER │
                └──────────┘
```

### Writer behaviour (one per file)

For each `\includegraphics` call assigned:

1. Read the file at the noted line.
2. Read the existing `\caption{}` (if any) and the surrounding context.
3. Decide on the alt-text using the bucket-specific guidance:
   - **Lyryx logos / CC badges:** describe the logo, not its purpose
     in the book. E.g., "Lyryx Learning logo: stylized lowercase 'l'
     with green checkmark." Or "Creative Commons BY license badge:
     two stick figures inside a circle, with 'CC' and 'BY' icons."
   - **Applied Finite Math screenshots:** describe the mathematical
     content of the screenshot (axes, equations shown, points
     plotted, line drawn, table contents). Use the appendix's prose
     for what the figure illustrates.
   - **Author's own figures:** treat like bib alt-text — visual
     description + mathematical purpose, 1–3 sentences.
4. Write JSON entry: `{ "file": ..., "line": ..., "image": ...,
   "alt": "..." }`.
5. Output to `book/includegraphics-drafts/<sanitized-file-key>.json`.
6. Writers MUST NOT edit `.tex` files. Only the merger writes.

### Merger behaviour

1. Read all JSON files from `book/includegraphics-drafts/`.
2. For each entry, locate the exact `\includegraphics[opts]{image}`
   call at the noted line and replace it with the project's
   accessibility macro per the inventory agent's recommendation.
   - If `\accessibleimage{alt}{opts}{image}` exists in the preamble:
     wrap with that.
   - Else if `\includegraphictikz` is the right pattern: convert.
   - Else: define `\altincludegraphics[opts]{image}{alt}` in
     `book/preamble/preamble-accessibility.tex` (new file) using
     `\pdftooltip{\includegraphics[opts]{image}}{alt}` as the body.
     Add `\input{preamble/preamble-accessibility}` to `book1-main.tex`'s
     preamble section. Then call this new macro for each entry.
3. Preserve original options exactly (`[width=...]` etc.).
4. Output: `book/includegraphics-merger-log.md` with one line per
   edit (file:line, before, after).

### Phase 2 gate

The orchestrator reports: number of edits made, files touched, macro
choice. User approves before Phase 3.

---

## 5. Phase 3 — full compile + visual front-matter render

Triggered only after Phase 2 user approval.

### Verifier behaviour

1. From `Intro-Math-Programming/baseText/book/`, run a full
   pdflatex + biber + pdflatex + pdflatex pass on `book1-main.tex`.
   (Use `latexmk -pdf -interaction=nonstopmode` if available.)
2. Capture the last 200 lines of the log; extract any `Error` or
   `Undefined control sequence` messages.
3. If the build errors, report the first error and halt.
4. If the build succeeds, extract the new front-matter pages
   (Sources & Attribution + Use of Generative AI) using
   `pdftk book1-main.pdf cat <range> output frontmatter-preview.pdf`
   or `pdfjam --outfile ...`. Locate the page range from the
   table-of-contents file or by reading the PDF's bookmarks.
5. Convert each new-frontmatter page to PNG via
   `pdftoppm -png -r 150 frontmatter-preview.pdf frontmatter-preview`.
6. Output: `book/finishing-run-build-report.md` with build status,
   any warnings, and a list of generated PNG previews under
   `book/frontmatter-preview/`.
7. **Do not** modify source files.

### Phase 3 gate

User reviews the build report and PNGs. Approves Phase 4.

---

## 6. Phase 4 — staged commits

Triggered only after Phase 3 user approval. **The orchestrator must
NOT push.** Pushing is a user action.

### Commit assistant behaviour

Prepare three commits in this order; halt for user approval between
each one:

#### Commit 1 — "Add front-matter sources/AI disclosure + alt-text scaffolding"

Stages:
- `Intro-Math-Programming/baseText/book/frontmatter/sources-attribution.tex`
- `Intro-Math-Programming/baseText/book/frontmatter/ai-usage-disclosure.tex`
- `Intro-Math-Programming/baseText/book/book1-main.tex` (the wiring change)
- `Intro-Math-Programming/baseText/book/alt-text-status.md`
- `Intro-Math-Programming/baseText/book/alt-text-inventory.csv`
- `Intro-Math-Programming/baseText/book/alt-text-draft-log.md`
- `Intro-Math-Programming/baseText/book/spellcheck-suspects.md`
- `Intro-Math-Programming/baseText/book/spellcheck-suspects.csv`
- `Intro-Math-Programming/baseText/book/ALT-TEXT-AGENT-PLAN.md`
- `Intro-Math-Programming/baseText/book/ALT-TEXT-CLAUDE-CODE-PROMPT.md`
- `Intro-Math-Programming/baseText/book/BOOK1-FINISHING-AGENT-PLAN.md` (this file)
- `Intro-Math-Programming/baseText/BOOK1-PEER-REVIEW-READINESS.md`

#### Commit 2 — "Refine alt-text for 199 figures across Book 1"

Stages:
- `Intro-Math-Programming/baseText/optimization/figures/figures-source/00_METADATA.bib`
- `Intro-Math-Programming/baseText/optimization/figures/figures-static/00_METADATA.bib`
  (if modified)
- `Intro-Math-Programming/baseText/book/alt-text-drafts/*.json` (the
  per-chapter worker outputs)
- `Intro-Math-Programming/baseText/book/alt-text-merger-log.md`

#### Commit 3 — "Add alt-text for 64 included images + accessibility macro"

Stages:
- All `.tex` files modified by the includegraphics merger (Phase 2)
- `Intro-Math-Programming/baseText/book/preamble/preamble-accessibility.tex`
  (if a new macro was created)
- `Intro-Math-Programming/baseText/book/includegraphics-drafts/*.json`
- `Intro-Math-Programming/baseText/book/includegraphics-inventory.md`
- `Intro-Math-Programming/baseText/book/includegraphics-inventory.json`
- `Intro-Math-Programming/baseText/book/includegraphics-merger-log.md`

#### What does not get committed in this run

- Any spell-check fixes — the triage report leaves these to the author.
- Any §6.3 fair-use rewrites — same, author-driven.
- The 1,133 pre-existing reorganization changes — separate cleanup
  effort.

### Phase 4 gate

After all three commits land locally, the orchestrator reports the
new HEAD, the diff line counts, and the list of commits ahead of
`origin/master`. The user runs `git push` themselves.

---

## 7. Files and paths the orchestrator and workers must NOT touch

- `NON-DISTRIBUTABLE/`
- Anything outside `Intro-Math-Programming/`, except the repo-root
  `LICENSE-ISSUES.md` if updates are warranted (likely not for this run).
- `book2-main.tex` and Book-2-only chapters
- `LICENSE-Code`, `LICENSE-Content`
- Pre-existing reorganization changes that are unrelated to this run.

If an agent finds that fixing its task requires editing one of these,
it must stop and ask the user.

## 8. Acceptance criteria

The finishing run is "done" when:

- Phase 1 reports exist and have all been reviewed by the user.
- Phase 2 (if approved) has completed; every targeted
  `\includegraphics` call now uses an accessibility wrapper.
- Phase 3 verifier reports a clean compile and produces front-matter
  preview PNGs.
- Three commits are on the local `master` branch.
- The user has the information they need to push (or to tell the
  orchestrator to halt).

## 9. Out of scope

- Spell-check fixes — produces a report only.
- §6.3 rewrites — produces a report only.
- ePub / HTML conversion via tex4ht.
- Sample-chapter Kindred export.
- Anything in Book 2.
- Hygiene cleanup of the 1,133 working-tree changes.
