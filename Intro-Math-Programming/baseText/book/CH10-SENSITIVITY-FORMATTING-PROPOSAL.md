# Chapter 10 (Sensitivity Analysis) — Formatting Proposal

**File:** `part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex` (1,012 lines)
**Model chapters:** Ch. 7 (`simplex-basis-driven.tex`) and Ch. 9 (`simplex-tableau.tex`)
**Date:** 2026-07-02

The goal is to bring Chapter 10 up to the design language that Chapters 7 and 9
now share, without rewriting its mathematical content. The chapter's substance
is good; its presentation predates the color/panel system.

---

## 1. The design language Ch. 7/9 established

| Device | Purpose | Source |
|---|---|---|
| `outcome` box | chapter opener objectives | both |
| Titled `tcolorbox` (`colback=COLOR!6, colframe=COLOR, coltitle=white, sharp corners`) | statement of LP / standard form / dictionaries | both |
| `steppanel` + `\slab` / `\cstep` / `\sslab` | step-by-step commentary with colored west border | both |
| `algocard` + `\algostep` | end-of-topic algorithm summary card | Ch. 9 |
| Color semantics: `algenter` (green, ding 43), `algleave` (orange, 47), `algpivot` (blue, 114), `algopt` (52), `algslate` (neutral), **`sensbox` (teal, 228) — reserved for this chapter** | consistent meaning across chapters | both |
| `booktabs` tables (`\toprule/\midrule/\bottomrule`), colored cells | tableaus, decision tables | Ch. 9 |
| Two-column "decision table" (e.g., artificial variable leaves vs. stays) | dichotomy summaries | Ch. 9 §Big-M |
| `learningcheckpoint` | quick self-test boxes | Ch. 7 (×3) |
| `\begin{ex}{Title}{}` titled exercises | exercises | both |
| Running example continuity: restate the LP at chapter start "so you can compare line for line" | orientation | Ch. 9 lines 21–33 |

Chapter 10 already uses: `outcome`, two `steppanel{sensbox}` + `\sslab` panels
(the b₂ case), and three `sensbox` tcolorboxes. The rest of the chapter is
unconverted.

---

## 2. Audit of the current chapter

**Structural problems**

1. **Heading hierarchy is broken.** The chapter opens with six `\subsection`s
   (lines 14–125) before the first `\section` (line 163). "Mathematical
   details of sensitivity analysis" (line 14) is a one-sentence stub.
2. **The running example is never stated.** The bakery LP (max 2x+3y; 9/16/14)
   appears only implicitly via its final dictionary (line 165). Line 134 says
   "Note that we could also have written this as…" referring to a problem the
   reader hasn't seen in this chapter.
3. **Misplaced subsections.** "Perturbing c₁ and c₂" (line 446) sits under the
   *Right-Hand Side Perturbations* section. "Excel Solver Sensitivity
   Analysis" (line 869) sits under *Sensitivity with Matrix Notation*.
4. **Manual numbering.** `\subsubsection{1. Changing the Right-Hand Side…}`
   (line 691) hand-numbers what LaTeX should number.

**Inconsistent treatment of parallel material**

5. The b₂ perturbation gets the new `steppanel`/`\sslab` treatment; the
   *identical* b₁, b₃, c₁, c₂ analyses fall back to `\subsubsection*` +
   plain prose. Parallel cases should look parallel.
6. The matrix-notation section uses bold **Step 1/2/3** run-in headings
   (lines 785, 804, 857) where Ch. 9 uses `steppanel` + `\cstep`.

**Legacy formatting**

7. The theory subsections (lines 18–107) are bullet walls under bold labels
   ("**How it appears in the dictionary:**", "**Analysis:**",
   "**Key Takeaways:**") — three levels of nested `itemize` at one point.
   Ch. 7/9 carry the same content in prose + panels.
8. Both summary tables use `\begin{array}{|c|c|c|c|}` / `{|c|c|c|}` with
   `\hline` instead of booktabs.
9. Repeated inline tcolorbox styling with inconsistent widths
   (`width=1\textwidth` at line 167, `0.9\textwidth` at 209/287/370).
10. Over-boxing: most ranges are `\boxed{}` twice (once for Δ, once for the
    parameter), plus boxed cells inside the summary table.
11. The Desmos link (line 12) is a bare sentence: "We begin this section with
    an interactive desmos example."

**Bugs found while auditing (fix regardless)**

12. **Math typo, line 702:** `A_B^{-1}\mathbf{b} = A_B^{-1} = \begin{bmatrix}…`
    — the second `= A_B^{-1}` should be deleted.
13. Line 12 says "this section" for a chapter.
14. No `\label{ch:…}` on the chapter heading (Ch. 7/9 are cross-referenced as
    `ch:simplex-dictionary` / `ch:simplex-matrix`; duality will want to point
    back here). Suggest `\label{ch:sensitivity}`.

---

## 3. Proposed section map

```
\chapter{Sensitivity Analysis}\label{ch:sensitivity}
outcome box  (keep, tighten wording)

(unnumbered intro, ~3 paragraphs)
  - what sensitivity analysis asks, why practitioners care
  - restate the bakery LP + final dictionary side by side   [tcolorbox pair]
  - interactive callout: Desmos explorer                    [new callout box]

\section{What can change, and what happens}        <- absorbs old subsections 18-123
  prose (converted from bullets), ending in the
  booktabs summary table (Change type / Effect on solution /
  Effect on objective / Basis change?)

\section{Ranging the right-hand side}              <- old §RHS Perturbations
  \subsection{Perturbing b2 (basic slack)}     [already converted - keep]
  \subsection{Perturbing b1 (nonbasic slack)}  [convert to same panels]
  \subsection{Perturbing b3 (nonbasic slack)}  [convert to same panels]
  algocard: "RHS ranging (dictionary form)"
  remark box: shadow-price reading of z = 23 + Delta  (bridge to duality)
  learningcheckpoint

\section{Ranging the objective coefficients}       <- old misplaced subsection
  \subsection{Perturbing c1}                   [convert to panels]
  \subsection{Perturbing c2}                   [convert to panels]
  booktabs summary table (keep, restyled)
  algocard: "Objective-coefficient ranging (dictionary form)"
  learningcheckpoint

\section{Sensitivity with matrix notation}
  keep content; replace bold Step 1/2/3 with steppanel + \cstep;
  fix subsubsection numbering; fix line-702 typo

\section{Sensitivity reports in software}           <- old Excel subsection
  Excel Solver screenshots + report anatomy (keep)

\section{Exercises}                                  (keep; titles already good)
```

---

## 4. Concrete patterns

### 4.1 Chapter-opening example box (mirrors Ch. 9 lines 21–33)

```latex
We return to the linear program solved by dictionaries in
Chapter~\ref{ch:simplex-dictionary},
\begin{tcolorbox}[colback=algslate!6, colframe=algslate, coltitle=white,
    fonttitle=\bfseries, sharp corners, title=\textbf{Running Example}]
\[
\begin{aligned}
\max\quad & z = 2x + 3y\\
\st\quad  & x + y  \le 9  && \text{(hours)}\\
          & 2x + y \le 16 && \text{(flour)}\\
          & x + 2y \le 14 && \text{(sugar)}\\
          & x, y \ge 0,
\end{aligned}
\]
\end{tcolorbox}
\noindent so that every range we compute can be checked against the
tableaus of Chapter~\ref{ch:simplex-tableau}.
```

(Then the existing **Final Dictionary** box, line 167, follows immediately.)

### 4.2 One named box instead of repeated inline styling

Add to `packages-and-commands.tex`, next to `steppanel` (line ~591):

```latex
% Teal display box for perturbed programs/dictionaries in Ch. 10.
%   \begin{sensdisplay}{Perturbed Standard Form (RHS of Constraint 2)} ... \end{sensdisplay}
\newtcolorbox{sensdisplay}[1]{colback=sensbox!6, colframe=sensbox,
  coltitle=white, fonttitle=\bfseries, sharp corners, title=\textbf{#1}}
```

and replace the three inline boxes (lines 209, 287, 370) with it. Uniform
full width; no more `0.9\textwidth` vs `1\textwidth` drift.

### 4.3 Uniform perturbation template (already live for b₂; apply to b₁, b₃, c₁, c₂)

Every case becomes the same three moves, so the reader learns the rhythm:

```latex
\begin{sensdisplay}{Perturbed Standard Form (RHS of Constraint 1)}
  ... (existing math, unchanged)
\end{sensdisplay}

\begin{steppanel}{sensbox}
\sslab{Adapt the final dictionary}
  ... substitution arithmetic ...
\end{steppanel}

\begin{steppanel}{sensbox}
\sslab{Read off the range}
  feasibility inequalities, ending in the single boxed result
  \[ \boxed{-2 \le \Delta \le 1} \quad\Longleftrightarrow\quad 7 \le b_1 \le 10 \]
\end{steppanel}
```

Boxing rule: **one box per case**, on the Δ-range, with the parameter range
given unboxed alongside. (Currently most cases box both, and the c-summary
table boxes cells inside a bordered table.)

### 4.4 Algocards (the Ch. 9 signature, currently absent here)

```latex
\begin{algocard}{Recipe: RHS Ranging in the Dictionary}
\algostep{sensbox}{\ding{228}}{Perturb}{Replace $b_i$ by $b_i + \Delta$ and
  absorb $\Delta$ into the constraint's slack: $s_i' = s_i + \Delta$.}
\algostep{sensbox}{\ding{228}}{Substitute}{Rewrite the optimal dictionary in
  terms of $s_i'$; only the constant column changes.}
\algostep{sensbox}{\ding{228}}{Impose feasibility}{Require every basic
  variable $\ge 0$ at $\mathbf{x}_N = \mathbf{0}$; each row gives one linear
  inequality in $\Delta$.}
\algostep{algopt}{\ding{52}}{Read the range}{Intersect the inequalities. Inside
  the range, $z$ changes linearly in $\Delta$; at an endpoint a basic variable
  hits $0$ and a pivot is triggered.}
\end{algocard}
```

A parallel card ends the objective-coefficient section (Perturb → recompute
reduced costs → impose $\bar c_j \le 0$ → read the range).

### 4.5 Booktabs the two summary tables

Line 111 array becomes:

```latex
\begin{center}
\renewcommand{\arraystretch}{1.3}
\begin{tabular}{@{}lccc@{}}
\toprule
Change & Basic solution & Objective & Basis change?\\
\midrule
$c_i$ (objective) & only if $i$ basic & yes, if $i$ basic & if a reduced cost changes sign\\
$b_i$ (RHS)       & always            & scales linearly   & if a basic variable hits $0$\\
$a_{ij}$ (matrix) & only if $j$ basic & via reduced costs & if feasibility/optimality breaks\\
\bottomrule
\end{tabular}
\end{center}
```

Same restyling for the c₁/c₂ summary (line 533).

### 4.6 Interactive callout for the Desmos link

```latex
\begin{tcolorbox}[colback=sensbox!6, colframe=sensbox, coltitle=white,
  fonttitle=\bfseries, sharp corners,
  title={\ding{228}\ Interactive: drag the constraints}]
Before any algebra, build intuition by dragging $b_1$ and the objective
slope in the \href{https://www.desmos.com/calculator/xz1f0tdjf9}{Desmos
sensitivity explorer} and watching when the optimal vertex jumps.
\end{tcolorbox}
```

### 4.7 Learning checkpoints (Ch. 7 device; suggest two)

* End of RHS section: "The optimal dictionary gives $z = 23 + \Delta$ for
  $b_1 = 9 + \Delta$. What is the shadow price of constraint 1, and over what
  range of $b_1$ is that price valid?"
* End of cost section: "Changing the coefficient of a *nonbasic* variable
  never changes the current optimal solution — but changing it enough can
  still change the *optimal basis*. Reconcile these two statements."

### 4.8 Theory subsections: bullets → prose

Convert the "Analysis:" / "Key Takeaways:" bullet stacks (lines 30–107) to
short paragraphs, keeping at most one compact `itemize` per subsection. The
"Key Takeaways" content largely duplicates the summary table — fold it in and
let the booktabs table be the single takeaway artifact.

---

## 5. Out of scope (content, not formatting — listed for the record)

* A short **shadow price** subsection would make the bridge to Chapter 11
  (Duality) explicit; Rohit's feedback also asks for solver-output
  interpretation, which the Excel section could cross-reference.
* The TikZ figure at line 744 (changing $b_1$) could adopt the three-color
  vertex convention of Ch. 9, but that is a figure-style question.

## 6. Estimated effort

Pure reformat per this proposal, no content changes: **2–3 hours**, one file
plus a 4-line addition to `packages-and-commands.tex`. All changes are local
to Ch. 10; no labels used elsewhere are touched (`ch:sensitivity` is new).
