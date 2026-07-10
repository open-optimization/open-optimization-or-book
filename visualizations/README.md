# Interactive Visualizations

Interactive companions to *Mathematical Programming and Operations Research*
(Book 1: Linear and Integer Programming). Adapted from visualizations built
for ISE 5405/5406 at Virginia Tech.

Live site (GitHub Pages):
https://open-optimization.github.io/open-optimization-or-book/visualizations/

Direct-link a demo with a hash, e.g.
`.../visualizations/#simplex-dictionary`

| Demo id | What it is | Book chapter |
|---|---|---|
| `modeling-intro` | Words-to-math modeling tutorial | 2 |
| `excel-solver` | Excel Solver walkthrough | 3 |
| `network-flow` | Network flow problems | 4 |
| `objective-slider` | Objective level-line slider | 5-6 |
| `simplex-dictionary` | Simplex pivoter, dictionary form (with the book's bakery example and custom problems) | 7 |
| `simplex-tableau` | Simplex pivoter, tableau form | 9 |
| `tableau-pivoter` | Free Gauss-Jordan pivot sandbox | 9 |
| `two-phase-simplex` | Two-phase simplex | 7 |
| `sensitivity-walkthrough` | Sensitivity analysis, step by step | 10 |
| `duality-sensitivity` | Duality + sensitivity explorer | 10-11 |
| `dual-construction` | Primal-to-dual construction | 11 |
| `lp-solvers` | One LP in four modeling languages | 12 |
| `gantt-jobshop` | Job-shop schedule Gantt | 15 |
| `branch-bound` | Branch-and-bound tree explorer | 15 / Book 2 |
| `dual-simplex` | Dual simplex method | further topics |
| `concept-quiz` | 20-question concept quiz with explanations | all chapters |

## Layout

- `index.html` + `assets/` — the built static site (served by GitHub Pages).
- `source/` — the React/Vite sources. Edit these, then rebuild.

## Rebuilding

```bash
cd source
npm install
npm run build          # writes to source/dist
rm -rf ../assets
cp -r dist/assets dist/index.html ..
```

The build is fully static (no server needed); `base: './'` in
`vite.config.js` makes it work from any subdirectory.
