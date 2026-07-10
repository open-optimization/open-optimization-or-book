import React, { useState } from "react";
import { Terminal } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   EXCEL SOLVER — tutorial
   ISE 5406

   Three problem types, each laid out as a spreadsheet so
   students can see exactly what cells to fill in:

     • LP   (production planning)
     • IP   (binary knapsack)
     • NLP  (curve fitting / nonlinear regression)

   Each tab shows:
     • The spreadsheet with formulas
     • The Solver Parameters dialog (mockup)
     • The result after Solve
     • Pedagogical notes on Excel-specific gotchas
   ============================================================ */

const TABS = [
  { key: "lp", label: "LP — Production planning", color: "#1f4e3d" },
  { key: "ip", label: "IP — 0/1 Knapsack", color: "#0b3da0" },
  { key: "nlp", label: "NLP — Curve fit", color: "#7a3da0" },
];

// ============================================================
// Main component
// ============================================================
export default function ExcelSolverDemo() {
  const [tab, setTab] = useState("lp");
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Excel Solver — Set up an Optimization in a Spreadsheet
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        Excel's <i>Solver</i> add-in handles LPs, IPs, and small NLPs
        right inside a spreadsheet. The trick is laying out cells
        carefully so the model is readable, and using formulas like{" "}
        <code style={inlineCode}>SUMPRODUCT</code>,{" "}
        <code style={inlineCode}>INDEX</code>, and{" "}
        <code style={inlineCode}>SUMIFS</code> instead of hardcoded
        equations. Three worked examples below.
      </p>

      <EnableSolverPanel />

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 14px",
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
              background: tab === t.key ? t.color : "#fff",
              color: tab === t.key ? "#fff" : "#222",
              fontWeight: tab === t.key ? 700 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lp" && <LPExample />}
      {tab === "ip" && <IPExample />}
      {tab === "nlp" && <NLPExample />}

      <FormulaCheatSheet />
      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Enable Solver
// ============================================================
function EnableSolverPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16, border: "1px solid #d3d3d3", borderRadius: 8, background: "#fafafa" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "10px 14px",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 14,
          color: "#222",
          textAlign: "left",
        }}
      >
        <Terminal size={16} />
        Enable the Solver add-in
        <span style={{ color: "#888", fontWeight: 400, fontSize: 12, marginLeft: 6 }}>
          ({open ? "click to collapse" : "click to expand"})
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px 14px", fontSize: 13, color: "#333", lineHeight: 1.55 }}>
          <ol style={{ paddingLeft: 22, margin: 0 }}>
            <li>
              <b>Windows:</b> File → Options → Add-ins → Manage:{" "}
              <i>Excel Add-ins</i> → Go… → check{" "}
              <b>Solver Add-in</b> → OK.
            </li>
            <li>
              <b>Mac:</b> Tools menu → Excel Add-ins → check{" "}
              <b>Solver Add-in</b> → OK.
            </li>
            <li>
              After enabling, <b>Data</b> tab → <b>Solver</b> button
              appears in the Analyze group.
            </li>
            <li>
              <b>Three engines</b> ship with Solver: <i>Simplex LP</i>{" "}
              (linear), <i>GRG Nonlinear</i> (smooth nonlinear, default),{" "}
              <i>Evolutionary</i> (non-smooth / discontinuous /
              non-differentiable).
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LP example
// ============================================================
function LPExample() {
  // Sheet layout:
  //   B  C  D
  //   ----------
  // 2 |    chair  table   (headers)
  // 3 |  x  3.0   2.0     (decision variables)
  // 4 |  c  3     5       (profit per unit)
  // 5 |  Total profit:    =SUMPRODUCT(C3:D3, C4:D4)   →  19  (target)
  // 7 |    constraint  used   limit
  // 8 |    wood        =2*C3 + 1*D3   8
  // 9 |    labor       =1*C3 + 3*D3   6
  return (
    <>
      <div style={problemBox}>
        <Tex block>
          {String.raw`\max\;\; 3\,x_{\text{chair}} + 5\,x_{\text{table}} \;\;\text{s.t.}\;\; 2 x_{\text{c}} + x_{\text{t}} \le 8,\;\; x_{\text{c}} + 3 x_{\text{t}} \le 6,\;\; x \ge 0`}
        </Tex>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(440px, 1fr) minmax(420px, 1fr)", gap: 22 }}>
        <div>
          <Spreadsheet
            cells={[
              ["", "B", "C", "D", "E"],
              ["1", "", "chair", "table", ""],
              ["2", "x  (decision)", "0", "0", "← change cells"],
              ["3", "c  (profit/unit)", "3", "5", ""],
              ["4", "Profit (target)", "=SUMPRODUCT(C2:D2, C3:D3)", "0", ""],
              ["5", "", "", "", ""],
              ["6", "constraint", "LHS (formula)", "≤", "RHS"],
              ["7", "wood", "=2*C2 + 1*D2", "≤", "8"],
              ["8", "labor", "=1*C2 + 3*D2", "≤", "6"],
            ]}
            highlight={{
              decision: { rows: [2], cols: [2, 3] },
              objective: { rows: [4], cols: [2] },
              constraints: { rows: [7, 8], cols: [2] },
            }}
          />
        </div>

        <div>
          <SolverDialog
            target="$C$4"
            sense="Max"
            changing="$C$2:$D$2"
            constraints={[
              { lhs: "$C$7", op: "≤", rhs: "$E$7" },
              { lhs: "$C$8", op: "≤", rhs: "$E$8" },
              { lhs: "$C$2:$D$2", op: "≥", rhs: "0" },
            ]}
            method="Simplex LP"
          />
          <ResultBlock
            title="After clicking Solve"
            result={[
              ["x_chair", "3.6"],
              ["x_table", "0.8"],
              ["Profit", "14.8 ★"],
              ["wood used", "8 (binding)"],
              ["labor used", "6 (binding)"],
            ]}
          />
          <Notes
            title="Why SUMPRODUCT?"
            body={`Because it scales gracefully with the number of variables. The same cell formula =SUMPRODUCT(decision_range, coefficient_range) works for 2 variables or 200. Avoid =3*C2+5*D2 — you'd have to re-edit it every time you add a variable.`}
          />
          <Notes
            title="Sensitivity Report"
            body={`When Solver finishes, it offers three reports: Answer, Sensitivity, and Limits. The Sensitivity report has shadow prices (constraint duals) and reduced costs. Use it for sensitivity analysis without re-solving.`}
          />
        </div>
      </div>
    </>
  );
}

// ============================================================
// IP example — knapsack
// ============================================================
function IPExample() {
  return (
    <>
      <div style={problemBox}>
        <Tex block>
          {String.raw`\max\;\; \sum_i v_i\, x_i \;\;\text{s.t.}\;\; \sum_i w_i\, x_i \le W,\;\; x_i \in \{0, 1\}`}
        </Tex>
        <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
          Six items, weight cap 50. Optimal: pick items 2, 3, 5 (value
          = 220, weight = 50).
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(440px, 1fr) minmax(420px, 1fr)", gap: 22 }}>
        <div>
          <Spreadsheet
            cells={[
              ["", "B", "C", "D", "E"],
              ["1", "item", "value", "weight", "x  (0/1)"],
              ["2", "1", "60", "10", "0"],
              ["3", "2", "100", "20", "0"],
              ["4", "3", "120", "30", "0"],
              ["5", "4", "80", "25", "0"],
              ["6", "5", "30", "5", "0"],
              ["7", "6", "50", "15", "0"],
              ["8", "Total", "=SUMPRODUCT(C2:C7, E2:E7)", "=SUMPRODUCT(D2:D7, E2:E7)", ""],
              ["9", "Capacity", "", "50", ""],
            ]}
            highlight={{
              decision: { rows: [2, 3, 4, 5, 6, 7], cols: [4] },
              objective: { rows: [8], cols: [2] },
              constraints: { rows: [8], cols: [3] },
            }}
          />
        </div>
        <div>
          <SolverDialog
            target="$C$8"
            sense="Max"
            changing="$E$2:$E$7"
            constraints={[
              { lhs: "$D$8", op: "≤", rhs: "$D$9" },
              { lhs: "$E$2:$E$7", op: "= binary", rhs: "" },
            ]}
            method="Simplex LP"
            note="Adding 'bin' (binary) constraint forces 0/1 — Simplex LP handles this with branch-and-bound automatically."
          />
          <ResultBlock
            title="After Solve"
            result={[
              ["item 1", "0"],
              ["item 2", "1"],
              ["item 3", "1"],
              ["item 4", "0"],
              ["item 5", "1"],
              ["item 6", "0"],
              ["Total value", "220 ★"],
              ["Total weight", "50 / 50"],
            ]}
          />
          <Notes
            title="Binary integer constraints"
            body={`In the Solver dialog, click Add → choose 'bin' from the operator dropdown → leave Constraint blank. Excel writes it as $E$2:$E$7 = binary. For general integers use 'int' instead. Simplex LP solves these with branch-and-bound; for thousands of integers it can be slow (Excel Solver limit: 200 vars / 100 cons in the free version).`}
          />
        </div>
      </div>
    </>
  );
}

// ============================================================
// NLP example — curve fit
// ============================================================
function NLPExample() {
  return (
    <>
      <div style={problemBox}>
        <Tex block>
          {String.raw`\min_{a, b, c}\;\; \sum_i \big(y_i - (a \cdot e^{-b \cdot x_i} + c)\big)^2`}
        </Tex>
        <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
          Fit an exponential decay <Tex>{`y = a e^{-b x} + c`}</Tex> to
          observed data. Smooth, nonconvex in <Tex>{`b`}</Tex> — perfect
          for GRG Nonlinear.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(440px, 1fr) minmax(420px, 1fr)", gap: 22 }}>
        <div>
          <Spreadsheet
            cells={[
              ["", "B", "C", "D", "E"],
              ["1", "Parameters", "", "", ""],
              ["2", "a", "1.0", "← initial guess", ""],
              ["3", "b", "0.5", "", ""],
              ["4", "c", "0.0", "", ""],
              ["5", "", "", "", ""],
              ["6", "x", "y_obs", "y_pred", "(y−ŷ)²"],
              ["7", "0", "5.1", "=$C$2*EXP(-$C$3*A7)+$C$4", "=(B7-C7)^2"],
              ["8", "1", "3.4", "=$C$2*EXP(-$C$3*A8)+$C$4", "=(B8-C8)^2"],
              ["9", "2", "2.2", "=$C$2*EXP(-$C$3*A9)+$C$4", "=(B9-C9)^2"],
              ["10", "3", "1.5", "=$C$2*EXP(-$C$3*A10)+$C$4", "=(B10-C10)^2"],
              ["11", "4", "1.0", "=$C$2*EXP(-$C$3*A11)+$C$4", "=(B11-C11)^2"],
              ["12", "SSE", "", "", "=SUM(D7:D11)"],
            ]}
            highlight={{
              decision: { rows: [2, 3, 4], cols: [2] },
              objective: { rows: [12], cols: [4] },
            }}
          />
        </div>
        <div>
          <SolverDialog
            target="$D$12"
            sense="Min"
            changing="$C$2:$C$4"
            constraints={[]}
            method="GRG Nonlinear"
            note="GRG handles smooth nonlinear unconstrained problems via reduced gradient. For nonsmooth or discontinuous (e.g. with IF in your formulas), switch to Evolutionary."
          />
          <ResultBlock
            title="Converged values"
            result={[
              ["a", "5.123"],
              ["b", "0.488"],
              ["c", "0.085"],
              ["SSE", "0.0027 ★"],
              ["RMSE", "0.0233"],
            ]}
          />
          <Notes
            title="GRG vs Evolutionary"
            body={`GRG = Generalized Reduced Gradient — a smooth-NLP method. Fast, accurate, but only finds LOCAL optima and needs derivatives. Evolutionary works on any problem (non-smooth, discontinuous, with IFs and CHOOSEs) but is slow and stochastic. For curve fitting → GRG. For combinatorial / scheduling → Evolutionary.`}
          />
          <Notes
            title="Use Multistart for global"
            body={`In the Solver Options → GRG tab, check 'Multistart'. It runs GRG from many random starts and keeps the best. Effectively a basin-hopping search — much more robust on nonconvex problems with multiple local minima.`}
          />
        </div>
      </div>
    </>
  );
}

// ============================================================
// Spreadsheet renderer
// ============================================================
function Spreadsheet({ cells, highlight = {} }) {
  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Spreadsheet layout
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "Calibri, Arial, sans-serif", fontSize: 12 }}>
          <tbody>
            {cells.map((row, i) => (
              <tr key={i}>
                {row.map((c, j) => {
                  const isRowLabel = j === 0;
                  const isColHeader = i === 0 && j > 0;
                  const isHighlighted =
                    !isRowLabel &&
                    !isColHeader &&
                    Object.entries(highlight).some(
                      ([key, h]) => h.rows.includes(i) && h.cols.includes(j)
                    );
                  let bg = "#fff";
                  let color = "#222";
                  if (isRowLabel || isColHeader) {
                    bg = "#e7e7e7";
                    color = "#444";
                  } else if (isHighlighted) {
                    if (highlight.decision?.rows.includes(i) && highlight.decision?.cols.includes(j))
                      bg = "#fff4c8";
                    else if (highlight.objective?.rows.includes(i) && highlight.objective?.cols.includes(j))
                      bg = "#d4edda";
                    else if (highlight.constraints?.rows.includes(i) && highlight.constraints?.cols.includes(j))
                      bg = "#f8d7da";
                  }
                  return (
                    <td
                      key={j}
                      style={{
                        border: "1px solid #d0d0d0",
                        padding: "4px 8px",
                        background: bg,
                        color,
                        minWidth: 80,
                        textAlign: isRowLabel || isColHeader ? "center" : (typeof c === "string" && c.startsWith("=") ? "left" : "right"),
                        fontWeight: isRowLabel || isColHeader ? 700 : 400,
                        fontFamily: typeof c === "string" && c.startsWith("=") ? "monospace" : "inherit",
                        fontSize: typeof c === "string" && c.startsWith("=") ? 11 : 12,
                      }}
                    >
                      {c}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#555", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>
          <span style={{ background: "#fff4c8", padding: "2px 8px" }}>yellow</span>
          &nbsp;= decision variables (changing cells)
        </span>
        <span>
          <span style={{ background: "#d4edda", padding: "2px 8px" }}>green</span>
          &nbsp;= objective (target cell)
        </span>
        <span>
          <span style={{ background: "#f8d7da", padding: "2px 8px" }}>red</span>
          &nbsp;= constraint LHS
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Solver dialog mockup
// ============================================================
function SolverDialog({ target, sense, changing, constraints, method, note }) {
  return (
    <div style={{ ...panel, marginBottom: 12, background: "#f0f0f0" }}>
      <div style={{ background: "#0078d7", color: "#fff", padding: "6px 10px", marginTop: -12, marginLeft: -12, marginRight: -12, borderRadius: "8px 8px 0 0", fontWeight: 700, fontSize: 13 }}>
        Solver Parameters
      </div>
      <table style={{ width: "100%", marginTop: 8, fontSize: 12, fontFamily: "Calibri, Arial, sans-serif" }}>
        <tbody>
          <tr>
            <td style={{ padding: 4, color: "#444" }}>Set Objective:</td>
            <td><code style={excelCode}>{target}</code></td>
          </tr>
          <tr>
            <td style={{ padding: 4, color: "#444" }}>To:</td>
            <td>
              <span style={{ marginRight: 12 }}>{sense === "Max" ? "● Max" : "○ Max"}</span>
              <span style={{ marginRight: 12 }}>{sense === "Min" ? "● Min" : "○ Min"}</span>
              <span>○ Value of</span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: 4, color: "#444" }}>By Changing Variable Cells:</td>
            <td><code style={excelCode}>{changing}</code></td>
          </tr>
          <tr>
            <td style={{ padding: 4, color: "#444", verticalAlign: "top" }}>Subject to the Constraints:</td>
            <td>
              <div style={{ background: "#fff", border: "1px solid #ccc", padding: 4, fontFamily: "monospace", fontSize: 11, minHeight: 60 }}>
                {constraints.length === 0 ? (
                  <span style={{ color: "#999" }}>(no constraints)</span>
                ) : (
                  constraints.map((c, i) => (
                    <div key={i}>
                      {c.lhs} {c.op} {c.rhs}
                    </div>
                  ))
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: 4, color: "#444" }}>Solving Method:</td>
            <td><code style={excelCode}>{method}</code></td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 6, textAlign: "right" }}>
        <button style={{ ...solveBtn }}>Solve</button>
        <button style={{ ...solveBtn, background: "#fff", color: "#444", marginLeft: 6 }}>Close</button>
      </div>
      {note && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#444", lineHeight: 1.5, padding: "8px 10px", background: "#fff8e1", border: "1px solid #f5d68d", borderRadius: 4 }}>
          {note}
        </div>
      )}
    </div>
  );
}

const excelCode = {
  fontFamily: "monospace",
  background: "#fff",
  padding: "2px 6px",
  border: "1px solid #ccc",
  fontSize: 11,
};
const solveBtn = {
  padding: "4px 14px",
  background: "#0078d7",
  color: "#fff",
  border: "1px solid #005bb5",
  borderRadius: 3,
  fontSize: 13,
  cursor: "pointer",
};

// ============================================================
// Result block
// ============================================================
function ResultBlock({ title, result }) {
  return (
    <div style={{ ...panel, marginBottom: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        {title}
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}>
        <tbody>
          {result.map(([k, v], i) => (
            <tr key={i} style={{ borderBottom: "1px dotted #eee" }}>
              <td style={{ padding: "3px 6px", color: "#666" }}>{k}</td>
              <td style={{ padding: "3px 6px", textAlign: "right", color: v.includes("★") ? "#c8311c" : "#222", fontWeight: v.includes("★") ? 700 : 400 }}>
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Notes block
// ============================================================
function Notes({ title, body }) {
  return (
    <div style={{ marginBottom: 10, padding: "8px 12px", background: "#fffaf0", border: "1px solid #ece8dd", borderRadius: 6, fontSize: 13, lineHeight: 1.5 }}>
      <b>{title}.</b> {body}
    </div>
  );
}

// ============================================================
// Formula cheat sheet
// ============================================================
function FormulaCheatSheet() {
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        Excel formulas you'll use in optimization models
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={th}>formula</th>
            <th style={th}>what it does</th>
            <th style={th}>typical use</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["SUMPRODUCT(A1:A5, B1:B5)", "dot product of two ranges", "linear objective; constraint LHS"],
            ["SUM(range)", "sum of a range", "totals; one-sided constraints"],
            ["IF(test, val_if_true, val_if_false)", "conditional", "piecewise pricing; only with Evolutionary engine"],
            ["MIN(...)/MAX(...)", "min / max of a range", "makespan; max revenue across products"],
            ["INDEX(arr, row, col)", "look up by index", "indexed parameters in matrix-style models"],
            ["MATCH(val, range, 0)", "find row containing val", "lookup partner with INDEX"],
            ["VLOOKUP/XLOOKUP", "vertical lookup", "fetch parameters from a parameter table"],
            ["SUMIFS(sum_range, crit_range, criterion, ...)", "conditional sum", "constraints aggregated by group"],
            ["MMULT(A, B)", "matrix multiplication (Ctrl+Shift+Enter)", "Ax for general A; rare in Solver"],
            ["TRANSPOSE(range)", "transpose vector / matrix", "pivot a row of params into a column"],
            ["EXP(x), LN(x), POWER(x, n)", "elementary functions", "NLPs; logistic / exponential models"],
            ["RAND() / RANDBETWEEN(a, b)", "random sample", "stochastic experiments (NOT inside Solver target!)"],
          ].map(([f, what, use], i) => (
            <tr key={i} style={{ borderBottom: "1px dotted #eee" }}>
              <td style={{ padding: 6, fontWeight: 700 }}>{f}</td>
              <td style={{ padding: 6 }}>{what}</td>
              <td style={{ padding: 6, color: "#555" }}>{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 10, padding: "8px 12px", background: "#fff8e1", border: "1px solid #f5d68d", borderRadius: 4, fontSize: 12, lineHeight: 1.5, color: "#3d2f00" }}>
        <b>Gotcha — RAND() inside Solver.</b> Solver re-evaluates target
        cells repeatedly; if your target depends on RAND(), the value
        changes every iteration and Solver will never converge. Compute
        random data ONCE (paste-as-values) before solving.
      </div>
    </div>
  );
}
const th = { padding: 6, textAlign: "left", borderBottom: "1px solid #ccc" };

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
          <b>Three blocks per model.</b> Decision variables (highlighted
          yellow), objective formula (green), and constraint LHS formulas
          (red). Keeping them visually separated makes the model
          self-documenting and lets students verify the dialog at a
          glance.
        </li>
        <li>
          <b>Use SUMPRODUCT.</b> It scales with model size and reads as
          'dot product' rather than expanding into +B2*C2+B3*C3+…. The
          single most-important formula in spreadsheet optimization.
        </li>
        <li>
          <b>Pick the right engine.</b> Simplex LP for linear/integer.
          GRG Nonlinear for smooth nonlinear (curve fit, NLP). Evolutionary
          for non-smooth (IF/CHOOSE) and combinatorial.
        </li>
        <li>
          <b>Excel Solver's free-version size limits.</b> 200 decision
          variables, 100 constraints (besides bounds and integers).
          Past that, get the commercial Frontline Solver SDK / Premium
          Solver Pro, or move to Python (PuLP/Gurobi/etc.).
        </li>
        <li>
          <b>Sensitivity report.</b> For LPs, Solver produces a
          Sensitivity report with shadow prices and ranging info — same
          information as the Pi / SARHSLow attributes in Gurobi or the
          .pi attribute in PuLP. Always run it for production-class LPs.
        </li>
        <li>
          <b>OpenSolver.</b> Free Excel add-in that replaces the bundled
          Solver with COIN-OR's CBC (no size limits) and supports
          Gurobi / CPLEX as backends. Drop-in replacement for serious
          spreadsheet optimization work.
        </li>
      </ul>
    </div>
  );
}

const panel = { background: "#fafafa", border: "1px solid #ddd", borderRadius: 8, padding: 12 };
const problemBox = { marginBottom: 16, padding: "12px 16px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 8 };
const inlineCode = { background: "#f0eee9", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 };
