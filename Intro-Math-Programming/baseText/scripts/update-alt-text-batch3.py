#!/usr/bin/env python3
"""
update-alt-text-batch3.py
Updates the abstract field in bib files with the final batch of alt text descriptions.
"""

import re
from pathlib import Path

BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
FIGURES_STATIC_BIB = BASE_DIR / "optimization/figures/figures-static/00_METADATA.bib"

# Alt text mapping: entry_id -> alt text description
ALT_TEXT_MAP = {
    "2022_02_28_634e8079070800ac7e3cg-14.jpg": "A two-dimensional linear programming feasible region plot with number of chairs on the y-axis and number of tables on the x-axis. The shaded blue region represents feasible integer solutions, with black dots marking integer lattice points along the boundary constraints.",

    "2022_02_28_634e8079070800ac7e3cg-15(1).jpg": "A scatter plot showing the relationship between Revenue in dollars and Waste in pounds. The blue dots form a curved Pareto frontier illustrating the tradeoff between maximizing revenue and minimizing waste.",

    "2022_02_28_634e8079070800ac7e3cg-15.jpg": "A two-dimensional linear programming feasible region plot with number of chairs on the y-axis and number of tables on the x-axis. The shaded blue region represents feasible integer solutions, with black dots marking integer lattice points.",

    "2022_02_28_634e8079070800ac7e3cg-17.jpg": "A side-by-side comparison: on the left, a linear programming feasible region showing chairs versus tables with integer points; on the right, a Pareto frontier curve showing the tradeoff between Waste and Revenue.",

    "2022_02_28_634e8079070800ac7e3cg-19.jpg": "A 3x3 grid of scatter plots comparing redistricting outcomes for nine U.S. states. Each plot shows various redistricting scenarios color-coded by compactness and representation percentages, with the 2010 enacted map marked.",

    "2022_02_28_634e8079070800ac7e3cg-20.jpg": "A simulated portfolio optimization scatter plot showing the efficient frontier, with volatility on the x-axis and returns on the y-axis. Stars mark the maximum Sharpe ratio portfolio and minimum volatility portfolio.",

    "2022_02_28_634e8079070800ac7e3cg-21.jpg": "A multi-objective aircraft design optimization plot showing sustained turn rate versus transonic range. Multiple curves represent different thickness-to-chord configurations, with MOGA solutions and Pareto frontier marked.",

    "2022_02_28_634e8079070800ac7e3cg-22.jpg": "A lap time plot comparing performance on two different radius turns. The scattered points form a Pareto frontier showing the tradeoff between cornering performance at different speeds.",

    "2022_02_28_634e8079070800ac7e3cg-23.jpg": "A Pareto frontier plot showing the tradeoff between Cost in Euros and CO2 Emissions. Two regression lines with equations are fitted to different segments of the frontier, showing R-squared values.",

    "campground-LP.pdf": "A linear programming feasible region for a campground problem with variables r (RV sites) and t (tent sites). The plot shows constraint lines in different colors with the shaded feasible region highlighted.",

    "dijkstra-video.jpg": "A 3D rendered visualization of a weighted graph for Dijkstra's algorithm, with nodes labeled A through G as cubes connected by purple edges with weights displayed, and a small robot at the start.",

    "dijkstra3.png": "An intermediate step of Dijkstra's algorithm showing a weighted graph with visited nodes and edges highlighted in red, with distance labels showing current shortest distances from the source.",

    "dijkstra4.png": "A later step of Dijkstra's algorithm showing progress through the graph with more nodes visited and updated distance labels from the source.",

    "dijkstra5.png": "Dijkstra's algorithm in progress with all nodes reached. The shortest path tree is shown in red, with final distance labels indicating the algorithm has found a path to all nodes.",

    "dijkstra6.png": "Dijkstra's algorithm nearing completion with the path to the final node confirmed. The red highlighted edges show the shortest path tree from the source.",

    "dijkstra7.png": "Dijkstra's algorithm final iteration showing the completed shortest path tree with all nodes labeled with their final distances from the source.",

    "dijkstra8.png": "The completed Dijkstra's algorithm result showing the final shortest path tree from the source node with all minimum distances displayed and shortest path tree edges highlighted.",

    "electrical-connections.png": "A coordinate plane diagram showing an electrical connections optimization problem. A central hub point connects to four peripheral components via weighted edges.",

    "electrical-plot-soln.png": "A solution visualization for the electrical connections problem showing the optimal hub location connecting to four components via weighted edges on a coordinate grid.",

    "electrical-plot-soln2.png": "An alternative solution visualization for the electrical connections problem with a slightly different optimal hub placement connecting to four peripheral components.",

    "excel-sensitivity.JPG": "A Microsoft Excel Solver Results dialog box showing a successful optimization, with options to keep the solution or restore original values, and report type selections.",

    "excel-setup.JPG": "An Excel spreadsheet setup for a linear programming problem with decision variables in yellow cells. Constraints are defined with coefficients, totals, and right-hand side values.",

    "image1.png": "Julia code snippet using JuMP and Cbc packages to solve a binary integer programming problem. The code declares variables, sets objectives and constraints, solves and prints results.",

    "network-flow-solution.png": "A directed network flow graph with six nodes labeled with node numbers and net flow values. Edges are labeled with flow capacities, showing the solution to a minimum cost network flow problem.",

    "open-optimization-logo.jpeg": "The Open Optimization project logo featuring 'OPEN OPTIMIZATION' in orange and blue colors, with a circular design element and the tagline 'Open-Source Project for Optimization Courses.'",

    "solution-time-matching.png": "A computational complexity plot showing solution times for a matching problem. Blue dots represent solve times versus instance size, with a fitted curve demonstrating quadratic time complexity.",

    # Copies and duplicates - use same descriptions as originals
    "SVM-plot copy.png": "A support vector machine classification plot showing two classes separated by a blue decision boundary line with parallel dashed margin lines.",

    "SVM-points copy.png": "Raw data points for a binary classification problem with two classes represented by different colored dots, before applying SVM.",

    "Unknown.png": "A figure from the optimization textbook whose specific content needs manual review.",

    "quadratic-regression copy.png": "Scatter plot with red data points and a fitted blue quadratic regression curve, demonstrating a least-squares quadratic fit to approximately 10 data points.",

    "electrical-connections copy.png": "A coordinate plane diagram showing an electrical connections optimization problem. A central hub point connects to four peripheral components via weighted edges.",

    "matching time computation.png": "A plot showing computation time for solving matching problems, demonstrating how solve time scales with problem size.",
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
    print("Updating alt text in bib files - Final Batch")
    print("=" * 60)

    print(f"\nProcessing: {FIGURES_STATIC_BIB}")
    count = update_bib_file(FIGURES_STATIC_BIB, ALT_TEXT_MAP)
    print(f"\nUpdated {count} entries with alt text")

    # Check remaining
    with open(FIGURES_STATIC_BIB, 'r', encoding='utf-8') as f:
        content = f.read()
    remaining = content.count('Missing AltText')
    print(f"Remaining entries without alt text: {remaining}")


if __name__ == '__main__':
    main()
