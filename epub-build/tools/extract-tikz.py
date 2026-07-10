#!/usr/bin/env python3
"""Extract tikzpicture environments from LaTeX sources, compile each to PNG,
and write preprocessed copies with \\includegraphics replacements.

Usage: python3 extract-tikz.py <srcfile.tex> ... (paths relative to book dir)
Outputs: ../src/<name>.tex (preprocessed), ../figs/<name>-tikzNN.{tex,pdf,png}
"""
import re, subprocess, sys, os
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
\usetikzlibrary{arrows, automata, backgrounds, calendar, chains, decorations,
    matrix, mindmap, patterns, petri, positioning, shadows, shapes.geometric,
    trees, shapes, decorations.pathreplacing, calc, tikzmark, arrows.meta}
\newcommand{\st}{\text{ s.t. }}
\newcommand{\x}{\mathbf{x}}
\renewcommand{\b}{\mathbf{b}}
\newcommand{\A}{\mathbf{A}}
\newcommand{\R}{\mathbb{R}}
\newcommand{\RR}{\mathbb{R}}
\newcommand{\Z}{\mathbb{Z}}
\newcommand{\ZZ}{\mathbb{Z}}
\begin{document}
"""

BEGIN = "\\begin{tikzpicture}"
END = "\\end{tikzpicture}"

def find_blocks(text):
    """Yield (start, end) spans of balanced tikzpicture environments."""
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

def process(path_str):
    src = Path(path_str)
    text = src.read_text(encoding="utf-8")
    stem = src.stem
    failed = []
    out, pos, count = [], 0, 0
    for s, e in find_blocks(text):
        out.append(text[pos:s])
        count += 1
        name = f"{stem}-tikz{count:02d}"
        (FIGS / f"{name}.tex").write_text(
            SNIPPET_PREAMBLE + text[s:e] + "\n\\end{document}\n",
            encoding="utf-8")
        if compile_snippet(name):
            out.append("\\includegraphics[width=0.85\\linewidth]{figs/%s.png}"
                       % name)
        else:
            failed.append(name)
            out.append("\\begin{center}\\fbox{[figure %s: TikZ compile failed]}"
                       "\\end{center}" % name)
        pos = e
    out.append(text[pos:])
    new_text = "".join(out)
    (SRC_OUT / src.name).write_text(new_text, encoding="utf-8")
    print(f"{src.name}: {count} tikzpictures, {len(failed)} failed {failed}")

def compile_snippet(name):
    r = subprocess.run(
        ["pdflatex", "-interaction=batchmode", "-halt-on-error", f"{name}.tex"],
        cwd=FIGS, capture_output=True, timeout=120)
    pdf = FIGS / f"{name}.pdf"
    if r.returncode != 0 or not pdf.exists():
        return False
    r2 = subprocess.run(
        ["pdftocairo", "-png", "-singlefile", "-r", "150",
         f"{name}.pdf", name], cwd=FIGS, capture_output=True)
    return r2.returncode == 0 and (FIGS / f"{name}.png").exists()

if __name__ == "__main__":
    for p in sys.argv[1:]:
        process(p)
    # cleanup aux
    for ext in ("aux", "log"):
        for f in FIGS.glob(f"*.{ext}"):
            f.unlink()
