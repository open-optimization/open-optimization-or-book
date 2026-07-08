#!/bin/bash
# Rebuild Book 1 (full latexmk + biber cycle)
cd "$(dirname "$0")"
latexmk -pdf -interaction=nonstopmode book1-main.tex
echo ""
echo "=== Remaining undefined refs/citations: ==="
grep -cE "LaTeX Warning: (Reference|Citation).*undefined" book1-main.log || echo "0 - all clean!"
read -p "Press Enter to close..."
