#!/usr/bin/env python3
"""Give every DATA table in Book 1 a table number (publisher requirement).

Analogous to number-figures.py (marker `% fig-num-auto`): after every genuine
data table -- tabular/tabu/longtable environments and the display-math
`\\[ \\begin{array} ... \\end{array} \\]` tables used as data tables in the
ch02 exercises -- insert

    \\par\\captionof{table}{CAPTION}\\label{tab:ID}% tab-num-auto

Data tables that already sit inside a `\\begin{table}` float WITHOUT a
\\caption get a `\\caption{...}\\label{...}% tab-num-auto` before
`\\end{table}` instead, so the float numbers normally.

Deliberately SKIPPED (layout / non-data uses):
  * cover-page and frontmatter tabulars (notation glossary, license summary:
    unnumbered front matter would yield "Table 0.x");
  * tabulars inside tikzpicture nodes and tabulars used to place tikz
    pictures side by side (those got ONE figure caption in the figure pass);
  * simplex tableaus (computational displays of the algorithm state, like
    display math -- not data tables);
  * algorithm-trace tables (Dijkstra distance rows, Kruskal/Prim/NNA edge
    work lists, Fleury layout table);
  * the two rotated-header Oregon mileage matrices (fragile rotate headers);
  * the 2x3 district grid in ch11 (a spatial diagram drawn as a table);
  * one-row/one-column formatting tabulars;
  * floats that already carry a \\caption.

Sites are enumerated explicitly below with hand-written captions derived from
the sentence that introduces each table. Each site carries a `sig` substring
that must occur near the environment; the script aborts if any signature
fails to match (protection against source drift).

Idempotent: sites already followed by a `tab-num-auto` marker are skipped.
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent
MARK = "% tab-num-auto"

TAB_RE = re.compile(r"\\begin\{(tabular|tabu|longtable)\}")
ARR_RE = re.compile(r"\\begin\{array\}")

# kind: 'tab'   -> \par\captionof{table} right after \end{tabular}
#       'arr'   -> \par\captionof{table} after the closing \] of the array
#       'float' -> \caption{...}\label{...} before the enclosing \end{table}
#       'pair'  -> like 'tab' but the caption covers this and the preceding
#                  side-by-side tabular (one number for the pair)
# occ: 1-based occurrence index of \begin{tabular|tabu|longtable} (or
#      \begin{array} for kind 'arr') in the file.
# (kind, occ, sig, caption, label-suffix)
SITES = {
 "modeling-linear-programming": [
  ("float", 1, "Tablet & Iron",
   "Units of each nutrient in, and cost of, each tablet type.", "pillContent"),
  ("float", 2, "Calories & Cost",
   "Units of each nutrient per gram, calories, and cost of each chemical.", "tab02"),
  ("float", 3, "Day of Week & Workers Required",
   "Minimum number of workers required at LP Burger each day of the week.", "tab03"),
  ("float", 4, "Tent & A & 4 & 10",
   "Weights and values of the candidate items for the camping trip.", "tab04"),
  ("float", 5, "Investment Required",
   "Required investment and projected return for each candidate project.", "tab05"),
  ("tab", 7, "Person 1 & 45",
   "Cost of assigning each person to each task, in dollars.", "tab06"),
  ("arr", 1, "Bookcase",
   "Time requirements (hours per unit) and profit per unit for each product.", "tab07"),
  ("arr", 2, "Plant 1",
   "Cases of each juice bottled per day of operation at each plant.", "tab08"),
  ("arr", 3, "Baristas required",
   "Minimum number of baristas needed each day of the week.", "tab09"),
 ],
 "software-excel": [
  ("tab", 1, "p{0.17",
   "Cost and nutrition data per serving for the five pantry staples.", "tab01"),
  ("tab", 2, "Widget",
   "Resource usage per unit and availability for widgets and gadgets.", "tab02"),
  ("tab", 3, "W1 & \\$4",
   "Shipping cost per unit, warehouse supplies, and store demands.", "tab03"),
  ("tab", 4, "Carpentry",
   "Resource requirements per item and weekly availability for tables, chairs, and desks.", "tab04"),
  ("tab", 5, "P1 & \\$4",
   "Shipping costs per unit, plant capacities, and city demands.", "tab05"),
 ],
 "modeling-sums": [
  ("tab", 1, "Production Cost",
   "Production planning data for the ten-day horizon.", "tab01"),
  ("tab", 2, "Regular Production Cost",
   "Production planning data with overtime for the ten-day horizon.", "tab02"),
  ("tab", 3, "Bus/School",
   "Cost of assigning each bus to each school.", "tab03"),
  ("float", 4, "Project~1 & Project~2",
   "Rankings given by the two teams for the two projects (lower is better).", "tab04"),
 ],
 "modeling-sums-continued": [
  ("tab", 1, "Cost per unit",
   "Transportation cost and capacity for each route.", "tab01"),
  ("tab", 2, "Optimal Flow",
   "Optimal flow on each route.", "tab02"),
  ("tab", 5, "Capacity \\(c(u,v)\\)",
   "Arc capacities and costs for the two-commodity network.", "tab03"),
  ("tab", 7, "Inventory (if applicable)",
   "Node data for the distribution network: type, inventory, connections, and capacity.", "tab04"),
  ("pair", 9, "$S_1$ & $S_2$ & $S_3$",
   "Per-unit shipping costs from factories to hubs (left) and from hubs to stores (right).", "tab05"),
 ],
 "simplex-tableau": [
  ("tab", 10, "Artificial variable leaves",
   "Interpreting the final Big-$M$ tableau: the artificial variable leaves the basis versus stays basic.", "tab01"),
 ],
 "sensitivity-LP": [
  ("tab", 1, "Basis change when",
   "Effect of each type of data change on the basic solution and the objective value.", "tab01"),
  ("tab", 2, "Perturbed coefficient",
   "Allowed perturbation ranges and their effect on the objective value.", "tab02"),
  ("tab", 3, "Obj.\\ Coeff.",
   "Variable section of the Solver sensitivity report.", "tab03"),
  ("tab", 4, "Shadow Price",
   "Constraint section of the Solver sensitivity report.", "tab04"),
 ],
 "duality": [
  ("tab", 1, "Primal (min)",
   "Correspondence between primal constraint and variable types and their dual counterparts.", "tab01"),
 ],
 "complimentary-slackness": [
  ("tab", 1, "Profit per Kit",
   "The six meal kit options and the profit per kit.", "tab01"),
  ("tab", 2, "Kitchen Time & Packaging",
   "Kitchen and packaging time required per meal kit.", "tab02"),
  ("tab", 3, "Retail Price",
   "Packaging set types and retail prices.", "tab03"),
  ("tab", 4, "Profit per Unit",
   "Profit per unit for each packaging set.", "tab04"),
  ("tab", 5, "Labor & Material",
   "Labor and material required per packaging set.", "tab05"),
 ],
 "software-python-book1": [
  ("tab", 1, "Material & 10 & 5 & 300",
   "Resource usage per unit and availability for the two products.", "tab01"),
  ("tab", 2, "M1 & M2 & M3",
   "Unit shipping costs from plants to markets.", "tab02"),
 ],
 "multi-objective-optimization_updated": [
  ("tab", 2, "Contract & G",
   "Cost and delivery time for the five supplier contracts.", "tab01"),
  ("tab", 3, "Design & A",
   "Cost and emissions for the six candidate designs.", "tab02"),
  ("tab", 4, "Accessibility Score",
   "Cost and accessibility score for each road improvement project.", "tab03"),
  ("tab", 5, "Emissions, tons",
   "Pareto optimal solutions found by the weighted-sum method.", "tab04"),
  ("tab", 6, "$\\varepsilon$",
   "Solutions of the $\\varepsilon$-constraint problem as $\\varepsilon$ varies.", "tab05"),
 ],
 "graphtheory-dor1": [
  ("tab", 10, "Baltimore",
   "Travel times in hours between processing centers, with three hours added for processing.", "tab01"),
  ("tab", 20, "Plano&Mesquite",
   "Approximate driving times in minutes between five Dallas-area cities.", "tab02"),
  ("tab", 21, "Honolulu&London",
   "One-way airfares between five cities.", "tab03"),
  ("tab", 24, "&A&B&C&D&E&F&G&H&I",
   "Friendship table: an X marks pairs of people who are friends.", "tab04"),
  ("tab", 27, "Circuit & Weight",
   "Possible Hamiltonian circuits of the graph and their total weights.", "tab05"),
  ("tab", 28, "Unique Hamiltonian Circuits",
   "Growth in the number of unique Hamiltonian circuits as the number of cities increases.", "tab06"),
  ("tab", 29, "&A&B&C&D&E&F",
   "Distances between the six computers in the office network.", "tab07"),
 ],
 "integerProgrammingFormulations-book1": [
  ("tab", 2, "Toll",
   "Directed arcs between the boroughs and whether each crossing charges a toll.", "tab01"),
  ("tab", 5, "Tent & 5 & 8",
   "Weights and values of the items available to the hiker.", "tab02"),
  ("tab", 6, "Payout",
   "Package weights and payouts for the courier van.", "tab03"),
  ("tab", 8, "Regions Served",
   "Fixed opening costs and regions served for each candidate warehouse.", "tab04"),
  ("tab", 9, "NPV",
   "Net present values and cash outlays for the five candidate projects (in \\$1000s).", "tab05"),
  ("tab", 10, "Center 1",
   "Opening costs, capacities, per-unit serving costs, and store demands for the two candidate centers.", "tab06"),
  ("tab", 11, "Job 1 & 3 & 2 & 4",
   "Processing times for the two jobs on the three machines.", "tab07"),
 ],
}

# the pillContent float has an orphaned \label (no caption to bind to);
# it is removed and re-attached to the new \caption.
ORPHAN_LABELS = {"modeling-linear-programming": "\\label{tab:pillContent}\n"}


def env_end(text, start, name):
    """Index one past \\end{name}, tolerating one level of nesting."""
    b, e = "\\begin{%s}" % name, "\\end{%s}" % name
    depth, j = 1, start + len(b)
    while depth:
        nb = text.find(b, j)
        ne = text.find(e, j)
        if ne < 0:
            raise ValueError(f"unbalanced {name} at {start}")
        if 0 <= nb < ne:
            depth += 1
            j = nb + len(b)
        else:
            depth -= 1
            j = ne + len(e)
    return j


def main():
    content = [l.strip() for l in open(BUILD / "content-files.txt") if l.strip()]
    by_stem = {Path(p).stem: Path(p) for p in content}
    total = 0
    report = {}
    for stem, sites in SITES.items():
        path = by_stem[stem]
        text = path.read_text(encoding="utf-8")
        orphan = ORPHAN_LABELS.get(stem)
        if orphan and orphan in text:
            text = text.replace(orphan, "", 1)
        tabs = list(TAB_RE.finditer(text))
        arrs = list(ARR_RE.finditer(text))
        inserts = []
        n = 0
        for kind, occ, sig, cap, labsuf in sites:
            m = (arrs if kind == "arr" else tabs)[occ - 1]
            window = text[max(0, m.start() - 300):m.start() + 500]
            if sig not in window:
                sys.exit(f"{stem}: sig {sig!r} not found near "
                         f"{kind} #{occ} -- source drifted, aborting")
            lab = labsuf if labsuf == "pillContent" else f"{stem}-{labsuf}"
            if kind == "arr":
                e = env_end(text, m.start(), "array")
                close = text.find("\\]", e)
                if close < 0:
                    sys.exit(f"{stem}: no closing \\] after array #{occ}")
                pos = close + 2
                ins = f"\n\\par\\captionof{{table}}{{{cap}}}\\label{{tab:{lab}}}{MARK}\n"
            elif kind == "float":
                e = env_end(text, m.start(), m.group(1))
                pos = text.find("\\end{table}", e)
                if pos < 0:
                    sys.exit(f"{stem}: {kind} #{occ} not inside a table float")
                ins = f"\\caption{{{cap}}}\\label{{tab:{lab}}}{MARK}\n"
            else:  # tab / pair
                pos = env_end(text, m.start(), m.group(1))
                ins = f"\n\\par\\captionof{{table}}{{{cap}}}\\label{{tab:{lab}}}{MARK}\n"
            if MARK in text[pos:pos + 250]:
                continue
            inserts.append((pos, ins))
            n += 1
        for pos, ins in sorted(inserts, key=lambda t: -t[0]):
            text = text[:pos] + ins + text[pos:]
        if inserts or (orphan and orphan not in text):
            path.write_text(text, encoding="utf-8")
        report[stem] = n
        total += n
    for stem, n in report.items():
        print(f"{stem}: {n} tables captioned")
    print(f"TOTAL: {total}")


if __name__ == "__main__":
    main()
