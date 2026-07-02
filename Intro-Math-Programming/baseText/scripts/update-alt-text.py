#!/usr/bin/env python3
"""
update-alt-text.py
Updates the abstract field in bib files with generated alt text descriptions.
"""

import re
from pathlib import Path

BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
FIGURES_STATIC_BIB = BASE_DIR / "optimization/figures/figures-static/00_METADATA.bib"

# Alt text mapping: entry_id -> alt text description
ALT_TEXT_MAP = {
    # First batch
    "network-flow.png": "Directed graph with 6 cyan nodes labeled 1-6, connected by arrows showing network flow. Each edge is annotated with pairs of values representing flow and capacity, illustrating a minimum-cost network flow problem.",

    "jssp.png": "Gantt chart showing a job shop scheduling solution with three machines processing five jobs over time. Colored horizontal bars represent job operations on each machine, demonstrating how jobs are sequenced to minimize makespan.",

    "circle-problem.png": "Three blue circles in a 2D coordinate plane with red points on their perimeters connected by green dashed lines. The figure illustrates minimizing the total distance between points constrained to lie on different circles.",

    "svm2": "Support vector machine classification diagram showing two classes of data points separated by a maximum-margin hyperplane. Dashed lines indicate the margin boundaries, with support vectors circled and the margin width labeled.",

    "svm2.pdf": "Support vector machine classification diagram showing two classes of data points separated by a maximum-margin hyperplane. Dashed lines indicate the margin boundaries, with support vectors circled and the margin width labeled.",

    "k-means": "Scatter plot showing k-means clustering results with five clusters. Points are grouped into distinct colored clusters with X marks indicating cluster centroids and circles showing approximate cluster boundaries.",

    "k-means.png": "Scatter plot showing k-means clustering results with five clusters. Points are grouped into distinct colored clusters with X marks indicating cluster centroids and circles showing approximate cluster boundaries.",

    "voronoi": "Voronoi diagram partitioning a 2D plane into eight colored polygonal regions. Each region contains a red seed point, with boundaries equidistant from neighboring seeds, demonstrating spatial partitioning used in clustering.",

    "voronoi.pdf": "Voronoi diagram partitioning a 2D plane into eight colored polygonal regions. Each region contains a red seed point, with boundaries equidistant from neighboring seeds, demonstrating spatial partitioning used in clustering.",

    "k-means-vary-k": "Grid of nine plots showing k-means clustering results for k=1 through k=9. As k increases, data points are partitioned into more clusters with smaller radii, demonstrating how cluster count affects the partitioning.",

    "k-means-vary-k.png": "Grid of nine plots showing k-means clustering results for k=1 through k=9. As k increases, data points are partitioned into more clusters with smaller radii, demonstrating how cluster count affects the partitioning.",

    "k-means-elbow": "Line graph showing the elbow method for selecting optimal k in k-means clustering. Distortion decreases sharply from k=1 to k=4, then levels off, indicating the optimal number of clusters is around 4-5.",

    "k-means-elbow.png": "Line graph showing the elbow method for selecting optimal k in k-means clustering. Distortion decreases sharply from k=1 to k=4, then levels off, indicating the optimal number of clusters is around 4-5.",

    "simulated_annealing_temperatures.png": "Family of curves showing the Metropolis acceptance probability as a function of solution quality difference for temperatures 1-9. Higher temperatures produce flatter curves with higher acceptance of worse solutions.",

    "wiki/File/Petersen_graph_3-coloring.png": "Petersen graph with vertices colored using three colors (red, green, blue) demonstrating a valid 3-coloring. The graph shows the characteristic pentagonal structure with inner star, where no adjacent vertices share the same color.",

    "multi-network-flow-data.png": "Directed network with 4 nodes showing supply/demand values at each node and edge capacities. This represents the input data for a multi-commodity network flow problem.",

    "multi-network-flow-solution.png": "Solution to the multi-commodity network flow problem showing the same 4-node network with optimal flow values on each edge. Pairs indicate flows for two different commodities.",

    "pwl-plot.png": "Piecewise linear function c(x) plotted from x=0 to x=15, with breakpoints at x=5 and x=10. The function increases with varying slopes between segments, demonstrating a convex piecewise linear cost function.",

    "solve_progress1.png": "Branch-and-bound solver progress showing primal and dual bounds converging over 35 seconds. The shaded gap between bounds narrows as the solver finds better integer solutions and tightens the relaxation bound.",

    "epigraph.pdf": "Three side-by-side graphs illustrating the epigraph concept for different functions. The shaded regions above each curve represent the epigraph, showing non-convex, convex, and concave cases.",

    "solve_progress2.png": "MIP solver progress plot showing primal and dual bounds converging over 16 seconds. The gap between bounds decreases as heuristics find improved feasible solutions.",

    "wiki/File/knapsack": "Visual representation of the 0-1 knapsack problem showing a backpack with 15 kg capacity and items with different weights and values. The question mark indicates the optimization decision.",

    "first-order-convexity": "Two graphs comparing first-order convexity conditions. Left shows a convex function where the tangent line lies below the curve. Right shows a nonconvex function where the tangent line intersects the curve.",

    "first-order-convexity.png": "Two graphs comparing first-order convexity conditions. Left shows a convex function where the tangent line lies below the curve. Right shows a nonconvex function where the tangent line intersects the curve.",

    "wiki/File/2-opt_wiki": "Two tour configurations demonstrating the 2-opt improvement heuristic for TSP. Top shows a tour with crossing edges; bottom shows the improved tour after reversing a segment to eliminate the crossing.",

    "wiki/File/triangle_inequality.png": "Three triangles demonstrating the triangle inequality z <= x + y. The triangles progressively flatten, showing that as the triangle approaches a straight line, z approaches x + y.",

    # Second batch
    "LP-feasible-region.png": "A two-dimensional plot showing a blue shaded polygonal feasible region bounded by green dashed constraint lines, illustrating the feasible set of a linear programming problem.",

    "big-M.png": "A coordinate plane showing a blue shaded feasible region bounded by multiple constraint lines, with labeled corner points, demonstrating the geometry of a linear program with the big-M method.",

    "branch-and-bound1.png": "A feasible region plot with integer lattice points shown as gray dots, a blue shaded LP relaxation region, and a red X marking the fractional LP optimal solution, illustrating the first step of branch and bound.",

    "branch-and-bound2.png": "The branch and bound algorithm after branching, showing two separate blue shaded subregions divided by a vertical constraint, with red X markers indicating fractional solutions.",

    "branch-and-bound3.png": "A later stage of branch and bound showing the feasible region split into subregions, with a green star marking an integer feasible solution and a red X marking a fractional solution being pruned.",

    "cutting-plane-1-picture.png": "A coordinate plot showing the LP relaxation polytope with yellow dots indicating integer feasible points inside, black dots showing integer infeasible points outside, and a blue star marking the current LP optimum.",

    "cutting-plane-2-picture.png": "The cutting plane algorithm after adding one cut, showing the LP polytope being tightened with a vertical cut, reducing the feasible region while preserving all integer feasible points.",

    "cutting-plane-3-picture.png": "After adding a second cutting plane, the LP polytope is further reduced, with the LP optimum now moved to an integer point, demonstrating convergence of the cutting plane method.",

    "gradient-descent-slow.png": "A plot of a parabolic function with gradient descent iterations shown as red dots along the curve, demonstrating slow convergence with a small step length.",

    "convex-hull-random.png": "A set of randomly scattered red points in a 2D plane with their convex hull shown as a yellow filled polygon, illustrating the smallest convex set containing all points.",

    "IP-feasible-region.png": "An integer programming feasible region showing a blue shaded LP relaxation polytope with green dots highlighting the integer feasible points within the region.",

    "IP-with-LP-relaxation.png": "A comparison of IP and LP solutions showing a blue shaded LP feasible region, red dots for integer points, and a blue point labeled LPOpt at the LP optimum.",

    "MIP-feasible-region.png": "A mixed-integer programming feasible region with blue shading showing the LP relaxation, vertical dark green bars indicating where integer restrictions apply.",

    "integer-programming.pdf": "A coordinate plane with a blue shaded triangular LP feasible region bounded by a red constraint line, blue dots showing integer feasible points.",

    "facility-location.pdf": "A network diagram for facility location showing three potential distribution centers with fixed costs and capacities, connected to four customer locations with demand values and shipping costs.",

    "pareto-curve.png": "A Pareto front curve showing the trade-off between Total Cost and Maximum Risk Cost, demonstrating diminishing returns as one objective improves at the expense of the other.",

    "barrier-method.png": "Multiple curves showing barrier functions for a constrained optimization problem for different values of parameter t, with colored dots marking minima that converge to the constrained optimum.",

    "central-path1.png": "A dense family of barrier function curves showing the central path for constrained optimization, with colored dots tracing the sequence of analytic centers as the barrier parameter varies.",

    "spanning-tree.png": "An undirected weighted graph with 6 red nodes connected by black edges, with a subset of edges highlighted indicating a spanning tree that connects all vertices.",

    "spanning-tree-MST.png": "A weighted graph with the minimum spanning tree edges highlighted, showing the lowest-weight connected subgraph spanning all vertices.",

    "graph-for-matching.png": "A weighted undirected graph with 6 red nodes and edges labeled with weights, used to illustrate matching problems in graph theory.",

    "graph-for-matching-unweighted.png": "An unweighted undirected graph with 6 red nodes connected by edges, representing the structure for an unweighted matching problem.",

    "tsp-optimal-route.png": "A map of the southeastern United States showing the optimal traveling salesman tour through 8 cities, with the route drawn as a connected path.",

    "tsp-2-opt1.png": "A TSP solution visualization showing labeled points with coordinates connected by edges forming a tour, illustrating a 2-opt improvement iteration.",

    "dijkstra0.png": "A weighted graph with 7 nodes used to demonstrate Dijkstra's shortest path algorithm, with blue edge weights shown.",

    "dijkstra-soln.png": "A graph after running Dijkstra's algorithm, with the shortest path tree highlighted showing minimum distance paths from the source to all other nodes.",

    "SVM-plot.png": "A support vector machine classification plot showing two classes separated by a blue decision boundary line with parallel dashed margin lines.",

    "SVM-points.png": "Raw data points for a binary classification problem with two classes represented by different colored dots, before applying SVM.",

    "linear-regression.png": "A scatter plot of blue data points with a red best-fit regression line, demonstrating ordinary least squares linear regression.",

    "jssp.pdf": "A Gantt chart showing the solution to a Job Shop Scheduling Problem with 5 jobs scheduled across 3 machines, with no overlapping jobs on the same machine.",

    "knapsack-fig.pdf": "A 2D visualization of a knapsack-type integer programming problem showing a blue shaded feasible region with integer points marked, bounded by a constraint line.",

    "knapsack-fig-opt.pdf": "A knapsack problem with the optimal solution highlighted by green points along the boundary, showing which items are selected.",

    "national-park-map.pdf": "A graph representation of a national park with 11 locations including Headquarters, entrances, Visitor Center, campground, and scenic areas, connected by trail edges.",

    "national-park-shortest-path.pdf": "The national park graph with edge weights and the shortest path highlighted, showing the minimum distance route between locations.",

    "national-park-spanning-tree.pdf": "The national park graph with a minimum spanning tree highlighted, showing the minimum total distance needed to connect all locations.",

    "national-park-tsp.pdf": "The national park graph with a traveling salesman tour highlighted, showing a Hamiltonian cycle visiting all locations exactly once.",

    "excel-sensitivity-report.JPG": "A Microsoft Excel Solver sensitivity analysis report showing Variable Cells and Constraints sections with columns for Final Value, Reduced Cost, and Shadow Price.",

    "LP-graphical.png": "A 2D linear programming graphical solution showing the feasible region, orange dashed iso-profit lines, and a red optimal objective line at the optimal vertex.",

    "LP-graphical2.png": "LP graphical solution showing how changing objective coefficients alters the slope of iso-profit lines and potentially changes which vertex is optimal.",

    "simplex-all-tableaus.JPG": "A diagram showing a feasible region with five labeled corner points and the corresponding simplex tableau equations at each basic feasible solution.",

    "sensitivity-changing-b.JPG": "Sensitivity analysis showing how changing the right-hand side of constraints shifts constraint lines and affects the feasible region and optimal solution.",

    "sensitivity-objective.JPG": "Sensitivity analysis visualization showing how the optimal solution changes as objective function coefficients vary.",

    "Konigsberg_bridges.png": "A historical map of Konigsberg showing the seven bridges problem, with bridges highlighted connecting different land masses separated by the river.",

    "convexity-definition.pdf": "A mathematical illustration of convexity showing a U-shaped convex function with two points, demonstrating that the line segment connecting them lies above the function.",

    "bnb1.png": "First iteration of branch and bound showing the LP relaxation feasible region with integer lattice points and a red X at the fractional optimal solution.",

    "bnb2.png": "Branch and bound after first branching showing two subregions, a green star at an integer solution, and red X markers at fractional solutions.",

    "bnb3.png": "Later branch and bound iteration showing further subdivision with a green star marking the current best integer solution and pruned branches.",

    "bnb4.png": "Final branch and bound state showing three green stars at integer solutions found, indicating all branches have been explored or pruned.",

    "StripPacking0.png": "Strip packing problem input showing four rectangles with their dimensions labeled, alongside an empty strip where they need to be packed.",

    "StripPacking2.png": "A feasible strip packing solution showing rectangles packed into the strip with coordinate positions listed for each rectangle.",

    "problem-class-diagram.png": "A hierarchical tree diagram classifying optimization models into Linear models (LP, MILP) and Nonlinear models (NLP, MINLP).",

    "local-min.pdf": "A continuous function curve with labeled critical points showing local minima, local maxima, and the global minimum, illustrating the difference between local and global optima.",

    "level-curves.pdf": "Level curves of a quadratic objective function shown as ellipses on a circular feasible region, with labeled objective values.",

    "interior-point-method.png": "A 2D visualization of the barrier method showing contour lines, the central path from the analytic center converging to the optimal solution at a corner.",

    "barrier-method2d.png": "An interior point method trajectory showing iterates along the central path within a triangular feasible region, converging toward the optimal vertex.",

    "unbounded-desmos-simplex.png": "A visualization of an unbounded LP showing a feasible region extending infinitely upward, demonstrating an unbounded optimal objective value.",

    "robust-feasible-region.png": "Comparison of original feasible region and worst-case robust feasible region showing how uncertainty in constraint coefficients shrinks the feasible set.",

    "parity-polytope.png": "A 3D visualization of the parity polytope inscribed within a cube, with vertices indicating the even parity points.",

    "m-tsp_solution.png": "A multiple traveling salesman problem solution on a city map showing routes for multiple vehicles visiting different subsets of customer locations.",

    "cell-towers.png": "A schematic diagram showing four cell tower icons with signal waves, positioned within a coverage area for a tower placement optimization problem.",

    "fire-station-locations.jpg": "A map view showing fire station locations marked with red pins, illustrating a real-world facility location problem.",

    "cutting-planes0.pdf": "Initial LP relaxation for an integer program showing the feasible region with integer points marked and the LP optimal at a fractional point.",

    "cutting-planes1.pdf": "After adding a cutting plane, the LP polytope is tightened and the LP optimum moves closer to an integer point.",

    "cutting-planes2.pdf": "After adding a second cut, the polytope is further reduced and the new LP optimum is at an integer point, demonstrating convergence.",

    "branch-and-bound-binary-knapsack.pdf": "A complete branch and bound tree for a binary knapsack problem showing branching decisions, LP relaxation values at each node, and pruning rules.",

    "mir.png": "A geometric illustration of the Mixed Integer Rounding cut showing vertical integer lines, the original constraint, and the tighter MIR cut valid for mixed-integer solutions.",

    "MIR-Cut.jpg": "A whiteboard drawing illustrating the MIR cut derivation with the original constraint and the strengthened inequality.",

    "tree-diagram-types.pdf": "A hierarchical classification of optimization models showing Convex models and Non-convex models as subcategories.",

    "graph-us-cities.png": "A weighted graph overlaid on a US map showing 6 cities connected by edges with distance weights, illustrating a network optimization problem.",

    "desmos-graph-slacks.png": "An LP feasible region with vertices labeled and slack variable constraints labeled in different colors, showing how each constraint defines a boundary.",

    "Figures-LP-feasible-region.png": "A clean visualization of an LP feasible region showing the polygon with corner points and a dashed objective function line.",

    "lp-feasible-desmos.JPG": "A graph showing an LP feasible region bounded by constraint lines, with corner points labeled.",

    "pwl-plot.pdf": "A piecewise linear function plotted with breakpoints, showing increasing slopes in each segment.",

    "wiki/File/William_Rowan_Hamilton_painting.jpg": "A mid-19th century portrait painting of Sir William Rowan Hamilton, the Irish mathematician known for his work on Hamiltonian mechanics and the discovery of quaternions.",
}


def update_bib_file(bib_path, alt_text_map):
    """Update the abstract fields in a bib file with alt text descriptions."""
    with open(bib_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    updated_count = 0

    for entry_id, alt_text in alt_text_map.items():
        # Escape special characters for LaTeX
        alt_text_escaped = alt_text.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$').replace('#', '\\#')

        # Pattern to find the entry and its abstract field
        # First, check if this entry exists
        entry_pattern = rf'@Online\{{{re.escape(entry_id)},'
        if not re.search(entry_pattern, content, re.IGNORECASE):
            # Try without extension
            base_name = entry_id.rsplit('.', 1)[0] if '.' in entry_id else entry_id
            entry_pattern = rf'@Online\{{{re.escape(base_name)},'
            if not re.search(entry_pattern, content, re.IGNORECASE):
                continue

        # Replace "Missing AltText" placeholder with actual alt text
        old_abstract = r'abstract\s*=\s*\{Missing AltText: Please add a description for screen readers\.\}'

        # Find the entry and update its abstract
        # This pattern matches the entire entry
        entry_full_pattern = rf'(@Online\{{{re.escape(entry_id)},.*?)({old_abstract})(.*?\}})\s*(?=@Online|\Z)'

        match = re.search(entry_full_pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            new_abstract = f'abstract = {{{alt_text_escaped}}}'
            new_content = match.group(1) + new_abstract + match.group(3) + '\n\n'
            content = content[:match.start()] + new_content + content[match.end():]
            updated_count += 1
            print(f"  Updated: {entry_id}")
        else:
            # Try without extension
            base_name = entry_id.rsplit('.', 1)[0] if '.' in entry_id else entry_id
            entry_full_pattern = rf'(@Online\{{{re.escape(base_name)},.*?)({old_abstract})(.*?\}})\s*(?=@Online|\Z)'
            match = re.search(entry_full_pattern, content, re.DOTALL | re.IGNORECASE)
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
    print("Updating alt text in bib files")
    print("=" * 60)

    print(f"\nProcessing: {FIGURES_STATIC_BIB}")
    count = update_bib_file(FIGURES_STATIC_BIB, ALT_TEXT_MAP)
    print(f"\nUpdated {count} entries with alt text")


if __name__ == '__main__':
    main()
