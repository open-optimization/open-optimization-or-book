PANDOC = pandoc

all: generate-latex

MARKDOWN_FILES = CONTRIBUTING-code-of-conduct.md CONTRIBUTING-git.md CONTRIBUTING-latex.md CONTRIBUTING-licenses.md CONTRIBUTING.md README-open-optimization.md README.md

.PHONY: generate-latex

generate-latex: $(MARKDOWN_FILES:%.md=generated-latex/%.tex)

generated-latex/%.tex: %.md
	$(PANDOC) $< -o $@
