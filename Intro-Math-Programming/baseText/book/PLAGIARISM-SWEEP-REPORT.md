# Plagiarism / License Sweep Report

**Date:** 2026-07-15
**Scope:** All chapter files `\input` by `book/book1-main.tex` under `part1-linear-programming/`,
`part2-discrete-algorithms/`, `part3-integer-programming/` (18 files, plus the two nested
`optimization/open-optimization-examples/` files pulled in by ch11). Appendices, frontmatter,
backmatter, and external-sources were skipped (known provenance), per the sweep instructions.
Solutions-manual files were consulted (and edited) only where a chapter finding required it.

---

## Findings

| # | Location | Suspected source | Confidence | Evidence | Action taken / recommended |
|---|----------|------------------|------------|----------|----------------------------|
| 1 | `ch03-software/software-excel.tex`, exercise "Diet Problem in Excel" (`ex:excel-diet`) | Guenin, Könemann, Tunçel, *A Gentle Introduction to Optimization*, Cambridge UP 2014, Ch. 1 Exercise 1 (copyrighted) | **CONFIRMED (verbatim)** | Verified against the publisher's own preview PDF: identical 5-food table (raw carrots 0.14/23/0.1/0.6/6; baked potatoes 0.12/171/0.2/3.7/30; wheat bread 0.2/65/0/2.2/13; cheddar cheese 0.75/112/9.3/7/0; peanut butter 0.15/188/16/7.7/2), identical 2000/50/100/250 requirements, and near-verbatim sentence wording ("You need to decide how many servings of each food to buy each day so that you minimize the total cost..."). The solutions manual had already qaflag'd this data as suspect. | **FIXED (this sweep).** Exercise reworded and data fully regenerated (oatmeal / whole milk / brown rice / black beans / almond butter; requirements 2200 cal / 60 g fat / 90 g protein / 300 g carb). New optimum verified with `scipy.optimize.linprog` (HiGHS): x = (0, 6.3205, 4.7134, 1.0579, 0), cost \$3.1677; calories/fat/protein binding, carbs 331.3 g slack. Solutions manual `solutions-manual/ch03.tex` (Ex. 3.3 solution + chapter overview) updated to match; qaflag replaced with a resolved provenance note. |
| 2 | `ch06-simplex/simplex-basis-driven.tex`, "Cycling in the Simplex Method" (≈ lines 2378–2504) | Beale (1955), "Cycling in the dual simplex algorithm" — the classic cycling instance | **CONFIRMED (rescaled)** | The dictionary max 0.75x₁ − 20x₂ + 0.50x₃ − 6x₄ with rows (0.25, −8, −1, 9), (0.50, −12, −0.5, 3), x₃ ≤ 1 is exactly Beale's instance (0.75, −150, 0.02, −6; rows 0.25/−60/−0.04/9 and 0.5/−90/−0.02/3; x₆ ≤ 1) with the second variable's column divided by 7.5 and the third's multiplied by 25 (a units change). Six displayed pivots reproduce Beale's cycle. | **FIXED (this sweep).** Per sweep instructions the example may stay (mathematical fact) but must cite Beale (1955). Added an inline attribution sentence before the initial dictionary crediting E. M. L. Beale (1955) and noting the rescaling. (Plain-text attribution used, matching the section's existing plain-text Chvátal mention; the bib file lives in an external repo.) |
| 3 | `ch07-sensitivity/sensitivity-LP.tex`, exercise "Full Sensitivity Workup" (`ex:sensitivity-workup-2x2`, ≈ line 918) | Hillier–Lieberman *Wyndor Glass* (disguised) | **Medium-high (near-exact)** | Objective max 3x₁ + 5x₂ identical to Wyndor; constraint 3x₁ + 2x₂ ≤ 18 identical to Wyndor's third constraint; optimum (2, 6) and z\* = 36 identical to Wyndor's famous answer. Only the first constraint differs (x₁ + 2x₂ ≤ 14 replaces x₁ ≤ 4, 2x₂ ≤ 12, engineered to keep the same optimum). Exercise is new-ladder-style but the data collides with the fingerprint. | **REPORT ONLY** (not an exact match, and it has both an in-book Selected Solution and an annotated solutions-manual entry, so a data change touches three places). Recommended replacement: e.g. max 4x₁ + 5x₂ s.t. x₁ + 2x₂ ≤ 12, 3x₁ + 2x₂ ≤ 24 → opt (6, 3), z\* = 39 (verify shadow prices/ranges before adopting). Any change must also update `solutions-manual/ch10.tex` (Ex. annotated there) and the chapter's Selected Solutions block. |
| 4 | `ch08-duality/complimentary-slackness.tex`, "Summary: Why Learn Duality?" LP (≈ lines 637–660) | Winston *Giapetto* (constraint block) | **Medium** | Constraints 2x₁ + x₂ ≤ 100 and x₁ + x₂ ≤ 80 are exactly Giapetto's finishing/carpentry pair (here relabeled Labor/Material). Objective differs (50x₁ + 20x₂ vs 3x₁ + 2x₂) and Giapetto's x₁ ≤ 40 is absent, so the LP and its solution ((50,0), \$2500, duals 25/0) are not Winston's. | **REPORT ONLY.** Low legal risk (two generic constraints, different objective/answer), but given the book just scrubbed Dakota and Chvátal data, a one-minute tweak severs the echo: change RHSs to 90/70 (opt (45,0), profit \$2250, labor dual \$25, material \$0 — same pedagogical story, trivially recomputable). |
| 5 | `part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex` | Lippman, *Math in Society* (CC BY-SA 3.0) — **known, attributed** | High (but license-compatible) | Reuse extends beyond the header's parenthetical "(the lawn inspector and Konigsberg exercises)": the Dijkstra intro prose ("...your Aunt's house in Pasadena"), the T/A/NB/MR/E/P/Y shortest-path example, the Euler-circuit/eulerization exercises, and the TSP computer-network table (44/34/12/40/41...) are all Lippman's. All 8 old-style (non-ladder) exercises in the book trace here. | **No license problem** (CC BY-SA → CC BY-SA). Recommend broadening the header comment and the sources-attribution entry to say the Dijkstra, Euler, and Hamiltonian/TSP sections and several exercises are adapted from Lippman, not just the two named exercises. |

## Items examined and judged clean (or already-handled provenance)

**Famous-fingerprint scan — no hits anywhere in the swept chapters for:**
Winston Giapetto (full LP with 3x₁+2x₂ objective and x₁ ≤ 40 — only the partial echo in finding 4),
Winston Dorian/auto ads (7,2/2,12; 50/100), Taha Reddy Mikks (6,4,24 / 1,2,6 / −1,1,1 / x₂≤2),
Chvátal ch. 1 LP (5,4,3 / 2,3,1,5 / 4,1,2,11 / 3,4,2,8), Winston Sailco (40/60/75/25),
Winston Powerco (35/50/40; 45/20/30/30), Vanderbei resource allocation (12x₁+9x₂; 1000/1500),
Hillier–Lieberman Wyndor in exact form (x₁≤4, 2x₂≤12). Name search (Giapetto, Wyndor, Dakota,
Sailco, Powerco, Reddy Mikks, Dorian, Winston, Hillier, Taha, Chvátal, Bertsimas, Vanderbei, Beale)
returned nothing except a generic "Chvátal–Gomory cut" term in ch11.

**Chapters checked with all LP/IP instances extracted and compared (clean bill):**
- `ch01-introduction/introduction-book.tex`, `mathematicalProgramming.tex` — generic form statements; shirt-company (Roanoke) and juice-company examples read original.
- `ch02-modeling/modeling-linear-programming.tex` — TAA/LazWeld1/CrumCut1 welding-robot example and the sci-fi tablet diet (1.25/1.05/0.85/0.65) have no web-searchable external source (searched "LazWeld1", "CrumCut1", "transparent aluminum alloy" + LP, "as envisioned in a bad 70's science fiction film"); data lives in the project's own examples repo. Post-office-style scheduling demands (6/4/5/4/3/7) match neither Winston's nor Taha's classic data. Sekhon–Bloom-style solved examples (factory days, machine product mix) = known CC BY provenance.
- `ch03-software/software-excel.tex` — clean after finding 1 fixed; remaining exercises (widgets/gadgets 8/6, transportation 4-8-1-6-3-5 with 60/50 & 30/40/40, furniture 70/50/90) match no fingerprint.
- `ch02-modeling/modeling-sums.tex`, `modeling-sums-continued.tex` — production-balance, assignment, min-max assignment, network-flow models: generic/original data; Uruguayan housing case study is recent original writing.
- `ch02-modeling/Section2.tex` — Cheung-derived content (3x+2y intro LP, 27/31/24 diet, Fourier–Motzkin 11/5, −2/5) is covered by the chapter's Cheung CC BY-SA footnote attribution.
- `ch05-lp-theory/formalize-LP.tex` — Cheung ch5 provenance (known, attributed); remaining instances generic.
- `ch06-simplex/*` (3 files) — running bakery example (2x+3y; 9/16/14) and all pivot/Big-M/two-phase instances are bespoke; cycling example handled (finding 2); exercise LPs (5,3/12,16; 5,8/30,30; 6,8,5/1800,2000,3200; 40,48,30/25,30; etc.) match no known text.
- `ch07-sensitivity/sensitivity-LP.tex` — clean except finding 3; other exercise LPs (4,3/10,16; 5,2/10,15; 5,4/6,15; 50,30/40,30) generic.
- `ch08-duality/duality.tex`, `complimentary-slackness.tex` — the bakery duality example (90/40/70 with flour 40, sugar 10, baking 7) is the post-Dakota replacement and is not isomorphic to Dakota; toy pair (3,2 / 4,5) generic; clean except finding 4.
- `ch03-software/software-python-book1.tex` — product-mix (3,2 / 300,160,180) and transportation code are bespoke; PuLP usage follows the library's MIT-licensed API idioms only, no verbatim doc examples; **no Gurobi example code present** (only a link to the project's own notebook). The Book-2-only file `software-python.tex` (not compiled into Book 1) says it "follows the introduction to pulp Jupyter Notebook Tutorial" — check that file before it is ever re-included.
- `ch09-multi-objective/multi-objective-optimization_updated.tex` — furniture 8000/2000 revenue-waste example and supplier-contract Pareto tables are original.
- `ch11-ip-formulations/integerProgrammingFormulations-book1.tex` (+ nested capital-budgeting and set-covering examples) — knapsack 12/2/1/1/4 ≤ 15 with values 4/2/2/1/10 matches the well-known Wikipedia knapsack illustration (CC BY-SA — compatible; consider noting it); capital budgeting 10/8/6 with 3,1,2 ≤ 5 and 4,2,1 ≤ 6 matches no fingerprint; strip-packing, job-shop, QAP, GAP text spot-checked with exact-phrase web searches, no matches.

## Method notes

1. **Fingerprint scan:** every `\max`/`\min` display block with numeric data in the 18+2 swept
   files was machine-extracted (regex over alignment environments) and eyeballed against the
   fingerprint list; supplementary regex sweeps for the characteristic coefficient patterns and
   RHS combinations (100/80/40, 28/24, 24/6/1/2, 4/12/18, 0.75/−150/0.02/−6 and rescalings,
   35/50/40, 45/20/30/30, 40/60/75/25, 12/9/1000/1500) were run repo-wide over the book directory.
2. **Exercise dating:** exercises lacking the new ladder markers (`\stars`/`\exgroup`/`\exrefs`)
   exist only in the graph-theory chapter (8 items) — all Lippman-derived (finding 5). All other
   chapters' exercises are new-style; they were still scanned for fingerprint collisions
   (findings 1 and 3 show new-style exercises can carry inherited or colliding data).
3. **Prose spot-checks (exact-phrase web searches):** 8 distinctive multi-sentence passages
   checked — capital-budgeting/knapsack framing, disjunction/strip-packing prose, cycling
   definition, network-flow intro, the sci-fi diet framing, LazWeld/TAA robot names, the GKT diet
   exercise wording (MATCH — finding 1), and the Lippman Dijkstra prose (known source). Only the
   two expected sources matched.
4. **Code listings:** Book 1's software chapters use PuLP + scipy only; no Gurobi example code is
   compiled into Book 1, so no proprietary-license exposure found there.
5. **Numeric verification of edits:** both content edits in this sweep (new diet data; no other
   data changed) were verified with `scipy.optimize.linprog` (HiGHS). The Beale attribution is a
   citation-only edit with no numeric content.

## Edits made during this sweep (3 files)

1. `part1-linear-programming/ch03-software/software-excel.tex` — replaced GKT diet exercise data
   and reworded the exercise prose.
2. `solutions-manual/ch03.tex` — updated Ex. 3.3 solution to the new data (scipy-verified),
   replaced the qaflag with a resolved provenance note, updated the chapter overview sentence.
3. `part1-linear-programming/ch06-simplex/simplex-basis-driven.tex` — added inline Beale (1955)
   attribution sentence before the cycling example.

---

# DEEP SWEEP #2 (2026-07-15/16) — prose-level, four parallel reviews + remediation

## Confirmed and FIXED

| # | Finding | Evidence | Resolution |
|---|---------|----------|------------|
| 1 | Griffin Math 484 notes (CC BY-NC-**SA** 3.0, license-INCOMPATIBLE) prose in ch2: the Assumptions subsection (incl. a "plane or boat" fossil and a "1045.3" rounding sentence matching his text), plus narrative-template echoes in the Screen Printing example | Web-verified against the PSU PDF snippets | Assumptions subsection rewritten from scratch in the book's voice around the screen-printing example; example narrative restructured; fossils gone (grep-verified) |
| 2 | Winston "Leary Chemical" exercise verbatim (data + wording + answer) as ex:ChemicalPlant | Matches Winston ch.3 problem reproductions online | Replaced with an original coatings-plant instance (lines at \$5/\$2, optimum (2,4) hours, \$18; scipy-verified); book Selected Solution + manual ch02 updated |
| 3 | "Stochastic Objective" exercise wording (Griffin-derived) | Same source family | Rewritten as "Random Costs in the Objective" with fresh statement and hint |
| 4 | JSSP section: model and component prose matching the Python-MIP documentation example | Side-by-side | Re-derived with the book's own notation and constraint order, tied to the chapter's Either-Or recipe; Manne (1960) cited |
| 5 | Graph coloring: variable-definition and symmetry-model paragraphs close to the cited Mendez-Diaz & Zabala paper | Side-by-side | All three passages rewritten fresh; models kept (standard) and explicitly framed as "two strengthened formulations from" the cited paper; \leqslant normalized |
| 6 | Solver/license table copied from the YALMIP solver page (selection, ordering, editorial remarks; no open license) | Side-by-side with yalmip.github.io | Table rebuilt as an independent compilation (4 rows, open-source vs commercial columns, own remarks); courtesy pointer to YALMIP + COIN-OR added |
| 7 | False figure metadata authorship: Konigsberg bridges (Wikimedia/Bogdan Giusca), GraphPicture*/GraphExercise* (Lippman; aerial base by Sam Beebe), complexity-classes entry carrying a copy-pasted TriangleInequality URL/shorttitle | Bib inspection | All entries corrected |
| 8 | GAP text inside a dormant \iffalse block adapted from Wikipedia without attribution | Inspection | Warning comment added above the block: attribute or rewrite before re-enabling |
| 9 | INFORMS' well-known one-line definition of OR used without credit | Common knowledge | Sentence now attributes the phrasing to INFORMS |
| 10 | ch5 generic instructional prose runs shared with the pre-cleanup legacy files (outcomes list, region-plotting walkthrough, nonempty/bounded/extreme-point passages) | Shingle overlap with quarantined legacy snapshot | Rewritten fresh as a precaution (also fixed a "can then can" typo) |

## Method caveat (important for future audits)

The quarantined NON-DISTRIBUTABLE folder is a snapshot of the BOOK'S pre-cleanup
chapters, not Griffin's pristine notes: shingle overlap with it also matches
Cheung's attributed lemonade content and the book's own later additions.
Overlap with that folder therefore means "text predates the license cleanup,"
not "text is Griffin's." Definitive Griffin attribution requires comparison
against the actual PSU PDF, which was only possible via search snippets.

## Open items for the author (library access recommended)

- Spot-check these ch5 passages against the actual Griffin PDF: the
  basic-solution/basic-feasible-solution terminology sentence, the
  Enumerate Vertices algorithm step wording, and the Extreme Directions
  rise/run passage (\S5.8). All are either generic or book-original in
  style, but a two-minute PDF check settles it.
- The four sweeps' clean bills: famous-fingerprint scan (Winston, Hillier,
  Taha, Chvatal, Bertsimas, Vanderbei), ~30 quoted-phrase web checks across
  all chapters, Excel chapter vs. excel-easy.com, Python chapter vs. PuLP
  docs and tutorials, multi-objective vs. pymoo/Wikipedia, frontmatter, and
  Griffin-shingle checks of ch7-ch13 (zero prose overlap).

---

# SWEEPS #3 and #4 (2026-07-16): search-corpus + local forensics

Two new methods were used, run as parallel sweeps.

## Sweep #3 - systematic search-engine corpus (~73 quoted searches)

Method: ~45 paragraph-sampled quoted-phrase searches spread across all 18
chapter files (3 per major section, mid-paragraph samples), plus ~20
solution-site queries (Chegg/Quizlet/Numerade/Bartleby/Studocu) against
older exercises, plus 13 targeted searches to settle the ch5 Griffin
questions.

Findings and fixes:

| # | Finding | Verdict | Fix |
|---|---------|---------|-----|
| 1 | ch2 "Oven Store" exercise: scenario circulates verbatim on Chegg; not found in the Sekhon-Bloom text the section credits; likely commercial finite-math textbook origin | Moderate | Replaced with original "E-Bike Showroom" instance (floor 60 m2 / staff 120 h / assembly 75 h; profits 150/300/240; opt (0,0,20), $4800; scipy-verified unique). Same teaching point: profit per unit of the scarce resource. |
| 2 | ch2 "Manufacturing Profit" (Machines I/II, 180/300 h, profits 20/30/40): verbatim on Chegg/Bartleby/Studocu; Tan-style commercial family; not in Sekhon-Bloom | Moderate | Replaced with original furniture-workshop instance (router 200 h, finishing 240 h; profits 25/40/55; opt (40,80,0), $4200, both bind, cabinet dominated; scipy-verified unique). |
| 3 | ch2 "Factory Production Scheduling" (demands 1000/1600/700, day costs $4000/$5000): verbatim on solution sites; commercial flavor | Moderate | Replaced with original juice-bottling instance (rates 30/20/10 and 10/30 per day, demands 300/320/180, costs $3000/$4500; opt (15,1), $49,500; orange+grape bind, apple over at 460; scipy-verified). |
| | | | Chapter Selected Solutions and solutions-manual ch02 (2.6-2.8) updated in sync, each with a qaflag documenting the licensing replacement. |
| 4 | ch5 Griffin open items (BFS terminology sentence, Enumerate Vertices steps, rise/run passage): 13 targeted searches incl. PSU-domain-restricted | NOT FOUND in Griffin or anywhere else (high confidence; direct PDF grep still impossible) | No action needed; the three passages read as in-house scaffolding. |
| 5 | BYU ACME simplex sentence (ch6) and Lippman ch10 prose: verbatim but CC-licensed and already attributed | Clean | None. |

## Sweep #4 - local forensics (git history, comments, images, stylometry)

| # | Finding | Verdict | Fix |
|---|---------|---------|-----|
| 1 | archive/orphaned-content/borrowed-duality.tex carried a VERBATIM excerpt of Jeff Erickson's LP notes (self-labeled "%this was borrowed from..."). License check: Erickson's book is CC BY 4.0, but his OTHER lecture notes (incl. the LP notes) are CC BY-NC-SA 4.0 - incompatible, same class as Griffin | Moderate (orphaned, not compiled, but distributed in the public repo) | File DELETED 2026-07-16 (mirrors the earlier Griffin removal). The Book 1 duality chapter itself was checked by shingle comparison: no substantive Erickson overlap (46/3411 generic 8-grams) - it is a rewrite. |
| 2 | Legacy optimization/duality.tex still carried the stale 2023 note "This is a borrowed section..." although the content had been rewritten | Info | Note replaced with an accurate provenance comment. |
| 3 | 00_METADATA.bib claimed "Robert Hildebrand [CC BY-SA 4.0]" authorship for two YouTube-page screenshots (youtube-OR-course.jpg, youtube-tsp-simulated-annealing.jpg) | Moderate (false authorship + third-party copyrighted page content) | Both entries corrected to state third-party screenshot status. Book 2 ch16 usage of the TSP screenshot commented out (plain hyperlink retained). |
| 4 | Book 2 ch16: five 2-opt figures included with footnote "Figures borrowed from unknown source" - and the image files no longer exist in the repo | Moderate (Book 2) | Includes + footnote removed; TODO comment to recreate as original TikZ. |
| 5 | Book 2 ch11 (LP-notes): exact-abs/1-norm/max subsections were once "%Borrowed from Mosek Cookbook" (legacy comment); Book 2 copy is a paraphrased rewrite with the comment stripped. Mosek Cookbook is plain (c) MOSEK ApS, NOT confirmed open | Moderate (Book 2) | Provenance comment restored above the section; TODO to cite the cookbook as further reading. Prose verified as rewritten; formulations are standard math. |
| 6 | Git history: no incriminating commit messages; deleted ucdavis-advanced-linear-programming.pdf (once \includepdf'd wholesale) survives in git history | Info | Candidate for git-filter-repo purge if desired; not in any current build. |
| 7 | StripPacking0/1/2.png embed "Wolfram Language for Students - Personal Use Only" metadata | Info | Authorship (Fravel) fine; consider regenerating to drop the watermark tag. Unused figure sources with non-open provenance (linear-regression.tex from latexdraw.com, svm2.tex from a blog) should be deleted or license-checked before ever using. |
| 8 | Stylometry outlier scan (103 sections): every strong outlier is known-provenance (Cheung, Lyryx, Lippman) or the book's own tutorial/exercise voice | Clean | No unexplained foreign-voice clusters in Book 1. |

## Remaining open items after four sweeps

- Book 2 (pre-Book-2 punch list): Mosek citation, 2-opt TikZ recreation,
  JSSP re-derivation in the LP-notes copy, youtube-OR-course screenshot
  usage in legacy resources file (currently commented out).
- Optional: purge ucdavis PDF and Griffin files from git history
  (git-filter-repo); regenerate StripPacking PNGs.
- Instructors with library access can spot-check the three ch5 passages
  against Griffin's PDF, though four sweeps now agree they are in-house.

---

# DATA-ORIGINALITY PASS + HISTORY PURGE PREP (2026-07-16)

Author policy adopted: rewording prose is not enough - the NUMBERS must be
original too, because designing data that makes a problem work through nicely
is real intellectual effort. Exception: classical instances where the exact
numbers ARE the point (e.g., cycling examples), used with explicit citation.

Audit of every "prose rewritten" fix from earlier sweeps:

| Item | Data status | Action |
|---|---|---|
| Screen Printing (ch2) | Checked against Griffin's ToyMaker (planes/boats: net profits 7/6, hours 3,1/1,2, caps 120/160, demand 35). Book data (net 10/8; 2,3/1,1; 150/60; 45) shares only the story skeleton; all numbers differ | Keep |
| Assignment example "Hiring for tasks" (ch2) | Cost matrix was flagged as similar to the excel-easy.com tutorial | REPLACED with original matrix [[45,38,60],[52,41,33],[27,49,56]]; unique optimum P1-T2, P2-T3, P3-T1, cost 98 (enumeration-verified). Book model line, both notebooks (pulp, gurobipy; outputs cleared), and assignment-problem-excel.xlsx all updated in sync; hedging footnote removed |
| JSSP (ch11 book1) | 4 jobs x 3 machines, book-designed times; Python-MIP's docs example is a different 3x3 instance | Keep (Book 2 LP-notes copy still borrows Python-MIP's data - on the Book 2 punch list) |
| Beale cycling example (ch6) | Classical-instance exception applies; already presented as "a rescaled version of the classic cycling example constructed by E. M. L. Beale (1955)" with the rescaling disclosed | Keep as is - model usage of the exception |
| Dakota, Wyndor-echo, Leary, Chvatal ex., Guenin diet, Excel diet, three Chegg-flagged ch2 exercises | All already replaced with new data in earlier sweeps (scipy-verified) | Done previously |
| Cheung ch5, Sekhon-Bloom, Lippman ch10 borrowings | Open licenses (CC BY-SA / CC BY) with attribution - reuse of data is the licensed, credited kind, not copying | Keep |

## Git history purge (prepared, NOT executed)

scripts/purge-history.sh (git-filter-repo) removes from ALL history:
- Christopher_Griffin_Penn_State_University/ (CC BY-NC-SA)
- optimization/ucdavis-*.pdf (6 course-notes PDFs, unresolved copyright)
- archive/orphaned-content/borrowed-duality.tex (Erickson, CC BY-NC-SA)

Verified clean/keep: external-sources/aFirstCourseLinearAlgebra (Lyryx, open),
CourseNotes-*.pdf (author's own builds), NON-DISTRIBUTABLE/ (gitignored, never
tracked - confirmed 0 tracked files). Run on a fresh clone; force-push; all
collaborators re-clone; contact GitHub Support to invalidate cached old
commits. Full instructions in the script header.
