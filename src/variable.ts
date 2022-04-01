import * as Interval from './interval';

export type t = {id: string, bounds: Interval.t}

export const tighten = (v: t, i: Interval.t): t => {
  const intersect = Interval.intersect(v.bounds, i);
  if (intersect !== null) {
    return {...v, bounds: intersect}
  } else {
    // the constraints are actually unsatisfiable at this point
    // this code helps us find a locally-error-best solution
    const {lb: vLB, ub: vUB} = v.bounds;
    if (v.bounds.ub < i.lb) {
      return {...v, bounds: {lb: vUB, ub: vUB}};
    } else {
      return {...v, bounds: {lb: vLB, ub: vLB}};
    }
  }
}

export const mk = (id: string): t => ({
  id,
  bounds: Interval.unbounded
})

const TOLERANCE = 1e-5;

export const isConst = (v: t): boolean => {
  return Math.abs(v.bounds.ub - v.bounds.lb) < TOLERANCE;
}

export const value = (v: t): number => (v.bounds.ub + v.bounds.lb) / 2;
