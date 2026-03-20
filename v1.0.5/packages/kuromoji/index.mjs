var Yi = (Ar, dr) => () => (dr || Ar((dr = { exports: {} }).exports, dr), dr.exports);
var Hi = Yi((Qe, Rt) => {
  (function (Ar) {
    if (typeof Qe == "object" && typeof Rt < "u") Rt.exports = Ar();
    else if (typeof define == "function" && define.amd) define([], Ar);
    else {
      var dr;
      (typeof window < "u"
        ? (dr = window)
        : typeof global < "u"
          ? (dr = global)
          : typeof self < "u"
            ? (dr = self)
            : (dr = this),
        (dr.kuromoji = Ar()));
    }
  })(() => {
    var Ar, dr, Zi;
    return (() => {
      function N(P, G, g) {
        function c(o, f) {
          if (!G[o]) {
            if (!P[o]) {
              var a = typeof require == "function" && require;
              if (!f && a) return a(o, !0);
              if (e) return e(o, !0);
              var u = new Error("Cannot find module '" + o + "'");
              throw ((u.code = "MODULE_NOT_FOUND"), u);
            }
            var l = (G[o] = { exports: {} });
            P[o][0].call(
              l.exports,
              (y) => {
                var m = P[o][1][y];
                return c(m || y);
              },
              l,
              l.exports,
              N,
              P,
              G,
              g,
            );
          }
          return G[o].exports;
        }
        for (var e = typeof require == "function" && require, i = 0; i < g.length; i++) c(g[i]);
        return c;
      }
      return N;
    })()(
      {
        1: [
          function (N, P, G) {
            (function (g, c) {
              ((e, i) => {
                typeof G == "object" && typeof P < "u"
                  ? i(G)
                  : typeof Ar == "function" && Ar.amd
                    ? Ar(["exports"], i)
                    : i((e.async = e.async || {}));
              })(this, (e) => {
                function i(r, t) {
                  t = t | 0;
                  for (var n = Math.max(r.length - t, 0), s = Array(n), h = 0; h < n; h++)
                    s[h] = r[t + h];
                  return s;
                }
                var o = (r) => {
                    var t = i(arguments, 1);
                    return () => {
                      var n = i(arguments);
                      return r.apply(null, t.concat(n));
                    };
                  },
                  f = (r) =>
                    function () {
                      var t = i(arguments),
                        n = t.pop();
                      r.call(this, t, n);
                    };
                function a(r) {
                  var t = typeof r;
                  return r != null && (t == "object" || t == "function");
                }
                var u = typeof setImmediate == "function" && setImmediate,
                  l = typeof g == "object" && typeof g.nextTick == "function";
                function y(r) {
                  setTimeout(r, 0);
                }
                function m(r) {
                  return (t) => {
                    var n = i(arguments, 1);
                    r(() => {
                      t.apply(null, n);
                    });
                  };
                }
                var T;
                u ? (T = setImmediate) : l ? (T = g.nextTick) : (T = y);
                var L = m(T);
                function Z(r) {
                  return f(function (t, n) {
                    var s;
                    try {
                      s = r.apply(this, t);
                    } catch (h) {
                      return n(h);
                    }
                    a(s) && typeof s.then == "function"
                      ? s.then(
                          (h) => {
                            R(n, null, h);
                          },
                          (h) => {
                            R(n, h.message ? h : new Error(h));
                          },
                        )
                      : n(null, s);
                  });
                }
                function R(r, t, n) {
                  try {
                    r(t, n);
                  } catch (s) {
                    L(H, s);
                  }
                }
                function H(r) {
                  throw r;
                }
                var X = typeof Symbol == "function";
                function C(r) {
                  return X && r[Symbol.toStringTag] === "AsyncFunction";
                }
                function b(r) {
                  return C(r) ? Z(r) : r;
                }
                function O(r) {
                  return function (t) {
                    var n = i(arguments, 1),
                      s = f(function (h, p) {
                        return r(
                          t,
                          (d, A) => {
                            b(d).apply(this, h.concat(A));
                          },
                          p,
                        );
                      });
                    return n.length ? s.apply(this, n) : s;
                  };
                }
                var x = typeof c == "object" && c && c.Object === Object && c,
                  B = typeof self == "object" && self && self.Object === Object && self,
                  D = x || B || Function("return this")(),
                  E = D.Symbol,
                  j = Object.prototype,
                  F = j.hasOwnProperty,
                  K = j.toString,
                  J = E ? E.toStringTag : void 0;
                function pr(r) {
                  var t = F.call(r, J),
                    n = r[J];
                  try {
                    r[J] = void 0;
                    var s = !0;
                  } catch {}
                  var h = K.call(r);
                  return (s && (t ? (r[J] = n) : delete r[J]), h);
                }
                var Br = Object.prototype,
                  Tr = Br.toString;
                function qr(r) {
                  return Tr.call(r);
                }
                var Tt = "[object Null]",
                  Gr = "[object Undefined]",
                  Dr = E ? E.toStringTag : void 0;
                function Lr(r) {
                  return r == null
                    ? r === void 0
                      ? Gr
                      : Tt
                    : Dr && Dr in Object(r)
                      ? pr(r)
                      : qr(r);
                }
                var St = "[object AsyncFunction]",
                  vr = "[object Function]",
                  jr = "[object GeneratorFunction]",
                  xr = "[object Proxy]";
                function I(r) {
                  if (!a(r)) return !1;
                  var t = Lr(r);
                  return t == vr || t == jr || t == St || t == xr;
                }
                var w = 9007199254740991;
                function S(r) {
                  return typeof r == "number" && r > -1 && r % 1 == 0 && r <= w;
                }
                function _(r) {
                  return r != null && S(r.length) && !I(r);
                }
                var v = {};
                function k() {}
                function V(r) {
                  return function () {
                    if (r !== null) {
                      var t = r;
                      ((r = null), t.apply(this, arguments));
                    }
                  };
                }
                var Q = typeof Symbol == "function" && Symbol.iterator,
                  q = (r) => Q && r[Q] && r[Q]();
                function or(r, t) {
                  for (var n = -1, s = Array(r); ++n < r; ) s[n] = t(n);
                  return s;
                }
                function rr(r) {
                  return r != null && typeof r == "object";
                }
                var $ = "[object Arguments]";
                function W(r) {
                  return rr(r) && Lr(r) == $;
                }
                var hr = Object.prototype,
                  sr = hr.hasOwnProperty,
                  Sr = hr.propertyIsEnumerable,
                  Ur = W(arguments)
                    ? W
                    : (r) => rr(r) && sr.call(r, "callee") && !Sr.call(r, "callee"),
                  nr = Array.isArray;
                function yr() {
                  return !1;
                }
                var Or = typeof e == "object" && e && !e.nodeType && e,
                  Cr = Or && typeof P == "object" && P && !P.nodeType && P,
                  rt = Cr && Cr.exports === Or,
                  fr = rt ? D.Buffer : void 0,
                  Xe = fr ? fr.isBuffer : void 0,
                  Je = Xe || yr,
                  qe = 9007199254740991,
                  rn = /^(?:0|[1-9]\d*)$/;
                function tn(r, t) {
                  return (
                    (t = t ?? qe),
                    !!t && (typeof r == "number" || rn.test(r)) && r > -1 && r % 1 == 0 && r < t
                  );
                }
                var en = "[object Arguments]",
                  nn = "[object Array]",
                  an = "[object Boolean]",
                  on = "[object Date]",
                  sn = "[object Error]",
                  un = "[object Function]",
                  fn = "[object Map]",
                  ln = "[object Number]",
                  hn = "[object Object]",
                  cn = "[object RegExp]",
                  pn = "[object Set]",
                  vn = "[object String]",
                  yn = "[object WeakMap]",
                  gn = "[object ArrayBuffer]",
                  dn = "[object DataView]",
                  mn = "[object Float32Array]",
                  bn = "[object Float64Array]",
                  _n = "[object Int8Array]",
                  wn = "[object Int16Array]",
                  An = "[object Int32Array]",
                  Tn = "[object Uint8Array]",
                  Sn = "[object Uint8ClampedArray]",
                  Cn = "[object Uint16Array]",
                  kn = "[object Uint32Array]",
                  tr = {};
                ((tr[mn] =
                  tr[bn] =
                  tr[_n] =
                  tr[wn] =
                  tr[An] =
                  tr[Tn] =
                  tr[Sn] =
                  tr[Cn] =
                  tr[kn] =
                    !0),
                  (tr[en] =
                    tr[nn] =
                    tr[gn] =
                    tr[an] =
                    tr[dn] =
                    tr[on] =
                    tr[sn] =
                    tr[un] =
                    tr[fn] =
                    tr[ln] =
                    tr[hn] =
                    tr[cn] =
                    tr[pn] =
                    tr[vn] =
                    tr[yn] =
                      !1));
                function In(r) {
                  return rr(r) && S(r.length) && !!tr[Lr(r)];
                }
                function En(r) {
                  return (t) => r(t);
                }
                var Vt = typeof e == "object" && e && !e.nodeType && e,
                  Gt = Vt && typeof P == "object" && P && !P.nodeType && P,
                  Bn = Gt && Gt.exports === Vt,
                  Ct = Bn && x.process,
                  Kt = (() => {
                    try {
                      return Ct && Ct.binding && Ct.binding("util");
                    } catch {}
                  })(),
                  Wt = Kt && Kt.isTypedArray,
                  Dn = Wt ? En(Wt) : In,
                  Ln = Object.prototype,
                  jn = Ln.hasOwnProperty;
                function xn(r, t) {
                  var n = nr(r),
                    s = !n && Ur(r),
                    h = !n && !s && Je(r),
                    p = !n && !s && !h && Dn(r),
                    d = n || s || h || p,
                    A = d ? or(r.length, String) : [],
                    U = A.length;
                  for (var z in r)
                    (t || jn.call(r, z)) &&
                      !(
                        d &&
                        (z == "length" ||
                          (h && (z == "offset" || z == "parent")) ||
                          (p && (z == "buffer" || z == "byteLength" || z == "byteOffset")) ||
                          tn(z, U))
                      ) &&
                      A.push(z);
                  return A;
                }
                var Un = Object.prototype;
                function On(r) {
                  var t = r && r.constructor,
                    n = (typeof t == "function" && t.prototype) || Un;
                  return r === n;
                }
                function Mn(r, t) {
                  return (n) => r(t(n));
                }
                var Nn = Mn(Object.keys, Object),
                  Pn = Object.prototype,
                  zn = Pn.hasOwnProperty;
                function Fn(r) {
                  if (!On(r)) return Nn(r);
                  var t = [];
                  for (var n in Object(r)) zn.call(r, n) && n != "constructor" && t.push(n);
                  return t;
                }
                function kt(r) {
                  return _(r) ? xn(r) : Fn(r);
                }
                function $n(r) {
                  var t = -1,
                    n = r.length;
                  return function () {
                    return ++t < n ? { value: r[t], key: t } : null;
                  };
                }
                function Rn(r) {
                  var t = -1;
                  return function () {
                    var s = r.next();
                    return s.done ? null : (t++, { value: s.value, key: t });
                  };
                }
                function Vn(r) {
                  var t = kt(r),
                    n = -1,
                    s = t.length;
                  return function () {
                    var p = t[++n];
                    return n < s ? { value: r[p], key: p } : null;
                  };
                }
                function Gn(r) {
                  if (_(r)) return $n(r);
                  var t = q(r);
                  return t ? Rn(t) : Vn(r);
                }
                function br(r) {
                  return function () {
                    if (r === null) throw new Error("Callback was already called.");
                    var t = r;
                    ((r = null), t.apply(this, arguments));
                  };
                }
                function tt(r) {
                  return (t, n, s) => {
                    if (((s = V(s || k)), r <= 0 || !t)) return s(null);
                    var h = Gn(t),
                      p = !1,
                      d = 0;
                    function A(z, M) {
                      if (((d -= 1), z)) ((p = !0), s(z));
                      else {
                        if (M === v || (p && d <= 0)) return ((p = !0), s(null));
                        U();
                      }
                    }
                    function U() {
                      for (; d < r && !p; ) {
                        var z = h();
                        if (z === null) {
                          ((p = !0), d <= 0 && s(null));
                          return;
                        }
                        ((d += 1), n(z.value, z.key, br(A)));
                      }
                    }
                    U();
                  };
                }
                function Mr(r, t, n, s) {
                  tt(t)(r, b(n), s);
                }
                function lr(r, t) {
                  return (n, s, h) => r(n, t, s, h);
                }
                function Kn(r, t, n) {
                  n = V(n || k);
                  var s = 0,
                    h = 0,
                    p = r.length;
                  p === 0 && n(null);
                  function d(A, U) {
                    A ? n(A) : (++h === p || U === v) && n(null);
                  }
                  for (; s < p; s++) t(r[s], s, br(d));
                }
                var Wn = lr(Mr, 1 / 0),
                  Ir = (r, t, n) => {
                    var s = _(r) ? Kn : Wn;
                    s(r, b(t), n);
                  };
                function Nr(r) {
                  return (t, n, s) => r(Ir, t, b(n), s);
                }
                function Yt(r, t, n, s) {
                  ((s = s || k), (t = t || []));
                  var h = [],
                    p = 0,
                    d = b(n);
                  r(
                    t,
                    (A, U, z) => {
                      var M = p++;
                      d(A, (Y, er) => {
                        ((h[M] = er), z(Y));
                      });
                    },
                    (A) => {
                      s(A, h);
                    },
                  );
                }
                var et = Nr(Yt),
                  Ht = O(et);
                function Pr(r) {
                  return (t, n, s, h) => r(tt(n), t, b(s), h);
                }
                var zr = Pr(Yt),
                  It = lr(zr, 1),
                  Zt = O(It);
                function nt(r, t) {
                  for (var n = -1, s = r == null ? 0 : r.length; ++n < s && t(r[n], n, r) !== !1; );
                  return r;
                }
                function Yn(r) {
                  return (t, n, s) => {
                    for (var h = -1, p = Object(t), d = s(t), A = d.length; A--; ) {
                      var U = d[r ? A : ++h];
                      if (n(p[U], U, p) === !1) break;
                    }
                    return t;
                  };
                }
                var Hn = Yn();
                function Kr(r, t) {
                  return r && Hn(r, t, kt);
                }
                function Zn(r, t, n, s) {
                  for (var h = r.length, p = n + (s ? 1 : -1); s ? p-- : ++p < h; )
                    if (t(r[p], p, r)) return p;
                  return -1;
                }
                function Qn(r) {
                  return r !== r;
                }
                function Xn(r, t, n) {
                  for (var s = n - 1, h = r.length; ++s < h; ) if (r[s] === t) return s;
                  return -1;
                }
                function it(r, t, n) {
                  return t === t ? Xn(r, t, n) : Zn(r, Qn, n);
                }
                var Et = (r, t, n) => {
                  (typeof t == "function" && ((n = t), (t = null)), (n = V(n || k)));
                  var s = kt(r),
                    h = s.length;
                  if (!h) return n(null);
                  t || (t = h);
                  var p = {},
                    d = 0,
                    A = !1,
                    U = Object.create(null),
                    z = [],
                    M = [],
                    Y = {};
                  (Kr(r, (ir, ar) => {
                    if (!nr(ir)) {
                      (er(ar, [ir]), M.push(ar));
                      return;
                    }
                    var ur = ir.slice(0, ir.length - 1),
                      kr = ur.length;
                    if (kr === 0) {
                      (er(ar, ir), M.push(ar));
                      return;
                    }
                    ((Y[ar] = kr),
                      nt(ur, (Vr) => {
                        if (!r[Vr])
                          throw new Error(
                            "async.auto task `" +
                              ar +
                              "` has a non-existent dependency `" +
                              Vr +
                              "` in " +
                              ur.join(", "),
                          );
                        _r(Vr, () => {
                          (kr--, kr === 0 && er(ar, ir));
                        });
                      }));
                  }),
                    Vi(),
                    cr());
                  function er(ir, ar) {
                    z.push(() => {
                      wr(ir, ar);
                    });
                  }
                  function cr() {
                    if (z.length === 0 && d === 0) return n(null, p);
                    for (; z.length && d < t; ) {
                      var ir = z.shift();
                      ir();
                    }
                  }
                  function _r(ir, ar) {
                    var ur = U[ir];
                    (ur || (ur = U[ir] = []), ur.push(ar));
                  }
                  function gr(ir) {
                    var ar = U[ir] || [];
                    (nt(ar, (ur) => {
                      ur();
                    }),
                      cr());
                  }
                  function wr(ir, ar) {
                    if (!A) {
                      var ur = br((Vr, Ft) => {
                        if ((d--, arguments.length > 2 && (Ft = i(arguments, 1)), Vr)) {
                          var $t = {};
                          (Kr(p, (Ki, Wi) => {
                            $t[Wi] = Ki;
                          }),
                            ($t[ir] = Ft),
                            (A = !0),
                            (U = Object.create(null)),
                            n(Vr, $t));
                        } else ((p[ir] = Ft), gr(ir));
                      });
                      d++;
                      var kr = b(ar[ar.length - 1]);
                      ar.length > 1 ? kr(p, ur) : kr(ur);
                    }
                  }
                  function Vi() {
                    for (var ir, ar = 0; M.length; )
                      ((ir = M.pop()),
                        ar++,
                        nt(Gi(ir), (ur) => {
                          --Y[ur] === 0 && M.push(ur);
                        }));
                    if (ar !== h)
                      throw new Error(
                        "async.auto cannot execute tasks due to a recursive dependency",
                      );
                  }
                  function Gi(ir) {
                    var ar = [];
                    return (
                      Kr(r, (ur, kr) => {
                        nr(ur) && it(ur, ir, 0) >= 0 && ar.push(kr);
                      }),
                      ar
                    );
                  }
                };
                function Fr(r, t) {
                  for (var n = -1, s = r == null ? 0 : r.length, h = Array(s); ++n < s; )
                    h[n] = t(r[n], n, r);
                  return h;
                }
                var Jn = "[object Symbol]";
                function qn(r) {
                  return typeof r == "symbol" || (rr(r) && Lr(r) == Jn);
                }
                var ri = 1 / 0,
                  Qt = E ? E.prototype : void 0,
                  Xt = Qt ? Qt.toString : void 0;
                function Bt(r) {
                  if (typeof r == "string") return r;
                  if (nr(r)) return Fr(r, Bt) + "";
                  if (qn(r)) return Xt ? Xt.call(r) : "";
                  var t = r + "";
                  return t == "0" && 1 / r == -ri ? "-0" : t;
                }
                function ti(r, t, n) {
                  var s = -1,
                    h = r.length;
                  (t < 0 && (t = -t > h ? 0 : h + t),
                    (n = n > h ? h : n),
                    n < 0 && (n += h),
                    (h = t > n ? 0 : (n - t) >>> 0),
                    (t >>>= 0));
                  for (var p = Array(h); ++s < h; ) p[s] = r[s + t];
                  return p;
                }
                function ei(r, t, n) {
                  var s = r.length;
                  return ((n = n === void 0 ? s : n), !t && n >= s ? r : ti(r, t, n));
                }
                function ni(r, t) {
                  for (var n = r.length; n-- && it(t, r[n], 0) > -1; );
                  return n;
                }
                function ii(r, t) {
                  for (var n = -1, s = r.length; ++n < s && it(t, r[n], 0) > -1; );
                  return n;
                }
                function ai(r) {
                  return r.split("");
                }
                var oi = "\\ud800-\\udfff",
                  si = "\\u0300-\\u036f",
                  ui = "\\ufe20-\\ufe2f",
                  fi = "\\u20d0-\\u20ff",
                  li = si + ui + fi,
                  hi = "\\ufe0e\\ufe0f",
                  ci = "\\u200d",
                  pi = RegExp("[" + ci + oi + li + hi + "]");
                function vi(r) {
                  return pi.test(r);
                }
                var Jt = "\\ud800-\\udfff",
                  yi = "\\u0300-\\u036f",
                  gi = "\\ufe20-\\ufe2f",
                  di = "\\u20d0-\\u20ff",
                  mi = yi + gi + di,
                  bi = "\\ufe0e\\ufe0f",
                  _i = "[" + Jt + "]",
                  Dt = "[" + mi + "]",
                  Lt = "\\ud83c[\\udffb-\\udfff]",
                  wi = "(?:" + Dt + "|" + Lt + ")",
                  qt = "[^" + Jt + "]",
                  re = "(?:\\ud83c[\\udde6-\\uddff]){2}",
                  te = "[\\ud800-\\udbff][\\udc00-\\udfff]",
                  Ai = "\\u200d",
                  ee = wi + "?",
                  ne = "[" + bi + "]?",
                  Ti = "(?:" + Ai + "(?:" + [qt, re, te].join("|") + ")" + ne + ee + ")*",
                  Si = ne + ee + Ti,
                  Ci = "(?:" + [qt + Dt + "?", Dt, re, te, _i].join("|") + ")",
                  ki = RegExp(Lt + "(?=" + Lt + ")|" + Ci + Si, "g");
                function Ii(r) {
                  return r.match(ki) || [];
                }
                function ie(r) {
                  return vi(r) ? Ii(r) : ai(r);
                }
                function Ei(r) {
                  return r == null ? "" : Bt(r);
                }
                var Bi = /^\s+|\s+$/g;
                function Di(r, t, n) {
                  if (((r = Ei(r)), r && (n || t === void 0))) return r.replace(Bi, "");
                  if (!r || !(t = Bt(t))) return r;
                  var s = ie(r),
                    h = ie(t),
                    p = ii(s, h),
                    d = ni(s, h) + 1;
                  return ei(s, p, d).join("");
                }
                var Li = /^(?:async\s+)?(function)?\s*[^(]*\(\s*([^)]*)\)/m,
                  ji = /,/,
                  xi = /(=.+)?(\s*)$/,
                  Ui = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
                function Oi(r) {
                  return (
                    (r = r.toString().replace(Ui, "")),
                    (r = r.match(Li)[2].replace(" ", "")),
                    (r = r ? r.split(ji) : []),
                    (r = r.map((t) => Di(t.replace(xi, "")))),
                    r
                  );
                }
                function ae(r, t) {
                  var n = {};
                  (Kr(r, (s, h) => {
                    var p,
                      d = C(s),
                      A = (!d && s.length === 1) || (d && s.length === 0);
                    if (nr(s))
                      ((p = s.slice(0, -1)),
                        (s = s[s.length - 1]),
                        (n[h] = p.concat(p.length > 0 ? U : s)));
                    else if (A) n[h] = s;
                    else {
                      if (((p = Oi(s)), s.length === 0 && !d && p.length === 0))
                        throw new Error("autoInject task functions require explicit parameters.");
                      (d || p.pop(), (n[h] = p.concat(U)));
                    }
                    function U(z, M) {
                      var Y = Fr(p, (er) => z[er]);
                      (Y.push(M), b(s).apply(null, Y));
                    }
                  }),
                    Et(n, t));
                }
                function mr() {
                  ((this.head = this.tail = null), (this.length = 0));
                }
                function oe(r, t) {
                  ((r.length = 1), (r.head = r.tail = t));
                }
                ((mr.prototype.removeLink = function (r) {
                  return (
                    r.prev ? (r.prev.next = r.next) : (this.head = r.next),
                    r.next ? (r.next.prev = r.prev) : (this.tail = r.prev),
                    (r.prev = r.next = null),
                    (this.length -= 1),
                    r
                  );
                }),
                  (mr.prototype.empty = function () {
                    for (; this.head; ) this.shift();
                    return this;
                  }),
                  (mr.prototype.insertAfter = function (r, t) {
                    ((t.prev = r),
                      (t.next = r.next),
                      r.next ? (r.next.prev = t) : (this.tail = t),
                      (r.next = t),
                      (this.length += 1));
                  }),
                  (mr.prototype.insertBefore = function (r, t) {
                    ((t.prev = r.prev),
                      (t.next = r),
                      r.prev ? (r.prev.next = t) : (this.head = t),
                      (r.prev = t),
                      (this.length += 1));
                  }),
                  (mr.prototype.unshift = function (r) {
                    this.head ? this.insertBefore(this.head, r) : oe(this, r);
                  }),
                  (mr.prototype.push = function (r) {
                    this.tail ? this.insertAfter(this.tail, r) : oe(this, r);
                  }),
                  (mr.prototype.shift = function () {
                    return this.head && this.removeLink(this.head);
                  }),
                  (mr.prototype.pop = function () {
                    return this.tail && this.removeLink(this.tail);
                  }),
                  (mr.prototype.toArray = function () {
                    for (var r = Array(this.length), t = this.head, n = 0; n < this.length; n++)
                      ((r[n] = t.data), (t = t.next));
                    return r;
                  }),
                  (mr.prototype.remove = function (r) {
                    for (var t = this.head; t; ) {
                      var n = t.next;
                      (r(t) && this.removeLink(t), (t = n));
                    }
                    return this;
                  }));
                function se(r, t, n) {
                  if (t == null) t = 1;
                  else if (t === 0) throw new Error("Concurrency must not be zero");
                  var s = b(r),
                    h = 0,
                    p = [],
                    d = !1;
                  function A(Y, er, cr) {
                    if (cr != null && typeof cr != "function")
                      throw new Error("task callback must be a function");
                    if (((M.started = !0), nr(Y) || (Y = [Y]), Y.length === 0 && M.idle()))
                      return L(() => {
                        M.drain();
                      });
                    for (var _r = 0, gr = Y.length; _r < gr; _r++) {
                      var wr = { data: Y[_r], callback: cr || k };
                      er ? M._tasks.unshift(wr) : M._tasks.push(wr);
                    }
                    d ||
                      ((d = !0),
                      L(() => {
                        ((d = !1), M.process());
                      }));
                  }
                  function U(Y) {
                    return (er) => {
                      h -= 1;
                      for (var cr = 0, _r = Y.length; cr < _r; cr++) {
                        var gr = Y[cr],
                          wr = it(p, gr, 0);
                        (wr === 0 ? p.shift() : wr > 0 && p.splice(wr, 1),
                          gr.callback.apply(gr, arguments),
                          er != null && M.error(er, gr.data));
                      }
                      (h <= M.concurrency - M.buffer && M.unsaturated(),
                        M.idle() && M.drain(),
                        M.process());
                    };
                  }
                  var z = !1,
                    M = {
                      _tasks: new mr(),
                      concurrency: t,
                      payload: n,
                      saturated: k,
                      unsaturated: k,
                      buffer: t / 4,
                      empty: k,
                      drain: k,
                      error: k,
                      started: !1,
                      paused: !1,
                      push: (Y, er) => {
                        A(Y, !1, er);
                      },
                      kill: () => {
                        ((M.drain = k), M._tasks.empty());
                      },
                      unshift: (Y, er) => {
                        A(Y, !0, er);
                      },
                      remove: (Y) => {
                        M._tasks.remove(Y);
                      },
                      process: () => {
                        if (!z) {
                          for (z = !0; !M.paused && h < M.concurrency && M._tasks.length; ) {
                            var Y = [],
                              er = [],
                              cr = M._tasks.length;
                            M.payload && (cr = Math.min(cr, M.payload));
                            for (var _r = 0; _r < cr; _r++) {
                              var gr = M._tasks.shift();
                              (Y.push(gr), p.push(gr), er.push(gr.data));
                            }
                            ((h += 1),
                              M._tasks.length === 0 && M.empty(),
                              h === M.concurrency && M.saturated());
                            var wr = br(U(Y));
                            s(er, wr);
                          }
                          z = !1;
                        }
                      },
                      length: () => M._tasks.length,
                      running: () => h,
                      workersList: () => p,
                      idle: () => M._tasks.length + h === 0,
                      pause: () => {
                        M.paused = !0;
                      },
                      resume: () => {
                        M.paused !== !1 && ((M.paused = !1), L(M.process));
                      },
                    };
                  return M;
                }
                function ue(r, t) {
                  return se(r, 1, t);
                }
                var $r = lr(Mr, 1);
                function Er(r, t, n, s) {
                  s = V(s || k);
                  var h = b(n);
                  $r(
                    r,
                    (p, d, A) => {
                      h(t, p, (U, z) => {
                        ((t = z), A(U));
                      });
                    },
                    (p) => {
                      s(p, t);
                    },
                  );
                }
                function jt() {
                  var r = Fr(arguments, b);
                  return function () {
                    var t = i(arguments),
                      n = t[t.length - 1];
                    (typeof n == "function" ? t.pop() : (n = k),
                      Er(
                        r,
                        t,
                        (s, h, p) => {
                          h.apply(
                            this,
                            s.concat((d) => {
                              var A = i(arguments, 1);
                              p(d, A);
                            }),
                          );
                        },
                        (s, h) => {
                          n.apply(this, [s].concat(h));
                        },
                      ));
                  };
                }
                var fe = () => jt.apply(null, i(arguments).reverse()),
                  Mi = Array.prototype.concat,
                  at = (r, t, n, s) => {
                    s = s || k;
                    var h = b(n);
                    zr(
                      r,
                      t,
                      (p, d) => {
                        h(p, (A) => (A ? d(A) : d(null, i(arguments, 1))));
                      },
                      (p, d) => {
                        for (var A = [], U = 0; U < d.length; U++) d[U] && (A = Mi.apply(A, d[U]));
                        return s(p, A);
                      },
                    );
                  },
                  le = lr(at, 1 / 0),
                  he = lr(at, 1),
                  ce = () => {
                    var r = i(arguments),
                      t = [null].concat(r);
                    return function () {
                      var n = arguments[arguments.length - 1];
                      return n.apply(this, t);
                    };
                  };
                function Wr(r) {
                  return r;
                }
                function Rr(r, t) {
                  return (n, s, h, p) => {
                    p = p || k;
                    var d = !1,
                      A;
                    n(
                      s,
                      (U, z, M) => {
                        h(U, (Y, er) => {
                          Y ? M(Y) : r(er) && !A ? ((d = !0), (A = t(!0, U)), M(null, v)) : M();
                        });
                      },
                      (U) => {
                        U ? p(U) : p(null, d ? A : t(!1));
                      },
                    );
                  };
                }
                function pe(r, t) {
                  return t;
                }
                var ot = Nr(Rr(Wr, pe)),
                  Yr = Pr(Rr(Wr, pe)),
                  st = lr(Yr, 1);
                function ve(r) {
                  return (t) => {
                    var n = i(arguments, 1);
                    (n.push((s) => {
                      var h = i(arguments, 1);
                      typeof console == "object" &&
                        (s
                          ? console.error && console.error(s)
                          : console[r] &&
                            nt(h, (p) => {
                              console[r](p);
                            }));
                    }),
                      b(t).apply(null, n));
                  };
                }
                var ye = ve("dir");
                function ge(r, t, n) {
                  n = br(n || k);
                  var s = b(r),
                    h = b(t);
                  function p(A) {
                    if (A) return n(A);
                    var U = i(arguments, 1);
                    (U.push(d), h.apply(this, U));
                  }
                  function d(A, U) {
                    if (A) return n(A);
                    if (!U) return n(null);
                    s(p);
                  }
                  d(null, !0);
                }
                function xt(r, t, n) {
                  n = br(n || k);
                  var s = b(r),
                    h = function (p) {
                      if (p) return n(p);
                      var d = i(arguments, 1);
                      if (t.apply(this, d)) return s(h);
                      n.apply(null, [null].concat(d));
                    };
                  s(h);
                }
                function de(r, t, n) {
                  xt(
                    r,
                    function () {
                      return !t.apply(this, arguments);
                    },
                    n,
                  );
                }
                function me(r, t, n) {
                  n = br(n || k);
                  var s = b(t),
                    h = b(r);
                  function p(A) {
                    if (A) return n(A);
                    h(d);
                  }
                  function d(A, U) {
                    if (A) return n(A);
                    if (!U) return n(null);
                    s(p);
                  }
                  h(d);
                }
                function be(r) {
                  return (t, n, s) => r(t, s);
                }
                function ut(r, t, n) {
                  Ir(r, be(b(t)), n);
                }
                function Hr(r, t, n, s) {
                  tt(t)(r, be(b(n)), s);
                }
                var Zr = lr(Hr, 1);
                function Ut(r) {
                  return C(r)
                    ? r
                    : f(function (t, n) {
                        var s = !0;
                        (t.push(() => {
                          var h = arguments;
                          s
                            ? L(() => {
                                n.apply(null, h);
                              })
                            : n.apply(null, h);
                        }),
                          r.apply(this, t),
                          (s = !1));
                      });
                }
                function ft(r) {
                  return !r;
                }
                var lt = Nr(Rr(ft, ft)),
                  Qr = Pr(Rr(ft, ft)),
                  ht = lr(Qr, 1);
                function _e(r) {
                  return (t) => t?.[r];
                }
                function Ni(r, t, n, s) {
                  var h = new Array(t.length);
                  r(
                    t,
                    (p, d, A) => {
                      n(p, (U, z) => {
                        ((h[d] = !!z), A(U));
                      });
                    },
                    (p) => {
                      if (p) return s(p);
                      for (var d = [], A = 0; A < t.length; A++) h[A] && d.push(t[A]);
                      s(null, d);
                    },
                  );
                }
                function Pi(r, t, n, s) {
                  var h = [];
                  r(
                    t,
                    (p, d, A) => {
                      n(p, (U, z) => {
                        U ? A(U) : (z && h.push({ index: d, value: p }), A());
                      });
                    },
                    (p) => {
                      p
                        ? s(p)
                        : s(
                            null,
                            Fr(
                              h.sort((d, A) => d.index - A.index),
                              _e("value"),
                            ),
                          );
                    },
                  );
                }
                function Ot(r, t, n, s) {
                  var h = _(t) ? Ni : Pi;
                  h(r, t, b(n), s || k);
                }
                var ct = Nr(Ot),
                  Xr = Pr(Ot),
                  pt = lr(Xr, 1);
                function we(r, t) {
                  var n = br(t || k),
                    s = b(Ut(r));
                  function h(p) {
                    if (p) return n(p);
                    s(h);
                  }
                  h();
                }
                var vt = (r, t, n, s) => {
                    s = s || k;
                    var h = b(n);
                    zr(
                      r,
                      t,
                      (p, d) => {
                        h(p, (A, U) => (A ? d(A) : d(null, { key: U, val: p })));
                      },
                      (p, d) => {
                        for (
                          var A = {}, U = Object.prototype.hasOwnProperty, z = 0;
                          z < d.length;
                          z++
                        )
                          if (d[z]) {
                            var M = d[z].key,
                              Y = d[z].val;
                            U.call(A, M) ? A[M].push(Y) : (A[M] = [Y]);
                          }
                        return s(p, A);
                      },
                    );
                  },
                  Ae = lr(vt, 1 / 0),
                  Te = lr(vt, 1),
                  Se = ve("log");
                function yt(r, t, n, s) {
                  s = V(s || k);
                  var h = {},
                    p = b(n);
                  Mr(
                    r,
                    t,
                    (d, A, U) => {
                      p(d, A, (z, M) => {
                        if (z) return U(z);
                        ((h[A] = M), U());
                      });
                    },
                    (d) => {
                      s(d, h);
                    },
                  );
                }
                var Ce = lr(yt, 1 / 0),
                  ke = lr(yt, 1);
                function Ie(r, t) {
                  return t in r;
                }
                function Ee(r, t) {
                  var n = Object.create(null),
                    s = Object.create(null);
                  t = t || Wr;
                  var h = b(r),
                    p = f(function (A, U) {
                      var z = t.apply(null, A);
                      Ie(n, z)
                        ? L(() => {
                            U.apply(null, n[z]);
                          })
                        : Ie(s, z)
                          ? s[z].push(U)
                          : ((s[z] = [U]),
                            h.apply(
                              null,
                              A.concat(() => {
                                var M = i(arguments);
                                n[z] = M;
                                var Y = s[z];
                                delete s[z];
                                for (var er = 0, cr = Y.length; er < cr; er++) Y[er].apply(null, M);
                              }),
                            ));
                    });
                  return ((p.memo = n), (p.unmemoized = r), p);
                }
                var gt;
                l ? (gt = g.nextTick) : u ? (gt = setImmediate) : (gt = y);
                var Be = m(gt);
                function Mt(r, t, n) {
                  n = n || k;
                  var s = _(t) ? [] : {};
                  r(
                    t,
                    (h, p, d) => {
                      b(h)((A, U) => {
                        (arguments.length > 2 && (U = i(arguments, 1)), (s[p] = U), d(A));
                      });
                    },
                    (h) => {
                      n(h, s);
                    },
                  );
                }
                function De(r, t) {
                  Mt(Ir, r, t);
                }
                function Le(r, t, n) {
                  Mt(tt(t), r, n);
                }
                var Nt = (r, t) => {
                    var n = b(r);
                    return se(
                      (s, h) => {
                        n(s[0], h);
                      },
                      t,
                      1,
                    );
                  },
                  je = (r, t) => {
                    var n = Nt(r, t);
                    return (
                      (n.push = (s, h, p) => {
                        if ((p == null && (p = k), typeof p != "function"))
                          throw new Error("task callback must be a function");
                        if (((n.started = !0), nr(s) || (s = [s]), s.length === 0))
                          return L(() => {
                            n.drain();
                          });
                        h = h || 0;
                        for (var d = n._tasks.head; d && h >= d.priority; ) d = d.next;
                        for (var A = 0, U = s.length; A < U; A++) {
                          var z = { data: s[A], priority: h, callback: p };
                          d ? n._tasks.insertBefore(d, z) : n._tasks.push(z);
                        }
                        L(n.process);
                      }),
                      delete n.unshift,
                      n
                    );
                  };
                function xe(r, t) {
                  if (((t = V(t || k)), !nr(r)))
                    return t(new TypeError("First argument to race must be an array of functions"));
                  if (!r.length) return t();
                  for (var n = 0, s = r.length; n < s; n++) b(r[n])(t);
                }
                function dt(r, t, n, s) {
                  var h = i(r).reverse();
                  Er(h, t, n, s);
                }
                function mt(r) {
                  var t = b(r);
                  return f(function (s, h) {
                    return (
                      s.push(function (d, A) {
                        if (d) h(null, { error: d });
                        else {
                          var U;
                          (arguments.length <= 2 ? (U = A) : (U = i(arguments, 1)),
                            h(null, { value: U }));
                        }
                      }),
                      t.apply(this, s)
                    );
                  });
                }
                function Ue(r) {
                  var t;
                  return (
                    nr(r)
                      ? (t = Fr(r, mt))
                      : ((t = {}),
                        Kr(r, function (n, s) {
                          t[s] = mt.call(this, n);
                        })),
                    t
                  );
                }
                function Oe(r, t, n, s) {
                  Ot(
                    r,
                    t,
                    (h, p) => {
                      n(h, (d, A) => {
                        p(d, !A);
                      });
                    },
                    s,
                  );
                }
                var Me = Nr(Oe),
                  Pt = Pr(Oe),
                  Ne = lr(Pt, 1);
                function Pe(r) {
                  return () => r;
                }
                function bt(r, t, n) {
                  var s = 5,
                    h = 0,
                    p = { times: s, intervalFunc: Pe(h) };
                  function d(M, Y) {
                    if (typeof Y == "object")
                      ((M.times = +Y.times || s),
                        (M.intervalFunc =
                          typeof Y.interval == "function" ? Y.interval : Pe(+Y.interval || h)),
                        (M.errorFilter = Y.errorFilter));
                    else if (typeof Y == "number" || typeof Y == "string") M.times = +Y || s;
                    else throw new Error("Invalid arguments for async.retry");
                  }
                  if (
                    (arguments.length < 3 && typeof r == "function"
                      ? ((n = t || k), (t = r))
                      : (d(p, r), (n = n || k)),
                    typeof t != "function")
                  )
                    throw new Error("Invalid arguments for async.retry");
                  var A = b(t),
                    U = 1;
                  function z() {
                    A((M) => {
                      M && U++ < p.times && (typeof p.errorFilter != "function" || p.errorFilter(M))
                        ? setTimeout(z, p.intervalFunc(U))
                        : n.apply(null, arguments);
                    });
                  }
                  z();
                }
                var ze = (r, t) => {
                  t || ((t = r), (r = null));
                  var n = b(t);
                  return f((s, h) => {
                    function p(d) {
                      n.apply(null, s.concat(d));
                    }
                    r ? bt(r, p, h) : bt(p, h);
                  });
                };
                function Fe(r, t) {
                  Mt($r, r, t);
                }
                var _t = Nr(Rr(Boolean, Wr)),
                  Jr = Pr(Rr(Boolean, Wr)),
                  wt = lr(Jr, 1);
                function $e(r, t, n) {
                  var s = b(t);
                  et(
                    r,
                    (p, d) => {
                      s(p, (A, U) => {
                        if (A) return d(A);
                        d(null, { value: p, criteria: U });
                      });
                    },
                    (p, d) => {
                      if (p) return n(p);
                      n(null, Fr(d.sort(h), _e("value")));
                    },
                  );
                  function h(p, d) {
                    var A = p.criteria,
                      U = d.criteria;
                    return A < U ? -1 : A > U ? 1 : 0;
                  }
                }
                function Re(r, t, n) {
                  var s = b(r);
                  return f((h, p) => {
                    var d = !1,
                      A;
                    function U() {
                      var z = r.name || "anonymous",
                        M = new Error('Callback function "' + z + '" timed out.');
                      ((M.code = "ETIMEDOUT"), n && (M.info = n), (d = !0), p(M));
                    }
                    (h.push(() => {
                      d || (p.apply(null, arguments), clearTimeout(A));
                    }),
                      (A = setTimeout(U, t)),
                      s.apply(null, h));
                  });
                }
                var zi = Math.ceil,
                  Fi = Math.max;
                function $i(r, t, n, s) {
                  for (var h = -1, p = Fi(zi((t - r) / (n || 1)), 0), d = Array(p); p--; )
                    ((d[s ? p : ++h] = r), (r += n));
                  return d;
                }
                function At(r, t, n, s) {
                  var h = b(n);
                  zr($i(0, r, 1), t, h, s);
                }
                var Ve = lr(At, 1 / 0),
                  Ge = lr(At, 1);
                function Ke(r, t, n, s) {
                  (arguments.length <= 3 && ((s = n), (n = t), (t = nr(r) ? [] : {})),
                    (s = V(s || k)));
                  var h = b(n);
                  Ir(
                    r,
                    (p, d, A) => {
                      h(t, p, d, A);
                    },
                    (p) => {
                      s(p, t);
                    },
                  );
                }
                function We(r, t) {
                  var n = null,
                    s;
                  ((t = t || k),
                    Zr(
                      r,
                      (h, p) => {
                        b(h)((d, A) => {
                          (arguments.length > 2 ? (s = i(arguments, 1)) : (s = A), (n = d), p(!d));
                        });
                      },
                      () => {
                        t(n, s);
                      },
                    ));
                }
                function Ye(r) {
                  return () => (r.unmemoized || r).apply(null, arguments);
                }
                function zt(r, t, n) {
                  n = br(n || k);
                  var s = b(t);
                  if (!r()) return n(null);
                  var h = (p) => {
                    if (p) return n(p);
                    if (r()) return s(h);
                    var d = i(arguments, 1);
                    n.apply(null, [null].concat(d));
                  };
                  s(h);
                }
                function He(r, t, n) {
                  zt(
                    function () {
                      return !r.apply(this, arguments);
                    },
                    t,
                    n,
                  );
                }
                var Ze = (r, t) => {
                    if (((t = V(t || k)), !nr(r)))
                      return t(
                        new Error("First argument to waterfall must be an array of functions"),
                      );
                    if (!r.length) return t();
                    var n = 0;
                    function s(p) {
                      var d = b(r[n++]);
                      (p.push(br(h)), d.apply(null, p));
                    }
                    function h(p) {
                      if (p || n === r.length) return t.apply(null, arguments);
                      s(i(arguments, 1));
                    }
                    s([]);
                  },
                  Ri = {
                    apply: o,
                    applyEach: Ht,
                    applyEachSeries: Zt,
                    asyncify: Z,
                    auto: Et,
                    autoInject: ae,
                    cargo: ue,
                    compose: fe,
                    concat: le,
                    concatLimit: at,
                    concatSeries: he,
                    constant: ce,
                    detect: ot,
                    detectLimit: Yr,
                    detectSeries: st,
                    dir: ye,
                    doDuring: ge,
                    doUntil: de,
                    doWhilst: xt,
                    during: me,
                    each: ut,
                    eachLimit: Hr,
                    eachOf: Ir,
                    eachOfLimit: Mr,
                    eachOfSeries: $r,
                    eachSeries: Zr,
                    ensureAsync: Ut,
                    every: lt,
                    everyLimit: Qr,
                    everySeries: ht,
                    filter: ct,
                    filterLimit: Xr,
                    filterSeries: pt,
                    forever: we,
                    groupBy: Ae,
                    groupByLimit: vt,
                    groupBySeries: Te,
                    log: Se,
                    map: et,
                    mapLimit: zr,
                    mapSeries: It,
                    mapValues: Ce,
                    mapValuesLimit: yt,
                    mapValuesSeries: ke,
                    memoize: Ee,
                    nextTick: Be,
                    parallel: De,
                    parallelLimit: Le,
                    priorityQueue: je,
                    queue: Nt,
                    race: xe,
                    reduce: Er,
                    reduceRight: dt,
                    reflect: mt,
                    reflectAll: Ue,
                    reject: Me,
                    rejectLimit: Pt,
                    rejectSeries: Ne,
                    retry: bt,
                    retryable: ze,
                    seq: jt,
                    series: Fe,
                    setImmediate: L,
                    some: _t,
                    someLimit: Jr,
                    someSeries: wt,
                    sortBy: $e,
                    timeout: Re,
                    times: Ve,
                    timesLimit: At,
                    timesSeries: Ge,
                    transform: Ke,
                    tryEach: We,
                    unmemoize: Ye,
                    until: He,
                    waterfall: Ze,
                    whilst: zt,
                    all: lt,
                    allLimit: Qr,
                    allSeries: ht,
                    any: _t,
                    anyLimit: Jr,
                    anySeries: wt,
                    find: ot,
                    findLimit: Yr,
                    findSeries: st,
                    forEach: ut,
                    forEachSeries: Zr,
                    forEachLimit: Hr,
                    forEachOf: Ir,
                    forEachOfSeries: $r,
                    forEachOfLimit: Mr,
                    inject: Er,
                    foldl: Er,
                    foldr: dt,
                    select: ct,
                    selectLimit: Xr,
                    selectSeries: pt,
                    wrapSync: Z,
                  };
                ((e.default = Ri),
                  (e.apply = o),
                  (e.applyEach = Ht),
                  (e.applyEachSeries = Zt),
                  (e.asyncify = Z),
                  (e.auto = Et),
                  (e.autoInject = ae),
                  (e.cargo = ue),
                  (e.compose = fe),
                  (e.concat = le),
                  (e.concatLimit = at),
                  (e.concatSeries = he),
                  (e.constant = ce),
                  (e.detect = ot),
                  (e.detectLimit = Yr),
                  (e.detectSeries = st),
                  (e.dir = ye),
                  (e.doDuring = ge),
                  (e.doUntil = de),
                  (e.doWhilst = xt),
                  (e.during = me),
                  (e.each = ut),
                  (e.eachLimit = Hr),
                  (e.eachOf = Ir),
                  (e.eachOfLimit = Mr),
                  (e.eachOfSeries = $r),
                  (e.eachSeries = Zr),
                  (e.ensureAsync = Ut),
                  (e.every = lt),
                  (e.everyLimit = Qr),
                  (e.everySeries = ht),
                  (e.filter = ct),
                  (e.filterLimit = Xr),
                  (e.filterSeries = pt),
                  (e.forever = we),
                  (e.groupBy = Ae),
                  (e.groupByLimit = vt),
                  (e.groupBySeries = Te),
                  (e.log = Se),
                  (e.map = et),
                  (e.mapLimit = zr),
                  (e.mapSeries = It),
                  (e.mapValues = Ce),
                  (e.mapValuesLimit = yt),
                  (e.mapValuesSeries = ke),
                  (e.memoize = Ee),
                  (e.nextTick = Be),
                  (e.parallel = De),
                  (e.parallelLimit = Le),
                  (e.priorityQueue = je),
                  (e.queue = Nt),
                  (e.race = xe),
                  (e.reduce = Er),
                  (e.reduceRight = dt),
                  (e.reflect = mt),
                  (e.reflectAll = Ue),
                  (e.reject = Me),
                  (e.rejectLimit = Pt),
                  (e.rejectSeries = Ne),
                  (e.retry = bt),
                  (e.retryable = ze),
                  (e.seq = jt),
                  (e.series = Fe),
                  (e.setImmediate = L),
                  (e.some = _t),
                  (e.someLimit = Jr),
                  (e.someSeries = wt),
                  (e.sortBy = $e),
                  (e.timeout = Re),
                  (e.times = Ve),
                  (e.timesLimit = At),
                  (e.timesSeries = Ge),
                  (e.transform = Ke),
                  (e.tryEach = We),
                  (e.unmemoize = Ye),
                  (e.until = He),
                  (e.waterfall = Ze),
                  (e.whilst = zt),
                  (e.all = lt),
                  (e.allLimit = Qr),
                  (e.allSeries = ht),
                  (e.any = _t),
                  (e.anyLimit = Jr),
                  (e.anySeries = wt),
                  (e.find = ot),
                  (e.findLimit = Yr),
                  (e.findSeries = st),
                  (e.forEach = ut),
                  (e.forEachSeries = Zr),
                  (e.forEachLimit = Hr),
                  (e.forEachOf = Ir),
                  (e.forEachOfSeries = $r),
                  (e.forEachOfLimit = Mr),
                  (e.inject = Er),
                  (e.foldl = Er),
                  (e.foldr = dt),
                  (e.select = ct),
                  (e.selectLimit = Xr),
                  (e.selectSeries = pt),
                  (e.wrapSync = Z),
                  Object.defineProperty(e, "__esModule", { value: !0 }));
              });
            }).call(
              this,
              N("_process"),
              typeof global < "u"
                ? global
                : typeof self < "u"
                  ? self
                  : typeof window < "u"
                    ? window
                    : {},
            );
          },
          { _process: 4 },
        ],
        2: [
          (N, P, G) => {
            (() => {
              var g = "\0",
                c = 0,
                e = 0,
                i = -1,
                o = !0,
                f = !0,
                a = 4,
                u = 4,
                l = 2,
                y = (C) => {
                  C == null && (C = 1024);
                  var b = (j, F, K) => {
                      for (var J = F; J < K; J++) j[J] = -J + 1;
                      if (0 < E.array[E.array.length - 1]) {
                        for (var pr = E.array.length - 2; 0 < E.array[pr]; ) pr--;
                        j[F] = -pr;
                      }
                    },
                    O = (j, F, K) => {
                      for (var J = F; J < K; J++) j[J] = -J - 1;
                    },
                    x = (j) => {
                      var F = j * l,
                        K = L(D.signed, D.bytes, F);
                      (b(K, D.array.length, F), K.set(D.array), (D.array = null), (D.array = K));
                      var J = L(E.signed, E.bytes, F);
                      (O(J, E.array.length, F), J.set(E.array), (E.array = null), (E.array = J));
                    },
                    B = e + 1,
                    D = { signed: o, bytes: a, array: L(o, a, C) },
                    E = { signed: f, bytes: u, array: L(f, u, C) };
                  return (
                    (D.array[e] = 1),
                    (E.array[e] = e),
                    b(D.array, e + 1, D.array.length),
                    O(E.array, e + 1, E.array.length),
                    {
                      getBaseBuffer: () => D.array,
                      getCheckBuffer: () => E.array,
                      loadBaseBuffer: function (j) {
                        return ((D.array = j), this);
                      },
                      loadCheckBuffer: function (j) {
                        return ((E.array = j), this);
                      },
                      size: () => Math.max(D.array.length, E.array.length),
                      getBase: (j) => (D.array.length - 1 < j ? -j + 1 : D.array[j]),
                      getCheck: (j) => (E.array.length - 1 < j ? -j - 1 : E.array[j]),
                      setBase: (j, F) => {
                        (D.array.length - 1 < j && x(j), (D.array[j] = F));
                      },
                      setCheck: (j, F) => {
                        (E.array.length - 1 < j && x(j), (E.array[j] = F));
                      },
                      setFirstUnusedNode: (j) => {
                        B = j;
                      },
                      getFirstUnusedNode: () => B,
                      shrink: function () {
                        for (var j = this.size() - 1; !(0 <= E.array[j]); ) j--;
                        ((D.array = D.array.subarray(0, j + 2)),
                          (E.array = E.array.subarray(0, j + 2)));
                      },
                      calc: () => {
                        for (var j = 0, F = E.array.length, K = 0; K < F; K++)
                          E.array[K] < 0 && j++;
                        return { all: F, unused: j, efficiency: (F - j) / F };
                      },
                      dump: function () {
                        var j = "",
                          F = "",
                          K;
                        for (K = 0; K < D.array.length; K++) j = j + " " + this.getBase(K);
                        for (K = 0; K < E.array.length; K++) F = F + " " + this.getCheck(K);
                        return (
                          console.log("base:" + j),
                          console.log("chck:" + F),
                          "base:" + j + " chck:" + F
                        );
                      },
                    }
                  );
                };
              function m(C) {
                ((this.bc = y(C)), (this.keys = []));
              }
              ((m.prototype.append = function (C, b) {
                return (this.keys.push({ k: C, v: b }), this);
              }),
                (m.prototype.build = function (C, b) {
                  if ((C == null && (C = this.keys), C == null)) return new T(this.bc);
                  b == null && (b = !1);
                  var O = C.map((x) => ({ k: R(x.k + g), v: x.v }));
                  return (
                    b
                      ? (this.keys = O)
                      : (this.keys = O.sort((x, B) => {
                          for (
                            var D = x.k, E = B.k, j = Math.min(D.length, E.length), F = 0;
                            F < j;
                            F++
                          )
                            if (D[F] !== E[F]) return D[F] - E[F];
                          return D.length - E.length;
                        })),
                    (O = null),
                    this._build(e, 0, 0, this.keys.length),
                    new T(this.bc)
                  );
                }),
                (m.prototype._build = function (C, b, O, x) {
                  var B = this.getChildrenInfo(b, O, x),
                    D = this.findAllocatableBase(B);
                  this.setBC(C, B, D);
                  for (var E = 0; E < B.length; E = E + 3) {
                    var j = B[E];
                    if (j !== c) {
                      var F = B[E + 1],
                        K = B[E + 2],
                        J = D + j;
                      this._build(J, b + 1, F, K);
                    }
                  }
                }),
                (m.prototype.getChildrenInfo = function (C, b, O) {
                  var x = this.keys[b].k[C],
                    B = 0,
                    D = new Int32Array(O * 3);
                  ((D[B++] = x), (D[B++] = b));
                  for (var E = b, j = b; E < b + O; E++) {
                    var F = this.keys[E].k[C];
                    x !== F && ((D[B++] = E - j), (D[B++] = F), (D[B++] = E), (x = F), (j = E));
                  }
                  return ((D[B++] = E - j), (D = D.subarray(0, B)), D);
                }),
                (m.prototype.setBC = function (C, b, O) {
                  var x = this.bc;
                  x.setBase(C, O);
                  var B;
                  for (B = 0; B < b.length; B = B + 3) {
                    var D = b[B],
                      E = O + D,
                      j = -x.getBase(E),
                      F = -x.getCheck(E);
                    (E !== x.getFirstUnusedNode() ? x.setCheck(j, -F) : x.setFirstUnusedNode(F),
                      x.setBase(F, -j));
                    var K = C;
                    if ((x.setCheck(E, K), D === c)) {
                      var J = b[B + 1],
                        pr = this.keys[J].v;
                      pr == null && (pr = 0);
                      var Br = -pr - 1;
                      x.setBase(E, Br);
                    }
                  }
                }),
                (m.prototype.findAllocatableBase = function (C) {
                  for (var b = this.bc, O, x = b.getFirstUnusedNode(); ; ) {
                    if (((O = x - C[0]), O < 0)) {
                      x = -b.getCheck(x);
                      continue;
                    }
                    for (var B = !0, D = 0; D < C.length; D = D + 3) {
                      var E = C[D],
                        j = O + E;
                      if (!this.isUnusedNode(j)) {
                        ((x = -b.getCheck(x)), (B = !1));
                        break;
                      }
                    }
                    if (B) return O;
                  }
                }),
                (m.prototype.isUnusedNode = function (C) {
                  var b = this.bc,
                    O = b.getCheck(C);
                  return C === e ? !1 : O < 0;
                }));
              function T(C) {
                ((this.bc = C), this.bc.shrink());
              }
              ((T.prototype.contain = function (C) {
                var b = this.bc;
                C += g;
                for (var O = R(C), x = e, B = i, D = 0; D < O.length; D++) {
                  var E = O[D];
                  if (((B = this.traverse(x, E)), B === i)) return !1;
                  if (b.getBase(B) <= 0) return !0;
                  x = B;
                }
                return !1;
              }),
                (T.prototype.lookup = function (C) {
                  C += g;
                  for (var b = R(C), O = e, x = i, B = 0; B < b.length; B++) {
                    var D = b[B];
                    if (((x = this.traverse(O, D)), x === i)) return i;
                    O = x;
                  }
                  var E = this.bc.getBase(x);
                  return E <= 0 ? -E - 1 : i;
                }),
                (T.prototype.commonPrefixSearch = function (C) {
                  for (var b = R(C), O = e, x = i, B = [], D = 0; D < b.length; D++) {
                    var E = b[D];
                    if (((x = this.traverse(O, E)), x !== i)) {
                      O = x;
                      var j = this.traverse(x, c);
                      if (j !== i) {
                        var F = this.bc.getBase(j),
                          K = {};
                        (F <= 0 && (K.v = -F - 1), (K.k = H(Z(b, 0, D + 1))), B.push(K));
                      }
                    } else break;
                  }
                  return B;
                }),
                (T.prototype.traverse = function (C, b) {
                  var O = this.bc.getBase(C) + b;
                  return this.bc.getCheck(O) === C ? O : i;
                }),
                (T.prototype.size = function () {
                  return this.bc.size();
                }),
                (T.prototype.calc = function () {
                  return this.bc.calc();
                }),
                (T.prototype.dump = function () {
                  return this.bc.dump();
                }));
              var L = (C, b, O) => {
                  if (C)
                    switch (b) {
                      case 1:
                        return new Int8Array(O);
                      case 2:
                        return new Int16Array(O);
                      case 4:
                        return new Int32Array(O);
                      default:
                        throw new RangeError("Invalid newArray parameter element_bytes:" + b);
                    }
                  else
                    switch (b) {
                      case 1:
                        return new Uint8Array(O);
                      case 2:
                        return new Uint16Array(O);
                      case 4:
                        return new Uint32Array(O);
                      default:
                        throw new RangeError("Invalid newArray parameter element_bytes:" + b);
                    }
                },
                Z = (C, b, O) => {
                  var x = new ArrayBuffer(O),
                    B = new Uint8Array(x, 0, O),
                    D = C.subarray(b, O);
                  return (B.set(D), B);
                },
                R = (C) => {
                  for (
                    var b = new Uint8Array(new ArrayBuffer(C.length * 4)), O = 0, x = 0;
                    O < C.length;
                  ) {
                    var B,
                      D = C.charCodeAt(O++);
                    if (D >= 55296 && D <= 56319) {
                      var E = D,
                        j = C.charCodeAt(O++);
                      if (j >= 56320 && j <= 57343) B = (E - 55296) * 1024 + 65536 + (j - 56320);
                      else return null;
                    } else B = D;
                    B < 128
                      ? (b[x++] = B)
                      : B < 2048
                        ? ((b[x++] = (B >>> 6) | 192), (b[x++] = (B & 63) | 128))
                        : B < 65536
                          ? ((b[x++] = (B >>> 12) | 224),
                            (b[x++] = ((B >> 6) & 63) | 128),
                            (b[x++] = (B & 63) | 128))
                          : B < 1 << 21 &&
                            ((b[x++] = (B >>> 18) | 240),
                            (b[x++] = ((B >> 12) & 63) | 128),
                            (b[x++] = ((B >> 6) & 63) | 128),
                            (b[x++] = (B & 63) | 128));
                  }
                  return b.subarray(0, x);
                },
                H = (C) => {
                  for (var b = "", O, x, B, D, E, j, F, K = 0; K < C.length; )
                    ((x = C[K++]),
                      x < 128
                        ? (O = x)
                        : x >> 5 === 6
                          ? ((B = C[K++]), (O = ((x & 31) << 6) | (B & 63)))
                          : x >> 4 === 14
                            ? ((B = C[K++]),
                              (D = C[K++]),
                              (O = ((x & 15) << 12) | ((B & 63) << 6) | (D & 63)))
                            : ((B = C[K++]),
                              (D = C[K++]),
                              (E = C[K++]),
                              (O =
                                ((x & 7) << 18) | ((B & 63) << 12) | ((D & 63) << 6) | (E & 63))),
                      O < 65536
                        ? (b += String.fromCharCode(O))
                        : ((O -= 65536),
                          (j = 55296 | (O >> 10)),
                          (F = 56320 | (O & 1023)),
                          (b += String.fromCharCode(j, F))));
                  return b;
                },
                X = {
                  builder: (C) => new m(C),
                  load: (C, b) => {
                    var O = y(0);
                    return (O.loadBaseBuffer(C), O.loadCheckBuffer(b), new T(O));
                  },
                };
              typeof P > "u" ? (window.doublearray = X) : (P.exports = X);
            })();
          },
          {},
        ],
        3: [
          function (N, P, G) {
            ((g) => {
              function c(a, u) {
                for (var l = 0, y = a.length - 1; y >= 0; y--) {
                  var m = a[y];
                  m === "."
                    ? a.splice(y, 1)
                    : m === ".."
                      ? (a.splice(y, 1), l++)
                      : l && (a.splice(y, 1), l--);
                }
                if (u) for (; l--; l) a.unshift("..");
                return a;
              }
              var e = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^/]+?|)(\.[^./]*|))(?:[/]*)$/,
                i = (a) => e.exec(a).slice(1);
              ((G.resolve = () => {
                for (var a = "", u = !1, l = arguments.length - 1; l >= -1 && !u; l--) {
                  var y = l >= 0 ? arguments[l] : g.cwd();
                  if (typeof y != "string")
                    throw new TypeError("Arguments to path.resolve must be strings");
                  if (!y) continue;
                  ((a = y + "/" + a), (u = y.charAt(0) === "/"));
                }
                return (
                  (a = c(
                    o(a.split("/"), (m) => !!m),
                    !u,
                  ).join("/")),
                  (u ? "/" : "") + a || "."
                );
              }),
                (G.normalize = (a) => {
                  var u = G.isAbsolute(a),
                    l = f(a, -1) === "/";
                  return (
                    (a = c(
                      o(a.split("/"), (y) => !!y),
                      !u,
                    ).join("/")),
                    !a && !u && (a = "."),
                    a && l && (a += "/"),
                    (u ? "/" : "") + a
                  );
                }),
                (G.isAbsolute = (a) => a.charAt(0) === "/"),
                (G.join = () => {
                  var a = Array.prototype.slice.call(arguments, 0);
                  return G.normalize(
                    o(a, (u, l) => {
                      if (typeof u != "string")
                        throw new TypeError("Arguments to path.join must be strings");
                      return u;
                    }).join("/"),
                  );
                }),
                (G.relative = (a, u) => {
                  ((a = G.resolve(a).substr(1)), (u = G.resolve(u).substr(1)));
                  function l(H) {
                    for (var X = 0; X < H.length && H[X] === ""; X++);
                    for (var C = H.length - 1; C >= 0 && H[C] === ""; C--);
                    return X > C ? [] : H.slice(X, C - X + 1);
                  }
                  for (
                    var y = l(a.split("/")),
                      m = l(u.split("/")),
                      T = Math.min(y.length, m.length),
                      L = T,
                      Z = 0;
                    Z < T;
                    Z++
                  )
                    if (y[Z] !== m[Z]) {
                      L = Z;
                      break;
                    }
                  for (var R = [], Z = L; Z < y.length; Z++) R.push("..");
                  return ((R = R.concat(m.slice(L))), R.join("/"));
                }),
                (G.sep = "/"),
                (G.delimiter = ":"),
                (G.dirname = (a) => {
                  var u = i(a),
                    l = u[0],
                    y = u[1];
                  return !l && !y ? "." : (y && (y = y.substr(0, y.length - 1)), l + y);
                }),
                (G.basename = (a, u) => {
                  var l = i(a)[2];
                  return (
                    u && l.substr(-1 * u.length) === u && (l = l.substr(0, l.length - u.length)), l
                  );
                }),
                (G.extname = (a) => i(a)[3]));
              function o(a, u) {
                if (a.filter) return a.filter(u);
                for (var l = [], y = 0; y < a.length; y++) u(a[y], y, a) && l.push(a[y]);
                return l;
              }
              var f =
                "ab".substr(-1) === "b"
                  ? (a, u, l) => a.substr(u, l)
                  : (a, u, l) => (u < 0 && (u = a.length + u), a.substr(u, l));
            }).call(this, N("_process"));
          },
          { _process: 4 },
        ],
        4: [
          (N, P, G) => {
            var g = (P.exports = {}),
              c,
              e;
            function i() {
              throw new Error("setTimeout has not been defined");
            }
            function o() {
              throw new Error("clearTimeout has not been defined");
            }
            (() => {
              try {
                typeof setTimeout == "function" ? (c = setTimeout) : (c = i);
              } catch {
                c = i;
              }
              try {
                typeof clearTimeout == "function" ? (e = clearTimeout) : (e = o);
              } catch {
                e = o;
              }
            })();
            function f(H) {
              if (c === setTimeout) return setTimeout(H, 0);
              if ((c === i || !c) && setTimeout) return ((c = setTimeout), setTimeout(H, 0));
              try {
                return c(H, 0);
              } catch {
                try {
                  return c.call(null, H, 0);
                } catch {
                  return c.call(this, H, 0);
                }
              }
            }
            function a(H) {
              if (e === clearTimeout) return clearTimeout(H);
              if ((e === o || !e) && clearTimeout) return ((e = clearTimeout), clearTimeout(H));
              try {
                return e(H);
              } catch {
                try {
                  return e.call(null, H);
                } catch {
                  return e.call(this, H);
                }
              }
            }
            var u = [],
              l = !1,
              y,
              m = -1;
            function T() {
              !l || !y || ((l = !1), y.length ? (u = y.concat(u)) : (m = -1), u.length && L());
            }
            function L() {
              if (!l) {
                var H = f(T);
                l = !0;
                for (var X = u.length; X; ) {
                  for (y = u, u = []; ++m < X; ) y && y[m].run();
                  ((m = -1), (X = u.length));
                }
                ((y = null), (l = !1), a(H));
              }
            }
            g.nextTick = (H) => {
              var X = new Array(arguments.length - 1);
              if (arguments.length > 1)
                for (var C = 1; C < arguments.length; C++) X[C - 1] = arguments[C];
              (u.push(new Z(H, X)), u.length === 1 && !l && f(L));
            };
            function Z(H, X) {
              ((this.fun = H), (this.array = X));
            }
            ((Z.prototype.run = function () {
              this.fun.apply(null, this.array);
            }),
              (g.title = "browser"),
              (g.browser = !0),
              (g.env = {}),
              (g.argv = []),
              (g.version = ""),
              (g.versions = {}));
            function R() {}
            ((g.on = R),
              (g.addListener = R),
              (g.once = R),
              (g.off = R),
              (g.removeListener = R),
              (g.removeAllListeners = R),
              (g.emit = R),
              (g.prependListener = R),
              (g.prependOnceListener = R),
              (g.listeners = (H) => []),
              (g.binding = (H) => {
                throw new Error("process.binding is not supported");
              }),
              (g.cwd = () => "/"),
              (g.chdir = (H) => {
                throw new Error("process.chdir is not supported");
              }),
              (g.umask = () => 0));
          },
          {},
        ],
        5: [
          function (N, P, G) {
            /** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */ (function () {
              function g(I) {
                throw I;
              }
              var c = void 0,
                e = this;
              function i(I, w) {
                var S = I.split("."),
                  _ = e;
                !(S[0] in _) && _.execScript && _.execScript("var " + S[0]);
                for (var v; S.length && (v = S.shift()); )
                  !S.length && w !== c ? (_[v] = w) : (_ = _[v] ? _[v] : (_[v] = {}));
              }
              var o =
                typeof Uint8Array < "u" &&
                typeof Uint16Array < "u" &&
                typeof Uint32Array < "u" &&
                typeof DataView < "u";
              new (o ? Uint8Array : Array)(256);
              var f;
              for (f = 0; 256 > f; ++f) for (var u = f, a = 7, u = u >>> 1; u; u >>>= 1) --a;
              function l(I, w, S) {
                var _,
                  v = typeof w == "number" ? w : (w = 0),
                  k = typeof S == "number" ? S : I.length;
                for (_ = -1, v = k & 7; v--; ++w) _ = (_ >>> 8) ^ m[(_ ^ I[w]) & 255];
                for (v = k >> 3; v--; w += 8)
                  ((_ = (_ >>> 8) ^ m[(_ ^ I[w]) & 255]),
                    (_ = (_ >>> 8) ^ m[(_ ^ I[w + 1]) & 255]),
                    (_ = (_ >>> 8) ^ m[(_ ^ I[w + 2]) & 255]),
                    (_ = (_ >>> 8) ^ m[(_ ^ I[w + 3]) & 255]),
                    (_ = (_ >>> 8) ^ m[(_ ^ I[w + 4]) & 255]),
                    (_ = (_ >>> 8) ^ m[(_ ^ I[w + 5]) & 255]),
                    (_ = (_ >>> 8) ^ m[(_ ^ I[w + 6]) & 255]),
                    (_ = (_ >>> 8) ^ m[(_ ^ I[w + 7]) & 255]));
                return (_ ^ 4294967295) >>> 0;
              }
              var y = [
                  0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685,
                  2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021,
                  3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861,
                  1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636,
                  335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332,
                  2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684,
                  3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980,
                  1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303,
                  671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275,
                  3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215,
                  2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763,
                  141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878,
                  1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202,
                  4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486,
                  2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995,
                  1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631,
                  3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635,
                  3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807,
                  783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842,
                  3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430,
                  2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386,
                  503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526,
                  2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637,
                  3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381,
                  1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669,
                  829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109,
                  3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956,
                  3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972,
                  40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692,
                  2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012,
                  4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567,
                  2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795,
                  376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263,
                  1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899,
                  3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150,
                  3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746,
                  711928724, 3020668471, 3272380065, 1510334235, 755167117,
                ],
                m = o ? new Uint32Array(y) : y;
              function T() {}
              ((T.prototype.getName = function () {
                return this.name;
              }),
                (T.prototype.getData = function () {
                  return this.data;
                }),
                (T.prototype.G = function () {
                  return this.H;
                }));
              function L(I) {
                var w = I.length,
                  S = 0,
                  _ = Number.POSITIVE_INFINITY,
                  v,
                  k,
                  V,
                  Q,
                  q,
                  or,
                  rr,
                  $,
                  W,
                  hr;
                for ($ = 0; $ < w; ++$) (I[$] > S && (S = I[$]), I[$] < _ && (_ = I[$]));
                for (
                  v = 1 << S, k = new (o ? Uint32Array : Array)(v), V = 1, Q = 0, q = 2;
                  V <= S;
                ) {
                  for ($ = 0; $ < w; ++$)
                    if (I[$] === V) {
                      for (or = 0, rr = Q, W = 0; W < V; ++W)
                        ((or = (or << 1) | (rr & 1)), (rr >>= 1));
                      for (hr = (V << 16) | $, W = or; W < v; W += q) k[W] = hr;
                      ++Q;
                    }
                  (++V, (Q <<= 1), (q <<= 1));
                }
                return [k, S, _];
              }
              var Z = [],
                R;
              for (R = 0; 288 > R; R++)
                switch (!0) {
                  case 143 >= R:
                    Z.push([R + 48, 8]);
                    break;
                  case 255 >= R:
                    Z.push([R - 144 + 400, 9]);
                    break;
                  case 279 >= R:
                    Z.push([R - 256 + 0, 7]);
                    break;
                  case 287 >= R:
                    Z.push([R - 280 + 192, 8]);
                    break;
                  default:
                    g("invalid literal: " + R);
                }
              var H = (() => {
                function I(v) {
                  switch (!0) {
                    case v === 3:
                      return [257, v - 3, 0];
                    case v === 4:
                      return [258, v - 4, 0];
                    case v === 5:
                      return [259, v - 5, 0];
                    case v === 6:
                      return [260, v - 6, 0];
                    case v === 7:
                      return [261, v - 7, 0];
                    case v === 8:
                      return [262, v - 8, 0];
                    case v === 9:
                      return [263, v - 9, 0];
                    case v === 10:
                      return [264, v - 10, 0];
                    case 12 >= v:
                      return [265, v - 11, 1];
                    case 14 >= v:
                      return [266, v - 13, 1];
                    case 16 >= v:
                      return [267, v - 15, 1];
                    case 18 >= v:
                      return [268, v - 17, 1];
                    case 22 >= v:
                      return [269, v - 19, 2];
                    case 26 >= v:
                      return [270, v - 23, 2];
                    case 30 >= v:
                      return [271, v - 27, 2];
                    case 34 >= v:
                      return [272, v - 31, 2];
                    case 42 >= v:
                      return [273, v - 35, 3];
                    case 50 >= v:
                      return [274, v - 43, 3];
                    case 58 >= v:
                      return [275, v - 51, 3];
                    case 66 >= v:
                      return [276, v - 59, 3];
                    case 82 >= v:
                      return [277, v - 67, 4];
                    case 98 >= v:
                      return [278, v - 83, 4];
                    case 114 >= v:
                      return [279, v - 99, 4];
                    case 130 >= v:
                      return [280, v - 115, 4];
                    case 162 >= v:
                      return [281, v - 131, 5];
                    case 194 >= v:
                      return [282, v - 163, 5];
                    case 226 >= v:
                      return [283, v - 195, 5];
                    case 257 >= v:
                      return [284, v - 227, 5];
                    case v === 258:
                      return [285, v - 258, 0];
                    default:
                      g("invalid length: " + v);
                  }
                }
                var w = [],
                  S,
                  _;
                for (S = 3; 258 >= S; S++)
                  ((_ = I(S)), (w[S] = (_[2] << 24) | (_[1] << 16) | _[0]));
                return w;
              })();
              o && new Uint32Array(H);
              function X(I, w) {
                switch (
                  ((this.i = []),
                  (this.j = 32768),
                  (this.d = this.f = this.c = this.n = 0),
                  (this.input = o ? new Uint8Array(I) : I),
                  (this.o = !1),
                  (this.k = b),
                  (this.w = !1),
                  (w || !(w = {})) &&
                    (w.index && (this.c = w.index),
                    w.bufferSize && (this.j = w.bufferSize),
                    w.bufferType && (this.k = w.bufferType),
                    w.resize && (this.w = w.resize)),
                  this.k)
                ) {
                  case C:
                    ((this.a = 32768),
                      (this.b = new (o ? Uint8Array : Array)(32768 + this.j + 258)));
                    break;
                  case b:
                    ((this.a = 0),
                      (this.b = new (o ? Uint8Array : Array)(this.j)),
                      (this.e = this.D),
                      (this.q = this.A),
                      (this.l = this.C));
                    break;
                  default:
                    g(Error("invalid inflate mode"));
                }
              }
              var C = 0,
                b = 1;
              X.prototype.g = function () {
                for (; !this.o; ) {
                  var I = vr(this, 3);
                  switch ((I & 1 && (this.o = !0), (I >>>= 1), I)) {
                    case 0: {
                      var w = this.input,
                        S = this.c,
                        _ = this.b,
                        v = this.a,
                        k = w.length,
                        V = c,
                        Q = c,
                        q = _.length,
                        or = c;
                      switch (
                        ((this.d = this.f = 0),
                        S + 1 >= k && g(Error("invalid uncompressed block header: LEN")),
                        (V = w[S++] | (w[S++] << 8)),
                        S + 1 >= k && g(Error("invalid uncompressed block header: NLEN")),
                        (Q = w[S++] | (w[S++] << 8)),
                        V === ~Q && g(Error("invalid uncompressed block header: length verify")),
                        S + V > w.length && g(Error("input buffer is broken")),
                        this.k)
                      ) {
                        case C:
                          for (; v + V > _.length; ) {
                            if (((or = q - v), (V -= or), o))
                              (_.set(w.subarray(S, S + or), v), (v += or), (S += or));
                            else for (; or--; ) _[v++] = w[S++];
                            ((this.a = v), (_ = this.e()), (v = this.a));
                          }
                          break;
                        case b:
                          for (; v + V > _.length; ) _ = this.e({ t: 2 });
                          break;
                        default:
                          g(Error("invalid inflate mode"));
                      }
                      if (o) (_.set(w.subarray(S, S + V), v), (v += V), (S += V));
                      else for (; V--; ) _[v++] = w[S++];
                      ((this.c = S), (this.a = v), (this.b = _));
                      break;
                    }
                    case 1:
                      this.l(Tt, St);
                      break;
                    case 2:
                      for (
                        var rr = vr(this, 5) + 257,
                          $ = vr(this, 5) + 1,
                          W = vr(this, 4) + 4,
                          hr = new (o ? Uint8Array : Array)(x.length),
                          sr = c,
                          Sr = c,
                          Ur = c,
                          nr = c,
                          yr = c,
                          Or = c,
                          Cr = c,
                          fr = c,
                          rt = c,
                          fr = 0;
                        fr < W;
                        ++fr
                      )
                        hr[x[fr]] = vr(this, 3);
                      if (!o) for (fr = W, W = hr.length; fr < W; ++fr) hr[x[fr]] = 0;
                      for (
                        sr = L(hr), nr = new (o ? Uint8Array : Array)(rr + $), fr = 0, rt = rr + $;
                        fr < rt;
                      )
                        switch (((yr = jr(this, sr)), yr)) {
                          case 16:
                            for (Cr = 3 + vr(this, 2); Cr--; ) nr[fr++] = Or;
                            break;
                          case 17:
                            for (Cr = 3 + vr(this, 3); Cr--; ) nr[fr++] = 0;
                            Or = 0;
                            break;
                          case 18:
                            for (Cr = 11 + vr(this, 7); Cr--; ) nr[fr++] = 0;
                            Or = 0;
                            break;
                          default:
                            Or = nr[fr++] = yr;
                        }
                      ((Sr = L(o ? nr.subarray(0, rr) : nr.slice(0, rr))),
                        (Ur = L(o ? nr.subarray(rr) : nr.slice(rr))),
                        this.l(Sr, Ur));
                      break;
                    default:
                      g(Error("unknown BTYPE: " + I));
                  }
                }
                return this.q();
              };
              var O = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
                x = o ? new Uint16Array(O) : O,
                B = [
                  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83,
                  99, 115, 131, 163, 195, 227, 258, 258, 258,
                ],
                D = o ? new Uint16Array(B) : B,
                E = [
                  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5,
                  5, 0, 0, 0,
                ],
                j = o ? new Uint8Array(E) : E,
                F = [
                  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769,
                  1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
                ],
                K = o ? new Uint16Array(F) : F,
                J = [
                  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
                  12, 12, 13, 13,
                ],
                pr = o ? new Uint8Array(J) : J,
                Br = new (o ? Uint8Array : Array)(288),
                Tr,
                qr;
              for (Tr = 0, qr = Br.length; Tr < qr; ++Tr)
                Br[Tr] = 143 >= Tr ? 8 : 255 >= Tr ? 9 : 279 >= Tr ? 7 : 8;
              var Tt = L(Br),
                Gr = new (o ? Uint8Array : Array)(30),
                Dr,
                Lr;
              for (Dr = 0, Lr = Gr.length; Dr < Lr; ++Dr) Gr[Dr] = 5;
              var St = L(Gr);
              function vr(I, w) {
                for (var S = I.f, _ = I.d, v = I.input, k = I.c, V = v.length, Q; _ < w; )
                  (k >= V && g(Error("input buffer is broken")), (S |= v[k++] << _), (_ += 8));
                return ((Q = S & ((1 << w) - 1)), (I.f = S >>> w), (I.d = _ - w), (I.c = k), Q);
              }
              function jr(I, w) {
                for (
                  var S = I.f,
                    _ = I.d,
                    v = I.input,
                    k = I.c,
                    V = v.length,
                    Q = w[0],
                    q = w[1],
                    or,
                    rr;
                  _ < q && !(k >= V);
                )
                  ((S |= v[k++] << _), (_ += 8));
                return (
                  (or = Q[S & ((1 << q) - 1)]),
                  (rr = or >>> 16),
                  rr > _ && g(Error("invalid code length: " + rr)),
                  (I.f = S >> rr),
                  (I.d = _ - rr),
                  (I.c = k),
                  or & 65535
                );
              }
              ((X.prototype.l = function (I, w) {
                var S = this.b,
                  _ = this.a;
                this.r = I;
                for (var v = S.length - 258, k, V, Q, q; (k = jr(this, I)) !== 256; )
                  if (256 > k)
                    (_ >= v && ((this.a = _), (S = this.e()), (_ = this.a)), (S[_++] = k));
                  else
                    for (
                      V = k - 257,
                        q = D[V],
                        0 < j[V] && (q += vr(this, j[V])),
                        k = jr(this, w),
                        Q = K[k],
                        0 < pr[k] && (Q += vr(this, pr[k])),
                        _ >= v && ((this.a = _), (S = this.e()), (_ = this.a));
                      q--;
                    )
                      S[_] = S[_++ - Q];
                for (; 8 <= this.d; ) ((this.d -= 8), this.c--);
                this.a = _;
              }),
                (X.prototype.C = function (I, w) {
                  var S = this.b,
                    _ = this.a;
                  this.r = I;
                  for (var v = S.length, k, V, Q, q; (k = jr(this, I)) !== 256; )
                    if (256 > k) (_ >= v && ((S = this.e()), (v = S.length)), (S[_++] = k));
                    else
                      for (
                        V = k - 257,
                          q = D[V],
                          0 < j[V] && (q += vr(this, j[V])),
                          k = jr(this, w),
                          Q = K[k],
                          0 < pr[k] && (Q += vr(this, pr[k])),
                          _ + q > v && ((S = this.e()), (v = S.length));
                        q--;
                      )
                        S[_] = S[_++ - Q];
                  for (; 8 <= this.d; ) ((this.d -= 8), this.c--);
                  this.a = _;
                }),
                (X.prototype.e = function () {
                  var I = new (o ? Uint8Array : Array)(this.a - 32768),
                    w = this.a - 32768,
                    S,
                    _,
                    v = this.b;
                  if (o) I.set(v.subarray(32768, I.length));
                  else for (S = 0, _ = I.length; S < _; ++S) I[S] = v[S + 32768];
                  if ((this.i.push(I), (this.n += I.length), o)) v.set(v.subarray(w, w + 32768));
                  else for (S = 0; 32768 > S; ++S) v[S] = v[w + S];
                  return ((this.a = 32768), v);
                }),
                (X.prototype.D = function (I) {
                  var w,
                    S = (this.input.length / this.c + 1) | 0,
                    _,
                    v,
                    k,
                    V = this.input,
                    Q = this.b;
                  return (
                    I &&
                      (typeof I.t == "number" && (S = I.t), typeof I.z == "number" && (S += I.z)),
                    2 > S
                      ? ((_ = (V.length - this.c) / this.r[2]),
                        (k = (258 * (_ / 2)) | 0),
                        (v = k < Q.length ? Q.length + k : Q.length << 1))
                      : (v = Q.length * S),
                    o ? ((w = new Uint8Array(v)), w.set(Q)) : (w = Q),
                    (this.b = w)
                  );
                }),
                (X.prototype.q = function () {
                  var I = 0,
                    w = this.b,
                    S = this.i,
                    _,
                    v = new (o ? Uint8Array : Array)(this.n + (this.a - 32768)),
                    k,
                    V,
                    Q,
                    q;
                  if (S.length === 0)
                    return o ? this.b.subarray(32768, this.a) : this.b.slice(32768, this.a);
                  for (k = 0, V = S.length; k < V; ++k)
                    for (_ = S[k], Q = 0, q = _.length; Q < q; ++Q) v[I++] = _[Q];
                  for (k = 32768, V = this.a; k < V; ++k) v[I++] = w[k];
                  return ((this.i = []), (this.buffer = v));
                }),
                (X.prototype.A = function () {
                  var I,
                    w = this.a;
                  return (
                    o
                      ? this.w
                        ? ((I = new Uint8Array(w)), I.set(this.b.subarray(0, w)))
                        : (I = this.b.subarray(0, w))
                      : (this.b.length > w && (this.b.length = w), (I = this.b)),
                    (this.buffer = I)
                  );
                }));
              function xr(I) {
                ((this.input = I), (this.c = 0), (this.m = []), (this.s = !1));
              }
              ((xr.prototype.F = function () {
                return (this.s || this.g(), this.m.slice());
              }),
                (xr.prototype.g = function () {
                  for (var I = this.input.length; this.c < I; ) {
                    var w = new T(),
                      S = c,
                      _ = c,
                      v = c,
                      k = c,
                      V = c,
                      Q = c,
                      q = c,
                      or = c,
                      rr = c,
                      $ = this.input,
                      W = this.c;
                    if (
                      ((w.u = $[W++]),
                      (w.v = $[W++]),
                      (w.u !== 31 || w.v !== 139) &&
                        g(Error("invalid file signature:" + w.u + "," + w.v)),
                      (w.p = $[W++]),
                      w.p === 8 || g(Error("unknown compression method: " + w.p)),
                      (w.h = $[W++]),
                      (or = $[W++] | ($[W++] << 8) | ($[W++] << 16) | ($[W++] << 24)),
                      (w.H = new Date(1e3 * or)),
                      (w.N = $[W++]),
                      (w.M = $[W++]),
                      0 < (w.h & 4) && ((w.I = $[W++] | ($[W++] << 8)), (W += w.I)),
                      0 < (w.h & 8))
                    ) {
                      for (q = [], Q = 0; 0 < (V = $[W++]); ) q[Q++] = String.fromCharCode(V);
                      w.name = q.join("");
                    }
                    if (0 < (w.h & 16)) {
                      for (q = [], Q = 0; 0 < (V = $[W++]); ) q[Q++] = String.fromCharCode(V);
                      w.J = q.join("");
                    }
                    (0 < (w.h & 2) &&
                      ((w.B = l($, 0, W) & 65535),
                      w.B !== ($[W++] | ($[W++] << 8)) && g(Error("invalid header crc16"))),
                      (S =
                        $[$.length - 4] |
                        ($[$.length - 3] << 8) |
                        ($[$.length - 2] << 16) |
                        ($[$.length - 1] << 24)),
                      $.length - W - 4 - 4 < 512 * S && (k = S),
                      (_ = new X($, { index: W, bufferSize: k })),
                      (w.data = v = _.g()),
                      (W = _.c),
                      (w.K = rr = ($[W++] | ($[W++] << 8) | ($[W++] << 16) | ($[W++] << 24)) >>> 0),
                      l(v, c, c) !== rr &&
                        g(
                          Error(
                            "invalid CRC-32 checksum: 0x" +
                              l(v, c, c).toString(16) +
                              " / 0x" +
                              rr.toString(16),
                          ),
                        ),
                      (w.L = S = ($[W++] | ($[W++] << 8) | ($[W++] << 16) | ($[W++] << 24)) >>> 0),
                      (v.length & 4294967295) !== S &&
                        g(Error("invalid input size: " + (v.length & 4294967295) + " / " + S)),
                      this.m.push(w),
                      (this.c = W));
                  }
                  this.s = !0;
                  var hr = this.m,
                    sr,
                    Sr,
                    Ur = 0,
                    nr = 0,
                    yr;
                  for (sr = 0, Sr = hr.length; sr < Sr; ++sr) nr += hr[sr].data.length;
                  if (o)
                    for (yr = new Uint8Array(nr), sr = 0; sr < Sr; ++sr)
                      (yr.set(hr[sr].data, Ur), (Ur += hr[sr].data.length));
                  else {
                    for (yr = [], sr = 0; sr < Sr; ++sr) yr[sr] = hr[sr].data;
                    yr = Array.prototype.concat.apply([], yr);
                  }
                  return yr;
                }),
                i("Zlib.Gunzip", xr),
                i("Zlib.Gunzip.prototype.decompress", xr.prototype.g),
                i("Zlib.Gunzip.prototype.getMembers", xr.prototype.F),
                i("Zlib.GunzipMember", T),
                i("Zlib.GunzipMember.prototype.getName", T.prototype.getName),
                i("Zlib.GunzipMember.prototype.getData", T.prototype.getData),
                i("Zlib.GunzipMember.prototype.getMtime", T.prototype.G));
            }).call(this);
          },
          {},
        ],
        6: [
          (N, P, G) => {
            var g = N("./viterbi/ViterbiBuilder"),
              c = N("./viterbi/ViterbiSearcher"),
              e = N("./util/IpadicFormatter"),
              i = /、|。/;
            function o(f) {
              ((this.token_info_dictionary = f.token_info_dictionary),
                (this.unknown_dictionary = f.unknown_dictionary),
                (this.viterbi_builder = new g(f)),
                (this.viterbi_searcher = new c(f.connection_costs)),
                (this.formatter = new e()));
            }
            ((o.splitByPunctuation = (f) => {
              for (var a = [], u = f; u !== ""; ) {
                var l = u.search(i);
                if (l < 0) {
                  a.push(u);
                  break;
                }
                (a.push(u.substring(0, l + 1)), (u = u.substring(l + 1)));
              }
              return a;
            }),
              (o.prototype.tokenize = function (f) {
                for (var a = o.splitByPunctuation(f), u = [], l = 0; l < a.length; l++) {
                  var y = a[l];
                  this.tokenizeForSentence(y, u);
                }
                return u;
              }),
              (o.prototype.tokenizeForSentence = function (f, a) {
                a == null && (a = []);
                var u = this.getLattice(f),
                  l = this.viterbi_searcher.search(u),
                  y = 0;
                a.length > 0 && (y = a[a.length - 1].word_position);
                for (var m = 0; m < l.length; m++) {
                  var T = l[m],
                    L,
                    Z,
                    R;
                  (T.type === "KNOWN"
                    ? ((R = this.token_info_dictionary.getFeatures(T.name)),
                      R == null ? (Z = []) : (Z = R.split(",")),
                      (L = this.formatter.formatEntry(T.name, y + T.start_pos, T.type, Z)))
                    : T.type === "UNKNOWN"
                      ? ((R = this.unknown_dictionary.getFeatures(T.name)),
                        R == null ? (Z = []) : (Z = R.split(",")),
                        (L = this.formatter.formatUnknownEntry(
                          T.name,
                          y + T.start_pos,
                          T.type,
                          Z,
                          T.surface_form,
                        )))
                      : (L = this.formatter.formatEntry(T.name, y + T.start_pos, T.type, [])),
                    a.push(L));
                }
                return a;
              }),
              (o.prototype.getLattice = function (f) {
                return this.viterbi_builder.build(f);
              }),
              (P.exports = o));
          },
          {
            "./util/IpadicFormatter": 22,
            "./viterbi/ViterbiBuilder": 24,
            "./viterbi/ViterbiSearcher": 27,
          },
        ],
        7: [
          (N, P, G) => {
            var g = N("./Tokenizer"),
              c = N("./loader/NodeDictionaryLoader");
            function e(i) {
              i.dicPath == null ? (this.dic_path = "dict/") : (this.dic_path = i.dicPath);
            }
            ((e.prototype.build = function (i) {
              var o = new c(this.dic_path);
              o.load((f, a) => {
                i(f, new g(a));
              });
            }),
              (P.exports = e));
          },
          { "./Tokenizer": 6, "./loader/NodeDictionaryLoader": 19 },
        ],
        8: [
          (N, P, G) => {
            function g(c, e, i, o, f) {
              ((this.class_id = c),
                (this.class_name = e),
                (this.is_always_invoke = i),
                (this.is_grouping = o),
                (this.max_length = f));
            }
            P.exports = g;
          },
          {},
        ],
        9: [
          (N, P, G) => {
            var g = N("./InvokeDefinitionMap"),
              c = N("./CharacterClass"),
              e = N("../util/SurrogateAwareString"),
              i = "DEFAULT";
            function o() {
              ((this.character_category_map = new Uint8Array(65536)),
                (this.compatible_category_map = new Uint32Array(65536)),
                (this.invoke_definition_map = null));
            }
            ((o.load = (f, a, u) => {
              var l = new o();
              return (
                (l.character_category_map = f),
                (l.compatible_category_map = a),
                (l.invoke_definition_map = g.load(u)),
                l
              );
            }),
              (o.parseCharCategory = (f, a) => {
                var u = a[1],
                  l = parseInt(a[2]),
                  y = parseInt(a[3]),
                  m = parseInt(a[4]);
                if (!isFinite(l) || (l !== 0 && l !== 1))
                  return (console.log("char.def parse error. INVOKE is 0 or 1 in:" + l), null);
                if (!isFinite(y) || (y !== 0 && y !== 1))
                  return (console.log("char.def parse error. GROUP is 0 or 1 in:" + y), null);
                if (!isFinite(m) || m < 0)
                  return (console.log("char.def parse error. LENGTH is 1 to n:" + m), null);
                var T = l === 1,
                  L = y === 1;
                return new c(f, u, T, L, m);
              }),
              (o.parseCategoryMapping = (f) => {
                var a = parseInt(f[1]),
                  u = f[2],
                  l = 3 < f.length ? f.slice(3) : [];
                return (
                  (!isFinite(a) || a < 0 || a > 65535) &&
                    console.log("char.def parse error. CODE is invalid:" + a),
                  { start: a, default: u, compatible: l }
                );
              }),
              (o.parseRangeCategoryMapping = (f) => {
                var a = parseInt(f[1]),
                  u = parseInt(f[2]),
                  l = f[3],
                  y = 4 < f.length ? f.slice(4) : [];
                return (
                  (!isFinite(a) || a < 0 || a > 65535) &&
                    console.log("char.def parse error. CODE is invalid:" + a),
                  (!isFinite(u) || u < 0 || u > 65535) &&
                    console.log("char.def parse error. CODE is invalid:" + u),
                  { start: a, end: u, default: l, compatible: y }
                );
              }),
              (o.prototype.initCategoryMappings = function (f) {
                var a;
                if (f != null)
                  for (var u = 0; u < f.length; u++) {
                    var l = f[u],
                      y = l.end || l.start;
                    for (a = l.start; a <= y; a++) {
                      this.character_category_map[a] = this.invoke_definition_map.lookup(l.default);
                      for (var m = 0; m < l.compatible.length; m++) {
                        var T = this.compatible_category_map[a],
                          L = l.compatible[m];
                        if (L != null) {
                          var Z = this.invoke_definition_map.lookup(L);
                          if (Z != null) {
                            var R = 1 << Z;
                            ((T = T | R), (this.compatible_category_map[a] = T));
                          }
                        }
                      }
                    }
                  }
                var H = this.invoke_definition_map.lookup(i);
                if (H != null)
                  for (a = 0; a < this.character_category_map.length; a++)
                    this.character_category_map[a] === 0 &&
                      (this.character_category_map[a] = 1 << H);
              }),
              (o.prototype.lookupCompatibleCategory = function (f) {
                var a = [],
                  u = f.charCodeAt(0),
                  l;
                if (
                  (u < this.compatible_category_map.length && (l = this.compatible_category_map[u]),
                  l == null || l === 0)
                )
                  return a;
                for (var y = 0; y < 32; y++)
                  if ((l << (31 - y)) >>> 31 === 1) {
                    var m = this.invoke_definition_map.getCharacterClass(y);
                    if (m == null) continue;
                    a.push(m);
                  }
                return a;
              }),
              (o.prototype.lookup = function (f) {
                var a,
                  u = f.charCodeAt(0);
                return (
                  e.isSurrogatePair(f)
                    ? (a = this.invoke_definition_map.lookup(i))
                    : u < this.character_category_map.length &&
                      (a = this.character_category_map[u]),
                  a == null && (a = this.invoke_definition_map.lookup(i)),
                  this.invoke_definition_map.getCharacterClass(a)
                );
              }),
              (P.exports = o));
          },
          {
            "../util/SurrogateAwareString": 23,
            "./CharacterClass": 8,
            "./InvokeDefinitionMap": 12,
          },
        ],
        10: [
          (N, P, G) => {
            function g(c, e) {
              ((this.forward_dimension = c),
                (this.backward_dimension = e),
                (this.buffer = new Int16Array(c * e + 2)),
                (this.buffer[0] = c),
                (this.buffer[1] = e));
            }
            ((g.prototype.put = function (c, e, i) {
              var o = c * this.backward_dimension + e + 2;
              if (this.buffer.length < o + 1) throw "ConnectionCosts buffer overflow";
              this.buffer[o] = i;
            }),
              (g.prototype.get = function (c, e) {
                var i = c * this.backward_dimension + e + 2;
                if (this.buffer.length < i + 1) throw "ConnectionCosts buffer overflow";
                return this.buffer[i];
              }),
              (g.prototype.loadConnectionCosts = function (c) {
                ((this.forward_dimension = c[0]),
                  (this.backward_dimension = c[1]),
                  (this.buffer = c));
              }),
              (P.exports = g));
          },
          {},
        ],
        11: [
          (N, P, G) => {
            var g = N("doublearray"),
              c = N("./TokenInfoDictionary"),
              e = N("./ConnectionCosts"),
              i = N("./UnknownDictionary");
            function o(f, a, u, l) {
              (f != null ? (this.trie = f) : (this.trie = g.builder(0).build([{ k: "", v: 1 }])),
                a != null
                  ? (this.token_info_dictionary = a)
                  : (this.token_info_dictionary = new c()),
                u != null ? (this.connection_costs = u) : (this.connection_costs = new e(0, 0)),
                l != null ? (this.unknown_dictionary = l) : (this.unknown_dictionary = new i()));
            }
            ((o.prototype.loadTrie = function (f, a) {
              return ((this.trie = g.load(f, a)), this);
            }),
              (o.prototype.loadTokenInfoDictionaries = function (f, a, u) {
                return (
                  this.token_info_dictionary.loadDictionary(f),
                  this.token_info_dictionary.loadPosVector(a),
                  this.token_info_dictionary.loadTargetMap(u),
                  this
                );
              }),
              (o.prototype.loadConnectionCosts = function (f) {
                return (this.connection_costs.loadConnectionCosts(f), this);
              }),
              (o.prototype.loadUnknownDictionaries = function (f, a, u, l, y, m) {
                return (this.unknown_dictionary.loadUnknownDictionaries(f, a, u, l, y, m), this);
              }),
              (P.exports = o));
          },
          {
            "./ConnectionCosts": 10,
            "./TokenInfoDictionary": 13,
            "./UnknownDictionary": 14,
            doublearray: 2,
          },
        ],
        12: [
          (N, P, G) => {
            var g = N("../util/ByteBuffer"),
              c = N("./CharacterClass");
            function e() {
              ((this.map = []), (this.lookup_table = {}));
            }
            ((e.load = (i) => {
              for (var o = new e(), f = [], a = new g(i); a.position + 1 < a.size(); ) {
                var u = f.length,
                  l = a.get(),
                  y = a.get(),
                  m = a.getInt(),
                  T = a.getString();
                f.push(new c(u, T, l, y, m));
              }
              return (o.init(f), o);
            }),
              (e.prototype.init = function (i) {
                if (i != null)
                  for (var o = 0; o < i.length; o++) {
                    var f = i[o];
                    ((this.map[o] = f), (this.lookup_table[f.class_name] = o));
                  }
              }),
              (e.prototype.getCharacterClass = function (i) {
                return this.map[i];
              }),
              (e.prototype.lookup = function (i) {
                var o = this.lookup_table[i];
                return o ?? null;
              }),
              (e.prototype.toBuffer = function () {
                for (var i = new g(), o = 0; o < this.map.length; o++) {
                  var f = this.map[o];
                  (i.put(f.is_always_invoke),
                    i.put(f.is_grouping),
                    i.putInt(f.max_length),
                    i.putString(f.class_name));
                }
                return (i.shrink(), i.buffer);
              }),
              (P.exports = e));
          },
          { "../util/ByteBuffer": 21, "./CharacterClass": 8 },
        ],
        13: [
          (N, P, G) => {
            var g = N("../util/ByteBuffer");
            function c() {
              ((this.dictionary = new g(10 * 1024 * 1024)),
                (this.target_map = {}),
                (this.pos_buffer = new g(10 * 1024 * 1024)));
            }
            ((c.prototype.buildDictionary = function (e) {
              for (var i = {}, o = 0; o < e.length; o++) {
                var f = e[o];
                if (!(f.length < 4)) {
                  var a = f[0],
                    u = f[1],
                    l = f[2],
                    y = f[3],
                    m = f.slice(4).join(",");
                  (!isFinite(u) || !isFinite(l) || !isFinite(y)) && console.log(f);
                  var T = this.put(u, l, y, a, m);
                  i[T] = a;
                }
              }
              return (this.dictionary.shrink(), this.pos_buffer.shrink(), i);
            }),
              (c.prototype.put = function (e, i, o, f, a) {
                var u = this.dictionary.position,
                  l = this.pos_buffer.position;
                return (
                  this.dictionary.putShort(e),
                  this.dictionary.putShort(i),
                  this.dictionary.putShort(o),
                  this.dictionary.putInt(l),
                  this.pos_buffer.putString(f + "," + a),
                  u
                );
              }),
              (c.prototype.addMapping = function (e, i) {
                var o = this.target_map[e];
                (o == null && (o = []), o.push(i), (this.target_map[e] = o));
              }),
              (c.prototype.targetMapToBuffer = function () {
                var e = new g(),
                  i = Object.keys(this.target_map).length;
                e.putInt(i);
                for (var o in this.target_map) {
                  var f = this.target_map[o],
                    a = f.length;
                  (e.putInt(parseInt(o)), e.putInt(a));
                  for (var u = 0; u < f.length; u++) e.putInt(f[u]);
                }
                return e.shrink();
              }),
              (c.prototype.loadDictionary = function (e) {
                return ((this.dictionary = new g(e)), this);
              }),
              (c.prototype.loadPosVector = function (e) {
                return ((this.pos_buffer = new g(e)), this);
              }),
              (c.prototype.loadTargetMap = function (e) {
                var i = new g(e);
                for (
                  i.position = 0, this.target_map = {}, i.readInt();
                  !(i.buffer.length < i.position + 1);
                )
                  for (var o = i.readInt(), f = i.readInt(), a = 0; a < f; a++) {
                    var u = i.readInt();
                    this.addMapping(o, u);
                  }
                return this;
              }),
              (c.prototype.getFeatures = function (e) {
                var i = parseInt(e);
                if (isNaN(i)) return "";
                var o = this.dictionary.getInt(i + 6);
                return this.pos_buffer.getString(o);
              }),
              (P.exports = c));
          },
          { "../util/ByteBuffer": 21 },
        ],
        14: [
          (N, P, G) => {
            var g = N("./TokenInfoDictionary"),
              c = N("./CharacterDefinition"),
              e = N("../util/ByteBuffer");
            function i() {
              ((this.dictionary = new e(10 * 1024 * 1024)),
                (this.target_map = {}),
                (this.pos_buffer = new e(10 * 1024 * 1024)),
                (this.character_definition = null));
            }
            ((i.prototype = Object.create(g.prototype)),
              (i.prototype.characterDefinition = function (o) {
                return ((this.character_definition = o), this);
              }),
              (i.prototype.lookup = function (o) {
                return this.character_definition.lookup(o);
              }),
              (i.prototype.lookupCompatibleCategory = function (o) {
                return this.character_definition.lookupCompatibleCategory(o);
              }),
              (i.prototype.loadUnknownDictionaries = function (o, f, a, u, l, y) {
                (this.loadDictionary(o),
                  this.loadPosVector(f),
                  this.loadTargetMap(a),
                  (this.character_definition = c.load(u, l, y)));
              }),
              (P.exports = i));
          },
          { "../util/ByteBuffer": 21, "./CharacterDefinition": 9, "./TokenInfoDictionary": 13 },
        ],
        15: [
          (N, P, G) => {
            var g = N("../CharacterDefinition"),
              c = N("../InvokeDefinitionMap"),
              e = /^(\w+)\s+(\d)\s+(\d)\s+(\d)/,
              i = /^(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/,
              o = /^(0x[0-9A-F]{4})\.\.(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;
            function f() {
              ((this.char_def = new g()),
                (this.char_def.invoke_definition_map = new c()),
                (this.character_category_definition = []),
                (this.category_mapping = []));
            }
            ((f.prototype.putLine = function (a) {
              var u = e.exec(a);
              if (u != null) {
                var l = this.character_category_definition.length,
                  y = g.parseCharCategory(l, u);
                if (y == null) return;
                this.character_category_definition.push(y);
                return;
              }
              var m = i.exec(a);
              if (m != null) {
                var T = g.parseCategoryMapping(m);
                this.category_mapping.push(T);
              }
              var L = o.exec(a);
              if (L != null) {
                var Z = g.parseRangeCategoryMapping(L);
                this.category_mapping.push(Z);
              }
            }),
              (f.prototype.build = function () {
                return (
                  this.char_def.invoke_definition_map.init(this.character_category_definition),
                  this.char_def.initCategoryMappings(this.category_mapping),
                  this.char_def
                );
              }),
              (P.exports = f));
          },
          { "../CharacterDefinition": 9, "../InvokeDefinitionMap": 12 },
        ],
        16: [
          (N, P, G) => {
            var g = N("../ConnectionCosts");
            function c() {
              ((this.lines = 0), (this.connection_cost = null));
            }
            ((c.prototype.putLine = function (e) {
              if (this.lines === 0) {
                var i = e.split(" "),
                  o = i[0],
                  f = i[1];
                if (o < 0 || f < 0) throw "Parse error of matrix.def";
                return ((this.connection_cost = new g(o, f)), this.lines++, this);
              }
              var a = e.split(" ");
              if (a.length !== 3) return this;
              var u = parseInt(a[0]),
                l = parseInt(a[1]),
                y = parseInt(a[2]);
              if (
                u < 0 ||
                l < 0 ||
                !isFinite(u) ||
                !isFinite(l) ||
                this.connection_cost.forward_dimension <= u ||
                this.connection_cost.backward_dimension <= l
              )
                throw "Parse error of matrix.def";
              return (this.connection_cost.put(u, l, y), this.lines++, this);
            }),
              (c.prototype.build = function () {
                return this.connection_cost;
              }),
              (P.exports = c));
          },
          { "../ConnectionCosts": 10 },
        ],
        17: [
          (N, P, G) => {
            var g = N("doublearray"),
              c = N("../DynamicDictionaries"),
              e = N("../TokenInfoDictionary"),
              i = N("./ConnectionCostsBuilder"),
              o = N("./CharacterDefinitionBuilder"),
              f = N("../UnknownDictionary");
            function a() {
              ((this.tid_entries = []),
                (this.unk_entries = []),
                (this.cc_builder = new i()),
                (this.cd_builder = new o()));
            }
            ((a.prototype.addTokenInfoDictionary = function (u) {
              var l = u.split(",");
              return (this.tid_entries.push(l), this);
            }),
              (a.prototype.putCostMatrixLine = function (u) {
                return (this.cc_builder.putLine(u), this);
              }),
              (a.prototype.putCharDefLine = function (u) {
                return (this.cd_builder.putLine(u), this);
              }),
              (a.prototype.putUnkDefLine = function (u) {
                return (this.unk_entries.push(u.split(",")), this);
              }),
              (a.prototype.build = function () {
                var u = this.buildTokenInfoDictionary(),
                  l = this.buildUnknownDictionary();
                return new c(u.trie, u.token_info_dictionary, this.cc_builder.build(), l);
              }),
              (a.prototype.buildTokenInfoDictionary = function () {
                var u = new e(),
                  l = u.buildDictionary(this.tid_entries),
                  y = this.buildDoubleArray();
                for (var m in l) {
                  var T = l[m],
                    L = y.lookup(T);
                  u.addMapping(L, m);
                }
                return { trie: y, token_info_dictionary: u };
              }),
              (a.prototype.buildUnknownDictionary = function () {
                var u = new f(),
                  l = u.buildDictionary(this.unk_entries),
                  y = this.cd_builder.build();
                u.characterDefinition(y);
                for (var m in l) {
                  var T = l[m],
                    L = y.invoke_definition_map.lookup(T);
                  u.addMapping(L, m);
                }
                return u;
              }),
              (a.prototype.buildDoubleArray = function () {
                var u = 0,
                  l = this.tid_entries.map((m) => {
                    var T = m[0];
                    return { k: T, v: u++ };
                  }),
                  y = g.builder(1024 * 1024);
                return y.build(l);
              }),
              (P.exports = a));
          },
          {
            "../DynamicDictionaries": 11,
            "../TokenInfoDictionary": 13,
            "../UnknownDictionary": 14,
            "./CharacterDefinitionBuilder": 15,
            "./ConnectionCostsBuilder": 16,
            doublearray: 2,
          },
        ],
        18: [
          (N, P, G) => {
            var g = N("./TokenizerBuilder"),
              c = N("./dict/builder/DictionaryBuilder"),
              e = { builder: (i) => new g(i), dictionaryBuilder: () => new c() };
            P.exports = e;
          },
          { "./TokenizerBuilder": 7, "./dict/builder/DictionaryBuilder": 17 },
        ],
        19: [
          (N, P, G) => {
            var g = N("zlibjs/bin/gunzip.min.js"),
              c = N("./DictionaryLoader");
            function e(i) {
              c.apply(this, [i]);
            }
            ((e.prototype = Object.create(c.prototype)),
              (e.prototype.loadArrayBuffer = (i, o) => {
                fetch(i)
                  .then((f) => {
                    if (!f.ok) throw new Error(f.statusText);
                    return f.arrayBuffer();
                  })
                  .then((f) => {
                    const u = new g.Zlib.Gunzip(new Uint8Array(f)).decompress();
                    o(null, u.buffer);
                  })
                  .catch((f) => {
                    o(f, null);
                  });
              }),
              (P.exports = e));
          },
          { "./DictionaryLoader": 20, "zlibjs/bin/gunzip.min.js": 5 },
        ],
        20: [
          (N, P, G) => {
            var g = N("path"),
              c = N("async"),
              e = N("../dict/DynamicDictionaries");
            function i(o) {
              ((this.dic = new e()), (this.dic_path = o));
            }
            ((i.prototype.loadArrayBuffer = (o, f) => {
              throw new Error("DictionaryLoader#loadArrayBuffer should be overwrite");
            }),
              (i.prototype.load = function (o) {
                var f = this.dic,
                  a = this.dic_path,
                  u = this.loadArrayBuffer;
                c.parallel(
                  [
                    (l) => {
                      c.map(
                        ["base.dat.gz", "check.dat.gz"],
                        (y, m) => {
                          u(`${a}/${y}`, (T, L) => {
                            if (T) return m(T);
                            m(null, L);
                          });
                        },
                        (y, m) => {
                          if (y) return l(y);
                          var T = new Int32Array(m[0]),
                            L = new Int32Array(m[1]);
                          (f.loadTrie(T, L), l(null));
                        },
                      );
                    },
                    (l) => {
                      c.map(
                        ["tid.dat.gz", "tid_pos.dat.gz", "tid_map.dat.gz"],
                        (y, m) => {
                          u(`${a}/${y}`, (T, L) => {
                            if (T) return m(T);
                            m(null, L);
                          });
                        },
                        (y, m) => {
                          if (y) return l(y);
                          var T = new Uint8Array(m[0]),
                            L = new Uint8Array(m[1]),
                            Z = new Uint8Array(m[2]);
                          (f.loadTokenInfoDictionaries(T, L, Z), l(null));
                        },
                      );
                    },
                    (l) => {
                      u(`${a}/cc.dat.gz`, (y, m) => {
                        if (y) return l(y);
                        var T = new Int16Array(m);
                        (f.loadConnectionCosts(T), l(null));
                      });
                    },
                    (l) => {
                      c.map(
                        [
                          "unk.dat.gz",
                          "unk_pos.dat.gz",
                          "unk_map.dat.gz",
                          "unk_char.dat.gz",
                          "unk_compat.dat.gz",
                          "unk_invoke.dat.gz",
                        ],
                        (y, m) => {
                          u(`${a}/${y}`, (T, L) => {
                            if (T) return m(T);
                            m(null, L);
                          });
                        },
                        (y, m) => {
                          if (y) return l(y);
                          var T = new Uint8Array(m[0]),
                            L = new Uint8Array(m[1]),
                            Z = new Uint8Array(m[2]),
                            R = new Uint8Array(m[3]),
                            H = new Uint32Array(m[4]),
                            X = new Uint8Array(m[5]);
                          (f.loadUnknownDictionaries(T, L, Z, R, H, X), l(null));
                        },
                      );
                    },
                  ],
                  (l) => {
                    o(l, f);
                  },
                );
              }),
              (P.exports = i));
          },
          { "../dict/DynamicDictionaries": 11, async: 1, path: 3 },
        ],
        21: [
          (N, P, G) => {
            var g = (i) => {
                for (var o = new Uint8Array(i.length * 4), f = 0, a = 0; f < i.length; ) {
                  var u,
                    l = i.charCodeAt(f++);
                  if (l >= 55296 && l <= 56319) {
                    var y = l,
                      m = i.charCodeAt(f++);
                    if (m >= 56320 && m <= 57343) u = (y - 55296) * 1024 + 65536 + (m - 56320);
                    else return null;
                  } else u = l;
                  u < 128
                    ? (o[a++] = u)
                    : u < 2048
                      ? ((o[a++] = (u >>> 6) | 192), (o[a++] = (u & 63) | 128))
                      : u < 65536
                        ? ((o[a++] = (u >>> 12) | 224),
                          (o[a++] = ((u >> 6) & 63) | 128),
                          (o[a++] = (u & 63) | 128))
                        : u < 2097152 &&
                          ((o[a++] = (u >>> 18) | 240),
                          (o[a++] = ((u >> 12) & 63) | 128),
                          (o[a++] = ((u >> 6) & 63) | 128),
                          (o[a++] = (u & 63) | 128));
                }
                return o.subarray(0, a);
              },
              c = (i) => {
                for (var o = "", f, a, u, l, y, m, T, L = 0; L < i.length; )
                  ((a = i[L++]),
                    a < 128
                      ? (f = a)
                      : a >> 5 === 6
                        ? ((u = i[L++]), (f = ((a & 31) << 6) | (u & 63)))
                        : a >> 4 === 14
                          ? ((u = i[L++]),
                            (l = i[L++]),
                            (f = ((a & 15) << 12) | ((u & 63) << 6) | (l & 63)))
                          : ((u = i[L++]),
                            (l = i[L++]),
                            (y = i[L++]),
                            (f = ((a & 7) << 18) | ((u & 63) << 12) | ((l & 63) << 6) | (y & 63))),
                    f < 65536
                      ? (o += String.fromCharCode(f))
                      : ((f -= 65536),
                        (m = 55296 | (f >> 10)),
                        (T = 56320 | (f & 1023)),
                        (o += String.fromCharCode(m, T))));
                return o;
              };
            function e(i) {
              var o;
              if (i == null) o = 1024 * 1024;
              else if (typeof i == "number") o = i;
              else if (i instanceof Uint8Array) {
                ((this.buffer = i), (this.position = 0));
                return;
              } else throw typeof i + " is invalid parameter type for ByteBuffer constructor";
              ((this.buffer = new Uint8Array(o)), (this.position = 0));
            }
            ((e.prototype.size = function () {
              return this.buffer.length;
            }),
              (e.prototype.reallocate = function () {
                var i = new Uint8Array(this.buffer.length * 2);
                (i.set(this.buffer), (this.buffer = i));
              }),
              (e.prototype.shrink = function () {
                return ((this.buffer = this.buffer.subarray(0, this.position)), this.buffer);
              }),
              (e.prototype.put = function (i) {
                (this.buffer.length < this.position + 1 && this.reallocate(),
                  (this.buffer[this.position++] = i));
              }),
              (e.prototype.get = function (i) {
                return (
                  i == null && ((i = this.position), (this.position += 1)),
                  this.buffer.length < i + 1 ? 0 : this.buffer[i]
                );
              }),
              (e.prototype.putShort = function (i) {
                if (65535 < i) throw i + " is over short value";
                var o = 255 & i,
                  f = (65280 & i) >> 8;
                (this.put(o), this.put(f));
              }),
              (e.prototype.getShort = function (i) {
                if (
                  (i == null && ((i = this.position), (this.position += 2)),
                  this.buffer.length < i + 2)
                )
                  return 0;
                var o = this.buffer[i],
                  f = this.buffer[i + 1],
                  a = (f << 8) + o;
                return (a & 32768 && (a = -((a - 1) ^ 65535)), a);
              }),
              (e.prototype.putInt = function (i) {
                if (4294967295 < i) throw i + " is over integer value";
                var o = 255 & i,
                  f = (65280 & i) >> 8,
                  a = (16711680 & i) >> 16,
                  u = (4278190080 & i) >> 24;
                (this.put(o), this.put(f), this.put(a), this.put(u));
              }),
              (e.prototype.getInt = function (i) {
                if (
                  (i == null && ((i = this.position), (this.position += 4)),
                  this.buffer.length < i + 4)
                )
                  return 0;
                var o = this.buffer[i],
                  f = this.buffer[i + 1],
                  a = this.buffer[i + 2],
                  u = this.buffer[i + 3];
                return (u << 24) + (a << 16) + (f << 8) + o;
              }),
              (e.prototype.readInt = function () {
                var i = this.position;
                return ((this.position += 4), this.getInt(i));
              }),
              (e.prototype.putString = function (i) {
                for (var o = g(i), f = 0; f < o.length; f++) this.put(o[f]);
                this.put(0);
              }),
              (e.prototype.getString = function (i) {
                var o = [],
                  f;
                for (
                  i == null && (i = this.position);
                  !(this.buffer.length < i + 1 || ((f = this.get(i++)), f === 0));
                )
                  o.push(f);
                return ((this.position = i), c(o));
              }),
              (P.exports = e));
          },
          {},
        ],
        22: [
          (N, P, G) => {
            function g() {}
            ((g.prototype.formatEntry = (c, e, i, o) => {
              var f = {};
              return (
                (f.word_id = c),
                (f.word_type = i),
                (f.word_position = e),
                (f.surface_form = o[0]),
                (f.pos = o[1]),
                (f.pos_detail_1 = o[2]),
                (f.pos_detail_2 = o[3]),
                (f.pos_detail_3 = o[4]),
                (f.conjugated_type = o[5]),
                (f.conjugated_form = o[6]),
                (f.basic_form = o[7]),
                (f.reading = o[8]),
                (f.pronunciation = o[9]),
                f
              );
            }),
              (g.prototype.formatUnknownEntry = (c, e, i, o, f) => {
                var a = {};
                return (
                  (a.word_id = c),
                  (a.word_type = i),
                  (a.word_position = e),
                  (a.surface_form = f),
                  (a.pos = o[1]),
                  (a.pos_detail_1 = o[2]),
                  (a.pos_detail_2 = o[3]),
                  (a.pos_detail_3 = o[4]),
                  (a.conjugated_type = o[5]),
                  (a.conjugated_form = o[6]),
                  (a.basic_form = o[7]),
                  a
                );
              }),
              (P.exports = g));
          },
          {},
        ],
        23: [
          (N, P, G) => {
            function g(c) {
              ((this.str = c), (this.index_mapping = []));
              for (var e = 0; e < c.length; e++) {
                var i = c.charAt(e);
                (this.index_mapping.push(e), g.isSurrogatePair(i) && e++);
              }
              this.length = this.index_mapping.length;
            }
            ((g.prototype.slice = function (c) {
              if (this.index_mapping.length <= c) return "";
              var e = this.index_mapping[c];
              return this.str.slice(e);
            }),
              (g.prototype.charAt = function (c) {
                if (this.str.length <= c) return "";
                var e = this.index_mapping[c],
                  i = this.index_mapping[c + 1];
                return i == null ? this.str.slice(e) : this.str.slice(e, i);
              }),
              (g.prototype.charCodeAt = function (c) {
                if (this.index_mapping.length <= c) return NaN;
                var e = this.index_mapping[c],
                  i = this.str.charCodeAt(e),
                  o;
                return i >= 55296 &&
                  i <= 56319 &&
                  e < this.str.length &&
                  ((o = this.str.charCodeAt(e + 1)), o >= 56320 && o <= 57343)
                  ? (i - 55296) * 1024 + o - 56320 + 65536
                  : i;
              }),
              (g.prototype.toString = function () {
                return this.str;
              }),
              (g.isSurrogatePair = (c) => {
                var e = c.charCodeAt(0);
                return e >= 55296 && e <= 56319;
              }),
              (P.exports = g));
          },
          {},
        ],
        24: [
          (N, P, G) => {
            var g = N("./ViterbiNode"),
              c = N("./ViterbiLattice"),
              e = N("../util/SurrogateAwareString");
            function i(o) {
              ((this.trie = o.trie),
                (this.token_info_dictionary = o.token_info_dictionary),
                (this.unknown_dictionary = o.unknown_dictionary));
            }
            ((i.prototype.build = function (o) {
              for (var f = new c(), a = new e(o), u, l, y, m, T, L = 0; L < a.length; L++) {
                for (
                  var Z = a.slice(L), R = this.trie.commonPrefixSearch(Z), H = 0;
                  H < R.length;
                  H++
                ) {
                  ((l = R[H].v), (u = R[H].k));
                  for (var X = this.token_info_dictionary.target_map[l], C = 0; C < X.length; C++) {
                    var b = parseInt(X[C]);
                    ((y = this.token_info_dictionary.dictionary.getShort(b)),
                      (m = this.token_info_dictionary.dictionary.getShort(b + 2)),
                      (T = this.token_info_dictionary.dictionary.getShort(b + 4)),
                      f.append(new g(b, T, L + 1, u.length, "KNOWN", y, m, u)));
                  }
                }
                var O = new e(Z),
                  x = new e(O.charAt(0)),
                  B = this.unknown_dictionary.lookup(x.toString());
                if (R == null || R.length === 0 || B.is_always_invoke === 1) {
                  if (((u = x), B.is_grouping === 1 && 1 < O.length))
                    for (var D = 1; D < O.length; D++) {
                      var E = O.charAt(D),
                        j = this.unknown_dictionary.lookup(E);
                      if (B.class_name !== j.class_name) break;
                      u += E;
                    }
                  for (
                    var F = this.unknown_dictionary.target_map[B.class_id], K = 0;
                    K < F.length;
                    K++
                  ) {
                    var J = parseInt(F[K]);
                    ((y = this.unknown_dictionary.dictionary.getShort(J)),
                      (m = this.unknown_dictionary.dictionary.getShort(J + 2)),
                      (T = this.unknown_dictionary.dictionary.getShort(J + 4)),
                      f.append(new g(J, T, L + 1, u.length, "UNKNOWN", y, m, u.toString())));
                  }
                }
              }
              return (f.appendEos(), f);
            }),
              (P.exports = i));
          },
          { "../util/SurrogateAwareString": 23, "./ViterbiLattice": 25, "./ViterbiNode": 26 },
        ],
        25: [
          (N, P, G) => {
            var g = N("./ViterbiNode");
            function c() {
              ((this.nodes_end_at = []),
                (this.nodes_end_at[0] = [new g(-1, 0, 0, 0, "BOS", 0, 0, "")]),
                (this.eos_pos = 1));
            }
            ((c.prototype.append = function (e) {
              var i = e.start_pos + e.length - 1;
              this.eos_pos < i && (this.eos_pos = i);
              var o = this.nodes_end_at[i];
              (o == null && (o = []), o.push(e), (this.nodes_end_at[i] = o));
            }),
              (c.prototype.appendEos = function () {
                var e = this.nodes_end_at.length;
                (this.eos_pos++,
                  (this.nodes_end_at[e] = [new g(-1, 0, this.eos_pos, 0, "EOS", 0, 0, "")]));
              }),
              (P.exports = c));
          },
          { "./ViterbiNode": 26 },
        ],
        26: [
          (N, P, G) => {
            function g(c, e, i, o, f, a, u, l) {
              ((this.name = c),
                (this.cost = e),
                (this.start_pos = i),
                (this.length = o),
                (this.left_id = a),
                (this.right_id = u),
                (this.prev = null),
                (this.surface_form = l),
                f === "BOS" ? (this.shortest_cost = 0) : (this.shortest_cost = Number.MAX_VALUE),
                (this.type = f));
            }
            P.exports = g;
          },
          {},
        ],
        27: [
          (N, P, G) => {
            function g(c) {
              this.connection_costs = c;
            }
            ((g.prototype.search = function (c) {
              return ((c = this.forward(c)), this.backward(c));
            }),
              (g.prototype.forward = function (c) {
                var e, i, o;
                for (e = 1; e <= c.eos_pos; e++) {
                  var f = c.nodes_end_at[e];
                  if (f != null)
                    for (i = 0; i < f.length; i++) {
                      var a = f[i],
                        u = Number.MAX_VALUE,
                        l,
                        y = c.nodes_end_at[a.start_pos - 1];
                      if (y != null) {
                        for (o = 0; o < y.length; o++) {
                          var m = y[o],
                            T;
                          a.left_id == null || m.right_id == null
                            ? (console.log("Left or right is null"), (T = 0))
                            : (T = this.connection_costs.get(m.right_id, a.left_id));
                          var L = m.shortest_cost + T + a.cost;
                          L < u && ((l = m), (u = L));
                        }
                        ((a.prev = l), (a.shortest_cost = u));
                      }
                    }
                }
                return c;
              }),
              (g.prototype.backward = (c) => {
                var e = [],
                  i = c.nodes_end_at[c.nodes_end_at.length - 1][0],
                  o = i.prev;
                if (o == null) return [];
                for (; o.type !== "BOS"; ) {
                  if ((e.push(o), o.prev == null)) return [];
                  o = o.prev;
                }
                return e.reverse();
              }),
              (P.exports = g));
          },
          {},
        ],
      },
      {},
      [18],
    )(18);
  });
});
export default Hi();
