#!/usr/bin/env python3
"""Post-process a tex4ebook EPUB: escape bare ampersands in xhtml files
(normally tidy's job, if installed) and re-zip correctly (mimetype first,
stored uncompressed). Usage: python3 fix-epub.py book.epub"""
import re, sys, zipfile, shutil, tempfile, os

AMP = re.compile(rb'&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#[0-9]+|#x[0-9a-fA-F]+);)')

def main(path):
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(path) as z:
        z.extractall(tmp)
    fixed = 0
    for root, _, files in os.walk(tmp):
        for f in files:
            if f.endswith('.xhtml'):
                p = os.path.join(root, f)
                data = open(p, 'rb').read()
                new = AMP.sub(b'&amp;', data)
                if new != data:
                    open(p, 'wb').write(new)
                    fixed += 1
    out = path  # rewrite in place
    with zipfile.ZipFile(out, 'w') as z:
        # mimetype must be first and uncompressed
        z.write(os.path.join(tmp, 'mimetype'), 'mimetype',
                compress_type=zipfile.ZIP_STORED)
        for root, _, files in os.walk(tmp):
            for f in files:
                p = os.path.join(root, f)
                rel = os.path.relpath(p, tmp)
                if rel == 'mimetype':
                    continue
                z.write(p, rel, compress_type=zipfile.ZIP_DEFLATED)
    shutil.rmtree(tmp)
    print(f"fixed ampersands in {fixed} files; repacked {out}")

if __name__ == "__main__":
    main(sys.argv[1])
