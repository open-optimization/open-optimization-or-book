#!/usr/bin/env python3
"""Inject alt text into EPUB <img> tags using alt-map.json.

Replaces the alt attribute (tex4ht emits alt="PIC" or empty) on every
<img> whose src matches a key in the map. Usage:
    python3 add-alt-text.py book.epub alt-map.json
"""
import json, re, sys, zipfile, shutil, tempfile, os
from xml.sax.saxutils import escape, quoteattr

def main(epub, mapfile):
    alt_map = json.load(open(mapfile))
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(epub) as z:
        z.extractall(tmp)
    hits, misses = 0, set(alt_map)
    img_re = re.compile(r'<img\b[^>]*>')
    src_re = re.compile(r'src="([^"]+)"')
    alt_re = re.compile(r'\salt="[^"]*"')
    for root, _, files in os.walk(tmp):
        for f in files:
            if not f.endswith('.xhtml'):
                continue
            p = os.path.join(root, f)
            text = open(p, encoding='utf-8').read()
            def fix(m):
                nonlocal hits
                tag = m.group(0)
                sm = src_re.search(tag)
                if not sm or sm.group(1) not in alt_map:
                    return tag
                alt = quoteattr(alt_map[sm.group(1)])
                misses.discard(sm.group(1))
                hits += 1
                tag = alt_re.sub('', tag)
                return tag[:-2].rstrip() + f' alt={alt} />' \
                    if tag.endswith('/>') else \
                    tag[:-1].rstrip() + f' alt={alt}>'
            new = img_re.sub(fix, text)
            if new != text:
                open(p, 'w', encoding='utf-8').write(new)
    with zipfile.ZipFile(epub, 'w') as z:
        z.write(os.path.join(tmp, 'mimetype'), 'mimetype',
                compress_type=zipfile.ZIP_STORED)
        for root, _, files in os.walk(tmp):
            for f in files:
                rel = os.path.relpath(os.path.join(root, f), tmp)
                if rel != 'mimetype':
                    z.write(os.path.join(root, f), rel,
                            compress_type=zipfile.ZIP_DEFLATED)
    shutil.rmtree(tmp)
    print(f"alt text set on {hits} images; unmatched map keys: "
          f"{sorted(misses) if misses else 'none'}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
