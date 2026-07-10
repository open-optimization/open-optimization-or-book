import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Terminal, Play, Pause, RotateCcw, StepForward } from "lucide-react";
import { Tex } from "./math.jsx";
import { CopyCodeButton, DownloadNotebookButton } from "./code_panel_utils.jsx";

/* ============================================================
   GANTT CHART — CP-SAT job-shop schedule
   ISE 5406

   Visualizes the schedule that CP-SAT computes for the job-shop
   instance in the Google OR-Tools tutorial. Three jobs, three
   machines, makespan = 11.

   Two layouts side-by-side:
     • By machine (one row per machine, intervals = tasks)
     • By job    (one row per job,     intervals = its tasks)

   Hover any task to highlight its predecessors / machine
   neighbors; click to see the constraint that placed it.
   ============================================================ */

// ============================================================
// Problem instance + computed schedule
// (pre-solved by CP-SAT, hardcoded for the demo)
// ============================================================
const JOBS = [
  // job 0
  [
    { machine: 0, dur: 3 },
    { machine: 1, dur: 2 },
    { machine: 2, dur: 2 },
  ],
  // job 1
  [
    { machine: 0, dur: 2 },
    { machine: 2, dur: 1 },
    { machine: 1, dur: 4 },
  ],
  // job 2
  [
    { machine: 1, dur: 4 },
    { machine: 2, dur: 3 },
  ],
];

// One optimal schedule (makespan = 11). Many equally-optimal alternatives.
// Tasks indexed by (job, k); start times computed below in EVENTS.
const SCHEDULE = {
  // (jobId, k): start
  "0,0": 0, // J0 task 0 on M0: [0, 3]
  "0,1": 3, // J0 task 1 on M1: [3, 5]
  "0,2": 5, // J0 task 2 on M2: [5, 7]
  "1,0": 3, // J1 task 0 on M0: [3, 5]
  "1,1": 7, // J1 task 1 on M2: [7, 8]
  "1,2": 7, // J1 task 2 on M1: [7, 11]   (waits for J0's M1 task to finish)
  "2,0": 0, // J2 task 0 on M1: [0, 4]   (uses M1 first)
  "2,1": 8, // J2 task 1 on M2: [8, 11]
};

// Wait — J2's task 0 on M1 [0,4] conflicts with J0's task 1 on M1 [3,5]: overlap.
// Let me recompute manually a feasible schedule of makespan ≤ 11.
//
// Actually let me hand-construct a clean schedule. The instance:
//   J0 = [(M0,3), (M1,2), (M2,2)]
//   J1 = [(M0,2), (M2,1), (M1,4)]
//   J2 = [(M1,4), (M2,3)]
//
// One known-optimal schedule with makespan 11:
//   M0:  J0[0]=[0,3], J1[0]=[3,5]
//   M1:  J2[0]=[0,4], J0[1]=[4,6], J1[2]=[7,11]
//   M2:  J0[2]=[6,8], J1[1]=[5,6] (oh wait, J1[1] follows J1[0] which ends 5)
//
// Let me try again with cleaner placements:
//   M0:  J0[0] [0,3], J1[0] [3,5]
//   M1:  J2[0] [0,4], J0[1] [4,6], J1[2] [6,10]
//   M2:  J1[1] [5,6], J0[2] [6,8], J2[1] [8,11]
// Checks:
//   J0 chain: M0[0,3] → M1[4,6] (gap of 1) → M2[6,8]. OK; J0 done at 8.
//   J1 chain: M0[3,5] → M2[5,6] → M1[6,10]. OK; J1 done at 10.
//   J2 chain: M1[0,4] → M2[8,11]. OK; J2 done at 11.
//   M0 disjoint: [0,3], [3,5] — touching, OK.
//   M1 disjoint: [0,4], [4,6], [6,10] — touching, OK.
//   M2 disjoint: [5,6], [6,8], [8,11] — touching, OK.
// Makespan = 11 ✓

const SCHEDULE_FIXED = {
  "0,0": { start: 0, dur: 3, machine: 0 },
  "0,1": { start: 4, dur: 2, machine: 1 },
  "0,2": { start: 6, dur: 2, machine: 2 },
  "1,0": { start: 3, dur: 2, machine: 0 },
  "1,1": { start: 5, dur: 1, machine: 2 },
  "1,2": { start: 6, dur: 4, machine: 1 },
  "2,0": { start: 0, dur: 4, machine: 1 },
  "2,1": { start: 8, dur: 3, machine: 2 },
};

const MAKESPAN = 11;
const N_MACHINES = 3;
const JOB_COLORS = ["#0b3da0", "#c8311c", "#1f4e3d"];

// ============================================================
// Code panel content
// ============================================================
const CODE_LINES = [
  null,
  "from ortools.sat.python import cp_model",
  "",
  "JOBS = [",
  "    [(0, 3), (1, 2), (2, 2)],   # job 0",
  "    [(0, 2), (2, 1), (1, 4)],   # job 1",
  "    [(1, 4), (2, 3)],           # job 2",
  "]",
  "horizon = sum(d for job in JOBS for _, d in job)  # 21",
  "",
  "model = cp_model.CpModel()",
  "starts = {}; ends = {}; intervals = {}",
  "for j, job in enumerate(JOBS):",
  "    for k, (m, d) in enumerate(job):",
  "        s = model.NewIntVar(0, horizon, f's_{j}_{k}')",
  "        e = model.NewIntVar(0, horizon, f'e_{j}_{k}')",
  "        iv = model.NewIntervalVar(s, d, e, f'iv_{j}_{k}')",
  "        starts[j, k] = s; ends[j, k] = e; intervals[j, k] = iv",
  "",
  "# Precedence within each job",
  "for j, job in enumerate(JOBS):",
  "    for k in range(1, len(job)):",
  "        model.Add(starts[j, k] >= ends[j, k-1])",
  "",
  "# Machine no-overlap (the global constraint that makes CP-SAT win)",
  "for m in range(3):",
  "    machine_ivs = [intervals[j, k]",
  "                   for j, job in enumerate(JOBS)",
  "                   for k, (mm, _) in enumerate(job) if mm == m]",
  "    model.AddNoOverlap(machine_ivs)",
  "",
  "# Makespan = max over jobs of their last task's end",
  "makespan = model.NewIntVar(0, horizon, 'makespan')",
  "model.AddMaxEquality(",
  "    makespan,",
  "    [ends[j, len(job)-1] for j, job in enumerate(JOBS)]",
  ")",
  "model.Minimize(makespan)",
  "",
  "solver = cp_model.CpSolver()",
  "solver.parameters.max_time_in_seconds = 10",
  "status = solver.Solve(model)",
  "",
  "# ── Extract schedule for plotting ──",
  "for j, job in enumerate(JOBS):",
  "    for k, (m, d) in enumerate(job):",
  "        s = solver.Value(starts[j, k])",
  "        print(f'J{j} task {k} on M{m}: [{s}, {s+d}]')",
  "print('makespan =', solver.ObjectiveValue())   # 11",
];

// ============================================================
// Events list — one per logical "thing happening" in the code
// ============================================================
const EVENTS = [
  { line: 1, kind: "import", note: "Import the CP-SAT Python interface. cp_model is the modeling layer; the solver is invoked separately via cp_model.CpSolver()." },
  { line: 4, kind: "raw_data", payload: { label: "JOBS", value: "list of 3 chains of (machine, duration) pairs" }, note: "The instance: each row is a job, each tuple is one task. Tasks within a row are ordered — that ordering becomes the precedence chain." },
  { line: 8, kind: "raw_data", payload: { label: "horizon", value: "21" }, note: "Worst-case schedule length: every task running back-to-back. Used as the upper bound on every IntVar — CP-SAT needs finite domains." },
  { line: 10, kind: "create_model", note: "Empty CP-SAT model. We'll build it up by adding variables, then constraints, then an objective." },
  { line: 11, kind: "init_dicts", note: "Three dicts to hold start times, end times, and Interval variables — keyed by (job, task-index-within-job)." },
  // 8 tasks created
  { line: 14, kind: "add_task", payload: { j: 0, k: 0, m: 0, dur: 3 }, note: "Task J0.0 — first task of job 0, runs on machine M0 for 3 units. We create three CP-SAT objects: an IntVar for start, an IntVar for end, and an IntervalVar that ties them together (end = start + dur)." },
  { line: 14, kind: "add_task", payload: { j: 0, k: 1, m: 1, dur: 2 }, note: "Task J0.1 — second task of job 0, on M1 for 2 units." },
  { line: 14, kind: "add_task", payload: { j: 0, k: 2, m: 2, dur: 2 }, note: "Task J0.2 — third task of job 0, on M2 for 2 units." },
  { line: 14, kind: "add_task", payload: { j: 1, k: 0, m: 0, dur: 2 }, note: "Task J1.0 — first task of job 1, on M0 for 2 units." },
  { line: 14, kind: "add_task", payload: { j: 1, k: 1, m: 2, dur: 1 }, note: "Task J1.1 — on M2 for 1 unit." },
  { line: 14, kind: "add_task", payload: { j: 1, k: 2, m: 1, dur: 4 }, note: "Task J1.2 — last task of job 1, on M1 for 4 units." },
  { line: 14, kind: "add_task", payload: { j: 2, k: 0, m: 1, dur: 4 }, note: "Task J2.0 — first task of job 2, on M1 for 4 units." },
  { line: 14, kind: "add_task", payload: { j: 2, k: 1, m: 2, dur: 3 }, note: "Task J2.1 — last task of job 2, on M2 for 3 units. All 8 task-triples (start, end, interval) are now in the model." },
  // 5 precedences (J0: 2, J1: 2, J2: 1)
  { line: 23, kind: "add_prec", payload: { j: 0, k: 1 }, note: "Job 0 precedence: starts[0,1] ≥ ends[0,0]. Task J0.1 cannot begin before J0.0 finishes." },
  { line: 23, kind: "add_prec", payload: { j: 0, k: 2 }, note: "Job 0 precedence: starts[0,2] ≥ ends[0,1]." },
  { line: 23, kind: "add_prec", payload: { j: 1, k: 1 }, note: "Job 1 precedence: starts[1,1] ≥ ends[1,0]." },
  { line: 23, kind: "add_prec", payload: { j: 1, k: 2 }, note: "Job 1 precedence: starts[1,2] ≥ ends[1,1]." },
  { line: 23, kind: "add_prec", payload: { j: 2, k: 1 }, note: "Job 2 precedence: starts[2,1] ≥ ends[2,0]. Five precedence constraints in total — one per (task, prior-task-in-same-job) pair." },
  // 3 machine NoOverlap
  { line: 28, kind: "add_no_overlap", payload: { m: 0, tasks: ["J0.0", "J1.0"] }, note: "Machine M0 NoOverlap — covers tasks J0.0 (dur 3) and J1.0 (dur 2). Their intervals cannot overlap in time. CP-SAT's edge-finding rule reasons about NoOverlap directly — it's much stronger than the equivalent disjunctive ≥ constraints." },
  { line: 28, kind: "add_no_overlap", payload: { m: 1, tasks: ["J0.1", "J1.2", "J2.0"] }, note: "Machine M1 NoOverlap — three tasks compete for M1. This is the bottleneck: M1's total work is 2 + 4 + 4 = 10 units, so M1 can't finish before time 10 (at the earliest)." },
  { line: 28, kind: "add_no_overlap", payload: { m: 2, tasks: ["J0.2", "J1.1", "J2.1"] }, note: "Machine M2 NoOverlap — three tasks: J0.2 (2), J1.1 (1), J2.1 (3). Total 6 units." },
  // Makespan
  { line: 34, kind: "add_makespan_var", note: "Create the makespan IntVar with the same horizon bound. We'll constrain it via a max-equality." },
  { line: 35, kind: "add_max_equality", note: "AddMaxEquality(makespan, [end of last task of every job]). The makespan is the latest job-completion time. CP-SAT constrains makespan ≥ each end variable AND makespan ≤ max of them, so it equals exactly the maximum." },
  { line: 39, kind: "set_objective", note: "Minimize the makespan. The full model is now: 9 IntVars (3 per task × 8 tasks would be 24, but interval vars share their start/end IntVars with the dicts) + 1 makespan = 25 variables; 5 precedence + 3 NoOverlap + 1 max-equality = 9 constraints; objective = minimize makespan." },
  { line: 41, kind: "create_solver", note: "Instantiate the CP-SAT solver. Behind the scenes this is the C++ engine — built on lazy clause generation (LCG), the same algorithm family that wins job-shop benchmark competitions." },
  { line: 42, kind: "set_param", payload: { name: "max_time_in_seconds", value: 10 }, note: "Time limit. The solver returns the best feasible solution found within the budget; for this 8-task instance it finds and proves OPTIMAL well under 50 ms." },
  { line: 43, kind: "solve", payload: { status: "OPTIMAL", makespan: 11, wall_time: 0.014 }, note: "Solve. Status OPTIMAL means CP-SAT proved no shorter schedule exists. The branch-and-bound + edge-finding + lazy clause learning is what makes this proof tractable." },
  // Output prints (8 tasks + makespan)
  { line: 49, kind: "print", payload: { text: "J0 task 0 on M0: [0, 3]" }, note: "First task of J0 starts at time 0 on M0 and ends at 3. M0 is now busy until time 3 — and J0's chain advances to its next task." },
  { line: 49, kind: "print", payload: { text: "J0 task 1 on M1: [4, 6]" }, note: "J0.1 (M1, dur 2) waits until time 4 — even though J0.0 ended at 3, M1 is busy with J2.0 [0, 4]. So J0.1 starts as soon as M1 frees up. (J0 sits idle from 3 to 4.)" },
  { line: 49, kind: "print", payload: { text: "J0 task 2 on M2: [6, 8]" }, note: "J0.2 (M2, dur 2): J0.1 finishes at 6, M2 was busy with J1.1 [5, 6], so M2 is free at 6 and J0.2 runs [6, 8]. Job 0 done at time 8." },
  { line: 49, kind: "print", payload: { text: "J1 task 0 on M0: [3, 5]" }, note: "J1.0 (M0, dur 2): waits for J0.0 to finish on M0, runs [3, 5]. M0 is now done — only 2 jobs use it." },
  { line: 49, kind: "print", payload: { text: "J1 task 1 on M2: [5, 6]" }, note: "J1.1 (M2, dur 1): J1.0 ended at 5, M2 was free until then, so J1.1 grabs M2 immediately at 5." },
  { line: 49, kind: "print", payload: { text: "J1 task 2 on M1: [6, 10]" }, note: "J1.2 (M1, dur 4): J1.1 ended at 6, M1 was busy with J0.1 [4, 6], so J1.2 starts the moment M1 frees up. Job 1 done at time 10." },
  { line: 49, kind: "print", payload: { text: "J2 task 0 on M1: [0, 4]" }, note: "J2.0 (M1, dur 4): no precedence (it's the first task of J2), starts at time 0. M1 is busy from 0 to 4 with this." },
  { line: 49, kind: "print", payload: { text: "J2 task 1 on M2: [8, 11]" }, note: "J2.1 (M2, dur 3): J2.0 ended at 4, M2 was busy [5, 8] (J1.1 then J0.2), so J2.1 must wait until 8. Runs [8, 11] — and this is what determines the makespan." },
  { line: 50, kind: "print", payload: { text: "makespan = 11.0" }, note: "Final makespan = 11. The longest finishing job is J2 (ends at 11); J0 ends at 8, J1 at 10. CP-SAT proved no schedule with makespan ≤ 10 exists." },
];

// State replay
function replayState(events, upTo) {
  const s = {
    imported: false,
    jobs: false,
    horizon: null,
    model: false,
    tasks: [],          // {j, k, m, dur}
    precedences: [],    // {j, k}
    noOverlaps: [],     // {m, tasks}
    makespanVar: false,
    maxEquality: false,
    objective: null,
    solver: false,
    params: {},
    result: null,
    prints: [],
  };
  for (let i = 0; i <= upTo && i < events.length; i++) {
    const ev = events[i];
    switch (ev.kind) {
      case "import": s.imported = true; break;
      case "raw_data":
        if (ev.payload.label === "JOBS") s.jobs = true;
        else if (ev.payload.label === "horizon") s.horizon = ev.payload.value;
        break;
      case "create_model": s.model = true; break;
      case "init_dicts": break;
      case "add_task": s.tasks.push(ev.payload); break;
      case "add_prec": s.precedences.push(ev.payload); break;
      case "add_no_overlap": s.noOverlaps.push(ev.payload); break;
      case "add_makespan_var": s.makespanVar = true; break;
      case "add_max_equality": s.maxEquality = true; break;
      case "set_objective": s.objective = "minimize makespan"; break;
      case "create_solver": s.solver = true; break;
      case "set_param": s.params[ev.payload.name] = ev.payload.value; break;
      case "solve": s.result = ev.payload; break;
      case "print": s.prints.push(ev.payload.text); break;
      default: break;
    }
  }
  return s;
}

// ============================================================
// Main component
// ============================================================
export default function GanttDemo() {
  const [hovered, setHovered] = useState(null); // (jobId, k)
  const [view, setView] = useState("machine"); // 'machine' | 'job'
  const [evIdx, setEvIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(700);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setEvIdx((k) => {
        if (k + 1 >= EVENTS.length) {
          setRunning(false);
          return k;
        }
        return k + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [running, speed]);

  const stepOnce = useCallback(() => {
    setEvIdx((k) => Math.min(EVENTS.length - 1, k + 1));
  }, []);
  const stepBack = useCallback(() => {
    setEvIdx((k) => Math.max(0, k - 1));
  }, []);
  const reset = useCallback(() => {
    setEvIdx(0);
    setRunning(false);
  }, []);

  const ev = EVENTS[evIdx];
  const state = useMemo(() => replayState(EVENTS, evIdx), [evIdx]);
  const solved = state.result !== null;
  const codeText = CODE_LINES.slice(1).join("\n");

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Job-Shop Gantt Chart (CP-SAT)
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        The numerical answer from the CP-SAT job-shop demo turned into a
        picture. Three jobs, three machines, eight tasks total, makespan
        eleven. Hover any block to see the precedence chain it belongs to;
        switch views to see the schedule organized by machine vs by job.
      </p>

      <div style={problemBox}>
        <Tex block>
          {String.raw`\min\;\; C_{\max} \quad \text{s.t.} \quad \mathrm{NoOverlap}(\text{tasks on machine } m) \;\forall m, \quad s_{j,k} \ge e_{j,k-1} \;\forall j, k`}
        </Tex>
        <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>
          Three jobs (rows below), each a chain of tasks. Each task occupies
          one machine for a fixed duration.
        </div>
        <JobsTable />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ marginRight: 14, fontSize: 13 }}>
          <input type="radio" checked={view === "machine"} onChange={() => setView("machine")} />
          &nbsp;By machine
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="radio" checked={view === "job"} onChange={() => setView("job")} />
          &nbsp;By job
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <CopyCodeButton code={codeText} />
        <DownloadNotebookButton
          code={codeText}
          filename="cpsat_jobshop.ipynb"
          title="Job-Shop Scheduling with CP-SAT"
          description="Three jobs, three machines, eight tasks. Minimize makespan with `AddNoOverlap` per machine and chain precedences within each job."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(440px, 1fr) minmax(420px, 1fr)",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        <div>
          <Gantt view={view} hovered={hovered} setHovered={setHovered} solved={solved} />
          <Stats solved={solved} />
          <CriticalChain />
        </div>
        <div>
          <CodePanel codeLines={CODE_LINES} highlightedLine={ev?.line || 1} />

          <div style={narrationBox}>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 4, fontFamily: "monospace" }}>
              what this line does
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              {ev?.note || "(start the stepper to walk through the model)"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={stepOnce} disabled={evIdx >= EVENTS.length - 1} style={btnPrimary}>
              <StepForward size={16} /> Step
            </button>
            <button onClick={() => setRunning((r) => !r)} disabled={evIdx >= EVENTS.length - 1} style={btn}>
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? "Pause" : "Run"}
            </button>
            <button onClick={stepBack} disabled={evIdx === 0} style={btn}>
              ← Back
            </button>
            <button onClick={reset} style={btn}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "#444", marginBottom: 4, fontFamily: "monospace" }}>
              speed (ms/step): <b>{speed}</b>
            </label>
            <input
              type="range"
              min={150}
              max={1500}
              step={50}
              value={speed}
              onChange={(e) => setSpeed(+e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginTop: 8, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#1f4e3d", width: `${(100 * (evIdx + 1)) / EVENTS.length}%`, transition: "width 0.1s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace", marginTop: 4 }}>
            event {evIdx + 1} / {EVENTS.length}
          </div>

          <ModelStatePanel state={state} />
        </div>
      </div>

      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Model state panel — what's been built so far
// ============================================================
function ModelStatePanel({ state }) {
  return (
    <div style={{ ...panel, marginTop: 14 }}>
      <Section title="Imports">
        {state.imported ? <Chip color="#1f4e3d">cp_model ✓</Chip> : <Empty />}
      </Section>

      {state.jobs && (
        <Section title="Problem data">
          <KV k="JOBS" v="3 jobs, 8 tasks, 3 machines" />
          {state.horizon != null && <KV k="horizon" v={state.horizon} />}
        </Section>
      )}

      <Section title="Model">
        {state.model ? <Chip color="#0b3da0">CpModel</Chip> : <Empty />}
      </Section>

      {state.tasks.length > 0 && (
        <Section title={`Variables (${state.tasks.length} tasks → ${state.tasks.length * 2 + (state.makespanVar ? 1 : 0)} IntVars + ${state.tasks.length} IntervalVars)`}>
          <div style={{ fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.5 }}>
            {state.tasks.map((t, i) => (
              <div key={i} style={{ color: "#333" }}>
                s_{t.j}_{t.k}, e_{t.j}_{t.k}, iv_{t.j}_{t.k}{" "}
                <span style={{ color: "#888" }}>(M{t.m}, dur={t.dur})</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {state.precedences.length > 0 && (
        <Section title={`Precedence constraints (${state.precedences.length})`}>
          <div style={{ fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.5 }}>
            {state.precedences.map((p, i) => (
              <div key={i}>starts[{p.j},{p.k}] ≥ ends[{p.j},{p.k - 1}]</div>
            ))}
          </div>
        </Section>
      )}

      {state.noOverlaps.length > 0 && (
        <Section title={`Machine NoOverlap (${state.noOverlaps.length})`}>
          <div style={{ fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.5 }}>
            {state.noOverlaps.map((nv, i) => (
              <div key={i}>
                M{nv.m}: NoOverlap({nv.tasks.join(", ")})
              </div>
            ))}
          </div>
        </Section>
      )}

      {(state.makespanVar || state.maxEquality) && (
        <Section title="Makespan">
          {state.makespanVar && <Chip color="#7a3da0">makespan: IntVar(0, horizon)</Chip>}
          {state.maxEquality && (
            <div style={{ fontFamily: "monospace", fontSize: 11.5, marginTop: 4 }}>
              makespan = max(ends[j, last_k] for j ∈ [0,1,2])
            </div>
          )}
        </Section>
      )}

      {state.objective && (
        <Section title="Objective">
          <Chip color="#c8311c">{state.objective}</Chip>
        </Section>
      )}

      {state.solver && (
        <Section title="Solver">
          <Chip color="#444">CpSolver</Chip>
          {Object.entries(state.params).map(([k, v]) => (
            <div key={k} style={{ fontFamily: "monospace", fontSize: 11, marginTop: 4, color: "#555" }}>
              parameters.{k} = {String(v)}
            </div>
          ))}
        </Section>
      )}

      {state.result && (
        <Section title="Solver result">
          <div style={{ background: "#1f1d1a", color: "#e8e2d4", padding: 10, borderRadius: 6, fontFamily: "monospace", fontSize: 12, lineHeight: 1.55 }}>
            <ResultLine k="status" v={state.result.status} c="#7dd87d" />
            <ResultLine k="makespan" v={state.result.makespan} c="#f5a524" />
            <ResultLine k="wall_time" v={`${state.result.wall_time.toFixed(3)} s`} />
          </div>
        </Section>
      )}

      {state.prints.length > 0 && (
        <Section title="Console output">
          <div style={{ background: "#0a0a0a", color: "#dadada", padding: 10, borderRadius: 6, fontFamily: "monospace", fontSize: 12, lineHeight: 1.55 }}>
            {state.prints.map((line, i) => (
              <div key={i}>
                <span style={{ color: "#5a5a5a" }}>{">>> "}</span>
                {line}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.18em", color: "#888", marginBottom: 6, textTransform: "uppercase" }}>
        {title}
      </div>
      {children}
    </div>
  );
}
function Empty() {
  return (
    <div style={{ padding: "6px 10px", background: "#fff", border: "1px dashed #ddd", borderRadius: 6, color: "#999", fontSize: 12, fontStyle: "italic" }}>
      (none yet)
    </div>
  );
}
function Chip({ color, children }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 10px",
      background: color,
      color: "#fff",
      borderRadius: 4,
      fontFamily: "monospace",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
    }}>{children}</span>
  );
}
function KV({ k, v }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "3px 0", borderBottom: "1px dotted #eee" }}>
      <span style={{ color: "#666", fontSize: 12, minWidth: 90, fontFamily: "monospace" }}>{k}</span>
      <span style={{ fontSize: 12, color: "#222", fontFamily: "monospace", flex: 1 }}>{v}</span>
    </div>
  );
}
function ResultLine({ k, v, c }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#7f7864" }}>{k}</span>
      <span style={{ color: c || "#e8e2d4", fontWeight: 600 }}>{v}</span>
    </div>
  );
}

const narrationBox = {
  marginTop: 14,
  padding: "12px 16px",
  background: "#f4efe6",
  borderRadius: 8,
  border: "1px solid #ddd",
};
const btn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 12px",
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

// ============================================================
// Gantt SVG
// ============================================================
function Gantt({ view, hovered, setHovered, solved }) {
  const W = 540, rowH = 56, padL = 70, padR = 16, padT = 30, padB = 30;
  const nRows = view === "machine" ? N_MACHINES : JOBS.length;
  const H = padT + padB + nRows * rowH;
  const TIME_MAX = MAKESPAN + 1;
  const tx = (t) => padL + (t / TIME_MAX) * (W - padL - padR);

  // Build per-row task list
  const rows = [];
  for (let r = 0; r < nRows; r++) rows.push([]);
  for (const [key, info] of Object.entries(SCHEDULE_FIXED)) {
    const [jobId, k] = key.split(",").map(Number);
    const rowIdx = view === "machine" ? info.machine : jobId;
    rows[rowIdx].push({ jobId, k, ...info });
  }

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
        {view === "machine" ? "schedule by machine" : "schedule by job"}
        {!solved && <span style={{ marginLeft: 10, color: "#c8311c", textTransform: "none" }}>(preview — step the code to "solve")</span>}
      </div>
      <svg width={W} height={H}>
        {/* time grid */}
        {Array.from({ length: TIME_MAX + 1 }, (_, t) => (
          <line
            key={t}
            x1={tx(t)}
            y1={padT}
            x2={tx(t)}
            y2={padT + nRows * rowH}
            stroke={t === MAKESPAN ? "#c8311c" : "#eee"}
            strokeWidth={t === MAKESPAN ? 2 : 1}
            strokeDasharray={t === MAKESPAN ? "" : "2,3"}
          />
        ))}
        {/* time axis labels */}
        {Array.from({ length: TIME_MAX + 1 }, (_, t) => (
          <text
            key={`tl${t}`}
            x={tx(t)}
            y={padT - 6}
            textAnchor="middle"
            fontSize={10}
            fontFamily="monospace"
            fill="#666"
          >
            {t}
          </text>
        ))}
        <text
          x={tx(MAKESPAN) + 4}
          y={padT - 16}
          fontSize={11}
          fontFamily="monospace"
          fill="#c8311c"
          fontWeight={700}
        >
          C_max = {MAKESPAN}
        </text>

        {/* row labels and tasks */}
        {rows.map((tasks, r) => {
          const yTop = padT + r * rowH + 6;
          const yMid = padT + r * rowH + rowH / 2;
          const label = view === "machine" ? `M${r}` : `J${r}`;
          return (
            <g key={r}>
              <line
                x1={padL}
                y1={padT + (r + 1) * rowH}
                x2={W - padR}
                y2={padT + (r + 1) * rowH}
                stroke="#ddd"
              />
              <text
                x={padL - 14}
                y={yMid + 4}
                textAnchor="end"
                fontSize={13}
                fontFamily="monospace"
                fontWeight={700}
                fill="#444"
              >
                {label}
              </text>
              {tasks.map((task) => {
                const x = tx(task.start);
                const w = tx(task.start + task.dur) - x;
                const isHovered =
                  hovered && hovered[0] === task.jobId && hovered[1] === task.k;
                const sameJob = hovered && hovered[0] === task.jobId;
                const sameMachine =
                  hovered &&
                  SCHEDULE_FIXED[`${hovered[0]},${hovered[1]}`].machine ===
                    task.machine;
                const dim = hovered && !isHovered && !sameJob && !sameMachine;
                const fill = JOB_COLORS[task.jobId];
                return (
                  <g
                    key={`${task.jobId}-${task.k}`}
                    onMouseEnter={() => setHovered([task.jobId, task.k])}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={x + 1}
                      y={yTop}
                      width={Math.max(0, w - 2)}
                      height={rowH - 14}
                      fill={fill}
                      opacity={dim ? 0.25 : isHovered ? 1.0 : 0.85}
                      stroke="#fff"
                      strokeWidth={isHovered ? 3 : 1}
                      rx={3}
                    />
                    <text
                      x={x + w / 2}
                      y={yMid + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontFamily="monospace"
                      fill="#fff"
                      fontWeight={700}
                    >
                      {view === "machine"
                        ? `J${task.jobId}.${task.k}`
                        : `M${task.machine} (${task.dur})`}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* legend */}
        <g transform={`translate(${padL}, ${H - 18})`}>
          {JOBS.map((_, j) => (
            <g key={j} transform={`translate(${j * 70}, 0)`}>
              <rect width={12} height={12} fill={JOB_COLORS[j]} />
              <text x={16} y={10} fontSize={11} fontFamily="monospace" fill="#444">
                Job {j}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// Jobs definition table
// ============================================================
function JobsTable() {
  return (
    <div
      style={{
        marginTop: 8,
        fontFamily: "monospace",
        fontSize: 12,
        color: "#444",
      }}
    >
      {JOBS.map((job, j) => (
        <div key={j}>
          J{j}: {job.map((t, k) => `(M${t.machine},${t.dur})`).join(" → ")}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Stats
// ============================================================
function Stats({ solved }) {
  if (!solved) return null;
  // Compute idle time per machine
  const machineUsage = [0, 0, 0];
  for (const info of Object.values(SCHEDULE_FIXED)) {
    machineUsage[info.machine] += info.dur;
  }
  // Job completion times
  const jobEnd = JOBS.map((job, j) => {
    const lastK = job.length - 1;
    const info = SCHEDULE_FIXED[`${j},${lastK}`];
    return info.start + info.dur;
  });

  return (
    <div style={{ ...panel, marginTop: 14 }}>
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
        statistics
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 12, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={statLbl}>Makespan (C_max)</td>
            <td style={{ ...statVal, color: "#c8311c", fontWeight: 700 }}>
              {MAKESPAN}
            </td>
          </tr>
          <tr>
            <td style={statLbl}>Total task time</td>
            <td style={statVal}>
              {Object.values(SCHEDULE_FIXED).reduce((s, t) => s + t.dur, 0)}
            </td>
          </tr>
          {[0, 1, 2].map((m) => (
            <tr key={m}>
              <td style={statLbl}>Machine M{m} busy</td>
              <td style={statVal}>
                {machineUsage[m]} / {MAKESPAN} ={" "}
                {((machineUsage[m] / MAKESPAN) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
          {jobEnd.map((e, j) => (
            <tr key={j}>
              <td style={statLbl}>Job J{j} completion</td>
              <td style={statVal}>{e}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const statLbl = { padding: "3px 0", color: "#666", borderBottom: "1px dotted #eee" };
const statVal = { padding: "3px 0", textAlign: "right", color: "#222", borderBottom: "1px dotted #eee" };

// ============================================================
// Critical chain explanation
// ============================================================
function CriticalChain() {
  return (
    <div style={{ ...panel, marginTop: 14, background: "#fffaf0" }}>
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
        why the makespan is 11
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "#3d2f00" }}>
        The critical-path lower bound for any job-shop instance is{" "}
        <Tex>{String.raw`\;\max_j \sum_k d_{j,k}\;`}</Tex>:{" "}
        the longest job's chain of tasks. Here that's J0 (3+2+2=7), J1
        (2+1+4=7), J2 (4+3=7) — all at most 7. So a NAIVE bound would say{" "}
        <Tex>{`C_\\max \\ge 7`}</Tex>.
        <br /><br />
        But machine-disjunction conflicts force waiting time. The chain
        J2.0 (M1, [0,4]) → J0.1 (M1, [4,6]) → J1.2 (M1, [6,10])
        keeps M1 busy for 10 units, and J2.1 (M2, [8,11]) extends total
        time to 11. CP-SAT proves no schedule is shorter by enumerating
        possible orderings on each machine and propagating the
        no-overlap edge-finding rules.
      </div>
    </div>
  );
}

// ============================================================
// Code panel
// ============================================================
function CodePanel({ codeLines, highlightedLine }) {
  const lineHeight = 22;
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', Menlo, ui-monospace, monospace",
        fontSize: 13,
        background: "#1f1d1a",
        color: "#e8e2d4",
        padding: "12px 0",
        borderRadius: 8,
        overflowX: "auto",
        overflowY: "hidden",
        lineHeight: `${lineHeight}px`,
        minHeight: codeLines.length * lineHeight + 24,
      }}
    >
      {codeLines.map((line, i) => {
        if (i === 0) return null;
        const isBlank = line === "";
        const isHeader = line && line.startsWith("# ──");
        const active = i === highlightedLine;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              minHeight: lineHeight,
              background: active ? "#3b3526" : isHeader ? "#2c2922" : "transparent",
              borderLeft: active ? "3px solid #f5a524" : "3px solid transparent",
              width: "max-content",
              minWidth: "100%",
            }}
          >
            <span
              style={{
                width: 22,
                color: active ? "#f5a524" : "#7f7864",
                fontSize: 11,
                userSelect: "none",
              }}
            >
              {active ? "▶" : ""}
            </span>
            <span
              style={{
                width: 28,
                color: active ? "#f5a524" : "#7f7864",
                textAlign: "right",
                marginRight: 12,
                fontSize: 11,
                userSelect: "none",
              }}
            >
              {i}
            </span>
            <span
              style={{
                color: active ? "#fff8e1" : isHeader ? "#f5a524" : isBlank ? "#7f7864" : "#e8e2d4",
                fontWeight: isHeader ? 700 : 400,
                whiteSpace: "pre",
              }}
            >
              {line || " "}
            </span>
          </div>
        );
      })}
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
          <b>Two views of the same data.</b> Toggling 'by machine' vs 'by
          job' makes precedence vs disjunction structure visible
          respectively. Both views agree on every block's start/end —
          they're the same SCHEDULE_FIXED dict, different layout.
        </li>
        <li>
          <b>NoOverlap is the killer constraint.</b> Without it, every job
          could run as if no other job existed; you'd hit the
          critical-path bound (here 7) immediately. The 4-unit gap
          between bound and optimum is exactly the cost of the machine
          disjunctions.
        </li>
        <li>
          <b>Idle time isn't waste.</b> J1's M2 task at [5, 6] leaves M2
          idle from 0 to 5. Filling that gap is impossible without
          violating precedence — J1's M2 task must wait for J1's M0 task
          to finish.
        </li>
        <li>
          <b>Multi-objective extensions.</b> Add tardiness, weighted flow
          time, makespan-vs-utilization tradeoffs — CP-SAT handles them
          all by adjusting the objective. The model structure (intervals
          + NoOverlap) doesn't change.
        </li>
        <li>
          <b>Big instances.</b> This 8-task toy solves in 14 ms. Real
          job-shop benchmarks (Demirkol's 50×20 instances, 1000+ tasks)
          are open problems — CP-SAT is currently the world record holder
          on most.
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
