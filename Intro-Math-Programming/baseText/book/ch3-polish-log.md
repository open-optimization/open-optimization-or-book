# Chapter 3 ("Software - Excel") Polish Log

## File-Level Summary

**File:** `Intro-Math-Programming/baseText/book/part1-linear-programming/ch03-software/software-excel.tex` (233 lines pre-edit)

**Chapter:** `\chapter{Software - Excel}` opens with a `outcome` block (learning outcomes).

**Section structure (actual, as written):**
- `\section{Using Excel Solver}` (would render as 3.1)
  - `\subsection{Useful Excel Functions and Techniques}` (3.1.1) — paragraph entries for SUM, SUMPRODUCT, COUNT, COUNTIF, fill-handle, conditional formatting, data validation, named ranges, logical functions.
  - `\subsection{How to Use Excel Solver}` (3.1.2) — eight `\paragraph{Step 1..8}` blocks, eight `\altincludegraphics` figures (layout, button, solve, method, select, answer report, sensitivity, solution), followed by a `resource` environment listing tutorial links.
- `\section{Exercises}` (would render as 3.2) — three `ex` blocks: a diet/nutrition LP, a widget/gadget production-planning LP, and a 2x3 transportation LP.

**Note on numbering:** the chapter contains only TWO `\section{}` commands, so "Section 3.4" does not exist. The author's reference to "3.4 (Exercises)" appears to be a slip — the Exercises section is the chapter's second section (3.2). All edits below treat the Exercises section accordingly.

**No floats, no `\vfill`, no `\newpage`, no `\clearpage`, no `\bigskip`/`\medskip` stacks** anywhere in the file. All figures are inline `\altincludegraphics` wrapped in `\begin{center}...\end{center}`.

---

## Issue 1 — Vertical Spacing

### Root cause

Subsection 3.1.2 stacks **eight `\altincludegraphics`** in close succession (lines 63-129 pre-edit). Each was wrapped in `\begin{center} ... \end{center}`, which is a `\trivlist` environment that inserts `\topsep + \partopsep` of vertical space both **above and below** the contents (roughly 6pt + 6pt at each boundary, so ~12pt above and ~12pt below). Eight stacked `center` environments therefore contribute roughly 96pt of unnecessary vertical whitespace — close to a third of a page.

Additionally, the first two figures (`excel-solver-layout` and `excel-solver-button`) used `width=0.95\textwidth`, which makes them tall enough that LaTeX often cannot keep them with the immediately preceding paragraph; they get pushed to the next page, leaving the preceding page short.

### Fixes applied

**Fix A — Replace `\begin{center}...\end{center}` with `{\centering ... \par}` for all 8 figures.** The `\centering` form does not introduce `\trivlist` whitespace, so the figures sit flush with the surrounding paragraphs/items. Net savings: ~96pt of dead whitespace across the subsection.

**Fix B — Reduce `width=0.95\textwidth` to `width=0.85\textwidth`** for the two large layout images (`excel-solver-layout` line 64 pre-edit, `excel-solver-button` line 78 pre-edit). Smaller image height gives LaTeX more room to keep the figure on the same page as its step-paragraph, eliminating the page-end short page.

### Before / After

**(1) Step 1 layout figure (line 63-65 pre-edit)**
```latex
% BEFORE
\begin{center}
\altincludegraphics[width = 0.95\textwidth]{Figures/excel-solver-layout}{...}
\end{center}

% AFTER
{\centering
\altincludegraphics[width = 0.85\textwidth]{Figures/excel-solver-layout}{...}\par}
```

**(2) Step 4 Data>Solver button figure (line 77-79 pre-edit)**
```latex
% BEFORE
\begin{center}
\altincludegraphics[width = 0.95\textwidth]{Figures/excel-solver-button}{...}
\end{center}

% AFTER
{\centering
\altincludegraphics[width = 0.85\textwidth]{Figures/excel-solver-button}{...}\par}
```

**(3) Step 5 Solver Parameters dialog (line 91-93 pre-edit)**
```latex
% BEFORE
\begin{center}
\altincludegraphics[scale = 0.25]{Figures/excel-solver-solve}{...}
\end{center}

% AFTER
{\centering
\altincludegraphics[scale = 0.25]{Figures/excel-solver-solve}{...}\par}
```

**(4) Step 6 Solving Method dropdown (line 103-105 pre-edit)** — same pattern (`begin/end center` to `{\centering ...\par}`); width/scale unchanged at `scale = 0.3`.

**(5) Step 7 Solver Results dialog (line 111-113 pre-edit)** — same pattern; `scale = 0.2` unchanged.

**(6)-(8) Step 8 Answer / Sensitivity / Solution reports (lines 119-129 pre-edit)** — three back-to-back center blocks inside the same `itemize`. All three converted to `{\centering ... \par}`; scales unchanged at `0.3`.

### Spacing fixes not needed

- No stray `\vfill` — none in file.
- No `\bigskip`/`\medskip`/`\smallskip` stacks — `\smallskip` appears only in chapter 2.
- No premature `\newpage`/`\clearpage`/`\cleardoublepage` — none in file.
- The `outcome` and `resource` environments (defined elsewhere in the preamble) are used once each and don't appear to introduce excessive space.

---

## Issue 2 — "Footnote at start of Exercises section"

### Finding

A `grep` for `footnote` in `software-excel.tex` returns **zero matches**. There is no `\footnote{}` anywhere in the chapter — neither at the start of the Exercises section nor anywhere else.

The closest thing to an "awkward opening" in the Exercises section is the **stray `\\` (forced line break) on line 168 pre-edit**, at the end of the first sentence of Exercise 1. The construct `food types:\\` forces an inline line break before the `\begin{center}` that follows, producing a short orphaned partial line above the table — visually similar to an awkwardly-typeset note.

### Original text (line 168 pre-edit)

```latex
Consider the following table indicating the nutritional value of different food types:\\
\begin{center}
\begin{tabular}%{lccccc}
```

### Decision

**(d) Remove the stray `\\` and replace the colon with a period** — option (d) in the rubric, applied to the punctuation/line-break rather than to a footnote. The `\\` is purely a typesetting artifact; the `\begin{center}` that immediately follows already produces the necessary vertical break to the table, so the forced line break creates a short orphan line. Replacing `:\\` with `.` makes the opening sentence stand alone cleanly and lets the `center` environment handle the spacing.

**Rationale:** there is no footnote content to preserve, move, or promote — only a typographic glitch. (a)/(b)/(c) are not applicable. (d) is the cleanest read.

### Before / After

```latex
% BEFORE
Consider the following table indicating the nutritional value of different food types:\\
\begin{center}
\begin{tabular}%{lccccc}

% AFTER
Consider the following table indicating the nutritional value of different food types.
\begin{center}
\begin{tabular}%{lccccc}
```

### Note for the author

If you intended a different file (e.g., a different chapter's Exercises section that does contain an opening `\footnote{}`), please point me at it — chapter 3 as it stands has no footnote to treat.

---

## Example 3.1 Code Links — Confirmation

Per the prior session work, the three code links for Example 3.1 ("Screen Printing Shop") are wired through `examplewithallcode` in chapter 2 at:

`Intro-Math-Programming/baseText/book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex`, lines 46-49:

```latex
\begin{examplewithallcode}{Screen Printing Shop}%
{https://github.com/open-optimization/open-optimization-or-examples/blob/master/linear-programming/screen_printing/screen_printing.xlsx}%
{https://github.com/open-optimization/open-optimization-or-examples/blob/master/linear-programming/screen_printing/screen_printing_pulp.ipynb}%
{https://github.com/open-optimization/open-optimization-or-examples/blob/master/linear-programming/screen_printing/screen_printing_gurobipy.ipynb}
```

All three URLs point under `https://github.com/open-optimization/open-optimization-or-examples/blob/master/linear-programming/screen_printing/` — Excel, PuLP notebook, and Gurobipy notebook respectively. **Confirmed wired up.**

`software-excel.tex` itself contains **no `\href` to the screen_printing example** and does not re-reference Example 3.1 — so there is nothing in chapter 3 that needs to be reconciled against the chapter-2 links.

---

## Constraints honored

- Edited only `software-excel.tex`.
- Did not touch `NON-DISTRIBUTABLE/`, `external-sources/`, or Book-2 files.
- No commit, no push.
