# Spell-check fix log for Book 1

Source of truth: `spellcheck-triage.md` TYPO table (57 entries — 52 unique words, 5 multi-instance).

## Summary

| Metric | Count |
|---|---|
| TYPO entries in triage list | 57 (occurrences) |
| Unique typo words | 52 |
| Applied | 57 |
| Skipped | 0 |
| Reclassified | 0 |
| Files touched | 11 |

All 57 TYPO occurrences were fixable as straightforward prose corrections in
visible text. No tokens turned out to be code identifiers, intentional names,
or content inside protected verbatim/lstlisting regions on second look.

## Per-file table

### `book/part1-linear-programming/ch01-introduction/introduction-book.tex`

| Line | Before | After |
|---|---|---|
| 7 | `Reserach` | `Research` |
| 9 | `rearrranged` | `rearranged` |
| 9 | `desited` | `desired` |
| 13 | `optimizaiton` | `optimization` |
| 15, 17, 17 | `gaurantees` (3x) | `guarantees` |
| 19 | `compter` | `computer` |
| 31 | `differnt` | `different` |

### `book/part1-linear-programming/ch02-modeling/Section2.tex`

| Line | Before | After |
|---|---|---|
| 96 | `inequalties` | `inequalities` |
| 98 | `dont` | `don't` |
| 98 | `infinitly` | `infinitely` |
| 128 | `assumtions` | `assumptions` |
| 274 | `contraints` | `constraints` |
| 894 | `unbouned` | `unbounded` |
| 1024 | `eachother` | `each other` |

### `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex`

| Line | Before | After |
|---|---|---|
| 84 | `chosing` | `choosing` |
| 206 | `paramters` | `parameters` |

### `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex`

| Line | Before | After |
|---|---|---|
| 50 | `ordred` | `ordered` |
| 606 | `proble` | `problem` |
| 606 | `somthing` | `something` |
| 606 | `separtes` | `separates` |

### `book/part1-linear-programming/ch05-lp-theory/formalize-LP.tex`

| Line | Before | After |
|---|---|---|
| 12 | `rigirous` | `rigorous` |
| 165 | `Optimial` | `Optimal` |
| 521 | `forumla` | `formula` (inside `\text{...}` in `align*`) |

### `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex`

| Line | Before | After |
|---|---|---|
| 15 | `algortim` | `algorithm` |
| 19 | `state-of-the art` | `state-of-the-art` |
| 644 | `chaning` | `changing` |
| 644 | `soluiton` | `solution` |
| 657 | `Jupter` | `Jupyter` |
| 1009 | `coefficent` | `coefficient` |
| 1431 | `avaibale` | `available` |
| 1562 | `postive` | `positive` |
| 1562 | `ambigious` | `ambiguous` |
| 1653 | `varibales` | `variables` |
| 1656 | `auxillary` | `auxiliary` |
| 2302 | `constaints` | `constraints` |
| 2618 | `dictionaryx` | `dictionaries` |
| 2884 | `vaiable` | `variable` |

### `book/part1-linear-programming/ch06-simplex/simplex-matrix-version.tex`

| Line | Before | After |
|---|---|---|
| 120 | `prespective` | `perspective` |

### `book/part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex`

| Line | Before | After |
|---|---|---|
| 598 | `equivalentely` | `equivalently` |
| 806 | `anr` | `and` |

### `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex`

| Line | Before | After |
|---|---|---|
| 358 | `algorihtm` | `algorithm` |
| 689 | `Tacp,a` | `Tacoma` |
| 1179 | `Krukal's` | `Kruskal's` |
| 1282, 1320, 1370, 3813, 3855, 3884 | `Corvalis` (6x) | `Corvallis` |
| 3830 | `accidentaly` | `accidentally` |

### `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex`

| Line | Before | After |
|---|---|---|
| 408 | `constains` | `contains` |
| 505 | `varios` | `various` |
| 595 | `constrants` | `constraints` |
| 597 | `intance` | `instance` |
| 941 | `correspondance` | `correspondence` |
| 1434 | `assining` | `assigning` |
| 1674 | `Genaralized` | `Generalized` |
| 1784 | `terimals` | `terminals` |

### `book/appendices/linear-algebra/systemsofequationsAlgebraicProcedures.tex`

| Line | Before | After |
|---|---|---|
| 40 | `notaion` | `notation` |

### `optimization/open-optimization-examples/example-capital-budgeting.tex`

| Line | Before | After |
|---|---|---|
| 13 | `constriaints` | `constraints` |
| 31 | `invesment` | `investment` |
| 90 | `explict` | `explicit` |

## Reclassifications

None. Every TYPO from the triage list was confirmed as a typo in
visible prose (or visible TikZ node labels for `Corvalis` and `Tacp,a`,
which render as rendered map text) and was fixed in place.

## Notes

- `Corvalis` appears 6 times — 2 in `\tabular` data cells, 4 in
  `\node` labels inside `tikzpicture` environments. All 6 render as
  visible reader text, so all were fixed with a `replace_all`.
- `gaurantees` appeared 3 times in `introduction-book.tex` (lines 15
  and twice on 17) and was fixed via `replace_all`.
- `forumla` is inside `\text{...}` in an `align*` math environment.
  That content is rendered as prose text, so the fix was applied.
- `Optimial` appeared in a `\section{...}` heading on line 165 of
  `formalize-LP.tex` — fixed.
- `state-of-the` on line 19 of `simplex-basis-driven.tex` was a
  missing-final-hyphen on `state-of-the art` — fixed to
  `state-of-the-art`.
- No tokens needed to be skipped for verbatim/lstlisting/url/comment
  reasons; all targeted typos were in plain prose or in user-visible
  rendered labels.
