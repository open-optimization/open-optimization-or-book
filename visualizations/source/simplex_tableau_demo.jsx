import React, { useState, useMemo } from "react";
import { Terminal, RotateCcw, Download, AlertTriangle } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   INTERACTIVE SIMPLEX TABLEAU
   ISE 5406

   Inspired by gilp.henryrobbins.com — but with an integrated
   sensitivity / duality view, click-to-pivot interaction, and
   a built-in 'practice' mode where students pick the entering
   and leaving variables themselves.

   Problem (modifiable inline):
       max  c · x
       s.t. A x <= b,  x >= 0
   Add slacks → tableau in canonical form. Click any negative
   reduced-cost column → ratio test highlights eligible rows →
   click a row to pivot. Watch the feasible region plot's
   highlighted vertex jump correspondingly.
   ============================================================ */

// ============================================================
// Default problem
//   max  3 x1 + 5 x2
//   s.t. 2 x1 + x2  <= 8
//        x1 + 3 x2  <= 6
//        x1, x2 >= 0
// Optimal: (x1, x2) = (3.6, 0.8), z = 14.8
// ============================================================
const DEFAULT_C = [3, 5];
const DEFAULT_A = [
  [2, 1],
  [1, 3],
];
const DEFAULT_B = [8, 6];

// ============================================================
// Preset LPs
// ============================================================
const PRESETS = [
  {
    key: "wood_labor",
    name: "Wood & Labor (2D classic)",
    blurb: "The standard textbook starter. Two products, two resources, two ≤-constraints. Optimum at (3.6, 0.8), z* = 14.8.",
    c: [3, 5], A: [[2, 1], [1, 3]], b: [8, 6],
  },
  {
    key: "production_3d",
    name: "Production planning (3D — three products)",
    blurb: "Three products, three machine-time constraints. The 3-variable, 3-constraint case — the smallest size where you really see the tableau machinery 'matter' (slacks become more interesting, BFS no longer reads off in 2 numbers).",
    c: [5, 4, 3], A: [[2, 3, 1], [4, 1, 2], [3, 4, 2]], b: [5, 11, 8],
  },
  {
    key: "diet_small",
    name: "Diet — minimize cost",
    blurb: "Two foods, two nutrient floors. Re-cast as a max problem: max -(cost) so the canonical-form simplex still applies. Showcases how a min-LP becomes a max-LP with negated coefficients.",
    c: [-2, -3], A: [[1, 2], [3, 1]], b: [4, 5],
  },
  {
    key: "lazy_constraint",
    name: "One slack stays in the basis",
    blurb: "The second constraint has plenty of slack. At the optimum its slack variable s₂ stays basic — meaning π₂ = 0 (no shadow price) and the constraint isn't binding.",
    c: [3, 2], A: [[2, 1], [1, 4]], b: [10, 20],
  },
  {
    key: "degenerate_2d",
    name: "Degenerate pivot (2D)",
    blurb: "Three constraints meet at the same vertex (4, 0). With Dantzig's rule, the FIRST pivot has a tied min-ratio test (rows 1 and 3 both at ratio 4); after pivoting on row 1, a basic variable s₃ becomes 0 (degenerate basis), and the NEXT pivot has min-ratio 0 — meaning we pivot but don't move geometrically. Switch to row 3 first to see the optimum reached in a single pivot. Classic example of why pivot-rule choice matters.",
    c: [1, 1], A: [[1, 0], [0, 1], [1, 1]], b: [4, 4, 4],
  },
  {
    key: "klee_minty_3d",
    name: "Klee–Minty cube (3D — worst case)",
    blurb: "The famous Klee–Minty (1972) family. Simplex with Dantzig's rule visits ALL 2ⁿ vertices before finding the optimum — proving simplex isn't polynomial-time in the worst case. Here n=3, so there are 8 vertices and Dantzig takes 7 pivots through every one of them. The optimum is (0, 0, 125) — geometrically the FAR corner from the origin — but Dantzig snakes the long way around.",
    c: [4, 2, 1],
    A: [
      [1, 0, 0],
      [4, 1, 0],
      [8, 4, 1],
    ],
    b: [5, 25, 125],
  },
];

// ============================================================
// Tableau state
// Columns: x1, x2, s1, s2, RHS
// Rows: 0..m-1 = constraints, last = z (objective)
// 'basis' is array of basic variable INDICES (one per constraint row).
// In canonical form for max, the z-row holds NEGATIVE reduced costs of
// non-basic variables (and 0 for basic ones). Optimal when no negative.
// ============================================================
function buildInitialTableau(c, A, b) {
  const m = A.length;
  const n = c.length;
  const totalCols = n + m + 1; // n decision + m slack + RHS
  const T = Array.from({ length: m + 1 }, () => Array(totalCols).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) T[i][j] = A[i][j];
    T[i][n + i] = 1; // slack
    T[i][totalCols - 1] = b[i];
  }
  for (let j = 0; j < n; j++) T[m][j] = -c[j]; // negative reduced costs of decision vars
  // Slack reduced costs are 0 (basic in initial tableau).
  // Initial basis: the slacks.
  const basis = [];
  for (let i = 0; i < m; i++) basis.push(n + i);
  return { T, basis, n, m };
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

function reducedCosts(T, m) {
  return T[m]; // last row
}

function isOptimal(T, m, n) {
  for (let j = 0; j < n; j++) if (T[m][j] < -1e-9) return false;
  // Slack columns may also have negative reduced costs (bland's rule etc),
  // but for max problems with c>=0 and standard form they won't.
  return true;
}

function variableLabel(idx, n) {
  if (idx < n) return `x${idx + 1}`;
  return `s${idx - n + 1}`;
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
  // z-row first (top)
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
export default function SimplexTableauDemo() {
  const [c, setC] = useState(DEFAULT_C);
  const [A, setA] = useState(DEFAULT_A);
  const [b, setB] = useState(DEFAULT_B);
  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const initial = useMemo(() => buildInitialTableau(c, A, b), [c, A, b]);

  // History of (T, basis) so we can step backward
  const [history, setHistory] = useState([initial]);
  const [stepIdx, setStepIdx] = useState(0);
  // Pivot log: parallel to history; entry i records the pivot taken between
  // history[i] and history[i+1].
  const [pivotLog, setPivotLog] = useState([]);
  const cur = history[stepIdx];
  const { T, basis, n, m } = cur;

  // When LP changes, rebuild the initial tableau and clear history
  function loadPreset(key) {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    setPresetKey(key);
    setC([...p.c]);
    setA(p.A.map((r) => [...r]));
    setB([...p.b]);
  }

  // Pivot column the user has selected (null = none)
  const [hoverCol, setHoverCol] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [feedback, setFeedback] = useState(null);
  // Last pivot performed (for row-operation playback). Stores T_before, row, col.
  const [lastPivot, setLastPivot] = useState(null);

  // Whenever the LP coefficients change, reset history to the new initial.
  React.useEffect(() => {
    setHistory([initial]);
    setStepIdx(0);
    setHoverCol(null);
    setFeedback(null);
    setLastPivot(null);
    setPivotLog([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const optimal = isOptimal(T, m, n);
  const rcosts = reducedCosts(T, m);

  // Suggested entering column (most-negative reduced cost) & leaving row
  const suggestedCol = useMemo(() => {
    let bestJ = -1, bestVal = -1e-9;
    for (let j = 0; j < n + m; j++) {
      if (rcosts[j] < bestVal) {
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
      row,
      col,
      pivVal: T_before[row][col],
      entering: variableLabel(col, n),
      leaving: variableLabel(leaving, n),
    });
    setPivotLog(newLog);
    setHoverCol(null);
    setFeedback(null);
    setLastPivot({ T_before, row, col });
  }

  function handleColumnClick(j) {
    if (j >= n + m) return;
    if (rcosts[j] >= -1e-9) {
      // ALWAYS warn — picking a column with non-negative reduced cost can't improve.
      setFeedback({
        ok: false,
        severity: "warn",
        msg: `Column ${variableLabel(j, n)} has reduced cost ${rcosts[j].toFixed(2)} ≥ 0 — picking it would NOT improve the objective. Pick a column with a negative reduced cost (red).`,
      });
      return;
    }
    if (practiceMode) {
      if (j === suggestedCol)
        setFeedback({
          ok: true,
          msg: `Correct! ${variableLabel(j, n)} has the most-negative reduced cost (${rcosts[j].toFixed(2)}). Now pick the leaving row.`,
        });
      else {
        const dantzig = variableLabel(suggestedCol, n);
        setFeedback({
          ok: true,
          msg: `${variableLabel(j, n)} is valid (reduced cost ${rcosts[j].toFixed(2)}), but Dantzig's rule prefers the most-negative: ${dantzig}.`,
        });
      }
    } else {
      setFeedback(null);
    }
    setHoverCol(j);
  }

  function handleRowClick(i) {
    if (hoverCol === null) return;
    const { minRow } = ratioTest(T, m, hoverCol);
    if (T[i][hoverCol] <= 1e-9) {
      // ALWAYS warn on invalid pivot — would unbound or give nonsense.
      setFeedback({
        ok: false,
        severity: "error",
        msg: `INVALID PIVOT: aᵢⱼ = ${T[i][hoverCol].toFixed(3)} ≤ 0 in row ${i + 1}, column ${variableLabel(hoverCol, n)}. Pivoting here would either be impossible (zero) or violate non-negativity (negative). Rules: only rows with aᵢⱼ > 0 are eligible — these are highlighted in yellow when you select a column.`,
      });
      return;
    }
    if (i !== minRow) {
      // ALWAYS warn — picking a non-min-ratio row gives negative RHS in some basic var.
      setFeedback({
        ok: false,
        severity: "error",
        msg: `INFEASIBLE: pivoting in row ${i + 1} would force a basic variable negative (basis would no longer be feasible). The min-ratio test selects row ${minRow + 1}. Click row ${minRow + 1} (the green one) to proceed.`,
      });
      return;
    }
    doPivot(i, hoverCol);
  }

  function reset() {
    setHistory([initial]);
    setStepIdx(0);
    setHoverCol(null);
    setFeedback(null);
    setLastPivot(null);
    setPivotLog([]);
  }

  // Generate a Markdown report of the work done so far
  function buildReport() {
    const lines = [];
    lines.push(`# Simplex Tableau — Worked Solution`);
    lines.push("");
    lines.push(`## LP`);
    lines.push("");
    lines.push("```");
    lines.push(`max  ${c.map((v, j) => `${j === 0 ? "" : v < 0 ? " - " : " + "}${j === 0 && v < 0 ? "-" : ""}${Math.abs(v)} x_${j + 1}`).join("")}`);
    lines.push(`s.t.`);
    A.forEach((row, i) => {
      lines.push(`     ${row.map((v, j) => `${j === 0 ? "" : v < 0 ? " - " : " + "}${j === 0 && v < 0 ? "-" : ""}${Math.abs(v)} x_${j + 1}`).join("")}  <=  ${b[i]}`);
    });
    lines.push(`     x >= 0`);
    lines.push("```");
    lines.push("");

    history.forEach((step, i) => {
      lines.push(`## Tableau ${i}${i === 0 ? " — initial" : ""}`);
      lines.push("");
      if (i > 0) {
        const p = pivotLog[i - 1];
        if (p) {
          lines.push(`Pivot: row ${p.row + 1}, column ${p.entering} (leaving: ${p.leaving}, pivot value ${p.pivVal.toFixed(4)})`);
          lines.push("");
        }
      }
      lines.push(tableauToMarkdown(step));
      lines.push("");
    });

    if (isOptimal(history[history.length - 1].T, m, n)) {
      const fin = history[history.length - 1];
      lines.push(`## Optimal`);
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
    a.download = `simplex_${presetKey}_${history.length - 1}pivots.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Interactive Simplex Tableau
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        A practice tool for simplex pivoting. Click any column with a
        negative reduced cost to enter it into the basis; the ratio test
        highlights the eligible leaving rows. Click one to pivot — the
        feasible-region plot's highlighted vertex jumps to the new basic
        feasible solution. Toggle <i>practice mode</i> to get feedback
        when you pick the wrong column or row.
      </p>

      <PresetPicker
        presetKey={presetKey}
        loadPreset={loadPreset}
      />

      <ProblemEditor c={c} A={A} b={b} setC={setC} setA={setA} setB={setB} />

      <FormulaPanel c={c} A={A} b={b} n={n} m={m} />

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
          ← Undo pivot
        </button>
        <button onClick={downloadReport} style={btn} title="Download a Markdown record of the LP, every tableau, and every pivot">
          <Download size={14} /> Save work
        </button>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "#666" }}>
          step {stepIdx} / {history.length - 1}
        </span>
      </div>

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
            hoverCol={hoverCol}
            onColumnClick={handleColumnClick}
            onRowClick={handleRowClick}
            optimal={optimal}
            suggestedCol={suggestedCol}
            suggestedRow={suggestedRow}
            practiceMode={practiceMode}
          />
          <BasisStatus basis={basis} T={T} n={n} m={m} optimal={optimal} />
        </div>
        <div>
          <FeasibleRegionPlot T={T} basis={basis} n={n} m={m} A={A} b={b} />
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
          {optimal && <SensitivityPanel T={T} basis={basis} n={n} m={m} A={A} b={b} c={c} />}
        </div>
      </div>

      <PivotRulesPanel />
      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Preset picker
// ============================================================
function PresetPicker({ presetKey, loadPreset }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>
        examples — click one to load
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => loadPreset(p.key)}
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
// Editable LP problem editor
// ============================================================
function ProblemEditor({ c, A, b, setC, setA, setB }) {
  function setCi(i, v) {
    const c2 = [...c]; c2[i] = v; setC(c2);
  }
  function setAij(i, j, v) {
    const A2 = A.map((r) => [...r]); A2[i][j] = v; setA(A2);
  }
  function setBi(i, v) {
    const b2 = [...b]; b2[i] = v; setB(b2);
  }
  function addVar() { setC([...c, 0]); setA(A.map((r) => [...r, 0])); }
  function removeVar() { if (c.length <= 1) return; setC(c.slice(0, -1)); setA(A.map((r) => r.slice(0, -1))); }
  function addCons() { setA([...A, Array(c.length).fill(0)]); setB([...b, 0]); }
  function removeCons() { if (A.length <= 1) return; setA(A.slice(0, -1)); setB(b.slice(0, -1)); }
  const n = c.length;
  return (
    <div style={{ background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 8, padding: 14, marginBottom: 14 }}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
        Edit the LP — max cᵀx s.t. Ax ≤ b, x ≥ 0
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
            {c.map((v, j) => (
              <td key={j}><NumIn value={v} onChange={(x) => setCi(j, x)} /></td>
            ))}
            <td colSpan={2} style={{ paddingLeft: 10, color: "#888", fontSize: 12 }}>(objective coefficients)</td>
          </tr>
          {A.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: "4px 8px", fontWeight: 700, color: "#555" }}>R<sub>{i + 1}</sub></td>
              {row.map((v, j) => (
                <td key={j}><NumIn value={v} onChange={(x) => setAij(i, j, x)} /></td>
              ))}
              <td style={{ textAlign: "center", padding: "0 6px", color: "#666" }}>≤</td>
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
const btnSmall = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "4px 8px", borderRadius: 6, border: "1px solid #ccc",
  background: "#f7f7f7", cursor: "pointer", fontWeight: 500, fontSize: 12,
};

// ============================================================
// Formula panel — shows LP → standard form (slacks) → tableau
// ============================================================
function FormulaPanel({ c, A, b, n, m }) {
  // Build LP TeX
  const objTex = c.map((v, j) => `${j === 0 ? (v < 0 ? "-" : "") : (v < 0 ? "-" : "+")}${Math.abs(v)}\\, x_${j + 1}`).join("");
  const consTex = A.map((row, i) => {
    const lhs = row.map((v, j) => `${j === 0 ? (v < 0 ? "-" : "") : (v < 0 ? "-" : "+")}${Math.abs(v)}\\, x_${j + 1}`).join("");
    return `& ${lhs} \\;\\leq\\; ${b[i]} \\\\`;
  }).join("");
  const stdConsTex = A.map((row, i) => {
    const lhs = row.map((v, j) => `${j === 0 ? (v < 0 ? "-" : "") : (v < 0 ? "-" : "+")}${Math.abs(v)}\\, x_${j + 1}`).join("");
    return `& ${lhs} + s_${i + 1} \\;=\\; ${b[i]} \\\\`;
  }).join("");
  return (
    <div style={{ marginBottom: 16, padding: 14, background: "#fafafa", border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        From LP to tableau — what each row of the table represents
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#888", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>1. Original LP</div>
          <Tex block>{`\\begin{aligned}\\max\\;\\; & ${objTex} \\\\ \\text{s.t.}\\;\\; ${consTex} & x_1, \\ldots, x_${n} \\;\\geq\\; 0 \\end{aligned}`}</Tex>
        </div>
        <div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#888", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>2. Standard form (add slacks)</div>
          <Tex block>{`\\begin{aligned}\\max\\;\\; & z = ${objTex} \\\\ \\text{s.t.}\\;\\; ${stdConsTex} & x_j, s_i \\;\\geq\\; 0 \\end{aligned}`}</Tex>
          <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
            Each ≤-constraint gets a slack <Tex>{`s_i \\geq 0`}</Tex>. The slack measures how far the LHS is from the RHS — zero ⇔ binding.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#888", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>3. Tableau structure</div>
          <Tex block>{`\\begin{array}{c|${"c".repeat(n + m)}|c} \\text{basis} & ${Array.from({length: n}, (_, j) => `x_${j+1}`).join(" & ")} & ${Array.from({length: m}, (_, j) => `s_${j+1}`).join(" & ")} & b \\\\ \\hline z & ${Array.from({length: n}, (_, j) => `-c_${j+1}`).join(" & ")} & ${"0 & ".repeat(m).slice(0, -3)} & 0 \\\\ \\hline s_1 & ${Array.from({length: n}, () => "*").join(" & ")} & ${Array.from({length: m}, (_, j) => j === 0 ? "1" : "0").join(" & ")} & b_1 \\\\ \\vdots \\end{array}`}</Tex>
          <div style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.5 }}>
            <b>z-row</b> (top): negative objective coefficients on x-columns; zeros on slack columns; objective value on right. <b>Constraint rows</b>: original A on x-columns; identity on slack columns; b on right. The <b>basis</b> column lists which variables currently take value &gt; 0 (initially the slacks).
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tableau view
// ============================================================
function Tableau({ T, basis, n, m, hoverCol, onColumnClick, onRowClick, optimal, suggestedCol, suggestedRow, practiceMode }) {
  const totalCols = n + m + 1;
  const rcosts = T[m];

  // For ratio test highlighting
  let ratioInfo = null;
  if (hoverCol !== null && hoverCol >= 0 && hoverCol < n + m) {
    ratioInfo = ratioTest(T, m, hoverCol);
  }

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Simplex tableau {optimal ? "(optimal)" : ""}
      </div>
      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13, width: "100%" }}>
        <thead>
          <tr>
            <th style={thLeft}>basis</th>
            {Array.from({ length: n + m }, (_, j) => {
              const isHover = j === hoverCol;
              const isSuggest = !practiceMode && j === suggestedCol;
              const negative = rcosts[j] < -1e-9;
              return (
                <th
                  key={j}
                  onClick={() => onColumnClick(j)}
                  style={{
                    ...th,
                    cursor: negative ? "pointer" : "default",
                    background: isHover ? "#f5a524" : isSuggest ? "#fff4c8" : negative ? "#e8eef5" : "#fff",
                    color: isHover ? "#1f1d1a" : "#222",
                  }}
                >
                  {variableLabel(j, n)}
                </th>
              );
            })}
            <th style={th}>RHS</th>
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
              {fmt(T[m][totalCols - 1])}
            </td>
            {hoverCol !== null && <td style={{ ...td, borderBottom: "2px solid #444" }}></td>}
          </tr>
          {Array.from({ length: m }, (_, i) => {
            const r = ratioInfo?.ratios[i];
            const eligible = r && r.ok;
            const isMinRatio = r && eligible && i === ratioInfo.minRow;
            const rowBg = isMinRatio ? "#e8f5e9" : eligible ? "#fff8e1" : "transparent";
            return (
              <tr
                key={i}
                onClick={() => onRowClick(i)}
                style={{
                  background: rowBg,
                  cursor: hoverCol !== null ? "pointer" : "default",
                }}
              >
                <td style={tdLabel}>{variableLabel(basis[i], n)}</td>
                {Array.from({ length: n + m }, (_, j) => {
                  const v = T[i][j];
                  const isPivot = j === hoverCol && eligible;
                  return (
                    <td
                      key={j}
                      style={{
                        ...td,
                        background: isPivot ? "#f5a524" : isMinRatio && j === hoverCol ? "#7dd87d" : "transparent",
                        color: isPivot ? "#1f1d1a" : "#222",
                        fontWeight: j === hoverCol && eligible ? 700 : 400,
                      }}
                    >
                      {fmt(v)}
                    </td>
                  );
                })}
                <td style={{ ...td, fontWeight: 700 }}>{fmt(T[i][totalCols - 1])}</td>
                {hoverCol !== null && (
                  <td style={{ ...td, color: eligible ? "#0b3da0" : "#c8311c", fontStyle: "italic" }}>
                    {eligible ? `ratio = ${r.ratio.toFixed(3)}` : `aᵢⱼ ≤ 0`}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
        z-row shows negative reduced costs (column j with{" "}
        <Tex>{`-c_j + c_B^T B^{-1} A_j`}</Tex>). A negative entry means
        the corresponding variable would improve the objective if it
        entered the basis.
      </div>
    </div>
  );
}

function fmt(v) {
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(3);
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
function BasisStatus({ basis, T, n, m, optimal }) {
  const totalCols = T[0].length;
  const x = Array(n + m).fill(0);
  for (let i = 0; i < m; i++) x[basis[i]] = T[i][totalCols - 1];
  return (
    <div style={{ ...panel, marginTop: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Current basic feasible solution
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
                  color: x[j] > 1e-9 ? "#c8311c" : "#888",
                  fontWeight: x[j] > 1e-9 ? 700 : 400,
                }}
              >
                {fmt(x[j])}
              </td>
              <td style={{ padding: "2px 6px", color: "#666", fontStyle: "italic" }}>
                {x[j] > 1e-9 ? "(basic)" : "(non-basic)"}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #444" }}>
            <td style={{ padding: "2px 6px", fontWeight: 700 }}>z</td>
            <td style={{ padding: "2px 6px", textAlign: "right", fontWeight: 700, color: "#c8311c" }}>
              {fmt(T[m][totalCols - 1])}
            </td>
            <td>{optimal && <span style={{ color: "#1f4e3d", fontWeight: 700 }}>★ OPTIMAL</span>}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Feasible region plot — dispatches to 2D, 3D, or "no plot"
// ============================================================
function FeasibleRegionPlot({ T, basis, n, m, A, b }) {
  // Extract current vertex (works for any n)
  const totalCols = T[0].length;
  const xstar = Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    if (basis[i] < n) xstar[basis[i]] = T[i][totalCols - 1];
  }

  if (n === 2) return <Plot2D A={A} b={b} xstar={xstar} pivotPath={null} />;
  if (n === 3) return <Plot3D A={A} b={b} xstar={xstar} />;
  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Feasible region
      </div>
      <div style={{ padding: "20px 16px", fontSize: 13, color: "#666", textAlign: "center", fontStyle: "italic" }}>
        Plot only available for 2-variable or 3-variable LPs. With <b>{n}</b> decision variables, the feasible region lives in {n}-dimensional space — beyond what we can draw.
      </div>
    </div>
  );
}

// ============================================================
// 2D feasible region — works for any number of constraints
// ============================================================
function Plot2D({ A, b, xstar }) {
  const W = 480, H = 480;
  const padL = 50, padR = 16, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Compute vertices generically
  const vertices = useMemo(() => {
    const m = A.length;
    const lines = A.map((row, i) => [row[0], row[1], b[i]]);
    lines.push([1, 0, 0]); // x = 0
    lines.push([0, 1, 0]); // y = 0
    const verts = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const [a1, b1, c1] = lines[i];
        const [a2, b2, c2] = lines[j];
        const det = a1 * b2 - a2 * b1;
        if (Math.abs(det) < 1e-9) continue;
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        const eps = 1e-7;
        if (x < -eps || y < -eps) continue;
        let feasible = true;
        for (let k = 0; k < m; k++) {
          if (A[k][0] * x + A[k][1] * y > b[k] + eps) { feasible = false; break; }
        }
        if (feasible) verts.push({ x: Math.max(0, x), y: Math.max(0, y) });
      }
    }
    // De-duplicate
    const out = [];
    for (const v of verts) {
      if (!out.some((u) => Math.abs(u.x - v.x) < 1e-7 && Math.abs(u.y - v.y) < 1e-7))
        out.push(v);
    }
    return out;
  }, [A, b]);

  // Adaptive zoom
  const maxX = Math.max(...vertices.map((v) => v.x), 1);
  const maxY = Math.max(...vertices.map((v) => v.y), 1);
  const limit = Math.max(maxX, maxY) * 1.2;
  const xmin = -limit * 0.05, xmax = limit;
  const ymin = -limit * 0.05, ymax = limit;
  const xs = (x) => padL + ((x - xmin) / (xmax - xmin)) * chartW;
  const ys = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * chartH;

  // Sort vertices by polar angle around centroid for polygon drawing
  let polyPts = [];
  if (vertices.length >= 3) {
    const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    polyPts = [...vertices].sort(
      (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
  }

  // Tick labels — pick a "nice" step
  const tickStep = niceStep(limit / 5);
  const ticks = [];
  for (let v = 0; v <= limit; v += tickStep) ticks.push(v);

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Feasible region — current vertex highlighted (2D)
      </div>
      <svg width={W} height={H}>
        <line x1={padL} y1={ys(0)} x2={padL + chartW} y2={ys(0)} stroke="#888" />
        <line x1={xs(0)} y1={padT} x2={xs(0)} y2={padT + chartH} stroke="#888" />
        {polyPts.length >= 3 && (
          <polygon
            points={polyPts.map((p) => `${xs(p.x)},${ys(p.y)}`).join(" ")}
            fill="rgba(31, 78, 61, 0.12)"
            stroke="#1f4e3d"
            strokeWidth={1.5}
          />
        )}
        {vertices.map((v, i) => (
          <circle key={i} cx={xs(v.x)} cy={ys(v.y)} r={5} fill="#fff" stroke="#1f4e3d" strokeWidth={1.5} />
        ))}
        <circle cx={xs(xstar[0])} cy={ys(xstar[1])} r={9} fill="#c8311c" stroke="#fff" strokeWidth={2.5} />
        <text x={xs(xstar[0]) + 12} y={ys(xstar[1]) + 4} fontSize={12} fontFamily="monospace" fill="#c8311c" fontWeight={700}>
          ({fmt(xstar[0])}, {fmt(xstar[1])})
        </text>
        {ticks.map((v) => (
          <text key={`xl${v}`} x={xs(v)} y={padT + chartH + 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#666">
            {fmtTick(v)}
          </text>
        ))}
        {ticks.map((v) => (
          <text key={`yl${v}`} x={padL - 6} y={ys(v) + 3} textAnchor="end" fontSize={10} fontFamily="monospace" fill="#666">
            {fmtTick(v)}
          </text>
        ))}
        <text x={padL + chartW - 6} y={ys(0) - 6} textAnchor="end" fontSize={11} fontFamily="monospace" fill="#666">x₁</text>
        <text x={xs(0) + 8} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">x₂</text>
      </svg>
    </div>
  );
}

function fmtTick(v) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(1);
}
function niceStep(v) {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const f = v / Math.pow(10, exp);
  let nf;
  if (f < 1.5) nf = 1;
  else if (f < 3) nf = 2;
  else if (f < 7) nf = 5;
  else nf = 10;
  return nf * Math.pow(10, exp);
}

// ============================================================
// 3D feasible region — for n=3 LPs
// ============================================================
function Plot3D({ A, b, xstar }) {
  const W = 480, H = 480;
  const [azim, setAzim] = useState(35);   // degrees
  const [elev, setElev] = useState(25);   // degrees

  // Compute polytope vertices (3-subsets of m+3 half-spaces)
  const { vertices, edges, limit } = useMemo(() => {
    const m = A.length;
    // Half-spaces represented as plane equations a·x = b (with the half-space being a·x ≤ b)
    // Add x_j ≥ 0 → -e_j · x ≤ 0 (so the plane is x_j = 0)
    const planes = []; // {coeffs: [a,b,c], rhs, id}
    for (let i = 0; i < m; i++) planes.push({ coeffs: A[i], rhs: b[i], id: `c${i + 1}` });
    planes.push({ coeffs: [1, 0, 0], rhs: 0, id: "x1=0", isNonneg: true, axis: 0 });
    planes.push({ coeffs: [0, 1, 0], rhs: 0, id: "x2=0", isNonneg: true, axis: 1 });
    planes.push({ coeffs: [0, 0, 1], rhs: 0, id: "x3=0", isNonneg: true, axis: 2 });

    const verts = [];
    for (let i = 0; i < planes.length; i++) {
      for (let j = i + 1; j < planes.length; j++) {
        for (let k = j + 1; k < planes.length; k++) {
          const M = [planes[i].coeffs, planes[j].coeffs, planes[k].coeffs];
          const r = [planes[i].rhs, planes[j].rhs, planes[k].rhs];
          const sol = solve3x3(M, r);
          if (!sol) continue;
          const [x, y, z] = sol;
          const eps = 1e-7;
          if (x < -eps || y < -eps || z < -eps) continue;
          // Feasibility: check all original constraints
          let feas = true;
          for (let p = 0; p < m; p++) {
            if (A[p][0] * x + A[p][1] * y + A[p][2] * z > b[p] + eps) { feas = false; break; }
          }
          if (!feas) continue;
          verts.push({
            x: Math.max(0, x),
            y: Math.max(0, y),
            z: Math.max(0, z),
            active: [planes[i].id, planes[j].id, planes[k].id],
          });
        }
      }
    }
    // De-duplicate
    const uniq = [];
    for (const v of verts) {
      const dup = uniq.find((u) => Math.abs(u.x - v.x) < 1e-6 && Math.abs(u.y - v.y) < 1e-6 && Math.abs(u.z - v.z) < 1e-6);
      if (!dup) uniq.push(v);
      else {
        // merge active sets
        for (const id of v.active) if (!dup.active.includes(id)) dup.active.push(id);
      }
    }

    // Edges: pairs of vertices that share at least 2 active planes
    const eds = [];
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const shared = uniq[i].active.filter((id) => uniq[j].active.includes(id)).length;
        if (shared >= 2) eds.push([i, j]);
      }
    }
    const limit = Math.max(
      ...uniq.flatMap((v) => [v.x, v.y, v.z]),
      1
    );
    return { vertices: uniq, edges: eds, limit: limit * 1.1 };
  }, [A, b]);

  // Project (x, y, z) → (sx, sy) using azimuth/elevation rotation + orthographic
  function project(x, y, z) {
    const az = (azim * Math.PI) / 180;
    const el = (elev * Math.PI) / 180;
    // Center the data
    const cx = limit / 2, cy = limit / 2, cz = limit / 2;
    let X = x - cx, Y = y - cy, Z = z - cz;
    // Rotate around z-axis by azim
    const X1 = X * Math.cos(az) - Y * Math.sin(az);
    const Y1 = X * Math.sin(az) + Y * Math.cos(az);
    const Z1 = Z;
    // Tilt around x'-axis by elev
    const X2 = X1;
    const Y2 = Y1 * Math.cos(el) - Z1 * Math.sin(el);
    const Z2 = Y1 * Math.sin(el) + Z1 * Math.cos(el);
    // Orthographic — drop Y2 (it becomes "depth")
    const scale = (Math.min(W, H) - 80) / (limit * 1.5);
    const sx = W / 2 + X2 * scale;
    const sy = H / 2 - Z2 * scale;
    return { sx, sy, depth: Y2 };
  }

  const projVerts = vertices.map((v) => ({ ...project(v.x, v.y, v.z), v }));
  const projStar = project(xstar[0] || 0, xstar[1] || 0, xstar[2] || 0);

  // Axes endpoints
  const O = project(0, 0, 0);
  const Ax = project(limit, 0, 0);
  const Ay = project(0, limit, 0);
  const Az = project(0, 0, limit);

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Feasible polytope — current vertex highlighted (3D)
      </div>
      <svg width={W} height={H} style={{ background: "#fafbfc", borderRadius: 6 }}>
        {/* Axes */}
        <line x1={O.sx} y1={O.sy} x2={Ax.sx} y2={Ax.sy} stroke="#999" strokeWidth={1} />
        <line x1={O.sx} y1={O.sy} x2={Ay.sx} y2={Ay.sy} stroke="#999" strokeWidth={1} />
        <line x1={O.sx} y1={O.sy} x2={Az.sx} y2={Az.sy} stroke="#999" strokeWidth={1} />
        <text x={Ax.sx + 8} y={Ax.sy + 3} fontSize={11} fontFamily="monospace" fill="#666">x₁</text>
        <text x={Ay.sx + 8} y={Ay.sy + 3} fontSize={11} fontFamily="monospace" fill="#666">x₂</text>
        <text x={Az.sx} y={Az.sy - 6} fontSize={11} fontFamily="monospace" fill="#666">x₃</text>

        {/* Edges (back-to-front order via depth midpoint) */}
        {edges
          .map(([i, j]) => ({
            i, j,
            depth: (projVerts[i].depth + projVerts[j].depth) / 2,
          }))
          .sort((a, b) => a.depth - b.depth)
          .map(({ i, j }) => (
            <line
              key={`${i}-${j}`}
              x1={projVerts[i].sx} y1={projVerts[i].sy}
              x2={projVerts[j].sx} y2={projVerts[j].sy}
              stroke="#1f4e3d" strokeWidth={1.4} strokeOpacity={0.7}
            />
          ))}

        {/* Vertices */}
        {projVerts.map((p, i) => (
          <circle key={i} cx={p.sx} cy={p.sy} r={4} fill="#fff" stroke="#1f4e3d" strokeWidth={1.4} />
        ))}

        {/* Current vertex */}
        <circle cx={projStar.sx} cy={projStar.sy} r={9} fill="#c8311c" stroke="#fff" strokeWidth={2.5} />
        <text x={projStar.sx + 12} y={projStar.sy + 4} fontSize={12} fontFamily="monospace" fill="#c8311c" fontWeight={700}>
          ({fmt(xstar[0] || 0)}, {fmt(xstar[1] || 0)}, {fmt(xstar[2] || 0)})
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 6 }}>
        <label style={{ fontSize: 12, color: "#444", fontFamily: "monospace" }}>
          azimuth: <b>{azim}°</b>
          <input type="range" min={-180} max={180} value={azim} onChange={(e) => setAzim(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={{ fontSize: 12, color: "#444", fontFamily: "monospace" }}>
          elevation: <b>{elev}°</b>
          <input type="range" min={-90} max={90} value={elev} onChange={(e) => setElev(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>
      <div style={{ fontSize: 11, color: "#777", marginTop: 4, fontStyle: "italic" }}>
        Drag the sliders to rotate. Edges of the polytope are drawn between vertices that share two active constraint planes — every simplex pivot moves along one of these edges.
      </div>
    </div>
  );
}

// Solve 3x3 linear system; returns null if singular
function solve3x3(M, r) {
  const det =
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  if (Math.abs(det) < 1e-10) return null;
  const inv = 1 / det;
  const x =
    (r[0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
      M[0][1] * (r[1] * M[2][2] - M[1][2] * r[2]) +
      M[0][2] * (r[1] * M[2][1] - M[1][1] * r[2])) * inv;
  const y =
    (M[0][0] * (r[1] * M[2][2] - M[1][2] * r[2]) -
      r[0] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
      M[0][2] * (M[1][0] * r[2] - r[1] * M[2][0])) * inv;
  const z =
    (M[0][0] * (M[1][1] * r[2] - r[1] * M[2][1]) -
      M[0][1] * (M[1][0] * r[2] - r[1] * M[2][0]) +
      r[0] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])) * inv;
  return [x, y, z];
}

// ============================================================
// Sensitivity & duality panel (only when optimal)
// ============================================================
function SensitivityPanel({ T, basis, n, m, A, b, c }) {
  const totalCols = T[0].length;
  // Dual values are reduced costs of the slack variables (with sign convention).
  // In the canonical 'min cz, Ax = b, x>=0' form with slacks added, the
  // optimal dual for constraint i is the z-row entry of the slack column.
  const pi = [];
  for (let i = 0; i < m; i++) pi.push(T[m][n + i]);
  // Reduced costs of original variables
  const rc = [];
  for (let j = 0; j < n; j++) rc.push(T[m][j]);

  return (
    <div style={{ ...panel, marginTop: 12, background: "#fff8e1", borderColor: "#f5d68d" }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        Optimal — read off duality + sensitivity from the tableau
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13, borderCollapse: "collapse" }}>
        <tbody>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <td style={{ padding: 4, color: "#555" }}>shadow price π₁ (constraint 1)</td>
            <td style={{ padding: 4, textAlign: "right", color: "#0b3da0", fontWeight: 700 }}>{pi[0].toFixed(4)}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <td style={{ padding: 4, color: "#555" }}>shadow price π₂ (constraint 2)</td>
            <td style={{ padding: 4, textAlign: "right", color: "#7a3da0", fontWeight: 700 }}>{pi[1].toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: 4, color: "#555" }}>reduced cost (x₁)</td>
            <td style={{ padding: 4, textAlign: "right" }}>{rc[0].toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: 4, color: "#555" }}>reduced cost (x₂)</td>
            <td style={{ padding: 4, textAlign: "right" }}>{rc[1].toFixed(4)}</td>
          </tr>
          <tr style={{ borderTop: "2px solid #444" }}>
            <td style={{ padding: 4 }}>
              dual obj <Tex>{`b^T \\pi`}</Tex>
            </td>
            <td style={{ padding: 4, textAlign: "right", fontWeight: 700, color: "#c8311c" }}>
              {(b[0] * pi[0] + b[1] * pi[1]).toFixed(4)}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 13, color: "#3d2f00", lineHeight: 1.5 }}>
        The slack-column entries of the z-row ARE the optimal dual values
        — that's how simplex solvers extract <Tex>{`\\pi`}</Tex> for free.
        Strong duality: primal obj = dual obj at optimum (verify above).
      </div>
    </div>
  );
}

// ============================================================
// Pivot algebra panel — shows the elementary row operations
// performed during the most recent pivot, written out in TeX.
// ============================================================
function PivotAlgebraPanel({ T_before, T_after, row, col, n, m }) {
  const pivVal = T_before[row][col];
  const colName = col < n ? `x_${col + 1}` : `s_${col - n + 1}`;
  const rowName = row === m ? "z" : `R_${row + 1}`;

  // List elimination ops (one per row != pivot row that had non-zero in col)
  const elims = [];
  for (let i = 0; i < T_before.length; i++) {
    if (i === row) continue;
    const f = T_before[i][col];
    if (Math.abs(f) < 1e-12) continue;
    elims.push({ i, factor: f });
  }

  return (
    <div style={{ ...panel, marginTop: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Pivot algebra — what just happened
      </div>
      <div style={{ fontSize: 13, marginBottom: 6 }}>
        Pivoted at <Tex>{`(${rowName},\\, ${colName})`}</Tex>; pivot value{" "}
        <Tex>{`a_{pq} = ${fmt(pivVal)}`}</Tex>.
      </div>

      {Math.abs(pivVal - 1) > 1e-9 && (
        <div style={algStep}>
          <span style={{ fontWeight: 600 }}>1. Scale the pivot row.</span>
          <Tex block>
            {`${rowName} \\;\\leftarrow\\; \\frac{1}{${fmt(pivVal)}} \\, ${rowName}`}
          </Tex>
        </div>
      )}

      <div style={algStep}>
        <span style={{ fontWeight: 600 }}>
          {Math.abs(pivVal - 1) > 1e-9 ? "2. " : "1. "}Eliminate column{" "}
          <Tex>{colName}</Tex> in every other row.
        </span>
        {elims.length === 0 ? (
          <div style={{ fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" }}>
            (column already zero everywhere except the pivot row — no work to do.)
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

      <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
        After these row operations, column <Tex>{colName}</Tex> is the unit
        vector with 1 in row {row + 1} and 0 elsewhere — exactly what's
        needed for <Tex>{colName}</Tex> to be the new basic variable in
        row {row + 1}.
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
// Pivot rules panel
// ============================================================
function PivotRulesPanel() {
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        Pivot rules — reference card
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, fontSize: 13 }}>
        <div>
          <b>Entering variable (column):</b>
          <ul style={{ paddingLeft: 22, margin: "4px 0", lineHeight: 1.6 }}>
            <li><b>Dantzig:</b> most-negative reduced cost (default — fast to compute, few iterations).</li>
            <li><b>Bland's rule:</b> smallest-index column with negative reduced cost (anti-cycling).</li>
            <li><b>Steepest edge:</b> normalize reduced cost by direction-norm (fewer iters, expensive per-step).</li>
            <li><b>Devex:</b> approximation of steepest edge (the default in CPLEX/Gurobi).</li>
          </ul>
        </div>
        <div>
          <b>Leaving variable (row):</b>
          <ul style={{ paddingLeft: 22, margin: "4px 0", lineHeight: 1.6 }}>
            <li><b>Min-ratio test:</b> over rows with{" "}
              <Tex>{`a_{ij} > 0`}</Tex>, pick the row with smallest{" "}
              <Tex>{`b_i / a_{ij}`}</Tex>. This keeps the next BFS feasible.
            </li>
            <li><b>Bland's rule:</b> smallest-index basic variable (with valid pivot).</li>
            <li><b>Lex / lexicographic:</b> tie-break by lex order on the row — guarantees no cycling.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

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
          <b>Geometric intuition.</b> Each tableau corresponds to a vertex
          of the feasible polytope. Pivoting moves to an ADJACENT vertex
          along an edge of the polytope. The simplex method walks
          vertex-to-vertex toward the optimum.
        </li>
        <li>
          <b>Why the ratio test.</b> Increasing the entering variable
          forces basic variables to change; the min-ratio bounds how far
          you can go before a basic variable hits zero. The minimum
          determines which basic variable becomes non-basic.
        </li>
        <li>
          <b>Cycling and degeneracy.</b> If two ratios tie (degenerate),
          some pivot rules can cycle indefinitely. Bland's rule and the
          lex rule prevent cycling but are slower in practice.
        </li>
        <li>
          <b>Dual simplex.</b> Same tableau, but pivoted to maintain dual
          feasibility instead of primal. Useful when adding cuts
          (post-LP-modification) — the previous optimal basis is now
          infeasible, and dual simplex restores it cheaply.
        </li>
        <li>
          <b>Why this matters in MIP.</b> Branch-and-bound runs ONE LP per
          node. Warm-starting via dual simplex (using the parent's
          basis) is what makes B&B tractable — restarting primal simplex
          would be 10–100× slower.
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
