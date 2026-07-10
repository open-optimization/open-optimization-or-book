import React, { useState, useMemo } from "react";
import { Terminal, RotateCcw } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   INTERACTIVE SIMPLEX — DICTIONARY (ALGEBRAIC) FORM
   ISE 5406

   Companion to simplex_tableau_demo.jsx. Same LP, same pivoting
   mechanics, but the algorithm state is shown as a DICTIONARY:

       max  z  =  z*  +  Σ_{j non-basic}  c̄_j · x_j
       x_{B_i}  =  b̄_i  −  Σ_{j non-basic}  ā_{ij} · x_j     ∀ i

   Non-basic variables are always at 0, so plugging x_j = 0 for
   all non-basic j immediately gives the current BFS and z*.

   Click any non-basic variable in the z-row with a POSITIVE
   coefficient to enter it into the basis. The eligible ratio-
   test rows highlight. Click a row to pivot — its basic variable
   is expressed in terms of the entering variable, then substituted
   into every other row and the objective.
   ============================================================ */

// ============================================================
// Default problem — matches simplex_tableau_demo.jsx
//   max  3 x1 + 5 x2
//   s.t. 2 x1 + x2  <= 8
//        x1 + 3 x2  <= 6
//        x1, x2 >= 0
// ============================================================
const DEFAULT_C = [3, 5];
const DEFAULT_A = [
  [2, 1],
  [1, 3],
];
const DEFAULT_B = [8, 6];

// ============================================================
// Tableau (used as backing storage — same math as tableau demo)
// Columns: x1, x2, s1, s2, RHS
// Rows: 0..m-1 = constraints, last = z
// z-row holds NEGATIVE reduced costs of non-basic vars.
// Dictionary form is derived from this on the fly.
// ============================================================
function buildInitial(c, A, b) {
  const m = A.length;
  const n = c.length;
  const totalCols = n + m + 1;
  const T = Array.from({ length: m + 1 }, () => Array(totalCols).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) T[i][j] = A[i][j];
    T[i][n + i] = 1;
    T[i][totalCols - 1] = b[i];
  }
  for (let j = 0; j < n; j++) T[m][j] = -c[j];
  const basis = [];
  for (let i = 0; i < m; i++) basis.push(n + i);
  return { T, basis, n, m };
}

function pivot(T, row, col) {
  const newT = T.map((r) => [...r]);
  const piv = newT[row][col];
  for (let j = 0; j < newT[0].length; j++) newT[row][j] /= piv;
  for (let i = 0; i < newT.length; i++) {
    if (i === row) continue;
    const factor = newT[i][col];
    if (Math.abs(factor) < 1e-12) continue;
    for (let j = 0; j < newT[0].length; j++)
      newT[i][j] -= factor * newT[row][j];
  }
  return newT;
}

function ratioTest(T, m, col) {
  const totalCols = T[0].length;
  const RHS = totalCols - 1;
  const ratios = [];
  for (let i = 0; i < m; i++) {
    const a = T[i][col];
    const r = T[i][RHS];
    ratios.push({
      row: i,
      ratio: a > 1e-9 ? r / a : Infinity,
      ok: a > 1e-9,
    });
  }
  let minRow = -1,
    minRatio = Infinity;
  ratios.forEach((r) => {
    if (r.ok && r.ratio < minRatio - 1e-9) {
      minRatio = r.ratio;
      minRow = r.row;
    }
  });
  return { ratios, minRow };
}

function reducedCosts(T, m) {
  // z-row holds NEGATIVE reduced costs.
  // Actual reduced cost (for "increase x_j improves z" logic in dictionary
  // form) is c̄_j = -T[m][j].
  return T[m].map((v) => -v);
}

function isOptimal(T, m, n) {
  for (let j = 0; j < n; j++) if (T[m][j] < -1e-9) return false;
  return true;
}

function varLabel(idx, n) {
  if (idx < n) return `x_${idx + 1}`;
  return `s_${idx - n + 1}`;
}

// ============================================================
// Format a single dictionary equation:
//   x_bi = rhs  ±  Σ coeff · x_j       for non-basic j
// Returns an array of Tex-friendly parts so we can highlight
// individual terms interactively.
// ============================================================
function equationParts(T, basis, n, m, rowIdx) {
  // If rowIdx < m: normal basic-variable equation
  //   x_{basis[rowIdx]} = T[rowIdx][RHS] - Σ_{j non-basic} T[rowIdx][j] · x_j
  // If rowIdx === m: objective
  //   z = T[m][RHS] + Σ_{j non-basic} (-T[m][j]) · x_j
  //     = T[m][RHS] + Σ_{j non-basic} c̄_j · x_j
  const totalCols = T[0].length;
  const RHS = totalCols - 1;
  const nonBasic = [];
  for (let j = 0; j < n + m; j++) {
    if (!basis.includes(j)) nonBasic.push(j);
  }

  if (rowIdx === m) {
    // Objective row
    const constant = T[m][RHS];
    const terms = nonBasic.map((j) => ({
      col: j,
      coef: -T[m][j], // reduced cost c̄_j
      variable: varLabel(j, n),
      isEntering: -T[m][j] > 1e-9, // positive reduced cost → improves obj
    }));
    return {
      isObjective: true,
      lhs: "z",
      constant,
      terms,
    };
  }
  // Constraint row
  const constant = T[rowIdx][RHS];
  const terms = nonBasic.map((j) => ({
    col: j,
    coef: -T[rowIdx][j], // sign flipped: x_B = rhs - a·x_N  ⇒  we display as sum with (-a)
    variable: varLabel(j, n),
  }));
  return {
    isObjective: false,
    lhs: varLabel(basis[rowIdx], n),
    constant,
    terms,
  };
}

function fmtNum(v) {
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  // Try to detect small integer ratios
  for (const denom of [2, 3, 4, 5, 6]) {
    const num = v * denom;
    if (Math.abs(num - Math.round(num)) < 1e-8) {
      const numI = Math.round(num);
      const g = gcd(Math.abs(numI), denom);
      const n2 = numI / g,
        d2 = denom / g;
      if (d2 === 1) return String(n2);
      return `\\tfrac{${n2}}{${d2}}`;
    }
  }
  return v.toFixed(3);
}
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// ============================================================
// Main component
// ============================================================
function DictionaryPivoter({ c, A, b }) {
  const initial = useMemo(() => buildInitial(c, A, b), [c, A, b]);

  const [history, setHistory] = useState([initial]);
  const [stepIdx, setStepIdx] = useState(0);
  const cur = history[stepIdx];
  const { T, basis, n, m } = cur;

  const [enteringCol, setEnteringCol] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const rcosts = reducedCosts(T, m);
  const optimal = isOptimal(T, m, n);

  // Recommended (Dantzig's rule) entering column
  const suggestedCol = useMemo(() => {
    let bestJ = -1,
      bestVal = 1e-9;
    for (let j = 0; j < n + m; j++) {
      if (rcosts[j] > bestVal) {
        bestVal = rcosts[j];
        bestJ = j;
      }
    }
    return bestJ;
  }, [rcosts, n, m]);
  const suggestedRow = useMemo(() => {
    if (suggestedCol < 0) return -1;
    return ratioTest(T, m, suggestedCol).minRow;
  }, [T, m, suggestedCol]);

  function doPivot(row, col) {
    const newT = pivot(T, row, col);
    const newBasis = [...basis];
    newBasis[row] = col;
    const newHist = history.slice(0, stepIdx + 1);
    newHist.push({ T: newT, basis: newBasis, n, m });
    setHistory(newHist);
    setStepIdx(newHist.length - 1);
    setEnteringCol(null);
    setFeedback(null);
  }

  function handleVarClick(j) {
    if (rcosts[j] < 1e-9) {
      if (practiceMode)
        setFeedback({
          ok: false,
          msg: `${varLabel(j, n)} has coefficient ${rcosts[j].toFixed(2)} in the z-row. Non-positive means increasing it can't improve z.`,
        });
      return;
    }
    if (practiceMode) {
      const dan = varLabel(suggestedCol, n);
      if (j === suggestedCol)
        setFeedback({
          ok: true,
          msg: `Correct. ${varLabel(j, n)} has the largest positive z-coefficient (${rcosts[j].toFixed(2)}). Now pick the row whose basic variable will LEAVE the basis.`,
        });
      else
        setFeedback({
          ok: true,
          msg: `${varLabel(j, n)} is valid (coef = ${rcosts[j].toFixed(2)}), but Dantzig's rule picks the LARGEST positive coefficient: ${dan} at ${rcosts[suggestedCol].toFixed(2)}.`,
        });
    }
    setEnteringCol(j);
  }

  function handleRowClick(i) {
    if (enteringCol === null) return;
    if (T[i][enteringCol] <= 1e-9) {
      if (practiceMode)
        setFeedback({
          ok: false,
          msg: `Row ${i + 1} has coefficient ${T[i][enteringCol].toFixed(2)} for ${varLabel(enteringCol, n)} — not positive. Bumping ${varLabel(enteringCol, n)} doesn't decrease ${varLabel(basis[i], n)}.`,
        });
      return;
    }
    const { minRow } = ratioTest(T, m, enteringCol);
    if (practiceMode && i !== minRow) {
      setFeedback({
        ok: false,
        msg: `Row ${i + 1}'s ratio isn't the minimum. Ratio test says row ${minRow + 1} leaves first (its basic variable hits zero soonest).`,
      });
    } else {
      doPivot(i, enteringCol);
    }
  }

  function reset() {
    setHistory([initial]);
    setStepIdx(0);
    setEnteringCol(null);
    setFeedback(null);
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Simplex Dictionary — Algebraic Pivoting
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        The same problem as the tableau demo, presented as a{" "}
        <b>dictionary</b>: each basic variable is written explicitly as an
        expression in the non-basic variables, and z is a linear
        combination of non-basics too. Non-basic variables are always at
        zero, so plugging <Tex>{`x_j = 0`}</Tex> for all non-basic j
        immediately reads off the current BFS and z-value from the
        constants. Click a non-basic variable in the z-row with a
        positive coefficient to enter it into the basis.
      </p>

      <div style={problemBox}>
        <Tex block>
          {String.raw`\begin{aligned} \max\;\; & 3 x_1 + 5 x_2 \\ \text{s.t.}\;\; & 2 x_1 + x_2 \le 8 \\ & x_1 + 3 x_2 \le 6 \\ & x_1, x_2 \ge 0 \end{aligned}`}
        </Tex>
        <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>
          Add slacks{" "}
          <Tex>{`s_1, s_2 \\ge 0`}</Tex> to get equalities:{" "}
          <Tex>{`2 x_1 + x_2 + s_1 = 8`}</Tex>,{" "}
          <Tex>{`x_1 + 3 x_2 + s_2 = 6`}</Tex>. The initial dictionary
          has <Tex>{`s_1, s_2`}</Tex> basic.
        </div>
      </div>

      <div style={{ marginBottom: 12, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={practiceMode}
            onChange={(e) => {
              setPracticeMode(e.target.checked);
              setFeedback(null);
            }}
          />
          &nbsp;Practice mode (validate my pivot picks)
        </label>
        <button onClick={reset} style={btn}>
          <RotateCcw size={14} /> Reset
        </button>
        <button
          onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
          disabled={stepIdx === 0}
          style={btn}
        >
          ← Undo pivot
        </button>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>
          step {stepIdx} / {history.length - 1}
        </span>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            background: feedback.ok ? "#e8f5e9" : "#fde8e8",
            border: `1px solid ${feedback.ok ? "#7dd87d" : "#c8311c"}`,
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          {feedback.msg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(440px, 1fr) minmax(420px, 1fr)",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        <div>
          <Dictionary
            T={T}
            basis={basis}
            n={n}
            m={m}
            enteringCol={enteringCol}
            onVarClick={handleVarClick}
            onRowClick={handleRowClick}
            optimal={optimal}
            suggestedCol={suggestedCol}
            suggestedRow={suggestedRow}
            practiceMode={practiceMode}
          />
          <StatusPanel T={T} basis={basis} n={n} m={m} optimal={optimal} />
        </div>
        <div>
          <ComparisonPanel T={T} basis={basis} n={n} m={m} />
          <PivotWalkthrough T={T} basis={basis} n={n} m={m} enteringCol={enteringCol} />
        </div>
      </div>

      <TableauSideBySide T={T} basis={basis} n={n} m={m} enteringCol={enteringCol} />
      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Dictionary display
// ============================================================
function Dictionary({
  T,
  basis,
  n,
  m,
  enteringCol,
  onVarClick,
  onRowClick,
  optimal,
  suggestedCol,
  suggestedRow,
  practiceMode,
}) {
  const rcosts = reducedCosts(T, m);
  let ratioInfo = null;
  if (enteringCol !== null) ratioInfo = ratioTest(T, m, enteringCol);

  return (
    <div style={panel}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#888",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Current dictionary{" "}
        {optimal ? "★ optimal" : "· click a non-basic var in the z-row to enter"}
      </div>

      {/* Objective row */}
      <ObjectiveRow
        T={T}
        n={n}
        m={m}
        basis={basis}
        enteringCol={enteringCol}
        suggestedCol={suggestedCol}
        practiceMode={practiceMode}
        onVarClick={onVarClick}
      />

      {/* Divider */}
      <div
        style={{
          borderBottom: "2px solid #444",
          margin: "10px 0",
        }}
      />

      {/* Basic-variable rows */}
      {Array.from({ length: m }, (_, i) => {
        const rInfo = ratioInfo?.ratios[i];
        const eligible = rInfo && rInfo.ok;
        const isMinRatio = rInfo && eligible && i === ratioInfo.minRow;
        return (
          <ConstraintRow
            key={i}
            T={T}
            basis={basis}
            n={n}
            m={m}
            rowIdx={i}
            enteringCol={enteringCol}
            eligible={eligible}
            isMinRatio={isMinRatio}
            ratio={rInfo?.ratio}
            onRowClick={onRowClick}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// Objective row
// ============================================================
function ObjectiveRow({ T, n, m, basis, enteringCol, suggestedCol, practiceMode, onVarClick }) {
  const parts = equationParts(T, basis, n, m, m);
  const tex = objectiveTex(parts, enteringCol, suggestedCol, practiceMode);
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#f7f4ea",
        border: "1px solid #e8dfc4",
        borderRadius: 6,
        marginBottom: 4,
      }}
    >
      <div style={{ fontSize: 15, minHeight: 34, lineHeight: 1.9 }}>
        <Tex>{tex}</Tex>
      </div>
      {/* Clickable buttons for non-basic vars */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {parts.terms.map((t) => {
          const isSelected = enteringCol === t.col;
          const isSuggest = !practiceMode && t.col === suggestedCol;
          return (
            <button
              key={t.col}
              onClick={() => onVarClick(t.col)}
              style={{
                padding: "4px 10px",
                border: t.isEntering ? "1px solid #1f4e3d" : "1px solid #ccc",
                borderRadius: 4,
                background: isSelected
                  ? "#f5a524"
                  : isSuggest
                  ? "#fff4c8"
                  : t.isEntering
                  ? "#e8f5e9"
                  : "#f0f0f0",
                cursor: t.isEntering ? "pointer" : "not-allowed",
                fontFamily: "monospace",
                fontSize: 12,
                color: t.isEntering ? "#111" : "#888",
              }}
            >
              enter <Tex>{t.variable}</Tex> (coef = {t.coef.toFixed(3)})
            </button>
          );
        })}
      </div>
    </div>
  );
}

function objectiveTex(parts, enteringCol, suggestedCol, practiceMode) {
  const c = parts.constant;
  const termsTex = parts.terms
    .map((t) => {
      const sign = t.coef >= 0 ? "+" : "-";
      const mag = Math.abs(t.coef);
      const magTex = fmtNum(mag);
      const varTex = t.variable;
      let base = ` ${sign} ${magTex === "1" ? "" : `${magTex} \\, `}${varTex}`;
      if (t.col === enteringCol)
        base = ` \\;{\\color{#f5a524}\\boxed{${sign} ${magTex === "1" ? "" : `${magTex} \\, `}${varTex}}}\\;`;
      else if (!practiceMode && t.col === suggestedCol && t.isEntering)
        base = ` \\;{\\color{#a37300}\\underline{${sign} ${magTex === "1" ? "" : `${magTex} \\, `}${varTex}}}\\;`;
      return base;
    })
    .join("");
  return `\\displaystyle z \\;=\\; ${fmtNum(c)}${termsTex}`;
}

// ============================================================
// Constraint row
// ============================================================
function ConstraintRow({
  T,
  basis,
  n,
  m,
  rowIdx,
  enteringCol,
  eligible,
  isMinRatio,
  ratio,
  onRowClick,
}) {
  const parts = equationParts(T, basis, n, m, rowIdx);
  const tex = constraintTex(parts, enteringCol);
  return (
    <div
      onClick={() => eligible && onRowClick(rowIdx)}
      style={{
        padding: "8px 12px",
        marginBottom: 4,
        background: isMinRatio ? "#e8f5e9" : eligible ? "#fff8e1" : "transparent",
        border: eligible
          ? `1px solid ${isMinRatio ? "#7dd87d" : "#f5d68d"}`
          : "1px solid transparent",
        borderRadius: 6,
        cursor: eligible ? "pointer" : "default",
      }}
    >
      <div style={{ fontSize: 15, minHeight: 30, lineHeight: 1.9 }}>
        <Tex>{tex}</Tex>
      </div>
      {enteringCol !== null && (
        <div
          style={{
            fontSize: 12,
            marginTop: 3,
            color: eligible ? (isMinRatio ? "#1f4e3d" : "#7d5a00") : "#c8311c",
            fontFamily: "monospace",
          }}
        >
          {eligible
            ? `ratio = ${T[rowIdx][T[0].length - 1].toFixed(3)} / ${T[rowIdx][enteringCol].toFixed(3)} = ${ratio.toFixed(3)}${isMinRatio ? "  ★ minimum → this row leaves" : ""}`
            : `coefficient on ${varLabel(enteringCol, n)} is ${T[rowIdx][enteringCol].toFixed(3)} ≤ 0 → ratio test skips this row`}
        </div>
      )}
    </div>
  );
}

function constraintTex(parts, enteringCol) {
  const c = parts.constant;
  const lhs = parts.lhs;
  const termsTex = parts.terms
    .map((t) => {
      const sign = t.coef >= 0 ? "+" : "-";
      const mag = Math.abs(t.coef);
      const magTex = fmtNum(mag);
      const varTex = t.variable;
      let base = ` ${sign} ${magTex === "1" ? "" : `${magTex} \\, `}${varTex}`;
      if (t.col === enteringCol)
        base = ` \\;{\\color{#f5a524}\\boxed{${sign} ${magTex === "1" ? "" : `${magTex} \\, `}${varTex}}}\\;`;
      return base;
    })
    .join("");
  return `\\displaystyle ${lhs} \\;=\\; ${fmtNum(c)}${termsTex}`;
}

// ============================================================
// Status panel
// ============================================================
function StatusPanel({ T, basis, n, m, optimal }) {
  const totalCols = T[0].length;
  const values = Array(n + m).fill(0);
  for (let i = 0; i < m; i++) values[basis[i]] = T[i][totalCols - 1];
  return (
    <div style={{ ...panel, marginTop: 12 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#888",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Current basic feasible solution (non-basic vars = 0)
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}>
        <tbody>
          {Array.from({ length: n + m }, (_, j) => (
            <tr key={j}>
              <td style={{ padding: "2px 6px", color: "#555" }}>
                <Tex>{varLabel(j, n)}</Tex>
              </td>
              <td
                style={{
                  padding: "2px 6px",
                  textAlign: "right",
                  color: values[j] > 1e-9 ? "#c8311c" : "#888",
                  fontWeight: values[j] > 1e-9 ? 700 : 400,
                }}
              >
                {fmtDec(values[j])}
              </td>
              <td style={{ padding: "2px 6px", color: "#666", fontStyle: "italic" }}>
                {values[j] > 1e-9 ? "(basic)" : "(non-basic)"}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #444" }}>
            <td style={{ padding: "2px 6px", fontWeight: 700 }}>z</td>
            <td
              style={{
                padding: "2px 6px",
                textAlign: "right",
                fontWeight: 700,
                color: "#c8311c",
              }}
            >
              {fmtDec(T[m][totalCols - 1])}
            </td>
            <td>{optimal && <span style={{ color: "#1f4e3d", fontWeight: 700 }}>★ OPTIMAL</span>}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function fmtDec(v) {
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(3);
}

// ============================================================
// Comparison panel (tableau vs dictionary)
// ============================================================
function ComparisonPanel({ T, basis, n, m }) {
  return (
    <div style={panel}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#888",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Tableau row ↔ dictionary equation
      </div>
      <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>
        <p style={{ margin: "4px 0" }}>
          Row <Tex>{`i`}</Tex> of the tableau reads{" "}
          <Tex>{`\\sum_j T_{i,j}\\, x_j = T_{i, \\text{RHS}}`}</Tex>. Since
          the basic variable has coefficient 1 and all other basic vars
          have coefficient 0 (canonical form), you can isolate:
        </p>
        <Tex block>
          {String.raw`x_{B_i} \;=\; T_{i,\text{RHS}} \;-\; \sum_{j \notin B} T_{i,j}\, x_j`}
        </Tex>
        <p style={{ margin: "4px 0" }}>
          Which is exactly a dictionary row. The z-row of the tableau
          (which stores <Tex>{`-\\bar c_j`}</Tex>) gives the
          objective equation with the SIGN FLIPPED:
        </p>
        <Tex block>
          {String.raw`z \;=\; T_{m,\text{RHS}} \;+\; \sum_{j \notin B} \bar c_j\, x_j`}
        </Tex>
      </div>
    </div>
  );
}

// ============================================================
// Pivot walkthrough — shows the substitution being performed
// ============================================================
function PivotWalkthrough({ T, basis, n, m, enteringCol }) {
  if (enteringCol === null) {
    return (
      <div style={{ ...panel, marginTop: 12 }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#888",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Pivot walkthrough
        </div>
        <div style={{ fontSize: 13, color: "#666", fontStyle: "italic" }}>
          Pick an entering variable to preview the substitution.
        </div>
      </div>
    );
  }
  const ratioInfo = ratioTest(T, m, enteringCol);
  const eligible = ratioInfo.ratios.filter((r) => r.ok);
  const minRow = ratioInfo.minRow;
  const enteringName = varLabel(enteringCol, n);
  const leavingName = minRow >= 0 ? varLabel(basis[minRow], n) : "?";

  return (
    <div style={{ ...panel, marginTop: 12 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#888",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Pivot walkthrough
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <p style={{ margin: "4px 0" }}>
          Entering variable: <Tex>{enteringName}</Tex>. Bumping it up raises z at rate{" "}
          <Tex>{`\\bar c_{${enteringName.replace("_", "_{")}}} = ${(-T[m][enteringCol]).toFixed(3)}`}</Tex>.
        </p>
        <p style={{ margin: "4px 0" }}>
          <b>Ratio test:</b> For each basic-variable equation with a positive coefficient on{" "}
          <Tex>{enteringName}</Tex>, compute{" "}
          <Tex>{`\\text{ratio} = \\dfrac{\\text{constant}}{\\text{coeff on ${enteringName}}}`}</Tex>.
          The smallest ratio identifies the leaving variable.
        </p>
        <div style={{ marginTop: 6 }}>
          {eligible.length === 0 ? (
            <div style={{ color: "#c8311c" }}>
              No row has a positive coefficient on {enteringName}. The LP is UNBOUNDED —{" "}
              {enteringName} can be increased forever without violating any constraint.
            </div>
          ) : (
            eligible.map((r) => (
              <div
                key={r.row}
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  padding: "3px 6px",
                  background: r.row === minRow ? "#e8f5e9" : "#fafafa",
                  border: "1px solid #eee",
                  borderRadius: 4,
                  marginBottom: 2,
                }}
              >
                {varLabel(basis[r.row], n)}: {T[r.row][T[0].length - 1].toFixed(3)} /{" "}
                {T[r.row][enteringCol].toFixed(3)} = <b>{r.ratio.toFixed(3)}</b>
                {r.row === minRow && (
                  <span style={{ color: "#1f4e3d", marginLeft: 6 }}>← smallest → leaves</span>
                )}
              </div>
            ))
          )}
        </div>
        {minRow >= 0 && (
          <p style={{ margin: "8px 0 4px 0" }}>
            <b>Substitution:</b> Solve the {leavingName}-row for{" "}
            <Tex>{enteringName}</Tex>, then plug that expression into
            every other row (including z). That's exactly one pivot
            operation in the tableau — same math, different presentation.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Side-by-side tableau (for cross-reference)
// ============================================================
function TableauSideBySide({ T, basis, n, m, enteringCol }) {
  const totalCols = n + m + 1;
  const RHS = totalCols - 1;
  const ratioInfo = enteringCol !== null ? ratioTest(T, m, enteringCol) : null;
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#888",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Same state, in tableau form
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={th}>basis</th>
              {Array.from({ length: n + m }, (_, j) => (
                <th
                  key={j}
                  style={{
                    ...th,
                    background: j === enteringCol ? "#f5a524" : "#f0f0f0",
                    color: j === enteringCol ? "#1f1d1a" : "#222",
                  }}
                >
                  {varLabel(j, n).replace("_", "").replace("x", "x").replace("s", "s")}
                </th>
              ))}
              <th style={th}>RHS</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: m }, (_, i) => {
              const r = ratioInfo?.ratios[i];
              const eligible = r && r.ok;
              const isMinRatio = eligible && i === ratioInfo.minRow;
              return (
                <tr
                  key={i}
                  style={{ background: isMinRatio ? "#e8f5e9" : eligible ? "#fff8e1" : "transparent" }}
                >
                  <td style={tdLabel}>{varLabel(basis[i], n)}</td>
                  {Array.from({ length: n + m }, (_, j) => (
                    <td
                      key={j}
                      style={{
                        ...td,
                        background: j === enteringCol && eligible ? (isMinRatio ? "#7dd87d" : "#f5a524") : "transparent",
                        color: j === enteringCol && eligible ? "#1f1d1a" : "#222",
                        fontWeight: j === enteringCol && eligible ? 700 : 400,
                      }}
                    >
                      {fmtDec(T[i][j])}
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 700 }}>{fmtDec(T[i][RHS])}</td>
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid #444" }}>
              <td style={tdLabel}>z</td>
              {Array.from({ length: n + m }, (_, j) => (
                <td
                  key={j}
                  style={{
                    ...td,
                    color: T[m][j] < -1e-9 ? "#c8311c" : "#222",
                    fontWeight: T[m][j] < -1e-9 ? 700 : 400,
                  }}
                >
                  {fmtDec(T[m][j])}
                </td>
              ))}
              <td style={{ ...td, fontWeight: 700 }}>{fmtDec(T[m][RHS])}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
const th = { padding: "6px 8px", border: "1px solid #ccc", background: "#f0f0f0", fontWeight: 700 };
const td = { padding: "5px 8px", border: "1px solid #ddd", textAlign: "right" };
const tdLabel = { ...td, textAlign: "left", fontWeight: 700, color: "#555" };

// ============================================================
// Pedagogical notes
// ============================================================
function PedagogicalNotes() {
  return (
    <div style={{ marginTop: 28, padding: 16, background: "#fff8e1", borderRadius: 10, border: "1px solid #f5d68d" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        <Terminal size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
        Notes for class
      </div>
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6, fontSize: 14, color: "#3d2f00" }}>
        <li>
          <b>Same math, different bookkeeping.</b> Tableau and dictionary
          forms carry the same information — you can convert between them
          by isolating each basic variable. The dictionary is more
          natural when you first learn simplex; the tableau is faster to
          pivot by hand for larger problems.
        </li>
        <li>
          <b>Reading the current solution.</b> Set every non-basic
          variable to 0. The basic variables equal the constants on the
          right of their equations, and z equals the constant in the
          z-row. That's the current BFS at a glance.
        </li>
        <li>
          <b>Improving the objective.</b> Pick any non-basic variable
          whose coefficient in the z-row is POSITIVE — increasing it
          increases z. That's the entering variable.
        </li>
        <li>
          <b>The ratio test in dictionary language.</b> Increasing{" "}
          <Tex>{`x_j`}</Tex> from 0 forces each basic variable{" "}
          <Tex>{`x_{B_i} = b_i - a_{ij} x_j`}</Tex> to change. If{" "}
          <Tex>{`a_{ij} > 0`}</Tex>, then <Tex>{`x_{B_i}`}</Tex>{" "}
          DECREASES as <Tex>{`x_j`}</Tex> rises. It hits zero at{" "}
          <Tex>{`x_j = b_i / a_{ij}`}</Tex>. The smallest such
          threshold is the largest legal increase, and its basic
          variable is the leaving one.
        </li>
        <li>
          <b>Pivot = substitute + rewrite.</b> Solve the leaving row for
          the entering variable, then plug that expression into every
          other row (including z). Every other row now uses the new
          basis. That's algebraically what a tableau pivot does.
        </li>
        <li>
          <b>Unboundedness in dictionary form.</b> If NO basic-variable
          equation has a positive coefficient on the entering variable,
          you can raise it to infinity without violating anything. The
          LP is unbounded.
        </li>
      </ul>
    </div>
  );
}

// ============================================================
// Style atoms
// ============================================================
const panel = {
  background: "#fafafa",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 12,
};
const problemBox = {
  marginBottom: 16,
  padding: "12px 16px",
  background: "#f6f4ee",
  border: "1px solid #ece8dd",
  borderRadius: 8,
};
const btn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#f7f7f7",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 13,
};


/* ============================================================
   PROBLEM PICKER WRAPPER
   Added for the Open Optimization textbook: choose a preset LP
   (including the book's running bakery example from the Simplex
   Method chapter) or type in your own.  Requires b >= 0 so the
   all-slack basis is a feasible start.
   ============================================================ */

const PRESETS = [
  {
    id: "default",
    label: "Two-variable example (max 3x\u2081 + 5x\u2082)",
    c: DEFAULT_C,
    A: DEFAULT_A,
    b: DEFAULT_B,
  },
  {
    id: "bakery",
    label: "Bakery example from the book (max 2x + 3y)",
    c: [2, 3],
    A: [
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    b: [9, 16, 14],
  },
  {
    id: "threevar",
    label: "Three variables (max 5x\u2081 + 4x\u2082 + 3x\u2083)",
    c: [5, 4, 3],
    A: [
      [2, 3, 1],
      [4, 1, 2],
      [3, 4, 2],
    ],
    b: [5, 11, 8],
  },
];

function parseVec(str) {
  const v = str.split(",").map((t) => Number(t.trim()));
  return v.some((x) => !Number.isFinite(x)) ? null : v;
}

function parseMat(str) {
  const rows = str
    .split(";")
    .map((r) => r.trim())
    .filter((r) => r.length > 0)
    .map(parseVec);
  if (rows.some((r) => r === null)) return null;
  const w = rows[0]?.length ?? 0;
  return rows.every((r) => r.length === w) ? rows : null;
}

export default function SimplexDictionaryDemo() {
  const [presetId, setPresetId] = useState("default");
  const [custom, setCustom] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [cStr, setCStr] = useState("3, 5");
  const [AStr, setAStr] = useState("2, 1; 1, 3");
  const [bStr, setBStr] = useState("8, 6");
  const [err, setErr] = useState(null);

  const prob =
    presetId === "custom" && custom
      ? custom
      : PRESETS.find((p) => p.id === presetId) || PRESETS[0];

  function applyCustom() {
    const c = parseVec(cStr);
    const A = parseMat(AStr);
    const b = parseVec(bStr);
    if (!c || !A || !b) {
      setErr("Could not parse. Use commas within a row and semicolons between rows of A.");
      return;
    }
    if (A.length !== b.length || A[0].length !== c.length) {
      setErr(
        `Dimensions disagree: c has ${c.length} entries, A is ${A.length}\u00d7${A[0].length}, b has ${b.length}.`
      );
      return;
    }
    if (c.length > 6 || A.length > 6) {
      setErr("Keep it small: at most 6 variables and 6 constraints.");
      return;
    }
    if (b.some((x) => x < 0)) {
      setErr(
        "All right-hand sides must be nonnegative so the all-slack starting basis is feasible. (For negative b, see the Two-Phase Simplex demo.)"
      );
      return;
    }
    setErr(null);
    setCustom({ id: "custom", label: "Custom", c, A, b });
    setPresetId("custom");
  }

  const selStyle = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    background: "#fff",
  };
  const inputStyle = {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 13,
    fontFamily: "monospace",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "18px 24px 0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <label style={{ fontWeight: 600, fontSize: 14 }}>Problem:</label>
        <select
          value={presetId === "custom" ? "custom" : presetId}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "custom") setShowEditor(true);
            else setShowEditor(false);
            if (v !== "custom" || custom) setPresetId(v);
          }}
          style={selStyle}
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom…</option>
        </select>
        <button
          onClick={() => setShowEditor((v) => !v)}
          style={{ ...selStyle, cursor: "pointer" }}
        >
          {showEditor ? "Hide editor" : "Edit problem"}
        </button>
      </div>
      {showEditor && (
        <div
          style={{
            maxWidth: 1280,
            margin: "10px auto 0",
            padding: "12px 24px",
          }}
        >
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 14,
              background: "#fafafa",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: 10,
              alignItems: "end",
              maxWidth: 900,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Objective c (maximize c·x)
              </div>
              <input value={cStr} onChange={(e) => setCStr(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                A (rows separated by ;)
              </div>
              <input value={AStr} onChange={(e) => setAStr(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                b (Ax ≤ b, need b ≥ 0)
              </div>
              <input value={bStr} onChange={(e) => setBStr(e.target.value)} style={inputStyle} />
            </div>
            <button
              onClick={applyCustom}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Load
            </button>
            {err && (
              <div style={{ gridColumn: "1 / -1", color: "#b00020", fontSize: 13 }}>{err}</div>
            )}
          </div>
        </div>
      )}
      <DictionaryPivoter
        key={JSON.stringify({ c: prob.c, A: prob.A, b: prob.b })}
        c={prob.c}
        A={prob.A}
        b={prob.b}
      />
    </div>
  );
}
