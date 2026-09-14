#!/usr/bin/env bash
# Rebuild all derived formats from the LaTeX source (steps 3-5 of
# CORRECTIONS-WORKFLOW.md). Run AFTER rebuilding the PDF with pdflatexmk.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== EPUB =="
( cd epub-build && ./build-book1.sh )

echo "== HTML edition =="
python3 epub-build/tools/gen-html-site.py

echo "== Figure spreadsheet =="
python3 epub-build/tools/gen-figure-spreadsheet.py || \
  echo "(spreadsheet regeneration failed or not needed; see tool header)"

echo
echo "Done. Review, then commit PDF + EPUB + html/ together:"
echo "  git add Intro-Math-Programming/baseText/book/book1-main.pdf epub-build/book1-epub.epub html book"
echo "  git commit -m 'Rebuild derived formats (PDF/EPUB/HTML) from source'"
