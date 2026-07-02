# Includegraphics Alt-Text Merger Log

Macro choice: native `alt=` key on `\includegraphics` (graphicx 2017+).

## Summary

- Files in scope: 13
- Files modified: 13
- Edits applied: 65
- Edits skipped: 0

## Per-file edits

### `Intro-Math-Programming/baseText/book/appendices/equations-and-lines/equations-and-lines-new.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 89 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-02` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-02}` | `\includegraphics[width=\textwidth, alt={Cartesian xy-plane with the line y = 3x + 2 drawn in blue, passing through the plotted points (-1,-1), (0,2), and (1,5).}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-02}` | OK |
| 135 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-03` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-03}` | `\includegraphics[width=\textwidth, alt={Cartesian xy-plane showing the line 2x + y = 4 drawn in blue through the plotted points (-1,6), (0,4), and (1,2).}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-03}` | OK |
| 180 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-03(1)` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-03(1)}` | `\includegraphics[width=\textwidth, alt={Cartesian xy-plane showing the line 2x - 3y = 6 drawn in blue, with x-intercept (3,0) and y-intercept (0,-2) marked as plotted points.}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-03(1)}` | OK |
| 223 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-04` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-04}` | `\includegraphics[width=\textwidth, alt={Cartesian xy-plane showing the line given parametrically by x = 3 + 2t, y = 1 + t, with the points (3,1), (5,2), and (7,3) plotted on the line.}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-04}` | OK |
| 277 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-05` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-05}` | `\includegraphics[width=\textwidth, alt={Two side-by-side coordinate planes: the left shows the horizontal line y = 3 through (0,3); the right shows the vertical line x = -2 through (-2,0).}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-05}` | OK |
| 332 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-07` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-07}` | `\includegraphics[width=\textwidth, alt={Cartesian xy-plane with a blue line through the points (-2,3) and (4,-1); a green right triangle illustrates rise -4 and run 6, indicating slope -2/3.}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-07}` | OK |
| 387 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-09(1)` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-09(1)}` | `\includegraphics[width=\textwidth, alt={Cartesian xy-plane showing a blue line through (1,2) with slope -3/4; a green right triangle marks rise -3 down and run 4 right to the second point (5,-1).}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-09(1)}` | OK |
| 555 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-24` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-24}` | `\includegraphics[width=\textwidth, alt={Quantity-versus-price plot with a blue supply line y = 3.5x - 14 and a red demand line y = -2.5x + 34 intersecting at the equilibrium point (8,14), with dashed guide lines to axes labelled 8 (Quantity) and 14 (Price).}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-24}` | OK |
| 601 | `applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-25` | `\includegraphics[width=\textwidth]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-25}` | `\includegraphics[width=\textwidth, alt={Quantity-versus-cost/revenue plot with a blue revenue line R = 5x and a red cost line C = 3x + 12 meeting at the break-even point (6,30), with dashed guides to axes labelled 6 (Quantity) and 30 (Cost/Revenue).}]{applied-finite-mathematics/images/2024_12_11_69ed6e5e21c55666356eg-25}` | OK |

### `Intro-Math-Programming/baseText/book/appendices/linear-algebra/LyryxOpenTexts.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 11 | `figures/LyryxLogo.eps` | `\includegraphics[width=.4\textwidth]{figures/LyryxLogo.eps}` | `\includegraphics[width=.4\textwidth, alt={Lyryx Learning logo: stylized wordmark 'Lyryx' in dark grey with a small accent above the 'y'.}]{figures/LyryxLogo.eps}` | OK |
| 25 | `figures/component-book.eps` | `\includegraphics[scale=0.15]{figures/component-book.eps}` | `\includegraphics[scale=0.15, alt={Lyryx 'Open Text' component icon: a stylized open book.}]{figures/component-book.eps}` | OK |
| 39 | `figures/component-assess.eps` | `\includegraphics[scale=0.15]{figures/component-assess.eps}` | `\includegraphics[scale=0.15, alt={Lyryx 'Online Assessment' component icon: a checklist or graded form glyph.}]{figures/component-assess.eps}` | OK |
| 69 | `figures/component-support.eps` | `\includegraphics[scale=0.15]{figures/component-support.eps}` | `\includegraphics[scale=0.15, alt={Lyryx 'Support' component icon: a headset glyph representing customer support.}]{figures/component-support.eps}` | OK |
| 83 | `figures/component-supplement.eps` | `\includegraphics[scale=0.15]{figures/component-supplement.eps}` | `\includegraphics[scale=0.15, alt={Lyryx 'Instructor Supplements' component icon: stacked documents or resource pages glyph.}]{figures/component-supplement.eps}` | OK |

### `Intro-Math-Programming/baseText/book/appendices/linear-algebra/license.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 5 | `figures/LyryxLogo.eps` | `\includegraphics[width=.4\textwidth]{figures/LyryxLogo.eps}` | `\includegraphics[width=.4\textwidth, alt={Lyryx Learning logo: the word 'Lyryx' in a stylized sans-serif wordmark accompanied by the tagline 'Learning'.}]{figures/LyryxLogo.eps}` | OK |
| 81 | `figures/cc-by.eps` | `\includegraphics[scale=.8]{figures/cc-by.eps}` | `\includegraphics[scale=.8, alt={Creative Commons BY license badge: a circle containing the letters 'CC' on the left, paired with a second circle containing a stick-figure person silhouette indicating the attribution (BY) condition.}]{figures/cc-by.eps}` | OK |

### `Intro-Math-Programming/baseText/book/frontmatter/LP-front-matter.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 14 | `LP-feasible-region` | `\includegraphics[scale = 0.3]{LP-feasible-region}` | `\includegraphics[scale = 0.3, alt={Cover-page figure: a 2D plot with x1 and x2 axes showing the feasible region of a linear program as a single shaded convex polygon bounded by linear constraint lines.}]{LP-feasible-region}` | OK |
| 15 | `MIP-feasible-region` | `\includegraphics[scale = 0.3]{MIP-feasible-region}` | `\includegraphics[scale = 0.3, alt={Cover-page figure: a 2D plot with x1 and x2 axes showing the feasible region of a mixed-integer program as vertical line segments inside a convex polygon, indicating one variable is continuous and the other is integer.}]{MIP-feasible-region}` | OK |
| 16 | `IP-feasible-region` | `\includegraphics[scale = 0.3]{IP-feasible-region}` | `\includegraphics[scale = 0.3, alt={Cover-page figure: a 2D plot with x1 and x2 axes showing the feasible region of an integer program as a finite lattice of dots at integer coordinates inside the LP relaxation polygon.}]{IP-feasible-region}` | OK |
| 24 | `open-optimization-common/logos/logo-open-optimization-oer-wide` | `\includegraphics[width=\linewidth]{open-optimization-common/logos/logo-open-optimization-oer-wide}` | `\includegraphics[width=\linewidth, alt={Open Optimization OER project wide-format logo banner displayed across the cover page.}]{open-optimization-common/logos/logo-open-optimization-oer-wide}` | OK |

### `Intro-Math-Programming/baseText/book/frontmatter/contributors-foundations.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 107 | `figures/cc-by.eps` | `\includegraphics[scale=.8]{figures/cc-by.eps}` | `\includegraphics[scale=.8, alt={Creative Commons BY license badge: a circle containing the letters 'CC' on the left, paired with a second circle containing a stick-figure person silhouette indicating the attribution (BY) condition.}]{figures/cc-by.eps}` | OK |

### `Intro-Math-Programming/baseText/book/part1-linear-programming/ch01-introduction/mathematicalProgramming.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 137 | `Figures/tree-diagram-types` | `\includegraphics[width=\linewidth]{Figures/tree-diagram-types}` | `\includegraphics[width=\linewidth, alt={Tree diagram classifying optimization models. The root 'Optimization Models' splits into Linear and Nonlinear branches, which each split by variable type (continuous vs integer) into four leaves: LP (polynomial time), MILP (NP-hard), NLP (varies), and MINLP (NP-hard).}]{Figures/tree-diagram-types}` | OK |

### `Intro-Math-Programming/baseText/book/part1-linear-programming/ch02-modeling/Section2.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 333 | `images/lemon` | `\includegraphics[width=0.8\linewidth]{images/lemon}` | `\includegraphics[width=0.8\linewidth, alt={Graphical solution of the lemonade LP: shaded feasible polygon in the first quadrant bounded by x+3y<=6 and 2x+y<=4, with parallel dashed objective contours 3x+2y=z at z=0, 4, and 6.8. The z=6.8 contour just touches the region at the optimum vertex (1.2, 1.6).}]{images/lemon}` | OK |

### `Intro-Math-Programming/baseText/book/part1-linear-programming/ch03-software/software-excel.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 64 | `Figures/excel-solver-layout` | `\includegraphics[width = 0.95\textwidth]{Figures/excel-solver-layout}` | `\includegraphics[width = 0.95\textwidth, alt={Excel spreadsheet showing the recommended Solver layout: data cells (coefficients, right-hand sides) shaded light blue, decision-variable cells shaded yellow, and formula cells (objective and constraint sums) shaded light green.}]{Figures/excel-solver-layout}` | OK |
| 78 | `Figures/excel-solver-button` | `\includegraphics[width = 0.95\textwidth]{Figures/excel-solver-button}` | `\includegraphics[width = 0.95\textwidth, alt={Screenshot of Excel's Data ribbon with the Solver button highlighted on the right side of the toolbar, showing where to click to launch the Solver Parameters dialog after enabling the add-in.}]{Figures/excel-solver-button}` | OK |
| 92 | `Figures/excel-solver-solve` | `\includegraphics[scale = 0.25]{Figures/excel-solver-solve}` | `\includegraphics[scale = 0.25, alt={Solver Parameters dialog with fields filled in: Set Objective cell, Max/Min selector, By Changing Variable Cells range, Subject to the Constraints list, and the Make Unconstrained Variables Non-Negative checkbox enabled.}]{Figures/excel-solver-solve}` | OK |
| 104 | `Figures/excel-solver-method` | `\includegraphics[scale = 0.3]{Figures/excel-solver-method}` | `\includegraphics[scale = 0.3, alt={Close-up of the Select a Solving Method dropdown in the Solver Parameters dialog, showing the three options GRG Nonlinear, Simplex LP, and Evolutionary that the user picks based on whether the problem is smooth nonlinear, linear, or non-smooth/integer.}]{Figures/excel-solver-method}` | OK |
| 112 | `Figures/excel-solver-select` | `\includegraphics[scale = 0.2]{Figures/excel-solver-select}` | `\includegraphics[scale = 0.2, alt={Solver Results dialog that appears after solving, offering Keep Solver Solution or Restore Original Values, with a Reports list (Answer, Sensitivity, Limits) on the right that the user can select to generate diagnostic reports.}]{Figures/excel-solver-select}` | OK |
| 120 | `Figures/excel-solver-answer-report` | `\includegraphics[scale = 0.3]{Figures/excel-solver-answer-report}` | `\includegraphics[scale = 0.3, alt={Excel Answer Report worksheet generated by Solver, listing the objective cell's original and final values, a table of variable cells with their final values, and a constraints table showing each constraint's cell value, formula, status (Binding or Not Binding), and slack.}]{Figures/excel-solver-answer-report}` | OK |
| 124 | `Figures/excel-solver-sensitivity` | `\includegraphics[scale = 0.3]{Figures/excel-solver-sensitivity}` | `\includegraphics[scale = 0.3, alt={Excel Sensitivity Report worksheet with a Variable Cells table (final value, reduced cost, objective coefficient, allowable increase/decrease) and a Constraints table (shadow price, right-hand side, allowable increase/decrease) for each decision variable and constraint.}]{Figures/excel-solver-sensitivity}` | OK |
| 128 | `Figures/excel-solver-solution` | `\includegraphics[scale = 0.3]{Figures/excel-solver-solution}` | `\includegraphics[scale = 0.3, alt={Excel spreadsheet after Solver has run, with the yellow variable cells now populated with optimal decision-variable values and the green formula cells displaying the resulting objective value and constraint sums, illustrating the final optimized layout.}]{Figures/excel-solver-solution}` | OK |

### `Intro-Math-Programming/baseText/book/part1-linear-programming/ch06-simplex/simplex-basis-driven.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 671 | `foundationsAppliedMathematicsLabs/Volume2/Simplex/figures/feasiblePolytope.pdf` | `\includegraphics[width=\linewidth]{foundationsAppliedMathematicsLabs/Volume2/Simplex/figures/feasiblePolytope.pdf}` | `\includegraphics[width=\linewidth, alt={A 2D feasible polytope shaded as a convex polygon with several vertices marked; illustrates that the simplex method walks along edges from vertex to vertex of such a region in search of an optimum.}]{foundationsAppliedMathematicsLabs/Volume2/Simplex/figures/feasiblePolytope.pdf}` | OK |
| 740 | `Figures/lp-feasible-desmos` | `\includegraphics[scale = 0.3]{Figures/lp-feasible-desmos}` | `\includegraphics[scale = 0.3, alt={Desmos plot of the feasible region for max 2x+3y subject to x+y<=9, 2x+y<=16, x+2y<=14, x,y>=0: a shaded convex polygon in the first quadrant bounded by the three constraint lines.}]{Figures/lp-feasible-desmos}` | OK |
| 1567 | `Figures/simplex-all-tableaus` | `\includegraphics[scale = 0.5]{Figures/simplex-all-tableaus}` | `\includegraphics[scale = 0.5, alt={The feasible region polygon with each vertex annotated by its corresponding simplex dictionary; arrows along the edges show the pivot transitions between adjacent basic feasible solutions.}]{Figures/simplex-all-tableaus}` | OK |
| 1677 | `Figures/big-M` | `\includegraphics[scale = 1]{Figures/big-M}` | `\includegraphics[scale = 1, alt={Plot of the feasible region for the Big-M example with constraints 2x+y>=5, 2x+y<=16, x+2y<=14, x,y>=0; the shaded region lies away from the origin, showing that the origin is not feasible as a starting basis.}]{Figures/big-M}` | OK |
| 2674 | `Figures/unbounded-desmos-simplex` | `\includegraphics[scale = 0.5]{Figures/unbounded-desmos-simplex}` | `\includegraphics[scale = 0.5, alt={Desmos plot of the feasible region defined by x1-x2<=1, 2x1-x2<=3, x1,x2>=0: an unbounded region extending to the right in the first quadrant, illustrating the unbounded LP example.}]{Figures/unbounded-desmos-simplex}` | OK |
| 3019 | `Figures/desmos-graph-slacks` | `\includegraphics[width=0.6\textwidth]{Figures/desmos-graph-slacks}` | `\includegraphics[width=0.6\textwidth, alt={Desmos graph of a 2-variable LP feasible region with vertices labeled A, B, C, D used to identify basic and nonbasic variables and to trace pivot moves between adjacent basic feasible solutions.}]{Figures/desmos-graph-slacks}` | OK |

### `Intro-Math-Programming/baseText/book/part1-linear-programming/ch07-sensitivity/sensitivity-LP.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 736 | `Figures/sensitivity-changing-b` | `\includegraphics[scale = 0.17]{Figures/sensitivity-changing-b}` | `\includegraphics[scale = 0.17, alt={Two-variable feasible-region plot showing how the optimal vertex shifts as the right-hand side b_1 of the first constraint takes the values 7, 9, and 10. The constraint line slides parallel to itself, illustrating the range 7 <= b_1 <= 10 over which the current optimal basis remains feasible.}]{Figures/sensitivity-changing-b}` | OK |
| 824 | `Figures/sensitivity-objective` | `\includegraphics[scale = 0.3]{Figures/sensitivity-objective}` | `\includegraphics[scale = 0.3, alt={Feasible region in the x-y plane with several level curves of the objective z = c_x x + 3y drawn for different slopes. The figure shows that as long as c_x lies in the interval [1.5, 3], the level curves tilt within the cone defined by the active constraints at the current optimum, so the optimal vertex (and basis) does not change.}]{Figures/sensitivity-objective}` | OK |
| 832 | `Figures/excel-sensitivity` | `\includegraphics[scale =0.3]{Figures/excel-sensitivity}` | `\includegraphics[scale =0.3, alt={Screenshot of Excel's Solver Results dialog with the option to generate a Sensitivity report selected, illustrating how to request post-optimal sensitivity output after solving a linear program.}]{Figures/excel-sensitivity}` | OK |
| 843 | `Figures/excel-setup` | `\includegraphics[scale = 0.3]{Figures/excel-setup}` | `\includegraphics[scale = 0.3, alt={Screenshot of an Excel worksheet set up for a linear program: decision-variable cells, an objective-function cell using SUMPRODUCT, and constraint left-hand-side formulas alongside their right-hand-side values, ready for Solver.}]{Figures/excel-setup}` | OK |
| 844 | `Figures/excel-sensitivity-report` | `\includegraphics[scale = 0.3]{Figures/excel-sensitivity-report}` | `\includegraphics[scale = 0.3, alt={Screenshot of an Excel Solver sensitivity report. The Variable Cells table lists each decision variable's final value, reduced cost, objective coefficient, and allowable increase/decrease; the Constraints table lists each constraint's final value, shadow price, RHS, and allowable increase/decrease, identifying binding versus non-binding constraints.}]{Figures/excel-sensitivity-report}` | OK |

### `Intro-Math-Programming/baseText/book/part1-linear-programming/ch09-multi-objective/multi-objective-optimization_updated.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 36 | `Figures/risk-plot.pdf` | `\includegraphics[width=0.65\textwidth]{Figures/risk-plot.pdf}` | `\includegraphics[width=0.65\textwidth, alt={Plot of the inventory risk function r(s) = c_r(1 - exp(-beta*s)) versus inventory level s: a smooth concave curve rising sharply from zero and saturating toward the maximum risk cost c_r, illustrating that marginal risk diminishes as inventory grows.}]{Figures/risk-plot.pdf}` | OK |
| 52 | `Figures/pareto-curve.pdf` | `\includegraphics[width=0.7\textwidth]{Figures/pareto-curve.pdf}` | `\includegraphics[width=0.7\textwidth, alt={Pareto frontier curve for the multi-objective inventory problem, plotting total cost (horizontal axis) against maximum inventory risk (vertical axis). The downward-sloping non-dominated trade-off curve shows that lower risk can only be achieved by accepting higher cost.}]{Figures/pareto-curve.pdf}` | OK |

### `Intro-Math-Programming/baseText/book/part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 15 | `graph-theory-graphics/GraphPicture.png` | `\includegraphics{graph-theory-graphics/GraphPicture.png}` | `\includegraphics[alt={Aerial photograph of a Missoula, Montana housing development showing several blocks of houses connected by a network of streets. The image motivates the question of whether a lawn inspector can walk every street without backtracking.}]{graph-theory-graphics/GraphPicture.png}` | OK |
| 23 | `graph-theory-graphics/GraphPictureDot.png` | `\includegraphics{graph-theory-graphics/GraphPictureDot.png}` | `\includegraphics[alt={Side-by-side: the housing aerial photo is overlaid with red dots at intersections and red lines along streets; next to it, the same network is redrawn as a graph of labeled vertices joined by edges, showing the reduction of a street map to a graph.}]{graph-theory-graphics/GraphPictureDot.png}` | OK |
| 61 | `Figures/Konigsberg_bridges` | `\includegraphics[scale = 0.7]{Figures/Konigsberg_bridges}` | `\includegraphics[scale = 0.7, alt={Historical map of the Prussian city of Koenigsberg with the river highlighted in blue and the seven bridges that cross its forks marked in green, depicting the geographic setting of the famous Koenigsberg bridge problem that launched graph theory.}]{Figures/Konigsberg_bridges}` | OK |
| 700 | `graph-theory-graphics/dijkstra0.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra0.png}` | `\includegraphics[scale = 0.5, alt={Weighted undirected graph for the Dijkstra example. Seven vertices a-g are joined by edges with weights a-b=2, a-c=6, c-d=8, b-d=5, d-e=10, d-f=15, e-f=6, e-g=2, f-g=6. No vertex is yet marked visited.}]{graph-theory-graphics/dijkstra0.png}` | OK |
| 705 | `graph-theory-graphics/dijkstra1.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra1.png}` | `\includegraphics[scale = 0.5, alt={Dijkstra step 1: the start vertex a is highlighted in red and labeled with tentative distance 0. Its neighbors b and c receive tentative labels 2 and 6 from a; all other vertices remain labeled infinity.}]{graph-theory-graphics/dijkstra1.png}` | OK |
| 715 | `graph-theory-graphics/dijkstra2.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra2.png}` | `\includegraphics[scale = 0.5, alt={Dijkstra step 2: vertex b is now marked as visited with permanent distance 2, and the edge a-b is highlighted in red. Vertex d is updated through b to tentative distance 7. Labels at c, e, f, and g are unchanged.}]{graph-theory-graphics/dijkstra2.png}` | OK |
| 725 | `graph-theory-graphics/dijkstra3.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra3.png}` | `\includegraphics[scale = 0.5, alt={Dijkstra step 3: vertex c is marked visited with distance 6 and edge a-c is highlighted. Reaching d through c would give 6+8=14, which is worse than the current label 7, so d's tentative distance is unchanged.}]{graph-theory-graphics/dijkstra3.png}` | OK |
| 735 | `graph-theory-graphics/dijkstra4.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra4.png}` | `\includegraphics[scale = 0.5, alt={Dijkstra step 4: vertex d is marked visited with distance 7, and the path a-b-d is highlighted in red. Neighbors of d are updated: e to 17 (via 7+10) and f to 22 (via 7+15); g remains infinity.}]{graph-theory-graphics/dijkstra4.png}` | OK |
| 745 | `graph-theory-graphics/dijkstra5.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra5.png}` | `\includegraphics[scale = 0.5, alt={Dijkstra step 5: vertex e is marked visited with distance 17 and the edge d-e is added to the highlighted path. From e, vertex g is updated to 17+2=19, improving on its previous infinity label.}]{graph-theory-graphics/dijkstra5.png}` | OK |
| 755 | `graph-theory-graphics/dijkstra6.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra6.png}` | `\includegraphics[scale = 0.5, alt={Dijkstra step 6: vertex g is marked visited with distance 19, and the edge e-g is highlighted, completing a tentative shortest path a-b-d-e-g. The remaining unvisited vertex f keeps tentative distance 22.}]{graph-theory-graphics/dijkstra6.png}` | OK |
| 765 | `graph-theory-graphics/dijkstra7.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra7.png}` | `\includegraphics[scale = 0.5, alt={Dijkstra step 7: vertex f is marked visited with distance 22 and the edge d-f is highlighted along with the previously found path. All seven vertices are now visited so the algorithm terminates.}]{graph-theory-graphics/dijkstra7.png}` | OK |
| 778 | `graph-theory-graphics/dijkstra8.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra8.png}` | `\includegraphics[scale = 0.5, alt={Final state of the Dijkstra example: every vertex carries its shortest-path distance from a (a=0, b=2, c=6, d=7, e=17, g=19, f=22), and the shortest-path tree found by the algorithm is highlighted in red.}]{graph-theory-graphics/dijkstra8.png}` | OK |
| 797 | `graph-theory-graphics/dijkstra-soln.png` | `\includegraphics[scale = 0.5]{graph-theory-graphics/dijkstra-soln.png}` | `\includegraphics[scale = 0.5, alt={The same seven-vertex weighted graph with the shortest path from a to g highlighted in red: a-b-d-e-g, traversing edges of weight 2, 5, 10, and 2 for a total length of 19.}]{graph-theory-graphics/dijkstra-soln.png}` | OK |
| 1801 | `graph-theory-graphics/GraphExercise1.png` | `\includegraphics{graph-theory-graphics/GraphExercise1.png}` | `\includegraphics[alt={Exercise diagram: a stylized neighborhood shown as six rectangular blocks in two rows of three. Black squares on the inside borders of each block mark houses; students draw edges along the streets the carrier walks to reach every house.}]{graph-theory-graphics/GraphExercise1.png}` | OK |
| 1805 | `graph-theory-graphics/GraphExercise2.png` | `\includegraphics{graph-theory-graphics/GraphExercise2.png}` | `\includegraphics[alt={Exercise map of a fictional town: a teal river divides the area into several land masses, with seven black bars marking bridges. Students convert the map to a graph to test for an Eulerian path crossing each bridge once.}]{graph-theory-graphics/GraphExercise2.png}` | OK |
| 2147 | `graph-theory-graphics/GraphExercise15.png` | `\includegraphics{graph-theory-graphics/GraphExercise15.png}` | `\includegraphics[alt={Exercise map of an amusement park's walkways drawn as a planar graph: curved edges partition the irregular region into roughly a dozen face-like sections that the maintenance crew must patrol via an Euler circuit.}]{graph-theory-graphics/GraphExercise15.png}` | OK |

### `Intro-Math-Programming/baseText/book/preamble/preamble-optimization.tex`

| line | image | before | after | status |
|---:|---|---|---|---|
| 60 | `julia-logo` | `\includegraphics[scale = 0.07]{julia-logo}` | `\includegraphics[scale = 0.07, alt={Julia programming language logo: three colored dots (red, green, purple) arranged in a triangle.}]{julia-logo}` | OK |
| 61 | `jupyter-logo` | `\includegraphics[scale = 0.09]{jupyter-logo}` | `\includegraphics[scale = 0.09, alt={Jupyter project logo: stylized orange planet circled by three gray orbital rings.}]{jupyter-logo}` | OK |
| 62 | `jump-logo` | `\includegraphics[scale = 0.08]{jump-logo}` | `\includegraphics[scale = 0.08, alt={JuMP modeling language logo: the letters 'JuMP' rendered in a bold serif typeface.}]{jump-logo}` | OK |
| 63 | `gurobi-logo` | `\includegraphics[scale = 0.06]{gurobi-logo}` | `\includegraphics[scale = 0.06, alt={Gurobi Optimization logo: stylized red sun-rays emblem next to the Gurobi wordmark.}]{gurobi-logo}` | OK |
| 64 | `coin-or-logo` | `\includegraphics[scale = 0.2]{coin-or-logo}` | `\includegraphics[scale = 0.2, alt={COIN-OR Foundation logo: blue circular coin emblem alongside the 'COIN-OR' wordmark.}]{coin-or-logo}` | OK |

