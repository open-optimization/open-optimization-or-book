import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   SENSITIVITY ANALYSIS — STEP-BY-STEP DERIVATION
   ISE 5406

   Given an LP at its optimal tableau, derive the allowable
   ranges for objective coefficients c_j (basic & non-basic
   separately) and right-hand-sides b_i. Each step is shown
   in TeX with the algebra expanded:

     c_j  basic   →  z̄_q + Δc_j·T[row(j),q]  ≥ 0 for all non-basic q  →  ratio test
     c_j  non-bas →  z̄_j + Δc_j ≥ 0          →  Δc_j ≥ -z̄_j (one-sided)
     b_i          →  T[k,n+i]·Δb_i + (RHS)_k ≥ 0 for all basic rows k →  ratio test

   The LP defaults to the simplex_tableau_demo classic but can
   be edited inline; the demo runs simplex internally to find
   the optimal tableau, then walks the sensitivity derivations.
   ============================================================ */

// ============================================================
// Preset LPs — give a few different flavors of sensitivity
// ============================================================
const PRESETS = [
  {
    key: "wood_labor",
    name: "Wood & Labor (both vars basic)",
    blurb:
      "The classic textbook LP. Both decision variables x₁ and x₂ are basic at the optimum, both constraints bind. All four sensitivity questions exercise the BASIC-variable case for c_j and the standard ratio test for b_i.",
    c: [3, 5],
    A: [[2, 1], [1, 3]],
    b: [8, 6],
  },
  {
    key: "x2_nonbasic",
    name: "x₂ non-basic at optimum",
    blurb:
      "By making x₂'s coefficient small, the optimum sits at (4, 0): only x₁ is basic. The Δc₂ derivation now uses the NON-BASIC formula (one-sided bound from a single reduced cost), while Δc₁ still uses the basic-variable ratio test.",
    c: [4, 1],
    A: [[2, 1], [1, 1]],
    b: [8, 5],
  },
  {
    key: "three_vars",
    name: "3 variables, 2 constraints",
    blurb:
      "A three-variable LP. At the optimum some original variables enter the basis and one stays non-basic — sensitivity derivation must do the full ratio test over more non-basic columns.",
    c: [6, 8, 5],
    A: [
      [4, 2, 1],
      [2, 5, 3],
    ],
    b: [32, 30],
  },
  {
    key: "lazy_constraint",
    name: "One constraint not binding",
    blurb:
      "The second constraint has lots of slack — its slack variable stays in the basis at optimum. This means π₂ = 0 (no shadow price), and Δb₂ has a wide range (the basis doesn't care until b₂ tightens enough to bind).",
    c: [3, 2],
    A: [[2, 1], [1, 4]],
    b: [10, 20],
  },
];

const DEFAULT_C = PRESETS[0].c;
const DEFAULT_A = PRESETS[0].A;
const DEFAULT_B = PRESETS[0].b;

// ============================================================
// Internal mini-simplex (max c^T x, A x <= b, x >= 0)
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

function pivotInPlace(T, row, col) {
  const piv = T[row][col];
  for (let j = 0; j < T[0].length; j++) T[row][j] /= piv;
  for (let i = 0; i < T.length; i++) {
    if (i === row) continue;
    const f = T[i][col];
    if (Math.abs(f) < 1e-12) continue;
    for (let j = 0; j < T[0].length; j++) T[i][j] -= f * T[row][j];
  }
}

function solveSimplex(c, A, b) {
  const init = buildInitialTableau(c, A, b);
  const { n, m } = init;
  const T = init.T.map((r) => [...r]);
  const basis = [...init.basis];
  let safety = 200;
  while (safety-- > 0) {
    // entering: most-negative z-row entry
    let bestJ = -1, bestVal = -1e-9;
    for (let j = 0; j < n + m; j++) {
      if (T[m][j] < bestVal) {
        bestVal = T[m][j];
        bestJ = j;
      }
    }
    if (bestJ < 0) break; // optimal
    // leaving: min-ratio
    let minRow = -1, minRatio = Infinity;
    for (let i = 0; i < m; i++) {
      if (T[i][bestJ] > 1e-9) {
        const r = T[i][n + m] / T[i][bestJ];
        if (r < minRatio - 1e-9) {
          minRatio = r;
          minRow = i;
        }
      }
    }
    if (minRow < 0) return { unbounded: true };
    pivotInPlace(T, minRow, bestJ);
    basis[minRow] = bestJ;
  }
  return { T, basis, n, m, unbounded: false };
}

// ============================================================
// Helpers — labels and number formatting
// ============================================================
function colLabel(j, n, m) {
  if (j < n) return `x_${j + 1}`;
  return `s_${j - n + 1}`;
}
function colLabelText(j, n, m) {
  if (j < n) return `x${j + 1}`;
  return `s${j - n + 1}`;
}
function fmtNum(v) {
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(3);
}
function fmtFrac(v) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  for (const denom of [2, 3, 4, 5, 6, 7, 8, 10, 12]) {
    const num = v * denom;
    if (Math.abs(num - Math.round(num)) < 1e-9) {
      const r = Math.round(num);
      const sign = r < 0 ? "-" : "";
      return `${sign}\\tfrac{${Math.abs(r)}}{${denom}}`;
    }
  }
  return v.toFixed(3);
}
function fmtRange(low, high) {
  const lo = low === -Infinity ? "-\\infty" : fmtFrac(low);
  const hi = high === Infinity ? "+\\infty" : fmtFrac(high);
  return `[${lo},\\; ${hi}]`;
}

// ============================================================
// Sensitivity derivations
// ============================================================
function cRangeForBasicVar(T, basis, n, m, jBasic) {
  // jBasic = column index of the basic variable
  // Find the row k where basis[k] == jBasic
  const k = basis.indexOf(jBasic);
  if (k < 0) return null;
  // For each non-basic column q with z-row entry z̄_q ≥ 0:
  //   new z̄_q = z̄_q + Δ * T[k][q]
  // Want ≥ 0 → constraint on Δ.
  const constraints = [];
  for (let q = 0; q < n + m; q++) {
    if (basis.includes(q)) continue;
    const zq = T[m][q];
    const tkq = T[k][q];
    if (Math.abs(tkq) < 1e-12) continue; // no constraint
    // zq + Δ * tkq ≥ 0
    const bound = -zq / tkq;
    if (tkq > 0) constraints.push({ q, sign: ">=", bound, zq, tkq });
    else constraints.push({ q, sign: "<=", bound, zq, tkq });
  }
  // Δ lower bound: max of (>= bounds); upper bound: min of (<= bounds)
  let lo = -Infinity, hi = Infinity;
  let activeLo = null, activeHi = null;
  for (const ct of constraints) {
    if (ct.sign === ">=") {
      if (ct.bound > lo) { lo = ct.bound; activeLo = ct; }
    } else {
      if (ct.bound < hi) { hi = ct.bound; activeHi = ct; }
    }
  }
  return { row: k, constraints, lo, hi, activeLo, activeHi };
}

function cRangeForNonBasicVar(T, basis, n, m, j) {
  // For non-basic j: reduced cost z̄_j stays ≥ 0
  // After Δc_j: new reduced cost = z̄_j - Δc_j (since z_j stays, c_j moves)
  // Wait — careful. In the canonical max-form tableau, z-row holds (z_j - c_j)
  // For non-basic j: changing c_j by Δ means z̄_j' = z̄_j - Δ.
  // Want ≥ 0 → Δ ≤ z̄_j (one-sided upper bound; lower is -∞).
  const zj = T[m][j];
  return { zj, lo: -Infinity, hi: zj };
}

function bRange(T, basis, n, m, i) {
  // Δb_i applied to constraint i. In the optimal tableau, the slack column
  // for constraint i (column n+i) gives the i-th column of B^{-1}.
  // After Δb_i: x_B[k]' = x_B[k] + Δb_i * T[k][n+i]
  // For each basic row k: ≥ 0 constraint.
  const slackCol = n + i;
  const constraints = [];
  for (let k = 0; k < m; k++) {
    const xb = T[k][n + m]; // RHS
    const t = T[k][slackCol];
    if (Math.abs(t) < 1e-12) continue;
    const bound = -xb / t;
    if (t > 0) constraints.push({ k, sign: ">=", bound, xb, t });
    else constraints.push({ k, sign: "<=", bound, xb, t });
  }
  let lo = -Infinity, hi = Infinity;
  let activeLo = null, activeHi = null;
  for (const ct of constraints) {
    if (ct.sign === ">=") {
      if (ct.bound > lo) { lo = ct.bound; activeLo = ct; }
    } else {
      if (ct.bound < hi) { hi = ct.bound; activeHi = ct; }
    }
  }
  return { slackCol, constraints, lo, hi, activeLo, activeHi };
}

// ============================================================
// Main component
// ============================================================
export default function SensitivityWalkthroughDemo() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const [c, setC] = useState(DEFAULT_C);
  const [A, setA] = useState(DEFAULT_A);
  const [b, setB] = useState(DEFAULT_B);

  function loadPreset(key) {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    setPresetKey(key);
    setC([...p.c]);
    setA(p.A.map((r) => [...r]));
    setB([...p.b]);
  }

  const opt = useMemo(() => solveSimplex(c, A, b), [c, A, b]);

  const preset = PRESETS.find((x) => x.key === presetKey);

  if (opt.unbounded) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Sensitivity Walkthrough</h1>
        <p>The LP is unbounded — sensitivity analysis is not meaningful here.</p>
      </div>
    );
  }

  return (
    <Inner
      c={c} A={A} b={b}
      setC={setC} setA={setA} setB={setB}
      opt={opt}
      preset={preset}
      presetKey={presetKey}
      loadPreset={loadPreset}
    />
  );
}

function Inner({ c, A, b, setC, setA, setB, opt, preset, presetKey, loadPreset }) {
  const { T, basis, n, m } = opt;

  // Tabs: which target to walk through
  const targets = [
    ...c.map((_, j) => ({ kind: "c", index: j, label: `Δc_${j + 1}` })),
    ...b.map((_, i) => ({ kind: "b", index: i, label: `Δb_${i + 1}` })),
  ];
  const [tab, setTab] = useState(0);
  // Reset tab when preset changes (new dimensions)
  useEffect(() => { setTab(0); }, [presetKey]);
  // Clamp tab if c or b shrinks
  useEffect(() => {
    if (tab >= c.length + b.length) setTab(0);
  }, [tab, c.length, b.length]);

  // Compute the highlight set for the current target — passed to OptimalTableau.
  const highlight = useMemo(
    () => computeHighlight(targets[tab], T, basis, n, m),
    [tab, T, basis, n, m, targets]
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Sensitivity Analysis — Step-by-Step Derivation
      </h1>
      <p style={{ color: "#666", marginBottom: 14, maxWidth: 880 }}>
        Given an LP at its optimal tableau, work out the allowable ranges for
        each objective coefficient and each right-hand-side. Every step is
        written explicitly in algebraic form — including the ratio tests that
        produce each bound. Edit the LP, switch presets, or pick which
        coefficient to perturb.
      </p>

      <GoalCallout />

      <PresetPicker presetKey={presetKey} loadPreset={loadPreset} preset={preset} />

      <ProblemEditor c={c} A={A} b={b} setC={setC} setA={setA} setB={setB} />

      <OptimalTableau T={T} basis={basis} n={n} m={m} highlight={highlight} />

      <div style={{ display: "flex", gap: 6, margin: "16px 0 12px 0", flexWrap: "wrap" }}>
        {targets.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{ ...tabBtn, ...(tab === i ? tabBtnActive : {}) }}
          >
            <Tex>{t.label.replace("Δ", "\\Delta ").replace("c_", "c_").replace("b_", "b_")}</Tex>
          </button>
        ))}
      </div>

      <HighlightLegend highlight={highlight} />

      <Walkthrough target={targets[tab]} T={T} basis={basis} n={n} m={m} c={c} b={b} />

      <Reference />
    </div>
  );
}

// Goal callout: emphasize what sensitivity analysis is FOR
function GoalCallout() {
  return (
    <div
      style={{
        padding: "14px 18px",
        background: "#e8f5e9",
        border: "2px solid #1f4e3d",
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.18em", color: "#1f4e3d", textTransform: "uppercase", marginBottom: 6 }}>
        the goal
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.55, color: "#1a3d2e" }}>
        Find <b>how much each coefficient (objective <Tex>{`c_j`}</Tex> or RHS <Tex>{`b_i`}</Tex>) can change</b> while the <b>current optimal basis stays optimal</b>.
        Inside that range, the same set of basic variables remains the optimum — only their <i>values</i>{" "}
        and the <i>objective</i> shift linearly. Outside, a different basis takes over and a new pivot is needed.
      </div>
    </div>
  );
}

function PresetPicker({ presetKey, loadPreset, preset }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => loadPreset(p.key)}
            style={{ ...tabBtn, ...(p.key === presetKey ? tabBtnActive : {}) }}
          >
            {p.name}
          </button>
        ))}
      </div>
      {preset && (
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, padding: "8px 12px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 6 }}>
          <b>{preset.name}.</b> {preset.blurb}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Compute which cells of the optimal tableau are relevant
// for the current sensitivity question
// ============================================================
function computeHighlight(target, T, basis, n, m) {
  if (!target) return { rows: [], cols: [], cells: [], legend: "" };

  if (target.kind === "c") {
    const j = target.index;
    if (basis.includes(j)) {
      // basic variable — highlight the basic row + every non-basic column
      const k = basis.indexOf(j);
      const nonBasicCols = [];
      for (let q = 0; q < n + m; q++) if (!basis.includes(q)) nonBasicCols.push(q);
      // The cells we actually use are (k, q) for each non-basic q, plus z-row entries z̄_q
      const cells = nonBasicCols.flatMap((q) => [{ row: k, col: q, kind: "ratio" }, { row: m, col: q, kind: "z" }]);
      return {
        rows: [k],
        cols: nonBasicCols,
        cells,
        kind: "c-basic",
        legend: `For Δc_${j + 1} (basic, in row ${k + 1}): we use row ${k + 1} of the tableau (the row where x_${j + 1} is basic) and the z-row entries on every non-basic column.`,
      };
    } else {
      // non-basic variable — only the z-row entry of column j matters
      return {
        rows: [],
        cols: [j],
        cells: [{ row: m, col: j, kind: "z" }],
        kind: "c-nonbasic",
        legend: `For Δc_${j + 1} (non-basic): only the z-row entry of column ${j < n ? `x_${j + 1}` : `s_${j - n + 1}`} matters — it gives the one-sided bound directly.`,
      };
    }
  }
  // b_i
  const i = target.index;
  const slackCol = n + i;
  return {
    rows: Array.from({ length: m }, (_, k) => k),
    cols: [slackCol, n + m], // slack column and RHS column
    cells: Array.from({ length: m }, (_, k) => ({ row: k, col: slackCol, kind: "ratio" })),
    kind: "b",
    legend: `For Δb_${i + 1}: we use the slack column for constraint ${i + 1} (column s_${i + 1}, which holds the i-th column of B⁻¹) and the RHS column. Each basic row contributes a ratio-test inequality.`,
  };
}

function HighlightLegend({ highlight }) {
  if (!highlight || !highlight.legend) return null;
  return (
    <div style={{
      padding: "8px 12px",
      background: "#fff8e1",
      border: "1px solid #f5d68d",
      borderRadius: 6,
      marginBottom: 10,
      fontSize: 13,
      lineHeight: 1.5,
    }}>
      <b style={{ color: "#7a5a00" }}>Tableau highlight:</b> {highlight.legend}
    </div>
  );
}

// ============================================================
// Problem editor
// ============================================================
function ProblemEditor({ c, A, b, setC, setA, setB }) {
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
  const n = c.length;
  return (
    <div style={editorBox}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
        LP — max cᵀx s.t. Ax ≤ b, x ≥ 0
      </div>
      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
        <thead>
          <tr>
            <td></td>
            {Array.from({ length: n }, (_, j) => (
              <th key={j} style={{ padding: "4px 6px", fontSize: 12, color: "#666" }}>
                x<sub>{j + 1}</sub>
              </th>
            ))}
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "4px 8px", fontWeight: 700, color: "#555" }}>c</td>
            {c.map((v, j) => (
              <td key={j}><NumInput value={v} onChange={(x) => setCi(j, x)} /></td>
            ))}
          </tr>
          {A.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: "4px 8px", fontWeight: 700, color: "#555" }}>R<sub>{i + 1}</sub></td>
              {row.map((v, j) => (
                <td key={j}><NumInput value={v} onChange={(x) => setAij(i, j, x)} /></td>
              ))}
              <td style={{ textAlign: "center", padding: "0 6px", color: "#666" }}>≤</td>
              <td><NumInput value={b[i]} onChange={(x) => setBi(i, x)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NumInput({ value, onChange }) {
  return (
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{ width: 60, padding: "4px 6px", border: "1px solid #ccc", borderRadius: 4, fontFamily: "monospace", fontSize: 13, textAlign: "right" }}
    />
  );
}

// ============================================================
// Optimal tableau view
// ============================================================
function OptimalTableau({ T, basis, n, m, highlight }) {
  const hRows = new Set(highlight?.rows || []);
  const hCols = new Set(highlight?.cols || []);
  const cellMap = new Map();
  (highlight?.cells || []).forEach((c) => cellMap.set(`${c.row},${c.col}`, c.kind));

  function cellStyle(i, j) {
    const isHRow = hRows.has(i);
    const isHCol = hCols.has(j);
    const cellKind = cellMap.get(`${i},${j}`);
    if (cellKind === "z") return { background: "#fff4c8", outline: "2px solid #c8311c" };
    if (cellKind === "ratio") return { background: "#fff4c8", outline: "2px solid #c8311c" };
    if (isHRow && isHCol) return { background: "#fde8a0" };
    if (isHRow) return { background: "#fff8d8" };
    if (isHCol) return { background: "#fff8d8" };
    return {};
  }

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Optimal tableau
      </div>
      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>basis</th>
            {Array.from({ length: n + m }, (_, j) => (
              <th key={j} style={{ ...th, background: hCols.has(j) ? "#fde8a0" : "#f0f0f0" }}>
                {colLabelText(j, n, m)}
              </th>
            ))}
            <th style={{ ...th, background: hCols.has(n + m) ? "#fde8a0" : "#e7e7e7" }}>RHS</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: m }, (_, i) => (
            <tr key={i}>
              <td style={{ ...tdLab, background: hRows.has(i) ? "#fff8d8" : "transparent" }}>
                {colLabelText(basis[i], n, m)}
              </td>
              {Array.from({ length: n + m }, (_, j) => (
                <td key={j} style={{ ...td, ...cellStyle(i, j) }}>{fmtNum(T[i][j])}</td>
              ))}
              <td style={{ ...td, fontWeight: 700, ...cellStyle(i, n + m) }}>{fmtNum(T[i][n + m])}</td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #444" }}>
            <td style={{ ...tdLab, background: hRows.has(m) ? "#fff8d8" : "transparent" }}>z</td>
            {Array.from({ length: n + m }, (_, j) => (
              <td key={j} style={{
                ...td,
                color: T[m][j] > 1e-9 ? "#0b3da0" : "#555",
                ...cellStyle(m, j),
              }}>
                {fmtNum(T[m][j])}
              </td>
            ))}
            <td style={{ ...td, fontWeight: 700, color: "#c8311c", ...cellStyle(m, n + m) }}>
              {fmtNum(T[m][n + m])}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
        z-row entries are <Tex>{`z_j - c_j = c_B^T B^{-1} A_j - c_j`}</Tex> (zero on basic columns; ≥ 0 everywhere → optimal).
        The slack columns hold <Tex>{`B^{-1}`}</Tex>; the slack-column z-row entries are the dual values <Tex>{`\\pi`}</Tex>.
      </div>
    </div>
  );
}

// ============================================================
// Walkthrough — picks the right derivation by tab
// ============================================================
function Walkthrough({ target, T, basis, n, m, c, b }) {
  if (target.kind === "c") {
    const j = target.index;
    if (basis.includes(j)) return <BasicCWalk T={T} basis={basis} n={n} m={m} c={c} j={j} />;
    return <NonBasicCWalk T={T} basis={basis} n={n} m={m} c={c} j={j} />;
  } else {
    return <BWalk T={T} basis={basis} n={n} m={m} b={b} i={target.index} />;
  }
}

// ============================================================
// Δc_j  for a BASIC variable
// ============================================================
function BasicCWalk({ T, basis, n, m, c, j }) {
  const result = cRangeForBasicVar(T, basis, n, m, j);
  if (!result) return null;
  const k = result.row;
  return (
    <div style={panel}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Sensitivity of <Tex>{`c_${j + 1}`}</Tex> (basic variable, in row {k + 1})
      </div>

      <Step n="1" title="Identify the basic row">
        <Tex block>{`x_${j + 1}\\text{ is basic in row }${k + 1}\\;\\Longrightarrow\\; \\text{basis index } k = ${k + 1}`}</Tex>
      </Step>

      <Step n="2" title="Effect of perturbing c_B[k]">
        <p style={{ margin: "0 0 6px 0", fontSize: 13 }}>
          The reduced cost of any non-basic column <Tex>{`q`}</Tex> is{" "}
          <Tex>{`\\bar z_q = c_B^T B^{-1} A_q - c_q \\ge 0`}</Tex>. Perturbing
          <Tex>{`c_B[k]`}</Tex> by <Tex>{`\\Delta`}</Tex> changes it to
        </p>
        <Tex block>
          {`\\bar z_q' \\;=\\; \\bar z_q \\;+\\; \\Delta \\cdot T_{k,q}`}
        </Tex>
        <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>
          (Because <Tex>{`T_{k,q}`}</Tex> is the entry of <Tex>{`B^{-1}A_q`}</Tex> in the basic row k.)
          Optimality requires <Tex>{`\\bar z_q' \\ge 0`}</Tex> for every non-basic q.
        </p>
      </Step>

      <Step n="3" title="Apply the inequality to each non-basic column">
        <table style={{ borderCollapse: "collapse", marginTop: 6, fontSize: 13 }}>
          <thead>
            <tr>
              <th style={cellTh}>non-basic q</th>
              <th style={cellTh}>z̄_q</th>
              <th style={cellTh}>T_{`{k,q}`}</th>
              <th style={cellTh}>inequality</th>
              <th style={cellTh}>bound on Δ</th>
            </tr>
          </thead>
          <tbody>
            {result.constraints.map((ct, idx) => (
              <tr key={idx}>
                <td style={cellTd}><Tex>{colLabel(ct.q, n, m)}</Tex></td>
                <td style={cellTd}>{fmtNum(ct.zq)}</td>
                <td style={cellTd}>{fmtNum(ct.tkq)}</td>
                <td style={cellTd}>
                  <Tex>{`${fmtFrac(ct.zq)} + ${fmtFrac(ct.tkq)}\\,\\Delta \\ge 0`}</Tex>
                </td>
                <td style={cellTd}>
                  <Tex>{`\\Delta \\;${ct.sign === ">=" ? "\\ge" : "\\le"}\\; ${fmtFrac(ct.bound)}`}</Tex>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Step>

      <Step n="4" title="Take the intersection (the binding bounds)">
        <Tex block>
          {`\\Delta_{\\min} = ${result.lo === -Infinity ? "-\\infty" : `\\max\\{ ${result.constraints.filter(ct => ct.sign === ">=").map(ct => fmtFrac(ct.bound)).join(", ") || "-\\infty"} \\} = ${fmtFrac(result.lo)}`} `}
        </Tex>
        <Tex block>
          {`\\Delta_{\\max} = ${result.hi === Infinity ? "+\\infty" : `\\min\\{ ${result.constraints.filter(ct => ct.sign === "<=").map(ct => fmtFrac(ct.bound)).join(", ") || "+\\infty"} \\} = ${fmtFrac(result.hi)}`} `}
        </Tex>
      </Step>

      <Result>
        <Tex block>
          {`\\Delta c_${j + 1} \\in ${fmtRange(result.lo, result.hi)}\\quad\\Longleftrightarrow\\quad c_${j + 1} \\in [\\,${fmtFrac(c[j] + (result.lo === -Infinity ? 0 : result.lo))}\\,,\\;${fmtFrac(c[j] + (result.hi === Infinity ? 0 : result.hi))}\\,]\\text{ (centered at }${fmtFrac(c[j])}\\text{)}`}
        </Tex>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
          <b>Goal achieved:</b> within this range, the <i>current optimal basis</i> stays optimal — i.e. the same set of basic variables wins. The values of <Tex>{`x^*`}</Tex> stay the same (because basic-var <Tex>{`c_j`}</Tex> doesn't enter the RHS computation), and the objective shifts linearly with Δ. Outside the range, a different basis takes over and you'd need to re-pivot.
        </div>
      </Result>
    </div>
  );
}

// ============================================================
// Δc_j  for a NON-BASIC variable
// ============================================================
function NonBasicCWalk({ T, basis, n, m, c, j }) {
  const r = cRangeForNonBasicVar(T, basis, n, m, j);
  return (
    <div style={panel}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Sensitivity of <Tex>{`c_${j + 1}`}</Tex> (non-basic variable)
      </div>

      <Step n="1" title="Read off the reduced cost from the optimal tableau">
        <Tex block>{`\\bar z_${j + 1} = ${fmtFrac(r.zj)} \\ge 0\\quad\\text{(optimality)}`}</Tex>
      </Step>

      <Step n="2" title="Effect of perturbing c_j">
        <p style={{ margin: "0 0 6px 0", fontSize: 13 }}>
          The reduced cost of a non-basic <Tex>{`x_${j + 1}`}</Tex> is
          <Tex>{`\\bar z_${j + 1} = c_B^T B^{-1} A_${j + 1} - c_${j + 1}`}</Tex>.
          Perturbing <Tex>{`c_${j + 1}`}</Tex> by <Tex>{`\\Delta`}</Tex> only
          changes the second term:
        </p>
        <Tex block>
          {`\\bar z_${j + 1}' \\;=\\; \\bar z_${j + 1} \\;-\\; \\Delta`}
        </Tex>
      </Step>

      <Step n="3" title="Require non-negativity">
        <Tex block>
          {`\\bar z_${j + 1} - \\Delta \\;\\ge\\; 0\\quad\\Longleftrightarrow\\quad \\Delta \\;\\le\\; \\bar z_${j + 1} = ${fmtFrac(r.zj)}`}
        </Tex>
        <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#555" }}>
          No <i>lower</i> bound: making <Tex>{`c_${j + 1}`}</Tex> smaller only
          deepens its non-attractiveness — <Tex>{`x_${j + 1}`}</Tex> stays
          non-basic.
        </p>
      </Step>

      <Result>
        <Tex block>
          {`\\Delta c_${j + 1} \\in ${fmtRange(r.lo, r.hi)} \\quad\\Longleftrightarrow\\quad c_${j + 1} \\in (-\\infty,\\; ${fmtFrac(c[j] + r.zj)}\\,]\\text{ (centered at }${fmtFrac(c[j])}\\text{)}`}
        </Tex>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
          <b>Goal achieved:</b> within this range the current basis stays optimal — <Tex>{`x_${j + 1}`}</Tex> remains non-basic and every other variable's value is unchanged. Increase <Tex>{`c_${j + 1}`}</Tex> beyond <Tex>{`c_${j + 1} + \\bar z_${j + 1}`}</Tex>{" "}
          and <Tex>{`x_${j + 1}`}</Tex> would enter the basis (re-pivot required).
        </div>
      </Result>
    </div>
  );
}

// ============================================================
// Δb_i  — RHS perturbation
// ============================================================
function BWalk({ T, basis, n, m, b, i }) {
  const r = bRange(T, basis, n, m, i);
  return (
    <div style={panel}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Sensitivity of <Tex>{`b_${i + 1}`}</Tex>
      </div>

      <Step n="1" title="Effect on the basic feasible solution">
        <p style={{ margin: "0 0 6px 0", fontSize: 13 }}>
          The current basic solution is{" "}
          <Tex>{`x_B = B^{-1}b`}</Tex>. Perturbing <Tex>{`b_${i + 1}`}</Tex>{" "}
          by <Tex>{`\\Delta`}</Tex> shifts it to
        </p>
        <Tex block>
          {`x_B' \\;=\\; B^{-1}(b + \\Delta\\, e_${i + 1}) \\;=\\; x_B + \\Delta\\, B^{-1}e_${i + 1}`}
        </Tex>
        <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>
          And <Tex>{`B^{-1}e_${i + 1}`}</Tex> is the slack column for
          constraint i in the optimal tableau — column{" "}
          <Tex>{colLabel(r.slackCol, n, m)}</Tex>:
        </p>
        <Tex block>
          {`B^{-1}e_${i + 1} \\;=\\; \\begin{bmatrix}${Array.from({ length: m }, (_, k) => fmtFrac(T[k][r.slackCol])).join(" \\\\ ")}\\end{bmatrix}`}
        </Tex>
      </Step>

      <Step n="2" title="Require non-negativity row by row">
        <table style={{ borderCollapse: "collapse", marginTop: 6, fontSize: 13 }}>
          <thead>
            <tr>
              <th style={cellTh}>row k</th>
              <th style={cellTh}>basic var</th>
              <th style={cellTh}>x_B[k]</th>
              <th style={cellTh}>(B⁻¹e_i)_k</th>
              <th style={cellTh}>inequality</th>
              <th style={cellTh}>bound on Δ</th>
            </tr>
          </thead>
          <tbody>
            {r.constraints.map((ct, idx) => (
              <tr key={idx}>
                <td style={cellTd}>{ct.k + 1}</td>
                <td style={cellTd}><Tex>{colLabel(basis[ct.k], n, m)}</Tex></td>
                <td style={cellTd}>{fmtNum(ct.xb)}</td>
                <td style={cellTd}>{fmtNum(ct.t)}</td>
                <td style={cellTd}>
                  <Tex>{`${fmtFrac(ct.xb)} + ${fmtFrac(ct.t)}\\,\\Delta \\ge 0`}</Tex>
                </td>
                <td style={cellTd}>
                  <Tex>{`\\Delta \\;${ct.sign === ">=" ? "\\ge" : "\\le"}\\; ${fmtFrac(ct.bound)}`}</Tex>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Step>

      <Step n="3" title="Take the intersection">
        <Tex block>
          {`\\Delta_{\\min} = ${r.lo === -Infinity ? "-\\infty" : fmtFrac(r.lo)},\\quad \\Delta_{\\max} = ${r.hi === Infinity ? "+\\infty" : fmtFrac(r.hi)}`}
        </Tex>
      </Step>

      <Result>
        <Tex block>
          {`\\Delta b_${i + 1} \\in ${fmtRange(r.lo, r.hi)}\\quad\\Longleftrightarrow\\quad b_${i + 1} \\in [\\,${fmtFrac(b[i] + (r.lo === -Infinity ? 0 : r.lo))}\\,,\\;${fmtFrac(b[i] + (r.hi === Infinity ? 0 : r.hi))}\\,]\\text{ (centered at }${fmtFrac(b[i])}\\text{)}`}
        </Tex>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
          <b>Goal achieved:</b> within this range the current basis stays feasible, so the same
          set of basic variables remains the optimum. Their <i>values</i> shift linearly with Δ;
          the optimal cost changes at rate{" "}
          <Tex>{`\\pi_${i + 1} = ${fmtFrac(T[m][r.slackCol])}`}</Tex>{" "}
          per unit of Δ — that's the shadow price. Outside the range the basis becomes
          infeasible and a re-pivot is needed.
        </div>
      </Result>
    </div>
  );
}

// ============================================================
// Step / Result containers
// ============================================================
function Step({ n, title, children }) {
  return (
    <div style={{ marginTop: 12, padding: 10, background: "#fff", border: "1px solid #e3e3e3", borderRadius: 6 }}>
      <div style={{ fontWeight: 600, color: "#0b3da0", fontSize: 13, marginBottom: 4 }}>
        Step {n}. {title}
      </div>
      {children}
    </div>
  );
}
function Result({ children }) {
  return (
    <div style={{ marginTop: 12, padding: 10, background: "#e8f5e9", border: "1px solid #7dd87d", borderRadius: 6 }}>
      <div style={{ fontWeight: 700, color: "#1f4e3d", fontSize: 13, marginBottom: 4 }}>
        Result
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Reference card
// ============================================================
function Reference() {
  return (
    <div style={{ marginTop: 22, padding: 16, background: "#fff8e1", borderRadius: 10, border: "1px solid #f5d68d" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Sensitivity formulas — reference
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#3d2f00" }}>
        <p style={{ margin: "0 0 6px 0" }}>
          Let <Tex>{`B`}</Tex> be the optimal basis matrix, with optimal
          tableau row-k entry <Tex>{`T_{k,q}`}</Tex> and reduced cost{" "}
          <Tex>{`\\bar z_q = c_B^T B^{-1}A_q - c_q`}</Tex>.
        </p>
        <ul style={{ paddingLeft: 22, margin: 0 }}>
          <li>
            <b>Objective coefficient — basic variable</b> (in row k of basis):
            for every non-basic q,{" "}
            <Tex>{`\\bar z_q + \\Delta \\,T_{k,q} \\ge 0`}</Tex>. Take the
            min/max ratio to get <Tex>{`\\Delta \\in [\\Delta_{\\min}, \\Delta_{\\max}]`}</Tex>.
          </li>
          <li>
            <b>Objective coefficient — non-basic variable j:</b>{" "}
            <Tex>{`\\bar z_j - \\Delta \\ge 0`}</Tex> →{" "}
            <Tex>{`\\Delta \\le \\bar z_j`}</Tex> (one-sided).
          </li>
          <li>
            <b>RHS coefficient b_i:</b> for every basic row k,{" "}
            <Tex>{`(x_B)_k + \\Delta\\,T_{k, n+i} \\ge 0`}</Tex>. Take min/max
            ratio.
          </li>
          <li>
            <b>Shadow price</b> <Tex>{`\\pi_i = T_{m, n+i}`}</Tex> (z-row
            entry of the slack column). Within the b_i range, optimal
            objective changes at rate <Tex>{`\\pi_i`}</Tex> per unit of Δ.
          </li>
        </ul>
        <p style={{ marginTop: 10, marginBottom: 0 }}>
          <b>Why the slack columns of the optimal tableau hold</b>{" "}
          <Tex>{`B^{-1}`}</Tex>: in the initial tableau the slack columns
          are <Tex>{`I`}</Tex>; pivoting multiplies them by{" "}
          <Tex>{`B^{-1}`}</Tex>. So at the optimum, you read{" "}
          <Tex>{`B^{-1}`}</Tex> straight off the slack block.
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
  padding: 14,
};
const editorBox = {
  background: "#f6f4ee",
  border: "1px solid #ece8dd",
  borderRadius: 8,
  padding: 14,
  marginBottom: 14,
};
const th = {
  padding: "6px 8px",
  border: "1px solid #ccc",
  background: "#f0f0f0",
  fontWeight: 700,
};
const td = {
  padding: "5px 8px",
  border: "1px solid #ddd",
  textAlign: "right",
};
const tdLab = { ...td, textAlign: "left", fontWeight: 700, color: "#555" };
const cellTh = {
  padding: "5px 10px",
  borderBottom: "2px solid #888",
  background: "#fafafa",
  fontSize: 11,
  color: "#555",
  textAlign: "left",
  fontFamily: "monospace",
};
const cellTd = {
  padding: "5px 10px",
  borderBottom: "1px solid #eee",
};
const tabBtn = {
  padding: "8px 14px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 13,
  fontFamily: "monospace",
};
const tabBtnActive = {
  background: "#1f4e3d",
  color: "#fff",
  border: "1px solid #1f4e3d",
};
