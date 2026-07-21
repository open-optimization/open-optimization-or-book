# How the EPUB is built (whole-book workflow)

This documents the pipeline behind `book1-epub.epub` (the full Book 1 EPUB,
built 2026-07-21) so it can be reproduced, debugged, and extended. The short
version: `./build-book1.sh`. The long version follows.

## The core idea

The book's real preamble is hostile to EPUB conversion: tcolorbox layouts,
TikZ, biblatex, Lyryx page styles. Instead of fighting it, the pipeline:

1. **replaces the preamble** with plain-LaTeX substitutes
   (`epub-preamble.tex` + `epub-preamble-full.tex`) that define every custom
   environment/macro as simple markup tex4ht converts to clean HTML;
2. **pre-renders every TikZ picture to PNG** and rewrites the chapter sources
   to `\includegraphics` those PNGs (copies in `src/`, originals untouched);
3. runs **tex4ebook** (tex4ht) to produce EPUB3 with **MathML** math;
4. post-processes: ampersand escaping, `picture`-environment renders, cover,
   and **alt text** injected onto every `<img>`.

## Step 0 — one-time tool setup

TeX Live's tex4ht core (`tex4ht`, `t4ht`, `htlatex`, the `.4ht` files) is in
most distributions. The lua front ends are not always; if `tex4ebook` is not
on PATH:

```bash
git clone --depth 1 https://github.com/michal-h21/tex4ebook
git clone --depth 1 https://github.com/michal-h21/make4ht
git clone --depth 1 https://github.com/michal-h21/luaxml
mkdir -p ~/texmf/scripts/lua ~/texmf/tex/latex/tex4ebook
cp make4ht/*.lua luaxml/*.lua tex4ebook/*.lua ~/texmf/scripts/lua/
cp -r make4ht/{domfilters,formats,filters,extensions,make4ht} ~/texmf/scripts/lua/
cp -r tex4ebook/{exec,formats} ~/texmf/scripts/lua/ 2>/dev/null
cp tex4ebook/*.4ht tex4ebook/tex4ebook.sty ~/texmf/tex/latex/tex4ebook/
alias tex4ebook='texlua ~/texmf/scripts/lua/tex4ebook'
```

Also needed: `ghostscript`, `pdftocairo` (poppler), `python3` with Pillow.

## Step 1 — TikZ extraction (`tools/extract-tikz-all.py`)

Three resumable phases so big runs can be interrupted:

- `snippets <files...>`: finds every balanced `tikzpicture` (nested included),
  writes each as a standalone document in `figs/<stem>-tikzNN.tex`, and writes
  `src/<stem>.tex` with the tikz replaced by `\includegraphics{figs/....png}`.
- `compile [--jobs J] [--max N]`: compiles pending snippets in parallel
  (pdflatex → `pdftocairo -png -r 150`). Idempotent: skips existing PNGs.
- `placeholders`: gray "see the PDF edition" boxes for anything that will not
  compile standalone (e.g. a tikzpicture inside a macro body whose `#n`
  parameters have no standalone meaning).

The snippet preamble (top of the script) carries the tikz libraries, the
book's math shorthands, the `vertex`/`edge`/`directed` styles, and Lyryx
macros (`\vect`, `\leftB`, ...). **When a snippet fails, check its `figs/*.log`
and add the missing macro/style there,** then rerun `snippets` + `compile`.

Two content-level special cases (applied by `build-book1.sh` step 2):
- nested `\input`s inside chapters are re-pointed at `src/` copies;
- the tikzmark-overlay annotation in `simplex-basis-driven.tex` is dropped
  (page-overlay drawings cannot exist in reflowable HTML).

## Step 2 — figures that are files (`tools/convert-static-figs.py`)

Scans `src/` for every figure-including macro, resolves each name against the
repo's figure directories, converts PDFs (pdftocairo) and EPS (ghostscript)
to PNG in `figs-conv/`, and copies rasters there under their basename. The
EPUB preamble strips extensions and directories from figure names
(`\filename@parse`) and sets `\graphicspath{{figs-conv/}{figs/}}`, so every
historical path style in the book resolves to the same converted files.

## Step 3 — the substitute preamble

- `epub-preamble.tex`: the ch02 proof-of-concept layer — boxed environments
  (`ex`, `example`, `definition`, `theorem`, `general`, ...) as titled plain
  blocks, model-head macros, a shared counter.
- `epub-preamble-full.tex`: everything else the whole book needs — listings,
  amsthm theorem families, the exercise-ladder macros (`\exgroup`, `\stars`,
  `\exrefs`), `\vizlink`, citation no-ops (no biblatex here), figure-macro
  shims mirroring `preamble0-biblatex.tex` signatures, environment shims
  (steppanel/stepbox/algocard/dict/tryit/info/warn/...), Lyryx linear-algebra
  macros, and the book's single-letter bold vectors (`\a`, `\b`, `\c`, ...).

  **Gotcha:** tex4ht re-installs accent kludges for `\a` at `\begin{document}`,
  so the single-letter macros are re-asserted via `\AtBeginDocument`.

To extend: compile `book1-epub.tex` with plain `pdflatex -file-line-error
-draftmode` first — it surfaces every missing macro/environment in seconds.
Add `\providecommand`/`\NewDocumentEnvironment` shims until error-free, THEN
run tex4ebook. (This shakeout loop is how the current preamble was built.)

## Step 4 — the driver (`book1-epub.tex`)

Mirrors the `\input` order of `book/book1-main.tex` (front matter, parts,
chapters, appendices, back matter) but inputs the `src/` copies and loads the
substitute preambles. Regenerate the input list whenever chapters are added:
`build-book1.sh` derives `content-files.txt` from `book1-main.tex`
automatically, but the driver's `\input` lines are maintained by hand.

## Step 5 — conversion

```bash
tex4ebook -c book1-epub.cfg -f epub3 book1-epub.tex "mathml"
```

`book1-epub.cfg` holds the CSS. The "mathml" option converts math to MathML
(native in Apple Books, Thorium, calibre; Send-to-Kindle accepts EPUB3).
The DVI passes take only seconds each; the whole conversion runs in under a
minute for the 581-page book.

## Step 6 — post-processing

1. `tools/fix-epub.py`: escapes bare `&` in generated XHTML and repacks the
   zip with a valid `mimetype` entry (the job `tidy` would do).
2. `picture`-environment images: tex4ht defers LaTeX `picture` blocks to
   `book1-epub.idv`; the build renders them with `dvips -pp N` + ghostscript
   and injects them into `OEBPS/` (12 of them in the current book).
3. `tools/add-cover.py`: adds `cover/cover.png` (rendered from
   `cover/cover-epub.tex`) as the EPUB cover.
4. Alt text: `tools/build-alt-map.py` matches every extracted tikzpicture to
   the book's curated alt-text drafts (`book/alt-text-drafts/*.json`) via an
   md5 hash of the tikz source, and every `figs-conv/` image to the
   `abstract` fields of the two `00_METADATA.bib` files. `tools/add-alt-text.py`
   writes the descriptions onto the `<img>` tags. Currently 189 images carry
   real descriptions.

## Post-launch fixes (2026-07-21, second pass)

Reader-reported issues and their fixes, now part of the pipeline:

- **Undefined `&nbsp;` entity / malformed MathML** (mrow/mo mismatches from
  tex4ht around `\text` in split environments and `\left...\right` around
  matrices): `tools/fix-epub.py` now replaces `&nbsp;` with `&#xA0;` and runs
  any XHTML file that fails an XML parse through lxml's recovering parser.
  All 33 content files now parse clean.
- **Tiny TikZ pictures blown up to 85% width** (e.g. a single graph node):
  `tools/fix-src-epub.py` rewrites each extracted figure's width to its
  natural size (pixels / 150 dpi, capped at `\linewidth`).
- **Missing image credits** (the Wikipedia knapsack figure etc.): the print
  edition prints per-figure credits via biblatex; the EPUB now does too via
  `tools/gen-credits.py`, which builds `epub-credits.tex` from the metadata
  bibs for every third-party image (Wikimedia, Lippman, ...). Book-native
  figures get no credit line, matching print policy.
- **`??` references in the checkpoint answers**: the `learningcheckpoint`
  shim now numbers checkpoints (per section) and honors `label={lc:...}`;
  `fix-src-epub.py` rewrites `\Cref{lc:x}` to `Checkpoint~\ref{lc:x}` and
  drops `(page~\pageref{...})`, since reflowable EPUBs have no page numbers.
- **`\colorbox` with mixed colors inside math** produced garbled spans:
  stripped (decorative highlighting only) by `fix-src-epub.py`.

## Known limitations (whole-book edition)

- Boxed environments render as titled plain blocks, not colored boxes
  (CSS in `book1-epub.cfg` can restore styling per class).
- No bibliography: `\cite` renders as `[ref]`; figure credits live in the
  Sources & Attribution chapter and `00_METADATA.bib` rather than per-figure
  footnotes.
- Cross-references into Book 2 material render as `??`.
- Two figures are placeholders (a tikzpicture defined inside a macro body,
  and the dropped tikzmark overlay).
- The graph-theory chapter's `\ifdefined\old` legacy sections are excluded —
  exactly as in the PDF.
- Validate with epubcheck (Java) on a machine that has it; the sandbox build
  was structurally checked but not epubcheck-validated.

## Files

| Path | Role |
|---|---|
| `build-book1.sh` | end-to-end build |
| `book1-epub.tex` | driver |
| `epub-preamble.tex`, `epub-preamble-full.tex` | substitute preamble |
| `book1-epub.cfg` | tex4ht config + CSS |
| `tools/extract-tikz-all.py` | TikZ → PNG (resumable phases) |
| `tools/convert-static-figs.py` | PDF/EPS figures → PNG |
| `tools/fix-epub.py`, `tools/add-cover.py`, `tools/add-alt-text.py`, `tools/build-alt-map.py` | post-processing |
| `src/`, `figs/`, `figs-conv/` | generated (safe to delete and rebuild) |
| `book1-epub.epub` | the product |
