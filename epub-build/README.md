# EPUB build (proof of concept)

Standalone EPUB pipeline for the book, currently covering **Chapter 2:
Modeling Linear Programs**. Nothing here touches the main PDF build —
sources are *duplicated* into `src/` and preprocessed.

## Output

`ch02-epub.epub` — EPUB3 with MathML math, TikZ figures rendered as PNG,
custom boxed environments flattened to plain titled blocks.

## Pipeline

1. `tools/extract-tikz.py` copies the chapter sources into `src/`, finds
   every balanced `tikzpicture` environment (including nested ones),
   compiles each one standalone (`pdflatex` → `pdftocairo -png -r 150`)
   into `figs/`, and replaces it with `\includegraphics{figs/....png}`.
2. `ch02-epub.tex` is a driver that loads `epub-preamble.tex` instead of
   the book's full preamble. The EPUB preamble defines plain-LaTeX
   substitutes for every tcolorbox/Lyryx environment (`ex`, `example`,
   `definition`, `theorem`, `outcome`, `examplewithallcode`, ...) using
   tolerant xparse `g` arguments, so inconsistent call styles all work.
3. `tex4ebook -c ch02-epub.cfg -f epub3 ch02-epub.tex "mathml"` converts
   to EPUB3 with MathML.
4. `tools/fix-epub.py` escapes bare `&` in the generated XHTML (the job
   `tidy` would do if installed) and repacks the zip with a valid
   `mimetype` entry.

Run everything with `./build.sh`.

## Extending to more chapters

- Add the chapter's .tex files to the `extract-tikz.py` call in `build.sh`
  and `\input` the `src/` copies in the driver.
- Any new custom environment: add a substitute to `epub-preamble.tex`
  (pattern: `\NewDocumentEnvironment{name}{g g}{...}{...}`).
- Any new macro: `\providecommand` it in `epub-preamble.tex`.
- Figures included as PDF (`\includegraphics{...pdf}` /
  `\altincludegraphics`) need a PNG/SVG conversion step — not yet wired up.

## Known limitations (proof of concept)

- Boxed environments lose their colored-box styling (plain bold headers
  instead). CSS in `ch02-epub.cfg` can restore styling per environment.
- Cross-references to other chapters render as `??`.
- No bibliography/index.
- MathML renders natively in Apple Books, Thorium, calibre. Kindle
  requires conversion (`kindlegen`/Send-to-Kindle handles EPUB3 now).
- `learningcheckpoint` label options are ignored.
- Math accessibility: MathML is inherently screen-reader friendly, but
  alt text for figure PNGs is not yet populated (the book's alt-text
  inventory in `baseText/book/alt-text-*` could be wired in).
