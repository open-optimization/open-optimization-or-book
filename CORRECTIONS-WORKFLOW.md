# Corrections workflow: LaTeX is the single source of truth

Every correction — typo, math error, figure fix, exercise change — is made
in the **LaTeX source** under `Intro-Math-Programming/baseText/`. The PDF,
EPUB, and HTML edition are *built artifacts*: never edit them directly, and
never let a fix land in one format without landing in the source first.

## The build chain

```
LaTeX source  ──pdflatexmk──▶  book1-main.pdf        (authoritative manuscript)
     │
     └──epub-build/build-book1.sh──▶  book1-epub.epub
                                          │
                                          └──gen-html-site.py──▶  html/
```

## Releasing a correction (in order)

1. **Edit the LaTeX** in `Intro-Math-Programming/baseText/book/...` and
   commit. If solutions or alt text are affected, update
   `book/solutions-manual/` and the `abstract` fields in the two
   `00_METADATA.bib` files in the same commit.
2. **Rebuild the PDF** (author machine — biber required):
   `cd Intro-Math-Programming/baseText/book && latexmk -C && pdflatexmk book1-main.tex`
3. **Rebuild the EPUB**: `cd epub-build && ./build-book1.sh`
   (full recipe and troubleshooting in `epub-build/WORKFLOW.md`).
4. **Regenerate the HTML edition**: `python3 epub-build/tools/gen-html-site.py`
5. **Regenerate the publisher spreadsheet** if figures/captions changed:
   unzip the built EPUB, then
   `python3 epub-build/tools/gen-figure-spreadsheet.py <unzipped-epub-dir> Intro-Math-Programming/baseText/book/Figures-and-AltText-book1-filled.xlsx <same-path>`
   (template and output can be the same maintained file).
6. **Commit the built artifacts together** (PDF + EPUB + html/) in one
   commit, so the three published formats never diverge, and push. GitHub
   Pages serves all three from the repo.

`scripts/rebuild-derived.sh` runs steps 3–5 in sequence.

## Rules of thumb

- A discrepancy between formats is always resolved by asking: *what does
  the LaTeX say?* If the LaTeX is wrong too, fix it there first.
- Reader-reported errata (GitHub issues) are fixed in LaTeX, verified
  computationally where numerical, then released via the chain above.
- The `html/` and `epub-build/book1-epub.epub` files in the repo are
  outputs. Pull requests that modify them without touching source will be
  declined.
