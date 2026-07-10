# Book 1 Audit: Exercises, Figures, and Examples

Date: 2026-07-08. Companion to the editing pass on chapters 11, 13, and 15.
Items marked ✅ were fixed in this pass; items marked ⚠️ are judgment calls left for review.

## 1. Exercise coverage by chapter

| Ch | File | Exercises? | ~Count | Solutions? |
|----|------|-----------|--------|------------|
| 1 | ch01-introduction/* | none | 0 | — |
| 2 | modeling-linear-programming.tex | yes | 9 | no |
| 2 | modeling-sums.tex | none (has 1 checkpoint) | 0 | — |
| 2 | modeling-sums-continued.tex | yes | 4 | no |
| 3 | Section2.tex (More LP examples) | yes | ~13 | **yes (5, "Selected Solutions" pattern)** |
| 4 | software-excel.tex | yes | 3 | no |
| 5 | linearProgrammingGraphicalExample.tex | none | 0 | — |
| 6 | formalize-LP.tex | yes | 5 | no |
| 7–9 | simplex (basis-driven / matrix / tableau) | yes | ~23 | partial (3) |
| 10 | sensitivity-LP.tex | yes | 5 | no |
| 11 | duality.tex | yes | 5 | ✅ added 2 |
| 11 | complimentary-slackness.tex | yes | 6 | ✅ added 1 |
| 12 | software-python-book1.tex | none | 0 | — |
| 13 | multi-objective-optimization_updated.tex | yes | 5 | ✅ added 2 |
| 14 | graph_algorithms.tex | none | 0 | — |
| 14 | graphtheory-dor1.tex | yes | 8 | no |
| 15 | integerProgrammingFormulations-book1.tex | yes | 5 | ✅ added 2 |

⚠️ Chapters with **no exercises at all**: 1 (introduction), 5 (graphical method),
12 (Python software), and graph_algorithms.tex. The graphical-method chapter is the
most conspicuous gap — graphical LP solving is very exercisable.

## 2. Exercise formatting inconsistencies

- The `ex` environment (preamble-optimization.tex, L193) takes **zero arguments**, yet
  chapters invoke it four different ways: `\begin{ex}`, `\begin{ex}{Title}`,
  `\begin{ex}{Title}{}`, `\begin{ex}[Title]{}`. The braces are not consumed — titles
  render as plain italic text at the start of the body. It "works" visually but the
  titles are unstyled. ⚠️ Recommend redefining `ex` to accept an optional title
  argument (one-line xparse change), then normalizing all call sites.
- Solutions exist via three mechanisms: inline `solution` env, the
  `\subsubsection*{Selected Solutions}` + `\begin{solution}(Exercise~\ref{...})`
  pattern (Section2.tex, simplex-basis-driven.tex), and the `answers`-package `sol`
  pipeline (wired up but unused in book1 body). ✅ This pass standardized new
  solutions on the "Selected Solutions" pattern for ch 11/13/15.
- ⚠️ The `example` environment numbers per chapter with its own counter while
  `examplewithcode`/`general` share the `exo` counter — two parallel "Example 15.x"
  numbering streams exist in ch 15. Worth unifying eventually.

## 3. Learning checkpoints

9 existed (ch 2, 3, 7, 8-sensitivity, 14), all with backmatter answers.
✅ Added 3 in the duality chapter (`lc:duality-certificate`, `lc:dual-forms`,
`lc:cs-leftover`) with answers wired into backmatter/checkpoint-answers.tex.
⚠️ Chapters still without any checkpoint: 1, 4, 5, 6, 9, 12, 13, 15.

## 4. Stranded figures (labeled, never referenced)

✅ Fixed in this pass (ch 15): `fig:StripPacking-PackStrip`, `fig:StripPacking-MinHeight`
(now referenced in text), `fig:tikz-Illustration2.pdf`, `fig:tikz-Illustration3.pdf`
(now referenced after the fire-station example).

⚠️ Remaining, for review (add a `\ref` or drop the label):

- Section2.tex:342 `fig:GenericThreeConstraintRegion`
- Section2.tex:436 `fig:FurnitureWorkshopAltOptSoln`
- Section2.tex:762 `fig:LPUnboundFeasibleRegion2`
- modeling-sums-continued.tex:775 `fig:multi-network-flow-data.png`
- modeling-sums-continued.tex:804 `fig:multi-network-flow-solution.png`
- modeling-sums-continued.tex:1247 `fig:network-flow.png`
- modeling-sums-continued.tex:1277 `fig:network-flow-solution`
- simplex-basis-driven.tex:717 `fig:polytope`

Also: the 9 figures in the multi-objective chapter carry no labels at all (they can
never be referenced). Fine if intentional, but worth knowing.

## 5. Broken refs / label problems

- ✅ systemsofequationsAlgebraicProceduresGaussianElimination.tex:10 —
  `\ref{solvingasystemwithelementaryops}` missing the `exa:` prefix (the only true
  broken ref in book1). Fixed.
- ✅ ...RankHomogeneousSystems.tex — duplicate label `example:rankofamatrix` removed.
- ✅ formalize-LP.tex — generic subfigure labels `\label{a}`/`\label{b}` renamed to
  `fig:convex-set-example` / `fig:nonconvex-set-example`.
- No missing figure files anywhere in book1. ✅

## 6. Unreferenced example labels (informational)

78 of 109 labeled examples are never cross-referenced; 55 of those are in the
Lyryx-derived appendices where that is conventional. The 23 in the main body are
harmless (labels cost nothing), but if you want a tidy label namespace the list is
in this file's git history / ask Claude for it again.

## 7. Figure credit system changes made in this pass

New macros in `preamble/preamble0-biblatex.tex` for **book-native figures** (no
per-figure © line or footnote; credit lives in 00_METADATA.bib and the book license):
`\includegraphicbook`, `\includegraphicbooksource`, `\includefigurebook`,
`\includefigurebooksource`.

Applied in ch 15 to: facility-location, tikz-Illustration1/2/3, new-york-tolls
(plain `\includegraphics`, caption kept), StripPacking0/1/2, pwl-plot,
jssp-duplo-actual. Wikipedia-sourced figures (knapsack, Petersen graph) keep full
attribution. Metadata updated: StripPacking0/1/2 now credited to **Jamie Fravel**
(created for the book under contract, CC BY-SA 4.0); NYC-tolls title fixed; two
wrong abstracts (pwl-plot, wiki-File-knapsack, multi-network-flow-solution)
corrected.

⚠️ Other chapters still use `\includegraphicstatic`/`\includefiguresource` for
book-native figures and thus still print "© Robert Hildebrand" lines. Same treatment
can be applied chapter by chapter if you like the ch-15 result.
