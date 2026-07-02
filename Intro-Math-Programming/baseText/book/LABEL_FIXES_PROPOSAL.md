# Proposal: Fix Multiply Defined Labels and Undefined References in book2-main.tex

## Summary

book2-main.tex has two categories of LaTeX warnings:
1. **Multiply defined labels** - Same label defined in multiple places
2. **Undefined references** - References to labels that don't exist in book2

---

## Part 1: Multiply Defined Labels

### Issue 1.1: `eq:convex-programming` (defined 8 times!)

**Files affected:**
- `part1-linear-programming/ch01-introduction/mathematicalProgramming.tex` (lines 262, 278)
- `part4-nonlinear-programming/ch18-nlp-algorithms/NLP-algorithms.tex` (lines 618, 630, 712)
- `part4-nonlinear-programming/ch19-nlp-algorithms/NLP-algorithms.tex` (lines 618, 630, 712)

**Root cause:** ch18 and ch19 appear to be near-duplicates of each other, and the label is used multiple times within each file.

**Proposed fix:**
1. Determine if ch18 and ch19 should both exist, or if one is a backup/old version
2. Within each file, keep only the first `\label{eq:convex-programming}` and remove or rename duplicates (e.g., `eq:convex-programming-barrier`, `eq:convex-programming-example`)

---

### Issue 1.2: `fig:1dopt-golden-unimodal`, `eq:1dopt-newton`, `fig:1dopt-quadratic-newton` (defined 3 times each)

**Files affected:**
- `part4-nonlinear-programming/ch18-nlp-algorithms/NLP-algorithms.tex`
- `part4-nonlinear-programming/ch19-nlp-algorithms/NLP-algorithms.tex`
- `part4-nonlinear-programming/OneD_Optimization/OneD_Optimization.tex`

**Root cause:** OneD_Optimization content is duplicated in NLP-algorithms chapters.

**Proposed fix (Option A - Recommended):**
Remove the duplicated 1D optimization content from NLP-algorithms.tex files and keep it only in OneD_Optimization.tex. Use `\ref{}` to reference the content.

**Proposed fix (Option B):**
If the content must remain in multiple places, add prefixes to distinguish:
- `fig:nlp-1dopt-golden-unimodal` in NLP-algorithms.tex
- `fig:1dopt-golden-unimodal` in OneD_Optimization.tex

---

### Issue 1.3: `Alg:Golden-Section-Search`, `prob:golden-section-search`

**Files affected:**
- `part4-nonlinear-programming/ch18-nlp-algorithms/NLP-algorithms.tex`
- `part4-nonlinear-programming/ch19-nlp-algorithms/NLP-algorithms.tex`
- `part4-nonlinear-programming/OneD_Optimization/OneD_Optimization.tex`

**Same root cause as 1.2** - duplicated content.

---

### Issue 1.4: `eq:gomory-cut-ex1-original` (defined 2 times in same file)

**File:** `part3-integer-programming/ch13-ip-algorithms/integerProgrammingAlgorithms.tex` (lines 808, 813)

**Proposed fix:** Remove the duplicate label on line 813.

---

### Issue 1.5: `heuristic:nearestNeighbor` (defined in 2 files)

**Files affected:**
- `part3-integer-programming/ch15-complexity/complexity.tex` (line 979)
- `part3-integer-programming/ch16-heuristics/heuristics.tex` (line 31)

**Proposed fix:** Rename one to `heuristic:nearestNeighbor-complexity` or `heuristic:nearestNeighbor-tsp`.

---

### Issue 1.6: `eq:tsp-DFJ-model` (defined 2 times in same file)

**File:** `part3-integer-programming/ch14-exponential-formulations/integerProgrammingExponentialFormulations.tex` (lines 710, 848)

**Proposed fix:** Remove the second label or rename to `eq:tsp-DFJ-model-alt`.

---

## Part 2: Undefined References

These are references to labels that exist in book1 but not in book2.

### Issue 2.1: `subsection:fractional-knapsack`

**Referenced in:** `integerProgrammingAlgorithms.tex` line 180

**The label doesn't exist anywhere.** This is likely content from book1's LP section.

**Proposed fix:** Either:
- Add the fractional knapsack subsection to book2, OR
- Replace `\ref{subsection:fractional-knapsack}` with a descriptive phrase like "the fractional knapsack problem (covered in Book 1)"

---

### Issue 2.2: `LP:basis-solution`

**Referenced in:** `integerProgrammingExponentialFormulations.tex` line 187

**The label doesn't exist.** This references LP theory from book1.

**Proposed fix:** Replace with descriptive text or add note "(see Book 1, LP chapter)"

---

### Issue 2.3: `sec:spanning-tree-models`, `sec:IP-Heuristics`, `sec:tsp-models`

**Referenced in:** `complexity.tex`

**Proposed fix:** These sections may exist elsewhere. Either:
- Verify the correct label names and fix typos
- Replace with descriptive text if content isn't in book2

---

### Issue 2.4: `graphic`, `def:unconstrained`

**Referenced in:** Various files

**Proposed fix:** Search for correct label names or add the missing labels.

---

### Issue 2.5: Linear algebra references (many)

**Labels like:** `def:additionofmatrices`, `def:scalarmultofmatrices`, `prop:propertiesofaddition`, `def:linearcombination`, etc.

**These are in the appendix files** but may have different label names.

**Proposed fix:** Verify labels exist in the included appendix files. The Lyryx linear algebra files may use different naming conventions.

---

## Recommended Action Plan

### Quick Fixes (can do now):
1. Remove duplicate `\label{eq:gomory-cut-ex1-original}` on line 813
2. Remove duplicate `\label{eq:tsp-DFJ-model}` on line 848
3. Rename `heuristic:nearestNeighbor` in one of the two files

### Medium Fixes (require review):
4. Decide whether ch18 and ch19 NLP-algorithms should both exist
5. Remove or refactor duplicated 1D optimization content
6. Fix `eq:convex-programming` duplicates

### Content Decisions (require author input):
7. Decide how to handle references to book1 content (add content, add notes, or remove references)
8. Verify linear algebra appendix labels match references

---

## Implementation Priority

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| High | eq:gomory-cut-ex1-original duplicate | 1 min | Fixes warning |
| High | eq:tsp-DFJ-model duplicate | 1 min | Fixes warning |
| High | heuristic:nearestNeighbor duplicate | 2 min | Fixes warning |
| Medium | ch18 vs ch19 NLP-algorithms | 30 min | Fixes 10+ warnings |
| Medium | OneD_Optimization duplicates | 15 min | Fixes 6+ warnings |
| Low | Undefined refs to book1 | 10 min | Fixes ~10 warnings |
| Low | Linear algebra labels | 20 min | Fixes ~15 warnings |
