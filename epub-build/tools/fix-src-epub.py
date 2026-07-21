#!/usr/bin/env python3
"""EPUB-specific source fixups, run on src/ after extract-tikz snippets.

1. Strip \\colorbox{color}{content} -> content (tex4ht emits broken spans for
   '!'-mixed color expressions inside math).
2. Resize extracted TikZ images to their natural size (px/150 inch), capped at
   \\linewidth, so tiny pictures are not blown up to 85% of the screen.
3. checkpoint-answers.tex: \\Cref{lc:x} -> Checkpoint~\\ref{lc:x}; drop
   " (page~\\pageref{...})" (page numbers do not exist in a reflowable EPUB).
"""
import re, sys
from pathlib import Path
from PIL import Image

BUILD = Path(__file__).resolve().parent.parent
SRC = BUILD / "src"
FIGS = BUILD / "figs"

def strip_colorbox(t):
    out = []
    i = 0
    while True:
        j = t.find(r"\colorbox{", i)
        if j < 0:
            out.append(t[i:])
            return "".join(out)
        out.append(t[i:j])
        # skip \colorbox{color}
        k = j + len(r"\colorbox{")
        d = 1
        while d:
            if t[k] == "{": d += 1
            elif t[k] == "}": d -= 1
            k += 1
        # content group
        assert t[k] == "{", "colorbox without content group"
        k2 = k + 1
        d = 1
        while d:
            if t[k2] == "{": d += 1
            elif t[k2] == "}": d -= 1
            k2 += 1
        out.append(t[k+1:k2-1])
        i = k2

def resize_figs(t):
    def repl(m):
        name = m.group(1)
        png = FIGS / (name + ".png")
        if png.exists():
            w = Image.open(png).size[0] / 150.0   # inches at extraction dpi
            if w <= 5.2:
                return "\\includegraphics[width=%.2fin]{figs/%s.png}" % (w, name)
        return "\\includegraphics[width=\\linewidth]{figs/%s.png}" % name
    return re.sub(r"\\includegraphics\[width=0\.85\\linewidth\]\{figs/([^}]+)\.png\}",
                  repl, t)

for f in sorted(SRC.glob("*.tex")):
    t = f.read_text()
    orig = t
    t = strip_colorbox(t)
    t = resize_figs(t)
    if f.name == "checkpoint-answers.tex":
        t = re.sub(r"\\Cref\{(lc:[^}]+)\}", r"Checkpoint~\\ref{\1}", t)
        t = re.sub(r"\s*\(page~\\pageref\{[^}]+\}\)", "", t)
    if t != orig:
        f.write_text(t)
        print("fixed", f.name)
