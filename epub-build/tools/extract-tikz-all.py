#!/usr/bin/env python3
"""Whole-book variant of extract-tikz.py, split into resumable phases so it
can run in short shells and in parallel.

Phase "snippets": write figs/<name>-tikzNN.tex for every tikzpicture in the
    given sources AND write preprocessed src/<name>.tex that reference
    figs/<name>-tikzNN.png unconditionally.
Phase "compile":  compile up to --max snippets that lack a PNG, in parallel.
Phase "status":   report remaining uncompiled snippets.
Phase "placeholders": for any snippet still lacking a PNG, generate a gray
    placeholder PNG so the book build never breaks on a missing file.

Usage:
  extract-tikz-all.py snippets <file.tex> ...
  extract-tikz-all.py compile [--max N] [--jobs J]
  extract-tikz-all.py status
  extract-tikz-all.py placeholders
"""
import re, subprocess, sys, os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent
SRC_OUT = BUILD / "src"
FIGS = BUILD / "figs"
SRC_OUT.mkdir(exist_ok=True)
FIGS.mkdir(exist_ok=True)

SNIPPET_PREAMBLE = r"""\documentclass[border=4pt]{standalone}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{xcolor,colortbl,array,booktabs,multirow}
\usepackage{tikz}
\usepackage{pgfplots}
\pgfplotsset{compat=1.16}
\usetikzlibrary{arrows, automata, backgrounds, calendar, chains, decorations,
    matrix, mindmap, patterns, petri, positioning, shadows, shapes.geometric,
    trees, shapes, decorations.pathreplacing, calc, tikzmark, arrows.meta,
    intersections, fit, graphs, quotes, angles, decorations.markings}
\newcommand{\st}{\text{ s.t. }}
\newcommand{\x}{\mathbf{x}}
\renewcommand{\b}{\mathbf{b}}
\renewcommand{\c}{\mathbf{c}}
\newcommand{\A}{\mathbf{A}}
\newcommand{\y}{\mathbf{y}}
\newcommand{\z}{\mathbf{z}}
\newcommand{\R}{\mathbb{R}}
\newcommand{\RR}{\mathbb{R}}
\newcommand{\Z}{\mathbb{Z}}
\newcommand{\ZZ}{\mathbb{Z}}
\newcommand{\npcomplete}{NP-complete}
\providecommand{\true}{\text{TRUE}}
\providecommand{\false}{\text{FALSE}}
\tikzset{vertex/.style={circle,fill=black!25,minimum size=20pt,inner sep=0pt},
    edge/.style={draw,thick,-},weight/.style={font=\small},
    selected vertex/.style={vertex, fill=red!24},
    selected edge/.style={draw,line width=2pt,-,red!50},
    ignored edge/.style={draw,line width=2pt,-,black!20}}
\newcommand{\vect}{\vec}
\providecommand{\ds}{\displaystyle}
\providecommand{\longvect}{\overrightarrow}
\usepackage[normalem]{ulem}
\definecolor{ocre}{RGB}{243,102,25}
\providecommand{\leftB}{\left[}
\providecommand{\rightB}{\right]}
\tikzset{directed/.style={postaction={decorate,decoration={markings,mark=at position .65 with {\arrow{>}}}}},
    directed1/.style={postaction={decorate,decoration={markings,mark=at position .65 with {\arrow{>}}}}}}
\begin{document}
"""

BEGIN = "\\begin{tikzpicture}"
END = "\\end{tikzpicture}"

def find_blocks(text):
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
                depth += 1
                j = nb + len(BEGIN)
            else:
                depth -= 1
                j = ne + len(END)
        yield s, j
        i = j

def phase_snippets(paths):
    for path_str in paths:
        src = Path(path_str)
        text = src.read_text(encoding="utf-8")
        stem = src.stem
        out, pos, count = [], 0, 0
        for s, e in find_blocks(text):
            out.append(text[pos:s])
            count += 1
            name = f"{stem}-tikz{count:02d}"
            (FIGS / f"{name}.tex").write_text(
                SNIPPET_PREAMBLE + text[s:e] + "\n\\end{document}\n",
                encoding="utf-8")
            out.append("\\includegraphics[width=0.85\\linewidth]{figs/%s.png}" % name)
            pos = e
        out.append(text[pos:])
        (SRC_OUT / src.name).write_text("".join(out), encoding="utf-8")
        print(f"{src.name}: {count} tikzpictures")

def compile_one(name):
    r = subprocess.run(
        ["pdflatex", "-interaction=batchmode", "-halt-on-error", f"{name}.tex"],
        cwd=FIGS, capture_output=True, timeout=90)
    pdf = FIGS / f"{name}.pdf"
    if r.returncode != 0 or not pdf.exists():
        return name, False
    r2 = subprocess.run(
        ["pdftocairo", "-png", "-singlefile", "-r", "150", f"{name}.pdf", name],
        cwd=FIGS, capture_output=True)
    return name, r2.returncode == 0 and (FIGS / f"{name}.png").exists()

def pending():
    return sorted(p.stem for p in FIGS.glob("*-tikz[0-9][0-9].tex")
                  if not (FIGS / f"{p.stem}.png").exists())

def phase_compile(maxn, jobs):
    todo = pending()[:maxn]
    ok = fail = 0
    with ThreadPoolExecutor(max_workers=jobs) as exe:
        for name, success in exe.map(compile_one, todo):
            if success: ok += 1
            else: fail += 1; print("FAIL", name)
    print(f"compiled {ok} ok, {fail} failed, {len(pending())} remaining")
    for ext in ("aux", "log"):
        for f in FIGS.glob(f"*.{ext}"):
            f.unlink()

def phase_placeholders():
    from PIL import Image, ImageDraw
    n = 0
    for name in pending():
        img = Image.new("RGB", (900, 300), (240, 240, 240))
        d = ImageDraw.Draw(img)
        d.text((30, 130), f"[Figure {name}: see the PDF edition]", fill=(90, 90, 90))
        img.save(FIGS / f"{name}.png")
        n += 1
    print(f"placeholders written: {n}")

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "snippets":
        phase_snippets(sys.argv[2:])
    elif cmd == "compile":
        maxn = 10**9; jobs = 6
        args = sys.argv[2:]
        if "--max" in args: maxn = int(args[args.index("--max")+1])
        if "--jobs" in args: jobs = int(args[args.index("--jobs")+1])
        phase_compile(maxn, jobs)
    elif cmd == "status":
        p = pending()
        print(len(p), "pending"); [print(" ", x) for x in p[:20]]
    elif cmd == "placeholders":
        phase_placeholders()
