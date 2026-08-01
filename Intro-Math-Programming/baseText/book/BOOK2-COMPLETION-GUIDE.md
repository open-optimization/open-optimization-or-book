# Book 2 Completion Guide

How to bring `book2-main.tex` (Advanced Topics: IP algorithms, complexity,
heuristics, NLP) to the same standard as Book 1, based on everything done
for Book 1 during June-July 2026. Work through the phases in order: content
correctness first, licensing second, pedagogy third, accessibility fourth,
production formats last. Each phase lists the concrete tools and files that
already exist so nothing has to be reinvented.

Book 2 chapters (from `book2-main.tex`): ch11 IP formulations (LP-notes copy),
ch12 solvers, ch13 IP algorithms, ch14 exponential formulations, ch15
complexity, ch16 heuristics, ch17-18 NLP, plus the shared linear-algebra
appendices.

---

## Phase 0 — Known debts (found during Book 1 work; fix these first)

These were discovered by the Book 1 sweeps and deliberately deferred. All are
logged in `PLAGIARISM-SWEEP-REPORT.md` (local copy in
`NON-DISTRIBUTABLE/audit-reports/` — the report itself is no longer in the
repo).

1. **ch11 LP-notes, Mosek section.** The exact-absolute-value / 1-norm /
   maximum subsections were originally copied from the MOSEK Modeling
   Cookbook (plain (c) MOSEK ApS, NOT confirmed open). The current text is a
   paraphrased rewrite with a provenance comment; finish by citing the
   cookbook as further reading, or rewrite the remaining structure fully.
2. **ch11 LP-notes, JSSP.** Still says "Example borrowed from: Python-MIP
   example" with their data. Book 1's version was re-derived with original
   data (4 jobs x 3 machines) and a Manne (1960) citation — port that
   treatment over (see `part3-integer-programming/ch11-ip-formulations/
   integerProgrammingFormulations-book1.tex`, section `sec:job-shop`).
3. **ch16 heuristics.** (a) The five 2-opt figures ("borrowed from unknown
   source") were removed as broken includes — recreate the step-by-step
   2-opt swap sequence as original TikZ. (b) The YouTube-page screenshot was
   commented out (copyrighted page content) — the plain hyperlink remains;
   leave it that way or make an original thumbnail.
4. **Wikipedia GAP text** in the shared ch11 file sits in an `\iffalse`
   block with a warning comment: attribute properly (article, CC BY-SA,
   changes made — copy the multicommodity-flow precedent) or rewrite before
   re-enabling.
5. **book2-main.tex still inputs `appendices/linear-algebra/LyryxOpenTexts.tex`**
   (the Lyryx marketing page). Book 1 removed it and replaced the license/
   contributor pages with compact acknowledgments — mirror those edits
   (see book1-main.tex around the back matter, commit `0806948`).
6. **Metadata gaps flagged "Book 2":** `youtube-tsp-simulated-annealing.jpg`
   and `youtube-OR-course.jpg` entries now correctly say third-party
   screenshot; keep them out of Book 2 or replace. Book 2 figures with
   "Missing AltText" in the old audit are mostly fixed now, but re-run the
   alt-text coverage check (Phase 4) to be sure.

## Phase 1 — Content correctness

- **Verify every number computationally.** The Book 1 rule: no numeric claim
  ships unverified. Use scipy.optimize.linprog / PuLP / networkx to check
  every example's optimum, every exercise answer, every table. When
  replacing data, search computationally for instances with clean integer
  optima and the intended binding-constraint structure (see the qaflag
  notes in `solutions-manual/ch02.tex` for the pattern).
- **Build cleanly.** `pdflatexmk book2-main.tex` with zero errors; then chase
  warnings (undefined refs, overfull boxes in models). Remember the book
  redefines `\a \b \c \u \x \y \z ...` as bold vectors — never use them as
  accent macros; use UTF-8 characters (ç not \c{c}).
- **Environment audit.** Check `ex` vs `example` usage is consistent
  (Book 1 unified `ex` = exercise with its own per-chapter counter
  `bookex`; examples use `exo`). Exercises belong in end-of-chapter
  Exercises sections, not mid-chapter.

## Phase 2 — Licensing and plagiarism (the four-sweep protocol)

Run the same four methods that cleared Book 1; the report's method notes
matter as much as the findings:

1. **Famous-problem fingerprints:** grep for signature data from Winston
   (Dakota, Giapetto, Leary), Hillier (Wyndor), Taha (Reddy Mikks), Chvatal,
   Beale. Any hit = replace the data with a computationally designed
   original instance (same teaching point, new numbers).
2. **Systematic quoted-phrase web searches:** ~3 samples per section,
   8-12 word quotes, plus targeted searches for suspicious passages.
   Google indexes textbook PDFs — this is how the Griffin passages were
   settled.
3. **Solution-site pass:** search distinctive exercise sentences together
   with chegg/quizlet/numerade/bartleby. A verbatim hit tied to a
   commercial textbook = replace scenario AND data (author's rule: rewording
   is not enough; the numbers are part of what was designed).
4. **Local forensics:** git history for provenance comments, comment/URL
   mining in the tex, image EXIF checks, stylometry outliers.

Key license facts learned the hard way: Griffin (PSU) and Erickson's lecture
notes are CC BY-**NC**-SA — incompatible, never reuse. Cheung, Lippman,
Sekhon-Bloom, Kuttler/Lyryx, BYU Foundations, Wikipedia are compatible WITH
attribution — reuse is fine and honest, and belongs in the front-matter
`frontmatter/sources-attribution.tex` chapter (add a Book 2 entry per source
with author, URL, license, and exactly what was used). The classical-instance
exception: exact numbers may be kept when the numbers ARE the point (Beale's
cycling example is the model: "a rescaled version of the classic cycling
example constructed by E. M. L. Beale (1955)").

If new non-distributable material is found in git history, add its paths to
`scripts/purge-history.sh` and re-run the purge flow (fresh clone,
filter-repo, force-push, GitHub Support GC).

## Phase 3 — Pedagogy (exercises, solutions, checkpoints, case studies)

- **Exercise ladder:** every chapter gets Warm-ups / Core problems /
  Concepts and connections / Challenge via `\exgroup{...}`, difficulty
  `\stars{1|2|3}`, and reference tags `\exrefs{\S\ref{...},
  Example~\ref{...}}`. Roughly 1/3-1/2 of exercises get Selected Solutions
  at chapter end.
- **Solutions manual:** extend `solutions-manual/` with ch12-ch18 files
  using the `\exsol{N.k}{Title}{stars}` macro; verify every solution with a
  solver; record book fixes in `qaflag` boxes. Numbering is synced manually
  to `\begin{ex}` order — re-check after any exercise edit.
- **Learning checkpoints:** use
  `\begin{learningcheckpoint}[label={lc:...}]` (tcolorbox auto counter) and
  add answers to `backmatter/checkpoint-answers.tex`.
- **Case studies:** the bar is a published paper that explicitly states the
  model (variables, constraints, objective, assumptions). Graded candidates
  live in `CASE-STUDY-PROPOSALS.md`; remaining Tier-1 picks for Book 2
  topics: Kellogg planning system (production LP), the INFORMS Transactions
  on Education timetabling case, Traveling Umpire (with the Trick-Yildiz
  companion papers for the formulations). Write in the `casestudybox`
  format; all prose original; sources in the box's References list.
- **Visualizations:** the site (`visualizations/` at repo root) already has
  branch-and-bound, dual simplex, and Gantt demos relevant to Book 2 — add
  `tryit` boxes with `\vizlink{demo-id}{...}` where chapters touch them.

## Phase 4 — Figures and accessibility

- **Every display image gets a number.** Use the pattern from Book 1:
  `\par\captionof{figure}{Caption.}\label{fig:ID}% fig-num-auto` inserted
  right after the image/tikzpicture (non-float; safe inside center and
  minipage). `epub-build/tools/number-figures.py` automates the sweep —
  extend its file list to the Book 2 chapters. Skip title-page art, blank
  tikzmark overlays, and rotated table headers; one caption per table of
  small diagrams.
- **Alt text:** authoritative store = `abstract` fields in the two metadata
  bibs (`optimization/figures/figures-static/00_METADATA.bib` and
  `figures-source/00_METADATA.bib`). Write real descriptions (what the
  figure shows, key labels/values); never placeholders. Check descriptions
  against the actual images — Book 1 found copy-paste mismatches (a
  temperature plot described as a Voronoi diagram). Regenerate
  `book/alt-text-inventory.csv` afterwards.
- **Third-party image credits:** metadata bib author field carries
  "[LICENSE]"; `epub-build/tools/gen-credits.py` turns that into per-figure
  credit lines in the EPUB automatically. Never claim authorship of
  screenshots or Wikimedia images in the bib.
- **Publisher spreadsheet:** `epub-build/tools/gen-figure-spreadsheet.py`
  builds the Figures-and-AltText workbook from a built EPUB (numbers,
  captions, alt, licenses, references). Rerun it for Book 2.

## Phase 5 — Production formats

- **PDF:** `pdflatexmk book2-main.tex` on the author machine (biber needed;
  the sandbox TeX has no biblatex).
- **EPUB:** clone the Book 1 pipeline (`epub-build/`, full recipe in
  `epub-build/WORKFLOW.md`):
  1. Copy `build-book1.sh` -> `build-book2.sh`; point the content-list
     derivation at `book2-main.tex`; create `book2-epub.tex` mirroring its
     input order and `book2-epub.cfg` (copy book1's, keep the overflow-x
     CSS).
  2. The substitute preamble (`epub-preamble.tex` + `epub-preamble-full.tex`)
     already covers nearly everything; shake out Book 2-only macros with
     `pdflatex -file-line-error -draftmode book2-epub.tex` and add
     `\providecommand` shims until zero errors — only then run tex4ebook.
  3. Chapters 17-18 (NLP) will surface new tikz styles/macros for the
     snippet preamble in `tools/extract-tikz-all.py` (it already has
     `\vect`, `\leftB`, kkt figure support).
  4. Keep ALL the post-processing: `fix-epub.py` (nbsp + MathML recovery +
     token-element hoist — this is what makes `equation`+`aligned` models
     visible), picture-env rendering, cover, credits, alt text.
  5. Verify before shipping: every xhtml parses (expat), zero MathML token
     elements with children, figcaption count matches expectation, no
     "??" refs, spot-check in Apple Books/calibre.
- **Read online:** add the built epub to the `read/` epub.js page (or a
  second page `read/book2.html` pointing at `epub-build/book2-epub.epub`).
- **Cover:** `epub-build/cover/cover-epub.tex` parametrizes the title band —
  make a Book 2 variant.

## Phase 6 — Final gates (in order)

1. Full pdflatexmk: zero errors, warnings triaged.
2. Plagiarism report appended for Book 2 (all four sweeps) with findings
   fixed; internal audit reports stay OUT of the repo
   (`.gitignore` already covers them; keep local copies in
   `NON-DISTRIBUTABLE/audit-reports/`).
3. Solutions manual compiles clean; numbers verified.
4. Alt-text inventory: zero missing, zero placeholders.
5. Figure spreadsheet regenerated; every borrowed image licensed+credited.
6. Sources-and-attribution chapter updated with Book 2 sources.
7. EPUB built, validated, epubcheck on the author machine.
8. Commit everything, then push through the history-purge flow if any new
   incompatible material was ever committed.

## Where things live (quick reference)

| Thing | Path |
|---|---|
| EPUB pipeline + all tools | `epub-build/` (see `WORKFLOW.md`) |
| Figure numbering script | `epub-build/tools/number-figures.py` |
| Publisher spreadsheet generator | `epub-build/tools/gen-figure-spreadsheet.py` |
| Alt-text store | `optimization/figures/*/00_METADATA.bib` (abstract fields) |
| Alt-text inventory (generated) | `book/alt-text-inventory.csv` |
| Exercise/solutions conventions | `packages-and-commands.tex` (bookex, \exgroup, \stars, \exrefs), `solutions-manual/` |
| Case-study candidates + grades | `book/CASE-STUDY-PROPOSALS.md` |
| Parked ideas (quizzes, games) | `book/FUTURE-IDEAS.md` |
| History purge script | `scripts/purge-history.sh` |
| Audit reports (local only) | `NON-DISTRIBUTABLE/audit-reports/` |

---

## Update 2026-07-31

**Phase 0 debts: RESOLVED** (commit `f6c72ad`): JSSP ported with original
data + Manne citation; Mosek cookbook cited as further reading; GAP section
attributed to Wikipedia (CC BY-SA) with link stubs repaired; original 2-opt
TikZ figure replaces the borrowed/broken images; LyryxOpenTexts removed from
book2-main and sources-attribution added to its back matter; Cheung license
header comment fixed.

**New Part V: Integrative Projects** (`part5-projects/`, skeletons):
capstone chapters on (1) last-mile delivery at scale (heuristics + LP/
Lagrangian bounds + column generation), (2) crew/shift scheduling by column
generation, (3) optimization in machine learning (SGD/Adam as Ch.18 methods,
hyperparameter search as heuristics, predict-then-optimize, scale of
LLM training). Each needs: data generators, starter notebooks, rubrics.

**Full content inventory** (2026-07-31) lives in
`NON-DISTRIBUTABLE/internal-docs/BOOK2-INVENTORY-2026-07-31.md`. Highlights:
ch12 solvers is a stub; ch14 has a pasted "2.2" heading; ch17-18 are ~50%
drafts (ch18 holds three chapters incl. an EMPTY Fairness chapter -
decide); GradientMethods is an unintegrated Foundations lab; exercises are
essentially absent outside ch11; zero fig-num-auto numbering in Book 2
chapters; book2-main prints \listoftodos (fine while drafting, remove for
release); subfiles preambles still live in ch11-15 files.
