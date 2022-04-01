# indigo-ts

An attempt to implement the Indigo constraint solver in TypeScript. See "The Indigo Algorithm" and "Indigo: A Local Propagation Algorithm for Inequality Constraints."

http://kti.ms.mff.cuni.cz/~bartak/constraints/ch_solvers.html#Indigo is a good start.

Why Indigo?

We need a solver that is
- fast (ideally linear in the typical case!)
- interpretable (easy to understand when things go wrong e.g. explanation for a particular value, explaining under- and over-constrained systems)
- expressive (supports many kinds of constraints)

Why do we need that?
- fast: need to be able to iterate at interactive speeds. 1s is acceptable, 100ms is ideal. Current Bluefish diagrams can take on the order of 10s as they get big, because it scales approx n^3.
- interpretable: constraint solvers are notoriously difficult to understand and their performance characteristics can be hard to predict. for this reason we need ways to help users understand the output of the solver. ad-hoc solutions to opaque systems do not suffice. moreover, a more interpretable system tends to be easier to extend and hack on.
- expressive: we would like to support more complicated layout techniques, such as "tidy" tree layout and pretty printing, within Bluefish somehow. This requires us to build an _extensible_ solver framework, similar in spirit to SMT. We currently hypothesize that intervals and monotonicity are useful assumptions for the metalanguage that communicates between solvers, similar to how equality is the communication medium between theories in SMT. See also "SMT Modulo Monotonic Theories" http://www.cs.ubc.ca/labs/isd/Projects/monosat/smmt.pdf. Monotonicity is a really nice assumption, because it doesn't require backtracking.

An unsolved question with this approach is how do we do one-at-a-time or staged layout? A strong motivating example is placing labels after the rest of layout completes, which is a common way to implement label layout efficiently.
Label layout can require backtracking, e.g., in the case of a map label layout algorithm I can't find atm there are point, line, and area labels that are placed, but backtracking occurs if it can't find a placement.
Similarly, edges are often placed after nodes are placed (even if abstract versions of the edges are used to lay out the nodes). This is the process in the DOT layout algorithm, where edges are used to determine node layers and then once nodes are placed the edges are routed around the nodes so they don't intersect.
