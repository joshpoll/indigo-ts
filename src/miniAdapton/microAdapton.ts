/* TODO: maybe this would be better as a class? So much mutation that it seems kinda natural. */

export type Adapton<T> = {
  // readonly
  thunk: () => T,

  result: T | undefined,
  // should really be heterogeneous sets I guess?
  sub: Set<Adapton<any>>,
  super: Set<Adapton<any>>,
  isClean: boolean,
}

export const isAdapton = (o: any): boolean => {
  return 'thunk' in o && 'result' in o && 'sub' in o && 'super' in o && 'isClean' in o
    && typeof o.thunk === 'function' && o.sub instanceof Set && o.super instanceof Set && typeof o.isClean === 'boolean';
}

export const mk = <T>(thunk: () => T): Adapton<T> => ({
  thunk,
  result: undefined,
  sub: new Set(),
  super: new Set(),
  isClean: false,
})

export const addDCGEdge = <S, T>(aSuper: Adapton<S>, aSub: Adapton<T>): void => {
  aSuper.sub.add(aSub);
  aSub.super.add(aSuper);
}

export const delDCGEdge = <S, T>(aSuper: Adapton<S>, aSub: Adapton<T>): void => {
  aSuper.sub.delete(aSub);
  aSub.sub.delete(aSuper);
}

export const compute = <T>(a: Adapton<T>): T => {
  if (a.isClean) {
    return a.result;
  } else {
    a.sub.forEach((x) => delDCGEdge(a, x))
    a.isClean = true;
    a.result = a.thunk();
    return compute(a);
  }
}

const dirty = <T>(a: Adapton<T>): void => {
  if (a.isClean) {
    a.isClean = false;
    a.super.forEach(dirty);
  }
}

export const ref = <T>(val: T): Adapton<T> => {
  const a: Adapton<T> = {
    thunk: () => a.result,
    result: val,
    sub: new Set(),
    super: new Set(),
    isClean: true,
  };

  return a;
}

export const setRef = <T>(a: Adapton<T>, val: T): void => {
  a.result = val;
  dirty(a);
}

