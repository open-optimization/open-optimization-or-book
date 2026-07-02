# Book Partition Plan

## Overview
Splitting the current single book into two separate books for two courses.

---

## Book 1: Introduction to Mathematical Programming
**Target Audience:** First course in optimization

### Content Structure:
1. **Introduction** (existing intro chapters)
   - introduction-book.tex
   - resources_and_notation.tex
   - introduction.tex
   - introductionNotation.tex
   - mathematicalProgramming.tex

2. **Part I: Linear Programming** (all existing LP content)
   - Modeling Linear Programs
   - Software - Excel
   - Modeling with Summations
   - More LP Examples
   - Graphical Method
   - LP Theory
   - Simplex Method
   - Sensitivity Analysis
   - Duality
   - Software - Python
   - Multi-Objective Optimization

3. **Part II: Discrete Algorithms** (all existing)
   - Graph Algorithms
   - Graph Theory

4. **Part III: Introduction to Integer Programming** (subset of IP)
   - CH11: IP Formulations (Book 1 version - introductory focus)

5. **Appendices** (all existing)
   - Equations and Lines
   - Linear Algebra (full content)
   - Contributors/License

---

## Book 2: Integer and Nonlinear Programming
**Target Audience:** Second course in optimization

### Content Structure:
1. **Introduction** (brief, tailored for Book 2)
   - New intro file or trimmed version

2. **Part I: Integer Programming** (full IP content)
   - CH11: IP Formulations (Book 2 version - refresher + deeper)
   - CH12: Solvers
   - CH13: IP Algorithms
   - CH14: Exponential Formulations
   - CH15: Complexity
   - CH16: Heuristics

3. **Part II: Nonlinear Programming** (restore all NLP content)
   - NLP Introduction (ch17 or ch18)
   - NLP Algorithms (ch18 or ch19)
   - OneD_Optimization
   - GradientMethods
   - Additional NLP content from archive (more-nlp.tex)

4. **Appendices**
   - Relevant appendices (possibly subset)

---

## Files to Create

### New Main Files:
- `book1-main.tex` - Entry point for Book 1
- `book2-main.tex` - Entry point for Book 2

### New/Modified Content:
- `part3-integer-programming/ch11-ip-formulations/ip-formulations-book1.tex` - Intro version for Book 1
- `part3-integer-programming/ch11-ip-formulations/ip-formulations-book2.tex` - Full version for Book 2
- `book2-intro.tex` - Brief intro for Book 2

### Restore for Book 2:
- Uncomment Part IV (Nonlinear Programming) in book2-main.tex
- Restore more-nlp.tex content if appropriate

---

## Implementation Steps

1. Create `book1-main.tex` based on current main.tex
   - Keep Parts I, II
   - Add Part III with only CH11 (Book 1 version)
   - Keep Appendices

2. Create `book2-main.tex`
   - Add brief intro
   - Add Part I: Full Integer Programming (with CH11 Book 2 version)
   - Uncomment and include Part II: Nonlinear Programming
   - Possibly trimmed appendices

3. Create two versions of CH11:
   - `ip-formulations-book1.tex` - introductory treatment
   - `ip-formulations-book2.tex` - refresher + complete content

4. Test both books compile correctly

---

## Notes
- The original `main.tex` can be kept as a "complete combined" version
- Both books share the same preamble (`packages-and-commands.tex`)
- Chapter 11 needs to be split/duplicated with appropriate content for each audience
