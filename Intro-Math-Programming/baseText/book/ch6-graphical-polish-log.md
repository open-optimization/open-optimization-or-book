# Chapter 6 (Graphical Method) Polish Log
Date: May 13, 2026

## Important file-path note
The author's directive named
`part1-linear-programming/ch04-graphical/linearProgrammingGraphicalExample.tex`
as the Chapter 6 source. **That file is 0 bytes (empty)** — both at the
location given and at the original
`baseText/external-sources/lineqlpbook/linearProgrammingGraphicalExample.tex`.

The actual Chapter 6 ("Graphically Solving Linear Programs") content is in:

`part1-linear-programming/ch02-modeling/Section2.tex`

This is the file `\input{...}` at line 134 of `book1-main.tex` (despite the
comment in that file labeling it "Chapter: More LP Examples (Griffin)" — the
labeling is stale; the actual `\chapter{Graphically Solving Linear Programs}`
is at line 1 of `Section2.tex`). The empty
`ch04-graphical/linearProgrammingGraphicalExample.tex` at line 137 of
`book1-main.tex` contributes nothing to the PDF.

Edits were applied to `Section2.tex` because that is where the chapter content
actually lives. The directive's spirit (polish Chapter 6, pages 98–99) was
preserved; only its filename was wrong.

## Step 1 — Page → source-line mapping (from `book1-main.aux`, May 5 build)

| Page | Content | Source file / lines |
|------|---------|---------------------|
| 93 | Chapter 6 start; §6.1 "Nonempty and Bounded Problem" | `Section2.tex` line 1; §6.1 begins line 24 |
| 94 | Figure 6.1 (Desmos placeholder; captioned) | `Section2.tex` lines 46–94 |
| 95 | §6.2 "Graphical Approach"; Furniture Workshop example | `Section2.tex` line 130; example lines 133–148 |
| 96 | Figure 6.2 `FurnitureWorkshopFeasibleRegion` (captioned); Algorithm 2 | lines 152–197; algorithm lines 214–230 |
| 97 | Lemonade Vendor example statement | `Section2.tex` lines 232–263 |
| 98 | Lemonade-Vendor solution prose + first (recreated) TikZ plot | lines 264–313 |
| 99 | Stack-exchange TikZ plot + borrowed `images/lemon` plot + closing prose | lines 315–346 |
| 100 | §6.3 "Infinitely Many Optimal Solutions" | line 358 |

## Step 2 — Plots without captions (pages 98–99) and fixes

Three plots in the Lemonade-Vendor solution were not wrapped in
`figure` environments and had no captions:

### 2a. Recreated lemonade-vendor TikZ (page 98)
- **Was**: `\begin{center} \begin{tikzpicture}...\end{tikzpicture} \end{center}` (lines 278–313).
- **Now**: wrapped in `\begin{figure}[H]...\end{figure}` with caption and label
  `fig:LemonadeVendorFeasibleRegion`.
- **Caption added**:
  > Feasible region and objective level curves for the Lemonade Vendor
  > problem. The shaded polygon is the set of $(x,y)$ satisfying all
  > constraints; dashed lines are level curves $3x+2y = z$ for
  > $z = 0,2,4,6,8$. Sweeping the level curves in the direction of
  > $\nabla z = (3,2)$ shows the optimum is at the vertex $(1.2,1.6)$.

### 2b. Stack-exchange generic-LP TikZ (page 99)
- **Was**: bare `\begin{tikzpicture}...\end{tikzpicture}\footnote{stackexchange URL}`
  (lines 315–329).
- **Now**: wrapped in `\begin{figure}[H]...\end{figure}` with caption and
  label `fig:GenericThreeConstraintRegion`. TODO comment added above the
  figure flagging that this plot is unrelated to the Lemonade Vendor
  problem and likely belongs elsewhere (or should be removed) — pending
  author review.
- **Caption added**:
  > Feasible region of a generic linear program with constraints
  > $x_1+x_2\geq 3$, $2x_1-x_2\leq 5$, and $-x_1+2x_2\leq 3$. The shaded
  > triangle illustrates how three linear inequalities can carve out a
  > bounded polygonal region.

### 2c. Borrowed `images/lemon` plot (page 99) — REMOVED, see Step 3.

## Step 3 — Borrowed plot identification and decision

- **Image path**: `images/lemon` resolved to
  `baseText/external-sources/lineqlpbook/images/lemon.{pdf,svg,fig}`.
- **Source**: Jonathan Cheung, *Linear Inequalities and Linear Programming*
  (lineqlpbook), CC BY-SA 4.0 (attributed in
  `frontmatter/sources-attribution.tex`).
- **Recreated alternative**: yes — the recreated TikZ (now
  `fig:LemonadeVendorFeasibleRegion`, lines 278–316) shows the same
  Lemonade Vendor LP: feasible region with constraints $x+3y\leq 6$,
  $2x+y\leq 4$, $x,y\geq 0$; objective level curves of $3x+2y$; optimum
  at $(1.2,1.6)$.
- **Decision**: **REMOVED**. The `\altincludegraphics{images/lemon}`
  block at the old line 333 was deleted; a brief breadcrumb comment was
  left at the removal site noting the date, the file path, the licence,
  and that the recreated TikZ above replaces it.
- **Rationale**: matches the author's directive verbatim ("borrowed plot
  ... has already been recreated, so it can be removed"). The recreated
  figure now carries the cross-reference from the prose below it.

### Prose touch-up
The sentence at old line 335 read
> "In the figure above, the lines with $z$ at 0, 4 and 6.8 have been drawn."
This referred specifically to the removed `images/lemon` (which showed
contours at $z=0,4,6.8$). The recreated TikZ shows $z=0,2,4,6,8$, so the
sentence was retargeted to the new figure by `\ref`:
> "In Figure~\ref{fig:LemonadeVendorFeasibleRegion}, level curves of $z=3x+2y$
> are drawn for several values of $z$. From the picture, we can see that if
> $z$ is greater than 6.8, ..."
The downstream claim that $z=6.8$ is the optimal value remains correct
(it follows from $(x,y)=(1.2,1.6)$, not from the figure being a verbatim
reproduction).

## Step 4 — Parse verification

- Brace balance on `Section2.tex` after edits: 779 `{` vs. 779 `}` (delta 0).
- `\begin{figure}` / `\end{figure}` pairs: 8 / 8 (matched).
- No orphan `\end{figure}` or unbalanced TikZ.

## Files touched
- `part1-linear-programming/ch02-modeling/Section2.tex` (edits, see above)
- `ch6-graphical-polish-log.md` (this log)

No other files were modified. No `NON-DISTRIBUTABLE/`, `external-sources/`,
or Book-2 file was touched. Nothing committed.
