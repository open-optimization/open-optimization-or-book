# Proposals for Rohit's Feedback Items 1-4

This document contains proposals for addressing the first four feedback items from Rohit's review.

## Target Audience Calibration

**Audience**: Sophomore Industrial & Systems Engineering (ISE) students

**Writing approach**:
- **More hand-holding than a math text** - Build intuition before formal definitions; explain "why" before "how"
- **More technical than a business text** - Can include mathematical formulations and proofs, but motivate them
- **Practical/applied focus** - Real engineering examples they can relate to
- **Step-by-step explanations** - Don't skip steps that seem "obvious"

---

## Feedback Item 1: More Examples Outside of ISE (Especially in Part 2)

### Current State

**Part 2 (Discrete Algorithms)** currently contains:
- Chapter 10: Graph Theory and Network Flows
- ~25 worked examples including:
  - Housing development street inspection (lawn inspector)
  - Königsberg bridges (historical)
  - City travel (Yakima to Tacoma)
  - Airline costs between cities
  - Office connectivity (phone lines)
  - Snowplow routing

**Assessment**: Examples are good but heavily focused on ISE/OR contexts. The comment about YouTube/ChatGPT may not be the best fit, but there are other compelling modern applications.

### Proposal: Add ISE-Relevant Modern Applications

Rather than YouTube/ChatGPT (which use complex ML algorithms beyond scope), I propose adding examples from **core ISE application areas** that sophomore students can relate to:

#### A. Supply Chain & Logistics (Core ISE)

| Algorithm | Example for Sophomores |
|-----------|------------------------|
| **Shortest Path** | Warehouse robot navigation (Amazon Kiva robots), package sorting center routing |
| **Spanning Trees** | Designing a new campus network (connecting buildings with minimum cable) |
| **TSP/VRP** | Campus mail delivery, food delivery route planning |
| **Euler Circuits** | Floor cleaning robot paths, campus security patrol routes |

#### B. Manufacturing & Operations (Core ISE)

| Algorithm | Example for Sophomores |
|-----------|------------------------|
| **Shortest Path** | Material handling in a factory, AGV (automated guided vehicle) routing |
| **Spanning Trees** | Assembly line layout, conveyor system design |
| **Network Flow** | Production line balancing, parts distribution in a plant |

#### C. Healthcare Operations (Growing ISE field)

| Algorithm | Example for Sophomores |
|-----------|------------------------|
| **Shortest Path** | Nurse walking routes in a hospital, patient transport |
| **Spanning Trees** | Hospital pneumatic tube system design |
| **TSP** | Lab specimen collection routes, medication delivery |

### Recommended Actions

1. **Add 1-2 modern examples per major algorithm** in Chapter 10
2. **Create a "Modern Applications" info box** at the start of Part 2 listing real companies using these algorithms
3. **Reference industry tools**: Mention Google OR-Tools, Amazon's routing systems, Uber's matching algorithms

### Sample Text to Add (Beginning of Part 2)

```latex
\begin{info}
\textbf{Where You'll Use These Algorithms}

The graph algorithms in this chapter aren't just theory---they're tools you'll
use throughout your ISE career:

\begin{itemize}
\item \textbf{Warehouse Design}: When Amazon designs a new fulfillment center,
      engineers use shortest path algorithms to minimize the distance robots
      travel to pick items.
\item \textbf{Network Design}: When a company needs to connect multiple
      facilities with a communication network, minimum spanning trees find
      the cheapest way to wire everything together.
\item \textbf{Route Planning}: Delivery companies like UPS and FedEx solve
      variations of the Traveling Salesman Problem every day to plan driver
      routes.
\item \textbf{Facility Layout}: Manufacturing engineers use these algorithms
      to design factory floors that minimize material handling distances.
\item \textbf{Healthcare}: Hospital operations teams optimize nurse schedules
      and patient transport using network flow models.
\end{itemize}

As an ISE, you'll often be the person companies turn to when they need to
solve these problems!
\end{info}
```

---

## Feedback Item 2: Dynamic Programming - Modeling or Algorithm?

### Current State

- **In Introduction (Ch 1)**: DP is briefly mentioned as an algorithm: "Breaks down problems into simpler subproblems"
- **External Lab Material**: More comprehensive, frames it as "Sequential decision making problems... Dynamic programming is a method of solving these problems"
- **Not yet integrated** into main book structure

### The Issue

The feedback asks: Is DP **modeling** (a way to formulate problems) or **algorithm** (a solution method)?

**Answer**: It's **both**, but the current framing emphasizes the algorithmic aspect.

### Proposal: Reframe as "Sequential Decision Making" with Clear Dual Nature

#### Recommended Structure

```
Chapter: Sequential Decision Making and Dynamic Programming

Section 1: The Sequential Decision Framework (MODELING)
- What makes a problem sequential?
- States, stages, decisions, transitions
- The principle of optimality
- Examples of sequential structure in real problems

Section 2: Dynamic Programming as a Solution Method (ALGORITHM)
- Bellman's equation
- Backward induction
- Value functions and policy functions
- Computational implementation

Section 3: Classic DP Problems (APPLICATIONS)
- Shortest path (connection to Dijkstra)
- Knapsack problem
- Resource allocation over time
- Inventory management
```

#### Key Framing Change (Sophomore ISE Level)

**Current**: "Dynamic Programming: Breaks down problems into simpler subproblems and is particularly useful for multistage decision processes."

**Proposed** (more accessible, builds intuition first):
```latex
\section{Sequential Decision Making}

Have you ever played a video game where each choice you make affects what
happens next? Or planned a road trip where you need to decide which cities
to visit in what order? These are \textbf{sequential decision problems}---
situations where you make a series of decisions over time, and each decision
changes your options going forward.

\begin{example}{Planning a Production Schedule}{}
A factory manager needs to decide how many units to produce each month for
the next 6 months. Each month's decision affects:
\begin{itemize}
\item How much inventory is left for next month
\item Whether overtime is needed
\item Storage costs
\end{itemize}
The best decision for January depends on what you plan to do in February,
which depends on March, and so on. You can't optimize each month separately!
\end{example}

\textbf{Dynamic Programming (DP)} gives us a systematic way to solve these
problems. The key insight is surprisingly simple:

\begin{info}
\textbf{The Principle of Optimality} (Bellman, 1957)

If you're on the optimal path from A to C, then the portion of that path
from any intermediate point B to C must also be optimal.

\textit{Translation}: Once you know where you are (your ``state''), the best
thing to do from here doesn't depend on how you got here.
\end{info}

This principle lets us solve big problems by breaking them into smaller pieces
and working backwards from the end.
```

### Resources to Integrate

1. **DIDP.ai** (https://didp.ai/) - Modern DP solver/framework
2. **Ocean Plastic Paper** - Real-world DP application in environmental policy

### Recommended Actions

1. Rename section to "Sequential Decision Making and Dynamic Programming"
2. Add opening section explaining the modeling framework BEFORE the algorithm
3. Include 2-3 ISE-relevant examples (inventory, project scheduling, resource allocation)
4. Add connection to shortest path (which students already know from Ch 10)

---

## Feedback Item 3: Chapter 5 Needs More Exercises

### Current State

**Chapter 5: Formal Mathematical Statements** covers:
- Vectors and their properties
- Linear combinations, convex combinations
- Linear independence, matrix rank
- Convexity of polyhedra
- Spanning sets and basis
- Extreme points and vertices
- Representation Theorem

**Current Exercises**: 5 exercises
- Vector operations
- Linear and convex combinations
- Linear independence and matrix rank
- Convex combinations and geometry
- Halfspace geometry and convexity

**Comparison**:
| Chapter | Exercises |
|---------|-----------|
| Ch 2 (Modeling) | 25 |
| Ch 5 (LP Theory) | **5** |
| Ch 6 (Simplex) | 14 |
| Ch 8 (Duality) | 8 |

### Assessment

Chapter 5 is **theory-heavy** with formal proofs. The abstraction IS difficult (as noted). The current 5 exercises are insufficient for students to build intuition.

### Proposal: Add 10-12 New Exercises (Calibrated for Sophomore ISE)

The key is to **build confidence through practice** before asking for abstraction. Start concrete, then generalize.

#### Category A: Warm-Up Exercises (Build Confidence First)

These are straightforward computations that let students verify they understand the definitions:

```latex
\begin{exercise}
\textbf{Practice with Vectors}

Consider the vectors $\mathbf{u} = (2, 3)$ and $\mathbf{v} = (1, -1)$.
\begin{enumerate}
\item Compute $\mathbf{u} + \mathbf{v}$.
\item Compute $3\mathbf{u} - 2\mathbf{v}$.
\item Is the point $(5, 1)$ a linear combination of $\mathbf{u}$ and $\mathbf{v}$?
      If so, find the coefficients. \textit{Hint: Set up a system of equations.}
\end{enumerate}
\end{exercise}

\begin{exercise}
\textbf{Finding Vertices by Hand}

Consider the feasible region defined by:
\begin{align*}
x_1 + x_2 &\leq 4 \\
2x_1 + x_2 &\leq 6 \\
x_1, x_2 &\geq 0
\end{align*}
\begin{enumerate}
\item Sketch the feasible region. (Label each constraint line.)
\item List all the vertices (corners) of the feasible region.
\item For each vertex, which constraints are ``tight'' (satisfied with equality)?
\item Verify that at each vertex, the number of tight constraints equals
      the number of variables (2).
\end{enumerate}
\textit{This pattern---vertices occur where constraints are tight---is the
foundation of the simplex method!}
\end{exercise}
```

#### Category B: Conceptual Understanding (Check Intuition)

```latex
\begin{exercise}
\textbf{True or False?} For each statement, decide if it's true or false,
and give a brief justification or counterexample.

\begin{enumerate}
\item Every convex combination of two points is also a linear combination.
\item Every linear combination of two points is also a convex combination.
\item If you take any two points inside a convex set, the line segment
      connecting them stays inside the set.
\item The intersection of two convex sets is always convex.
\item The union of two convex sets is always convex.
      \textit{Hint: Think of two separate circles.}
\end{enumerate}
\end{exercise}

\begin{exercise}
\textbf{Visualizing Convex Combinations}

The points $A = (0, 0)$, $B = (4, 0)$, and $C = (2, 3)$ form a triangle.
\begin{enumerate}
\item What are all points that can be written as convex combinations of
      $A$, $B$, and $C$? Describe geometrically.
\item Find the convex combination that gives the centroid (center of mass)
      of the triangle. What are the coefficients $\lambda_1, \lambda_2, \lambda_3$?
\item Is the point $(1, 1)$ inside the triangle? Express it as a convex
      combination of $A$, $B$, $C$ if possible.
\end{enumerate}
\end{exercise}
```

#### Category C: Connecting Theory to Practice

```latex
\begin{exercise}
\textbf{Why Corners Matter}

Consider the LP: Maximize $z = 2x_1 + 3x_2$ subject to the constraints from
Exercise 2 above.
\begin{enumerate}
\item Evaluate the objective function at each vertex you found.
\item Which vertex is optimal?
\item Pick any point in the interior of the feasible region (not on any edge).
      Show that its objective value is worse than the optimal vertex.
\item Explain in your own words why the optimal solution to an LP is always
      at a vertex (assuming one exists).
\end{enumerate}
\end{exercise}

\begin{exercise}
\textbf{When Things Go Wrong}

For each scenario below, sketch an example or explain why it's impossible:
\begin{enumerate}
\item A feasible region with exactly 3 vertices.
\item A feasible region with no vertices. \textit{Hint: What if the region
      is unbounded in all directions?}
\item A convex set that is NOT a polyhedron. \textit{Hint: Think of shapes
      with curved boundaries.}
\item An LP where the optimal solution is NOT at a vertex.
\end{enumerate}
\end{exercise}
```

#### Category D: Gentle Introduction to Proofs (Optional/Challenge)

```latex
\begin{exercise}
\textbf{Proving Convexity} (Challenge)

Show that the feasible region of any LP (the set of points satisfying all
constraints) is convex.

\textit{Hint: Take any two feasible points $\mathbf{x}$ and $\mathbf{y}$.
Consider a point $\mathbf{z} = \lambda \mathbf{x} + (1-\lambda)\mathbf{y}$
on the line segment between them (where $0 \leq \lambda \leq 1$). Show that
$\mathbf{z}$ also satisfies all the constraints.}
\end{exercise}
```

### Recommended Actions

1. Add 4 computational exercises (vectors, convex combinations, finding vertices)
2. Add 4 conceptual true/false or short-answer exercises
3. Add 3-4 proof-based exercises for students seeking deeper understanding
4. Consider adding **"Check Your Understanding"** boxes after major theorems with quick verification exercises

### Supplementary Resources

Add a note pointing students to:
- YouTube videos explaining convexity visually
- Interactive tools for visualizing polyhedra (GeoGebra, Desmos)

---

## Feedback Item 4: Chapter 6 - Better Explanation of Level Curves

### Current State

**Level curves ARE explained** in Section 2 (Graphical Method), NOT Chapter 6 (Simplex):
- Definition provided: "7x₁ + 6x₂ = z implies parallel lines with slope -7/6"
- Multiple figures with colored level curves (red to yellow)
- Algorithm given for using level curves to find optimal solution

**In Chapter 6 (Simplex)**:
- Geometric interpretation exists but focuses on moving between vertices
- No explicit "level curve" terminology
- Discusses "direction of improvement" without connecting to level curves

### Assessment

The level curve explanation in Chapter 2 is **mathematically correct** but may be **too brief** for students unfamiliar with multivariable calculus concepts. The term "level curve" is introduced without much motivation.

### Proposal: Enhance Level Curve Explanation (Sophomore ISE Level)

The current explanation is mathematically correct but jumps too quickly to formulas. Sophomores need the **intuition first**, then the math.

#### A. Add Intuitive Introduction with Familiar Analogy

```latex
\subsection{Visualizing the Objective Function: Level Curves}

Before we get to the math, let's build some intuition with a familiar example.

\begin{example}{Topographic Maps}{}
If you've ever used a hiking map, you've seen \textbf{contour lines}---curves
that connect points at the same elevation. If you walk along a contour line,
you stay at the same height above sea level. The closer together the contour
lines, the steeper the terrain.

Level curves work exactly the same way for our objective function!
\end{example}

Think of your objective function $z = 7x_1 + 6x_2$ as describing the
``elevation'' of each point $(x_1, x_2)$ in your decision space. A
\textbf{level curve} connects all points that have the same ``elevation''
(same objective value).

\begin{figure}[H]
\centering
% [Include side-by-side figure: topographic map on left, LP level curves on right]
\caption{Left: A topographic map with elevation contours. Right: Level curves
for $z = 7x_1 + 6x_2$. The concepts are identical---both show ``lines of
equal value.''}
\end{figure}
```

#### B. Step-by-Step Walkthrough (Don't Skip Steps!)

```latex
\textbf{How to Draw Level Curves}

Let's work through this carefully for $z = 7x_1 + 6x_2$:

\textbf{Step 1: Pick a value of $z$.} Let's start with $z = 42$.

\textbf{Step 2: Find all points where the objective equals that value.}
We need $7x_1 + 6x_2 = 42$. Solving for $x_2$:
\[
x_2 = \frac{42 - 7x_1}{6} = 7 - \frac{7}{6}x_1
\]
This is a line with slope $-7/6$ and $y$-intercept $7$.

\textbf{Step 3: Repeat for other values of $z$.}
\begin{itemize}
\item $z = 0$: $x_2 = -\frac{7}{6}x_1$ (passes through origin)
\item $z = 42$: $x_2 = 7 - \frac{7}{6}x_1$
\item $z = 84$: $x_2 = 14 - \frac{7}{6}x_1$
\end{itemize}

Notice: All these lines are \textbf{parallel} (same slope $-7/6$). Higher
values of $z$ correspond to lines that are further ``up and to the right.''
```

#### C. The Key Insight (Why This Solves LPs)

```latex
\begin{info}
\textbf{The Level Curve Method for Solving LPs}

Here's the key insight: we want to find the point in the feasible region
with the \textbf{highest} objective value (for maximization).

\textbf{The Strategy:}
\begin{enumerate}
\item Draw the feasible region (shade it in).
\item Draw one level curve---any one that intersects the feasible region.
\item ``Slide'' this line parallel to itself in the direction that
      \textbf{increases} $z$. (Which way is that? The direction where $z$
      gets bigger!)
\item Keep sliding until the line is about to leave the feasible region.
\item The last point(s) where the line touches the feasible region is your
      optimal solution.
\end{enumerate}

\textbf{Why does this work?} Because all points on a level curve have the
same objective value. When you slide to a ``higher'' level curve, every point
on that curve has a better objective value. The highest level curve that
still touches the feasible region gives you the best possible solution.
\end{info}
```

#### D. Common Mistakes Box (Students Appreciate These!)

```latex
\begin{warn}
\textbf{Common Mistakes with Level Curves}

\textbf{Mistake 1: Sliding the wrong direction.}
For \textit{maximization}, slide toward higher $z$ values.
For \textit{minimization}, slide toward lower $z$ values.
Always check which direction increases your objective!

\textbf{Mistake 2: Drawing non-parallel lines.}
All level curves for a linear objective are parallel. If your lines aren't
parallel, something went wrong.

\textbf{Mistake 3: Missing multiple optimal solutions.}
If your final level curve lies exactly along an edge of the feasible region,
then \textit{every point on that edge} is optimal---not just the corners!

\textbf{Mistake 4: Confusing the gradient with the level curve.}
The level curve is the line where $z$ is constant. The gradient points
\textit{perpendicular} to the level curve, in the direction $z$ increases
fastest. You slide level curves in the gradient direction.
\end{warn}
```

#### E. Quick Practice Problem

```latex
\begin{exercise}
\textbf{Practice: Finding the Direction of Improvement}

For each objective function, determine which direction to ``slide'' the
level curves to find the maximum:
\begin{enumerate}
\item $z = 3x_1 + 2x_2$ (Draw the level curve $z = 6$ and indicate the
      direction of increasing $z$.)
\item $z = -x_1 + 4x_2$ (Careful! The coefficient on $x_1$ is negative.)
\item $z = 5x_1 - 3x_2$ (What happens when you want to maximize but one
      coefficient is negative?)
\end{enumerate}
\end{exercise}
```

### Recommended Actions

1. **Add intuitive introduction** with topographic map analogy before the mathematical definition
2. **Create a 3D + 2D comparison figure** showing the objective function as a surface and its level curves
3. **Add "Why It Works" info box** explaining the geometric reasoning
4. **Add "Common Mistakes" warning box** addressing typical student errors
5. **Consider adding a GeoGebra/Desmos link** where students can interactively explore level curves

---

## Summary of All Proposals

| Item | Issue | Proposed Solution | Effort | Priority |
|------|-------|-------------------|--------|----------|
| 1 | More examples outside ISE | Add ISE-relevant modern applications (warehouse, healthcare, manufacturing) | Medium | Can do incrementally |
| 2 | DP: Modeling or Algorithm? | Reframe as "Sequential Decision Making", build intuition with production scheduling example | Medium-High | Needs planning |
| 3 | Ch 5 needs more exercises | Add 10-12 exercises: warm-ups → conceptual → connecting theory to practice | Medium | Ready to implement |
| 4 | Level curves explanation | Add topographic map analogy, step-by-step walkthrough, common mistakes box | Low-Medium | Ready to implement |

---

## Writing Style Notes (For All Changes)

When implementing these changes, maintain the **sophomore ISE tone**:

1. **Start with "why"** before "what" or "how"
2. **Use relatable examples** (factories, warehouses, hospitals—not abstract math)
3. **Don't skip steps** that might seem obvious
4. **Include "common mistakes" boxes** - students appreciate knowing what to avoid
5. **Connect theory to practice** - always show why the math matters for real problems
6. **Use hints liberally** in exercises to guide students
7. **Avoid jargon** without explanation (define terms before using them)

---

## Next Steps

Please review these proposals and let me know:
1. Which proposals to implement first? (I'd suggest #4 Level Curves as a quick win)
2. Any modifications to the proposed content?
3. For #1 (examples), which specific algorithms should get new examples first?
