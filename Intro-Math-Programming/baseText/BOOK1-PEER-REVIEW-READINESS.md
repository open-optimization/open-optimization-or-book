# Book 1 — Peer-Review Readiness Report

**Date:** May 5, 2026
**Target reviewer cycle:** mid-August (per Anita Walz, VTech Publishing)
**Book:** "Mathematical Programming and Operations Research:
Modeling, Algorithms, and Complexity with Examples in Python and Julia"
(Book 1 of 2)
**Source entry point:** `Intro-Math-Programming/baseText/book/book1-main.tex`
**Distribution license:** CC BY-SA 4.0

---

## 1. License compliance — Book 1

All 14 issues tracked in `LICENSE-ISSUES.md`. Of these, 10 apply to Book 1
content (the rest live only in Book 2 chapters). All 10 are now closed
in the source.

| # | Issue | Status |
|---|-------|--------|
| 1 | Griffin (CC BY-NC-SA 3.0, incompatible) | Source rewritten; files moved to gitignored NON-DISTRIBUTABLE/; LICENSE file added. **One open thread:** the 231 file deletions still need to be committed + pushed (Task 8 below). |
| 4 | Multi-objective images | Confirmed author's own work |
| 6 | Applied Finite Math (Sekhon-Bloom) | LICENSE file added; visible attribution in appendix |
| 8 | Cheung / lineqlpbook | License verified CC BY-SA 4.0; LICENSE file now in place |
| 9 | CC BY 3.0 sources (Lyryx, Foundations) | Compatibility verified; attribution maintained |
| 10 | Python-MIP JSSP example | Rewritten with original example data |
| 11 | Wikipedia images | Replaced by TikZ or attributed (Königsberg) |
| 12 | Pioneer Spotlight citations (Dantzig) | Replaced biblatex with manual footnotes |
| 13 | Preface source list | Now includes Applied Finite Math + license tags |
| 14 | Screenshot provenance | Resolved by Section2.tex rewrite |

Issues 2, 3, 5, 7 are deferred to Book 2.

## 2. New front-matter additions (May 5, 2026)

Added after the existing preface and before the table of contents in
`book1-main.tex`:

- `book/frontmatter/sources-attribution.tex` — consolidated
  source-attribution chapter listing every external source with
  author, URL, license, where used, and compatibility mechanism.
  Includes a license-compatibility summary table.
- `book/frontmatter/ai-usage-disclosure.tex` — disclosure of how
  generative AI was used in production, what it was not used for,
  example prompt patterns, verification practices, and a statement
  of authorial accountability. Aligned with Anita's request.

Both files were validated in isolation: an 8-page test PDF compiled
cleanly with standard packages (`booktabs`, `enumitem`, `hyperref`,
`geometry`).

## 3. Accessibility — alt-text status

`Intro-Math-Programming/baseText/optimization/figures/figures-source/00_METADATA.bib`
has 232 entries for TikZ/figure assets in Book 1. Status as of this
session:

| Status | Count | Action |
|---|---|---|
| GOOD (real alt-text already) | 21 | None |
| CAPTION_DRAFT (auto from `\caption{}`) | 55 | Quick author review |
| CONTEXT_DRAFT (from preceding paragraph) | 63 | Author edit needed |
| PLACEHOLDER (chapter-only stub) | 91 | Manual alt-text required |
| BLANK | 2 | Manual alt-text required |

No bib entry is now empty. Reports for triage:

- `book/alt-text-status.md` — checklist by bibkey
- `book/alt-text-inventory.csv` — per-figure CSV with file/line/status
- `book/alt-text-draft-log.md` — per-entry change log

**Open work:**
- Refine the 63 CONTEXT_DRAFT entries.
- Hand-write descriptions for the 91 PLACEHOLDER entries plus the 2 BLANK.
- The 64 `\includegraphics` calls (mostly Lyryx logos and Applied
  Finite Math screenshots) are not in the bib and need a separate
  alt-text pass.

## 4. Spell-check

Automated `pyspellchecker` pass over 64 `.tex` files compiled into
`book1-main`. After LaTeX-aware stripping (math, refs, env names,
URLs, file paths) plus a domain whitelist of OR/math/CS terms:

- 5,019 unique tokens scanned
- 796 suspects flagged
- 632 of those are short rare tokens that look like plausible typos

Triage reports:

- `book/spellcheck-suspects.md` — top 300 + a "likely typos" table
  with suggestions (alphabetical)
- `book/spellcheck-suspects.csv` — full sorted list

Most of the 796 are domain terms (`eulerization`, `submatrix`,
`big-m`, `non-dominated`, etc.) that should be whitelisted, not real
typos. Author scan recommended; expected throughput ~1–2 hours.

## 5. Other front-matter status

- Preface (`book/frontmatter/preface.tex`): updated March 5, 2026 to
  list every major source with explicit license tags.
- Contributors (`book/frontmatter/contributors.tex` and
  `contributors-foundations.tex`): present, comprehensive (BYU
  contributors via Foundations + Virginia Tech / others via
  acknowledgements.md).
- Notation (`book/frontmatter/notation.tex`): present.
- Top-level license files: `LICENSE-Code` (MIT) and `LICENSE-Content`
  (full CC BY-SA 4.0 legal text) at
  `Intro-Math-Programming/baseText/LICENSE-Code` and `LICENSE-Content`.

## 6. Build state

- `book1-main.pdf` last compiled successfully March 7, 2026
  (25.7 MB, 499 pages).
- Front-matter additions validated in isolation in this session
  (8-page test PDF).
- Sandbox is missing `ccicons.sty` so a full sandbox compile is not
  available; on the author's machine the book compiles end-to-end.

## 7. Outstanding items before formal peer review

### Required by Anita / VTech Publishing

| Item | Status |
|---|---|
| Alt-text for all figures | Drafts in place; refinement needed |
| AI usage disclosure | Done (review recommended) |
| Source attribution list | Done |
| Copyright page review | Preface + sources-attribution chapter cover this; review for tone |
| Spell-check | Automated pass run; author triage of suspects pending |
| Fair-use review of Section 6.3 | Open |
| ePub or HTML version (tex4ht) | Not started; longer-term |
| Sample chapter to Kindred | Pending |
| Signed agreement | Author/VTech action item |
| VTech Works upload | Author/VTech action item |

### Content improvements from Rohit (medium priority)

- More non-ISE examples in Part 2
- Big-M clarification with camera-placement example
- Vehicle routing heuristics (Clarkson-Wright, Sweep)
- Solver troubleshooting in §16.4
- More exercises in Chapter 5
- Level-curves explanation in Chapter 6

### Git / publication hygiene

- Commit + push the 232 Griffin file deletions (Task 8 in this
  session's task list). Sandbox couldn't complete this; the user must
  run the prepared commit from their Mac terminal:

  ```
  cd /Users/roberthildebrand/Documents/GitHub/open-optimization-or-book
  rm -f .git/HEAD.lock .git/index.lock
  git commit -m "License compliance: remove Griffin CC BY-NC-SA 3.0 source files"
  git push origin master
  ```

- Three earlier commits are still ahead of `origin/master` and should
  be pushed at the same time.
- 1,133 working-tree changes remain (mostly intentional reorganization
  + LaTeX build artifacts). A separate cleanup pass + commit is needed
  before peer-review submission.

## 8. Suggested next session

1. **Author refinement of alt-text** — work through
   `book/alt-text-status.md` in chapter chunks (1 hour each).
   The 91 PLACEHOLDER entries are the bulk.
2. **Spell-check triage** — scan
   `book/spellcheck-suspects.md`, mark domain terms, fix real typos.
3. **Recompile** Book 1 with all changes and visually inspect the new
   front-matter pages (Sources & Attribution, Use of Generative AI).
4. **Push** the surgical Griffin commit so the public GitHub repo
   stops distributing the incompatible content.
5. **Address Vorwerk / 2-opt figures** before starting Book 2 work.
