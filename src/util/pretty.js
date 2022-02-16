// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const NUMBER_PRECISION = 5;
const NUMBER_THRESHOLD = 0.0001;

const checkFactor = (v, f) =>
  Math.abs(v / f - Math.round(v / f)) < NUMBER_THRESHOLD;
const checkUnit = (v) => checkFactor(v, 1);

const formatMultiple = function (v, f, k, compact) {
  const d = Math.round(v / f);
  if (d === 1) {
    return `${k}`;
  }
  if (d === -1) {
    return `-${k}`;
  }
  if (k === "1") {
    return `${d}`;
  }
  if (compact) {
    return `${d}${k}`;
  } else {
    return `${d}*${k}`;
  }
};

const formatFraction = function (v, f, k, compact) {
  let d = Math.round(v * f);
  if (Math.abs(d) === 1) {
    d = d < 0 ? "-" : "";
    d += k;
  } else if (k !== "1") {
    d += compact ? `${k}` : `*${k}`;
  }

  return `${d}/${f}`;
};

const formatFactors = [
  { 1: 1 },
  { 1: 1, τ: Math.PI * 2 },
  { 1: 1, π: Math.PI },
  { 1: 1, τ: Math.PI * 2, π: Math.PI },
  { 1: 1, e: Math.E },
  { 1: 1, τ: Math.PI * 2, e: Math.E },
  { 1: 1, π: Math.PI, e: Math.E },
  { 1: 1, τ: Math.PI * 2, π: Math.PI, e: Math.E },
];
const formatPrimes = [
  // denominators 1-30 + interesting multiples
  [2 * 2 * 3 * 5 * 7, [2, 3, 5, 7]], // 1-7
  [2 * 2 * 2 * 3 * 3 * 5 * 5 * 7 * 7, [2, 3, 5, 7]], // 8-11
  [2 * 2 * 3 * 5 * 7 * 11 * 13, [2, 3, 5, 7, 11, 13]], // 12-16
  [2 * 2 * 17 * 19 * 23 * 29, [2, 17, 19, 23, 29]], // 17-30
  [256 * 256, [2]], // Powers of 2
  [1000000, [2, 5]], // Powers of 10
];

const prettyNumber = function (options) {
  let cache, compact, e, pi, precision, tau, threshold;
  if (options) {
    ({ cache, compact, tau, pi, e, threshold, precision } = options);
  }

  compact = +!!(compact != null ? compact : true);
  tau = +!!(tau != null ? tau : true);
  pi = +!!(pi != null ? pi : true);
  e = +!!(e != null ? e : true);
  cache = +!!(cache != null ? cache : true);

  const formatIndex = tau + pi * 2 + e * 4;

  const numberCache = cache ? {} : null;

  return function (v) {
    if (numberCache != null) {
      let cached;
      if ((cached = numberCache[v]) != null) {
        return cached;
      }
      if (v === Math.round(v)) {
        return (numberCache[v] = `${v}`);
      }
    }

    let out = `${v}`;
    let best = out.length + out.indexOf(".") + 2;
    const match = function (x) {
      const d = x.length;
      if (d <= best) {
        out = `${x}`;
        return (best = d);
      }
    };

    for (let k in formatFactors[formatIndex]) {
      const f = formatFactors[formatIndex][k];
      if (checkUnit(v / f)) {
        match(`${formatMultiple(v / f, 1, k, compact)}`);
      } else {
        for (let [denom, list] of Array.from(formatPrimes)) {
          let numer = (v / f) * denom;
          if (checkUnit(numer)) {
            for (let p of Array.from(list)) {
              var d, n;
              while (checkUnit((n = numer / p)) && checkUnit((d = denom / p))) {
                numer = n;
                denom = d;
              }
            }

            match(`${formatFraction(v / f, denom, k, compact)}`);
            break;
          }
        }
      }
    }

    if (`${v}`.length > NUMBER_PRECISION) {
      match(`${v.toPrecision(NUMBER_PRECISION)}`);
    }

    if (numberCache != null) {
      numberCache[v] = out;
    }

    return out;
  };
};

const prettyPrint = function (markup, level) {
  if (level == null) {
    level = "info";
  }
  markup = prettyMarkup(markup);
  return console[level].apply(console, markup);
};

var prettyMarkup = function (markup) {
  // quick n dirty

  const tag = "color:rgb(128,0,128)";
  const attr = "color:rgb(144,64,0)";
  const str = "color:rgb(0,0,192)";
  const obj = "color:rgb(0,70,156)";
  const txt = "color:inherit";

  let quoted = false;
  let nested = 0;

  const args = [];
  markup = markup.replace(
    /(\\[<={}> "'])|(=>|[<={}> "'])/g,
    function (_, escape, char) {
      if (escape != null ? escape.length : undefined) {
        return escape;
      }
      if (quoted && !['"', "'"].includes(char)) {
        return char;
      }
      if (nested && !['"', "'", "{", "}"].includes(char)) {
        return char;
      }

      return (() => {
        switch (char) {
          case "<":
            args.push(tag);
            return "%c<";
          case ">":
            args.push(tag);
            args.push(txt);
            return "%c>%c";
          case " ":
            args.push(attr);
            return " %c";
          case "=":
          case "=>":
            args.push(tag);
            return `%c${char}`;
          case '"':
          case "'":
            quoted = !quoted;
            if (quoted) {
              args.push(nested ? attr : str);
              return `${char}%c`;
            } else {
              args.push(nested ? obj : tag);
              return `%c${char}`;
            }
          case "{":
            if (nested++ === 0) {
              args.push(obj);
              return `%c${char}`;
            } else {
              return char;
            }
          case "}":
            if (--nested === 0) {
              args.push(tag);
              return `${char}%c`;
            } else {
              return char;
            }
          default:
            return char;
        }
      })();
    }
  );

  return [markup].concat(args);
};

const prettyJSXProp = (k, v) => prettyJSXPair(k, v, "=");
const prettyJSXBind = (k, v) => prettyJSXPair(k, v, "=>");

var prettyJSXPair = (function () {
  const formatNumber = prettyNumber({ compact: false });

  return function (k, v, op) {
    const key = function (k) {
      if (k === "" + +k || k.match(/^[A-Za-z_][A-Za-z0-9]*$/)) {
        return k;
      } else {
        return JSON.stringify(k);
      }
    };
    const wrap = function (v) {
      if (v.match('\n*"')) {
        return v;
      } else {
        return `{${v}}`;
      }
    };
    var value = function (v) {
      if (v instanceof Array) {
        return `[${v.map(value).join(", ")}]`;
      }

      switch (typeof v) {
        case "string":
          if (v.match("\n")) {
            return `"\n${v}"\n`;
          } else {
            return `"${v}"`;
          }
        case "function":
          v = `${v}`;
          if (v.match("\n")) {
            `\n${v}\n`;
          } else {
            `${v}`;
          }
          v = v.replace(/^function (\([^)]+\))/, "$1 =>");
          return (v = v.replace(
            /^(\([^)]+\)) =>\s*{\s*return\s*([^}]+)\s*;\s*}/,
            "$1 => $2"
          ));
        case "number":
          return formatNumber(v);
        default:
          if (v != null && v !== !!v) {
            if (v._up != null) {
              return value(v.map((v) => v));
            }
            if (v.toMarkup) {
              return v.toString();
            } else {
              return (
                "{" +
                (() => {
                  const result = [];
                  for (let kk in v) {
                    const vv = v[kk];
                    if (Object.prototype.hasOwnProperty.call(v, kk)) {
                      result.push(`${key(kk)}: ${value(vv)}`);
                    }
                  }
                  return result;
                })().join(", ") +
                "}"
              );
            }
          } else {
            return `${JSON.stringify(v)}`;
          }
      }
    };

    return [k, op, wrap(value(v))].join("");
  };
})();

const escapeHTML = function (str) {
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/</g, "&lt;");
  return (str = str.replace(/"/g, "&quot;"));
};

const prettyFormat = function (str) {
  const args = [].slice.call(arguments);
  args.shift();

  let out = "<span>";

  str = escapeHTML(str);

  for (let arg of Array.from(args)) {
    str = str.replace(/%([a-z])/, function (_, f) {
      const v = args.shift();
      switch (f) {
        case "c":
          return `</span><span style="${escapeHTML(v)}">`;
        default:
          return escapeHTML(v);
      }
    });
  }

  out += str;
  return (out += "</span>");
};

export const JSX = { prop: prettyJSXProp, bind: prettyJSXBind };

export {
  prettyMarkup as markup,
  prettyNumber as number,
  prettyPrint as print,
  prettyFormat as format,
};

/*
for x in [1, 2, 1/2, 3, 1/3, Math.PI, Math.PI / 2, Math.PI * 2, Math.PI * 3, Math.PI * 4, Math.PI * 3 / 4, Math.E * 100, Math.E / 100]
  console.log prettyNumber({})(x)
*/
