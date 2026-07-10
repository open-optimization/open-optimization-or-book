import React, { useState, useMemo } from "react";
import { Terminal, RotateCcw, Download, AlertTriangle, ArrowDown } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   DUAL SIMPLEX METHOD — INTERACTIVE WALKTHROUGH
   ISE 5406

   Primal simplex maintains primal feasibility (RHS >= 0) and
   chases dual feasibility (z-row >= 0). DUAL simplex flips the
   roles: it maintains DUAL feasibility (z-row >= 0) and chases
   primal feasibility (RHS >= 0).

   Pivot order is reversed:
     1. LEAVING row first — pick a row with NEGATIVE RHS.
     2. ENTERING column second — min-ratio test on
        z_j / |a_{ij}| over columns where a_{ij} < 0 in the
        leaving row.

   Where it shines: re-optimization after a Gomory cut, after a
   bound tightening, or after a cut in branch-and-bound — the
   previous optimal basis is dual-feasible but no longer
   primal-feasible. A few dual pivots restore optimality.
   ============================================================ */

// ============================================================
// Three preset tableaux. Each is a (T, basis, n, m) state ready
// for dual-simplex pivoting (z-row >= 0, at least one RHS < 0).
// Rows: 0..m-1 = constraint rows. Row m = z-row.
// Cols: 0..n-1 decision vars, n..n+m-1 slack vars, last = RHS.
// ============================================================

// Wood/Labor + Gomory-style cut x1 <= 3 added to (3.6, 0.8) optimum.
// Original optimal tableau:
//   z   0  0  4/5  7/5  | 14.8
//  x1   1  0  3/5 -1/5  |  3.6
//  x2   0  1 -1/5  2/5  |  0.8
// Cut: x1 + s3 = 3. Eliminate x1 -> -3/5 s1 + 1/5 s2 + s3 = -0.6
const PRESET_AFTER_CUT = {
  key: "after_cut",
  name: "After adding a cut (Gomory-style)",
  blurb:
    "The wood/labor LP max 3x1 + 5x2 s.t. 2x1+x2<=8, x1+3x2<=6 has optimum (3.6, 0.8) with z* = 14.8. We add the cut x1 <= 3 (the Gomory floor of 3.6). At the previous basis, x1 = 3.6 violates the new cut, so the basis is primal-INFEASIBLE. But it's still dual-feasible — the cut didn't touch the z-row's reduced costs. Dual simplex will repair feasibility in one pivot, ending at (3, 1) with z = 14.",
  n: 2, m: 3,
  basis: [0, 1, 4],
  T: [
    [1, 0,  3/5, -1/5, 0,  3.6],
    [0, 1, -1/5,  2/5, 0,  0.8],
    [0, 0, -3/5,  1/5, 1, -0.6],
    [0, 0,  4/5,  7/5, 0, 14.8],
  ],
  hint: "Only one row has negative RHS (s3 = -0.6). The s3-row coefficient on s1 is -3/5 (negative -> eligible); on s2 it is +1/5 (positive -> NOT eligible). Entering column must be s1.",
};

// Same LP, but RHS of constraint 1 tightened from 8 to 1.
// At previous basis {x1, x2}, x = B^{-1} b = (1/5)[3 -1; -1 2] [1, 6]
//   = (-0.6, 2.2)  -> x1 = -0.6 < 0  (primal infeasible)
// z = pi . b = (4/5)(1) + (7/5)(6) = 9.2.
const PRESET_AFTER_RHS = {
  key: "after_rhs",
  name: "After tightening a RHS",
  blurb:
    "Same wood/labor LP, but b1 is tightened from 8 down to 1 (a budget cut). At the previous basis {x1, x2} the formula x_B = B^{-1} b gives x1 = -0.6 < 0 — the basis is primal-INFEASIBLE. Dual feasibility (z-row) is unchanged because c_B and B haven't changed. The leaving row is forced (only x1 has negative RHS); the entering column is s2 by min-ratio.",
  n: 2, m: 2,
  basis: [0, 1],
  T: [
    [1, 0,  3/5, -1/5, -0.6],
    [0, 1, -1/5,  2/5,  2.2],
    [0, 0,  4/5,  7/5,  9.2],
  ],
  hint: "Leaving row: x1 (RHS = -0.6, the only negative). Coefs in x1 row: s1 = 3/5 (positive, not eligible), s2 = -1/5 (negative, eligible). Only one candidate column — entering is s2.",
};

// Hand-built dual-feasible tableau with TWO negative RHS rows so
// that the user has to pick the leaving row, and multiple eligible
// entering columns so the min-ratio test does real work.
const PRESET_DIRECT = {
  key: "direct",
  name: "Constructed tableau (2 negative RHS, multiple entering candidates)",
  blurb:
    "A directly constructed tableau where the z-row is non-negative everywhere but TWO rows have negative RHS. The student picks the leaving row (most-negative-RHS rule says s2 with -4) and then the dual ratio test gives multiple entering candidates: x1 (ratio 2/2 = 1) and x2 (ratio 3/1 = 3). The minimum-ratio winner is x1.",
  n: 2, m: 3,
  basis: [2, 3, 4],
  T: [
    [-1, -2, 1, 0, 0, -3],
    [-2, -1, 0, 1, 0, -4],
    [ 1,  1, 0, 0, 1,  5],
    [ 2,  3, 0, 0, 0,  0],
  ],
  hint: "Leaving row: s2 (RHS = -4, the most negative). Eligible entering columns: those with NEGATIVE coef in the s2 row — that is, x1 (coef -2) and x2 (coef -1). Dual min-ratio test: z_x1/|coef| = 2/2 = 1, z_x2/|coef| = 3/1 = 3. Min is x1.",
};

const PRESETS = [PRESET_AFTER_CUT, PRESET_AFTER_RHS, PRESET_DIRECT];

// ============================================================
// Tableau helpers — same shape as simplex_tableau_demo
// ============================================================
function pivot(T, row, col) {
  const newT = T.map((r) => [...r]);
  const piv = newT[row][col];
  for (let j = 0; j < newT[0].length; j++) newT[row][j] /= piv;
  for (let i = 0; i < newT.length; i++) {
    if (i === row) continue;
    const f = newT[i][col];
    if (Math.abs(f) < 1e-12) continue;
    for (let j = 0; j < newT[0].length; j++) newT[i][j] -= f * newT[row][j];
  }
  return newT;
}

function variableLabel(idx, n) {
  if (idx < n) return `x${idx + 1}`;
  return `s${idx - n + 1}`;
}
function variableTex(idx, n) {
  if (idx < n) return `x_${idx + 1}`;
  return `s_${idx - n + 1}`;
}

function fmt(v) {
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(3);
}

function isDualFeasible(T, m, n) {
  for (let j = 0; j < T[0].length - 1; j++) {
    if (T[m][j] < -1e-9) return false;
  }
  return true;
}
function isPrimalFeasible(T, m) {
  const RHS = T[0].length - 1;
  for (let i = 0; i < m; i++) if (T[i][RHS] < -1e-9) return false;
  return true;
}

// Dual ratio test: given a leaving row whose RHS is negative, find
// the entering column. Eligible cols are those with a_{ij} < 0 in
// that row. Ratio = z_row[j] / |a_{ij}|. Pick the MIN.
function dualRatioTest(T, m, leavingRow) {
  const totalCols = T[0].length;
  const ratios = [];
  for (let j = 0; j < totalCols - 1; j++) {
    const a = T[leavingRow][j];
    const z = T[m][j];
    if (a < -1e-9) ratios.push({ col: j, ratio: z / Math.abs(a), ok: true, a, z });
    else ratios.push({ col: j, ratio: Infinity, ok: false, a, z });
  }
  let minCol = -1, minRatio = Infinity;
  ratios.forEach((r) => {
    if (r.ok && r.ratio < minRatio - 1e-9) {
      minRatio = r.ratio;
      minCol = r.col;
    }
  });
  return { ratios, minCol };
}

// Most-negative RHS row (the conventional dual-simplex leaving rule)
function mostNegativeRHSRow(T, m) {
  const RHS = T[0].length - 1;
  let minRow = -1, minVal = -1e-9;
  for (let i = 0; i < m; i++) {
    if (T[i][RHS] < minVal) {
      minVal = T[i][RHS];
      minRow = i;
    }
  }
  return minRow;
}

function tableauToMarkdown({ T, basis, n, m }) {
  const totalCols = n + m + 1;
  const headers = ["basis"];
  for (let j = 0; j < n; j++) headers.push(`x${j + 1}`);
  for (let j = 0; j < m; j++) headers.push(`s${j + 1}`);
  headers.push("RHS");
  const lines = [];
  lines.push("| " + headers.join(" | ") + " |");
  lines.push("|" + headers.map(() => "---").join("|") + "|");
  const zRow = ["**z**"];
  for (let j = 0; j < n + m; j++) zRow.push(fmt(T[m][j]));
  zRow.push("**" + fmt(T[m][n + m]) + "**");
  lines.push("| " + zRow.join(" | ") + " |");
  for (let i = 0; i < m; i++) {
    const row = [variableLabel(basis[i], n)];
    for (let j = 0; j < n + m; j++) row.push(fmt(T[i][j]));
    row.push("**" + fmt(T[i][n + m]) + "**");
    lines.push("| " + row.join(" | ") + " |");
  }
  return lines.join("\n");
}

// ============================================================
// Main component
// ============================================================
export default function DualSimplexDemo() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const preset = PRESETS.find((p) => p.key === presetKey);

  const initial = useMemo(
    () => ({
      T: preset.T.map((r) => [...r]),
      basis: [...preset.basis],
      n: preset.n,
      m: preset.m,
    }),
    [preset]
  );

  const [history, setHistory] = useState([initial]);
  const [stepIdx, setStepIdx] = useState(0);
  const [pivotLog, setPivotLog] = useState([]);
  const cur = history[stepIdx];
  const { T, basis, n, m } = cur;

  const [hoverRow, setHoverRow] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [lastPivot, setLastPivot] = useState(null);

  React.useEffect(() => {
    setHistory([initial]);
    setStepIdx(0);
    setHoverRow(null);
    setFeedback(null);
    setLastPivot(null);
    setPivotLog([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const dualFeasible = isDualFeasible(T, m, n);
  const primalFeasible = isPrimalFeasible(T, m);
  const optimal = dualFeasible && primalFeasible;

  // Suggested leaving row: most-negative RHS
  const suggestedRow = useMemo(() => mostNegativeRHSRow(T, m), [T, m]);
  const suggestedCol = useMemo(() => {
    if (suggestedRow < 0) return -1;
    return dualRatioTest(T, m, suggestedRow).minCol;
  }, [T, m, suggestedRow]);

  function doPivot(row, col) {
    const T_before = T.map((r) => [...r]);
    const newT = pivot(T, row, col);
    const newBasis = [...basis];
    const leaving = newBasis[row];
    newBasis[row] = col;
    const newHistory = history.slice(0, stepIdx + 1);
    newHistory.push({ T: newT, basis: newBasis, n, m });
    setHistory(newHistory);
    setStepIdx(newHistory.length - 1);
    const newLog = pivotLog.slice(0, stepIdx);
    newLog.push({
      row, col,
      pivVal: T_before[row][col],
      entering: variableLabel(col, n),
      leaving: variableLabel(leaving, n),
    });
    setPivotLog(newLog);
    setHoverRow(null);
    setFeedback(null);
    setLastPivot({ T_before, row, col });
  }

  function handleRowClick(i) {
    const RHS = T[0].length - 1;
    if (T[i][RHS] >= -1e-9) {
      setFeedback({
        ok: false,
        severity: "warn",
        msg: `Row ${i + 1} (basic ${variableLabel(basis[i], n)}) has RHS = ${fmt(T[i][RHS])} >= 0 — it's already primal-feasible. Pick a row with NEGATIVE RHS (highlighted red).`,
      });
      return;
    }
    if (practiceMode) {
      if (i === suggestedRow) {
        setFeedback({
          ok: true,
          msg: `Correct! Row ${i + 1} has the most-negative RHS (${fmt(T[i][RHS])}). Now pick the entering column from those with negative coefficient in this row (yellow).`,
        });
      } else {
        const sug = variableLabel(basis[suggestedRow], n);
        setFeedback({
          ok: true,
          msg: `Row ${i + 1} is valid (RHS = ${fmt(T[i][RHS])} < 0), but the dual-simplex convention picks the most-negative RHS: row ${suggestedRow + 1} (${sug}).`,
        });
      }
    } else {
      setFeedback(null);
    }
    setHoverRow(i);
  }

  function handleColumnClick(j) {
    if (j >= n + m) return;
    if (hoverRow === null) {
      setFeedback({
        ok: false,
        severity: "warn",
        msg: "Pick a leaving row first (a row with negative RHS).",
      });
      return;
    }
    const ratio = dualRatioTest(T, m, hoverRow);
    const a = T[hoverRow][j];
    if (a >= -1e-9) {
      setFeedback({
        ok: false,
        severity: "error",
        msg: `INVALID PIVOT: a_{ij} = ${fmt(a)} >= 0 in row ${hoverRow + 1}, column ${variableLabel(j, n)}. Eligibility for the dual ratio test requires a_{ij} < 0. (If every column of the leaving row had a_{ij} >= 0, the LP would be PRIMAL-INFEASIBLE — no dual pivot can fix it.)`,
      });
      return;
    }
    if (j !== ratio.minCol) {
      const winner = variableLabel(ratio.minCol, n);
      const winnerR = ratio.ratios[ratio.minCol].ratio;
      const thisR = ratio.ratios[j].ratio;
      setFeedback({
        ok: false,
        severity: "error",
        msg: `WRONG ENTERING COLUMN: ${variableLabel(j, n)} has dual ratio z_j/|a_ij| = ${thisR.toFixed(3)}, but the minimum is ${winner} with ratio ${winnerR.toFixed(3)}. Picking a non-min ratio column would break dual feasibility (some z-row entry would go negative).`,
      });
      return;
    }
    doPivot(hoverRow, j);
  }

  function reset() {
    setHistory([initial]);
    setStepIdx(0);
    setHoverRow(null);
    setFeedback(null);
    setLastPivot(null);
    setPivotLog([]);
  }

  function buildReport() {
    const lines = [];
    lines.push(`# Dual Simplex — Worked Solution`);
    lines.push("");
    lines.push(`Preset: **${preset.name}**`);
    lines.push("");
    lines.push(preset.blurb);
    lines.push("");
    history.forEach((step, i) => {
      lines.push(`## Tableau ${i}${i === 0 ? " — initial (dual-feasible, primal-infeasible)" : ""}`);
      lines.push("");
      if (i > 0) {
        const p = pivotLog[i - 1];
        if (p) {
          lines.push(`Dual pivot: leaving row ${p.row + 1} (${p.leaving}), entering column ${p.entering}, pivot value ${p.pivVal.toFixed(4)}`);
          lines.push("");
        }
      }
      lines.push(tableauToMarkdown(step));
      lines.push("");
    });
    const fin = history[history.length - 1];
    if (isPrimalFeasible(fin.T, m) && isDualFeasible(fin.T, m, n)) {
      lines.push(`## Optimal — primal feasibility restored`);
      lines.push("");
      lines.push(`z* = ${fmt(fin.T[m][n + m])}`);
      lines.push("");
      lines.push(`Basis: { ${fin.basis.map((b2) => variableLabel(b2, n)).join(", ")} }`);
    }
    return lines.join("\n");
  }
  function downloadReport() {
    const md = buildReport();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dual_simplex_${presetKey}_${history.length - 1}pivots.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Dual Simplex Method — Interactive
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 920 }}>
        Primal simplex maintains primal feasibility (RHS &ge; 0) and chases
        dual feasibility (z-row &ge; 0). The DUAL simplex flips the roles:
        it maintains dual feasibility and chases primal feasibility.
        Pivot order is reversed — pick the LEAVING row first, then the
        ENTERING column. Click a red row (negative RHS) to start; eligible
        columns (negative coefficient in that row) light up; click one to
        pivot. Watch z DECREASE on each pivot until primal feasibility is
        restored at a new optimum.
      </p>

      <IntroPanel />

      <PresetPicker presetKey={presetKey} setPresetKey={setPresetKey} />

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
          <RotateCcw size={14} /> Reset to initial tableau
        </button>
        <button
          onClick={() => { setStepIdx(Math.max(0, stepIdx - 1)); setLastPivot(null); }}
          disabled={stepIdx === 0}
          style={btn}
        >
          &larr; Undo pivot
        </button>
        <button onClick={downloadReport} style={btn} title="Download Markdown record">
          <Download size={14} /> Save work
        </button>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>
          step {stepIdx} / {history.length - 1}
        </span>
        {hoverRow !== null && (
          <button onClick={() => { setHoverRow(null); setFeedback(null); }} style={btn}>
            Clear leaving-row selection
          </button>
        )}
      </div>

      <StatusBanner dualFeasible={dualFeasible} primalFeasible={primalFeasible} />

      {feedback && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            background: feedback.ok ? "#e8f5e9"
              : feedback.severity === "error" ? "#fde8e8"
              : "#fff8e1",
            border: `2px solid ${feedback.ok ? "#7dd87d"
              : feedback.severity === "error" ? "#c8311c"
              : "#f5a524"}`,
            borderRadius: 6,
            fontSize: 13,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          {!feedback.ok && (
            <AlertTriangle size={18} color={feedback.severity === "error" ? "#c8311c" : "#a06700"} style={{ flexShrink: 0, marginTop: 1 }} />
          )}
          <div>{feedback.msg}</div>
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
          <Tableau
            T={T}
            basis={basis}
            n={n}
            m={m}
            hoverRow={hoverRow}
            onRowClick={handleRowClick}
            onColumnClick={handleColumnClick}
            optimal={optimal}
            suggestedRow={suggestedRow}
            suggestedCol={suggestedCol}
            practiceMode={practiceMode}
          />
          <BasisStatus basis={basis} T={T} n={n} m={m} optimal={optimal} dualFeasible={dualFeasible} primalFeasible={primalFeasible} />
        </div>
        <div>
          <PresetHint preset={preset} />
          <DualRatioPanel T={T} basis={basis} n={n} m={m} hoverRow={hoverRow} suggestedRow={suggestedRow} />
          {lastPivot && (
            <PivotAlgebraPanel
              T_before={lastPivot.T_before}
              T_after={T}
              row={lastPivot.row}
              col={lastPivot.col}
              n={n}
              m={m}
            />
          )}
        </div>
      </div>

      <PivotRulesPanel />
      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Intro panel — explains what dual simplex is and when used
// ============================================================
function IntroPanel() {
  return (
    <div style={{ marginBottom: 16, padding: 14, background: "#fafafa", border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        Why dual simplex exists
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, fontSize: 13, lineHeight: 1.5, color: "#333" }}>
        <div>
          <p style={{ marginTop: 0 }}>
            In primal simplex, the current tableau represents a basic
            feasible solution (BFS) — RHS &ge; 0. Pivots PRESERVE primal
            feasibility while moving toward the optimum (z-row &ge; 0).
          </p>
          <p>
            <b>Dual simplex inverts this</b>: the tableau represents a
            dual feasible (but not necessarily primal feasible) basis.
            Pivots PRESERVE dual feasibility while restoring primal
            feasibility. By LP duality, when both feasibilities hold, the
            basis is optimal.
          </p>
        </div>
        <div>
          <b>When you'd actually use it:</b>
          <ul style={{ paddingLeft: 22, margin: "4px 0", lineHeight: 1.55 }}>
            <li>
              <b>After adding a cut.</b> A Gomory or knapsack cut tightens
              the LP. The previous optimum often violates the cut, but
              the z-row is unchanged — dual feasible, primal infeasible.
            </li>
            <li>
              <b>After tightening a bound.</b> In branch-and-bound, when
              you branch on <Tex>{`x_i \\le \\lfloor x_i^\\* \\rfloor`}</Tex>,
              the parent's basis is dual-feasible for the child.
            </li>
            <li>
              <b>After RHS perturbation.</b> Sensitivity analysis: change
              <Tex> {` b`} </Tex>, see if the basis is still feasible. If
              not, dual-pivot to restore.
            </li>
            <li>
              <b>Two-phase substitute.</b> Some implementations use dual
              simplex on a Big-M-free reformulation to find an initial
              BFS without phase one.
            </li>
          </ul>
        </div>
      </div>
      <div style={{ marginTop: 10, padding: "10px 12px", background: "#fff8e1", border: "1px solid #f5d68d", borderRadius: 6, fontSize: 13, color: "#3d2f00" }}>
        <b>Bottom line:</b> primal simplex starts at a feasible-but-bad
        BFS and walks UP toward the optimum. Dual simplex starts at an
        infeasible-but-dual-optimal point and walks DOWN through
        successively-less-optimistic estimates until primal feasibility
        is restored. Both terminate at the same place — strong duality.
      </div>
    </div>
  );
}

// ============================================================
// Preset picker
// ============================================================
function PresetPicker({ presetKey, setPresetKey }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>
        examples — click one to load
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPresetKey(p.key)}
            style={{
              padding: "8px 14px",
              border: presetKey === p.key ? "1px solid #1f4e3d" : "1px solid #ccc",
              borderRadius: 6,
              background: presetKey === p.key ? "#1f4e3d" : "#fff",
              color: presetKey === p.key ? "#fff" : "#222",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
      {(() => {
        const p = PRESETS.find((x) => x.key === presetKey);
        if (!p) return null;
        return (
          <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, padding: "8px 12px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 6, marginTop: 6 }}>
            {p.blurb}
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// Status banner
// ============================================================
function StatusBanner({ dualFeasible, primalFeasible }) {
  const optimal = dualFeasible && primalFeasible;
  let bg, border, msg;
  if (optimal) {
    bg = "#e8f5e9"; border = "#7dd87d";
    msg = "OPTIMAL — both primal and dual feasibility hold. Done.";
  } else if (dualFeasible && !primalFeasible) {
    bg = "#fff8e1"; border = "#f5d68d";
    msg = "Dual-feasible, primal-infeasible. Dual simplex pivots will restore primal feasibility (RHS >= 0) while preserving z-row >= 0.";
  } else if (!dualFeasible && primalFeasible) {
    bg = "#fde8e8"; border = "#e88";
    msg = "Primal-feasible, dual-infeasible. This is the regime where PRIMAL simplex applies — switch tools.";
  } else {
    bg = "#fde8e8"; border = "#e88";
    msg = "Neither primal nor dual feasible. Need a phase-one or big-M setup.";
  }
  return (
    <div style={{
      marginBottom: 12, padding: "8px 12px", background: bg,
      border: `1px solid ${border}`, borderRadius: 6,
      fontSize: 13, fontWeight: 500, color: "#222",
    }}>
      {msg}
    </div>
  );
}

// ============================================================
// Tableau view
// ============================================================
function Tableau({ T, basis, n, m, hoverRow, onRowClick, onColumnClick, optimal, suggestedRow, suggestedCol, practiceMode }) {
  const totalCols = n + m + 1;
  const RHS = totalCols - 1;
  const rcosts = T[m];

  // Eligibility per col when a leaving row is selected
  let ratioInfo = null;
  if (hoverRow !== null && hoverRow >= 0 && hoverRow < m) {
    ratioInfo = dualRatioTest(T, m, hoverRow);
  }

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Dual simplex tableau {optimal ? "(optimal)" : ""}
      </div>
      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13, width: "100%" }}>
        <thead>
          <tr>
            <th style={thLeft}>basis</th>
            {Array.from({ length: n + m }, (_, j) => {
              const isMinRatio = ratioInfo && j === ratioInfo.minCol;
              const eligible = ratioInfo && ratioInfo.ratios[j].ok;
              const isSuggested = !practiceMode && hoverRow === null && j === suggestedCol;
              return (
                <th
                  key={j}
                  onClick={() => onColumnClick(j)}
                  style={{
                    ...th,
                    cursor: hoverRow !== null ? "pointer" : "default",
                    background: isMinRatio ? "#7dd87d"
                      : eligible ? "#fff8e1"
                      : isSuggested ? "#fff4c8"
                      : "#fff",
                  }}
                >
                  {variableLabel(j, n)}
                </th>
              );
            })}
            <th style={th}>RHS</th>
            {hoverRow !== null && <th style={th}>dual ratio</th>}
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: "#fff8e1" }}>
            <td style={{ ...tdLabel, borderBottom: "2px solid #444" }}>z</td>
            {Array.from({ length: n + m }, (_, j) => (
              <td
                key={j}
                style={{
                  ...td,
                  borderBottom: "2px solid #444",
                  color: rcosts[j] < -1e-9 ? "#c8311c" : "#222",
                  fontWeight: rcosts[j] < -1e-9 ? 700 : 400,
                }}
              >
                {fmt(rcosts[j])}
              </td>
            ))}
            <td style={{ ...td, borderBottom: "2px solid #444", fontWeight: 700 }}>
              {fmt(T[m][RHS])}
            </td>
            {hoverRow !== null && <td style={{ ...td, borderBottom: "2px solid #444" }}></td>}
          </tr>
          {Array.from({ length: m }, (_, i) => {
            const isLeaving = i === hoverRow;
            const isNeg = T[i][RHS] < -1e-9;
            const isSuggestedLeaving = !practiceMode && hoverRow === null && i === suggestedRow;
            const rowBg = isLeaving ? "#fde8e8"
              : isSuggestedLeaving ? "#fff4c8"
              : isNeg ? "#fff" : "transparent";
            return (
              <tr
                key={i}
                onClick={() => onRowClick(i)}
                style={{ background: rowBg, cursor: isNeg ? "pointer" : "default" }}
              >
                <td style={{ ...tdLabel, color: isNeg ? "#c8311c" : "#555" }}>
                  {variableLabel(basis[i], n)}
                </td>
                {Array.from({ length: n + m }, (_, j) => {
                  const v = T[i][j];
                  const eligible = isLeaving && v < -1e-9;
                  const isPivot = isLeaving && j === ratioInfo?.minCol;
                  return (
                    <td
                      key={j}
                      style={{
                        ...td,
                        background: isPivot ? "#7dd87d"
                          : eligible ? "#fff8e1"
                          : "transparent",
                        color: isLeaving && v < -1e-9 ? "#c8311c" : "#222",
                        fontWeight: eligible ? 700 : 400,
                      }}
                    >
                      {fmt(v)}
                    </td>
                  );
                })}
                <td
                  style={{
                    ...td,
                    fontWeight: 700,
                    color: T[i][RHS] < -1e-9 ? "#c8311c" : "#222",
                    background: T[i][RHS] < -1e-9 ? "#ffeaea" : "transparent",
                  }}
                >
                  {fmt(T[i][RHS])}
                </td>
                {hoverRow !== null && isLeaving && (
                  <td style={{ ...td, color: "#c8311c", fontStyle: "italic", fontWeight: 700 }}>
                    leaving
                  </td>
                )}
                {hoverRow !== null && !isLeaving && <td style={td}></td>}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
        <b>Pick order:</b> click a RED row (RHS &lt; 0) to pick the
        leaving variable. Eligible entering columns (those with{" "}
        <Tex>{`a_{ij} < 0`}</Tex> in that row) turn yellow; the dual
        min-ratio winner turns green. Click the green column to pivot.
      </div>
    </div>
  );
}

const th = {
  padding: "6px 8px",
  border: "1px solid #ccc",
  background: "#f0f0f0",
  fontWeight: 700,
};
const thLeft = { ...th, textAlign: "left" };
const td = {
  padding: "5px 8px",
  border: "1px solid #ddd",
  textAlign: "right",
};
const tdLabel = { ...td, textAlign: "left", fontWeight: 700, color: "#555" };

// ============================================================
// Basis status panel
// ============================================================
function BasisStatus({ basis, T, n, m, optimal, dualFeasible, primalFeasible }) {
  const totalCols = T[0].length;
  const x = Array(n + m).fill(0);
  for (let i = 0; i < m; i++) x[basis[i]] = T[i][totalCols - 1];
  return (
    <div style={{ ...panel, marginTop: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Current basic solution {primalFeasible ? "(primal feasible)" : "(PRIMAL INFEASIBLE)"}
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}>
        <tbody>
          {Array.from({ length: n + m }, (_, j) => (
            <tr key={j}>
              <td style={{ padding: "2px 6px", color: "#555" }}>
                {variableLabel(j, n)}
              </td>
              <td
                style={{
                  padding: "2px 6px",
                  textAlign: "right",
                  color: x[j] < -1e-9 ? "#c8311c" : x[j] > 1e-9 ? "#1f4e3d" : "#888",
                  fontWeight: Math.abs(x[j]) > 1e-9 ? 700 : 400,
                }}
              >
                {fmt(x[j])}
              </td>
              <td style={{ padding: "2px 6px", color: "#666", fontStyle: "italic" }}>
                {Math.abs(x[j]) > 1e-9
                  ? (x[j] < 0 ? "(basic, NEGATIVE — infeasible)" : "(basic)")
                  : "(non-basic / zero)"}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #444" }}>
            <td style={{ padding: "2px 6px", fontWeight: 700 }}>z</td>
            <td style={{ padding: "2px 6px", textAlign: "right", fontWeight: 700, color: "#c8311c" }}>
              {fmt(T[m][totalCols - 1])}
            </td>
            <td>{optimal && <span style={{ color: "#1f4e3d", fontWeight: 700 }}>* OPTIMAL</span>}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
        Dual feasibility: {dualFeasible ? "yes (z-row >= 0)" : "NO"} ·{" "}
        Primal feasibility: {primalFeasible ? "yes (RHS >= 0)" : "NO"}
      </div>
    </div>
  );
}

// ============================================================
// Preset hint panel
// ============================================================
function PresetHint({ preset }) {
  return (
    <div style={{ ...panel, marginBottom: 12, background: "#f6f4ee", borderColor: "#ece8dd" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        what to look for
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{preset.hint}</div>
    </div>
  );
}

// ============================================================
// Dual ratio panel — shows the ratio test calculation when
// the user has selected a leaving row.
// ============================================================
function DualRatioPanel({ T, basis, n, m, hoverRow, suggestedRow }) {
  if (hoverRow === null) {
    return (
      <div style={{ ...panel, marginBottom: 12 }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
          Dual ratio test — pending row pick
        </div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
          Click a row with NEGATIVE RHS to start the dual ratio test. The
          most-negative-RHS row ({suggestedRow >= 0 ? `row ${suggestedRow + 1}, basis ${variableLabel(basis[suggestedRow], n)}` : "(none — already feasible)"}) is the standard pick.
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#333" }}>
          Once the leaving row <Tex>{`p`}</Tex> is fixed, the entering column is:
        </div>
        <Tex block>{`q \\;=\\; \\arg\\min_{\\,j \\,:\\, a_{pj} < 0\\,} \\;\\frac{\\bar z_j}{|a_{pj}|}`}</Tex>
        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>
          Note the asymmetry: only NEGATIVE coefficients <Tex>{`a_{pj}`}</Tex> are
          eligible. Why? After the pivot, the new z-row entry at column{" "}
          <Tex>j</Tex> is <Tex>{`\\bar z_j - \\bar z_q \\, a_{pj} / a_{pq}`}</Tex>;
          for this to stay <Tex>{`\\ge 0`}</Tex> for all j, the ratio test
          must select the smallest <Tex>{`\\bar z_j / |a_{pj}|`}</Tex>.
        </div>
      </div>
    );
  }

  const ratio = dualRatioTest(T, m, hoverRow);
  const RHS = T[0].length - 1;
  const negRHS = T[hoverRow][RHS];
  return (
    <div style={{ ...panel, marginBottom: 12, background: "#fff8e1", borderColor: "#f5d68d" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Dual ratio test — row {hoverRow + 1} (leaving: {variableLabel(basis[hoverRow], n)}, RHS = {fmt(negRHS)})
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={smTh}>col j</th>
            <th style={smTh}>{`a_{pj}`}</th>
            <th style={smTh}>{`zbar_j`}</th>
            <th style={smTh}>eligible?</th>
            <th style={smTh}>{`zbar_j / |a_{pj}|`}</th>
          </tr>
        </thead>
        <tbody>
          {ratio.ratios.map((r) => {
            const isMin = r.col === ratio.minCol;
            return (
              <tr key={r.col} style={{ background: isMin ? "#7dd87d" : "transparent" }}>
                <td style={smTd}>{variableLabel(r.col, n)}</td>
                <td style={smTd}>{fmt(r.a)}</td>
                <td style={smTd}>{fmt(r.z)}</td>
                <td style={{ ...smTd, color: r.ok ? "#1f4e3d" : "#888" }}>
                  {r.ok ? "yes (a < 0)" : "no"}
                </td>
                <td style={{ ...smTd, fontWeight: isMin ? 700 : 400 }}>
                  {r.ok ? r.ratio.toFixed(3) : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 6, fontSize: 12, color: "#3d2f00", lineHeight: 1.5 }}>
        Min-ratio winner: <b>{ratio.minCol >= 0 ? variableLabel(ratio.minCol, n) : "(none)"}</b>
        {ratio.minCol < 0
          ? " — every coef in the leaving row is >= 0, so the dual is unbounded and the PRIMAL is INFEASIBLE."
          : " — click the green column to pivot."}
      </div>
    </div>
  );
}

const smTh = {
  padding: "4px 6px", borderBottom: "1px solid #ccc",
  fontWeight: 700, fontSize: 12, textAlign: "left", color: "#444",
};
const smTd = {
  padding: "3px 6px", fontSize: 13, textAlign: "left",
};

// ============================================================
// Pivot algebra panel
// ============================================================
function PivotAlgebraPanel({ T_before, T_after, row, col, n, m }) {
  const pivVal = T_before[row][col];
  const colName = variableTex(col, n);
  const rowName = `R_${row + 1}`;
  const elims = [];
  for (let i = 0; i < T_before.length; i++) {
    if (i === row) continue;
    const f = T_before[i][col];
    if (Math.abs(f) < 1e-12) continue;
    elims.push({ i, factor: f });
  }
  const RHS_before = T_before[m][T_before[0].length - 1];
  const RHS_after = T_after[m][T_after[0].length - 1];
  const dz = RHS_after - RHS_before;

  return (
    <div style={{ ...panel, marginTop: 0 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Pivot algebra — what just happened
      </div>
      <div style={{ fontSize: 13, marginBottom: 6 }}>
        Pivoted at <Tex>{`(${rowName},\\, ${colName})`}</Tex>; pivot value{" "}
        <Tex>{`a_{pq} = ${fmt(pivVal)}`}</Tex> (negative — this is the dual-simplex hallmark).
      </div>

      {Math.abs(pivVal - 1) > 1e-9 && (
        <div style={algStep}>
          <span style={{ fontWeight: 600 }}>1. Scale the pivot row.</span>
          <Tex block>
            {`${rowName} \\;\\leftarrow\\; \\frac{1}{${fmt(pivVal)}} \\, ${rowName}`}
          </Tex>
          <div style={{ fontSize: 12, color: "#666" }}>
            Dividing by a NEGATIVE pivot value flips the sign of the RHS,
            converting the negative <Tex>{`b_p`}</Tex> into a POSITIVE
            value — exactly what restores primal feasibility for this row.
          </div>
        </div>
      )}

      <div style={algStep}>
        <span style={{ fontWeight: 600 }}>
          {Math.abs(pivVal - 1) > 1e-9 ? "2. " : "1. "}Eliminate column{" "}
          <Tex>{colName}</Tex> in every other row.
        </span>
        {elims.length === 0 ? (
          <div style={{ fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" }}>
            (column already zero everywhere except the pivot row.)
          </div>
        ) : (
          <div style={{ marginTop: 4 }}>
            {elims.map((e, k) => {
              const rname = e.i === m ? "z" : `R_${e.i + 1}`;
              return (
                <Tex key={k} block>
                  {`${rname} \\;\\leftarrow\\; ${rname} \\;-\\; (${fmt(e.factor)})\\, ${rowName}`}
                </Tex>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, padding: "6px 10px", background: "#fff", border: "1px dashed #aaa", borderRadius: 6, fontSize: 13 }}>
        <ArrowDown size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
        z (max objective): <Tex>{`${fmt(RHS_before)} \\;\\to\\; ${fmt(RHS_after)}`}</Tex>{" "}
        ({dz <= 1e-9 ? "decreased" : "increased"} by <Tex>{`${fmt(Math.abs(dz))}`}</Tex>).
        Dual simplex DECREASES (or holds) the max-objective each step until primal feasibility is restored.
      </div>
    </div>
  );
}

const algStep = {
  marginTop: 6,
  padding: "8px 10px",
  background: "#fff",
  border: "1px solid #e3e3e3",
  borderRadius: 6,
  fontSize: 13,
};

// ============================================================
// Pivot rules comparison panel
// ============================================================
function PivotRulesPanel() {
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        Primal vs dual simplex — pivot rules side by side
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ ...smTh, padding: "8px 10px" }}></th>
            <th style={{ ...smTh, padding: "8px 10px" }}>Primal simplex</th>
            <th style={{ ...smTh, padding: "8px 10px" }}>Dual simplex</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...smTd, fontWeight: 700, padding: "8px 10px" }}>Maintains</td>
            <td style={{ ...smTd, padding: "8px 10px" }}>
              Primal feasibility: <Tex>{`b_i \\ge 0`}</Tex> for all i
            </td>
            <td style={{ ...smTd, padding: "8px 10px", background: "#fff8e1" }}>
              Dual feasibility: <Tex>{`\\bar z_j \\ge 0`}</Tex> for all j
            </td>
          </tr>
          <tr>
            <td style={{ ...smTd, fontWeight: 700, padding: "8px 10px" }}>Chases</td>
            <td style={{ ...smTd, padding: "8px 10px" }}>
              Dual feasibility: <Tex>{`\\bar z_j \\ge 0`}</Tex>
            </td>
            <td style={{ ...smTd, padding: "8px 10px", background: "#fff8e1" }}>
              Primal feasibility: <Tex>{`b_i \\ge 0`}</Tex>
            </td>
          </tr>
          <tr>
            <td style={{ ...smTd, fontWeight: 700, padding: "8px 10px" }}>Pick first</td>
            <td style={{ ...smTd, padding: "8px 10px" }}>
              ENTERING column: most-negative <Tex>{`\\bar z_j`}</Tex> (Dantzig)
            </td>
            <td style={{ ...smTd, padding: "8px 10px", background: "#fff8e1" }}>
              LEAVING row: most-negative <Tex>{`b_i`}</Tex>
            </td>
          </tr>
          <tr>
            <td style={{ ...smTd, fontWeight: 700, padding: "8px 10px" }}>Pick second</td>
            <td style={{ ...smTd, padding: "8px 10px" }}>
              LEAVING row: <Tex>{`\\arg\\min_{\\,i:\\,a_{ij} > 0\\,} \\frac{b_i}{a_{ij}}`}</Tex>
            </td>
            <td style={{ ...smTd, padding: "8px 10px", background: "#fff8e1" }}>
              ENTERING col: <Tex>{`\\arg\\min_{\\,j:\\,a_{pj} < 0\\,} \\frac{\\bar z_j}{|a_{pj}|}`}</Tex>
            </td>
          </tr>
          <tr>
            <td style={{ ...smTd, fontWeight: 700, padding: "8px 10px" }}>Eligibility (sign of a)</td>
            <td style={{ ...smTd, padding: "8px 10px" }}>
              <Tex>{`a_{ij} > 0`}</Tex> in entering column
            </td>
            <td style={{ ...smTd, padding: "8px 10px", background: "#fff8e1" }}>
              <Tex>{`a_{pj} < 0`}</Tex> in leaving row
            </td>
          </tr>
          <tr>
            <td style={{ ...smTd, fontWeight: 700, padding: "8px 10px" }}>Empty eligible set means</td>
            <td style={{ ...smTd, padding: "8px 10px" }}>
              Primal UNBOUNDED (objective improves without limit)
            </td>
            <td style={{ ...smTd, padding: "8px 10px", background: "#fff8e1" }}>
              Primal INFEASIBLE (no x satisfies all constraints)
            </td>
          </tr>
          <tr>
            <td style={{ ...smTd, fontWeight: 700, padding: "8px 10px" }}>z (max) trajectory</td>
            <td style={{ ...smTd, padding: "8px 10px" }}>
              Increases (or stays, on degeneracy) toward optimum from below
            </td>
            <td style={{ ...smTd, padding: "8px 10px", background: "#fff8e1" }}>
              Decreases toward optimum from above (overestimate shrinks)
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 13, color: "#444", lineHeight: 1.55 }}>
        The duality is structural: dual simplex applied to the primal LP
        is exactly primal simplex applied to the DUAL LP. The same
        tableau works for both — the algorithms just disagree on what
        counts as the rows vs the columns and on which pivot rule
        applies.
      </div>
    </div>
  );
}

// ============================================================
// Pedagogical notes
// ============================================================
function PedagogicalNotes() {
  return (
    <div style={{ marginTop: 20, padding: 16, background: "#fff8e1", borderRadius: 10, border: "1px solid #f5d68d" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        <Terminal size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
        Notes for class
      </div>
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6, fontSize: 14, color: "#3d2f00" }}>
        <li>
          <b>Why dual simplex needs a NEGATIVE pivot.</b> Dividing the
          pivot row by <Tex>{`a_{pq} < 0`}</Tex> flips the sign of its
          RHS — that's literally how the negative <Tex>{`b_p`}</Tex>
          becomes positive. Pivoting on a positive entry would leave RHS
          negative.
        </li>
        <li>
          <b>Why the ratio uses</b> <Tex>{`|a_{pj}|`}</Tex>. After the
          pivot, every other z-row entry becomes{" "}
          <Tex>{`\\bar z_j - (\\bar z_q / a_{pq}) \\, a_{pj}`}</Tex>. For
          this to stay <Tex>{`\\ge 0`}</Tex>, you need
          <Tex>{`\\bar z_j \\ge \\bar z_q \\cdot a_{pj} / a_{pq}`}</Tex>. With{" "}
          <Tex>{`a_{pq} < 0`}</Tex> and <Tex>{`a_{pj} < 0`}</Tex> (eligible),
          this reduces to <Tex>{`\\bar z_q / |a_{pq}| \\le \\bar z_j / |a_{pj}|`}</Tex>{" "}
          — exactly the min-ratio rule.
        </li>
        <li>
          <b>Where it shows up in MIP solvers.</b> Branch-and-bound
          generates a tree of LPs differing only by tightened bounds.
          Each child inherits the parent's optimal basis as a warm
          start. That basis is dual-feasible for the child but usually
          primal-infeasible — one or two dual pivots restore optimality.
          This is 10-100x faster than re-solving from scratch with
          primal simplex.
        </li>
        <li>
          <b>Cutting planes.</b> Same story. Add a Gomory cut to the LP
          relaxation; the cut row goes into the tableau as a new row
          with negative RHS (the cut is violated by the current LP
          optimum). Dual simplex re-optimizes in a few pivots.
        </li>
        <li>
          <b>What if every coef in the leaving row is non-negative?</b>{" "}
          Then no entering column is eligible, the dual ratio test
          fails, and we conclude the PRIMAL is INFEASIBLE. (Symmetric
          to "primal simplex with no positive ratios = primal
          unbounded".) The demo flags this case in the dual ratio
          panel.
        </li>
        <li>
          <b>Z decreases (for max).</b> The dual simplex starts at a
          dual-feasible basis with possibly OVER-OPTIMISTIC objective
          (some basic vars are negative — invalid). Each pivot brings
          the objective DOWN as feasibility is restored. The final z*
          is the true optimum — not the inflated starting estimate.
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
