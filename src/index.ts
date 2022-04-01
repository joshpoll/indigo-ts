import { mkConstEqConstraint, mkVar, solve, value, mkEqConstraint, mkAffineConstraint, plus, weak, medium } from './indigo';
import * as Adapton from './miniAdapton/microAdapton';

console.log("hello world");

const r1 = Adapton.ref(8);
const r2 = Adapton.ref(10);
const a = Adapton.mk(() => {
  Adapton.addDCGEdge(a, r1);
  Adapton.addDCGEdge(a, r2);
  return Adapton.compute(r1) - Adapton.compute(r2);
})

// -2
console.log(Adapton.compute(a));
Adapton.setRef(r1, 2);
// -8
console.log(Adapton.compute(a));

{
  const x = mkVar('x');
  const c1 = mkConstEqConstraint(x, 5);
  solve([c1]);
  console.log(value(x));
  console.log(c1.toString());
}

{
  const x = mkVar('x');
  const c1 = mkConstEqConstraint(x, 5);
  const y = mkVar('y');
  const c2 = mkEqConstraint(x, y);
  const constraints = [c1, c2];
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(`x: ${value(x)}, y: ${value(y)}`);
}

{
  const x = mkVar('x');
  const c1 = mkConstEqConstraint(x, 5);
  const y = mkVar('y');
  const c2 = mkEqConstraint(x, y);
  const c3 = mkConstEqConstraint(y, 5);
  const constraints = [c1, c2, c3];
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(`x: ${value(x)}, y: ${value(y)}`);
}

// {
//   const x = mkVar('x');
//   const c1 = mkConstEqConstraint(x, 5);
//   const y = mkVar('y');
//   const c2 = mkEqConstraint(x, y);
//   const c3 = mkConstEqConstraint(y, 6);
//   const constraints = [c1, c2, c3];
//   solve(constraints);
//   console.log(constraints.map(c => c.toString()));
//   console.log(`x: ${value(x)}, y: ${value(y)}`);
// }

{
  const x = mkVar('x');
  const c1 = mkConstEqConstraint(x, 5);
  const y = mkVar('y');
  // const c2 = mkEqConstraint(x, y);
  const c2 = mkAffineConstraint(plus(x, y), 'eq', 12)
  // const c3 = mkConstEqConstraint(y, 6);
  const constraints = [c1, c2];
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(`x: ${value(x)}, y: ${value(y)}`);
}

{
  // TODO: the inequality constraint is not properly respected...
  const x = mkVar('x');
  const y = mkVar('y');
  const z = mkVar('z');
  const constraints = [
    // medium default constraints
    mkAffineConstraint(x, 'ge', 0, medium),
    mkAffineConstraint(y, 'ge', 0, medium),
    mkAffineConstraint(z, 'ge', 0, medium),
    // weak default constraints
    mkConstEqConstraint(x, 0, weak),
    mkConstEqConstraint(y, 0, weak),
    mkConstEqConstraint(z, 0, weak),
    // spacing constraints
    mkAffineConstraint(plus(x, 5), 'eq', y),
    mkAffineConstraint(plus(y, 5), 'eq', z),
  ];
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(`x: ${value(x)}, y: ${value(y)}, z: ${value(z)}`);
}