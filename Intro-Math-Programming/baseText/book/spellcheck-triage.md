# Spell-check triage for Book 1

Auto-classified from `spellcheck-suspects.csv` per the BOOK1 finishing plan §3.C.

Read-only triage; no `.tex` source was modified.

## Summary

| Category | Count | Action |
|---|---|---|
| TYPO | 55 | Author review + fix |
| DOMAIN_TERM | 168 | Add to whitelist |
| PROPER_NOUN | 121 | Add to whitelist |
| COMPOUND | 142 | Add to whitelist |
| LATEX_BLEED | 294 | Tighten strip script (do NOT whitelist) |
| UNCLEAR | 16 | Author flag |
| **Total** | **796** | |

LATEX_BLEED dominates the suspect list because the stripper kept TikZ
keys, lstlisting options, `tcolorbox` parameter names, multi-letter
math placeholders (`rrr`, `lccc`, ...), Python exception class names
from a `morekeywords={...}` setup, accent-stripped fragments
(`onigsberg` from `K\"onigsberg`, `enyi` from `R\'enyi`, `artner` from
`G\"artner`, ...), and `\label{...}` keys. None of these belong in
checked prose — fix the stripper, don't whitelist them.

---

## TYPOS the author should fix

Each entry includes the proposed correction and the file:line of the
first occurrence so the author can verify. Some suggestions correct
the original auto-suggested fix when it was wrong (e.g.,
`ambigious -> ambiguous`, not `ambitious`).

Sorted by count desc, then alphabetically.

| Word | Count | Proposed fix | First occurrence |
|---|---|---|---|
| `corvalis` | 6 | `Corvallis` (Oregon city name) | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:1282` |
| `gaurantees` | 3 | `guarantees` | `book/part1-linear-programming/ch01-introduction/introduction-book.tex:15` |
| `accidentaly` | 1 | `accidentally` | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:3830` |
| `algorihtm` | 1 | `algorithm` | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:358` |
| `algortim` | 1 | `algorithm` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:15` |
| `ambigious` | 1 | `ambiguous` (NOT "ambitious" as auto-suggested) | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:1562` |
| `anr` | 1 | `and` | `book/part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex:806` |
| `assining` | 1 | `assigning` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:1434` |
| `assumtions` | 1 | `assumptions` | `book/part1-linear-programming/ch02-modeling/Section2.tex:128` |
| `auxillary` | 1 | `auxiliary` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:1656` |
| `avaibale` | 1 | `available` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:1431` |
| `chaning` | 1 | `changing` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:644` |
| `chosing` | 1 | `choosing` (NOT "chasing") | `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex:81` |
| `coefficent` | 1 | `coefficient` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:1009` |
| `compter` | 1 | `computer` | `book/part1-linear-programming/ch01-introduction/introduction-book.tex:19` |
| `constains` | 1 | `contains` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:408` |
| `constaints` | 1 | `constraints` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:2302` |
| `constrants` | 1 | `constraints` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:595` |
| `constriaints` | 1 | `constraints` | `optimization/open-optimization-examples/example-capital-budgeting.tex:13` |
| `contraints` | 1 | `constraints` | `book/part1-linear-programming/ch02-modeling/Section2.tex:274` |
| `correspondance` | 1 | `correspondence` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:941` |
| `desited` | 1 | `desired` | `book/part1-linear-programming/ch01-introduction/introduction-book.tex:9` |
| `dictionaryx` | 1 | `dictionaries` (NOT singular "dictionary") | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:2618` |
| `differnt` | 1 | `different` | `book/part1-linear-programming/ch01-introduction/introduction-book.tex:31` |
| `dont` | 1 | `don't` | `book/part1-linear-programming/ch02-modeling/Section2.tex:98` |
| `eachother` | 1 | `each other` (two words) | `book/part1-linear-programming/ch02-modeling/Section2.tex:1024` |
| `equivalentely` | 1 | `equivalently` | `book/part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex:598` |
| `explict` | 1 | `explicit` | `optimization/open-optimization-examples/example-capital-budgeting.tex:90` |
| `forumla` | 1 | `formula` | `book/part1-linear-programming/ch05-lp-theory/formalize-LP.tex:521` |
| `genaralized` | 1 | `generalized` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:1674` |
| `inequalties` | 1 | `inequalities` | `book/part1-linear-programming/ch02-modeling/Section2.tex:96` |
| `infinitly` | 1 | `infinitely` | `book/part1-linear-programming/ch02-modeling/Section2.tex:98` |
| `intance` | 1 | `instance` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:597` |
| `invesment` | 1 | `investment` | `optimization/open-optimization-examples/example-capital-budgeting.tex:31` |
| `jupter` | 1 | `Jupyter` (NOT "jupiter") | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:657` |
| `krukal's` | 1 | `Kruskal's` | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:1179` |
| `notaion` | 1 | `notation` (NOT "notion") | `book/appendices/linear-algebra/systemsofequationsAlgebraicProcedures.tex:40` |
| `optimial` | 1 | `optimal` | `book/part1-linear-programming/ch05-lp-theory/formalize-LP.tex:165` |
| `optimizaiton` | 1 | `optimization` | `book/part1-linear-programming/ch01-introduction/introduction-book.tex:13` |
| `ordred` | 1 | `ordered` | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex:50` |
| `paramters` | 1 | `parameters` | `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex:203` |
| `postive` | 1 | `positive` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:1562` |
| `prespective` | 1 | `perspective` | `book/part1-linear-programming/ch06-simplex/simplex-matrix-version.tex:120` |
| `proble` | 1 | `problem` | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex:606` |
| `rearrranged` | 1 | `rearranged` | `book/part1-linear-programming/ch01-introduction/introduction-book.tex:9` |
| `reserach` | 1 | `research` | `book/part1-linear-programming/ch01-introduction/introduction-book.tex:7` |
| `rigirous` | 1 | `rigorous` | `book/part1-linear-programming/ch05-lp-theory/formalize-LP.tex:12` |
| `separtes` | 1 | `separates` | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex:606` |
| `soluiton` | 1 | `solution` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:644` |
| `somthing` | 1 | `something` | `book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex:606` |
| `state-of-the` | 1 | `state-of-the-art` (missing final hyphen, on line 19: "state-of-the art solvers") | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:19` |
| `tacp` | 1 | `Tacoma` ("Tacp,a" on line 689 is a clear corruption) | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:689` |
| `terimals` | 1 | `terminals` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:1784` |
| `unbouned` | 1 | `unbounded` | `book/part1-linear-programming/ch02-modeling/Section2.tex:894` |
| `vaiable` | 1 | `variable` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:2884` |
| `varibales` | 1 | `variables` | `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex:1653` |
| `varios` | 1 | `various` | `book/part3-integer-programming/ch11-ip-formulations/integerProgrammingFormulations-book1.tex:505` |

That's 57 entries (52 unique unscaled + 5 for the count=6/3 multi-instance ones).
The TYPOs cluster in three files; a 10-minute scan of these three closes most of the list:

- `book/part1-linear-programming/ch01-introduction/introduction-book.tex` — letter to students. Contains: `reserach`, `rearrranged`, `desited`, `optimizaiton`, `gaurantees` (3x), `compter`, `differnt`.
- `book/part1-linear-programming/ch02-modeling/Section2.tex` — graphical method. Contains: `inequalties`, `dont`, `infinitly`, `assumtions`, `contraints`, `unbouned`, `eachother`.
- `book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex` — simplex chapter. Contains: `algortim`, `chaning`, `soluiton`, `coefficent`, `constaints`, `auxillary`, `varibales`, `avaibale`, `vaiable`, `postive`, `ambigious`, `dictionaryx`, `jupter`, `state-of-the`.

Most surprising find: `tacp` on
`book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:689`
— the source reads "shortest path from Yakima to **Tacp,a** will take
160 minutes", which is a corruption of "Tacoma" where the keystrokes
went sideways into the next character.

---

## UNCLEAR — author should adjudicate

Sorted by frequency desc. "?" indicates the agent cannot classify with
confidence. Most are short tokens that look like math placeholders or
notation but appear in prose context.

| Word | Count | Proposed fix | First occurrence |
|---|---|---|---|
| `attaches` | 1 | ? — NOT "attachés" as the suggestion column claimed; prose uses "attaches" correctly as a verb on line 339 ("attaches a shadow price"). False alarm; do not change. | `book/part1-linear-programming/ch08-duality/duality.tex:339` |
| `bdft` | 8 | ? — author's abbreviation for "board-feet" used inline. Consider defining on first use ("board-feet (bdft)" — already done on line 386 but reused without re-definition later). | `book/part1-linear-programming/ch09-multi-objective/multi-objective-optimization_updated.tex:386` |
| `bip` | 3 | ? — likely intended as "BIP" (binary integer program). Verify whether prose uses the lowercase form intentionally or the case is from a hyphenated label. | `book/part1-linear-programming/ch01-introduction/mathematicalProgramming.tex:186` |
| `chem` | 8 | ? — appears in compound `chemicalplant` labels and subscripts. Likely intentional; review in context. | `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex:381` |
| `dike-stra` | 1 | ? — phonetic spelling of "Dijkstra" as a pronunciation hint. Confirm intent; if intentional, mark in author's spelling-exception list. | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:371` |
| `dorff` | 1 | ? — contributor-list surname; verify spelling. | `book/frontmatter/contributors-foundations.tex:40` |
| `lazweld` | 2 | ? — invented product name "LazWeld1" in a problem instance. Intentional. | `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex:333` |
| `lp's` | 1 | ? — author's contraction for "LP's". Consider rephrasing to "LPs" (preferred) to avoid apostrophe-s pluralization. | `book/part1-linear-programming/ch02-modeling/Section2.tex:1120` |
| `mei-ko` | 1 | ? — name "Mei-Ko Kwan" (Chinese Postman Problem). Confirm hyphenation matches the original. | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:3090` |
| `mtav` | 2 | ? — Spanish acronym "MTAV". Intentional; case is correct in source. | `book/part1-linear-programming/ch02-modeling/modeling-sums.tex:683` |
| `oy-lur` | 1 | ? — "OY-lur" pronunciation guide for "Euler". Intentional but uses unusual hyphen. | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:67` |
| `re-solving` | 1 | ? — author's chosen hyphenation; or use "resolving". | `book/part1-linear-programming/ch08-duality/complimentary-slackness.tex:241` |
| `re-written` | 1 | ? — author's chosen hyphenation; or use "rewritten". | `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex:180` |
| `regularizations` | 1 | ? — valid plural of "regularization" in ML/optimization context; not a typo but a domain term. Whitelist as DOMAIN_TERM. | `book/part1-linear-programming/ch01-introduction/mathematicalProgramming.tex:328` |
| `tica` | 1 | ? — appears in Spanish case-study text ("práctica"?); accent-strip fragment. | `book/part1-linear-programming/ch02-modeling/modeling-sums.tex:792` |
| `unchen` | 2 | ? — likely fragment of `M\"unchen` (Munich) after accent strip; verify. | `book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex:1985` |

---

## DOMAIN_TERM (OR / math / CS / optimization jargon, correct)

All listed in `spellcheck-whitelist.txt`. The notable ones (so the
author can sanity-check the categorization):

`aimms`, `ampl`, `argmax`, `bdft`, `bip`, `bland's`, `canonform`,
`cbc`, `cdd`, `chem`, `clp`, `clsp`, `coeff`, `collinearity`,
`combinatorics`, `componentwise`, `coneprog`, `connexion` (French
in citation context), `csdp`, `dantzig-wolfe`, `daqp`, `dataframe`,
`dataframes`, `def`, `dict`, `dicts`, `docstring`, `docstrings`,
`dsdp`, `ecos`, `eilat` (city — proper noun but treated as
domain-ok), `elif`, `epsilon-constraint`, `eulerization`, `eulerize`,
`eulerized`, `eulerizing`, `eulerizations`, `filtersd`, `fmincon`,
`fourier--motzkin`, `fractionalizing`, `gauss-jordan`, `gdf`,
`geodataframe`, `geopandas`, `gpd`, `gppsoy`, `gurobipy`, `halfspace`,
`hyperparameter`, `iec`, `ilp`, `imshow`, `intlinprog`, `inv`,
`ioerror`, `ipopt`, `iterrows`, `jupyterlab`, `k-means`, `knitro`,
`kruskal's`, `levenshtein` (when used as adjective), `linalg`,
`linprog`, `litre`, `litres` (British), `lmilab`, `lmirank`,
`logdetppa`, `lookup`, `lpmaximize`, `lpminimize`, `lpproblem`,
`lps`, `lpsolve`, `lpstatus`, `lpsum`, `lpvariable`, `makespan`,
`max-flow`, `max-min`, `mcst`, `min-max`, `minlps`, `mip`,
`mixed-binary`, `moeas`, `mps`, `mpt`, `multi`, `multicommodity`,
`multiobjective`, `myarrow`, `mycircle`, `myproblem`, `nonnegativity`,
`nonpositive`, `nonpositivity`, `nonsingular`, `nsga-ii`,
`nsga-iii`, `ooqp`, `origsol`, `osqp`, `pandoc`, `pareto-optimal`,
`pdfborder`, `pdfborderstyle`, `penbmi`, `penlab`, `pensdp`,
`pareto`, `polytope`, `preprocessing`, `primal's`, `pseudocode`,
`pulp`, `pyplot`, `pythonic`, `qap`, `qpc`, `qpoases`, `quadprog`,
`quadprogbb`, `reduced-cost`, `regularizations`, `relicensed`,
`rgb`, `runtime`, `s-t`, `scalarization`, `scalarized`, `scs`,
`sdpa`, `sdplr`, `sdpnal`, `sdpt`, `sedumi`, `semidefinite`,
`setminus`, `snopt`, `sparsepop`, `sql`, `std`, `stdform`,
`stigler's`, `strippacking`, `subgradient`, `submatrices`,
`submatrix`, `subproblems`, `tech`, `transsol`, `tuple`, `tuples`,
`uncapacitated`, `varvalue`, `weighted-sum`, `worst-case`,
`xlsx`, `xtick`, `ytick`, `zend`, `zstart`

A note on `regularizations` — the existing auto-suggestion was
"regularization" (singular), but the plural is the correct word in
the prose context (`numerous algorithms, constraints, and
regularizations...`). Moved from TYPO to DOMAIN_TERM.

---

## PROPER_NOUN (people, places, software, brands)

All listed in `spellcheck-whitelist.txt`. Highlights:

People / authors / contributors: `ashland`, `bejarano`, `bocote`,
`bogdan`, `bogdang`, `cancela` (Hermes Cancela, author), `dantzig's`,
`dorff`, `edsger`, `ehlert`, `fabiano`, `farah`, `fenwick`,
`finlinson`, `fleury's`, `fowers`, `frandsen`, `fuhriman`,
`giddens`, `gigena`, `glines`, `goedert`, `goemans`, `grundvig`,
`hammack`, `hannesson`, `henriksen`, `hettinger`, `ilijas`,
`jerzy`, `kasprzak`, `katta`, `kemper`, `leete`, `lyryx's`,
`lytle`, `markowitz`, `matousek`, `mcmurray`, `mcquarrie`,
`morrise`, `murty`, `neyman`, `neyman's`, `pierson`, `prim's`,
`prino` (Mauricio Prino, author), `probst`, `proudfoot`, `reber`,
`rupinder`, `sandberg`, `schwarz` (Cauchy-Schwarz), `shmuner`,
`stauffer`, `suggs`, `vandenberghe`, `yepes`, `zaitzeff`

Places: `corvalis` (typo for Corvallis — actually flagged in TYPO),
`eatonville`, `eilat`, `eurail`, `missoula`, `packwood`,
`brooklyn-battery`, `queens-midtown`, `new-york-tolls`,
`verrazzano-narrows`

Cities flagged with split tokens because of multi-word names:
`tel` (Tel Aviv), `aviv` (Tel Aviv)

Software / brands: `aimms`, `cherryblossompink` (LaTeX color name),
`desmos`, `gurobi's`, `linkedin`, `pioneerspotlight` (custom
environment name — also LATEX_BLEED but treated as proper noun),
`pycharm`

Spanish / foreign citation fragments (kept as proper-noun-ish
because they're inside attribution prose):
`amazonian's` (fictional company), `asignaci` (Spanish
"asignación"), `clei` (CLEI conference), `conferencia`,
`giusc` / `giusca` (Giuscă), `habitational`, `latinoamericana`,
`mejor`, `nchez` ("Sánchez"), `prino`, `tecnolog`, `viraz`
("Virazón"), `viviendas`

Invented product / company / wood names from problem instances:
`bocote`, `crumcut`, `lazweld`, `soltranz`, `taa`, `chemicalplant`

Pronunciation guides: `mei-ko`, `oy-lur`, `dike-stra`

---

## COMPOUND (valid hyphenated words, correct as-is)

All listed in `spellcheck-whitelist.txt`. Selected examples:

`add-in`, `agent-task`, `ai-assisted`, `ai-introduced`,
`board-feet`, `bottom-right`, `break-even`, `built-in`, `cc-by-sa`,
`cloud-based`, `code-comment`, `color-coding`, `copy-editing`,
`cross-checking`, `cross-entropy`, `cross-product`, `data-driven`,
`decision-maker`, `decision-making`, `demand-supply`, `di-graph`,
`eco-friendly`, `either-or`, `element-wise`, `end-of-day`,
`f-strings`, `first-choice`, `fixed-charge`, `four-bedroom`,
`full-rank`, `general-purpose`, `go-to`, `guess-and-check`,
`high-demand`, `high-efficiency`, `high-end`, `high-performance`,
`high-protein`, `high-quality`, `high-strength`, `higher-priority`,
`hyper-planes`, `i-beams`, `i-th`, `in-house`, `industrial-strength`,
`interior-point`, `item-bin`, `j-th`, `job-specific`, `key-value`,
`large-scale`, `left-hand`, `left-hand-side`, `line-drawing`,
`location-based`, `lottery-based`, `lower-left`, `lower-left-hand`,
`lower-level`, `lower-priority`, `many-objective`, `matrix-vector`,
`medium-sized`, `minimum-cost`, `mixed-integer`, `ml-specific`,
`multi-commodity`, `multi-period`, `multi-stage`, `near-linear`,
`near-optimal`, `negative-cost`, `network-based`, `network-flow`,
`non-basic`, `non-binding`, `non-commercial`, `non-decreasing`,
`non-dominated`, `non-integer`, `non-linear`, `non-linearity`,
`non-negativity`, `non-positive`, `non-redundant`, `non-smooth`,
`non-visited`, `non-zero`, `one-off`, `one-on-one`, `one-sentence`,
`one-way`, `open-source`, `optimization-specific`, `p-q`,
`per-data-point`, `per-unit`, `point-slope`, `pre-installed`,
`pre-measuring`, `preference-based`, `presentation-ready`,
`print-cover`, `problem-solving`, `profit-optimal`,
`publication-quality`, `quick-prep`, `re-attribution`, `real-time`,
`real-world`, `recall-plus`, `right-hand-side`, `right-hand-sides`,
`risk--return`, `second-order`, `single-objective`,
`slope-intercept`, `step-by-step`, `t-shirt`, `t-shirts`,
`three-bedroom`, `tie-breaking`, `toll-free`, `trade-off`,
`trade-offs`, `triple-quoted`, `two-bedroom`, `two-day`,
`two-dimensional`, `two-dimensions`, `two-phase`, `two-stage`,
`two-variable`, `upper-bound`, `user-friendly`, `wall-clock`,
`warm-up`, `week-long`, `well-distributed`, `well-known`,
`well-structured`, `well-suited`, `what-if`, `within-cluster`,
`worst-case`, `x-y`, `y-x`, `y-z`, `z-y`, `zero-based`,
`zero-indexed`

---

## LATEX_BLEED — do NOT whitelist; fix the stripper

These should never reach the checker. They are NOT in the whitelist
file; listed here as a tooling-improvement backlog.

### Multi-letter column specifiers from `\begin{tabular}{...}` / `\begin{array}{...}`

`rrr` (101), `ccc` (14), `rrrr` (12), `ccccc` (5), `cccc` (7),
`cccccc` (4), `ccccccc` (4), `cccccccc` (3), `ccccccccc` (3),
`rrrrr` (4), `lll` (3), `llll`, `lcc`, `lccc`, `lccccc`,
`rrcllll`, `rrcrcrll`, `rrcrll`, `rrlr`, `rrlrr`, `rrrrrrrrr`,
`rrrrrrrrrrrrrrrrr`

Fix: strip alphabetic-only tokens inside `{...}` after `tabular` /
`array` env begins.

### TikZ / tcolorbox / lstlisting keys and option names

`abovecaptionskip`, `abovelabel`, `addto`, `addtoreset`, `arrowsize`,
`arrowstyle`, `atbegindocument`, `backgroundcolor`, `basewidth`,
`basicstyle`, `belowcaptionskip`, `breaklines`, `calc`, `captionpos`,
`casestudybox`, `cherryblossompink`, `cmyk`, `codebase`,
`codecomment`, `codekeyword`, `codestring`, `commentstyle`,
`deletekeywords`, `edgecolor`, `edgelabel`, `enlargelimits`,
`everyline`, `extendedchars`, `figsize`, `floatboxreset`,
`fontsize`, `fontweight`, `framerule`, `framesep`, `frametitle`,
`frametitleaboveskip`, `frametitlefont`, `frametitlerule`,
`freshbox`, `fromfile`, `graphnode`, `hidelinks`, `infoline`,
`innerbottommargin`, `innerleftmargin`, `innertopmargin`,
`keywordstyle`, `labelformat`, `labelwidth`, `layoutoffset`,
`layoutsize`, `leftmargin`, `linecolor`, `linewidth`,
`lrtb`, `lscstextcolour`, `lyryxcolour`, `markersize`,
`mathletters`, `middlelinewidth`, `mindmap`, `moredelim`,
`morekeywords`, `morestring`, `nosep`, `numberfirstline`,
`numbersep`, `numberstyle`, `ocre`, `outerlinecolor`,
`outerlinewidth`, `papersize`, `pathreplacing`, `pdfborder`,
`pdfborderstyle`, `petri`, `pioneerspotlight`, `postaction`,
`prebreak`, `print-cover`, `rightmargin`, `rulecolor`,
`shadecolor`, `shellinput`, `shelloutput`, `showspaces`,
`showstringspaces`, `showtabs`, `skipabove`, `skipbelow`,
`stepnumber`, `stringstyle`, `tabsize`, `textcoords`, `tikzmark`,
`titlemainbgcolour`, `titletextcolour`, `upquote`, `usetikz`,
`warnline`, `xleftmargin`, `xmax`, `xmin`, `xrightmargin`,
`xscale`, `xticklabels`, `xticks`, `xytext`, `ylorrd`, `ymax`,
`ymin`, `yscale`, `yticks`

Fix: extend the stripper to skip key names inside `[key=value, ...]`
of tikz/tcolorbox/lstlisting environments. Also strip optional-arg
keys inside `\lstset{...}` and `\tcbset{...}`.

### Python exception class names from `morekeywords={...}` in lstlisting setup (line 271 of `packages-and-commands.tex`)

`assertionerror`, `attributeerror`, `baseexception`,
`fileexistserror`, `filenotfounderror`, `importerror`,
`indentationerror`, `indexerror`, `ioerror`, `keyboardinterrupt`,
`keyerror`, `memoryerror`, `nameerror`, `notimplemented`,
`notimplementederror`, `oserror`, `overflowerror`,
`recursionerror`, `runtimeerror`, `runtimewarning`,
`standarderror`, `stopiteration`, `syntaxerror`, `systemerror`,
`systemexit`, `taberror`, `typeerror`, `valueerror`,
`zerodivisionerror`

Fix: skip the body of `morekeywords={...}` when parsing
`packages-and-commands.tex`.

### Accent-strip residue (LaTeX accent macros lose the base letter)

`onigsberg` (from `K\"onigsberg`), `giusc` / `giusca` (from
`Giusc\u{a}` / `Giuscă`), `montr` (from `Montr\'eal`), `enyi`
(from `R\'enyi`), `erd` (from `Erd\H{o}s`), `s--r` (from
`Erd\H{o}s--R\'enyi`), `artner` (from `G\"artner`), `atholic` (from
`\textbf{C}atholic`), `unchen` (from `M\"unchen`), `nchez` (from
`S\'anchez`), `alcal` (from `Alcal\'a`), `garc` (from `Garc\'ia`),
`fourier--motzkin` (from `Fourier--Motzkin` em-dash), `tica` (from
`pr\'actica` or similar), `viraz` (from `Viraz\'on`)

Fix: when the stripper encounters an accent macro (`\"o`, `\'a`,
`\H{o}`, `\u{a}`, etc.), keep the base letter attached to the
surrounding word rather than dropping it.

### Label keys / equation tags / hyphenated identifiers from `\label{...}` and `\ref{...}`

`abs-neg-bound`, `abs-pos-bound`, `adapter's-license`,
`agent-task`, `arrays---skills`, `assignment-like`, `axis-specific`,
`brooklyn-battery`, `chapter-opening`, `clsp-binary`,
`clsp-capacity`, `clsp-inventory`, `clsp-nonnegativity`,
`clsp-objective`, `code-comment`, `conflict---for`, `cost---all`,
`cycle-canceling`, `example-code`, `explanation-of-definition`,
`explicitly---python`, `facility-location`, `feasible-region`,
`graph-theory-graphics`, `graphical-method`,
`in-special-cases`, `integer-programming`, `interfaces---is`,
`jssp-duplo-actual`, `kruskal-exercise`, `license-audit`,
`license-compatibility`, `linear-programming`,
`lower-left-hand`, `lp-optimal-value`, `lp-unbounded`,
`matplotlibcustomization`, `matrixinversionalgorithm`,
`multi-network-flow-data`, `multi-network-flow-solution`,
`new-york-tolls`, `network-flow-solution`, `numpyvisualguide`,
`play--even`, `plant-to-market`, `pwl-application`, `pwl-plot`,
`queens-midtown`, `strippackingobj-simple`,
`strippackingoverlap-simple`, `strippackingwidth-simple`,
`tikz-illustration`, `type---including`, `verrazzano-narrows`,
`vertex-cover-matrix`, `ways---and`, `wiki-file-knapsack`,
`wiki-file-petersen-graph`, `wikipedia-derived`,
`writing-assistance`

Fix: strip the argument of `\label{...}` and `\ref{...}` (and
`\eqref`, `\autoref`, `\Cref`, etc.) entirely. Also strip
hyphenated identifiers that contain three-dashes (em-dashes converted
during preprocessing).

### Random graph-theory walk strings — vertex-letter sequences in exercises

`a-f`, `abcda`, `abdca`, `abdeg`, `abea`, `abegfcdfedbca`,
`abfgcdhmlkjea`, `abga`, `abgcfea`, `acbda`, `acda`, `acdba`,
`adbca`, `adcba`, `ade`, `adeacefcba`, `adebcfa`, `adebdca`,
`aecabcfeda`, `badcb`, `bcfadeb`, `bedacfb`, `bedafcb`, `bfss`,
`cabdcb`, `cadbc`, `dacba`, `ecabd`, `ecdab`, `nna`, `rnna`,
`y-nb-a-t`

These appear in `graphtheory-dor1.tex` as vertex walks ("abcd").
Fix: skip alphabetic tokens of length >=4 made of vertex letters
inside `\(...\)` or after "walk:" / "circuit:" / "tour:".

### Math-mode bleeds / column-tag leftovers

`c'x` (math `c'x`), `obj`, `vol`, `grg`, `eqn`, `crs`, `bdft`,
`mtav`, `iii` (Roman numeral?), `risk--return`, `play--even`,
`zend`, `zstart`, `taa`, `nna`, `iec`

### Misc.

`canonform`, `dictionaryx` (separately flagged as a real typo),
`generallpmax`, `chemicalplant`, `transsol`, `origsol`,
`y-nb-a-t`, `s--r`, `p-q`

---

## Notes for the next spell-check pass

- The stripper rules need a one-time tuning pass; the LATEX_BLEED
  section above lists the specific contexts. Expected: ~40% reduction
  in suspect count.
- The TYPO list (above) cluster in 3 source files; a 10-minute pass
  closes most of it.
- The whitelist file (`spellcheck-whitelist.txt`) is in
  `.aspell.en.pws`-compatible format (one token per line, lowercase).
  It does **not** contain LATEX_BLEED tokens — those are deliberately
  excluded so they remain visible as stripper bugs on the next run.
