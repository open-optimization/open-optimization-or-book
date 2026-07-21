#!/usr/bin/env python3
"""Build figs/<name>.png -> alt-text map for the EPUB.

Matches each extracted tikzpicture to the book's curated alt-text drafts
(baseText/book/alt-text-drafts/*.json) via the md5 content hash embedded
in the draft keys (tikz-<file>-<nn>-<md5[:8]>). Falls back to
alt-text-manual.json for figures without a curated draft.

Output: alt-map.json  { "figs/Section2-tikz01.png": "alt text", ... }
"""
import hashlib, json, glob, sys, os
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent
REPO = BUILD.parent
BOOK = REPO / "Intro-Math-Programming/baseText/book"
CH02 = BOOK / "part1-linear-programming/ch02-modeling"

BEGIN, END = "\\begin{tikzpicture}", "\\end{tikzpicture}"

def blocks(text):
    i = 0
    while True:
        s = text.find(BEGIN, i)
        if s < 0:
            return
        depth, j = 1, s + len(BEGIN)
        while depth:
            nb, ne = text.find(BEGIN, j), text.find(END, j)
            if 0 <= nb < ne:
                depth += 1; j = nb + len(BEGIN)
            else:
                depth -= 1; j = ne + len(END)
        yield text[s:j]
        i = j

# curated drafts, indexed by md5[:8] suffix of the key
drafts = {}
for f in glob.glob(str(BOOK / "alt-text-drafts/*.json")):
    try:
        d = json.load(open(f))
        if isinstance(d, dict):
            for k, v in d.items():
                if isinstance(v, str) and v.strip():
                    drafts[k.rsplit("-", 1)[-1]] = v.strip()
    except Exception:
        pass

manual = {}
mpath = BUILD / "alt-text-manual.json"
if mpath.exists():
    manual = json.load(open(mpath))

import sys
listfile = sys.argv[1] if len(sys.argv) > 1 else None
if listfile:
    SOURCES = [Path(l) for l in open(listfile).read().split()]
else:
    SOURCES = [CH02 / f"{s}.tex" for s in
               ["modeling-linear-programming", "modeling-sums",
                "modeling-sums-continued", "Section2"]]

alt_map, missing = {}, []
for srcpath in SOURCES:
    stem = srcpath.stem
    text = srcpath.read_text()
    for n, b in enumerate(blocks(text), 1):
        name = f"figs/{stem}-tikz{n:02d}.png"
        h = hashlib.md5(b.encode()).hexdigest()[:8]
        if h in drafts:
            alt_map[name] = drafts[h]
        elif name in manual:
            alt_map[name] = manual[name]
        else:
            missing.append(name)

# figs-conv images: alt text from the two metadata bibs (abstract fields)
import re
def parse_bib(path):
    txt = "\n".join(l for l in open(path).read().splitlines()
                     if not l.lstrip().startswith("%"))
    out = {}
    for m in re.finditer(r"@\w+\{([^,]+),", txt):
        key = m.group(1).strip(); start = m.end(); d = 1; i = start
        while i < len(txt) and d > 0:
            if txt[i] == "{": d += 1
            elif txt[i] == "}": d -= 1
            i += 1
        a = re.search(r"abstract\s*=\s*\{(.*?)\},", txt[start:i-1], re.S)
        if a: out[key] = " ".join(a.group(1).split())
    return out
BIBS = {}
for bp in ["optimization/figures/figures-static/00_METADATA.bib",
           "optimization/figures/figures-source/00_METADATA.bib"]:
    BIBS.update(parse_bib(REPO / "Intro-Math-Programming/baseText" / bp))
for img in glob.glob(str(BUILD / "figs-conv/*")):
    base = os.path.basename(img)
    stem0 = os.path.splitext(base)[0]
    for cand in (base, stem0, stem0 + ".png", stem0 + ".jpg", stem0 + ".pdf",
                 stem0 + ".JPG", "tikz/" + stem0, "tikz/" + stem0 + ".pdf"):
        if cand in BIBS:
            alt_map["figs-conv/" + base] = BIBS[cand]
            break

json.dump(alt_map, open(BUILD / "alt-map.json", "w"), indent=1)
print(f"mapped: {len(alt_map)}, missing: {len(missing)}")
for m in missing:
    print("  MISSING:", m)
