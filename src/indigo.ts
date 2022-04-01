import * as VariableFoo from './variable';
import * as Interval from './interval';
import { isConst } from './variable';
import * as _ from 'lodash';

type Strength = number;

export const required: Strength = Infinity;
export const strong: Strength = 9;
export const medium: Strength = 8;
export const weak: Strength = 7;
export const weaker: Strength = 6; 

type ConstraintStatus = 'sat' | 'unsat' | 'unknown';

const TOLERANCE = 1e-5;
const is_close = (x: number, y: number) => Math.abs(x - y) < TOLERANCE;

export type Constraint = {
  vars: Set<Variable>,
  tighten: Map<Variable, () => void>,
  strength: Strength,
  status: () => ConstraintStatus,
  toString: () => string,
}

export const mkConstraint = (vars: Set<Variable>, tighten: Map<Variable, () => void>, toString: () => string, status: () => ConstraintStatus, strength: Strength): Constraint => {
  const c: Constraint = {
    vars,
    tighten,
    strength,
    status,
    toString,
  };
  vars.forEach((v) => v.constraints.add(c));
  return c;
}

export type Variable = {
  v: VariableFoo.t,
  constraints: Set<Constraint>,
  toString: () => string,
}

export const mkVar = (id: string): Variable => ({
  v: VariableFoo.mk(id),
  constraints: new Set(),
  toString: () => id,
})

export const value = (v: Variable): number => VariableFoo.value(v.v);

type Queue = Constraint[];

export const solve = (constraints: Constraint[]): void => {
  console.log('begin solve', constraints.map(c => c.toString()))
  constraints.sort((c1, c2) => c2.strength - c1.strength);

  const activeConstraints: Set<Constraint> = new Set();

  for (const constraint of constraints) {
    console.log(`solving: ${constraint}`);
    const tightVariables: Set<Variable> = new Set();
    const queue = [constraint];
    while (queue.length > 0) {
      const c = queue[0];
      console.log(`visiting: ${c}`);
      tighten_bounds(c, queue, tightVariables, activeConstraints);
      check_constraint(c, activeConstraints);
      queue.shift();
    }
  }
}

const tighten_bounds = (c: Constraint, q: Queue, tightVariables: Set<Variable>, activeConstraints: Set<Constraint>): void => {
  c.vars.forEach((v: Variable) => {
    console.log(`variable ${v}`);
    console.log(`tightVariables`, Array.from(tightVariables.values()).map(v => v.toString()));
    if (tightVariables.has(v)) return;
    const oldBounds = v.v.bounds;
    c.tighten.get(v)();
    // TODO: maybe only add tight variables when they stop making progress? idk
    tightVariables.add(v);
    console.log('bounds', oldBounds, v.v.bounds);
    if (!Interval.is_close(oldBounds, v.v.bounds)) {
      console.log(`${v} changed from`, oldBounds, `to`, v.v.bounds);
      v.constraints.forEach((c: Constraint) => {
        if (activeConstraints.has(c) && q.find((o) => c === o) === undefined) {
          q.push(c);
        }
      })
    }
  })
}

const check_constraint = (c: Constraint, activeConstraints: Set<Constraint>): void => {
  if (c.strength === required && c.status() === 'unsat') {
    throw 'Required constraint is not satisfied';
  } else if (c.vars.size === 1) {
    // even if a unary constraint is not a constant equality, we don't learn anything new from
    // evaluating it more than once by monotonicity
    return;
    // TODO: maybe I can replace this check with a check for status === 'unknown'
    // then I can push the burden to the constraint for verifying this
  } else if (!Array.from(c.vars.values()).every((v) => VariableFoo.isConst(v.v))) {
    activeConstraints.add(c);
  } else if (c.status() === 'sat') {
    // we've completely solved this constraint. throw it away
    // TODO: I don't totally understand this. couldn't something else violate it? I guess not by
    // monotonicity. Maybe it would be useful to keep track of provenance for debugging tho, so
    // maybe don't throw it away altogether?
    activeConstraints.delete(c);
  } else {
    throw 'Constraints are too difficult';
  }
}

/* 
TODO: intersect returns `null` if the intersection fails. not sure how to deal with that b/c need to
catch it to determine unsat.

TODO: inequality constraints
TODO: affine versions of the above
TODO: min and max
*/

export const mkConstEqConstraint = (x: Variable, c: number, strength=required): Constraint => mkConstraint(
  new Set([x]),
  new Map([[x, () => {
    // x.v.bounds = Interval.intersect(x.v.bounds, Interval.fromFloat(c));
    x.v.bounds = Interval.intersectBestEffort(x.v.bounds, Interval.fromFloat(c));
  }]]),
  () => `${x} = ${c}`,
  () => {
    if (!isConst(x.v)) {
      return 'unknown'
    } else {
      return is_close(value(x), c) ? 'sat' : 'unsat';
    }
  },
  strength
);

export const mkEqConstraint = (x: Variable, y: Variable, strength=required): Constraint => mkConstraint(
  new Set([x, y]),
  new Map([
    [x, () => {
      // x.v.bounds = Interval.intersect(x.v.bounds, y.v.bounds);
      x.v.bounds = Interval.intersectBestEffort(x.v.bounds, y.v.bounds);
    }],
    [y, () => {
      // y.v.bounds = Interval.intersect(y.v.bounds, x.v.bounds);
      y.v.bounds = Interval.intersectBestEffort(y.v.bounds, x.v.bounds);
    }],
  ]),
  () => `${x} = ${y}`,
  () => {
    if (!(isConst(x.v) && isConst(y.v))) {
      return 'unknown'
    } else {
      return is_close(value(x), value(y)) ? 'sat' : 'unsat';
    }
  },
  strength,
)

type Plus = { type: 'plus', exprs: AffineExpr[] };
export const plus = (...exprs: AffineExpr[]): Plus => ({ type: 'plus', exprs });

// The restriction here ensures expressions are affine.
type Mul = { type: 'mul', scalar: number, expr: AffineExpr };
export const mul = (scalar: number, expr: AffineExpr): Mul => ({ type: 'mul', scalar, expr });

export type AffineExpr =
| number
| Variable
| Plus
| Mul

// a_1x_1 + ... + a_nx_n + b
export type CanonicalAffineExpr = {
  terms: Map<Variable, number>,
  bias: number,
}

export type AffineConstraint = { lhs: AffineExpr, op: 'eq' | 'le' | 'ge', rhs: AffineExpr }

export type CanonicalAffineConstraint = CanonicalAffineExpr & {op: 'eq' | 'le' | 'ge'};

// turns affine constraint into a_1x_1 + ... + a_nx_n + b = 0 where a_1, ..., a_n != 0
const canonicalizeAffineConstraint = (c: AffineConstraint): CanonicalAffineConstraint => {
  const cLHS = canonicalizeExpr(c.lhs);
  const cRHS = canonicalizeExpr(c.rhs);
  const lhsMinusRhsTerms = new Map(cLHS.terms);
  cRHS.terms.forEach((v, k) => lhsMinusRhsTerms.has(k) ? lhsMinusRhsTerms.set(k, lhsMinusRhsTerms.get(k) - v) : -v);
  lhsMinusRhsTerms.forEach((v, k, m) => is_close(v, 0) ? m.delete(k) : {})
  const lhsMinusRhs = { terms: lhsMinusRhsTerms, bias: cLHS.bias - cRHS.bias };
  return {
    ...lhsMinusRhs,
    op: c.op,
  }
}

// turns affine expression into a_1x_1 + ... + a_nx_n + b
const canonicalizeExpr = (c: AffineExpr): CanonicalAffineExpr => {
  if (typeof c === 'number') {
    return {
      terms: new Map(),
      bias: c,
    }
  } else if ('v' in c) {
    // variable
    return {
      terms: new Map([[c, 1]]),
      bias: 0,
    }
  } else if (c.type === 'plus') {
    const cExprs = c.exprs.map(canonicalizeExpr);
    console.log('cExprs', cExprs);
    return cExprs.reduce((acc, ce) => {
     ce.terms.forEach((v, k) => acc.terms.has(k) ? acc.terms.set(k, acc.terms.get(k) + v) : acc.terms.set(k, v));
     return {
      terms: acc.terms,
      bias: acc.bias + ce.bias,
     };
  }, { terms: new Map(), bias: 0});
  } else if (c.type === 'mul') {
    const cExpr = canonicalizeExpr(c.expr);
    const mulTerms = new Map();
    cExpr.terms.forEach((v, k) => mulTerms.set(k, v * c.scalar));
    return {
      terms: mulTerms,
      bias: cExpr.bias * c.scalar,
    };
  } else {
    throw 'never';
  }
}

export const mkAffineConstraint = (lhs: AffineExpr, op: 'eq' | 'le' | 'ge', rhs: AffineExpr, strength=required): Constraint => {
  const canonicalConstraint = canonicalizeAffineConstraint({lhs, op, rhs});
  console.log('canonical constraint', canonicalConstraint);

  return mkConstraint(
  new Set(canonicalConstraint.terms.keys()),
  new Map(Array.from(canonicalConstraint.terms.keys()).map((v) => {
    return [v, () => {
      /* a_1x_1 + ... + a_ix_i + ... + a_nx_n + b = 0 -> x_i = -1/a_i * (a_1x_1 + ... + a_nx_n + b)
        (without x_i ofc) */
    const vExprBounds = Interval.div(
      Array.from(canonicalConstraint.terms.entries())
        .reduce((acc, [x_i, a_i]) => {
          return x_i === v ? acc : Interval.add(acc, Interval.mul(Interval.fromFloat(a_i), x_i.v.bounds))},
                Interval.fromFloat(canonicalConstraint.bias)),
      Interval.fromFloat(-canonicalConstraint.terms.get(v)))
      if (canonicalConstraint.op === 'eq') {
        // v.v.bounds = Interval.intersect(v.v.bounds, vExprBounds);
        v.v.bounds = Interval.intersectBestEffort(v.v.bounds, vExprBounds);
      } else if (canonicalConstraint.op === 'le') {
        // v.v.bounds = Interval.intersect(v.v.bounds, { lb: -Infinity, ub: vExprBounds.ub })
        v.v.bounds = Interval.intersectBestEffort(v.v.bounds, { lb: -Infinity, ub: vExprBounds.ub })
      } else if (canonicalConstraint.op === 'ge') {
        // v.v.bounds = Interval.intersect(v.v.bounds, { lb: vExprBounds.lb, ub: Infinity })
        v.v.bounds = Interval.intersectBestEffort(v.v.bounds, { lb: vExprBounds.lb, ub: Infinity })
      } else {
        throw 'never'
      }
    }]
  })),
  () => `${lhs} ${op} ${rhs}`, /* TODO: do better */
  () => {
    if (!(Array.from(canonicalConstraint.terms.keys()).every((v) => isConst(v.v)))) {
      return 'unknown'
    } else {
      /* actually compute the concrete term */
      const exprVal = Array.from(canonicalConstraint.terms.entries())
        .reduce((acc, [x_i, a_i]) => acc + a_i * value(x_i), canonicalConstraint.bias);
      if (canonicalConstraint.op === 'eq') {
        return is_close(exprVal, 0) ? 'sat' : 'unsat';
      } else if (canonicalConstraint.op === 'le') {
        return (exprVal < 0 || is_close(exprVal, 0)) ? 'sat' : 'unsat';
      } else if (canonicalConstraint.op === 'ge') {
        return (exprVal > 0 || is_close(exprVal, 0)) ? 'sat' : 'unsat';
      } else {
        throw 'never';
      }
    }
  },
  strength,
)
}
