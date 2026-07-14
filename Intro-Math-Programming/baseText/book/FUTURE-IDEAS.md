# Future Ideas (post-draft) — parked on purpose

Author decision 2026-07: finish the book draft first; revisit these after.

## Interactive exercises linked from the book (GitHub Pages)

The visualizations site (`visualizations/` at repo root, served via GitHub
Pages) already has the infrastructure: React + hash-routed demos + the
20-question Concept Quiz. Extending it into real interactive exercises is
mostly content work, not new plumbing.

Tiers, easiest first:

1. **Per-chapter multiple-choice comprehension tests.** The Concept Quiz
   engine (`visualizations/source/quiz_demo.jsx`) already supports topic
   banks, scoring, explanations, and reshuffled retakes. Adding a bank per
   chapter (~10 questions each) and a `#quiz-ch07`-style deep link per
   chapter would let every exercise section end with a "self-check online"
   tryit box. Low risk, high value.

2. **Auto-checked computational exercises.** "Enter the optimal value /
   the entering variable / the shadow price" input boxes with instant
   checking. The demos already contain LP solvers in JS (vertex enumeration
   in the branch-and-bound demo, pivoting engines in the simplex demos), so
   answers can be generated and checked client-side, including randomized
   instances per student.

3. **Geometry explorers tied to specific exercises.** Reuse the
   objective-slider / feasible-region components to make exercise-specific
   scenes: drag the objective vector and observe which vertex is optimal;
   see why a union of convex sets fails to be convex; visualize the
   excluded strip when branching. Each maps to an existing exercise tag.

4. **Proof-idea walkthroughs.** Step-through interactives for the two or
   three central proofs (optimum at a vertex; weak duality; why the ratio
   test preserves feasibility), in the style of the Anatomy-of-a-Step demo:
   each click reveals the next logical step with the picture updating.
   Highest effort; do last.

Practical notes for when this resumes:
- Keep everything client-side static (no backend) so Pages keeps hosting it.
- Question banks as plain JS data files, one per chapter, so contributors
  can add questions without touching React.
- Link pattern already established: tryit boxes + `\vizlink{id}{text}`.

## Also parked
- Game-style drills discussed earlier: "find the optimum" vertex-clicking
  game, timed ratio-test drill, modeling matching game, beat-the-solver
  network game, pivot-rule race, spot-the-error quizzes.
- More case studies from the proposals doc (Kellogg, Harvest Hope, school
  timetabling ITE case).
- Fix "Missing AltText" metadata entries for Book 2 figures before Book 2.
