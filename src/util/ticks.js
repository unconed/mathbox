// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
 Generate equally spaced ticks in a range at sensible positions.

 @param min/max - Minimum and maximum of range
 @param n - Desired number of ticks in range
 @param unit - Base unit of scale (e.g. 1 or π).
 @param scale - Division scale (e.g. 2 = binary division, or 10 = decimal division).
 @param bias - Integer to bias divisions one or more levels up or down (to create nested scales)
 @param start - Whether to include a tick at the start
 @param end - Whether to include a tick at the end
 @param zero - Whether to include zero as a tick
 @param nice - Whether to round to a more reasonable interval
*/

export const linear = function (
  min,
  max,
  n,
  unit,
  base,
  factor,
  start,
  end,
  zero,
  nice
) {
  let ticks;
  let i, f;
  if (nice == null) {
    nice = true;
  }
  if (!n) {
    n = 10;
  }
  if (!unit) {
    unit = 1;
  }
  if (!base) {
    base = 10;
  }
  if (!factor) {
    factor = 1;
  }

  // Calculate naive tick size.
  const span = max - min;
  const ideal = span / n;

  // Unsnapped division
  if (!nice) {
    ticks = (() => {
      let asc, end1;
      const result = [];
      for (
        i = 0, end1 = n, asc = 0 <= end1;
        asc ? i <= end1 : i >= end1;
        asc ? i++ : i--
      ) {
        result.push(min + i * ideal);
      }
      return result;
    })();
    if (!start) {
      ticks.shift();
    }
    if (!end) {
      ticks.pop();
    }
    if (!zero) {
      ticks = ticks.filter((x) => x !== 0);
    }
    return ticks;
  }

  // Round to the floor'd power of 'scale'
  if (!unit) {
    unit = 1;
  }
  if (!base) {
    base = 10;
  }
  const ref =
    unit * Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base)));

  // Make derived steps at sensible factors.
  const factors =
    base % 2 === 0
      ? [base / 2, 1, 1 / 2]
      : base % 3 === 0
      ? [base / 3, 1, 1 / 3]
      : [1];
  const steps = (() => {
    const result1 = [];
    for (f of Array.from(factors)) {
      result1.push(ref * f);
    }
    return result1;
  })();

  // Find step size closest to ideal.
  let distance = Infinity;
  let step = steps.reduce(function (ref, step) {
    f = step / ideal;
    const d = Math.max(f, 1 / f);

    if (d < distance) {
      distance = d;
      return step;
    } else {
      return ref;
    }
  }, ref);

  // Scale final step
  step *= factor;

  // Renormalize min/max onto aligned steps.
  min = Math.ceil(min / step + +!start) * step;
  max = (Math.floor(max / step) - +!end) * step;
  n = Math.ceil((max - min) / step);

  // Generate equally spaced ticks
  ticks = (() => {
    let asc1, end2;
    const result2 = [];
    for (
      i = 0, end2 = n, asc1 = 0 <= end2;
      asc1 ? i <= end2 : i >= end2;
      asc1 ? i++ : i--
    ) {
      result2.push(min + i * step);
    }
    return result2;
  })();
  if (!zero) {
    ticks = ticks.filter((x) => x !== 0);
  }
  return ticks;
};

/*
 Generate logarithmically spaced ticks in a range at sensible positions.
*/

export const log = function (
  _min,
  _max,
  _n,
  _unit,
  _base,
  _bias,
  _start,
  _end,
  _zero,
  _nice
) {
  throw new Error("Log ticks not yet implemented.");
};

const LINEAR = 0;
const LOG = 1;

export const make = function (
  type,
  min,
  max,
  n,
  unit,
  base,
  bias,
  start,
  end,
  zero,
  nice
) {
  switch (type) {
    case LINEAR:
      return linear(min, max, n, unit, base, bias, start, end, zero, nice);
    case LOG:
      return log(min, max, n, unit, base, bias, start, end, zero, nice);
  }
};
