LATEXMK = latexmk
PDFLATEX = pdflatex
BIBTEX = bibtex
BIBER = biber

LATEX_OPTIONS = -interaction=nonstopmode

LATEXMK_OPTIONS = -pdf -g -f
# Omit -Werror because latexmk 1:4.41-1 on GitHub runner (2019-12-17) does not understand it
# Omit --quiet for better debuggability

all: open-optimization.pdf

.PHONY: open-optimization.pdf

open-optimization.pdf:
	$(LATEXMK) $(LATEXMK_OPTIONS) open-optimization
