import React, { useMemo, useState } from "react";

/* ============================================================
   CONCEPT QUIZ — Linear and Integer Programming
   Companion to Mathematical Programming and Operations Research
   (Book 1). Multiple choice with instant feedback and short
   explanations, organized by book topic.
   ============================================================ */

const BANK = [
  // ---------- LP basics / modeling ----------
  {
    topic: "LP basics",
    q: "Which of the following is a linear constraint?",
    opts: ["x₁ x₂ ≤ 4", "2x₁ − 3x₂ ≥ 6", "x₁² + x₂ ≤ 3", "x₁ / x₂ = 2"],
    ans: 1,
    why: "Linear constraints are built only from variables times constants, added together. Products, squares, and ratios of variables are all nonlinear.",
  },
  {
    topic: "LP basics",
    q: "The feasible region of any linear program is always:",
    opts: ["bounded", "nonempty", "convex", "a region with integer corner points"],
    ans: 2,
    why: "An intersection of half-spaces is convex. It can be empty (infeasible) or unbounded, and its vertices are usually fractional.",
  },
  {
    topic: "LP basics",
    q: "An LP has two distinct optimal solutions. How many optimal solutions does it have?",
    opts: ["exactly two", "at most a finite number", "infinitely many", "cannot be determined"],
    ans: 2,
    why: "Every point on the segment between two optimal solutions is feasible (convexity) and has the same objective value, so the whole segment is optimal.",
  },
  {
    topic: "LP basics",
    q: "Converting to standard form (equalities, nonnegative variables), an inequality 3x₁ + x₂ ≤ 7 becomes:",
    opts: [
      "3x₁ + x₂ + s = 7 with s ≥ 0",
      "3x₁ + x₂ − s = 7 with s ≥ 0",
      "3x₁ + x₂ = 7 + M",
      "it cannot be converted",
    ],
    ans: 0,
    why: "A ≤ constraint gets a nonnegative slack variable added to close the gap. (A ≥ constraint would subtract a surplus variable.)",
  },
  // ---------- Simplex ----------
  {
    topic: "Simplex",
    q: "In a simplex dictionary, you read off the current basic feasible solution by:",
    opts: [
      "setting all basic variables to zero",
      "setting all nonbasic variables to zero",
      "solving a new linear system from scratch",
      "averaging the right-hand sides",
    ],
    ans: 1,
    why: "Nonbasic variables sit at 0; each basic variable then equals the constant in its row, and z equals the constant in the objective row.",
  },
  {
    topic: "Simplex",
    q: "Maximization problem, dictionary form. Which variable is eligible to enter the basis?",
    opts: [
      "any nonbasic variable with a positive coefficient in the z-row",
      "any nonbasic variable with a negative coefficient in the z-row",
      "the basic variable with the smallest value",
      "any variable at all",
    ],
    ans: 0,
    why: "A positive z-row coefficient means increasing that nonbasic variable increases z. (In tableau form the signs flip, so there you look for negative entries.)",
  },
  {
    topic: "Simplex",
    q: "What does the ratio test decide, and why?",
    opts: [
      "which variable enters, to increase z fastest",
      "which variable leaves, to keep all variables nonnegative",
      "whether the LP is degenerate",
      "when to switch to Phase 2",
    ],
    ans: 1,
    why: "As the entering variable grows, basic variables shrink. The ratio test finds the first one to hit zero; stopping there keeps the solution feasible.",
  },
  {
    topic: "Simplex",
    q: "The entering variable's coefficients are nonnegative in every dictionary row (no basic variable decreases as it grows). The LP is:",
    opts: ["infeasible", "degenerate", "optimal", "unbounded"],
    ans: 3,
    why: "The entering variable can increase forever, improving z without limit and without any basic variable going negative: the LP is unbounded.",
  },
  {
    topic: "Simplex",
    q: "Degeneracy means:",
    opts: [
      "the LP has multiple optima",
      "some basic variable equals zero, so a pivot may not improve z",
      "the feasible region is empty",
      "the objective coefficients are all zero",
    ],
    ans: 1,
    why: "With a basic variable at zero, the ratio test can force a step of length 0: the basis changes but the point and objective don't. This is what makes cycling possible.",
  },
  // ---------- Duality / sensitivity ----------
  {
    topic: "Duality",
    q: "Weak duality for a max primal says any feasible dual solution gives:",
    opts: [
      "a lower bound on the optimal value",
      "an upper bound on the optimal value",
      "the exact optimal value",
      "a feasible primal solution",
    ],
    ans: 1,
    why: "Every feasible dual is a certificate: its objective value is at least as large as every feasible primal value. Strong duality says the best certificate is tight.",
  },
  {
    topic: "Duality",
    q: "How many dual variables does an LP with 5 constraints and 8 variables have?",
    opts: ["8", "5", "13", "40"],
    ans: 1,
    why: "One dual variable per primal constraint (and one dual constraint per primal variable, so the dual here has 8 constraints).",
  },
  {
    topic: "Duality",
    q: "The primal is unbounded. The dual is:",
    opts: ["unbounded", "optimal with the same value", "infeasible", "degenerate"],
    ans: 2,
    why: "If any feasible dual existed, weak duality would cap the primal. No cap exists, so no feasible dual exists.",
  },
  {
    topic: "Duality",
    q: "At an optimum, a constraint has slack (is not tight). Complementary slackness says its dual variable (shadow price) is:",
    opts: ["positive", "negative", "zero", "equal to the slack"],
    ans: 2,
    why: "A resource you aren't fully using is worth nothing at the margin: leftover flour means one more kilogram of flour can't help you.",
  },
  {
    topic: "Sensitivity",
    q: "Within the allowable range for a right-hand side bᵢ, the optimal objective changes:",
    opts: [
      "not at all",
      "linearly, at a rate equal to the shadow price",
      "quadratically",
      "unpredictably",
    ],
    ans: 1,
    why: "While the optimal basis stays the same, z* = yᵀb, so each unit of bᵢ is worth exactly its shadow price yᵢ. Past the range, the basis changes and a new rate applies.",
  },
  {
    topic: "Sensitivity",
    q: "A solver reports shadow price $0 for the material constraint. This means:",
    opts: [
      "material is the bottleneck",
      "the constraint is not binding at the optimum",
      "material is free to purchase",
      "the LP is degenerate",
    ],
    ans: 1,
    why: "Zero shadow price goes with slack: you have material left over, so a bit more of it wouldn't change the optimal plan. (The converse can fail under degeneracy.)",
  },
  // ---------- Integer programming ----------
  {
    topic: "Integer programming",
    q: "For a maximization IP, the optimal value of its LP relaxation is:",
    opts: [
      "a lower bound on the IP optimum",
      "an upper bound on the IP optimum",
      "equal to the IP optimum",
      "unrelated to the IP optimum",
    ],
    ans: 1,
    why: "The relaxation allows every integer solution and more, so its max is at least the IP's max. Branch-and-bound leans on this bound constantly.",
  },
  {
    topic: "Integer programming",
    q: "Rounding the LP relaxation's fractional solution to the nearest integers:",
    opts: [
      "always gives the IP optimum",
      "always gives a feasible IP solution, maybe suboptimal",
      "can be infeasible, and even when feasible can be far from optimal",
      "is how branch-and-bound works",
    ],
    ans: 2,
    why: "Rounding can violate constraints, and even feasible roundings can be poor. That's exactly why we need real IP algorithms like branch-and-bound.",
  },
  {
    topic: "Integer programming",
    q: "In branch-and-bound (max problem), a node can be fathomed when:",
    opts: [
      "its LP relaxation is infeasible",
      "its LP bound is no better than the incumbent",
      "its LP solution is integer",
      "all of the above",
    ],
    ans: 3,
    why: "The three fathoming rules: infeasibility, bound, and integrality. Everything else requires branching.",
  },
  {
    topic: "Integer programming",
    q: "The constraint x ≤ M·y with y ∈ {0,1} and M large enforces:",
    opts: [
      "if y = 0 then x = 0",
      "if y = 1 then x = M",
      "x and y are equal",
      "y counts how many units of x we make",
    ],
    ans: 0,
    why: "y = 0 forces x ≤ 0 (so x = 0 with x ≥ 0); y = 1 relaxes the constraint to x ≤ M, effectively no limit. This is the big-M linking trick for fixed charges.",
  },
  {
    topic: "Integer programming",
    q: "Branching on x₁ = 2.6 creates children with x₁ ≤ 2 and x₁ ≥ 3. Which integer solutions are lost?",
    opts: [
      "those with x₁ = 2 or x₁ = 3",
      "none",
      "those between 2 and 3",
      "the LP optimum",
    ],
    ans: 1,
    why: "Every integer has x₁ ≤ 2 or x₁ ≥ 3. Only the strip 2 < x₁ < 3, which contains no integer points, is cut away. Branching never loses integer solutions.",
  },
];

const TOPICS = ["All", ...Array.from(new Set(BANK.map((b) => b.topic)))];

function shuffle(arr, seed) {
  // Deterministic-ish shuffle so a retake reorders
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizDemo() {
  const [topic, setTopic] = useState("All");
  const [seed, setSeed] = useState(1);
  const questions = useMemo(() => {
    const qs = BANK.filter((b) => topic === "All" || b.topic === topic);
    return shuffle(qs, seed);
  }, [topic, seed]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  function restart(newTopic) {
    if (newTopic !== undefined) setTopic(newTopic);
    setSeed((s) => s + 1);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setAnswered(0);
    setDone(false);
  }

  function choose(i) {
    if (picked != null) return;
    setPicked(i);
    setAnswered((a) => a + 1);
    if (i === q.ans) setScore((s) => s + 1);
  }

  function next() {
    if (idx + 1 >= questions.length) setDone(true);
    else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  const chip = (t) => (
    <button
      key={t}
      onClick={() => restart(t)}
      style={{
        padding: "6px 12px",
        borderRadius: 16,
        border: "1px solid #ccc",
        background: topic === t ? "#111" : "#fff",
        color: topic === t ? "#fff" : "#333",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: topic === t ? 700 : 500,
      }}
    >
      {t}
    </button>
  );

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Concept Quiz</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Quick self-checks on linear and integer programming. Pick a topic, answer,
        and read the one-paragraph explanation whether you were right or wrong.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {TOPICS.map(chip)}
      </div>

      {done ? (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 26, textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 800 }}>
            {score} / {answered}
          </div>
          <div style={{ color: "#555", margin: "8px 0 18px" }}>
            {score === answered
              ? "Perfect. Go do the exercises at the end of the chapter."
              : score >= answered * 0.7
              ? "Solid. Reread the explanations you missed, then retake."
              : "Worth another pass through the chapter before retaking."}
          </div>
          <button
            onClick={() => restart()}
            style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "#111", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Retake ({topic})
          </button>
        </div>
      ) : (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "#777" }}>
            <span>
              Question {idx + 1} of {questions.length} · {q.topic}
            </span>
            <span>
              Score: {score}/{answered}
            </span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>{q.q}</div>
          <div style={{ display: "grid", gap: 8 }}>
            {q.opts.map((o, i) => {
              let bg = "#fff", border = "#ccc";
              if (picked != null) {
                if (i === q.ans) { bg = "#e8f5e9"; border = "#2e7d32"; }
                else if (i === picked) { bg = "#fdecea"; border = "#c62828"; }
              }
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  style={{
                    textAlign: "left", padding: "11px 14px", borderRadius: 8,
                    border: `1.5px solid ${border}`, background: bg,
                    cursor: picked == null ? "pointer" : "default", fontSize: 15,
                  }}
                >
                  {String.fromCharCode(65 + i)}. {o}
                </button>
              );
            })}
          </div>
          {picked != null && (
            <div style={{ marginTop: 14, padding: "12px 14px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 8, fontSize: 14, lineHeight: 1.55 }}>
              <b>{picked === q.ans ? "Correct." : "Not quite."}</b> {q.why}
            </div>
          )}
          {picked != null && (
            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button
                onClick={next}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#111", color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                {idx + 1 >= questions.length ? "Finish" : "Next question"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
