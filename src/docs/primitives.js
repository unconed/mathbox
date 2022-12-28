export default {
  axis: ["draw", "Draw an axis", {}, { end: "true", zBias: "-1" }],
  face: ["draw", "Draw polygon faces"],
  grid: ["draw", "Draw a 2D line grid", {}, { width: "1", zBias: "-2" }],
  line: ["draw", "Draw lines"],
  point: ["draw", "Draw points"],
  strip: ["draw", "Draw triangle strips"],
  surface: ["draw", "Draw surfaces", {}, { lineX: "false", lineY: "false" }],
  ticks: ["draw", "Draw ticks"],
  vector: ["draw", "Draw vectors"],

  view: ["view", "Adjust view range"],
  cartesian: ["view", "Apply cartesian view"],
  cartesian4: ["view", "Apply 4D cartesian view"],
  polar: ["view", "Apply polar view"],
  spherical: ["view", "Apply spherical view"],
  stereographic: ["view", "Apply stereographic projection"],
  stereographic4: ["view", "Apply 4D stereographic projection"],

  transform: ["transform", "Transform geometry in 3D"],
  transform4: ["transform", "Transform geometry in 4D"],
  vertex: ["transform", "Apply custom vertex shader pass"],
  fragment: ["transform", "Apply custom fragment shader pass"],
  layer: ["transform", "Independent 2D layer/overlay"],
  mask: ["transform", "Apply custom mask pass"],

  array: [
    "data",
    "1D array",
    { expr: "function (emit, i, time, delta) { ... }" },
  ],
  interval: [
    "data",
    "1D sampled array",
    { expr: "function (emit, x, i, time, delta) { ... }" },
  ],
  matrix: [
    "data",
    "2D matrix",
    { expr: "function (emit, i, j, time, delta) { ... }" },
  ],
  area: [
    "data",
    "2D sampled matrix",
    { expr: "function (emit, x, y, i, j, time, delta) { ... }" },
  ],
  voxel: [
    "data",
    "3D voxels",
    { expr: "function (emit, i, j, k, time, delta) { ... }" },
  ],
  volume: [
    "data",
    "3D sampled voxels",
    { expr: "function (emit, x, y, z, i, j, k, time, delta) { ... }" },
  ],
  scale: ["data", "Human-friendly divisions on an axis, subdivided as needed"],
  latch: ["data", "Control expr/data updates when conditions change"],

  html: ["overlay", "HTML element source"],
  dom: ["overlay", "HTML DOM injector"],

  text: [
    "text",
    "GL text source",
    {},
    { minFilter: '"linear"', magFilter: '"linear"' },
  ],
  format: [
    "text",
    "Text formatter",
    { expr: "function (x, y, z, w, i, j, k, l, time, delta) { ... }" },
    { minFilter: '"linear"', magFilter: '"linear"' },
  ],
  retext: ["text", "Text atlas resampler"],
  label: ["text", "Draw GL labels"],

  clamp: ["operator", "Clamp out-of-bounds samples to the nearest data point"],
  grow: ["operator", "Scale data relative to reference data point"],
  join: [
    "operator",
    "Join two array dimensions into one by concatenating rows/columns/stacks",
  ],
  lerp: ["operator", "Linear interpolation of data"],
  memo: ["operator", "Memoize data to an array/texture"],
  readback: [
    "operator",
    "Read data back to a binary JavaScript array",
    { expr: "function (x, y, z, w, i, j, k, l) { ... }" },
  ],
  resample: ["operator", "Resample data to new dimensions with a shader"],
  repeat: ["operator", "Repeat data in one or more dimensions"],
  reverse: ["operator", "Reverse data in one or more dimensions"],
  swizzle: ["operator", "Swizzle data values"],
  spread: ["operator", "Spread data values according to array indices"],
  split: [
    "operator",
    "Split one array dimension into two by splitting rows/columns/etc",
  ],
  slice: ["operator", "Select one or more rows/columns/stacks"],
  subdivide: ["operator", "Subdivide data points evenly or with a bevel"],
  transpose: ["operator", "Transpose array dimensions"],

  group: ["base", "Group elements for visibility and activity"],
  inherit: ["base", "Inherit and inject a trait from another element"],
  root: ["base", "Tree root"],
  unit: ["base", "Change unit sizing for drawing ops"],

  shader: ["shader", "Custom shader snippet"],

  camera: ["camera", "Camera instance or proxy"],

  rtt: [
    "rtt",
    "Render objects to a texture",
    {},
    { minFilter: '"linear"', magFilter: '"linear"', type: '"unsignedByte"' },
  ],
  compose: [
    "rtt",
    "Full-screen render pass",
    {},
    { zWrite: "false", zTest: "false", color: '"white"' },
  ],

  clock: ["time", "Relative clock that starts from zero."],
  now: ["time", "Absolute UNIX time in seconds since 01/01/1970"],

  move: ["present", "Move elements in/out on transition"],
  play: ["present", "Play a sequenced animation"],
  present: ["present", "Present a tree of slides"],
  reveal: ["present", "Reveal/hide elements on transition"],
  slide: ["present", "Presentation slide"],
  step: ["present", "Step through a sequenced animation"],
};
