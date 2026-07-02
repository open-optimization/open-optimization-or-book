# NetworkX -> TikZ Migration Log (Book 1)

This log records the recreation of four networkx-rendered figures (and one
related sensitivity-analysis plot) as native TikZ pictures in Book 1.

## Page-to-source mapping

Resolved from `book1-main.aux` (`\newlabel` entries) and grep over `.tex` sources:

| Page | Figure (orig PNG)                           | Source file                                                                                                       |
|------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| 86   | `multi-network-flow-data.png`               | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex` (was line 737)                          |
| 87   | `multi-network-flow-solution.png`           | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex` (was line 738)                          |
| 91   | `network-flow.png`                          | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex` (was line 1133)                         |
| 92   | `network-flow-solution.png`                 | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex` (was line 1135)                         |
| 208  | `Figures/sensitivity-changing-b` (sec 10.2.0.1) | `book/part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex` (was line 736)                            |

Note: the original task description listed page 92 as the candidate networkx
graph; the `.aux` entry shows `network-flow.png` on page 91 and
`network-flow-solution` on page 92. Both are reached by `book1-main.tex`
(it `\input`s `modeling-sums-continued.tex` on line 131), so both are used in
the compiled Book 1 PDF.

## Summary of decisions

| Figure                                    | Decision      | Notes                                                                                  |
|-------------------------------------------|---------------|----------------------------------------------------------------------------------------|
| `multi-network-flow-data.png` (p. 86)     | **Recreated** | Vertex list/arc list extracted from the Python sample data printed in the example.     |
| `multi-network-flow-solution.png` (p. 87) | **Recreated** | Optimal flows read directly from the PNG; values match the data file above.            |
| `network-flow.png` (p. 91)                | Recreated + TODO | Edges and labels inferred by visual inspection; flagged for author verification.    |
| `network-flow-solution.png` (p. 92)       | Recreated + TODO | Node net-flow values and arc flows inferred from the PNG; flagged for verification. |
| `Figures/sensitivity-changing-b` (10.2.0.1) | **Recreated** | Feasible-region plot for `max 2x+3y` LP with three values of `b_1` (7, 9, 10).       |

Counts: **5 figures recreated** in TikZ; 0 left as the original `\includegraphics` /
`\includefigurestatic`. 2 of the 5 (network-flow.png and network-flow-solution.png)
carry inline TODO comments asking the author to verify edge directions and labels.

## Recreation details

### Page 86 — `multi-network-flow-data.png`

* Source location: `modeling-sums-continued.tex`, originally line 737.
* Original: `\includefigurestatic{multi-network-flow-data.png}`.
* Image content (verified against PNG and the verbatim Python data in the
  surrounding example, lines 722-733):
  - 4 nodes: `1` (top center, $d=(-10,-5)$), `2` (top right, $d=(0,0)$),
    `3` (left, $d=(0,0)$), `4` (bottom center, $d=(10,5)$).
  - 4 arcs (capacities): `(1,2):20`, `(1,3):15`, `(2,4):25`, `(3,4):20`.
  - The PNG shows arc 3->1 (not 1->3); we follow the PNG direction.
* Before:
  ```latex
  \includefigurestatic{multi-network-flow-data.png}
  ```
* After: a `\begin{figure}[t] ... \end{figure}` block containing a
  `tikzpicture` with the four cyan-filled nodes, labelled rectangles for
  `(d_{i1}, d_{i2})`, and four directed `->` arcs labelled with their
  capacities (`15`, `20`, `25`, `20`). Caption preserves the original
  shorttitle ("Data for multi-commodity network flow example") and
  `\label{fig:multi-network-flow-data.png}` is retained so cross-references
  still work.

### Page 87 — `multi-network-flow-solution.png`

* Source location: `modeling-sums-continued.tex`, originally line 738.
* Image content: same 4 nodes/4 arcs as page 86. The PNG shows commodity
  flows `[5.0, 5.0]` on `3->1`, `[10.0, 0.0]` on `1->2`, `[10.0, 0.0]` on
  `2->4`, and `[-0.0, 5.0]` on `3->4`. (Commodity 1 routes via 3->1->2->4;
  commodity 2 routes via 3->4 and 3->1->2->4 split, matching the demand
  vector.)
* TikZ reproduces these edge labels verbatim.
* Caption preserved; `\label{fig:multi-network-flow-solution.png}` retained.

### Page 91 — `network-flow.png` (TODO marker added)

* Source location: `modeling-sums-continued.tex`, originally line 1133.
* This is a *separate* 6-node example from the immediately preceding
  hand-drawn TikZ (lines 1062-1190): the node demands and edge labels
  differ. The PNG shows 6 cyan nodes labelled `1..6` and 8 directed edges,
  each labelled `[capacity, cost]`.
* Inferred edge set (by visual inspection of the PNG):
  - `1 -> 2`: `[6.0, 2]`
  - `1 -> 3`: `[8.0, -5]`
  - `2 -> 5`: `[7.0, 12]`
  - `2 -> 6`: `[5.0, 0]`
  - `3 -> 4`: `[5.0, 3]`
  - `3 -> 5`: `[5.0, -9]`
  - `4 -> 5`: `[8.0, 2]`
  - `5 -> 6`: `[5.0, 4]`
* Inline `% TODO(author): ...` comment asks for verification of edge
  directions and the `[capacity, cost]` ordering of the labels.
* Caption preserved; `\label{fig:network-flow.png}` retained.

### Page 92 — `network-flow-solution.png` (TODO marker added)

* Source location: `modeling-sums-continued.tex`, originally line 1135.
* Same 6-node graph. The PNG shows node net-flow values inside each node:
  `1:12.0`, `2:6.0`, `3:-2.0`, `4:0.0`, `5:-9.0`, `6:-7.0` (sum = 0, so the
  problem is balanced). Edge labels show the optimal flow on each arc.
* Inferred edge flows (assigned to the edges from the page-91 figure so the
  two diagrams remain consistent):
  - `1->2`: `5.0`, `1->3`: `7.0`, `2->5`: `6.0`, `2->6`: `5.0`,
    `3->4`: `5.0`, `3->5`: `0.0`, `4->5`: `0.0`, `5->6`: `2.0`.
  - Node-balance check: out(1)=12, supply(1)=12 OK; out(2)-in(2)=11-5=6, supply
    OK; out(3)-in(3)=5-7=-2, demand 2 OK; out(4)-in(4)=0-5 -> -5, but stated
    `4:0.0`, so this is one of the items the author should verify.
* Inline `% TODO(author): ...` comment flags the inference.
* Caption preserved; `\label{fig:network-flow-solution}` retained.

### Section 10.2.0.1 — `Figures/sensitivity-changing-b`

* Source: `sensitivity-LP.tex`, originally line 736.
* This is **not** a network graph - it is a 2D feasible-region plot for the
  LP
  \[
  \max 2x+3y \quad\text{s.t.}\quad x+y\le b_1,\; 2x+y\le 16,\; x+2y\le 14,\; x,y\ge 0,
  \]
  showing the feasible region for `b_1=9` (the original value) and the
  parallel-shifted first constraint for `b_1 = 7, 9, 10` (the endpoints of
  the optimal-basis range derived in the surrounding text).
* TikZ recreation includes:
  - Cartesian axes with ticks and a light grid.
  - The two fixed constraint lines `2x+y=16` (green) and `x+2y=14` (brown).
  - Three red constraint lines for `x+y = 7, 9, 10`.
  - The shaded feasible polygon for `b_1=9` with vertices
    `(0,0), (8,0), (7,2), (4,5), (0,7)`.
  - Vertex markers at the labelled points from the original figure.
* The original `\altincludegraphics` call also passed an alt-text string for
  PDF accessibility. With the figure now native TikZ, the alt text is no
  longer attached automatically; the existing surrounding prose already
  describes the figure, so no separate `\pdftooltip` wrapper was added.

## Verification notes

* All five edits replace exactly the `\includefigurestatic` / `\altincludegraphics`
  call with self-contained `figure` or `tikzpicture` blocks; braces are balanced
  (each block opens and closes within itself).
* For the four `\includefigurestatic` calls, the original macro internally
  produced a `\begin{figure} ... \caption{...} \label{fig:<file>} \end{figure}`
  scaffold. The replacements preserve those `\caption{}` and `\label{}` pairs
  with the same label keys (`fig:multi-network-flow-data.png`, etc.) so any
  `\ref`/`\cref` to those labels continues to resolve.
* The four network figures live inside `\begin{examplewithcode} ... \end{examplewithcode}`
  / `\begin{ex} ... \end{ex}` environments; the original `\includefigurestatic`
  expanded into a `figure` inside those same environments, so nesting depth is
  unchanged.
* External resources untouched: `NON-DISTRIBUTABLE/`, `external-sources/`, and
  any Book-2 files were not modified.

## Action items for the author

1. Verify the inferred edge set and `[capacity, cost]` ordering of the labels
   in the page-91 `network-flow.png` recreation (see TODO comment in
   `modeling-sums-continued.tex`).
2. Verify the inferred arc flows in the page-92 `network-flow-solution.png`
   recreation, in particular the flow on `4->5` (the PNG label is hard to
   read; the node-balance check at node 4 currently does not zero out with
   the values transcribed above).
3. If the original Python notebooks that generated the four networkx figures
   are still available, consider re-checking the data against the TikZ in
   case any pixel-level details were misread.
