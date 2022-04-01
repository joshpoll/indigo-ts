// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"interval.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.is_close = exports.div = exports.mul = exports.sub = exports.add = exports.intersectBestEffort = exports.intersect = exports.unbounded = exports.fromFloat = void 0;

var fromFloat = function fromFloat(f) {
  return {
    lb: f,
    ub: f
  };
};

exports.fromFloat = fromFloat;
exports.unbounded = {
  lb: -Infinity,
  ub: Infinity
};

var intersect = function intersect(i1, i2) {
  // If the intervals do not intersect
  if (i1.ub < i2.lb || i1.lb > i2.ub) {
    return null;
  } else {
    return {
      lb: Math.max(i1.lb, i2.lb),
      ub: Math.min(i1.ub, i2.ub)
    };
  }
};

exports.intersect = intersect; // returns intersection of i1 and i2 if it exists
// if not, returns closest point in i1 to i2.

var intersectBestEffort = function intersectBestEffort(i1, i2) {
  var intersection = (0, exports.intersect)(i1, i2);

  if (intersection !== null) {
    return intersection;
  } else if (i1.ub < i2.lb) {
    return (0, exports.fromFloat)(i1.ub);
  } else {
    return (0, exports.fromFloat)(i1.lb);
  }
};

exports.intersectBestEffort = intersectBestEffort; // interval arithmetic (see Appendix A of Indigo TR)
// TODO: TR employs some optimiziations, but I'm not sure if they're necessary

var add = function add(i1, i2) {
  return {
    lb: i1.lb + i2.lb,
    ub: i1.ub + i2.ub
  };
};

exports.add = add;

var sub = function sub(i1, i2) {
  return {
    lb: i1.lb - i2.ub,
    ub: i1.ub - i2.lb
  };
};

exports.sub = sub;

var mul = function mul(i1, i2) {
  var lb = Math.min(i1.lb * i2.lb, i1.lb * i2.ub, i1.ub * i2.lb, i1.ub * i2.ub);
  var ub = Math.max(i1.lb * i2.lb, i1.lb * i2.ub, i1.ub * i2.lb, i1.ub * i2.ub);
  return {
    lb: lb,
    ub: ub
  };
};

exports.mul = mul;

var div = function div(i1, i2) {
  // TODO: maybe want to change this behavior to return Infinity or to return null
  if (i2.lb <= 0. && 0. <= i2.ub) {
    throw "divide by zero";
  } else {
    return (0, exports.mul)(i1, {
      lb: 1. / i2.ub,
      ub: 1. / i2.lb
    });
  }
};

exports.div = div;

var is_close = function is_close(i1, i2, tol) {
  if (tol === void 0) {
    tol = 1e-5;
  }

  return Math.abs(i1.lb - i2.lb) < tol && Math.abs(i1.ub - i2.ub) < tol;
};

exports.is_close = is_close;
},{}],"variable.ts":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.value = exports.isConst = exports.mk = exports.tighten = void 0;

var Interval = __importStar(require("./interval"));

var tighten = function tighten(v, i) {
  var intersect = Interval.intersect(v.bounds, i);

  if (intersect !== null) {
    return __assign(__assign({}, v), {
      bounds: intersect
    });
  } else {
    // the constraints are actually unsatisfiable at this point
    // this code helps us find a locally-error-best solution
    var _a = v.bounds,
        vLB = _a.lb,
        vUB = _a.ub;

    if (v.bounds.ub < i.lb) {
      return __assign(__assign({}, v), {
        bounds: {
          lb: vUB,
          ub: vUB
        }
      });
    } else {
      return __assign(__assign({}, v), {
        bounds: {
          lb: vLB,
          ub: vLB
        }
      });
    }
  }
};

exports.tighten = tighten;

var mk = function mk(id) {
  return {
    id: id,
    bounds: Interval.unbounded
  };
};

exports.mk = mk;
var TOLERANCE = 1e-5;

var isConst = function isConst(v) {
  return Math.abs(v.bounds.ub - v.bounds.lb) < TOLERANCE;
};

exports.isConst = isConst;

var value = function value(v) {
  return (v.bounds.ub + v.bounds.lb) / 2;
};

exports.value = value;
},{"./interval":"interval.ts"}],"indigo.ts":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkAffineConstraint = exports.mul = exports.plus = exports.mkEqConstraint = exports.mkConstEqConstraint = exports.solve = exports.value = exports.mkVar = exports.mkConstraint = exports.weaker = exports.weak = exports.medium = exports.strong = exports.required = void 0;

var VariableFoo = __importStar(require("./variable"));

var Interval = __importStar(require("./interval"));

var variable_1 = require("./variable");

exports.required = Infinity;
exports.strong = 9;
exports.medium = 8;
exports.weak = 7;
exports.weaker = 6;
var TOLERANCE = 1e-5;

var is_close = function is_close(x, y) {
  return Math.abs(x - y) < TOLERANCE;
};

var mkConstraint = function mkConstraint(vars, tighten, toString, status, strength) {
  var c = {
    vars: vars,
    tighten: tighten,
    strength: strength,
    status: status,
    toString: toString
  };
  vars.forEach(function (v) {
    return v.constraints.add(c);
  });
  return c;
};

exports.mkConstraint = mkConstraint;

var mkVar = function mkVar(id) {
  return {
    v: VariableFoo.mk(id),
    constraints: new Set(),
    toString: function toString() {
      return id;
    }
  };
};

exports.mkVar = mkVar;

var value = function value(v) {
  return VariableFoo.value(v.v);
};

exports.value = value;

var solve = function solve(constraints) {
  console.log('begin solve', constraints.map(function (c) {
    return c.toString();
  }));
  constraints.sort(function (c1, c2) {
    return c2.strength - c1.strength;
  });
  var activeConstraints = new Set();

  for (var _i = 0, constraints_1 = constraints; _i < constraints_1.length; _i++) {
    var constraint = constraints_1[_i];
    console.log("solving: ".concat(constraint));
    var tightVariables = new Set();
    var queue = [constraint];

    while (queue.length > 0) {
      var c = queue[0];
      console.log("visiting: ".concat(c));
      tighten_bounds(c, queue, tightVariables, activeConstraints);
      check_constraint(c, activeConstraints);
      queue.shift();
    }
  }
};

exports.solve = solve;

var tighten_bounds = function tighten_bounds(c, q, tightVariables, activeConstraints) {
  c.vars.forEach(function (v) {
    console.log("variable ".concat(v));
    console.log("tightVariables", Array.from(tightVariables.values()).map(function (v) {
      return v.toString();
    }));
    if (tightVariables.has(v)) return;
    var oldBounds = v.v.bounds;
    c.tighten.get(v)(); // TODO: maybe only add tight variables when they stop making progress? idk

    tightVariables.add(v);
    console.log('bounds', oldBounds, v.v.bounds);

    if (!Interval.is_close(oldBounds, v.v.bounds)) {
      console.log("".concat(v, " changed from"), oldBounds, "to", v.v.bounds);
      v.constraints.forEach(function (c) {
        if (activeConstraints.has(c) && q.find(function (o) {
          return c === o;
        }) === undefined) {
          q.push(c);
        }
      });
    }
  });
};

var check_constraint = function check_constraint(c, activeConstraints) {
  if (c.strength === exports.required && c.status() === 'unsat') {
    throw 'Required constraint is not satisfied';
  } else if (c.vars.size === 1) {
    // even if a unary constraint is not a constant equality, we don't learn anything new from
    // evaluating it more than once by monotonicity
    return; // TODO: maybe I can replace this check with a check for status === 'unknown'
    // then I can push the burden to the constraint for verifying this
  } else if (!Array.from(c.vars.values()).every(function (v) {
    return VariableFoo.isConst(v.v);
  })) {
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
};
/*
TODO: intersect returns `null` if the intersection fails. not sure how to deal with that b/c need to
catch it to determine unsat.

TODO: inequality constraints
TODO: affine versions of the above
TODO: min and max
*/


var mkConstEqConstraint = function mkConstEqConstraint(x, c, strength) {
  if (strength === void 0) {
    strength = exports.required;
  }

  return (0, exports.mkConstraint)(new Set([x]), new Map([[x, function () {
    // x.v.bounds = Interval.intersect(x.v.bounds, Interval.fromFloat(c));
    x.v.bounds = Interval.intersectBestEffort(x.v.bounds, Interval.fromFloat(c));
  }]]), function () {
    return "".concat(x, " = ").concat(c);
  }, function () {
    if (!(0, variable_1.isConst)(x.v)) {
      return 'unknown';
    } else {
      return is_close((0, exports.value)(x), c) ? 'sat' : 'unsat';
    }
  }, strength);
};

exports.mkConstEqConstraint = mkConstEqConstraint;

var mkEqConstraint = function mkEqConstraint(x, y, strength) {
  if (strength === void 0) {
    strength = exports.required;
  }

  return (0, exports.mkConstraint)(new Set([x, y]), new Map([[x, function () {
    // x.v.bounds = Interval.intersect(x.v.bounds, y.v.bounds);
    x.v.bounds = Interval.intersectBestEffort(x.v.bounds, y.v.bounds);
  }], [y, function () {
    // y.v.bounds = Interval.intersect(y.v.bounds, x.v.bounds);
    y.v.bounds = Interval.intersectBestEffort(y.v.bounds, x.v.bounds);
  }]]), function () {
    return "".concat(x, " = ").concat(y);
  }, function () {
    if (!((0, variable_1.isConst)(x.v) && (0, variable_1.isConst)(y.v))) {
      return 'unknown';
    } else {
      return is_close((0, exports.value)(x), (0, exports.value)(y)) ? 'sat' : 'unsat';
    }
  }, strength);
};

exports.mkEqConstraint = mkEqConstraint;

var plus = function plus() {
  var exprs = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    exprs[_i] = arguments[_i];
  }

  return {
    type: 'plus',
    exprs: exprs
  };
};

exports.plus = plus;

var mul = function mul(scalar, expr) {
  return {
    type: 'mul',
    scalar: scalar,
    expr: expr
  };
};

exports.mul = mul; // turns affine constraint into a_1x_1 + ... + a_nx_n + b = 0 where a_1, ..., a_n != 0

var canonicalizeAffineConstraint = function canonicalizeAffineConstraint(c) {
  var cLHS = canonicalizeExpr(c.lhs);
  var cRHS = canonicalizeExpr(c.rhs);
  var lhsMinusRhsTerms = new Map(cLHS.terms);
  cRHS.terms.forEach(function (v, k) {
    return lhsMinusRhsTerms.has(k) ? lhsMinusRhsTerms.set(k, lhsMinusRhsTerms.get(k) - v) : -v;
  });
  lhsMinusRhsTerms.forEach(function (v, k, m) {
    return is_close(v, 0) ? m.delete(k) : {};
  });
  var lhsMinusRhs = {
    terms: lhsMinusRhsTerms,
    bias: cLHS.bias - cRHS.bias
  };
  return __assign(__assign({}, lhsMinusRhs), {
    op: c.op
  });
}; // turns affine expression into a_1x_1 + ... + a_nx_n + b


var canonicalizeExpr = function canonicalizeExpr(c) {
  if (typeof c === 'number') {
    return {
      terms: new Map(),
      bias: c
    };
  } else if ('v' in c) {
    // variable
    return {
      terms: new Map([[c, 1]]),
      bias: 0
    };
  } else if (c.type === 'plus') {
    var cExprs = c.exprs.map(canonicalizeExpr);
    console.log('cExprs', cExprs);
    return cExprs.reduce(function (acc, ce) {
      ce.terms.forEach(function (v, k) {
        return acc.terms.has(k) ? acc.terms.set(k, acc.terms.get(k) + v) : acc.terms.set(k, v);
      });
      return {
        terms: acc.terms,
        bias: acc.bias + ce.bias
      };
    }, {
      terms: new Map(),
      bias: 0
    });
  } else if (c.type === 'mul') {
    var cExpr = canonicalizeExpr(c.expr);
    var mulTerms_1 = new Map();
    cExpr.terms.forEach(function (v, k) {
      return mulTerms_1.set(k, v * c.scalar);
    });
    return {
      terms: mulTerms_1,
      bias: cExpr.bias * c.scalar
    };
  } else {
    throw 'never';
  }
};

var mkAffineConstraint = function mkAffineConstraint(lhs, op, rhs, strength) {
  if (strength === void 0) {
    strength = exports.required;
  }

  var canonicalConstraint = canonicalizeAffineConstraint({
    lhs: lhs,
    op: op,
    rhs: rhs
  });
  console.log('canonical constraint', canonicalConstraint);
  return (0, exports.mkConstraint)(new Set(canonicalConstraint.terms.keys()), new Map(Array.from(canonicalConstraint.terms.keys()).map(function (v) {
    return [v, function () {
      /* a_1x_1 + ... + a_ix_i + ... + a_nx_n + b = 0 -> x_i = -1/a_i * (a_1x_1 + ... + a_nx_n + b)
        (without x_i ofc) */
      var vExprBounds = Interval.div(Array.from(canonicalConstraint.terms.entries()).reduce(function (acc, _a) {
        var x_i = _a[0],
            a_i = _a[1];
        return x_i === v ? acc : Interval.add(acc, Interval.mul(Interval.fromFloat(a_i), x_i.v.bounds));
      }, Interval.fromFloat(canonicalConstraint.bias)), Interval.fromFloat(-canonicalConstraint.terms.get(v)));

      if (canonicalConstraint.op === 'eq') {
        // v.v.bounds = Interval.intersect(v.v.bounds, vExprBounds);
        v.v.bounds = Interval.intersectBestEffort(v.v.bounds, vExprBounds);
      } else if (canonicalConstraint.op === 'le') {
        // v.v.bounds = Interval.intersect(v.v.bounds, { lb: -Infinity, ub: vExprBounds.ub })
        v.v.bounds = Interval.intersectBestEffort(v.v.bounds, {
          lb: -Infinity,
          ub: vExprBounds.ub
        });
      } else if (canonicalConstraint.op === 'ge') {
        // v.v.bounds = Interval.intersect(v.v.bounds, { lb: vExprBounds.lb, ub: Infinity })
        v.v.bounds = Interval.intersectBestEffort(v.v.bounds, {
          lb: vExprBounds.lb,
          ub: Infinity
        });
      } else {
        throw 'never';
      }
    }];
  })), function () {
    return "".concat(lhs, " ").concat(op, " ").concat(rhs);
  },
  /* TODO: do better */
  function () {
    if (!Array.from(canonicalConstraint.terms.keys()).every(function (v) {
      return (0, variable_1.isConst)(v.v);
    })) {
      return 'unknown';
    } else {
      /* actually compute the concrete term */
      var exprVal = Array.from(canonicalConstraint.terms.entries()).reduce(function (acc, _a) {
        var x_i = _a[0],
            a_i = _a[1];
        return acc + a_i * (0, exports.value)(x_i);
      }, canonicalConstraint.bias);

      if (canonicalConstraint.op === 'eq') {
        return is_close(exprVal, 0) ? 'sat' : 'unsat';
      } else if (canonicalConstraint.op === 'le') {
        return exprVal < 0 || is_close(exprVal, 0) ? 'sat' : 'unsat';
      } else if (canonicalConstraint.op === 'ge') {
        return exprVal > 0 || is_close(exprVal, 0) ? 'sat' : 'unsat';
      } else {
        throw 'never';
      }
    }
  }, strength);
};

exports.mkAffineConstraint = mkAffineConstraint;
},{"./variable":"variable.ts","./interval":"interval.ts"}],"miniAdapton/microAdapton.ts":[function(require,module,exports) {
"use strict";
/* TODO: maybe this would be better as a class? So much mutation that it seems kinda natural. */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRef = exports.ref = exports.compute = exports.delDCGEdge = exports.addDCGEdge = exports.mk = exports.isAdapton = void 0;

var isAdapton = function isAdapton(o) {
  return 'thunk' in o && 'result' in o && 'sub' in o && 'super' in o && 'isClean' in o && typeof o.thunk === 'function' && o.sub instanceof Set && o.super instanceof Set && typeof o.isClean === 'boolean';
};

exports.isAdapton = isAdapton;

var mk = function mk(thunk) {
  return {
    thunk: thunk,
    result: undefined,
    sub: new Set(),
    super: new Set(),
    isClean: false
  };
};

exports.mk = mk;

var addDCGEdge = function addDCGEdge(aSuper, aSub) {
  aSuper.sub.add(aSub);
  aSub.super.add(aSuper);
};

exports.addDCGEdge = addDCGEdge;

var delDCGEdge = function delDCGEdge(aSuper, aSub) {
  aSuper.sub.delete(aSub);
  aSub.sub.delete(aSuper);
};

exports.delDCGEdge = delDCGEdge;

var compute = function compute(a) {
  if (a.isClean) {
    return a.result;
  } else {
    a.sub.forEach(function (x) {
      return (0, exports.delDCGEdge)(a, x);
    });
    a.isClean = true;
    a.result = a.thunk();
    return (0, exports.compute)(a);
  }
};

exports.compute = compute;

var dirty = function dirty(a) {
  if (a.isClean) {
    a.isClean = false;
    a.super.forEach(dirty);
  }
};

var ref = function ref(val) {
  var a = {
    thunk: function thunk() {
      return a.result;
    },
    result: val,
    sub: new Set(),
    super: new Set(),
    isClean: true
  };
  return a;
};

exports.ref = ref;

var setRef = function setRef(a, val) {
  a.result = val;
  dirty(a);
};

exports.setRef = setRef;
},{}],"index.ts":[function(require,module,exports) {
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var indigo_1 = require("./indigo");

var Adapton = __importStar(require("./miniAdapton/microAdapton"));

console.log("hello world");
var r1 = Adapton.ref(8);
var r2 = Adapton.ref(10);
var a = Adapton.mk(function () {
  Adapton.addDCGEdge(a, r1);
  Adapton.addDCGEdge(a, r2);
  return Adapton.compute(r1) - Adapton.compute(r2);
}); // -2

console.log(Adapton.compute(a));
Adapton.setRef(r1, 2); // -8

console.log(Adapton.compute(a));
{
  var x = (0, indigo_1.mkVar)('x');
  var c1 = (0, indigo_1.mkConstEqConstraint)(x, 5);
  (0, indigo_1.solve)([c1]);
  console.log((0, indigo_1.value)(x));
  console.log(c1.toString());
}
{
  var x = (0, indigo_1.mkVar)('x');
  var c1 = (0, indigo_1.mkConstEqConstraint)(x, 5);
  var y = (0, indigo_1.mkVar)('y');
  var c2 = (0, indigo_1.mkEqConstraint)(x, y);
  var constraints = [c1, c2];
  (0, indigo_1.solve)(constraints);
  console.log(constraints.map(function (c) {
    return c.toString();
  }));
  console.log("x: ".concat((0, indigo_1.value)(x), ", y: ").concat((0, indigo_1.value)(y)));
}
{
  var x = (0, indigo_1.mkVar)('x');
  var c1 = (0, indigo_1.mkConstEqConstraint)(x, 5);
  var y = (0, indigo_1.mkVar)('y');
  var c2 = (0, indigo_1.mkEqConstraint)(x, y);
  var c3 = (0, indigo_1.mkConstEqConstraint)(y, 5);
  var constraints = [c1, c2, c3];
  (0, indigo_1.solve)(constraints);
  console.log(constraints.map(function (c) {
    return c.toString();
  }));
  console.log("x: ".concat((0, indigo_1.value)(x), ", y: ").concat((0, indigo_1.value)(y)));
} // {
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
  var x = (0, indigo_1.mkVar)('x');
  var c1 = (0, indigo_1.mkConstEqConstraint)(x, 5);
  var y = (0, indigo_1.mkVar)('y'); // const c2 = mkEqConstraint(x, y);

  var c2 = (0, indigo_1.mkAffineConstraint)((0, indigo_1.plus)(x, y), 'eq', 12); // const c3 = mkConstEqConstraint(y, 6);

  var constraints = [c1, c2];
  (0, indigo_1.solve)(constraints);
  console.log(constraints.map(function (c) {
    return c.toString();
  }));
  console.log("x: ".concat((0, indigo_1.value)(x), ", y: ").concat((0, indigo_1.value)(y)));
}
{
  // TODO: the inequality constraint is not properly respected...
  var x = (0, indigo_1.mkVar)('x');
  var y = (0, indigo_1.mkVar)('y');
  var z = (0, indigo_1.mkVar)('z');
  var constraints = [// medium default constraints
  (0, indigo_1.mkAffineConstraint)(x, 'ge', 0, indigo_1.medium), (0, indigo_1.mkAffineConstraint)(y, 'ge', 0, indigo_1.medium), (0, indigo_1.mkAffineConstraint)(z, 'ge', 0, indigo_1.medium), // weak default constraints
  (0, indigo_1.mkConstEqConstraint)(x, 0, indigo_1.weak), (0, indigo_1.mkConstEqConstraint)(y, 0, indigo_1.weak), (0, indigo_1.mkConstEqConstraint)(z, 0, indigo_1.weak), // spacing constraints
  (0, indigo_1.mkAffineConstraint)((0, indigo_1.plus)(x, 5), 'eq', y), (0, indigo_1.mkAffineConstraint)((0, indigo_1.plus)(y, 5), 'eq', z)];
  (0, indigo_1.solve)(constraints);
  console.log(constraints.map(function (c) {
    return c.toString();
  }));
  console.log("x: ".concat((0, indigo_1.value)(x), ", y: ").concat((0, indigo_1.value)(y), ", z: ").concat((0, indigo_1.value)(z)));
}
},{"./indigo":"indigo.ts","./miniAdapton/microAdapton":"miniAdapton/microAdapton.ts"}],"../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56792" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/src.77de5100.js.map