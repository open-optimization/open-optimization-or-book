# Fair-Use Fix Log — Book 1

Follow-up to `section-6.3-fair-use-review.md` §7 ("Actionable items"). Two
surgical fixes applied. Review report itself was not modified.

---

## Fix 1 — Cost matrix attribution

**Decision:** Added the attribution footnote in **both** files (one footnote per
file, placed at the matrix's introduction).

**Reasoning from source context:**

- In `modeling-linear-programming.tex` line 711, the example
  `\begin{examplewithallcode}{Hiring for tasks}{...}{}{}` uses the project's
  own GitHub xlsx URL
  (`open-optimization/open-optimization-or-book/.../assignment-problem-excel.xlsx`)
  as its "code" link — not excel-easy.com — and the example carries no inline
  attribution to any external source. This is structurally consistent with
  author-original framing.
- In `modeling-sums.tex` line 548, however, the duplicate of the same example
  uses `excel-easy.com/examples/assignment-problem.html` as its "code" link.
  That URL appears in the structurally ambiguous third-positional-argument
  slot of `examplewithallcode`, which can mean either "code that solves this
  example" or "source the example was adapted from".
- The cost matrix `[[40,47,80],[72,36,58],[24,61,71]]` is identical across
  both files; the prompt and the reviewer (§7 item 2) explicitly flagged
  authorship as undetermined and required the author to confirm.
- Neither file currently attributes the matrix to excel-easy.com. The example
  is not clearly framed as the author's own toy data either — the excel-easy
  URL in the §5.2 duplicate is suggestive enough that a defensive footnote
  is the safer choice without ground truth.
- Precedent inside `modeling-linear-programming.tex` line 636: the *Capital
  Investment* example carries an explicit footnote thanking excel-easy.com,
  showing the author has used this attribution pattern elsewhere. The
  *Hiring for tasks* example may have been intended to receive the same
  treatment and never did.

**Footnote text added (both files, verbatim):**

> The numerical cost matrix used in this example is similar to one appearing
> in an introductory assignment-problem tutorial at
> `\url{https://www.excel-easy.com/examples/assignment-problem.html}`; if the
> values were taken from that source rather than independently chosen, this
> footnote serves as attribution.

**Placement:**

- `modeling-sums.tex` — appended to the bullet "$C_{ij}$, the cost of
  assigning person $i \in I$ to task $j \in J$. The costs are given in the
  following table:" so it attaches to the line that introduces the matrix
  (immediately preceding the `\begin{bmatrix}` block).
- `modeling-linear-programming.tex` — appended to "Since each person has a
  different cost for each task, we must make an assignment to minimize our
  total cost." so it attaches to the sentence immediately preceding the
  tabular block that lists the cost values.

**Note on the prompt's "first occurrence" instruction:** the prompt suggested
modeling-sums.tex first, then modeling-linear-programming.tex. In the actual
book ordering, the first introduction of the matrix is
modeling-linear-programming.tex line 711 (Ch.3, §3.3.4) and the duplicate is
modeling-sums.tex line 548 (Ch.5, §5.2, which says "Recall
Example~\ref{example:hiring-for-tasks}"). Since the prompt directed footnotes
in BOTH files regardless of ordering, this does not change the outcome.

---

## Fix 2 — Broken DOI URL

**File:** `modeling-sums.tex`, line 792 (inside the references list of the
*Preference-Based Housing Assignment in Uruguayan Cooperatives* case study).

**Before:**

```
\url{https://doi. org/10.1109/CLEI.2016.7833357}
```

**After:**

```
\url{https://doi.org/10.1109/CLEI.2016.7833357}
```

**Diff:** the single space between `doi.` and `org` was removed. Resulting
URL has no embedded whitespace, no trailing punctuation, and resolves to the
IEEE/CLEI DOI for the Prino, Sánchez, Cancela 2016 paper that the case study
summarizes.

---

## Unexpected findings

- The first textual introduction of the *Hiring for tasks* cost matrix is in
  `modeling-linear-programming.tex`, not `modeling-sums.tex`, because the
  §5.2 occurrence opens with "Recall Example~\ref{example:hiring-for-tasks}"
  pointing back to §3.3.4. The prompt's ordering reads the two occurrences
  in file-listing order rather than reading order, but the action required
  was the same in both files so this had no effect on the fix.
- The `examplewithallcode` envelope in `modeling-linear-programming.tex` line
  713 points to the project's own GitHub xlsx, not to excel-easy.com. Only
  the §5.2 duplicate at `modeling-sums.tex` line 548 carries the
  excel-easy.com URL in the code-link slot. If the author confirms the
  matrix was independently authored, the cleaner follow-up would be to
  drop the excel-easy.com URL from that one `examplewithallcode` invocation
  (matching the §3.3.4 pattern) and remove both newly added footnotes.
  This is out of scope for the current pass — the footnote is reversible
  and defensible until the author confirms provenance.
- Reviewer §7 item 1 said the DOI was at line 792 with "extra space in
  `https://doi. org/...`". Confirmed exactly as described; no other DOI or
  URL on lines 780–810 had whitespace issues.

---

## Files touched

- `book/part1-linear-programming/ch02-modeling/modeling-sums.tex`
- `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex`

## Files NOT touched (per constraints)

- `book/section-6.3-fair-use-review.md` (review report, read-only)
- No commits, no pushes.
