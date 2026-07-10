#!/bin/bash
# EPUB proof-of-concept build for Chapter 2 (Modeling Linear Programs).
# Requires: texlive (pdflatex + tex4ht), pdftocairo, python3, tex4ebook.
# tex4ebook install (if not in your TeX distribution):
#   git clone https://github.com/michal-h21/tex4ebook
#   git clone https://github.com/michal-h21/make4ht
#   git clone https://github.com/michal-h21/luaxml
#   ... then put their .lua files on the kpse script path (see README).
set -e
cd "$(dirname "$0")"

BOOK=../Intro-Math-Programming/baseText/book/part1-linear-programming/ch02-modeling

echo "== 1/5 extracting TikZ figures to PNG =="
python3 tools/extract-tikz.py \
  "$BOOK/modeling-linear-programming.tex" \
  "$BOOK/modeling-sums.tex" \
  "$BOOK/modeling-sums-continued.tex" \
  "$BOOK/Section2.tex"

echo "== 2/5 tex4ebook =="
tex4ebook -c ch02-epub.cfg -f epub3 ch02-epub.tex "mathml"

echo "== 3/5 post-processing (escape ampersands, repack) =="
python3 tools/fix-epub.py ch02-epub.epub

echo "== 4/5 cover =="
if [ ! -f cover/cover.png ]; then
  (cd cover && pdflatex -interaction=nonstopmode cover-epub.tex >/dev/null \
    && pdftocairo -png -singlefile -r 250 -f 1 -l 1 cover-epub.pdf cover \
    && python3 -c "from PIL import Image; Image.open('cover.png').resize((1600,2560),Image.LANCZOS).save('cover.png')")
fi
python3 tools/add-cover.py ch02-epub.epub cover/cover.png

echo "== 5/5 alt text =="
python3 tools/build-alt-map.py
python3 tools/add-alt-text.py ch02-epub.epub alt-map.json

echo "done: ch02-epub.epub"
