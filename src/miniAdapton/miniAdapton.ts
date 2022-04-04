import * as Adapton from './microAdapton';

export function force<T>(a: Adapton.Adapton<T>): T {
  const prevAdapting = force.currentlyAdapting; // save what we're currently adapting
  force.currentlyAdapting = a; // we are now adapting `a`
  const result = Adapton.compute(a);
  force.currentlyAdapting = prevAdapting; // we are finished adapting `a`
  if (force.currentlyAdapting !== undefined) {
    // whatever we're currently adapting depends on `a` since we forced `a` while adapting the
    // current thing
    Adapton.addDCGEdge(force.currentlyAdapting, a);
  }
  return result;
}
export namespace force {
  export let currentlyAdapting: Adapton.Adapton<any> | undefined = undefined;
}
