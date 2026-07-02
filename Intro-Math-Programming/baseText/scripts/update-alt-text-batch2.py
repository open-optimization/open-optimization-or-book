#!/usr/bin/env python3
"""
update-alt-text-batch2.py
Updates the abstract field in bib files with more generated alt text descriptions.
"""

import re
from pathlib import Path

BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
FIGURES_STATIC_BIB = BASE_DIR / "optimization/figures/figures-static/00_METADATA.bib"

# Alt text mapping: entry_id -> alt text description
ALT_TEXT_MAP = {
    # Batch 3a
    "3DGraphEx15.png": "A 3D bar chart comparing beverage preferences between kids and adults for Coke, Diet Coke, Sprite, and Cherry Coke. Kids prefer regular Coke while adults prefer Diet Coke, with other beverages showing balanced preferences.",

    "3Dplot.png": "A 3D bar chart showing car color frequency distribution with Green being the most popular, followed by Red, Blue, Black, Grey, and White in decreasing order.",

    "BalanceScale1.png": "A balance scale diagram showing three blue rectangular weights positioned on a horizontal beam supported by a triangular fulcrum, with one weight on the left side and two weights on the right.",

    "BalanceScale2.png": "An unbalanced scale diagram tilting heavily to the left, with multiple blue rectangular weights clustered on the left side near the triangular fulcrum and only a small weight on the far right.",

    "GraphExercise1.png": "Six small square grids arranged in two rows of three, each containing different patterns of black dots at various positions, representing a graph theory or combinatorics exercise.",

    "GraphExercise15.png": "An outline map showing a geographic region divided into multiple irregular polygons representing districts or counties, suitable for a graph coloring problem.",

    "GraphExercise2.png": "A stylized map showing islands or landmasses in cyan connected by bridges shown as black rectangular segments, illustrating a Konigsberg-type bridge crossing problem.",

    "GraphPicture.png": "An aerial photograph of a residential neighborhood showing houses arranged in subdivisions with streets forming a network pattern, used to illustrate real-world applications of graph theory.",

    "GraphPictureDot.png": "A side-by-side comparison showing an aerial view of a residential neighborhood with red dots marking intersections, and the corresponding abstract graph representation with labeled nodes.",

    "StripPacking1.png": "A strip packing diagram showing several gray rectangles of varying sizes packed within a vertical strip of width W, with a dotted horizontal line at height H indicating the current maximum height.",

    "barrier-function.png": "A plot of the logarithmic barrier function -t*log(x) for different values of t (0.1 to 5.0). Larger t values produce steeper curves that rise more sharply as x approaches zero.",

    "barrier-functions-added.png": "A plot showing combined barrier functions for x between 1 and 2, with five U-shaped curves for different t values. Each curve has a minimum point marked, with larger t values producing steeper curves.",

    "bnb1-assign4.png": "A branch and bound visualization showing a blue shaded feasible region with integer lattice points as gray dots. Green dashed lines represent constraints, and a red X marks the current LP relaxation solution.",

    "bnb2-assign4.png": "A branch and bound iteration showing a modified blue feasible region after adding a branching constraint, with the red X marking a new optimal solution. The feasible region is narrower than before.",

    "bnb3-assign4.png": "A branch and bound visualization showing two disjoint blue feasible regions after branching, with a red X marking the LP solution and a green star marking the integer feasible solution.",

    "bubble-sort-alg.png": "A step-by-step illustration of the bubble sort algorithm showing seven columns of numbers being sorted. Green boxes highlight pairs being compared, red numbers indicate elements being swapped.",

    "bubble-sort-complexity-1.png": "Educational text explaining bubble sort termination and complexity analysis, stating the algorithm took 15 steps for n=7 elements and emphasizing that worst case must be examined.",

    "bubble-sort-complexity-2.png": "Mathematical derivation of bubble sort worst-case complexity, showing the sum formula equals n(n-1)/2 = O(n^2), concluding that bubble sort is an O(n^2) algorithm.",

    "bubble-sort-computational-example.png": "Three graphs showing bubble sort computation time versus input size. Random data shows noisy quadratic growth, worst-case shows smoother quadratic growth, and a theoretical n^2 estimate curve.",

    "central-path2.png": "A diagram illustrating the central path method for minimizing an objective subject to Ax <= b. Concentric contour lines show objective function levels, with a red path from the analytic center toward the optimal corner.",

    # Batch 3b
    "circles-figure.png": "A coordinate plane titled 'Spheres Closest Points' showing four ellipses of varying sizes connected by line segments at their closest points, demonstrating the geometric problem of finding minimum distances.",

    "coin-or-logo.png": "The COIN-OR (Computational Infrastructure for Operations Research) logo featuring a golden circular coin design with 'COIN|OR' text in white and gray.",

    "concave.jpg": "A mathematical visualization showing concentric contour lines with a red circle, a green convex polygon region, and a yellow triangular region overlaid, illustrating concepts related to convexity.",

    "dijkstra-video-end.jpg": "A 3D animated visualization showing the completed state of Dijkstra's algorithm with nodes as colored blocks, connected by purple weighted edges, with final shortest path distances displayed.",

    "dijkstra-video-start.jpg": "A 3D animated visualization showing the initial state of Dijkstra's algorithm with nodes marked with infinity symbols except the green starting node, with a small robot character.",

    "dijkstra1.png": "A weighted graph showing the initial step of Dijkstra's shortest path algorithm with node a as source with distance 0, node b with tentative distance 2, and other nodes showing infinity.",

    "dijkstra2.png": "A weighted graph showing a subsequent step of Dijkstra's algorithm where nodes a and b are highlighted, and node d has updated tentative distance 7.",

    "CPalgorithm6.pdf": "A cutting plane algorithm illustration showing a green convex polygon on a grid, with a magenta cutting line, a blue star marking a point of interest, and arrows indicating constraint improvement direction.",

    "Illustration01.pdf": "A rectangular packing diagram with 16 numbered cells in various colors, where red dots in specific cells indicate points of interest, demonstrating a space partitioning configuration.",

    "Illustration02.pdf": "A rectangular region divided into 16 numbered cells with overlapping semi-transparent colored regions extending beyond boundaries, illustrating constraint or coverage relationships.",

    "Illustration1.pdf": "A rectangular packing diagram showing 16 numbered cells in various colors with red dots marking specific cells, used to demonstrate space partitioning concepts.",

    "Illustration2.pdf": "A rectangular region divided into 16 numbered cells with overlapping colored regions extending beyond boundaries, showing constraint coverage relationships.",

    "Illustration3.pdf": "A planar graph with 16 numbered circular nodes connected by gray edges, showing adjacency relationships, where cyan nodes form an independent set.",

    "LP-figure-table.pdf": "A linear programming visualization showing a green hexagonal feasible region with labeled vertices, an objective direction arrow, and a table listing each vertex's coordinates and objective values.",

    "LP-figure.pdf": "A linear programming visualization showing a light blue hexagonal feasible region with labeled vertices, an objective direction arrow, and a red objective function line.",

    "LP-graphical1.pdf": "A graphical solution to LP with objective z = x1 + x2, showing a blue triangular feasible region with orange iso-profit lines and a red optimal line at the optimal vertex.",

    "LP-graphical2.pdf": "A graphical solution to LP with objective z = x1 + x2, showing a blue pentagonal feasible region with orange iso-profit lines touching the optimal vertex.",

    "LP-graphical3.pdf": "A graphical solution to LP with objective z = 2x1 + x2, showing a blue pentagonal feasible region with multiple iso-profit lines, demonstrating how different objectives change the optimal solution.",

    "LinearRegression.pdf": "A scatter plot showing data points of position versus time with a fitted orange linear regression line with equation r = 0.69t + 1.87.",

    "SalaryPictogram.png": "A pictogram comparing manager and worker salaries using money bag icons, where the manager salary bag is significantly larger, visually representing wage disparity.",

    # Batch 4
    "excel-solver-answer-report.JPG": "Microsoft Excel Solver Answer Report showing optimization results with objective cell value, decision variable values, and constraint status information.",

    "excel-solver-button.JPG": "Excel ribbon Data tab with the Solver button highlighted in the Analysis Tools section on the far right.",

    "excel-solver-layout.JPG": "Excel spreadsheet layout for a linear programming problem showing the objective function using SUMPRODUCT, decision variables, objective coefficients, and constraints.",

    "excel-solver-method.JPG": "Excel Solver dropdown menu showing three solving method options: GRG Nonlinear, Simplex LP (selected), and Evolutionary.",

    "excel-solver-select.JPG": "Excel Solver Results dialog box indicating a solution was found with all constraints satisfied, showing options for reports including Answer, Sensitivity, and Limits.",

    "excel-solver-sensitivity.JPG": "Microsoft Excel Solver Sensitivity Report displaying variable cells with final values, reduced costs, objective coefficients, and allowable increase/decrease ranges.",

    "excel-solver-solution.JPG": "Excel spreadsheet showing the solved linear programming problem with optimal objective value, decision variable values, and constraint resources used.",

    "excel-solver-solve.JPG": "Excel Solver Parameters dialog box configured with objective cell, variable cells, constraints, non-negativity option, and Simplex LP method selected.",

    "exp-x2-not-convex.png": "Graph of f(x) = e^(-x^2) showing a bell-shaped curve with maximum at x=0, demonstrating non-convexity with a dashed chord lying below the curve.",

    "feasible-region-linear-ineqs.pdf": "Two-dimensional plot showing a shaded feasible region bounded by three linear inequalities with constraint equations labeled in red, green, and magenta.",

    "feasible-set-sdp.pdf": "Two-dimensional plot of a semidefinite programming feasible set showing a shaded region bounded by a curved hyperbolic boundary in the first quadrant.",

    "fig-log-x2-not-convex.png": "Graph of a concave logarithmic function with two marked points connected by a dashed chord above the curve, demonstrating the function is not convex.",

    "graph-for-matching-maximal.png": "Weighted graph with six vertices labeled a through f, showing edges with weights and three edges highlighted in bold blue indicating a maximal matching.",

    "gurobi-logo.jpg": "Three-dimensional red geometric shape resembling the Gurobi optimization software logo, appearing as an angular polyhedron with faceted surfaces.",

    "gurobi_performance.png": "Box plot chart titled 'Gurobi Performance' comparing runtime on log scale across solver configurations with different Cuts, Heuristics, MIPFocus, and Presolve settings.",

    "illustration03.pdf": "Graph showing 16 numbered vertices connected by edges, with some vertices colored cyan and others yellow, representing a graph coloring or partitioning problem.",

    "integer-feasible.png": "Plot showing a feasible region for an integer programming problem with four linear inequality constraints, where black dots represent integer lattice points inside.",

    "interior-mu-1-1.png": "Visualization of an interior point barrier method showing contour lines, the central path, analytic center (green), and optimal solution (yellow) at a corner of the feasible region.",

    "jssp-duplo-actual.png": "Photograph of colorful Duplo building blocks arranged on a table, representing a physical demonstration of a job shop scheduling problem with blocks of different colors and sizes.",

    "jssp-duplo.pdf": "Gantt chart showing a Job Shop Scheduling Problem solution with three machines and four jobs color-coded, displaying the optimal schedule over 11 time units.",

    # Batch 5
    "jssp-duplo.png": "Gantt chart showing a Job Shop Scheduling Problem solution with three machines and four jobs represented by colored bars over a time horizon of 0 to 12 units.",

    "julia-logo.png": "Julia programming language logo featuring the word 'julia' in lowercase black letters with three colored circles (green, red, purple) arranged above.",

    "jump-logo.png": "JuMP optimization modeling language logo showing crossed dark lines with three colored circles (green, red, purple) and the text 'JUMP' in bold.",

    "jupyter-logo.png": "Project Jupyter logo consisting of an orange crescent shape with three small gray circles, followed by the word 'jupyter' in gray text.",

    "knapsack_fig.pdf": "Coordinate grid with integer lattice points and a light blue triangular feasible region bounded by axes and a diagonal constraint line, representing a knapsack problem.",

    "knapsack_fig_maximal.pdf": "Coordinate grid with a triangular feasible region and five lattice points highlighted in yellow on the constraint boundary, representing a maximal independent set.",

    "logo1.png": "Virginia Tech logo on a maroon background featuring the stylized 'VT' monogram in white above 'VIRGINIA TECH' in orange.",

    "matching_sgb128.png": "Scatter plot titled 'Matchings of Rival Teams' showing approximately 128 red points connected by blue lines representing matched pairs.",

    "matching_sp11.png": "Scatter plot titled 'Matchings of Rival Teams' displaying 11 red points connected by blue lines in matched pairs.",

    "matching_timings.png": "Scatter plot titled 'Solution times of Matching Problem' showing computational time versus instance size with an increasing exponential trend.",

    "matching_uscap.png": "Scatter plot titled 'Matchings of Rival Teams' with points representing US capital cities, showing approximately 50 red dots with blue connecting lines.",

    "min-spanning-tree-exercise.png": "Weighted undirected graph with seven red circular nodes labeled a through g, connected by edges with numerical weights, suitable for a minimum spanning tree problem.",

    "min-spanning-tree-solution.png": "Same weighted graph with thick blue highlighted edges showing the minimum spanning tree solution connecting all seven nodes with minimum total weight.",

    "mixed-integer-reformulation.png": "Geometric illustration of a mixed-integer reformulation showing a green convex polytope with diagonal parallel lines representing integer constraint hyperplanes.",

    "new-tree-optimization.pdf": "Hierarchical tree diagram showing optimization model taxonomy: Convex models (LP, MILP) and Non-convex models (NLP, MINLP).",

    "new-york-tolls.png": "Map of New York City's five boroughs showing a transportation network with red dashed toll roads and a green no-toll route connecting Staten Island, Brooklyn, and Queens.",

    "open-optimization-logo-crop.png": "Open Optimization project logo with 'OPEN' in blue and 'OPTIMIZATION' in orange, framed by a circular gradient ring, with tagline below.",

    "pipes.png": "3D illustration of seven yellow cylindrical pipes stacked in a pyramid arrangement, showing their hollow circular cross-sections, representing a packing problem.",

    "quadratic-regression.png": "Scatter plot with red data points and a fitted blue quadratic regression curve, demonstrating a least-squares quadratic fit to approximately 10 data points.",

    "random-graph-weighted.png": "Weighted undirected graph with six red circular nodes labeled a through f, connected by edges with numerical weights, suitable for graph optimization problems.",

    # Batch 6
    "risk-plot.png": "Graph showing an inventory risk function where risk cost increases rapidly and asymptotically approaches a maximum as inventory level increases.",

    "sorting-linear.png": "Performance comparison chart of four efficient sorting algorithms showing computation time versus list size, with all algorithms exhibiting roughly linear growth.",

    "sorting-quadratic.png": "Performance comparison of efficient and inefficient sorting algorithms, demonstrating the dramatic quadratic growth of Bubble, Insertion, and Selection sort versus near-linear efficient algorithms.",

    "spatial_bnb_1.jpg": "Whiteboard showing the initial step of branch and bound with root node values and branching constraints, indicating the need to branch.",

    "spatial_bnb_2.jpg": "Whiteboard showing branch and bound iteration with two child nodes, where one branch is pruned as suboptimal.",

    "spatial_bnb_3.jpg": "Whiteboard showing branch and bound with additional branching, where one leaf node is pruned as optimal and another branch continues.",

    "spatial_bnb_4.jpg": "Whiteboard showing branch and bound where nodes are pruned as suboptimal globally and another branch is pruned as infeasible.",

    "spatial_bnb_5.jpg": "Whiteboard showing the final branch and bound tree with the conclusion highlighted that the optimal solution has been found.",

    "svm-nonlinear-training.png": "Scatter plot titled 'Training data' showing two classes of points not linearly separable, requiring a nonlinear decision boundary.",

    "svm-nonlinear.png": "Scatter plot titled 'All data' showing a larger dataset with red and black points demonstrating a nonlinear classification problem.",

    "time-of-algorithms.jpg": "Table comparing polynomial and exponential time complexity, showing how exponential algorithms become computationally infeasible even for small problem sizes.",

    "tree-optimization.pdf": "Hierarchical tree diagram classifying optimization models into Linear (LP, MILP) and Nonlinear (NLP, MINLP) categories.",

    "tsp-2-opt1-switch.png": "TSP tour visualization showing cities connected by edges, with two edges highlighted in red and green indicating the pair being considered for a 2-opt swap.",

    "tsp-2-opt2-switch.png": "TSP tour after a 2-opt swap with improved score, showing red and green highlighted edges indicating the next pair being evaluated.",

    "tsp-2-opt2.png": "TSP tour showing cities connected by blue edges, representing the current solution state before the next 2-opt improvement.",

    "tsp-2-opt3-switch.png": "TSP tour with further improved score after another 2-opt swap, with red and green edges highlighting the next candidate pair.",

    "tsp-2-opt3.png": "TSP tour showing cities connected by blue edges, representing an intermediate tour state in the 2-opt progression.",

    "tsp-2-opt4-switch.png": "TSP tour with red and green highlighted edges indicating another potential 2-opt swap being evaluated.",

    "tsp-2-opt4.png": "TSP tour showing cities connected by blue edges in an improved configuration compared to earlier iterations.",

    "tsp-2-opt5-switch.png": "TSP tour with best score so far, with red and green edges highlighting the current candidate pair for evaluation.",

    # Batch 7
    "tsp-2-opt5.png": "TSP tour connecting 10 labeled cities with a total score shown, forming an irregular path across the coordinate plane.",

    "tsp-2-opt6-switch.png": "TSP 2-opt improvement step showing edges being swapped with red and green lines, improving the tour score.",

    "tsp-2-opt6.png": "TSP tour after a 2-opt improvement, showing the blue path connecting cities in a more efficient configuration.",

    "tsp-2-opt7-switch.png": "TSP 2-opt swap visualization showing red edges to be removed and green edges to be added, demonstrating significant improvement.",

    "tsp-2-opt7.png": "TSP tour with intermediate state before the next 2-opt improvement, showing cities connected with some crossing edges.",

    "tsp-2-opt8-switch.png": "TSP 2-opt exchange step with highlighted edges indicating the swap that eliminates a crossing in the tour path.",

    "tsp-2-opt8.png": "TSP tour after improvement with fewer crossings than earlier iterations, showing progress toward a locally optimal solution.",

    "tsp-2-opt9.png": "Final optimized TSP tour representing the locally optimal solution after all 2-opt improvements, with no edge crossings.",

    "tsp-tour-hw3.png": "TSP solution showing a dashed blue tour connecting 10 red-marked cities scattered across the coordinate plane.",

    "unbounded-directions.JPG": "Linear programming diagram showing an unbounded feasible region with a point and direction vector extending into the unbounded region.",

    "youtube-OR-course.jpg": "YouTube playlist page for 'Operations Research - SUNY Binghamton University' containing 77 videos with over 235,000 views.",

    "youtube-tsp-simulated-annealing.jpg": "YouTube video page for 'Traveling Salesman Problem Visualization' showing a dark map of the United States with scattered city points.",

    "figureCutttingPlane1.pdf": "Integer lattice grid with a convex polyhedron containing integer points, a red fractional vertex, and a green LP optimum, with an arrow indicating optimization direction.",

    "figureCutttingPlane2.pdf": "Cutting plane iteration showing a polyhedron with a red cutting plane line separating the fractional vertex from the feasible region.",

    "figureCutttingPlane3.pdf": "Updated polyhedron after applying a cutting plane, with a new fractional vertex and LP optimum on the tightened boundary.",

    "figureCutttingPlane4.pdf": "Second cutting plane iteration with a red line cutting through the polytope to further tighten the LP relaxation.",

    "figureCutttingPlane5.pdf": "Polytope after applying the second cut, with the optimum point now on a vertex, indicating progress toward an integer solution.",

    "figureCutttingPlane6.pdf": "Third cutting plane being applied to separate the fractional vertex from the polytope in another iteration of the algorithm.",

    "figureCutttingPlane7.pdf": "Final polytope after multiple cutting planes, with all vertices at integer points and the green point marking an integer optimal solution.",

    "figureIntersectionCuts1.pdf": "Integer lattice with a convex polyhedron showing a fractional LP optimum on the boundary, illustrating initial setup for intersection cut generation.",

    # Batch 8
    "figureIntersectionCuts2.pdf": "Two-dimensional lattice with a convex polygon and a red fractional vertex, with two red arrows indicating directions toward adjacent vertices.",

    "figureIntersectionCuts3.pdf": "Two-dimensional lattice showing an unbounded polyhedral region with a red fractional vertex and two red arrows indicating cone directions.",

    "figureIntersectionCuts4.pdf": "Lattice plane with an unbounded polyhedral region and a green circle centered at a red fractional point, demonstrating a convex set for intersection cuts.",

    "figureIntersectionCuts5.pdf": "Lattice diagram with an unbounded region and a green circle, with a black vertical line demonstrating the intersection of a cutting plane with the convex set.",

    "figureIntersectionCuts6.pdf": "Two-dimensional lattice with an unbounded region and a truncated green circle cut by a vertical black line, demonstrating an intersection cut.",

    "figureIntersectionCuts7.pdf": "Lattice plane showing an unbounded region with a green diamond-shaped convex set centered at a red fractional point, with a black vertical intersection cut.",

    "figureCutttingPlane1b.pdf": "Two-dimensional lattice with interior integer points marked in red, a convex polygon, and a green fractional optimal vertex with optimization direction arrow.",

    "figureCutttingPlane2b.pdf": "Lattice diagram with a convex polygon, interior integer points in red, a green fractional vertex, and a vertical red cutting plane line.",

    "figureCutttingPlane3b.pdf": "Two-dimensional lattice with a modified convex polygon after a cutting plane, with the green point at a new fractional vertex location.",

    "figureCutttingPlane4b.pdf": "Lattice plane showing an updated convex polygon with a diagonal red cutting plane and green fractional optimal vertex.",

    "figureCutttingPlane5b.pdf": "Two-dimensional lattice showing a convex polygon with the green optimal vertex at a lower position, representing an intermediate iteration.",

    "figureCutttingPlane6b.pdf": "Lattice diagram with a convex polygon and a red diagonal cutting plane separating the green fractional vertex from part of the feasible region.",

    "figureCutttingPlane7b.pdf": "Two-dimensional lattice showing the final iteration where the green point has converged to an integer lattice point on the polygon boundary.",

    "figureIntersectionCuts1b.pdf": "Two-dimensional lattice with a convex polygon and a single green point on the boundary marking a fractional vertex not at an integer location.",

    "Sorting_algorithms_comparison.pdf": "Four line graphs comparing computation time of sorting algorithms against list size, showing quadratic growth for Bubble and Selection sort versus near-linear for efficient algorithms.",

    "Untitled.pdf": "Two-dimensional coordinate plane showing a linear programming unbounded feasible region with three labeled constraint lines in red, green, and magenta.",

    "2022_02_28_634e8079070800ac7e3cg-03.jpg": "A two-dimensional graph with 'number of chairs' on y-axis and tables on x-axis, displaying a triangular feasible region for a furniture production problem.",

    "2022_02_28_634e8079070800ac7e3cg-05.jpg": "Graph plotting chairs versus tables with a triangular feasible region and parallel dashed iso-profit lines for finding the optimal solution.",

    "2022_02_28_634e8079070800ac7e3cg-10.jpg": "Linear programming graph showing two overlapping feasible regions with dashed objective function level curves, illustrating constraint comparison.",

    "2022_02_28_634e8079070800ac7e3cg-13.jpg": "Graph of chairs versus tables with a feasible region, iso-profit lines, and five black dots marking corner points for vertex enumeration.",
}


def update_bib_file(bib_path, alt_text_map):
    """Update the abstract fields in a bib file with alt text descriptions."""
    with open(bib_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    updated_count = 0
    old_abstract = r'abstract\s*=\s*\{Missing AltText: Please add a description for screen readers\.\}'

    for entry_id, alt_text in alt_text_map.items():
        # Escape special characters for LaTeX
        alt_text_escaped = alt_text.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')

        # Try with the exact entry_id first
        entry_pattern = rf'(@Online\{{{re.escape(entry_id)},.*?)({old_abstract})(.*?\}})\s*(?=@Online|\Z)'
        match = re.search(entry_pattern, content, re.DOTALL | re.IGNORECASE)

        if match:
            new_abstract = f'abstract = {{{alt_text_escaped}}}'
            new_content = match.group(1) + new_abstract + match.group(3) + '\n\n'
            content = content[:match.start()] + new_content + content[match.end():]
            updated_count += 1
            print(f"  Updated: {entry_id}")
        else:
            # Try without extension
            base_name = entry_id.rsplit('.', 1)[0] if '.' in entry_id else entry_id
            entry_pattern = rf'(@Online\{{{re.escape(base_name)},.*?)({old_abstract})(.*?\}})\s*(?=@Online|\Z)'
            match = re.search(entry_pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                new_abstract = f'abstract = {{{alt_text_escaped}}}'
                new_content = match.group(1) + new_abstract + match.group(3) + '\n\n'
                content = content[:match.start()] + new_content + content[match.end():]
                updated_count += 1
                print(f"  Updated: {base_name}")

    # Write back
    with open(bib_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return updated_count


def main():
    print("=" * 60)
    print("Updating alt text in bib files - Batch 2")
    print("=" * 60)

    print(f"\nProcessing: {FIGURES_STATIC_BIB}")
    count = update_bib_file(FIGURES_STATIC_BIB, ALT_TEXT_MAP)
    print(f"\nUpdated {count} entries with alt text")


if __name__ == '__main__':
    main()
