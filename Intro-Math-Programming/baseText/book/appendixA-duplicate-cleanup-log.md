# Appendix A — Duplicate-Image Cleanup Log

**File touched:** `Intro-Math-Programming/baseText/book/appendices/equations-and-lines/equations-and-lines-new.tex`

**Author's note addressed:** "some of the pictures in appendix A were already recreated and put in, but the old blurry picture remains. it should be taken out in that case."

The appendix was adapted from Sekhon & Bloom, *Applied Finite Mathematics* (CC BY 4.0). The originals are raster images at `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-*` — the LibreTexts auto-extraction naming pattern flagged in STEP 3 as almost certainly the blurry source-of-record. Every one of them had a clean adjacent TikZ recreation depicting the identical mathematical content. All were removed.

## 1. Inventory of figure assets (pre-edit, original line numbers)

| # | Lines | Type | Content |
|---|-------|------|---------|
| 1 | 64–86 | tikzpicture | Graph of `y = 3x + 2` through (-1,-1), (0,2), (1,5) |
| 2 | 88–90 | altincludegraphics `eg-02` | Same: `y = 3x + 2` through the three points |
| 3 | 109–131 | tikzpicture | Graph of `2x + y = 4` through (-1,6), (0,4), (1,2) |
| 4 | 134–136 | altincludegraphics `eg-03` | Same: `2x + y = 4` through the three points |
| 5 | 157–177 | tikzpicture | Graph of `2x - 3y = 6` with intercepts (3,0), (0,-2) |
| 6 | 179–181 | altincludegraphics `eg-03(1)` | Same: `2x - 3y = 6` intercepts |
| 7 | 197–218 | tikzpicture | Parametric line `x = 3 + 2t, y = 1 + t` through (3,1), (5,2), (7,3) |
| 8 | 222–224 | altincludegraphics `eg-04` | Same parametric line, same three points |
| 9 | 238–255 | tikzpicture | Horizontal line `y = 3` through (0,3) |
| 10 | 256–273 | tikzpicture | Vertical line `x = -2` through (-2,0) |
| 11 | 276–278 | altincludegraphics `eg-05` | Side-by-side horizontal `y = 3` and vertical `x = -2` (covers both TikZes 9 & 10) |
| 12 | 303–328 | tikzpicture | Slope between (-2,3) and (4,-1); green rise/run triangle (rise -4, run 6) |
| 13 | 331–333 | altincludegraphics `eg-07` | Same: slope through (-2,3), (4,-1); rise -4, run 6 |
| 14 | 355–383 | tikzpicture | Line through (1,2) with slope -3/4, second point (5,-1), rise/run triangle |
| 15 | 386–388 | altincludegraphics `eg-09(1)` | Same: through (1,2), slope -3/4, rise -3, run 4 to (5,-1) |
| 16 | 528–551 | tikzpicture | Supply/demand equilibrium at (8,14); supply `y = 3.5x - 14`, demand `y = -2.5x + 34` |
| 17 | 554–556 | altincludegraphics `eg-24` | Same supply/demand plot, equilibrium (8,14) |
| 18 | 573–597 | tikzpicture | Break-even at (6,30) for `R = 5x`, `C = 3x + 12` |
| 19 | 600–602 | altincludegraphics `eg-25` | Same break-even plot at (6,30) |

**Totals (pre-edit):** 19 figure assets — 10 TikZ blocks, 9 `\altincludegraphics`, 0 plain `\includegraphics`, 0 `\begin{figure}` environments.

## 2. Duplicate pairs identified

Nine duplicate pairs, all matching the heuristic in STEP 3 (the included file lives under `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-*`, the LibreTexts auto-extracted set):

| TikZ (kept) | Duplicate `\altincludegraphics` (removed) | Confirmed equivalent? |
|---|---|---|
| #1 (64–86) | #2 (88–90) `eg-02` | Yes — same equation, same plotted points |
| #3 (109–131) | #4 (134–136) `eg-03` | Yes |
| #5 (157–177) | #6 (179–181) `eg-03(1)` | Yes |
| #7 (197–218) | #8 (222–224) `eg-04` | Yes |
| #9 + #10 (238–273) | #11 (276–278) `eg-05` | Yes — single raster combines the two TikZ panels |
| #12 (303–328) | #13 (331–333) `eg-07` | Yes |
| #14 (355–383) | #15 (386–388) `eg-09(1)` | Yes |
| #16 (528–551) | #17 (554–556) `eg-24` | Yes |
| #18 (573–597) | #19 (600–602) `eg-25` | Yes |

## 3. Removals applied

All nine raster-image blocks were removed. Each was wrapped solo in `\begin{center}...\end{center}` (no `\begin{figure}` environment, no `\caption`, no `\label`), so the removal in each case is the full `\begin{center} ... \altincludegraphics{...}{...} \end{center}` block. No captions had to be moved.

Representative before/after (the rest follow the identical pattern):

**Before** (example 1, lines 85–91 original):
```latex
    \draw[blue, thick] (2,8) -- (-1.6667, -3);
\end{tikzpicture}
\end{center}
\begin{center}
\altincludegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-02}{Cartesian xy-plane with the line y = 3x + 2 drawn in blue, passing through the plotted points (-1,-1), (0,2), and (1,5).}
\end{center}
\end{example}
```

**After:**
```latex
    \draw[blue, thick] (2,8) -- (-1.6667, -3);
\end{tikzpicture}
\end{center}
\end{example}
```

The other eight removals follow this same structure (drop the trailing `\begin{center}...\altincludegraphics{...}{...}\end{center}` immediately after the kept `\end{tikzpicture}\end{center}`):

| # | Image path removed | Example label preserved |
|---|---|---|
| 1 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-02` | `exa:line-graph1` |
| 2 | `...eg-03` | `exa:line-graph2` |
| 3 | `...eg-03(1)` | `exa:intercepts` |
| 4 | `...eg-04` | `exa:parametric-line` |
| 5 | `...eg-05` | `exa:horiz-vert` |
| 6 | `...eg-07` | `exa:slope1` |
| 7 | `...eg-09(1)` | `exa:point-slope-graph` |
| 8 | `...eg-24` | `exa:equilibrium` |
| 9 | `...eg-25` | `exa:break-even` |

The image files themselves were **not** deleted on disk (per CONSTRAINTS), since the Sekhon-Bloom external-sources tree may still reference them.

## 4. Captions moved or rewritten

None. None of the removed `\altincludegraphics` blocks carried a `\caption{}`. The alt-text argument was a descriptive string (the second `{...}` argument of `\altincludegraphics`), which is accessibility metadata that lived only on the raster image being removed — not user-facing prose. No prose was orphaned.

## 5. TODOs left for ambiguous cases

None. Every pair matched on equation, plotted-point coordinates, slope triangle labels, and axis ranges, so no ambiguous case required an author follow-up.

## 6. Reference-integrity check

- None of the nine removed `\altincludegraphics` calls carried a `\label{}`, so nothing was `\ref{}`-able to begin with.
- The surrounding `\begin{example}` labels (`exa:line-graph1`, `exa:line-graph2`, `exa:intercepts`, `exa:parametric-line`, `exa:horiz-vert`, `exa:slope1`, `exa:point-slope-graph`, `exa:equilibrium`, `exa:break-even`) were all preserved untouched. A repo-wide grep for `\ref{exa:line-graph1|exa:line-graph2|exa:intercepts|exa:parametric-line|exa:horiz-vert|exa:slope1|exa:point-slope-graph|exa:equilibrium|exa:break-even}` returned **no matches**, so even if any had been disturbed, nothing else in the book depends on them.
- A repo-wide grep for the LibreTexts image path (`altincludegraphics{applied-finite-mathematics/images/2024_12_11`) returned **no other usages** outside the file we edited.

## 7. Post-edit environment balance

Counted directly via grep against the edited file:

| Pair | Begin count | End count |
|---|---|---|
| `tikzpicture` | 10 | 10 |
| `center` | 9 | 9 |
| `example` | 18 | 18 |
| `figure` | 0 | 0 |
| `includegraphics` (any variant) | 0 | — |

All paired. No orphaned `\end{figure}`, no remaining `\altincludegraphics`.

## Summary

- **Inventory:** 19 figure assets cataloged (10 TikZ + 9 `\altincludegraphics`).
- **Duplicates found:** 9 pairs.
- **Removals applied:** 9 `\altincludegraphics` blocks (with their enclosing `\begin{center}...\end{center}`).
- **TODOs left:** 0.
- **Reference integrity:** clean.
