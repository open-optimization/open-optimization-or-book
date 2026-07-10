import React, { useState, useMemo } from "react";
import { RotateCcw, Download, AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   TWO-PHASE SIMPLEX METHOD
   ISE 5406

   When the LP has =- or >=-constraints, slacks alone don't give
   a starting basic feasible solution. We add ARTIFICIAL variables
   to manufacture an initial identity basis, then run Phase 1 to
   drive the artificials to zero (min sum of artificials). If we
   succeed, we drop the artificials and switch to Phase 2 with the
   original objective; if we can't, the original LP is infeasible.

   Convention used here:
     - Original LPs are written as MIN problems.
     - z-row holds reduced costs c_j - z_j; we pivot on columns
       with NEGATIVE entries in the z-row (improving for min).
     - Optimal when all z-row entries are >= 0.
   ============================================================ */

// ============================================================
// Preset LPs — each example chosen to highlight a Phase-1 issue
// ============================================================
const PRESETS = [
  {
    key: "two_geq",
    name: "Two ≥ constraints (Phase 1 needed)",
    blurb: "min 2x₁ + 3x₂ s.t. x₁ + x₂ ≥ 4, x₁ + 2x₂ ≥ 5. Both constraints are ≥, so surplus alone won't give a starting BFS. Two artificials in Phase 1; both drop out and Phase 2 finds the optimum at (3, 1) with z* = 9.",
    sense: "min",
    c: [2, 3],
    A: [[1, 1], [1, 2]],
    rel: [">=", ">="],
    b: [4, 5],
  },
  {
    key: "mixed_eq_geq",
    name: "Mixed = and ≥ (artificials in both)",
    blurb: "min x₁ + x₂ s.t. x₁ + x₂ = 3, x₁ − x₂ ≥ 0. The =-row gets one artificial; the ≥-row needs surplus AND an artificial. Phase 1 drives both to 0; Phase 2 trivially confirms optimum at (1.5, 1.5), z* = 3.",
    sense: "min",
    c: [1, 1],
    A: [[1, 1], [1, -1]],
    rel: ["=", ">="],
    b: [3, 0],
  },
  {
    key: "infeasible",
    name: "Infeasible LP (Phase 1 ends > 0)",
    blurb: "min x₁ + x₂ s.t. x₁ + x₂ = 4, x₁ + x₂ ≥ 5. The two constraints contradict each other. Phase 1 grinds out as much artificial reduction as possible but stops with sum > 0 → INFEASIBLE.",
    sense: "min",
    c: [1, 1],
    A: [[1, 1], [1, 1]],
    rel: ["=", ">="],
    b: [4, 5],
  },
  {
    key: "transport_like",
    name: "Equality system (transport-style)",
    blurb: "min 3x + 2y + 4z s.t. x + y + z = 6, 2x + y = 5. Two equalities → two artificials. Phase 1 finds a vertex of the equality polytope; Phase 2 walks to the cost optimum.",
    sense: "min",
    c: [3, 2, 4],
    A: [[1, 1, 1], [2, 1, 0]],
    rel: ["=", "="],
    b: [6, 5],
  },
];

// ============================================================
// Standardize LP: for each constraint type, decide whether to
// flip the row (so RHS >= 0) and add slack/surplus/artificial.
//
// Returns:
//   n         — number of original decision vars
//   m         — number of constraints
//   colKinds  — array of length totalCols-1, each entry is one of
//               { kind: "x", idx }, { kind: "slack", row },
//               { kind: "surplus", row }, { kind: "art", row }
//   T         — initial tableau ((m+1) x totalCols), z-row last
//   basis     — array of length m, indices of basic-variable cols
//   artCols   — indices of artificial columns
//   c_phase2  — original cost vector EXTENDED to all columns
//   c_phase1  — Phase-1 cost vector (1 on art cols, 0 elsewhere)
// ============================================================
function buildStandardized(c, A, rel, b, sense) {
  const m = A.length;
  const n = c.length;

  // Normalize: if b_i < 0, multiply row by -1 and flip the relation.
  const A2 = A.map((r) => [...r]);
  const b2 = [...b];
  const rel2 = [...rel];
  for (let i = 0; i < m; i++) {
    if (b2[i] < 0) {
      for (let j = 0; j < n; j++) A2[i][j] = -A2[i][j];
      b2[i] = -b2[i];
      if (rel2[i] === "<=") rel2[i] = ">=";
      else if (rel2[i] === ">=") rel2[i] = "<=";
      // "=" stays "="
    }
  }

  // Determine column structure.
  const colKinds = [];
  for (let j = 0; j < n; j++) colKinds.push({ kind: "x", idx: j });

  // Slack/surplus per row, in row order, then artificials.
  // We assign columns lazily as we walk rows so the tableau is ordered:
  // [x cols | aux cols (slack/surplus interleaved by row) | artificial cols]
  const auxColForRow = []; // maps row -> col idx of slack OR surplus (or null)
  const artColForRow = []; // maps row -> col idx of artificial (or null)

  // First pass: collect aux (slack/surplus) for ≤ and ≥ rows.
  for (let i = 0; i < m; i++) {
    if (rel2[i] === "<=") {
      auxColForRow.push(colKinds.length);
      colKinds.push({ kind: "slack", row: i });
    } else if (rel2[i] === ">=") {
      auxColForRow.push(colKinds.length);
      colKinds.push({ kind: "surplus", row: i });
    } else {
      auxColForRow.push(null);
    }
  }
  // Second pass: artificials for = and ≥.
  for (let i = 0; i < m; i++) {
    if (rel2[i] === "=" || rel2[i] === ">=") {
      artColForRow.push(colKinds.length);
      colKinds.push({ kind: "art", row: i });
    } else {
      artColForRow.push(null);
    }
  }

  const totalCols = colKinds.length + 1; // +1 for RHS
  const T = Array.from({ length: m + 1 }, () => Array(totalCols).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) T[i][j] = A2[i][j];
    if (rel2[i] === "<=") T[i][auxColForRow[i]] = 1; // slack
    else if (rel2[i] === ">=") T[i][auxColForRow[i]] = -1; // surplus
    if (artColForRow[i] !== null) T[i][artColForRow[i]] = 1;
    T[i][totalCols - 1] = b2[i];
  }

  // Initial basis: prefer artificial when it exists (= or >= rows),
  // otherwise the slack (<= rows).
  const basis = [];
  for (let i = 0; i < m; i++) {
    if (artColForRow[i] !== null) basis.push(artColForRow[i]);
    else basis.push(auxColForRow[i]);
  }

  // Cost vectors over all columns (the RHS column has no cost).
  // For sense="max", we negate user's c so the simplex routines below
  // consistently treat the original objective as a MIN.
  const sgn = sense === "max" ? -1 : 1;
  const c_phase2 = Array(totalCols - 1).fill(0);
  for (let j = 0; j < n; j++) c_phase2[j] = sgn * c[j];

  const c_phase1 = Array(totalCols - 1).fill(0);
  const artCols = [];
  for (let i = 0; i < m; i++) {
    if (artColForRow[i] !== null) {
      c_phase1[artColForRow[i]] = 1;
      artCols.push(artColForRow[i]);
    }
  }

  return { n, m, colKinds, T, basis, artCols, c_phase1, c_phase2, A2, b2, rel2 };
}

// ============================================================
// Compute the z-row given a tableau body, basis, and cost vector.
// z-row entry j = c_j - c_B^T (column j of body)
// The z-row REPLACES T[m][:] (the last row).
// ============================================================
function computeZRow(T, basis, cost) {
  const m = T.length - 1;
  const totalCols = T[0].length;
  const z = Array(totalCols).fill(0);
  // Compute c_B
  const cB = basis.map((bIdx) => cost[bIdx] || 0);
  for (let j = 0; j < totalCols - 1; j++) {
    let zj = 0;
    for (let i = 0; i < m; i++) zj += cB[i] * T[i][j];
    z[j] = (cost[j] || 0) - zj;
  }
  // Objective value (we'll display as - sum c_B * b)
  let obj = 0;
  for (let i = 0; i < m; i++) obj += cB[i] * T[i][totalCols - 1];
  z[totalCols - 1] = -obj;
  return z;
}

// Pivot tableau on (row, col)
function pivot(T, row, col) {
  const newT = T.map((r) => [...r]);
  const piv = newT[row][col];
  for (let j = 0; j < newT[0].length; j++) newT[row][j] /= piv;
  for (let i = 0; i < newT.length; i++) {
    if (i === row) continue;
    const factor = newT[i][col];
    if (Math.abs(factor) < 1e-12) continue;
    for (let j = 0; j < newT[0].length; j++) newT[i][j] -= factor * newT[row][j];
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
    if (a > 1e-9) ratios.push({ row: i, ratio: r / a, ok: true });
    else ratios.push({ row: i, ratio: Infinity, ok: false });
  }
  let minRow = -1, minRatio = Infinity;
  ratios.forEach((r) => {
    if (r.ok && r.ratio < minRatio - 1e-9) {
      minRatio = r.ratio;
      minRow = r.row;
    }
  });
  return { ratios, minRow };
}

// For a MIN problem with z-row = c_j - z_j, optimal iff every entry >= 0.
// "lockedCols" are columns NOT eligible to enter (used in Phase 2 to
// keep the dropped artificials out forever).
function findEnteringCol(zRow, totalDataCols, lockedCols) {
  let bestJ = -1, bestVal = -1e-9;
  for (let j = 0; j < totalDataCols; j++) {
    if (lockedCols.has(j)) continue;
    if (zRow[j] < bestVal) {
      bestVal = zRow[j];
      bestJ = j;
    }
  }
  return bestJ;
}

function isOptimal(zRow, totalDataCols, lockedCols) {
  for (let j = 0; j < totalDataCols; j++) {
    if (lockedCols.has(j)) continue;
    if (zRow[j] < -1e-9) return false;
  }
  return true;
}

// ============================================================
// Pretty labels
// ============================================================
function labelFor(colKinds, idx) {
  const k = colKinds[idx];
  if (!k) return "?";
  if (k.kind === "x") return `x${k.idx + 1}`;
  if (k.kind === "slack") return `s${k.row + 1}`;
  if (k.kind === "surplus") return `e${k.row + 1}`;
  if (k.kind === "art") return `a${k.row + 1}`;
  return "?";
}

function fmt(v) {
  if (v === undefined || v === null || Number.isNaN(v)) return "—";
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(3);
}

// ============================================================
// Main component
// ============================================================
export default function TwoPhaseSimplexDemo() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const preset = useMemo(() => PRESETS.find((p) => p.key === presetKey), [presetKey]);

  // Editable problem state (initialized from preset)
  const [c, setC] = useState(preset.c);
  const [A, setA] = useState(preset.A);
  const [rel, setRel] = useState(preset.rel);
  const [b, setB] = useState(preset.b);
  const [sense] = useState(preset.sense); // sense fixed to "min" for these examples

  // Standardized form (re-built whenever LP changes)
  const std = useMemo(
    () => buildStandardized(c, A, rel, b, sense),
    [c, A, rel, b, sense]
  );

  // Initial Phase-1 tableau: z-row from c_phase1
  const initialPhase1 = useMemo(() => {
    const z = computeZRow(std.T, std.basis, std.c_phase1);
    const T0 = std.T.map((r) => [...r]);
    T0[std.m] = z;
    return { T: T0, basis: [...std.basis] };
  }, [std]);

  // Phase tracking: 1 = Phase 1 in progress, "phase2" = in Phase 2,
  // "infeasible" = phase 1 ended > 0, "done" = Phase 2 optimal
  const [phase, setPhase] = useState(1);
  const [history, setHistory] = useState([initialPhase1]);
  const [stepIdx, setStepIdx] = useState(0);
  const [pivotLog, setPivotLog] = useState([]);
  const [hoverCol, setHoverCol] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [phase2Started, setPhase2Started] = useState(false);

  const cur = history[stepIdx];
  const T = cur.T;
  const basis = cur.basis;

  // Locked columns: in Phase 2, ALL artificial columns get locked
  // out so the algorithm can never bring an artificial back in.
  const lockedCols = useMemo(() => {
    const s = new Set();
    if (phase === "phase2" || phase === "done") {
      for (const a of std.artCols) s.add(a);
    }
    return s;
  }, [phase, std.artCols]);

  const totalDataCols = std.colKinds.length;
  const zRow = T[std.m];

  function loadPreset(key) {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    setPresetKey(key);
    setC([...p.c]);
    setA(p.A.map((r) => [...r]));
    setRel([...p.rel]);
    setB([...p.b]);
  }

  // Reset state whenever standardized LP changes
  React.useEffect(() => {
    setHistory([initialPhase1]);
    setStepIdx(0);
    setPivotLog([]);
    setHoverCol(null);
    setFeedback(null);
    setPhase(std.artCols.length > 0 ? 1 : "phase2");
    setPhase2Started(std.artCols.length === 0);
    // If no artificials needed, skip directly to Phase 2 by computing
    // the z-row from the ORIGINAL cost vector.
    if (std.artCols.length === 0) {
      const z2 = computeZRow(std.T, std.basis, std.c_phase2);
      const T2 = std.T.map((r) => [...r]);
      T2[std.m] = z2;
      setHistory([{ T: T2, basis: [...std.basis] }]);
    }
  }, [initialPhase1, std]);

  // Sum of artificials in the current basis (= phase-1 objective value)
  const artSum = useMemo(() => {
    if (std.artCols.length === 0) return 0;
    const totalCols = T[0].length;
    let s = 0;
    for (let i = 0; i < std.m; i++) {
      if (std.artCols.includes(basis[i])) s += T[i][totalCols - 1];
    }
    return s;
  }, [T, basis, std]);

  // Suggested entering column (most-negative z-row entry, respecting locks)
  const suggestedCol = useMemo(
    () => findEnteringCol(zRow, totalDataCols, lockedCols),
    [zRow, totalDataCols, lockedCols]
  );
  const suggestedRow = useMemo(() => {
    if (suggestedCol < 0) return -1;
    return ratioTest(T, std.m, suggestedCol).minRow;
  }, [T, std.m, suggestedCol]);

  const optimal = isOptimal(zRow, totalDataCols, lockedCols);

  // Phase-1 status flags (only meaningful while phase === 1)
  const phase1Feasible = phase === 1 && optimal && Math.abs(artSum) < 1e-7;
  const phase1Infeasible = phase === 1 && optimal && Math.abs(artSum) > 1e-7;

  function doPivot(row, col) {
    const newT = pivot(T, row, col);
    const newBasis = [...basis];
    const leaving = newBasis[row];
    newBasis[row] = col;
    const newHistory = history.slice(0, stepIdx + 1);
    newHistory.push({ T: newT, basis: newBasis });
    setHistory(newHistory);
    setStepIdx(newHistory.length - 1);
    const newLog = pivotLog.slice(0, stepIdx);
    newLog.push({
      phase,
      row,
      col,
      entering: labelFor(std.colKinds, col),
      leaving: labelFor(std.colKinds, leaving),
    });
    setPivotLog(newLog);
    setHoverCol(null);
    setFeedback(null);
  }

  function handleColumnClick(j) {
    if (j >= totalDataCols) return;
    if (lockedCols.has(j)) {
      setFeedback({
        ok: false,
        severity: "warn",
        msg: `${labelFor(std.colKinds, j)} is an artificial variable that has been LOCKED OUT for Phase 2 — re-entering it would re-introduce infeasibility into the original LP.`,
      });
      return;
    }
    if (zRow[j] >= -1e-9) {
      setFeedback({
        ok: false,
        severity: "warn",
        msg: `Column ${labelFor(std.colKinds, j)} has reduced cost ${zRow[j].toFixed(3)} ≥ 0 — entering it cannot improve the (min) objective. Pick a column whose z-row entry is negative (red).`,
      });
      return;
    }
    setHoverCol(j);
    setFeedback(null);
  }

  function handleRowClick(i) {
    if (hoverCol === null) return;
    const { minRow } = ratioTest(T, std.m, hoverCol);
    if (T[i][hoverCol] <= 1e-9) {
      setFeedback({
        ok: false,
        severity: "error",
        msg: `INVALID PIVOT: aᵢⱼ = ${T[i][hoverCol].toFixed(3)} ≤ 0. Only rows with positive entries in the entering column are eligible (yellow).`,
      });
      return;
    }
    if (minRow < 0) {
      setFeedback({
        ok: false,
        severity: "error",
        msg: `UNBOUNDED: no row has a positive entry in column ${labelFor(std.colKinds, hoverCol)}.`,
      });
      return;
    }
    if (i !== minRow) {
      setFeedback({
        ok: false,
        severity: "error",
        msg: `Min-ratio test selects row ${minRow + 1} (the green one). Pivoting elsewhere would force a basic variable negative.`,
      });
      return;
    }
    doPivot(i, hoverCol);
  }

  function switchToPhase2() {
    // Recompute the z-row using the ORIGINAL cost (extended over all cols).
    // Artificials get locked via the lockedCols memo.
    const newT = T.map((r) => [...r]);
    newT[std.m] = computeZRow(newT, basis, std.c_phase2);
    const newHistory = [...history.slice(0, stepIdx + 1), { T: newT, basis: [...basis] }];
    setHistory(newHistory);
    setStepIdx(newHistory.length - 1);
    const newLog = pivotLog.slice(0, stepIdx);
    newLog.push({ phase: "transition", row: -1, col: -1, entering: "—", leaving: "—" });
    setPivotLog(newLog);
    setPhase("phase2");
    setPhase2Started(true);
    setHoverCol(null);
    setFeedback(null);
  }

  function reset() {
    setHistory([initialPhase1]);
    setStepIdx(0);
    setPivotLog([]);
    setHoverCol(null);
    setFeedback(null);
    setPhase(std.artCols.length > 0 ? 1 : "phase2");
    setPhase2Started(std.artCols.length === 0);
    if (std.artCols.length === 0) {
      const z2 = computeZRow(std.T, std.basis, std.c_phase2);
      const T2 = std.T.map((r) => [...r]);
      T2[std.m] = z2;
      setHistory([{ T: T2, basis: [...std.basis] }]);
    }
  }

  // When Phase 2 reaches optimality, mark "done"
  React.useEffect(() => {
    if (phase === "phase2" && optimal) setPhase("done");
  }, [phase, optimal]);

  function downloadReport() {
    const md = buildReport({
      c, A, rel, b, sense,
      std, history, pivotLog, phase,
    });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `two_phase_${presetKey}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Two-Phase Simplex Method
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        When an LP has ≥- or =-constraints, slacks alone don't supply a
        starting basic feasible solution. The fix: add an artificial
        variable per problem row, run Phase 1 (minimize the sum of
        artificials), and use the resulting basis to start Phase 2 with
        the original objective. If Phase 1 can't drive the artificials
        to zero, the LP is infeasible.
      </p>

      <WhyTwoPhasesPanel />

      <PresetPicker presetKey={presetKey} loadPreset={loadPreset} />

      <ProblemEditor
        c={c} A={A} rel={rel} b={b}
        setC={setC} setA={setA} setRel={setRel} setB={setB}
      />

      <StandardFormPanel std={std} c={c} sense={sense} />

      <div style={{ marginBottom: 12, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={reset} style={btn}>
          <RotateCcw size={14} /> Reset
        </button>
        <button
          onClick={() => { setStepIdx(Math.max(0, stepIdx - 1)); setFeedback(null); }}
          disabled={stepIdx === 0}
          style={btn}
        >
          ← Undo step
        </button>
        <button onClick={downloadReport} style={btn} title="Download a Markdown record of every tableau">
          <Download size={14} /> Save work
        </button>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>
          step {stepIdx} / {history.length - 1}
        </span>
      </div>

      <PhaseBanner
        phase={phase}
        artSum={artSum}
        phase1Feasible={phase1Feasible}
        phase1Infeasible={phase1Infeasible}
        onSwitch={switchToPhase2}
        hasArtificials={std.artCols.length > 0}
        phase2Started={phase2Started}
      />

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
          gridTemplateColumns: "minmax(560px, 1.4fr) minmax(360px, 1fr)",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        <div>
          <Tableau
            T={T}
            basis={basis}
            std={std}
            phase={phase}
            hoverCol={hoverCol}
            lockedCols={lockedCols}
            onColumnClick={handleColumnClick}
            onRowClick={handleRowClick}
            optimal={optimal}
            suggestedCol={suggestedCol}
            suggestedRow={suggestedRow}
            phase1Infeasible={phase1Infeasible}
          />
        </div>
        <div>
          <BasisPanel
            T={T}
            basis={basis}
            std={std}
            phase={phase}
            artSum={artSum}
            c_phase2={std.c_phase2}
            sense={sense}
          />
          <PivotLogPanel pivotLog={pivotLog.slice(0, stepIdx)} />
        </div>
      </div>

      <PhasePlaybook />
    </div>
  );
}

// ============================================================
// Why two phases? — short narrative banner
// ============================================================
function WhyTwoPhasesPanel() {
  return (
    <div style={{ background: "#fff8e1", border: "1px solid #f5d68d", borderRadius: 8, padding: 14, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Why two phases?</div>
      <div style={{ fontSize: 13.5, color: "#3d2f00", lineHeight: 1.55 }}>
        Standard simplex starts at the all-zero vertex
        <Tex>{` x = 0`}</Tex>, which is feasible whenever every
        constraint is <Tex>{`\\leq`}</Tex> with non-negative RHS — the
        slacks <Tex>{`s_i`}</Tex> form an identity submatrix and become
        the starting basis. With <Tex>{`\\geq`}</Tex> or <Tex>{`=`}</Tex>
        constraints the origin is usually infeasible, and there's no
        obvious starting BFS to begin pivoting from.
        <br /><br />
        <b>Trick.</b> Add an <i>artificial</i> variable
        <Tex>{`a_i \\geq 0`}</Tex> to every <Tex>{`\\geq`}</Tex>- and
        <Tex>{`=`}</Tex>-row. Now the artificials form an identity basis
        and we have a starting BFS — albeit one that doesn't satisfy the
        original LP (the <Tex>{`a_i`}</Tex> are nonzero). Run
        <b> Phase 1</b>: minimize <Tex>{`\\sum_i a_i`}</Tex>. If the
        Phase-1 optimum is 0, every artificial has been driven out and
        we have a starting BFS for the original LP — switch to
        <b> Phase 2</b> with the real objective. If Phase 1 stops with
        sum &gt; 0, the original LP is <b>infeasible</b>.
      </div>
    </div>
  );
}

// ============================================================
// Preset picker
// ============================================================
function PresetPicker({ presetKey, loadPreset }) {
  const p = PRESETS.find((x) => x.key === presetKey);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>
        examples — click one to load
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PRESETS.map((q) => (
          <button
            key={q.key}
            onClick={() => loadPreset(q.key)}
            style={{
              padding: "8px 14px",
              border: presetKey === q.key ? "1px solid #1f4e3d" : "1px solid #ccc",
              borderRadius: 6,
              background: presetKey === q.key ? "#1f4e3d" : "#fff",
              color: presetKey === q.key ? "#fff" : "#222",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {q.name}
          </button>
        ))}
      </div>
      {p && (
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, padding: "8px 12px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 6, marginTop: 6 }}>
          {p.blurb}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LP problem editor — supports ≤, =, ≥
// ============================================================
function ProblemEditor({ c, A, rel, b, setC, setA, setRel, setB }) {
  function setCi(i, v) { const c2 = [...c]; c2[i] = v; setC(c2); }
  function setAij(i, j, v) { const A2 = A.map((r) => [...r]); A2[i][j] = v; setA(A2); }
  function setBi(i, v) { const b2 = [...b]; b2[i] = v; setB(b2); }
  function setReli(i, v) { const r2 = [...rel]; r2[i] = v; setRel(r2); }
  function addVar() { setC([...c, 0]); setA(A.map((r) => [...r, 0])); }
  function removeVar() { if (c.length <= 1) return; setC(c.slice(0, -1)); setA(A.map((r) => r.slice(0, -1))); }
  function addCons() { setA([...A, Array(c.length).fill(0)]); setRel([...rel, "<="]); setB([...b, 0]); }
  function removeCons() { if (A.length <= 1) return; setA(A.slice(0, -1)); setRel(rel.slice(0, -1)); setB(b.slice(0, -1)); }
  const n = c.length;
  return (
    <div style={{ background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 8, padding: 14, marginBottom: 14 }}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
        Edit the LP — min cᵀx, x ≥ 0 (constraint type per row)
      </div>
      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
        <thead>
          <tr>
            <td></td>
            {Array.from({ length: n }, (_, j) => (
              <th key={j} style={{ padding: "4px 6px", fontSize: 12, color: "#666" }}>x<sub>{j + 1}</sub></th>
            ))}
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "4px 8px", fontWeight: 700, color: "#555" }}>c</td>
            {c.map((v, j) => (<td key={j}><NumIn value={v} onChange={(x) => setCi(j, x)} /></td>))}
            <td colSpan={2} style={{ paddingLeft: 10, color: "#888", fontSize: 12 }}>(objective coefficients)</td>
          </tr>
          {A.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: "4px 8px", fontWeight: 700, color: "#555" }}>R<sub>{i + 1}</sub></td>
              {row.map((v, j) => (<td key={j}><NumIn value={v} onChange={(x) => setAij(i, j, x)} /></td>))}
              <td style={{ textAlign: "center", padding: "0 4px" }}>
                <select
                  value={rel[i]}
                  onChange={(e) => setReli(i, e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: 13, padding: "3px 4px" }}
                >
                  <option value="<=">≤</option>
                  <option value="=">=</option>
                  <option value=">=">≥</option>
                </select>
              </td>
              <td><NumIn value={b[i]} onChange={(x) => setBi(i, x)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={addVar} style={btnSmall}>+ variable</button>
        <button onClick={removeVar} style={btnSmall}>− variable</button>
        <button onClick={addCons} style={btnSmall}>+ constraint</button>
        <button onClick={removeCons} style={btnSmall}>− constraint</button>
      </div>
    </div>
  );
}

function NumIn({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      step="any"
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{
        width: 60, padding: "4px 6px", border: "1px solid #ccc", borderRadius: 4,
        fontFamily: "monospace", fontSize: 13, textAlign: "right",
      }}
    />
  );
}

// ============================================================
// Standard form display — shows the LP after slack/surplus/art
// ============================================================
function StandardFormPanel({ std, c, sense }) {
  const { n, m, colKinds, A2, rel2, b2, artCols } = std;

  // Build TeX for the original LP and the standardized form.
  const orig = (() => {
    const obj = c.map((v, j) => `${j === 0 ? (v < 0 ? "-" : "") : (v < 0 ? "-" : "+")}${Math.abs(v)}\\, x_${j + 1}`).join("");
    const rows = std.A2.map((row, i) => {
      const lhs = row.map((v, j) => `${j === 0 ? (v < 0 ? "-" : "") : (v < 0 ? "-" : "+")}${Math.abs(v)}\\, x_${j + 1}`).join("");
      const op = rel2[i] === "<=" ? "\\leq" : rel2[i] === ">=" ? "\\geq" : "=";
      return `& ${lhs} \\;${op}\\; ${b2[i]} \\\\`;
    }).join("");
    return `\\begin{aligned}\\${sense === "max" ? "max" : "min"}\\;\\; & ${obj} \\\\ \\text{s.t.}\\;\\; ${rows} & x_j \\;\\geq\\; 0 \\end{aligned}`;
  })();

  // Standardized rows: each row gets its slack/surplus/artificial appended.
  const stdRows = (() => {
    return A2.map((row, i) => {
      const xs = row.map((v, j) => `${j === 0 ? (v < 0 ? "-" : "") : (v < 0 ? "-" : "+")}${Math.abs(v)}\\, x_${j + 1}`).join("");
      let extras = "";
      if (rel2[i] === "<=") extras += ` + s_${i + 1}`;
      if (rel2[i] === ">=") extras += ` - e_${i + 1}`;
      if (rel2[i] === "=" || rel2[i] === ">=") extras += ` + a_${i + 1}`;
      return `& ${xs}${extras} \\;=\\; ${b2[i]} \\\\`;
    }).join("");
  })();

  return (
    <div style={{ marginBottom: 16, padding: 14, background: "#fafafa", border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        From LP to standardized auxiliary problem
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#888", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>1. Original LP</div>
          <Tex block>{orig}</Tex>
        </div>
        <div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#888", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>2. Standardized — slack (s), surplus (e), artificial (a)</div>
          <Tex block>{`\\begin{aligned} ${stdRows} & \\text{all vars} \\geq 0 \\end{aligned}`}</Tex>
          <div style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.5 }}>
            <b>≤</b>: add slack <Tex>{`s_i`}</Tex>. <b>≥</b>: subtract surplus <Tex>{`e_i`}</Tex>, <i>and</i> add artificial <Tex>{`a_i`}</Tex> (the surplus alone wouldn't be basic at <Tex>{`x=0`}</Tex>). <b>=</b>: just add artificial <Tex>{`a_i`}</Tex>.
            {artCols.length > 0
              ? <> Initial basis: the {artCols.length} artificial{artCols.length === 1 ? "" : "s"}{artCols.length < m ? <> plus the slack{artCols.length === m - 1 ? "" : "s"} from any ≤-rows</> : ""}.</>
              : <> No artificials needed — the slacks form a starting basis directly. (Phase 1 is skipped.)</>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Phase banner — explains current stage + offers Phase 2 switch
// ============================================================
function PhaseBanner({ phase, artSum, phase1Feasible, phase1Infeasible, onSwitch, hasArtificials, phase2Started }) {
  if (phase === 1 && !phase1Feasible && !phase1Infeasible) {
    return (
      <div style={{ ...phaseBoxBase, background: "#e8eef5", borderColor: "#0b3da0", color: "#0b3da0" }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          PHASE 1 — minimize the sum of artificials
        </div>
        <div style={{ fontSize: 13, marginTop: 4, color: "#333" }}>
          Pivot on the (Phase-1) tableau as usual. The phase-1 objective is
          <Tex>{`\\;w = \\sum_i a_i`}</Tex>; right now
          <Tex>{`\\;w = ${artSum.toFixed(3)}`}</Tex>. Drive it to zero to reach a feasible BFS for the original LP.
        </div>
      </div>
    );
  }
  if (phase1Feasible) {
    return (
      <div style={{ ...phaseBoxBase, background: "#e8f5e9", borderColor: "#1f4e3d", color: "#1f4e3d" }}>
        <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={18} /> PHASE 1 COMPLETE — original LP is FEASIBLE.
        </div>
        <div style={{ fontSize: 13, marginTop: 4, color: "#222" }}>
          Sum of artificials hit zero: every <Tex>{`a_i`}</Tex> has been
          driven out of the basis (or sits at value 0). The current basis
          is a valid starting BFS for the original problem. Switch to
          Phase 2 — the artificials get locked out, the z-row is
          recomputed from the original cost, and we keep pivoting.
        </div>
        <button onClick={onSwitch} style={{ ...btn, marginTop: 8, background: "#1f4e3d", color: "#fff", borderColor: "#1f4e3d" }}>
          <ArrowRight size={14} /> Switch to Phase 2
        </button>
      </div>
    );
  }
  if (phase1Infeasible) {
    return (
      <div style={{ ...phaseBoxBase, background: "#fde8e8", borderColor: "#c8311c", color: "#c8311c" }}>
        <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <XCircle size={18} /> INFEASIBLE — original LP has no feasible solution.
        </div>
        <div style={{ fontSize: 13, marginTop: 4, color: "#333" }}>
          Phase 1 is optimal but the artificial sum is{" "}
          <Tex>{`w^* = ${artSum.toFixed(3)} > 0`}</Tex>. There is no way
          to satisfy all constraints simultaneously: the artificials
          <i> have</i> to be positive. STOP — there is no Phase 2.
        </div>
      </div>
    );
  }
  if (phase === "phase2" || phase === "done") {
    return (
      <div style={{ ...phaseBoxBase, background: "#fff8e1", borderColor: "#f5a524", color: "#7a4400" }}>
        <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          {phase === "done" ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
          {phase === "done" ? " PHASE 2 OPTIMAL" : " PHASE 2 — original objective"}
        </div>
        <div style={{ fontSize: 13, marginTop: 4, color: "#333" }}>
          {hasArtificials
            ? phase2Started
              ? <>Phase 2 in progress. The z-row has been recomputed from the original cost vector; artificial columns are <b>locked out</b> (greyed). Keep pivoting on negative z-row entries until optimal.</>
              : <>No artificials were needed — Phase 1 was skipped and we're starting Phase 2 directly from the slack basis.</>
            : <>The slacks alone form a starting BFS — no Phase 1 was needed.</>
          }
          {phase === "done" && <> {" "}<b>Done.</b> All z-row entries are non-negative; the original LP is solved.</>}
        </div>
      </div>
    );
  }
  return null;
}
const phaseBoxBase = {
  marginBottom: 12, padding: "10px 14px", borderRadius: 6, border: "2px solid",
};

// ============================================================
// Tableau view
// ============================================================
function Tableau({ T, basis, std, phase, hoverCol, lockedCols, onColumnClick, onRowClick, optimal, suggestedCol, suggestedRow, phase1Infeasible }) {
  const { n, m, colKinds, artCols } = std;
  const totalDataCols = colKinds.length;
  const totalCols = T[0].length;
  const zRow = T[m];

  let ratioInfo = null;
  if (hoverCol !== null && hoverCol >= 0 && hoverCol < totalDataCols) {
    ratioInfo = ratioTest(T, m, hoverCol);
  }

  const phaseText =
    phase === 1 ? `Phase 1 tableau — minimize ∑ aᵢ ${optimal ? "(optimal)" : ""}`
    : phase === "phase2" ? `Phase 2 tableau ${optimal ? "(optimal)" : ""}`
    : phase === "done" ? "Phase 2 tableau (optimal)"
    : "Tableau";

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        {phaseText}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13, width: "100%" }}>
          <thead>
            <tr>
              <th style={thLeft}>basis</th>
              {Array.from({ length: totalDataCols }, (_, j) => {
                const isHover = j === hoverCol;
                const isSuggest = j === suggestedCol;
                const isLocked = lockedCols.has(j);
                const isArt = artCols.includes(j);
                const negative = zRow[j] < -1e-9 && !isLocked;
                let bg = "#fff";
                if (isLocked) bg = "#eee";
                else if (isHover) bg = "#f5a524";
                else if (isSuggest) bg = "#fff4c8";
                else if (negative) bg = "#fde0d8";
                else if (isArt) bg = "#f4eef6";
                return (
                  <th
                    key={j}
                    onClick={() => onColumnClick(j)}
                    style={{
                      ...th,
                      cursor: negative ? "pointer" : "default",
                      background: bg,
                      color: isHover ? "#1f1d1a" : isLocked ? "#999" : "#222",
                      textDecoration: isLocked ? "line-through" : "none",
                    }}
                  >
                    {labelFor(colKinds, j)}
                  </th>
                );
              })}
              <th style={th}>RHS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: phase1Infeasible ? "#fde8e8" : "#fff8e1" }}>
              <td style={{ ...tdLabel, borderBottom: "2px solid #444" }}>
                {phase === 1 ? "w" : "z"}
              </td>
              {Array.from({ length: totalDataCols }, (_, j) => {
                const isLocked = lockedCols.has(j);
                return (
                  <td
                    key={j}
                    style={{
                      ...td,
                      borderBottom: "2px solid #444",
                      color: isLocked ? "#aaa" : zRow[j] < -1e-9 ? "#c8311c" : "#222",
                      fontWeight: zRow[j] < -1e-9 && !isLocked ? 700 : 400,
                      textDecoration: isLocked ? "line-through" : "none",
                    }}
                  >
                    {fmt(zRow[j])}
                  </td>
                );
              })}
              <td style={{ ...td, borderBottom: "2px solid #444", fontWeight: 700 }}>
                {fmt(-zRow[totalCols - 1])}
              </td>
            </tr>
            {Array.from({ length: m }, (_, i) => {
              const r = ratioInfo?.ratios[i];
              const eligible = r && r.ok;
              const isMinRatio = r && eligible && i === ratioInfo.minRow;
              const rowBg = isMinRatio ? "#e8f5e9" : eligible ? "#fff8e1" : "transparent";
              const isArtRow = artCols.includes(basis[i]);
              return (
                <tr
                  key={i}
                  onClick={() => onRowClick(i)}
                  style={{
                    background: rowBg,
                    cursor: hoverCol !== null ? "pointer" : "default",
                  }}
                >
                  <td style={{
                    ...tdLabel,
                    color: isArtRow ? "#7a3da0" : "#555",
                    fontWeight: isArtRow ? 700 : 700,
                  }}>
                    {labelFor(colKinds, basis[i])}
                  </td>
                  {Array.from({ length: totalDataCols }, (_, j) => {
                    const v = T[i][j];
                    const isPivot = j === hoverCol && eligible;
                    const isLocked = lockedCols.has(j);
                    return (
                      <td
                        key={j}
                        style={{
                          ...td,
                          background: isPivot ? "#f5a524" : isMinRatio && j === hoverCol ? "#7dd87d" : "transparent",
                          color: isPivot ? "#1f1d1a" : isLocked ? "#aaa" : "#222",
                          fontWeight: j === hoverCol && eligible ? 700 : 400,
                        }}
                      >
                        {fmt(v)}
                      </td>
                    );
                  })}
                  <td style={{ ...td, fontWeight: 700 }}>{fmt(T[i][totalCols - 1])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#555", lineHeight: 1.5 }}>
        Click any column with a <span style={{ color: "#c8311c", fontWeight: 700 }}>negative</span>{" "}
        z/w-row entry to make it the entering variable. The min-ratio
        test highlights the eligible leaving rows in yellow; the green
        row is the one Bland/Dantzig would pick. Click that row to
        pivot. Artificial columns are{" "}
        <span style={{ background: "#f4eef6", padding: "1px 4px", borderRadius: 3 }}>tinted</span>;
        once locked out (Phase 2) they go grey.
      </div>
    </div>
  );
}

const th = {
  padding: "6px 8px", border: "1px solid #ccc", background: "#f0f0f0", fontWeight: 700,
};
const thLeft = { ...th, textAlign: "left" };
const td = {
  padding: "5px 8px", border: "1px solid #ddd", textAlign: "right",
};
const tdLabel = { ...td, textAlign: "left", fontWeight: 700, color: "#555" };

// ============================================================
// Basis / current-solution panel
// ============================================================
function BasisPanel({ T, basis, std, phase, artSum, c_phase2, sense }) {
  const { n, m, colKinds } = std;
  const totalCols = T[0].length;
  const x = Array(colKinds.length).fill(0);
  for (let i = 0; i < m; i++) x[basis[i]] = T[i][totalCols - 1];

  // Original-objective value, computed honestly from x and the ORIGINAL c.
  let zOrig = 0;
  for (let j = 0; j < colKinds.length; j++) zOrig += (c_phase2[j] || 0) * x[j];
  // If the user originally said "max", c_phase2 has the negation;
  // display in the user's sense.
  const zDisplay = sense === "max" ? -zOrig : zOrig;

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Current basic feasible solution
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}>
        <tbody>
          {colKinds.map((k, j) => {
            const lab = labelFor(colKinds, j);
            const isArt = k.kind === "art";
            const val = x[j];
            const isBasic = basis.includes(j);
            return (
              <tr key={j} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "2px 6px", color: isArt ? "#7a3da0" : "#555" }}>
                  {lab}
                </td>
                <td style={{
                  padding: "2px 6px", textAlign: "right",
                  color: val > 1e-9 ? (isArt ? "#c8311c" : "#0b3da0") : "#888",
                  fontWeight: val > 1e-9 ? 700 : 400,
                }}>
                  {fmt(val)}
                </td>
                <td style={{ padding: "2px 6px", color: "#777", fontStyle: "italic", fontSize: 12 }}>
                  {isBasic ? "(basic)" : "(non-basic)"}
                  {isArt && val > 1e-9 && " — artificial!"}
                </td>
              </tr>
            );
          })}
          <tr style={{ borderTop: "2px solid #444" }}>
            <td style={{ padding: "4px 6px", fontWeight: 700 }}>
              {phase === 1 ? "w (sum of art)" : "z (orig obj)"}
            </td>
            <td style={{
              padding: "4px 6px", textAlign: "right", fontWeight: 700,
              color: phase === 1 ? (artSum > 1e-7 ? "#c8311c" : "#1f4e3d") : "#c8311c",
            }}>
              {fmt(phase === 1 ? artSum : zDisplay)}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Pivot log
// ============================================================
function PivotLogPanel({ pivotLog }) {
  if (pivotLog.length === 0) {
    return (
      <div style={{ ...panel, marginTop: 12, color: "#888", fontStyle: "italic", fontSize: 13 }}>
        No pivots yet. Click an entering column, then a leaving row.
      </div>
    );
  }
  return (
    <div style={{ ...panel, marginTop: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        pivot history
      </div>
      <ol style={{ margin: 0, paddingLeft: 22, fontSize: 13, lineHeight: 1.6 }}>
        {pivotLog.map((p, i) => {
          if (p.phase === "transition") {
            return (
              <li key={i} style={{ color: "#7a4400", fontStyle: "italic" }}>
                — switched to Phase 2 (z-row recomputed; artificials locked) —
              </li>
            );
          }
          return (
            <li key={i}>
              <span style={{
                fontFamily: "monospace", fontSize: 11,
                background: p.phase === 1 ? "#e8eef5" : "#fff8e1",
                color: p.phase === 1 ? "#0b3da0" : "#7a4400",
                padding: "1px 5px", borderRadius: 3, marginRight: 6,
              }}>
                {p.phase === 1 ? "P1" : "P2"}
              </span>
              <b>{p.entering}</b> enters, <b>{p.leaving}</b> leaves (row {p.row + 1})
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ============================================================
// Phase playbook — algorithm reference card
// ============================================================
function PhasePlaybook() {
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        The two-phase algorithm — playbook
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, fontSize: 13, lineHeight: 1.6 }}>
        <div>
          <b style={{ color: "#0b3da0" }}>Phase 1 — find a feasible BFS</b>
          <ol style={{ paddingLeft: 22, margin: "4px 0" }}>
            <li>Multiply each row by −1 if its RHS is negative (so all <Tex>{`b_i \\geq 0`}</Tex>).</li>
            <li>Add slack <Tex>{`s_i`}</Tex> to every ≤-row, surplus <Tex>{`-e_i`}</Tex> to every ≥-row.</li>
            <li>Add artificial <Tex>{`a_i`}</Tex> to every = and ≥ row. Initial basis: artificials (and slacks where present).</li>
            <li>Set Phase-1 cost <Tex>{`w = \\sum_i a_i`}</Tex>. Compute z-row by reducing the artificial-row coefficients to zero.</li>
            <li>Run simplex on this auxiliary tableau until optimal.</li>
            <li>If <Tex>{`w^* = 0`}</Tex>: original LP feasible — go to Phase 2. If <Tex>{`w^* > 0`}</Tex>: infeasible, STOP.</li>
          </ol>
        </div>
        <div>
          <b style={{ color: "#7a4400" }}>Phase 2 — solve the original</b>
          <ol style={{ paddingLeft: 22, margin: "4px 0" }}>
            <li>Drop the artificial columns (or lock them out).</li>
            <li>Restore the original cost vector <Tex>{`c`}</Tex>.</li>
            <li>Recompute the z-row: <Tex>{`\\bar c_j = c_j - c_B^T B^{-1} A_j`}</Tex>.</li>
            <li>Run simplex from the current basis until optimal.</li>
          </ol>
          <div style={{ marginTop: 8, padding: 8, background: "#fafafa", borderRadius: 6, fontSize: 12.5 }}>
            <b>Edge case.</b> If an artificial is still in the basis at value 0 when Phase 1 ends (degenerate), it's harmless — just keep it in until a real variable can pivot it out, or perform a degenerate pivot to swap it for a non-artificial column. The locking mechanism above handles the simple case where every artificial has already left.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Markdown report builder
// ============================================================
function buildReport({ c, A, rel, b, sense, std, history, pivotLog, phase }) {
  const lines = [];
  lines.push(`# Two-Phase Simplex — Worked Solution`);
  lines.push("");
  lines.push(`## Original LP (${sense})`);
  lines.push("");
  lines.push("```");
  lines.push(`${sense}  ${c.map((v, j) => `${j === 0 ? "" : v < 0 ? " - " : " + "}${j === 0 && v < 0 ? "-" : ""}${Math.abs(v)} x_${j + 1}`).join("")}`);
  lines.push(`s.t.`);
  A.forEach((row, i) => {
    const lhs = row.map((v, j) => `${j === 0 ? "" : v < 0 ? " - " : " + "}${j === 0 && v < 0 ? "-" : ""}${Math.abs(v)} x_${j + 1}`).join("");
    const op = rel[i];
    lines.push(`     ${lhs}  ${op}  ${b[i]}`);
  });
  lines.push(`     x >= 0`);
  lines.push("```");
  lines.push("");

  // Tableau dump for each step
  history.forEach((step, i) => {
    const phaseTag = i === 0 ? "initial" : pivotLog[i - 1]?.phase === 1 ? "Phase 1" : pivotLog[i - 1]?.phase === "transition" ? "Phase 2 setup" : "Phase 2";
    lines.push(`## Step ${i} — ${phaseTag}`);
    lines.push("");
    if (i > 0 && pivotLog[i - 1] && pivotLog[i - 1].phase !== "transition") {
      const p = pivotLog[i - 1];
      lines.push(`Pivot: ${p.entering} enters, ${p.leaving} leaves (row ${p.row + 1}).`);
      lines.push("");
    } else if (i > 0 && pivotLog[i - 1]?.phase === "transition") {
      lines.push("Switched to Phase 2 — z-row recomputed from original cost; artificial columns locked out.");
      lines.push("");
    }
    lines.push(tableauToMarkdown(step.T, step.basis, std));
    lines.push("");
  });

  lines.push(`## Final phase: ${phase}`);
  return lines.join("\n");
}

function tableauToMarkdown(T, basis, std) {
  const { m, colKinds } = std;
  const totalCols = T[0].length;
  const headers = ["basis", ...colKinds.map((_, j) => labelFor(colKinds, j)), "RHS"];
  const lines = [];
  lines.push("| " + headers.join(" | ") + " |");
  lines.push("|" + headers.map(() => "---").join("|") + "|");
  const zRow = ["**z/w**"];
  for (let j = 0; j < colKinds.length; j++) zRow.push(fmt(T[m][j]));
  zRow.push("**" + fmt(-T[m][totalCols - 1]) + "**");
  lines.push("| " + zRow.join(" | ") + " |");
  for (let i = 0; i < m; i++) {
    const row = [labelFor(colKinds, basis[i])];
    for (let j = 0; j < colKinds.length; j++) row.push(fmt(T[i][j]));
    row.push("**" + fmt(T[i][totalCols - 1]) + "**");
    lines.push("| " + row.join(" | ") + " |");
  }
  return lines.join("\n");
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
const btnSmall = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "4px 8px", borderRadius: 6, border: "1px solid #ccc",
  background: "#f7f7f7", cursor: "pointer", fontWeight: 500, fontSize: 12,
};
