# Theorem 7.2 — Convexity of Polyhedra: Proof Expansion Log

## Source location

- **File:** `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/part1-linear-programming/ch05-lp-theory/formalize-LP.tex`
- **Theorem statement:** lines 467–470 (`\begin{theorem}{Convexity of Polyhedra} \label{thm:polyhedra_convex} ... \end{theorem}`)
- **Proof block (pre-edit):** lines 472–500
- **Label:** `thm:polyhedra_convex`

(The `.aux` files under `baseText/book/` are blocked by session permissions, so the label-to-number mapping could not be verified by reading the aux directly. The label and surrounding chapter context — ch05-lp-theory in book1 — unambiguously identify this theorem, and there is exactly one theorem in the file whose title is "Convexity of Polyhedra.")

## Original proof (verbatim)

The original proof block was effectively empty: every line of substantive prose was commented out with `%`, leaving only four stray empty display-math environments. As rendered, the proof produced a few blank equations and no text.

```latex
\begin{proof}
%Let \( P \) be a polyhedron in \(\mathbb{R}^n\) defined by the intersection of finitely many half-spaces:
\[
%P = \{\mathbf{x} \in \mathbb{R}^n : A\mathbf{x} \leq \mathbf{b}\},
\]
%where \(A\) is an \(m \times n\) matrix, \(\mathbf{x} \in \mathbb{R}^n\) is a variable vector, and \(\mathbf{b} \in \mathbb{R}^m\) is a constant vector.
%
%To prove \(P\) is convex, we must show that for any two points \(\mathbf{x}_1, \mathbf{x}_2 \in P\) and any \(\lambda \in [0, 1]\), the point:
\[
\mathbf{x}_\lambda = \lambda \mathbf{x}_1 + (1 - \lambda) \mathbf{x}_2
\]
%also lies in \(P\).
%
%Since \(\mathbf{x}_1, \mathbf{x}_2 \in P\), they satisfy:
\[
%A\mathbf{x}_1 \leq \mathbf{b} \quad \text{and} \quad A\mathbf{x}_2 \leq \mathbf{b}.
\]
%By linearity of matrix multiplication and scalar multiplication, for any \(\lambda \in [0, 1]\),
\[
%A\mathbf{x}_\lambda = A(\lambda \mathbf{x}_1 + (1 - \lambda) \mathbf{x}_2) = \lambda A\mathbf{x}_1 + (1 - \lambda) A\mathbf{x}_2.
\]
%Using the inequality \(A\mathbf{x}_1 \leq \mathbf{b}\) and \(A\mathbf{x}_2 \leq \mathbf{b}\), we know:
\[
\lambda A\mathbf{x}_1 + (1 - \lambda) A\mathbf{x}_2 \leq \lambda \mathbf{b} + (1 - \lambda) \mathbf{b} = \mathbf{b}.
\]
%Thus, \(\mathbf{x}_\lambda \in P\).
%
%Since \(\mathbf{x}_\lambda\) is in \(P\) for all \(\lambda \in [0, 1]\), it follows that \(P\) is convex.
\end{proof}
```

## Expanded proof (verbatim)

```latex
\begin{proof}
Intuitively, convexity says that the line segment between any two points of the set stays inside the set. For a polyhedron defined by linear inequalities, this property follows directly from the linearity of those inequalities, as we now show.

Let \( P \) be a polyhedron in \(\mathbb{R}^n\) defined by the intersection of finitely many half-spaces:
\[
P = \{\mathbf{x} \in \mathbb{R}^n : A\mathbf{x} \leq \mathbf{b}\},
\]
where \(A\) is an \(m \times n\) matrix, \(\mathbf{x} \in \mathbb{R}^n\) is a variable vector, and \(\mathbf{b} \in \mathbb{R}^m\) is a constant vector.

To prove \(P\) is convex, we must show that for any two points \(\mathbf{x}_1, \mathbf{x}_2 \in P\) and any \(\lambda \in [0, 1]\), the convex combination
\[
\mathbf{x}_\lambda = \lambda \mathbf{x}_1 + (1 - \lambda) \mathbf{x}_2
\]
also lies in \(P\). In other words, we need to verify that \(\mathbf{x}_\lambda\) satisfies every constraint defining \(P\), namely \(A\mathbf{x}_\lambda \leq \mathbf{b}\).

Since \(\mathbf{x}_1, \mathbf{x}_2 \in P\), each of them satisfies the defining inequalities:
\[
A\mathbf{x}_1 \leq \mathbf{b} \quad \text{and} \quad A\mathbf{x}_2 \leq \mathbf{b}.
\]
By linearity of matrix multiplication, we can distribute \(A\) across the convex combination:
\[
A\mathbf{x}_\lambda = A(\lambda \mathbf{x}_1 + (1 - \lambda) \mathbf{x}_2) = \lambda A\mathbf{x}_1 + (1 - \lambda) A\mathbf{x}_2.
\]
Because \(\lambda \geq 0\) and \(1-\lambda \geq 0\), multiplying the inequalities \(A\mathbf{x}_1 \leq \mathbf{b}\) and \(A\mathbf{x}_2 \leq \mathbf{b}\) by these non-negative scalars preserves their direction. Adding the two scaled inequalities together yields
\[
\lambda A\mathbf{x}_1 + (1 - \lambda) A\mathbf{x}_2 \leq \lambda \mathbf{b} + (1 - \lambda) \mathbf{b} = \mathbf{b}.
\]
Combining the two displayed lines, we conclude that \(A\mathbf{x}_\lambda \leq \mathbf{b}\), so \(\mathbf{x}_\lambda \in P\).

Since \(\mathbf{x}_1\), \(\mathbf{x}_2\), and \(\lambda\) were arbitrary, every convex combination of points in \(P\) remains in \(P\). Therefore \(P\) is convex.
\end{proof}
```

## Rationale for the additions

1. **Uncommented the prose.** The author had a complete skeleton draft of the argument written in comments, with only the equations live. Removing the leading `%` revives the existing prose so the proof actually renders.

2. **Added an "Intuition" opening sentence.** The first paragraph now states the geometric idea (line segment stays inside the set) and tells the reader why linearity of the inequalities will make the argument work. This was requested in the task spec (Step 4) and matches the pedagogical register of nearby proofs in the chapter.

3. **Added bridging sentences between equations.**
   - Before the goal equation, the proof now explicitly names what must be shown: "we need to verify that \(\mathbf{x}_\lambda\) satisfies every constraint defining \(P\), namely \(A\mathbf{x}_\lambda \leq \mathbf{b}\)." This frames the calculation as a verification rather than a sequence of identities.
   - Before the distribution step, "By linearity of matrix multiplication, we can distribute \(A\) across the convex combination" names the property being used.
   - Before the inequality step, the proof spells out *why* \(\lambda A\mathbf{x}_1 + (1-\lambda)A\mathbf{x}_2 \leq \lambda \mathbf{b}+(1-\lambda)\mathbf{b}\) holds — scaling by non-negative numbers preserves the direction of an inequality, and adding two inequalities of the same sense preserves it again. Students new to convexity proofs typically stumble exactly here.
   - After the last display, "Combining the two displayed lines, we conclude that \(A\mathbf{x}_\lambda \leq \mathbf{b}\)" closes the loop and ties the chain back to the goal.

4. **Strengthened the closing sentence.** "Since \(\mathbf{x}_1\), \(\mathbf{x}_2\), and \(\lambda\) were arbitrary, every convex combination of points in \(P\) remains in \(P\). Therefore \(P\) is convex." This makes the universal-quantifier step explicit, which is the move that converts the calculation into the definition of convexity.

5. **No forward references introduced.** The proof only uses (a) the definition of convex set (already introduced earlier in this same section), (b) the definition of a polyhedron, and (c) elementary properties of inequalities and matrix-vector multiplication. No later theorems or lemmas are invoked.

6. **Preserved structure and notation.** The variable names (\(\mathbf{x}_1, \mathbf{x}_2, \mathbf{x}_\lambda, \lambda, A, \mathbf{b}\)) and the four display equations are kept exactly as the author originally drafted them; only the prose around them has been reactivated and lightly expanded. The `\begin{proof}...\end{proof}` environment from `amsthm` (the same environment used by every other proof in this file) is retained.
