#!/usr/bin/env python3
"""Find every figure referenced by the preprocessed src/ files, and make sure
a raster version exists for the EPUB build.

- PDF figures are converted to PNG in figs-conv/ (same basename).
- PNG/JPG figures are left where they are (graphicspath finds them).
Prints any figure name that cannot be resolved at all.
"""
import re, subprocess, sys
from pathlib import Path

BUILD = Path(__file__).resolve().parent.parent
SRC = BUILD / "src"
CONV = BUILD / "figs-conv"
CONV.mkdir(exist_ok=True)
BASE = BUILD.parent / "Intro-Math-Programming" / "baseText"
STATIC = BASE / "optimization/figures/figures-static"
SOURCE = BASE / "optimization/figures/figures-source"
ROOT = BUILD.parent
DIRS = [STATIC, SOURCE, SOURCE / "tikz",
        BASE, BASE / "Figures",
        BASE / "graph-theory-graphics",
        BASE / "external-sources",
        BASE / "external-sources" / "aFirstCourseLinearAlgebra",
        ROOT]

MACROS = r"(?:includegraphicstatic|includegraphicsource|refincludefigurestatic|" \
         r"includefigurestatic|includefiguresource|includegraphicbook|" \
         r"includegraphicbooksource|includefigurebook|includefigurebooksource)"

names = set()
for f in SRC.glob("*.tex"):
    t = re.sub(r"(?<!\\)%.*", "", f.read_text(errors="ignore"))
    for m in re.finditer(r"\\" + MACROS + r"(?:\[[^\]]*\])*\{([^}]+)\}", t):
        names.add(m.group(1).strip())
    for m in re.finditer(r"\\altincludegraphics(?:\[[^\]]*\])?\{([^}]+)\}\{[^}]*\}", t):
        names.add(m.group(1).strip())
    for m in re.finditer(r"\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}", t):
        n = m.group(1).strip()
        if not n.startswith("figs/"):
            names.add(n)

unresolved, converted, ok = [], 0, 0
for name in sorted(names):
    p = Path(name)
    stem, suf = p.stem, p.suffix.lower()
    hit = None
    for d in DIRS:
        cands = []
        if suf:
            cands.append(d / name)
        for ext in (".png", ".jpg", ".jpeg", ".JPG", ".pdf"):
            cands += [d / (name + ext), d / p.parent / (stem + ext)]
        for c in cands:
            if c.exists():
                hit = c
                break
        if hit:
            break
    if not hit:
        unresolved.append(name)
        continue
    if hit.suffix.lower() == ".pdf":
        out = CONV / (stem + ".png")
        if not out.exists():
            subprocess.run(["pdftocairo", "-png", "-singlefile", "-r", "150",
                            str(hit), str(CONV / stem)], capture_output=True)
        converted += 1
    elif hit.suffix.lower() == ".eps":
        out = CONV / (stem + ".png")
        if not out.exists():
            subprocess.run(["convert", "-density", "150", str(hit),
                            str(out)], capture_output=True)
        converted += 1
    else:
        # copy non-pdf rasters into figs-conv under their basename so
        # subpath names like wiki/File/x.png resolve from graphicspath
        out = CONV / (stem + hit.suffix)
        if not out.exists():
            out.write_bytes(hit.read_bytes())
        ok += 1

print(f"figures referenced: {len(names)}; raster: {ok}; pdf->png: {converted}")
if unresolved:
    print("UNRESOLVED:")
    for n in unresolved:
        print(" ", n)
