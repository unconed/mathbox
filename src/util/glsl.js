// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const letters = "xyzw".split("");

const index = {
  0: -1,
  x: 0,
  y: 1,
  z: 2,
  w: 3,
};

const parseOrder = function (order) {
  if (order === "" + order) {
    order = order.split("");
  }
  if (order === +order) {
    order = [order];
  }
  return order;
};

export const toType = function (type) {
  if (type === +type) {
    type = "vec" + type;
  }
  if (type === "vec1") {
    type = "float";
  }
  return type;
};

const toFloatString = function (value) {
  value = "" + value;
  if (value.indexOf(".") < 0) {
    return (value += ".0");
  }
};

// Helper for float to byte conversion on the w axis, for readback
export const mapByte2FloatOffset = function (stretch) {
  if (stretch == null) {
    stretch = 4;
  }
  const factor = toFloatString(stretch);
  return `\
vec4 float2ByteIndex(vec4 xyzw, out float channelIndex) {
  float relative = xyzw.w / ${factor};
  float w = floor(relative);
  channelIndex = (relative - w) * ${factor};
  return vec4(xyzw.xyz, w);
}\
`;
};

// Sample data texture array
export const sample2DArray = function (textures) {
  const divide = function (a, b) {
    let out;
    if (a === b) {
      out = `\
return texture2D(dataTextures[${a}], uv);\
`;
    } else {
      const mid = Math.ceil(a + (b - a) / 2);
      out = `\
if (z < ${mid - 0.5}) {
  ${divide(a, mid - 1)}
}
else {
  ${divide(mid, b)}
}\
`;
    }
    return (out = out.replace(/\n/g, "\n  "));
  };

  const body = divide(0, textures - 1);

  return `\
uniform sampler2D dataTextures[${textures}];

vec4 sample2DArray(vec2 uv, float z) {
  ${body}
}\
`;
};

// Binary operator
export const binaryOperator = function (type, op, curry) {
  type = toType(type);
  if (curry != null) {
    return `\
${type} binaryOperator(${type} a) {
  return a ${op} ${curry};
}\
`;
  } else {
    return `\
${type} binaryOperator(${type} a, ${type} b) {
  return a ${op} b;
}\
`;
  }
};

// Extend to n-vector with zeroes
export const extendVec = function (from, to, value) {
  if (value == null) {
    value = 0;
  }
  if (from > to) {
    return truncateVec(from, to);
  }

  const diff = to - from;

  from = toType(from);
  to = toType(to);

  value = toFloatString(value);

  const parts = __range__(0, diff, true).map(function (x) {
    if (x) {
      return value;
    } else {
      return "v";
    }
  });
  const ctor = parts.join(",");

  return `\
${to} extendVec(${from} v) { return ${to}(${ctor}); }\
`;
};

// Truncate n-vector
export const truncateVec = function (from, to) {
  if (from < to) {
    return extendVec(from, to);
  }

  const swizzle = "." + "xyzw".substr(0, to);

  from = toType(from);
  to = toType(to);

  return `\
${to} truncateVec(${from} v) { return v${swizzle}; }\
`;
};

// Inject float into 4-component vector
export const injectVec4 = function (order) {
  const swizzler = ["0.0", "0.0", "0.0", "0.0"];

  order = parseOrder(order);
  order = order.map(function (v) {
    if (v === "" + v) {
      return index[v];
    } else {
      return v;
    }
  });

  for (let i = 0; i < order.length; i++) {
    const channel = order[i];
    swizzler[channel] = ["a", "b", "c", "d"][i];
  }

  const mask = swizzler.slice(0, 4).join(", ");

  const args = ["float a", "float b", "float c", "float d"].slice(
    0,
    order.length
  );

  return `\
vec4 inject(${args}) {
  return vec4(${mask});
}\
`;
};

// Apply 4-component vector swizzle
export const swizzleVec4 = function (order, size = null) {
  const lookup = ["0.0", "xyzw.x", "xyzw.y", "xyzw.z", "xyzw.w"];

  if (size == null) {
    size = order.length;
  }

  order = parseOrder(order);
  order = order.map(function (v) {
    if (Array.from([0, 1, 2, 3, 4]).includes(+v)) {
      v = +v;
    }
    if (v === "" + v) {
      v = index[v] + 1;
    }
    return lookup[v];
  });

  while (order.length < size) {
    order.push("0.0");
  }
  const mask = order.join(", ");

  return `\
vec${size} swizzle(vec4 xyzw) {
  return vec${size}(${mask});
}\
`.replace(/vec1/g, "float");
};

// Invert full or truncated swizzles for pointer lookups
export const invertSwizzleVec4 = function (order) {
  const swizzler = ["0.0", "0.0", "0.0", "0.0"];

  order = parseOrder(order);
  order = order.map(function (v) {
    if (v === +v) {
      return letters[v - 1];
    } else {
      return v;
    }
  });

  for (let i = 0; i < order.length; i++) {
    const letter = order[i];
    const src = letters[i];
    const j = index[letter];

    swizzler[j] = `xyzw.${src}`;
  }

  const mask = swizzler.join(", ");

  return `\
vec4 invertSwizzle(vec4 xyzw) {
  return vec4(${mask});
}\
`;
};

export const identity = function (type) {
  let args = [].slice.call(arguments);
  if (args.length > 1) {
    args = args.map((t, i) =>
      ["inout", t, String.fromCharCode(97 + i)].join(" ")
    );
    args = args.join(", ");
    return `\
void identity(${args}) { }\
`;
  } else {
    return `\
${type} identity(${type} x) {
  return x;
}\
`;
  }
};

export const constant = (type, value) => `\
${type} constant() {
return ${value};
}\
`;

function __range__(left, right, inclusive) {
  const range = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
