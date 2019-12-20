LATEXMK = latexmk
PDFLATEX = pdflatex
BIBTEX = bibtex
BIBER = biber

LATEX_OPTIONS = -interaction=nonstopmode

LATEXMK_OPTIONS = -pdf -g -f
# Omit -Werror because latexmk 1:4.41-1 on GitHub runner (2019-12-17) does not understand it
# Omit --quiet for better debuggability

all: open-optimization.pdf titlecard.png

.PHONY: open-optimization.pdf version.txt

# This target makes the version string. It is also used in the deployment scripts.
version.txt:
	-echo `git describe --tags --dirty`-`git log -1 --date=format:"%Y-%m-%d" --format="%ad"` > $@

open-optimization.pdf: version.txt
	$(LATEXMK) $(LATEXMK_OPTIONS) open-optimization

# This file is used as the logo of the repository,
# so as a special exception it is to be checked in.
## titlecard.png: titlecard.pdf
## 	convert $< -format png $@

titlecard.pdf:
	$(LATEXMK) $(LATEXMK_OPTIONS) titlecard
