// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

export const getSizes = function (data) {
  const sizes = [];
  let array = data;
  while (
    typeof array !== "string" &&
    (array != null ? array.length : undefined) != null
  ) {
    sizes.push(array.length);
    array = array[0];
  }
  return sizes;
};

export const getDimensions = function (data, spec) {
  let left;
  if (spec == null) {
    spec = {};
  }
  const { items, channels, width, height, depth } = spec;

  const dims = {};

  if (!data || !data.length) {
    return {
      items,
      channels,
      width: width != null ? width : 0,
      height: height != null ? height : 0,
      depth: depth != null ? depth : 0,
    };
  }

  const sizes = getSizes(data);
  const nesting = sizes.length;

  dims.channels = channels !== 1 && sizes.length > 1 ? sizes.pop() : channels;
  dims.items = items !== 1 && sizes.length > 1 ? sizes.pop() : items;
  dims.width = width !== 1 && sizes.length > 1 ? sizes.pop() : width;
  dims.height = height !== 1 && sizes.length > 1 ? sizes.pop() : height;
  dims.depth = depth !== 1 && sizes.length > 1 ? sizes.pop() : depth;

  let levels = nesting;
  if (channels === 1) {
    levels++;
  }
  if (items === 1 && levels > 1) {
    levels++;
  }
  if (width === 1 && levels > 2) {
    levels++;
  }
  if (height === 1 && levels > 3) {
    levels++;
  }

  let n = (left = sizes.pop()) != null ? left : 1;
  if (levels <= 1) {
    n /= dims.channels != null ? dims.channels : 1;
  }
  if (levels <= 2) {
    n /= dims.items != null ? dims.items : 1;
  }
  if (levels <= 3) {
    n /= dims.width != null ? dims.width : 1;
  }
  if (levels <= 4) {
    n /= dims.height != null ? dims.height : 1;
  }
  n = Math.floor(n);

  if (dims.width == null) {
    dims.width = n;
    n = 1;
  }
  if (dims.height == null) {
    dims.height = n;
    n = 1;
  }
  if (dims.depth == null) {
    dims.depth = n;
    n = 1;
  }

  return dims;
};

export const repeatCall = function (call, times) {
  switch (times) {
    case 0:
      return () => true;
    case 1:
      return () => call();
    case 2:
      return function () {
        call();
        return call();
      };
    case 3:
      return function () {
        call();
        call();
        call();
        return call();
      };
    case 4:
      return function () {
        call();
        call();
        call();
        return call();
      };
    case 6:
      return function () {
        call();
        call();
        call();
        call();
        call();
        return call();
      };
    case 8:
      return function () {
        call();
        call();
        call();
        call();
        call();
        return call();
      };
  }
};

export const makeEmitter = function (thunk, items, channels) {
  let outer;
  const inner = (() => {
    switch (channels) {
      case 0:
        return () => true;
      case 1:
        return (emit) => emit(thunk());
      case 2:
        return (emit) => emit(thunk(), thunk());
      case 3:
        return (emit) => emit(thunk(), thunk(), thunk());
      case 4:
        return (emit) => emit(thunk(), thunk(), thunk(), thunk());
      case 6:
        return (emit) =>
          emit(thunk(), thunk(), thunk(), thunk(), thunk(), thunk());
      case 8:
        return (emit) =>
          emit(
            thunk(),
            thunk(),
            thunk(),
            thunk(),
            thunk(),
            thunk(),
            thunk(),
            thunk()
          );
    }
  })();

  let next = null;
  while (items > 0) {
    var n = Math.min(items, 8);
    outer = (() => {
      switch (n) {
        case 1:
          return (emit) => inner(emit);
        case 2:
          return function (emit) {
            inner(emit);
            return inner(emit);
          };
        case 3:
          return function (emit) {
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 4:
          return function (emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 5:
          return function (emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 6:
          return function (emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 7:
          return function (emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 8:
          return function (emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
      }
    })();
    if (next != null) {
      next = ((outer, next) =>
        function (emit) {
          outer(emit);
          return next(emit);
        })(outer, next);
    } else {
      next = outer;
    }
    items -= n;
  }

  outer = next != null ? next : () => true;
  outer.reset = thunk.reset;
  outer.rebind = thunk.rebind;
  return outer;
};

export const getThunk = function (data) {
  let thunk;
  let j, k, l, m;
  let sizes = getSizes(data);
  const nesting = sizes.length;

  let a = sizes.pop();
  let b = sizes.pop();
  let c = sizes.pop();
  const d = sizes.pop();

  switch (nesting) {
    case 0:
      thunk = () => 0;
      thunk.reset = function () {};
      break;

    case 1:
      var i = 0;
      thunk = () => data[i++];
      thunk.reset = () => (i = 0);
      break;

    case 2:
      i = j = 0;
      var first = data[j] != null ? data[j] : [];

      thunk = function () {
        const x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          first = data[j] != null ? data[j] : [];
        }
        return x;
      };

      thunk.reset = function () {
        i = j = 0;
        first = data[j] != null ? data[j] : [];
      };
      break;

    case 3:
      i = j = k = 0;
      var second = data[k] != null ? data[k] : [];
      first = second[j] != null ? second[j] : [];

      thunk = function () {
        const x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          if (j === b) {
            j = 0;
            k++;
            second = data[k] != null ? data[k] : [];
          }
          first = second[j] != null ? second[j] : [];
        }
        return x;
      };

      thunk.reset = function () {
        i = j = k = 0;
        second = data[k] != null ? data[k] : [];
        first = second[j] != null ? second[j] : [];
      };
      break;

    case 4:
      i = j = k = l = 0;
      var third = data[l] != null ? data[l] : [];
      second = third[k] != null ? third[k] : [];
      first = second[j] != null ? second[j] : [];

      thunk = function () {
        const x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          if (j === b) {
            j = 0;
            k++;
            if (k === c) {
              k = 0;
              l++;
              third = data[l] != null ? data[l] : [];
            }
            second = third[k] != null ? third[k] : [];
          }
          first = second[j] != null ? second[j] : [];
        }
        return x;
      };

      thunk.reset = function () {
        i = j = k = l = 0;
        third = data[l] != null ? data[l] : [];
        second = third[k] != null ? third[k] : [];
        first = second[j] != null ? second[j] : [];
      };
      break;

    case 5:
      i = j = k = l = m = 0;
      var fourth = data[m] != null ? data[m] : [];
      third = fourth[l] != null ? fourth[l] : [];
      second = third[k] != null ? third[k] : [];
      first = second[j] != null ? second[j] : [];

      thunk = function () {
        const x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          if (j === b) {
            j = 0;
            k++;
            if (k === c) {
              k = 0;
              l++;
              if (l === d) {
                l = 0;
                m++;
                fourth = data[m] != null ? data[m] : [];
              }
              third = fourth[l] != null ? fourth[l] : [];
            }
            second = third[k] != null ? third[k] : [];
          }
          first = second[j] != null ? second[j] : [];
        }
        return x;
      };

      thunk.reset = function () {
        i = j = k = l = m = 0;
        fourth = data[m] != null ? data[m] : [];
        third = fourth[l] != null ? fourth[l] : [];
        second = third[k] != null ? third[k] : [];
        first = second[j] != null ? second[j] : [];
      };
      break;
  }

  thunk.rebind = function (d) {
    data = d;

    sizes = getSizes(data);
    if (sizes.length) {
      a = sizes.pop();
    }
    if (sizes.length) {
      b = sizes.pop();
    }
    if (sizes.length) {
      c = sizes.pop();
    }
    if (sizes.length) {
      return (d = sizes.pop());
    }
  };

  return thunk;
};

export const getStreamer = function (array, samples, channels, items) {
  let i, j;
  let emit;
  let limit = (i = j = 0);

  const reset = function () {
    limit = samples * channels * items;
    return (i = j = 0);
  };

  const count = () => j;
  const done = () => limit - i <= 0;

  const skip = (() => {
    switch (channels) {
      case 1:
        return function (n) {
          i += n;
          j += n;
        };

      case 2:
        return function (n) {
          i += n * 2;
          j += n;
        };

      case 3:
        return function (n) {
          i += n * 3;
          j += n;
        };

      case 4:
        return function (n) {
          i += n * 4;
          j += n;
        };
    }
  })();

  const consume = (() => {
    switch (channels) {
      case 1:
        return function (emit) {
          emit(array[i++]);
          ++j;
        };

      case 2:
        return function (emit) {
          emit(array[i++], array[i++]);
          ++j;
        };

      case 3:
        return function (emit) {
          emit(array[i++], array[i++], array[i++]);
          ++j;
        };

      case 4:
        return function (emit) {
          emit(array[i++], array[i++], array[i++], array[i++]);
          ++j;
        };
    }
  })();

  emit = (() => {
    switch (channels) {
      case 1:
        return function (x) {
          array[i++] = x;
          ++j;
        };

      case 2:
        return function (x, y) {
          array[i++] = x;
          array[i++] = y;
          ++j;
        };

      case 3:
        return function (x, y, z) {
          array[i++] = x;
          array[i++] = y;
          array[i++] = z;
          ++j;
        };

      case 4:
        return function (x, y, z, w) {
          array[i++] = x;
          array[i++] = y;
          array[i++] = z;
          array[i++] = w;
          ++j;
        };
    }
  })();

  consume.reset = reset;
  emit.reset = reset;

  reset();
  return { emit, consume, skip, count, done, reset };
};

export const getLerpEmitter = function (expr1, expr2) {
  let emitter, lerp2, q, r, s;
  const scratch = new Float32Array(4096);
  let lerp1 = (lerp2 = 0.5);
  let p = (q = r = s = 0);

  const emit1 = function (x, y, z, w) {
    r++;
    scratch[p++] = x * lerp1;
    scratch[p++] = y * lerp1;
    scratch[p++] = z * lerp1;
    return (scratch[p++] = w * lerp1);
  };

  const emit2 = function (x, y, z, w) {
    s++;
    scratch[q++] += x * lerp2;
    scratch[q++] += y * lerp2;
    scratch[q++] += z * lerp2;
    return (scratch[q++] += w * lerp2);
  };

  const args = Math.max(expr1.length, expr2.length);

  if (args <= 3) {
    emitter = function (emit, x, i) {
      p = q = r = s = 0;
      expr1(emit1, x, i);
      expr2(emit2, x, i);
      const n = Math.min(r, s);
      let l = 0;
      return __range__(0, n, false).map((_k) =>
        emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++])
      );
    };
  } else if (args <= 5) {
    emitter = function (emit, x, y, i, j) {
      p = q = r = s = 0;
      expr1(emit1, x, y, i, j);
      expr2(emit2, x, y, i, j);
      const n = Math.min(r, s);
      let l = 0;
      return __range__(0, n, false).map((_k) =>
        emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++])
      );
    };
  } else if (args <= 7) {
    emitter = function (emit, x, y, z, i, j, k) {
      p = q = r = s = 0;
      expr1(emit1, x, y, z, i, j, k);
      expr2(emit2, x, y, z, i, j, k);
      const n = Math.min(r, s);
      let l = 0;
      return (() => {
        let asc, end;
        const result = [];
        for (
          k = 0, end = n, asc = 0 <= end;
          asc ? k < end : k > end;
          asc ? k++ : k--
        ) {
          result.push(
            emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++])
          );
        }
        return result;
      })();
    };
  } else if (args <= 9) {
    emitter = function (emit, x, y, z, w, i, j, k, l) {
      p = q = r = s = 0;
      expr1(emit1, x, y, z, w, i, j, k, l);
      expr2(emit2, x, y, z, w, i, j, k, l);
      const n = Math.min(r, s);
      l = 0;
      return (() => {
        let asc, end;
        const result = [];
        for (
          k = 0, end = n, asc = 0 <= end;
          asc ? k < end : k > end;
          asc ? k++ : k--
        ) {
          result.push(
            emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++])
          );
        }
        return result;
      })();
    };
  } else {
    emitter = function (emit, x, y, z, w, i, j, k, l, d, t) {
      p = q = 0;
      expr1(emit1, x, y, z, w, i, j, k, l, d, t);
      expr2(emit2, x, y, z, w, i, j, k, l, d, t);
      const n = Math.min(r, s);
      l = 0;
      return (() => {
        let asc, end;
        const result = [];
        for (
          k = 0, end = n, asc = 0 <= end;
          asc ? k < end : k > end;
          asc ? k++ : k--
        ) {
          result.push(
            emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++])
          );
        }
        return result;
      })();
    };
  }

  emitter.lerp = function (f) {
    let ref;
    return ([lerp1, lerp2] = Array.from((ref = [1 - f, f]))), ref;
  };

  return emitter;
};

export const getLerpThunk = function (data1, data2) {
  // Get sizes
  const n1 = getSizes(data1).reduce((a, b) => a * b);
  const n2 = getSizes(data2).reduce((a, b) => a * b);
  const n = Math.min(n1, n2);

  // Create data thunks to copy (multi-)array
  const thunk1 = getThunk(data1);
  const thunk2 = getThunk(data2);

  // Create scratch array
  const scratch = new Float32Array(n);

  scratch.lerp = function (f) {
    thunk1.reset();
    thunk2.reset();

    let i = 0;
    return (() => {
      const result = [];
      while (i < n) {
        const a = thunk1();
        const b = thunk2();
        result.push((scratch[i++] = a + (b - a) * f));
      }
      return result;
    })();
  };

  return scratch;
};

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
