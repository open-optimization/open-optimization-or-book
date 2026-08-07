# Draft-compile stubs

Minimal `biblatex.sty` and `ccicons.sty` stubs for sandbox draft compiles
(no biber / ccicons in the sandbox TeX). Usage from `book/`:

    cp scripts/texstub/*.sty /tmp/texstub/   # or point TEXINPUTS here directly
    rm -f book2-main.aux
    TEXINPUTS=/tmp/texstub: pdflatex -interaction=nonstopmode -draftmode \
        -file-line-error book2-main.tex

Expect 0 matches of `':[0-9]*: '` in the log. Never use these for real
builds - citations render as [ref]/[author]/[title] placeholders.
