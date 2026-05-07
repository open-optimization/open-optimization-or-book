# Top-level Makefile for the OR book series.
# Books live under Intro-Math-Programming/baseText/book/.

BOOK_DIR := Intro-Math-Programming/baseText/book
BOOKS    := book1-main
# Append book2-main here when ready:
# BOOKS  := book1-main book2-main

LATEXMK_FLAGS := -pdf -interaction=nonstopmode -halt-on-error -file-line-error

.PHONY: all check list-products clean $(BOOKS)

all: $(BOOKS)
	@echo "############################"
	@echo "#### Available products ####"
	@echo "############################"
	@$(MAKE) --no-print-directory list-products

# Build a book by name (e.g. `make book1-main`). Run latexmk from inside the
# book directory so relative \input paths resolve.
$(BOOKS):
	cd $(BOOK_DIR) && latexmk $(LATEXMK_FLAGS) $@.tex

# Used by CI to discover artifacts.
list-products:
	@for b in $(BOOKS); do echo $(BOOK_DIR)/$$b.pdf; done

# CI entry point.
check: all

clean:
	cd $(BOOK_DIR) && latexmk -C
