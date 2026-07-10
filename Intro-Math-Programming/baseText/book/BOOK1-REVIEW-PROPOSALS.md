# Book 1 Full Review — Fixes Applied & Proposals

Date: 2026-07-08. A four-agent sweep of every chapter plus an alt-text audit.
~90 minor errors were **fixed directly** (typos, grammar, quote marks, and a dozen
verified math errors — full before/after lists in git diff). Below: what was fixed
in summary, and what needs your judgment.

---

## Part A — Highest priority (content is missing or wrong)

1. **`ch04-graphical/linearProgrammingGraphicalExample.tex` is EMPTY (0 bytes)**
   but is `\input` by book1-main.tex line 153. Chapter 5's opening assumes the
   reader saw this content. A full version exists at
   `external-sources/lineqlpbook/linearProgrammingGraphicalExample.tex`.
   → Restore/adapt it, or delete the `\input`.

2. **`ch10-graph-theory/graph_algorithms.tex` is empty** (license header only) but
   is `\input` immediately before graphtheory-dor1.tex. Delete the input or fill it.

3. **Graph theory: live exercises test dead content.** The `\ifdefined \old` block
   (graphtheory-dor1.tex ~lines 2631–4036) disables all instruction on Euler
   paths/circuits, Fleury, eulerization, Hamiltonian circuits, TSP heuristics
   (NNA/RNNA/Sorted Edges) — but the *live* Skills/Concepts/Explorations exercises
   still assign those topics. Either revive that material as proper sections or
   trim the exercises. **This is the biggest pedagogy gap in the book.**

4. **Graph theory "Exercise Answers" mislabeled** (~lines 1475–1610): four
   different answers all cite `\ref{ex:5cities}`; several answer bodies are
   commented out leaving orphan one-liners.

5. **Duality exercise with infeasible "optimal" data** (duality.tex ~line 1094,
   "Shadow Prices and Dual Variables"): claimed optimum (7⅓, 5⅓) violates the oven
   constraint (12⅔ > 12). Minimal repair: change oven RHS 12 → 13 (then every
   other number in the exercise stays correct). Alternative: keep 12, change
   solution to (8,4), z*=56, duals (1,0,3) — but then parts 2–4 change.

6. **Facility-location example data infeasible** (IP chapter ~line 283):
   capacities sum to 270 vs demand 1150. Rescale one side (check the linked
   notebook for the intended numbers).

7. **Fixed this pass (for awareness):** the matrix-simplex "Verifying Optimality
   of (0,8)" example used the wrong basis {x₂,s₁} (which is infeasible) and a
   sign-flipped inverse; rebuilt with the correct basis {x₂,s₂}, verified
   reduced costs (−½, −5/2). Also the (6,5) reduced-cost display now shows the
   final subtraction (−19/7, 1/7). Similarly fixed: basic solution (2,1)→(6/5,7/5)
   in Example 1; sensitivity dictionary z=34→36−2s₁−s₂; SOS2 stated optimum
   (x₃,x₄)=30 → (x₁,x₂)=35; k-of-n disjunction table row 8; furniture rosewood
   20→12 bdft; Atlanta self-distance 8→* in five tables; set-covering example
   max→min; capital-budgeting variable definition inverted.

## Part B — Structural proposals (worth an editing session each)

8. **formalize-LP.tex needs a dedup pass**: convex combination defined 2×, Convex
   Set 3×, linear independence 2×, polyhedra-are-convex proved 2×; lines 433–471
   are an orphaned early draft. Also: the chapter opens with `\subsection` before
   any `\section` (renders as 0.x); the "Convexity of Polyhedra" theorem statement
   is commented out so the box renders empty with a proof following; the vertex
   theorem proof has real gaps (contradiction doesn't match the assumption; the
   c·d=0 case needs boundedness).

9. **simplex-basis-driven.tex**: the running example is walked twice in full
   (lines ~905–1485 and again ~1615–1684) — add a "same computation, compactly"
   signpost or trim; two unnumbered `\section*`s break TOC consistency; the
   claim that *lexicographic tie-breaking* fails to prevent cycling (~line 2358)
   is wrong (lexicographic is an anti-cycling rule) and the Bland's-rule "proof"
   argues lexicographic improvement — both need rewording; Dantzig spotlight's
   "standard form" display is garbled; three display blocks with commented-out
   content render stray "− + =" fragments (~lines 1212, 1240, 1269).

10. **Sign-convention bridge between the three simplex treatments**: dictionary
    chapter enters on positive coefficients, matrix chapter uses reduced costs
    ≤ 0, tableau chapter uses most-negative z-row entry. The tableau chapter has
    a nice "sign convention" panel; add a one-line equivalent to the matrix
    chapter. A small feasible-region figure for the matrix chapter's own LP
    (marking bases 1–3, incl. the infeasible (−9,−7)) would also help.

11. **Duality chapter**: Big-M worked example narrates "Pivot 1: enter y₁, leave
    a₁" but the second dictionary is just the objective priced out (same basis) —
    renarrate; Weak Duality is stated as two nearly identical numbered theorems;
    the Bakery-2.0 example starts with no heading ("The primal problem describes
    a bakery… cakes, cookies, muffins") right after the 2-variable running
    example — add a subsection heading; "Summary: Why Learn Duality?" currently
    lives in complimentary-slackness.tex before that file's exercises — consider
    moving to the end of the chapter.

12. **Ch 13 multi-objective, follow-ups from the flow review**: forward-reference
    "Pareto frontier" at first (intro) use; name the ε-constraint method where
    the inventory example implicitly uses it; give the intro example's parameters
    (or link code); align the methods table with the paragraphs (lexicographic
    has no paragraph; elbow isn't in the table); the third furniture figure
    doesn't actually identify the frontier (a plot in (revenue, waste) objective
    space is the missing bridge); the "Weighted Sum Method" exercise weights
    (0.4/0.6) make P1 and P2 tie exactly — change the weights; ε vs ϵ typesetting
    is mixed; drop "non-dominated" from the ex:pareto-table statement (it
    contradicts the task); the outcome box promises software use but the Tools
    section has no code — a 10-line ε-constraint PuLP loop would close it.

13. **IP chapter (15) leftovers**: "big-M activating" section repeats its intro
    sentence verbatim twice; duplicate list items around line 535; the
    if-then-indicator proof has three unmerged draft paragraphs after Case 2;
    "SOS2 with binary variables" and "Relaxing (nonlinear) equality constraints"
    subsections end abruptly (slide remnants); Job Shop "Variations" claims
    single-machine jobs but the data show two; p_ij convention flips between
    definitions; examplewithcode "Piecewise Linear Function Application" has a
    placeholder second argument instead of an \href.

14. **modeling-sums.tex / modeling-sums-continued.tex**: "Max-min Assignment-like
    Formulation" is an empty shell (constraints commented out, orphaned table);
    an empty `general` box at ~line 464; Amazonian network sign convention
    contradicts its own figure (+/− flipped); multicommodity conservation sign
    convention contradicts the sample data; relief max-flow exercise's table
    contradicts the figure's arc directions and omits two arcs.

15. **Section2.tex**: learning-checkpoint figure labels one line "x+3y≤6" where
    the geometry is 2x+3y≤6; two exercises are verbatim duplicates
    ("Graphically Solving" / "Infeasible Region Graph"); "Graphical example"
    section (~961–1007) is a broken half-commented block that leaks stray math
    into the PDF; the unbounded-region figure has two overlapping sets of contour
    labels; a borrowed Stack Exchange TikZ figure shows an unrelated LP inside
    the Lemonade Vendor solution (existing TODO).

16. **The `ex` environment ignores its arguments.** Defined with zero args but
    called four ways (`{Title}{}`, `[Title]{}`, bare). Titles render as plain
    italic text. One xparse redefinition + a normalization pass would make every
    exercise render uniformly (and enable titled exercise refs).

17. **Course-notes leftovers**: "in this course", "as discussed in class",
    "scope of the course" appear in several chapters; a private Overleaf link
    ("Thanks Jerrin") in graph theory should become a citation of Dijkstra (1959);
    "Laurent Porrier" in preface/attribution is likely "Laurent Poirrier".

## Part C — Alt-text audit results

Mechanism: raster/PDF images get alt data either inline (3rd argument of
`\altincludegraphics`) or via the `abstract` field of the figure-metadata bib
files, which the PDF/UA tagging will consume when `\DocumentMetadata` tagging is
re-enabled.

- **All 58 image inclusions in book1 have alt data** (scanned every `\input` of
  book1-main.tex): every `\altincludegraphics` has a substantive inline
  description, and every metadata-keyed figure macro resolves to a non-empty
  abstract. Three previously wrong abstracts (pwl-plot, wiki-File-knapsack,
  multi-network-flow-solution) were fixed earlier this session.
- **Gap: 4 `\includetikz` calls have no alt path** (Figures/LP-figure,
  Figures/integer-programming in ch1; jssp, jssp-duplo in ch15 — the latter two
  DO have metadata entries, but `\includetikz` doesn't consume them). When
  tagging is enabled, extend `\includetikz` to take an alt argument.
- **Metadata hygiene (doesn't affect book1)**: 11 figures-source entries literally
  say "Missing AltText: Please add a description…" (all Book-2 figures: kkt-*,
  convexity-definition, gradient-descent, linear-regression, svm2, …), and
  figures-static has 3 mismatched-content abstracts among ML images (svm2 ↔
  k-means, voronoi ↔ k-means-vary-k, k-means-elbow has a Voronoi description).
  Worth fixing before Book 2 ships.

## Part D — Cosmetics noted, not fixed

- 4 overfull hboxes > 30pt: the long equality chain in matrix-simplex §8.1
  (~line 600), two in the ch13 exercise tables, one wide equation in the Lyryx
  appendix C.1.
- Notation drift: bold vs plain b/c/x in matrix-simplex and complimentary-
  slackness; `\varepsilon` vs `\epsilon` in ch13.
- File name `complimentary-slackness.tex` is itself the misspelling (prose is
  now fixed); renaming means touching the `\input` — trivial but do it in a
  quiet moment.
- software-resources.tex: "GPPSOY" likely "GPPOSY"; MATLAB built-ins mixed into
  solver lists unlabeled.
