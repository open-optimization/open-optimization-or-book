#!/usr/bin/env python3
"""Give every display image in Book 1 a figure number.

Inserts `\\par\\captionof{figure}{...}\\label{fig:...}% fig-num-auto` after
every inline tikzpicture / \\altincludegraphics / \\includegraphicbook /
\\includetikz display image that is not already inside a figure/wrapfigure/
table environment, plus the genuine LaTeX picture-environment sketches in the
linear-algebra appendix. Two existing captionless figure environments (the
jssp Gantt chart and the feasiblePolytope subfigure pair) get a normal
\\caption added instead.

Idempotent: sites already followed by a `fig-num-auto` marker are skipped.

Caption sources, in priority order:
  1. handcaps.json          (hand-written captions, keyed by figs/... name)
  2. alt-text-manual.json   (first sentence)
  3. alt-map.json           (first sentence; "Diagram from this section"
                             placeholders are never used)
The tikz target list (which tikzpictures are display images that currently
lack numbers) comes from extra_imgs.json (entries with src "figs/...").
Blank tikzmark overlays (simplex-basis-driven tikz11-14) are excluded.
"""
import json, re, sys, os
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent
BASE = BUILD.parent / "Intro-Math-Programming" / "baseText"
MARK = "% fig-num-auto"

BEGIN = "\\begin{tikzpicture}"
END = "\\end{tikzpicture}"

# blank tikzmark overlays: never caption
EXCLUDE_TIKZ = {"simplex-basis-driven-tikz11", "simplex-basis-driven-tikz12",
                "simplex-basis-driven-tikz13", "simplex-basis-driven-tikz14"}

# ---------------------------------------------------------------- helpers

def load_json(name):
    for p in (Path("/tmp") / name, BUILD / name):
        if p.exists():
            return json.load(open(p))
    sys.exit(f"missing {name}")

def find_tikz_blocks(text):
    """Same balanced counting as tools/extract-tikz-all.py (raw text)."""
    i = 0
    while True:
        s = text.find(BEGIN, i)
        if s < 0:
            return
        depth, j = 1, s + len(BEGIN)
        while depth > 0:
            nb = text.find(BEGIN, j)
            ne = text.find(END, j)
            if ne < 0:
                raise ValueError("unbalanced tikzpicture")
            if 0 <= nb < ne:
                depth += 1; j = nb + len(BEGIN)
            else:
                depth -= 1; j = ne + len(END)
        yield s, j
        i = j

def protected_spans(text):
    """figure/figure*/wrapfigure/table/table* spans (non-nested pairing)."""
    spans = []
    for env in ("figure*", "figure", "wrapfigure", "table*", "table"):
        b, e = "\\begin{%s}" % env, "\\end{%s}" % env
        i = 0
        while True:
            s = text.find(b, i)
            if s < 0:
                break
            t = text.find(e, s)
            if t < 0:
                break
            spans.append((s, t + len(e)))
            i = t + len(e)
    return spans

def in_spans(pos, spans):
    return any(s <= pos < t for s, t in spans)

def is_commented(text, pos):
    ls = text.rfind("\n", 0, pos) + 1
    line = text[ls:pos]
    return bool(re.search(r"(?<!\\)%", line))

def balanced_group(text, i):
    """text[i] == '{'; return index one past the matching '}'."""
    assert text[i] == "{"
    d, j = 1, i + 1
    while d:
        if text[j] == "{": d += 1
        elif text[j] == "}": d -= 1
        j += 1
    return j

def first_sentence(s):
    s = " ".join(s.split())
    m = re.split(r"(?<=[.!?])\s+(?=[A-Z(])", s)
    out = m[0].strip()
    if len(out) > 110:
        cut = out[:100]
        if " " in cut:
            cut = cut[:cut.rfind(" ")]
        out = cut.rstrip(" ,;:") + "..."
    return out

def esc(s):
    s = s.replace("\\", "")  # captions sources are plain text
    for c in "&%#$_":
        s = s.replace(c, "\\" + c)
    return s

# ---------------------------------------------------------------- caption data

extra = load_json("extra_imgs.json")
hand = load_json("handcaps.json")
manual = json.load(open(BUILD / "alt-text-manual.json"))
altmap = json.load(open(BUILD / "alt-map.json"))

def tikz_caption(name):
    key = f"figs/{name}.png"
    for src in (hand.get(key), manual.get(key), altmap.get(key)):
        if src and "Diagram from this section" not in src:
            return esc(first_sentence(src))
    for e in extra:
        if e["src"] == key and "Diagram from this section" not in e.get("alt", ""):
            return esc(first_sentence(e["alt"]))
    return None

tikz_targets = {}   # stem -> set of 1-based indices
for e in extra:
    src = e["src"]
    if not src.startswith("figs/"):
        continue
    name = src[len("figs/"):-4]
    if name in EXCLUDE_TIKZ:
        continue
    stem, idx = name.rsplit("-tikz", 1)
    tikz_targets.setdefault(stem, set()).add(int(idx))

# genuine picture-environment sketches (file stem -> ordered captions/labels)
PICTURE_SITES = {
    "systemsofequationsGeometry": [
        ("Two planes intersecting in a line.", "planes-intersect-line"),
        ("Three planes with no common point of intersection.", "planes-no-common-point"),
        ("Three planes intersecting in a single point.", "planes-single-point"),
        ("A third plane through the line of intersection of two planes.", "planes-new-plane"),
    ],
    "RnVectorsAdditionMeaning": [
        ("Vector addition in three dimensions: u + v as the diagonal of the parallelepiped.", "vector-addition-3d"),
    ],
    "RnVectorsLength": [
        ("The distance between two points in the plane.", "distance-2d"),
        ("The distance between two points in three dimensions.", "distance-3d"),
    ],
}

# existing captionless figure environments: add a \caption inside instead
FIGURE_CAPTIONS = {  # file stem -> [(anchor regex within figure body, caption, label)]
    "integerProgrammingFormulations-book1": [
        (r"\\includetikz\[width=0\.8\\textwidth\]\{optimization/figures/figures-static/jssp\}",
         "Job shop scheduling solution shown as a Gantt chart.", "jssp"),
    ],
    "simplex-basis-driven": [
        (r"foundationsAppliedMathematicsLabs/Volume2/Simplex/figures/feasiblePolytope",
         "Feasible regions of linear programs in two and three dimensions; the simplex method moves along the edges.", "feasiblePolytope"),
    ],
    "formalize-LP": [
        (r"\\caption\{Convex Set\}",
         "A convex set and a non-convex set.", "convex-nonconvex-examples"),
        (r"\\node\[red\] at \(0,-1\.4\) \{\\small Ball\};",
         "Examples of convex sets: a hyperplane, a halfspace, a polyhedron, a ball, and a second-order cone.", "convex-set-examples"),
    ],
}

# captions for \includegraphicbook / \includetikz sites, from the metadata bib
STATIC_CAPTIONS = {
    "facility-location": "A network diagram for facility location: three potential distribution centers connected to stores.",
    "pwl-plot": "Piecewise linear function.",
    "jssp-duplo": "Gantt chart of the Duplo job shop scheduling solution with three machines and four color-coded jobs.",
    "jssp-duplo-actual": "Photograph of Duplo building blocks arranged as a physical demonstration of the job shop schedule.",
    # Book 2 (captions derived from 00_METADATA.bib abstracts + surrounding text)
    "branch-and-bound1": "Feasible region of the LP relaxation with integer lattice points shown as dots; a red X marks the fractional LP optimal solution.",
    "branch-and-bound2": "Branch and bound after branching: the relaxation is split into two subregions by the branching constraint, each with its own LP optimum.",
    "branch-and-bound3": "A later stage of branch and bound: a green star marks an integer feasible solution and a red X marks a fractional solution being pruned.",
    "knapsack-fig": "The pattern polytope P: each integer point in the blue triangle represents a feasible cut pattern.",
    "knapsack-fig-opt": "Maximal cut patterns in the pattern polytope: only the highlighted integer points are needed.",
    "m-tsp_solution": "Solution of a multiple traveling salesman problem on a street map: colored routes assign customer sites to vehicles starting from a common depot.",
    "local-min": "A function with several critical points, illustrating the difference between local minimizers and the global minimizer.",
    "kkt-optimal": "A constrained minimum where both constraints are active: the negative objective gradient lies in the cone of the active constraint gradients, so the KKT conditions hold.",
    "kkt-non-optimal1": "A boundary point where only the halfspace constraint is active and the KKT conditions fail: sliding along the boundary improves the objective.",
    "kkt-non-optimal2": "A point on the disk boundary where the negative objective gradient is not a nonnegative multiple of the active constraint gradient, so the point is not optimal.",
}

# tikz pictures living in tabular cells get ONE caption after the tabular
# (a figure number per table cell would be wrong), keyed by (stem, first idx)
TABULAR_GROUP_CAPTIONS = {
    ("graphtheory-dor1", 6): ("Examples of vertices of degree 0 through 4.",
                              "graphtheory-dor1-degrees"),
    ("graphtheory-dor1", 42): ("Three five-vertex graphs for the connectedness exercise.",
                               "graphtheory-dor1-connected-a"),
    ("graphtheory-dor1", 45): ("Three more graphs for the connectedness exercise.",
                               "graphtheory-dor1-connected-b"),
}

def tabular_spans(text):
    spans = []
    for m in re.finditer(r"\\begin\{(tabular|longtable|array)\}", text):
        e = text.find("\\end{%s}" % m.group(1), m.end())
        if e >= 0:
            spans.append((m.start(), e + len("\\end{%s}" % m.group(1))))
    return spans

# ---------------------------------------------------------------- site discovery

def macro_sites(text):
    """Yield (start, end, kind, path, desc) for display-image macro calls."""
    pat = re.compile(r"\\(altincludegraphics|includegraphicstatic|"
                     r"includegraphicbooksource|includegraphicbook|"
                     r"includetikz|includegraphics)\b")
    for m in pat.finditer(text):
        kind = m.group(1)
        j = m.end()
        while j < len(text) and text[j] in " \t":
            j += 1
        if j < len(text) and text[j] == "[":
            j = text.find("]", j) + 1
        while j < len(text) and text[j] in " \t\n":
            j += 1
        if j >= len(text) or text[j] != "{":
            continue
        g1e = balanced_group(text, j)
        path = text[j + 1:g1e - 1]
        desc = None
        end = g1e
        if kind == "altincludegraphics":
            k = g1e
            while k < len(text) and text[k] in " \t\n":
                k += 1
            if k < len(text) and text[k] == "{":
                g2e = balanced_group(text, k)
                desc = text[k + 1:g2e - 1]
                end = g2e
        yield m.start(), end, kind, path, desc

def insertion_point(text, end):
    """Advance past a closing group brace (\\scalebox{..}{ <site> }) and past a
    trailing \\\\ so the caption never starts a line with \\\\ after \\par."""
    j = end
    while j < len(text) and text[j] in " \t\n":
        j += 1
    if j < len(text) and text[j] == "}":
        k = j + 1
        while k < len(text) and text[k] in " \t\n":
            k += 1
        if k >= len(text) or text.startswith("\\end{", k) or text.startswith("\\\\", k):
            end, j = j + 1, k
    if text.startswith("\\\\", j):
        end = j + 2
    return end

# ---------------------------------------------------------------- main

content = [l.strip() for l in open(BUILD / "content-files.txt") if l.strip()]
by_stem = {Path(p).stem: Path(p) for p in content}
SKIP_FILES = {"LP-front-matter"}          # cover-page images: no figure numbers

existing_labels = set()
for p in content:
    existing_labels |= set(re.findall(r"\\label\{fig:([^}]*)\}",
                                      open(p, encoding="utf-8").read()))

def unique_label(base):
    lab = base
    while lab in existing_labels:
        lab += "-b"
    existing_labels.add(lab)
    return lab

report = {}
for stem, path in sorted(by_stem.items()):
    if stem in SKIP_FILES:
        continue
    text = path.read_text(encoding="utf-8")
    spans = protected_spans(text)
    tspans = tabular_spans(text)
    tikzspans = list(find_tikz_blocks(text))
    inserts = []   # (pos, string)
    groups = {}    # tabular span -> [tikz idx]
    n = 0

    # 1. tikzpictures
    for idx, (s, e) in enumerate(tikzspans, start=1):
        if idx not in tikz_targets.get(stem, set()):
            continue
        name = f"{stem}-tikz{idx:02d}"
        if in_spans(s, spans):
            print(f"  !! {name} inside figure/table span, skipped")
            continue
        tsp = next((sp for sp in tspans if sp[0] <= s < sp[1]), None)
        if tsp:
            groups.setdefault(tsp, []).append(idx)
            continue
        if MARK in text[e:e + 400]:
            continue
        cap = tikz_caption(name)
        if not cap:
            print(f"  !! {name}: no caption source, skipped")
            continue
        lab = unique_label(name)
        pos = insertion_point(text, e)
        inserts.append((pos, f"\\par\\captionof{{figure}}{{{cap}}}\\label{{fig:{lab}}}{MARK}\n"))
        n += 1

    # 1b. one caption per tabular that holds display tikz pictures
    for (ts, te), idxs in sorted(groups.items()):
        pos = te
        while pos < len(text) and text[pos] in " \t":
            pos += 1
        if text[pos:pos + 2] == "\\\\":       # keep tabular's line break intact
            pos += 2
        if MARK in text[pos:pos + 400]:
            continue
        cap, labbase = TABULAR_GROUP_CAPTIONS.get(
            (stem, min(idxs)),
            (tikz_caption(f"{stem}-tikz{min(idxs):02d}"), f"{stem}-tikz{min(idxs):02d}"))
        lab = unique_label(labbase)   # caption already escaped / plain
        inserts.append((pos, f"\\par\\captionof{{figure}}{{{cap}}}\\label{{fig:{lab}}}{MARK}\n"))
        n += 1

    # 2/3. macro calls
    for s, e, kind, mpath, desc in macro_sites(text):
        if is_commented(text, s) or in_spans(s, spans):
            continue
        # graphics used inside tikz nodes or as table-of-images cells never
        # get individual numbers (one caption per group, added by hand)
        if in_spans(s, tikzspans) or in_spans(s, tspans):
            continue
        base = os.path.splitext(os.path.basename(mpath))[0]
        if MARK in text[e:e + 400]:
            continue
        if kind == "altincludegraphics":
            if not desc:
                continue
            cap = esc(first_sentence(desc))
        else:
            cap = STATIC_CAPTIONS.get(base)
            if not cap:
                print(f"  !! {kind}{{{base}}}: no caption, skipped")
                continue
        lab = unique_label(base)
        pos = insertion_point(text, e)
        inserts.append((pos, f"\\par\\captionof{{figure}}{{{cap}}}\\label{{fig:{lab}}}{MARK}\n"))
        n += 1

    # 4. picture environments
    if stem in PICTURE_SITES:
        caps = PICTURE_SITES[stem]
        tops, i = [], 0
        while True:
            s = text.find("\\begin{picture}", i)
            if s < 0:
                break
            d, j = 1, s + len("\\begin{picture}")
            while d:
                nb = text.find("\\begin{picture}", j)
                ne = text.find("\\end{picture}", j)
                if 0 <= nb < ne:
                    d += 1; j = nb + len("\\begin{picture}")
                else:
                    d -= 1; j = ne + len("\\end{picture}")
            tops.append((s, j)); i = j
        if len(tops) != len(caps):
            print(f"  !! {stem}: {len(tops)} picture envs, {len(caps)} captions -- skipped")
        else:
            for (s, e), (cap, labbase) in zip(tops, caps):
                if MARK in text[e:e + 400]:
                    continue
                lab = unique_label(labbase)
                inserts.append((e, f"\\par\\captionof{{figure}}{{{esc(cap)}}}\\label{{fig:{lab}}}{MARK}\n"))
                n += 1

    # 5. captions for existing captionless figure environments
    for anchor, cap, labbase in FIGURE_CAPTIONS.get(stem, []):
        m = re.search(anchor, text)
        if not m:
            print(f"  !! {stem}: anchor {anchor!r} not found")
            continue
        fig_end = text.find("\\end{figure}", m.end())
        fig_start = text.rfind("\\begin{figure", 0, m.start())
        if fig_end < 0 or fig_start < 0 or MARK in text[fig_start:fig_end + 60]:
            continue
        # a \caption outside any subfigure means the figure is already numbered
        body = re.sub(r"\\begin\{subfigure\}.*?\\end\{subfigure\}", "",
                      text[fig_start:fig_end], flags=re.S)
        if "\\caption" in body:
            continue
        lab = unique_label(labbase)
        inserts.append((fig_end, f"\\caption{{{esc(cap)}}}\\label{{fig:{lab}}}{MARK}\n"))
        n += 1

    if inserts:
        for pos, ins in sorted(inserts, key=lambda t: -t[0]):
            text = text[:pos] + ins + text[pos:]
        path.write_text(text, encoding="utf-8")
        report[stem] = n

total = sum(report.values())
for stem, n in sorted(report.items()):
    print(f"{stem}: {n} sites captioned")
print(f"TOTAL: {total}")
