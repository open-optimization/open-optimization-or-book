# License Issues to Resolve for CC BY-SA 4.0 Compliance

**Book:** Mathematical Programming and Operations Research (book1-main.tex)
**Target License:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
**Audit Date:** March 1, 2026
**Compiled PDF:** book1-main.pdf (499 pages)

---

## CRITICAL — Must resolve before distribution

### 1. Christopher Griffin / Penn State Content — INCOMPATIBLE LICENSE (CC BY-NC-SA 3.0)

**Location in book:** Chapter 6 "Graphical Method," pages 96–118 (PDF pages 102–124)
**Source file:** `part1-linear-programming/ch02-modeling/Section2.tex`

- Page 96 / PDF p. 102, footnote: *"Special thanks to Joshua Emmanual and Christopher Griffin for sharing their content to help put this section together. Proper citations and referenes are forthcoming."* (Section2.tex line 18)
- Pages 96–100 / PDF pp. 102–106: screenshot images from `external-sources/Christopher_Griffin_Penn_State_University/screenshots/` (e.g., `example0-extreme-points`, `example0-feasible-region`, `example1-optimal-solution`)
- `book1-main.tex` line 122 references this as "Chapter: More LP Examples (Griffin)"

**External source directory:** `external-sources/Christopher_Griffin_Penn_State_University/` (110+ files)
**Source PDF:** Math484_V1.pdf — "Linear Programming: Penn State Math 484 Lecture Notes" by Christopher Griffin, Version 1.8.3.1
**Griffin's LaTeX source:** `ClassNotes/` directory (Section1.tex through Section9.tex)

**LICENSE CONFIRMED: CC BY-NC-SA 3.0 US (Attribution-NonCommercial-ShareAlike 3.0 United States)**

This is stated on the title page of Math484_V1.pdf and in ClassNotes/Math484.tex line 64:
`\href{http://creativecommons.org/licenses/by-nc-sa/3.0/us/}{Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License}`

**Issue:** CC BY-NC-SA 3.0 is **fundamentally incompatible** with CC BY-SA 4.0 in both directions:
1. CC BY-NC-SA content cannot be included in a CC BY-SA work (NC prohibits commercial use; SA allows it)
2. The book cannot be downgraded to CC BY-NC-SA either, because Kevin Cheung's CC BY-SA 4.0 content (used extensively) requires the adapted work to remain CC BY-SA 4.0 or compatible — and CC BY-NC-SA is NOT a compatible license

**What was borrowed:** The Toy Maker running example (same numbers), progressive algorithm refinement structure, four-outcome classification, alternative optimal solutions example, infeasible problem example, unbounded feasible region examples, adapted prose passages, exercises, and 5 screenshot images.

**What is already original:** All TikZ figures, the Lemonade Vendor example (from Cheung), the Extreme Directions section, learning checkpoints, additional exercises.

**Resolution: ALL Griffin-derived content must be rewritten or removed.** This is feasible because:
- The mathematical concepts (graphical LP, feasible regions, extreme points) are standard and not copyrightable
- All TikZ figures are already original
- Only the text exposition (~400–500 lines) and specific example numbers need replacement
- Screenshot images from `external-sources/Christopher_Griffin_Penn_State_University/screenshots/` must be removed

**Action taken (March 2, 2026):**
- [x] Replaced the Toy Maker example with new "Furniture Workshop" example (chairs/tables, $8/$6 profit, constraints 2x₁+x₂≤80, x₁+3x₂≤90, x₁≤35; optimal (30,20) with z=360)
- [x] Rewrote all expository prose in original words (algorithm descriptions, four-outcome classification, etc.)
- [x] Removed all 5 screenshot images (replaced with original TikZ figures or removed where files missing)
- [x] Created new exercises referencing the new Furniture Workshop and unbounded examples
- [x] Removed the Griffin footnote
- [x] Created new TikZ figures with correct vertices/level curves for all replacement examples
- [x] New alternative optimal example: z=2x₁+x₂ parallel to 2x₁+x₂=80 edge
- [x] New infeasible example: x₁+x₂≤8, x₁≥7, x₂≥5 (contradictory)
- [x] New unbounded example: max x₁+3x₂, s.t. x₁-x₂≤3, x₁+2x₂≥4
- [x] New finite-optimum-with-unbounded-region: min 3x₁+x₂ at (0,2) with z*=2
- [x] All math verified programmatically (scipy optimization confirms all results)

**Remaining (not in Section2.tex):**
- [x] The Toy Maker example in `modeling-linear-programming.tex` has been replaced with a new "Screen Printing Shop" example (t-shirts/tote bags, $10/$8 profit, constraints 2x₁+3x₂≤150, x₁+x₂≤60, x₁≤45). Label changed from `ex:ToyMaker` to `ex:ScreenPrint`. All internal references updated.
- [x] Griffin source files relocated from `external-sources/Christopher_Griffin_Penn_State_University/` to gitignored `NON-DISTRIBUTABLE/Christopher_Griffin_Penn_State_University/` (May 5, 2026)
- [x] LICENSE file added to `NON-DISTRIBUTABLE/Christopher_Griffin_Penn_State_University/` documenting CC BY-NC-SA 3.0 and the incompatibility with the book's CC BY-SA 4.0 license (May 5, 2026)
- [ ] **NOT YET COMMITTED**: 231 Griffin files are still tracked in git history at `Intro-Math-Programming/baseText/external-sources/Christopher_Griffin_Penn_State_University/`. Local working tree shows them as deleted (D), but the deletions need to be committed and pushed before the public GitHub repo stops distributing the CC BY-NC-SA 3.0 content.
- [ ] Griffin's notes may still be cited as a reference/recommended reading — just not reproduced or adapted


### 2. "Figures Borrowed from Unknown Source" — 2-opt Heuristic Images

**Location in book:** *Not in book1-main.pdf* — file is only in the full book compilation
**Source file:** `part3-integer-programming/ch16-heuristics/heuristics.tex` (lines 93–101)

**Issue:** Five images (`2-opt-1` through `2-opt-5`) are included with the footnote: *"Figures borrowed from unknown source."* (line 101). A Wikipedia 2-opt diagram (`wiki/File/2-opt_wiki.png`) is also referenced on line 93. Using images without knowing their license is incompatible with CC BY-SA 4.0.

**Action required:**
- [ ] Identify the original source and license for images `2-opt-1` through `2-opt-5`
- [ ] If source is CC-compatible, add proper attribution
- [ ] If source cannot be identified or is not CC-compatible, replace with original TikZ diagrams or remove


### 3. OR-Book-Vorwerk — No License Documentation

**Location in book:** *Not currently included in book1-main.pdf* — content is in `external-sources/` only
**Directory:** `external-sources/OR-Book-Vorwerk/`

**Contents:** 4 .tex files + 122 .jpg images from Karin Vorwerk:
- `case-study-campground.tex` (line 2: *"Borrowed from Karin Vorwerk. Need to integrate this into other chapters."*)
- `case-study-campground-reworked.tex`
- `case-study-national-parks.tex`
- `OR book final.tex`

**Issue:** No LICENSE, README, or any documentation of the terms under which this content may be redistributed. The 122 images may be from a published textbook or course materials with restricted copyright. Even though not currently compiled into book1, these files are in the repository and may be incorporated later.

**Action required:**
- [ ] Confirm the license from Karin Vorwerk for this content
- [ ] Add a LICENSE file to the directory
- [ ] If no CC-compatible license can be obtained, remove all Vorwerk content and images from the repository
- [ ] Check which Vorwerk images (if any) are referenced via image search paths in compiled chapters


### 4. Multi-Objective Chapter — Scanned Images with No Source — RESOLVED

**Location in book:** Chapter 13 "Multi-Objective Optimization," pages 290–303 (PDF pages 296–309)
**Source file:** `part1-linear-programming/ch09-multi-objective/multi-objective-optimization_updated.tex`
**Image directory:** `optimization/multi-objective/images/`

**Resolution (March 3, 2026):** Author (Robert Hildebrand) confirmed these images are his own original work. No license issue exists.

- [x] Images confirmed as author's own — no external source
- [x] 00_METADATA.bib entries already reflect correct authorship: all four `tikz-multi-objective-optimization-*` entries in `optimization/figures/figures-source/00_METADATA.bib` have `author = {{Robert Hildebrand}}` (verified May 5, 2026). Remaining "Missing AltText - needs description" markers in those entries are alt-text TODO items, tracked separately under FEEDBACK-AND-TODO.md.


### 5. ResearchGate Content — Verbatim Text Reproduction

**Location in book:** *Not in book1-main.pdf* — file is only in the full book compilation
**Source file:** `part3-integer-programming/ch14-exponential-formulations/integerProgrammingExponentialFormulations.tex` (lines 1107–1114)

**Issue:** A long paragraph about the Clarke and Wright Savings Heuristic is reproduced verbatim inside a `\begin{quote}` block, attributed only to a ResearchGate publication URL (`https://www.researchgate.net/publication/285833854_Chapter_4_Heuristics_for_the_Vehicle_Routing_Problem`). ResearchGate publications are typically under publisher copyright (not CC). Verbatim reproduction of a full paragraph likely exceeds fair use.

**Resolved (March 5, 2026):** Verbatim text removed from source file and saved to `NON-DISTRIBUTABLE/researchgate-clarke-wright-excerpt.tex`. A TODO comment with the original citation reference was left in place.
- [x] Verbatim text removed from integerProgrammingExponentialFormulations.tex
- [x] Content preserved in NON-DISTRIBUTABLE/ for reference
- [ ] Rewrite Clarke-Wright description in original words if this chapter is ever compiled


### 6. Applied-Finite-Mathematics — No License Documentation

**Location in book:** Appendix A "Linear Equations," pages 387–406 (PDF pages 393–412)
**Source file:** `appendices/equations-and-lines/equations-and-lines-new.tex`
**External directory:** `external-sources/applied-finite-mathematics/`

**Issue:** The images directory contains 10+ JPGs with no LICENSE or README file. The .tex file header (lines 1–7) cites the source as LibreTexts (Sekhon and Bloom) under CC BY 4.0, but no license file is present in the images directory and no per-image attribution is provided. The images appear throughout the appendix chapter (lines 85, 131, 176, 219, 273, 328, 383, 551, 597 of the .tex file).

**Source cited in header:** `https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)/01%3A_Linear_Equations/1.01%3A_Graphing_a_Linear_Equation`

**License confirmed:** CC BY 4.0 via LibreTexts (https://math.libretexts.org/Bookshelves/Applied_Mathematics/Applied_Finite_Mathematics_(Sekhon_and_Bloom)). LibreTexts page footer shows CC BY 4.0 license badge (confirmed by author screenshot, March 5, 2026). This covers both text and images on the page. Compatible with CC BY-SA 4.0.

**Resolved (March 5, 2026):**
- [x] Added LICENSE file to `external-sources/applied-finite-mathematics/` documenting CC BY 4.0 origin, authors, source URL
- [x] Added visible attribution paragraph at the start of `equations-and-lines-new.tex` (after `\chapter{Linear Equations}`) with author names, source URL, and CC BY 4.0 license link
- [x] Added Applied Finite Mathematics to the preface source list with license info

---

## HIGH — Should resolve before formal publication

### 7. MOSEK Cookbook Content — License Unclear

**Location in book:** *Not in book1-main.pdf* — this content is in `integerProgrammingFormulations-LP-notes.tex`, not the `book1` variant
**Source file:** `part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-LP-notes.tex` (line 1147)
**Section:** "Exact absolute value" (Subsection of IP formulations)

**Issue:** The section is marked with the comment `% Borrowed from Mosek Cookbook`. The MOSEK Modeling Cookbook is published under its own terms. The comment is only in the source; no attribution appears in the compiled output.

**Resolved (March 5, 2026):** Borrowed content (subsections on exact absolute value, exact 1-norm, and maximum) removed from source file and saved to `NON-DISTRIBUTABLE/mosek-cookbook-excerpt.tex`. A TODO comment with the MOSEK reference was left in place. The MOSEK Modeling Cookbook link was kept in the resources list (line 1758) as a reference — linking is not a license issue.
- [x] Borrowed content removed from integerProgrammingFormulations-LP-notes.tex
- [x] Content preserved in NON-DISTRIBUTABLE/ for reference
- [ ] Rewrite these standard IP formulations in original words if this chapter is ever compiled


### 8. Kevin Cheung / lineqlpbook — No LICENSE File in Source Directory — RESOLVED

**Location in book:** Content from Cheung is distributed across multiple chapters in Parts 1–3. The preface (page 3 / PDF p. 3) acknowledges this source.
**External directory:** `external-sources/lineqlpbook/`
**Referenced in:** `frontmatter/preface.tex` lines 15–16

**License confirmed (March 3, 2026): CC BY-SA 4.0.** Every `.tex` file in the lineqlpbook directory contains a header comment explicitly stating the license, e.g.:
```
%By Kevin Cheung
%The book is licensed under the
%Creative Commons Attribution-ShareAlike 4.0 International License.
%This file has been modified by Robert Hildebrand 2020.
%CC BY SA 4.0 licence still applies.
```
The directory also includes `images/by-sa.png` (the CC BY-SA badge). The upstream GitHub repo (https://github.com/dataopt/lineqlpbook) does not have a standalone LICENSE file, but the per-file headers are definitive.

**This license is directly compatible with the book's CC BY-SA 4.0 license.**

- [x] License verified: CC BY-SA 4.0 per source file headers
- [x] LICENSE file added to `external-sources/lineqlpbook/` documenting CC BY-SA 4.0 origin and the per-file header convention (May 5, 2026)


### 9. License Version Compatibility — CC BY 3.0 Sources — LARGELY RESOLVED

**Locations in book:**
- **Lyryx / "A First Course in Linear Algebra"**: Appendices B–C (pages 409–487 / PDF pp. 415–493), plus the Lyryx tribute page (page 485 / PDF p. 491)
- **Foundations of Applied Mathematics Labs**: Various formatting and selected sections throughout

**Affected source directories:**
- `external-sources/aFirstCourseLinearAlgebra/` — **LICENSE.txt actually says CC BY 4.0** (not 3.0 as previously reported). The file header reads "Attribution 4.0 International" and contains the full CC BY 4.0 legal text.
- `external-sources/foundationsAppliedMathematicsLabs/` — Licensed CC BY 3.0 US (see `cc-by-license.txt`). The local README.md (line 3) claims "It is a licence CC BY SA 4.0" for the adapted version; the original upstream README (line 91) confirms "Creative Commons Attribution 3.0 United States License."

**Status (March 3, 2026):**
- **Lyryx (CC BY 4.0):** Directly compatible with CC BY-SA 4.0. CC BY 4.0 content can be freely adapted and included in a CC BY-SA 4.0 work. Just maintain attribution.
- **Foundations (CC BY 3.0 US):** CC BY 3.0 allows adaptation under any compatible license. CC BY-SA 4.0 is a valid adapter's license. The local README already documents this upgrade. Just maintain attribution.

**Both are legally compatible.** The only requirement is proper attribution (author names, source URL, original license, indication of modifications).

- [x] Lyryx license verified: CC BY 4.0 (not 3.0) — directly compatible
- [x] Foundations license verified: CC BY 3.0 US — compatible via adapter's license provision
- [ ] Confirm that front matter attribution for both sources includes author names, source URLs, and license info


### 10. Python-MIP Example — License Check — RESOLVED

**Location in book:** Chapter 15 "Integer Programming Formulations"
**Source file:** `part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex`

**Resolution (March 3, 2026):** The entire JSSP section has been rewritten with original content:
- Removed "Example borrowed from: Python MIP example" attribution line
- Replaced the 3-job/3-machine introductory example with an original 4-job/3-machine workshop example
- Replaced the 5-job/3-machine numerical data (processing times matrix, machine sequences matrix) with original 4-job/3-machine data consistent with the new example
- The mathematical formulation (sets, parameters, variables, constraints) is standard JSSP textbook material and was retained
- The Duplo Scheduling example and figures are the author's own and were retained

- [x] JSSP section rewritten with original example data
- [x] No Python-MIP content remains in book1

---

## MEDIUM — Best practices for proper attribution

### 11. Wikipedia/Wikimedia Image Attributions — Incomplete — RESOLVED for book1

**Resolution (March 3, 2026):** Of the three wiki images in book1-main, two have been resolved and one was already fine:

| Image | File | Status |
|-------|------|--------|
| `linear-programming.png` | `mathematicalProgramming.tex` | **Commented out** — TikZ version (`Figures/LP-figure`) renders instead. Wiki image no longer in compiled PDF. |
| `integer-programming.png` | `mathematicalProgramming.tex` | **Commented out** — TikZ version (`Figures/integer-programming`) renders instead. Wiki image no longer in compiled PDF. |
| `Konigsberg_bridges.png` | `graphtheory-dor1.tex` | **Already had proper attribution** — footnote with author (Bogdan Giuscă), Wikipedia URL, and license (Public Domain, CC-BY-SA 3.0). |

The remaining wiki images (`knapsack.pdf`, `Petersen-graph-3-coloring.png`, `2-opt_wiki.png`, `Big-O-notation.png`, `complexity-classes.png`, `triangle_inequality.png`) are NOT in book1-main.pdf.

- [x] All wiki images in book1 now have either proper attribution or have been replaced by original TikZ figures
- [ ] Wiki images in non-book1 files still need attribution if those chapters are compiled later


### 12. Pioneer Spotlight Sections — Citation Stub

**Location in book:** George Dantzig spotlight in Chapter 8, pp. ~183–185 (PDF ~189–191)
**Source file:** `simplex-basis-driven.tex` lines 2728–2748

**Other spotlights (not in book1-main.pdf):**
- `integerProgrammingAlgorithms.tex` — Egon Balas (by Irma Adams)
- `NLP-algorithms.tex` (ch18 and ch19) — Margaret H. Wright (by Irma Adams)

**Issue:** The `\parencite` and `\textcite` commands reference bibliography keys (e.g., `gass_2008_memorial`, `cottle_2007_george`) but bibliography rendering requires biblatex/biber which is not fully configured. The rendered output shows raw citation keys instead of formatted references.

**Resolved (March 5, 2026):** Replaced all `\parencite`/`\textcite` commands in the Dantzig spotlight with manual `\footnote{}` entries containing full citation text (author, year, title, publisher/journal, URL). Removed the `\begin{refsection}` / `\end{refsection}` wrapper and `\printbibliography` call since they are no longer needed.
- [x] Dantzig spotlight now renders with proper footnote citations
- [ ] Non-book1 spotlights (Balas, Wright) still use biblatex commands — fix when those chapters are compiled


### 13. Preface — Incomplete Source List

**Location in book:** Preface, page 3 (PDF page 3)
**Source file:** `frontmatter/preface.tex`

**Issue:** The preface acknowledged four major sources (Lyryx, Foundations, Cheung, Bish) but omitted others and did not list licenses.

**Resolved (March 5, 2026):**
- [x] Added license information (CC BY 4.0, CC BY 3.0 US, CC BY-SA 4.0) next to each existing source in the preface
- [x] Added Applied Finite Mathematics (Sekhon and Bloom, CC BY 4.0) as a new entry
- [ ] Griffin content has been fully rewritten — no longer needs preface acknowledgment as borrowed content
- [ ] Vorwerk content is not in book1 — add to preface if/when compiled


### 14. Screenshot Images in Section2.tex — Provenance Unclear

**Location in book:** Chapter 6 "Graphical Method," pages 96–100 (PDF pages 102–106)
**Source file:** `part1-linear-programming/ch02-modeling/Section2.tex` (lines 62–118)

**Images referenced:**
- `screenshots/example0-inequalities` (line 62)
- `screenshots/example0-feasible-region` (line 72)
- `screenshots/example0-extreme-points` (line 117)
- `screenshots/example0-extreme-point-solutions` (line 118)
- `screenshots/example1-optimal-solution` (line 85)

**Issue:** These appear to be screenshots from software (Desmos, MATLAB, or similar). The files exist under `external-sources/Christopher_Griffin_Penn_State_University/screenshots/` but their original provenance is unclear. Screenshots of commercial software output may have licensing restrictions.

**Action required:**
- [ ] Determine the source of these screenshots
- [ ] If from Griffin's notes, resolve under issue #1 above
- [ ] Consider replacing with original plots generated via TikZ/pgfplots

---

## Summary Checklist

| # | Issue | Severity | Book Location | Status |
|---|-------|----------|---------------|--------|
| 1 | Griffin content — CC BY-NC-SA 3.0 (INCOMPATIBLE) — must rewrite | CRITICAL | Ch. 6, pp. 96–118 (PDF 102–124) | [x] Source rewritten + files relocated to NON-DISTRIBUTABLE/ + LICENSE file added; **deletions still need git commit + push** |
| 2 | 2-opt figures — unknown source | CRITICAL | Not in book1 (heuristics.tex) | [ ] Not in book1 |
| 3 | Vorwerk content — no license | CRITICAL | Not in book1 (external-sources/) | [ ] Not in book1 |
| 4 | Multi-objective scanned images — no source | CRITICAL | Ch. 13, pp. 290–303 (PDF 296–309) | [x] Author confirmed images are his own |
| 5 | ResearchGate verbatim text | CRITICAL | Not in book1 (ch14 exponential) | [x] Removed from source; saved to NON-DISTRIBUTABLE/ |
| 6 | Applied-finite-math — no license file | CRITICAL | Appendix A, pp. 387–406 (PDF 393–412) | [x] LICENSE file added + visible attribution in chapter |
| 7 | MOSEK Cookbook content | HIGH | Not in book1 (LP-notes variant) | [x] Removed from source; saved to NON-DISTRIBUTABLE/ |
| 8 | Cheung lineqlpbook — no local LICENSE | HIGH | Preface p. 3; content throughout | [x] License confirmed CC BY-SA 4.0 per file headers; LICENSE file now added |
| 9 | CC BY 3.0 → 4.0 compatibility notes | HIGH | Appendices B–C, pp. 409–487 (PDF 415–493) | [x] Lyryx is CC BY 4.0 (not 3.0); Foundations CC BY 3.0→4.0 upgrade legal |
| 10 | Python-MIP example license | HIGH | Ch. 15, IP Formulations | [x] JSSP section rewritten with original example data |
| 11 | Wiki image visible attribution | MEDIUM | Ch. 2 pp. 15–16; Ch. 14 p. 307; others not in book1 | [x] Wiki images replaced by TikZ in book1; Konigsberg already attributed |
| 12 | Pioneer Spotlight citations | MEDIUM | Ch. 8, pp. ~183–185 (PDF ~189–191) | [x] Replaced biblatex commands with manual footnotes |
| 13 | Preface source list incomplete | MEDIUM | Preface, p. 3 (PDF p. 3) | [x] Added Applied Finite Math + license info for all sources |
| 14 | Screenshot images provenance | MEDIUM | Ch. 6, pp. 96–100 (PDF 102–106) | [x] Resolved by Section2.tex rewrite (Griffin screenshots removed) |
