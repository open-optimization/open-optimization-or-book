import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Plus, Minus } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   PRIMAL → DUAL CONSTRUCTION WALKTHROUGH
   ISE 5406

   Build the dual of a general LP step by step, applying the
   canonical correspondence rules (Bertsimas–Tsitsiklis table)
   one at a time. The student sees:

     Stage 0 — primal (read off matrix data)
     Stage 1 — transpose A
     Stage 2 — swap b ↔ c
     Stage 3 — flip objective sense
     Stage 4 — convert each primal CONSTRAINT to a dual VAR
               with sign rule highlighted
     Stage 5 — convert each primal VAR to a dual CONSTRAINT
               with sign rule highlighted
     Stage 6 — final dual displayed in TeX

   Editable: each constraint and variable's "form" can be
   toggled with dropdowns to see how the dual changes.
   ============================================================ */

// ============================================================
// Primal data — defaults
// ============================================================
const DEFAULT_C = [3, 5];
const DEFAULT_A = [
  [2, 1],
  [1, 3],
];
const DEFAULT_B = [8, 6];
// constraintTypes[i] in {"<=", "=", ">="}
// varForms[j]      in {">=0", "free", "<=0"}
const DEFAULT_CONS_TYPES = ["<=", "<="];
const DEFAULT_VAR_FORMS = [">=0", ">=0"];

// ============================================================
// Rules table (max primal → min dual; flip for min primal)
// ============================================================
function dualVarSignFromConstraint(consType, primalSense) {
  // For max primal:
  //   <= → dual var ≥ 0
  //   =  → dual var free
  //   >= → dual var ≤ 0
  // For min primal: flip (≤ → ≤0, etc.)
  if (primalSense === "max") {
    if (consType === "<=") return ">=0";
    if (consType === "=")  return "free";
    if (consType === ">=") return "<=0";
  } else {
    if (consType === ">=") return ">=0";
    if (consType === "=")  return "free";
    if (consType === "<=") return "<=0";
  }
  return ">=0";
}

function dualConsSignFromVar(varForm, primalSense) {
  // For max primal:
  //   x_j ≥ 0 → dual constraint ≥
  //   x_j free → dual constraint =
  //   x_j ≤ 0 → dual constraint ≤
  // For min primal: flip.
  if (primalSense === "max") {
    if (varForm === ">=0") return ">=";
    if (varForm === "free") return "=";
    if (varForm === "<=0") return "<=";
  } else {
    if (varForm === ">=0") return "<=";
    if (varForm === "free") return "=";
    if (varForm === "<=0") return ">=";
  }
  return ">=";
}

const STAGES = [
  { id: 0, label: "Primal", desc: "Identify the primal data: c, A, b. Note each constraint type and each variable's sign restriction." },
  { id: 1, label: "Transpose A", desc: "The dual constraint matrix is Aᵀ. Rows ↔ columns." },
  { id: 2, label: "Swap b ↔ c", desc: "The cost vector b becomes the dual's RHS in objective; c becomes the dual's RHS in constraints." },
  { id: 3, label: "Flip objective sense", desc: "max ↔ min. Strong duality guarantees the optimal values match." },
  { id: 4, label: "Constraint → dual variable", desc: "Each primal CONSTRAINT becomes a dual VARIABLE. The constraint type determines the sign restriction on the new dual variable." },
  { id: 5, label: "Variable → dual constraint", desc: "Each primal VARIABLE becomes a dual CONSTRAINT. The variable's sign restriction determines the constraint type." },
  { id: 6, label: "Final dual", desc: "Read off the dual: combine objective, constraints, and sign restrictions." },
];

// ============================================================
// Main component
// ============================================================
export default function DualConstructionDemo() {
  const [c, setC] = useState(DEFAULT_C);
  const [A, setA] = useState(DEFAULT_A);
  const [b, setB] = useState(DEFAULT_B);
  const [primalSense, setPrimalSense] = useState("max");
  const [consTypes, setConsTypes] = useState(DEFAULT_CONS_TYPES);
  const [varForms, setVarForms] = useState(DEFAULT_VAR_FORMS);
  const [stage, setStage] = useState(0);

  const m = A.length;
  const n = c.length;

  function setAij(i, j, v) {
    const A2 = A.map((r) => [...r]);
    A2[i][j] = v;
    setA(A2);
  }

  function addVar() {
    setC([...c, 0]);
    setA(A.map((r) => [...r, 0]));
    setVarForms([...varForms, ">=0"]);
  }
  function removeVar() {
    if (c.length <= 1) return;
    setC(c.slice(0, -1));
    setA(A.map((r) => r.slice(0, -1)));
    setVarForms(varForms.slice(0, -1));
  }
  function addCons() {
    setA([...A, Array(n).fill(0)]);
    setB([...b, 0]);
    setConsTypes([...consTypes, "<="]);
  }
  function removeCons() {
    if (A.length <= 1) return;
    setA(A.slice(0, -1));
    setB(b.slice(0, -1));
    setConsTypes(consTypes.slice(0, -1));
  }
  function reset() {
    setStage(0);
  }

  // Compute the dual data lazily
  const dualSense = primalSense === "max" ? "min" : "max";
  const dualVarSigns = useMemo(
    () => consTypes.map((t) => dualVarSignFromConstraint(t, primalSense)),
    [consTypes, primalSense]
  );
  const dualConsTypes = useMemo(
    () => varForms.map((f) => dualConsSignFromVar(f, primalSense)),
    [varForms, primalSense]
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Primal → Dual Construction
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        Build the dual of any LP step by step. At each stage, the rules of
        primal-dual correspondence are applied one at a time — transpose,
        swap, flip, then sign-rules per constraint and per variable. Toggle
        any constraint type or variable sign to see the dual reshape.
      </p>

      <ProblemEditor
        c={c}
        A={A}
        b={b}
        setC={setC}
        setA={setA}
        setB={setB}
        primalSense={primalSense}
        setPrimalSense={setPrimalSense}
        consTypes={consTypes}
        setConsTypes={setConsTypes}
        varForms={varForms}
        setVarForms={setVarForms}
        addVar={addVar}
        removeVar={removeVar}
        addCons={addCons}
        removeCons={removeCons}
      />

      <StageControls stage={stage} setStage={setStage} reset={reset} />

      <StageNarration stage={stage} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 14, alignItems: "flex-start" }}>
        <PrimalPanel
          c={c}
          A={A}
          b={b}
          primalSense={primalSense}
          consTypes={consTypes}
          varForms={varForms}
          stage={stage}
        />
        <DualPanel
          c={c}
          A={A}
          b={b}
          dualSense={dualSense}
          dualVarSigns={dualVarSigns}
          dualConsTypes={dualConsTypes}
          stage={stage}
          primalSense={primalSense}
          consTypes={consTypes}
          varForms={varForms}
        />
      </div>

      <RulesTable />

      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Problem editor
// ============================================================
function ProblemEditor({
  c, A, b, setC, setA, setB,
  primalSense, setPrimalSense,
  consTypes, setConsTypes,
  varForms, setVarForms,
  addVar, removeVar, addCons, removeCons,
}) {
  const m = A.length, n = c.length;
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
  function setConsI(i, v) {
    const arr = [...consTypes];
    arr[i] = v;
    setConsTypes(arr);
  }
  function setVarJ(j, v) {
    const arr = [...varForms];
    arr[j] = v;
    setVarForms(arr);
  }

  return (
    <div style={editorBox}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
        Edit the primal LP
      </div>

      <div style={{ marginBottom: 8 }}>
        <select value={primalSense} onChange={(e) => setPrimalSense(e.target.value)} style={selectBox}>
          <option value="max">max</option>
          <option value="min">min</option>
        </select>
        &nbsp;<Tex>{`c^T x`}</Tex>
      </div>

      <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
        <thead>
          <tr>
            <td></td>
            {Array.from({ length: n }, (_, j) => (
              <th key={j} style={editTh}>x<sub>{j + 1}</sub></th>
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
              objective coefficients
            </td>
          </tr>
          {A.map((row, i) => (
            <tr key={i}>
              <td style={editLab}>R<sub>{i + 1}</sub></td>
              {row.map((v, j) => (
                <td key={j}><NumInput value={v} onChange={(x) => setAij(i, j, x)} /></td>
              ))}
              <td style={{ padding: "0 4px" }}>
                <select value={consTypes[i]} onChange={(e) => setConsI(i, e.target.value)} style={selectBoxSmall}>
                  <option value="<=">≤</option>
                  <option value="=">=</option>
                  <option value=">=">≥</option>
                </select>
              </td>
              <td><NumInput value={b[i]} onChange={(x) => setBi(i, x)} /></td>
            </tr>
          ))}
          <tr>
            <td style={editLab}>sign</td>
            {varForms.map((f, j) => (
              <td key={j}>
                <select value={f} onChange={(e) => setVarJ(j, e.target.value)} style={selectBoxSmall}>
                  <option value=">=0">≥ 0</option>
                  <option value="free">free</option>
                  <option value="<=0">≤ 0</option>
                </select>
              </td>
            ))}
            <td colSpan={2} style={{ paddingLeft: 10, color: "#888", fontSize: 12 }}>
              variable sign restrictions
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={addVar} style={btnSmall}><Plus size={12} /> variable</button>
        <button onClick={removeVar} style={btnSmall}><Minus size={12} /> variable</button>
        <button onClick={addCons} style={btnSmall}><Plus size={12} /> constraint</button>
        <button onClick={removeCons} style={btnSmall}><Minus size={12} /> constraint</button>
      </div>
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
// Stage controls
// ============================================================
function StageControls({ stage, setStage, reset }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
      <button onClick={() => setStage(Math.max(0, stage - 1))} disabled={stage === 0} style={btn}>
        <ChevronLeft size={14} /> Prev
      </button>
      <button onClick={() => setStage(Math.min(STAGES.length - 1, stage + 1))} disabled={stage === STAGES.length - 1} style={btnPrimary}>
        Next stage <ChevronRight size={14} />
      </button>
      <button onClick={reset} style={btn}><RotateCcw size={14} /> Reset</button>
      <span style={{ marginLeft: 8, fontFamily: "monospace", fontSize: 12, color: "#666" }}>
        stage {stage} / {STAGES.length - 1} — <b>{STAGES[stage].label}</b>
      </span>
    </div>
  );
}

// ============================================================
// Stage narration (the rule of the moment)
// ============================================================
function StageNarration({ stage }) {
  const s = STAGES[stage];
  return (
    <div style={{ padding: "10px 14px", background: "#fff8e1", border: "1px solid #f5d68d", borderRadius: 8, marginBottom: 14, fontSize: 14, lineHeight: 1.55 }}>
      <b>Stage {s.id} — {s.label}.</b> {s.desc}
    </div>
  );
}

// ============================================================
// Primal panel — same layout, with stage-driven highlights
// ============================================================
function PrimalPanel({ c, A, b, primalSense, consTypes, varForms, stage }) {
  const m = A.length, n = c.length;
  return (
    <div style={panel}>
      <div style={panelTitle}>Primal</div>
      <Tex block>
        {`\\begin{aligned}\\${primalSense}\\quad & \\sum_{j=1}^{${n}} c_j x_j \\\\ \\text{s.t.}\\quad & \\sum_{j=1}^{${n}} a_{ij} x_j \\;${consToTex(consTypes[0] || "<=")}\\; b_i, \\quad i=1,\\dots,${m} \\\\ & x_j \\;${varFormToTex(varForms[0] || ">=0")},\\quad j=1,\\dots,${n} \\end{aligned}`}
      </Tex>
      <div style={{ marginTop: 10, fontSize: 12, color: "#777", fontFamily: "monospace" }}>
        Concrete instance:
      </div>
      <ConcretePrimal c={c} A={A} b={b} primalSense={primalSense} consTypes={consTypes} varForms={varForms} highlightedRow={stage === 4 ? "all-rows" : null} highlightedCol={stage === 5 ? "all-cols" : null} />
    </div>
  );
}

function ConcretePrimal({ c, A, b, primalSense, consTypes, varForms, highlightedRow, highlightedCol }) {
  const m = A.length, n = c.length;
  return (
    <div>
      <Tex block>
        {`${primalSense === "max" ? "\\max" : "\\min"} \\quad ${c.map((v, j) => `${signTerm(v, j === 0)}\\,x_${j + 1}`).join(" ")}`}
      </Tex>
      <Tex block>
        {`\\begin{aligned}\\text{s.t.}\\quad ${A.map((row, i) =>
          `& ${row.map((v, j) => `${signTerm(v, j === 0)}\\,x_${j + 1}`).join(" ")} \\;${consToTex(consTypes[i])}\\; ${fmtNum(b[i])} \\\\`
        ).join("")} \\end{aligned}`}
      </Tex>
      <Tex block>
        {`${varForms.map((f, j) => `x_${j + 1}\\;${varFormToTex(f)}`).join(",\\quad ")}`}
      </Tex>
    </div>
  );
}

function signTerm(v, first) {
  const av = Math.abs(v);
  const num = (Math.abs(av - Math.round(av)) < 1e-9) ? String(Math.round(av)) : av.toFixed(2);
  if (first) {
    return v < 0 ? `-${num}` : num;
  } else {
    return v < 0 ? `- ${num}` : `+ ${num}`;
  }
}
function consToTex(t) {
  return t === "<=" ? "\\leq" : t === ">=" ? "\\geq" : "=";
}
function varFormToTex(f) {
  return f === ">=0" ? "\\geq 0" : f === "<=0" ? "\\leq 0" : "\\text{ free}";
}

// ============================================================
// Dual panel — progressively reveals as stages advance
// ============================================================
function DualPanel({ c, A, b, dualSense, dualVarSigns, dualConsTypes, stage, primalSense, consTypes, varForms }) {
  const m = A.length, n = c.length;

  const showTransposed = stage >= 1;
  const showSwapped = stage >= 2;
  const showSenseFlipped = stage >= 3;
  const showVarSigns = stage >= 4;
  const showConsTypes = stage >= 5;
  const showFinal = stage >= 6;

  // Build the dual-side equation strings
  // Dual: <sense> b^T y, A^T y <op> c, y sign
  return (
    <div style={panel}>
      <div style={panelTitle}>Dual (built up)</div>

      {stage === 0 && (
        <div style={{ color: "#888", fontStyle: "italic" }}>
          Press <b>Next stage</b> to begin building the dual.
        </div>
      )}

      {stage >= 1 && (
        <div style={subSection}>
          <div style={subTitle}>Stage 1 · Transpose A</div>
          <Tex block>
            {`A = \\begin{bmatrix}${A.map((row) => row.map(fmtNum).join(" & ")).join(" \\\\ ")}\\end{bmatrix} \\;\\to\\; A^T = \\begin{bmatrix}${transpose(A).map((row) => row.map(fmtNum).join(" & ")).join(" \\\\ ")}\\end{bmatrix}`}
          </Tex>
          <div style={{ fontSize: 12, color: "#666" }}>
            Each row of A becomes a column of Aᵀ — there are now {n} rows
            (one per primal variable) and {m} columns (one per primal
            constraint).
          </div>
        </div>
      )}

      {stage >= 2 && (
        <div style={subSection}>
          <div style={subTitle}>Stage 2 · Swap b ↔ c</div>
          <Tex block>
            {`c = \\begin{bmatrix}${c.map(fmtNum).join(" \\\\ ")}\\end{bmatrix},\\quad b = \\begin{bmatrix}${b.map(fmtNum).join(" \\\\ ")}\\end{bmatrix}\\;\\Longrightarrow\\; \\text{dual obj coeffs} = b,\\quad \\text{dual RHS} = c`}
          </Tex>
        </div>
      )}

      {stage >= 3 && (
        <div style={subSection}>
          <div style={subTitle}>Stage 3 · Flip objective sense</div>
          <Tex block>
            {`\\text{primal: }\\;${primalSense === "max" ? "\\max" : "\\min"}\\;c^T x \\;\\Longrightarrow\\; \\text{dual: }\\;${dualSense === "max" ? "\\max" : "\\min"}\\;b^T y`}
          </Tex>
        </div>
      )}

      {stage >= 4 && (
        <div style={subSection}>
          <div style={subTitle}>Stage 4 · Each primal constraint becomes a dual variable</div>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={cellTh}>primal constraint</th>
                <th style={cellTh}>type</th>
                <th style={cellTh}>→ dual variable</th>
                <th style={cellTh}>sign rule</th>
              </tr>
            </thead>
            <tbody>
              {A.map((_, i) => (
                <tr key={i}>
                  <td style={cellTd}><Tex>{`R_${i + 1}`}</Tex></td>
                  <td style={cellTd}><Tex>{consToTex(consTypes[i])}</Tex></td>
                  <td style={cellTd}><Tex>{`y_${i + 1}`}</Tex></td>
                  <td style={cellTd}>
                    <Tex>{`y_${i + 1}\\;${varFormToTex(dualVarSigns[i])}`}</Tex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stage >= 5 && (
        <div style={subSection}>
          <div style={subTitle}>Stage 5 · Each primal variable becomes a dual constraint</div>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={cellTh}>primal variable</th>
                <th style={cellTh}>sign</th>
                <th style={cellTh}>→ dual constraint</th>
                <th style={cellTh}>type</th>
              </tr>
            </thead>
            <tbody>
              {c.map((_, j) => (
                <tr key={j}>
                  <td style={cellTd}><Tex>{`x_${j + 1}`}</Tex></td>
                  <td style={cellTd}><Tex>{varFormToTex(varForms[j])}</Tex></td>
                  <td style={cellTd}>
                    <Tex>{`\\sum_{i=1}^{${A.length}} a_{i${j + 1}}\\,y_i \\;${consToTex(dualConsTypes[j])}\\; ${fmtNum(c[j])}`}</Tex>
                  </td>
                  <td style={cellTd}><Tex>{consToTex(dualConsTypes[j])}</Tex></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stage >= 6 && (
        <div style={{ ...subSection, background: "#e8f5e9", borderColor: "#7dd87d" }}>
          <div style={subTitle}>Stage 6 · Final dual</div>
          <FinalDual c={c} A={A} b={b} dualSense={dualSense} dualVarSigns={dualVarSigns} dualConsTypes={dualConsTypes} />
        </div>
      )}
    </div>
  );
}

function FinalDual({ c, A, b, dualSense, dualVarSigns, dualConsTypes }) {
  const m = A.length, n = c.length;
  const At = transpose(A);
  return (
    <div>
      <Tex block>
        {`${dualSense === "max" ? "\\max" : "\\min"} \\quad ${b.map((v, i) => `${signTerm(v, i === 0)}\\,y_${i + 1}`).join(" ")}`}
      </Tex>
      <Tex block>
        {`\\begin{aligned}\\text{s.t.}\\quad ${At.map((row, j) =>
          `& ${row.map((v, i) => `${signTerm(v, i === 0)}\\,y_${i + 1}`).join(" ")} \\;${consToTex(dualConsTypes[j])}\\; ${fmtNum(c[j])} \\\\`
        ).join("")} \\end{aligned}`}
      </Tex>
      <Tex block>
        {`${dualVarSigns.map((s, i) => `y_${i + 1}\\;${varFormToTex(s)}`).join(",\\quad ")}`}
      </Tex>
    </div>
  );
}

// ============================================================
// Rules table — the textbook reference card
// ============================================================
function RulesTable() {
  return (
    <div style={{ marginTop: 22, padding: 14, background: "#fafafa", border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Primal–Dual correspondence (Bertsimas-Tsitsiklis table)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>If primal is <i>max</i>:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr><th style={cellTh}>primal</th><th style={cellTh}>dual</th></tr>
            </thead>
            <tbody>
              <tr><td style={cellTd}>≤ constraint</td><td style={cellTd}>variable ≥ 0</td></tr>
              <tr><td style={cellTd}>= constraint</td><td style={cellTd}>variable free</td></tr>
              <tr><td style={cellTd}>≥ constraint</td><td style={cellTd}>variable ≤ 0</td></tr>
              <tr><td style={cellTd}>variable ≥ 0</td><td style={cellTd}>≥ constraint</td></tr>
              <tr><td style={cellTd}>variable free</td><td style={cellTd}>= constraint</td></tr>
              <tr><td style={cellTd}>variable ≤ 0</td><td style={cellTd}>≤ constraint</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>If primal is <i>min</i>:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr><th style={cellTh}>primal</th><th style={cellTh}>dual</th></tr>
            </thead>
            <tbody>
              <tr><td style={cellTd}>≥ constraint</td><td style={cellTd}>variable ≥ 0</td></tr>
              <tr><td style={cellTd}>= constraint</td><td style={cellTd}>variable free</td></tr>
              <tr><td style={cellTd}>≤ constraint</td><td style={cellTd}>variable ≤ 0</td></tr>
              <tr><td style={cellTd}>variable ≥ 0</td><td style={cellTd}>≤ constraint</td></tr>
              <tr><td style={cellTd}>variable free</td><td style={cellTd}>= constraint</td></tr>
              <tr><td style={cellTd}>variable ≤ 0</td><td style={cellTd}>≥ constraint</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#555", lineHeight: 1.55 }}>
        <b>Mnemonic.</b> When the primal is in the <i>natural</i> direction
        (max with ≤, min with ≥), the corresponding dual variable is
        non-negative. Anything else (= constraints, free variables) lands in
        the middle "= / free" row. The opposite direction flips signs.
      </div>
    </div>
  );
}

// ============================================================
// Pedagogical notes
// ============================================================
function PedagogicalNotes() {
  return (
    <div style={{ marginTop: 22, padding: 16, background: "#fff8e1", borderRadius: 10, border: "1px solid #f5d68d" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Notes for class</div>
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6, fontSize: 14, color: "#3d2f00" }}>
        <li>
          <b>Strong duality.</b> If the primal has a finite optimum, so does
          the dual, and the optimal values are equal. The interactive
          Sensitivity demo verifies this numerically on a worked example.
        </li>
        <li>
          <b>Why the sign rules.</b> The rules come from feasibility of the
          KKT conditions. For a max-primal with a ≤ constraint, the
          Lagrange multiplier must be ≥ 0; for a ≥ constraint it must be ≤
          0; for an equality it can be anything (no sign restriction).
          That's exactly the same multiplier as the dual variable.
        </li>
        <li>
          <b>Free variable shortcut.</b> A free primal variable can be
          replaced by <Tex>{`x_j = x_j^+ - x_j^-`}</Tex> with{" "}
          <Tex>{`x_j^\\pm \\ge 0`}</Tex>. The two non-negativity constraints
          give a pair of dual constraints — combined, they collapse into a
          single equality. That's the source of the "free variable → equality
          dual constraint" rule.
        </li>
        <li>
          <b>Symmetry.</b> Take the dual of the dual: you get back the
          primal. Verify this in the demo by entering an LP, stepping to
          stage 6, and treating the resulting dual as a new primal — apply
          the rules again.
        </li>
        <li>
          <b>Equality vs inequality form.</b> Most simplex textbooks start in
          standard form (<i>min</i>, <i>=</i>, <i>x ≥ 0</i>). In that
          standard primal: the dual variables are unrestricted (free), and
          the dual constraints are all ≤. Our table above reduces to that
          special case when you set every primal constraint to "=" and every
          variable to "≥ 0".
        </li>
      </ul>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================
function transpose(A) {
  const m = A.length, n = A[0].length;
  const At = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) At[j][i] = A[i][j];
  return At;
}
function fmtNum(v) {
  if (Math.abs(v) < 1e-10) return "0";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return v.toFixed(2);
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
const panelTitle = {
  fontFamily: "monospace",
  fontSize: 11,
  letterSpacing: "0.18em",
  color: "#666",
  marginBottom: 8,
  textTransform: "uppercase",
};
const subSection = {
  marginTop: 12,
  padding: 10,
  background: "#fff",
  border: "1px solid #e3e3e3",
  borderRadius: 6,
};
const subTitle = {
  fontWeight: 700,
  fontSize: 13,
  color: "#0b3da0",
  marginBottom: 6,
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
const cellTh = { padding: "4px 8px", borderBottom: "2px solid #888", textAlign: "left", fontSize: 12, color: "#555" };
const cellTd = { padding: "4px 8px", borderBottom: "1px solid #eee", verticalAlign: "middle" };
const selectBox = {
  padding: "4px 8px",
  fontFamily: "monospace",
  fontSize: 13,
  border: "1px solid #ccc",
  borderRadius: 4,
  background: "#fff",
};
const selectBoxSmall = {
  ...selectBox,
  padding: "2px 4px",
  fontSize: 12,
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
