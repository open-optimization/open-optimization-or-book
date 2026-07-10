#!/usr/bin/env python3
"""Add a cover image to a tex4ebook EPUB.

Inserts cover.png + a cover.xhtml page, registers both in content.opf
(manifest, spine start, EPUB2 <meta name="cover"> and EPUB3
properties="cover-image"), and repacks.

Usage: python3 add-cover.py book.epub cover.png
"""
import re, sys, zipfile, shutil, tempfile, os

COVER_XHTML = """<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Cover</title>
<style>body{margin:0;padding:0;text-align:center;}
img{max-width:100%;max-height:100%;}</style></head>
<body epub:type="cover"><img src="cover.png" alt="Book cover: Mathematical Programming and Operations Research by Robert Hildebrand"/></body>
</html>
"""

def main(epub, cover):
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(epub) as z:
        z.extractall(tmp)
    oebps = os.path.join(tmp, 'OEBPS')
    shutil.copy(cover, os.path.join(oebps, 'cover.png'))
    with open(os.path.join(oebps, 'cover.xhtml'), 'w') as f:
        f.write(COVER_XHTML)

    opf_path = os.path.join(oebps, 'content.opf')
    opf = open(opf_path).read()
    # remove any previous cover entries (idempotent)
    opf = re.sub(r'\s*<item[^>]*id="cover-(?:image|page)"[^>]*/>', '', opf)
    opf = re.sub(r'\s*<itemref[^>]*idref="cover-page"[^>]*/>', '', opf)
    opf = re.sub(r'\s*<meta name="cover"[^>]*/>', '', opf)
    # manifest entries
    opf = opf.replace('</manifest>',
        '  <item id="cover-image" href="cover.png" media-type="image/png" '
        'properties="cover-image"/>\n'
        '  <item id="cover-page" href="cover.xhtml" '
        'media-type="application/xhtml+xml"/>\n</manifest>')
    # spine: cover page first
    opf = re.sub(r'(<spine[^>]*>)', r'\1\n  <itemref idref="cover-page"/>', opf)
    # EPUB2-style meta for older readers
    opf = re.sub(r'(<metadata[^>]*>)',
                 r'\1\n  <meta name="cover" content="cover-image"/>', opf)
    open(opf_path, 'w').write(opf)

    with zipfile.ZipFile(epub, 'w') as z:
        z.write(os.path.join(tmp, 'mimetype'), 'mimetype',
                compress_type=zipfile.ZIP_STORED)
        for root, _, files in os.walk(tmp):
            for f in files:
                rel = os.path.relpath(os.path.join(root, f), tmp)
                if rel == 'mimetype':
                    continue
                z.write(os.path.join(root, f), rel,
                        compress_type=zipfile.ZIP_DEFLATED)
    shutil.rmtree(tmp)
    print(f"cover added to {epub}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
