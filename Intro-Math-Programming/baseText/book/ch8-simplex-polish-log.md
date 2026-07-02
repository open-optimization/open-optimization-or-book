# Chapter 8 (Simplex Method) Polish Log

Source files touched
- `Intro-Math-Programming/baseText/book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex`
- (no changes needed in) `simplex-matrix-version.tex`

The `book1-main.aux` file is outside the session-writable area, so section
numbering was confirmed by reading `\section`/`\subsection` headings directly
in the source file rather than `\newlabel` entries. The chapter file is
typeset as Chapter 8, giving the following mapping:

| Punch-list ref | TeX heading                                       | Pre-edit line | Post-edit line |
|----------------|---------------------------------------------------|---------------|----------------|
| §8.3           | `\section{Pivoting and the Simplex Algorithm}`   | 638           | 638            |
| §8.3.1         | `\subsection{Transforming the LP to Standard Form}` | 721         | 721            |
| §8.3.2         | `\subsection{Simplex Assuming Feasible Start}`   | 862           | 899            |
| §8.4           | `\section{ The Simplex Algorithm!}`              | 1438          | 1492           |
| §8.5           | `\section{No Feasible Initial Basis and the Big-M Method}` | 1647 | 1741           |

---

## §8.3.1 — feasible-region plot for the running LP

LP shown in the orange tcolorbox just above the figure:
```
max  2x + 3y
s.t. x +  y       <= 9
     2x + y       <= 16
     x + 2y       <= 14
     x, y         >= 0
```
Vertices (counterclockwise): (0,0), (8,0), (7,2), (4,5), (0,7). Optimum is at
(4,5) with z = 23.

### Before
```tex
\begin{center}
\altincludegraphics[scale = 0.3]{Figures/lp-feasible-desmos}{Desmos plot of the feasible region for max 2x+3y subject to x+y<=9, 2x+y<=16, x+2y<=14, x,y>=0: a shaded convex polygon in the first quadrant bounded by the three constraint lines.}
\end{center}
```

### After (TikZ, matching the `formalize-LP.tex` feasible-region style)
```tex
\begin{center}
% Feasible region for max 2x+3y s.t. x+y<=9, 2x+y<=16, x+2y<=14, x,y>=0.
% Vertices (counterclockwise): (0,0), (8,0), (7,2), (4,5), (0,7).
\begin{tikzpicture}[scale=0.55]
    \draw[gray!40, very thin, step=1] (0,0) grid (10,10);
    \draw[->, thick] (0,0) -- (10.5,0) node[right] {$x$};
    \draw[->, thick] (0,0) -- (0,10.5) node[above] {$y$};
    \foreach \x in {1,...,10} \draw (\x,0.08) -- (\x,-0.08) node[below] {\scriptsize \x};
    \foreach \y in {1,...,10} \draw (0.08,\y) -- (-0.08,\y) node[left]  {\scriptsize \y};

    \fill[blue!50!cyan, opacity=0.3]
        (0,0) -- (8,0) -- (7,2) -- (4,5) -- (0,7) -- cycle;

    \draw[red,    thick] (0,9)       -- (9.5,-0.5) node[below right] {\small $x+y=9$};
    \draw[teal,   thick] (3,10)      -- (9,-2)     node[below]       {\small $2x+y=16$};
    \draw[orange, thick] (-0.5,7.25) node[above left] {\small $x+2y=14$} -- (10.5,1.75);

    \node[fill=blue,circle,inner sep=1.5pt,label={below left:\small$(0,0)$}]   at (0,0) {};
    \node[fill=blue,circle,inner sep=1.5pt,label={below right:\small$(8,0)$}]  at (8,0) {};
    \node[fill=blue,circle,inner sep=1.5pt,label={right:\small$(7,2)$}]        at (7,2) {};
    \node[fill=red, circle,inner sep=2pt,  label={above right:\small$(4,5)$}]  at (4,5) {};
    \node[fill=blue,circle,inner sep=1.5pt,label={left:\small$(0,7)$}]         at (0,7) {};

    \draw[dashed, gray!60!black]
        (-0.5,8) -- (11.5,0) node[pos=0.1, above left, gray!50!black]
        {\small $2x+3y=23$};
    \node[draw=none, red!70!black] at (4.7,5.7) {\small optimal};
\end{tikzpicture}
\end{center}
```

Color choices and the `\fill[blue!50!cyan,opacity=0.3]` polygon match the
existing LP-feasible-region figure in `formalize-LP.tex` (line 713 ff.). The
dashed objective level set `2x+3y=23` makes the optimum at (4,5) explicit.

---

## §8.3.2 — incomplete subsection

The original `\subsection{Simplex Assuming Feasible Start}` (line 862) was
almost entirely commented out — the only un-commented lines in the block
between line 862 and the next live content (the `\subsection*{Choosing the
Entering Variable}` tcolorbox at line 945) were a handful of empty
`\[ ... \]` and `\[ \begin{aligned} ... \end{aligned} \]` shells. As typeset,
the subsection header is followed by a sequence of blank math displays,
which is exactly the "looks incomplete" symptom flagged in the punch list.

### Minimal fix applied
1. A TODO comment block was inserted directly under the subsection header
   describing the two reasonable resolutions and choosing the stopgap of
   adding a short orientation paragraph.
2. A one-paragraph bridge was added that names the three simplex steps
   (entering variable / ratio test / pivot) and points the reader into the
   subsequent `\subsection*` blocks where the running example is worked.
3. The empty-math-display shells (the `\[ \begin{aligned} ... \end{aligned} \]`
   blocks whose interior is entirely `%`-commented and the `\[ \begin{cases}
   ... \end{cases} \]` cousin) were wrapped in `%` so they no longer typeset
   as empty boxes between paragraphs. The original commented-out lines are
   preserved verbatim so the author can simply remove a leading `%` to
   restore them.
4. The dangling `\paragraph{Value of \,z at the BFS ...}` followed by an
   empty math display was replaced with a complete one-sentence statement:
   `At (x,y)=(0,0), we see z = 2*0 + 3*0 = 0, so the initial objective
   value is z = 0.`

### TODO comment left in place
```tex
% TODO(author): the body of this subsection (and the subsequent \subsection*
% blocks on the objective function, pivoting, ratio test, etc.) was left
% commented out.  Either (a) uncomment and integrate the prose below so the
% subsection has real content, or (b) replace this subsection with a short
% bridging paragraph that sends the reader directly into the
% \subsection*{Choosing the Entering Variable} example that follows.
% As a stopgap, a brief orientation paragraph is provided below so that the
% numbered subsection is not empty in the typeset book.
```

No equations, labels or worked examples were changed beyond
commenting-out the empty shells; the live tcolorbox examples that follow
(line 999 onwards in the post-edit file) are untouched.

---

## §8.4 — annotated feasible-region plot (`simplex-all-tableaus`)

This plot in the prior version was a graphic that showed the running LP
polygon with each vertex annotated by the simplex dictionary at that
vertex, plus arrows along the edges showing pivot transitions. The LP is
the same one as §8.3.1, with optimum (4,5) and z=23 (confirmed by the
``This is optimal!`` line just above the figure).

### Before
```tex
\begin{center}
\altincludegraphics[scale = 0.5]{Figures/simplex-all-tableaus}{The feasible region polygon with each vertex annotated by its corresponding simplex dictionary; arrows along the edges show the pivot transitions between adjacent basic feasible solutions.}
\end{center}
```

### After
A TikZ figure of the same polygon, with each vertex annotated by `(x,y)`,
the basis `B`, and the objective value `z`. Solid green arrows show the
steepest-ascent path `(0,0) -> (0,7) -> (4,5)`, dashed gray arrows show
the alternative path `(0,0) -> (8,0) -> (7,2) -> (4,5)`.
```tex
\begin{tikzpicture}[scale=0.7]
    \draw[gray!40, very thin, step=1] (0,0) grid (10,10);
    \draw[->, thick] (0,0) -- (10.5,0) node[right] {$x$};
    \draw[->, thick] (0,0) -- (0,10.5) node[above] {$y$};
    \foreach \x in {1,...,10} \draw (\x,0.06) -- (\x,-0.06) node[below] {\scriptsize \x};
    \foreach \y in {1,...,10} \draw (0.06,\y) -- (-0.06,\y) node[left]  {\scriptsize \y};

    \fill[blue!50!cyan, opacity=0.25]
        (0,0) -- (8,0) -- (7,2) -- (4,5) -- (0,7) -- cycle;

    \draw[red,    thick] (0,9)    -- (9.5,-0.5) node[below right] {\scriptsize $x+y=9$};
    \draw[teal,   thick] (3,10)   -- (9,-2)     node[below]       {\scriptsize $2x+y=16$};
    \draw[orange, thick] (-0.5,7.25) node[above left] {\scriptsize $x+2y=14$}
                                                -- (10.5,1.75);

    \node[fill=blue,circle,inner sep=1.5pt] at (0,0) {};
    \node[below left, align=left] at (0,0)
        {\scriptsize $(0,0)$ \\ $B=\{s_1,s_2,s_3\}$ \\ $z=0$};
    \node[fill=blue,circle,inner sep=1.5pt] at (8,0) {};
    \node[below right, align=left] at (8,0)
        {\scriptsize $(8,0)$ \\ $B=\{x,s_1,s_3\}$ \\ $z=16$};
    \node[fill=blue,circle,inner sep=1.5pt] at (7,2) {};
    \node[right, align=left] at (7.1,2.4)
        {\scriptsize $(7,2)$ \\ $B=\{x,y,s_3\}$ \\ $z=20$};
    \node[fill=red, circle,inner sep=2pt] at (4,5) {};
    \node[above right, align=left] at (4.1,5.1)
        {\scriptsize $(4,5)$ \\ $B=\{x,y,s_2\}$ \\ $z=23$ (optimal)};
    \node[fill=blue,circle,inner sep=1.5pt] at (0,7) {};
    \node[left, align=right] at (-0.1,7)
        {\scriptsize $(0,7)$ \\ $B=\{y,s_1,s_2\}$ \\ $z=21$};

    \draw[->, thick, green!50!black] (0.25,0.25)  -- (0.25,6.75);
    \draw[->, thick, green!50!black] (0.4,6.85)   -- (3.85,5.15);
    \draw[->, dashed, gray!60!black] (0.4,0.15)   -- (7.6,0.15);
    \draw[->, dashed, gray!60!black] (7.95,0.3)   -- (7.05,1.7);
    \draw[->, dashed, gray!60!black] (6.85,2.25)  -- (4.15,4.85);
\end{tikzpicture}
```
Bases at each vertex were derived from the active inequalities (slack
variables corresponding to slack constraints), objective values from
evaluating `2x+3y`. The (4,5) vertex is highlighted in red.

This is a "stylized but mathematically correct" rendering per the
punch-list spec: the full dictionaries that the original graphic showed
beside each vertex would be too crowded inside a single TikZ figure, so
we show only the basis identifier and the objective value at each vertex.
The full per-vertex dictionaries are already worked out in the prose
sections immediately surrounding the figure.

---

## §8.5 — Big-M infeasible-origin plot

LP shown in the orange tcolorbox above the figure:
```
max  2x + 3y
s.t. 2x +  y       >= 5
     2x +  y       <= 16
      x + 2y       <= 14
      x, y         >= 0
```
Vertices (counterclockwise): (5/2, 0), (8, 0), (6, 4), (0, 7), (0, 5).
The origin (0,0) is **not** in the feasible region because 2*0+0=0 < 5,
which is the whole point of the example.

### Before
```tex
\begin{center}
\altincludegraphics[scale = 1]{Figures/big-M}{Plot of the feasible region for the Big-M example with constraints 2x+y>=5, 2x+y<=16, x+2y<=14, x,y>=0; the shaded region lies away from the origin, showing that the origin is not feasible as a starting basis.}
\end{center}
```

### After
```tex
\begin{tikzpicture}[scale=0.65]
    \draw[gray!40, very thin, step=1] (0,0) grid (10,10);
    \draw[->, thick] (0,0) -- (10.5,0) node[right] {$x$};
    \draw[->, thick] (0,0) -- (0,10.5) node[above] {$y$};
    \foreach \x in {1,...,10} \draw (\x,0.08) -- (\x,-0.08) node[below] {\scriptsize \x};
    \foreach \y in {1,...,10} \draw (0.08,\y) -- (-0.08,\y) node[left]  {\scriptsize \y};

    \fill[red!15] (0,0) -- (2.5,0) -- (0,5) -- cycle;
    \node[red!60!black] at (0.9,1.3) {\scriptsize infeasible};

    \fill[blue!50!cyan, opacity=0.3]
        (2.5,0) -- (8,0) -- (6,4) -- (0,7) -- (0,5) -- cycle;

    \draw[violet, thick] (0,5) -- (3,-1) node[below right] {\scriptsize $2x+y=5$};
    \draw[teal,   thick] (3,10) -- (9,-2)  node[below] {\scriptsize $2x+y=16$};
    \draw[orange, thick] (-0.5,7.25) node[above left] {\scriptsize $x+2y=14$} -- (10.5,1.75);

    \node[fill=blue,circle,inner sep=1.5pt,label={below:\small$(\tfrac{5}{2},0)$}] at (2.5,0) {};
    \node[fill=blue,circle,inner sep=1.5pt,label={below right:\small$(8,0)$}]      at (8,0)   {};
    \node[fill=blue,circle,inner sep=1.5pt,label={right:\small$(6,4)$}]            at (6,4)   {};
    \node[fill=blue,circle,inner sep=1.5pt,label={above left:\small$(0,7)$}]       at (0,7)   {};
    \node[fill=blue,circle,inner sep=1.5pt,label={left:\small$(0,5)$}]             at (0,5)   {};

    \draw[red, very thick] (-0.18,-0.18) -- (0.18, 0.18);
    \draw[red, very thick] (-0.18, 0.18) -- (0.18,-0.18);
    \node[red!70!black, below left] at (0,0) {\scriptsize $(0,0)$ infeasible};
\end{tikzpicture}
```
The cut-off origin wedge (the triangle `(0,0)-(5/2,0)-(0,5)`) is shaded
pink and labeled `infeasible`, and the origin itself gets a red X. This
makes the "the origin is not feasible" point in the next paragraph
visually unambiguous.

---

## Other `\altincludegraphics` calls in this file (NOT in the punch list)

For the record, these remain unchanged:
- Line 671 — figure intro to §8.3 with a 2D feasible polytope side-by-side
  with a 3D feasible polytope. The 3D side is already TikZ; only the 2D
  side is `\altincludegraphics{...feasiblePolytope.pdf}`. Not in the
  punch list.
- Line 2810 — unbounded-LP plot in §8.7 (Simplex and Unbounded LPs). Not
  in the punch list.
- Line 3155 — exercises figure. Not in the punch list.

## Verification

- Brace balance / `\end{figure}` orphan check: the three replaced figures
  were each wrapped in a `\begin{center} ... \end{center}` block (not a
  `figure` environment) in the original, and remain inside the same
  `\begin{center} ... \end{center}` after the edit. No `\end{figure}`
  pairing is involved.
- `\begin{tikzpicture}` / `\end{tikzpicture}` counts match in all three new
  figures.
- `\foreach` constructs follow the exact pattern used in the existing
  `formalize-LP.tex` LP feasible-region figure (lines 713 ff.), so the
  TikZ libraries that already work for that figure (`shapes`,
  `decorations.pathreplacing`, `calc`, plus the standard library bundle
  loaded in `packages-and-commands.tex`) are sufficient.
- Labels (`\label{...}`) referenced from elsewhere: the only `\label`
  declarations in the surrounding region are at lines 639
  (`sec:pivoting`), 709 (`fig:polytope`), 1729
  (`def:def:reduced-cost-general`) and exercise labels far below. None of
  these were touched; cross-references resolve unchanged.
- Section numbering (`§8.3.1`, `§8.3.2`, etc.) is unchanged: only the
  bodies of the subsections were edited.
