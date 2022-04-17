import { mkConstEqConstraint, mkVar, solve, value, mkEqConstraint, mkAffineConstraint, plus, mul, weak, medium, strong, Variable, Constraint, mkMaxMinConstraint } from './indigo';
import { blue } from './main';
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
    // spacing constraints
    mkAffineConstraint(plus(x, 5), 'eq', y),
    mkAffineConstraint(plus(y, 5), 'eq', z),
  ];
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(`x: ${value(x)}, y: ${value(y)}, z: ${value(z)}`);
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

/* 
[
    "$root.width ≡ 10 (Infinity)",
    "$root.height ≡ 20 (Infinity)",
    "$root.width ≡ (+ $root.right (* -1 $root.left)) (Infinity)",
    "$root.height ≡ (+ $root.bottom (* -1 $root.top)) (Infinity)",
    "$root.centerX ≡ (* 0.5 (+ $root.left $root.right)) (Infinity)",
    "$root.centerY ≡ (* 0.5 (+ $root.top $root.bottom)) (Infinity)",
    "$root.canvas.width ≡ (+ $root.canvas.right (* -1 $root.canvas.left)) (Infinity)",
    "$root.canvas.height ≡ (+ $root.canvas.bottom (* -1 $root.canvas.top)) (Infinity)",
    "$root.canvas.centerX ≡ (* 0.5 (+ $root.canvas.left $root.canvas.right)) (Infinity)",
    "$root.canvas.centerY ≡ (* 0.5 (+ $root.canvas.top $root.canvas.bottom)) (Infinity)",
    "$root.width ≡ $root.canvas.width (Infinity)",
    "$root.height ≡ $root.canvas.height (Infinity)",
    "$root.centerX ≡ (+ $root.canvas.centerX $root.transform.translate.x) (Infinity)",
    "$root.centerY ≡ (+ $root.canvas.centerY $root.transform.translate.y) (Infinity)",
    "$root.left ≡ 0 (Infinity)",
    "$root.top ≡ 0 (Infinity)",
    "$root.canvas.left ≡ 0 (7)",
    "$root.canvas.top ≡ 0 (7)",
    "$root.canvas.width ≡ 0 (9)",
    "$root.canvas.height ≡ 0 (9)"
]
*/

{
  const width = mkVar('width');
  const height = mkVar('height');
  const centerX = mkVar('centerX');
  const centerY = mkVar('centerY');
  const left = mkVar('left');
  const right = mkVar('right');
  const top = mkVar('top');
  const bottom = mkVar('bottom');
  const constraints = [
    mkAffineConstraint(centerX, 'eq', mul(0.5, plus(left, right))),
    mkAffineConstraint(centerY, 'eq', mul(0.5, plus(top, bottom))),
    mkAffineConstraint(width, 'eq', plus(right, mul(-1, left))),
    mkAffineConstraint(height, 'eq', plus(bottom, mul(-1, top))),
    mkConstEqConstraint(width, 10),
    mkConstEqConstraint(height, 20),
    mkConstEqConstraint(left, 0, strong),
    mkConstEqConstraint(top, 0, strong),
  ];
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(`left: ${value(left)}, top: ${value(top)}, width: ${value(width)}, height: ${value(height)}`);
}

type bbox<T> = {
  width: T,
  height: T,
  centerX: T,
  centerY: T,
  left: T,
  right: T,
  top: T,
  bottom: T,
}

const mkBBox = (name: string): { vars: bbox<Variable>, constraints: Constraint[] } => {
  const vars = {
    width: mkVar(name + '.width'),
    height: mkVar(name + '.height'),
    centerX: mkVar(name + '.centerX'),
    centerY: mkVar(name + '.centerY'),
    left: mkVar(name + '.left'),
    right: mkVar(name + '.right'),
    top: mkVar(name + '.top'),
    bottom: mkVar(name + '.bottom'),
  };
  return {
    vars,
    constraints: [
      mkAffineConstraint(vars.centerX, 'eq', mul(0.5, plus(vars.left, vars.right))),
      mkAffineConstraint(vars.centerY, 'eq', mul(0.5, plus(vars.top, vars.bottom))),
      mkAffineConstraint(vars.width, 'eq', plus(vars.right, mul(-1, vars.left))),
      mkAffineConstraint(vars.height, 'eq', plus(vars.bottom, mul(-1, vars.top))),
    ]
  }
}

{
  const { vars: rootBBoxVars, constraints: rootBBoxConstraints } = mkBBox('root');
  const constraints = [
    rootBBoxConstraints,
    mkConstEqConstraint(rootBBoxVars.width, 10),
    mkConstEqConstraint(rootBBoxVars.height, 20),
    mkConstEqConstraint(rootBBoxVars.left, 0, strong),
    mkConstEqConstraint(rootBBoxVars.top, 0, strong),
  ].flat();
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(`left: ${value(rootBBoxVars.left)}, top: ${value(rootBBoxVars.top)}, width: ${value(rootBBoxVars.width)}, height: ${value(rootBBoxVars.height)}`);
}

type Pt2D<T> = { x: T, y: T };

type CoordinateSpace<T> = {
  /* TODO: variable? */
  dims: bbox<T>, /* dimensions in _local_ frame. origin is at (0, 0) in this box */
  /* each child's local frame is transformed in this space using the _local_ frame of the *parent*
  space */
  /* without any transform, the coordinate space is rendered so that the origin of the child space
  equals the origin of the parent space */
  children: { transform: { translate: Pt2D<T> }, space: CoordinateSpace<T> }[],
}

/* 
defaults in descending priority order
- outer space tightly shrinkwraps to inner space
- top, left default to (0, 0)
- transform defaults to identity
*/

// example: two rectangles alignTop and hSpace(5)
{
  const space: CoordinateSpace<number> = {
    dims: {
      width: 405, /* inferred from children */
      height: 200, /* inferred from children */
      centerX: 405/2, /* inferred from bbox */
      centerY: 100, /* inferred from bbox*/
      left: 0, /* default */
      right: 405, /* inferred from bbox */
      top: 0, /* default */
      bottom: 200, /* inferred from bbox */
    },
    children: [
      {
        transform: { translate: { x: 0, y: 0} },
        space: { dims: {
          width: 100, /* specified */
          height: 200, /* specified */
          centerX: 50, /* inferred */
          centerY: 100, /* inferred */
          left: 0, /* default */
          right: 100, /* inferred */
          top: 0, /* default */
          bottom: 200, /* inferred */
        }, children: [] },
      },
      {
        // TODO: does this inference make sense when the origins are in different spots?
        // TODO: maybe expose constraints on the origin??? originX, originY just refer to the local
        // 0's
        // -> based on the way we set it up here, this would mean pure operations on the translations I think
        transform: { translate: { x: 105 /* inferred from hSpace(5) */, y: 0 /* inferred from alignTop */} },
        space: { dims: {
          width: 300, /* specified */
          height: 50, /* specified */
          centerX: 150, /* inferred */
          centerY: 25, /* inferred */
          left: 0, /* default */
          right: 300, /* inferred */
          top: 0, /* default */
          bottom: 50, /* inferred */
        }, children: [] },
      },
    ],
  }
}
/* 
To construct this, we need to make the top, left defaults stronger than the translate defaults so
that the modifications get pushed to the translate.
*/
const mkCoordinateSpace = (name: string, children: CoordinateSpace<Variable>[], values: Partial<bbox<number>> = {}): { space: CoordinateSpace<Variable>, constraints: Constraint[] } => {
  const { vars: dims, constraints } = mkBBox(name);
  const translate = { x: mkVar(name + '.transform.translate.x'), y: mkVar(name + '.transform.translate.y') };
  return {
      space: {
      dims,
      children: children.map(space => ({transform: { translate }, space}))
    },
    constraints: [
      // strong: bbox shrinkwrap
      mkMaxMinConstraint(dims.left, 'min', children.map(({ dims }) => dims.left), strong),
      mkMaxMinConstraint(dims.right, 'max', children.map(({ dims }) => dims.right), strong),
      mkMaxMinConstraint(dims.top, 'min', children.map(({ dims }) => dims.top), strong),
      mkMaxMinConstraint(dims.bottom, 'max', children.map(({ dims }) => dims.bottom), strong),
      // medium: top-left is at local (0, 0)
      mkConstEqConstraint(dims.top, 0, medium),
      mkConstEqConstraint(dims.left, 0, medium),
      // weak: translation
      mkConstEqConstraint(translate.x, 0, weak),
      mkConstEqConstraint(translate.y, 0, weak),
      // specified values
      Object.entries(values).map(([dim, value]: [keyof bbox<Variable>, number]) => mkConstEqConstraint(dims[dim], value)),
      constraints,
    ].flat(),
  }
}

const coordinateSpaceValues = (space: CoordinateSpace<Variable>): CoordinateSpace<number> => {
  return {
    dims: {
      width: value(space.dims.width),
      height: value(space.dims.height),
      centerX: value(space.dims.centerX),
      centerY: value(space.dims.centerY),
      left: value(space.dims.left),
      right: value(space.dims.right),
      top: value(space.dims.top),
      bottom: value(space.dims.bottom),
    },
    children: space.children.map(({ transform, space}) => ({ transform: { translate: { x: value(transform.translate.x), y: value(transform.translate.y) }}, space: coordinateSpaceValues(space) })),
  }
}

{
  const { space: rect_1, constraints: rect_1_constraints } =
    mkCoordinateSpace('rect_1', [], { width: 100, height: 200, });
  const { space: rect_2, constraints: rect_2_constraints } =
    mkCoordinateSpace('rect_2', [], { width: 300, height: 50, });
  const { space, constraints: root_constraints } = mkCoordinateSpace('$root', [
    rect_1,
    rect_2
  ]);
  const constraints = [
    rect_1_constraints,
    rect_2_constraints,
    root_constraints,
  ].flat();
  solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(coordinateSpaceValues(space));
}

{
  const constraints = [blue.mkConstEqConstraint('x', 5)];
  const solution = blue.solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(solution);
}

{
  const constraints = [blue.mkConstEqConstraint('x', 5), blue.mkEqConstraint('x', 'y')];
  const solution = blue.solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(solution);
}

{
  const constraints = [blue.mkConstEqConstraint('x', 5), blue.mkAffineConstraint(blue.plus('x', 'y'), 7)];
  const solution = blue.solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(solution);
}

{
  const constraints = [blue.mkConstEqConstraint('x', 0, blue.strong), blue.mkAffineConstraint('y', blue.plus('x', 7))];
  const solution = blue.solve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(solution);
}
{
  const constraints = [blue.mkConstEqConstraint('x', 0, blue.strong), blue.mkAffineConstraint('y', blue.plus('x', 7))];
  const solution = blue.layeredSolve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(solution);
}
{
  const constraints = [blue.mkConstEqConstraint('x', 0, blue.strong), blue.mkAffineConstraint('y', blue.plus('x', 7)), blue.mkMinMaxConstraint('left', 'min', ['x', 'y']), blue.mkMinMaxConstraint('right', 'max', ['x', 'y'])];
  const solution = blue.layeredSolve(constraints);
  console.log(constraints.map(c => c.toString()));
  console.log(solution);
}
