// Generate ClearSpeak alt text for every equation (inline and display) in the
// built EPUB's XHTML, using speech-rule-engine. Output: JSON lines on stdout:
// {file, index, display, eqno, speech, snippet}
// Usage: node gen-equation-alt.js <unzipped-epub-OEBPS-dir>
const fs = require('fs');
const path = require('path');
const sre = require('/tmp/sre-test/node_modules/speech-rule-engine');

const dir = process.argv[2];

function* mathBlocks(xml) {
  let i = 0;
  while (true) {
    const s = xml.indexOf('<math', i);
    if (s < 0) return;
    const e = xml.indexOf('</math>', s);
    if (e < 0) return;
    yield { start: s, end: e + 7, src: xml.slice(s, e + 7) };
    i = e + 7;
  }
}

(async () => {
  await sre.setupEngine({ locale: 'en', modality: 'speech', domain: 'clearspeak' });
  const out = [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xhtml')).sort();
  for (const f of files) {
    const xml = fs.readFileSync(path.join(dir, f), 'utf8');
    let idx = 0;
    for (const m of mathBlocks(xml)) {
      idx += 1;
      const display = /display\s*=\s*"block"/.test(m.src.slice(0, 200));
      // equation number: look ahead for eq-no cell within 300 chars
      const ahead = xml.slice(m.end, m.end + 300);
      const eq = ahead.match(/class="eq-no">\(([^)]+)\)/);
      let speech = '';
      try { speech = sre.toSpeech(m.src); } catch (err) { speech = '[SRE ERROR]'; }
      speech = speech.replace(/\s+/g, ' ').trim();
      if (!speech) speech = '[empty]';
      out.push(JSON.stringify({
        file: f, index: idx, display: display,
        eqno: eq ? eq[1] : '',
        speech: speech.slice(0, 1200)
      }));
    }
    process.stderr.write(f + ' done\n');
  }
  fs.writeFileSync('/tmp/equation-alt.jsonl', out.join('\n'));
  console.log('total equations:', out.length);
})();
