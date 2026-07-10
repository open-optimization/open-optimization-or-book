import React, { useState, useMemo, useCallback } from "react";
import { RotateCcw, Plus, Minus, ChevronRight, ChevronLeft } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   TABLEAU PIVOTER — Interactive Gauss–Jordan Pivot Tool
   ISE 5406

   The point: type your own LP, pick a pivot row and column,
   and watch the elementary row operations play out one by one
   with the algebra written explicitly underneath. No solver,
   no Dantzig's rule — just the mechanics of pivoting.

   Each step is rendered in TeX:
       Step 1.  R_p ←  (1/a_pq) · R_p
       Step 2a. R_i ←  R_i  -  a_iq · R_p   (for each other row i)
   ============================================================ */

// ============================================================
// Default LP (the simplex_tableau_demo classic)
//   max  3 x1 + 5 x2
//   s.t. 2 x1 + x2 <= 8
//        x1 + 3 x2 <= 6
//        x1, x2 >= 0
// ============================================================
const DEFAULT_C = [3, 5];
const DEFAULT_A = [
  [2, 1],
  [1, 3],
];
const DEFAULT_B = [8, 6];

// ============================================================
// Build initial tableau in canonical form (slacks added)
// ============================================================
function buildInitialTableau(c, A, b) {
  const m = A.length;
  const n = c.length;
  const total = n + m + 1;
  const T = Array.from({ length: m + 1 }, () => Array(total).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) T[i][j] = A[i][j];
    T[i][n + i] = 1;
    T[i][total - 1] = b[i];
  }
  for (let j = 0; j < n; j++) T[m][j] = -c[j];
  const basis = [];
  for (let i = 0; i < m; i++) basis.push(n + i);
  return { T, basis, n, m };
}

function colLabel(j, n, m) {
  if (j < n) return `x_${j + 1}`;
  if (j < n + m) return `s_${j - n + 1}`;
  return `\\text{RHS}`;
}
function rowLabel(i, m) {
  return i === m ? "z" : `R_${i + 1}`;
}

function fmtNum(v) {
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(3);
}
function fmtFrac(v) {
  // Try to render as a small fraction if reasonable
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  for (const denom of [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]) {
    const num = v * denom;
    if (Math.abs(num - Math.round(num)) < 1e-9) {
      const r = Math.round(num);
      const sign = r < 0 ? "-" : "";
      return `${sign}\\tfrac{${Math.abs(r)}}{${denom}}`;
    }
  }
  return v.toFixed(3);
}

// ============================================================
// Pivot, recording each elementary row operation
// ============================================================
function pivotWithSteps(T, row, col) {
  const m = T.length - 1;
  const totalCols = T[0].length;
  const pivVal = T[row][col];
  const steps = [];
  const tableaux = [T.map((r) => [...r])];

  // Step 1: scale pivot row
  if (Math.abs(pivVal - 1) > 1e-9) {
    const Tnew = tableaux[tableaux.length - 1].map((r) => [...r]);
    for (let j = 0; j < totalCols; j++) Tnew[row][j] = Tnew[row][j] / pivVal;
    steps.push({
      kind: "scale",
      row,
      col,
      pivVal,
      explanation: `Make the pivot a 1: divide row ${row + 1} by ${fmtNum(pivVal)}.`,
    });
    tableaux.push(Tnew);
  } else {
    steps.push({
      kind: "scale-skip",
      row,
      col,
      pivVal,
      explanation: `Pivot is already 1 — no scaling needed.`,
    });
  }

  // Step 2: eliminate every other row's column entry
  for (let i = 0; i < T.length; i++) {
    if (i === row) continue;
    const cur = tableaux[tableaux.length - 1];
    const factor = cur[i][col];
    if (Math.abs(factor) < 1e-12) {
      steps.push({
        kind: "eliminate-skip",
        row: i,
        pivRow: row,
        col,
        factor,
        explanation: `Row ${i === m ? "z" : i + 1} already has 0 in column ${colLabelText(col, T[0].length - m - 1, m)}.`,
      });
      continue;
    }
    const Tnew = cur.map((r) => [...r]);
    for (let j = 0; j < totalCols; j++) Tnew[i][j] = Tnew[i][j] - factor * cur[row][j];
    steps.push({
      kind: "eliminate",
      row: i,
      pivRow: row,
      col,
      factor,
      explanation: `Eliminate column ${colLabelText(col, T[0].length - m - 1, m)} in row ${i === m ? "z" : i + 1}.`,
    });
    tableaux.push(Tnew);
  }

  return { steps, tableaux };
}

function colLabelText(j, n, m) {
  if (j < n) return `x${j + 1}`;
  if (j < n + m) return `s${j - n + 1}`;
  return "RHS";
}

// ============================================================
// Main component
// ============================================================
export default function TableauPivoterDemo() {
  const [c, setC] = useState(DEFAULT_C);
  const [A, setA] = useState(DEFAULT_A);
  const [b, setB] = useState(DEFAULT_B);

  const initial = useMemo(() => buildInitialTableau(c, A, b), [c, A, b]);

  // Persistent state across pivots
  const [history, setHistory] = useState([initial]);
  const [stepIdx, setStepIdx] = useState(0);
  const cur = history[stepIdx];
  const { T, basis, n, m } = cur;

  // Pivot selection
  const [pivotRow, setPivotRow] = useState(null);
  const [pivotCol, setPivotCol] = useState(null);

  // Animation state for the in-progress pivot
  const [animSteps, setAnimSteps] = useState(null);
  const [animIdx, setAnimIdx] = useState(0);

  const totalCols = n + m + 1;

  function rebuildFromInputs() {
    const init = buildInitialTableau(c, A, b);
    setHistory([init]);
    setStepIdx(0);
    setPivotRow(null);
    setPivotCol(null);
    setAnimSteps(null);
    setAnimIdx(0);
  }

  function startPivot() {
    if (pivotRow === null || pivotCol === null) return;
    if (Math.abs(T[pivotRow][pivotCol]) < 1e-12) return;
    const { steps, tableaux } = pivotWithSteps(T, pivotRow, pivotCol);
    setAnimSteps({ steps, tableaux });
    setAnimIdx(0);
  }

  function applyPivot() {
    if (!animSteps) return;
    const final = animSteps.tableaux[animSteps.tableaux.length - 1];
    const newBasis = [...basis];
    if (pivotRow < m) newBasis[pivotRow] = pivotCol;
    const newHist = history.slice(0, stepIdx + 1);
    newHist.push({ T: final, basis: newBasis, n, m });
    setHistory(newHist);
    setStepIdx(newHist.length - 1);
    setAnimSteps(null);
    setAnimIdx(0);
    setPivotRow(null);
    setPivotCol(null);
  }

  function reset() {
    setHistory([initial]);
    setStepIdx(0);
    setPivotRow(null);
    setPivotCol(null);
    setAnimSteps(null);
    setAnimIdx(0);
  }

  function undo() {
    if (stepIdx === 0) return;
    setStepIdx(stepIdx - 1);
    setAnimSteps(null);
    setAnimIdx(0);
    setPivotRow(null);
    setPivotCol(null);
  }

  // Currently displayed tableau (during animation, show intermediate)
  const displayedT = animSteps ? animSteps.tableaux[Math.min(animIdx, animSteps.tableaux.length - 1)] : T;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Tableau Pivoter — Step-by-Step Row Operations
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        Type your own LP. Pick any pivot row and column. Watch the elementary
        row operations play out one at a time — the same Gauss-Jordan steps a
        simplex iteration performs internally, but with the algebra written
        out underneath each move.
      </p>

      <ProblemEditor
        c={c}
        A={A}
        b={b}
        setC={setC}
        setA={setA}
        setB={setB}
        rebuild={rebuildFromInputs}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={reset} style={btn}>
          <RotateCcw size={14} /> Reset to initial
        </button>
        <button onClick={undo} disabled={stepIdx === 0} style={btn}>
          ← Undo last pivot
        </button>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>
          pivot # {stepIdx} / {history.length - 1}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(540px, 1fr) minmax(440px, 1fr)", gap: 22, alignItems: "flex-start" }}>
        <div>
          <TableauView
            T={displayedT}
            basis={basis}
            n={n}
            m={m}
            pivotRow={pivotRow}
            pivotCol={pivotCol}
            setPivotRow={(i) => { setPivotRow(i); setAnimSteps(null); setAnimIdx(0); }}
            setPivotCol={(j) => { setPivotCol(j); setAnimSteps(null); setAnimIdx(0); }}
            highlightStep={animSteps?.steps[animIdx - 1]}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!animSteps ? (
              <button
                onClick={startPivot}
                disabled={pivotRow === null || pivotCol === null || Math.abs(T[pivotRow][pivotCol]) < 1e-12}
                style={btnPrimary}
              >
                Compute pivot steps
              </button>
            ) : (
              <>
                <button onClick={() => setAnimIdx(Math.max(0, animIdx - 1))} disabled={animIdx === 0} style={btn}>
                  <ChevronLeft size={14} /> Prev step
                </button>
                <button
                  onClick={() => setAnimIdx(Math.min(animSteps.steps.length, animIdx + 1))}
                  disabled={animIdx >= animSteps.steps.length}
                  style={btn}
                >
                  Next step <ChevronRight size={14} />
                </button>
                <button
                  onClick={applyPivot}
                  disabled={animIdx < animSteps.steps.length}
                  style={btnPrimary}
                >
                  Apply pivot ✓
                </button>
                <button onClick={() => { setAnimSteps(null); setAnimIdx(0); }} style={btn}>
                  Cancel
                </button>
              </>
            )}
          </div>

          {pivotRow !== null && pivotCol !== null && Math.abs(T[pivotRow][pivotCol]) < 1e-12 && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#fde8e8", borderRadius: 6, fontSize: 13, color: "#a02b1c" }}>
              The chosen pivot element is zero — invalid pivot. Pick another (row, column).
            </div>
          )}
        </div>

        <RowOpPanel
          T_before={T}
          steps={animSteps?.steps || []}
          tableaux={animSteps?.tableaux || []}
          curStep={animIdx}
          n={n}
          m={m}
          pivotRow={pivotRow}
          pivotCol={pivotCol}
        />
      </div>

      <Reference />
    </div>
  );
}

// ============================================================
// Problem editor
// ============================================================
function ProblemEditor({ c, A, b, setC, setA, setB, rebuild }) {
  function setAij(i, j, v) {
    const A2 = A.map((r) => [...r]);
    A2[i][j] = v;
    setA(A2);
  }
  function setCi(i, v) {
    const c2 = [...c];
    c2[i] = v;
    setC(c2);
  }
  function setBi(i, v) {
    const b2 = [...b];
    b2[i] = v;
    setB(b2);
  }
  function addVar() {
    setC([...c, 0]);
    setA(A.map((r) => [...r, 0]));
  }
  function removeVar() {
    if (c.length <= 1) return;
    setC(c.slice(0, -1));
    setA(A.map((r) => r.slice(0, -1)));
  }
  function addCons() {
    setA([...A, Array(c.length).fill(0)]);
    setB([...b, 0]);
  }
  function removeCons() {
    if (A.length <= 1) return;
    setA(A.slice(0, -1));
    setB(b.slice(0, -1));
  }

  const n = c.length;

  return (
    <div style={editorBox}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
        Edit the LP — max cᵀx s.t. Ax ≤ b, x ≥ 0
      </div>

      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
        <thead>
          <tr>
            <td></td>
            {Array.from({ length: n }, (_, j) => (
              <th key={j} style={editTh}>
                x<sub>{j + 1}</sub>
              </th>
            ))}
            <th style={editTh}></th>
            <th style={editTh}></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={editLab}>c</td>
            {c.map((v, j) => (
              <td key={j}>
                <NumInput value={v} onChange={(x) => setCi(j, x)} />
              </td>
            ))}
            <td colSpan={2} style={{ paddingLeft: 10, color: "#888", fontSize: 12 }}>
              (objective coefficients — maximize)
            </td>
          </tr>

          {A.map((row, i) => (
            <tr key={i}>
              <td style={editLab}>R<sub>{i + 1}</sub></td>
              {row.map((v, j) => (
                <td key={j}>
                  <NumInput value={v} onChange={(x) => setAij(i, j, x)} />
                </td>
              ))}
              <td style={{ textAlign: "center", padding: "0 6px", color: "#666" }}>≤</td>
              <td>
                <NumInput value={b[i]} onChange={(x) => setBi(i, x)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={addVar} style={btnSmall}><Plus size={12} /> variable</button>
        <button onClick={removeVar} style={btnSmall}><Minus size={12} /> variable</button>
        <button onClick={addCons} style={btnSmall}><Plus size={12} /> constraint</button>
        <button onClick={removeCons} style={btnSmall}><Minus size={12} /> constraint</button>
        <button onClick={rebuild} style={btnPrimary}>
          ↻ Rebuild initial tableau
        </button>
      </div>
    </div>
  );
}

function NumInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      step="any"
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{
        width: 60,
        padding: "4px 6px",
        border: "1px solid #ccc",
        borderRadius: 4,
        fontFamily: "monospace",
        fontSize: 13,
        textAlign: "right",
      }}
    />
  );
}

// ============================================================
// Tableau view (selectable pivot row + column)
// ============================================================
function TableauView({ T, basis, n, m, pivotRow, pivotCol, setPivotRow, setPivotCol, highlightStep }) {
  const totalCols = n + m + 1;
  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Tableau — click a row label and a column header to select pivot
      </div>
      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13, width: "100%" }}>
        <thead>
          <tr>
            <th style={th}>row</th>
            <th style={th}>basis</th>
            {Array.from({ length: n + m }, (_, j) => {
              const isPivCol = j === pivotCol;
              return (
                <th
                  key={j}
                  onClick={() => setPivotCol(j === pivotCol ? null : j)}
                  style={{
                    ...th,
                    cursor: "pointer",
                    background: isPivCol ? "#f5a524" : "#f0f0f0",
                    color: isPivCol ? "#1f1d1a" : "#222",
                  }}
                >
                  {j < n ? (
                    <>x<sub>{j + 1}</sub></>
                  ) : (
                    <>s<sub>{j - n + 1}</sub></>
                  )}
                </th>
              );
            })}
            <th style={{ ...th, background: "#e7e7e7" }}>RHS</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: m }, (_, i) => {
            const isPivRow = i === pivotRow;
            const isHighlightRow = highlightStep && (highlightStep.row === i || highlightStep.pivRow === i);
            return (
              <tr key={i} style={{ background: isPivRow ? "#fff4c8" : isHighlightRow ? "#e8f5e9" : "transparent" }}>
                <td
                  onClick={() => setPivotRow(i === pivotRow ? null : i)}
                  style={{
                    ...tdLabel,
                    cursor: "pointer",
                    background: isPivRow ? "#f5a524" : "transparent",
                    color: isPivRow ? "#1f1d1a" : "#555",
                  }}
                >
                  R<sub>{i + 1}</sub>
                </td>
                <td style={tdLabel}>
                  {basis[i] < n ? `x${basis[i] + 1}` : `s${basis[i] - n + 1}`}
                </td>
                {Array.from({ length: n + m }, (_, j) => {
                  const isPivCell = i === pivotRow && j === pivotCol;
                  return (
                    <td
                      key={j}
                      style={{
                        ...td,
                        background: isPivCell ? "#f5a524" : "transparent",
                        color: isPivCell ? "#1f1d1a" : "#222",
                        fontWeight: isPivCell ? 800 : (j === pivotCol ? 600 : 400),
                        outline: isPivCell ? "2px solid #c8311c" : "none",
                      }}
                    >
                      {fmtNum(T[i][j])}
                    </td>
                  );
                })}
                <td style={{ ...td, fontWeight: 700 }}>{fmtNum(T[i][totalCols - 1])}</td>
              </tr>
            );
          })}
          <tr style={{ borderTop: "2px solid #444", background: pivotRow === m ? "#fff4c8" : "transparent" }}>
            <td
              onClick={() => setPivotRow(m === pivotRow ? null : m)}
              style={{ ...tdLabel, cursor: "pointer", background: pivotRow === m ? "#f5a524" : "transparent" }}
            >
              z
            </td>
            <td style={tdLabel}>—</td>
            {Array.from({ length: n + m }, (_, j) => {
              const isPivCell = pivotRow === m && j === pivotCol;
              return (
                <td
                  key={j}
                  style={{
                    ...td,
                    background: isPivCell ? "#f5a524" : "transparent",
                    color: isPivCell ? "#1f1d1a" : T[m][j] < -1e-9 ? "#c8311c" : "#222",
                    fontWeight: isPivCell ? 800 : T[m][j] < -1e-9 ? 700 : 400,
                  }}
                >
                  {fmtNum(T[m][j])}
                </td>
              );
            })}
            <td style={{ ...td, fontWeight: 700 }}>{fmtNum(T[m][totalCols - 1])}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ fontSize: 11, color: "#777", marginTop: 6 }}>
        z-row holds <Tex>{`-c_j + c_B^T B^{-1}A_j`}</Tex> (negative reduced costs).
        The bottom-right cell is the current objective value.
      </div>
    </div>
  );
}

// ============================================================
// Row-operation panel — the heart of the demo
// ============================================================
function RowOpPanel({ T_before, steps, tableaux, curStep, n, m, pivotRow, pivotCol }) {
  if (!pivotRow && pivotRow !== 0) {
    return (
      <div style={{ ...panel, fontSize: 13, color: "#666" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
          Row operation walkthrough
        </div>
        <p style={{ marginTop: 0 }}>
          Click a row label and a column header in the tableau to pick a
          pivot. Then press <b>Compute pivot steps</b>.
        </p>
        <p>
          <b>What you'll see:</b>
        </p>
        <ol style={{ paddingLeft: 22, lineHeight: 1.6 }}>
          <li>
            <b>Scale</b> the pivot row by <Tex>{`1 / a_{pq}`}</Tex> — makes
            the pivot a 1.
          </li>
          <li>
            <b>Eliminate</b> column <Tex>{`q`}</Tex> in every other row
            via <Tex>{`R_i \\leftarrow R_i - a_{iq}\\,R_p`}</Tex>.
          </li>
        </ol>
        <p>
          The Gauss-Jordan pivot has no other moving parts — that's all simplex
          does between iterations.
        </p>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div style={{ ...panel, fontSize: 13 }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
          Pivot ready
        </div>
        <div style={{ marginBottom: 10 }}>
          Pivot element selected:{" "}
          <Tex>{`a_{${pivotRow + 1},${pivotCol < n ? `x_${pivotCol + 1}` : `s_${pivotCol - n + 1}`}} = ${fmtNum(T_before[pivotRow][pivotCol])}`}</Tex>
        </div>
        <div>
          Press <b>Compute pivot steps</b> to walk through the algebra.
        </div>
      </div>
    );
  }

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Row operations — step {curStep} / {steps.length}
      </div>

      <div style={{ marginBottom: 10, fontSize: 13 }}>
        Pivot at{" "}
        <Tex>{`(R_${pivotRow + 1},\\, ${pivotCol < n ? `x_${pivotCol + 1}` : `s_${pivotCol - n + 1}`})`}</Tex>
        ; pivot value{" "}
        <Tex>{`a_{pq} = ${fmtNum(T_before[pivotRow][pivotCol])}`}</Tex>
      </div>

      {/* List all steps; gray-out future ones, highlight current */}
      <ol style={{ paddingLeft: 22, margin: 0 }}>
        {steps.map((s, i) => {
          const past = i < curStep;
          const cur = i === curStep - 1;
          const future = i >= curStep;
          return (
            <li
              key={i}
              style={{
                marginBottom: 14,
                opacity: future ? 0.45 : 1,
                background: cur ? "#fff8e1" : "transparent",
                padding: cur ? "6px 8px" : "0",
                borderRadius: 6,
                border: cur ? "1px solid #f5d68d" : "none",
              }}
            >
              <StepView step={s} T_before={T_before} tableaux={tableaux} stepIndex={i} n={n} m={m} pivotRow={pivotRow} pivotCol={pivotCol} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepView({ step, T_before, tableaux, stepIndex, n, m, pivotRow, pivotCol }) {
  if (step.kind === "scale") {
    return (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{step.explanation}</div>
        <Tex block>
          {`R_{${pivotRow + 1}} \\;\\leftarrow\\; \\frac{1}{${fmtFrac(step.pivVal)}} \\, R_{${pivotRow + 1}}`}
        </Tex>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
          Each entry of row {pivotRow + 1} is divided by {fmtNum(step.pivVal)}.
          The pivot cell becomes 1.
        </div>
        <CellByCell
          before={T_before[pivotRow]}
          after={tableaux[stepIndex + 1][pivotRow]}
          rule={(b) => `\\frac{${fmtFrac(b)}}{${fmtFrac(step.pivVal)}}`}
          n={n}
          m={m}
        />
      </div>
    );
  }
  if (step.kind === "scale-skip") {
    return (
      <div style={{ fontStyle: "italic", color: "#666" }}>
        {step.explanation}
      </div>
    );
  }
  if (step.kind === "eliminate") {
    const i = step.row;
    const rowName = i === m ? "z" : `R_${i + 1}`;
    return (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{step.explanation}</div>
        <Tex block>
          {`${rowName} \\;\\leftarrow\\; ${rowName} \\;-\\; (${fmtFrac(step.factor)})\\, R_{${pivotRow + 1}}`}
        </Tex>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
          Multiplier <Tex>{fmtFrac(step.factor)}</Tex> chosen so the column-{step.col + 1}{" "}
          entry in {rowName} becomes 0.
        </div>
        <CellByCell
          before={tableaux[stepIndex][i]}
          after={tableaux[stepIndex + 1][i]}
          pivotRowVals={tableaux[stepIndex][pivotRow]}
          rule={(b, idx) =>
            `${fmtFrac(b)} - (${fmtFrac(step.factor)}) \\cdot ${fmtFrac(tableaux[stepIndex][pivotRow][idx])}`
          }
          n={n}
          m={m}
        />
      </div>
    );
  }
  if (step.kind === "eliminate-skip") {
    return (
      <div style={{ fontStyle: "italic", color: "#666" }}>
        {step.explanation}
      </div>
    );
  }
  return null;
}

function CellByCell({ before, after, rule, n, m }) {
  const totalCols = before.length;
  return (
    <div style={{ marginTop: 6, fontSize: 12, fontFamily: "monospace", overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cellTh}>col</th>
            {Array.from({ length: n + m }, (_, j) => (
              <th key={j} style={cellTh}>
                {j < n ? `x${j + 1}` : `s${j - n + 1}`}
              </th>
            ))}
            <th style={cellTh}>RHS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellTd}>before</td>
            {before.map((v, j) => (
              <td key={j} style={{ ...cellTd, color: "#666" }}>{fmtNum(v)}</td>
            ))}
          </tr>
          <tr>
            <td style={cellTd}>compute</td>
            {before.map((v, j) => (
              <td key={j} style={{ ...cellTd, fontSize: 10 }}>
                <Tex>{rule(v, j)}</Tex>
              </td>
            ))}
          </tr>
          <tr>
            <td style={cellTd}>after</td>
            {after.map((v, j) => (
              <td key={j} style={{ ...cellTd, color: "#1f4e3d", fontWeight: 700 }}>{fmtNum(v)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Reference card
// ============================================================
function Reference() {
  return (
    <div style={{ marginTop: 28, padding: 16, background: "#fff8e1", borderRadius: 10, border: "1px solid #f5d68d" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Reference — the Gauss-Jordan pivot
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#3d2f00" }}>
        <p style={{ margin: "0 0 8px 0" }}>
          To pivot at position{" "}
          <Tex>{`(p, q)`}</Tex> with pivot value{" "}
          <Tex>{`a_{pq} \\neq 0`}</Tex>:
        </p>
        <ol style={{ paddingLeft: 22, margin: 0, lineHeight: 1.7 }}>
          <li>
            Scale the pivot row:{" "}
            <Tex>{`R_p \\leftarrow \\frac{1}{a_{pq}} R_p`}</Tex>
          </li>
          <li>
            Eliminate column <Tex>{`q`}</Tex> elsewhere — for each{" "}
            <Tex>{`i \\neq p`}</Tex>:{" "}
            <Tex>{`R_i \\leftarrow R_i - a_{iq}\\,R_p`}</Tex>
          </li>
        </ol>
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          After pivoting, column <Tex>{`q`}</Tex> is the unit vector{" "}
          <Tex>{`e_p`}</Tex> — exactly the structure simplex needs to make
          variable <Tex>{`x_q`}</Tex> basic in row <Tex>{`p`}</Tex>. The
          algebra is identical whether you're doing simplex, Gauss-Jordan
          elimination on a linear system, or computing an inverse via the
          augmented matrix <Tex>{`[A \\,|\\, I]`}</Tex>.
        </p>
      </div>
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
const editorBox = {
  background: "#f6f4ee",
  border: "1px solid #ece8dd",
  borderRadius: 8,
  padding: 14,
  marginBottom: 14,
};
const editTh = { padding: "4px 6px", fontSize: 12, color: "#666" };
const editLab = { padding: "4px 8px", fontWeight: 700, color: "#555" };
const th = {
  padding: "6px 8px",
  border: "1px solid #ccc",
  background: "#f0f0f0",
  fontWeight: 700,
  textAlign: "center",
};
const td = {
  padding: "5px 8px",
  border: "1px solid #ddd",
  textAlign: "right",
};
const tdLabel = { ...td, textAlign: "center", fontWeight: 700, color: "#555" };
const cellTh = {
  padding: "2px 6px",
  border: "1px solid #ccc",
  background: "#f0f0f0",
  fontSize: 10,
};
const cellTd = {
  padding: "2px 6px",
  border: "1px solid #eee",
  textAlign: "right",
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
const btnPrimary = {
  ...btn,
  background: "#111",
  color: "#fff",
  border: "1px solid #111",
};
const btnSmall = {
  ...btn,
  padding: "4px 8px",
  fontSize: 12,
};
