#!/bin/bash
# Whole-book EPUB build. See WORKFLOW.md for the full explanation.
# Requires: texlive (latex + tex4ht + dvips), ghostscript, pdftocairo,
#           python3 (+Pillow), and the tex4ebook/make4ht/luaxml lua sources
#           on the kpse path (see WORKFLOW.md step 0).
set -e
cd "$(dirname "$0")"

BASE=../Intro-Math-Programming/baseText
EX=$BASE/optimization/open-optimization-examples

# Build the list of Book 1 content files from book1-main.tex
python3 - << 'EOF'
import re, os
main = re.sub(r'(?<!\\)%.*', '',
              open('../Intro-Math-Programming/baseText/book/book1-main.tex').read())
files = []
for f in re.findall(r'\\(?:input|include)\{([^}]+)\}', main):
    p = f if f.endswith('.tex') else f + '.tex'
    for cand in (os.path.join('../Intro-Math-Programming/baseText', p),
                 os.path.join('../Intro-Math-Programming/baseText/book', p)):
        if os.path.exists(cand):
            files.append(os.path.abspath(cand)); break
skip = ('packages-and-commands', 'preamble-accessibility', 'cover')
files = [f for f in files if not any(s in f for s in skip)]
open('content-files.txt', 'w').write('\n'.join(files))
print(len(files), 'content files')
EOF

echo "== 1/8 extract TikZ -> PNG (resumable; rerun until 0 pending) =="
python3 tools/extract-tikz-all.py snippets $(tr '\n' ' ' < content-files.txt)
python3 tools/extract-tikz-all.py snippets $EX/example-capital-budgeting.tex $EX/example-set-covering.tex
python3 tools/extract-tikz-all.py compile --jobs 8
python3 tools/extract-tikz-all.py placeholders   # gray boxes for any failures

echo "== 2/8 fix nested inputs + strip figure path prefixes in src/ =="
sed -i 's|\\input{../optimization/open-optimization-examples/example-capital-budgeting.tex}|\\input{src/example-capital-budgeting}|; s|\\input{../optimization/open-optimization-examples/example-set-covering.tex}|\\input{src/example-set-covering}|' src/integerProgrammingFormulations-book1.tex
sed -i 's|{optimization/figures/figures-static/|{|g; s|{optimization/figures/figures-source/|{|g; s|{figures/cc-by.eps}|{cc-by}|g; s|{figures/LyryxLogo.eps}|{LyryxLogo}|g; s|{figures/component-assess.eps}|{component-assess}|g; s|{figures/component-book.eps}|{component-book}|g; s|{figures/component-supplement.eps}|{component-supplement}|g; s|{figures/component-support.eps}|{component-support}|g' src/*.tex
# drop the tikzmark-overlay annotation (cannot work in EPUB)
sed -i 's|\\includegraphics\[width=0.85\\linewidth\]{figs/simplex-basis-driven-tikz09.png}|% [overlay annotation omitted in EPUB]|' src/simplex-basis-driven.tex
# strip \colorbox in math, natural-size small figures, checkpoint-answer refs
python3 tools/fix-src-epub.py
# per-figure credit lines for third-party images (from the metadata bibs)
python3 tools/gen-credits.py

echo "== 3/8 convert referenced PDF/EPS figures to PNG in figs-conv/ =="
python3 tools/convert-static-figs.py
LYX=$BASE/external-sources/aFirstCourseLinearAlgebra/figures
for f in cc-by LyryxLogo component-assess component-book component-supplement component-support; do
  [ -f figs-conv/$f.png ] || gs -q -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pngalpha -r150 \
      -sOutputFile=figs-conv/$f.png $LYX/$f.eps
done
cp -n $BASE/optimization/figures/figures-static/jssp.png \
      $BASE/optimization/figures/figures-static/jssp-duplo.png figs-conv/ 2>/dev/null || true
[ -f figs-conv/LP-figure.png ] || pdftocairo -png -singlefile -r 150 \
      $BASE/optimization/figures/figures-static/LP-figure.pdf figs-conv/LP-figure
[ -f figs-conv/integer-programming.png ] || pdftocairo -png -singlefile -r 150 \
      $BASE/Figures/integer-programming.pdf figs-conv/integer-programming

echo "== 4/8 tex4ebook =="
tex4ebook -a warning -c book1-epub.cfg -f epub3 book1-epub.tex "mathml" || true

echo "== 5/8 post-process (escape &, repack) =="
python3 tools/fix-epub.py book1-epub.epub

echo "== 6/8 render picture-environment images from the .idv =="
python3 - << 'EOF'
import re, subprocess, zipfile
from PIL import Image
lg = open('book1-epub.lg').read()
pairs = sorted(set(re.findall(r'book1-epub\.idv\[(\d+)\] ==> (book1-epub\d+x\.png)', lg)))
for pg, out in pairs:
    subprocess.run(['dvips','-q','-pp',pg,'-o','/tmp/p.ps','book1-epub.idv'], check=True)
    subprocess.run(['gs','-q','-dSAFER','-dBATCH','-dNOPAUSE','-sDEVICE=pngalpha',
                    '-r120','-sOutputFile=/tmp/p.png','/tmp/p.ps'], check=True)
    img = Image.open('/tmp/p.png'); bbox = img.getbbox()
    (img.crop(bbox) if bbox else img).save(out)
with zipfile.ZipFile('book1-epub.epub','a') as z:
    have = set(z.namelist())
    for _, out in pairs:
        if 'OEBPS/'+out not in have:
            z.write(out, 'OEBPS/'+out)
print('picture images:', len(pairs))
EOF

echo "== 7/8 cover =="
python3 tools/add-cover.py book1-epub.epub cover/cover.png

echo "== 8/8 alt text =="
python3 tools/build-alt-map.py content-files.txt
python3 - << 'EOF'
import json
m = json.load(open('alt-map.json'))
# xhtml uses figs-conv// (double slash) for path-stripped figures
for k, v in list(m.items()):
    if k.startswith('figs-conv/'):
        m['figs-conv//' + k.split('/',1)[1]] = v
json.dump(m, open('alt-map.json','w'), indent=1)
EOF
python3 tools/add-alt-text.py book1-epub.epub alt-map.json

echo "done: book1-epub.epub"
