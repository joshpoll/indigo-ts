// All intervals are closed unless the bounds are infinite.
export type t = {
  // lower bound
  lb: number,
  // upper bound
  ub: number,
}

export const fromFloat = (f: number) => ({lb: f, ub: f});

export const unbounded = {lb: -Infinity, ub: Infinity};

export const intersect = (i1: t, i2: t): t | null => {
  // If the intervals do not intersect
  if (i1.ub < i2.lb || i1.lb > i2.ub) {
    return null;
  } else {
    return {lb: Math.max(i1.lb, i2.lb), ub: Math.min(i1.ub, i2.ub)}
  }
}

// returns intersection of i1 and i2 if it exists
// if not, returns closest point in i1 to i2.
export const intersectBestEffort = (i1: t, i2: t): t => {
  const intersection = intersect(i1, i2);
  if (intersection !== null) {
    return intersection;
  } else if (i1.ub < i2.lb) {
    return fromFloat(i1.ub);
  } else {
    return fromFloat(i1.lb);
  }
}

// interval arithmetic (see Appendix A of Indigo TR)
// TODO: TR employs some optimiziations, but I'm not sure if they're necessary

export const add = (i1: t, i2: t): t => ({
  lb: i1.lb + i2.lb,
  ub: i1.ub + i2.ub,
})

export const sub = (i1: t, i2: t): t => ({
  lb: i1.lb - i2.ub,
  ub: i1.ub - i2.lb,
})

export const mul = (i1: t, i2: t): t => {
  const lb = Math.min(i1.lb * i2.lb, i1.lb * i2.ub, i1.ub * i2.lb, i1.ub * i2.ub);
  const ub = Math.max(i1.lb * i2.lb, i1.lb * i2.ub, i1.ub * i2.lb, i1.ub * i2.ub);
  return {lb, ub};
}

export const div = (i1: t, i2: t): t => {
  // TODO: maybe want to change this behavior to return Infinity or to return null
  if (i2.lb <= 0. && 0. <= i2.ub) {
    throw "divide by zero"
  } else {
    return mul(i1, {lb: 1. / i2.ub, ub: 1. / i2.lb});
  }
}

export const max = (i1: t, i2: t): t => ({
  lb: Math.max(i1.lb, i2.lb),
  ub: Math.max(i1.ub, i2.ub),
})

export const min = (i1: t, i2: t): t => ({
  lb: Math.min(i1.lb, i2.lb),
  ub: Math.min(i1.ub, i2.ub),
})

export const is_close = (i1: t, i2: t, tol=1e-5): boolean => {
  return Math.abs(i1.lb - i2.lb) < tol && Math.abs(i1.ub - i2.ub) < tol;
}
