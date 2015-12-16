Traits =
  node:
    id:                ["Unique ID", "nullable string", "null", '"sampler"']
    classes:           ["Custom classes", "string array", "[]", '["big"]']

  entity:
    active:            ["Updates continuously", "bool", "true"]

  object:
    visible:           ["Visibility for rendering", "bool", "true"]

  unit:
    scale:             ["(Vertical) Reference scale of viewport in pixels", "nullable number", "null", 720]
    fov:               ["(Vertical) Field-of-view to calibrate units for (degrees)", "nullable number", "null", 60]
    focus:             ["Camera focus distance in world units", "nullable number", 1]

  span:
    range:             ["Range on axis", "vec2", "[-1, 1]"]
  view:
    range:             ["4D range in view", "array vec2", "[[-1, 1], [-1, 1], [-1, 1], [-1, 1]]"]
  view3:
    position:          ["3D Position", "vec3", "[0, 0, 0]"]
    quaternion:        ["3D Quaternion", "quat", "[0, 0, 0, 1]"]
    rotation:          ["3D Euler rotation", "vec3", "[0, 0, 0]"]
    scale:             ["3D Scale", "vec3", "[1, 1, 1]"]
    eulerOrder:        ["Euler order", "swizzle", "xyz"]
  view4:
    position:          ["4D Position", "vec4", "[0, 0, 0, 0]"]
    scale:             ["4D Scale", "vec4", "[1, 1, 1, 1]"]

  layer:
    depth:             ["3D Depth", "number", "1"]
    fit:               ["Fit to (contain, cover, x, y)", "fit", "y"]

  vertex:
    pass:              ["Vertex pass (data, view, world, eye)", "vertexPass", '"view"']
  fragment:
    pass:              ["Fragment pass (color, light, rgba)", "fragmentPass", '"light"']
    gamma:             ["Pass RGBA values in sRGB instead of linear RGB", "boolean", "false"]

  transform3:
    position:          ["3D Position", "vec3", "[0, 0, 0]"]
    quaternion:        ["3D Quaternion", "quat", "[0, 0, 0, 1]"]
    rotation:          ["3D Euler rotation", "vec3", "[0, 0, 0]"]
    scale:             ["3D Scale", "vec3", "[1, 1, 1]"]
    eulerOrder:        ["3D Euler order", "swizzle", "xyz"]
    matrix:            ["3D Projective Matrix", "mat4", "[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]"]
  transform4:
    position:          ["4D Position", "vec4", "[0, 0, 0, 0]"]
    scale:             ["4D Scale", "vec4", "[1, 1, 1, 1]"]
    matrix:            ["4D Affine Matrix", "mat4", "[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]"]
  camera:
    proxy:             ["Re-use existing camera", "bool", "false"]
    position:          ["3D Position", "nullable vec3", "null", "[1, 2, 3]"]
    quaternion:        ["3D Quaternion", "nullable quat", "null", "[0.707, 0, 0, 0.707]"]
    rotation:          ["3D Euler rotation", "nullable vec3", "null", "[π/2, 0, 0]"]
    lookAt:            ["3D Look at", "nullable vec3", "null", "[2, 3, 4]"]
    up:                ["3D Up", "nullable vec3", "null", "[0, 1, 0]"]
    eulerOrder:        ["3D Euler order", "swizzle", '"xyz"']
    fov:               ["Field-of-view (degrees)", "nullable number", "null", "60"]

  polar:
    bend:              ["Amount of polar bend", "number", "1"]
    helix:             ["Expand into helix", "number", "0"]
  spherical:
    bend:              ["Amount of spherical bend", "number", "1"]
  stereographic:
    bend:              ["Amount of stereographic bend", "number", "1"]

  interval:
    axis:              ["Axis", "axis", "1"]
  area:
    axes:              ["Axis pair", "swizzle(2) axis", "[1, 2]"]
  volume:
    axes:              ["Axis triplet", "swizzle(3) axis", "[1, 2, 3]"]

  origin:
    origin:            ["4D Origin", "vec4", "[0, 0, 0, 0]"]
  scale:
    divide:            ["Number of divisions", "number", "10"]
    unit:              ["Reference unit", "number", "1"]
    base:              ["Power base for sub/super units", "number", "10"]
    mode:              ["Scale type", "scale", '"linear"']
    start:             ["Include start", "bool", 'true']
    end:               ["Include end", "bool", 'true']
    zero:              ["Include zero", "bool", 'true']
    factor:            ["Scale factor", "positive number", '1']
    nice:              ["Snap to nice numbers", "bool", 'true']
  grid:
    lineX:             ["Draw X lines", "bool", 'true']
    lineY:             ["Draw Y lines", "bool", 'true']
    crossed:           ["UVWO map on matching axes", "bool", 'true']
    closedX:           ["Close X lines", "bool", 'false']
    closedY:           ["Close Y lines", "bool", 'false']
  axis:
    detail:            ["Geometric detail", "number", 1]
    crossed:           ["UVWO map on matching axis", "bool", 'true']

  data:
    data:              ["Data array", "nullable object", null]
    expr:              ["Data emitter expression", "nullable emitter", null]
    live:              ["Update continuously", "bool", true]
  buffer:
    channels:          ["Number of channels", "number", 4]
    items:             ["Number of items", "number", 4]
    fps:               ["Frames-per-second update rate", "nullable number", "null", 60]
    hurry:             ["Maximum frames to hurry per frame", "number", 5]
    limit:             ["Maximum frames to track", "number", 60]
    realtime:          ["Run on real time, not clock time", "bool", false]
    observe:           ["Pass clock time to data", "bool", false]
    aligned:           ["Use (fast) integer lookups", "bool", false]
  sampler:
    centered:          ["Centered instead of corner sampling", "bool", "false"]
    padding:           ["Number of samples padding", "number", "0"]
  array:
    width:             ["Array width", "nullable number", "1"]
    bufferWidth:       ["Array buffer width", "number", "1"]
    history:           ["Array history", "number", "1"]
  matrix:
    width:             ["Matrix width", "nullable number", "1"]
    height:            ["Matrix height", "nullable number", "1"]
    history:           ["Matrix history", "number", "1"]
    bufferWidth:       ["Matrix buffer width", "number", "1"]
    bufferHeight:      ["Matrix buffer height", "number", "1"]
  voxel:
    width:             ["Voxel width", "nullable number", "1"]
    height:            ["Voxel height", "nullable number", "1"]
    depth:             ["Voxel depth", "nullable number", "1"]
    bufferWidth:       ["Voxel buffer width", "number", "1"]
    bufferHeight:      ["Voxel buffer height", "number", "1"]
    bufferDepth:       ["Voxel buffer depth", "number", "1"]

  style:
    opacity:           ["Opacity", "positive number", "1"]
    color:             ["Color", "color", '"rgb(128, 128, 128)"']
    blending:          ["Blending mode ('no, normal, add, subtract, multiply)", "blending", '"normal"']
    zWrite:            ["Write Z buffer", "bool", true]
    zTest:             ["Test Z buffer", "bool", true]
    zIndex:            ["Z-Index (2D stacking)", "positive int", "0"]
    zBias:             ["Z-Bias (3D stacking)", "positive number", "0"]
    zOrder:            ["Z-Order (drawing order)", "nullable number", "null", "2"]

  geometry:
    points:            ["Points data source", "select", "<"]
    colors:            ["Colors data source", "nullable select", "null", '"#colors"']

  point:
    size:              ["Point size", "positive number", 4]
    sizes:             ["Point sizes data source", "nullable select", "null", '"#sizes"']
    shape:             ["Point shape (circle, square, diamond, up, down, left, right)", "shape", '"circle"']
    optical:           ["Optical or exact sizing", "bool", true]
    fill:              ["Fill shape", "bool", true]
    depth:             ["Depth scaling", "number", 1]
  line:
    size:              ["Line width", "positive number", 2]
    stroke:            ["Line stroke (solid, dotted, dashed)", "stroke", '"solid"']
    depth:             ["Depth scaling", "number", 1]
    proximity:         ["Proximity threshold", "nullable number", "null", "10"]
    closed:            ["Close line", "bool", false]
  mesh:
    fill:              ["Fill mesh", "bool", true]
    shaded:            ["Shade mesh", "bool", false]
    map:               ["Texture map source", "nullable select", "null", '"#map"']
    lineBias:          ["Z-Bias for lines on fill", "number", 5]
  strip:
    line:              ["Draw line", "bool", false]
  face:
    line:              ["Draw line", "bool", false]
  arrow:
    size:              ["Arrow size", "number", 3]
    start:             ["Draw start arrow", "bool", true]
    end:               ["Draw end arrow", "bool", true]
  ticks:
    normal:            ["Normal for reference plane", "bool", true]
    size:              ["Tick size", "number", 10]
    epsilon:           ["Tick epsilon", "number", 0.0001]
  attach:
    offset:            ["2D offset", "vec2", "[0, -20]"]
    snap:              ["Snap to pixel", "bool", false]
    depth:             ["Depth scaling", "number", 0]

  format:
    digits:            ["Digits of precision", 'nullable positive number', "null", 2]
    data:              ["Array of labels", 'nullable array', "null", '["Grumpy", "Sleepy", "Sneezy"]']
    expr:              ["Label formatter expression", 'nullable function', null]
    live:              ["Update continuously", "bool", true]
  font:
    font:              ["Font family", "font", '"sans-serif"']
    style:             ["Font style", "string", '""', '"italic"']
    variant:           ["Font variant", "string", '""', '"small-caps"']
    weight:            ["Font weight", "string", '""', '"bold"']
    detail:            ["Font detail", "number", "24"]
    sdf:               ["Signed distance field range", "number", "5"]
  label:
    text:              ["Text source", "select", '"<"']
    size:              ["Text size", "number", "16"]
    outline:           ["Outline size", "number", "2"]
    expand:            ["Expand glyphs", "number", "0"]
    background:        ["Outline background", "color", '"rgb(255, 255, 255)"']

  overlay:
    opacity:           ["Opacity", "positive number", 1]
    zIndex:            ["Z-Index (2D stacking)", "positive int", "0"]
  dom:
    points:            ["Points data source", "select", '"<"']
    html:              ["HTML data source", "select", '"<"']
    size:              ["Text size", "number", "16"]
    outline:           ["Outline size", "number", "2"]
    zoom:              ["HTML zoom", "number", "1"]
    color:             ["Color", "color", '"rgb(255, 255, 255)"']
    attributes:        ["HTML attributes", "nullable object", "null", '{"style": {"color": "red"}}']
    pointerEvents:     ["Allow pointer events", "bool", false]

  texture:
    minFilter:         ["Texture minification filtering", "filter", '"nearest"']
    magFilter:         ["Texture magnification filtering", "filter", '"nearest"']
    type:              ["Texture data type", "type", '"float"']

  shader:
    sources:           ["Sampler sources", "nullable select", "null", '["#pressure", "#divergence"]']
    language:          ["Shader language", "string", '"glsl"']
    code:              ["Shader code", "string", '""']
    uniforms:          ["Shader uniform objects (three.js style)", "nullable object", "null", "{ time: { type: 'f', value: 3 }}"]
  include:
    shader:            ["Shader to use", "select", '"<"']

  operator:
    source:            ["Input source", "select", '"<"']
  spread:
    unit:              ["Spread per item (absolute) or array (relative)", "mapping", '"relative"']
    items:             ["Items offset", "nullable vec4", "null", "[1.5, 0, 0, 0]"]
    width:             ["Width offset", "nullable vec4", "null", "[1.5, 0, 0, 0]"]
    height:            ["Height offset", "nullable vec4", "null", "[1.5, 0, 0, 0]"]
    depth:             ["Depth offset", "nullable vec4", "null", "[1.5, 0, 0, 0]"]
    alignItems:        ["Items alignment", "anchor", 0]
    alignWidth:        ["Width alignment", "anchor", 0]
    alignHeight:       ["Height alignment", "anchor", 0]
    alignDepth:        ["Depth alignment", "anchor", 0]
  grow:
    scale:             ["Scale factor", "number", 1]
    items:             ["Items alignment", "nullable anchor", "null", 0]
    width:             ["Width alignment", "nullable anchor", "null", 0]
    height:            ["Height alignment", "nullable anchor", "null", 0]
    depth:             ["Depth alignment", "nullable anchor", "null", 0]
  split:
    order:             ["Axis order", "transpose", '"wxyz"']
    axis:              ["Axis to split", "nullable axis", "null", "x"]
    length:            ["Tuple length", "number", 1]
    overlap:           ["Tuple overlap", "number", 1]
  join:
    order:             ["Axis order", "transpose", '"wxyz"']
    axis:              ["Axis to join", "nullable axis", "null", "x"]
    overlap:           ["Tuple overlap", "number", 1]
  swizzle:
    order:             ["Swizzle order", "swizzle", "xyzw"]
  transpose:
    order:             ["Transpose order", "transpose", "xyzw"]
  repeat:
    items:             ["Repeat items",  "number", "1"]
    width:             ["Repeat width",  "number", "1"]
    height:            ["Repeat height", "number", "1"]
    depth:             ["Repeat depth",  "number", "1"]
  slice:
    items:             ["Slice from, to items (excluding to)",  "nullable vec2", "null", "[2, 4]"]
    width:             ["Slice from, to width (excluding to)",  "nullable vec2", "null", "[2, 4]"]
    height:            ["Slice from, to height (excluding to)", "nullable vec2", "null", "[2, 4]"]
    depth:             ["Slice from, to depth (excluding to)",  "nullable vec2", "null", "[2, 4]"]
  lerp:
    size:              ["Scaling mode (relative, absolute)", "mapping", '"absolute"']
    items:             ["Lerp to items",  "nullable number", "null", "5"]
    width:             ["Lerp to width",  "nullable number", "null", "5"]
    height:            ["Lerp to height", "nullable number", "null", "5"]
    depth:             ["Lerp to depth",  "nullable number", "null", "5"]
  subdivide:
    items:             ["Divisions of items",  "nullable positive int", "null", "5"]
    width:             ["Divisions of width",  "nullable positive int", "null", "5"]
    height:            ["Divisions of height", "nullable positive int", "null", "5"]
    depth:             ["Divisions of depth",  "nullable positive int", "null", "5"]
    bevel:             ["Fraction to end outward from vertices", "number", "1"]
    lerp:              ["Interpolate values with computed indices", "boolean", "true"]
  resample:
    indices:           ["Resample indices", "number", 4]
    channels:          ["Resample channels", "number", 4]
    sample:            ["Source sampling (relative, absolute)", "mapping", '"relative"']
    size:              ["Scaling mode (relative, absolute)", "mapping", '"absolute"']
    items:             ["Resample factor items",  "nullable number", "null", "10"]
    width:             ["Resample factor width",  "nullable number", "null", "10"]
    height:            ["Resample factor height", "nullable number", "null", "10"]
    depth:             ["Resample factor depth",  "nullable number", "null", "10"]
  readback:
    type:              ["Readback data type (float, unsignedByte)", "float", '"float"']
    expr:              ["Readback consume expression", "nullable function", "null"]
    data:              ["Readback data buffer (read only)", "data", "[]"]
    channels:          ["Readback channels (read only)", "number", "4"]
    items:             ["Readback items (read only)", "nullable number", "1"]
    width:             ["Readback width (read only)", "nullable number", "1"]
    height:            ["Readback height (read only)", "nullable number", "1"]
    depth:             ["Readback depth (read only)", "nullable number", "1"]
  root:
    speed:             ["Global speed", "number", 1]
    camera:            ["Active camera", "select", '"[camera]"']
  inherit:
    source:            ["Inherit from node", "select", '"<"']
    traits:            ["Inherit traits", "string array", "[]"]

  rtt:
    width:             ["RTT width", 'nullable number', "null", "640"]
    height:            ["RTT height", 'nullable number', "null", "360"]
    history:           ["RTT history", 'number', 1]
  compose:
    alpha:             ["Compose with alpha transparency", 'bool', false]

  present:
    index:             ["Present slide number", 'number', "1"]
    length:            ["Presentation length (computed)", 'number', "0"]
    directed:          ["Apply directional transitions", 'bool', "true"]
  slide:
    order:             ["Slide order", 'nullable number', 0]
    steps:             ["Slide steps", 'number', 1]
    early:             ["Appear early steps", 'number', 0]
    late:              ["Stay late steps", 'number', 0]
    from:              ["Appear from step", 'nullable number',  "null", "2"]
    to:                ["Disappear on step", 'nullable number', "null", "4"]

  transition:
    stagger:           ["Stagger dimensions", 'vec4', "[0, 0, 0, 0]", "[2, 1, 0, 0]"]
    enter:             ["Enter state", 'nullable number', "null", "0.5"]
    exit:              ["Exit state", 'nullable number', "null", "0.5"]
    delay:             ["Transition delay", 'number', "0"]
    delayEnter:        ["Transition enter delay", 'nullable number', "null", "0.3"]
    delayExit:         ["Transition exit delay", 'nullable number', "null", "0.3"]
    duration:          ["Transition duration", 'number', "0.3"]
    durationEnter:     ["Transition enter duration", 'number', "0.3"]
    durationExit:      ["Transition exit duration", 'number', "0.3"]
  move:
    from:              ["Enter from", 'vec4', "[0, 0, 0, 0]"]
    to:                ["Exit to", 'vec4', "[0, 0, 0, 0]"]

  seek:
    seek:              ["Seek to time", 'nullable number', "null", "4"]
  track:
    target:            ["Animation target", 'select', '"<"']
    script:            ["Animation script", 'object', "{}", '{ "0": { props: { color: "red" }, expr: { size: function (t) { return Math.sin(t) + 1; }}}, "1": ...}']
    ease:              ["Animation ease (linear, cosine, binary, hold)", 'ease', '"cosine"']
  trigger:
    trigger:           ["Trigger on step", 'nullable number', 1]
  step:
    playback:          ["Playhead ease (linear, cosine, binary, hold)", 'ease', '"linear"']
    stops:             ["Playhead stops", 'nullable number array', "null", "[0, 1, 3, 5]"]
    delay:             ["Step delay", "number", "0"]
    duration:          ["Step duration", "number", "0.3"]
    pace:              ["Step pace", "number", "0"]
    speed:             ["Step speed", "number", "1"]
    rewind:            ["Step rewind factor", "number", "2"]
    skip:              ["Speed up through skips", "bool", true]
    realtime:          ["Run on real time, not clock time", "bool", false]
  play:
    delay:             ["Play delay", 'number', '0']
    pace:              ["Play pace", 'number', '1']
    speed:             ["Play speed", 'number', '1']
    from:              ["Play from", 'number', '0']
    to:                ["Play until", 'number', 'Infinity']
    realtime:          ["Run on real time, not clock time", "bool", false]
    loop:              ["Loop", "bool", false]
  now:
    now:               ["Current moment", "nullable timestamp", "null", 1444094929.619]
    seek:              ["Seek to time", 'nullable number', null]
    pace:              ["Time pace", 'number', 1]
    speed:             ["Time speed", 'number', 1]

module.exports = Traits