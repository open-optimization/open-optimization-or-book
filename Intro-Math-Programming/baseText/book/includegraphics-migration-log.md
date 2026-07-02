# `\includegraphics` Migration Log — Book 1

Phase 2 migration executed: the 65 `\includegraphics` call sites
catalogued by the Phase 1 inventory agent have been wrapped with a new
accessibility-aware macro `\altincludegraphics`. The author's existing
`alt={…}` text was preserved byte-for-byte; it was moved out of the
graphicx `[opts]` and into the new macro's third positional argument.

The commented-out `\DocumentMetadata{tagging=on}` block in
`book1-main.tex` was left untouched, per the option-(c) decision.
Tagging can be re-enabled later when the TeX Live 2025 amsmath/align
conflict is resolved, without requiring a second migration.

## Summary

| Metric | Value |
|---|---|
| Inventory total | 65 |
| Migrated | 65 |
| Skipped (no `alt=` key) | 0 |
| Skipped (empty `alt={}`) | 0 |
| Files modified (source `.tex`) | 13 |
| New files created | 1 (`book/preamble/preamble-accessibility.tex`) |
| `book1-main.tex` lines added | 3 (one comment + `\input` + blank) |
| Bytes of alt text reused verbatim | 100% (no rewrites) |

## New file

`book/preamble/preamble-accessibility.tex` — defines the macro

```latex
\RequirePackage{pdfcomment}
\newcommand{\altincludegraphics}[3][]{%
  \pdftooltip{\includegraphics[#1]{#2}}{#3}%
}
```

`pdfcomment` was verified NOT already loaded anywhere in the project
(grep across all `.tex` files in `Intro-Math-Programming/` returned no
matches outside of `includegraphics-inventory.md` mentioning it as a
proposal). `\RequirePackage` is idempotent in any case.

## book1-main.tex changes

Single insertion between the existing `packages-and-commands` `\input`
and the cleveref `\usepackage` block (lines 33–34 of the new file):

```latex
% Accessibility wrapper for \includegraphics (defines \altincludegraphics).
\input{preamble/preamble-accessibility}
```

The commented `\DocumentMetadata{...}` block at lines 22–26 was NOT
modified.

## Per-file migration summary

| File | Migrations | Example before → after |
|---|---|---|
| `book/frontmatter/LP-front-matter.tex` | 4 | see Example A below |
| `book/frontmatter/contributors-foundations.tex` | 1 | CC-BY badge |
| `book/part1-linear-programming/ch01-introduction/mathematicalProgramming.tex` | 1 | tree-diagram-types |
| `book/part1-linear-programming/ch02-modeling/Section2.tex` | 1 | images/lemon |
| `book/part1-linear-programming/ch03-software/software-excel.tex` | 8 | excel-solver-* screenshots |
| `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex` | 6 | see Example B below |
| `book/part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex` | 5 | sensitivity-* figures |
| `book/part1-linear-programming/ch09-multi-objective/multi-objective-optimization_updated.tex` | 2 | risk-plot, pareto-curve |
| `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex` | 16 | see Example C below |
| `book/appendices/equations-and-lines/equations-and-lines-new.tex` | 9 | Sekhon-Bloom screenshots |
| `book/appendices/linear-algebra/LyryxOpenTexts.tex` | 5 | Lyryx logos + component icons |
| `book/appendices/linear-algebra/license.tex` | 2 | Lyryx logo + CC-BY badge |
| `book/preamble/preamble-optimization.tex` | 5 | software-logo `\newcommand` bodies |
| **Total** | **65** | |

### Example A — `LP-front-matter.tex` line 14

Before:

```latex
\includegraphics[scale = 0.3, alt={Cover-page figure: a 2D plot with x1 and x2 axes showing the feasible region of a linear program as a single shaded convex polygon bounded by linear constraint lines.}]{LP-feasible-region}
```

After:

```latex
\altincludegraphics[scale = 0.3]{LP-feasible-region}{Cover-page figure: a 2D plot with x1 and x2 axes showing the feasible region of a linear program as a single shaded convex polygon bounded by linear constraint lines.}
```

### Example B — `simplex-basis-driven.tex` line 671 (subfigure context)

Before:

```latex
    \includegraphics[width=\linewidth, alt={A 2D feasible polytope shaded as a convex polygon with several vertices marked; illustrates that the simplex method walks along edges from vertex to vertex of such a region in search of an optimum.}]{foundationsAppliedMathematicsLabs/Volume2/Simplex/figures/feasiblePolytope.pdf}
```

After:

```latex
    \altincludegraphics[width=\linewidth]{foundationsAppliedMathematicsLabs/Volume2/Simplex/figures/feasiblePolytope.pdf}{A 2D feasible polytope shaded as a convex polygon with several vertices marked; illustrates that the simplex method walks along edges from vertex to vertex of such a region in search of an optimum.}
```

### Example C — `graphtheory-dor1.tex` line 15 (no `[opts]` originally except `alt=`)

Before:

```latex
\includegraphics[alt={Aerial photograph of a Missoula, Montana housing development showing several blocks of houses connected by a network of streets. The image motivates the question of whether a lawn inspector can walk every street without backtracking.}]{graph-theory-graphics/GraphPicture.png}
```

After (note: empty `[]` omitted because `alt=` was the only key):

```latex
\altincludegraphics{graph-theory-graphics/GraphPicture.png}{Aerial photograph of a Missoula, Montana housing development showing several blocks of houses connected by a network of streets. The image motivates the question of whether a lawn inspector can walk every street without backtracking.}
```

The `[]` was dropped (the macro's `[#1]` defaults to empty), matching
the rule in the task spec: "If the options become empty, omit `[]`."

## Verification

1. **Count check.** `grep -rn '\altincludegraphics' book/` over `.tex`
   files reports 65 call sites plus the macro definition in
   `preamble/preamble-accessibility.tex` and the in-line comment in
   `book1-main.tex`. Per-file counts match the inventory exactly:

   - graphtheory-dor1.tex: 16
   - equations-and-lines-new.tex: 9
   - software-excel.tex: 8
   - simplex-basis-driven.tex: 6
   - sensitivity-LP.tex: 5
   - LyryxOpenTexts.tex: 5
   - preamble-optimization.tex: 5
   - LP-front-matter.tex: 4
   - license.tex: 2
   - multi-objective-optimization_updated.tex: 2
   - mathematicalProgramming.tex: 1
   - Section2.tex: 1
   - contributors-foundations.tex: 1
   - **Total: 65** ✓

2. **No residual `alt=` in `\includegraphics[...]` options.**
   `grep -rn '\includegraphics\[[^]]*alt=' baseText/book/ --glob='*.tex'`
   returns **no matches**. (Matches found in
   `baseText/accessibility-test/` are out of scope — the test directory
   is not loaded by Book 1.)

3. **Spot checks** of the three files sampled (`LP-front-matter.tex`
   line 14, `graphtheory-dor1.tex` line 700, and
   `preamble-optimization.tex` lines 60–64) confirm:
   - Braces are balanced.
   - Original options (`scale`, `width`, etc.) preserved exactly.
   - Alt text matches the inventory's `alt={…}` value byte-for-byte.

4. **`book1-main.tex` integrity.**
   - `\DocumentMetadata{...}` block at lines 22–26 remains commented.
   - New `\input{preamble/preamble-accessibility}` lands after
     `\input{../packages-and-commands}` (line 31) and before the
     `\usepackage[nameinlink]{cleveref}` block (line 46), as required.

## Unexpected findings

None of the 65 inventoried calls were missing an `alt=` key; none had
an empty `alt={}` value. No author intervention is needed for any
entry. The migration was a pure mechanical refactor.

One implementation note worth flagging for the next compile pass: the
`\renewcommand{\includegraphics}[1]{...}` override at
`book/preamble/preamble0.tex:18` silently drops the optional argument.
`\altincludegraphics` calls `\includegraphics[#1]{#2}` internally, so
if `preamble0.tex` is ever loaded after our wrapper, the `[opts]` will
be dropped on the floor. This was not a problem for the inventory's
call sites (the override is not in the Book 1 load chain through
`book1-main.tex` — verified by walking the `\input` graph during
Phase 1), but it is worth a separate cleanup ticket as the inventory
noted.

## Out-of-scope confirmations

- `NON-DISTRIBUTABLE/`: untouched.
- Book 2 files (`book2-main.tex`, `part4-nonlinear-programming/`,
  `book?-main-simplified.tex`): untouched.
- `LICENSE-Code`, `LICENSE-Content`: untouched.
- `accessibility-test/`: untouched (not part of Book 1's load chain).
- `\DocumentMetadata{tagging=on}` block: still commented.

## Files in scope (touched)

Source `.tex` files modified (13):

1. `Intro-Math-Programming/baseText/book/book1-main.tex` (preamble wiring only)
2. `Intro-Math-Programming/baseText/book/frontmatter/LP-front-matter.tex`
3. `Intro-Math-Programming/baseText/book/frontmatter/contributors-foundations.tex`
4. `Intro-Math-Programming/baseText/book/part1-linear-programming/ch01-introduction/mathematicalProgramming.tex`
5. `Intro-Math-Programming/baseText/book/part1-linear-programming/ch02-modeling/Section2.tex`
6. `Intro-Math-Programming/baseText/book/part1-linear-programming/ch03-software/software-excel.tex`
7. `Intro-Math-Programming/baseText/book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex`
8. `Intro-Math-Programming/baseText/book/part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex`
9. `Intro-Math-Programming/baseText/book/part1-linear-programming/ch09-multi-objective/multi-objective-optimization_updated.tex`
10. `Intro-Math-Programming/baseText/book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex`
11. `Intro-Math-Programming/baseText/book/appendices/equations-and-lines/equations-and-lines-new.tex`
12. `Intro-Math-Programming/baseText/book/appendices/linear-algebra/LyryxOpenTexts.tex`
13. `Intro-Math-Programming/baseText/book/appendices/linear-algebra/license.tex`
14. `Intro-Math-Programming/baseText/book/preamble/preamble-optimization.tex`

(That's 14 lines including `book1-main.tex` itself, but only 13
non-`main` source files; `book1-main.tex` is metadata-only.)

New file (1):

- `Intro-Math-Programming/baseText/book/preamble/preamble-accessibility.tex`

_End of log._
