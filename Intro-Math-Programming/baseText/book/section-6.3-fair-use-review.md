# Section 6.3 — Fair-Use Review

**Reviewer:** Phase 1 / Workstream D (per `BOOK1-FINISHING-AGENT-PLAN.md` §3.D).
**Mode:** Read-only. No source files were edited.
**Review date:** 2026-05-12.

---

## 1. Section location

| Field | Value |
|---|---|
| Compiled section | §6.3 — *Infinitely Many Optimal Solutions* |
| Containing chapter | Chapter 6 — *Graphically Solving Linear Programs* |
| Source file (absolute) | `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/part1-linear-programming/ch02-modeling/Section2.tex` |
| Line range | 358 – 487 (Section 6.4 *Problems with No Solution* begins at line 488) |
| Heading at | line 358 |
| Numbering source | `book/book1-main.toc` line 100: `\contentsline {section}{\numberline {6.3}Infinitely Many Optimal Solutions}{100}{section.6.3}%` |

### Note on Anita's prompt vs. current numbering

Anita Walz's March 2026 note read: *"Review assignment problem in
Section 6.3. No verbatim copying. Snippets OK if summarizing /
paraphrasing."*

Since that note was written the book has been restructured. The
current Section 6.3 is *Infinitely Many Optimal Solutions* and does
not contain the assignment problem. The assignment problem now lives
in two places:

- §3.3.4 *Assignment Problem* — `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex` line 708 (subsection inside Ch. 3 *Modeling: Linear Programming*).
- §5.2 *Assignment Problem* — `book/part1-linear-programming/ch02-modeling/modeling-sums.tex` line 326 (full section inside Ch. 5 *Modeling with Compact Notation*).

This review covers the literal §6.3 the prompt directs me to, and
also surfaces fair-use observations about the assignment-problem
material at §3.3.4 and §5.2, since that is what Anita's note targets
by content. The verdict for §6.3 is given below; the auxiliary
assignment-problem findings are listed separately so the author can
choose whether to act on them.

---

## 2. Anita Walz's criterion (restated)

> No verbatim copying. Snippets OK if summarizing / paraphrasing.

Operationalized as: (a) any borrowed passage must be paraphrased
rather than quoted; (b) brief quoted snippets must be in quotes with
attribution; (c) figures with non-author provenance must be cited or
replaced; (d) the source license must permit reuse under CC BY-SA 4.0.

---

## 3. Final verdict for §6.3

**OK — no fair-use blockers for peer-review submission.**

The section is original prose plus two author-drawn TikZ figures
built on the (post-rewrite) Furniture Workshop example. There are no
`\includegraphics`, no `\cite`, no `\footnote` citations, no
`\href` to external publications, no `\begin{quote}` blocks, and no
verbatim passages from Cheung, Griffin, Lyryx, Foundations, or
Sekhon-Bloom. The only links to external content are two `\ref`s to
the Lemonade Vendor example in §6.2 (which is itself adapted from
Cheung's CC BY-SA 4.0 `lineqlpbook`, attributed in
`frontmatter/sources-attribution.tex`). Cross-references do not
implicate fair use.

The Griffin issue (LICENSE-ISSUES.md item #1) that historically
attached to this chapter has been resolved by the March 2 2026
rewrite: Toy Maker → Furniture Workshop, screenshots replaced with
original TikZ, prose rewritten, exercises re-authored, Griffin
footnote removed.

---

## 4. Borrowed-material inventory (lines 358 – 487)

Items scanned for: `\cite`, `\citep`, `\textcite`, `\parencite`,
`\footnote`, `\href`, `\url`, `\includegraphics`, `\includetikz`,
`\includefiguretikz`, `\say`, `\begin{quote}`, embedded quotation
marks > ~10 words, and the strings *Griffin*, *Cheung*, *Lyryx*,
*Foundations*, *Sekhon*, *Bloom*, *Wikipedia*, *Penn State*,
*Emmanual*.

Matches inside lines 358–487: **none**.

| # | Item in §6.3 | Provenance | License/Status | Verdict | Recommendation |
|---|---|---|---|---|---|
| 1 | Example 6.3 *Furniture Workshop — Alternative Objective* (lines 362–374) | Built on the Furniture Workshop running example introduced earlier in this chapter. Per `LICENSE-ISSUES.md` #1 the Furniture Workshop was deliberately authored from scratch in March 2026 to replace Griffin's Toy Maker: different numbers (chairs/tables, $8/$6 profit), constraints 2x_1+x_2<=80, x_1+3x_2<=90, x_1<=35, optimal (30,20) with z=360 — scipy-verified. | Original to this book; CC BY-SA 4.0 applies. | **OK_AS_IS** | None. |
| 2 | TikZ figure `fig:FurnitureWorkshopAltOptSoln` (lines 379–421) | Author's TikZ. Matches metadata entry `@Online{tikz-Section2-03-833384fe, author = {{Robert Hildebrand}}, year = {2026}, ...}` in `optimization/figures/figures-source/00_METADATA.bib` lines 1868–1875. | Author's own work. | **OK_AS_IS** | None. |
| 3 | Solution narrative (lines 376–425): gradient/level-curve argument and the `(x_1^*, x_2^*) ∈ [30,35] × {80−2x_1^*}` closing argument | Generic LP exposition tied to the new Furniture Workshop numbers. No external paraphrase. | Original prose. | **OK_AS_IS** | None. |
| 4 | Inline `\ref{exa:lemonadevendor}` cross-reference (line 427) | Pointer to the Lemonade Vendor example in §6.2 of the same chapter. That example is adapted from Cheung's `lineqlpbook` (CC BY-SA 4.0); attributed in `frontmatter/sources-attribution.tex`. §6.3 itself reproduces nothing from Cheung; only the name is invoked. | CC BY-SA 4.0; compatible. | **OK_AS_IS** | None. |
| 5 | *Extended Graphical Solution Method* algorithm box (lines 431–447) | Four-step procedure for graphical LP. Wording is original; per the LICENSE-ISSUES.md #1 action log: "Rewrote all expository prose in original words (algorithm descriptions, four-outcome classification, etc.)" Mathematical procedures are not copyrightable in any case. | Original prose; standard mathematical method. | **OK_AS_IS** | None. |
| 6 | Learning Checkpoint (lines 449–483) including its inline TikZ (triangular feasible region + four parallel dashed level curves) | TikZ written directly from `\draw`/`\fill` primitives; no external graphic referenced. | Author's own work. | **OK_AS_IS** | Optional: register the inline TikZ in `00_METADATA.bib` for alt-text consistency; out of scope for this review. |
| 7 | Exercise *Graphical Method for Lemonade Vendor* (line 427) and exercise *Infinitely Many Optimal Solutions* (line 485) | Per LICENSE-ISSUES.md #1: "Created new exercises referencing the new Furniture Workshop and unbounded examples." | Original to this book. | **OK_AS_IS** | None. |
| 8 | One-sentence motivating paragraph (line 360) | Generic textbook statement of the alternative-optimal phenomenon. | Original. | **OK_AS_IS** | None. |

### Items checked for and explicitly not found in §6.3

- No `\includegraphics` calls in lines 358–487 (the closest one is at line 333, `images/lemon`, which is inside §6.2, not §6.3).
- No `\cite{}`, `\footnote{}`, or `\href{}` to external publications, screenshots, or third-party sites in §6.3.
- No `\begin{quote}` / `\end{quote}` blocks, no `\say{}` calls.
- No quotation-marked snippets > 10 words.
- No residual reference to Griffin, Joshua Emmanual, or Penn State Math 484 anywhere in §6.3. The original Griffin attribution footnote at the chapter level (formerly Section2.tex line 18) was removed in the March 2026 rewrite (LICENSE-ISSUES.md #1 checklist item: "Removed the Griffin footnote").

---

## 5. Four-factor assessment for §6.3

| Factor | Finding |
|---|---|
| (a) Purpose & character | Educational, transformative, non-profit OER. |
| (b) Nature of the source | N/A — no copyrighted source material is reproduced. |
| (c) Amount and substantiality | Zero borrowed text; both embedded figures are original. |
| (d) Effect on the market | None. |
| License compatibility | All material original to the author; project CC BY-SA 4.0 applies cleanly. The only out-of-section reference (Lemonade Vendor via `\ref`) is to CC BY-SA 4.0 content already attributed in the front matter. |

Anita's bar — no verbatim copying, snippets-only with paraphrase — is
met because no copying of any kind occurs in §6.3.

---

## 6. Adjacent findings (not in §6.3 itself, but in scope of Anita's note)

These are surfaced for the author because Anita's note targeted "the
assignment problem", which has migrated out of §6.3 in the current
numbering. None of these block submission of §6.3.

### 6.1 §5.2 *Assignment Problem* — `book/part1-linear-programming/ch02-modeling/modeling-sums.tex` lines 326 – 795

| # | Item | Provenance | Verdict | Recommendation |
|---|---|---|---|---|
| A1 | Section opening definition (lines 326–327): "The assignment problem is a fundamental optimization problem in combinatorial optimization. It involves assigning a set of n agents (or workers) to n tasks (or jobs) ..." | Generic textbook framing of the assignment problem. Standard mathematical content; not unique to any one source. | **OK_AS_IS** | None. The phrasing is generic; the model that follows (sets, parameters, decision variables, two assignment constraints, binary constraint) is the canonical formulation and is not copyrightable. |
| A2 | `\begin{examplewithallcode}{Hiring for tasks}{https://www.excel-easy.com/examples/assignment-problem.html}{}{}` (line 548) | The example carries a bare URL pointing to excel-easy.com as the "code" link. excel-easy.com's content is typically copyrighted; no explicit attribution paragraph identifies the example as adapted from that site. The numerical 3×3 cost matrix `[[40,47,80],[72,36,58],[24,61,71]]` is unusual enough that the author should confirm it was not lifted from excel-easy.com. | **ADD_CITATION** if the matrix was taken from excel-easy.com; **OK_AS_IS** if independently authored. | If the cost matrix was sourced from the linked excel-easy.com page, add a short footnote: *"Cost matrix adapted from excel-easy.com (used with permission / under fair use as a small data snippet)."* Otherwise replace the URL with an internal reference or remove the third positional argument so the example reads as the author's own. |
| A3 | `\begin{casestudybox}{Preference-Based Housing Assignment in Uruguayan Cooperatives}` (lines 663–795) | The case study summarizes Prino, Sánchez, Cancela 2016 (CLEI). The two-stage MIP formulation is recapped (and modeled in original TeX), names of the cooperative (Virazón), specific implementation details ("over 30 housing cooperatives"), and outcome percentages ("more than 37% of members received their first-choice unit", "over half ... received one of their top four choices") are reported as factual statements. References listed at lines 791–793 (IFORS Newsletter Dec 2024; Prino et al., CLEI 2016, DOI 10.1109/CLEI.2016.7833357). | **OK_AS_IS** with one minor cleanup. The borrowing is summary/factual reporting with both primary sources cited — squarely within Anita's "snippets OK if summarizing/paraphrasing" guidance. Statistics quoted as facts (37%, "over half") are not copyrightable. | Fix the DOI URL typo at line 792 — the rendered text reads `https://doi. org/10.1109/CLEI.2016.7833357` (extra space). Remove the space so the link works. No other changes required. |
| A4 | Hiring for tasks numerical example block (lines 548–609) is a near-duplicate of the worked example in §3.3.4 (`modeling-linear-programming.tex` line 708). Same 3×3 cost matrix; same model. | Internal duplication, not external borrowing. | **OK_AS_IS** (out of scope for fair use). | Optional editorial cleanup unrelated to fair use: cross-reference rather than re-derive. |
| A5 | TikZ figure of the bipartite people–tasks graph (lines 329–401) | Built from `\draw`/`\fill` primitives; no external graphic. | **OK_AS_IS** | None. |
| A6 | Two adjacent assignment-problem examples that contain commented-out content: `\begin{general}{Assignment Problem}{}{}` (line 455) contains a commented machine/job description; lines 451–453 contain commented prose. | Commented-out, does not render. | **OK_AS_IS** | None. (Author may delete the commented prose for cleanliness, unrelated to fair use.) |

### 6.2 §3.3.4 *Assignment Problem* — `book/part1-linear-programming/ch02-modeling/modeling-linear-programming.tex` lines 708 – 755

| # | Item | Provenance | Verdict | Recommendation |
|---|---|---|---|---|
| B1 | Worked example *Hiring for tasks* (lines 711–727) with cost matrix `[[40,47,80],[72,36,58],[24,61,71]]` | Same matrix as §5.2 (item A2 above). The `\begin{examplewithallcode}` arguments at line 713 point to a GitHub xlsx file under `open-optimization/open-optimization-or-book`, i.e. the project's own repo. | **OK_AS_IS** if matrix is independently authored; **ADD_CITATION** if matrix was sourced from excel-easy.com. | Same resolution as A2: add a one-line footnote if the matrix was lifted; otherwise no action. |
| B2 | Section preamble (line 709) and full model formulation (lines 745–754) | Standard textbook assignment-problem material; original prose. | **OK_AS_IS** | None. |
| B3 | Exercise-section footnote at line 757: `\section{Exercises}\footnote{Some exercises in this section were adapted from content by Rupinder Sekhon and Roberta Bloom, shared under CC BY 4.0 via LibreTexts.}` | Sekhon & Bloom (Applied Finite Mathematics) is CC BY 4.0 — compatible with CC BY-SA 4.0. Attribution present. | **OK_AS_IS** | None. The attribution is correct and the license permits adaptation; the front-matter sources page also lists this source (LICENSE-ISSUES.md item #6, resolved). |

---

## 7. Actionable items

For §6.3 itself, the verdict is **OK as-is**. Author action items
flagged below are optional refinements driven by the adjacent
assignment-problem material that motivated Anita's original note;
none block §6.3 from peer-review submission.

1. **(Recommended — single sentence fix)** `modeling-sums.tex` line 792: fix the broken DOI link by removing the stray space in `https://doi. org/10.1109/CLEI.2016.7833357`. Cosmetic, but the case study otherwise cites its primary sources correctly.
2. **(Verify — likely a no-op)** `modeling-sums.tex` line 548 and `modeling-linear-programming.tex` line 713: confirm the 3×3 cost matrix `[[40,47,80],[72,36,58],[24,61,71]]` was authored by the textbook, not lifted from the linked excel-easy.com page. If lifted, add a one-line footnote/attribution; if not, drop the third positional argument of `\begin{examplewithallcode}` so the URL no longer reads as the example's "source".
3. **(Optional — out of fair-use scope)** Consider replacing the duplicated worked example at `modeling-sums.tex` line 548 with a cross-reference to §3.3.4's example, since both reproduce the same matrix and model.
4. **(Optional — out of fair-use scope)** The inline Learning Checkpoint TikZ in §6.3 (Section2.tex line 452) has no entry in `00_METADATA.bib`; consistency with the rest of the project's accessibility infrastructure would benefit from registering it. Tracked in Phase 1 Workstream B; not a fair-use issue.

---

## 8. Things not determined / caveats

- **`book1-main.aux` is access-restricted in this session.** Section numbering was resolved from `book1-main.toc` instead (line 100 confirms `\numberline {6.3}Infinitely Many Optimal Solutions` at page 100 of the PDF). The `.toc` is regenerated from the same compile pass as the `.aux`, so this is authoritative.
- **`NON-DISTRIBUTABLE/Christopher_Griffin_Penn_State_University/`** was not inspected per the project rule barring access to that directory. The Griffin license issue (LICENSE-ISSUES.md #1) is treated as resolved based on the documented checklist; no fresh prose comparison against Griffin's `Section6.tex` was performed.
- **The 3×3 cost-matrix authorship question (items A2/B1)** could not be resolved from inside the book source alone — it requires the author to confirm whether the matrix was lifted from excel-easy.com or independently chosen. The URL appears in the example's "code link" slot, which is structurally ambiguous: it can mean either "code that solves this example" or "source the example was taken from."
- **Cheung's Lemonade Vendor (§6.2)** is referenced by §6.3 only via `\ref`; the actual reproduction at lines 232–263 of `Section2.tex` lies outside §6.3 and is governed by CC BY-SA 4.0 (Cheung's license per file headers; LICENSE-ISSUES.md #8 confirmed and resolved). No action required for the §6.3 cross-reference.
