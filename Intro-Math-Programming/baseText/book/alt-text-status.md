# Alt-text status for Book 1

**Refresh: 2026-05-05.** The merger agent updated 199 entries in
`00_METADATA.bib` with hand-quality alt-text written by per-chapter
worker agents. Drafts are preserved in `book/alt-text-drafts/*.json`
and the per-bibkey audit trail is in `book/alt-text-merger-log.md`.
All previously-listed PLACEHOLDER, BLANK, and CONTEXT_DRAFT bibkeys
have been refined; 40 of the 55 CAPTION_DRAFT entries were also
refined as a bonus sweep, leaving 15 CAPTION_DRAFT entries still
auto-generated from `\caption{}` text -- usually accurate but worth
a glance.

Total entries in `00_METADATA.bib`: **232**.

Refined this pass (199 entries): 156 PLACEHOLDER+CONTEXT_DRAFT+BLANK
plus 40 CAPTION_DRAFT plus 3 entries that were classified GOOD already
but rewritten anyway. (Sum: 199.)

## Summary

| Status | Count | What to do |
|---|---|---|
| GOOD (real, hand-quality alt-text) | 217 | No action needed |
| CAPTION_DRAFT (from `\caption{}`) | 15 | Quick review; usually accurate |
| CONTEXT_DRAFT (from preceding paragraph) | 0 | -- |
| PLACEHOLDER (chapter-only stub) | 0 | -- |
| BLANK | 0 | -- |

Previously: 21 GOOD, 55 CAPTION_DRAFT, 63 CONTEXT_DRAFT, 91
PLACEHOLDER, 2 BLANK (total 232).

## How to refine

Edit the `abstract = {...}` field of each entry in
`Intro-Math-Programming/baseText/optimization/figures/figures-source/00_METADATA.bib`.
Good alt-text describes (a) the figure's visual layout and (b) the
mathematical or pedagogical point the figure makes -- in 1-3 sentences.

## Bibkeys still needing review

### CAPTION_DRAFT (auto-generated from `\caption{}`; review for accuracy)

- `tikz-complexity-01-9d314915`
- `tikz-complexity-02-a18f1c17`
- `tikz-integerProgrammingAlgorithms-01-0da6259e`
- `tikz-integerProgrammingExponentialFormulations-01-6c6ebfdb`
- `tikz-integerProgrammingExponentialFormulations-02-a39cee01`
- `tikz-modeling-sums-continued-03-435a4e27`
- `tikz-modeling-sums-continued-04-b130d23d`
- `tikz-modeling-sums-continued-05-a53b0069`
- `tikz-modeling-sums-continued-07-67d40dca`
- `tikz-multi-objective-optimization-01-12f642da`
- `tikz-multi-objective-optimization-02-70ba8e5a`
- `tikz-multi-objective-optimization-03-ca11e4c1`
- `tikz-multi-objective-optimization-04-12f642da`
- `tikz-simplex-basis-driven-01-10c58c87`
- `tikz-simplex-basis-driven-02-9a70f0e7`

### PLACEHOLDER, BLANK, CONTEXT_DRAFT

All previously-listed entries in these three categories were refined
in the 2026-05-05 merger pass. See `book/alt-text-merger-log.md` for
the per-bibkey audit trail.
