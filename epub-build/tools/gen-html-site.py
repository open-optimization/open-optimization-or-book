#!/usr/bin/env python3
"""Build the browsable HTML edition at <repo>/html/ from the built EPUB.

- Unzips book1-epub.epub's OEBPS content into html/
- Generates html/index.html (table of contents from the NCX, in spine order)
- Injects a small navigation bar (contents / previous / next / downloads)
  at the top of every chapter file.
Idempotent: wipes and regenerates html/ each run.
"""
import os, re, shutil, zipfile
from pathlib import Path
from lxml import etree

BUILD = Path(__file__).resolve().parent.parent
REPO = BUILD.parent
OUT = REPO / "html"
UNPACK = REPO / "epub-unpacked"   # verbatim OEBPS for the epub.js reader
EPUB = BUILD / "book1-epub.epub"

for d in (OUT, UNPACK):
    if d.exists():
        shutil.rmtree(d)
    d.mkdir()

with zipfile.ZipFile(EPUB) as z:
    for name in z.namelist():
        if name.startswith("OEBPS/") and not name.endswith("/"):
            rel = name[len("OEBPS/"):]
            data = z.read(name)
            # verbatim copy for the reader (progressive chapter loading)
            udest = UNPACK / rel
            udest.parent.mkdir(parents=True, exist_ok=True)
            udest.write_bytes(data)
            if rel in ("content.opf",):
                continue
            dest = OUT / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
    opf = z.read("OEBPS/content.opf")

# spine order + titles
ns = {"o": "http://www.idpf.org/2007/opf"}
opfroot = etree.fromstring(opf)
manifest = {i.get("id"): i.get("href")
            for i in opfroot.findall(".//o:manifest/o:item", ns)}
spine = [manifest[r.get("idref")] for r in opfroot.findall(".//o:spine/o:itemref", ns)]
spine = [s for s in spine if s.endswith(".xhtml") and s != "cover.xhtml"]

def title_of(f):
    t = (OUT / f).read_text(errors="ignore")
    m = re.search(r"<title>([^<]*)</title>", t)
    ttl = (m.group(1).strip() if m else f)
    return ttl or f

titles = {f: title_of(f) for f in spine}

NAV = ('<div style="font-family:Georgia,serif;font-size:0.9rem;'
       'border-bottom:1px solid #ccc;padding:6px 0;margin-bottom:12px;">'
       '<a href="index.html">Contents</a>{prev}{next}'
       ' &#xA0;|&#xA0; <a href="../read/">EPUB reader</a>'
       ' &#xA0;|&#xA0; <a href="../Intro-Math-Programming/baseText/book/book1-main.pdf">PDF</a>'
       '</div>')

for i, f in enumerate(spine):
    p = OUT / f
    t = p.read_text(errors="ignore")
    prev_l = (' &#xA0;|&#xA0; <a href="%s">&#8249; Previous</a>' % spine[i-1]) if i > 0 else ""
    next_l = (' &#xA0;|&#xA0; <a href="%s">Next &#8250;</a>' % spine[i+1]) if i < len(spine)-1 else ""
    nav = NAV.format(prev=prev_l, next=next_l)
    t2, n = re.subn(r"(<body[^>]*>)", r"\1" + nav.replace("\\", "\\\\"), t, count=1)
    if n:
        p.write_text(t2)

items = "\n".join(
    f'<li><a href="{f}">{titles[f]}</a></li>' for f in spine)
(OUT / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mathematical Programming and Operations Research — HTML edition</title>
<style>
 body {{ font-family: Georgia, serif; max-width: 46rem; margin: 2rem auto;
        padding: 0 1rem; line-height: 1.5; }}
 h1 {{ color: #840125; font-size: 1.5rem; }}
 li {{ margin: .3rem 0; }}
 .meta {{ color: #555; font-size: .9rem; }}
</style></head><body>
<h1>Mathematical Programming and Operations Research<br>
<small>Book 1: Linear and Integer Programming</small></h1>
<p class="meta">By Robert Hildebrand, adapted in part from open resources · CC BY-SA 4.0 ·
<a href="../">Book home</a> ·
<a href="../read/">EPUB reader</a> ·
<a href="../Intro-Math-Programming/baseText/book/book1-main.pdf">PDF</a></p>
<ol>
{items}
</ol>
</body></html>
""")
print(f"html/ built: {len(spine)} chapters; epub-unpacked/ refreshed for the reader")
