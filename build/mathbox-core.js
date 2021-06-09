(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {"arrow.position": "uniform float worldUnit;\nuniform float lineDepth;\nuniform float lineWidth;\nuniform float focusDepth;\n\nuniform vec4 geometryClip;\nuniform float arrowSize;\nuniform float arrowSpace;\n\nattribute vec4 position4;\nattribute vec3 arrow;\nattribute vec2 attach;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvoid getArrowGeometry(vec4 xyzw, float near, float far, out vec3 left, out vec3 right, out vec3 start) {\n  right = getPosition(xyzw, 1.0);\n  left  = getPosition(vec4(near, xyzw.yzw), 0.0);\n  start = getPosition(vec4(far, xyzw.yzw), 0.0);\n}\n\nmat4 getArrowMatrix(vec3 left, vec3 right, vec3 start) {\n\n  float depth = focusDepth;\n  if (lineDepth < 1.0) {\n    // Depth blending\n    float z = max(0.00001, -right.z);\n    depth = mix(z, focusDepth, lineDepth);\n  }\n    \n  vec3 diff = left - right;\n  float l = length(diff);\n  if (l == 0.0) {\n    return mat4(1.0, 0.0, 0.0, 0.0,\n                0.0, 1.0, 0.0, 0.0,\n                0.0, 0.0, 1.0, 0.0,\n                0.0, 0.0, 0.0, 1.0);\n  }\n\n  // Construct TBN matrix around shaft\n  vec3 t = normalize(diff);\n  vec3 n = normalize(cross(t, t.yzx + vec3(.1, .2, .3)));\n  vec3 b = cross(n, t);\n  \n  // Shrink arrows when vector gets too small\n  // Approach linear scaling with cubic ease the smaller we get\n  float size = arrowSize * lineWidth * worldUnit * depth * 1.25;\n  diff = right - start;\n  l = length(diff) * arrowSpace;\n  float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);\n  float scale = 1.0 - mini * mini * mini;\n  float range = size * scale;\n  \n  // Size to 2.5:1 ratio\n  float rangeNB = range / 2.5;\n\n  // Anchor at end position\n  return mat4(vec4(n * rangeNB,  0),\n              vec4(b * rangeNB,  0),\n              vec4(t * range, 0),\n              vec4(right,  1.0));\n}\n\nvec3 getArrowPosition() {\n  vec3 left, right, start;\n  \n  vec4 p = min(geometryClip, position4);\n  \n  getArrowGeometry(p, attach.x, attach.y, left, right, start);\n  mat4 matrix = getArrowMatrix(left, right, start);\n  return (matrix * vec4(arrow.xyz, 1.0)).xyz;\n\n}\n",
"axis.position": "uniform vec4 axisStep;\nuniform vec4 axisPosition;\n\nvec4 getAxisPosition(vec4 xyzw, inout vec4 stpq) {\n  return axisStep * xyzw.x + axisPosition;\n}\n",
"cartesian.position": "uniform mat4 viewMatrix;\n\nvec4 getCartesianPosition(vec4 position, inout vec4 stpq) {\n  return viewMatrix * vec4(position.xyz, 1.0);\n}\n",
"cartesian4.position": "uniform vec4 basisScale;\nuniform vec4 basisOffset;\nuniform vec4 viewScale;\nuniform vec4 viewOffset;\n\nvec4 getCartesian4Position(vec4 position, inout vec4 stpq) {\n  return position * basisScale + basisOffset;\n}\n",
"clamp.position": "uniform vec4 clampLimit;\n\nvec4 getClampXYZW(vec4 xyzw) {\n  return clamp(xyzw, vec4(0.0), clampLimit);\n}\n",
"color.opaque": "vec4 opaqueColor(vec4 color) {\n  return vec4(color.rgb, 1.0);\n}\n",
"face.position": "uniform vec4 geometryClip;\nattribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvec3 getFacePosition() {\n  vec4 p = min(geometryClip, position4);\n  return getPosition(p, 1.0);\n}\n",
"face.position.normal": "attribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvoid getFaceGeometry(vec4 xyzw, out vec3 pos, out vec3 normal) {\n  vec3 a, b, c;\n\n  a   = getPosition(vec4(xyzw.xyz, 0.0), 0.0);\n  b   = getPosition(vec4(xyzw.xyz, 1.0), 0.0);\n  c   = getPosition(vec4(xyzw.xyz, 2.0), 0.0);\n\n  pos = getPosition(xyzw, 1.0);\n  normal = normalize(cross(c - a, b - a));\n}\n\nvec3 getFacePositionNormal() {\n  vec3 center, normal;\n\n  getFaceGeometry(position4, center, normal);\n  vNormal   = normal;\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);\n  vPosition = -center;\n\n  return center;\n}\n",
"float.encode": "/*\nFloat encoding technique by\nCarlos Scheidegger\nhttps://github.com/cscheid/lux/blob/master/src/shade/bits/encode_float.js\n\nConversion to GLSL by:\nhttp://concord-consortium.github.io/lab/experiments/webgl-gpgpu/script.js\n*/\n\nfloat shift_right(float v, float amt) { \n  v = floor(v) + 0.5; \n  return floor(v / exp2(amt)); \n}\n\nfloat shift_left(float v, float amt) { \n  return floor(v * exp2(amt) + 0.5); \n}\n\nfloat mask_last(float v, float bits) { \n  return mod(v, shift_left(1.0, bits)); \n}\n\nfloat extract_bits(float num, float from, float to) { \n  from = floor(from + 0.5); to = floor(to + 0.5); \n  return mask_last(shift_right(num, from), to - from); \n}\n\nvec4 encode_float(float val) { \n  if (val == 0.0) return vec4(0, 0, 0, 0); \n  float valuesign = val > 0.0 ? 0.0 : 1.0; \n  val = abs(val); \n  float exponent = floor(log2(val)); \n  float biased_exponent = exponent + 127.0; \n  float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0; \n  float t = biased_exponent / 2.0; \n  float last_bit_of_biased_exponent = fract(t) * 2.0; \n  float remaining_bits_of_biased_exponent = floor(t); \n  float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0; \n  float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0; \n  float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0; \n  float byte1 = (valuesign * 128.0 + remaining_bits_of_biased_exponent) / 255.0; \n  return vec4(byte4, byte3, byte2, byte1); \n}\n",
"float.index.pack": "uniform vec4 indexModulus;\n\nvec4 getSample(vec4 xyzw);\nvec4 getIndex(vec4 xyzw);\n\nvec4 floatPackIndex(vec4 xyzw) {\n  vec4 value = getSample(xyzw);\n  vec4 index = getIndex(xyzw);\n\n  vec4 offset = floor(index + .5) * indexModulus;\n  vec2 sum2 = offset.xy + offset.zw;\n  float sum = sum2.x + sum2.y;\n  return vec4(value.xyz, sum);\n}",
"float.stretch": "vec4 getSample(vec4 xyzw);\n\nfloat floatStretch(vec4 xyzw, float channelIndex) {\n  vec4 sample = getSample(xyzw);\n  vec2 xy = channelIndex > 1.5 ? sample.zw : sample.xy;\n  return mod(channelIndex, 2.0) > .5 ? xy.y : xy.x;\n}",
"fragment.clip.dashed": "varying float vClipStrokeWidth;\nvarying float vClipStrokeIndex;\nvarying vec3  vClipStrokeEven;\nvarying vec3  vClipStrokeOdd;\nvarying vec3  vClipStrokePosition;\n\nvoid clipStrokeFragment() {\n  bool odd = mod(vClipStrokeIndex, 2.0) >= 1.0;\n\n  vec3 tangent;\n  if (odd) {\n    tangent = vClipStrokeOdd;\n  }\n  else {\n    tangent = vClipStrokeEven;\n  }\n\n  float travel = dot(vClipStrokePosition, normalize(tangent)) / vClipStrokeWidth;\n  if (mod(travel, 16.0) > 8.0) {\n    discard;\n  }\n}\n",
"fragment.clip.dotted": "varying float vClipStrokeWidth;\nvarying float vClipStrokeIndex;\nvarying vec3  vClipStrokeEven;\nvarying vec3  vClipStrokeOdd;\nvarying vec3  vClipStrokePosition;\n\nvoid clipStrokeFragment() {\n  bool odd = mod(vClipStrokeIndex, 2.0) >= 1.0;\n\n  vec3 tangent;\n  if (odd) {\n    tangent = vClipStrokeOdd;\n  }\n  else {\n    tangent = vClipStrokeEven;\n  }\n\n  float travel = dot(vClipStrokePosition, normalize(tangent)) / vClipStrokeWidth;\n  if (mod(travel, 4.0) > 2.0) {\n    discard;\n  }\n}\n",
"fragment.clip.ends": "varying vec2 vClipEnds;\n\nvoid clipEndsFragment() {\n  if (vClipEnds.x < 0.0 || vClipEnds.y < 0.0) discard;\n}\n",
"fragment.clip.proximity": "varying float vClipProximity;\n\nvoid clipProximityFragment() {\n  if (vClipProximity >= 0.5) discard;\n}",
"fragment.color": "void setFragmentColor(vec4 color) {\n  gl_FragColor = color;\n}",
"fragment.map.rgba": "vec4 fragmentRGBA(vec4 rgba, vec4 stpq) {\n  return rgba;\n}",
"fragment.solid": "void setFragmentColor(vec4 color) {\n  if (color.a < 1.0) discard;\n  gl_FragColor = color;\n}",
"fragment.transparent": "void setFragmentColor(vec4 color) {\n  if (color.a >= 1.0) discard;\n  gl_FragColor = color;\n}",
"grid.position": "uniform vec4 gridPosition;\nuniform vec4 gridStep;\nuniform vec4 gridAxis;\n\nvec4 sampleData(vec2 xy);\n\nvec4 getGridPosition(vec4 xyzw) {\n  vec4 onAxis  = gridAxis * sampleData(vec2(xyzw.y, 0.0)).x;\n  vec4 offAxis = gridStep * xyzw.x + gridPosition;\n  return onAxis + offAxis;\n}\n",
"grow.position": "uniform float growScale;\nuniform vec4  growMask;\nuniform vec4  growAnchor;\n\nvec4 getSample(vec4 xyzw);\n\nvec4 getGrowSample(vec4 xyzw) {\n  vec4 anchor = xyzw * growMask + growAnchor;\n\n  vec4 position = getSample(xyzw);\n  vec4 center = getSample(anchor);\n\n  return mix(center, position, growScale);\n}",
"join.position": "uniform float joinStride;\nuniform float joinStrideInv;\n\nfloat getIndex(vec4 xyzw);\nvec4 getRest(vec4 xyzw);\nvec4 injectIndices(float a, float b);\n\nvec4 getJoinXYZW(vec4 xyzw) {\n\n  float a = getIndex(xyzw);\n  float b = a * joinStrideInv;\n\n  float integer  = floor(b);\n  float fraction = b - integer;\n  \n  return injectIndices(fraction * joinStride, integer) + getRest(xyzw);\n}\n",
"label.alpha": "varying float vPixelSize;\n\nvec4 getLabelAlphaColor(vec4 color, vec4 sample) {\n  float mask = clamp(sample.r * 1000.0, 0.0, 1.0);\n  float alpha = (sample.r - .5) * vPixelSize + .5;\n  float a = mask * alpha * color.a;\n  if (a <= 0.0) discard;\n  return vec4(color.xyz, a);\n}\n",
"label.map": "vec2 mapUV(vec4 uvwo, vec4 stpq) {\n  return uvwo.xy;\n}\n",
"label.outline": "uniform float outlineExpand;\nuniform float outlineStep;\nuniform vec3  outlineColor;\n\nvarying float vPixelSize;\n\nconst float PIXEL_STEP = 255.0 / 16.0;\n\nvec4 getLabelOutlineColor(vec4 color, vec4 sample) {\n  float ps = vPixelSize * PIXEL_STEP;\n  float os = outlineStep;\n\n  float sdf = sample.r - .5 + outlineExpand;\n  vec2  sdfs = vec2(sdf, sdf + os);\n  vec2  alpha = clamp(sdfs * ps + .5, 0.0, 1.0);\n\n  if (alpha.y <= 0.0) {\n    discard;\n  }\n\n  vec3 blend = color.xyz;\n  if (alpha.y > alpha.x) {\n    blend = sqrt(mix(outlineColor * outlineColor, blend * blend, alpha.x));\n  }\n  \n  return vec4(blend, alpha.y * color.a);\n}\n",
"layer.position": "uniform vec4 layerScale;\nuniform vec4 layerBias;\n\nvec4 layerPosition(vec4 position, inout vec4 stpq) {\n  return layerScale * position + layerBias;\n}\n",
"lerp.depth": "// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpDepth(vec4 xyzw) {\n  float x = xyzw.z;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.xy, i, xyzw.w);\n  vec4 xyzw2 = vec4(xyzw.xy, i + 1.0, xyzw.w);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.height": "// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpHeight(vec4 xyzw) {\n  float x = xyzw.y;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.x, i, xyzw.zw);\n  vec4 xyzw2 = vec4(xyzw.x, i + 1.0, xyzw.zw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.items": "// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpItems(vec4 xyzw) {\n  float x = xyzw.w;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.xyz, i);\n  vec4 xyzw2 = vec4(xyzw.xyz, i + 1.0);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.width": "// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpWidth(vec4 xyzw) {\n  float x = xyzw.x;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(i, xyzw.yzw);\n  vec4 xyzw2 = vec4(i + 1.0, xyzw.yzw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"line.position": "// Units and calibration\nuniform float worldUnit;\nuniform float lineWidth;\nuniform float lineDepth;\nuniform float focusDepth;\n\n// General data index\nuniform vec4 geometryClip;\nattribute vec4 position4;\n\n// (Start/mid/end -1/0/1, top/bottom -1,1) \nattribute vec2 line;\n\n// 0...1 for round or bevel joins\n#ifdef LINE_JOIN_DETAIL\nattribute float joint;\n#else\nconst float joint = 0.0;\n#endif\n\n// Knock out excessively long line segments (e.g. for asymtpotes)\n#ifdef LINE_PROXIMITY\nuniform float lineProximity;\nvarying float vClipProximity;\n#endif\n\n// Ghetto line stroking (local only, not global)\n#ifdef LINE_STROKE\nvarying float vClipStrokeWidth;\nvarying float vClipStrokeIndex;\nvarying vec3  vClipStrokeEven;\nvarying vec3  vClipStrokeOdd;\nvarying vec3  vClipStrokePosition;\n#endif\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\n// Clip line ends for arrows / decoration\n#ifdef LINE_CLIP\nuniform float clipRange;\nuniform vec2  clipStyle;\nuniform float clipSpace;\n\nattribute vec2 strip;\n\nvarying vec2 vClipEnds;\n\nvoid clipEnds(vec4 xyzw, vec3 center, vec3 pos) {\n\n  // Sample end of line strip\n  vec4 xyzwE = vec4(strip.y, xyzw.yzw);\n  vec3 end   = getPosition(xyzwE, 0.0);\n\n  // Sample start of line strip\n  vec4 xyzwS = vec4(strip.x, xyzw.yzw);\n  vec3 start = getPosition(xyzwS, 0.0);\n\n  // Measure length\n  vec3 diff = end - start;\n  float l = length(diff) * clipSpace;\n\n  // Arrow length (=2.5x radius)\n  float arrowSize = 1.25 * clipRange * lineWidth * worldUnit;\n\n  vClipEnds = vec2(1.0);\n\n  if (clipStyle.y > 0.0) {\n    // Depth blend end\n    float depth = focusDepth;\n    if (lineDepth < 1.0) {\n      float z = max(0.00001, -end.z);\n      depth = mix(z, focusDepth, lineDepth);\n    }\n    \n    // Absolute arrow length\n    float size = arrowSize * depth;\n\n    // Adjust clip range\n    // Approach linear scaling with cubic ease the smaller we get\n    float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);\n    float scale = 1.0 - mini * mini * mini; \n    float invrange = 1.0 / (size * scale);\n  \n    // Clip end\n    diff = normalize(end - center);\n    float d = dot(end - pos, diff);\n    vClipEnds.x = d * invrange - 1.0;\n  }\n\n  if (clipStyle.x > 0.0) {\n    // Depth blend start\n    float depth = focusDepth;\n    if (lineDepth < 1.0) {\n      float z = max(0.00001, -start.z);\n      depth = mix(z, focusDepth, lineDepth);\n    }\n    \n    // Absolute arrow length\n    float size = arrowSize * depth;\n\n    // Adjust clip range\n    // Approach linear scaling with cubic ease the smaller we get\n    float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);\n    float scale = 1.0 - mini * mini * mini; \n    float invrange = 1.0 / (size * scale);\n  \n    // Clip start \n    diff = normalize(center - start);\n    float d = dot(pos - start, diff);\n    vClipEnds.y = d * invrange - 1.0;\n  }\n\n\n}\n#endif\n\n// Adjust left/center/right to be inside near/far z range\nconst float epsilon = 1e-5;\nvoid fixCenter(inout vec3 left, inout vec3 center, inout vec3 right) {\n  if (center.z >= 0.0) {\n    if (left.z < 0.0) {\n      float d = (center.z + epsilon) / (center.z - left.z);\n      center = mix(center, left, d);\n    }\n    else if (right.z < 0.0) {\n      float d = (center.z + epsilon) / (center.z - right.z);\n      center = mix(center, right, d);\n    }\n  }\n\n  if (left.z >= 0.0) {\n    if (center.z < 0.0) {\n      float d = (left.z + epsilon) / (left.z - center.z);\n      left = mix(left, center, d);\n    }\n  }\n\n  if (right.z >= 0.0) {\n    if (center.z < 0.0) {\n      float d = (right.z + epsilon) / (right.z - center.z);\n      right = mix(right, center, d);\n    }\n  }\n}\n\n// Sample the source data in an edge-aware manner\nvoid getLineGeometry(vec4 xyzw, float edge, out vec3 left, out vec3 center, out vec3 right) {\n  vec4 delta = vec4(1.0, 0.0, 0.0, 0.0);\n\n  center =                 getPosition(xyzw, 1.0);\n  left   = (edge > -0.5) ? getPosition(xyzw - delta, 0.0) : center;\n  right  = (edge < 0.5)  ? getPosition(xyzw + delta, 0.0) : center;\n}\n\n// Calculate the position for a vertex along the line, including joins\nvec3 getLineJoin(float edge, bool odd, vec3 left, vec3 center, vec3 right, float width, float offset, float joint) {\n  vec2 join = vec2(1.0, 0.0);\n\n  fixCenter(left, center, right);\n\n  vec4 a = vec4(left.xy, right.xy);\n  vec4 b = a / vec4(left.zz, right.zz);\n\n  vec2 l = b.xy;\n  vec2 r = b.zw;\n  vec2 c = center.xy / center.z;\n\n  vec4 d = vec4(l, c) - vec4(c, r);\n  float l1 = dot(d.xy, d.xy);\n  float l2 = dot(d.zw, d.zw);\n\n  if (l1 + l2 > 0.0) {\n    \n    if (edge > 0.5 || l2 == 0.0) {\n      vec2 nl = normalize(d.xy);\n      vec2 tl = vec2(nl.y, -nl.x);\n\n#ifdef LINE_PROXIMITY\n      vClipProximity = 1.0;\n#endif\n\n#ifdef LINE_STROKE\n      vClipStrokeEven = vClipStrokeOdd = normalize(left - center);\n#endif\n      join = tl;\n    }\n    else if (edge < -0.5 || l1 == 0.0) {\n      vec2 nr = normalize(d.zw);\n      vec2 tr = vec2(nr.y, -nr.x);\n\n#ifdef LINE_PROXIMITY\n      vClipProximity = 1.0;\n#endif\n\n#ifdef LINE_STROKE\n      vClipStrokeEven = vClipStrokeOdd = normalize(center - right);\n#endif\n      join = tr;\n    }\n    else {\n      // Limit join stretch for tiny segments\n      float lmin2 = min(l1, l2) / (width * width);\n\n      // Hide line segment if ratio of leg lengths exceeds promixity threshold\n#ifdef LINE_PROXIMITY\n      float lr     = l1 / l2;\n      float rl     = l2 / l1;\n      float ratio  = max(lr, rl);\n      float thresh = lineProximity + 1.0;\n      vClipProximity = (ratio > thresh * thresh) ? 1.0 : 0.0;\n#endif\n\n      // Calculate normals/tangents\n      vec2 nl = normalize(d.xy);\n      vec2 nr = normalize(d.zw);\n\n      // Calculate tangents\n      vec2 tl = vec2(nl.y, -nl.x);\n      vec2 tr = vec2(nr.y, -nr.x);\n\n#ifdef LINE_PROXIMITY\n      // Mix tangents according to leg lengths\n      vec2 tc = normalize(mix(tl, tr, l1/(l1+l2)));\n#else\n      // Average tangent\n      vec2 tc = normalize(tl + tr);\n#endif\n    \n      // Miter join\n      float cosA   = dot(nl, tc);\n      float sinA   = max(0.1, abs(dot(tl, tc)));\n      float factor = cosA / sinA;\n      float scale  = sqrt(1.0 + min(lmin2, factor * factor));\n\n      // Stroke normals\n#ifdef LINE_STROKE\n      vec3 stroke1 = normalize(left - center);\n      vec3 stroke2 = normalize(center - right);\n\n      if (odd) {\n        vClipStrokeEven = stroke1;\n        vClipStrokeOdd  = stroke2;\n      }\n      else {\n        vClipStrokeEven = stroke2;\n        vClipStrokeOdd  = stroke1;\n      }\n#endif\n\n#ifdef LINE_JOIN_MITER\n      // Apply straight up miter\n      join = tc * scale;\n#endif\n\n#ifdef LINE_JOIN_ROUND\n      // Slerp bevel join into circular arc\n      float dotProduct = dot(nl, nr);\n      float angle = acos(dotProduct);\n      float sinT  = sin(angle);\n      join = (sin((1.0 - joint) * angle) * tl + sin(joint * angle) * tr) / sinT;\n#endif\n\n#ifdef LINE_JOIN_BEVEL\n      // Direct bevel join between two flat ends\n      float dotProduct = dot(nl, nr);\n      join = mix(tl, tr, joint);\n#endif\n\n#ifdef LINE_JOIN_DETAIL\n      // Check if on inside or outside of joint\n      float crossProduct = nl.x * nr.y - nl.y * nr.x;\n      if (offset * crossProduct < 0.0) {\n        // For near-180-degree bends, correct back to a miter to avoid discontinuities\n        float ratio = clamp(-dotProduct * 2.0 - 1.0, 0.0, 1.0);\n        // Otherwise collapse the inside vertices into one.\n        join = mix(tc * scale, join, ratio * ratio * ratio);\n      }\n#endif\n\n    }\n    return vec3(join, 0.0);\n  }\n  else {\n    return vec3(0.0);\n  }\n\n}\n\n// Calculate final line position\nvec3 getLinePosition() {\n  vec3 left, center, right, join;\n\n  // left/center/right\n  float edge = line.x;\n  // up/down\n  float offset = line.y;\n\n  // Clip data\n  vec4 p = min(geometryClip, position4);\n  edge += max(0.0, position4.x - geometryClip.x);\n\n  // Get position + adjacent neighbours\n  getLineGeometry(p, edge, left, center, right);\n\n#ifdef LINE_STROKE\n  // Set parameters for line stroke fragment shader\n  vClipStrokePosition = center;\n  vClipStrokeIndex = p.x;\n  bool odd = mod(p.x, 2.0) >= 1.0;\n#else\n  bool odd = true;\n#endif\n\n  // Divide line width up/down\n  float width = lineWidth * 0.5;\n\n  float depth = focusDepth;\n  if (lineDepth < 1.0) {\n    // Depth blending\n    float z = max(0.00001, -center.z);\n    depth = mix(z, focusDepth, lineDepth);\n  }\n  width *= depth;\n\n  // Convert to world units\n  width *= worldUnit;\n\n  // Calculate line join\n  join = getLineJoin(edge, odd, left, center, right, width, offset, joint);\n  vec3 pos = center + join * offset * width;\n\n#ifdef LINE_STROKE\n  vClipStrokeWidth = width;\n#endif\n\n#ifdef LINE_CLIP\n  clipEnds(p, center, pos);\n#endif\n\n  return pos;\n}\n",
"map.2d.data": "uniform vec2 dataResolution;\nuniform vec2 dataPointer;\n\nvec2 map2DData(vec2 xy) {\n  return (xy + dataPointer) * dataResolution;\n}\n",
"map.2d.data.wrap": "uniform vec2 dataResolution;\nuniform vec2 dataPointer;\n\nvec2 map2DData(vec2 xy) {\n  return fract((xy + dataPointer) * dataResolution);\n}\n",
"map.xyzw.2dv": "void mapXyzw2DV(vec4 xyzw, out vec2 xy, out float z) {\n  xy = xyzw.xy;\n  z  = xyzw.z;\n}\n\n",
"map.xyzw.align": "vec4 alignXYZW(vec4 xyzw) {\n  return floor(xyzw + .5);\n}\n\n",
"map.xyzw.texture": "uniform float textureItems;\nuniform float textureHeight;\n\nvec2 mapXyzwTexture(vec4 xyzw) {\n  \n  float x = xyzw.x;\n  float y = xyzw.y;\n  float z = xyzw.z;\n  float i = xyzw.w;\n  \n  return vec2(i, y) + vec2(x, z) * vec2(textureItems, textureHeight);\n}\n\n",
"mesh.fragment.color": "varying vec4 vColor;\n\nvec4 getColor() {\n  return vColor;\n}\n",
"mesh.fragment.map": "#ifdef POSITION_STPQ\nvarying vec4 vSTPQ;\n#endif\n#ifdef POSITION_U\nvarying float vU;\n#endif\n#ifdef POSITION_UV\nvarying vec2 vUV;\n#endif\n#ifdef POSITION_UVW\nvarying vec3 vUVW;\n#endif\n#ifdef POSITION_UVWO\nvarying vec4 vUVWO;\n#endif\n\nvec4 getSample(vec4 uvwo, vec4 stpq);\n\nvec4 getMapColor() {\n  #ifdef POSITION_STPQ\n  vec4 stpq = vSTPQ;\n  #else\n  vec4 stpq = vec4(0.0);\n  #endif\n\n  #ifdef POSITION_U\n  vec4 uvwo = vec4(vU, 0.0, 0.0, 0.0);\n  #endif\n  #ifdef POSITION_UV\n  vec4 uvwo = vec4(vUV, 0.0, 0.0);\n  #endif\n  #ifdef POSITION_UVW\n  vec4 uvwo = vec4(vUVW, 0.0);\n  #endif\n  #ifdef POSITION_UVWO\n  vec4 uvwo = vec4(vUVWO);\n  #endif\n\n  return getSample(uvwo, stpq);\n}\n",
"mesh.fragment.mask": "varying float vMask;\n\nfloat ease(float t) {\n  t = clamp(t, 0.0, 1.0);\n  return t * t * (3.0 - 2.0 * t);\n}\n\nvec4 maskColor() {\n  if (vMask <= 0.0) discard;\n  return vec4(vec3(1.0), ease(vMask));\n}\n",
"mesh.fragment.material": "#ifdef POSITION_STPQ\nvarying vec4 vSTPQ;\n#endif\n#ifdef POSITION_U\nvarying float vU;\n#endif\n#ifdef POSITION_UV\nvarying vec2 vUV;\n#endif\n#ifdef POSITION_UVW\nvarying vec3 vUVW;\n#endif\n#ifdef POSITION_UVWO\nvarying vec4 vUVWO;\n#endif\n\nvec4 getSample(vec4 rgba, vec4 stpq);\n\nvec4 getMaterialColor(vec4 rgba) {\n  vec4 stpq = vec4(0.0);\n\n  #ifdef POSITION_U\n  stpq.x = vU;\n  #endif\n  #ifdef POSITION_UV\n  stpq.xy = vUV;\n  #endif\n  #ifdef POSITION_UVW\n  stpq.xyz = vUVW;\n  #endif\n  #ifdef POSITION_UVWO\n  stpq = vUVWO;\n  #endif\n\n  #ifdef POSITION_STPQ\n  stpq = vSTPQ;\n  #endif\n\n  return getSample(rgba, stpq);\n}\n",
"mesh.fragment.shaded": "varying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvec3 offSpecular(vec3 color) {\n  vec3 c = 1.0 - color;\n  return 1.0 - c * c;\n}\n\nvec4 getShadedColor(vec4 rgba) {\n  \n  vec3 color = rgba.xyz;\n  vec3 color2 = offSpecular(rgba.xyz);\n\n  vec3 normal = normalize(vNormal);\n  vec3 light = normalize(vLight);\n  vec3 position = normalize(vPosition);\n  \n  float side    = gl_FrontFacing ? -1.0 : 1.0;\n  float cosine  = side * dot(normal, light);\n  float diffuse = mix(max(0.0, cosine), .5 + .5 * cosine, .1);\n  \n  vec3  halfLight = normalize(light + position);\n\tfloat cosineHalf = max(0.0, side * dot(normal, halfLight));\n\tfloat specular = pow(cosineHalf, 16.0);\n\t\n\treturn vec4(color * (diffuse * .9 + .05) + .25 * color2 * specular, rgba.a);\n}\n",
"mesh.fragment.texture": "",
"mesh.gamma.in": "vec4 getGammaInColor(vec4 rgba) {\n  return vec4(rgba.rgb * rgba.rgb, rgba.a);\n}\n",
"mesh.gamma.out": "vec4 getGammaOutColor(vec4 rgba) {\n  return vec4(sqrt(rgba.rgb), rgba.a);\n}\n",
"mesh.map.uvwo": "vec4 mapUVWO(vec4 uvwo, vec4 stpq) {\n  return uvwo;\n}\n",
"mesh.position": "uniform vec4 geometryClip;\nattribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvec3 getMeshPosition() {\n  vec4 p = min(geometryClip, position4);\n  return getPosition(p, 1.0);\n}\n",
"mesh.vertex.color": "attribute vec4 position4;\nuniform vec4 geometryClip;\nvarying vec4 vColor;\n\n// External\nvec4 getSample(vec4 xyzw);\n\nvoid vertexColor() {\n  vec4 p = min(geometryClip, position4);\n  vColor = getSample(p);\n}\n",
"mesh.vertex.mask": "attribute vec4 position4;\nuniform vec4 geometryResolution;\nuniform vec4 geometryClip;\nvarying float vMask;\n\n// External\nfloat getSample(vec4 xyzw);\n\nvoid maskLevel() {\n  vec4 p = min(geometryClip, position4);\n  vMask = getSample(p * geometryResolution);\n}\n",
"mesh.vertex.position": "uniform vec4 geometryResolution;\n\n#ifdef POSITION_STPQ\nvarying vec4 vSTPQ;\n#endif\n#ifdef POSITION_U\nvarying float vU;\n#endif\n#ifdef POSITION_UV\nvarying vec2 vUV;\n#endif\n#ifdef POSITION_UVW\nvarying vec3 vUVW;\n#endif\n#ifdef POSITION_UVWO\nvarying vec4 vUVWO;\n#endif\n\n// External\nvec3 getPosition(vec4 xyzw, in vec4 stpqIn, out vec4 stpqOut);\n\nvec3 getMeshPosition(vec4 xyzw, float canonical) {\n  vec4 stpqOut, stpqIn = xyzw * geometryResolution;\n  vec3 xyz = getPosition(xyzw, stpqIn, stpqOut);\n\n  #ifdef POSITION_MAP\n  if (canonical > 0.5) {\n    #ifdef POSITION_STPQ\n    vSTPQ = stpqOut;\n    #endif\n    #ifdef POSITION_U\n    vU = stpqOut.x;\n    #endif\n    #ifdef POSITION_UV\n    vUV = stpqOut.xy;\n    #endif\n    #ifdef POSITION_UVW\n    vUVW = stpqOut.xyz;\n    #endif\n    #ifdef POSITION_UVWO\n    vUVWO = stpqOut;\n    #endif\n  }\n  #endif\n  return xyz;\n}\n",
"move.position": "uniform float transitionEnter;\nuniform float transitionExit;\nuniform vec4  transitionScale;\nuniform vec4  transitionBias;\nuniform float transitionSkew;\nuniform float transitionActive;\n\nuniform vec4  moveFrom;\nuniform vec4  moveTo;\n\nfloat ease(float t) {\n  t = clamp(t, 0.0, 1.0);\n  return 1.0 - (2.0 - t) * t;\n}\n\nvec4 getTransitionPosition(vec4 xyzw, inout vec4 stpq) {\n  if (transitionActive < 0.5) return xyzw;\n\n  float enter   = transitionEnter;\n  float exit    = transitionExit;\n  float skew    = transitionSkew;\n  vec4  scale   = transitionScale;\n  vec4  bias    = transitionBias;\n\n  float factor  = 1.0 + skew;\n  float offset  = dot(vec4(1.0), stpq * scale + bias);\n\n  float a1 = ease(enter * factor - offset);\n  float a2 = ease(exit  * factor + offset - skew);\n\n  return xyzw + a1 * moveFrom + a2 * moveTo;\n}",
"object.mask.default": "vec4 getMask(vec4 xyzw) {\n  return vec4(1.0);\n}",
"point.alpha.circle": "varying float vPixelSize;\n\nfloat getDiscAlpha(float mask) {\n  // Approximation: 1 - x*x is approximately linear around x = 1 with slope 2\n  return vPixelSize * (1.0 - mask);\n  //  return vPixelSize * 2.0 * (1.0 - sqrt(mask));\n}\n",
"point.alpha.circle.hollow": "varying float vPixelSize;\n\nfloat getDiscHollowAlpha(float mask) {\n  return vPixelSize * (0.5 - 2.0 * abs(sqrt(mask) - .75));\n}\n",
"point.alpha.generic": "varying float vPixelSize;\n\nfloat getGenericAlpha(float mask) {\n  return vPixelSize * 2.0 * (1.0 - mask);\n}\n",
"point.alpha.generic.hollow": "varying float vPixelSize;\n\nfloat getGenericHollowAlpha(float mask) {\n  return vPixelSize * (0.5 - 2.0 * abs(mask - .75));\n}\n",
"point.edge": "varying vec2 vSprite;\n\nfloat getSpriteMask(vec2 xy);\nfloat getSpriteAlpha(float mask);\n\nvoid setFragmentColorFill(vec4 color) {\n  float mask = getSpriteMask(vSprite);\n  if (mask > 1.0) {\n    discard;\n  }\n  float alpha = getSpriteAlpha(mask);\n  if (alpha >= 1.0) {\n    discard;\n  }\n  gl_FragColor = vec4(color.rgb, alpha * color.a);\n}\n",
"point.fill": "varying vec2 vSprite;\n\nfloat getSpriteMask(vec2 xy);\nfloat getSpriteAlpha(float mask);\n\nvoid setFragmentColorFill(vec4 color) {\n  float mask = getSpriteMask(vSprite);\n  if (mask > 1.0) {\n    discard;\n  }\n  float alpha = getSpriteAlpha(mask);\n  if (alpha < 1.0) {\n    discard;\n  }\n  gl_FragColor = color;\n}\n\n",
"point.mask.circle": "varying float vPixelSize;\n\nfloat getCircleMask(vec2 uv) {\n  return dot(uv, uv);\n}\n",
"point.mask.diamond": "varying float vPixelSize;\n\nfloat getDiamondMask(vec2 uv) {\n  vec2 a = abs(uv);\n  return a.x + a.y;\n}\n",
"point.mask.down": "varying float vPixelSize;\n\nfloat getTriangleDownMask(vec2 uv) {\n  uv.y += .25;\n  return max(uv.y, abs(uv.x) * .866 - uv.y * .5 + .6);\n}\n",
"point.mask.left": "varying float vPixelSize;\n\nfloat getTriangleLeftMask(vec2 uv) {\n  uv.x += .25;\n  return max(uv.x, abs(uv.y) * .866 - uv.x * .5 + .6);\n}\n",
"point.mask.right": "varying float vPixelSize;\n\nfloat getTriangleRightMask(vec2 uv) {\n  uv.x -= .25;\n  return max(-uv.x, abs(uv.y) * .866 + uv.x * .5 + .6);\n}\n",
"point.mask.square": "varying float vPixelSize;\n\nfloat getSquareMask(vec2 uv) {\n  vec2 a = abs(uv);\n  return max(a.x, a.y);\n}\n",
"point.mask.up": "varying float vPixelSize;\n\nfloat getTriangleUpMask(vec2 uv) {\n  uv.y -= .25;\n  return max(-uv.y, abs(uv.x) * .866 + uv.y * .5 + .6);\n}\n",
"point.position": "uniform float pointDepth;\n\nuniform float pixelUnit;\nuniform float renderScale;\nuniform float renderScaleInv;\nuniform float focusDepth;\n\nuniform vec4 geometryClip;\nattribute vec4 position4;\nattribute vec2 sprite;\n\nvarying vec2 vSprite;\nvarying float vPixelSize;\n\nconst float pointScale = POINT_SHAPE_SCALE;\n\n// External\nfloat getPointSize(vec4 xyzw);\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvec3 getPointPosition() {\n  vec4 p = min(geometryClip, position4);\n  vec3 center = getPosition(p, 1.0);\n\n  // Depth blending\n  // TODO: orthographic camera\n  // Workaround: set depth = 0\n  float z = -center.z;\n  float depth = mix(z, focusDepth, pointDepth);\n  \n  // Match device/unit mapping \n  // Sprite goes from -1..1, width = 2.\n  float pointSize = getPointSize(p);\n  float size = pointScale * pointSize * pixelUnit * .5;\n  float depthSize = depth * size;\n  \n  // Pad sprite by half a pixel to make the anti-aliasing straddle the pixel edge\n  // Note: pixelsize measures radius\n  float pixelSize = .5 * (pointDepth > 0.0 ? depthSize / z : size);\n  float paddedSize = pixelSize + 0.5;\n  float padFactor = paddedSize / pixelSize;\n\n  vPixelSize = paddedSize;\n  vSprite    = sprite;\n\n  return center + vec3(sprite * depthSize * renderScaleInv * padFactor, 0.0);\n}\n",
"point.size.uniform": "uniform float pointSize;\n\nfloat getPointSize(vec4 xyzw) {\n  return pointSize;\n}",
"point.size.varying": "uniform float pointSize;\n\nvec4 getSample(vec4 xyzw);\n\nfloat getPointSize(vec4 xyzw) {\n  return pointSize * getSample(xyzw).x;\n}",
"polar.position": "uniform float polarBend;\nuniform float polarFocus;\nuniform float polarAspect;\nuniform float polarHelix;\n\nuniform mat4 viewMatrix;\n\nvec4 getPolarPosition(vec4 position, inout vec4 stpq) {\n  if (polarBend > 0.0) {\n\n    if (polarBend < 0.001) {\n      // Factor out large addition/subtraction of polarFocus\n      // to avoid numerical error\n      // sin(x) ~ x\n      // cos(x) ~ 1 - x * x / 2\n      vec2 pb = position.xy * polarBend;\n      float ppbbx = pb.x * pb.x;\n      return viewMatrix * vec4(\n        position.x * (1.0 - polarBend + (pb.y * polarAspect)),\n        position.y * (1.0 - .5 * ppbbx) - (.5 * ppbbx) * polarFocus / polarAspect,\n        position.z + position.x * polarHelix * polarBend,\n        1.0\n      );\n    }\n    else {\n      vec2 xy = position.xy * vec2(polarBend, polarAspect);\n      float radius = polarFocus + xy.y;\n      return viewMatrix * vec4(\n        sin(xy.x) * radius,\n        (cos(xy.x) * radius - polarFocus) / polarAspect,\n        position.z + position.x * polarHelix * polarBend,\n        1.0\n      );\n    }\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"project.position": "uniform float styleZBias;\nuniform float styleZIndex;\n\nvoid setPosition(vec3 position) {\n  vec4 pos = projectionMatrix * vec4(position, 1.0);\n\n  // Apply relative Z bias\n  float bias  = (1.0 - styleZBias / 32768.0);\n  pos.z *= bias;\n  \n  // Apply large scale Z index changes\n  if (styleZIndex > 0.0) {\n    float z = pos.z / pos.w;\n    pos.z = ((z + 1.0) / (styleZIndex + 1.0) - 1.0) * pos.w;\n  }\n  \n  gl_Position = pos;\n}",
"project.readback": "// This is three.js' global uniform, missing from fragment shaders.\nuniform mat4 projectionMatrix;\n\nvec4 readbackPosition(vec3 position, vec4 stpq) {\n  vec4 pos = projectionMatrix * vec4(position, 1.0);\n  vec3 final = pos.xyz / pos.w;\n  if (final.z < -1.0) {\n    return vec4(0.0, 0.0, 0.0, -1.0);\n  }\n  else {\n    return vec4(final, -position.z);\n  }\n}\n",
"raw.position.scale": "uniform vec4 geometryScale;\nattribute vec4 position4;\n\nvec4 getRawPositionScale() {\n  return geometryScale * position4;\n}\n",
"repeat.position": "uniform vec4 repeatModulus;\n\nvec4 getRepeatXYZW(vec4 xyzw) {\n  return mod(xyzw + .5, repeatModulus) - .5;\n}\n",
"resample.padding": "uniform vec4 resampleBias;\n\nvec4 resamplePadding(vec4 xyzw) {\n  return xyzw + resampleBias;\n}",
"resample.relative": "uniform vec4 resampleFactor;\n\nvec4 resampleRelative(vec4 xyzw) {\n  return xyzw * resampleFactor;\n}",
"reveal.mask": "uniform float transitionEnter;\nuniform float transitionExit;\nuniform vec4  transitionScale;\nuniform vec4  transitionBias;\nuniform float transitionSkew;\nuniform float transitionActive;\n\nfloat getTransitionSDFMask(vec4 stpq) {\n  if (transitionActive < 0.5) return 1.0;\n\n  float enter   = transitionEnter;\n  float exit    = transitionExit;\n  float skew    = transitionSkew;\n  vec4  scale   = transitionScale;\n  vec4  bias    = transitionBias;\n\n  float factor  = 1.0 + skew;\n  float offset  = dot(vec4(1.0), stpq * scale + bias);\n\n  vec2 d = vec2(enter, exit) * factor + vec2(-offset, offset - skew);\n  if (exit  == 1.0) return d.x;\n  if (enter == 1.0) return d.y;\n  return min(d.x, d.y);\n}",
"root.position": "vec3 getRootPosition(vec4 position, in vec4 stpqIn, out vec4 stpqOut) {\n  stpqOut = stpqIn; // avoid inout confusion\n  return position.xyz;\n}",
"sample.2d": "uniform sampler2D dataTexture;\n\nvec4 sample2D(vec2 uv) {\n  return texture2D(dataTexture, uv);\n}\n",
"scale.position": "uniform vec4 scaleAxis;\nuniform vec4 scaleOffset;\n\nvec4 sampleData(float x);\n\nvec4 getScalePosition(vec4 xyzw) {\n  return scaleAxis * sampleData(xyzw.x).x + scaleOffset;\n}\n",
"screen.map.stpq": "uniform vec4 remapSTPQScale;\n\nvec4 screenMapSTPQ(vec4 xyzw, out vec4 stpq) {\n  stpq = xyzw * remapSTPQScale;\n  return xyzw;\n}\n",
"screen.map.xy": "uniform vec2 remapUVScale;\n\nvec4 screenMapXY(vec4 uvwo, vec4 stpq) {\n  return vec4(floor(remapUVScale * uvwo.xy), 0.0, 0.0);\n}\n",
"screen.map.xyzw": "uniform vec2 remapUVScale;\nuniform vec2 remapModulus;\nuniform vec2 remapModulusInv;\n\nvec4 screenMapXYZW(vec4 uvwo, vec4 stpq) {\n  vec2 st = floor(remapUVScale * uvwo.xy);\n  vec2 xy = st * remapModulusInv;\n  vec2 ixy = floor(xy);\n  vec2 fxy = xy - ixy;\n  vec2 zw = fxy * remapModulus;\n  return vec4(ixy.x, zw.y, ixy.y, zw.x);\n}\n",
"screen.pass.uv": "vec2 screenPassUV(vec4 uvwo, vec4 stpq) {\n  return uvwo.xy;\n}\n",
"screen.position": "void setScreenPosition(vec4 position) {\n  gl_Position = vec4(position.xy * 2.0 - 1.0, 0.5, 1.0);\n}\n",
"slice.position": "uniform vec4 sliceOffset;\n\nvec4 getSliceOffset(vec4 xyzw) {\n  return xyzw + sliceOffset;\n}\n",
"spherical.position": "uniform float sphericalBend;\nuniform float sphericalFocus;\nuniform float sphericalAspectX;\nuniform float sphericalAspectY;\nuniform float sphericalScaleY;\n\nuniform mat4 viewMatrix;\n\nvec4 getSphericalPosition(vec4 position, inout vec4 stpq) {\n  if (sphericalBend > 0.0001) {\n\n    vec3 xyz = position.xyz * vec3(sphericalBend, sphericalBend / sphericalAspectY * sphericalScaleY, sphericalAspectX);\n    float radius = sphericalFocus + xyz.z;\n    float cosine = cos(xyz.y) * radius;\n\n    return viewMatrix * vec4(\n      sin(xyz.x) * cosine,\n      sin(xyz.y) * radius * sphericalAspectY,\n      (cos(xyz.x) * cosine - sphericalFocus) / sphericalAspectX,\n      1.0\n    );\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"split.position": "uniform float splitStride;\n\nvec2 getIndices(vec4 xyzw);\nvec4 getRest(vec4 xyzw);\nvec4 injectIndex(float v);\n\nvec4 getSplitXYZW(vec4 xyzw) {\n  vec2 uv = getIndices(xyzw);\n  float offset = uv.x + uv.y * splitStride;\n  return injectIndex(offset) + getRest(xyzw);\n}\n",
"spread.position": "uniform vec4 spreadOffset;\nuniform mat4 spreadMatrix;\n\n// External\nvec4 getSample(vec4 xyzw);\n\nvec4 getSpreadSample(vec4 xyzw) {\n  vec4 sample = getSample(xyzw);\n  return sample + spreadMatrix * (spreadOffset + xyzw);\n}\n",
"sprite.fragment": "varying vec2 vSprite;\n\nvec4 getSample(vec2 xy);\n\nvec4 getSpriteColor() {\n  return getSample(vSprite);\n}",
"sprite.position": "uniform vec2 spriteOffset;\nuniform float spriteScale;\nuniform float spriteDepth;\nuniform float spriteSnap;\n\nuniform vec2 renderOdd;\nuniform float renderScale;\nuniform float renderScaleInv;\nuniform float pixelUnit;\nuniform float focusDepth;\n\nuniform vec4 geometryClip;\nattribute vec4 position4;\nattribute vec2 sprite;\n\nvarying float vPixelSize;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\nvec4 getSprite(vec4 xyzw);\n\nvec3 getSpritePosition() {\n  // Clip points\n  vec4 p = min(geometryClip, position4);\n  float diff = length(position4 - p);\n  if (diff > 0.0) {\n    return vec3(0.0, 0.0, 1000.0);\n  }\n\n  // Make sprites\n  vec3 center = getPosition(p, 1.0);\n  vec4 atlas = getSprite(p);\n\n  // Sprite goes from -1..1, width = 2.\n  // -1..1 -> -0.5..0.5\n  vec2 halfSprite = sprite * .5;\n  vec2 halfFlipSprite = vec2(halfSprite.x, -halfSprite.y);\n\n#ifdef POSITION_UV\n  // Assign UVs\n  vUV = atlas.xy + atlas.zw * (halfFlipSprite + .5);\n#endif\n\n  // Depth blending\n  // TODO: orthographic camera\n  // Workaround: set depth = 0\n  float depth = focusDepth, z;\n  z = -center.z;\n  if (spriteDepth < 1.0) {\n    depth = mix(z, focusDepth, spriteDepth);\n  }\n  \n  // Match device/unit mapping \n  float size = pixelUnit * spriteScale;\n  float depthSize = depth * size;\n\n  // Calculate pixelSize for anti-aliasing\n  float pixelSize = (spriteDepth > 0.0 ? depthSize / z : size);\n  vPixelSize = pixelSize;\n\n  // Position sprite\n  vec2 atlasOdd = fract(atlas.zw / 2.0);\n  vec2 offset = (spriteOffset + halfSprite * atlas.zw) * depthSize;\n  if (spriteSnap > 0.5) {\n    // Snap to pixel (w/ epsilon shift to avoid jitter)\n    return vec3(((floor(center.xy / center.z * renderScale + 0.001) + renderOdd + atlasOdd) * center.z + offset) * renderScaleInv, center.z);\n  }\n  else {\n    // Place directly\n    return center + vec3(offset * renderScaleInv, 0.0);\n  }\n\n}\n",
"stereographic.position": "uniform float stereoBend;\n\nuniform mat4 viewMatrix;\n\nvec4 getStereoPosition(vec4 position, inout vec4 stpq) {\n  if (stereoBend > 0.0001) {\n\n    vec3 pos = position.xyz;\n    float r = length(pos);\n    float z = r + pos.z;\n    vec3 project = vec3(pos.xy / z, r);\n    \n    vec3 lerped = mix(pos, project, stereoBend);\n\n    return viewMatrix * vec4(lerped, 1.0);\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"stereographic4.position": "uniform float stereoBend;\nuniform vec4 basisScale;\nuniform vec4 basisOffset;\nuniform mat4 viewMatrix;\nuniform vec2 view4D;\n\nvec4 getStereographic4Position(vec4 position, inout vec4 stpq) {\n  \n  vec4 transformed;\n  if (stereoBend > 0.0001) {\n\n    float r = length(position);\n    float w = r + position.w;\n    vec4 project = vec4(position.xyz / w, r);\n    \n    transformed = mix(position, project, stereoBend);\n  }\n  else {\n    transformed = position;\n  }\n\n  vec4 pos4 = transformed * basisScale - basisOffset;\n  vec3 xyz = (viewMatrix * vec4(pos4.xyz, 1.0)).xyz;\n  return vec4(xyz, pos4.w * view4D.y + view4D.x);\n}\n",
"stpq.sample.2d": "varying vec2 vST;\n\nvec4 getSample(vec2 st);\n\nvec4 getSTSample() {\n  return getSample(vST);\n}\n",
"stpq.xyzw.2d": "varying vec2 vUV;\n\nvoid setRawUV(vec4 xyzw) {\n  vUV = xyzw.xy;\n}\n",
"strip.position.normal": "uniform vec4 geometryClip;\nattribute vec4 position4;\nattribute vec3 strip;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvoid getStripGeometry(vec4 xyzw, vec3 strip, out vec3 pos, out vec3 normal) {\n  vec3 a, b, c;\n\n  a   = getPosition(xyzw, 1.0);\n  b   = getPosition(vec4(xyzw.xyz, strip.x), 0.0);\n  c   = getPosition(vec4(xyzw.xyz, strip.y), 0.0);\n\n  normal = normalize(cross(c - a, b - a)) * strip.z;\n  \n  pos = a;\n}\n\nvec3 getStripPositionNormal() {\n  vec3 center, normal;\n\n  vec4 p = min(geometryClip, position4);\n\n  getStripGeometry(p, strip, center, normal);\n  vNormal   = normal;\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);\n  vPosition = -center;\n\n  return center;\n}\n",
"style.color": "uniform vec3 styleColor;\nuniform float styleOpacity;\n\nvec4 getStyleColor() {\n  return vec4(styleColor, styleOpacity);\n}\n",
"subdivide.depth": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideDepth(vec4 xyzw) {\n  float x = xyzw.z;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  return sampleData(vec4(xyzw.xy, i + g, xyzw.w));\n}\n",
"subdivide.depth.lerp": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideDepthLerp(vec4 xyzw) {\n  float x = xyzw.z;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  vec4 xyzw1 = vec4(xyzw.xy, i, xyzw.w);\n  vec4 xyzw2 = vec4(xyzw.xy, i + 1.0, xyzw.w);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, g);\n}\n",
"subdivide.height": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideHeight(vec4 xyzw) {\n  float x = xyzw.y;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  return sampleData(vec4(xyzw.x, i + g, xyzw.zw));\n}\n",
"subdivide.height.lerp": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideHeightLerp(vec4 xyzw) {\n  float x = xyzw.y;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  vec4 xyzw1 = vec4(xyzw.x, i, xyzw.zw);\n  vec4 xyzw2 = vec4(xyzw.x, i + 1.0, xyzw.zw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, g);\n}\n",
"subdivide.items": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideItems(vec4 xyzw) {\n  float x = xyzw.w;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  return sampleData(vec4(xyzw.xyz, i + g));\n}\n",
"subdivide.items.lerp": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideItemsLerp(vec4 xyzw) {\n  float x = xyzw.w;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  vec4 xyzw1 = vec4(xyzw.xyz, i);\n  vec4 xyzw2 = vec4(xyzw.xyz, i + 1.0);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, g);\n}\n",
"subdivide.width": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideWidth(vec4 xyzw) {\n  float x = xyzw.x;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  return sampleData(vec4(i + g, xyzw.yzw));\n}\n",
"subdivide.width.lerp": "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideWidthLerp(vec4 xyzw) {\n  float x = xyzw.x;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  vec4 xyzw1 = vec4(i, xyzw.yzw);\n  vec4 xyzw2 = vec4(i + 1.0, xyzw.yzw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, g);\n}\n",
"surface.mask.hollow": "attribute vec4 position4;\n\nfloat getSurfaceHollowMask(vec4 xyzw) {\n  vec4 df = abs(fract(position4) - .5);\n  vec2 df2 = min(df.xy, df.zw);\n  float df3 = min(df2.x, df2.y);\n  return df3;\n}",
"surface.position": "uniform vec4 geometryClip;\nuniform vec4 geometryResolution;\nuniform vec4 mapSize;\n\nattribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvec3 getSurfacePosition() {\n  vec4 p = min(geometryClip, position4);\n  vec3 xyz = getPosition(p, 1.0);\n\n  // Overwrite UVs\n#ifdef POSITION_UV\n#ifdef POSITION_UV_INT\n  vUV = -.5 + (position4.xy * geometryResolution.xy) * mapSize.xy;\n#else\n  vUV = position4.xy * geometryResolution.xy;\n#endif\n#endif\n\n  return xyz;\n}\n",
"surface.position.normal": "uniform vec4 mapSize;\nuniform vec4 geometryResolution;\nuniform vec4 geometryClip;\nattribute vec4 position4;\nattribute vec2 surface;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvoid getSurfaceGeometry(vec4 xyzw, float edgeX, float edgeY, out vec3 left, out vec3 center, out vec3 right, out vec3 up, out vec3 down) {\n  vec4 deltaX = vec4(1.0, 0.0, 0.0, 0.0);\n  vec4 deltaY = vec4(0.0, 1.0, 0.0, 0.0);\n\n  /*\n  // high quality, 5 tap\n  center =                  getPosition(xyzw, 1.0);\n  left   = (edgeX > -0.5) ? getPosition(xyzw - deltaX, 0.0) : center;\n  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX, 0.0) : center;\n  down   = (edgeY > -0.5) ? getPosition(xyzw - deltaY, 0.0) : center;\n  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY, 0.0) : center;\n  */\n  \n  // low quality, 3 tap\n  center =                  getPosition(xyzw, 1.0);\n  left   =                  center;\n  down   =                  center;\n  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX, 0.0) : (2.0 * center - getPosition(xyzw - deltaX, 0.0));\n  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY, 0.0) : (2.0 * center - getPosition(xyzw - deltaY, 0.0));\n}\n\nvec3 getSurfaceNormal(vec3 left, vec3 center, vec3 right, vec3 up, vec3 down) {\n  vec3 dx = right - left;\n  vec3 dy = up    - down;\n  vec3 n = cross(dy, dx);\n  if (length(n) > 0.0) {\n    return normalize(n);\n  }\n  return vec3(0.0, 1.0, 0.0);\n}\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvec3 getSurfacePositionNormal() {\n  vec3 left, center, right, up, down;\n\n  vec4 p = min(geometryClip, position4);\n\n  getSurfaceGeometry(p, surface.x, surface.y, left, center, right, up, down);\n  vNormal   = getSurfaceNormal(left, center, right, up, down);\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz); // hardcoded directional light\n  vPosition = -center;\n\n#ifdef POSITION_UV\n#ifdef POSITION_UV_INT\n  vUV = -.5 + (position4.xy * geometryResolution.xy) * mapSize.xy;\n#else\n  vUV = position4.xy * geometryResolution.xy;\n#endif\n#endif\n  \n  return center;\n}\n",
"ticks.position": "uniform float worldUnit;\nuniform float focusDepth;\nuniform float tickSize;\nuniform float tickEpsilon;\nuniform vec3  tickNormal;\nuniform vec2  tickStrip;\n\nvec4 getSample(vec4 xyzw);\n\nvec3 transformPosition(vec4 position, in vec4 stpqIn, out vec4 stpqOut);\n\nvec3 getTickPosition(vec4 xyzw, in vec4 stpqIn, out vec4 stpqOut) {\n  float epsilon = tickEpsilon;\n\n  // determine tick direction\n  float leftX  = max(tickStrip.x, xyzw.y - 1.0);\n  float rightX = min(tickStrip.y, xyzw.y + 1.0);\n  \n  vec4 left    = getSample(vec4(leftX,  xyzw.zw, 0.0));\n  vec4 right   = getSample(vec4(rightX, xyzw.zw, 0.0));\n  vec4 diff    = right - left;\n\n  vec3 normal  = cross(normalize(diff.xyz + vec3(diff.w)), tickNormal);\n  float bias   = max(0.0, 1.0 - length(normal) * 2.0);\n       normal  = mix(normal, tickNormal.yzx, bias * bias);\n  \n  // transform (point) and (point + delta)\n  vec4 center  = getSample(vec4(xyzw.yzw, 0.0));\n  vec4 delta   = vec4(normal, 0.0) * epsilon;\n\n  vec4 a = center;\n  vec4 b = center + delta;\n\n  vec4 _;\n  vec3 c = transformPosition(a, stpqIn, stpqOut);\n  vec3 d = transformPosition(b, stpqIn, _);\n  \n  // sample on either side to create line\n  float line = xyzw.x - .5;\n  vec3  mid  = c;\n  vec3  side = normalize(d - c);\n\n  return mid + side * line * tickSize * worldUnit * focusDepth;\n}\n",
"transform3.position": "uniform mat4 transformMatrix;\n\nvec4 transformPosition(vec4 position, inout vec4 stpq) {\n  return transformMatrix * vec4(position.xyz, 1.0);\n}\n",
"transform4.position": "uniform mat4 transformMatrix;\nuniform vec4 transformOffset;\n\nvec4 transformPosition(vec4 position, inout vec4 stpq) {\n  return transformMatrix * position + transformOffset;\n}\n",
"view.position": "// Implicit three.js uniform\n// uniform mat4 viewMatrix;\n\nvec4 getViewPosition(vec4 position, inout vec4 stpq) {\n  return (viewMatrix * vec4(position.xyz, 1.0));\n}\n"};

},{}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":10,"isarray":5}],5:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],6:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":12}],7:[function(require,module,exports){
module.exports = language

var tokenizer = require('./tokenizer')

function language(lookups, matchComparison) {
  return function(selector) {
    return parse(selector, remap(lookups),
                 matchComparison || caseSensitiveComparison)
  }
}

function remap(opts) {
  for(var key in opts) if(opt_okay(opts, key)) {
    opts[key] = Function(
        'return function(node, attr) { return node.' + opts[key] + ' }'
    )
    opts[key] = opts[key]()
  }

  return opts
}

function opt_okay(opts, key) {
  return opts.hasOwnProperty(key) && typeof opts[key] === 'string'
}

function parse(selector, options, matchComparison) {
  var stream = tokenizer()
    , default_subj = true
    , selectors = [[]]
    , traversal
    , bits

  bits = selectors[0]

  traversal = {
      '': any_parents
    , '>': direct_parent
    , '+': direct_sibling
    , '~': any_sibling
  }

  stream
    .on('data', group)
    .end(selector)

  function group(token) {
    var crnt

    if(token.type === 'comma') {
      selectors.unshift(bits = [])

      return
    }

    if(token.type === 'op' || token.type === 'any-child') {
      bits.unshift(traversal[token.data])
      bits.unshift(check())

      return
    }

    bits[0] = bits[0] || check()
    crnt = bits[0]

    if(token.type === '!') {
      crnt.subject =
      selectors[0].subject = true

      return
    }

    crnt.push(
        token.type === 'class' ? listContains(token.type, token.data) :
        token.type === 'attr' ? attr(token) :
        token.type === ':' || token.type === '::' ? pseudo(token) :
        token.type === '*' ? Boolean :
        matches(token.type, token.data, matchComparison)
    )
  }

  return selector_fn

  function selector_fn(node, as_boolean) {
    var current
      , length
      , orig
      , subj
      , set

    orig = node
    set = []

    for(var i = 0, len = selectors.length; i < len; ++i) {
      bits = selectors[i]
      current = entry
      length = bits.length
      node = orig
      subj = []

      for(var j = 0; j < length; j += 2) {
        node = current(node, bits[j], subj)

        if(!node) {
          break
        }

        current = bits[j + 1]
      }

      if(j >= length) {
        if(as_boolean) {
          return true
        }

        add(!bits.subject ? [orig] : subj)
      }
    }

    if(as_boolean) {
      return false
    }

    return !set.length ? false :
            set.length === 1 ? set[0] :
            set

    function add(items) {
      var next

      while(items.length) {
        next = items.shift()

        if(set.indexOf(next) === -1) {
          set.push(next)
        }
      }
    }
  }

  function check() {
    _check.bits = []
    _check.subject = false
    _check.push = function(token) {
      _check.bits.push(token)
    }

    return _check

    function _check(node, subj) {
      for(var i = 0, len = _check.bits.length; i < len; ++i) {
        if(!_check.bits[i](node)) {
          return false
        }
      }

      if(_check.subject) {
        subj.push(node)
      }

      return true
    }
  }

  function listContains(type, data) {
    return function(node) {
      var val = options[type](node)
      val =
        Array.isArray(val) ? val :
        val ? val.toString().split(/\s+/) :
        []
      return val.indexOf(data) >= 0
    }
  }

  function attr(token) {
    return token.data.lhs ?
      valid_attr(
          options.attr
        , token.data.lhs
        , token.data.cmp
        , token.data.rhs
      ) :
      valid_attr(options.attr, token.data)
  }

  function matches(type, data, matchComparison) {
    return function(node) {
      return matchComparison(type, options[type](node), data);
    }
  }

  function any_parents(node, next, subj) {
    do {
      node = options.parent(node)
    } while(node && !next(node, subj))

    return node
  }

  function direct_parent(node, next, subj) {
    node = options.parent(node)

    return node && next(node, subj) ? node : null
  }

  function direct_sibling(node, next, subj) {
    var parent = options.parent(node)
      , idx = 0
      , children

    children = options.children(parent)

    for(var i = 0, len = children.length; i < len; ++i) {
      if(children[i] === node) {
        idx = i

        break
      }
    }

    return children[idx - 1] && next(children[idx - 1], subj) ?
      children[idx - 1] :
      null
  }

  function any_sibling(node, next, subj) {
    var parent = options.parent(node)
      , children

    children = options.children(parent)

    for(var i = 0, len = children.length; i < len; ++i) {
      if(children[i] === node) {
        return null
      }

      if(next(children[i], subj)) {
        return children[i]
      }
    }

    return null
  }

  function pseudo(token) {
    return valid_pseudo(options, token.data, matchComparison)
  }

}

function entry(node, next, subj) {
  return next(node, subj) ? node : null
}

function valid_pseudo(options, match, matchComparison) {
  switch(match) {
    case 'empty': return valid_empty(options)
    case 'first-child': return valid_first_child(options)
    case 'last-child': return valid_last_child(options)
    case 'root': return valid_root(options)
  }

  if(match.indexOf('contains') === 0) {
    return valid_contains(options, match.slice(9, -1))
  }

  if(match.indexOf('any') === 0) {
    return valid_any_match(options, match.slice(4, -1), matchComparison)
  }

  if(match.indexOf('not') === 0) {
    return valid_not_match(options, match.slice(4, -1), matchComparison)
  }

  if(match.indexOf('nth-child') === 0) {
    return valid_nth_child(options, match.slice(10, -1))
  }

  return function() {
    return false
  }
}

function valid_not_match(options, selector, matchComparison) {
  var fn = parse(selector, options, matchComparison)

  return not_function

  function not_function(node) {
    return !fn(node, true)
  }
}

function valid_any_match(options, selector, matchComparison) {
  var fn = parse(selector, options, matchComparison)

  return fn
}

function valid_attr(fn, lhs, cmp, rhs) {
  return function(node) {
    var attr = fn(node, lhs)

    if(!cmp) {
      return !!attr
    }

    if(cmp.length === 1) {
      return attr == rhs
    }

    if(attr === void 0 || attr === null) {
      return false
    }

    return checkattr[cmp.charAt(0)](attr, rhs)
  }
}

function valid_first_child(options) {
  return function(node) {
    return options.children(options.parent(node))[0] === node
  }
}

function valid_last_child(options) {
  return function(node) {
    var children = options.children(options.parent(node))

    return children[children.length - 1] === node
  }
}

function valid_empty(options) {
  return function(node) {
    return options.children(node).length === 0
  }
}

function valid_root(options) {
  return function(node) {
    return !options.parent(node)
  }
}

function valid_contains(options, contents) {
  return function(node) {
    return options.contents(node).indexOf(contents) !== -1
  }
}

function valid_nth_child(options, nth) {
  var test = function(){ return false }
  if (nth == 'odd') {
    nth = '2n+1'
  } else if (nth == 'even') {
    nth = '2n'
  }
  var regexp = /( ?([-|\+])?(\d*)n)? ?((\+|-)? ?(\d+))? ?/
  var matches = nth.match(regexp)
  if (matches) {
    var growth = 0;
    if (matches[1]) {
      var positiveGrowth = (matches[2] != '-')
      growth = parseInt(matches[3] == '' ? 1 : matches[3])
      growth = growth * (positiveGrowth ? 1 : -1)
    }
    var offset = 0
    if (matches[4]) {
      offset = parseInt(matches[6])
      var positiveOffset = (matches[5] != '-')
      offset = offset * (positiveOffset ? 1 : -1)
    }
    if (growth == 0) {
      if (offset != 0) {
        test = function(children, node) {
          return children[offset - 1] === node
        }
      }
    } else {
      test = function(children, node) {
        var validPositions = []
        var len = children.length
        for (var position=1; position <= len; position++) {
          var divisible = ((position - offset) % growth) == 0;
          if (divisible) {
            if (growth > 0) {
              validPositions.push(position);
            } else {
              if ((position - offset) / growth >= 0) {
                validPositions.push(position);
              }
            }
          }
        }
        for(var i=0; i < validPositions.length; i++) {
          if (children[validPositions[i] - 1] === node) {
            return true
          }
        }
        return false
      }
    }
  }
  return function(node) {
    var children = options.children(options.parent(node))

    return test(children, node)
  }
}

var checkattr = {
    '$': check_end
  , '^': check_beg
  , '*': check_any
  , '~': check_spc
  , '|': check_dsh
}

function check_end(l, r) {
  return l.slice(l.length - r.length) === r
}

function check_beg(l, r) {
  return l.slice(0, r.length) === r
}

function check_any(l, r) {
  return l.indexOf(r) > -1
}

function check_spc(l, r) {
  return l.split(/\s+/).indexOf(r) > -1
}

function check_dsh(l, r) {
  return l.split('-').indexOf(r) > -1
}

function caseSensitiveComparison(type, pattern, data) {
  return pattern === data;
}

},{"./tokenizer":8}],8:[function(require,module,exports){
module.exports = tokenize

var through = require('through')

var PSEUDOSTART = 'pseudo-start'
  , ATTR_START = 'attr-start'
  , ANY_CHILD = 'any-child'
  , ATTR_COMP = 'attr-comp'
  , ATTR_END = 'attr-end'
  , PSEUDOPSEUDO = '::'
  , PSEUDOCLASS = ':'
  , READY = '(ready)'
  , OPERATION = 'op'
  , CLASS = 'class'
  , COMMA = 'comma'
  , ATTR = 'attr'
  , SUBJECT = '!'
  , TAG = 'tag'
  , STAR = '*'
  , ID = 'id'

function tokenize() {
  var escaped = false
    , gathered = []
    , state = READY 
    , data = []
    , idx = 0
    , stream
    , length
    , quote
    , depth
    , lhs
    , rhs
    , cmp
    , c

  return stream = through(ondata, onend)

  function ondata(chunk) {
    data = data.concat(chunk.split(''))
    length = data.length

    while(idx < length && (c = data[idx++])) {
      switch(state) {
        case READY: state_ready(); break
        case ANY_CHILD: state_any_child(); break
        case OPERATION: state_op(); break
        case ATTR_START: state_attr_start(); break
        case ATTR_COMP: state_attr_compare(); break
        case ATTR_END: state_attr_end(); break
        case PSEUDOCLASS:
        case PSEUDOPSEUDO: state_pseudo(); break
        case PSEUDOSTART: state_pseudostart(); break
        case ID:
        case TAG:
        case CLASS: state_gather(); break
      }
    }

    data = data.slice(idx)
  }

  function onend(chunk) {
    if(arguments.length) {
      ondata(chunk)
    }

    if(gathered.length) {
      stream.queue(token())
    }
  }

  function state_ready() {
    switch(true) {
      case '#' === c: state = ID; break
      case '.' === c: state = CLASS; break
      case ':' === c: state = PSEUDOCLASS; break
      case '[' === c: state = ATTR_START; break
      case '!' === c: subject(); break
      case '*' === c: star(); break
      case ',' === c: comma(); break
      case /[>\+~]/.test(c): state = OPERATION; break
      case /\s/.test(c): state = ANY_CHILD; break
      case /[\w\d\-_]/.test(c): state = TAG; --idx; break
    }
  }

  function subject() {
    state = SUBJECT
    gathered = ['!']
    stream.queue(token())
    state = READY
  }

  function star() {
    state = STAR
    gathered = ['*']
    stream.queue(token())
    state = READY
  }

  function comma() {
    state = COMMA
    gathered = [',']
    stream.queue(token())
    state = READY
  }

  function state_op() {
    if(/[>\+~]/.test(c)) {
      return gathered.push(c)
    }

    // chomp down the following whitespace.
    if(/\s/.test(c)) {
      return
    }

    stream.queue(token())
    state = READY
    --idx
  }

  function state_any_child() {
    if(/\s/.test(c)) {
      return
    }

    if(/[>\+~]/.test(c)) {
      return --idx, state = OPERATION
    }

    stream.queue(token())
    state = READY
    --idx
  }

  function state_pseudo() {
    rhs = state
    state_gather(true)

    if(state !== READY) {
      return
    }

    if(c === '(') {
      lhs = gathered.join('')
      state = PSEUDOSTART
      gathered.length = 0
      depth = 1
      ++idx

      return
    }

    state = PSEUDOCLASS
    stream.queue(token())
    state = READY
  }

  function state_pseudostart() {
    if(gathered.length === 0 && !quote) {
      quote = /['"]/.test(c) ? c : null

      if(quote) {
        return
      }
    }

    if(quote) {
      if(!escaped && c === quote) {
        quote = null

        return
      }

      if(c === '\\') {
        escaped ? gathered.push(c) : (escaped = true)

        return
      }

      escaped = false
      gathered.push(c)

      return
    }

    gathered.push(c)

    if(c === '(') {
      ++depth
    } else if(c === ')') {
      --depth
    }
    
    if(!depth) {
      gathered.pop()
      stream.queue({
          type: rhs 
        , data: lhs + '(' + gathered.join('') + ')'
      })

      state = READY
      lhs = rhs = cmp = null
      gathered.length = 0
    }

    return 
  }

  function state_attr_start() {
    state_gather(true)

    if(state !== READY) {
      return
    }

    if(c === ']') {
      state = ATTR
      stream.queue(token())
      state = READY

      return
    }

    lhs = gathered.join('')
    gathered.length = 0
    state = ATTR_COMP
  }

  function state_attr_compare() {
    if(/[=~|$^*]/.test(c)) {
      gathered.push(c)
    }

    if(gathered.length === 2 || c === '=') {
      cmp = gathered.join('')
      gathered.length = 0
      state = ATTR_END
      quote = null

      return
    }
  }

  function state_attr_end() {
    if(!gathered.length && !quote) {
      quote = /['"]/.test(c) ? c : null

      if(quote) {
        return
      }
    }

    if(quote) {
      if(!escaped && c === quote) {
        quote = null

        return
      }

      if(c === '\\') {
        if(escaped) {
          gathered.push(c)
        }

        escaped = !escaped

        return
      }

      escaped = false
      gathered.push(c)

      return
    }

    state_gather(true)

    if(state !== READY) {
      return
    }

    stream.queue({
        type: ATTR
      , data: {
            lhs: lhs
          , rhs: gathered.join('')
          , cmp: cmp
        }
    })

    state = READY
    lhs = rhs = cmp = null
    gathered.length = 0

    return 
  }

  function state_gather(quietly) {
    if(/[^\d\w\-_]/.test(c) && !escaped) {
      if(c === '\\') {
        escaped = true
      } else {
        !quietly && stream.queue(token())
        state = READY
        --idx
      }

      return
    }

    escaped = false
    gathered.push(c)
  }

  function token() {
    var data = gathered.join('')

    gathered.length = 0

    return {
        type: state
      , data: data
    }
  }
}

},{"through":32}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],12:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],13:[function(require,module,exports){
(function (process){
'use strict';

if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))
},{"_process":14}],14:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],15:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":16}],16:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":18,"./_stream_writable":20,"core-util-is":6,"inherits":11,"process-nextick-args":13}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":19,"core-util-is":6,"inherits":11}],18:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":16,"./internal/streams/BufferList":21,"./internal/streams/destroy":22,"./internal/streams/stream":23,"_process":14,"core-util-is":6,"events":9,"inherits":11,"isarray":24,"process-nextick-args":13,"safe-buffer":30,"string_decoder/":25,"util":3}],19:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":16,"core-util-is":6,"inherits":11}],20:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":16,"./internal/streams/destroy":22,"./internal/streams/stream":23,"_process":14,"core-util-is":6,"inherits":11,"process-nextick-args":13,"safe-buffer":30,"util-deprecate":33}],21:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":30,"util":3}],22:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":13}],23:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":9}],24:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],25:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":30}],26:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":27}],27:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":16,"./lib/_stream_passthrough.js":17,"./lib/_stream_readable.js":18,"./lib/_stream_transform.js":19,"./lib/_stream_writable.js":20}],28:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":27}],29:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":20}],30:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":4}],31:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":9,"inherits":11,"readable-stream/duplex.js":15,"readable-stream/passthrough.js":26,"readable-stream/readable.js":27,"readable-stream/transform.js":28,"readable-stream/writable.js":29}],32:[function(require,module,exports){
(function (process){
var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false, destroyed = false, buffer = [], _ended = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false)

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = stream.push = function (data) {
//    console.error(ended)
    if(_ended) return stream
    if(data === null) _ended = true
    buffer.push(data)
    drain()
    return stream
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable && stream.autoDestroy)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable && stream.autoDestroy)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    return stream
  }

  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('resume')
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
    return stream
  }
  return stream
}


}).call(this,require('_process'))
},{"_process":14,"stream":31}],33:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],34:[function(require,module,exports){
var indexOf = [].indexOf;

exports.setOrigin = function(vec, dimensions, origin) {
  var w, x, y, z;
  if (+dimensions === dimensions) {
    dimensions = [dimensions];
  }
  x = indexOf.call(dimensions, 1) >= 0 ? 0 : origin.x;
  y = indexOf.call(dimensions, 2) >= 0 ? 0 : origin.y;
  z = indexOf.call(dimensions, 3) >= 0 ? 0 : origin.z;
  w = indexOf.call(dimensions, 4) >= 0 ? 0 : origin.w;
  return vec.set(x, y, z, w);
};

exports.addOrigin = (function() {
  var v;
  v = new THREE.Vector4();
  return function(vec, dimension, origin) {
    exports.setOrigin(v, dimension, origin);
    return vec.add(v);
  };
})();

exports.setDimension = function(vec, dimension) {
  var w, x, y, z;
  x = dimension === 1 ? 1 : 0;
  y = dimension === 2 ? 1 : 0;
  z = dimension === 3 ? 1 : 0;
  w = dimension === 4 ? 1 : 0;
  return vec.set(x, y, z, w);
};

exports.setDimensionNormal = function(vec, dimension) {
  var w, x, y, z;
  x = dimension === 1 ? 1 : 0;
  y = dimension === 2 ? 1 : 0;
  z = dimension === 3 ? 1 : 0;
  w = dimension === 4 ? 1 : 0;
  return vec.set(y, z + x, w, 0);
};

exports.recenterAxis = (function() {
  var axis;
  axis = [0, 0];
  return function(x, dx, bend, f = 0) {
    var abs, fabs, max, min, x1, x2;
    if (bend > 0) {
      x1 = x;
      x2 = x + dx;
      abs = Math.max(Math.abs(x1), Math.abs(x2));
      fabs = abs * f;
      min = Math.min(x1, x2);
      max = Math.max(x1, x2);
      x = min + (-abs + fabs - min) * bend;
      dx = max + (abs + fabs - max) * bend - x;
    }
    axis[0] = x;
    axis[1] = dx;
    return axis;
  };
})();


},{}],35:[function(require,module,exports){
var getSizes;

exports.getSizes = getSizes = function(data) {
  var array, sizes;
  sizes = [];
  array = data;
  while (typeof array !== 'string' && ((array != null ? array.length : void 0) != null)) {
    sizes.push(array.length);
    array = array[0];
  }
  return sizes;
};

exports.getDimensions = function(data, spec = {}) {
  var channels, depth, dims, height, items, levels, n, nesting, ref, ref1, ref2, ref3, ref4, sizes, width;
  ({items, channels, width, height, depth} = spec);
  dims = {};
  if (!data || !data.length) {
    return {
      items,
      channels,
      width: width != null ? width : 0,
      height: height != null ? height : 0,
      depth: depth != null ? depth : 0
    };
  }
  sizes = getSizes(data);
  nesting = sizes.length;
  dims.channels = channels !== 1 && sizes.length > 1 ? sizes.pop() : channels;
  dims.items = items !== 1 && sizes.length > 1 ? sizes.pop() : items;
  dims.width = width !== 1 && sizes.length > 1 ? sizes.pop() : width;
  dims.height = height !== 1 && sizes.length > 1 ? sizes.pop() : height;
  dims.depth = depth !== 1 && sizes.length > 1 ? sizes.pop() : depth;
  levels = nesting;
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
  n = (ref = sizes.pop()) != null ? ref : 1;
  if (levels <= 1) {
    n /= (ref1 = dims.channels) != null ? ref1 : 1;
  }
  if (levels <= 2) {
    n /= (ref2 = dims.items) != null ? ref2 : 1;
  }
  if (levels <= 3) {
    n /= (ref3 = dims.width) != null ? ref3 : 1;
  }
  if (levels <= 4) {
    n /= (ref4 = dims.height) != null ? ref4 : 1;
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

exports.repeatCall = function(call, times) {
  switch (times) {
    case 0:
      return function() {
        return true;
      };
    case 1:
      return function() {
        return call();
      };
    case 2:
      return function() {
        call();
        return call();
      };
    case 3:
      return function() {
        call();
        call();
        call();
        return call();
      };
    case 4:
      return function() {
        call();
        call();
        call();
        return call();
      };
    case 6:
      return function() {
        call();
        call();
        call();
        call();
        call();
        return call();
      };
    case 8:
      return function() {
        call();
        call();
        call();
        call();
        call();
        return call();
      };
  }
};

exports.makeEmitter = function(thunk, items, channels) {
  var inner, n, next, outer;
  inner = (function() {
    switch (channels) {
      case 0:
        return function() {
          return true;
        };
      case 1:
        return function(emit) {
          return emit(thunk());
        };
      case 2:
        return function(emit) {
          return emit(thunk(), thunk());
        };
      case 3:
        return function(emit) {
          return emit(thunk(), thunk(), thunk());
        };
      case 4:
        return function(emit) {
          return emit(thunk(), thunk(), thunk(), thunk());
        };
      case 6:
        return function(emit) {
          return emit(thunk(), thunk(), thunk(), thunk(), thunk(), thunk());
        };
      case 8:
        return function(emit) {
          return emit(thunk(), thunk(), thunk(), thunk(), thunk(), thunk(), thunk(), thunk());
        };
    }
  })();
  next = null;
  while (items > 0) {
    n = Math.min(items, 8);
    outer = (function() {
      switch (n) {
        case 1:
          return function(emit) {
            return inner(emit);
          };
        case 2:
          return function(emit) {
            inner(emit);
            return inner(emit);
          };
        case 3:
          return function(emit) {
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 4:
          return function(emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 5:
          return function(emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 6:
          return function(emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 7:
          return function(emit) {
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            inner(emit);
            return inner(emit);
          };
        case 8:
          return function(emit) {
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
      next = (function(outer, next) {
        return function(emit) {
          outer(emit);
          return next(emit);
        };
      })(outer, next);
    } else {
      next = outer;
    }
    items -= n;
  }
  outer = next != null ? next : function() {
    return true;
  };
  outer.reset = thunk.reset;
  outer.rebind = thunk.rebind;
  return outer;
};

exports.getThunk = function(data) {
  var a, b, c, d, done, first, fourth, i, j, k, l, m, nesting, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, second, sizes, third, thunk;
  sizes = getSizes(data);
  nesting = sizes.length;
  a = sizes.pop();
  b = sizes.pop();
  c = sizes.pop();
  d = sizes.pop();
  done = false;
  switch (nesting) {
    case 0:
      thunk = function() {
        return 0;
      };
      thunk.reset = function() {};
      break;
    case 1:
      i = 0;
      thunk = function() {
        return data[i++];
      };
      thunk.reset = function() {
        return i = 0;
      };
      break;
    case 2:
      i = j = 0;
      first = (ref = data[j]) != null ? ref : [];
      thunk = function() {
        var ref1, x;
        x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          first = (ref1 = data[j]) != null ? ref1 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var ref1;
        i = j = 0;
        first = (ref1 = data[j]) != null ? ref1 : [];
      };
      break;
    case 3:
      i = j = k = 0;
      second = (ref1 = data[k]) != null ? ref1 : [];
      first = (ref2 = second[j]) != null ? ref2 : [];
      thunk = function() {
        var ref3, ref4, x;
        x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          if (j === b) {
            j = 0;
            k++;
            second = (ref3 = data[k]) != null ? ref3 : [];
          }
          first = (ref4 = second[j]) != null ? ref4 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var ref3, ref4;
        i = j = k = 0;
        second = (ref3 = data[k]) != null ? ref3 : [];
        first = (ref4 = second[j]) != null ? ref4 : [];
      };
      break;
    case 4:
      i = j = k = l = 0;
      third = (ref3 = data[l]) != null ? ref3 : [];
      second = (ref4 = third[k]) != null ? ref4 : [];
      first = (ref5 = second[j]) != null ? ref5 : [];
      thunk = function() {
        var ref6, ref7, ref8, x;
        x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          if (j === b) {
            j = 0;
            k++;
            if (k === c) {
              k = 0;
              l++;
              third = (ref6 = data[l]) != null ? ref6 : [];
            }
            second = (ref7 = third[k]) != null ? ref7 : [];
          }
          first = (ref8 = second[j]) != null ? ref8 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var ref6, ref7, ref8;
        i = j = k = l = 0;
        third = (ref6 = data[l]) != null ? ref6 : [];
        second = (ref7 = third[k]) != null ? ref7 : [];
        first = (ref8 = second[j]) != null ? ref8 : [];
      };
      break;
    case 5:
      i = j = k = l = m = 0;
      fourth = (ref6 = data[m]) != null ? ref6 : [];
      third = (ref7 = fourth[l]) != null ? ref7 : [];
      second = (ref8 = third[k]) != null ? ref8 : [];
      first = (ref9 = second[j]) != null ? ref9 : [];
      thunk = function() {
        var ref10, ref11, ref12, ref13, x;
        x = first[i++];
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
                fourth = (ref10 = data[m]) != null ? ref10 : [];
              }
              third = (ref11 = fourth[l]) != null ? ref11 : [];
            }
            second = (ref12 = third[k]) != null ? ref12 : [];
          }
          first = (ref13 = second[j]) != null ? ref13 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var ref10, ref11, ref12, ref13;
        i = j = k = l = m = 0;
        fourth = (ref10 = data[m]) != null ? ref10 : [];
        third = (ref11 = fourth[l]) != null ? ref11 : [];
        second = (ref12 = third[k]) != null ? ref12 : [];
        first = (ref13 = second[j]) != null ? ref13 : [];
      };
  }
  thunk.rebind = function(d) {
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
      return d = sizes.pop();
    }
  };
  return thunk;
};

exports.getStreamer = function(array, samples, channels, items) {
  var consume, count, done, emit, i, j, limit, reset, skip;
  limit = i = j = 0;
  reset = function() {
    limit = samples * channels * items;
    return i = j = 0;
  };
  count = function() {
    return j;
  };
  done = function() {
    return limit - i <= 0;
  };
  skip = (function() {
    switch (channels) {
      case 1:
        return function(n) {
          i += n;
          j += n;
        };
      case 2:
        return function(n) {
          i += n * 2;
          j += n;
        };
      case 3:
        return function(n) {
          i += n * 3;
          j += n;
        };
      case 4:
        return function(n) {
          i += n * 4;
          j += n;
        };
    }
  })();
  consume = (function() {
    switch (channels) {
      case 1:
        return function(emit) {
          emit(array[i++]);
          ++j;
        };
      case 2:
        return function(emit) {
          emit(array[i++], array[i++]);
          ++j;
        };
      case 3:
        return function(emit) {
          emit(array[i++], array[i++], array[i++]);
          ++j;
        };
      case 4:
        return function(emit) {
          emit(array[i++], array[i++], array[i++], array[i++]);
          ++j;
        };
    }
  })();
  emit = (function() {
    switch (channels) {
      case 1:
        return function(x) {
          array[i++] = x;
          ++j;
        };
      case 2:
        return function(x, y) {
          array[i++] = x;
          array[i++] = y;
          ++j;
        };
      case 3:
        return function(x, y, z) {
          array[i++] = x;
          array[i++] = y;
          array[i++] = z;
          ++j;
        };
      case 4:
        return function(x, y, z, w) {
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
  return {emit, consume, skip, count, done, reset};
};

exports.getLerpEmitter = function(expr1, expr2) {
  var args, emit1, emit2, emitter, lerp1, lerp2, p, q, r, s, scratch;
  scratch = new Float32Array(4096);
  lerp1 = lerp2 = 0.5;
  p = q = r = s = 0;
  emit1 = function(x, y, z, w) {
    r++;
    scratch[p++] = x * lerp1;
    scratch[p++] = y * lerp1;
    scratch[p++] = z * lerp1;
    return scratch[p++] = w * lerp1;
  };
  emit2 = function(x, y, z, w) {
    s++;
    scratch[q++] += x * lerp2;
    scratch[q++] += y * lerp2;
    scratch[q++] += z * lerp2;
    return scratch[q++] += w * lerp2;
  };
  args = Math.max(expr1.length, expr2.length);
  if (args <= 3) {
    emitter = function(emit, x, i) {
      var k, l, n, o, ref, results;
      p = q = r = s = 0;
      expr1(emit1, x, i);
      expr2(emit2, x, i);
      n = Math.min(r, s);
      l = 0;
      results = [];
      for (k = o = 0, ref = n; (0 <= ref ? o < ref : o > ref); k = 0 <= ref ? ++o : --o) {
        results.push(emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++]));
      }
      return results;
    };
  } else if (args <= 5) {
    emitter = function(emit, x, y, i, j) {
      var k, l, n, o, ref, results;
      p = q = r = s = 0;
      expr1(emit1, x, y, i, j);
      expr2(emit2, x, y, i, j);
      n = Math.min(r, s);
      l = 0;
      results = [];
      for (k = o = 0, ref = n; (0 <= ref ? o < ref : o > ref); k = 0 <= ref ? ++o : --o) {
        results.push(emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++]));
      }
      return results;
    };
  } else if (args <= 7) {
    emitter = function(emit, x, y, z, i, j, k) {
      var l, n, o, ref, results;
      p = q = r = s = 0;
      expr1(emit1, x, y, z, i, j, k);
      expr2(emit2, x, y, z, i, j, k);
      n = Math.min(r, s);
      l = 0;
      results = [];
      for (k = o = 0, ref = n; (0 <= ref ? o < ref : o > ref); k = 0 <= ref ? ++o : --o) {
        results.push(emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++]));
      }
      return results;
    };
  } else if (args <= 9) {
    emitter = function(emit, x, y, z, w, i, j, k, l) {
      var n, o, ref, results;
      p = q = r = s = 0;
      expr1(emit1, x, y, z, w, i, j, k, l);
      expr2(emit2, x, y, z, w, i, j, k, l);
      n = Math.min(r, s);
      l = 0;
      results = [];
      for (k = o = 0, ref = n; (0 <= ref ? o < ref : o > ref); k = 0 <= ref ? ++o : --o) {
        results.push(emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++]));
      }
      return results;
    };
  } else {
    emitter = function(emit, x, y, z, w, i, j, k, l, d, t) {
      var n, o, ref, results;
      p = q = 0;
      expr1(emit1, x, y, z, w, i, j, k, l, d, t);
      expr2(emit2, x, y, z, w, i, j, k, l, d, t);
      n = Math.min(r, s);
      l = 0;
      results = [];
      for (k = o = 0, ref = n; (0 <= ref ? o < ref : o > ref); k = 0 <= ref ? ++o : --o) {
        results.push(emit(scratch[l++], scratch[l++], scratch[l++], scratch[l++]));
      }
      return results;
    };
  }
  emitter.lerp = function(f) {
    return [lerp1, lerp2] = [1 - f, f];
  };
  return emitter;
};

exports.getLerpThunk = function(data1, data2) {
  var n, n1, n2, scratch, thunk1, thunk2;
  // Get sizes
  n1 = exports.getSizes(data1).reduce(function(a, b) {
    return a * b;
  });
  n2 = exports.getSizes(data2).reduce(function(a, b) {
    return a * b;
  });
  n = Math.min(n1, n2);
  // Create data thunks to copy (multi-)array
  thunk1 = exports.getThunk(data1);
  thunk2 = exports.getThunk(data2);
  // Create scratch array
  scratch = new Float32Array(n);
  scratch.lerp = function(f) {
    var a, b, i, results;
    thunk1.reset();
    thunk2.reset();
    i = 0;
    results = [];
    while (i < n) {
      a = thunk1();
      b = thunk2();
      results.push(scratch[i++] = a + (b - a) * f);
    }
    return results;
  };
  return scratch;
};


},{}],36:[function(require,module,exports){
var ease, π;

π = Math.PI;

ease = {
  clamp: function(x, a, b) {
    return Math.max(a, Math.min(b, x));
  },
  cosine: function(x) {
    return .5 - .5 * Math.cos(ease.clamp(x, 0, 1) * π);
  },
  binary: function(x) {
    return +(x >= .5);
  },
  hold: function(x) {
    return +(x >= 1);
  }
};

module.exports = ease;


},{}],37:[function(require,module,exports){
var index, letters, parseOrder, toFloatString, toType,
  indexOf = [].indexOf;

letters = 'xyzw'.split('');

index = {
  0: -1,
  x: 0,
  y: 1,
  z: 2,
  w: 3
};

parseOrder = function(order) {
  if (order === "" + order) {
    order = order.split('');
  }
  if (order === +order) {
    order = [order];
  }
  return order;
};

toType = function(type) {
  if (type === +type) {
    type = 'vec' + type;
  }
  if (type === 'vec1') {
    type = 'float';
  }
  return type;
};

toFloatString = function(value) {
  value = "" + value;
  if (value.indexOf('.') < 0) {
    return value += '.0';
  }
};

// Helper for float to byte conversion on the w axis, for readback
exports.mapByte2FloatOffset = function(stretch = 4) {
  var factor;
  factor = toFloatString(stretch);
  return `vec4 float2ByteIndex(vec4 xyzw, out float channelIndex) {
  float relative = xyzw.w / ${factor};
  float w = floor(relative);
  channelIndex = (relative - w) * ${factor};
  return vec4(xyzw.xyz, w);
}`;
};

// Sample data texture array
exports.sample2DArray = function(textures) {
  var body, divide;
  divide = function(a, b) {
    var mid, out;
    if (a === b) {
      out = `return texture2D(dataTextures[${a}], uv);`;
    } else {
      mid = Math.ceil(a + (b - a) / 2);
      out = `if (z < ${mid - .5}) {
  ${divide(a, mid - 1)}
}
else {
  ${divide(mid, b)}
}`;
    }
    return out = out.replace(/\n/g, "\n  ");
  };
  body = divide(0, textures - 1);
  return `uniform sampler2D dataTextures[${textures}];

vec4 sample2DArray(vec2 uv, float z) {
  ${body}
}`;
};

// Binary operator
exports.binaryOperator = function(type, op, curry) {
  type = toType(type);
  if (curry != null) {
    return `${type} binaryOperator(${type} a) {
  return a ${op} ${curry};
}`;
  } else {
    return `${type} binaryOperator(${type} a, ${type} b) {
  return a ${op} b;
}`;
  }
};

// Extend to n-vector with zeroes
exports.extendVec = function(from, to, value = 0) {
  var ctor, diff, parts;
  if (from > to) {
    return exports.truncateVec(from, to);
  }
  diff = to - from;
  from = toType(from);
  to = toType(to);
  value = toFloatString(value);
  parts = (function() {
    var results = [];
    for (var k = 0; 0 <= diff ? k <= diff : k >= diff; 0 <= diff ? k++ : k--){ results.push(k); }
    return results;
  }).apply(this).map(function(x) {
    if (x) {
      return value;
    } else {
      return 'v';
    }
  });
  ctor = parts.join(',');
  return `${to} extendVec(${from} v) { return ${to}(${ctor}); }`;
};

// Truncate n-vector
exports.truncateVec = function(from, to) {
  var swizzle;
  if (from < to) {
    return exports.extendVec(from, to);
  }
  swizzle = '.' + ('xyzw'.substr(0, to));
  from = toType(from);
  to = toType(to);
  return `${to} truncateVec(${from} v) { return v${swizzle}; }`;
};

// Inject float into 4-component vector
exports.injectVec4 = function(order) {
  var args, channel, i, k, len, mask, swizzler;
  swizzler = ['0.0', '0.0', '0.0', '0.0'];
  order = parseOrder(order);
  order = order.map(function(v) {
    if (v === "" + v) {
      return index[v];
    } else {
      return v;
    }
  });
  for (i = k = 0, len = order.length; k < len; i = ++k) {
    channel = order[i];
    swizzler[channel] = ['a', 'b', 'c', 'd'][i];
  }
  mask = swizzler.slice(0, 4).join(', ');
  args = ['float a', 'float b', 'float c', 'float d'].slice(0, order.length);
  return `vec4 inject(${args}) {
  return vec4(${mask});
}`;
};

// Apply 4-component vector swizzle
exports.swizzleVec4 = function(order, size = null) {
  var lookup, mask;
  lookup = ['0.0', 'xyzw.x', 'xyzw.y', 'xyzw.z', 'xyzw.w'];
  if (size == null) {
    size = order.length;
  }
  order = parseOrder(order);
  order = order.map(function(v) {
    var ref;
    if (ref = +v, indexOf.call([0, 1, 2, 3, 4], ref) >= 0) {
      v = +v;
    }
    if (v === "" + v) {
      v = index[v] + 1;
    }
    return lookup[v];
  });
  while (order.length < size) {
    order.push('0.0');
  }
  mask = order.join(', ');
  return `vec${size} swizzle(vec4 xyzw) {
  return vec${size}(${mask});
}`.replace(/vec1/g, 'float');
};

// Invert full or truncated swizzles for pointer lookups
exports.invertSwizzleVec4 = function(order) {
  var i, j, k, len, letter, mask, src, swizzler;
  swizzler = ['0.0', '0.0', '0.0', '0.0'];
  order = parseOrder(order);
  order = order.map(function(v) {
    if (v === +v) {
      return letters[v - 1];
    } else {
      return v;
    }
  });
  for (i = k = 0, len = order.length; k < len; i = ++k) {
    letter = order[i];
    src = letters[i];
    j = index[letter];
    swizzler[j] = `xyzw.${src}`;
  }
  mask = swizzler.join(', ');
  return `vec4 invertSwizzle(vec4 xyzw) {
  return vec4(${mask});
}`;
};

exports.identity = function(type) {
  var args;
  args = [].slice.call(arguments);
  if (args.length > 1) {
    args = args.map(function(t, i) {
      return ['inout', t, String.fromCharCode(97 + i)].join(' ');
    });
    args = args.join(', ');
    return `void identity(${args}) { }`;
  } else {
    return `${type} identity(${type} x) {
  return x;
}`;
  }
};

exports.constant = function(type, value) {
  return `${type} constant() {
  return ${value};
}`;
};

exports.toType = toType;


},{}],38:[function(require,module,exports){
exports.Axis = require('./axis');

exports.Data = require('./data');

exports.Ease = require('./ease');

exports.GLSL = require('./glsl');

exports.JS = require('./js');

exports.Pretty = require('./pretty');

exports.Three = require('./three');

exports.Ticks = require('./ticks');

exports.VDOM = require('./vdom');


},{"./axis":34,"./data":35,"./ease":36,"./glsl":37,"./js":39,"./pretty":40,"./three":41,"./ticks":42,"./vdom":43}],39:[function(require,module,exports){
// Merge multiple objects
exports.merge = function() {
  var i, k, len, obj, v, x;
  x = {};
  for (i = 0, len = arguments.length; i < len; i++) {
    obj = arguments[i];
    (function() {
      var results;
      results = [];
      for (k in obj) {
        v = obj[k];
        results.push(x[k] = v);
      }
      return results;
    })();
  }
  return x;
};

exports.clone = function(o) {
  return JSON.parse(JSON.serialize(o));
};

exports.parseQuoted = function(str) {
  var accum, char, chunk, i, len, list, munch, quote, token, unescape;
  accum = "";
  unescape = function(str) {
    return str = str.replace(/\\/g, '');
  };
  munch = function(next) {
    if (accum.length) {
      list.push(unescape(accum));
    }
    return accum = next != null ? next : "";
  };
  str = str.split(/(?=(?:\\.|["' ,]))/g);
  quote = false;
  list = [];
  for (i = 0, len = str.length; i < len; i++) {
    chunk = str[i];
    char = chunk[0];
    token = chunk.slice(1);
    switch (char) {
      case '"':
      case "'":
        if (quote) {
          if (quote === char) {
            quote = false;
            munch(token);
          } else {
            accum += chunk;
          }
        } else {
          if (accum !== '') {
            throw new Error(`ParseError: String \`${str}\` does not contain comma-separated quoted tokens.`);
          }
          quote = char;
          accum += token;
        }
        break;
      case ' ':
      case ',':
        if (!quote) {
          munch(token);
        } else {
          accum += chunk;
        }
        break;
      default:
        accum += chunk;
    }
  }
  munch();
  return list;
};


},{}],40:[function(require,module,exports){
var NUMBER_PRECISION, NUMBER_THRESHOLD, checkFactor, checkUnit, escapeHTML, formatFactors, formatFraction, formatMultiple, formatPrimes, prettyFormat, prettyJSXBind, prettyJSXPair, prettyJSXProp, prettyMarkup, prettyNumber, prettyPrint;

NUMBER_PRECISION = 5;

NUMBER_THRESHOLD = 0.0001;

checkFactor = function(v, f) {
  return Math.abs(v / f - Math.round(v / f)) < NUMBER_THRESHOLD;
};

checkUnit = function(v) {
  return checkFactor(v, 1);
};

formatMultiple = function(v, f, k, compact) {
  var d;
  d = Math.round(v / f);
  if (d === 1) {
    return `${k}`;
  }
  if (d === -1) {
    return `-${k}`;
  }
  if (k === '1') {
    return `${d}`;
  }
  if (compact) {
    return `${d}${k}`;
  } else {
    return `${d}*${k}`;
  }
};

formatFraction = function(v, f, k, compact) {
  var d;
  d = Math.round(v * f);
  if (Math.abs(d) === 1) {
    d = d < 0 ? "-" : "";
    d += k;
  } else if (k !== '1') {
    d += compact ? `${k}` : `*${k}`;
  }
  return `${d}/${f}`;
};

formatFactors = [
  {
    1: 1
  },
  {
    1: 1,
    τ: Math.PI * 2
  },
  {
    1: 1,
    π: Math.PI
  },
  {
    1: 1,
    τ: Math.PI * 2,
    π: Math.PI
  },
  {
    1: 1,
    e: Math.E
  },
  {
    1: 1,
    τ: Math.PI * 2,
    e: Math.E
  },
  {
    1: 1,
    π: Math.PI,
    e: Math.E
  },
  {
    1: 1,
    τ: Math.PI * 2,
    π: Math.PI,
    e: Math.E
  }
];

formatPrimes = [ // denominators 1-30 + interesting multiples
  [
    2 * 2 * 3 * 5 * 7,
    [
      2,
      3,
      5,
      7 // 1-7
    ]
  ],
  [
    2 * 2 * 2 * 3 * 3 * 5 * 5 * 7 * 7,
    [
      2,
      3,
      5,
      7 // 8-11
    ]
  ],
  [
    2 * 2 * 3 * 5 * 7 * 11 * 13,
    [
      2,
      3,
      5,
      7,
      11,
      13 // 12-16
    ]
  ],
  [
    2 * 2 * 17 * 19 * 23 * 29,
    [
      2,
      17,
      19,
      23,
      29 // 17-30
    ]
  ],
  [
    256 * 256,
    [2] // Powers of 2
  ],
  [
    1000000,
    [
      2,
      5 // Powers of 10
    ]
  ]
];

prettyNumber = function(options) {
  var cache, cacheIndex, compact, e, formatIndex, numberCache, pi, precision, tau, threshold;
  if (options) {
    ({cache, compact, tau, pi, e, threshold, precision} = options);
  }
  compact = +(!!(compact != null ? compact : true));
  tau = +(!!(tau != null ? tau : true));
  pi = +(!!(pi != null ? pi : true));
  e = +(!!(e != null ? e : true));
  cache = +(!!(cache != null ? cache : true));
  threshold = +(threshold != null ? threshold : NUMBER_THRESHOLD);
  precision = +(precision != null ? precision : NUMBER_PRECISION);
  formatIndex = tau + pi * 2 + e * 4;
  cacheIndex = formatIndex + threshold + precision;
  numberCache = cache ? {} : null;
  return function(v) {
    var best, cached, d, denom, f, i, j, k, len, len1, list, match, n, numer, out, p, ref;
    if (numberCache != null) {
      if ((cached = numberCache[v]) != null) {
        return cached;
      }
      if (v === Math.round(v)) {
        return numberCache[v] = `${v}`;
      }
    }
    out = `${v}`;
    best = out.length + out.indexOf('.') + 2;
    match = function(x) {
      var d;
      d = x.length;
      if (d <= best) {
        out = `${x}`;
        return best = d;
      }
    };
    ref = formatFactors[formatIndex];
    for (k in ref) {
      f = ref[k];
      if (checkUnit(v / f)) {
        match(`${formatMultiple(v / f, 1, k, compact)}`);
      } else {
        for (i = 0, len = formatPrimes.length; i < len; i++) {
          [denom, list] = formatPrimes[i];
          numer = v / f * denom;
          if (checkUnit(numer)) {
            for (j = 0, len1 = list.length; j < len1; j++) {
              p = list[j];
              while (checkUnit(n = numer / p) && checkUnit(d = denom / p)) {
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

prettyPrint = function(markup, level = 'info') {
  markup = prettyMarkup(markup);
  return console[level].apply(console, markup);
};

prettyMarkup = function(markup) {
  var args, attr, nested, obj, quoted, str, tag, txt;
  // quick n dirty
  tag = 'color:rgb(128,0,128)';
  attr = 'color:rgb(144,64,0)';
  str = 'color:rgb(0,0,192)';
  obj = 'color:rgb(0,70,156)';
  txt = 'color:inherit';
  quoted = false;
  nested = 0;
  args = [];
  markup = markup.replace(/(\\[<={}> "'])|(=>|[<={}> "'])/g, function(_, escape, char) {
    var res;
    if (escape != null ? escape.length : void 0) {
      return escape;
    }
    if (quoted && (char !== '"' && char !== "'")) {
      return char;
    }
    if (nested && (char !== '"' && char !== "'" && char !== '{' && char !== "}")) {
      return char;
    }
    return res = (function() {
      switch (char) {
        case '<':
          args.push(tag);
          return "%c<";
        case '>':
          args.push(tag);
          args.push(txt);
          return "%c>%c";
        case ' ':
          args.push(attr);
          return " %c";
        case '=':
        case '=>':
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
          break;
        case '{':
          if (nested++ === 0) {
            args.push(obj);
            return `%c${char}`;
          } else {
            return char;
          }
          break;
        case '}':
          if (--nested === 0) {
            args.push(tag);
            return `${char}%c`;
          } else {
            return char;
          }
          break;
        default:
          return char;
      }
    })();
  });
  return [markup].concat(args);
};

prettyJSXProp = function(k, v) {
  return prettyJSXPair(k, v, '=');
};

prettyJSXBind = function(k, v) {
  return prettyJSXPair(k, v, '=>');
};

prettyJSXPair = (function() {
  var formatNumber;
  formatNumber = prettyNumber({
    compact: false
  });
  return function(k, v, op) {
    var key, value, wrap;
    key = function(k) {
      if ((k === "" + +k) || k.match(/^[A-Za-z_][A-Za-z0-9]*$/)) {
        return k;
      } else {
        return JSON.stringify(k);
      }
    };
    wrap = function(v) {
      if (v.match('\n*"')) {
        return v;
      } else {
        return `{${v}}`;
      }
    };
    value = function(v) {
      var kk, vv;
      if (v instanceof Array) {
        return `[${v.map(value).join(', ')}]`;
      }
      switch (typeof v) {
        case 'string':
          if (v.match("\n")) {
            return `\"\n${v}\"\n`;
          } else {
            return `\"${v}\"`;
          }
          break;
        case 'function':
          v = `${v}`;
          if (v.match("\n")) {
            `\n${v}\n`;
          } else {
            `${v}`;
          }
          v = v.replace(/^function (\([^)]+\))/, "$1 =>");
          return v = v.replace(/^(\([^)]+\)) =>\s*{\s*return\s*([^}]+)\s*;\s*}/, "$1 => $2");
        case 'number':
          return formatNumber(v);
        default:
          if ((v != null) && v !== !!v) {
            if (v._up != null) {
              return value(v.map(function(v) {
                return v;
              }));
            }
            if (v.toMarkup) {
              return v.toString();
            } else {
              return "{" + ((function() {
                var results;
                results = [];
                for (kk in v) {
                  vv = v[kk];
                  if (v.hasOwnProperty(kk)) {
                    results.push(`${key(kk)}: ${value(vv)}`);
                  }
                }
                return results;
              })()).join(", ") + "}";
            }
          } else {
            return `${JSON.stringify(v)}`;
          }
      }
    };
    return [k, op, wrap(value(v))].join('');
  };
})();

escapeHTML = function(str) {
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/</g, '&lt;');
  return str = str.replace(/"/g, '&quot;');
};

prettyFormat = function(str) {
  var arg, args, i, len, out;
  args = [].slice.call(arguments);
  args.shift();
  out = "<span>";
  str = escapeHTML(str);
  for (i = 0, len = args.length; i < len; i++) {
    arg = args[i];
    str = str.replace(/%([a-z])/, function(_, f) {
      var v;
      v = args.shift();
      switch (f) {
        case 'c':
          return `</span><span style=\"${escapeHTML(v)}\">`;
        default:
          return escapeHTML(v);
      }
    });
  }
  out += str;
  return out += "</span>";
};

module.exports = {
  markup: prettyMarkup,
  number: prettyNumber,
  print: prettyPrint,
  format: prettyFormat,
  JSX: {
    prop: prettyJSXProp,
    bind: prettyJSXBind
  }
};

/*
for x in [1, 2, 1/2, 3, 1/3, Math.PI, Math.PI / 2, Math.PI * 2, Math.PI * 3, Math.PI * 4, Math.PI * 3 / 4, Math.E * 100, Math.E / 100]
  console.log prettyNumber({})(x)
*/


},{}],41:[function(require,module,exports){
exports.paramToGL = function(gl, p) {
  if (p === THREE.RepeatWrapping) {
    return gl.REPEAT;
  }
  if (p === THREE.ClampToEdgeWrapping) {
    return gl.CLAMP_TO_EDGE;
  }
  if (p === THREE.MirroredRepeatWrapping) {
    return gl.MIRRORED_REPEAT;
  }
  if (p === THREE.NearestFilter) {
    return gl.NEAREST;
  }
  if (p === THREE.NearestMipMapNearestFilter) {
    return gl.NEAREST_MIPMAP_NEAREST;
  }
  if (p === THREE.NearestMipMapLinearFilter) {
    return gl.NEAREST_MIPMAP_LINEAR;
  }
  if (p === THREE.LinearFilter) {
    return gl.LINEAR;
  }
  if (p === THREE.LinearMipMapNearestFilter) {
    return gl.LINEAR_MIPMAP_NEAREST;
  }
  if (p === THREE.LinearMipMapLinearFilter) {
    return gl.LINEAR_MIPMAP_LINEAR;
  }
  if (p === THREE.UnsignedByteType) {
    return gl.UNSIGNED_BYTE;
  }
  if (p === THREE.UnsignedShort4444Type) {
    return gl.UNSIGNED_SHORT_4_4_4_4;
  }
  if (p === THREE.UnsignedShort5551Type) {
    return gl.UNSIGNED_SHORT_5_5_5_1;
  }
  if (p === THREE.UnsignedShort565Type) {
    return gl.UNSIGNED_SHORT_5_6_5;
  }
  if (p === THREE.ByteType) {
    return gl.BYTE;
  }
  if (p === THREE.ShortType) {
    return gl.SHORT;
  }
  if (p === THREE.UnsignedShortType) {
    return gl.UNSIGNED_SHORT;
  }
  if (p === THREE.IntType) {
    return gl.INT;
  }
  if (p === THREE.UnsignedIntType) {
    return gl.UNSIGNED_INT;
  }
  if (p === THREE.FloatType) {
    return gl.FLOAT;
  }
  if (p === THREE.AlphaFormat) {
    return gl.ALPHA;
  }
  if (p === THREE.RGBFormat) {
    return gl.RGB;
  }
  if (p === THREE.RGBAFormat) {
    return gl.RGBA;
  }
  if (p === THREE.LuminanceFormat) {
    return gl.LUMINANCE;
  }
  if (p === THREE.LuminanceAlphaFormat) {
    return gl.LUMINANCE_ALPHA;
  }
  if (p === THREE.AddEquation) {
    return gl.FUNC_ADD;
  }
  if (p === THREE.SubtractEquation) {
    return gl.FUNC_SUBTRACT;
  }
  if (p === THREE.ReverseSubtractEquation) {
    return gl.FUNC_REVERSE_SUBTRACT;
  }
  if (p === THREE.ZeroFactor) {
    return gl.ZERO;
  }
  if (p === THREE.OneFactor) {
    return gl.ONE;
  }
  if (p === THREE.SrcColorFactor) {
    return gl.SRC_COLOR;
  }
  if (p === THREE.OneMinusSrcColorFactor) {
    return gl.ONE_MINUS_SRC_COLOR;
  }
  if (p === THREE.SrcAlphaFactor) {
    return gl.SRC_ALPHA;
  }
  if (p === THREE.OneMinusSrcAlphaFactor) {
    return gl.ONE_MINUS_SRC_ALPHA;
  }
  if (p === THREE.DstAlphaFactor) {
    return gl.DST_ALPHA;
  }
  if (p === THREE.OneMinusDstAlphaFactor) {
    return gl.ONE_MINUS_DST_ALPHA;
  }
  if (p === THREE.DstColorFactor) {
    return gl.DST_COLOR;
  }
  if (p === THREE.OneMinusDstColorFactor) {
    return gl.ONE_MINUS_DST_COLOR;
  }
  if (p === THREE.SrcAlphaSaturateFactor) {
    return gl.SRC_ALPHA_SATURATE;
  }
  return 0;
};

exports.paramToArrayStorage = function(type) {
  switch (type) {
    case THREE.UnsignedByteType:
      return Uint8Array;
    case THREE.ByteType:
      return Int8Array;
    case THREE.ShortType:
      return Int16Array;
    case THREE.UnsignedShortType:
      return Uint16Array;
    case THREE.IntType:
      return Int32Array;
    case THREE.UnsignedIntType:
      return Uint32Array;
    case THREE.FloatType:
      return Float32Array;
  }
};

exports.swizzleToEulerOrder = function(swizzle) {
  return swizzle.map(function(i) {
    return ['', 'X', 'Y', 'Z'][i];
  }).join('');
};

exports.transformComposer = function() {
  var euler, pos, quat, scl, transform;
  euler = new THREE.Euler();
  quat = new THREE.Quaternion();
  pos = new THREE.Vector3();
  scl = new THREE.Vector3();
  transform = new THREE.Matrix4();
  return function(position, rotation, quaternion, scale, matrix, eulerOrder = 'XYZ') {
    if (rotation != null) {
      if (eulerOrder instanceof Array) {
        eulerOrder = exports.swizzleToEulerOrder(eulerOrder);
      }
      euler.setFromVector3(rotation, eulerOrder);
      quat.setFromEuler(euler);
    } else {
      quat.set(0, 0, 0, 1);
    }
    if (quaternion != null) {
      quat.multiply(quaternion);
    }
    if (position != null) {
      pos.copy(position);
    } else {
      pos.set(0, 0, 0);
    }
    if (scale != null) {
      scl.copy(scale);
    } else {
      scl.set(1, 1, 1);
    }
    transform.compose(pos, quat, scl);
    if (matrix != null) {
      transform.multiplyMatrices(transform, matrix);
    }
    return transform;
  };
};


},{}],42:[function(require,module,exports){
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
/*
 Generate logarithmically spaced ticks in a range at sensible positions.
*/
var LINEAR, LOG, linear, log, make;

linear = function(min, max, n, unit, base, factor, start, end, zero, nice = true) {
  var distance, f, factors, i, ideal, ref, span, step, steps, ticks;
  n || (n = 10);
  unit || (unit = 1);
  base || (base = 10);
  factor || (factor = 1);
  // Calculate naive tick size.
  span = max - min;
  ideal = span / n;
  if (!nice) {
    ticks = (function() {
      var j, ref1, results;
      results = [];
      for (i = j = 0, ref1 = n; (0 <= ref1 ? j <= ref1 : j >= ref1); i = 0 <= ref1 ? ++j : --j) {
        results.push(min + i * ideal);
      }
      return results;
    })();
    if (!start) {
      ticks.shift();
    }
    if (!end) {
      ticks.pop();
    }
    if (!zero) {
      ticks = ticks.filter(function(x) {
        return x !== 0;
      });
    }
    return ticks;
  }
  // Round to the floor'd power of 'scale'
  unit || (unit = 1);
  base || (base = 10);
  ref = unit * (Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base))));
  // Make derived steps at sensible factors.
  factors = base % 2 === 0 ? [base / 2, 1, 1 / 2] : base % 3 === 0 ? [base / 3, 1, 1 / 3] : [1];
  steps = (function() {
    var j, len, results;
    results = [];
    for (j = 0, len = factors.length; j < len; j++) {
      f = factors[j];
      results.push(ref * f);
    }
    return results;
  })();
  // Find step size closest to ideal.
  distance = 2e308;
  step = steps.reduce(function(ref, step) {
    var d;
    f = step / ideal;
    d = Math.max(f, 1 / f);
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
  min = (Math.ceil((min / step) + +(!start))) * step;
  max = (Math.floor(max / step) - +(!end)) * step;
  n = Math.ceil((max - min) / step);
  // Generate equally spaced ticks
  ticks = (function() {
    var j, ref1, results;
    results = [];
    for (i = j = 0, ref1 = n; (0 <= ref1 ? j <= ref1 : j >= ref1); i = 0 <= ref1 ? ++j : --j) {
      results.push(min + i * step);
    }
    return results;
  })();
  if (!zero) {
    ticks = ticks.filter(function(x) {
      return x !== 0;
    });
  }
  return ticks;
};

log = function(min, max, n, unit, base, bias, start, end, zero, nice) {
  throw new Error("Log ticks not yet implemented.");
};

LINEAR = 0;

LOG = 1;

make = function(type, min, max, n, unit, base, bias, start, end, zero, nice) {
  switch (type) {
    case LINEAR:
      return linear(min, max, n, unit, base, bias, start, end, zero, nice);
    case LOG:
      return log(min, max, n, unit, base, bias, start, end, zero, nice);
  }
};

exports.make = make;

exports.linear = linear;

exports.log = log;


},{}],43:[function(require,module,exports){
// Quick'n'dirty Virtual DOM diffing
// with a poor man's React for components

// This is for rendering HTML with data from a GL readback. See DOM examples.
/*
 * el('example', props, children);
example: MathBox.DOM.createClass({
  render: (el, props, children) ->
 * VDOM node
    return el('span', { className: "foo" }, "Hello World")
})
 */
var HEAP, Types, apply, createClass, descriptor, element, hint, id, j, key, len, map, mount, prop, recycle, ref1, set, unmount, unset;

HEAP = [];

id = 0;

// Static render components
Types = {};

descriptor = function() {
  return {
    id: id++,
    type: null,
    props: null,
    children: null,
    rendered: null,
    instance: null
  };
};

hint = function(n) {
  var i, j, ref1, results;
  n *= 2;
  n = Math.max(0, HEAP.length - n);
  results = [];
  for (i = j = 0, ref1 = n; (0 <= ref1 ? j < ref1 : j > ref1); i = 0 <= ref1 ? ++j : --j) {
    results.push(HEAP.push(descriptor()));
  }
  return results;
};

element = function(type, props, children) {
  var el;
  el = HEAP.length ? HEAP.pop() : descriptor();
  el.type = type != null ? type : 'div';
  el.props = props != null ? props : null;
  el.children = children != null ? children : null;
  // Can't use `arguments` here to pass children as direct args, it de-optimizes label emitters
  return el;
};

recycle = function(el) {
  var child, children, j, len;
  if (!el.type) {
    return;
  }
  children = el.children;
  el.type = el.props = el.children = el.instance = null;
  HEAP.push(el);
  if (children != null) {
    for (j = 0, len = children.length; j < len; j++) {
      child = children[j];
      recycle(child);
    }
  }
};

apply = function(el, last, node, parent, index) {
  var base, child, childNodes, children, comp, dirty, i, j, k, key, l, len, len1, nextChildren, nextProps, nextState, prevProps, prevState, props, ref, ref1, ref2, ref3, ref4, ref5, same, should, type, v, value;
  if (el != null) {
    if (last == null) {
      // New node
      return mount(el, parent, index);
    } else {
      // Literal DOM node
      if (el instanceof Node) {
        same = el === last;
        if (same) {
          return;
        }
      } else {
        // Check compatibility
        same = typeof el === typeof last && last !== null && el !== null && el.type === last.type;
      }
      if (!same) {
        // Not compatible: unmount and remount
        unmount(last.instance, node);
        node.remove();
        return mount(el, parent, index);
      } else {
        // Maintain component ref
        el.instance = last.instance;
        // Check if it's a component
        type = ((ref1 = el.type) != null ? ref1.isComponentClass : void 0) ? el.type : Types[el.type];
        // Prepare to diff props and children
        props = last != null ? last.props : void 0;
        nextProps = el.props;
        children = (ref2 = last != null ? last.children : void 0) != null ? ref2 : null;
        nextChildren = el.children;
        if (nextProps != null) {
          nextProps.children = nextChildren;
        }
        // Component
        if (type != null) {
          // See if it changed
          dirty = node._COMPONENT_DIRTY;
          if ((props != null) !== (nextProps != null)) {
            dirty = true;
          }
          if (children !== nextChildren) {
            dirty = true;
          }
          if ((props != null) && (nextProps != null)) {
            if (!dirty) {
              for (key in props) {
                if (!nextProps.hasOwnProperty(key)) {
                  dirty = true;
                }
              }
            }
            if (!dirty) {
              for (key in nextProps) {
                value = nextProps[key];
                if ((ref = props[key]) !== value) {
                  dirty = true;
                }
              }
            }
          }
          if (dirty) {
            comp = last.instance;
            if (el.props == null) {
              el.props = {};
            }
            ref3 = comp.defaultProps;
            for (k in ref3) {
              v = ref3[k];
              if ((base = el.props)[k] == null) {
                base[k] = v;
              }
            }
            el.props.children = el.children;
            if (typeof comp.willReceiveProps === "function") {
              comp.willReceiveProps(el.props);
            }
            should = node._COMPONENT_FORCE || ((ref4 = typeof comp.shouldUpdate === "function" ? comp.shouldUpdate(el.props) : void 0) != null ? ref4 : true);
            if (should) {
              nextState = comp.getNextState();
              if (typeof comp.willUpdate === "function") {
                comp.willUpdate(el.props, nextState);
              }
            }
            prevProps = comp.props;
            prevState = comp.applyNextState();
            comp.props = el.props;
            comp.children = el.children;
            if (should) {
              el = el.rendered = typeof comp.render === "function" ? comp.render(element, el.props, el.children) : void 0;
              apply(el, last.rendered, node, parent, index);
              if (typeof comp.didUpdate === "function") {
                comp.didUpdate(prevProps, prevState);
              }
            }
          }
          return;
        } else {
          if (props != null) {
            for (key in props) {
              if (!nextProps.hasOwnProperty(key)) {
                // VDOM node
                unset(node, key, props[key]);
              }
            }
          }
          if (nextProps != null) {
            for (key in nextProps) {
              value = nextProps[key];
              if ((ref = props[key]) !== value && key !== 'children') {
                set(node, key, value, ref);
              }
            }
          }
          // Diff children
          if (nextChildren != null) {
            if ((ref5 = typeof nextChildren) === 'string' || ref5 === 'number') {
              // Insert text directly
              if (nextChildren !== children) {
                node.textContent = nextChildren;
              }
            } else {
              if (nextChildren.type != null) {
                // Single child
                apply(nextChildren, children, node.childNodes[0], node, 0);
              } else {
                // Diff children
                childNodes = node.childNodes;
                if (children != null) {
                  for (i = j = 0, len = nextChildren.length; j < len; i = ++j) {
                    child = nextChildren[i];
                    apply(child, children[i], childNodes[i], node, i);
                  }
                } else {
                  for (i = l = 0, len1 = nextChildren.length; l < len1; i = ++l) {
                    child = nextChildren[i];
                    apply(child, null, childNodes[i], node, i);
                  }
                }
              }
            }
          } else if (children != null) {
            // Unmount all child components
            unmount(null, node);
            // Remove all children
            node.innerHTML = '';
          }
        }
        return;
      }
    }
  }
  if (last != null) {
    // Removed node
    unmount(last.instance, node);
    return last.node.remove();
  }
};

mount = function(el, parent, index = 0) {
  var base, child, children, comp, ctor, i, j, k, key, len, node, ref1, ref2, ref3, ref4, ref5, ref6, type, v, value;
  type = ((ref1 = el.type) != null ? ref1.isComponentClass : void 0) ? el.type : Types[el.type];
  // Literal DOM node
  if (el instanceof Node) {
    node = el;
  } else {
    if (type != null) {
      // Component
      ctor = ((ref2 = el.type) != null ? ref2.isComponentClass : void 0) ? el.type : Types[el.type];
      if (!ctor) {
        el = el.rendered = element('noscript');
        node = mount(el, parent, index);
        return node;
      }
      // Construct component class
      el.instance = comp = new ctor(parent);
      if (el.props == null) {
        el.props = {};
      }
      ref3 = comp.defaultProps;
      for (k in ref3) {
        v = ref3[k];
        if ((base = el.props)[k] == null) {
          base[k] = v;
        }
      }
      el.props.children = el.children;
      // Do initial state transition
      comp.props = el.props;
      comp.children = el.children;
      comp.setState(typeof comp.getInitialState === "function" ? comp.getInitialState() : void 0);
      if (typeof comp.willMount === "function") {
        comp.willMount();
      }
      // Render
      el = el.rendered = typeof comp.render === "function" ? comp.render(element, el.props, el.children) : void 0;
      node = mount(el, parent, index);
      if (typeof comp.didMount === "function") {
        comp.didMount(el);
      }
      node._COMPONENT = comp;
      return node;
    } else if ((ref4 = typeof el) === 'string' || ref4 === 'number') {
      // Text
      node = document.createTextNode(el);
    } else {
      // VDOM Node
      node = document.createElement(el.type);
      ref5 = el.props;
      for (key in ref5) {
        value = ref5[key];
        set(node, key, value);
      }
    }
    children = el.children;
    if (children != null) {
      if ((ref6 = typeof children) === 'string' || ref6 === 'number') {
        // Insert text directly
        node.textContent = children;
      } else {
        if (children.type != null) {
          // Single child
          mount(children, node, 0);
        } else {
          for (i = j = 0, len = children.length; j < len; i = ++j) {
            child = children[i];
            // Insert children
            mount(child, node, i);
          }
        }
      }
    }
  }
  parent.insertBefore(node, parent.childNodes[index]);
  return node;
};

unmount = function(comp, node) {
  var child, j, k, len, ref1, results;
  if (comp) {
    if (typeof comp.willUnmount === "function") {
      comp.willUnmount();
    }
    for (k in comp) {
      delete comp[k];
    }
  }
  ref1 = node.childNodes;
  results = [];
  for (j = 0, len = ref1.length; j < len; j++) {
    child = ref1[j];
    unmount(child._COMPONENT, child);
    results.push(delete child._COMPONENT);
  }
  return results;
};

prop = function(key) {
  var j, len, prefix, prefixes;
  if (typeof document === 'undefined') {
    return true;
  }
  if (document.documentElement.style[key] != null) {
    return key;
  }
  key = key[0].toUpperCase() + key.slice(1);
  prefixes = ['webkit', 'moz', 'ms', 'o'];
  for (j = 0, len = prefixes.length; j < len; j++) {
    prefix = prefixes[j];
    if (document.documentElement.style[prefix + key] != null) {
      return prefix + key;
    }
  }
};

map = {};

ref1 = ['transform'];
for (j = 0, len = ref1.length; j < len; j++) {
  key = ref1[j];
  map[key] = prop(key);
}

set = function(node, key, value, orig) {
  var k, ref2, v;
  if (key === 'style') {
    for (k in value) {
      v = value[k];
      if ((orig != null ? orig[k] : void 0) !== v) {
        node.style[(ref2 = map[k]) != null ? ref2 : k] = v;
      }
    }
    return;
  }
  if (node[key] != null) {
    node[key] = value;
    return;
  }
  if (node instanceof Node) {
    node.setAttribute(key, value);
  }
};

unset = function(node, key, orig) {
  var k, ref2, v;
  if (key === 'style') {
    for (k in orig) {
      v = orig[k];
      node.style[(ref2 = map[k]) != null ? ref2 : k] = '';
    }
    return;
  }
  if (node[key] != null) {
    node[key] = void 0;
  }
  if (node instanceof Node) {
    node.removeAttribute(key);
  }
};

createClass = function(prototype) {
  var Component, a, aliases, b, ref2;
  aliases = {
    willMount: 'componentWillMount',
    didMount: 'componentDidMount',
    willReceiveProps: 'componentWillReceiveProps',
    shouldUpdate: 'shouldComponentUpdate',
    willUpdate: 'componentWillUpdate',
    didUpdate: 'componentDidUpdate',
    willUnmount: 'componentWillUnmount'
  };
  for (a in aliases) {
    b = aliases[a];
    if (prototype[a] == null) {
      prototype[a] = prototype[b];
    }
  }
  Component = class Component {
    constructor(node, props1 = {}, state1 = null, children1 = null) {
      var bind, k, nextState, v;
      this.props = props1;
      this.state = state1;
      this.children = children1;
      bind = function(f, self) {
        if (typeof f === 'function') {
          return f.bind(self);
        } else {
          return f;
        }
      };
      for (k in prototype) {
        v = prototype[k];
        this[k] = bind(v, this);
      }
      nextState = null;
      this.setState = function(state) {
        if (nextState == null) {
          nextState = state ? nextState != null ? nextState : {} : null;
        }
        for (k in state) {
          v = state[k];
          nextState[k] = v;
        }
        node._COMPONENT_DIRTY = true;
      };
      this.forceUpdate = function() {
        var el, results;
        node._COMPONENT_FORCE = node._COMPONENT_DIRTY = true;
        el = node;
        results = [];
        while (el = el.parentNode) {
          if (el._COMPONENT) {
            results.push(el._COMPONENT_FORCE = true);
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      this.getNextState = function() {
        return nextState;
      };
      this.applyNextState = function() {
        var prevState;
        node._COMPONENT_FORCE = node._COMPONENT_DIRTY = false;
        prevState = this.state;
        [nextState, this.state] = [null, nextState];
        return prevState;
      };
      return;
    }

  };
  Component.isComponentClass = true;
  Component.prototype.defaultProps = (ref2 = typeof prototype.getDefaultProps === "function" ? prototype.getDefaultProps() : void 0) != null ? ref2 : {};
  return Component;
};

module.exports = {element, recycle, apply, hint, Types, createClass};


},{}],44:[function(require,module,exports){
var Context, Model, Overlay, Primitives, Render, Shaders, Stage, Util;

Model = require('./model');

Overlay = require('./overlay');

Primitives = require('./primitives');

Render = require('./render');

Shaders = require('./shaders');

Stage = require('./stage');

Util = require('./util');

Context = (function() {
  class Context {
    //-------------------------------------------------------------------

      // Set up entire environment
    constructor(renderer, scene = null, camera = null) {
      var canvas;
      // DOM container
      this.canvas = canvas = renderer.domElement;
      this.element = null;
      // Rendering factory
      this.shaders = new Shaders.Factory(Shaders.Snippets);
      this.renderables = new Render.Factory(Render.Classes, renderer, this.shaders);
      this.overlays = new Overlay.Factory(Overlay.Classes, canvas);
      this.scene = this.renderables.make('scene', {
        scene: scene
      });
      this.camera = this.defaultCamera = camera != null ? camera : new THREE.PerspectiveCamera();
      // Primitives factory
      this.attributes = new Model.Attributes(Primitives.Types, this);
      this.primitives = new Primitives.Factory(Primitives.Types, this);
      this.root = this.primitives.make('root');
      // Document model
      this.model = new Model.Model(this.root);
      this.guard = new Model.Guard();
      // Scene controllers
      this.controller = new Stage.Controller(this.model, this.primitives);
      this.animator = new Stage.Animator(this);
      // Public API
      this.api = new Stage.API(this);
      // Global clocks, one real-time and one adjustable
      this.speed = 1;
      this.time = {
        now: +new Date() / 1000,
        time: 0,
        delta: 0,
        clock: 0,
        step: 0
      };
    }

    //-------------------------------------------------------------------
    // Lifecycle
    init() {
      this.scene.inject();
      this.overlays.inject();
      return this;
    }

    destroy() {
      this.scene.unject();
      this.overlays.unject();
      return this;
    }

    resize(size) {
      /*
      {
        viewWidth, viewHeight, renderWidth, renderHeight, aspect, pixelRatio
      }
      */
      if (size == null) {
        size = {};
      }
      if (size.renderWidth == null) {
        size.renderWidth = size.viewWidth != null ? size.viewWidth : size.viewWidth = 1280;
      }
      if (size.renderHeight == null) {
        size.renderHeight = size.viewHeight != null ? size.viewHeight : size.viewHeight = 720;
      }
      if (size.pixelRatio == null) {
        size.pixelRatio = size.renderWidth / Math.max(.000001, size.viewWidth);
      }
      if (size.aspect == null) {
        size.aspect = size.viewWidth / Math.max(.000001, size.viewHeight);
      }
      this.root.controller.resize(size);
      return this;
    }

    frame(time) {
      /*
      {
        now, clock, step
      }
      */
      this.pre(time);
      this.update();
      this.render();
      this.post();
      return this;
    }

    //-------------------------------------------------------------------
    // Broken down update/render cycle, for manual scheduling/invocation
    pre(time) {
      var base;
      if (!time) {
        time = {
          now: +new Date() / 1000,
          time: 0,
          delta: 0,
          clock: 0,
          step: 0
        };
        time.delta = this.time.now != null ? time.now - this.time.now : 0;
        if (time.delta > 1) {
          // Check for stopped render loop, assume 1 60fps frame
          time.delta = 1 / 60;
        }
        time.step = time.delta * this.speed;
        time.time = this.time.time + time.delta;
        time.clock = this.time.clock + time.step;
      }
      this.time = time;
      if (typeof (base = this.root.controller).pre === "function") {
        base.pre();
      }
      return this;
    }

    update() {
      var base;
      this.animator.update();
      this.attributes.compute();
      this.guard.iterate({
        step: () => {
          var change;
          change = this.attributes.digest();
          return change || (change = this.model.digest());
        },
        last: function() {
          return {
            attribute: this.attributes.getLastTrigger(),
            model: this.model.getLastTrigger()
          };
        }
      });
      if (typeof (base = this.root.controller).update === "function") {
        base.update();
      }
      this.camera = this.root.controller.getCamera();
      this.speed = this.root.controller.getSpeed();
      return this;
    }

    render() {
      var base;
      if (typeof (base = this.root.controller).render === "function") {
        base.render();
      }
      this.scene.render();
      return this;
    }

    post() {
      var base;
      if (typeof (base = this.root.controller).post === "function") {
        base.post();
      }
      return this;
    }

    //-------------------------------------------------------------------
    // Warmup mode, inserts only n objects into the scene per frame
    // Will render objects to offscreen 1x1 buffer to ensure shader is compiled even if invisible
    setWarmup(n) {
      this.scene.warmup(n);
      return this;
    }

    getPending() {
      return this.scene.pending.length;
    }

  };

  // Export for extending
  Context.Namespace = {
    Model,
    Overlay,
    Primitives,
    Render,
    Shaders,
    Stage,
    Util,
    DOM: Util.VDOM
  };

  return Context;

}).call(this);

module.exports = Context;


},{"./model":49,"./overlay":55,"./primitives":58,"./render":164,"./shaders":179,"./stage":184,"./util":190}],45:[function(require,module,exports){
// Global constructor
var Context, k, mathBox, ref, v;

mathBox = function(options) {
  var ref, three;
  three = THREE.Bootstrap(options);
  if (!three.fallback) {
    if (!three.Time) {
      three.install('time');
    }
    if (!three.MathBox) {
      three.install(['mathbox', 'splash']);
    }
  }
  return (ref = three.mathbox) != null ? ref : three;
};

// Just because
window.π = Math.PI;

window.τ = π * 2;

window.e = Math.E;

// Namespace
window.MathBox = exports;

window.mathBox = exports.mathBox = mathBox;

exports.version = '0.0.5';

// Load context and export namespace
exports.Context = Context = require('./context');

ref = Context.Namespace;
for (k in ref) {
  v = ref[k];
  exports[k] = v;
}

// Splash screen plugin
require('./splash');

// Threestrap plugin
THREE.Bootstrap.registerPlugin('mathbox', {
  defaults: {
    init: true,
    warmup: 2,
    inspect: true,
    splash: true
  },
  listen: ['ready', 'pre', 'update', 'post', 'resize'],
  // Install meta-API
  install: function(three) {
    var inited;
    inited = false;
    this.first = true;
    return three.MathBox = {
      // Init the mathbox context
      init: (options) => {
        var camera, scene;
        if (inited) {
          return;
        }
        inited = true;
        scene = (options != null ? options.scene : void 0) || this.options.scene || three.scene;
        camera = (options != null ? options.camera : void 0) || this.options.camera || three.camera;
        this.context = new Context(three.renderer, scene, camera);
        // Enable handy destructuring
        this.context.api.three = three.three = three;
        this.context.api.mathbox = three.mathbox = this.context.api;
        // v1 compatibility
        this.context.api.start = function() {
          return three.Loop.start();
        };
        this.context.api.stop = function() {
          return three.Loop.stop();
        };
        // Initialize and set initial size
        this.context.init();
        this.context.resize(three.Size);
        // Set warmup mode and track pending objects
        this.context.setWarmup(this.options.warmup);
        this.pending = 0;
        this.warm = !this.options.warmup;
        console.log('MathBox²', MathBox.version);
        return three.trigger({
          type: 'mathbox/init',
          version: MathBox.version,
          context: this.context
        });
      },
      // Destroy the mathbox context
      destroy: () => {
        if (!inited) {
          return;
        }
        inited = false;
        three.trigger({
          type: 'mathbox/destroy',
          context: this.context
        });
        this.context.destroy();
        delete three.mathbox;
        delete this.context.api.three;
        return delete this.context;
      },
      object: () => {
        var ref1;
        return (ref1 = this.context) != null ? ref1.scene.root : void 0;
      }
    };
  },
  uninstall: function(three) {
    three.MathBox.destroy();
    return delete three.MathBox;
  },
  // Ready event: right before mathbox() / THREE.bootstrap() returns
  ready: function(event, three) {
    if (this.options.init) {
      three.MathBox.init();
      return setTimeout(() => {
        if (this.options.inspect) {
          return this.inspect(three);
        }
      });
    }
  },
  // Log scene for inspection
  inspect: function(three) {
    this.context.api.inspect();
    if (!this.options.warmup) {
      return this.info(three);
    }
  },
  info: function(three) {
    var fmt, info;
    fmt = function(x) {
      var out;
      out = [];
      while (x >= 1000) {
        out.unshift(("000" + (x % 1000)).slice(-3));
        x = Math.floor(x / 1000);
      }
      out.unshift(x);
      return out.join(',');
    };
    info = three.renderer.info.render;
    return console.log('Geometry  ', fmt(info.faces) + ' faces  ', fmt(info.vertices) + ' vertices  ', fmt(info.calls) + ' draw calls  ');
  },
  // Hook up context events
  resize: function(event, three) {
    var ref1;
    return (ref1 = this.context) != null ? ref1.resize(three.Size) : void 0;
  },
  pre: function(event, three) {
    var ref1;
    return (ref1 = this.context) != null ? ref1.pre(three.Time) : void 0;
  },
  update: function(event, three) {
    var camera, ref1, ref2, ref3;
    if ((ref1 = this.context) != null) {
      ref1.update();
    }
    if ((camera = (ref2 = this.context) != null ? ref2.camera : void 0) && camera !== three.camera) {
      three.camera = camera;
    }
    three.Time.set({
      speed: this.context.speed
    });
    this.progress(this.context.getPending(), three);
    // Call render here instead of on:render because it renders off screen material
    // that needs to be available for rendering the actual frame.
    return (ref3 = this.context) != null ? ref3.render() : void 0;
  },
  post: function(event, three) {
    var ref1;
    return (ref1 = this.context) != null ? ref1.post() : void 0;
  },
  // Warmup progress changed
  progress: function(remain, three) {
    var current, pending, total;
    if (!(remain || this.pending)) {
      return;
    }
    // Latch max value until queue is emptied to get a total
    pending = Math.max(remain + this.options.warmup, this.pending);
    // Send events for external progress reporting
    current = pending - remain;
    total = pending;
    three.trigger({
      type: 'mathbox/progress',
      current: pending - remain,
      total: pending
    });
    if (remain === 0) {
      pending = 0;
    }
    this.pending = pending;
    // Report once when loaded
    if (current === total && !this.warm) {
      this.warm = true;
      if (this.options.inspect) {
        return this.info(three);
      }
    }
  }
});


},{"./context":44,"./splash":180}],46:[function(require,module,exports){
/*
 Custom attribute model
 - Organizes attributes by trait in .attributes
 - Provides constant-time .props / .get() access to flat dictionary
 - Provides .get(key) with or without trait namespaces
 - Change attributes with .set(key) or .set(dictionary)
 - Validation is double-buffered and in-place to detect changes and nops
 - Change notifications are coalesced per object and per trait, digested later
 - Values are stored in three.js uniform-style objects so they can be bound as GL uniforms
 - Originally passed (unnormalized) values are preserved and can be fetched via .orig()
 - Attributes can be defined as final/const
 - Attributes can be computed from both public or private expressions with .bind(key, false/true)
 - Expressions are time-dependent, can be time-travelled with .evaluate()
 - This enables continous simulation and data logging despite choppy animation updates

  Actual type and trait definitions are injected from Primitives
*/
var Attributes, Data, shallowCopy;

Attributes = class Attributes {
  constructor(definitions, context) {
    this.context = context;
    this.traits = definitions.Traits;
    this.types = definitions.Types;
    this.pending = [];
    this.bound = [];
    this.last = null;
  }

  make(type) {
    return {
      enum: typeof type.enum === "function" ? type.enum() : void 0,
      type: typeof type.uniform === "function" ? type.uniform() : void 0,
      value: type.make()
    };
  }

  apply(object, config) {
    return new Data(object, config, this);
  }

  bind(callback) {
    return this.bound.push(callback);
  }

  unbind(callback) {
    var cb;
    return this.bound = (function() {
      var j, len, ref, results;
      ref = this.bound;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        cb = ref[j];
        if (cb !== callback) {
          results.push(cb);
        }
      }
      return results;
    }).call(this);
  }

  queue(callback, object, key, value) {
    this.lastObject = object;
    this.lastKey = key;
    this.lastValue = value;
    return this.pending.push(callback);
  }

  invoke(callback) {
    return callback(this.context.time.clock, this.context.time.step);
  }

  compute() {
    var cb, j, len, ref;
    if (this.bound.length) {
      ref = this.bound;
      for (j = 0, len = ref.length; j < len; j++) {
        cb = ref[j];
        this.invoke(cb);
      }
    }
  }

  digest() {
    var callback, calls, j, len;
    if (!this.pending.length) {
      return false;
    }
    [calls, this.pending] = [this.pending, []];
    for (j = 0, len = calls.length; j < len; j++) {
      callback = calls[j];
      callback();
    }
    return true;
  }

  getTrait(name) {
    return this.traits[name];
  }

  getLastTrigger() {
    return `${this.lastObject.toString()} - ${this.lastKey}=\`${this.lastValue}\``;
  }

};

shallowCopy = function(x) {
  var k, out, v;
  out = {};
  for (k in x) {
    v = x[k];
    out[k] = v;
  }
  return out;
};

Data = class Data {
  constructor(object, config, _attributes) {
    var _bound, _computed, _eval, _expr, _finals, addSpec, bind, change, changed, changes, constant, data, define, digest, dirty, equalors, equals, evaluate, event, expr, finals, flattened, freeform, get, getNS, j, key, len, list, makers, mapTo, name, ns, oldComputed, oldExpr, oldOrig, oldProps, originals, props, ref, set, shorthand, spec, to, touched, touches, trait, traits, unbind, unique, validate, validators, value, values;
    ({traits, props, finals, freeform} = config);
    data = this;
    // Save existing (original) values if re-applying
    if ((object.props != null) && (object.expr != null) && (object.orig != null) && (object.computed != null) && (object.attributes != null)) {
      oldProps = shallowCopy(object.props);
      oldExpr = shallowCopy(object.expr);
      oldOrig = object.orig();
      oldComputed = object.computed();
      // Dispose of old attributes/bindings
      if ((ref = object.attributes) != null) {
        ref.dispose();
      }
    }
    // Flattened and original values
    flattened = {};
    originals = {};
    // Aliases
    mapTo = {};
    to = function(name) {
      var ref1;
      return (ref1 = mapTo[name]) != null ? ref1 : name;
    };
    define = function(name, alias) {
      if (mapTo[alias]) {
        throw new Error(`${object.toString()} - Duplicate property \`${alias}\``);
      }
      return mapTo[alias] = name;
    };
    // Get/set
    get = function(key) {
      var ref1, ref2, ref3;
      return (ref1 = (ref2 = data[key]) != null ? ref2.value : void 0) != null ? ref1 : (ref3 = data[to(key)]) != null ? ref3.value : void 0;
    };
    set = function(key, value, ignore, initial) {
      var attr, short, valid, validated;
      key = to(key);
      // Look for defined attribute
      if ((attr = data[key]) == null) {
        if (!freeform) {
          throw new Error(`${object.toString()} - Setting unknown property \`${key}={${value}}\``);
        }
        // Define attribute on the fly (placeholder)
        attr = data[key] = {
          short: key,
          type: null,
          last: null,
          value: null
        };
        validators[key] = function(v) {
          return v;
        };
      }
      if (!ignore) {
        // See if prop isn't bound
        if (_expr[key]) {
          throw new Error(`${object.toString()} - Can't set bound property \`${key}={${value}}\``);
        }
        // See if prop isn't computed
        if (_computed[key]) {
          throw new Error(`${object.toString()} - Can't set computed property \`${key}={${value}}\``);
        }
        // See if prop isn't final
        if (_finals[key]) {
          throw new Error(`${object.toString()} - Can't set final property \`${key}={${value}}\``);
        }
      }
      // Validate new value
      valid = true;
      validated = validate(key, value, attr.last, function() {
        valid = false;
        return null;
      });
      // Accept and insert into flattened/original list
      if (valid) {
        [attr.value, attr.last] = [validated, attr.value];
        // Remember in flattened dict
        short = attr.short;
        flattened[short] = validated;
        if (!ignore) { // Remember original unvalidated value
          originals[short] = value;
        }
        if (!(initial || equals(key, attr.value, attr.last))) {
          
          // Compare to last value unless setting initial value
          change(key, value);
        }
      }
      return valid;
    };
    constant = function(key, value, initial) {
      key = to(key);
      set(key, value, true, initial);
      return _finals[key] = true;
    };
    // Prop/expression binding
    expr = {};
    _bound = {};
    _eval = {};
    _expr = {};
    _computed = {};
    _finals = {};
    bind = function(key, expression, computed = false) {
      var list, short;
      key = to(key);
      if (typeof expression !== 'function') {
        throw new Error(`${object.toString()} - Expression \`${key}=>{${expr}}\` is not a function`);
      }
      if (_expr[key]) {
        throw new Error(`${object.toString()} - Property \`${key}=>{${expr}}\` is already bound`);
      }
      if (_computed[key]) {
        throw new Error(`${object.toString()} - Property \`${key}\` is computed`);
      }
      if (_finals[key]) {
        throw new Error(`${object.toString()} - Property \`${key}\` is final`);
      }
      list = computed ? _computed : _expr;
      list[key] = expression;
      short = data[key] != null ? data[key].short : key;
      if (!computed) { // flattened
        expr[short] = expression;
      }
      _eval[key] = expression;
      expression = expression.bind(object);
      _bound[key] = function(t, d) {
        var clock, ref1;
        if (clock = (ref1 = object.clock) != null ? ref1.getTime() : void 0) {
          t = clock.clock;
          d = clock.step;
        }
        return object.set(key, expression(t, d), true);
      };
      return _attributes.bind(_bound[key]);
    };
    unbind = function(key, computed = false) {
      var list;
      key = to(key);
      list = computed ? _computed : _expr;
      if (!list[key]) {
        return;
      }
      _attributes.unbind(_bound[key]);
      delete _bound[key];
      delete list[key];
      if (data[key] != null) {
        key = data[key].short;
      }
      return delete expr[key];
    };
    evaluate = function(key, time) {
      var ref1;
      key = to(key);
      return (ref1 = typeof _eval[key] === "function" ? _eval[key](time, 0) : void 0) != null ? ref1 : data[key].value;
    };
    // Public interface
    object.expr = expr;
    object.props = flattened;
    object.evaluate = function(key, time) {
      var out;
      if (key != null) {
        return evaluate(key, time);
      } else {
        out = {};
        for (key in props) {
          out[key] = evaluate(key, time);
        }
        return out;
      }
    };
    object.get = function(key) {
      if (key != null) {
        return get(key);
      } else {
        return flattened;
      }
    };
    object.set = function(key, value, ignore, initial) {
      var options;
      if (typeof key === 'string') {
        set(key, value, ignore, initial);
      } else {
        initial = ignore;
        ignore = value;
        options = key;
        for (key in options) {
          value = options[key];
          set(key, value, ignore, initial);
        }
      }
    };
    object.bind = function(key, expr, computed) {
      var binds;
      if (typeof key === 'string') {
        bind(key, expr, computed);
      } else {
        computed = expr;
        binds = key;
        for (key in binds) {
          expr = binds[key];
          bind(key, expr, computed);
        }
      }
    };
    object.unbind = function(key, computed) {
      var binds;
      if (typeof key === 'string') {
        unbind(key, computed);
      } else {
        computed = expr;
        binds = key;
        for (key in binds) {
          unbind(key, computed);
        }
      }
    };
    object.attribute = function(key) {
      if (key != null) {
        return data[to(key)];
      } else {
        return data;
      }
    };
    object.orig = function(key) {
      if (key != null) {
        return originals[to(key)];
      } else {
        return shallowCopy(originals);
      }
    };
    object.computed = function(key) {
      if (key != null) {
        return _computed[to(key)];
      } else {
        return shallowCopy(_computed);
      }
    };
    // Validate value for key
    makers = {};
    validators = {};
    equalors = {};
    equals = function(key, value, target) {
      return equalors[key](value, target);
    };
    validate = function(key, value, target, invalid) {
      return validators[key](value, target, invalid);
    };
    object.validate = function(key, value) {
      var make, target;
      key = to(key);
      make = makers[key];
      if (make != null) {
        target = make();
      }
      return target = validate(key, value, target, function() {
        throw new Error(`${object.toString()} - Invalid value \`${key}={${value}}\``);
      });
    };
    // Accumulate changes
    dirty = false;
    changes = {};
    touches = {};
    changed = {};
    touched = {};
    getNS = function(key) {
      return key.split('.')[0];
    };
    change = function(key, value) {
      var trait;
      if (!dirty) {
        dirty = true;
        _attributes.queue(digest, object, key, value);
      }
      trait = getNS(key);
      // Log change
      changes[key] = true;
      // Mark trait/namespace as dirty
      return touches[trait] = true;
    };
    event = {
      type: 'change',
      changed: null,
      touched: null
    };
    // Notify listeners of accumulated changes
    digest = function() {
      var k, results, trait;
      // Swap double buffered changes objects
      event.changed = changes;
      event.touched = touches;
      changes = changed;
      touches = touched;
      changed = event.changed;
      touched = event.touched;
      // Reset all dirty flags
      dirty = false;
      for (k in changes) {
        changes[k] = false;
      }
      for (k in touches) {
        touches[k] = false;
      }
      event.type = 'change';
      object.trigger(event);
      results = [];
      for (trait in event.touched) {
        event.type = `change:${trait}`;
        results.push(object.trigger(event));
      }
      return results;
    };
    // Convert name.trait.key into keyName
    shorthand = function(name) {
      var parts, suffix;
      parts = name.split(/\./g);
      suffix = parts.pop();
      parts.pop(); // Discard
      parts.unshift(suffix);
      return parts.reduce(function(a, b) {
        return a + b.charAt(0).toUpperCase() + b.substring(1);
      });
    };
    // Define attributes for given trait spec by namespace
    addSpec = function(name, spec) {
      var attr, key, ref1, ref2, results, short, type, value;
      results = [];
      for (key in spec) {
        type = spec[key];
        key = [name, key].join('.');
        short = shorthand(key);
        // Make attribute object
        data[key] = attr = {
          T: type,
          ns: name,
          short: short,
          enum: typeof type.enum === "function" ? type.enum() : void 0,
          type: typeof type.uniform === "function" ? type.uniform() : void 0,
          last: type.make(),
          value: value = type.make()
        };
        // Define flat namespace alias
        define(key, short);
        flattened[short] = value;
        // Collect makers, validators and comparators
        makers[key] = type.make;
        validators[key] = (ref1 = type.validate) != null ? ref1 : function(a) {
          return a;
        };
        results.push(equalors[key] = (ref2 = type.equals) != null ? ref2 : function(a, b) {
          return a === b;
        });
      }
      return results;
    };
    // Add in traits
    list = [];
    values = {};
    for (j = 0, len = traits.length; j < len; j++) {
      trait = traits[j];
      [trait, ns] = trait.split(':');
      name = ns ? [ns, trait].join('.') : trait;
      spec = _attributes.getTrait(trait);
      list.push(trait);
      if (spec != null) {
        addSpec(name, spec);
      }
    }
    // Add custom props by namespace
    if (props != null) {
      for (ns in props) {
        spec = props[ns];
        addSpec(ns, spec);
      }
    }
    // Store array of traits
    unique = list.filter(function(object, i) {
      return list.indexOf(object) === i;
    });
    object.traits = unique;
    if (oldProps != null) {
      // Set previous internal values
      object.set(oldProps, true, true);
    }
    // Set final props
    if (finals != null) {
      for (key in finals) {
        value = finals[key];
        constant(key, value, true);
      }
    }
    if (oldOrig != null) {
      // Set previous external values
      object.set(oldOrig, false, true);
    }
    if (oldComputed != null) {
      // Bind previous computed props/expressions
      object.bind(oldComputed, true);
    }
    if (oldExpr != null) {
      object.bind(oldExpr, false);
    }
    // Destructor
    this.dispose = function() {
      for (key in _computed) {
        unbind(key, true);
      }
      for (key in _expr) {
        unbind(key, false);
      }
      props = {};
      delete object.attributes;
      delete object.get;
      return delete object.set;
    };
    null;
  }

};

module.exports = Attributes;


},{}],47:[function(require,module,exports){
var Group, Node;

Node = require('./node');

Group = class Group extends Node {
  constructor(type, defaults, options, binds, config, attributes) {
    super(type, defaults, options, binds, config, attributes);
    this.children = [];
    this.on('reindex', (event) => {
      var child, j, len, ref, results;
      ref = this.children;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        results.push(child.trigger(event));
      }
      return results;
    });
  }

  add(node) {
    var ref;
    if ((ref = node.parent) != null) {
      ref.remove(node);
    }
    node._index(this.children.length, this);
    this.children.push(node);
    return node._added(this);
  }

  remove(node) {
    var i, index, j, len, ref, ref1;
    if ((ref = node.children) != null ? ref.length : void 0) {
      node.empty();
    }
    index = this.children.indexOf(node);
    if (index === -1) {
      return;
    }
    this.children.splice(index, 1);
    node._index(null);
    node._removed(this);
    ref1 = this.children;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      node = ref1[i];
      if (i >= index) {
        node._index(i);
      }
    }
  }

  empty() {
    var children, j, len, node;
    children = this.children.slice().reverse();
    for (j = 0, len = children.length; j < len; j++) {
      node = children[j];
      this.remove(node);
    }
  }

};

module.exports = Group;


},{"./node":51}],48:[function(require,module,exports){
var Guard;

Guard = class Guard {
  constructor(limit1 = 10) {
    this.limit = limit1;
  }

  iterate(options) {
    var last, limit, run, step;
    ({step, last} = options);
    limit = this.limit;
    while (run = step()) {
      if (!--limit) {
        console.warn("Last iteration", typeof last === "function" ? last() : void 0);
        throw new Error("Exceeded iteration limit.");
      }
    }
    return null;
  }

};

module.exports = Guard;


},{}],49:[function(require,module,exports){
exports.Attributes = require('./attributes');

exports.Group = require('./group');

exports.Guard = require('./guard');

exports.Model = require('./model');

exports.Node = require('./node');


},{"./attributes":46,"./group":47,"./guard":48,"./model":50,"./node":51}],50:[function(require,module,exports){
var ALL, AUTO, CLASS, ID, Model, TRAIT, TYPE, cssauron, language,
  indexOf = [].indexOf;

cssauron = require('cssauron');

ALL = '*';

ID = /^#([A-Za-z0-9_])$/;

CLASS = /^\.([A-Za-z0-9_]+)$/;

TRAIT = /^\[([A-Za-z0-9_]+)\]$/;

TYPE = /^[A-Za-z0-9_]+$/;

AUTO = /^<([0-9]+|<*)$/;

// Lazy load CSSauron
language = null;

/*

  Model that wraps a root node and its children.

  Monitors adds, removals and ID/class changes.
  Enables CSS selectors, both querying and watching.

  Watchers are primed differentially as changes come in,
  and fired with digest().

*/
Model = class Model {
  constructor(root) {
    var add, addClasses, addID, addNode, addTags, addTraits, addType, adopt, check, dispose, force, hashTags, prime, remove, removeClasses, removeID, removeNode, removeTags, removeTraits, removeType, unhashTags, update;
    this.root = root;
    this.root.model = this;
    this.root.root = this.root;
    this.ids = {};
    this.classes = {};
    this.traits = {};
    this.types = {};
    this.nodes = [];
    this.watchers = [];
    this.fire = false;
    this.lastNode = null;
    this.event = {
      type: 'update'
    };
    // Init CSSauron
    if (language == null) {
      language = cssauron({
        tag: 'type',
        id: 'id',
        class: "classes.join(' ')",
        parent: 'parent',
        children: 'children',
        attr: 'traits.hash[attr]'
      });
    }
    // Triggered by child addition/removal
    add = (event) => {
      return adopt(event.node);
    };
    remove = (event) => {
      return dispose(event.node);
    };
    this.root.on('add', add);
    this.root.on('remove', remove);
    // Track node lifecycle
    adopt = (node) => {
      addNode(node);
      addType(node);
      addTraits(node);
      node.on('change:node', update);
      update(null, node, true);
      return force(node);
    };
    dispose = (node) => {
      removeNode(node);
      removeType(node);
      removeTraits(node);
      removeID(node.id, node);
      removeClasses(node.classes, node);
      node.off('change:node', update);
      return force(node);
    };
    // Watcher cycle for catching changes in id/classes
    prime = (node) => {
      var i, len, ref, watcher;
      ref = this.watchers;
      for (i = 0, len = ref.length; i < len; i++) {
        watcher = ref[i];
        watcher.match = watcher.matcher(node);
      }
      return null;
    };
    check = (node) => {
      var fire, i, len, ref, watcher;
      ref = this.watchers;
      for (i = 0, len = ref.length; i < len; i++) {
        watcher = ref[i];
        fire = watcher.fire || (watcher.fire = watcher.match !== watcher.matcher(node));
        if (fire) {
          this.lastNode = node;
        }
        this.fire || (this.fire = fire);
      }
      return null;
    };
    force = (node) => {
      var fire, i, len, ref, watcher;
      ref = this.watchers;
      for (i = 0, len = ref.length; i < len; i++) {
        watcher = ref[i];
        fire = watcher.fire || (watcher.fire = watcher.matcher(node));
        if (fire) {
          this.lastNode = node;
        }
        this.fire || (this.fire = fire);
      }
      return null;
    };
    this.digest = () => {
      var i, len, ref, watcher;
      if (!this.fire) {
        return false;
      }
      ref = this.watchers.slice();
      for (i = 0, len = ref.length; i < len; i++) {
        watcher = ref[i];
        if (!watcher.fire) {
          continue;
        }
        watcher.fire = false;
        watcher.handler();
      }
      this.fire = false;
      return true;
    };
    // Track id/class changes
    update = (event, node, init) => {
      var _id, _klass, classes, id, klass, primed, ref, ref1;
      _id = init || event.changed['node.id'];
      _klass = init || event.changed['node.classes'];
      primed = false;
      if (_id) {
        id = node.get('node.id');
        if (id !== node.id) {
          if (!init) {
            prime(node);
          }
          primed = true;
          if (node.id != null) {
            removeID(node.id, node);
          }
          addID(id, node);
        }
      }
      if (_klass) {
        classes = (ref = node.get('node.classes')) != null ? ref : [];
        klass = classes.join(',');
        if (klass !== ((ref1 = node.classes) != null ? ref1.klass : void 0)) {
          classes = classes.slice();
          if (!(init || primed)) {
            prime(node);
          }
          primed = true;
          if (node.classes != null) {
            removeClasses(node.classes, node);
          }
          addClasses(classes, node);
          node.classes = classes;
          node.classes.klass = klass;
        }
      }
      if (!init && primed) {
        check(node);
      }
      return null;
    };
    // Manage lookup tables for types/classes/traits
    addTags = function(sets, tags, node) {
      var i, k, len, list, ref;
      if (tags == null) {
        return;
      }
      for (i = 0, len = tags.length; i < len; i++) {
        k = tags[i];
        list = (ref = sets[k]) != null ? ref : [];
        list.push(node);
        sets[k] = list;
      }
      return null;
    };
    removeTags = function(sets, tags, node) {
      var i, index, k, len, list;
      if (tags == null) {
        return;
      }
      for (i = 0, len = tags.length; i < len; i++) {
        k = tags[i];
        list = sets[k];
        index = list.indexOf(node);
        if (index >= 0) {
          list.splice(index, 1);
        }
        if (list.length === 0) {
          delete sets[k];
        }
      }
      return null;
    };
    // Build a hash for an array of tags for quick lookups
    hashTags = function(array) {
      var hash, i, klass, len, results;
      if (!(array.length > 0)) {
        return;
      }
      hash = array.hash = {};
      results = [];
      for (i = 0, len = array.length; i < len; i++) {
        klass = array[i];
        results.push(hash[klass] = true);
      }
      return results;
    };
    unhashTags = function(array) {
      return delete array.hash;
    };
    // Track IDs (live)
    addID = (id, node) => {
      if (this.ids[id]) {
        throw new Error(`Duplicate node id \`${id}\``);
      }
      if (id != null) {
        this.ids[id] = [node];
      }
      return node.id = id != null ? id : node._id;
    };
    removeID = (id, node) => {
      if (id != null) {
        delete this.ids[id];
      }
      return node.id = node._id;
    };
    // Track classes (live)
    addClasses = (classes, node) => {
      addTags(this.classes, classes, node);
      if (classes != null) {
        return hashTags(classes);
      }
    };
    removeClasses = (classes, node) => {
      removeTags(this.classes, classes, node);
      if (classes != null) {
        return unhashTags(classes);
      }
    };
    // Track nodes
    addNode = (node) => {
      return this.nodes.push(node);
    };
    removeNode = (node) => {
      return this.nodes.splice(this.nodes.indexOf(node), 1);
    };
    // Track nodes by type
    addType = (node) => {
      return addTags(this.types, [node.type], node);
    };
    removeType = (node) => {
      return removeTags(this.types, [node.type], node);
    };
    // Track nodes by trait
    addTraits = (node) => {
      addTags(this.traits, node.traits, node);
      return hashTags(node.traits);
    };
    removeTraits = (node) => {
      removeTags(this.traits, node.traits, node);
      return unhashTags(node.traits);
    };
    adopt(this.root);
    this.root.trigger({
      type: 'added'
    });
  }

  // Filter array by selector
  filter(nodes, selector) {
    var i, len, matcher, node, results;
    matcher = this._matcher(selector);
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      if (matcher(node)) {
        results.push(node);
      }
    }
    return results;
  }

  // Filter array by ancestry
  ancestry(nodes, parents) {
    var i, len, node, out, parent;
    out = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      parent = node.parent;
      while (parent != null) {
        if (indexOf.call(parents, parent) >= 0) {
          out.push(node);
          break;
        }
        parent = parent.parent;
      }
    }
    return out;
  }

  // Query model by (scoped) selector
  select(selector, parents) {
    var matches;
    matches = this._select(selector);
    if (parents != null) {
      matches = this.ancestry(matches, parents);
    }
    matches.sort(function(a, b) {
      return b.order - a.order;
    });
    return matches;
  }

  // Watch selector with handler
  watch(selector, handler) {
    var watcher;
    handler.unwatch = () => {
      return this.unwatch(handler);
    };
    handler.watcher = watcher = {
      selector: selector,
      handler: handler,
      matcher: this._matcher(selector),
      match: false,
      fire: false
    };
    this.watchers.push(watcher);
    return this.select(selector);
  }

  // Unwatch a handler
  unwatch(handler) {
    var watcher;
    watcher = handler.watcher;
    if (watcher == null) {
      return;
    }
    this.watchers.splice(this.watchers.indexOf(watcher), 1);
    delete handler.unwatch;
    return delete handler.watcher;
  }

  // Check for simplified selector
  _simplify(s) {
    var all, auto, found, id, klass, ref, ref1, ref2, ref3, ref4, trait, type;
    // Trim whitespace
    s = s.replace(/^\s+/, '');
    s = s.replace(/\s+$/, '');
    // Look for *, #id, .class, type, auto
    found = all = s === ALL;
    if (!found) {
      found = id = (ref = s.match(ID)) != null ? ref[1] : void 0;
    }
    if (!found) {
      found = klass = (ref1 = s.match(CLASS)) != null ? ref1[1] : void 0;
    }
    if (!found) {
      found = trait = (ref2 = s.match(TRAIT)) != null ? ref2[1] : void 0;
    }
    if (!found) {
      found = type = (ref3 = s.match(TYPE)) != null ? ref3[0] : void 0;
    }
    if (!found) {
      found = auto = (ref4 = s.match(AUTO)) != null ? ref4[0] : void 0;
    }
    return [all, id, klass, trait, type, auto];
  }

  // Make a matcher for a single selector
  _matcher(s) {
    var all, auto, id, klass, trait, type;
    // Check for simple *, #id, .class or type selector
    [all, id, klass, trait, type, auto] = this._simplify(s);
    if (all) {
      return (function(node) {
        return true;
      });
    }
    if (id) {
      return (function(node) {
        return node.id === id;
      });
    }
    if (klass) {
      return (function(node) {
        var ref, ref1;
        return (ref = node.classes) != null ? (ref1 = ref.hash) != null ? ref1[klass] : void 0 : void 0;
      });
    }
    if (trait) {
      return (function(node) {
        var ref, ref1;
        return (ref = node.traits) != null ? (ref1 = ref.hash) != null ? ref1[trait] : void 0 : void 0;
      });
    }
    if (type) {
      return (function(node) {
        return node.type === type;
      });
    }
    if (auto) {
      throw "Auto-link matcher unsupported";
    }
    // Otherwise apply CSSauron filter
    return language(s);
  }

  // Query single selector
  _select(s) {
    var all, id, klass, ref, ref1, ref2, ref3, trait, type;
    // Check for simple *, #id, .class or type selector
    [all, id, klass, trait, type] = this._simplify(s);
    if (all) {
      return this.nodes;
    }
    if (id) {
      return (ref = this.ids[id]) != null ? ref : [];
    }
    if (klass) {
      return (ref1 = this.classes[klass]) != null ? ref1 : [];
    }
    if (trait) {
      return (ref2 = this.traits[trait]) != null ? ref2 : [];
    }
    if (type) {
      return (ref3 = this.types[type]) != null ? ref3 : [];
    }
    // Otherwise apply CSSauron to everything
    return this.filter(this.nodes, s);
  }

  getRoot() {
    return this.root;
  }

  getLastTrigger() {
    return this.lastNode.toString();
  }

};

module.exports = Model;


},{"cssauron":7}],51:[function(require,module,exports){
var Binder, Node, Util, nodeIndex;

Util = require('../util');

nodeIndex = 0;

Node = class Node {
  constructor(type, defaults, options, binds, config, attributes) {
    this.type = type;
    this._id = (++nodeIndex).toString();
    this.configure(config, attributes);
    this.parent = this.root = this.path = this.index = null;
    this.set(defaults, true, true);
    this.set(options, false, true);
    this.bind(binds, false);
  }

  configure(config, attributes) {
    var finals, freeform, props, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, traits;
    ({traits, props, finals, freeform} = config);
    if (traits == null) {
      traits = (ref = (ref1 = this._config) != null ? ref1.traits : void 0) != null ? ref : [];
    }
    if (props == null) {
      props = (ref2 = (ref3 = this._config) != null ? ref3.props : void 0) != null ? ref2 : {};
    }
    if (finals == null) {
      finals = (ref4 = (ref5 = this._config) != null ? ref5.finals : void 0) != null ? ref4 : {};
    }
    if (freeform == null) {
      freeform = (ref6 = (ref7 = this._config) != null ? ref7.freeform : void 0) != null ? ref6 : false;
    }
    this._config = {traits, props, finals, freeform};
    return this.attributes = attributes.apply(this, this._config);
  }

  dispose() {
    this.attributes.dispose();
    return this.attributes = null;
  }

  // Add/removal callback
  _added(parent) {
    var event;
    this.parent = parent;
    this.root = parent.root;
    // Notify root listeners of child addition
    event = {
      type: 'add',
      node: this,
      parent: this.parent
    };
    if (this.root) {
      this.root.trigger(event);
    }
    // Notify self listeners of own addition
    event.type = 'added';
    return this.trigger(event);
  }

  _removed() {
    var event;
    // Notify root listeners of child removal
    event = {
      type: 'remove',
      node: this
    };
    if (this.root) {
      this.root.trigger(event);
    }
    // Notify self listeners of own removal
    event.type = 'removed';
    this.trigger(event);
    return this.root = this.parent = null;
  }

  // Assign unique indices to nodes to make paths
  _index(index, parent = this.parent) {
    var path, ref;
    this.index = index;
    this.path = path = index != null ? ((ref = parent != null ? parent.path : void 0) != null ? ref : []).concat([index]) : null;
    this.order = path != null ? this._encode(path) : 2e308;
    if (this.root != null) {
      return this.trigger({
        type: 'reindex'
      });
    }
  }

  // Asymptotic arithmetic encoding
  // Computes invariant node order from path of indices
  // Goes from 1 at the root [0] of the tree, to 0 at [∞] (best for FP precision).
  // Divides the interval into countably infinite many intervals, nested recursively.

  // (loses precision eventually, it's used cos three.js needs a single numerical order)
  _encode(path) {
    var a, b, f, g, i, index, k, len, lerp, map;
    // Tune precision between deep and narrow (1) vs shallow and wide (n)
    k = 3;
    map = function(x) {
      return k / (x + k);
    };
    lerp = function(t) {
      return b + (a - b) * t;
    };
    a = 1 + 1 / k;
    b = 0;
    for (i = 0, len = path.length; i < len; i++) {
      index = path[i];
      f = map(index + 1);
      g = map(index + 2);
      [a, b] = [lerp(f), lerp(g)];
    }
    return a;
  }

  toString() {
    var _id, count, id, ref, ref1, ref2, tag;
    _id = (ref = this.id) != null ? ref : this._id;
    tag = (ref1 = this.type) != null ? ref1 : 'node';
    id = tag;
    id += `#${_id}`;
    if ((ref2 = this.classes) != null ? ref2.length : void 0) {
      id += `.${this.classes.join('.')}`;
    }
    if (this.children != null) {
      if (count = this.children.length) {
        return `<${id}>…(${count})…</${tag}>`;
      } else {
        return `<${id}></${tag}>`;
      }
    } else {
      return `<${id} />`;
    }
  }

  toMarkup(selector = null, indent = '') {
    var attr, child, children, close, expr, k, open, orig, props, recurse, ref, ref1, ref2, ref3, tag, v;
    if (selector && typeof selector !== 'function') {
      selector = (ref = (ref1 = this.root) != null ? ref1.model._matcher(selector) : void 0) != null ? ref : function() {
        return true;
      };
    }
    tag = (ref2 = this.type) != null ? ref2 : 'node';
    expr = this.expr;
    // Ensure generated ID goes first
    orig = {
      id: this._id
    };
    ref3 = typeof this.orig === "function" ? this.orig() : void 0;
    for (k in ref3) {
      v = ref3[k];
      orig[k] = v;
    }
    props = (function() {
      var results;
      results = [];
      for (k in orig) {
        v = orig[k];
        if (!this.expr[k]) {
          results.push(Util.Pretty.JSX.prop(k, v));
        }
      }
      return results;
    }).call(this);
    expr = (function() {
      var results;
      results = [];
      for (k in expr) {
        v = expr[k];
        results.push(Util.Pretty.JSX.bind(k, v));
      }
      return results;
    })();
    attr = [''];
    if (props.length) {
      attr = attr.concat(props);
    }
    if (expr.length) {
      attr = attr.concat(expr);
    }
    attr = attr.join(' ');
    child = indent;
    recurse = () => {
      var children, ref4;
      if (!((ref4 = this.children) != null ? ref4.length : void 0)) {
        return '';
      }
      return children = this.children.map(function(x) {
        return x.toMarkup(selector, child);
      }).filter(function(x) {
        return (x != null) && x.length;
      }).join("\n");
    };
    if (selector && !selector(this)) {
      return recurse();
    }
    if (this.children != null) {
      open = `<${tag}${attr}>`;
      close = `</${tag}>`;
      child = indent + '  ';
      children = recurse();
      if (children.length) {
        children = "\n" + children + "\n" + indent;
      }
      if (children == null) {
        children = '';
      }
      return indent + open + children + close;
    } else {
      return `${indent}<${tag}${attr} />`;
    }
  }

  print(selector, level) {
    return Util.Pretty.print(this.toMarkup(selector), level);
  }

};

Binder = require('../util/binder');

Binder.apply(Node.prototype);

module.exports = Node;


},{"../util":190,"../util/binder":186}],52:[function(require,module,exports){
var Classes;

Classes = {
  dom: require('./dom')
};

module.exports = Classes;


},{"./dom":53}],53:[function(require,module,exports){
var DOM, Overlay, VDOM;

Overlay = require('./overlay');

({VDOM} = require('../util'));

DOM = (function() {
  class DOM extends Overlay {
    init(options) {
      return this.last = null;
    }

    dispose() {
      this.unmount();
      return super.dispose();
    }

    mount() {
      var overlay;
      overlay = document.createElement('div');
      overlay.classList.add('mathbox-overlay');
      this.element.appendChild(overlay);
      return this.overlay = overlay;
    }

    unmount(overlay) {
      if (this.overlay.parentNode) {
        this.element.removeChild(this.overlay);
      }
      return this.overlay = null;
    }

    render(el) {
      var last, naked, node, overlay, parent, ref;
      if (!this.overlay) {
        // Lazy mounting
        this.mount();
      }
      if ((ref = typeof el) === 'string' || ref === 'number') {
        // Wrap naked string or array in a div
        el = this.el('div', null, el);
      }
      if (el instanceof Array) {
        el = this.el('div', null, el);
      }
      // See if it can be mounted directly
      naked = el.type === 'div';
      // Fetch last DOM state
      last = this.last;
      // Start with root node
      overlay = this.overlay;
      node = naked ? overlay : overlay.childNodes[0];
      parent = naked ? overlay.parentNode : overlay;
      if (!last && node) {
        // Create phantom DOM state if mounting into existing element
        last = this.el('div');
      }
      // Update DOM
      this.apply(el, last, node, parent, 0);
      this.last = el;
      if (last != null) {
        // Recycle old descriptors
        this.recycle(last);
      }
    }

  };

  DOM.prototype.el = VDOM.element;

  DOM.prototype.hint = VDOM.hint;

  DOM.prototype.apply = VDOM.apply;

  DOM.prototype.recycle = VDOM.recycle;

  return DOM;

}).call(this);

module.exports = DOM;


},{"../util":190,"./overlay":56}],54:[function(require,module,exports){
var OverlayFactory;

OverlayFactory = class OverlayFactory {
  constructor(classes, canvas) {
    var div;
    this.classes = classes;
    this.canvas = canvas;
    div = document.createElement('div');
    div.classList.add('mathbox-overlays');
    this.div = div;
  }

  inject() {
    var element;
    element = this.canvas.parentNode;
    if (!element) {
      throw new Error("Canvas not inserted into document.");
    }
    return element.insertBefore(this.div, this.canvas);
  }

  unject() {
    var element;
    element = this.div.parentNode;
    return element.removeChild(this.div);
  }

  getTypes() {
    return Object.keys(this.classes);
  }

  make(type, options) {
    return new this.classes[type](this.div, options);
  }

};

module.exports = OverlayFactory;


},{}],55:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Classes = require('./classes');

exports.Overlay = require('./overlay');


},{"./classes":52,"./factory":54,"./overlay":56}],56:[function(require,module,exports){
var Overlay;

Overlay = class Overlay {
  constructor(element, options) {
    this.element = element;
    if (typeof this.init === "function") {
      this.init(options);
    }
  }

  dispose() {}

};

module.exports = Overlay;


},{}],57:[function(require,module,exports){
var PrimitiveFactory, Util;

Util = require('../util');

PrimitiveFactory = class PrimitiveFactory {
  constructor(definitions, context) {
    this.context = context;
    this.classes = definitions.Classes;
    this.helpers = definitions.Helpers;
  }

  getTypes() {
    return Object.keys(this.classes);
  }

  make(type, options = {}, binds = null) {
    var klass, node, primitive;
    klass = this.classes[type];
    if (klass == null) {
      throw new Error(`Unknown primitive class \`${type}\``);
    }
    node = new klass.model(type, klass.defaults, options, binds, klass, this.context.attributes);
    primitive = new klass(node, this.context, this.helpers);
    return node;
  }

};

module.exports = PrimitiveFactory;


},{"../util":190}],58:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Primitive = require('./primitive');

exports.Types = require('./types');


},{"./factory":57,"./primitive":59,"./types":87}],59:[function(require,module,exports){
var Binder, Model, Primitive,
  indexOf = [].indexOf;

Model = require('../model');

Primitive = (function() {
  class Primitive {
    constructor(node1, _context, helpers) {
      this.node = node1;
      this._context = _context;
      this._renderables = this._context.renderables;
      this._attributes = this._context.attributes;
      this._shaders = this._context.shaders;
      this._overlays = this._context.overlays;
      this._animator = this._context.animator;
      this._types = this._attributes.types;
      // Link up node 1-to-1
      this.node.controller = this;
      // This node has been inserted/removed
      this.node.on('added', (event) => {
        return this._added();
      });
      this.node.on('removed', (event) => {
        return this._removed();
      });
      // Property change (if mounted)
      this.node.on('change', (event) => {
        if (this._root) {
          return this.change(event.changed, event.touched);
        }
      });
      // Store local refs
      this.reconfigure();
      // Attribute getter / helpers
      this._get = this.node.get.bind(this.node);
      this._helpers = helpers(this, this.node.traits);
      // Keep track of various handlers to do auto-cleanup on unmake()
      this._handlers = {
        inherit: {},
        listen: [],
        watch: [],
        compute: []
      };
      // Detached initially
      this._root = this._parent = null;
      // Friendly constructor
      this.init();
    }

    is(trait) {
      return this.traits.hash[trait];
    }

    // Primitive lifecycle
    init() {}

    make() {}

    made() {}

    unmake(rebuild) {}

    unmade() {}

    change(changed, touched, init) {}

    // Force property reinit
    refresh() {
      return this.change({}, {}, true);
    }

    // Destroy and create cycle
    rebuild() {
      if (this._root) {
        this._removed(true);
        return this._added();
      }
    }

    // Reconfigure traits/props
    reconfigure(config) {
      if (config != null) {
        this.node.configure(config, this._attributes);
      }
      this.traits = this.node.traits;
      return this.props = this.node.props;
    }

    // This node has been inserted
    _added() {
      var e, ref, ref1, ref2;
      this._parent = (ref = this.node.parent) != null ? ref.controller : void 0;
      this._root = (ref1 = this.node.root) != null ? ref1.controller : void 0;
      this.node.clock = (ref2 = this._inherit('clock')) != null ? ref2 : this._root;
      try {
        try {
          this.make();
          this.refresh();
          return this.made();
        } catch (error) {
          e = error;
          this.node.print('warn');
          console.error(e);
          throw e;
        }
      } catch (error) {
        e = error;
        try {
          return this._removed();
        } catch (error) {}
      }
    }

    _removed(rebuild = false) {
      this.unmake(rebuild);
      this._unlisten();
      this._unattach();
      this._uncompute();
      this._root = null;
      this._parent = null;
      return this.unmade(rebuild);
    }

    // Bind event listeners to methods
    _listen(object, type, method, self = this) {
      var i, len, o;
      if (object instanceof Array) {
        for (i = 0, len = object.length; i < len; i++) {
          o = object[i];
          return this.__listen(o, type, method, self);
        }
      }
      return this.__listen(object, type, method, self);
    }

    __listen(object, type, method, self = this) {
      var handler;
      if (typeof object === 'string') {
        object = this._inherit(object);
      }
      if (object != null) {
        handler = method.bind(self);
        handler.node = this.node;
        object.on(type, handler);
        this._handlers.listen.push([object, type, handler]);
      }
      return object;
    }

    _unlisten() {
      var handler, i, len, object, ref, type;
      if (!this._handlers.listen.length) {
        return;
      }
      ref = this._handlers.listen;
      for (i = 0, len = ref.length; i < len; i++) {
        [object, type, handler] = ref[i];
        object.off(type, handler);
      }
      return this._handlers.listen = [];
    }

    // Find parent with certain trait
    _inherit(trait) {
      var cached, ref;
      cached = this._handlers.inherit[trait];
      if (cached !== void 0) {
        return cached;
      }
      return this._handlers.inherit[trait] = (ref = this._parent) != null ? ref._find(trait != null ? trait : null) : void 0;
    }

    _find(trait) {
      var ref;
      if (this.is(trait)) {
        return this;
      }
      return (ref = this._parent) != null ? ref._find(trait) : void 0;
    }

    _uninherit() {
      return this._handlers.inherit = {};
    }

    // Attach to controller by trait and watch the selector
    _attach(selector, trait, method, self = this, start = this, optional = false, multiple = false) {
      var filter, flatten, map, nodes, resolve;
      filter = function(node) {
        if ((node != null) && indexOf.call(node.traits, trait) >= 0) {
          return node;
        }
      };
      map = function(node) {
        return node != null ? node.controller : void 0;
      };
      flatten = function(list) {
        var i, len, out, sub;
        if (list == null) {
          return list;
        }
        out = [];
        for (i = 0, len = list.length; i < len; i++) {
          sub = list[i];
          if (sub instanceof Array) {
            out = out.concat(sub);
          } else {
            out.push(sub);
          }
        }
        return out;
      };
      resolve = (selector) => {
        var discard, match, node, nodes, parent, previous, selection, watcher;
        // Direct JS binding, no watcher.
        if (typeof selector === 'object') {
          node = selector;
          // API object
          if (node != null ? node._up : void 0) {
            selector = multiple ? node._targets : [node[0]];
            return selector;
          }
          // Array of things
          if (node instanceof Array) {
            selector = multiple ? flatten(node.map(resolve)) : resolve(node[0]);
            return selector;
          }
          // Node
          if (node instanceof Model.Node) {
            return [node];
          }
        // Auto-link selector '<'
        } else if (typeof selector === 'string' && selector[0] === '<') {
          discard = 0;
          if (match = selector.match(/^<([0-9])+$/)) {
            discard = +match[1] - 1;
          }
          if (selector.match(/^<+$/)) {
            discard = +selector.length - 1;
          }
          nodes = [];
          // Implicitly associated node (scan backwards until we find one)
          previous = start.node;
          while (previous) {
            // Find previous node
            parent = previous.parent;
            if (!parent) {
              break;
            }
            previous = parent.children[previous.index - 1];
            if (!(previous || nodes.length)) {
              // If we reached the first child, ascend if nothing found yet
              previous = parent;
            }
            // Include if matched
            node = null;
            if (filter(previous)) {
              node = previous;
            }
            if ((node != null) && discard-- <= 0) {
              nodes.push(node);
            }
            if (!multiple && nodes.length) {
              // Return solo match
              return nodes;
            }
          }
          if (multiple && nodes.length) {
            // Return list match
            return nodes;
          }
        // Selector binding
        } else if (typeof selector === 'string') {
          watcher = method.bind(self);
          this._handlers.watch.push(watcher);
          selection = this._root.watch(selector, watcher);
          if (!multiple) {
            if (filter(selection[0])) {
              node = selection[0];
            }
            if (node != null) {
              return [node];
            }
          } else {
            nodes = selection.filter(filter);
            if (nodes.length) {
              return nodes;
            }
          }
        }
        if (!optional) {
          console.warn(this.node.toMarkup());
          throw new Error(`${this.node.toString()} - Could not find ${trait} \`${selector}\``);
        }
        if (multiple) {
          return [];
        } else {
          return null;
        }
      };
      // Resolve selection recursively
      nodes = flatten(resolve(selector));
      // Return node's controllers if found
      if (multiple) {
        if (nodes != null) {
          return nodes.map(map);
        } else {
          return null;
        }
      } else {
        if (nodes != null) {
          return map(nodes[0]);
        } else {
          return null;
        }
      }
    }

    // Remove watcher attachments
    _unattach() {
      var i, len, ref, watcher;
      if (!this._handlers.watch.length) {
        return;
      }
      ref = this._handlers.watch;
      for (i = 0, len = ref.length; i < len; i++) {
        watcher = ref[i];
        if (watcher != null) {
          watcher.unwatch();
        }
      }
      return this._handlers.watch = [];
    }

    // Bind a computed value to a prop
    _compute(key, expr) {
      this._handlers.compute.push(key);
      return this.node.bind(key, expr, true);
    }

    // Remove prop bindings
    _uncompute() {
      var i, key, len, ref;
      if (!this._handlers.compute.length) {
        return;
      }
      ref = this._handlers.compute;
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        this.node.unbind(key, true);
      }
      return this._handlers.compute = [];
    }

  };

  Primitive.Node = Model.Node;

  Primitive.Group = Model.Group;

  // Class default
  Primitive.model = Primitive.Node;

  Primitive.defaults = null;

  Primitive.traits = null;

  Primitive.props = null;

  Primitive.finals = null;

  Primitive.freeform = false;

  return Primitive;

}).call(this);

Binder = require('../util/binder');

Binder.apply(Primitive.prototype);

module.exports = Primitive;


},{"../model":49,"../util/binder":186}],60:[function(require,module,exports){
var Group, Parent;

Parent = require('./parent');

Group = (function() {
  class Group extends Parent {
    make() {
      this._helpers.visible.make();
      return this._helpers.active.make();
    }

    unmake() {
      this._helpers.visible.unmake();
      return this._helpers.active.unmake();
    }

  };

  Group.traits = ['node', 'object', 'entity', 'visible', 'active'];

  return Group;

}).call(this);

module.exports = Group;


},{"./parent":62}],61:[function(require,module,exports){
var Inherit, Parent,
  indexOf = [].indexOf;

Parent = require('./parent');

Inherit = (function() {
  class Inherit extends Parent {
    make() {
      // Bind to attached trait source
      return this._helpers.bind.make([
        {
          to: 'inherit.source',
          trait: 'node'
        }
      ]);
    }

    unmake() {
      return this._helpers.bind.unmake();
    }

    _find(trait) {
      if (this.bind.source && (indexOf.call(this.props.traits, trait) >= 0)) {
        return this.bind.source._inherit(trait);
      }
      return super._find();
    }

  };

  Inherit.traits = ['node', 'bind'];

  return Inherit;

}).call(this);

module.exports = Inherit;


},{"./parent":62}],62:[function(require,module,exports){
var Parent, Primitive;

Primitive = require('../../primitive');

Parent = (function() {
  class Parent extends Primitive {};

  Parent.model = Primitive.Group;

  Parent.traits = ['node'];

  return Parent;

}).call(this);

module.exports = Parent;


},{"../../primitive":59}],63:[function(require,module,exports){
var Parent, Root, Util;

Parent = require('./parent');

Util = require('../../../util');

Root = (function() {
  class Root extends Parent {
    init() {
      this.size = null;
      this.cameraEvent = {
        type: 'root.camera'
      };
      this.preEvent = {
        type: 'root.pre'
      };
      this.updateEvent = {
        type: 'root.update'
      };
      this.renderEvent = {
        type: 'root.render'
      };
      this.postEvent = {
        type: 'root.post'
      };
      this.clockEvent = {
        type: 'clock.tick'
      };
      return this.camera = null;
    }

    make() {
      return this._helpers.unit.make();
    }

    unmake() {
      return this._helpers.unit.unmake();
    }

    change(changed, touched, init) {
      if (changed['root.camera'] || init) {
        this._unattach();
        this._attach(this.props.camera, 'camera', this.setCamera, this, this, true);
        return this.setCamera();
      }
    }

    adopt(renderable) {
      var i, len, object, ref, results;
      ref = renderable.renders;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        results.push(this._context.scene.add(object));
      }
      return results;
    }

    unadopt(renderable) {
      var i, len, object, ref, results;
      ref = renderable.renders;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        results.push(this._context.scene.remove(object));
      }
      return results;
    }

    select(selector) {
      return this.node.model.select(selector);
    }

    watch(selector, handler) {
      return this.node.model.watch(selector, handler);
    }

    unwatch(handler) {
      return this.node.model.unwatch(handler);
    }

    resize(size) {
      this.size = size;
      return this.trigger({
        type: 'root.resize',
        size: size
      });
    }

    getSize() {
      return this.size;
    }

    getSpeed() {
      return this.props.speed;
    }

    getUnit() {
      return this._helpers.unit.get();
    }

    getUnitUniforms() {
      return this._helpers.unit.uniforms();
    }

    pre() {
      this.getCamera().updateProjectionMatrix();
      this.trigger(this.clockEvent);
      return this.trigger(this.preEvent);
    }

    update() {
      return this.trigger(this.updateEvent);
    }

    render() {
      return this.trigger(this.renderEvent);
    }

    post() {
      return this.trigger(this.postEvent);
    }

    setCamera() {
      var camera, ref;
      camera = (ref = this.select(this.props.camera)[0]) != null ? ref.controller : void 0;
      if (this.camera !== camera) {
        this.camera = camera;
        return this.trigger({
          type: 'root.camera'
        });
      }
    }

    getCamera() {
      var ref, ref1;
      return (ref = (ref1 = this.camera) != null ? ref1.getCamera() : void 0) != null ? ref : this._context.defaultCamera;
    }

    getTime() {
      return this._context.time;
    }

    // End transform chain here
    vertex(shader, pass) {
      if (pass === 2) {
        return shader.pipe('view.position');
      }
      if (pass === 3) {
        return shader.pipe('root.position');
      }
      return shader;
    }

  };

  Root.traits = ['node', 'root', 'clock', 'scene', 'vertex', 'unit'];

  return Root;

}).call(this);

module.exports = Root;


},{"../../../util":190,"./parent":62}],64:[function(require,module,exports){
var Primitive, Source, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Source = (function() {
  class Source extends Primitive {
    made() {
      // Notify of buffer reallocation
      return this.trigger({
        type: 'source.rebuild'
      });
    }

    indexShader(shader) {
      return shader.pipe(Util.GLSL.identity('vec4'));
    }

    sourceShader(shader) {
      return shader.pipe(Util.GLSL.identity('vec4'));
    }

    getDimensions() {
      return {
        items: 1,
        width: 1,
        height: 1,
        depth: 1
      };
    }

    getActiveDimensions() {
      return this.getDimensions();
    }

    getIndexDimensions() {
      return this.getActiveDimensions();
    }

    getFutureDimensions() {
      return this.getActiveDimensions();
    }

  };

  Source.traits = ['node', 'source', 'index'];

  return Source;

}).call(this);

module.exports = Source;


},{"../../../util":190,"../../primitive":59}],65:[function(require,module,exports){
var Parent, Unit, Util;

Parent = require('./parent');

Util = require('../../../util');

Unit = (function() {
  class Unit extends Parent {
    make() {
      return this._helpers.unit.make();
    }

    unmake() {
      return this._helpers.unit.unmake();
    }

    getUnit() {
      return this._helpers.unit.get();
    }

    getUnitUniforms() {
      return this._helpers.unit.uniforms();
    }

  };

  Unit.traits = ['node', 'unit'];

  return Unit;

}).call(this);

module.exports = Unit;


},{"../../../util":190,"./parent":62}],66:[function(require,module,exports){
var Camera, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Camera = (function() {
  class Camera extends Primitive {
    init() {}

    make() {
      var camera;
      camera = this._context.defaultCamera;
      this.camera = this.props.proxy ? camera : camera.clone();
      this.euler = new THREE.Euler();
      return this.quat = new THREE.Quaternion();
    }

    unmake() {}

    getCamera() {
      return this.camera;
    }

    change(changed, touched, init) {
      var aspect, fov, lookAt, position, quaternion, rotation, up;
      if (changed['camera.position'] || changed['camera.quaternion'] || changed['camera.rotation'] || changed['camera.lookAt'] || changed['camera.up'] || changed['camera.fov'] || init) {
        ({position, quaternion, rotation, lookAt, up, fov, aspect} = this.props);
        // Apply transform conservatively to avoid conflicts with controls / proxy
        if (position != null) {
          this.camera.position.copy(position);
        }
        if ((quaternion != null) || (rotation != null) || (lookAt != null)) {
          if (lookAt != null) {
            this.camera.lookAt(lookAt);
          } else {
            this.camera.quaternion.set(0, 0, 0, 1);
          }
          if (rotation != null) {
            this.euler.setFromVector3(rotation, Util.Three.swizzleToEulerOrder(this.props.eulerOrder));
            this.quat.setFromEuler(this.euler);
            this.camera.quaternion.multiply(this.quat);
          }
          if (quaternion != null) {
            this.camera.quaternion.multiply(quaternion);
          }
        }
        if ((fov != null) && (this.camera.fov != null)) {
          this.camera.fov = fov;
        }
        if (up != null) {
          this.camera.up.copy(up);
        }
        return this.camera.updateMatrix();
      }
    }

  };

  Camera.traits = ['node', 'camera'];

  return Camera;

}).call(this);

module.exports = Camera;


},{"../../../util":190,"../../primitive":59}],67:[function(require,module,exports){
var Classes;

Classes = {
  axis: require('./draw/axis'),
  face: require('./draw/face'),
  grid: require('./draw/grid'),
  line: require('./draw/line'),
  point: require('./draw/point'),
  strip: require('./draw/strip'),
  surface: require('./draw/surface'),
  ticks: require('./draw/ticks'),
  vector: require('./draw/vector'),
  view: require('./view/view'),
  cartesian: require('./view/cartesian'),
  cartesian4: require('./view/cartesian4'),
  polar: require('./view/polar'),
  spherical: require('./view/spherical'),
  stereographic: require('./view/stereographic'),
  stereographic4: require('./view/stereographic4'),
  transform: require('./transform/transform3'),
  transform4: require('./transform/transform4'),
  vertex: require('./transform/vertex'),
  fragment: require('./transform/fragment'),
  layer: require('./transform/layer'),
  mask: require('./transform/mask'),
  array: require('./data/array'),
  interval: require('./data/interval'),
  matrix: require('./data/matrix'),
  area: require('./data/area'),
  voxel: require('./data/voxel'),
  volume: require('./data/volume'),
  scale: require('./data/scale'),
  html: require('./overlay/html'),
  dom: require('./overlay/dom'),
  text: require('./text/text'),
  format: require('./text/format'),
  label: require('./text/label'),
  retext: require('./text/retext'),
  clamp: require('./operator/clamp'),
  grow: require('./operator/grow'),
  join: require('./operator/join'),
  lerp: require('./operator/lerp'),
  memo: require('./operator/memo'),
  readback: require('./operator/readback'),
  resample: require('./operator/resample'),
  repeat: require('./operator/repeat'),
  swizzle: require('./operator/swizzle'),
  spread: require('./operator/spread'),
  split: require('./operator/split'),
  slice: require('./operator/slice'),
  subdivide: require('./operator/subdivide'),
  transpose: require('./operator/transpose'),
  group: require('./base/group'),
  inherit: require('./base/inherit'),
  root: require('./base/root'),
  unit: require('./base/unit'),
  shader: require('./shader/shader'),
  camera: require('./camera/camera'),
  rtt: require('./rtt/rtt'),
  compose: require('./rtt/compose'),
  clock: require('./time/clock'),
  now: require('./time/now'),
  move: require('./present/move'),
  play: require('./present/play'),
  present: require('./present/present'),
  reveal: require('./present/reveal'),
  slide: require('./present/slide'),
  step: require('./present/step')
};

module.exports = Classes;


},{"./base/group":60,"./base/inherit":61,"./base/root":63,"./base/unit":65,"./camera/camera":66,"./data/area":68,"./data/array":69,"./data/interval":72,"./data/matrix":73,"./data/scale":74,"./data/volume":75,"./data/voxel":76,"./draw/axis":77,"./draw/face":78,"./draw/grid":79,"./draw/line":80,"./draw/point":81,"./draw/strip":82,"./draw/surface":83,"./draw/ticks":84,"./draw/vector":85,"./operator/clamp":88,"./operator/grow":89,"./operator/join":90,"./operator/lerp":91,"./operator/memo":92,"./operator/readback":94,"./operator/repeat":95,"./operator/resample":96,"./operator/slice":97,"./operator/split":98,"./operator/spread":99,"./operator/subdivide":100,"./operator/swizzle":101,"./operator/transpose":102,"./overlay/dom":103,"./overlay/html":104,"./present/move":105,"./present/play":106,"./present/present":107,"./present/reveal":108,"./present/slide":109,"./present/step":110,"./rtt/compose":113,"./rtt/rtt":114,"./shader/shader":115,"./text/format":116,"./text/label":117,"./text/retext":118,"./text/text":119,"./time/clock":120,"./time/now":121,"./transform/fragment":123,"./transform/layer":124,"./transform/mask":125,"./transform/transform3":127,"./transform/transform4":128,"./transform/vertex":129,"./view/cartesian":131,"./view/cartesian4":132,"./view/polar":133,"./view/spherical":134,"./view/stereographic":135,"./view/stereographic4":136,"./view/view":137}],68:[function(require,module,exports){
var Area, Matrix, Util;

Matrix = require('./matrix');

Util = require('../../../util');

Area = (function() {
  class Area extends Matrix {
    updateSpan() {
      var centeredX, centeredY, dimensions, height, inverseX, inverseY, padX, padY, rangeX, rangeY, spanX, spanY, width;
      dimensions = this.props.axes;
      width = this.props.width;
      height = this.props.height;
      centeredX = this.props.centeredX;
      centeredY = this.props.centeredY;
      padX = this.props.paddingX;
      padY = this.props.paddingY;
      rangeX = this._helpers.span.get('x.', dimensions[0]);
      rangeY = this._helpers.span.get('y.', dimensions[1]);
      this.aX = rangeX.x;
      this.aY = rangeY.x;
      spanX = rangeX.y - rangeX.x;
      spanY = rangeY.y - rangeY.x;
      width += padX * 2;
      height += padY * 2;
      if (centeredX) {
        inverseX = 1 / Math.max(1, width);
        this.aX += spanX * inverseX / 2;
      } else {
        inverseX = 1 / Math.max(1, width - 1);
      }
      if (centeredY) {
        inverseY = 1 / Math.max(1, height);
        this.aY += spanY * inverseY / 2;
      } else {
        inverseY = 1 / Math.max(1, height - 1);
      }
      this.bX = spanX * inverseX;
      this.bY = spanY * inverseY;
      this.aX += padX * this.bX;
      return this.aY += padY * this.bY;
    }

    callback(callback) {
      this.updateSpan();
      if (this.last === callback) {
        return this._callback;
      }
      this.last = callback;
      if (callback.length <= 5) {
        return this._callback = (emit, i, j) => {
          var x, y;
          x = this.aX + this.bX * i;
          y = this.aY + this.bY * j;
          return callback(emit, x, y, i, j);
        };
      } else {
        return this._callback = (emit, i, j) => {
          var x, y;
          x = this.aX + this.bX * i;
          y = this.aY + this.bY * j;
          return callback(emit, x, y, i, j, this.bufferClock, this.bufferStep);
        };
      }
    }

    make() {
      super.make();
      this._helpers.span.make();
      return this._listen(this, 'span.range', this.updateSpan);
    }

    unmake() {
      super.unmake();
      return this._helpers.span.unmake();
    }

  };

  Area.traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'matrix', 'texture', 'raw', 'span:x', 'span:y', 'area', 'sampler:x', 'sampler:y'];

  return Area;

}).call(this);

module.exports = Area;


},{"../../../util":190,"./matrix":73}],69:[function(require,module,exports){
var Array_, Buffer, Util;

Buffer = require('./buffer');

Util = require('../../../util');

Array_ = (function() {
  class Array_ extends Buffer {
    init() {
      this.buffer = this.spec = null;
      this.space = {
        width: 0,
        history: 0
      };
      this.used = {
        width: 0
      };
      this.storage = 'arrayBuffer';
      this.passthrough = function(emit, x) {
        return emit(x, 0, 0, 0);
      };
      return super.init();
    }

    sourceShader(shader) {
      var dims;
      dims = this.getDimensions();
      this.alignShader(dims, shader);
      return this.buffer.shader(shader);
    }

    getDimensions() {
      return {
        items: this.items,
        width: this.space.width,
        height: this.space.history,
        depth: 1
      };
    }

    getActiveDimensions() {
      return {
        items: this.items,
        width: this.used.width,
        height: this.buffer.getFilled(),
        depth: 1
      };
    }

    getFutureDimensions() {
      return {
        items: this.items,
        width: this.used.width,
        height: this.space.history,
        depth: 1
      };
    }

    getRawDimensions() {
      return {
        items: this.items,
        width: space.width,
        height: 1,
        depth: 1
      };
    }

    make() {
      var channels, data, dims, history, items, magFilter, minFilter, ref, ref1, ref2, reserve, space, type, width;
      super.make();
      // Read sampling parameters
      minFilter = (ref = this.minFilter) != null ? ref : this.props.minFilter;
      magFilter = (ref1 = this.magFilter) != null ? ref1 : this.props.magFilter;
      type = (ref2 = this.type) != null ? ref2 : this.props.type;
      // Read given dimensions
      width = this.props.width;
      history = this.props.history;
      reserve = this.props.bufferWidth;
      channels = this.props.channels;
      items = this.props.items;
      dims = this.spec = {channels, items, width};
      this.items = dims.items;
      this.channels = dims.channels;
      // Init to right size if data supplied
      data = this.props.data;
      dims = Util.Data.getDimensions(data, dims);
      space = this.space;
      space.width = Math.max(reserve, dims.width || 1);
      space.history = history;
      // Create array buffer
      return this.buffer = this._renderables.make(this.storage, {
        width: space.width,
        history: space.history,
        channels: channels,
        items: items,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
    }

    unmake() {
      super.unmake();
      if (this.buffer) {
        this.buffer.dispose();
        return this.buffer = this.spec = null;
      }
    }

    change(changed, touched, init) {
      var width;
      if (touched['texture'] || changed['history.history'] || changed['buffer.channels'] || changed['buffer.items'] || changed['array.bufferWidth']) {
        return this.rebuild();
      }
      if (!this.buffer) {
        return;
      }
      if (changed['array.width']) {
        width = this.props.width;
        if (width > this.space.width) {
          return this.rebuild();
        }
      }
      if (changed['data.map'] || changed['data.data'] || changed['data.resolve'] || changed['data.expr'] || init) {
        return this.buffer.setCallback(this.emitter());
      }
    }

    callback(callback) {
      if (callback.length <= 2) {
        return callback;
      } else {
        return (emit, i) => {
          return callback(emit, i, this.bufferClock, this.bufferStep);
        };
      }
    }

    update() {
      var data, filled, l, space, used;
      if (!this.buffer) {
        return;
      }
      ({data} = this.props);
      ({space, used} = this);
      l = used.width;
      filled = this.buffer.getFilled();
      this.syncBuffer((abort) => {
        var base, dims, width;
        if (data != null) {
          dims = Util.Data.getDimensions(data, this.spec);
          // Grow width if needed
          if (dims.width > space.width) {
            abort();
            return this.rebuild();
          }
          used.width = dims.width;
          this.buffer.setActive(used.width);
          if (typeof (base = this.buffer.callback).rebind === "function") {
            base.rebind(data);
          }
          return this.buffer.update();
        } else {
          width = this.spec.width || 1;
          this.buffer.setActive(width);
          width = this.buffer.update();
          return used.width = width;
        }
      });
      if (used.width !== l || filled !== this.buffer.getFilled()) {
        return this.trigger({
          type: 'source.resize'
        });
      }
    }

  };

  Array_.traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'array', 'texture', 'raw'];

  return Array_;

}).call(this);

module.exports = Array_;


},{"../../../util":190,"./buffer":70}],70:[function(require,module,exports){
var Buffer, Data, Util;

Data = require('./data');

Util = require('../../../util');

Buffer = (function() {
  class Buffer extends Data {
    init() {
      this.bufferSlack = 0;
      this.bufferFrames = 0;
      this.bufferTime = 0;
      this.bufferDelta = 0;
      this.bufferClock = 0;
      this.bufferStep = 0;
      return super.init();
    }

    make() {
      super.make();
      return this.clockParent = this._inherit('clock');
    }

    unmake() {
      return super.unmake();
    }

    rawBuffer() {
      return this.buffer;
    }

    emitter() {
      var channels, items;
      ({channels, items} = this.props);
      return super.emitter(channels, items);
    }

    change(changed, touched, init) {
      var fps;
      if (changed['buffer.fps'] || init) {
        ({fps} = this.props);
        return this.bufferSlack = fps ? .5 / fps : 0;
      }
    }

    syncBuffer(callback) {
      var abort, delta, filled, fps, frame, frames, hurry, i, j, limit, live, observe, realtime, ref, results, slack, speed, step, stop, time;
      if (!this.buffer) {
        return;
      }
      ({live, fps, hurry, limit, realtime, observe} = this.props);
      filled = this.buffer.getFilled();
      if (!(!filled || live)) {
        return;
      }
      time = this.clockParent.getTime();
      if (fps != null) {
        slack = this.bufferSlack;
        speed = time.step / time.delta;
        delta = realtime ? time.delta : time.step;
        frame = 1 / fps;
        step = realtime && observe ? speed * frame : frame;
        this.bufferSlack = Math.min(limit / fps, slack + delta);
        this.bufferDelta = delta;
        this.bufferStep = step;
        frames = Math.min(hurry, Math.floor(slack * fps));
        if (!filled) {
          frames = Math.max(1, frames);
        }
        stop = false;
        abort = function() {
          return stop = true;
        };
        results = [];
        for (i = j = 0, ref = frames; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          this.bufferTime += delta;
          this.bufferClock += step;
          if (stop) {
            break;
          }
          callback(abort, this.bufferFrames++, i, frames);
          results.push(this.bufferSlack -= frame);
        }
        return results;
      } else {
        this.bufferTime = time.time;
        this.bufferDelta = time.delta;
        this.bufferClock = time.clock;
        this.bufferStep = time.step;
        return callback((function() {}), this.bufferFrames++, 0, 1);
      }
    }

    alignShader(dims, shader) {
      var aligned, magFilter, minFilter, mixed, nearest;
      ({minFilter, magFilter, aligned} = this.props);
      mixed = (dims.items > 1 && dims.width > 1) || (dims.height > 1 && dims.depth > 1);
      if (aligned || !mixed) {
        return;
      }
      nearest = minFilter === this.node.attributes['texture.minFilter'].enum.nearest && magFilter === this.node.attributes['texture.magFilter'].enum.nearest;
      if (!nearest) {
        console.warn(`${this.node.toString()} - Cannot use linear min/magFilter with 3D/4D sampling`);
      }
      return shader.pipe('map.xyzw.align');
    }

  };

  Buffer.traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture'];

  return Buffer;

}).call(this);

module.exports = Buffer;


},{"../../../util":190,"./data":71}],71:[function(require,module,exports){
var Data, Source, Util;

Source = require('../base/source');

Util = require('../../../util');

Data = (function() {
  class Data extends Source {
    init() {
      this.dataEmitter = null;
      return this.dataSizes = null;
    }

    emitter(channels, items) {
      var bind, data, emitter, expr, last, resolve, sizes, thunk;
      data = this.props.data;
      bind = this.props.bind;
      expr = this.props.expr;
      if (data != null) {
        // Make new emitter if data geometry doesn't match
        last = this.dataSizes;
        sizes = Util.Data.getSizes(data);
        if (!last || last.length !== sizes.length) {
          // Create data thunk to copy (multi-)array
          thunk = Util.Data.getThunk(data);
          this.dataEmitter = this.callback(Util.Data.makeEmitter(thunk, items, channels));
          this.dataSizes = sizes;
        }
        emitter = this.dataEmitter;
      } else if (typeof resolve !== "undefined" && resolve !== null) {
        // Hook up data-bound expression to its source
        resolve = this._inherit('resolve');
        emitter = this.callback(resolve.callback(bind));
      } else if (expr != null) {
        // Convert given free expression to appropriate callback
        emitter = this.callback(expr);
      } else {
        // Passthrough
        emitter = this.callback(this.passthrough);
      }
      return emitter;
    }

    callback(callback) {
      return callback != null ? callback : function() {};
    }

    update() {}

    make() {
      this._helpers.active.make();
      // Always run update at least once to prime JS VM optimization for entering elements
      this.first = true;
      return this._listen('root', 'root.update', () => {
        if (this.isActive || this.first) {
          this.update();
        }
        return this.first = false;
      });
    }

    unmake() {
      this._helpers.active.unmake();
      this.dataEmitter = null;
      return this.dataSizes = null;
    }

  };

  Data.traits = ['node', 'data', 'source', 'index', 'entity', 'active'];

  return Data;

}).call(this);

module.exports = Data;


},{"../../../util":190,"../base/source":64}],72:[function(require,module,exports){
var Interval, Util, _Array;

_Array = require('./array');

Util = require('../../../util');

Interval = (function() {
  class Interval extends _Array {
    updateSpan() {
      var centered, dimension, inverse, pad, range, span, width;
      dimension = this.props.axis;
      width = this.props.width;
      centered = this.props.centered;
      pad = this.props.padding;
      range = this._helpers.span.get('', dimension);
      width += pad * 2;
      this.a = range.x;
      span = range.y - range.x;
      if (centered) {
        inverse = 1 / Math.max(1, width);
        this.a += span * inverse / 2;
      } else {
        inverse = 1 / Math.max(1, width - 1);
      }
      this.b = span * inverse;
      return this.a += pad * this.b;
    }

    callback(callback) {
      this.updateSpan();
      if (this.last === callback) {
        return this._callback;
      }
      this.last = callback;
      if (callback.length <= 3) {
        return this._callback = (emit, i) => {
          var x;
          x = this.a + this.b * i;
          return callback(emit, x, i);
        };
      } else {
        return this._callback = (emit, i) => {
          var x;
          x = this.a + this.b * i;
          return callback(emit, x, i, this.bufferClock, this.bufferStep);
        };
      }
    }

    make() {
      super.make();
      this._helpers.span.make();
      return this._listen(this, 'span.range', this.updateSpan);
    }

    unmake() {
      super.unmake();
      return this._helpers.span.unmake();
    }

  };

  Interval.traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture', 'array', 'span', 'interval', 'sampler', 'raw'];

  return Interval;

}).call(this);

module.exports = Interval;


},{"../../../util":190,"./array":69}],73:[function(require,module,exports){
var Buffer, Matrix, Util;

Buffer = require('./buffer');

Util = require('../../../util');

Matrix = (function() {
  class Matrix extends Buffer {
    init() {
      this.buffer = this.spec = null;
      this.space = {
        width: 0,
        height: 0,
        history: 0
      };
      this.used = {
        width: 0,
        height: 0
      };
      this.storage = 'matrixBuffer';
      this.passthrough = function(emit, x, y) {
        return emit(x, y, 0, 0);
      };
      return super.init();
    }

    sourceShader(shader) {
      var dims;
      dims = this.getDimensions();
      this.alignShader(dims, shader);
      return this.buffer.shader(shader);
    }

    getDimensions() {
      return {
        items: this.items,
        width: this.space.width,
        height: this.space.height,
        depth: this.space.history
      };
    }

    getActiveDimensions() {
      return {
        items: this.items,
        width: this.used.width,
        height: this.used.height,
        depth: this.buffer.getFilled()
      };
    }

    getFutureDimensions() {
      return {
        items: this.items,
        width: this.used.width,
        height: this.used.height,
        depth: this.space.history
      };
    }

    getRawDimensions() {
      return {
        items: this.items,
        width: this.space.width,
        height: this.space.height,
        depth: 1
      };
    }

    make() {
      var channels, data, dims, height, history, items, magFilter, minFilter, ref, ref1, ref2, reserveX, reserveY, space, type, width;
      super.make();
      // Read sampling parameters
      minFilter = (ref = this.minFilter) != null ? ref : this.props.minFilter;
      magFilter = (ref1 = this.magFilter) != null ? ref1 : this.props.magFilter;
      type = (ref2 = this.type) != null ? ref2 : this.props.type;
      // Read given dimensions
      width = this.props.width;
      height = this.props.height;
      history = this.props.history;
      reserveX = this.props.bufferWidth;
      reserveY = this.props.bufferHeight;
      channels = this.props.channels;
      items = this.props.items;
      dims = this.spec = {channels, items, width, height};
      this.items = dims.items;
      this.channels = dims.channels;
      // Init to right size if data supplied
      data = this.props.data;
      dims = Util.Data.getDimensions(data, dims);
      space = this.space;
      space.width = Math.max(reserveX, dims.width || 1);
      space.height = Math.max(reserveY, dims.height || 1);
      space.history = history;
      // Create matrix buffer
      return this.buffer = this._renderables.make(this.storage, {
        width: space.width,
        height: space.height,
        history: space.history,
        channels: channels,
        items: items,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
    }

    unmake() {
      super.unmake();
      if (this.buffer) {
        this.buffer.dispose();
        return this.buffer = this.spec = null;
      }
    }

    change(changed, touched, init) {
      var height, width;
      if (touched['texture'] || changed['matrix.history'] || changed['buffer.channels'] || changed['buffer.items'] || changed['matrix.bufferWidth'] || changed['matrix.bufferHeight']) {
        return this.rebuild();
      }
      if (!this.buffer) {
        return;
      }
      if (changed['matrix.width']) {
        width = this.props.width;
        if (width > this.space.width) {
          return this.rebuild();
        }
      }
      if (changed['matrix.height']) {
        height = this.props.height;
        if (height > this.space.height) {
          return this.rebuild();
        }
      }
      if (changed['data.map'] || changed['data.data'] || changed['data.resolve'] || changed['data.expr'] || init) {
        return this.buffer.setCallback(this.emitter());
      }
    }

    callback(callback) {
      if (callback.length <= 3) {
        return callback;
      } else {
        return (emit, i, j) => {
          return callback(emit, i, j, this.bufferClock, this.bufferStep);
        };
      }
    }

    update() {
      var data, filled, h, space, used, w;
      if (!this.buffer) {
        return;
      }
      ({data} = this.props);
      ({space, used} = this);
      w = used.width;
      h = used.height;
      filled = this.buffer.getFilled();
      this.syncBuffer((abort) => {
        var _w, base, dims, height, length, width;
        if (data != null) {
          dims = Util.Data.getDimensions(data, this.spec);
          // Grow if needed
          if (dims.width > space.width || dims.height > space.height) {
            abort();
            return this.rebuild();
          }
          used.width = dims.width;
          used.height = dims.height;
          this.buffer.setActive(used.width, used.height);
          if (typeof (base = this.buffer.callback).rebind === "function") {
            base.rebind(data);
          }
          return this.buffer.update();
        } else {
          width = this.spec.width || 1;
          height = this.spec.height || 1;
          this.buffer.setActive(width, height);
          length = this.buffer.update();
          used.width = _w = width;
          used.height = Math.ceil(length / _w);
          if (used.height === 1) {
            return used.width = length;
          }
        }
      });
      if (used.width !== w || used.height !== h || filled !== this.buffer.getFilled()) {
        return this.trigger({
          type: 'source.resize'
        });
      }
    }

  };

  Matrix.traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture', 'matrix', 'raw'];

  return Matrix;

}).call(this);

module.exports = Matrix;


},{"../../../util":190,"./buffer":70}],74:[function(require,module,exports){
var Scale, Source, Util;

Source = require('../base/source');

Util = require('../../../util');

Scale = (function() {
  class Scale extends Source {
    init() {
      return this.used = this.space = this.scaleAxis = this.sampler = null;
    }

    rawBuffer() {
      return this.buffer;
    }

    sourceShader(shader) {
      return shader.pipe(this.sampler);
    }

    getDimensions() {
      return {
        items: 1,
        width: this.space,
        height: 1,
        depth: 1
      };
    }

    getActiveDimensions() {
      return {
        items: 1,
        width: this.used,
        height: this.buffer.getFilled(),
        depth: 1
      };
    }

    getRawDimensions() {
      return this.getDimensions();
    }

    make() {
      var p, positionUniforms, samples;
      // Prepare data buffer of tick positions
      this.space = samples = this._helpers.scale.divide('');
      this.buffer = this._renderables.make('dataBuffer', {
        width: samples,
        channels: 1,
        items: 1
      });
      // Prepare position shader
      positionUniforms = {
        scaleAxis: this._attributes.make(this._types.vec4()),
        scaleOffset: this._attributes.make(this._types.vec4())
      };
      this.scaleAxis = positionUniforms.scaleAxis.value;
      this.scaleOffset = positionUniforms.scaleOffset.value;
      // Build sampler
      p = this.sampler = this._shaders.shader();
      // Require buffer sampler as callback
      p.require(this.buffer.shader(this._shaders.shader(), 1));
      // Shader to expand scalars to 4D vector on an axis.
      p.pipe('scale.position', positionUniforms);
      this._helpers.span.make();
      // Monitor view range
      return this._listen(this, 'span.range', this.updateRanges);
    }

    unmake() {
      this.scaleAxis = null;
      return this._helpers.span.unmake();
    }

    change(changed, touched, init) {
      if (changed['scale.divide']) {
        return this.rebuild();
      }
      if (touched['view'] || touched['interval'] || touched['span'] || touched['scale'] || init) {
        return this.updateRanges();
      }
    }

    updateRanges() {
      var axis, max, min, origin, range, ticks, used;
      used = this.used;
      // Fetch range along axis
      ({axis, origin} = this.props);
      range = this._helpers.span.get('', axis);
      // Calculate scale along axis
      min = range.x;
      max = range.y;
      ticks = this._helpers.scale.generate('', this.buffer, min, max);
      Util.Axis.setDimension(this.scaleAxis, axis);
      Util.Axis.setOrigin(this.scaleOffset, axis, origin);
      // Clip to number of ticks
      this.used = ticks.length;
      // Notify of resize
      if (this.used !== used) {
        return this.trigger({
          type: 'source.resize'
        });
      }
    }

  };

  Scale.traits = ['node', 'source', 'index', 'interval', 'span', 'scale', 'raw', 'origin'];

  return Scale;

}).call(this);

module.exports = Scale;


},{"../../../util":190,"../base/source":64}],75:[function(require,module,exports){
var Util, Volume, Voxel;

Voxel = require('./voxel');

Util = require('../../../util');

Volume = (function() {
  class Volume extends Voxel {
    updateSpan() {
      var centeredX, centeredY, centeredZ, depth, dimensions, height, inverseX, inverseY, inverseZ, padX, padY, padZ, rangeX, rangeY, rangeZ, spanX, spanY, spanZ, width;
      dimensions = this.props.axes;
      width = this.props.width;
      height = this.props.height;
      depth = this.props.depth;
      centeredX = this.props.centeredX;
      centeredY = this.props.centeredY;
      centeredZ = this.props.centeredZ;
      padX = this.props.paddingX;
      padY = this.props.paddingY;
      padZ = this.props.paddingZ;
      rangeX = this._helpers.span.get('x.', dimensions[0]);
      rangeY = this._helpers.span.get('y.', dimensions[1]);
      rangeZ = this._helpers.span.get('z.', dimensions[2]);
      this.aX = rangeX.x;
      this.aY = rangeY.x;
      this.aZ = rangeZ.x;
      spanX = rangeX.y - rangeX.x;
      spanY = rangeY.y - rangeY.x;
      spanZ = rangeZ.y - rangeZ.x;
      width += padX * 2;
      height += padY * 2;
      depth += padZ * 2;
      if (centeredX) {
        inverseX = 1 / Math.max(1, width);
        this.aX += spanX * inverseX / 2;
      } else {
        inverseX = 1 / Math.max(1, width - 1);
      }
      if (centeredY) {
        inverseY = 1 / Math.max(1, height);
        this.aY += spanY * inverseY / 2;
      } else {
        inverseY = 1 / Math.max(1, height - 1);
      }
      if (centeredZ) {
        inverseZ = 1 / Math.max(1, depth);
        this.aZ += spanZ * inverseZ / 2;
      } else {
        inverseZ = 1 / Math.max(1, depth - 1);
      }
      this.bX = spanX * inverseX;
      this.bY = spanY * inverseY;
      this.bZ = spanZ * inverseZ;
      this.aX += this.bX * padX;
      this.aY += this.bY * padY;
      return this.aZ += this.bZ * padY;
    }

    callback(callback) {
      this.updateSpan();
      if (this.last === callback) {
        return this._callback;
      }
      this.last = callback;
      if (callback.length <= 7) {
        return this._callback = (emit, i, j, k) => {
          var x, y, z;
          x = this.aX + this.bX * i;
          y = this.aY + this.bY * j;
          z = this.aZ + this.bZ * k;
          return callback(emit, x, y, z, i, j, k);
        };
      } else {
        return this._callback = (emit, i, j, k) => {
          var x, y, z;
          x = this.aX + this.bX * i;
          y = this.aY + this.bY * j;
          z = this.aZ + this.bZ * k;
          return callback(emit, x, y, z, i, j, k, this.bufferClock, this.bufferStep);
        };
      }
    }

    make() {
      super.make();
      this._helpers.span.make();
      return this._listen(this, 'span.range', this.updateSpan);
    }

    unmake() {
      super.unmake();
      return this._helpers.span.unmake();
    }

  };

  Volume.traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture', 'voxel', 'span:x', 'span:y', 'span:z', 'volume', 'sampler:x', 'sampler:y', 'sampler:z', 'raw'];

  return Volume;

}).call(this);

module.exports = Volume;


},{"../../../util":190,"./voxel":76}],76:[function(require,module,exports){
var Buffer, Util, Voxel,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

Buffer = require('./buffer');

Util = require('../../../util');

Voxel = (function() {
  class Voxel extends Buffer {
    constructor() {
      super(...arguments);
      this.update = this.update.bind(this);
    }

    init() {
      super.init();
      this.buffer = this.spec = null;
      this.space = {
        width: 0,
        height: 0,
        depth: 0
      };
      this.used = {
        width: 0,
        height: 0,
        depth: 0
      };
      this.storage = 'voxelBuffer';
      return this.passthrough = function(emit, x, y, z) {
        return emit(x, y, z, 0);
      };
    }

    sourceShader(shader) {
      var dims;
      dims = this.getDimensions();
      this.alignShader(dims, shader);
      return this.buffer.shader(shader);
    }

    getDimensions() {
      return {
        items: this.items,
        width: this.space.width,
        height: this.space.height,
        depth: this.space.depth
      };
    }

    getActiveDimensions() {
      return {
        items: this.items,
        width: this.used.width,
        height: this.used.height,
        depth: this.used.depth * this.buffer.getFilled()
      };
    }

    getRawDimensions() {
      return this.getDimensions();
    }

    make() {
      var channels, data, depth, dims, height, items, magFilter, minFilter, ref, ref1, ref2, reserveX, reserveY, reserveZ, space, type, width;
      super.make();
      // Read sampling parameters
      minFilter = (ref = this.minFilter) != null ? ref : this.props.minFilter;
      magFilter = (ref1 = this.magFilter) != null ? ref1 : this.props.magFilter;
      type = (ref2 = this.type) != null ? ref2 : this.props.type;
      // Read given dimensions
      width = this.props.width;
      height = this.props.height;
      depth = this.props.depth;
      reserveX = this.props.bufferWidth;
      reserveY = this.props.bufferHeight;
      reserveZ = this.props.bufferDepth;
      channels = this.props.channels;
      items = this.props.items;
      dims = this.spec = {channels, items, width, height, depth};
      this.items = dims.items;
      this.channels = dims.channels;
      // Init to right size if data supplied
      data = this.props.data;
      dims = Util.Data.getDimensions(data, dims);
      space = this.space;
      space.width = Math.max(reserveX, dims.width || 1);
      space.height = Math.max(reserveY, dims.height || 1);
      space.depth = Math.max(reserveZ, dims.depth || 1);
      // Create voxel buffer
      return this.buffer = this._renderables.make(this.storage, {
        width: space.width,
        height: space.height,
        depth: space.depth,
        channels: channels,
        items: items,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
    }

    unmake() {
      super.unmake();
      if (this.buffer) {
        this.buffer.dispose();
        return this.buffer = this.spec = null;
      }
    }

    change(changed, touched, init) {
      var depth, height, width;
      if (touched['texture'] || changed['buffer.channels'] || changed['buffer.items'] || changed['voxel.bufferWidth'] || changed['voxel.bufferHeight'] || changed['voxel.bufferDepth']) {
        return this.rebuild();
      }
      if (!this.buffer) {
        return;
      }
      if (changed['voxel.width']) {
        width = this.props.width;
        if (width > this.space.width) {
          return this.rebuild();
        }
      }
      if (changed['voxel.height']) {
        height = this.props.height;
        if (height > this.space.height) {
          return this.rebuild();
        }
      }
      if (changed['voxel.depth']) {
        depth = this.props.depth;
        if (depth > this.space.depth) {
          return this.rebuild();
        }
      }
      if (changed['data.map'] || changed['data.data'] || changed['data.resolve'] || changed['data.expr'] || init) {
        return this.buffer.setCallback(this.emitter());
      }
    }

    callback(callback) {
      if (callback.length <= 4) {
        return callback;
      } else {
        return (emit, i, j, k) => {
          return callback(emit, i, j, k, this.bufferClock, this.bufferStep);
        };
      }
    }

    update() {
      var d, data, filled, h, space, used, w;
      boundMethodCheck(this, Voxel);
      if (!this.buffer) {
        return;
      }
      ({data} = this.props);
      ({space, used} = this);
      w = used.width;
      h = used.height;
      d = used.depth;
      filled = this.buffer.getFilled();
      this.syncBuffer((abort) => {
        var _h, _w, base, depth, dims, height, length, width;
        if (data != null) {
          dims = Util.Data.getDimensions(data, this.spec);
          // Grow dimensions if needed
          if (dims.width > space.width || dims.height > space.height || dims.depth > space.depth) {
            abort();
            return this.rebuild();
          }
          used.width = dims.width;
          used.height = dims.height;
          used.depth = dims.depth;
          this.buffer.setActive(used.width, used.height, used.depth);
          if (typeof (base = this.buffer.callback).rebind === "function") {
            base.rebind(data);
          }
          return this.buffer.update();
        } else {
          width = this.spec.width || 1;
          height = this.spec.height || 1;
          depth = this.spec.depth || 1;
          this.buffer.setActive(width, height, depth);
          length = this.buffer.update();
          used.width = _w = width;
          used.height = _h = height;
          used.depth = Math.ceil(length / _w / _h);
          if (used.depth === 1) {
            used.height = Math.ceil(length / _w);
            if (used.height === 1) {
              return used.width = length;
            }
          }
        }
      });
      if (used.width !== w || used.height !== h || used.depth !== d || filled !== this.buffer.getFilled()) {
        return this.trigger({
          type: 'source.resize'
        });
      }
    }

  };

  Voxel.traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture', 'voxel', 'raw'];

  return Voxel;

}).call(this);

module.exports = Voxel;


},{"../../../util":190,"./buffer":70}],77:[function(require,module,exports){
var Axis, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Axis = (function() {
  class Axis extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.axisPosition = this.axisStep = this.resolution = this.line = this.arrows = null;
    }

    make() {
      var arrowUniforms, axis, crossed, detail, end, join, lineUniforms, mask, material, position, positionUniforms, samples, start, stroke, styleUniforms, swizzle, uniforms, unitUniforms;
      // Prepare position shader
      positionUniforms = {
        axisPosition: this._attributes.make(this._types.vec4()),
        axisStep: this._attributes.make(this._types.vec4())
      };
      this.axisPosition = positionUniforms.axisPosition.value;
      this.axisStep = positionUniforms.axisStep.value;
      // Build transform chain
      position = this._shaders.shader();
      position.pipe('axis.position', positionUniforms);
      position = this._helpers.position.pipeline(position);
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      lineUniforms = this._helpers.line.uniforms();
      arrowUniforms = this._helpers.arrow.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Line geometry
      detail = this.props.detail;
      samples = detail + 1;
      this.resolution = 1 / detail;
      // Clip start/end for terminating arrow
      ({start, end} = this.props);
      // Stroke style
      ({stroke, join} = this.props);
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build fragment material lookup
      material = this._helpers.shade.pipeline() || false;
      // Indexing by fixed or by given axis
      ({crossed, axis} = this.props);
      if (!crossed && (mask != null) && axis > 1) {
        swizzle = ['x000', 'y000', 'z000', 'w000'][axis];
        mask = this._helpers.position.swizzle(mask, swizzle);
      }
      // Make line renderable
      uniforms = Util.JS.merge(arrowUniforms, lineUniforms, styleUniforms, unitUniforms);
      this.line = this._renderables.make('line', {
        uniforms: uniforms,
        samples: samples,
        position: position,
        clip: start || end,
        stroke: stroke,
        join: join,
        mask: mask,
        material: material
      });
      // Make arrow renderables
      this.arrows = [];
      if (start) {
        this.arrows.push(this._renderables.make('arrow', {
          uniforms: uniforms,
          flip: true,
          samples: samples,
          position: position,
          mask: mask,
          material: material
        }));
      }
      if (end) {
        this.arrows.push(this._renderables.make('arrow', {
          uniforms: uniforms,
          samples: samples,
          position: position,
          mask: mask,
          material: material
        }));
      }
      // Visible, object and span traits
      this._helpers.visible.make();
      this._helpers.object.make(this.arrows.concat([this.line]));
      this._helpers.span.make();
      // Monitor view range
      return this._listen(this, 'span.range', this.updateRanges);
    }

    unmake() {
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this._helpers.span.unmake();
    }

    change(changed, touched, init) {
      if (changed['axis.detail'] || changed['line.stroke'] || changed['line.join'] || changed['axis.crossed'] || (changed['interval.axis'] && this.props.crossed)) {
        return this.rebuild();
      }
      if (touched['interval'] || touched['span'] || touched['view'] || init) {
        return this.updateRanges();
      }
    }

    updateRanges() {
      var axis, max, min, origin, range;
      ({axis, origin} = this.props);
      range = this._helpers.span.get('', axis);
      min = range.x;
      max = range.y;
      Util.Axis.setDimension(this.axisPosition, axis).multiplyScalar(min);
      Util.Axis.setDimension(this.axisStep, axis).multiplyScalar((max - min) * this.resolution);
      return Util.Axis.addOrigin(this.axisPosition, axis, origin);
    }

  };

  Axis.traits = ['node', 'object', 'visible', 'style', 'line', 'axis', 'span', 'interval', 'arrow', 'position', 'origin', 'shade'];

  Axis.defaults = {
    end: true,
    zBias: -1
  };

  return Axis;

}).call(this);

module.exports = Axis;


},{"../../../util":190,"../../primitive":59}],78:[function(require,module,exports){
var Face, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Face = (function() {
  class Face extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.face = null;
    }

    resize() {
      var depth, dims, height, items, map, width;
      if (this.bind.points == null) {
        return;
      }
      dims = this.bind.points.getActiveDimensions();
      ({items, width, height, depth} = dims);
      if (this.face) {
        this.face.geometry.clip(width, height, depth, items);
      }
      if (this.line) {
        this.line.geometry.clip(items, width, height, depth);
      }
      if (this.bind.map != null) {
        map = this.bind.map.getActiveDimensions();
        if (this.face) {
          return this.face.geometry.map(map.width, map.height, map.depth, map.items);
        }
      }
    }

    make() {
      var color, depth, dims, faceMaterial, fill, height, items, join, line, lineMaterial, lineUniforms, map, mask, material, objects, position, ref, shaded, stroke, styleUniforms, swizzle, uniforms, unitUniforms, width, wireUniforms;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        },
        {
          to: 'mesh.map',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      // Fetch position and transform to view
      position = this.bind.points.sourceShader(this._shaders.shader());
      position = this._helpers.position.pipeline(position);
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      lineUniforms = this._helpers.line.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Auto z-bias wireframe over surface
      wireUniforms = {};
      wireUniforms.styleZBias = this._attributes.make(this._types.number());
      this.wireZBias = wireUniforms.styleZBias;
      // Fetch geometry dimensions
      dims = this.bind.points.getDimensions();
      ({items, width, height, depth} = dims);
      // Get display properties
      ({line, shaded, fill, stroke, join} = this.props);
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        this.bind.colors.sourceShader(color);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build texture map lookup
      map = this._helpers.shade.map((ref = this.bind.map) != null ? ref.sourceShader(this._shaders.shader()) : void 0);
      // Build fragment material lookup
      material = this._helpers.shade.pipeline();
      faceMaterial = material || shaded;
      lineMaterial = material || false;
      objects = [];
      // Make line renderable
      if (line) {
        // Swizzle face edges into segments
        swizzle = this._shaders.shader();
        swizzle.pipe(Util.GLSL.swizzleVec4('yzwx'));
        swizzle.pipe(position);
        uniforms = Util.JS.merge(unitUniforms, lineUniforms, styleUniforms, wireUniforms);
        this.line = this._renderables.make('line', {
          uniforms: uniforms,
          samples: items,
          strips: width,
          ribbons: height,
          layers: depth,
          position: swizzle,
          color: color,
          stroke: stroke,
          join: join,
          material: lineMaterial,
          mask: mask,
          closed: true
        });
        objects.push(this.line);
      }
      // Make face renderable
      if (fill) {
        uniforms = Util.JS.merge(unitUniforms, styleUniforms, {});
        this.face = this._renderables.make('face', {
          uniforms: uniforms,
          width: width,
          height: height,
          depth: depth,
          items: items,
          position: position,
          color: color,
          material: faceMaterial,
          mask: mask,
          map: map
        });
        objects.push(this.face);
      }
      this._helpers.visible.make();
      return this._helpers.object.make(objects);
    }

    made() {
      return this.resize();
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this.face = this.line = null;
    }

    change(changed, touched, init) {
      var fill, lineBias, zBias;
      if (changed['geometry.points'] || touched['mesh']) {
        return this.rebuild();
      }
      if (changed['style.zBias'] || changed['mesh.lineBias'] || init) {
        ({fill, zBias, lineBias} = this.props);
        return this.wireZBias.value = zBias + (fill ? lineBias : 0);
      }
    }

  };

  Face.traits = ['node', 'object', 'visible', 'style', 'line', 'mesh', 'face', 'geometry', 'position', 'bind', 'shade'];

  return Face;

}).call(this);

module.exports = Face;


},{"../../../util":190,"../../primitive":59}],79:[function(require,module,exports){
var Grid, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Grid = (function() {
  class Grid extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.axes = null;
    }

    make() {
      var axes, axis, crossed, join, lineX, lineY, lines, mask, material, stroke, transpose;
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build fragment material lookup
      material = this._helpers.shade.pipeline() || false;
      axis = (first, second, transpose) => {
        var buffer, detail, line, lineUniforms, p, position, positionUniforms, resolution, samples, strips, styleUniforms, uniforms, unitUniforms, values;
        // Prepare data buffer of tick positions
        detail = this._get(first + 'axis.detail');
        samples = detail + 1;
        resolution = 1 / detail;
        strips = this._helpers.scale.divide(second);
        buffer = this._renderables.make('dataBuffer', {
          width: strips,
          channels: 1
        });
        // Prepare position shader
        positionUniforms = {
          gridPosition: this._attributes.make(this._types.vec4()),
          gridStep: this._attributes.make(this._types.vec4()),
          gridAxis: this._attributes.make(this._types.vec4())
        };
        values = {
          gridPosition: positionUniforms.gridPosition.value,
          gridStep: positionUniforms.gridStep.value,
          gridAxis: positionUniforms.gridAxis.value
        };
        // Build transform chain
        p = position = this._shaders.shader();
        // Align second grid with first in mask space if requested
        if ((transpose != null) && (mask != null)) {
          mask = this._helpers.position.swizzle(mask, transpose);
        }
        // Require buffer sampler as callback
        p.require(buffer.shader(this._shaders.shader(), 2));
        // Calculate grid position
        p.pipe('grid.position', positionUniforms);
        // Apply view transform
        position = this._helpers.position.pipeline(p);
        // Prepare bound uniforms
        styleUniforms = this._helpers.style.uniforms();
        lineUniforms = this._helpers.line.uniforms();
        unitUniforms = this._inherit('unit').getUnitUniforms();
        uniforms = Util.JS.merge(lineUniforms, styleUniforms, unitUniforms);
        // Make line renderable
        line = this._renderables.make('line', {
          uniforms: uniforms,
          samples: samples,
          strips: strips,
          position: position,
          stroke: stroke,
          join: join,
          mask: mask,
          material: material
        });
        // Store axis object for manipulation later
        return {first, second, resolution, samples, line, buffer, values};
      };
      // Generate both line sets
      ({lineX, lineY, crossed, axes} = this.props);
      transpose = ['0000', 'x000', 'y000', 'z000', 'w000'][axes[1]];
      // Stroke style
      ({stroke, join} = this.props);
      this.axes = [];
      lineX && this.axes.push(axis('x.', 'y.', null));
      lineY && this.axes.push(axis('y.', 'x.', crossed ? null : transpose));
      // Register lines
      lines = (function() {
        var i, len, ref, results;
        ref = this.axes;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          axis = ref[i];
          results.push(axis.line);
        }
        return results;
      }).call(this);
      this._helpers.visible.make();
      this._helpers.object.make(lines);
      this._helpers.span.make();
      // Monitor view range
      return this._listen(this, 'span.range', this.updateRanges);
    }

    unmake() {
      var axis, i, len, ref;
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      this._helpers.span.unmake();
      ref = this.axes;
      for (i = 0, len = ref.length; i < len; i++) {
        axis = ref[i];
        axis.buffer.dispose();
      }
      return this.axes = null;
    }

    change(changed, touched, init) {
      if (changed['x.axis.detail'] || changed['y.axis.detail'] || changed['x.axis.factor'] || changed['y.axis.factor'] || changed['grid.lineX'] || changed['grid.lineY'] || changed['line.stroke'] || changed['line.join'] || changed['grid.crossed'] || (changed['grid.axes'] && this.props.crossed)) {
        return this.rebuild();
      }
      if (touched['x'] || touched['y'] || touched['area'] || touched['grid'] || touched['view'] || init) {
        return this.updateRanges();
      }
    }

    updateRanges() {
      var axes, axis, lineX, lineY, origin, range1, range2;
      axis = (x, y, range1, range2, axis) => {
        var buffer, first, line, max, min, n, resolution, samples, second, ticks, values;
        ({first, second, resolution, samples, line, buffer, values} = axis);
        // Set line steps along first axis
        min = range1.x;
        max = range1.y;
        Util.Axis.setDimension(values.gridPosition, x).multiplyScalar(min);
        Util.Axis.setDimension(values.gridStep, x).multiplyScalar((max - min) * resolution);
        // Add origin on remaining two axes
        Util.Axis.addOrigin(values.gridPosition, axes, origin);
        // Calculate scale along second axis
        min = range2.x;
        max = range2.y;
        ticks = this._helpers.scale.generate(second, buffer, min, max);
        Util.Axis.setDimension(values.gridAxis, y);
        // Clip to number of ticks
        n = ticks.length;
        return line.geometry.clip(samples, n, 1, 1);
      };
      // Fetch grid range in both dimensions
      ({axes, origin} = this.props);
      range1 = this._helpers.span.get('x.', axes[0]);
      range2 = this._helpers.span.get('y.', axes[1]);
      // Update both line sets
      ({lineX, lineY} = this.props);
      if (lineX) {
        axis(axes[0], axes[1], range1, range2, this.axes[0]);
      }
      if (lineY) {
        return axis(axes[1], axes[0], range2, range1, this.axes[+lineX]);
      }
    }

  };

  Grid.traits = ['node', 'object', 'visible', 'style', 'line', 'grid', 'area', 'position', 'origin', 'shade', 'axis:x', 'axis:y', 'scale:x', 'scale:y', 'span:x', 'span:y'];

  Grid.defaults = {
    width: 1,
    zBias: -2
  };

  return Grid;

}).call(this);

module.exports = Grid;


},{"../../../util":190,"../../primitive":59}],80:[function(require,module,exports){
var Line, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Line = (function() {
  class Line extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.line = this.arrows = null;
    }

    resize() {
      var arrow, dims, i, layers, len, ref, results, ribbons, samples, strips;
      if (this.bind.points == null) {
        return;
      }
      dims = this.bind.points.getActiveDimensions();
      samples = dims.width;
      strips = dims.height;
      ribbons = dims.depth;
      layers = dims.items;
      this.line.geometry.clip(samples, strips, ribbons, layers);
      ref = this.arrows;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        arrow = ref[i];
        results.push(arrow.geometry.clip(samples, strips, ribbons, layers));
      }
      return results;
    }

    make() {
      var arrowUniforms, color, dims, end, join, layers, lineUniforms, mask, material, position, proximity, ribbons, samples, start, strips, stroke, styleUniforms, uniforms, unitUniforms;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      // Build transform chain
      position = this._shaders.shader();
      // Fetch position
      position = this.bind.points.sourceShader(position);
      // Transform position to view
      position = this._helpers.position.pipeline(position);
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      lineUniforms = this._helpers.line.uniforms();
      arrowUniforms = this._helpers.arrow.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Clip start/end for terminating arrow
      ({start, end} = this.props);
      // Stroke style
      ({stroke, join, proximity} = this.props);
      this.proximity = proximity;
      // Fetch geometry dimensions
      dims = this.bind.points.getDimensions();
      samples = dims.width;
      strips = dims.height;
      ribbons = dims.depth;
      layers = dims.items;
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        this.bind.colors.sourceShader(color);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build fragment material lookup
      material = this._helpers.shade.pipeline() || false;
      // Make line renderable
      uniforms = Util.JS.merge(arrowUniforms, lineUniforms, styleUniforms, unitUniforms);
      this.line = this._renderables.make('line', {
        uniforms: uniforms,
        samples: samples,
        strips: strips,
        ribbons: ribbons,
        layers: layers,
        position: position,
        color: color,
        clip: start || end,
        stroke: stroke,
        join: join,
        proximity: proximity,
        mask: mask,
        material: material
      });
      // Make arrow renderables
      this.arrows = [];
      if (start) {
        this.arrows.push(this._renderables.make('arrow', {
          uniforms: uniforms,
          flip: true,
          samples: samples,
          strips: strips,
          ribbons: ribbons,
          layers: layers,
          position: position,
          color: color,
          mask: mask,
          material: material
        }));
      }
      if (end) {
        this.arrows.push(this._renderables.make('arrow', {
          uniforms: uniforms,
          samples: samples,
          strips: strips,
          ribbons: ribbons,
          layers: layers,
          position: position,
          color: color,
          mask: mask,
          material: material
        }));
      }
      this._helpers.visible.make();
      return this._helpers.object.make(this.arrows.concat([this.line]));
    }

    made() {
      return this.resize();
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this.line = this.arrows = null;
    }

    change(changed, touched, init) {
      if (changed['geometry.points'] || changed['line.stroke'] || changed['line.join'] || changed['arrow.start'] || changed['arrow.end']) {
        return this.rebuild();
      }
      if (changed['line.proximity']) {
        if ((this.proximity != null) !== (this.props.proximity != null)) {
          return this.rebuild();
        }
      }
    }

  };

  Line.traits = ['node', 'object', 'visible', 'style', 'line', 'arrow', 'geometry', 'position', 'bind', 'shade'];

  return Line;

}).call(this);

module.exports = Line;


},{"../../../util":190,"../../primitive":59}],81:[function(require,module,exports){
var Point, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Point = (function() {
  class Point extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.point = null;
    }

    resize() {
      var depth, dims, height, items, width;
      if (this.bind.points == null) {
        return;
      }
      dims = this.bind.points.getActiveDimensions();
      ({items, width, height, depth} = dims);
      return this.point.geometry.clip(width, height, depth, items);
    }

    make() {
      var color, depth, dims, fill, height, items, mask, material, optical, pointUniforms, position, shape, size, styleUniforms, uniforms, unitUniforms, width;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        },
        {
          to: 'point.sizes',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      // Build transform chain
      position = this._shaders.shader();
      // Fetch position and transform to view
      position = this.bind.points.sourceShader(position);
      position = this._helpers.position.pipeline(position);
      // Fetch geometry dimensions
      dims = this.bind.points.getDimensions();
      ({items, width, height, depth} = dims);
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      pointUniforms = this._helpers.point.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        this.bind.colors.sourceShader(color);
      }
      // Build size lookup
      if (this.bind.sizes) {
        size = this._shaders.shader();
        this.bind.sizes.sourceShader(size);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build fragment material lookup
      material = this._helpers.shade.pipeline() || false;
      // Point style
      shape = this.props.shape;
      fill = this.props.fill;
      optical = this.props.optical;
      // Make point renderable
      uniforms = Util.JS.merge(unitUniforms, pointUniforms, styleUniforms);
      this.point = this._renderables.make('point', {
        uniforms: uniforms,
        width: width,
        height: height,
        depth: depth,
        items: items,
        position: position,
        color: color,
        size: size,
        shape: shape,
        optical: optical,
        fill: fill,
        mask: mask,
        material: material
      });
      this._helpers.visible.make();
      return this._helpers.object.make([this.point]);
    }

    made() {
      return this.resize();
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this.point = null;
    }

    change(changed, touched, init) {
      if (changed['geometry.points'] || changed['point.shape'] || changed['point.fill']) {
        return this.rebuild();
      }
    }

  };

  Point.traits = ['node', 'object', 'visible', 'style', 'point', 'geometry', 'position', 'bind', 'shade'];

  return Point;

}).call(this);

module.exports = Point;


},{"../../../util":190,"../../primitive":59}],82:[function(require,module,exports){
var Primitive, Strip, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Strip = (function() {
  class Strip extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.strip = null;
    }

    resize() {
      var depth, dims, height, items, map, width;
      if (this.bind.points == null) {
        return;
      }
      dims = this.bind.points.getActiveDimensions();
      ({items, width, height, depth} = dims);
      if (this.strip) {
        this.strip.geometry.clip(width, height, depth, items);
      }
      if (this.line) {
        this.line.geometry.clip(items, width, height, depth);
      }
      if (this.bind.map != null) {
        map = this.bind.map.getActiveDimensions();
        if (this.strip) {
          return this.strip.geometry.map(map.width, map.height, map.depth, map.items);
        }
      }
    }

    make() {
      var color, depth, dims, faceMaterial, fill, height, items, join, line, lineMaterial, lineUniforms, map, mask, material, objects, position, ref, shaded, stroke, styleUniforms, swizzle, uniforms, unitUniforms, width, wireUniforms;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        },
        {
          to: 'mesh.map',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      // Build transform chain
      position = this._shaders.shader();
      // Fetch position
      position = this.bind.points.sourceShader(position);
      // Transform position to view
      position = this._helpers.position.pipeline(position);
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      lineUniforms = this._helpers.line.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Get display properties
      line = this.props.line;
      shaded = this.props.shaded;
      fill = this.props.fill;
      // Auto z-bias wireframe over surface
      wireUniforms = {};
      wireUniforms.styleZBias = this._attributes.make(this._types.number());
      this.wireZBias = wireUniforms.styleZBias;
      // Fetch geometry dimensions
      dims = this.bind.points.getDimensions();
      ({items, width, height, depth} = dims);
      // Get display properties
      ({line, shaded, fill, stroke, join} = this.props);
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        color = this.bind.colors.sourceShader(color);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build texture map lookup
      map = this._helpers.shade.map((ref = this.bind.map) != null ? ref.sourceShader(this._shaders.shader()) : void 0);
      // Build fragment material lookup
      material = this._helpers.shade.pipeline();
      faceMaterial = material || shaded;
      lineMaterial = material || false;
      objects = [];
      // Make line renderable
      if (line) {
        // Swizzle strip edges into segments
        swizzle = this._shaders.shader();
        swizzle.pipe(Util.GLSL.swizzleVec4('yzwx'));
        swizzle.pipe(position);
        uniforms = Util.JS.merge(unitUniforms, lineUniforms, styleUniforms, wireUniforms);
        this.line = this._renderables.make('line', {
          uniforms: uniforms,
          samples: items,
          strips: width,
          ribbons: height,
          layers: depth,
          position: swizzle,
          color: color,
          stroke: stroke,
          join: join,
          mask: mask,
          material: lineMaterial
        });
        objects.push(this.line);
      }
      // Make strip renderable
      if (fill) {
        uniforms = Util.JS.merge(styleUniforms, {});
        this.strip = this._renderables.make('strip', {
          uniforms: uniforms,
          width: width,
          height: height,
          depth: depth,
          items: items,
          position: position,
          color: color,
          material: faceMaterial
        });
        objects.push(this.strip);
      }
      this._helpers.visible.make();
      return this._helpers.object.make(objects);
    }

    made() {
      return this.resize();
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this.strip = null;
    }

    change(changed, touched, init) {
      var fill, lineBias, zBias;
      if (changed['geometry.points'] || touched['mesh']) {
        return this.rebuild();
      }
      if (changed['style.zBias'] || changed['mesh.lineBias'] || init) {
        ({fill, zBias, lineBias} = this.props);
        return this.wireZBias.value = zBias + (fill ? lineBias : 0);
      }
    }

  };

  Strip.traits = ['node', 'object', 'visible', 'style', 'line', 'mesh', 'strip', 'geometry', 'position', 'bind', 'shade'];

  return Strip;

}).call(this);

module.exports = Strip;


},{"../../../util":190,"../../primitive":59}],83:[function(require,module,exports){
var Primitive, Surface, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Surface = (function() {
  class Surface extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.lineX = this.lineY = this.surface = null;
    }

    resize() {
      var depth, dims, height, items, map, width;
      if (this.bind.points == null) {
        return;
      }
      dims = this.bind.points.getActiveDimensions();
      ({width, height, depth, items} = dims);
      if (this.surface) {
        this.surface.geometry.clip(width, height, depth, items);
      }
      if (this.lineX) {
        this.lineX.geometry.clip(width, height, depth, items);
      }
      if (this.lineY) {
        this.lineY.geometry.clip(height, width, depth, items);
      }
      if (this.bind.map != null) {
        map = this.bind.map.getActiveDimensions();
        if (this.surface) {
          return this.surface.geometry.map(map.width, map.height, map.depth, map.items);
        }
      }
    }

    make() {
      var closedX, closedY, color, crossed, depth, dims, faceMaterial, fill, height, items, join, lineMaterial, lineUniforms, lineX, lineY, map, mask, material, objects, position, proximity, ref, shaded, stroke, styleUniforms, surfaceUniforms, swizzle, swizzle2, uniforms, unitUniforms, width, wireUniforms, zUnits;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        },
        {
          to: 'mesh.map',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      // Build transform chain
      position = this._shaders.shader();
      // Fetch position and transform to view
      position = this.bind.points.sourceShader(position);
      position = this._helpers.position.pipeline(position);
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      wireUniforms = this._helpers.style.uniforms();
      lineUniforms = this._helpers.line.uniforms();
      surfaceUniforms = this._helpers.surface.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Darken wireframe if needed for contrast
      // Auto z-bias wireframe over surface
      wireUniforms.styleColor = this._attributes.make(this._types.color());
      wireUniforms.styleZBias = this._attributes.make(this._types.number());
      this.wireColor = wireUniforms.styleColor.value;
      this.wireZBias = wireUniforms.styleZBias;
      this.wireScratch = new THREE.Color();
      // Fetch geometry dimensions
      dims = this.bind.points.getDimensions();
      ({width, height, depth, items} = dims);
      // Get display properties
      ({shaded, fill, lineX, lineY, closedX, closedY, stroke, join, proximity, crossed} = this.props);
      objects = [];
      this.proximity = proximity;
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        this.bind.colors.sourceShader(color);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build texture map lookup
      map = this._helpers.shade.map((ref = this.bind.map) != null ? ref.sourceShader(this._shaders.shader()) : void 0);
      // Build fragment material lookup
      material = this._helpers.shade.pipeline();
      faceMaterial = material || shaded;
      lineMaterial = material || false;
      // Make line and surface renderables
      ({swizzle, swizzle2} = this._helpers.position);
      uniforms = Util.JS.merge(unitUniforms, lineUniforms, styleUniforms, wireUniforms);
      zUnits = lineX || lineY ? -50 : 0;
      if (lineX) {
        this.lineX = this._renderables.make('line', {
          uniforms: uniforms,
          samples: width,
          strips: height,
          ribbons: depth,
          layers: items,
          position: position,
          color: color,
          zUnits: -zUnits,
          stroke: stroke,
          join: join,
          mask: mask,
          material: lineMaterial,
          proximity: proximity,
          closed: closedX || closed
        });
        objects.push(this.lineX);
      }
      if (lineY) {
        this.lineY = this._renderables.make('line', {
          uniforms: uniforms,
          samples: height,
          strips: width,
          ribbons: depth,
          layers: items,
          position: swizzle2(position, 'yxzw', 'yxzw'),
          color: swizzle(color, 'yxzw'),
          zUnits: -zUnits,
          stroke: stroke,
          join: join,
          mask: swizzle(mask, crossed ? 'xyzw' : 'yxzw'),
          material: lineMaterial,
          proximity: proximity,
          closed: closedY || closed
        });
        objects.push(this.lineY);
      }
      if (fill) {
        uniforms = Util.JS.merge(unitUniforms, surfaceUniforms, styleUniforms);
        this.surface = this._renderables.make('surface', {
          uniforms: uniforms,
          width: width,
          height: height,
          surfaces: depth,
          layers: items,
          position: position,
          color: color,
          zUnits: zUnits,
          stroke: stroke,
          material: faceMaterial,
          mask: mask,
          map: map,
          intUV: true,
          closedX: closedX || closed,
          closedY: closedY || closed
        });
        objects.push(this.surface);
      }
      this._helpers.visible.make();
      return this._helpers.object.make(objects);
    }

    made() {
      return this.resize();
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this.lineX = this.lineY = this.surface = null;
    }

    change(changed, touched, init) {
      var c, color, fill, lineBias, zBias;
      if (changed['geometry.points'] || changed['mesh.shaded'] || changed['mesh.fill'] || changed['line.stroke'] || changed['line.join'] || touched['grid']) {
        return this.rebuild();
      }
      if (changed['style.color'] || changed['style.zBias'] || changed['mesh.fill'] || changed['mesh.lineBias'] || init) {
        ({fill, color, zBias, lineBias} = this.props);
        this.wireZBias.value = zBias + (fill ? lineBias : 0);
        this.wireColor.copy(color);
        if (fill) {
          c = this.wireScratch;
          c.setRGB(color.x, color.y, color.z);
          c.convertGammaToLinear().multiplyScalar(.75).convertLinearToGamma();
          this.wireColor.x = c.r;
          this.wireColor.y = c.g;
          this.wireColor.z = c.b;
        }
      }
      if (changed['line.proximity']) {
        if ((this.proximity != null) !== (this.props.proximity != null)) {
          return this.rebuild();
        }
      }
    }

  };

  Surface.traits = ['node', 'object', 'visible', 'style', 'line', 'mesh', 'geometry', 'surface', 'position', 'grid', 'bind', 'shade'];

  Surface.defaults = {
    lineX: false,
    lineY: false
  };

  return Surface;

}).call(this);

module.exports = Surface;


},{"../../../util":190,"../../primitive":59}],84:[function(require,module,exports){
var Primitive, Ticks, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Ticks = (function() {
  class Ticks extends Primitive {
    init() {
      return this.tickStrip = this.line = null;
    }

    resize() {
      var active, dims, layers, ribbons, strips;
      if (this.bind.points == null) {
        return;
      }
      dims = this.bind.points.getActiveDimensions();
      active = +(dims.items > 0);
      strips = dims.width * active;
      ribbons = dims.height * active;
      layers = dims.depth * active;
      this.line.geometry.clip(2, strips, ribbons, layers);
      return this.tickStrip.set(0, strips - 1);
    }

    make() {
      var color, dims, join, layers, lineUniforms, mask, material, p, position, positionUniforms, ribbons, strips, stroke, styleUniforms, swizzle, swizzle2, uniforms, unitUniforms;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      lineUniforms = this._helpers.line.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      uniforms = Util.JS.merge(lineUniforms, styleUniforms, unitUniforms);
      // Prepare position shader
      positionUniforms = {
        tickEpsilon: this.node.attributes['ticks.epsilon'],
        tickSize: this.node.attributes['ticks.size'],
        tickNormal: this.node.attributes['ticks.normal'],
        tickStrip: this._attributes.make(this._types.vec2(0, 0)),
        worldUnit: uniforms.worldUnit,
        focusDepth: uniforms.focusDepth
      };
      this.tickStrip = positionUniforms.tickStrip.value;
      // Build transform chain
      p = position = this._shaders.shader();
      // Require buffer sampler as callback
      p.require(this.bind.points.sourceShader(this._shaders.shader()));
      // Require view transform as callback
      p.require(this._helpers.position.pipeline(this._shaders.shader()));
      // Link to tick shader
      p.pipe('ticks.position', positionUniforms);
      // Stroke style
      ({stroke, join} = this.props);
      // Fetch geometry dimensions
      dims = this.bind.points.getDimensions();
      strips = dims.width;
      ribbons = dims.height;
      layers = dims.depth;
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        this.bind.colors.sourceShader(color);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build fragment material lookup
      material = this._helpers.shade.pipeline() || false;
      // Make line renderable
      ({swizzle, swizzle2} = this._helpers.position);
      this.line = this._renderables.make('line', {
        uniforms: uniforms,
        samples: 2,
        strips: strips,
        ribbons: ribbons,
        layers: layers,
        position: position,
        color: color,
        stroke: stroke,
        join: join,
        mask: swizzle(mask, 'yzwx'),
        material: material
      });
      this._helpers.visible.make();
      return this._helpers.object.make([this.line]);
    }

    made() {
      return this.resize();
    }

    unmake() {
      this.line = null;
      this._helpers.visible.unmake();
      return this._helpers.object.unmake();
    }

    change(changed, touched, init) {
      if (changed['geometry.points'] || changed['line.stroke'] || changed['line.join']) {
        return this.rebuild();
      }
    }

  };

  Ticks.traits = ['node', 'object', 'visible', 'style', 'line', 'ticks', 'geometry', 'position', 'bind', 'shade'];

  return Ticks;

}).call(this);

module.exports = Ticks;


},{"../../../util":190,"../../primitive":59}],85:[function(require,module,exports){
var Primitive, Util, Vector;

Primitive = require('../../primitive');

Util = require('../../../util');

Vector = (function() {
  class Vector extends Primitive {
    constructor(node, context, helpers) {
      super(node, context, helpers);
      this.line = this.arrows = null;
    }

    resize() {
      var arrow, dims, i, layers, len, ref, results, ribbons, samples, strips;
      if (this.bind.points == null) {
        return;
      }
      dims = this.bind.points.getActiveDimensions();
      samples = dims.items;
      strips = dims.width;
      ribbons = dims.height;
      layers = dims.depth;
      this.line.geometry.clip(samples, strips, ribbons, layers);
      ref = this.arrows;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        arrow = ref[i];
        results.push(arrow.geometry.clip(samples, strips, ribbons, layers));
      }
      return results;
    }

    make() {
      var arrowUniforms, color, dims, end, join, layers, lineUniforms, mask, material, position, proximity, ribbons, samples, start, strips, stroke, styleUniforms, swizzle, swizzle2, uniforms, unitUniforms;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      // Build transform chain
      position = this._shaders.shader();
      // Fetch position
      this.bind.points.sourceShader(position);
      // Transform position to view
      this._helpers.position.pipeline(position);
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      lineUniforms = this._helpers.line.uniforms();
      arrowUniforms = this._helpers.arrow.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Clip start/end for terminating arrow
      ({start, end} = this.props);
      // Stroke style
      ({stroke, join, proximity} = this.props);
      this.proximity = proximity;
      // Fetch geometry dimensions
      dims = this.bind.points.getDimensions();
      samples = dims.items;
      strips = dims.width;
      ribbons = dims.height;
      layers = dims.depth;
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        this.bind.colors.sourceShader(color);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Build fragment material lookup
      material = this._helpers.shade.pipeline() || false;
      // Swizzle vector to line
      ({swizzle, swizzle2} = this._helpers.position);
      position = swizzle2(position, 'yzwx', 'yzwx');
      color = swizzle(color, 'yzwx');
      mask = swizzle(mask, 'yzwx');
      material = swizzle(material, 'yzwx');
      // Make line renderable
      uniforms = Util.JS.merge(arrowUniforms, lineUniforms, styleUniforms, unitUniforms);
      this.line = this._renderables.make('line', {
        uniforms: uniforms,
        samples: samples,
        ribbons: ribbons,
        strips: strips,
        layers: layers,
        position: position,
        color: color,
        clip: start || end,
        stroke: stroke,
        join: join,
        proximity: proximity,
        mask: mask,
        material: material
      });
      // Make arrow renderables
      this.arrows = [];
      if (start) {
        this.arrows.push(this._renderables.make('arrow', {
          uniforms: uniforms,
          flip: true,
          samples: samples,
          ribbons: ribbons,
          strips: strips,
          layers: layers,
          position: position,
          color: color,
          mask: mask,
          material: material
        }));
      }
      if (end) {
        this.arrows.push(this._renderables.make('arrow', {
          uniforms: uniforms,
          samples: samples,
          ribbons: ribbons,
          strips: strips,
          layers: layers,
          position: position,
          color: color,
          mask: mask,
          material: material
        }));
      }
      this._helpers.visible.make();
      return this._helpers.object.make(this.arrows.concat([this.line]));
    }

    made() {
      return this.resize();
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this.line = this.arrows = null;
    }

    change(changed, touched, init) {
      if (changed['geometry.points'] || changed['line.stroke'] || changed['line.join'] || changed['arrow.start'] || changed['arrow.end']) {
        return this.rebuild();
      }
      if (changed['line.proximity']) {
        if ((this.proximity != null) !== (this.props.proximity != null)) {
          return this.rebuild();
        }
      }
    }

  };

  Vector.traits = ['node', 'object', 'visible', 'style', 'line', 'arrow', 'geometry', 'position', 'bind', 'shade'];

  return Vector;

}).call(this);

module.exports = Vector;


},{"../../../util":190,"../../primitive":59}],86:[function(require,module,exports){

/*

This is the general dumping ground for trait behavior.

Helpers are auto-attached to primitives that have the matching trait

*/
var Util, View, helpers,
  indexOf = [].indexOf;

Util = require('../../util');

View = require('./view/view');

helpers = {
  bind: {
    make: function(slots) {
      var callback, done, i, isUnique, j, len, len1, multiple, name, optional, s, selector, slot, source, start, to, trait, unique;
      if (this.bind == null) {
        this.bind = {};
      }
      if (this.bound == null) {
        this.bound = [];
      }
// Fetch attached objects and bind to them
// Attach rebuild watcher for DOM changes to bound nodes
      for (i = 0, len = slots.length; i < len; i++) {
        slot = slots[i];
        ({to, trait, optional, unique, multiple, callback} = slot);
        if (callback == null) {
          callback = this.rebuild;
        }
        name = to.split(/\./g).pop();
        selector = this._get(to);
        // Find by selector
        source = null;
        if (selector != null) {
          start = this;
          done = false;
          while (!done) {
            // Keep scanning back until a new node is found
            start = source = this._attach(selector, trait, callback, this, start, optional, multiple);
            isUnique = unique && ((source == null) || this.bound.indexOf(source) < 0);
            done = multiple || optional || !unique || isUnique;
          }
        }
        // Monitor source for reallocation / resize
        if (source != null) {
          if (this.resize != null) {
            this._listen(source, 'source.resize', this.resize);
          }
          if (callback) {
            this._listen(source, 'source.rebuild', callback);
          }
          if (multiple) {
            for (j = 0, len1 = source.length; j < len1; j++) {
              s = source[j];
              this.bound.push(s);
            }
          } else {
            this.bound.push(source);
          }
        }
        this.bind[name] = source;
      }
      return null;
    },
    unmake: function() {
      if (!this.bind) {
        return;
      }
      delete this.bind;
      return delete this.bound;
    }
  },
  span: {
    make: function() {
      // Look up nearest view to inherit from
      // Monitor size changes
      this.spanView = this._inherit('view');
      return this._listen('view', 'view.range', () => {
        return this.trigger({
          type: 'span.range'
        });
      });
    },
    unmake: function() {
      return delete this.spanView;
    },
    get: (function() {
      var def;
      def = new THREE.Vector2(-1, 1);
      return function(prefix, dimension) {
        var range, ref, ref1;
        // Return literal range
        range = this._get(prefix + 'span.range');
        if (range != null) {
          return range;
        }
        // Inherit from view
        return (ref = (ref1 = this.spanView) != null ? ref1.axis(dimension) : void 0) != null ? ref : def;
      };
    })()
  },
  scale: {
    // Divisions to allocate on scale
    divide: function(prefix) {
      var divide, factor;
      divide = this._get(prefix + 'scale.divide');
      factor = this._get(prefix + 'scale.factor');
      return Math.round(divide * 2.5 / factor);
    },
    // Generate ticks on scale
    generate: function(prefix, buffer, min, max) {
      var base, divide, end, factor, mode, nice, start, ticks, unit, zero;
      mode = this._get(prefix + 'scale.mode');
      divide = this._get(prefix + 'scale.divide');
      unit = this._get(prefix + 'scale.unit');
      base = this._get(prefix + 'scale.base');
      factor = this._get(prefix + 'scale.factor');
      start = this._get(prefix + 'scale.start');
      end = this._get(prefix + 'scale.end');
      zero = this._get(prefix + 'scale.zero');
      nice = this._get(prefix + 'scale.nice');
      ticks = Util.Ticks.make(mode, min, max, divide, unit, base, factor, start, end, zero, nice);
      buffer.copy(ticks);
      return ticks;
    }
  },
  style: {
    // Return bound style uniforms
    uniforms: function() {
      return {
        styleColor: this.node.attributes['style.color'],
        styleOpacity: this.node.attributes['style.opacity'],
        styleZBias: this.node.attributes['style.zBias'],
        styleZIndex: this.node.attributes['style.zIndex']
      };
    }
  },
  arrow: {
    // Return bound arrow style uniforms
    uniforms: function() {
      var end, size, space, start, style;
      start = this.props.start;
      end = this.props.end;
      space = this._attributes.make(this._types.number(1.25 / (start + end)));
      style = this._attributes.make(this._types.vec2(+start, +end));
      size = this.node.attributes['arrow.size'];
      return {
        clipStyle: style,
        clipRange: size,
        clipSpace: space,
        arrowSpace: space,
        arrowSize: size
      };
    }
  },
  point: {
    // Return bound point style uniforms
    uniforms: function() {
      return {
        pointSize: this.node.attributes['point.size'],
        pointDepth: this.node.attributes['point.depth']
      };
    }
  },
  line: {
    // Return bound line style uniforms
    uniforms: function() {
      return {
        lineWidth: this.node.attributes['line.width'],
        lineDepth: this.node.attributes['line.depth'],
        lineProximity: this.node.attributes['line.proximity']
      };
    }
  },
  surface: {
    // Return bound surface style uniforms
    uniforms: function() {
      return {};
    }
  },
  shade: {
    pipeline: function(shader) {
      var i, pass, ref;
      if (!this._inherit('fragment')) {
        return shader;
      }
      if (shader == null) {
        shader = this._shaders.shader();
      }
      for (pass = i = 0; i <= 2; pass = ++i) {
        shader = (ref = this._inherit('fragment')) != null ? ref.fragment(shader, pass) : void 0;
      }
      shader.pipe('fragment.map.rgba');
      return shader;
    },
    map: function(shader) {
      if (!shader) {
        return shader;
      }
      return shader = this._shaders.shader().pipe('mesh.map.uvwo').pipe(shader);
    }
  },
  position: {
    pipeline: function(shader) {
      var i, pass, ref;
      if (!this._inherit('vertex')) {
        return shader;
      }
      if (shader == null) {
        shader = this._shaders.shader();
      }
      for (pass = i = 0; i <= 3; pass = ++i) {
        shader = (ref = this._inherit('vertex')) != null ? ref.vertex(shader, pass) : void 0;
      }
      return shader;
    },
    swizzle: function(shader, order) {
      if (shader) {
        return this._shaders.shader().pipe(Util.GLSL.swizzleVec4(order)).pipe(shader);
      }
    },
    swizzle2: function(shader, order1, order2) {
      if (shader) {
        return this._shaders.shader().split().pipe(Util.GLSL.swizzleVec4(order1)).next().pipe(Util.GLSL.swizzleVec4(order2)).join().pipe(shader);
      }
    }
  },
  visible: {
    make: function() {
      var e, onVisible, visible, visibleParent;
      e = {
        type: 'visible.change'
      };
      visible = null;
      this.setVisible = function(vis) {
        if (vis != null) {
          visible = vis;
        }
        return onVisible();
      };
      onVisible = () => {
        var last, ref, self;
        last = this.isVisible;
        self = (ref = visible != null ? visible : this._get('object.visible')) != null ? ref : true;
        if (typeof visibleParent !== "undefined" && visibleParent !== null) {
          self && (self = visibleParent.isVisible);
        }
        this.isVisible = self;
        if (last !== this.isVisible) {
          return this.trigger(e);
        }
      };
      visibleParent = this._inherit('visible');
      if (visibleParent) {
        this._listen(visibleParent, 'visible.change', onVisible);
      }
      if (this.is('object')) {
        this._listen(this.node, 'change:object', onVisible);
      }
      return onVisible();
    },
    unmake: function() {
      return delete this.isVisible;
    }
  },
  active: {
    make: function() {
      var active, activeParent, e, onActive;
      e = {
        type: 'active.change'
      };
      active = null;
      this.setActive = function(act) {
        if (act != null) {
          active = act;
        }
        return onActive();
      };
      onActive = () => {
        var last, ref, self;
        last = this.isActive;
        self = (ref = active != null ? active : this._get('entity.active')) != null ? ref : true;
        if (typeof activeParent !== "undefined" && activeParent !== null) {
          self && (self = activeParent.isActive);
        }
        this.isActive = self;
        if (last !== this.isActive) {
          return this.trigger(e);
        }
      };
      activeParent = this._inherit('active');
      if (activeParent) {
        this._listen(activeParent, 'active.change', onActive);
      }
      if (this.is('entity')) {
        this._listen(this.node, 'change:entity', onActive);
      }
      return onActive();
    },
    unmake: function() {
      return delete this.isActive;
    }
  },
  object: {
    // Generic 3D renderable wrapper, handles the fiddly Three.js bits that require a 'style recalculation'.

    // Pass renderables to nearest root for rendering
    // Track visibility from parent and notify children
    // Track blends / transparency for three.js materials
    make: function(objects = []) {
      var blending, hasStyle, i, last, len, object, objectScene, onChange, onVisible, opacity, ref, zOrder, zTest, zWrite;
      this.objects = objects;
      // Aggregate rendered three objects for reference
      this.renders = this.objects.reduce((function(a, b) {
        return a.concat(b.renders);
      }), []);
      objectScene = this._inherit('scene');
      opacity = blending = zOrder = null;
      hasStyle = indexOf.call(this.traits, 'style') >= 0;
      opacity = 1;
      blending = THREE.NormalBlending;
      zWrite = true;
      zTest = true;
      if (hasStyle) {
        opacity = this.props.opacity;
        blending = this.props.blending;
        zOrder = this.props.zOrder;
        zWrite = this.props.zWrite;
        zTest = this.props.zTest;
      }
      onChange = (event) => {
        var changed, refresh;
        changed = event.changed;
        refresh = null;
        if (changed['style.opacity']) {
          refresh = opacity = this.props.opacity;
        }
        if (changed['style.blending']) {
          refresh = blending = this.props.blending;
        }
        if (changed['style.zOrder']) {
          refresh = zOrder = this.props.zOrder;
        }
        if (changed['style.zWrite']) {
          refresh = zWrite = this.props.zWrite;
        }
        if (changed['style.zTest']) {
          refresh = zTest = this.props.zTest;
        }
        if (refresh != null) {
          return onVisible();
        }
      };
      last = null;
      onVisible = () => {
        var i, j, l, len, len1, len2, o, order, ref, ref1, ref2, ref3, results, results1, results2, visible;
        order = zOrder != null ? -zOrder : this.node.order;
        visible = ((ref = this.isVisible) != null ? ref : true) && opacity > 0;
        if (visible) {
          if (hasStyle) {
            ref1 = this.objects;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              o = ref1[i];
              o.show(opacity < 1, blending, order);
              results.push(o.depth(zWrite, zTest));
            }
            return results;
          } else {
            ref2 = this.objects;
            results1 = [];
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              o = ref2[j];
              results1.push(o.show(true, blending, order));
            }
            return results1;
          }
        } else {
          ref3 = this.objects;
          results2 = [];
          for (l = 0, len2 = ref3.length; l < len2; l++) {
            o = ref3[l];
            results2.push(o.hide());
          }
          return results2;
        }
      };
      this._listen(this.node, 'change:style', onChange);
      this._listen(this.node, 'reindex', onVisible);
      this._listen(this, 'visible.change', onVisible);
      ref = this.objects;
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        objectScene.adopt(object);
      }
      return onVisible();
    },
    unmake: function(dispose = true) {
      var i, j, len, len1, object, objectScene, ref, ref1, results;
      if (!this.objects) {
        return;
      }
      objectScene = this._inherit('scene');
      ref = this.objects;
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        objectScene.unadopt(object);
      }
      if (dispose) {
        ref1 = this.objects;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          object = ref1[j];
          results.push(object.dispose());
        }
        return results;
      }
    },
    mask: function() {
      var mask, shader;
      if (!(mask = this._inherit('mask'))) {
        return;
      }
      return shader = mask.mask(shader);
    }
  },
  unit: {
    make: function() {
      var bottom, focusDepth, handler, pixelRatio, pixelUnit, renderAspect, renderHeight, renderOdd, renderScale, renderScaleInv, renderWidth, root, top, viewHeight, viewWidth, worldUnit, π;
      π = Math.PI;
      this.unitUniforms = {
        renderScaleInv: renderScaleInv = this._attributes.make(this._types.number(1)),
        renderScale: renderScale = this._attributes.make(this._types.number(1)),
        renderAspect: renderAspect = this._attributes.make(this._types.number(1)),
        renderWidth: renderWidth = this._attributes.make(this._types.number(0)),
        renderHeight: renderHeight = this._attributes.make(this._types.number(0)),
        viewWidth: viewWidth = this._attributes.make(this._types.number(0)),
        viewHeight: viewHeight = this._attributes.make(this._types.number(0)),
        pixelRatio: pixelRatio = this._attributes.make(this._types.number(1)),
        pixelUnit: pixelUnit = this._attributes.make(this._types.number(1)),
        worldUnit: worldUnit = this._attributes.make(this._types.number(1)),
        focusDepth: focusDepth = this._attributes.make(this._types.number(1)),
        renderOdd: renderOdd = this._attributes.make(this._types.vec2())
      };
      top = new THREE.Vector3();
      bottom = new THREE.Vector3();
      handler = () => {
        var camera, dpr, focus, fov, fovtan, isAbsolute, m, measure, pixel, ref, rscale, scale, size, world;
        if ((size = typeof root !== "undefined" && root !== null ? root.getSize() : void 0) == null) {
          return;
        }
        π = Math.PI;
        scale = this.props.scale;
        fov = this.props.fov;
        focus = (ref = this.props.focus) != null ? ref : this.inherit('unit').props.focus;
        isAbsolute = scale === null;
        // Measure live FOV to be able to accurately predict anti-aliasing in perspective
        measure = 1;
        if ((camera = typeof root !== "undefined" && root !== null ? root.getCamera() : void 0)) {
          m = camera.projectionMatrix;
          // Measure top to bottom
          top.set(0, -.5, 1).applyProjection(m);
          bottom.set(0, .5, 1).applyProjection(m);
          top.sub(bottom);
          measure = top.y;
        }
        // Calculate device pixel ratio
        dpr = size.renderHeight / size.viewHeight;
        // Calculate correction for fixed on-screen size regardless of FOV
        fovtan = fov != null ? measure * Math.tan(fov * π / 360) : 1;
        // Calculate device pixels per virtual pixel
        pixel = isAbsolute ? dpr : size.renderHeight / scale * fovtan;
        // Calculate device pixels per world unit
        rscale = size.renderHeight * measure / 2;
        // Calculate world units per virtual pixel
        world = pixel / rscale;
        viewWidth.value = size.viewWidth;
        viewHeight.value = size.viewHeight;
        renderWidth.value = size.renderWidth;
        renderHeight.value = size.renderHeight;
        renderAspect.value = size.aspect;
        renderScale.value = rscale;
        renderScaleInv.value = 1 / rscale;
        pixelRatio.value = dpr;
        pixelUnit.value = pixel;
        worldUnit.value = world;
        focusDepth.value = focus;
        return renderOdd.value.set(size.renderWidth % 2, size.renderHeight % 2).multiplyScalar(.5);
      };
      //console.log 'worldUnit', world, pixel, rscale, isAbsolute
      root = this.is('root') ? this : this._inherit('root');
      //@_listen root, 'root.resize', handler
      //@_listen root, 'root.camera', handler
      //@_listen @node, 'change:unit', handler
      this._listen(root, 'root.update', handler);
      return handler();
    },
    unmake: function() {
      return delete this.unitUniforms;
    },
    get: function() {
      var k, ref, u, v;
      u = {};
      ref = this.unitUniforms;
      for (k in ref) {
        v = ref[k];
        u[k] = v.value;
      }
      return u;
    },
    uniforms: function() {
      return this.unitUniforms;
    }
  }
};

module.exports = function(object, traits) {
  var h, i, key, len, method, methods, trait;
  h = {};
  for (i = 0, len = traits.length; i < len; i++) {
    trait = traits[i];
    if (!(methods = helpers[trait])) {
      continue;
    }
    h[trait] = {};
    for (key in methods) {
      method = methods[key];
      h[trait][key] = method.bind(object);
    }
  }
  return h;
};


},{"../../util":190,"./view/view":137}],87:[function(require,module,exports){
var Model;

Model = require('../../model');

exports.Classes = require('./classes');

exports.Types = require('./types');

exports.Traits = require('./traits');

exports.Helpers = require('./helpers');


},{"../../model":49,"./classes":67,"./helpers":86,"./traits":122,"./types":130}],88:[function(require,module,exports){
var Clamp, Operator;

Operator = require('./operator');

Clamp = (function() {
  class Clamp extends Operator {
    indexShader(shader) {
      shader.pipe(this.operator);
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      shader.pipe(this.operator);
      return super.sourceShader(shader);
    }

    make() {
      var transform, uniforms;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Max index on all 4 dimensions
      uniforms = {
        clampLimit: this._attributes.make(this._types.vec4())
      };
      this.clampLimit = uniforms.clampLimit;
      // Build shader to clamp along all dimensions
      transform = this._shaders.shader();
      transform.pipe('clamp.position', uniforms);
      return this.operator = transform;
    }

    unmake() {
      return super.unmake();
    }

    resize() {
      var dims;
      if (this.bind.source != null) {
        dims = this.bind.source.getActiveDimensions();
        this.clampLimit.value.set(dims.width - 1, dims.height - 1, dims.depth - 1, dims.items - 1);
      }
      return super.resize();
    }

    change(changed, touched, init) {
      if (touched['operator'] || touched['clamp']) {
        return this.rebuild();
      }
    }

  };

  Clamp.traits = ['node', 'bind', 'operator', 'source', 'index', 'clamp'];

  return Clamp;

}).call(this);

module.exports = Clamp;


},{"./operator":93}],89:[function(require,module,exports){
var Grow, Operator;

Operator = require('./operator');

Grow = (function() {
  class Grow extends Operator {
    sourceShader(shader) {
      return shader.pipe(this.operator);
    }

    make() {
      var transform, uniforms;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Uniforms
      uniforms = {
        growScale: this.node.attributes['grow.scale'],
        growMask: this._attributes.make(this._types.vec4()),
        growAnchor: this._attributes.make(this._types.vec4())
      };
      this.growMask = uniforms.growMask.value;
      this.growAnchor = uniforms.growAnchor.value;
      // Build shader to spread data on one dimension
      transform = this._shaders.shader();
      transform.require(this.bind.source.sourceShader(this._shaders.shader()));
      transform.pipe('grow.position', uniforms);
      return this.operator = transform;
    }

    unmake() {
      return super.unmake();
    }

    resize() {
      this.update();
      return super.resize();
    }

    update() {
      var anchor, dims, i, j, key, len, m, order, results;
      // Size to fit to include future history
      dims = this.bind.source.getFutureDimensions();
      order = ['width', 'height', 'depth', 'items'];
      m = function(d, anchor) {
        return ((d || 1) - 1) * (.5 - anchor * .5);
      };
      results = [];
      for (i = j = 0, len = order.length; j < len; i = ++j) {
        key = order[i];
        anchor = this.props[key];
        this.growMask.setComponent(i, +(anchor == null));
        results.push(this.growAnchor.setComponent(i, anchor != null ? m(dims[key], anchor) : 0));
      }
      return results;
    }

    change(changed, touched, init) {
      if (touched['operator']) {
        return this.rebuild();
      }
      if (touched['grow']) {
        return this.update();
      }
    }

  };

  Grow.traits = ['node', 'bind', 'operator', 'source', 'index', 'grow'];

  return Grow;

}).call(this);

module.exports = Grow;


},{"./operator":93}],90:[function(require,module,exports){

/*
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  overlap:     Types.int(0)
*/
var Join, Operator, Util;

Operator = require('./operator');

Util = require('../../../util');

Join = (function() {
  class Join extends Operator {
    indexShader(shader) {
      shader.pipe(this.operator);
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      shader.pipe(this.operator);
      return super.sourceShader(shader);
    }

    getDimensions() {
      return this._resample(this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._resample(this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._resample(this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._resample(this.bind.source.getIndexDimensions());
    }

    _resample(dims) {
      var axis, dim, i, index, j, labels, len, length, mapped, order, out, overlap, product, ref, set, stride;
      order = this.order;
      axis = this.axis;
      overlap = this.overlap;
      length = this.length;
      stride = this.stride;
      labels = ['width', 'height', 'depth', 'items'];
      mapped = order.map(function(x) {
        return labels[x - 1];
      });
      index = order.indexOf(axis);
      set = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = mapped.length; j < len; j++) {
          dim = mapped[j];
          results.push(dims[dim]);
        }
        return results;
      })();
      product = ((ref = set[index + 1]) != null ? ref : 1) * stride;
      set.splice(index, 2, product);
      set = set.slice(0, 3);
      set.push(1);
      out = {};
      for (i = j = 0, len = mapped.length; j < len; i = ++j) {
        dim = mapped[i];
        out[dim] = set[i];
      }
      //console.log 'join', order, axis, length, stride
      //console.log dims, out
      return out;
    }

    make() {
      /*
      Calculate index transform

      order: wxyz
      length: 3
      overlap: 1

      axis: w
      index: 0
      rest: 00xy

      axis: x
      index: 1
      rest: w00y

      axis: y
      index: 2
      rest: wx00

      axis: z
      index: 3
      rest: wxy0

      */
      var axis, dims, index, labels, length, major, order, overlap, permute, rest, stride, transform, uniforms;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      order = this.props.order;
      axis = this.props.axis;
      overlap = this.props.overlap;
      permute = order.join('');
      if (axis == null) {
        axis = order[0];
      }
      index = permute.indexOf(axis);
      rest = permute.replace(axis, '00').substring(0, 4);
      labels = [null, 'width', 'height', 'depth', 'items'];
      major = labels[axis];
      // Prepare uniforms
      dims = this.bind.source.getDimensions();
      length = dims[major];
      overlap = Math.min(length - 1, overlap);
      stride = length - overlap;
      uniforms = {
        joinStride: this._attributes.make(this._types.number(stride)),
        joinStrideInv: this._attributes.make(this._types.number(1 / stride))
      };
      // Build shader to split a dimension into two
      transform = this._shaders.shader();
      transform.require(Util.GLSL.swizzleVec4(axis, 1));
      transform.require(Util.GLSL.swizzleVec4(rest, 4));
      transform.require(Util.GLSL.injectVec4([index, index + 1]));
      transform.pipe('join.position', uniforms);
      transform.pipe(Util.GLSL.invertSwizzleVec4(order));
      this.operator = transform;
      this.order = order;
      this.axis = axis;
      this.overlap = overlap;
      this.length = length;
      return this.stride = stride;
    }

    unmake() {
      return super.unmake();
    }

    change(changed, touched, init) {
      if (touched['join'] || touched['operator']) {
        return this.rebuild();
      }
    }

  };

  Join.traits = ['node', 'bind', 'operator', 'source', 'index', 'join'];

  return Join;

}).call(this);

module.exports = Join;


},{"../../../util":190,"./operator":93}],91:[function(require,module,exports){
var Lerp, Operator, Util;

Operator = require('./operator');

Util = require('../../../util');

Lerp = (function() {
  class Lerp extends Operator {
    indexShader(shader) {
      shader.pipe(this.indexer);
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      return shader.pipe(this.operator);
    }

    getDimensions() {
      return this._resample(this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._resample(this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._resample(this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._resample(this.bind.source.getIndexDimensions());
    }

    _resample(dims) {
      var c, p, r;
      r = this.resampled;
      c = this.centered;
      p = this.padding;
      if (this.relativeSize) {
        if (!c.items) {
          dims.items--;
        }
        if (!c.width) {
          dims.width--;
        }
        if (!c.height) {
          dims.height--;
        }
        if (!c.depth) {
          dims.depth--;
        }
        if (r.items != null) {
          dims.items *= r.items;
        }
        if (r.width != null) {
          dims.width *= r.width;
        }
        if (r.height != null) {
          dims.height *= r.height;
        }
        if (r.depth != null) {
          dims.depth *= r.depth;
        }
        if (!c.items) {
          dims.items++;
        }
        if (!c.width) {
          dims.width++;
        }
        if (!c.height) {
          dims.height++;
        }
        if (!c.depth) {
          dims.depth++;
        }
        dims.items -= p.items * 2;
        dims.width -= p.width * 2;
        dims.height -= p.height * 2;
        dims.depth -= p.depth * 2;
      } else {
        if (r.items != null) {
          dims.items = r.items;
        }
        if (r.width != null) {
          dims.width = r.width;
        }
        if (r.height != null) {
          dims.height = r.height;
        }
        if (r.depth != null) {
          dims.depth = r.depth;
        }
      }
      dims.items = Math.max(0, Math.floor(dims.items));
      dims.width = Math.max(0, Math.floor(dims.width));
      dims.height = Math.max(0, Math.floor(dims.height));
      dims.depth = Math.max(0, Math.floor(dims.depth));
      return dims;
    }

    make() {
      var any, centered, depth, height, i, id, indexer, items, j, k, key, len, len1, operator, ref, ref1, relativeSize, resize, sampler, size, uniforms, vec, width;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Get resampled dimensions
      ({size, items, width, height, depth} = this.props);
      // Sampler behavior
      relativeSize = size === this.node.attributes['lerp.size'].enum.relative;
      this.resampled = {};
      if (items != null) {
        this.resampled.items = items;
      }
      if (width != null) {
        this.resampled.width = width;
      }
      if (height != null) {
        this.resampled.height = height;
      }
      if (depth != null) {
        this.resampled.depth = depth;
      }
      this.centered = {};
      this.centered.items = this.props.centeredW;
      this.centered.width = this.props.centeredX;
      this.centered.height = this.props.centeredY;
      this.centered.depth = this.props.centeredZ;
      this.padding = {};
      this.padding.items = this.props.paddingW;
      this.padding.width = this.props.paddingX;
      this.padding.height = this.props.paddingY;
      this.padding.depth = this.props.paddingZ;
      // Build shader to resample data
      operator = this._shaders.shader();
      indexer = this._shaders.shader();
      // Uniforms
      uniforms = {
        resampleFactor: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
        resampleBias: this._attributes.make(this._types.vec4(0, 0, 0, 0))
      };
      this.resampleFactor = uniforms.resampleFactor;
      this.resampleBias = uniforms.resampleBias;
      // Has resize props?
      resize = (items != null) || (width != null) || (height != null) || (depth != null);
      // Add padding
      operator.pipe('resample.padding', uniforms);
      // Prepare centered sampling offset
      vec = [];
      any = false;
      ref = ['width', 'height', 'depth', 'items'];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        key = ref[i];
        centered = this.centered[key];
        any || (any = centered);
        vec[i] = centered ? "0.5" : "0.0";
      }
      // Add centered sampling offset (from source)
      if (any && resize) {
        vec = `vec4(${vec})`;
        operator.pipe(Util.GLSL.binaryOperator(4, '+', vec4));
        indexer.pipe(Util.GLSL.binaryOperator(4, '+', vec4));
      }
      // Addressing relative to target
      if (resize) {
        operator.pipe('resample.relative', uniforms);
        indexer.pipe('resample.relative', uniforms);
      } else {
        operator.pipe(Util.GLSL.identity('vec4'));
        indexer.pipe(Util.GLSL.identity('vec4'));
      }
      // Remove centered sampling offset (to target)
      if (any && resize) {
        operator.pipe(Util.GLSL.binaryOperator(4, '-', vec));
        indexer.pipe(Util.GLSL.binaryOperator(4, '-', vec));
      }
      // Make sampler
      sampler = this.bind.source.sourceShader(this._shaders.shader());
      ref1 = ['width', 'height', 'depth', 'items'];
      // Iterate over dimensions (items, width, height, depth)
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        key = ref1[i];
        id = `lerp.${key}`;
        if (this.props[key] != null) {
          sampler = this._shaders.shader().require(sampler);
          sampler.pipe(id, uniforms);
        }
      }
      // Combine operator and composite lerp sampler
      operator.pipe(sampler);
      this.operator = operator;
      this.indexer = indexer;
      return this.relativeSize = relativeSize;
    }

    unmake() {
      super.unmake();
      return this.operator = null;
    }

    resize() {
      var axis, bd, bh, bi, bw, dims, rd, rh, ri, rw, target;
      if (this.bind.source == null) {
        return;
      }
      dims = this.bind.source.getActiveDimensions();
      target = this.getActiveDimensions();
      axis = (key) => {
        var centered, pad, res;
        centered = this.centered[key];
        pad = this.padding[key];
        target[key] += pad * 2;
        res = centered ? dims[key] / Math.max(1, target[key]) : Math.max(1, dims[key] - 1) / Math.max(1, target[key] - 1);
        return [res, pad];
      };
      [rw, bw] = axis('width');
      [rh, bh] = axis('height');
      [rd, bd] = axis('depth');
      [ri, bi] = axis('items');
      this.resampleFactor.value.set(rw, rh, rd, ri);
      this.resampleBias.value.set(bw, bh, bd, bi);
      return super.resize();
    }

    change(changed, touched, init) {
      if (touched['operator'] || touched['lerp'] || touched['sampler']) {
        return this.rebuild();
      }
    }

  };

  Lerp.traits = ['node', 'bind', 'operator', 'source', 'index', 'lerp', 'sampler:x', 'sampler:y', 'sampler:z', 'sampler:w'];

  return Lerp;

}).call(this);

module.exports = Lerp;


},{"../../../util":190,"./operator":93}],92:[function(require,module,exports){
var Memo, Operator, Util;

Operator = require('./operator');

Util = require('../../../util');

Memo = (function() {
  class Memo extends Operator {
    sourceShader(shader) {
      return this.memo.shaderAbsolute(shader, 1);
    }

    make() {
      var depth, dims, height, items, magFilter, minFilter, operator, type, width;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Listen for updates
      this._helpers.active.make();
      this._listen('root', 'root.update', () => {
        if (this.isActive) {
          return this.update();
        }
      });
      // Read sampling parameters
      ({minFilter, magFilter, type} = this.props);
      // Fetch geometry dimensions
      dims = this.bind.source.getDimensions();
      ({items, width, height, depth} = dims);
      // Prepare memoization RTT
      this.memo = this._renderables.make('memo', {
        items: items,
        width: width,
        height: height,
        depth: depth,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
      // Build shader to remap data (do it after RTT creation to allow feedback)
      operator = this._shaders.shader();
      this.bind.source.sourceShader(operator);
      // Make screen renderable inside RTT scene
      this.compose = this._renderables.make('memoScreen', {
        map: operator,
        items: items,
        width: width,
        height: height,
        depth: depth
      });
      this.memo.adopt(this.compose);
      this.objects = [this.compose];
      return this.renders = this.compose.renders;
    }

    unmake() {
      super.unmake();
      if (this.bind.source != null) {
        this._helpers.active.unmake();
        this.memo.unadopt(this.compose);
        this.memo.dispose();
        return this.memo = this.compose = null;
      }
    }

    update() {
      var ref;
      return (ref = this.memo) != null ? ref.render() : void 0;
    }

    resize() {
      var depth, dims, height, width;
      if (this.bind.source == null) {
        return;
      }
      // Fetch geometry dimensions
      dims = this.bind.source.getActiveDimensions();
      ({width, height, depth} = dims);
      // Cover only part of the RTT viewport
      this.compose.cover(width, height, depth);
      return super.resize();
    }

    change(changed, touched, init) {
      if (touched['texture'] || touched['operator']) {
        return this.rebuild();
      }
    }

  };

  Memo.traits = ['node', 'bind', 'active', 'operator', 'source', 'index', 'texture', 'memo'];

  return Memo;

}).call(this);

module.exports = Memo;


},{"../../../util":190,"./operator":93}],93:[function(require,module,exports){
var Operator, Source;

Source = require('../base/source');

Operator = (function() {
  class Operator extends Source {
    indexShader(shader) {
      var ref;
      return (ref = this.bind.source) != null ? typeof ref.indexShader === "function" ? ref.indexShader(shader) : void 0 : void 0;
    }

    sourceShader(shader) {
      var ref;
      return (ref = this.bind.source) != null ? typeof ref.sourceShader === "function" ? ref.sourceShader(shader) : void 0 : void 0;
    }

    getDimensions() {
      return this.bind.source.getDimensions();
    }

    getFutureDimensions() {
      return this.bind.source.getFutureDimensions();
    }

    getActiveDimensions() {
      return this.bind.source.getActiveDimensions();
    }

    getIndexDimensions() {
      return this.bind.source.getIndexDimensions();
    }

    init() {
      return this.sourceSpec = [
        {
          to: 'operator.source',
          trait: 'source'
        }
      ];
    }

    make() {
      super.make();
      // Bind to attached data sources
      return this._helpers.bind.make(this.sourceSpec);
    }

    made() {
      this.resize();
      return super.made();
    }

    unmake() {
      return this._helpers.bind.unmake();
    }

    resize(rebuild) {
      return this.trigger({
        type: 'source.resize'
      });
    }

  };

  Operator.traits = ['node', 'bind', 'operator', 'source', 'index'];

  return Operator;

}).call(this);

module.exports = Operator;


},{"../base/source":64}],94:[function(require,module,exports){
var Primitive, Readback, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Readback = (function() {
  class Readback extends Primitive {
    init() {
      this.emitter = this.root = null;
      return this.active = {};
    }

    make() {
      var channels, depth, expr, height, items, sampler, type, width;
      super.make();
      this._compute('readback.data', () => {
        var ref;
        return (ref = this.readback) != null ? ref.data : void 0;
      });
      this._compute('readback.items', () => {
        var ref;
        return (ref = this.readback) != null ? ref.items : void 0;
      });
      this._compute('readback.width', () => {
        var ref;
        return (ref = this.readback) != null ? ref.width : void 0;
      });
      this._compute('readback.height', () => {
        var ref;
        return (ref = this.readback) != null ? ref.height : void 0;
      });
      this._compute('readback.depth', () => {
        var ref;
        return (ref = this.readback) != null ? ref.depth : void 0;
      });
      // Bind to attached objects
      this._helpers.bind.make([
        {
          to: 'operator.source',
          trait: 'source'
        }
      ]);
      if (this.bind.source == null) {
        return;
      }
      // Sampler props
      ({type, channels, expr} = this.props);
      // Listen for updates
      this.root = this._inherit('root');
      this._listen('root', 'root.update', this.update);
      // Fetch source dimensions
      ({items, width, height, depth} = this.bind.source.getDimensions());
      // Build shader to sample source data
      sampler = this.bind.source.sourceShader(this._shaders.shader());
      // Prepare readback/memo RTT
      this.readback = this._renderables.make('readback', {
        map: sampler,
        items: items,
        width: width,
        height: height,
        depth: depth,
        channels: channels,
        type: type
      });
      if (expr != null) {
        // Prepare readback consumer
        this.readback.setCallback(expr);
      }
      return this._helpers.active.make();
    }

    unmake() {
      if (this.readback != null) {
        this.readback.dispose();
        this.readback = null;
        this.root = null;
        this.emitter = null;
        this.active = {};
      }
      this._helpers.active.unmake();
      return this._helpers.bind.unmake();
    }

    update() {
      var ref;
      if (this.readback == null) {
        return;
      }
      if (this.isActive) {
        this.readback.update((ref = this.root) != null ? ref.getCamera() : void 0);
        this.readback.post();
        if (this.props.expr != null) {
          return this.readback.iterate();
        }
      }
    }

    resize() {
      var depth, height, items, sI, sJ, sK, width;
      if (this.readback == null) {
        return;
      }
      // Fetch geometry/html dimensions
      ({items, width, height, depth} = this.bind.source.getActiveDimensions());
      // Limit readback to active area
      this.readback.setActive(items, width, height, depth);
      // Recalculate iteration strides
      this.strideI = sI = items;
      this.strideJ = sJ = sI * width;
      return this.strideK = sK = sJ * height;
    }

    change(changed, touched, init) {
      if (changed['readback.type']) {
        return this.rebuild();
      }
      if (changed['readback.expr'] && this.readback) {
        return this.readback.setCallback(this.props.expr);
      }
    }

  };

  Readback.traits = ['node', 'bind', 'operator', 'readback', 'entity', 'active'];

  Readback.finals = {
    channels: 4
  };

  return Readback;

}).call(this);

module.exports = Readback;


},{"../../../util":190,"../../primitive":59}],95:[function(require,module,exports){
var Operator, Repeat;

Operator = require('./operator');

Repeat = (function() {
  class Repeat extends Operator {
    indexShader(shader) {
      shader.pipe(this.operator);
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      shader.pipe(this.operator);
      return super.sourceShader(shader);
    }

    getDimensions() {
      return this._resample(this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._resample(this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._resample(this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._resample(this.bind.source.getIndexDimensions());
    }

    _resample(dims) {
      var r;
      r = this.resample;
      return {
        items: r.items * dims.items,
        width: r.width * dims.width,
        height: r.height * dims.height,
        depth: r.depth * dims.depth
      };
    }

    make() {
      var transform, uniforms;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Repeat multipliers
      this.resample = {};
      // Modulus on all 4 dimensions
      uniforms = {
        repeatModulus: this._attributes.make(this._types.vec4())
      };
      this.repeatModulus = uniforms.repeatModulus;
      // Build shader to repeat along all dimensions
      transform = this._shaders.shader();
      transform.pipe('repeat.position', uniforms);
      return this.operator = transform;
    }

    unmake() {
      return super.unmake();
    }

    resize() {
      var dims;
      if (this.bind.source != null) {
        dims = this.bind.source.getActiveDimensions();
        this.repeatModulus.value.set(dims.width, dims.height, dims.depth, dims.items);
      }
      return super.resize();
    }

    change(changed, touched, init) {
      var i, key, len, ref, results;
      if (touched['operator'] || touched['repeat']) {
        return this.rebuild();
      }
      if (init) {
        ref = ['items', 'width', 'height', 'depth'];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          results.push(this.resample[key] = this.props[key]);
        }
        return results;
      }
    }

  };

  Repeat.traits = ['node', 'bind', 'operator', 'source', 'index', 'repeat'];

  return Repeat;

}).call(this);

module.exports = Repeat;


},{"./operator":93}],96:[function(require,module,exports){
var Operator, Resample, Util;

Operator = require('./operator');

Util = require('../../../util');

Resample = (function() {
  class Resample extends Operator {
    indexShader(shader) {
      shader.pipe(this.indexer);
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      return shader.pipe(this.operator);
    }

    getDimensions() {
      return this._resample(this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._resample(this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._resample(this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._resample(this.bind.source.getIndexDimensions());
    }

    _resample(dims) {
      var c, p, r;
      r = this.resampled;
      c = this.centered;
      p = this.padding;
      if (this.relativeSize) {
        if (!c.items) {
          dims.items--;
        }
        if (!c.width) {
          dims.width--;
        }
        if (!c.height) {
          dims.height--;
        }
        if (!c.depth) {
          dims.depth--;
        }
        if (r.items != null) {
          dims.items *= r.items;
        }
        if (r.width != null) {
          dims.width *= r.width;
        }
        if (r.height != null) {
          dims.height *= r.height;
        }
        if (r.depth != null) {
          dims.depth *= r.depth;
        }
        if (!c.items) {
          dims.items++;
        }
        if (!c.width) {
          dims.width++;
        }
        if (!c.height) {
          dims.height++;
        }
        if (!c.depth) {
          dims.depth++;
        }
        dims.items -= p.items * 2;
        dims.width -= p.width * 2;
        dims.height -= p.height * 2;
        dims.depth -= p.depth * 2;
      } else {
        if (r.items != null) {
          dims.items = r.items;
        }
        if (r.width != null) {
          dims.width = r.width;
        }
        if (r.height != null) {
          dims.height = r.height;
        }
        if (r.depth != null) {
          dims.depth = r.depth;
        }
      }
      dims.items = Math.max(0, Math.floor(dims.items));
      dims.width = Math.max(0, Math.floor(dims.width));
      dims.height = Math.max(0, Math.floor(dims.height));
      dims.depth = Math.max(0, Math.floor(dims.depth));
      return dims;
    }

    make() {
      var any, centered, channels, depth, height, i, indexer, indices, items, j, key, len, operator, ref, relativeSample, relativeSize, resize, sample, shader, size, type, uniforms, vec, width;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Bind to attached shader
      this._helpers.bind.make([
        {
          to: 'include.shader',
          trait: 'shader',
          optional: true
        }
      ]);
      // Get custom shader
      ({indices, channels} = this.props);
      shader = this.bind.shader;
      // Get resampled dimensions (if any)
      ({sample, size, items, width, height, depth} = this.props);
      // Sampler behavior
      relativeSample = sample === this.node.attributes['resample.sample'].enum.relative;
      relativeSize = size === this.node.attributes['resample.size'].enum.relative;
      this.resampled = {};
      if (items != null) {
        this.resampled.items = items;
      }
      if (width != null) {
        this.resampled.width = width;
      }
      if (height != null) {
        this.resampled.height = height;
      }
      if (depth != null) {
        this.resampled.depth = depth;
      }
      this.centered = {};
      this.centered.items = this.props.centeredW;
      this.centered.width = this.props.centeredX;
      this.centered.height = this.props.centeredY;
      this.centered.depth = this.props.centeredZ;
      this.padding = {};
      this.padding.items = this.props.paddingW;
      this.padding.width = this.props.paddingX;
      this.padding.height = this.props.paddingY;
      this.padding.depth = this.props.paddingZ;
      // Build shader to resample data
      operator = this._shaders.shader();
      indexer = this._shaders.shader();
      // Uniforms
      type = [null, this._types.number, this._types.vec2, this._types.vec3, this._types.vec4][indices];
      uniforms = {
        dataSize: this._attributes.make(type(0, 0, 0, 0)),
        dataResolution: this._attributes.make(type(0, 0, 0, 0)),
        targetSize: this._attributes.make(type(0, 0, 0, 0)),
        targetResolution: this._attributes.make(type(0, 0, 0, 0)),
        resampleFactor: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
        resampleBias: this._attributes.make(this._types.vec4(0, 0, 0, 0))
      };
      this.dataResolution = uniforms.dataResolution;
      this.dataSize = uniforms.dataSize;
      this.targetResolution = uniforms.targetResolution;
      this.targetSize = uniforms.targetSize;
      this.resampleFactor = uniforms.resampleFactor;
      this.resampleBias = uniforms.resampleBias;
      // Has resize props?
      resize = (items != null) || (width != null) || (height != null) || (depth != null);
      // Add padding
      operator.pipe('resample.padding', uniforms);
      // Add centered sampling offset
      vec = [];
      any = false;
      ref = ['width', 'height', 'depth', 'items'];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        key = ref[i];
        centered = this.centered[key];
        any || (any = centered);
        vec[i] = centered ? "0.5" : "0.0";
      }
      if (any) {
        vec = `vec4(${vec})`;
        operator.pipe(Util.GLSL.binaryOperator(4, '+', vec4));
        if (resize) {
          indexer.pipe(Util.GLSL.binaryOperator(4, '+', vec4));
        }
      }
      if (relativeSample) {
        // Addressing relative to target
        if (resize) {
          operator.pipe('resample.relative', uniforms);
          indexer.pipe('resample.relative', uniforms);
        } else {
          indexer.pipe(Util.GLSL.identity('vec4'));
        }
      }
      if (shader != null) {
        if (indices !== 4) {
          operator.pipe(Util.GLSL.truncateVec(4, indices));
        }
        operator.callback();
        if (indices !== 4) {
          operator.pipe(Util.GLSL.extendVec(indices, 4));
        }
        if (any) {
          operator.pipe(Util.GLSL.binaryOperator(4, '-', vec));
        }
        operator.pipe(this.bind.source.sourceShader(this._shaders.shader()));
        if (channels !== 4) {
          operator.pipe(Util.GLSL.truncateVec(4, channels));
        }
        operator.join();
        if (this.bind.shader != null) {
          operator.pipe(this.bind.shader.shaderBind(uniforms));
        }
        if (channels !== 4) {
          operator.pipe(Util.GLSL.extendVec(channels, 4));
        }
      } else {
        if (any) {
          operator.pipe(Util.GLSL.binaryOperator(4, '-', vec));
        }
        operator.pipe(this.bind.source.sourceShader(this._shaders.shader()));
      }
      if (any && resize) {
        indexer.pipe(Util.GLSL.binaryOperator(4, '-', vec));
      }
      this.operator = operator;
      this.indexer = indexer;
      this.indices = indices;
      this.relativeSample = relativeSample;
      return this.relativeSize = relativeSize;
    }

    unmake() {
      super.unmake();
      return this.operator = null;
    }

    resize() {
      var axis, bd, bh, bi, bw, dims, rd, rh, ri, rw, target;
      if (this.bind.source == null) {
        return;
      }
      dims = this.bind.source.getActiveDimensions();
      target = this.getActiveDimensions();
      axis = (key) => {
        var centered, pad, res;
        centered = this.centered[key];
        pad = this.padding[key];
        target[key] += pad * 2;
        res = centered ? dims[key] / Math.max(1, target[key]) : Math.max(1, dims[key] - 1) / Math.max(1, target[key] - 1);
        return [res, pad];
      };
      [rw, bw] = axis('width');
      [rh, bh] = axis('height');
      [rd, bd] = axis('depth');
      [ri, bi] = axis('items');
      if (this.indices === 1) {
        this.dataResolution.value = 1 / dims.width;
        this.targetResolution.value = 1 / target.width;
        this.dataSize.value = dims.width;
        this.targetSize.value = target.width;
      } else {
        this.dataResolution.value.set(1 / dims.width, 1 / dims.height, 1 / dims.depth, 1 / dims.items);
        this.targetResolution.value.set(1 / target.width, 1 / target.height, 1 / target.depth, 1 / target.items);
        this.dataSize.value.set(dims.width, dims.height, dims.depth, dims.items);
        this.targetSize.value.set(target.width, target.height, target.depth, target.items);
      }
      this.resampleFactor.value.set(rw, rh, rd, ri);
      this.resampleBias.value.set(bw, bh, bd, bi);
      return super.resize();
    }

    change(changed, touched, init) {
      if (touched['operator'] || touched['resample'] || touched['sampler'] || touched['include']) {
        return this.rebuild();
      }
    }

  };

  Resample.traits = ['node', 'bind', 'operator', 'source', 'index', 'resample', 'sampler:x', 'sampler:y', 'sampler:z', 'sampler:w', 'include'];

  return Resample;

}).call(this);

module.exports = Resample;


},{"../../../util":190,"./operator":93}],97:[function(require,module,exports){
var Operator, Slice, Util;

Operator = require('./operator');

Util = require('../../../util');

Slice = (function() {
  class Slice extends Operator {
    getDimensions() {
      return this._resample(this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._resample(this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._resample(this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._resample(this.bind.source.getIndexDimensions());
    }

    sourceShader(shader) {
      shader.pipe('slice.position', this.uniforms);
      return this.bind.source.sourceShader(shader);
    }

    _resolve(key, dims) {
      var dim, end, index, range, start;
      range = this.props[key];
      dim = dims[key];
      if (range == null) {
        return [0, dim];
      }
      index = function(i, dim) {
        if (i < 0) {
          return dim + i;
        } else {
          return i;
        }
      };
      start = index(Math.round(range.x), dim);
      end = index(Math.round(range.y), dim);
      end = Math.max(start, end);
      return [start, end - start];
    }

    _resample(dims) {
      dims.width = this._resolve('width', dims)[1];
      dims.height = this._resolve('height', dims)[1];
      dims.depth = this._resolve('depth', dims)[1];
      dims.items = this._resolve('items', dims)[1];
      return dims;
    }

    make() {
      super.make();
      if (this.bind.source == null) {
        return;
      }
      return this.uniforms = {
        sliceOffset: this._attributes.make(this._types.vec4())
      };
    }

    unmake() {
      return super.unmake();
    }

    resize() {
      var dims;
      if (this.bind.source == null) {
        return;
      }
      dims = this.bind.source.getActiveDimensions();
      this.uniforms.sliceOffset.value.set(this._resolve('width', dims)[0], this._resolve('height', dims)[0], this._resolve('depth', dims)[0], this._resolve('items', dims)[0]);
      return super.resize();
    }

    change(changed, touched, init) {
      if (touched['operator']) {
        return this.rebuild();
      }
      if (touched['slice']) {
        return this.resize();
      }
    }

  };

  Slice.traits = ['node', 'bind', 'operator', 'source', 'index', 'slice'];

  return Slice;

}).call(this);

module.exports = Slice;


},{"../../../util":190,"./operator":93}],98:[function(require,module,exports){

/*
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  length:      Types.int(1)
  overlap:     Types.int(0)
*/
var Operator, Split, Util;

Operator = require('./operator');

Util = require('../../../util');

Split = (function() {
  class Split extends Operator {
    indexShader(shader) {
      shader.pipe(this.operator);
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      shader.pipe(this.operator);
      return super.sourceShader(shader);
    }

    getDimensions() {
      return this._resample(this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._resample(this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._resample(this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._resample(this.bind.source.getIndexDimensions());
    }

    _resample(dims) {
      var axis, dim, i, index, j, labels, len, length, mapped, order, out, overlap, remain, set, stride;
      order = this.order;
      axis = this.axis;
      overlap = this.overlap;
      length = this.length;
      stride = this.stride;
      labels = ['width', 'height', 'depth', 'items'];
      mapped = order.map(function(x) {
        return labels[x - 1];
      });
      index = order.indexOf(axis);
      set = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = mapped.length; j < len; j++) {
          dim = mapped[j];
          results.push(dims[dim]);
        }
        return results;
      })();
      remain = Math.floor((set[index] - overlap) / stride);
      set.splice(index, 1, length, remain);
      set = set.slice(0, 4);
      out = {};
      for (i = j = 0, len = mapped.length; j < len; i = ++j) {
        dim = mapped[i];
        out[dim] = set[i];
      }
      //console.log 'split', order, axis, length, stride
      //console.log dims, out
      return out;
    }

    make() {
      /*
      Calculate index transform

      order: wxyz
      length: 3
      overlap: 1

      axis: w
      index: 0
      split: wx
      rest:  0yz0
             s

      axis: x
      index: 1
      split: xy
      rest:  w0z0
              s

      axis: y
      index: 2
      split: yz
      rest:  wx00
               s

      axis: z
      index: 3
      split: z0
      rest: wxy0
               s

      */
      var axis, index, length, order, overlap, permute, ref, rest, split, stride, transform, uniforms;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      order = this.props.order;
      axis = this.props.axis;
      overlap = this.props.overlap;
      length = this.props.length;
      permute = order.join('');
      if (axis == null) {
        axis = order[0];
      }
      index = permute.indexOf(axis);
      split = permute[index] + ((ref = permute[index + 1]) != null ? ref : 0);
      rest = permute.replace(split[1], '').replace(split[0], '0') + '0';
      // Prepare uniforms
      overlap = Math.min(length - 1, overlap);
      stride = length - overlap;
      uniforms = {
        splitStride: this._attributes.make(this._types.number(stride))
      };
      // Build shader to split a dimension into two
      transform = this._shaders.shader();
      transform.require(Util.GLSL.swizzleVec4(split, 2));
      transform.require(Util.GLSL.swizzleVec4(rest, 4));
      transform.require(Util.GLSL.injectVec4(index));
      transform.pipe('split.position', uniforms);
      transform.pipe(Util.GLSL.invertSwizzleVec4(order));
      this.operator = transform;
      this.order = order;
      this.axis = axis;
      this.overlap = overlap;
      this.length = length;
      return this.stride = stride;
    }

    unmake() {
      return super.unmake();
    }

    change(changed, touched, init) {
      if (changed['split.axis'] || changed['split.order'] || touched['operator']) {
        return this.rebuild();
      }
    }

  };

  Split.traits = ['node', 'bind', 'operator', 'source', 'index', 'split'];

  return Split;

}).call(this);

module.exports = Split;


},{"../../../util":190,"./operator":93}],99:[function(require,module,exports){
var Operator, Spread;

Operator = require('./operator');

Spread = (function() {
  class Spread extends Operator {
    sourceShader(shader) {
      return shader.pipe(this.operator);
    }

    make() {
      var transform, uniforms;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Uniforms
      uniforms = {
        spreadMatrix: this._attributes.make(this._types.mat4()),
        spreadOffset: this._attributes.make(this._types.vec4())
      };
      this.spreadMatrix = uniforms.spreadMatrix;
      this.spreadOffset = uniforms.spreadOffset;
      // Build shader to spread data on one dimension
      transform = this._shaders.shader();
      transform.require(this.bind.source.sourceShader(this._shaders.shader()));
      transform.pipe('spread.position', uniforms);
      return this.operator = transform;
    }

    unmake() {
      return super.unmake();
    }

    resize() {
      this.update();
      return super.resize();
    }

    update() {
      var align, anchor, d, dims, els, i, j, k, key, len, map, matrix, offset, order, ref, results, spread, unit, unitEnum, v;
      // Size to fit to include future history
      dims = this.bind.source.getFutureDimensions();
      matrix = this.spreadMatrix.value;
      els = matrix.elements;
      order = ['width', 'height', 'depth', 'items'];
      align = ['alignWidth', 'alignHeight', 'alignDepth', 'alignItems'];
      ({unit} = this.props);
      unitEnum = this.node.attributes['spread.unit'].enum;
      map = (function() {
        switch (unit) {
          case unitEnum.relative:
            return function(key, i, k, v) {
              return els[i * 4 + k] = v / Math.max(1, dims[key] - 1);
            };
          case unitEnum.absolute:
            return function(key, i, k, v) {
              return els[i * 4 + k] = v;
            };
        }
      })();
      results = [];
      for (i = j = 0, len = order.length; j < len; i = ++j) {
        key = order[i];
        spread = this.props[key];
        anchor = this.props[align[i]];
        if (spread != null) {
          d = (ref = dims[key]) != null ? ref : 1;
          offset = -(d - 1) * (.5 - anchor * .5);
        } else {
          offset = 0;
        }
        this.spreadOffset.value.setComponent(i, offset);
        results.push((function() {
          var l, ref1, results1;
          results1 = [];
          for (k = l = 0; l <= 3; k = ++l) {
            v = (ref1 = spread != null ? spread.getComponent(k) : void 0) != null ? ref1 : 0;
            results1.push(els[i * 4 + k] = map(key, i, k, v));
          }
          return results1;
        })());
      }
      return results;
    }

    change(changed, touched, init) {
      if (touched['operator']) {
        return this.rebuild();
      }
      if (touched['spread']) {
        return this.update();
      }
    }

  };

  Spread.traits = ['node', 'bind', 'operator', 'source', 'index', 'spread'];

  return Spread;

}).call(this);

module.exports = Spread;


},{"./operator":93}],100:[function(require,module,exports){
var Operator, Subdivide, Util;

Operator = require('./operator');

Util = require('../../../util');

Subdivide = (function() {
  class Subdivide extends Operator {
    indexShader(shader) {
      shader.pipe(this.indexer);
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      return shader.pipe(this.operator);
    }

    getDimensions() {
      return this._resample(this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._resample(this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._resample(this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._resample(this.bind.source.getIndexDimensions());
    }

    _resample(dims) {
      var r;
      r = this.resampled;
      dims.items--;
      dims.width--;
      dims.height--;
      dims.depth--;
      if (r.items != null) {
        dims.items *= r.items;
      }
      if (r.width != null) {
        dims.width *= r.width;
      }
      if (r.height != null) {
        dims.height *= r.height;
      }
      if (r.depth != null) {
        dims.depth *= r.depth;
      }
      dims.items++;
      dims.width++;
      dims.height++;
      dims.depth++;
      return dims;
    }

    make() {
      var depth, height, i, id, indexer, items, j, key, len, lerp, operator, ref, resize, sampler, size, uniforms, width;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Get resampled dimensions
      ({size, items, width, height, depth, lerp} = this.props);
      this.resampled = {};
      if (items != null) {
        this.resampled.items = items;
      }
      if (width != null) {
        this.resampled.width = width;
      }
      if (height != null) {
        this.resampled.height = height;
      }
      if (depth != null) {
        this.resampled.depth = depth;
      }
      // Build shader to resample data
      operator = this._shaders.shader();
      indexer = this._shaders.shader();
      // Uniforms
      uniforms = {
        resampleFactor: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
        subdivideBevel: this.node.attributes['subdivide.bevel']
      };
      this.resampleFactor = uniforms.resampleFactor;
      this.resampleBias = uniforms.resampleBias;
      // Has resize props?
      resize = (items != null) || (width != null) || (height != null) || (depth != null);
      // Addressing relative to target
      if (resize) {
        operator.pipe('resample.relative', uniforms);
        indexer.pipe('resample.relative', uniforms);
      } else {
        operator.pipe(Util.GLSL.identity('vec4'));
        indexer.pipe(Util.GLSL.identity('vec4'));
      }
      // Make sampler
      sampler = this.bind.source.sourceShader(this._shaders.shader());
      lerp = lerp ? '.lerp' : '';
      ref = ['width', 'height', 'depth', 'items'];
      // Iterate over dimensions (items, width, height, depth)
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        key = ref[i];
        id = `subdivide.${key}${lerp}`;
        if (this.props[key] != null) {
          sampler = this._shaders.shader().require(sampler);
          sampler.pipe(id, uniforms);
        }
      }
      // Combine operator and composite lerp sampler
      operator.pipe(sampler);
      this.operator = operator;
      return this.indexer = indexer;
    }

    unmake() {
      super.unmake();
      return this.operator = null;
    }

    resize() {
      var axis, dims, rd, rh, ri, rw, target;
      if (this.bind.source == null) {
        return;
      }
      dims = this.bind.source.getActiveDimensions();
      target = this.getActiveDimensions();
      axis = function(key) {
        return Math.max(1, dims[key] - 1) / Math.max(1, target[key] - 1);
      };
      rw = axis('width');
      rh = axis('height');
      rd = axis('depth');
      ri = axis('items');
      this.resampleFactor.value.set(rw, rh, rd, ri);
      return super.resize();
    }

    change(changed, touched, init) {
      if (touched['operator'] || touched['subdivide']) {
        return this.rebuild();
      }
    }

  };

  Subdivide.traits = ['node', 'bind', 'operator', 'source', 'index', 'subdivide'];

  return Subdivide;

}).call(this);

module.exports = Subdivide;


},{"../../../util":190,"./operator":93}],101:[function(require,module,exports){
var Operator, Swizzle, Util;

Operator = require('./operator');

Util = require('../../../util');

Swizzle = (function() {
  class Swizzle extends Operator {
    sourceShader(shader) {
      shader = super.sourceShader(shader);
      if (this.swizzler) {
        shader.pipe(this.swizzler);
      }
      return shader;
    }

    make() {
      var order;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Swizzling order
      order = this.props.order;
      if (order.join() !== '1234') {
        return this.swizzler = Util.GLSL.swizzleVec4(order, 4);
      }
    }

    unmake() {
      super.unmake();
      return this.swizzler = null;
    }

    change(changed, touched, init) {
      if (touched['swizzle'] || touched['operator']) {
        return this.rebuild();
      }
    }

  };

  Swizzle.traits = ['node', 'bind', 'operator', 'source', 'index', 'swizzle'];

  return Swizzle;

}).call(this);

module.exports = Swizzle;


},{"../../../util":190,"./operator":93}],102:[function(require,module,exports){
var Operator, Transpose, Util, labels;

Operator = require('./operator');

Util = require('../../../util');

labels = {
  1: 'width',
  2: 'height',
  3: 'depth',
  4: 'items'
};

Transpose = (function() {
  class Transpose extends Operator {
    indexShader(shader) {
      if (this.swizzler) {
        shader.pipe(this.swizzler);
      }
      return super.indexShader(shader);
    }

    sourceShader(shader) {
      if (this.swizzler) {
        shader.pipe(this.swizzler);
      }
      return super.sourceShader(shader);
    }

    getDimensions() {
      return this._remap(this.transpose, this.bind.source.getDimensions());
    }

    getActiveDimensions() {
      return this._remap(this.transpose, this.bind.source.getActiveDimensions());
    }

    getFutureDimensions() {
      return this._remap(this.transpose, this.bind.source.getFutureDimensions());
    }

    getIndexDimensions() {
      return this._remap(this.transpose, this.bind.source.getIndexDimensions());
    }

    _remap(transpose, dims) {
      var dst, i, j, out, ref, src;
      // Map dimensions onto their new axis
      out = {};
      for (i = j = 0; j <= 3; i = ++j) {
        dst = labels[i + 1];
        src = labels[transpose[i]];
        out[dst] = (ref = dims[src]) != null ? ref : 1;
      }
      return out;
    }

    make() {
      var order;
      super.make();
      if (this.bind.source == null) {
        return;
      }
      // Transposition order
      order = this.props.order;
      if (order.join() !== '1234') {
        this.swizzler = Util.GLSL.invertSwizzleVec4(order);
      }
      this.transpose = order;
      // Notify of reallocation
      return this.trigger({
        type: 'source.rebuild'
      });
    }

    unmake() {
      super.unmake();
      return this.swizzler = null;
    }

    change(changed, touched, init) {
      if (touched['transpose'] || touched['operator']) {
        return this.rebuild();
      }
    }

  };

  Transpose.traits = ['node', 'bind', 'operator', 'source', 'index', 'transpose'];

  return Transpose;

}).call(this);

module.exports = Transpose;


},{"../../../util":190,"./operator":93}],103:[function(require,module,exports){
var DOM, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

DOM = (function() {
  class DOM extends Primitive {
    init() {
      this.emitter = this.root = null;
      return this.active = {};
    }

    make() {
      var depth, height, htmlDims, indexer, items, pointDims, position, projection, width;
      super.make();
      // Bind to attached objects
      this._helpers.bind.make([
        {
          to: 'dom.html',
          trait: 'html'
        },
        {
          to: 'dom.points',
          trait: 'source'
        }
      ]);
      if (!((this.bind.points != null) && (this.bind.html != null))) {
        return;
      }
      // Listen for updates
      this.root = this._inherit('root');
      this._listen('root', 'root.update', this.update);
      this._listen('root', 'root.post', this.post);
      // Fetch geometry dimensions
      pointDims = this.bind.points.getDimensions();
      htmlDims = this.bind.html.getDimensions();
      items = Math.min(pointDims.items, htmlDims.items);
      width = Math.min(pointDims.width, htmlDims.width);
      height = Math.min(pointDims.height, htmlDims.height);
      depth = Math.min(pointDims.depth, htmlDims.depth);
      // Build shader to sample position data
      position = this.bind.points.sourceShader(this._shaders.shader());
      // Transform data into screen space
      position = this._helpers.position.pipeline(position);
      // Apply global projection
      projection = this._shaders.shader({
        globals: ['projectionMatrix']
      });
      projection.pipe('project.readback');
      position.pipe(projection);
      // Build nop index shader
      indexer = this._shaders.shader();
      // Prepare readback/memo RTT
      this.readback = this._renderables.make('readback', {
        map: position,
        indexer: indexer,
        items: items,
        width: width,
        height: height,
        depth: depth,
        channels: 4,
        stpq: true
      });
      // Prepare overlay container VDOM
      this.dom = this._overlays.make('dom');
      this.dom.hint(items * width * height * depth * 2);
      // Make sure we have enough for wrapping each given element once

      // Prepare readback consumer
      this.readback.setCallback(this.emitter = this.callback(this.bind.html.nodes()));
      return this._helpers.visible.make();
    }

    unmake() {
      if (this.readback != null) {
        this.readback.dispose();
        this.dom.dispose();
        this.readback = this.dom = null;
        this.root = null;
        this.emitter = null;
        this.active = {};
      }
      this._helpers.bind.unmake();
      return this._helpers.visible.unmake();
    }

    update() {
      var ref;
      if (this.readback == null) {
        return;
      }
      if (this.props.visible) {
        this.readback.update((ref = this.root) != null ? ref.getCamera() : void 0);
        this.readback.post();
        return this.readback.iterate();
      }
    }

    post() {
      if (this.readback == null) {
        return;
      }
      return this.dom.render(this.isVisible ? this.emitter.nodes() : []);
    }

    callback(data) {
      var attr, className, color, colorString, depth, el, f, height, nodes, offset, opacity, outline, pointer, size, snap, strideI, strideJ, strideK, styles, uniforms, width, zIndex, zoom;
      // Create static consumer for the readback
      uniforms = this._inherit('unit').getUnitUniforms();
      width = uniforms.viewWidth;
      height = uniforms.viewHeight;
      attr = this.node.attributes['dom.attributes'];
      size = this.node.attributes['dom.size'];
      zoom = this.node.attributes['dom.zoom'];
      color = this.node.attributes['dom.color'];
      outline = this.node.attributes['dom.outline'];
      pointer = this.node.attributes['dom.pointerEvents'];
      opacity = this.node.attributes['overlay.opacity'];
      zIndex = this.node.attributes['overlay.zIndex'];
      offset = this.node.attributes['attach.offset'];
      depth = this.node.attributes['attach.depth'];
      snap = this.node.attributes['attach.snap'];
      el = this.dom.el;
      nodes = [];
      styles = null;
      className = null;
      strideI = strideJ = strideK = 0;
      colorString = '';
      f = function(x, y, z, w, i, j, k, l) {
        var a, alpha, children, clip, flatZ, index, iw, ox, oy, props, ref, s, scale, v, xx, yy;
        // Get HTML item by offset
        index = l + strideI * i + strideJ * j + strideK * k;
        children = data[index];
        // Clip behind camera or when invisible
        clip = w < 0;
        // Depth blending
        iw = 1 / w;
        flatZ = 1 + (iw - 1) * depth.value;
        scale = clip ? 0 : flatZ;
        // GL to CSS coordinate transform
        ox = +offset.value.x * scale;
        oy = +offset.value.y * scale;
        xx = (x + 1) * width.value * .5 + ox;
        yy = (y - 1) * height.value * .5 + oy;
        // Handle zoom/scale
        xx /= zoom.value;
        yy /= zoom.value;
        // Snap to pixel
        if (snap.value) {
          xx = Math.round(xx);
          yy = Math.round(yy);
        }
        // Clip and apply opacity
        alpha = Math.min(.999, clip ? 0 : opacity.value);
        // Generate div
        props = {
          className: className,
          style: {
            transform: `translate3d(${xx}px, ${-yy}px, ${1 - w}px) translate(-50%, -50%) scale(${scale},${scale})`,
            opacity: alpha
          }
        };
        for (k in styles) {
          v = styles[k];
          props.style[k] = v;
        }
        // Merge in external attributes
        a = attr.value;
        if (a != null) {
          s = a.style;
          for (k in a) {
            v = a[k];
            if (k !== 'style' && k !== 'className') {
              props[k] = v;
            }
          }
          if (s != null) {
            for (k in s) {
              v = s[k];
              props.style[k] = v;
            }
          }
        }
        props.className += ' ' + ((ref = a != null ? a.className : void 0) != null ? ref : 'mathbox-label');
        // Push node onto list
        return nodes.push(el('div', props, children));
      };
      f.reset = () => {
        var c, m;
        nodes = [];
        [strideI, strideJ, strideK] = [this.strideI, this.strideJ, this.strideK];
        c = color.value;
        m = function(x) {
          return Math.floor(x * 255);
        };
        colorString = c ? `rgb(${[m(c.x), m(c.y), m(c.z)]})` : '';
        className = `mathbox-outline-${Math.round(outline.value)}`;
        styles = {};
        if (c) {
          styles.color = colorString;
        }
        styles.fontSize = `${size.value}px`;
        if (zoom.value !== 1) {
          styles.zoom = zoom.value;
        }
        if (zIndex.value > 0) {
          styles.zIndex = zIndex.value;
        }
        if (pointer.value) {
          return styles.pointerEvents = 'auto';
        }
      };
      f.nodes = function() {
        return nodes;
      };
      return f;
    }

    resize() {
      var depth, height, htmlDims, items, pointDims, sI, sJ, sK, width;
      if (this.readback == null) {
        return;
      }
      // Fetch geometry/html dimensions
      pointDims = this.bind.points.getActiveDimensions();
      htmlDims = this.bind.html.getActiveDimensions();
      items = Math.min(pointDims.items, htmlDims.items);
      width = Math.min(pointDims.width, htmlDims.width);
      height = Math.min(pointDims.height, htmlDims.height);
      depth = Math.min(pointDims.depth, htmlDims.depth);
      // Limit readback to active area
      this.readback.setActive(items, width, height, depth);
      // Recalculate iteration strides
      this.strideI = sI = htmlDims.items;
      this.strideJ = sJ = sI * htmlDims.width;
      return this.strideK = sK = sJ * htmlDims.height;
    }

    change(changed, touched, init) {
      if (changed['dom.html'] || changed['dom.points']) {
        return this.rebuild();
      }
    }

  };

  DOM.traits = ['node', 'bind', 'object', 'visible', 'overlay', 'dom', 'attach', 'position'];

  return DOM;

}).call(this);

module.exports = DOM;


},{"../../../util":190,"../../primitive":59}],104:[function(require,module,exports){
var HTML, Util, Voxel;

Voxel = require('../data/voxel');

Util = require('../../../util');

HTML = (function() {
  class HTML extends Voxel {
    init() {
      super.init();
      return this.storage = 'pushBuffer';
    }

    make() {
      var depth, height, items, width;
      super.make();
      // Get our own size
      ({items, width, height, depth} = this.getDimensions());
      // Prepare DOM element factory
      this.dom = this._overlays.make('dom');
      return this.dom.hint(items * width * height * depth);
    }

    unmake() {
      super.unmake();
      if (this.dom != null) {
        this.dom.dispose();
        return this.dom = null;
      }
    }

    update() {
      return super.update();
    }

    change(changed, touched, init) {
      if (touched['html']) {
        return this.rebuild();
      }
      return super.change(changed, touched, init);
    }

    nodes() {
      return this.buffer.read();
    }

    callback(callback) {
      var el;
      el = this.dom.el;
      if (callback.length <= 6) {
        return function(emit, i, j, k, l) {
          return callback(emit, el, i, j, k, l);
        };
      } else {
        return (emit, i, j, k, l) => {
          return callback(emit, el, i, j, k, l, this.bufferClock, this.bufferStep);
        };
      }
    }

  };

  HTML.traits = ['node', 'buffer', 'active', 'data', 'voxel', 'html'];

  HTML.finals = {
    channels: 1
  };

  return HTML;

}).call(this);

module.exports = HTML;


},{"../../../util":190,"../data/voxel":76}],105:[function(require,module,exports){
var Move, Transition;

Transition = require('./transition');

Move = (function() {
  class Move extends Transition {
    make() {
      var k, ref, v;
      super.make();
      ref = {
        moveFrom: this.node.attributes['move.from'],
        moveTo: this.node.attributes['move.to']
      };
      for (k in ref) {
        v = ref[k];
        this.uniforms[k] = v;
      }
    }

    vertex(shader, pass) {
      var ref, ref1;
      if (pass === this.props.pass) {
        shader.pipe('move.position', this.uniforms);
      }
      return (ref = (ref1 = this._inherit('vertex')) != null ? ref1.vertex(shader, pass) : void 0) != null ? ref : shader;
    }

  };

  Move.traits = ['node', 'transition', 'vertex', 'move', 'visible', 'active'];

  return Move;

}).call(this);

module.exports = Move;


},{"./transition":112}],106:[function(require,module,exports){
var Play, Track;

Track = require('./track');

Play = (function() {
  class Play extends Track {
    init() {
      super.init();
      this.skew = null;
      return this.start = null;
    }

    reset(go = true) {
      this.skew = go ? 0 : null;
      return this.start = null;
    }

    make() {
      var parentClock;
      super.make();
      // Start on slide, or immediately if not inside slide
      this._listen('slide', 'slide.step', (e) => {
        var trigger;
        trigger = this.props.trigger;
        if ((trigger != null) && e.index === trigger) {
          return this.reset();
        }
        if ((trigger != null) && e.index === 0) {
          return this.reset(false);
        }
      });
      if (!this.props.trigger || (this._inherit('slide') == null)) {
        this.reset();
      }
      // Find parent clock
      parentClock = this._inherit('clock');
      // Update clock
      return this._listen(parentClock, 'clock.tick', () => {
        var delay, delta, from, now, offset, pace, ratio, realtime, speed, time, to;
        ({from, to, speed, pace, delay, realtime} = this.props);
        time = parentClock.getTime();
        if (this.skew != null) {
          now = realtime ? time.time : time.clock;
          delta = realtime ? time.delta : time.step;
          ratio = speed / pace;
          if (this.start == null) {
            this.start = now;
          }
          this.skew += delta * (ratio - 1);
          offset = Math.max(0, now - this.start + this.skew - delay * ratio);
          if (this.props.loop) {
            offset = offset % (to - from);
          }
          this.playhead = Math.min(to, from + offset);
        } else {
          this.playhead = 0;
        }
        return this.update();
      });
    }

    update() {
      return super.update();
    }

    change(changed, touched, init) {
      if (changed['trigger.trigger'] || changed['play.realtime']) {
        return this.rebuild();
      }
      return super.change(changed, touched, init);
    }

  };

  Play.traits = ['node', 'track', 'trigger', 'play', 'bind'];

  return Play;

}).call(this);

module.exports = Play;


},{"./track":111}],107:[function(require,module,exports){
(function (process){
var Parent, Present, Util;

Parent = require('../base/parent');

Util = require('../../../util');

Present = (function() {
  class Present extends Parent {
    init() {}

    make() {
      this.nodes = [];
      this.steps = [];
      this.length = 0;
      this.last = [];
      this.index = 0;
      this.dirty = [];
      this._listen('root', 'root.update', this.update);
      return this._compute('present.length', () => {
        return this.length;
      });
    }

    adopt(controller) {
      var node;
      node = controller.node;
      if (this.nodes.indexOf(controller) < 0) {
        this.nodes.push(node);
      }
      return this.dirty.push(controller);
    }

    unadopt(controller) {
      var node;
      node = controller.node;
      this.nodes = this.nodes.filter(function(x) {
        return x !== controller;
      });
      return this.dirty.push(controller);
    }

    update() {
      var controller, j, len, ref1;
      if (!this.dirty.length) {
        return;
      }
      ref1 = this.dirty;
      for (j = 0, len = ref1.length; j < len; j++) {
        controller = ref1[j];
        this.slideReset(controller);
      }
      [this.steps, this.indices] = this.process(this.nodes);
      this.length = this.steps.length;
      this.index = null;
      this.go(this.props.index);
      return this.dirty = [];
    }

    slideLatch(controller, enabled, step) {
      return controller.slideLatch(enabled, step);
    }

    slideStep(controller, index, step) {
      return controller.slideStep(this.mapIndex(controller, index), step);
    }

    slideRelease(controller, step) {
      return controller.slideRelease();
    }

    slideReset(controller) {
      return controller.slideReset();
    }

    mapIndex(controller, index) {
      return index - this.indices[controller.node._id];
    }

    process(nodes) {
      var dedupe, expand, finalize, isSibling, isSlide, order, parents, paths, slides, split, steps, traverse;
      // Grab nodes' path of slide parents
      slides = function(nodes) {
        var el, j, len, results;
        results = [];
        for (j = 0, len = nodes.length; j < len; j++) {
          el = nodes[j];
          results.push(parents(el).filter(isSlide));
        }
        return results;
      };
      traverse = function(map) {
        return function(el) {
          var ref, results;
          results = [];
          while (el && ([el, ref] = [map(el), el])) {
            results.push(ref);
          }
          return results;
        };
      };
      parents = traverse(function(el) {
        if (el.parent.traits.hash.present) {
          return null;
        } else {
          return el.parent;
        }
      });
      // Helpers
      isSlide = function(el) {
        return nodes.indexOf(el) >= 0;
      };
      isSibling = function(a, b) {
        var c, d, e, i, j, ref1;
        // Different tree level
        c = a.length;
        d = b.length;
        e = c - d;
        if (e !== 0) {
          return false;
        }
        // Compare from outside in
        e = Math.min(c, d);
// exclusive end
        for (i = j = ref1 = e - 1; (ref1 <= 0 ? j < 0 : j > 0); i = ref1 <= 0 ? ++j : --j) {
          if (a[i] !== b[i]) {
            return false;
          }
        }
        return true;
      };
      // Order paths (leaf -> parent slide -> ...)
      order = function(paths) {
        return paths.sort(function(a, b) {
          var c, d, e, f, g, i, j, nodeA, nodeB, ref1;
          // Path lengths
          c = a.length;
          d = b.length;
          // Compare from outside in
          e = Math.min(c, d);
// inclusive end
          for (i = j = 1, ref1 = e; (1 <= ref1 ? j <= ref1 : j >= ref1); i = 1 <= ref1 ? ++j : --j) {
            nodeA = a[c - i];
            nodeB = b[d - i];
            // Explicit sibling order (natural)
            f = nodeA.props.order;
            g = nodeB.props.order;
            if ((f != null) || (g != null)) {
              if ((f != null) && (g != null) && ((e = f - g) !== 0)) {
                return e;
              }
              if (f != null) {
                return -1;
              }
              if (g != null) {
                return 1;
              }
            }
            if (nodeB.order !== nodeA.order) {
              // Document sibling order (inverted)
              return nodeB.order - nodeA.order;
            }
          }
          // Different tree level
          e = c - d;
          if (e !== 0) {
            return e;
          }
          // Equal
          return 0;
        });
      };
      split = function(steps) {
        var absolute, j, len, node, relative, step;
        relative = [];
        absolute = [];
        for (j = 0, len = steps.length; j < len; j++) {
          step = steps[j];
          ((node = step[0]).props.steps != null ? relative : absolute).push(step);
        }
        return [relative, absolute];
      };
      expand = function(lists) {
        var absolute, i, indices, j, k, len, len1, limit, relative, slide, step, steps;
        [relative, absolute] = lists;
        limit = 100;
        indices = {};
        steps = [];
        slide = function(step, index) {
          var childIndex, from, i, j, name, node, parent, parentIndex, props, ref1, ref2, to;
          ({props} = node = step[0]);
          parent = step[1];
          parentIndex = parent != null ? indices[parent._id] : 0;
          //throw "parent index missing" if !parentIndex?
          childIndex = index;
          from = props.from != null ? parentIndex + props.from : childIndex - props.early;
          to = props.to != null ? parentIndex + props.to : childIndex + props.steps + props.late;
          from = Math.max(0, from);
          to = Math.min(limit, to);
          if (indices[name = node._id] == null) {
            indices[name] = from;
          }
          for (i = j = ref1 = from, ref2 = to; (ref1 <= ref2 ? j < ref2 : j > ref2); i = ref1 <= ref2 ? ++j : --j) {
            steps[i] = (steps[i] != null ? steps[i] : steps[i] = []).concat(step);
          }
          return props.steps;
        };
        i = 0;
        for (j = 0, len = relative.length; j < len; j++) {
          step = relative[j];
          i += slide(step, i);
        }
        for (k = 0, len1 = absolute.length; k < len1; k++) {
          step = absolute[k];
          slide(step, 0);
        }
        // Dedupe and order
        steps = (function() {
          var l, len2, results;
          results = [];
          for (l = 0, len2 = steps.length; l < len2; l++) {
            step = steps[l];
            results.push(finalize(dedupe(step)));
          }
          return results;
        })();
        return [steps, indices];
      };
      // Remove duplicates
      dedupe = function(step) {
        var i, j, len, node, results;
        if (step) {
          results = [];
          for (i = j = 0, len = step.length; j < len; i = ++j) {
            node = step[i];
            if (step.indexOf(node) === i) {
              results.push(node);
            }
          }
          return results;
        } else {
          return [];
        }
      };
      // Finalize individual step by document order
      finalize = function(step) {
        return step.sort(function(a, b) {
          return a.order - b.order;
        });
      };
      paths = slides(nodes);
      steps = order(paths);
      return expand(split(steps));
    }

    go(index) {
      var active, ascend, descend, enter, exit, j, k, l, last, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, node, o, p, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, stay, step, toStr;
      // Pad with an empty slide before and after for initial enter/final exit
      index = Math.max(0, Math.min(this.length + 1, +index || 0));
      last = this.last;
      active = (ref1 = this.steps[index - 1]) != null ? ref1 : [];
      step = this.props.directed ? index - this.index : 1;
      this.index = index;
      enter = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = active.length; j < len; j++) {
          node = active[j];
          if (this.last.indexOf(node) < 0) {
            results.push(node);
          }
        }
        return results;
      }).call(this);
      exit = (function() {
        var j, len, ref2, results;
        ref2 = this.last;
        results = [];
        for (j = 0, len = ref2.length; j < len; j++) {
          node = ref2[j];
          if (active.indexOf(node) < 0) {
            results.push(node);
          }
        }
        return results;
      }).call(this);
      stay = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = active.length; j < len; j++) {
          node = active[j];
          if (enter.indexOf(node) < 0 && exit.indexOf(node) < 0) {
            results.push(node);
          }
        }
        return results;
      })();
      ascend = function(nodes) {
        return nodes.sort(function(a, b) {
          return a.order - b.order;
        });
      };
      descend = function(nodes) {
        return nodes.sort(function(a, b) {
          return b.order - a.order;
        });
      };
      toStr = function(x) {
        return x.toString();
      };
      ref2 = ascend(enter);
      for (j = 0, len = ref2.length; j < len; j++) {
        node = ref2[j];
        //console.log '============================================================'
        //console.log 'go',  index, {enter: enter.map(toStr), stay: stay.map(toStr), exit: exit.map(toStr)}
        this.slideLatch(node.controller, true, step);
      }
      ref3 = ascend(stay);
      for (k = 0, len1 = ref3.length; k < len1; k++) {
        node = ref3[k];
        this.slideLatch(node.controller, null, step);
      }
      ref4 = ascend(exit);
      for (l = 0, len2 = ref4.length; l < len2; l++) {
        node = ref4[l];
        this.slideLatch(node.controller, false, step);
      }
      for (m = 0, len3 = enter.length; m < len3; m++) {
        node = enter[m];
        this.slideStep(node.controller, index, step);
      }
      for (n = 0, len4 = stay.length; n < len4; n++) {
        node = stay[n];
        this.slideStep(node.controller, index, step);
      }
      for (o = 0, len5 = exit.length; o < len5; o++) {
        node = exit[o];
        this.slideStep(node.controller, index, step);
      }
      ref5 = descend(enter);
      for (p = 0, len6 = ref5.length; p < len6; p++) {
        node = ref5[p];
        this.slideRelease(node.controller);
      }
      ref6 = descend(stay);
      for (q = 0, len7 = ref6.length; q < len7; q++) {
        node = ref6[q];
        this.slideRelease(node.controller);
      }
      ref7 = descend(exit);
      for (r = 0, len8 = ref7.length; r < len8; r++) {
        node = ref7[r];
        this.slideRelease(node.controller);
      }
      this.last = active;
    }

    change(changed, touched, init) {
      if (changed['present.index'] || init) {
        return this.go(this.props.index);
      }
    }

  };

  Present.traits = ['node', 'present'];

  return Present;

}).call(this);

module.exports = Present;


}).call(this,require('_process'))
},{"../../../util":190,"../base/parent":62,"_process":14}],108:[function(require,module,exports){
var Reveal, Transition, Util;

Transition = require('./transition');

Util = require('../../../util');

Reveal = (function() {
  class Reveal extends Transition {
    mask(shader) {
      var ref, ref1, s;
      if (shader) {
        s = this._shaders.shader();
        s.pipe(Util.GLSL.identity('vec4'));
        s.fan();
        s.pipe(shader, this.uniforms);
        s.next();
        s.pipe('reveal.mask', this.uniforms);
        s.end();
        s.pipe("float combine(float a, float b) { return min(a, b); }");
      } else {
        s = this._shaders.shader();
        s.pipe('reveal.mask', this.uniforms);
      }
      return (ref = (ref1 = this._inherit('mask')) != null ? ref1.mask(s) : void 0) != null ? ref : s;
    }

  };

  Reveal.traits = ['node', 'transition', 'mask', 'visible', 'active'];

  return Reveal;

}).call(this);

module.exports = Reveal;


},{"../../../util":190,"./transition":112}],109:[function(require,module,exports){
var Parent, Slide;

Parent = require('../base/parent');

Slide = (function() {
  class Slide extends Parent {
    make() {
      this._helpers.visible.make();
      this._helpers.active.make();
      if (!this._inherit('present')) {
        throw new Error(`${this.node.toString()} must be placed inside <present></present>`);
      }
      return this._inherit('present').adopt(this);
    }

    unmake() {
      this._helpers.visible.unmake();
      this._helpers.active.unmake();
      return this._inherit('present')(unadopt(this));
    }

    change(changed, touched, init) {
      if (changed['slide.early'] || changed['slide.late'] || changed['slide.steps'] || changed['slide.from'] || changed['slide.to']) {
        return this.rebuild();
      }
    }

    slideLatch(enabled, step) {
      //console.log 'slide:latch', @node.toString(), enabled, step
      this.trigger({
        'type': 'transition.latch',
        'step': step
      });
      if (enabled != null) {
        return this._instant(enabled);
      }
    }

    slideStep(index, step) {
      //console.log 'slide:step', @node.toString(), index, step
      return this.trigger({
        'type': 'slide.step',
        'index': index,
        'step': step
      });
    }

    slideRelease() {
      //console.log 'slide:release', @node.toString()
      return this.trigger({
        'type': 'transition.release'
      });
    }

    slideReset() {
      this._instant(false);
      return this.trigger({
        'type': 'slide.reset'
      });
    }

    _instant(enabled) {
      //console.log 'slide:instant', @node.toString(), enabled
      this.setVisible(enabled);
      return this.setActive(enabled);
    }

  };

  Slide.traits = ['node', 'slide', 'visible', 'active'];

  return Slide;

}).call(this);

module.exports = Slide;


},{"../base/parent":62}],110:[function(require,module,exports){
var Step, Track;

Track = require('./track');

Step = (function() {
  class Step extends Track {
    make() {
      var clock, ref, ref1;
      super.make();
      clock = this._inherit('clock');
      if (this.actualIndex == null) {
        this.actualIndex = null;
      }
      this.animateIndex = this._animator.make(this._types.number(0), {
        clock: clock,
        realtime: this.props.realtime,
        step: (value) => {
          return this.actualIndex = value;
        }
      });
      if (this.lastIndex == null) {
        this.lastIndex = null;
      }
      this.animateStep = this._animator.make(this._types.number(0), {
        clock: clock,
        realtime: this.props.realtime,
        step: (value) => {
          this.playhead = value;
          return this.update();
        }
      });
      this.stops = (ref = this.props.stops) != null ? ref : (function() {
        var results = [];
        for (var j = 0, ref1 = this.script.length; 0 <= ref1 ? j < ref1 : j > ref1; 0 <= ref1 ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this);
      // Seek instantly after reset
      this._listen('slide', 'slide.reset', (e) => {
        return this.lastIndex = null;
      });
      // Update playhead in response to slide change
      return this._listen('slide', 'slide.step', (e) => {
        var delay, duration, factor, free, from, i, j, last, len, pace, playback, ref2, ref3, rewind, skip, skips, speed, step, stop, to, trigger;
        ({delay, duration, pace, speed, playback, rewind, skip, trigger} = this.props);
        // Note: enter phase is from index 0 to 1
        i = Math.max(0, Math.min(this.stops.length - 1, e.index - trigger));
        // Animation range
        from = this.playhead;
        to = this.stops[i];
        if ((this.lastIndex == null) && trigger) {
          this.lastIndex = i;
          this.animateStep.set(to);
          this.animateIndex.set(i);
          return;
        }
        // Calculate actual step from current offset (may be still animating)
        last = (ref2 = (ref3 = this.actualIndex) != null ? ref3 : this.lastIndex) != null ? ref2 : 0;
        step = i - last;
        // Don't count duped stops
        skips = this.stops.slice(Math.min(last, i), Math.max(last, i));
        free = 0;
        last = skips.shift();
        for (j = 0, len = skips.length; j < len; j++) {
          stop = skips[j];
          if (last === stop) {
            free++;
          }
          last = stop;
        }
        // Remember last intended stop
        this.lastIndex = i;
        // Apply rewind factor
        factor = speed * (e.step >= 0 ? 1 : rewind);
        // Pass through multiple steps at faster rate if skip is enabled
        factor *= skip ? Math.max(1, Math.abs(step) - free) : 1;
        // Apply pace
        duration += Math.abs(to - from) * pace / factor;
        if (from !== to) {
          this.animateIndex.immediate(i, {
            delay,
            duration,
            ease: playback
          });
          return this.animateStep.immediate(to, {
            delay,
            duration,
            ease: playback
          });
        }
      });
    }

    made() {
      return this.update();
    }

    unmake() {
      this.animateIndex.dispose();
      this.animateStep.dispose();
      this.animateIndex = this.animateStep = null;
      return super.unmake();
    }

    change(changed, touched, init) {
      if (changed['step.stops'] || changed['step.realtime']) {
        return this.rebuild();
      }
      return super.change(changed, touched, init);
    }

  };

  Step.traits = ['node', 'track', 'step', 'trigger', 'bind'];

  return Step;

}).call(this);

module.exports = Step;


},{"./track":111}],111:[function(require,module,exports){
var Ease, Primitive, Track, deepCopy;

Primitive = require('../../primitive');

({Ease} = require('../../../util'));

deepCopy = function(x) {
  var k, out, v;
  out = {};
  for (k in x) {
    v = x[k];
    if (v instanceof Array) {
      out[k] = v.slice();
    } else if ((v != null) && typeof v === 'object') {
      out[k] = deepCopy(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

Track = (function() {
  class Track extends Primitive {
    init() {
      this.handlers = {};
      this.script = null;
      this.values = null;
      this.playhead = 0;
      this.velocity = null;
      this.section = null;
      return this.expr = null;
    }

    make() {
      var node, script;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'track.target',
          trait: 'node',
          callback: null
        }
      ]);
      ({script} = this.props);
      ({node} = this.bind.target);
      this.targetNode = node;
      return [this.script, this.values, this.start, this.end] = this._process(node, script);
    }

    unmake() {
      this.unbindExpr();
      this._helpers.bind.unmake();
      this.script = this.values = this.start = this.end = this.section = this.expr = null;
      return this.playhead = 0;
    }

    // Bind animated expressions
    bindExpr(expr) {
      var clock, self;
      this.unbindExpr();
      this.expr = expr;
      this.targetNode.bind(expr, true);
      // Measure playhead velocity on attribute computation
      ({clock} = this.targetNode);
      self = this;
      return this._attributes.bind(this.measure = (function() {
        var playhead;
        playhead = null;
        return () => {
          var step;
          ({step} = clock.getTime());
          if (playhead != null) {
            self.velocity = (self.playhead - playhead) / step;
          }
          return playhead = self.playhead;
        };
      })());
    }

    unbindExpr() {
      if (this.expr != null) {
        this.targetNode.unbind(this.expr, true);
      }
      if (this.measure != null) {
        this._attributes.unbind(this.measure);
      }
      return this.expr = this.measure = null;
    }

    // Process script steps by filling out missing props
    _process(object, script) {
      var end, i, j, k, key, l, last, len, len1, message, props, ref, ref1, ref2, result, s, start, step, v, values;
      if (script instanceof Array) {
        // Normalize array to numbered dict
        s = {};
        for (i = j = 0, len = script.length; j < len; i = ++j) {
          step = script[i];
          s[i] = step;
        }
        script = s;
      }
      // Normalize keyed steps to array of step objects
      s = [];
      for (key in script) {
        step = script[key];
        if (step == null) {
          step = [];
        }
        if (step instanceof Array) {
          // [props, expr] array
          step = {
            key: +key,
            props: step[0] != null ? deepCopy(step[0]) : {},
            expr: step[1] != null ? deepCopy(step[1]) : {}
          };
        } else {
          if ((step.key == null) && !step.props && !step.expr) {
            // Direct props object (iffy, but people will do this anyhow)
            step = {
              props: deepCopy(step)
            };
          } else {
            // Proper step
            step = deepCopy(step);
          }
          // Prepare step object
          step.key = step.key != null ? +step.key : +key;
          if (step.props == null) {
            step.props = {};
          }
          if (step.expr == null) {
            step.expr = {};
          }
        }
        s.push(step);
      }
      script = s;
      if (!script.length) {
        return [[], {}, 0, 0];
      }
      // Sort by keys
      script.sort(function(a, b) {
        return a.key - b.key;
      });
      start = script[0].key;
      end = script[script.length - 1].key;
// Connect steps
      for (key in script) {
        step = script[key];
        if (typeof last !== "undefined" && last !== null) {
          last.next = step;
        }
        last = step;
      }
      // Last step leads to itself
      last.next = last;
      script = s;
      // Determine starting props
      props = {};
      values = {};
      for (key in script) {
        step = script[key];
        ref = step.props;
        for (k in ref) {
          v = ref[k];
          props[k] = true;
        }
      }
      for (key in script) {
        step = script[key];
        ref1 = step.expr;
        for (k in ref1) {
          v = ref1[k];
          props[k] = true;
        }
      }
      for (k in props) {
        props[k] = object.get(k);
      }
      try {
        for (k in props) {
          // Need two sources and one destination value for correct mixing of live expressions
          values[k] = [object.attribute(k).T.make(), object.attribute(k).T.make(), object.attribute(k).T.make()];
        }
      } catch (error) {
        console.warn(this.node.toMarkup());
        message = `${this.node.toString()} - Target ${object} has no \`${k}\` property`;
        throw new Error(message);
      }
      result = [];
// Normalize script props, insert held values
      for (l = 0, len1 = script.length; l < len1; l++) {
        step = script[l];
        for (k in props) {
          v = props[k];
          v = object.validate(k, (ref2 = step.props[k]) != null ? ref2 : v);
          props[k] = step.props[k] = v;
          if ((step.expr[k] != null) && typeof step.expr[k] !== 'function') {
            console.warn(this.node.toMarkup());
            message = `${this.node.toString()} - Expression \`${step.expr[k]}\` on property \`${k}\` is not a function`;
            throw new Error(message);
          }
        }
        result.push(step);
      }
      return [result, values, start, end];
    }

    update() {
      var clock, ease, easeMethod, end, expr, find, from, getLerpFactor, getPlayhead, k, live, node, playhead, script, section, seek, start, to;
      ({playhead, script} = this);
      ({ease, seek} = this.props);
      node = this.targetNode;
      if (seek != null) {
        playhead = seek;
      }
      if (script.length) {
        find = function() {
          var i, j, last, len, step;
          last = script[0];
          for (i = j = 0, len = script.length; j < len; i = ++j) {
            step = script[i];
            if (step.key > playhead) {
              break;
            }
            last = step;
          }
          return last;
        };
        section = this.section;
        if (!section || playhead < section.key || playhead > section.next.key) {
          section = find(script, playhead);
        }
        if (section === this.section) {
          return;
        }
        this.section = section;
        from = section;
        to = section.next;
        start = from.key;
        end = to.key;
        // Easing of playhead along track
        easeMethod = (function() {
          switch (ease) {
            case 'linear':
            case 0:
              return Ease.clamp;
            case 'cosine':
            case 1:
              return Ease.cosine;
            case 'binary':
            case 2:
              return Ease.binary;
            case 'hold':
            case 3:
              return Ease.hold;
            default:
              return Ease.cosine;
          }
        })();
        // Callback for live playhead interpolator (linear approx time travel)
        ({clock} = node);
        getPlayhead = (time) => {
          var now;
          if (this.velocity == null) {
            return this.playhead;
          }
          now = clock.getTime();
          return this.playhead + this.velocity * (time - now.time);
        };
        getLerpFactor = (function() {
          var scale;
          scale = 1 / Math.max(0.0001, end - start);
          return function(time) {
            return easeMethod((getPlayhead(time) - start) * scale, 0, 1);
          };
        })();
        // Create prop expression interpolator
        live = (key) => {
          var animator, attr, fromE, fromP, invalid, toE, toP, values;
          fromE = from.expr[key];
          toE = to.expr[key];
          fromP = from.props[key];
          toP = to.props[key];
          invalid = function() {
            console.warn(node.toMarkup());
            throw new Error(`${this.node.toString()} - Invalid expression result on track \`${key}\``);
          };
          attr = node.attribute(key);
          values = this.values[key];
          animator = this._animator;
          // Lerp between two expressions
          if (fromE && toE) {
            return (function(values, from, to) {
              return function(time, delta) {
                var _from, _to;
                values[0] = _from = attr.T.validate(fromE(time, delta), values[0], invalid);
                values[1] = _to = attr.T.validate(toE(time, delta), values[1], invalid);
                return values[2] = animator.lerp(attr.T, _from, _to, getLerpFactor(time), values[2]);
              };
            })(values, from, to);
          // Lerp between an expression and a constant
          } else if (fromE) {
            return (function(values, from, to) {
              return function(time, delta) {
                var _from;
                values[0] = _from = attr.T.validate(fromE(time, delta), values[0], invalid);
                return values[1] = animator.lerp(attr.T, _from, toP, getLerpFactor(time), values[1]);
              };
            })(values, from, to);
          // Lerp between a constant and an expression
          } else if (toE) {
            return (function(values, from, to) {
              return function(time, delta) {
                var _to;
                values[0] = _to = attr.T.validate(toE(time, delta), values[0], invalid);
                return values[1] = animator.lerp(attr.T, fromP, _to, getLerpFactor(time), values[1]);
              };
            })(values, from, to);
          } else {
            // Lerp between two constants
            return (function(values, from, to) {
              return function(time, delta) {
                return values[0] = animator.lerp(attr.T, fromP, toP, getLerpFactor(time), values[0]);
              };
            })(values, from, to);
          }
        };
        // Handle expr / props on both ends
        expr = {};
        for (k in from.expr) {
          if (expr[k] == null) {
            expr[k] = live(k);
          }
        }
        for (k in to.expr) {
          if (expr[k] == null) {
            expr[k] = live(k);
          }
        }
        for (k in from.props) {
          if (expr[k] == null) {
            expr[k] = live(k);
          }
        }
        for (k in to.props) {
          if (expr[k] == null) {
            expr[k] = live(k);
          }
        }
        // Bind node props
        return this.bindExpr(expr);
      }
    }

    change(changed, touched, init) {
      if (changed['track.target'] || changed['track.script'] || changed['track.mode']) {
        return this.rebuild();
      }
      if (changed['seek.seek'] || init) {
        return this.update();
      }
    }

  };

  Track.traits = ['node', 'track', 'seek', 'bind'];

  return Track;

}).call(this);

module.exports = Track;


},{"../../../util":190,"../../primitive":59}],112:[function(require,module,exports){
var Parent, Transition, Util;

Parent = require('../base/parent');

Util = require('../../../util');

Transition = (function() {
  class Transition extends Parent {
    init() {
      this.animate = null;
      this.uniforms = null;
      this.state = {
        isVisible: true,
        isActive: true,
        enter: 1,
        exit: 1
      };
      this.latched = null;
      return this.locked = null;
    }

    make() {
      var activeParent, slideParent, visibleParent;
      this.uniforms = {
        transitionFrom: this._attributes.make(this._types.vec4()),
        transitionTo: this._attributes.make(this._types.vec4()),
        transitionActive: this._attributes.make(this._types.bool()),
        transitionScale: this._attributes.make(this._types.vec4()),
        transitionBias: this._attributes.make(this._types.vec4()),
        transitionEnter: this._attributes.make(this._types.number()),
        transitionExit: this._attributes.make(this._types.number()),
        transitionSkew: this._attributes.make(this._types.number())
      };
      slideParent = this._inherit('slide');
      visibleParent = this._inherit('visible');
      activeParent = this._inherit('active');
      this._listen(slideParent, 'transition.latch', (e) => {
        return this.latch(e.step);
      });
      this._listen(slideParent, 'transition.release', () => {
        return this.release();
      });
      this._listen(visibleParent, 'visible.change', () => {
        //console.log @node.toString(), 'visible.change ^', visibleParent.isVisible
        return this.update((this.state.isVisible = visibleParent.isVisible));
      });
      this._listen(activeParent, 'active.change', () => {
        //console.log @node.toString(), 'active.change ^', activeParent.isActive
        return this.update((this.state.isActive = activeParent.isActive));
      });
      this.animate = this._animator.make(this._types.vec2(1, 1), {
        step: (value) => {
          this.state.enter = value.x;
          this.state.exit = value.y;
          return this.update();
        },
        complete: (done) => {
          return this.complete(done);
        }
      });
      return this.move = (this.props.from != null) || (this.props.to != null);
    }

    //@_helpers.visible.make()
    //@_helpers.active.make()
    unmake() {
      return this.animate.dispose();
    }

    //@_helpers.visible.unmake()
    //@_helpers.active.unmake()
    latch(step) {
      var enter, exit, forward, latched, visible;
      this.locked = null;
      this.latched = latched = {
        isVisible: this.state.isVisible,
        isActive: this.state.isActive,
        step: step
      };
      // Reset enter/exit animation if invisible
      visible = this.isVisible;
      if (!visible) {
        forward = latched.step >= 0;
        [enter, exit] = forward ? [0, 1] : [1, 0];
        return this.animate.set(enter, exit);
      }
    }

    //console.log @node.toString(), 'transition::latch', @latched, enter, exit
    release() {
      var delay, delayEnter, delayExit, duration, durationEnter, durationExit, enter, exit, forward, latched, state, visible;
      // Get before/after and unlatch state
      latched = this.latched;
      state = this.state;
      this.latched = null;
      //console.log @node.toString(), 'transition::release', JSON.parse JSON.stringify {latched, state}

      //p = @; console.log '-> ', p.node.toString(), p.isVisible while p = p._inherit 'visible'

      // Transition if visibility state change
      if (latched.isVisible !== state.isVisible) {
        // Maintain step direction
        forward = latched.step >= 0;
        visible = state.isVisible;
        [enter, exit] = visible ? [1, 1] : forward ? [1, 0] : [0, 1];
        // Get duration
        ({duration, durationEnter, durationExit} = this.props);
        if (durationEnter == null) {
          durationEnter = duration;
        }
        if (durationExit == null) {
          durationExit = duration;
        }
        duration = visible * durationEnter + !visible * durationExit;
        // Get delay
        ({delay, delayEnter, delayExit} = this.props);
        if (delayEnter == null) {
          delayEnter = delay;
        }
        if (delayExit == null) {
          delayExit = delay;
        }
        delay = visible * delayEnter + !visible * delayExit;
        // Animate enter/exit
        //console.log @node.toString(), '@animate.immediate', {x: enter, y: exit}, {duration, delay, ease: 'linear'}
        this.animate.immediate({
          x: enter,
          y: exit
        }, {
          duration,
          delay,
          ease: 'linear'
        });
        // Lock visibility and active open during transition
        this.locked = {
          isVisible: true,
          isActive: latched.isActive || state.isActive
        };
      }
      return this.update();
    }

    complete(done) {
      if (!done) {
        return;
      }
      this.locked = null;
      return this.update();
    }

    update() {
      var active, enter, exit, level, partial, ref, visible;
      if (this.latched != null) {
        return; // latched
      }
      ({enter, exit} = this.props);
      // Resolve transition state
      if (enter == null) {
        enter = this.state.enter;
      }
      if (exit == null) {
        exit = this.state.exit;
      }
      level = enter * exit;
      visible = level > 0;
      partial = level < 1;
      this.uniforms.transitionEnter.value = enter;
      this.uniforms.transitionExit.value = exit;
      this.uniforms.transitionActive.value = partial;
      if (visible) {
        // Resolve visibility state
        visible = !!this.state.isVisible;
      }
      if (this.locked != null) {
        visible = this.locked.isVisible;
      }
      if (this.isVisible !== visible) {
        this.isVisible = visible;
        this.trigger({
          type: 'visible.change'
        });
      }
      // Resolve active state
      active = !!(this.state.isActive || ((ref = this.locked) != null ? ref.isActive : void 0));
      if (this.isActive !== active) {
        this.isActive = active;
        return this.trigger({
          type: 'active.change'
        });
      }
    }

    //console.log 'transition update', 'enter', enter, 'exit', exit, 'visible', visible, 'active', active
    change(changed, touched, init) {
      var flipW, flipX, flipY, flipZ, stagger, staggerW, staggerX, staggerY, staggerZ;
      if (changed['transition.enter'] || changed['transition.exit'] || init) {
        this.update();
      }
      if (changed['transition.stagger'] || init) {
        ({stagger} = this.props);
        // Precompute shader constants
        flipX = stagger.x < 0;
        flipY = stagger.y < 0;
        flipZ = stagger.z < 0;
        flipW = stagger.w < 0;
        staggerX = Math.abs(stagger.x);
        staggerY = Math.abs(stagger.y);
        staggerZ = Math.abs(stagger.z);
        staggerW = Math.abs(stagger.w);
        this.uniforms.transitionSkew.value = staggerX + staggerY + staggerZ + staggerW;
        this.uniforms.transitionScale.value.set((1 - flipX * 2) * staggerX, (1 - flipY * 2) * staggerY, (1 - flipZ * 2) * staggerZ, (1 - flipW * 2) * staggerW);
        return this.uniforms.transitionBias.value.set(flipX * staggerX, flipY * staggerY, flipZ * staggerZ, flipW * staggerW);
      }
    }

  };

  Transition.traits = ['node', 'transition', 'transform', 'mask', 'visible', 'active'];

  return Transition;

}).call(this);

module.exports = Transition;


},{"../../../util":190,"../base/parent":62}],113:[function(require,module,exports){
var Compose, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Compose = (function() {
  class Compose extends Primitive {
    init() {
      return this.compose = null;
    }

    //rebuild: () ->
    //  console.log 'compose.rebuild', @node.get(null, true), @bind.source?
    //  super()
    resize() {
      var depth, dims, height, layers, width;
      if (!(this.compose && this.bind.source)) {
        return;
      }
      dims = this.bind.source.getActiveDimensions();
      width = dims.width;
      height = dims.height;
      depth = dims.depth;
      layers = dims.items;
      return this.remapUVScale.set(width, height);
    }

    make() {
      var alpha, composeUniforms, fragment, resampleUniforms;
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'operator.source',
          trait: 'source'
        }
      ]);
      if (this.bind.source == null) {
        return;
      }
      // Prepare uniforms for remapping to absolute coords on the fly
      resampleUniforms = {
        remapUVScale: this._attributes.make(this._types.vec2())
      };
      this.remapUVScale = resampleUniforms.remapUVScale.value;
      // Build fragment shader
      fragment = this._shaders.shader();
      alpha = this.props.alpha;
      if (this.bind.source.is('image')) {
        // Sample image directly in 2D UV
        fragment.pipe('screen.pass.uv', resampleUniforms);
        fragment = this.bind.source.imageShader(fragment);
      } else {
        // Sample data source in 4D
        fragment.pipe('screen.map.xy', resampleUniforms);
        fragment = this.bind.source.sourceShader(fragment);
      }
      if (!alpha) {
        // Force pixels to solid if requested
        fragment.pipe('color.opaque');
      }
      // Make screen renderable
      composeUniforms = this._helpers.style.uniforms();
      this.compose = this._renderables.make('screen', {
        map: fragment,
        uniforms: composeUniforms,
        linear: true
      });
      this._helpers.visible.make();
      return this._helpers.object.make([this.compose]);
    }

    made() {
      return this.resize();
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      return this._helpers.object.unmake();
    }

    change(changed, touched, init) {
      if (changed['operator.source'] || changed['compose.alpha']) {
        return this.rebuild();
      }
    }

  };

  Compose.traits = ['node', 'bind', 'object', 'visible', 'operator', 'style', 'compose'];

  Compose.defaults = {
    zWrite: false,
    zTest: false,
    color: '#ffffff'
  };

  return Compose;

}).call(this);

module.exports = Compose;


},{"../../../util":190,"../../primitive":59}],114:[function(require,module,exports){
var Parent, RTT, Util;

Parent = require('../base/parent');

Util = require('../../../util');

RTT = (function() {
  class RTT extends Parent {
    init() {
      return this.rtt = this.scene = this.camera = this.width = this.height = this.history = this.rootSize = this.size = null;
    }

    indexShader(shader) {
      return shader;
    }

    imageShader(shader) {
      return this.rtt.shaderRelative(shader);
    }

    sourceShader(shader) {
      return this.rtt.shaderAbsolute(shader, this.history);
    }

    getDimensions() {
      return {
        items: 1,
        width: this.width,
        height: this.height,
        depth: this.history
      };
    }

    getActiveDimensions() {
      return this.getDimensions();
    }

    make() {
      var aspect, height, heightFactor, history, magFilter, minFilter, relativeSize, size, type, viewHeight, viewWidth, width, widthFactor;
      this.parentRoot = this._inherit('root');
      this.rootSize = this.parentRoot.getSize();
      this._listen(this.parentRoot, 'root.pre', this.pre);
      this._listen(this.parentRoot, 'root.update', this.update);
      this._listen(this.parentRoot, 'root.render', this.render);
      this._listen(this.parentRoot, 'root.post', this.post);
      this._listen(this.parentRoot, 'root.camera', this.setCamera);
      this._listen(this.parentRoot, 'root.resize', function(event) {
        return this.resize(event.size);
      });
      if (this.rootSize == null) {
        return;
      }
      ({minFilter, magFilter, type} = this.props);
      ({width, height, history, size} = this.props);
      relativeSize = size === this.node.attributes['rtt.size'].enum.relative;
      widthFactor = relativeSize ? this.rootSize.renderWidth : 1;
      heightFactor = relativeSize ? this.rootSize.renderHeight : 1;
      this.width = Math.round(width != null ? width * widthFactor : this.rootSize.renderWidth);
      this.height = Math.round(height != null ? height * heightFactor : this.rootSize.renderHeight);
      this.history = history;
      this.aspect = aspect = this.width / this.height;
      if (this.scene == null) {
        this.scene = this._renderables.make('scene');
      }
      this.rtt = this._renderables.make('renderToTexture', {
        scene: this.scene,
        camera: this._context.defaultCamera,
        width: this.width,
        height: this.height,
        frames: this.history,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
      aspect = width || height ? aspect : this.rootSize.aspect;
      viewWidth = width != null ? width : this.rootSize.viewWidth;
      viewHeight = height != null ? height : this.rootSize.viewHeight;
      return this.size = {
        renderWidth: this.width,
        renderHeight: this.height,
        aspect: aspect,
        viewWidth: viewWidth,
        viewHeight: viewHeight,
        pixelRatio: this.height / viewHeight
      };
    }

    made() {
      // Notify of buffer reallocation
      this.trigger({
        type: 'source.rebuild'
      });
      if (this.size) {
        return this.trigger({
          type: 'root.resize',
          size: this.size
        });
      }
    }

    unmake(rebuild) {
      if (this.rtt == null) {
        return;
      }
      this.rtt.dispose();
      if (!rebuild) {
        this.scene.dispose();
      }
      return this.rtt = this.width = this.height = this.history = null;
    }

    change(changed, touched, init) {
      if (touched['texture'] || changed['rtt.width'] || changed['rtt.height']) {
        return this.rebuild();
      }
      if (changed['root.camera'] || init) {
        this._unattach();
        this._attach(this.props.camera, 'camera', this.setCamera, this, this, true);
        return this.setCamera();
      }
    }

    adopt(renderable) {
      var i, len, object, ref, results;
      ref = renderable.renders;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        results.push(this.scene.add(object));
      }
      return results;
    }

    unadopt(renderable) {
      var i, len, object, ref, results;
      ref = renderable.renders;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        results.push(this.scene.remove(object));
      }
      return results;
    }

    resize(size) {
      var height, relativeSize, width;
      this.rootSize = size;
      ({width, height, size} = this.props);
      relativeSize = size === this.node.attributes['rtt.size'].enum.relative;
      if (!this.rtt || (width == null) || (height == null) || relativeSize) {
        return this.rebuild();
      }
    }

    select(selector) {
      return this._root.node.model.select(selector, [this.node]);
    }

    watch(selector, handler) {
      return this._root.node.model.watch(selector, handler);
    }

    unwatch(handler) {
      return this._root.node.model.unwatch(handler);
    }

    pre(e) {
      return this.trigger(e);
    }

    update(e) {
      var camera;
      if ((camera = this.getOwnCamera()) != null) {
        camera.aspect = this.aspect || 1;
        camera.updateProjectionMatrix();
      }
      return this.trigger(e);
    }

    render(e) {
      var ref;
      this.trigger(e);
      return (ref = this.rtt) != null ? ref.render(this.getCamera()) : void 0;
    }

    post(e) {
      return this.trigger(e);
    }

    setCamera() {
      var camera, ref;
      camera = (ref = this.select(this.props.camera)[0]) != null ? ref.controller : void 0;
      if (this.camera !== camera) {
        this.camera = camera;
        this.rtt.camera = this.getCamera();
        return this.trigger({
          type: 'root.camera'
        });
      } else if (!this.camera) {
        return this.trigger({
          type: 'root.camera'
        });
      }
    }

    getOwnCamera() {
      var ref;
      return (ref = this.camera) != null ? ref.getCamera() : void 0;
    }

    getCamera() {
      var ref;
      return (ref = this.getOwnCamera()) != null ? ref : this._inherit('root').getCamera();
    }

    // End transform chain here
    vertex(shader, pass) {
      if (pass === 2) {
        return shader.pipe('view.position');
      }
      if (pass === 3) {
        return shader.pipe('root.position');
      }
      return shader;
    }

  };

  RTT.traits = ['node', 'root', 'scene', 'vertex', 'texture', 'rtt', 'source', 'index', 'image'];

  RTT.defaults = {
    minFilter: 'linear',
    magFilter: 'linear',
    type: 'unsignedByte'
  };

  return RTT;

}).call(this);

module.exports = RTT;


},{"../../../util":190,"../base/parent":62}],115:[function(require,module,exports){
var Primitive, Shader, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Shader = (function() {
  class Shader extends Primitive {
    init() {
      return this.shader = null;
    }

    make() {
      var code, def, i, language, len, make, ref, snippet, type, types, uniforms;
      ({language, code} = this.props);
      if (language !== 'glsl') {
        throw new Error("GLSL required");
      }
      // Bind to attached data sources
      this._helpers.bind.make([
        {
          to: 'shader.sources',
          trait: 'source',
          multiple: true
        }
      ]);
      // Parse snippet w/ shadergraph (will do implicit DOM script tag by ID lookup if simple selector or ID given)
      snippet = this._shaders.fetch(code);
      // Convert uniforms to attributes
      types = this._types;
      uniforms = {};
      make = (type) => {
        var t;
        switch (type) {
          case 'i':
            return types.int();
          case 'f':
            return types.number();
          case 'v2':
            return types.vec2();
          case 'v3':
            return types.vec3();
          case 'v4':
            return types.vec4();
          case 'm3':
            return types.mat3();
          case 'm4':
            return types.mat4();
          case 't':
            return types.object();
          default:
            t = type.split('');
            if (t.pop() === 'v') {
              return types.array(make(t.join('')));
            } else {
              return null;
            }
        }
      };
      ref = snippet._signatures.uniform;
      for (i = 0, len = ref.length; i < len; i++) {
        def = ref[i];
        if (type = make(def.type)) {
          uniforms[def.name] = type;
        }
      }
      // Reconfigure node model
      return this.reconfigure({
        props: {
          uniform: uniforms
        }
      });
    }

    made() {
      // Notify of shader reallocation
      return this.trigger({
        type: 'source.rebuild'
      });
    }

    unmake() {
      return this.shader = null;
    }

    change(changed, touched, init) {
      if (changed['shader.uniforms'] || changed['shader.code'] || changed['shader.language']) {
        return this.rebuild();
      }
    }

    shaderBind(uniforms = {}) {
      var code, i, k, language, len, name, ref, ref1, s, source, u, v;
      ({language, code} = this.props);
      ref = this.node.attributes;
      for (k in ref) {
        v = ref[k];
        if ((v.type != null) && (v.short != null) && v.ns === 'uniform') {
          // Merge in prop attributes as uniforms
          if (uniforms[name = v.short] == null) {
            uniforms[name] = v;
          }
        }
      }
      if ((u = this.props.uniforms) != null) {
        for (k in u) {
          v = u[k];
          // Merge in explicit uniform object if set
          uniforms[k] = v;
        }
      }
      // New shader
      s = this._shaders.shader();
      // Require sources
      if (this.bind.sources != null) {
        ref1 = this.bind.sources;
        for (i = 0, len = ref1.length; i < len; i++) {
          source = ref1[i];
          s.require(source.sourceShader(this._shaders.shader()));
        }
      }
      // Build bound shader
      return s.pipe(code, uniforms);
    }

  };

  Shader.traits = ['node', 'bind', 'shader'];

  Shader.freeform = true;

  return Shader;

}).call(this);

module.exports = Shader;


},{"../../../util":190,"../../primitive":59}],116:[function(require,module,exports){
var Format, Operator, Util;

Operator = require('../operator/operator');

Util = require('../../../util');

Format = (function() {
  class Format extends Operator {
    init() {
      super.init();
      this.atlas = this.buffer = this.used = this.time = null;
      return this.filled = false;
    }

    sourceShader(shader) {
      return this.buffer.shader(shader);
    }

    textShader(shader) {
      return this.atlas.shader(shader);
    }

    textIsSDF() {
      return this.props.sdf > 0;
    }

    textHeight() {
      return this.props.detail;
    }

    make() {
      var atlas, depth, detail, dims, emit, font, height, items, magFilter, minFilter, sdf, style, type, variant, weight, width;
      // Bind to attached data sources    # super()
      this._helpers.bind.make([
        {
          to: 'operator.source',
          trait: 'raw'
        }
      ]);
      // Read sampling parameters
      ({minFilter, magFilter, type} = this.props);
      // Read font parameters
      ({font, style, variant, weight, detail, sdf} = this.props);
      // Prepare text atlas
      this.atlas = this._renderables.make('textAtlas', {
        font: font,
        size: detail,
        style: style,
        variant: variant,
        weight: weight,
        outline: sdf,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
      // Underlying data buffer needs no filtering
      minFilter = THREE.NearestFilter;
      magFilter = THREE.NearestFilter;
      type = THREE.FloatType;
      // Fetch geometry dimensions
      dims = this.bind.source.getDimensions();
      ({items, width, height, depth} = dims);
      // Create voxel buffer for text atlas coords
      this.buffer = this._renderables.make('voxelBuffer', {
        width: width,
        height: height,
        depth: depth,
        channels: 4,
        items: items,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
      // Hook buffer emitter to map atlas text
      atlas = this.atlas;
      emit = this.buffer.streamer.emit;
      this.buffer.streamer.emit = function(t) {
        return atlas.map(t, emit);
      };
      // Grab parent clock
      this.clockParent = this._inherit('clock');
      return this._listen('root', 'root.update', this.update);
    }

    made() {
      super.made();
      return this.resize();
    }

    unmake() {
      super.unmake();
      if (this.buffer) {
        this.buffer.dispose();
        this.buffer = null;
      }
      if (this.atlas) {
        this.atlas.dispose();
        return this.atlas = null;
      }
    }

    update() {
      var dst, src, used;
      src = this.bind.source.rawBuffer();
      dst = this.buffer;
      if ((this.filled && !this.props.live) || !this.through) {
        return;
      }
      this.time = this.clockParent.getTime();
      used = this.used;
      this.atlas.begin();
      this.used = this.through();
      this.buffer.write(this.used);
      this.atlas.end();
      this.filled = true;
      if (used !== this.used) {
        return this.trigger({
          type: 'source.resize'
        });
      }
    }

    change(changed, touched, init) {
      var data, digits, expr, length, map;
      if (touched['font']) {
        return this.rebuild();
      }
      if (changed['format.expr'] || changed['format.digits'] || changed['format.data'] || init) {
        ({digits, expr, data} = this.props);
        if (expr == null) {
          if (data != null) {
            expr = function(x, y, z, w, i) {
              return data[i];
            };
          } else {
            expr = function(x) {
              return x;
            };
          }
        }
        length = expr.length;
        if (digits != null) {
          expr = (function(expr) {
            return function(x, y, z, w, i, j, k, l, t, d) {
              return +(expr(x, y, z, w, i, j, k, l, t, d)).toPrecision(digits);
            };
          })(expr);
        }
        // Stream raw source data and format it with expression
        if (length > 8) {
          map = (emit, x, y, z, w, i, j, k, l, t, d) => {
            return emit(expr(x, y, z, w, i, j, k, l, this.time.clock, this.time.step));
          };
        } else {
          map = (emit, x, y, z, w, i, j, k, l) => {
            return emit(expr(x, y, z, w, i, j, k, l));
          };
        }
        return this.through = this.bind.source.rawBuffer().through(map, this.buffer);
      }
    }

  };

  Format.traits = ['node', 'bind', 'operator', 'texture', 'text', 'format', 'font'];

  Format.defaults = {
    minFilter: 'linear',
    magFilter: 'linear'
  };

  return Format;

}).call(this);

module.exports = Format;


},{"../../../util":190,"../operator/operator":93}],117:[function(require,module,exports){
var Label, Primitive, Util;

Primitive = require('../../primitive');

Util = require('../../../util');

Label = (function() {
  class Label extends Primitive {
    make() {
      var color, combine, depth, height, items, labelUniforms, map, mask, pointDims, position, snippet, sprite, styleUniforms, textDims, textIsSDF, uniforms, unitUniforms, width;
      super.make();
      // Bind to attached objects
      this._helpers.bind.make([
        {
          to: 'label.text',
          trait: 'text'
        },
        {
          to: 'geometry.points',
          trait: 'source'
        },
        {
          to: 'geometry.colors',
          trait: 'source'
        }
      ]);
      if (this.bind.points == null) {
        return;
      }
      if (this.bind.text == null) {
        return;
      }
      // Fetch geometry/text dimensions
      pointDims = this.bind.points.getDimensions();
      textDims = this.bind.text.getDimensions();
      textIsSDF = this.bind.text.textIsSDF();
      items = Math.min(pointDims.items, textDims.items);
      width = Math.min(pointDims.width, textDims.width);
      height = Math.min(pointDims.height, textDims.height);
      depth = Math.min(pointDims.depth, textDims.depth);
      // Build shader to sample position data
      // and transform into screen space
      position = this.bind.points.sourceShader(this._shaders.shader());
      position = this._helpers.position.pipeline(position);
      // Build shader to sample text geometry data
      sprite = this.bind.text.sourceShader(this._shaders.shader());
      // Build shader to sample text image data
      map = this._shaders.shader().pipe('label.map');
      map.pipe(this.bind.text.textShader(this._shaders.shader()));
      // Build shader to resolve text data
      labelUniforms = {
        spriteDepth: this.node.attributes['attach.depth'],
        spriteOffset: this.node.attributes['attach.offset'],
        spriteSnap: this.node.attributes['attach.snap'],
        spriteScale: this._attributes.make(this._types.number()),
        outlineStep: this._attributes.make(this._types.number()),
        outlineExpand: this._attributes.make(this._types.number()),
        outlineColor: this.node.attributes['label.background']
      };
      this.spriteScale = labelUniforms.spriteScale;
      this.outlineStep = labelUniforms.outlineStep;
      this.outlineExpand = labelUniforms.outlineExpand;
      snippet = textIsSDF ? 'label.outline' : 'label.alpha';
      combine = this._shaders.shader().pipe(snippet, labelUniforms);
      // Build color lookup
      if (this.bind.colors) {
        color = this._shaders.shader();
        this.bind.colors.sourceShader(color);
      }
      // Build transition mask lookup
      mask = this._helpers.object.mask();
      // Prepare bound uniforms
      styleUniforms = this._helpers.style.uniforms();
      unitUniforms = this._inherit('unit').getUnitUniforms();
      // Make sprite renderable
      uniforms = Util.JS.merge(unitUniforms, styleUniforms, labelUniforms);
      this.sprite = this._renderables.make('sprite', {
        uniforms: uniforms,
        width: width,
        height: height,
        depth: depth,
        items: items,
        position: position,
        sprite: sprite,
        map: map,
        combine: combine,
        color: color,
        mask: mask,
        linear: true
      });
      this._helpers.visible.make();
      return this._helpers.object.make([this.sprite]);
    }

    unmake() {
      this._helpers.bind.unmake();
      this._helpers.visible.unmake();
      this._helpers.object.unmake();
      return this.sprite = null;
    }

    resize() {
      var depth, height, items, pointDims, textDims, width;
      // Fetch geometry/text dimensions
      pointDims = this.bind.points.getActiveDimensions();
      textDims = this.bind.text.getActiveDimensions();
      items = Math.min(pointDims.items, textDims.items);
      width = Math.min(pointDims.width, textDims.width);
      height = Math.min(pointDims.height, textDims.height);
      depth = Math.min(pointDims.depth, textDims.depth);
      return this.sprite.geometry.clip(width, height, depth, items);
    }

    change(changed, touched, init) {
      var expand, height, outline, scale, size;
      if (touched['geometry'] || changed['label.text']) {
        return this.rebuild();
      }
      if (this.bind.points == null) {
        return;
      }
      size = this.props.size;
      outline = this.props.outline;
      expand = this.props.expand;
      height = this.bind.text.textHeight();
      scale = size / height;
      this.outlineExpand.value = expand / scale * 16 / 255;
      this.outlineStep.value = outline / scale * 16 / 255;
      return this.spriteScale.value = scale;
    }

  };

  Label.traits = ['node', 'bind', 'object', 'visible', 'style', 'label', 'attach', 'geometry', 'position'];

  return Label;

}).call(this);

module.exports = Label;


},{"../../../util":190,"../../primitive":59}],118:[function(require,module,exports){
var Resample, Retext, Util;

Resample = require('../operator/resample');

Util = require('../../../util');

Retext = (function() {
  class Retext extends Resample {
    init() {
      return this.sourceSpec = [
        {
          to: 'operator.source',
          trait: 'text'
        }
      ];
    }

    textShader(shader) {
      return this.bind.source.textShader(shader);
    }

    textIsSDF() {
      var ref;
      return ((ref = this.bind.source) != null ? ref.props.sdf : void 0) > 0;
    }

    textHeight() {
      var ref;
      return (ref = this.bind.source) != null ? ref.props.detail : void 0;
    }

  };

  Retext.traits = ['node', 'bind', 'operator', 'resample', 'sampler:x', 'sampler:y', 'sampler:z', 'sampler:w', 'include', 'text'];

  return Retext;

}).call(this);

module.exports = Retext;


},{"../../../util":190,"../operator/resample":96}],119:[function(require,module,exports){
var Buffer, Text, Util, Voxel;

Buffer = require('../data/buffer');

Voxel = require('../data/voxel');

Util = require('../../../util');

Text = (function() {
  class Text extends Voxel {
    init() {
      super.init();
      return this.atlas = null;
    }

    textShader(shader) {
      return this.atlas.shader(shader);
    }

    textIsSDF() {
      return this.props.sdf > 0;
    }

    textHeight() {
      return this.props.detail;
    }

    make() {
      var atlas, channels, data, depth, detail, dims, emit, font, height, items, magFilter, minFilter, ref, ref1, ref2, reserveX, reserveY, reserveZ, sdf, space, style, type, variant, weight, width;
      // Read sampling parameters
      ({minFilter, magFilter, type} = this.props);
      // Read font parameters
      ({font, style, variant, weight, detail, sdf} = this.props);
      // Prepare text atlas
      this.atlas = this._renderables.make('textAtlas', {
        font: font,
        size: detail,
        style: style,
        variant: variant,
        weight: weight,
        outline: sdf,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
      // Underlying data buffer needs no filtering
      this.minFilter = THREE.NearestFilter;
      this.magFilter = THREE.NearestFilter;
      this.type = THREE.FloatType;
      // Skip voxel::make(), as we need 4 channels internally in our buffer to store sprite x/y/w/h per string
      Buffer.prototype.make.call(this);
      // Read sampling parameters
      minFilter = (ref = this.minFilter) != null ? ref : this.props.minFilter;
      magFilter = (ref1 = this.magFilter) != null ? ref1 : this.props.magFilter;
      type = (ref2 = this.type) != null ? ref2 : this.props.type;
      // Read given dimensions
      width = this.props.width;
      height = this.props.height;
      depth = this.props.depth;
      reserveX = this.props.bufferWidth;
      reserveY = this.props.bufferHeight;
      reserveZ = this.props.bufferDepth;
      channels = this.props.channels;
      items = this.props.items;
      dims = this.spec = {channels, items, width, height, depth};
      this.items = dims.items;
      this.channels = dims.channels;
      // Init to right size if data supplied
      data = this.props.data;
      dims = Util.Data.getDimensions(data, dims);
      space = this.space;
      space.width = Math.max(reserveX, dims.width || 1);
      space.height = Math.max(reserveY, dims.height || 1);
      space.depth = Math.max(reserveZ, dims.depth || 1);
      // Create text voxel buffer
      this.buffer = this._renderables.make(this.storage, {
        width: space.width,
        height: space.height,
        depth: space.depth,
        channels: 4,
        items: items,
        minFilter: minFilter,
        magFilter: magFilter,
        type: type
      });
      // Hook buffer emitter to map atlas text
      atlas = this.atlas;
      emit = this.buffer.streamer.emit;
      return this.buffer.streamer.emit = function(text) {
        return atlas.map(text, emit);
      };
    }

    unmake() {
      super.unmake();
      if (this.atlas) {
        this.atlas.dispose();
        return this.atlas = null;
      }
    }

    update() {
      this.atlas.begin();
      super.update();
      return this.atlas.end();
    }

    change(changed, touched, init) {
      if (touched['font']) {
        return this.rebuild();
      }
      return super.change(changed, touched, init);
    }

  };

  Text.traits = ['node', 'buffer', 'active', 'data', 'texture', 'voxel', 'text', 'font'];

  Text.defaults = {
    minFilter: 'linear',
    magFilter: 'linear'
  };

  Text.finals = {
    channels: 1
  };

  return Text;

}).call(this);

module.exports = Text;


},{"../../../util":190,"../data/buffer":70,"../data/voxel":76}],120:[function(require,module,exports){
var Clock, Parent;

Parent = require('../base/parent');

Clock = (function() {
  class Clock extends Parent {
    init() {
      this.skew = 0;
      this.last = 0;
      return this.time = {
        now: +new Date() / 1000,
        time: 0,
        delta: 0,
        clock: 0,
        step: 0
      };
    }

    make() {
      // Listen to parent clock
      return this._listen('clock', 'clock.tick', this.tick);
    }

    reset() {
      return this.skew = 0;
    }

    tick(e) {
      var clock, delay, delta, from, pace, parent, ratio, realtime, seek, speed, time, to;
      ({from, to, speed, seek, pace, delay, realtime} = this.props);
      parent = this._inherit('clock').getTime();
      time = realtime ? parent.time : parent.clock;
      delta = realtime ? parent.delta : parent.step;
      ratio = speed / pace;
      this.skew += delta * (ratio - 1);
      if (this.last > time) {
        this.skew = 0;
      }
      this.time.now = parent.now + this.skew;
      this.time.time = parent.time;
      this.time.delta = parent.delta;
      clock = seek != null ? seek : parent.clock + this.skew;
      this.time.clock = Math.min(to, from + Math.max(0, clock - delay * ratio));
      this.time.step = delta * ratio;
      this.last = time;
      return this.trigger(e);
    }

    getTime() {
      return this.time;
    }

  };

  Clock.traits = ['node', 'clock', 'seek', 'play'];

  return Clock;

}).call(this);

module.exports = Clock;


},{"../base/parent":62}],121:[function(require,module,exports){
var Now, Parent;

Parent = require('../base/parent');

Now = (function() {
  class Now extends Parent {
    init() {
      var now;
      this.now = now = +new Date() / 1000;
      this.skew = 0;
      return this.time = {
        now,
        time: 0,
        delta: 0,
        clock: 0,
        step: 0
      };
    }

    make() {
      // Listen to parent clock
      this.clockParent = this._inherit('clock');
      return this._listen('clock', 'clock.tick', this.tick);
    }

    unmake() {
      return this.clockParent = null;
    }

    change(changed, touched, init) {
      if (changed['date.now']) {
        return this.skew = 0;
      }
    }

    tick(e) {
      var now, pace, parent, ref, seek, speed;
      ({now, seek, pace, speed} = this.props);
      parent = this.clockParent.getTime();
      this.skew += parent.step * pace / speed;
      if (seek != null) {
        this.skew = seek;
      }
      this.time.now = this.time.time = this.time.clock = ((ref = this.props.now) != null ? ref : this.now) + this.skew;
      this.time.delta = this.time.step = parent.delta;
      return this.trigger(e);
    }

    getTime() {
      return this.time;
    }

  };

  Now.traits = ['node', 'clock', 'now'];

  return Now;

}).call(this);

module.exports = Now;


},{"../base/parent":62}],122:[function(require,module,exports){
var Traits, Types;

Types = require('./types');

Traits = {
  node: {
    id: Types.nullable(Types.string()),
    classes: Types.classes()
  },
  entity: {
    active: Types.bool(true)
  },
  object: {
    visible: Types.bool(true)
  },
  unit: {
    scale: Types.nullable(Types.number()),
    fov: Types.nullable(Types.number()),
    focus: Types.nullable(Types.number(1), true)
  },
  span: {
    range: Types.nullable(Types.vec2(-1, 1))
  },
  view: {
    range: Types.array(Types.vec2(-1, 1), 4)
  },
  view3: {
    position: Types.vec3(),
    quaternion: Types.quat(),
    rotation: Types.vec3(),
    scale: Types.vec3(1, 1, 1),
    eulerOrder: Types.swizzle('xyz')
  },
  view4: {
    position: Types.vec4(),
    scale: Types.vec4(1, 1, 1, 1)
  },
  layer: {
    depth: Types.number(1),
    fit: Types.fit('y')
  },
  vertex: {
    pass: Types.vertexPass()
  },
  fragment: {
    pass: Types.fragmentPass(),
    gamma: Types.bool(false)
  },
  transform3: {
    position: Types.vec3(),
    quaternion: Types.quat(),
    rotation: Types.vec3(),
    eulerOrder: Types.swizzle('xyz'),
    scale: Types.vec3(1, 1, 1),
    matrix: Types.mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
  },
  transform4: {
    position: Types.vec4(),
    scale: Types.vec4(1, 1, 1, 1),
    matrix: Types.mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
  },
  camera: {
    proxy: Types.bool(false),
    position: Types.nullable(Types.vec3()),
    quaternion: Types.nullable(Types.quat()),
    rotation: Types.nullable(Types.vec3()),
    lookAt: Types.nullable(Types.vec3()),
    up: Types.nullable(Types.vec3()),
    eulerOrder: Types.swizzle('xyz'),
    fov: Types.nullable(Types.number(1))
  },
  //ortho:             Types.nullable(Types.number(0))
  polar: {
    bend: Types.number(1),
    helix: Types.number(0)
  },
  spherical: {
    bend: Types.number(1)
  },
  stereographic: {
    bend: Types.number(1)
  },
  interval: {
    axis: Types.axis()
  },
  area: {
    axes: Types.swizzle([1, 2], 2)
  },
  volume: {
    axes: Types.swizzle([1, 2, 3], 3)
  },
  origin: {
    origin: Types.vec4()
  },
  scale: {
    divide: Types.number(10),
    unit: Types.number(1),
    base: Types.number(10),
    mode: Types.scale(),
    start: Types.bool(true),
    end: Types.bool(true),
    zero: Types.bool(true),
    factor: Types.positive(Types.number(1)),
    nice: Types.bool(true)
  },
  grid: {
    lineX: Types.bool(true),
    lineY: Types.bool(true),
    crossed: Types.bool(false),
    closedX: Types.bool(false),
    closedY: Types.bool(false)
  },
  axis: {
    detail: Types.int(1),
    crossed: Types.bool(false)
  },
  data: {
    data: Types.nullable(Types.data()),
    expr: Types.nullable(Types.emitter()),
    bind: Types.nullable(Types.func()),
    live: Types.bool(true)
  },
  buffer: {
    channels: Types.enum(4, [1, 2, 3, 4]),
    items: Types.int(1),
    fps: Types.nullable(Types.int(60)),
    hurry: Types.int(5),
    limit: Types.int(60),
    realtime: Types.bool(false),
    observe: Types.bool(false),
    aligned: Types.bool(false)
  },
  sampler: {
    centered: Types.bool(false),
    padding: Types.number(0)
  },
  array: {
    width: Types.nullable(Types.positive(Types.int(1), true)),
    bufferWidth: Types.int(1),
    history: Types.int(1)
  },
  matrix: {
    width: Types.nullable(Types.positive(Types.int(1), true)),
    height: Types.nullable(Types.positive(Types.int(1), true)),
    history: Types.int(1),
    bufferWidth: Types.int(1),
    bufferHeight: Types.int(1)
  },
  voxel: {
    width: Types.nullable(Types.positive(Types.int(1), true)),
    height: Types.nullable(Types.positive(Types.int(1), true)),
    depth: Types.nullable(Types.positive(Types.int(1), true)),
    bufferWidth: Types.int(1),
    bufferHeight: Types.int(1),
    bufferDepth: Types.int(1)
  },
  resolve: {
    expr: Types.nullable(Types.func()),
    items: Types.int(1)
  },
  style: {
    opacity: Types.positive(Types.number(1)),
    color: Types.color(),
    blending: Types.blending(),
    zWrite: Types.bool(true),
    zTest: Types.bool(true),
    zIndex: Types.positive(Types.round()),
    zBias: Types.number(0),
    zOrder: Types.nullable(Types.int())
  },
  geometry: {
    points: Types.select(),
    colors: Types.nullable(Types.select())
  },
  point: {
    size: Types.positive(Types.number(4)),
    sizes: Types.nullable(Types.select()),
    shape: Types.shape(),
    optical: Types.bool(true),
    fill: Types.bool(true),
    depth: Types.number(1)
  },
  line: {
    width: Types.positive(Types.number(2)),
    depth: Types.positive(Types.number(1)),
    join: Types.join(),
    stroke: Types.stroke(),
    proximity: Types.nullable(Types.number(2e308)),
    closed: Types.bool(false)
  },
  mesh: {
    fill: Types.bool(true),
    shaded: Types.bool(false),
    map: Types.nullable(Types.select()),
    lineBias: Types.number(5)
  },
  strip: {
    line: Types.bool(false)
  },
  face: {
    line: Types.bool(false)
  },
  arrow: {
    size: Types.number(3),
    start: Types.bool(false),
    end: Types.bool(false)
  },
  ticks: {
    normal: Types.vec3(0, 0, 1),
    size: Types.positive(Types.number(10)),
    epsilon: Types.positive(Types.number(0.001))
  },
  attach: {
    offset: Types.vec2(0, -20),
    snap: Types.bool(false),
    depth: Types.number(0)
  },
  format: {
    digits: Types.nullable(Types.positive(Types.number(3))),
    data: Types.nullable(Types.data()),
    expr: Types.nullable(Types.func()),
    live: Types.bool(true)
  },
  font: {
    font: Types.font('sans-serif'),
    style: Types.string(),
    variant: Types.string(),
    weight: Types.string(),
    detail: Types.number(24),
    sdf: Types.number(5)
  },
  label: {
    text: Types.select(),
    size: Types.number(16),
    outline: Types.number(2),
    expand: Types.number(0),
    background: Types.color(1, 1, 1)
  },
  overlay: {
    opacity: Types.number(1),
    zIndex: Types.positive(Types.round(0))
  },
  dom: {
    points: Types.select(),
    html: Types.select(),
    size: Types.number(16),
    outline: Types.number(2),
    zoom: Types.number(1),
    color: Types.nullable(Types.color()),
    attributes: Types.nullable(Types.object()),
    pointerEvents: Types.bool(false)
  },
  texture: {
    minFilter: Types.filter('nearest'),
    magFilter: Types.filter('nearest'),
    type: Types.type('float')
  },
  shader: {
    sources: Types.nullable(Types.select()),
    language: Types.string('glsl'),
    code: Types.string(),
    uniforms: Types.nullable(Types.object())
  },
  include: {
    shader: Types.select()
  },
  operator: {
    source: Types.select()
  },
  spread: {
    unit: Types.mapping(),
    items: Types.nullable(Types.vec4()),
    width: Types.nullable(Types.vec4()),
    height: Types.nullable(Types.vec4()),
    depth: Types.nullable(Types.vec4()),
    alignItems: Types.anchor(),
    alignWidth: Types.anchor(),
    alignHeight: Types.anchor(),
    alignDepth: Types.anchor()
  },
  grow: {
    scale: Types.number(1),
    items: Types.nullable(Types.anchor()),
    width: Types.nullable(Types.anchor()),
    height: Types.nullable(Types.anchor()),
    depth: Types.nullable(Types.anchor())
  },
  split: {
    order: Types.transpose('wxyz'),
    axis: Types.nullable(Types.axis()),
    length: Types.int(1),
    overlap: Types.int(0)
  },
  join: {
    order: Types.transpose('wxyz'),
    axis: Types.nullable(Types.axis()),
    overlap: Types.int(0)
  },
  swizzle: {
    order: Types.swizzle()
  },
  transpose: {
    order: Types.transpose()
  },
  repeat: {
    items: Types.number(1),
    width: Types.number(1),
    height: Types.number(1),
    depth: Types.number(1)
  },
  slice: {
    items: Types.nullable(Types.vec2()),
    width: Types.nullable(Types.vec2()),
    height: Types.nullable(Types.vec2()),
    depth: Types.nullable(Types.vec2())
  },
  lerp: {
    size: Types.mapping('absolute'),
    items: Types.nullable(Types.number()),
    width: Types.nullable(Types.number()),
    height: Types.nullable(Types.number()),
    depth: Types.nullable(Types.number())
  },
  subdivide: {
    items: Types.nullable(Types.positive(Types.int(), true)),
    width: Types.nullable(Types.positive(Types.int(), true)),
    height: Types.nullable(Types.positive(Types.int(), true)),
    depth: Types.nullable(Types.positive(Types.int(), true)),
    bevel: Types.number(1),
    lerp: Types.bool(true)
  },
  resample: {
    indices: Types.number(4),
    channels: Types.number(4),
    sample: Types.mapping(),
    size: Types.mapping('absolute'),
    items: Types.nullable(Types.number()),
    width: Types.nullable(Types.number()),
    height: Types.nullable(Types.number()),
    depth: Types.nullable(Types.number())
  },
  readback: {
    type: Types.type('float'),
    expr: Types.nullable(Types.func()),
    data: Types.data(),
    channels: Types.enum(4, [1, 2, 3, 4]),
    items: Types.nullable(Types.int()),
    width: Types.nullable(Types.int()),
    height: Types.nullable(Types.int()),
    depth: Types.nullable(Types.int())
  },
  root: {
    speed: Types.number(1),
    camera: Types.select('[camera]')
  },
  inherit: {
    source: Types.select(),
    traits: Types.array(Types.string())
  },
  rtt: {
    size: Types.mapping('absolute'),
    width: Types.nullable(Types.number()),
    height: Types.nullable(Types.number()),
    history: Types.int(1)
  },
  compose: {
    alpha: Types.bool(false)
  },
  present: {
    index: Types.int(1),
    directed: Types.bool(true),
    length: Types.number(0)
  },
  slide: {
    order: Types.nullable(Types.int(0)),
    steps: Types.number(1),
    early: Types.int(0),
    late: Types.int(0),
    from: Types.nullable(Types.int(0)),
    to: Types.nullable(Types.int(1))
  },
  transition: {
    stagger: Types.vec4(),
    enter: Types.nullable(Types.number(1)),
    exit: Types.nullable(Types.number(1)),
    delay: Types.number(0),
    delayEnter: Types.nullable(Types.number(0)),
    delayExit: Types.nullable(Types.number(0)),
    duration: Types.number(.3),
    durationEnter: Types.nullable(Types.number(0)),
    durationExit: Types.nullable(Types.number(0))
  },
  move: {
    from: Types.vec4(),
    to: Types.vec4()
  },
  seek: {
    seek: Types.nullable(Types.number(0))
  },
  track: {
    target: Types.select(),
    script: Types.object({}),
    ease: Types.ease('cosine')
  },
  trigger: {
    trigger: Types.nullable(Types.int(1), true)
  },
  step: {
    playback: Types.ease('linear'),
    stops: Types.nullable(Types.array(Types.number())),
    delay: Types.number(0),
    duration: Types.number(.3),
    pace: Types.number(0),
    speed: Types.number(1),
    rewind: Types.number(2),
    skip: Types.bool(true),
    realtime: Types.bool(false)
  },
  play: {
    delay: Types.number(0),
    pace: Types.number(1),
    speed: Types.number(1),
    from: Types.number(0),
    to: Types.number(2e308),
    realtime: Types.bool(false),
    loop: Types.bool(false)
  },
  now: {
    now: Types.nullable(Types.timestamp()),
    seek: Types.nullable(Types.number(0)),
    pace: Types.number(1),
    speed: Types.number(1)
  }
};

module.exports = Traits;


},{"./types":130}],123:[function(require,module,exports){
var Fragment, Transform;

Transform = require('./transform');

Fragment = (function() {
  class Fragment extends Transform {
    make() {
      // Bind to attached shader
      return this._helpers.bind.make([
        {
          to: 'include.shader',
          trait: 'shader',
          optional: true
        }
      ]);
    }

    unmake() {
      return this._helpers.bind.unmake();
    }

    change(changed, touched, init) {
      if (touched['include'] || changed['fragment.gamma']) {
        return this.rebuild();
      }
    }

    fragment(shader, pass) {
      if (this.bind.shader != null) {
        if (pass === this.props.pass) {
          if (this.props.gamma) {
            shader.pipe('mesh.gamma.out');
          }
          shader.pipe(this.bind.shader.shaderBind());
          shader.split();
          if (this.props.gamma) {
            shader.pipe('mesh.gamma.in');
          }
          shader.pass();
        }
      }
      return super.fragment(shader, pass);
    }

  };

  Fragment.traits = ['node', 'include', 'fragment', 'bind'];

  return Fragment;

}).call(this);

module.exports = Fragment;


},{"./transform":126}],124:[function(require,module,exports){
var Layer, Transform, π;

Transform = require('./transform');

π = Math.PI;

Layer = (function() {
  class Layer extends Transform {
    make() {
      this._listen('root', 'root.resize', this.update);
      return this.uniforms = {
        layerScale: this._attributes.make(this._types.vec4()),
        layerBias: this._attributes.make(this._types.vec4())
      };
    }

    update() {
      var _enum, aspect, camera, depth, fit, fov, pitch, ref, ref1, scale, size;
      camera = this._inherit('root').getCamera();
      size = this._inherit('root').getSize();
      aspect = (ref = camera.aspect) != null ? ref : 1;
      fov = (ref1 = camera.fov) != null ? ref1 : 1;
      pitch = Math.tan(fov * π / 360);
      _enum = this.node.attributes['layer.fit'].enum;
      ({fit, depth, scale} = this.props);
      // Convert contain/cover into x/y
      switch (fit) {
        case _enum.contain:
          fit = aspect > 1 ? _enum.y : _enum.x;
          break;
        case _enum.cover:
          fit = aspect > 1 ? _enum.x : _enum.y;
      }
      // Fit x/y
      switch (fit) {
        case _enum.x:
          this.uniforms.layerScale.value.set(pitch * aspect, pitch * aspect);
          break;
        case _enum.y:
          this.uniforms.layerScale.value.set(pitch, pitch);
      }
      return this.uniforms.layerBias.value.set(0, 0, -depth, 0);
    }

    change(changed, touched, init) {
      if (changed['layer.fit'] || changed['layer.depth'] || init) {
        return this.update();
      }
    }

    // End transform chain here without applying camera view
    vertex(shader, pass) {
      if (pass === 2) {
        return shader.pipe('layer.position', this.uniforms);
      }
      if (pass === 3) {
        return shader.pipe('root.position');
      }
      return shader;
    }

  };

  Layer.traits = ['node', 'vertex', 'layer'];

  return Layer;

}).call(this);

module.exports = Layer;


},{"./transform":126}],125:[function(require,module,exports){
var Mask, Parent;

Parent = require('../base/parent');

Mask = (function() {
  class Mask extends Parent {
    make() {
      // Bind to attached shader
      return this._helpers.bind.make([
        {
          to: 'include.shader',
          trait: 'shader',
          optional: true
        }
      ]);
    }

    unmake() {
      return this._helpers.bind.unmake();
    }

    change(changed, touched, init) {
      if (touched['include']) {
        return this.rebuild();
      }
    }

    mask(shader) {
      var ref, ref1, s;
      if (this.bind.shader != null) {
        if (shader) {
          s = this._shaders.shader();
          s.pipe(Util.GLSL.identity('vec4'));
          s.fan();
          s.pipe(shader);
          s.next();
          s.pipe(this.bind.shader.shaderBind());
          s.end();
          s.pipe("float combine(float a, float b) { return min(a, b); }");
        } else {
          s = this._shaders.shader();
          s.pipe(this.bind.shader.shaderBind());
        }
      } else {
        s = shader;
      }
      return (ref = (ref1 = this._inherit('mask')) != null ? ref1.mask(s) : void 0) != null ? ref : s;
    }

  };

  Mask.traits = ['node', 'include', 'mask', 'bind'];

  return Mask;

}).call(this);

module.exports = Mask;


},{"../base/parent":62}],126:[function(require,module,exports){
var Parent, Transform;

Parent = require('../base/parent');

Transform = (function() {
  class Transform extends Parent {
    vertex(shader, pass) {
      var ref, ref1;
      return (ref = (ref1 = this._inherit('vertex')) != null ? ref1.vertex(shader, pass) : void 0) != null ? ref : shader;
    }

    fragment(shader, pass) {
      var ref, ref1;
      return (ref = (ref1 = this._inherit('fragment')) != null ? ref1.fragment(shader, pass) : void 0) != null ? ref : shader;
    }

  };

  Transform.traits = ['node', 'vertex', 'fragment'];

  return Transform;

}).call(this);

module.exports = Transform;


},{"../base/parent":62}],127:[function(require,module,exports){
var Transform, Transform3, Util;

Transform = require('./transform');

Util = require('../../../util');

Transform3 = (function() {
  class Transform3 extends Transform {
    make() {
      this.uniforms = {
        transformMatrix: this._attributes.make(this._types.mat4())
      };
      return this.composer = Util.Three.transformComposer();
    }

    unmake() {
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var e, m, p, q, r, s;
      if (changed['transform3.pass']) {
        return this.rebuild();
      }
      if (!(touched['transform3'] || init)) {
        return;
      }
      p = this.props.position;
      q = this.props.quaternion;
      r = this.props.rotation;
      s = this.props.scale;
      m = this.props.matrix;
      e = this.props.eulerOrder;
      return this.uniforms.transformMatrix.value = this.composer(p, r, q, s, m, e);
    }

    vertex(shader, pass) {
      if (pass === this.props.pass) {
        shader.pipe('transform3.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

  };

  Transform3.traits = ['node', 'vertex', 'transform3'];

  return Transform3;

}).call(this);

module.exports = Transform3;


},{"../../../util":190,"./transform":126}],128:[function(require,module,exports){
var Transform, Transform4;

Transform = require('./transform');

Transform4 = (function() {
  class Transform4 extends Transform {
    make() {
      this.uniforms = {
        transformMatrix: this._attributes.make(this._types.mat4()),
        transformOffset: this.node.attributes['transform4.position']
      };
      return this.transformMatrix = this.uniforms.transformMatrix.value;
    }

    unmake() {
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var m, s, t;
      if (changed['transform4.pass']) {
        return this.rebuild();
      }
      if (!(touched['transform4'] || init)) {
        return;
      }
      s = this.props.scale;
      m = this.props.matrix;
      t = this.transformMatrix;
      t.copy(m);
      return t.scale(s);
    }

    vertex(shader, pass) {
      if (pass === this.props.pass) {
        shader.pipe('transform4.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

  };

  Transform4.traits = ['node', 'vertex', 'transform4'];

  return Transform4;

}).call(this);

module.exports = Transform4;


},{"./transform":126}],129:[function(require,module,exports){
var Transform, Vertex;

Transform = require('./transform');

Vertex = (function() {
  class Vertex extends Transform {
    make() {
      // Bind to attached shader
      return this._helpers.bind.make([
        {
          to: 'include.shader',
          trait: 'shader',
          optional: true
        }
      ]);
    }

    unmake() {
      return this._helpers.bind.unmake();
    }

    change(changed, touched, init) {
      if (touched['include']) {
        return this.rebuild();
      }
    }

    vertex(shader, pass) {
      if (this.bind.shader != null) {
        if (pass === this.props.pass) {
          shader.pipe(this.bind.shader.shaderBind());
        }
      }
      return super.vertex(shader, pass);
    }

  };

  Vertex.traits = ['node', 'include', 'vertex', 'bind'];

  return Vertex;

}).call(this);

module.exports = Vertex;


},{"./transform":126}],130:[function(require,module,exports){
var Types, Util, decorate,
  indexOf = [].indexOf;

Util = require('../../util');

// Property types

// The weird calling convention is for double-buffering the values
// while validating compound types like arrays and nullables. 

// validate: (value, target, invalid) ->

//   # Option 1: Call invalid() to reject
//   return invalid() if value < 0

//   # Option 2: Change target in-place
//   target.set(value)
//   return target

//   # Option 3: Return new value
//   return +value

Types = {
  array: function(type, size, value = null) {
    var lerp, op;
    lerp = type.lerp ? function(a, b, target, f) {
      var i, j, l, ref;
      l = Math.min(a.length, b.length);
      for (i = j = 0, ref = l; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        target[i] = type.lerp(a[i], b[i], target[i], f);
      }
      return target;
    } : void 0;
    op = type.op ? function(a, b, target, op) {
      var i, j, l, ref;
      l = Math.min(a.length, b.length);
      for (i = j = 0, ref = l; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        target[i] = type.op(a[i], b[i], target[i], op);
      }
      return target;
    } : void 0;
    if ((value != null) && !(value instanceof Array)) {
      value = [value];
    }
    return {
      uniform: function() {
        if (type.uniform) {
          return type.uniform() + 'v';
        } else {
          return void 0;
        }
      },
      make: function() {
        var i, j, ref, results;
        if (value != null) {
          return value.slice();
        }
        if (!size) {
          return [];
        }
        results = [];
        for (i = j = 0, ref = size; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          results.push(type.make());
        }
        return results;
      },
      validate: function(value, target, invalid) {
        var i, input, j, l, ref, ref1;
        if (!(value instanceof Array)) {
          value = [value];
        }
        l = target.length = size ? size : value.length;
        for (i = j = 0, ref = l; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          input = (ref1 = value[i]) != null ? ref1 : type.make();
          target[i] = type.validate(input, target[i], invalid);
        }
        return target;
      },
      equals: function(a, b) {
        var al, bl, i, j, l, ref;
        al = a.length;
        bl = b.length;
        if (al !== bl) {
          return false;
        }
        l = Math.min(al, bl);
        for (i = j = 0, ref = l; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          if (!(typeof type.equals === "function" ? type.equals(a[i], b[i]) : void 0)) {
            return false;
          }
        }
        return true;
      },
      lerp: lerp,
      op: op,
      clone: function(v) {
        var j, len, results, x;
        results = [];
        for (j = 0, len = v.length; j < len; j++) {
          x = v[j];
          results.push(type.clone(x));
        }
        return results;
      }
    };
  },
  letters: function(type, size, value = null) {
    var array, i, j, len, v;
    if (value != null) {
      if (value === "" + value) {
        value = value.split('');
      }
      for (i = j = 0, len = value.length; j < len; i = ++j) {
        v = value[i];
        value[i] = type.validate(v, v);
      }
    }
    array = Types.array(type, size, value);
    return {
      uniform: function() {
        return array.uniform();
      },
      make: function() {
        return array.make();
      },
      validate: function(value, target, invalid) {
        if (value === "" + value) {
          value = value.split('');
        }
        return array.validate(value, target, invalid);
      },
      equals: function(a, b) {
        return array.equals(a, b);
      },
      clone: array.clone
    };
  },
  nullable: function(type, make = false) {
    var emitter, lerp, op, value;
    value = make ? type.make() : null;
    emitter = type.emitter ? function(expr1, expr2) {
      if (expr2 == null) {
        return expr1;
      }
      if (expr1 == null) {
        return expr2;
      }
      return type.emitter(expr1, expr2);
    } : void 0;
    lerp = type.lerp ? function(a, b, target, f) {
      if (a === null || b === null) {
        if (f < .5) {
          return a;
        } else {
          return b;
        }
      }
      if (target == null) {
        target = type.make();
      }
      value = type.lerp(a, b, target, f);
      return target;
    } : void 0;
    op = type.op ? function(a, b, target, op) {
      if (a === null || b === null) {
        return null;
      }
      if (target == null) {
        target = type.make();
      }
      value = type.op(a, b, target, op);
      return value;
    } : void 0;
    return {
      make: function() {
        return value;
      },
      validate: function(value, target, invalid) {
        if (value === null) {
          return value;
        }
        if (target === null) {
          target = type.make();
        }
        return type.validate(value, target, invalid);
      },
      uniform: function() {
        return typeof type.uniform === "function" ? type.uniform() : void 0;
      },
      equals: function(a, b) {
        var an, bn, ref;
        an = a === null;
        bn = b === null;
        if (an && bn) {
          return true;
        }
        if (an ^ bn) {
          return false;
        }
        return (ref = typeof type.equals === "function" ? type.equals(a, b) : void 0) != null ? ref : a === b;
      },
      lerp: lerp,
      op: op,
      emitter: emitter
    };
  },
  enum: function(value, keys = [], map = {}) {
    var i, j, key, len, len1, n, values;
    i = 0;
    values = {};
    for (j = 0, len = keys.length; j < len; j++) {
      key = keys[j];
      if (key !== +key) {
        if (map[key] == null) {
          map[key] = i++;
        }
      }
    }
    for (n = 0, len1 = keys.length; n < len1; n++) {
      key = keys[n];
      if (key === +key) {
        values[key] = key;
      }
    }
    for (key in map) {
      i = map[key];
      values[i] = true;
    }
    if (values[value] == null) {
      value = map[value];
    }
    return {
      enum: function() {
        return map;
      },
      make: function() {
        return value;
      },
      validate: function(value, target, invalid) {
        var v;
        v = values[value] ? value : map[value];
        if (v != null) {
          return v;
        }
        return invalid();
      }
    };
  },
  enumber: function(value, keys, map = {}) {
    var _enum;
    _enum = Types.enum(value, keys, map);
    return {
      enum: _enum.enum,
      uniform: function() {
        return 'f';
      },
      make: function() {
        var ref;
        return (ref = _enum.make()) != null ? ref : +value;
      },
      validate: function(value, target, invalid) {
        if (value === +value) {
          return value;
        }
        return _enum.validate(value, target, invalid);
      },
      op: function(a, b, target, op) {
        return op(a, b);
      }
    };
  },
  select: function(value = '<') {
    value;
    return {
      make: function() {
        return value;
      },
      validate: function(value, target, invalid) {
        if (typeof value === 'string') {
          return value;
        }
        if (typeof value === 'object') {
          return value;
        }
        return invalid();
      }
    };
  },
  bool: function(value) {
    value = !!value;
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return value;
      },
      validate: function(value, target, invalid) {
        return !!value;
      }
    };
  },
  int: function(value = 0) {
    value = +Math.round(value);
    return {
      uniform: function() {
        return 'i';
      },
      make: function() {
        return value;
      },
      validate: function(value, target, invalid) {
        var x;
        if (value !== (x = +value)) {
          return invalid();
        }
        return Math.round(x) || 0;
      },
      op: function(a, b, target, op) {
        return op(a, b);
      }
    };
  },
  round: function(value = 0) {
    value = +Math.round(value);
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return value;
      },
      validate: function(value, target, invalid) {
        var x;
        if (value !== (x = +value)) {
          return invalid();
        }
        return Math.round(x) || 0;
      },
      op: function(a, b, target, op) {
        return op(a, b);
      }
    };
  },
  number: function(value = 0) {
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return +value;
      },
      validate: function(value, target, invalid) {
        var x;
        if (value !== (x = +value)) {
          return invalid();
        }
        return x || 0;
      },
      op: function(a, b, target, op) {
        return op(a, b);
      }
    };
  },
  positive: function(type, strict = false) {
    return {
      uniform: type.uniform,
      make: type.make,
      validate: function(value, target, invalid) {
        value = type.validate(value, target, invalid);
        if ((value < 0) || (strict && value <= 0)) {
          return invalid();
        }
        return value;
      },
      op: function(a, b, target, op) {
        return op(a, b);
      }
    };
  },
  string: function(value = '') {
    return {
      make: function() {
        return "" + value;
      },
      validate: function(value, target, invalid) {
        var x;
        if (value !== (x = "" + value)) {
          return invalid();
        }
        return x;
      }
    };
  },
  func: function() {
    return {
      make: function() {
        return function() {};
      },
      validate: function(value, target, invalid) {
        if (typeof value === 'function') {
          return value;
        }
        return invalid();
      }
    };
  },
  emitter: function() {
    return {
      make: function() {
        return function(emit) {
          return emit(1, 1, 1, 1);
        };
      },
      validate: function(value, target, invalid) {
        if (typeof value === 'function') {
          return value;
        }
        return invalid();
      },
      emitter: function(a, b) {
        return Util.Data.getLerpEmitter(a, b);
      }
    };
  },
  object: function(value) {
    return {
      make: function() {
        return value != null ? value : {};
      },
      validate: function(value, target, invalid) {
        if (typeof value === 'object') {
          return value;
        }
        return invalid();
      },
      clone: function(v) {
        return JSON.parse(JSON.stringify(v));
      }
    };
  },
  timestamp: function(value = null) {
    if (typeof value === 'string') {
      value = Date.parse(value);
    }
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return value != null ? value : +new Date();
      },
      validate: function(value, target, invalid) {
        var x;
        value = Date.parse(value);
        if (value !== (x = +value)) {
          return invalid();
        }
        return value;
      },
      op: function(a, b, target, op) {
        return op(a, b);
      }
    };
  },
  vec2: function(x = 0, y = 0) {
    var defaults;
    defaults = [x, y];
    return {
      uniform: function() {
        return 'v2';
      },
      make: function() {
        return new THREE.Vector2(x, y);
      },
      validate: function(value, target, invalid) {
        var ref, ref1, xx, yy;
        if (value === +value) {
          value = [value];
        }
        if (value instanceof THREE.Vector2) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          xx = (ref = value.x) != null ? ref : x;
          yy = (ref1 = value.y) != null ? ref1 : y;
          target.set(xx, yy);
        } else {
          return invalid();
        }
        return target;
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y;
      },
      op: function(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        return target;
      }
    };
  },
  ivec2: function(x = 0, y = 0) {
    var validate, vec2;
    vec2 = Types.vec2(x, y);
    validate = vec2.validate;
    vec2.validate = function(value, target, invalid) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      return target;
    };
    return vec2;
  },
  vec3: function(x = 0, y = 0, z = 0) {
    var defaults;
    defaults = [x, y, z];
    return {
      uniform: function() {
        return 'v3';
      },
      make: function() {
        return new THREE.Vector3(x, y, z);
      },
      validate: function(value, target, invalid) {
        var ref, ref1, ref2, xx, yy, zz;
        if (value === +value) {
          value = [value];
        }
        if (value instanceof THREE.Vector3) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          xx = (ref = value.x) != null ? ref : x;
          yy = (ref1 = value.y) != null ? ref1 : y;
          zz = (ref2 = value.z) != null ? ref2 : z;
          target.set(xx, yy, zz);
        } else {
          return invalid();
        }
        return target;
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
      },
      op: function(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        target.z = op(a.z, b.z);
        return target;
      }
    };
  },
  ivec3: function(x = 0, y = 0, z = 0) {
    var validate, vec3;
    vec3 = Types.vec3(x, y, z);
    validate = vec3.validate;
    vec3.validate = function(value, target) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      target.z = Math.round(target.z);
      return target;
    };
    return vec3;
  },
  vec4: function(x = 0, y = 0, z = 0, w = 0) {
    var defaults;
    defaults = [x, y, z, w];
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Vector4(x, y, z, w);
      },
      validate: function(value, target, invalid) {
        var ref, ref1, ref2, ref3, ww, xx, yy, zz;
        if (value === +value) {
          value = [value];
        }
        if (value instanceof THREE.Vector4) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          xx = (ref = value.x) != null ? ref : x;
          yy = (ref1 = value.y) != null ? ref1 : y;
          zz = (ref2 = value.z) != null ? ref2 : z;
          ww = (ref3 = value.w) != null ? ref3 : w;
          target.set(xx, yy, zz, ww);
        } else {
          return invalid();
        }
        return target;
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
      },
      op: function(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        target.z = op(a.z, b.z);
        target.w = op(a.w, b.w);
        return target;
      }
    };
  },
  ivec4: function(x = 0, y = 0, z = 0, w = 0) {
    var validate, vec4;
    vec4 = Types.vec4(x, y, z, w);
    validate = vec4.validate;
    vec4.validate = function(value, target) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      target.z = Math.round(target.z);
      target.w = Math.round(target.w);
      return target;
    };
    return vec4;
  },
  mat3: function(n11 = 1, n12 = 0, n13 = 0, n21 = 0, n22 = 1, n23 = 0, n31 = 0, n32 = 0, n33 = 1) {
    var defaults;
    defaults = [n11, n12, n13, n21, n22, n23, n31, n32, n33];
    return {
      uniform: function() {
        return 'm4';
      },
      make: function() {
        var m;
        m = new THREE.Matrix3();
        m.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
        return m;
      },
      validate: function(value, target, invalid) {
        if (value instanceof THREE.Matrix3) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          return invalid();
        }
        return target;
      }
    };
  },
  mat4: function(n11 = 1, n12 = 0, n13 = 0, n14 = 0, n21 = 0, n22 = 1, n23 = 0, n24 = 0, n31 = 0, n32 = 0, n33 = 1, n34 = 0, n41 = 0, n42 = 0, n43 = 0, n44 = 1) {
    var defaults;
    defaults = [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44];
    return {
      uniform: function() {
        return 'm4';
      },
      make: function() {
        var m;
        m = new THREE.Matrix4();
        m.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
        return m;
      },
      validate: function(value, target, invalid) {
        if (value instanceof THREE.Matrix4) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          return invalid();
        }
        return target;
      }
    };
  },
  quat: function(x = 0, y = 0, z = 0, w = 1) {
    var vec4;
    vec4 = Types.vec4(x, y, z, w);
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Quaternion();
      },
      validate: function(value, target, invalid) {
        if (value instanceof THREE.Quaternion) {
          target.copy(value);
        } else {
          target = vec4.validate(value, target, invalid);
        }
        target.normalize();
        return target;
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
      },
      op: function(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        target.z = op(a.z, b.z);
        target.w = op(a.w, b.w);
        target.normalize();
        return target;
      },
      lerp: function(a, b, target, f) {
        THREE.Quaternion.slerp(a, b, target, f);
        return target;
      }
    };
  },
  color: function(r = .5, g = .5, b = .5) {
    var defaults;
    defaults = [r, g, b];
    return {
      uniform: function() {
        return 'c';
      },
      make: function() {
        return new THREE.Color(r, g, b);
      },
      validate: function(value, target, invalid) {
        var bb, gg, ref, ref1, ref2, rr;
        if (value === "" + value) {
          value = new THREE.Color().setStyle(value);
        } else if (value === +value) {
          value = new THREE.Color(value);
        }
        if (value instanceof THREE.Color) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.setRGB.apply(target, value);
        } else if (value != null) {
          rr = (ref = value.r) != null ? ref : r;
          gg = (ref1 = value.g) != null ? ref1 : g;
          bb = (ref2 = value.b) != null ? ref2 : b;
          target.set(rr, gg, bb);
        } else {
          return invalid();
        }
        return target;
      },
      equals: function(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b;
      },
      op: function(a, b, target, op) {
        target.r = op(a.r, b.r);
        target.g = op(a.g, b.g);
        target.b = op(a.b, b.b);
        return target;
      }
    };
  },
  axis: function(value = 1, allowZero = false) {
    var map, range, v;
    map = {
      x: 1,
      y: 2,
      z: 3,
      w: 4,
      W: 1,
      H: 2,
      D: 3,
      I: 4,
      zero: 0,
      null: 0,
      width: 1,
      height: 2,
      depth: 3,
      items: 4
    };
    range = allowZero ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];
    if ((v = map[value]) != null) {
      value = v;
    }
    return {
      make: function() {
        return value;
      },
      validate: function(value, target, invalid) {
        var ref;
        if ((v = map[value]) != null) {
          value = v;
        }
        value = (ref = Math.round(value)) != null ? ref : 0;
        if (indexOf.call(range, value) >= 0) {
          return value;
        }
        return invalid();
      }
    };
  },
  transpose: function(order = [1, 2, 3, 4]) {
    var axesArray, looseArray;
    looseArray = Types.letters(Types.axis(null, false), 0, order);
    axesArray = Types.letters(Types.axis(null, false), 4, order);
    return {
      make: function() {
        return axesArray.make();
      },
      validate: function(value, target, invalid) {
        var i, letter, missing, temp, unique;
        temp = [1, 2, 3, 4];
        looseArray.validate(value, temp, invalid);
        if (temp.length < 4) {
          missing = [1, 2, 3, 4].filter(function(x) {
            return temp.indexOf(x) === -1;
          });
          temp = temp.concat(missing);
        }
        unique = (function() {
          var j, len, results;
          results = [];
          for (i = j = 0, len = temp.length; j < len; i = ++j) {
            letter = temp[i];
            results.push(temp.indexOf(letter) === i);
          }
          return results;
        })();
        if (unique.indexOf(false) < 0) {
          return axesArray.validate(temp, target, invalid);
        }
        return invalid();
      },
      equals: axesArray.equals,
      clone: axesArray.clone
    };
  },
  swizzle: function(order = [1, 2, 3, 4], size = null) {
    var axesArray, looseArray;
    if (size == null) {
      size = order.length;
    }
    order = order.slice(0, size);
    looseArray = Types.letters(Types.axis(null, false), 0, order);
    axesArray = Types.letters(Types.axis(null, true), size, order);
    return {
      make: function() {
        return axesArray.make();
      },
      validate: function(value, target, invalid) {
        var temp;
        temp = order.slice();
        looseArray.validate(value, temp, invalid);
        if (temp.length < size) {
          temp = temp.concat([0, 0, 0, 0]).slice(0, size);
        }
        return axesArray.validate(temp, target, invalid);
      },
      equals: axesArray.equals,
      clone: axesArray.clone
    };
  },
  classes: function() {
    var stringArray;
    stringArray = Types.array(Types.string());
    return {
      make: function() {
        return stringArray.make();
      },
      validate: function(value, target, invalid) {
        if (value === "" + value) {
          value = value.split(' ');
        }
        value = value.filter(function(x) {
          return !!x.length;
        });
        return stringArray.validate(value, target, invalid);
      },
      equals: stringArray.equals,
      clone: stringArray.clone
    };
  },
  blending: function(value = 'normal') {
    var keys;
    keys = ['no', 'normal', 'add', 'subtract', 'multiply', 'custom'];
    return Types.enum(value, keys);
  },
  filter: function(value = 'nearest') {
    var map;
    map = {
      nearest: THREE.NearestFilter,
      nearestMipMapNearest: THREE.NearestMipMapNearestFilter,
      nearestMipMapLinear: THREE.NearestMipMapLinearFilter,
      linear: THREE.LinearFilter,
      linearMipMapNearest: THREE.LinearMipMapNearestFilter,
      linearMipmapLinear: THREE.LinearMipMapLinearFilter
    };
    return Types.enum(value, [], map);
  },
  type: function(value = 'unsignedByte') {
    var map;
    map = {
      unsignedByte: THREE.UnsignedByteType,
      byte: THREE.ByteType,
      short: THREE.ShortType,
      unsignedShort: THREE.UnsignedShortType,
      int: THREE.IntType,
      unsignedInt: THREE.UnsignedIntType,
      float: THREE.FloatType
    };
    return Types.enum(value, [], map);
  },
  scale: function(value = 'linear') {
    var keys;
    keys = ['linear', 'log'];
    return Types.enum(value, keys);
  },
  mapping: function(value = 'relative') {
    var keys;
    keys = ['relative', 'absolute'];
    return Types.enum(value, keys);
  },
  indexing: function(value = 'original') {
    var keys;
    keys = ['original', 'final'];
    return Types.enum(value, keys);
  },
  shape: function(value = 'circle') {
    var keys;
    keys = ['circle', 'square', 'diamond', 'up', 'down', 'left', 'right'];
    return Types.enum(value, keys);
  },
  join: function(value = 'miter') {
    var keys;
    keys = ['miter', 'round', 'bevel'];
    return Types.enum(value, keys);
  },
  stroke: function(value = 'solid') {
    var keys;
    keys = ['solid', 'dotted', 'dashed'];
    return Types.enum(value, keys);
  },
  vertexPass: function(value = 'view') {
    var keys;
    keys = ['data', 'view', 'world', 'eye'];
    return Types.enum(value, keys);
  },
  fragmentPass: function(value = 'light') {
    var keys;
    keys = ['color', 'light', 'rgba'];
    return Types.enum(value, keys);
  },
  ease: function(value = 'linear') {
    var keys;
    keys = ['linear', 'cosine', 'binary', 'hold'];
    return Types.enum(value, keys);
  },
  fit: function(value = 'contain') {
    var keys;
    keys = ['x', 'y', 'contain', 'cover'];
    return Types.enum(value, keys);
  },
  anchor: function(value = 'middle') {
    var map;
    map = {
      first: 1,
      middle: 0,
      last: -1
    };
    return Types.enumber(value, [], map);
  },
  transitionState: function(value = 'enter') {
    var map;
    map = {
      enter: -1,
      visible: 0,
      exit: 1
    };
    return Types.enumber(value, [], map);
  },
  font: function(value = 'sans-serif') {
    var parse, stringArray;
    parse = Util.JS.parseQuoted;
    if (!(value instanceof Array)) {
      value = parse(value);
    }
    stringArray = Types.array(Types.string(), 0, value);
    return {
      make: function() {
        return stringArray.make();
      },
      validate: function(value, target, invalid) {
        try {
          if (!(value instanceof Array)) {
            value = parse(value);
          }
        } catch (error) {
          return invalid();
        }
        value = value.filter(function(x) {
          return !!x.length;
        });
        return stringArray.validate(value, target, invalid);
      },
      equals: stringArray.equals,
      clone: stringArray.clone
    };
  },
  data: function(value = []) {
    return {
      make: function() {
        return [];
      },
      validate: function(value, target, invalid) {
        if (value instanceof Array) {
          return value;
        } else if ((value != null ? value.length : void 0) != null) {
          return value;
        } else {
          return invalid();
        }
      },
      emitter: function(a, b) {
        return Util.Data.getLerpThunk(a, b);
      }
    };
  }
};

decorate = function(types) {
  var k, type;
  for (k in types) {
    type = types[k];
    types[k] = (function(type) {
      return function() {
        var t;
        t = type.apply(type, arguments);
        if (t.validate == null) {
          t.validate = function(v) {
            return v != null;
          };
        }
        if (t.equals == null) {
          t.equals = function(a, b) {
            return a === b;
          };
        }
        if (t.clone == null) {
          t.clone = function(v) {
            var ref;
            return (ref = v != null ? typeof v.clone === "function" ? v.clone() : void 0 : void 0) != null ? ref : v;
          };
        }
        return t;
      };
    })(type);
  }
  return types;
};

module.exports = decorate(Types);


},{"../../util":190}],131:[function(require,module,exports){
var Cartesian, Util, View;

View = require('./view');

Util = require('../../../util');

Cartesian = (function() {
  class Cartesian extends View {
    make() {
      super.make();
      this.uniforms = {
        viewMatrix: this._attributes.make(this._types.mat4())
      };
      this.viewMatrix = this.uniforms.viewMatrix.value;
      return this.composer = Util.Three.transformComposer();
    }

    unmake() {
      super.unmake();
      delete this.viewMatrix;
      delete this.objectMatrix;
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var dx, dy, dz, e, g, p, q, r, s, sx, sy, sz, transformMatrix, x, y, z;
      if (!(touched['view'] || touched['view3'] || init)) {
        return;
      }
      p = this.props.position;
      s = this.props.scale;
      q = this.props.quaternion;
      r = this.props.rotation;
      g = this.props.range;
      e = this.props.eulerOrder;
      x = g[0].x;
      y = g[1].x;
      z = g[2].x;
      dx = (g[0].y - x) || 1;
      dy = (g[1].y - y) || 1;
      dz = (g[2].y - z) || 1;
      sx = s.x;
      sy = s.y;
      sz = s.z;
      // Forward transform
      this.viewMatrix.set(2 / dx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1); //,
      transformMatrix = this.composer(p, r, q, s, null, e);
      this.viewMatrix.multiplyMatrices(transformMatrix, this.viewMatrix);
      if (changed['view.range']) {
        return this.trigger({
          type: 'view.range'
        });
      }
    }

    vertex(shader, pass) {
      if (pass === 1) {
        shader.pipe('cartesian.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

  };

  Cartesian.traits = ['node', 'object', 'visible', 'view', 'view3', 'vertex'];

  return Cartesian;

}).call(this);

module.exports = Cartesian;


},{"../../../util":190,"./view":137}],132:[function(require,module,exports){
var Cartesian4, View;

View = require('./view');

Cartesian4 = (function() {
  class Cartesian4 extends View {
    make() {
      super.make();
      this.uniforms = {
        basisOffset: this._attributes.make(this._types.vec4()),
        basisScale: this._attributes.make(this._types.vec4())
      };
      this.basisScale = this.uniforms.basisScale.value;
      return this.basisOffset = this.uniforms.basisOffset.value;
    }

    unmake() {
      super.unmake();
      delete this.basisScale;
      delete this.basisOffset;
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var dw, dx, dy, dz, g, mult, p, s, w, x, y, z;
      if (!(touched['view'] || touched['view4'] || init)) {
        return;
      }
      p = this.props.position;
      s = this.props.scale;
      g = this.props.range;
      x = g[0].x;
      y = g[1].x;
      z = g[2].x;
      w = g[3].x;
      dx = (g[0].y - x) || 1;
      dy = (g[1].y - y) || 1;
      dz = (g[2].y - z) || 1;
      dw = (g[3].y - w) || 1;
      mult = function(a, b) {
        a.x *= b.x;
        a.y *= b.y;
        a.z *= b.z;
        return a.w *= b.w;
      };
      // 4D axis adjustment
      this.basisScale.set(2 / dx, 2 / dy, 2 / dz, 2 / dw);
      this.basisOffset.set(-(2 * x + dx) / dx, -(2 * y + dy) / dy, -(2 * z + dz) / dz, -(2 * w + dw) / dw);
      // 4D scale
      mult(this.basisScale, s);
      mult(this.basisOffset, s);
      // 4D position
      this.basisOffset.add(p);
      if (changed['view.range']) {
        return this.trigger({
          type: 'view.range'
        });
      }
    }

    vertex(shader, pass) {
      if (pass === 1) {
        shader.pipe('cartesian4.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

  };

  Cartesian4.traits = ['node', 'object', 'visible', 'view', 'view4', 'vertex'];

  return Cartesian4;

}).call(this);

module.exports = Cartesian4;


},{"./view":137}],133:[function(require,module,exports){
var Polar, Util, View;

View = require('./view');

Util = require('../../../util');

Polar = (function() {
  class Polar extends View {
    make() {
      var types;
      super.make();
      types = this._attributes.types;
      this.uniforms = {
        polarBend: this.node.attributes['polar.bend'],
        polarHelix: this.node.attributes['polar.helix'],
        polarFocus: this._attributes.make(types.number()),
        polarAspect: this._attributes.make(types.number()),
        viewMatrix: this._attributes.make(types.mat4())
      };
      this.viewMatrix = this.uniforms.viewMatrix.value;
      this.composer = Util.Three.transformComposer();
      return this.aspect = 1;
    }

    unmake() {
      super.unmake();
      delete this.viewMatrix;
      delete this.objectMatrix;
      delete this.aspect;
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var ady, aspect, bend, dx, dy, dz, e, fdx, focus, g, helix, idx, p, q, r, s, sdx, sdy, sx, sy, sz, transformMatrix, x, y, z;
      if (!(touched['view'] || touched['view3'] || touched['polar'] || init)) {
        return;
      }
      this.helix = helix = this.props.helix;
      this.bend = bend = this.props.bend;
      this.focus = focus = bend > 0 ? 1 / bend - 1 : 0;
      p = this.props.position;
      s = this.props.scale;
      q = this.props.quaternion;
      r = this.props.rotation;
      g = this.props.range;
      e = this.props.eulerOrder;
      x = g[0].x;
      y = g[1].x;
      z = g[2].x;
      dx = (g[0].y - x) || 1;
      dy = (g[1].y - y) || 1;
      dz = (g[2].y - z) || 1;
      sx = s.x;
      sy = s.y;
      sz = s.z;
      // Watch for negative scales.
      idx = dx > 0 ? 1 : -1;
      // Recenter viewport on origin the more it's bent
      [y, dy] = Util.Axis.recenterAxis(y, dy, bend);
      // Adjust viewport range for polar transform.
      // As the viewport goes polar, the X-range is interpolated to the Y-range instead,
      // creating a square/circular viewport.
      ady = Math.abs(dy);
      fdx = dx + (ady * idx - dx) * bend;
      sdx = fdx / sx;
      sdy = dy / sy;
      this.aspect = aspect = Math.abs(sdx / sdy);
      this.uniforms.polarFocus.value = focus;
      this.uniforms.polarAspect.value = aspect;
      // Forward transform
      this.viewMatrix.set(2 / fdx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1); //,
      transformMatrix = this.composer(p, r, q, s, null, e);
      this.viewMatrix.multiplyMatrices(transformMatrix, this.viewMatrix);
      if (changed['view.range'] || touched['polar']) {
        return this.trigger({
          type: 'view.range'
        });
      }
    }

    vertex(shader, pass) {
      if (pass === 1) {
        shader.pipe('polar.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

    axis(dimension) {
      var max, min, range;
      range = this.props.range[dimension - 1];
      min = range.x;
      max = range.y;
      // Correct Y extents during polar warp.
      if (dimension === 2 && this.bend > 0) {
        max = Math.max(Math.abs(max), Math.abs(min));
        min = Math.max(-this.focus / this.aspect, min);
      }
      return new THREE.Vector2(min, max);
    }

  };

  Polar.traits = ['node', 'object', 'visible', 'view', 'view3', 'polar', 'vertex'];

  return Polar;

}).call(this);

module.exports = Polar;


},{"../../../util":190,"./view":137}],134:[function(require,module,exports){
var Spherical, Util, View;

View = require('./view');

Util = require('../../../util');

Spherical = (function() {
  class Spherical extends View {
    make() {
      var types;
      super.make();
      types = this._attributes.types;
      this.uniforms = {
        sphericalBend: this.node.attributes['spherical.bend'],
        sphericalFocus: this._attributes.make(this._types.number()),
        sphericalAspectX: this._attributes.make(this._types.number()),
        sphericalAspectY: this._attributes.make(this._types.number()),
        sphericalScaleY: this._attributes.make(this._types.number()),
        viewMatrix: this._attributes.make(this._types.mat4())
      };
      this.viewMatrix = this.uniforms.viewMatrix.value;
      this.composer = Util.Three.transformComposer();
      this.aspectX = 1;
      return this.aspectY = 1;
    }

    unmake() {
      super.unmake();
      delete this.viewMatrix;
      delete this.objectMatrix;
      delete this.aspectX;
      delete this.aspectY;
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var adz, aspectX, aspectY, aspectZ, bend, dx, dy, dz, e, fdx, fdy, focus, g, idx, idy, p, q, r, s, scaleY, sdx, sdy, sdz, sx, sy, sz, transformMatrix, x, y, z;
      if (!(touched['view'] || touched['view3'] || touched['spherical'] || init)) {
        return;
      }
      this.bend = bend = this.props.bend;
      this.focus = focus = bend > 0 ? 1 / bend - 1 : 0;
      p = this.props.position;
      s = this.props.scale;
      q = this.props.quaternion;
      r = this.props.rotation;
      g = this.props.range;
      e = this.props.eulerOrder;
      x = g[0].x;
      y = g[1].x;
      z = g[2].x;
      dx = (g[0].y - x) || 1;
      dy = (g[1].y - y) || 1;
      dz = (g[2].y - z) || 1;
      sx = s.x;
      sy = s.y;
      sz = s.z;
      // Recenter viewport on origin the more it's bent
      [y, dy] = Util.Axis.recenterAxis(y, dy, bend);
      [z, dz] = Util.Axis.recenterAxis(z, dz, bend);
      // Watch for negative scales.
      idx = dx > 0 ? 1 : -1;
      idy = dy > 0 ? 1 : -1;
      // Adjust viewport range for spherical transform.
      // As the viewport goes spherical, the X/Y-ranges are interpolated to the Z-range,
      // creating a perfectly spherical viewport.
      adz = Math.abs(dz);
      fdx = dx + (adz * idx - dx) * bend;
      fdy = dy + (adz * idy - dy) * bend;
      sdx = fdx / sx;
      sdy = fdy / sy;
      sdz = dz / sz;
      this.aspectX = aspectX = Math.abs(sdx / sdz);
      this.aspectY = aspectY = Math.abs(sdy / sdz / aspectX);
      // Scale Y coordinates before transforming, but cap at aspectY/alpha to prevent from poking through the poles mid-transform.
      // See shaders/glsl/spherical.position.glsl
      aspectZ = dy / dx * sx / sy * 2; // Factor of 2 due to the fact that in the Y direction we only go 180º from pole to pole.
      this.scaleY = scaleY = Math.min(aspectY / bend, 1 + (aspectZ - 1) * bend);
      this.uniforms.sphericalBend.value = bend;
      this.uniforms.sphericalFocus.value = focus;
      this.uniforms.sphericalAspectX.value = aspectX;
      this.uniforms.sphericalAspectY.value = aspectY;
      this.uniforms.sphericalScaleY.value = scaleY;
      // Forward transform
      this.viewMatrix.set(2 / fdx, 0, 0, -(2 * x + dx) / dx, 0, 2 / fdy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1); //,
      transformMatrix = this.composer(p, r, q, s, null, e);
      this.viewMatrix.multiplyMatrices(transformMatrix, this.viewMatrix);
      if (changed['view.range'] || touched['spherical']) {
        return this.trigger({
          type: 'view.range'
        });
      }
    }

    vertex(shader, pass) {
      if (pass === 1) {
        shader.pipe('spherical.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

    axis(dimension) {
      var max, min, range;
      range = this.props.range[dimension - 1];
      min = range.x;
      max = range.y;
      // Correct Z extents during polar warp.
      if (dimension === 3 && this.bend > 0) {
        max = Math.max(Math.abs(max), Math.abs(min));
        min = Math.max(-this.focus / this.aspectX + .001, min);
      }
      return new THREE.Vector2(min, max);
    }

  };

  Spherical.traits = ['node', 'object', 'visible', 'view', 'view3', 'spherical', 'vertex'];

  return Spherical;

}).call(this);

module.exports = Spherical;


},{"../../../util":190,"./view":137}],135:[function(require,module,exports){
var Stereographic, Util, View;

View = require('./view');

Util = require('../../../util');

Stereographic = (function() {
  class Stereographic extends View {
    make() {
      var types;
      super.make();
      types = this._attributes.types;
      this.uniforms = {
        stereoBend: this.node.attributes['stereographic.bend'],
        viewMatrix: this._attributes.make(this._types.mat4())
      };
      this.viewMatrix = this.uniforms.viewMatrix.value;
      return this.composer = Util.Three.transformComposer();
    }

    unmake() {
      super.unmake();
      delete this.viewMatrix;
      delete this.rotationMatrix;
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var bend, dx, dy, dz, e, g, p, q, r, s, sx, sy, sz, transformMatrix, x, y, z;
      if (!(touched['view'] || touched['view3'] || touched['stereographic'] || init)) {
        return;
      }
      this.bend = bend = this.props.bend;
      p = this.props.position;
      s = this.props.scale;
      q = this.props.quaternion;
      r = this.props.rotation;
      g = this.props.range;
      e = this.props.eulerOrder;
      x = g[0].x;
      y = g[1].x;
      z = g[2].x;
      dx = (g[0].y - x) || 1;
      dy = (g[1].y - y) || 1;
      dz = (g[2].y - z) || 1;
      sx = s.x;
      sy = s.y;
      sz = s.z;
      // Recenter viewport on projection point the more it's bent
      [z, dz] = Util.Axis.recenterAxis(z, dz, bend, 1);
      this.uniforms.stereoBend.value = bend;
      // Forward transform
      this.viewMatrix.set(2 / dx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1); //,
      transformMatrix = this.composer(p, r, q, s, null, e);
      this.viewMatrix.multiplyMatrices(transformMatrix, this.viewMatrix);
      if (changed['view.range'] || touched['stereographic']) {
        return this.trigger({
          type: 'view.range'
        });
      }
    }

    vertex(shader, pass) {
      if (pass === 1) {
        shader.pipe('stereographic.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

  };

  Stereographic.traits = ['node', 'object', 'visible', 'view', 'view3', 'stereographic', 'vertex'];

  return Stereographic;

}).call(this);

module.exports = Stereographic;


},{"../../../util":190,"./view":137}],136:[function(require,module,exports){
var Stereographic4, Util, View;

View = require('./view');

Util = require('../../../util');

Stereographic4 = (function() {
  class Stereographic4 extends View {
    make() {
      super.make();
      this.uniforms = {
        basisOffset: this._attributes.make(this._types.vec4()),
        basisScale: this._attributes.make(this._types.vec4()),
        stereoBend: this.node.attributes['stereographic.bend']
      };
      this.basisScale = this.uniforms.basisScale.value;
      return this.basisOffset = this.uniforms.basisOffset.value;
    }

    unmake() {
      super.unmake();
      delete this.basisScale;
      delete this.basisOffset;
      return delete this.uniforms;
    }

    change(changed, touched, init) {
      var bend, dw, dx, dy, dz, g, mult, p, s, w, x, y, z;
      if (!(touched['view'] || touched['view4'] || touched['stereographic'] || init)) {
        return;
      }
      this.bend = bend = this.props.bend;
      p = this.props.position;
      s = this.props.scale;
      g = this.props.range;
      x = g[0].x;
      y = g[1].x;
      z = g[2].x;
      w = g[3].x;
      dx = (g[0].y - x) || 1;
      dy = (g[1].y - y) || 1;
      dz = (g[2].y - z) || 1;
      dw = (g[3].y - w) || 1;
      mult = function(a, b) {
        a.x *= b.x;
        a.y *= b.y;
        a.z *= b.z;
        return a.w *= b.w;
      };
      // Recenter viewport on projection point the more it's bent
      [w, dw] = Util.Axis.recenterAxis(w, dw, bend, 1);
      // 4D axis adjustment
      this.basisScale.set(2 / dx, 2 / dy, 2 / dz, 2 / dw);
      this.basisOffset.set(-(2 * x + dx) / dx, -(2 * y + dy) / dy, -(2 * z + dz) / dz, -(2 * w + dw) / dw);
      // 4D scale
      mult(this.basisScale, s);
      mult(this.basisOffset, s);
      // 4D position
      this.basisOffset.add(p);
      if (changed['view.range'] || touched['stereographic']) {
        return this.trigger({
          type: 'view.range'
        });
      }
    }

    vertex(shader, pass) {
      if (pass === 1) {
        shader.pipe('stereographic4.position', this.uniforms);
      }
      return super.vertex(shader, pass);
    }

  };

  Stereographic4.traits = ['node', 'object', 'visible', 'view', 'view4', 'stereographic', 'vertex'];

  return Stereographic4;

}).call(this);

module.exports = Stereographic4;


},{"../../../util":190,"./view":137}],137:[function(require,module,exports){
var Transform, View;

Transform = require('../transform/transform');

View = (function() {
  class View extends Transform {
    make() {
      return this._helpers.visible.make();
    }

    unmake() {
      return this._helpers.visible.unmake();
    }

    axis(dimension) {
      return this.props.range[dimension - 1];
    }

  };

  View.traits = ['node', 'object', 'visible', 'view', 'vertex'];

  return View;

}).call(this);

module.exports = View;


},{"../transform/transform":126}],138:[function(require,module,exports){
var ArrayBuffer_, DataBuffer, Util;

DataBuffer = require('./databuffer');

Util = require('../../util');

/*
 * 1D + history array
 */
ArrayBuffer_ = class ArrayBuffer_ extends DataBuffer {
  constructor(renderer, shaders, options) {
    var history, width;
    width = options.width || 1;
    history = options.history || 1;
    options.width = width;
    options.height = history;
    options.depth = 1;
    super(renderer, shaders, options, false);
    this.width = width;
    this.history = history;
    this.samples = width;
    this.wrap = history > 1;
    this.build(options);
  }

  build(options) {
    super.build();
    this.index = 0;
    this.pad = 0;
    return this.streamer = this.generate(this.data);
  }

  setActive(i) {
    return this.pad = Math.max(0, this.width - i);
  }

  fill() {
    var callback, count, done, emit, i, limit, reset, skip;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    ({emit, skip, count, done, reset} = this.streamer);
    reset();
    limit = this.samples - this.pad;
    i = 0;
    while (!done() && i < limit && callback(emit, i++) !== false) {
      true;
    }
    return Math.floor(count() / this.items);
  }

  write(n = this.samples) {
    n *= this.items;
    this.texture.write(this.data, 0, this.index, n, 1);
    this.dataPointer.set(.5, this.index + .5);
    this.index = (this.index + this.history - 1) % this.history;
    return this.filled = Math.min(this.history, this.filled + 1);
  }

  through(callback, target) {
    var consume, done, dst, emit, i, pipe, src;
    ({consume, done} = src = this.streamer);
    ({emit} = dst = target.streamer);
    i = 0;
    pipe = function() {
      return consume(function(x, y, z, w) {
        return callback(emit, x, y, z, w, i);
      });
    };
    pipe = Util.Data.repeatCall(pipe, this.items);
    return () => {
      var limit;
      src.reset();
      dst.reset();
      limit = this.samples - this.pad;
      i = 0;
      while (!done() && i < limit) {
        pipe();
        i++;
      }
      return src.count();
    };
  }

};

module.exports = ArrayBuffer_;


},{"../../util":190,"./databuffer":141}],139:[function(require,module,exports){
var Atlas, BackedTexture, DataTexture, Renderable, Row, Util;

Renderable = require('../renderable');

Util = require('../../util');

DataTexture = require('./texture/datatexture');

BackedTexture = require('./texture/backedtexture');

/*
 * Dynamic sprite atlas
 *
 * - Allocates variable-sized sprites in rows
 * - Will grow itself when full
 */
Atlas = class Atlas extends Renderable {
  constructor(renderer, shaders, options, build = true) {
    super(renderer, shaders);
    if (this.width == null) {
      this.width = options.width || 512;
    }
    if (this.height == null) {
      this.height = options.height || 512;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    if (this.backed == null) {
      this.backed = options.backed || false;
    }
    this.samples = this.width * this.height;
    if (build) {
      this.build(options);
    }
  }

  shader(shader) {
    shader.pipe("map.2d.data", this.uniforms);
    shader.pipe("sample.2d", this.uniforms);
    if (this.channels < 4) {
      shader.pipe(Util.GLSL.swizzleVec4(['0000', 'x000', 'xw00', 'xyz0'][this.channels]));
    }
    return shader;
  }

  build(options) {
    var klass;
    this.klass = klass = this.backed ? BackedTexture : DataTexture;
    this.texture = new klass(this.gl, this.width, this.height, this.channels, options);
    this.uniforms = {
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2(0, 0)
      }
    };
    this._adopt(this.texture.uniforms);
    return this.reset();
  }

  reset() {
    this.rows = [];
    return this.bottom = 0;
  }

  resize(width, height) {
    if (!this.backed) {
      throw new Error("Cannot resize unbacked texture atlas");
    }
    if (width > 2048 && height > 2048) {
      console.warn(`Giant text atlas ${width}x${height}.`);
    } else {
      console.info(`Resizing text atlas ${width}x${height}.`);
    }
    this.texture.resize(width, height);
    this.width = width;
    this.height = height;
    return this.samples = width * height;
  }

  collapse(row) {
    var ref, ref1, rows;
    rows = this.rows;
    rows.splice(rows.indexOf(row), 1);
    this.bottom = (ref = (ref1 = rows[rows.length - 1]) != null ? ref1.bottom : void 0) != null ? ref : 0;
    if (this.last === row) {
      return this.last = null;
    }
  }

  allocate(key, width, height, emit) {
    var bottom, gap, h, i, index, j, len, max, ref, row, top, w;
    w = this.width;
    h = this.height;
    max = height * 2;
    if (width > w) {
      this.resize(w * 2, h * 2);
      this.last = null;
      // Try again
      return this.allocate(key, width, height, emit);
    }
    // See if we can append to the last used row (fast code path)
    row = this.last;
    if (row != null) {
      if (row.height >= height && row.height < max && row.width + width <= w) {
        row.append(key, width, height, emit);
        return;
      }
    }
    // Scan all rows and append to the first suitable one (slower code path)
    bottom = 0;
    index = -1;
    top = 0;
    ref = this.rows;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      row = ref[i];
      // Measure gap between rows
      // Note suitable holes for later
      gap = row.top - bottom;
      if (gap >= height && index < 0) {
        index = i;
        top = bottom;
      }
      bottom = row.bottom;
      if (row.height >= height && row.height < max && row.width + width <= w) {
        row.append(key, width, height, emit);
        this.last = row;
        return;
      }
    }
    // New row (slowest path)
    if (index >= 0) {
      // Fill a gap
      row = new Row(top, height);
      this.rows.splice(index, 0, row);
    } else {
      // Append to bottom
      //console.log 'fill gap', row
      top = bottom;
      bottom += height;
      // Resize if atlas is full
      if (bottom >= h) {
        this.resize(w * 2, h * 2);
        this.last = null;
        // Try again
        return this.allocate(key, width, height, emit);
      }
      // Add new row to the end
      row = new Row(top, height);
      this.rows.push(row);
      this.bottom = bottom;
    }
    row.append(key, width, height, emit);
    this.last = row;
  }

  read() {
    return this.texture.textureObject;
  }

  write(data, x, y, w, h) {
    return this.texture.write(data, x, y, w, h);
  }

  dispose() {
    this.texture.dispose();
    this.data = null;
    return super.dispose();
  }

};

Row = class Row {
  constructor(top, height) {
    this.top = top;
    this.bottom = top + height;
    this.width = 0;
    this.height = height;
    this.alive = 0;
    this.keys = [];
  }

  append(key, width, height, emit) {
    var x, y;
    x = this.width;
    y = this.top;
    this.alive++;
    this.width += width;
    this.keys.push(key);
    return emit(this, x, y);
  }

};

module.exports = Atlas;


},{"../../util":190,"../renderable":176,"./texture/backedtexture":148,"./texture/datatexture":149}],140:[function(require,module,exports){
var Buffer, Renderable, Util;

Renderable = require('../renderable');

Util = require('../../util');

/*
 * Base class for sample buffers
 */
Buffer = class Buffer extends Renderable {
  constructor(renderer, shaders, options) {
    super(renderer, shaders);
    if (this.items == null) {
      this.items = options.items || 1;
    }
    if (this.samples == null) {
      this.samples = options.samples || 1;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    if (this.callback == null) {
      this.callback = options.callback || function() {};
    }
  }

  dispose() {
    return super.dispose();
  }

  update() {
    var n;
    n = this.fill();
    this.write(n);
    return n;
  }

  setActive(i, j, k, l) {}

  setCallback(callback) {
    this.callback = callback;
  }

  write() {}

  fill() {}

  generate(data) {
    return Util.Data.getStreamer(data, this.samples, this.channels, this.items);
  }

};

module.exports = Buffer;


},{"../../util":190,"../renderable":176}],141:[function(require,module,exports){
var Buffer, DataBuffer, DataTexture, Util;

Buffer = require('./buffer');

DataTexture = require('./texture/datatexture');

Util = require('../../util');

/*
 * Data buffer on the GPU
 * - Stores samples (1-n) x items (1-n) x channels (1-4)
 * - Provides generic sampler shader
 * - Provides generic copy/write handler
 * => specialized into Array/Matrix/VoxelBuffer
 */
DataBuffer = class DataBuffer extends Buffer {
  constructor(renderer, shaders, options, build = true) {
    var depth, height, samples, width;
    width = options.width || 1;
    height = options.height || 1;
    depth = options.depth || 1;
    samples = width * height * depth;
    options.samples || (options.samples = samples);
    super(renderer, shaders, options);
    this.width = width;
    this.height = height;
    this.depth = depth;
    if (this.samples == null) {
      this.samples = samples;
    }
    if (build) {
      this.build(options);
    }
  }

  shader(shader, indices = 4) {
    var wrap;
    if (this.items > 1 || this.depth > 1) {
      if (indices !== 4) {
        shader.pipe(Util.GLSL.extendVec(indices, 4));
      }
      shader.pipe('map.xyzw.texture', this.uniforms);
    } else {
      if (indices !== 2) {
        shader.pipe(Util.GLSL.truncateVec(indices, 2));
      }
    }
    wrap = this.wrap ? '.wrap' : '';
    shader.pipe(`map.2d.data${wrap}`, this.uniforms);
    shader.pipe("sample.2d", this.uniforms);
    if (this.channels < 4) {
      shader.pipe(Util.GLSL.swizzleVec4(['0000', 'x000', 'xw00', 'xyz0'][this.channels]));
    }
    return shader;
  }

  build(options) {
    this.data = new Float32Array(this.samples * this.channels * this.items);
    this.texture = new DataTexture(this.gl, this.items * this.width, this.height * this.depth, this.channels, options);
    this.filled = 0;
    this.used = 0;
    this._adopt(this.texture.uniforms);
    this._adopt({
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2()
      },
      textureItems: {
        type: 'f',
        value: this.items
      },
      textureHeight: {
        type: 'f',
        value: this.height
      }
    });
    this.dataPointer = this.uniforms.dataPointer.value;
    return this.streamer = this.generate(this.data);
  }

  dispose() {
    this.data = null;
    this.texture.dispose();
    return super.dispose();
  }

  getFilled() {
    return this.filled;
  }

  setCallback(callback1) {
    this.callback = callback1;
    return this.filled = 0;
  }

  copy(data) {
    var d, i, j, n, ref;
    n = Math.min(data.length, this.samples * this.channels * this.items);
    d = this.data;
    for (i = j = 0, ref = n; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      d[i] = data[i];
    }
    return this.write(Math.ceil(n / this.channels / this.items));
  }

  write(n = this.samples) {
    var height, width;
    height = n / this.width;
    n *= this.items;
    width = height < 1 ? n : this.items * this.width;
    height = Math.ceil(height);
    this.texture.write(this.data, 0, 0, width, height);
    this.dataPointer.set(.5, .5);
    this.filled = 1;
    return this.used = n;
  }

  through(callback, target) {
    var consume, done, dst, emit, i, pipe, src;
    ({consume, done} = src = this.streamer);
    ({emit} = dst = target.streamer);
    i = 0;
    pipe = function() {
      return consume(function(x, y, z, w) {
        return callback(emit, x, y, z, w, i);
      });
    };
    pipe = Util.Data.repeatCall(pipe, this.items);
    return () => {
      var limit;
      src.reset();
      dst.reset();
      limit = this.used;
      i = 0;
      while (!done() && i < limit) {
        pipe();
        i++;
      }
      return src.count();
    };
  }

};

module.exports = DataBuffer;


},{"../../util":190,"./buffer":140,"./texture/datatexture":149}],142:[function(require,module,exports){
var DataBuffer, MatrixBuffer, Util;

DataBuffer = require('./databuffer');

Util = require('../../util');

/*
 * 2D + history array
 */
MatrixBuffer = class MatrixBuffer extends DataBuffer {
  constructor(renderer, shaders, options) {
    var height, history, width;
    width = options.width || 1;
    height = options.height || 1;
    history = options.history || 1;
    options.depth = history;
    super(renderer, shaders, options, false);
    this.width = width;
    this.height = height;
    this.history = history;
    this.samples = width * height;
    this.wrap = history > 1;
    this.build(options);
  }

  build(options) {
    super.build();
    this.index = 0;
    this.pad = {
      x: 0,
      y: 0
    };
    return this.streamer = this.generate(this.data);
  }

  getFilled() {
    return this.filled;
  }

  setActive(i, j) {
    return [this.pad.x, this.pad.y] = [Math.max(0, this.width - i), Math.max(0, this.height - j)];
  }

  fill() {
    var callback, count, done, emit, i, j, k, limit, n, pad, repeat, reset, skip;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    ({emit, skip, count, done, reset} = this.streamer);
    reset();
    n = this.width;
    pad = this.pad.x;
    limit = this.samples - this.pad.y * n;
    i = j = k = 0;
    if (pad) {
      while (!done() && k < limit) {
        k++;
        repeat = callback(emit, i, j);
        if (++i === n - pad) {
          skip(pad);
          i = 0;
          j++;
        }
        if (repeat === false) {
          break;
        }
      }
    } else {
      while (!done() && k < limit) {
        k++;
        repeat = callback(emit, i, j);
        if (++i === n) {
          i = 0;
          j++;
        }
        if (repeat === false) {
          break;
        }
      }
    }
    return Math.floor(count() / this.items);
  }

  write(n = this.samples) {
    var height, width;
    n *= this.items;
    width = this.width * this.items;
    height = Math.ceil(n / width);
    this.texture.write(this.data, 0, this.index * this.height, width, height);
    this.dataPointer.set(.5, this.index * this.height + .5);
    this.index = (this.index + this.history - 1) % this.history;
    return this.filled = Math.min(this.history, this.filled + 1);
  }

  through(callback, target) {
    var consume, done, dst, emit, i, j, pipe, src;
    ({consume, done} = src = this.streamer);
    ({emit} = dst = target.streamer);
    i = j = 0;
    pipe = function() {
      return consume(function(x, y, z, w) {
        return callback(emit, x, y, z, w, i, j);
      });
    };
    pipe = Util.Data.repeatCall(pipe, this.items);
    return () => {
      var k, limit, n, pad;
      src.reset();
      dst.reset();
      n = this.width;
      pad = this.pad.x;
      limit = this.samples - this.pad.y * n;
      i = j = k = 0;
      if (pad) {
        while (!done() && k < limit) {
          k++;
          pipe();
          if (++i === n - pad) {
            skip(pad);
            i = 0;
            j++;
          }
        }
      } else {
        while (!done() && k < limit) {
          k++;
          pipe();
          if (++i === n) {
            i = 0;
            j++;
          }
        }
      }
      return src.count();
    };
  }

};

module.exports = MatrixBuffer;


},{"../../util":190,"./databuffer":141}],143:[function(require,module,exports){
var Memo, RenderToTexture, Renderable, Util;

Renderable = require('../renderable');

RenderToTexture = require('./rendertotexture');

Util = require('../../util');

/*
 * Wrapped RTT for memoizing 4D arrays back to a 2D texture
 */
Memo = class Memo extends RenderToTexture {
  constructor(renderer, shaders, options) {
    var _height, _width, channels, depth, height, items, width;
    items = options.items || 1;
    channels = options.channels || 4;
    width = options.width || 1;
    height = options.height || 1;
    depth = options.depth || 1;
    //options.format = [null, THREE.LuminanceFormat, THREE.LuminanceAlphaFormat, THREE.RGBFormat, THREE.RGBAFormat][@channels]
    options.format = THREE.RGBAFormat;
    options.width = _width = items * width;
    options.height = _height = height * depth;
    options.frames = 1;
    delete options.items;
    delete options.depth;
    delete options.channels;
    super(renderer, shaders, options);
    if (this.items == null) {
      this.items = items;
    }
    if (this.channels == null) {
      this.channels = channels;
    }
    if (this.width == null) {
      this.width = width;
    }
    this._width = _width;
    if (this.height == null) {
      this.height = height;
    }
    this._height = _height;
    if (this.depth == null) {
      this.depth = depth;
    }
    this._adopt({
      textureItems: {
        type: 'f',
        value: this.items
      },
      textureHeight: {
        type: 'f',
        value: this.height
      }
    });
  }

  shaderAbsolute(shader) {
    if (shader == null) {
      shader = this.shaders.shader();
    }
    shader.pipe('map.xyzw.texture', this.uniforms);
    return super.shaderAbsolute(shader, 1, 2);
  }

};

//shader.pipe Util.GLSL.swizzleVec4 ['0000', 'x000', 'xw00', 'xyz0'][@channels] if @channels < 4
module.exports = Memo;


},{"../../util":190,"../renderable":176,"./rendertotexture":146}],144:[function(require,module,exports){
var Buffer, PushBuffer, Util;

Buffer = require('./buffer');

Util = require('../../util');

/*
 * Buffer for CPU-side use
 */
PushBuffer = class PushBuffer extends Buffer {
  constructor(renderer, shaders, options) {
    var depth, height, samples, width;
    width = options.width || 1;
    height = options.height || 1;
    depth = options.depth || 1;
    samples = width * height * depth;
    options.samples || (options.samples = samples);
    super(renderer, shaders, options);
    this.width = width;
    this.height = height;
    this.depth = depth;
    if (this.samples == null) {
      this.samples = samples;
    }
    this.build(options);
  }

  build(options) {
    this.data = [];
    this.data.length = this.samples;
    this.filled = 0;
    this.pad = {
      x: 0,
      y: 0,
      z: 0
    };
    return this.streamer = this.generate(this.data);
  }

  dispose() {
    this.data = null;
    return super.dispose();
  }

  getFilled() {
    return this.filled;
  }

  setActive(i, j, k) {
    return [this.pad.x, this.pad.y, this.pad.z] = [this.width - i, this.height - j, this.depth - k];
  }

  read() {
    return this.data;
  }

  copy(data) {
    var d, i, n, p, ref, results;
    n = Math.min(data.length, this.samples);
    d = this.data;
    results = [];
    for (i = p = 0, ref = n; (0 <= ref ? p < ref : p > ref); i = 0 <= ref ? ++p : --p) {
      results.push(d[i] = data[i]);
    }
    return results;
  }

  fill() {
    var callback, count, done, emit, i, j, k, l, limit, m, n, o, padX, padY, repeat, reset, skip;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    ({emit, skip, count, done, reset} = this.streamer);
    reset();
    n = this.width;
    m = this.height;
    o = this.depth;
    padX = this.pad.x;
    padY = this.pad.y;
    limit = this.samples - this.pad.z * n * m;
    i = j = k = l = 0;
    if (padX > 0 || padY > 0) {
      while (!done() && l < limit) {
        l++;
        repeat = callback(emit, i, j, k);
        if (++i === n - padX) {
          skip(padX);
          i = 0;
          if (++j === m - padY) {
            skip(n * padY);
            j = 0;
            k++;
          }
        }
        if (repeat === false) {
          break;
        }
      }
    } else {
      while (!done() && l < limit) {
        l++;
        repeat = callback(emit, i, j, k);
        if (++i === n) {
          i = 0;
          if (++j === m) {
            j = 0;
            k++;
          }
        }
        if (repeat === false) {
          break;
        }
      }
    }
    this.filled = 1;
    return count();
  }

};

module.exports = PushBuffer;


},{"../../util":190,"./buffer":140}],145:[function(require,module,exports){
var Buffer, Memo, MemoScreen, Readback, Renderable, Util;

Renderable = require('../renderable');

Buffer = require('./buffer');

Memo = require('./memo');

MemoScreen = require('../meshes/memoscreen');

Util = require('../../util');

/*
 * Readback up to 4D array of up to 4D data from GL
 */
Readback = class Readback extends Renderable {
  constructor(renderer, shaders, options) {
    super(renderer, shaders);
    if (this.items == null) {
      this.items = options.items || 1;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    if (this.width == null) {
      this.width = options.width || 1;
    }
    if (this.height == null) {
      this.height = options.height || 1;
    }
    if (this.depth == null) {
      this.depth = options.depth || 1;
    }
    if (this.type == null) {
      this.type = options.type || THREE.FloatType;
    }
    if (this.stpq == null) {
      this.stpq = options.stpq || false;
    }
    this.isFloat = this.type === THREE.FloatType;
    this.active = this.sampled = this.rect = this.pad = null;
    this.build(options);
  }

  /*
   * log precision
  gl = @gl
  for name, pass of {Vertex: gl.VERTEX_SHADER, Fragment: gl.FRAGMENT_SHADER}
    bits = for prec in [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT]
      gl.getShaderPrecisionFormat(pass, prec).precision
    console.log name, 'shader precision',  bits
   */
  build(options) {
    var channels, depth, encoder, h, height, indexer, isIndexed, items, map, sampler, stpq, stretch, w, width;
    map = options.map;
    indexer = options.indexer;
    isIndexed = (indexer != null) && !indexer.empty();
    ({items, width, height, depth, stpq} = this);
    sampler = map;
    if (isIndexed) {
      // Preserve original xyzw offset of datapoint to tie it back to the source

      // Modulus to pack xyzw into a single integer index
      this._adopt({
        indexModulus: {
          type: 'v4',
          value: new THREE.Vector4(items, items * width, items * width * height, 1)
        }
      });
      // Build shader to pack XYZ + index into a single RGBA
      sampler = this.shaders.shader();
      sampler.require(map);
      sampler.require(indexer);
      //sampler.require Util.GLSL.identity 'vec4'
      sampler.pipe('float.index.pack', this.uniforms);
    }
    if (this.isFloat && this.channels > 1) {
      // Memoize multi-channel float data into float buffer first
      this.floatMemo = new Memo(this.renderer, this.shaders, {
        items: items,
        channels: 4, // non-RGBA render target not supported
        width: width,
        height: height,
        depth: depth,
        history: 0,
        type: THREE.FloatType
      });
      this.floatCompose = new MemoScreen(this.renderer, this.shaders, {
        map: sampler,
        items: items,
        width: width,
        height: height,
        depth: depth,
        stpq: stpq
      });
      this.floatMemo.adopt(this.floatCompose);
      // Second pass won't need texture coordinates
      stpq = false;
      // Replace sampler with memoized sampler
      sampler = this.shaders.shader();
      this.floatMemo.shaderAbsolute(sampler);
    }
    if (this.isFloat) {
      // Encode float data into byte buffer
      stretch = this.channels;
      channels = 4; // one 32-bit float per pixel
    } else {
      // Render byte data directly
      stretch = 1;
      channels = this.channels;
    }
    if (stretch > 1) {
      // Stretch horizontally, sampling once per channel
      encoder = this.shaders.shader();
      encoder.pipe(Util.GLSL.mapByte2FloatOffset(stretch));
      encoder.require(sampler);
      encoder.pipe('float.stretch');
      encoder.pipe('float.encode');
      sampler = encoder;
    } else if (this.isFloat) {
      // Direct sampling
      encoder = this.shaders.shader();
      encoder.pipe(sampler);
      encoder.pipe(Util.GLSL.truncateVec4(4, 1));
      encoder.pipe('float.encode');
      sampler = encoder;
    }
    // Memoize byte data
    this.byteMemo = new Memo(this.renderer, this.shaders, {
      items: items * stretch,
      channels: 4, // non-RGBA render target not supported
      width: width,
      height: height,
      depth: depth,
      history: 0,
      type: THREE.UnsignedByteType
    });
    this.byteCompose = new MemoScreen(this.renderer, this.shaders, {
      map: sampler,
      items: items * stretch,
      width: width,
      height: height,
      depth: depth,
      stpq: stpq
    });
    this.byteMemo.adopt(this.byteCompose);
    // CPU-side buffers
    w = items * width * stretch;
    h = height * depth;
    this.samples = this.width * this.height * this.depth;
    this.bytes = new Uint8Array(w * h * 4); // non-RGBA render target not supported
    if (this.isFloat) {
      this.floats = new Float32Array(this.bytes.buffer);
    }
    this.data = this.isFloat ? this.floats : this.bytes;
    this.streamer = this.generate(this.data);
    this.active = {
      items: 0,
      width: 0,
      height: 0,
      depth: 0
    };
    this.sampled = {
      items: 0,
      width: 0,
      height: 0,
      depth: 0
    };
    this.rect = {
      w: 0,
      h: 0
    };
    this.pad = {
      x: 0,
      y: 0,
      z: 0,
      w: 0
    };
    this.stretch = stretch;
    this.isIndexed = isIndexed;
    return this.setActive(items, width, height, depth);
  }

  generate(data) {
    return Util.Data.getStreamer(data, this.samples, 4, this.items); // non-RGBA render target not supported
  }

  setActive(items, width, height, depth) {
    var h, ref, ref1, w;
    if (!(items !== this.active.items || width !== this.active.width || height !== this.active.height || depth !== this.active.depth)) {
      return;
    }
    // Actively sampled area
    [this.active.items, this.active.width, this.active.height, this.active.depth] = [items, width, height, depth];
    // Render only necessary samples in RTTs
    if ((ref = this.floatCompose) != null) {
      ref.cover(width, height, depth);
    }
    if ((ref1 = this.byteCompose) != null) {
      ref1.cover(width * this.stretch, height, depth);
    }
    // Calculate readback buffer geometry
    items = this.items;
    width = this.active.width;
    height = this.depth === 1 ? this.active.height : this.height;
    depth = this.active.depth;
    w = items * width * this.stretch;
    h = height * depth;
    // Calculate array paddings on readback
    [this.sampled.items, this.sampled.width, this.sampled.height, this.sampled.depth] = [items, width, height, depth];
    [this.rect.w, this.rect.h] = [w, h];
    return [this.pad.x, this.pad.y, this.pad.z, this.pad.w] = [this.sampled.width - this.active.width, this.sampled.height - this.active.height, this.sampled.depth - this.active.depth, this.sampled.items - this.active.items];
  }

  update(camera) {
    var ref, ref1;
    if ((ref = this.floatMemo) != null) {
      ref.render(camera);
    }
    return (ref1 = this.byteMemo) != null ? ref1.render(camera) : void 0;
  }

  post() {
    this.renderer.setRenderTarget(this.byteMemo.target.write);
    return this.gl.readPixels(0, 0, this.rect.w, this.rect.h, gl.RGBA, gl.UNSIGNED_BYTE, this.bytes);
  }

  readFloat(n) {
    var ref;
    return (ref = this.floatMemo) != null ? ref.read(n) : void 0;
  }

  readByte(n) {
    var ref;
    return (ref = this.byteMemo) != null ? ref.read(n) : void 0;
  }

  setCallback(callback) {
    return this.emitter = this.callback(callback);
  }

  callback(callback) {
    var f, m, n, o, p;
    if (!this.isIndexed) {
      return callback;
    }
    n = this.width;
    m = this.height;
    o = this.depth;
    p = this.items;
    // Decode packed index
    f = function(x, y, z, w) {
      var idx, ii, jj, kk, ll;
      idx = w;
      ll = idx % p;
      idx = (idx - ll) / p;
      ii = idx % n;
      idx = (idx - ii) / n;
      jj = idx % m;
      idx = (idx - jj) / m;
      kk = idx;
      return callback(x, y, z, w, ii, jj, kk, ll);
    };
    f.reset = function() {
      return typeof callback.reset === "function" ? callback.reset() : void 0;
    };
    return f;
  }

  iterate() {
    var callback, consume, count, done, emit, i, j, k, l, limit, m, n, o, p, padW, padX, padY, padZ, repeat, reset, skip;
    emit = this.emitter;
    if (typeof emit.reset === "function") {
      emit.reset();
    }
    ({consume, skip, count, done, reset} = this.streamer);
    reset();
    n = this.sampled.width | 0;
    m = this.sampled.height | 0;
    o = this.sampled.depth | 0;
    p = this.sampled.items | 0;
    padX = this.pad.x | 0;
    padY = this.pad.y | 0;
    padZ = this.pad.z | 0;
    padW = this.pad.w | 0;
    limit = n * m * p * (o - padZ);
    if (!this.isIndexed) {
      callback = emit;
      emit = function(x, y, z, w) {
        return callback(x, y, z, w, i, j, k, l);
      };
    }
    i = j = k = l = m = 0;
    while (!done() && m < limit) {
      m++;
      repeat = consume(emit);
      if (++l === p - padW) {
        skip(padX);
        l = 0;
        if (++i === n - padX) {
          skip(p * padX);
          i = 0;
          if (++j === m - padY) {
            skip(p * n * padY);
            j = 0;
            k++;
          }
        }
      }
      if (repeat === false) {
        break;
      }
    }
    return Math.floor(count() / p);
  }

  dispose() {
    var ref, ref1, ref2, ref3, ref4, ref5;
    if ((ref = this.floatMemo) != null) {
      ref.unadopt(this.floatCompose);
    }
    if ((ref1 = this.floatMemo) != null) {
      ref1.dispose();
    }
    if ((ref2 = this.floatCompose) != null) {
      ref2.dispose();
    }
    if ((ref3 = this.byteMemo) != null) {
      ref3.unadopt(this.byteCompose);
    }
    if ((ref4 = this.byteMemo) != null) {
      ref4.dispose();
    }
    if ((ref5 = this.byteCompose) != null) {
      ref5.dispose();
    }
    return this.floatMemo = this.byteMemo = this.floatCompose = this.byteCompose = null;
  }

};

module.exports = Readback;


},{"../../util":190,"../meshes/memoscreen":170,"../renderable":176,"./buffer":140,"./memo":143}],146:[function(require,module,exports){
var RenderTarget, RenderToTexture, Renderable, Util;

Renderable = require('../renderable');

RenderTarget = require('./texture/rendertarget');

Util = require('../../util');

/*
 * Render-To-Texture with history
 */
RenderToTexture = class RenderToTexture extends Renderable {
  constructor(renderer, shaders, options) {
    var ref;
    super(renderer, shaders);
    this.scene = (ref = options.scene) != null ? ref : new THREE.Scene();
    this.camera = options.camera;
    this.build(options);
  }

  shaderRelative(shader) {
    if (shader == null) {
      shader = this.shaders.shader();
    }
    return shader.pipe("sample.2d", this.uniforms);
  }

  shaderAbsolute(shader, frames = 1, indices = 4) {
    var sample2DArray;
    if (shader == null) {
      shader = this.shaders.shader();
    }
    if (frames <= 1) {
      if (indices > 2) {
        shader.pipe(Util.GLSL.truncateVec(indices, 2));
      }
      shader.pipe("map.2d.data", this.uniforms);
      return shader.pipe("sample.2d", this.uniforms);
    } else {
      sample2DArray = Util.GLSL.sample2DArray(Math.min(frames, this.target.frames));
      if (indices < 4) {
        shader.pipe(Util.GLSL.extendVec(indices, 4));
      }
      shader.pipe("map.xyzw.2dv");
      shader.split();
      shader.pipe("map.2d.data", this.uniforms);
      shader.pass();
      return shader.pipe(sample2DArray, this.uniforms);
    }
  }

  build(options) {
    var base;
    if (!this.camera) {
      this.camera = new THREE.PerspectiveCamera();
      this.camera.position.set(0, 0, 3);
      this.camera.lookAt(new THREE.Vector3());
    }
    if (typeof (base = this.scene).inject === "function") {
      base.inject();
    }
    this.target = new RenderTarget(this.gl, options.width, options.height, options.frames, options);
    this.target.warmup((target) => {
      return this.renderer.setRenderTarget(target);
    });
    this.renderer.setRenderTarget(null);
    this._adopt(this.target.uniforms);
    this._adopt({
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2(.5, .5)
      }
    });
    return this.filled = 0;
  }

  adopt(renderable) {
    var i, len, object, ref, results;
    ref = renderable.renders;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      results.push(this.scene.add(object));
    }
    return results;
  }

  unadopt(renderable) {
    var i, len, object, ref, results;
    ref = renderable.renders;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      results.push(this.scene.remove(object));
    }
    return results;
  }

  render(camera = this.camera) {
    var ref;
    this.renderer.render((ref = this.scene.scene) != null ? ref : this.scene, camera, this.target.write);
    this.target.cycle();
    if (this.filled < this.target.frames) {
      return this.filled++;
    }
  }

  read(frame = 0) {
    return this.target.reads[Math.abs(frame)];
  }

  getFrames() {
    return this.target.frames;
  }

  getFilled() {
    return this.filled;
  }

  dispose() {
    var base;
    if (typeof (base = this.scene).unject === "function") {
      base.unject();
    }
    this.scene = this.camera = null;
    this.target.dispose();
    return super.dispose();
  }

};

module.exports = RenderToTexture;


},{"../../util":190,"../renderable":176,"./texture/rendertarget":150}],147:[function(require,module,exports){
var Atlas, SCRATCH_SIZE, TextAtlas;

Atlas = require('./atlas');

SCRATCH_SIZE = 512 / 16;

/*
 * Dynamic text atlas
 * - Stores entire strings as sprites
 * - Renders alpha mask (fast) or signed distance field (slow)
 * - Emits (x,y,width,height) pointers into the atlas
 */
TextAtlas = class TextAtlas extends Atlas {
  constructor(renderer, shaders, options) {
    var ref, ref1, ref2, ref3, ref4, ref5, ua;
    options.width || (options.width = 256);
    options.height || (options.height = 256);
    options.type = THREE.UnsignedByteType;
    options.channels = 1;
    options.backed = true;
    super(renderer, shaders, options, false);
    this.font = (ref = options.font) != null ? ref : ['sans-serif'];
    this.size = options.size || 24;
    this.style = (ref1 = options.style) != null ? ref1 : 'normal';
    this.variant = (ref2 = options.variant) != null ? ref2 : 'normal';
    this.weight = (ref3 = options.weight) != null ? ref3 : 'normal';
    this.outline = (ref4 = +((ref5 = options.outline) != null ? ref5 : 5)) != null ? ref4 : 0;
    this.gamma = 1;
    if (typeof navigator !== 'undefined') {
      ua = navigator.userAgent;
      if (ua.match(/Chrome/) && ua.match(/OS X/)) {
        this.gamma = .5;
      }
    }
    this.scratchW = this.scratchH = 0;
    this.build(options);
  }

  build(options) {
    var canvas, colors, context, dilate, font, hex, i, k, lineHeight, maxWidth, quote, ref, scratch;
    super.build(options);
    // Prepare line-height with room for outline
    lineHeight = 16;
    lineHeight = this.size;
    lineHeight += 4 + 2 * Math.min(1, this.outline);
    maxWidth = SCRATCH_SIZE * lineHeight;
    // Prepare scratch canvas
    canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = lineHeight;
    // Font string
    quote = function(str) {
      return `\"${str.replace(/(['"\\])/g, '\\$1')}\"`;
    };
    font = this.font.map(quote).join(", ");
    context = canvas.getContext('2d');
    context.font = `${this.style} ${this.variant} ${this.weight} ${this.size}px ${this.font}`;
    context.fillStyle = '#FF0000';
    context.textAlign = 'left';
    context.textBaseline = 'bottom';
    context.lineJoin = 'round';
    // debug: show scratch canvas
    /*
    document.body.appendChild canvas
    canvas.setAttribute('style', "position: absolute; top: 0; left: 0; z-index: 100; border: 1px solid red; background: rgba(255,0,255,.25);")
    */
    // Cache hex colors for distance field rendering
    colors = [];
    dilate = this.outline * 3;
    for (i = k = 0, ref = dilate; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
      // 8 rgb levels = 1 step = .5 pixel increase
      hex = ('00' + Math.max(0, -i * 8 + 128 - (!i) * 8).toString(16)).slice(-2);
      colors.push('#' + hex + hex + hex);
    }
    scratch = new Uint8Array(maxWidth * lineHeight * 2);
    this.canvas = canvas;
    this.context = context;
    this.lineHeight = lineHeight;
    this.maxWidth = maxWidth;
    this.colors = colors;
    this.scratch = scratch;
    this._allocate = this.allocate.bind(this);
    return this._write = this.write.bind(this);
  }

  reset() {
    super.reset();
    return this.mapped = {};
  }

  begin() {
    var k, len, ref, results, row;
    ref = this.rows;
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      row = ref[k];
      results.push(row.alive = 0);
    }
    return results;
  }

  end() {
    var k, key, l, len, len1, mapped, ref, ref1, row;
    mapped = this.mapped;
    ref = this.rows.slice();
    for (k = 0, len = ref.length; k < len; k++) {
      row = ref[k];
      if (!(row.alive === 0)) {
        continue;
      }
      ref1 = row.keys;
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        key = ref1[l];
        delete mapped[key];
      }
      this.collapse(row);
    }
  }

  map(text, emit) {
    var allocate, c, data, h, mapped, w, write;
    // See if already mapped into atlas
    mapped = this.mapped;
    c = mapped[text];
    if (c != null) {
      c.row.alive++;
      return emit(c.x, c.y, c.w, c.h);
    }
    // Draw text (don't recurse stack in @draw so it can be optimized cleanly)
    this.draw(text);
    data = this.scratch;
    w = this.scratchW;
    h = this.scratchH;
    // Allocate and write into atlas
    allocate = this._allocate;
    write = this._write;
    return allocate(text, w, h, function(row, x, y) {
      mapped[text] = {x, y, w, h, row};
      write(data, x, y, w, h);
      return emit(x, y, w, h);
    });
  }

  draw(text) {
    var a, b, c, colors, ctx, data, dst, gamma, h, i, imageData, j, k, l, m, mask, max, n, o, ref, ref1, ref2, w, x, y;
    w = this.width;
    h = this.lineHeight;
    o = this.outline;
    ctx = this.context;
    dst = this.scratch;
    max = this.maxWidth;
    colors = this.colors;
    // Bottom aligned
    x = o + 1;
    y = Math.round(h * 1.05 - 1);
    // Measure text
    m = ctx.measureText(text);
    w = Math.min(max, Math.ceil(m.width + 2 * x + 1));
    // Clear scratch area
    ctx.clearRect(0, 0, w, h);
    if (this.outline === 0) {
      // Alpha sprite (fast)
      ctx.fillText(text, x, y);
      ({data} = imageData = ctx.getImageData(0, 0, w, h));
      j = 3; // Skip to alpha channel
      for (i = k = 0, ref = data.length / 4; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        //dst[i] = 255 * (i%2); # test pattern to check pixel perfect alignment
        dst[i] = data[j];
        j += 4;
      }
      this.scratchW = w;
      return this.scratchH = h;
    } else {
      // Signed distance field sprite (approximation) (slow)

      // Draw strokes of decreasing width to create nested outlines (absolute distance)
      ctx.globalCompositeOperation = 'source-over';
      for (i = l = ref1 = o + 1; (ref1 <= 1 ? l <= 1 : l >= 1); i = ref1 <= 1 ? ++l : --l) {
        j = i > 1 ? i * 2 - 2 : i; // Eliminate odd strokes once past > 1px, don't need the detail
        ctx.strokeStyle = colors[j - 1];
        ctx.lineWidth = j;
        ctx.strokeText(text, x, y);
      }
      //console.log 'stroke', j, j+.5, colors[j]

      // Fill center with multiply blend #FF0000 to mark inside/outside
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillText(text, x, y);
      // Pull image data
      ({data} = imageData = ctx.getImageData(0, 0, w, h));
      j = 0;
      gamma = this.gamma;
      for (i = n = 0, ref2 = data.length / 4; (0 <= ref2 ? n < ref2 : n > ref2); i = 0 <= ref2 ? ++n : --n) {
        // Get value + mask
        a = data[j];
        mask = a ? data[j + 1] / a : 1;
        if (gamma === .5) {
          mask = Math.sqrt(mask);
        }
        mask = Math.min(1, Math.max(0, mask));
        // Blend between positive/outside and negative/inside
        b = 256 - a;
        c = b + (a - b) * mask;
        // Clamp
        // (slight expansion to hide errors around the transition)
        dst[i] = Math.max(0, Math.min(255, c + 2));
        j += 4;
      }
      // Debug: copy back into canvas
      /*
      j = 0
      for i in [0...data.length / 4]
        v = dst[i]
        #data[j] = v
        #data[j+1] = v
        data[j+2] = v
        data[j+3] = 255
        j += 4
      ctx.putImageData imageData, 0, 0
       */
      this.scratchW = w;
      return this.scratchH = h;
    }
  }

};

module.exports = TextAtlas;


},{"./atlas":139}],148:[function(require,module,exports){
var BackedTexture, DataTexture, Util;

Util = require('../../../Util');

DataTexture = require('./datatexture');

/*
Manually allocated GL texture for data streaming, locally backed.

Allows partial updates via subImage.
Contains local copy of its data to allow quick resizing without gl.copyTexImage2d
(which requires render-to-framebuffer)
*/
BackedTexture = class BackedTexture extends DataTexture {
  constructor(gl, width, height, channels, options) {
    super(gl, width, height, channels, options);
    this.data = new this.ctor(this.n);
  }

  resize(width, height) {
    var gl, old, oldHeight, oldWidth;
    old = this.data;
    oldWidth = this.width;
    oldHeight = this.height;
    this.width = width;
    this.height = height;
    this.n = width * height * this.channels;
    this.data = new this.ctor(this.n);
    gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, this.data);
    this.uniforms.dataResolution.value.set(1 / width, 1 / height);
    return this.write(old, 0, 0, oldWidth, oldHeight);
  }

  write(src, x, y, w, h) {
    var channels, dst, i, j, k, n, stride, width, ww, xx, yh, yy;
    width = this.width;
    dst = this.data;
    channels = this.channels;
    i = 0;
    if (width === w && x === 0) {
      j = y * w * channels;
      n = w * h * channels;
      while (i < n) {
        dst[j++] = src[i++];
      }
    } else {
      stride = width * channels;
      ww = w * channels;
      xx = x * channels;
      yy = y;
      yh = y + h;
      while (yy < yh) {
        k = 0;
        j = xx + yy * stride;
        while (k++ < ww) {
          dst[j++] = src[i++];
        }
        yy++;
      }
    }
    return super.write(src, x, y, w, h);
  }

  dispose() {
    this.data = null;
    return super.dispose();
  }

};

module.exports = BackedTexture;


},{"../../../Util":38,"./datatexture":149}],149:[function(require,module,exports){
var DataTexture, Util;

Util = require('../../../Util');

/*
Manually allocated GL texture for data streaming.

Allows partial updates via subImage.
*/
DataTexture = class DataTexture {
  constructor(gl1, width, height, channels, options) {
    var gl, magFilter, minFilter, ref, ref1, ref2, type;
    this.gl = gl1;
    this.width = width;
    this.height = height;
    this.channels = channels;
    this.n = this.width * this.height * this.channels;
    gl = this.gl;
    minFilter = (ref = options != null ? options.minFilter : void 0) != null ? ref : THREE.NearestFilter;
    magFilter = (ref1 = options != null ? options.magFilter : void 0) != null ? ref1 : THREE.NearestFilter;
    type = (ref2 = options != null ? options.type : void 0) != null ? ref2 : THREE.FloatType;
    this.minFilter = Util.Three.paramToGL(gl, minFilter);
    this.magFilter = Util.Three.paramToGL(gl, magFilter);
    this.type = Util.Three.paramToGL(gl, type);
    this.ctor = Util.Three.paramToArrayStorage(type);
    this.build(options);
  }

  build(options) {
    var gl;
    gl = this.gl;
    // Make GL texture
    this.texture = gl.createTexture();
    this.format = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][this.channels];
    this.format3 = [null, THREE.LuminanceFormat, THREE.LuminanceAlphaFormat, THREE.RGBFormat, THREE.RGBAFormat][this.channels];
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
    // Attach empty data
    this.data = new this.ctor(this.n);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, this.data);
    // Make wrapper texture object.
    this.textureObject = new THREE.Texture(new Image(), THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, options != null ? options.minFilter : void 0, options != null ? options.magFilter : void 0);
    // Pre-init texture to trick WebGLRenderer
    this.textureObject.__webglInit = true;
    this.textureObject.__webglTexture = this.texture;
    this.textureObject.format = this.format3;
    this.textureObject.type = THREE.FloatType;
    this.textureObject.unpackAlignment = 1;
    this.textureObject.flipY = false;
    this.textureObject.generateMipmaps = false;
    // Create uniforms
    return this.uniforms = {
      dataResolution: {
        type: 'v2',
        value: new THREE.Vector2(1 / this.width, 1 / this.height)
      },
      dataTexture: {
        type: 't',
        value: this.textureObject
      }
    };
  }

  write(data, x, y, w, h) {
    var gl;
    gl = this.gl;
    // Write to rectangle
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    return gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, this.format, this.type, data);
  }

  dispose() {
    this.gl.deleteTexture(this.texture);
    this.textureObject.__webglInit = false;
    this.textureObject.__webglTexture = null;
    return this.textureObject = this.texture = null;
  }

};

module.exports = DataTexture;


},{"../../../Util":38}],150:[function(require,module,exports){
/*
Virtual RenderTarget that cycles through multiple frames
Provides easy access to past rendered frames
@reads[] and @write contain WebGLRenderTargets whose internal pointers are rotated automatically
*/
var RenderTarget;

RenderTarget = class RenderTarget {
  constructor(gl, width, height, frames, options = {}) {
    this.gl = gl;
    if (options.minFilter == null) {
      options.minFilter = THREE.NearestFilter;
    }
    if (options.magFilter == null) {
      options.magFilter = THREE.NearestFilter;
    }
    if (options.format == null) {
      options.format = THREE.RGBAFormat;
    }
    if (options.type == null) {
      options.type = THREE.UnsignedByteType;
    }
    this.options = options;
    this.width = width || 1;
    this.height = height || 1;
    this.frames = frames || 1;
    this.buffers = this.frames + 1;
    this.build();
  }

  build() {
    var i, make;
    make = () => {
      return new THREE.WebGLRenderTarget(this.width, this.height, this.options);
    };
    this.targets = (function() {
      var k, ref, results;
      results = [];
      for (i = k = 0, ref = this.buffers; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        results.push(make());
      }
      return results;
    }).call(this);
    this.reads = (function() {
      var k, ref, results;
      results = [];
      for (i = k = 0, ref = this.buffers; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        results.push(make());
      }
      return results;
    }).call(this);
    this.write = make();
    this.index = 0;
    // Texture access uniforms
    return this.uniforms = {
      dataResolution: {
        type: 'v2',
        value: new THREE.Vector2(1 / this.width, 1 / this.height)
      },
      dataTexture: {
        type: 't',
        value: this.reads[0]
      },
      dataTextures: {
        type: 'tv',
        value: this.reads
      }
    };
  }

  cycle() {
    var add, buffers, copy, i, k, keys, len, read, ref;
    keys = ['__webglTexture', '__webglFramebuffer', '__webglRenderbuffer'];
    buffers = this.buffers;
    copy = function(a, b) {
      var k, key, len;
      for (k = 0, len = keys.length; k < len; k++) {
        key = keys[k];
        b[key] = a[key];
      }
      return null;
    };
    add = function(i, j) {
      return (i + j + buffers * 2) % buffers;
    };
    copy(this.write, this.targets[this.index]);
    ref = this.reads;
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      read = ref[i];
      copy(this.targets[add(this.index, -i)], read);
    }
    this.index = add(this.index, 1);
    return copy(this.targets[this.index], this.write);
  }

  warmup(callback) {
    var i, k, ref, results;
    results = [];
    for (i = k = 0, ref = this.buffers; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
      callback(this.write);
      results.push(this.cycle());
    }
    return results;
  }

  dispose() {
    var k, len, ref, target;
    ref = this.targets;
    for (k = 0, len = ref.length; k < len; k++) {
      target = ref[k];
      target.dispose();
    }
    return this.targets = this.reads = this.write = null;
  }

};

module.exports = RenderTarget;


},{}],151:[function(require,module,exports){
var DataBuffer, Util, VoxelBuffer;

DataBuffer = require('./databuffer');

Util = require('../../util');


// 3D array

VoxelBuffer = class VoxelBuffer extends DataBuffer {
  build(options) {
    super.build();
    this.pad = {
      x: 0,
      y: 0,
      z: 0
    };
    return this.streamer = this.generate(this.data);
  }

  setActive(i, j, k) {
    return [this.pad.x, this.pad.y, this.pad.z] = [Math.max(0, this.width - i), Math.max(0, this.height - j), Math.max(0, this.depth - k)];
  }

  fill() {
    var callback, count, done, emit, i, j, k, l, limit, m, n, o, padX, padY, repeat, reset, skip;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    ({emit, skip, count, done, reset} = this.streamer);
    reset();
    n = this.width;
    m = this.height;
    o = this.depth;
    padX = this.pad.x;
    padY = this.pad.y;
    limit = this.samples - this.pad.z * n * m;
    i = j = k = l = 0;
    if (padX > 0 || padY > 0) {
      while (!done() && l < limit) {
        l++;
        repeat = callback(emit, i, j, k);
        if (++i === n - padX) {
          skip(padX);
          i = 0;
          if (++j === m - padY) {
            skip(n * padY);
            j = 0;
            k++;
          }
        }
        if (repeat === false) {
          break;
        }
      }
    } else {
      while (!done() && l < limit) {
        l++;
        repeat = callback(emit, i, j, k);
        if (++i === n) {
          i = 0;
          if (++j === m) {
            j = 0;
            k++;
          }
        }
        if (repeat === false) {
          break;
        }
      }
    }
    return Math.floor(count() / this.items);
  }

  through(callback, target) {
    var consume, done, dst, emit, i, j, k, pipe, src;
    // must be identical sized buffers w/ identical active areas
    ({consume, done} = src = this.streamer);
    ({emit} = dst = target.streamer);
    i = j = k = 0;
    pipe = function() {
      return consume(function(x, y, z, w) {
        return callback(emit, x, y, z, w, i, j, k);
      });
    };
    pipe = Util.Data.repeatCall(pipe, this.items);
    return () => {
      var l, limit, m, n, o, padX, padY;
      src.reset();
      dst.reset();
      n = this.width;
      m = this.height;
      o = this.depth;
      padX = this.pad.x;
      padY = this.pad.y;
      limit = this.samples - this.pad.z * n * m;
      i = j = k = l = 0;
      if (padX > 0 || padY > 0) {
        while (!done() && l < limit) {
          l++;
          pipe();
          if (++i === n - padX) {
            skip(padX);
            i = 0;
            if (++j === m - padY) {
              skip(n * padY);
              j = 0;
              k++;
            }
          }
        }
      } else {
        while (!done() && l < limit) {
          l++;
          pipe();
          if (++i === n) {
            i = 0;
            if (++j === m) {
              j = 0;
              k++;
            }
          }
        }
      }
      return src.count();
    };
  }

};

module.exports = VoxelBuffer;


},{"../../util":190,"./databuffer":141}],152:[function(require,module,exports){
var Classes;

Classes = {
  sprite: require('./meshes/sprite'),
  point: require('./meshes/point'),
  line: require('./meshes/line'),
  surface: require('./meshes/surface'),
  face: require('./meshes/face'),
  strip: require('./meshes/strip'),
  arrow: require('./meshes/arrow'),
  screen: require('./meshes/screen'),
  memoScreen: require('./meshes/memoscreen'),
  debug: require('./meshes/debug'),
  dataBuffer: require('./buffer/databuffer'),
  arrayBuffer: require('./buffer/arraybuffer'),
  matrixBuffer: require('./buffer/matrixbuffer'),
  voxelBuffer: require('./buffer/voxelbuffer'),
  pushBuffer: require('./buffer/pushbuffer'),
  renderToTexture: require('./buffer/rendertotexture'),
  memo: require('./buffer/memo'),
  readback: require('./buffer/readback'),
  atlas: require('./buffer/atlas'),
  textAtlas: require('./buffer/textatlas'),
  scene: require('./scene')
};

module.exports = Classes;


},{"./buffer/arraybuffer":138,"./buffer/atlas":139,"./buffer/databuffer":141,"./buffer/matrixbuffer":142,"./buffer/memo":143,"./buffer/pushbuffer":144,"./buffer/readback":145,"./buffer/rendertotexture":146,"./buffer/textatlas":147,"./buffer/voxelbuffer":151,"./meshes/arrow":165,"./meshes/debug":167,"./meshes/face":168,"./meshes/line":169,"./meshes/memoscreen":170,"./meshes/point":171,"./meshes/screen":172,"./meshes/sprite":173,"./meshes/strip":174,"./meshes/surface":175,"./scene":177}],153:[function(require,module,exports){
var RenderFactory;

RenderFactory = class RenderFactory {
  constructor(classes, renderer, shaders) {
    this.classes = classes;
    this.renderer = renderer;
    this.shaders = shaders;
  }

  getTypes() {
    return Object.keys(this.classes);
  }

  make(type, options) {
    return new this.classes[type](this.renderer, this.shaders, options);
  }

};

module.exports = RenderFactory;


},{}],154:[function(require,module,exports){
var ArrowGeometry, ClipGeometry;

ClipGeometry = require('./clipgeometry');

/*
Cones to attach as arrowheads on line strips

.....> .....> .....> .....>

.....> .....> .....> .....>

.....> .....> .....> .....>
*/
ArrowGeometry = class ArrowGeometry extends ClipGeometry {
  constructor(options) {
    var a, anchor, angle, arrow, arrows, attach, b, back, base, c, circle, far, flip, i, index, j, k, l, layers, m, n, near, o, p, points, position, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ribbons, samples, sides, step, strips, tip, triangles, x, y, z;
    super(options);
    this._clipUniforms();
    this.sides = sides = +options.sides || 12;
    this.samples = samples = +options.samples || 2;
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.layers = layers = +options.layers || 1;
    this.flip = flip = (ref = options.flip) != null ? ref : false;
    this.anchor = anchor = (ref1 = options.anchor) != null ? ref1 : flip ? 0 : samples - 1;
    arrows = strips * ribbons * layers;
    points = (sides + 2) * arrows;
    triangles = (sides * 2) * arrows;
    this.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1));
    this.addAttribute('position4', new THREE.BufferAttribute(new Float32Array(points * 4), 4));
    this.addAttribute('arrow', new THREE.BufferAttribute(new Float32Array(points * 3), 3));
    this.addAttribute('attach', new THREE.BufferAttribute(new Float32Array(points * 2), 2));
    this._autochunk();
    index = this._emitter('index');
    position = this._emitter('position4');
    arrow = this._emitter('arrow');
    attach = this._emitter('attach');
    circle = [];
    for (k = j = 0, ref2 = sides; (0 <= ref2 ? j < ref2 : j > ref2); k = 0 <= ref2 ? ++j : --j) {
      angle = k / sides * τ;
      circle.push([Math.cos(angle), Math.sin(angle), 1]);
    }
    base = 0;
    for (i = m = 0, ref3 = arrows; (0 <= ref3 ? m < ref3 : m > ref3); i = 0 <= ref3 ? ++m : --m) {
      tip = base++;
      back = tip + sides + 1;
      for (k = n = 0, ref4 = sides; (0 <= ref4 ? n < ref4 : n > ref4); k = 0 <= ref4 ? ++n : --n) {
        a = base + k % sides;
        b = base + (k + 1) % sides;
        index(tip);
        index(a);
        index(b);
        index(b);
        index(a);
        index(back);
      }
      base += sides + 1;
    }
    step = flip ? 1 : -1;
    far = flip ? samples - 1 : 0;
    near = anchor + step;
    x = anchor;
    for (l = o = 0, ref5 = layers; (0 <= ref5 ? o < ref5 : o > ref5); l = 0 <= ref5 ? ++o : --o) {
      for (z = p = 0, ref6 = ribbons; (0 <= ref6 ? p < ref6 : p > ref6); z = 0 <= ref6 ? ++p : --p) {
        for (y = q = 0, ref7 = strips; (0 <= ref7 ? q < ref7 : q > ref7); y = 0 <= ref7 ? ++q : --q) {
          position(x, y, z, l);
          arrow(0, 0, 0);
          attach(near, far);
          for (k = r = 0, ref8 = sides; (0 <= ref8 ? r < ref8 : r > ref8); k = 0 <= ref8 ? ++r : --r) {
            position(x, y, z, l);
            c = circle[k];
            arrow(c[0], c[1], c[2]);
            attach(near, far);
          }
          position(x, y, z, l);
          arrow(0, 0, 1);
          attach(near, far);
        }
      }
    }
    this._finalize();
    this.clip();
    return;
  }

  clip(samples = this.samples, strips = this.strips, ribbons = this.ribbons, layers = this.layers) {
    var dims, maxs, quads, segments;
    segments = Math.max(0, samples - 1);
    this._clipGeometry(samples, strips, ribbons, layers);
    if (samples > this.anchor) {
      dims = [layers, ribbons, strips];
      maxs = [this.layers, this.ribbons, this.strips];
      quads = this.sides * this._reduce(dims, maxs);
    } else {
      quads = 0;
    }
    return this._offsets([
      {
        start: 0,
        count: quads * 6
      }
    ]);
  }

};

module.exports = ArrowGeometry;


},{"./clipgeometry":155}],155:[function(require,module,exports){
var ClipGeometry, Geometry, debug, tick;

Geometry = require('./geometry');

debug = false;

tick = function() {
  var now;
  now = +new Date();
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

// Instanced geometry that is clippable along 4 dimensions
ClipGeometry = class ClipGeometry extends Geometry {
  _clipUniforms() {
    this.geometryClip = new THREE.Vector4(1e10, 1e10, 1e10, 1e10);
    this.geometryResolution = new THREE.Vector4();
    this.mapSize = new THREE.Vector4();
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: 'v4',
      value: this.geometryClip
    };
    this.uniforms.geometryResolution = {
      type: 'v4',
      value: this.geometryResolution
    };
    return this.uniforms.mapSize = {
      type: 'v4',
      value: this.mapSize
    };
  }

  _clipGeometry(width, height, depth, items) {
    var c, r;
    c = function(x) {
      return Math.max(0, x - 1);
    };
    r = function(x) {
      return 1 / Math.max(1, x - 1);
    };
    this.geometryClip.set(c(width), c(height), c(depth), c(items));
    return this.geometryResolution.set(r(width), r(height), r(depth), r(items));
  }

  _clipMap(mapWidth, mapHeight, mapDepth, mapItems) {
    return this.mapSize.set(mapWidth, mapHeight, mapDepth, mapItems);
  }

  _clipOffsets(factor, width, height, depth, items, _width, _height, _depth, _items) {
    var dims, elements, maxs;
    dims = [depth, height, width, items];
    maxs = [_depth, _height, _width, _items];
    elements = this._reduce(dims, maxs);
    return this._offsets([
      {
        start: 0,
        count: elements * factor
      }
    ]);
  }

};

module.exports = ClipGeometry;


},{"./geometry":157}],156:[function(require,module,exports){
var ClipGeometry, FaceGeometry;

ClipGeometry = require('./clipgeometry');

/*
(flat) Triangle fans arranged in items, columns and rows

+-+     +-+     +-+     +-+     
|\\\    |\\\    |\\\    |\\\    
+-+-+   +-+-+   +-+-+   +-+-+   

+-+     +-+     +-+     +-+     
|\\\    |\\\    |\\\    |\\\    
+-+-+   +-+-+   +-+-+   +-+-+   

+-+     +-+     +-+     +-+     
|\\\    |\\\    |\\\    |\\\    
+-+-+   +-+-+   +-+-+   +-+-+   
 */
FaceGeometry = class FaceGeometry extends ClipGeometry {
  constructor(options) {
    var base, depth, height, i, index, items, j, k, l, m, n, o, p, points, position, q, ref, ref1, ref2, ref3, ref4, ref5, samples, sides, triangles, width, x, y, z;
    super(options);
    this._clipUniforms();
    this.items = items = +options.items || 2;
    this.width = width = +options.width || 1;
    this.height = height = +options.height || 1;
    this.depth = depth = +options.depth || 1;
    this.sides = sides = Math.max(0, items - 2);
    samples = width * height * depth;
    points = items * samples;
    triangles = sides * samples;
    this.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1));
    this.addAttribute('position4', new THREE.BufferAttribute(new Float32Array(points * 4), 4));
    this._autochunk();
    index = this._emitter('index');
    position = this._emitter('position4');
    base = 0;
    for (i = k = 0, ref = samples; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
      for (j = m = 0, ref1 = sides; (0 <= ref1 ? m < ref1 : m > ref1); j = 0 <= ref1 ? ++m : --m) {
        index(base);
        index(base + j + 1);
        index(base + j + 2);
      }
      base += items;
    }
    for (z = n = 0, ref2 = depth; (0 <= ref2 ? n < ref2 : n > ref2); z = 0 <= ref2 ? ++n : --n) {
      for (y = o = 0, ref3 = height; (0 <= ref3 ? o < ref3 : o > ref3); y = 0 <= ref3 ? ++o : --o) {
        for (x = p = 0, ref4 = width; (0 <= ref4 ? p < ref4 : p > ref4); x = 0 <= ref4 ? ++p : --p) {
          for (l = q = 0, ref5 = items; (0 <= ref5 ? q < ref5 : q > ref5); l = 0 <= ref5 ? ++q : --q) {
            position(x, y, z, l);
          }
        }
      }
    }
    this._finalize();
    this.clip();
    return;
  }

  clip(width = this.width, height = this.height, depth = this.depth, items = this.items) {
    var sides;
    sides = Math.max(0, items - 2);
    this._clipGeometry(width, height, depth, items);
    return this._clipOffsets(3, width, height, depth, sides, this.width, this.height, this.depth, this.sides);
  }

};

module.exports = FaceGeometry;


},{"./clipgeometry":155}],157:[function(require,module,exports){
var Geometry, debug, tick;

debug = false;

tick = function() {
  var now;
  now = +new Date();
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

Geometry = class Geometry extends THREE.BufferGeometry {
  constructor() {
    super();
    new THREE.BufferGeometry(this);
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    if (this.offsets == null) {
      this.offsets = [];
    }
    if (debug) {
      this.tock = tick();
    }
    this.chunked = false;
    this.limit = 0xFFFF;
  }

  _reduce(dims, maxs) {
    var dim, i, j, len, max, multiple, quads;
    multiple = false;
    for (i = j = 0, len = dims.length; j < len; i = ++j) {
      dim = dims[i];
      max = maxs[i];
      if (multiple) {
        dims[i] = max;
      }
      if (dim > 1) {
        multiple = true;
      }
    }
    return quads = dims.reduce(function(a, b) {
      return a * b;
    });
  }

  _emitter(name) {
    var array, attribute, dimensions, four, offset, one, three, two;
    attribute = this.attributes[name];
    dimensions = attribute.itemSize;
    array = attribute.array;
    offset = 0;
    one = function(a) {
      return array[offset++] = a;
    };
    two = function(a, b) {
      array[offset++] = a;
      return array[offset++] = b;
    };
    three = function(a, b, c) {
      array[offset++] = a;
      array[offset++] = b;
      return array[offset++] = c;
    };
    four = function(a, b, c, d) {
      array[offset++] = a;
      array[offset++] = b;
      array[offset++] = c;
      return array[offset++] = d;
    };
    return [null, one, two, three, four][dimensions];
  }

  _autochunk() {
    var array, attribute, indexed, name, numItems, ref;
    indexed = this.attributes.index;
    ref = this.attributes;
    for (name in ref) {
      attribute = ref[name];
      if (name !== 'index' && indexed) {
        numItems = attribute.array.length / attribute.itemSize;
        if (numItems > this.limit) {
          this.chunked = true;
        }
        break;
      }
    }
    if (this.chunked && !indexed.u16) {
      indexed.u16 = array = indexed.array;
      return indexed.array = new Uint32Array(array.length);
    }
  }

  _finalize() {
    var attrib;
    if (!this.chunked) {
      return;
    }
    attrib = this.attributes.index;
    this.chunks = this._chunks(attrib.array, this.limit);
    this._chunkify(attrib, this.chunks);
    if (debug) {
      return this.tock(this.constructor.name);
    }
  }

  _chunks(array, limit) {
    var a, b, chunks, end, i, j, j1, j2, j3, jmax, jmin, last, n, o, push, ref, start;
    chunks = [];
    last = 0;
    start = array[0];
    end = array[0];
    push = function(i) {
      var _count, _end, _start;
      _start = last * 3;
      _end = i * 3;
      _count = _end - _start;
      return chunks.push({
        index: start,
        start: _start,
        count: _count,
        end: _end
      });
    };
    n = Math.floor(array.length / 3);
    o = 0;
    for (i = j = 0, ref = n; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      j1 = array[o++];
      j2 = array[o++];
      j3 = array[o++];
      jmin = Math.min(j1, j2, j3);
      jmax = Math.max(j1, j2, j3);
      a = Math.min(start, jmin);
      b = Math.max(end, jmax);
      if (b - a > limit) {
        push(i);
        a = jmin;
        b = jmax;
        last = i;
      }
      start = a;
      end = b;
    }
    push(n);
    return chunks;
  }

  _chunkify(attrib, chunks) {
    var chunk, from, i, j, k, len, offset, ref, ref1, to;
    if (!attrib.u16) {
      return;
    }
    from = attrib.array;
    to = attrib.u16;
    for (j = 0, len = chunks.length; j < len; j++) {
      chunk = chunks[j];
      offset = chunk.index;
      for (i = k = ref = chunk.start, ref1 = chunk.end; (ref <= ref1 ? k < ref1 : k > ref1); i = ref <= ref1 ? ++k : --k) {
        to[i] = from[i] - offset;
      }
    }
    attrib.array = attrib.u16;
    return delete attrib.u16;
  }

  _offsets(offsets) {
    var _end, _start, chunk, chunks, end, j, k, len, len1, offset, out, start;
    if (!this.chunked) {
      this.offsets = offsets;
    } else {
      chunks = this.chunks;
      out = this.offsets;
      out.length = null;
      for (j = 0, len = offsets.length; j < len; j++) {
        offset = offsets[j];
        start = offset.start;
        end = offset.count - start;
        for (k = 0, len1 = chunks.length; k < len1; k++) {
          chunk = chunks[k];
          _start = chunk.start;
          _end = chunk.end;
          if (start <= _start && end > _start || start < _end && end >= _end || start > _start && end < _end) {
            _start = Math.max(start, _start);
            _end = Math.min(end, _end);
            out.push({
              index: chunk.index,
              start: _start,
              count: _end - _start
            });
          }
        }
      }
    }
    return null;
  }

};

module.exports = Geometry;


},{}],158:[function(require,module,exports){
exports.Geometry = require('./geometry');

exports.ArrowGeometry = require('./arrowgeometry');

exports.FaceGeometry = require('./facegeometry');

exports.LineGeometry = require('./linegeometry');

exports.ScreenGeometry = require('./screengeometry');

exports.SpriteGeometry = require('./spritegeometry');

exports.StripGeometry = require('./stripgeometry');

exports.SurfaceGeometry = require('./surfacegeometry');


},{"./arrowgeometry":154,"./facegeometry":156,"./geometry":157,"./linegeometry":159,"./screengeometry":160,"./spritegeometry":161,"./stripgeometry":162,"./surfacegeometry":163}],159:[function(require,module,exports){
var ClipGeometry, LineGeometry;

ClipGeometry = require('./clipgeometry');

/*
Line strips arranged in columns and rows

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+
*/
LineGeometry = class LineGeometry extends ClipGeometry {
  constructor(options) {
    var base, closed, detail, edge, edger, i, i1, index, j, j1, joint, joints, k, l, layers, line, lines, m, n, o, p, points, position, q, quads, r, ref, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, ribbons, s, samples, segments, strip, strips, t, triangles, u, v, vertices, w, wrap, x, y, z;
    super(options);
    this._clipUniforms();
    this.closed = closed = options.closed || false;
    this.samples = samples = (+options.samples || 2) + (closed ? 1 : 0);
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.layers = layers = +options.layers || 1;
    this.detail = detail = +options.detail || 1;
    lines = samples - 1;
    this.joints = joints = detail - 1;
    this.vertices = vertices = (lines - 1) * joints + samples;
    this.segments = segments = (lines - 1) * joints + lines;
    wrap = samples - (closed ? 1 : 0);
    points = vertices * strips * ribbons * layers * 2;
    quads = segments * strips * ribbons * layers;
    triangles = quads * 2;
    this.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1));
    this.addAttribute('position4', new THREE.BufferAttribute(new Float32Array(points * 4), 4));
    this.addAttribute('line', new THREE.BufferAttribute(new Float32Array(points * 2), 2));
    this.addAttribute('strip', new THREE.BufferAttribute(new Float32Array(points * 2), 2));
    if (detail > 1) {
      this.addAttribute('joint', new THREE.BufferAttribute(new Float32Array(points), 1));
    }
    this._autochunk();
    index = this._emitter('index');
    position = this._emitter('position4');
    line = this._emitter('line');
    strip = this._emitter('strip');
    if (detail > 1) {
      joint = this._emitter('joint');
    }
    base = 0;
    for (i = n = 0, ref = ribbons * layers; (0 <= ref ? n < ref : n > ref); i = 0 <= ref ? ++n : --n) {
      for (j = o = 0, ref1 = strips; (0 <= ref1 ? o < ref1 : o > ref1); j = 0 <= ref1 ? ++o : --o) {
// note implied - 1
        for (k = p = 0, ref2 = segments; (0 <= ref2 ? p < ref2 : p > ref2); k = 0 <= ref2 ? ++p : --p) {
          index(base);
          index(base + 1);
          index(base + 2);
          index(base + 2);
          index(base + 1);
          index(base + 3);
          base += 2;
        }
        base += 2;
      }
    }
    edger = closed ? function() {
      return 0;
    } : function(x) {
      if (x === 0) {
        return -1;
      } else if (x === samples - 1) {
        return 1;
      } else {
        return 0;
      }
    };
    if (detail > 1) {
      for (l = q = 0, ref3 = layers; (0 <= ref3 ? q < ref3 : q > ref3); l = 0 <= ref3 ? ++q : --q) {
        for (z = r = 0, ref4 = ribbons; (0 <= ref4 ? r < ref4 : r > ref4); z = 0 <= ref4 ? ++r : --r) {
          for (y = s = 0, ref5 = strips; (0 <= ref5 ? s < ref5 : s > ref5); y = 0 <= ref5 ? ++s : --s) {
            for (x = t = 0, ref6 = samples; (0 <= ref6 ? t < ref6 : t > ref6); x = 0 <= ref6 ? ++t : --t) {
              if (closed) {
                x = x % wrap;
              }
              edge = edger(x);
              if (edge !== 0) {
                position(x, y, z, l);
                position(x, y, z, l);
                line(edge, 1);
                line(edge, -1);
                strip(0, segments);
                strip(0, segments);
                joint(0.5);
                joint(0.5);
              } else {
                for (m = u = 0, ref7 = detail; (0 <= ref7 ? u < ref7 : u > ref7); m = 0 <= ref7 ? ++u : --u) {
                  position(x, y, z, l);
                  position(x, y, z, l);
                  line(edge, 1);
                  line(edge, -1);
                  strip(0, segments);
                  strip(0, segments);
                  joint(m / joints);
                  joint(m / joints);
                }
              }
            }
          }
        }
      }
    } else {
      for (l = v = 0, ref8 = layers; (0 <= ref8 ? v < ref8 : v > ref8); l = 0 <= ref8 ? ++v : --v) {
        for (z = w = 0, ref9 = ribbons; (0 <= ref9 ? w < ref9 : w > ref9); z = 0 <= ref9 ? ++w : --w) {
          for (y = i1 = 0, ref10 = strips; (0 <= ref10 ? i1 < ref10 : i1 > ref10); y = 0 <= ref10 ? ++i1 : --i1) {
            for (x = j1 = 0, ref11 = samples; (0 <= ref11 ? j1 < ref11 : j1 > ref11); x = 0 <= ref11 ? ++j1 : --j1) {
              if (closed) {
                x = x % wrap;
              }
              edge = edger(x);
              position(x, y, z, l);
              position(x, y, z, l);
              line(edge, 1);
              line(edge, -1);
              strip(0, segments);
              strip(0, segments);
            }
          }
        }
      }
    }
    this._finalize();
    this.clip();
    return;
  }

  clip(samples = this.samples - this.closed, strips = this.strips, ribbons = this.ribbons, layers = this.layers) {
    var segments, vertices;
    segments = Math.max(0, samples - (this.closed ? 0 : 1));
    vertices = samples + (samples - 2) * this.joints;
    segments = vertices - 1;
    this._clipGeometry(vertices, strips, ribbons, layers);
    return this._clipOffsets(6, segments, strips, ribbons, layers, this.segments, this.strips, this.ribbons, this.layers);
  }

};

module.exports = LineGeometry;


},{"./clipgeometry":155}],160:[function(require,module,exports){
var ScreenGeometry, SurfaceGeometry;

SurfaceGeometry = require('./surfacegeometry');

/*
Grid Surface in normalized screen space

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
 */
ScreenGeometry = class ScreenGeometry extends SurfaceGeometry {
  constructor(options) {
    var ref, ref1;
    options.width = Math.max(2, (ref = +options.width) != null ? ref : 2);
    options.height = Math.max(2, (ref1 = +options.height) != null ? ref1 : 2);
    super(options, false);
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryScale = {
      type: 'v4',
      value: new THREE.Vector4()
    };
    this.cover();
    this.construct(options);
  }

  cover(scaleX = 1, scaleY = 1, scaleZ = 1, scaleW = 1) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.scaleZ = scaleZ;
    this.scaleW = scaleW;
  }

  clip(width = this.width, height = this.height, surfaces = this.surfaces, layers = this.layers) {
    var invert;
    super.clip(width, height, surfaces, layers);
    invert = function(x) {
      return 1 / Math.max(1, x - 1);
    };
    return this.uniforms.geometryScale.value.set(invert(width) * this.scaleX, invert(height) * this.scaleY, invert(surfaces) * this.scaleZ, invert(layers) * this.scaleW);
  }

};

module.exports = ScreenGeometry;


},{"./surfacegeometry":163}],161:[function(require,module,exports){
var ClipGeometry, SpriteGeometry;

ClipGeometry = require('./clipgeometry');

/*
Render points as quads

+----+  +----+  +----+  +----+
|    |  |    |  |    |  |    |
+----+  +----+  +----+  +----+

+----+  +----+  +----+  +----+
|    |  |    |  |    |  |    |
+----+  +----+  +----+  +----+

+----+  +----+  +----+  +----+
|    |  |    |  |    |  |    |
+----+  +----+  +----+  +----+

 */
SpriteGeometry = class SpriteGeometry extends ClipGeometry {
  constructor(options) {
    var base, depth, height, i, index, items, j, k, l, len, m, n, o, p, points, position, quad, ref, ref1, ref2, ref3, ref4, samples, sprite, triangles, v, width, x, y, z;
    super(options);
    this._clipUniforms();
    this.items = items = +options.items || 2;
    this.width = width = +options.width || 1;
    this.height = height = +options.height || 1;
    this.depth = depth = +options.depth || 1;
    samples = items * width * height * depth;
    points = samples * 4;
    triangles = samples * 2;
    this.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1));
    this.addAttribute('position4', new THREE.BufferAttribute(new Float32Array(points * 4), 4));
    this.addAttribute('sprite', new THREE.BufferAttribute(new Float32Array(points * 2), 2));
    this._autochunk();
    index = this._emitter('index');
    position = this._emitter('position4');
    sprite = this._emitter('sprite');
    quad = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    base = 0;
    for (i = j = 0, ref = samples; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      index(base);
      index(base + 1);
      index(base + 2);
      index(base + 1);
      index(base + 2);
      index(base + 3);
      base += 4;
    }
    for (z = k = 0, ref1 = depth; (0 <= ref1 ? k < ref1 : k > ref1); z = 0 <= ref1 ? ++k : --k) {
      for (y = m = 0, ref2 = height; (0 <= ref2 ? m < ref2 : m > ref2); y = 0 <= ref2 ? ++m : --m) {
        for (x = n = 0, ref3 = width; (0 <= ref3 ? n < ref3 : n > ref3); x = 0 <= ref3 ? ++n : --n) {
          for (l = o = 0, ref4 = items; (0 <= ref4 ? o < ref4 : o > ref4); l = 0 <= ref4 ? ++o : --o) {
            for (p = 0, len = quad.length; p < len; p++) {
              v = quad[p];
              position(x, y, z, l);
              sprite(v[0], v[1]);
            }
          }
        }
      }
    }
    this._finalize();
    this.clip();
    return;
  }

  clip(width = this.width, height = this.height, depth = this.depth, items = this.items) {
    this._clipGeometry(width, height, depth, items);
    return this._clipOffsets(6, width, height, depth, items, this.width, this.height, this.depth, this.items);
  }

};

module.exports = SpriteGeometry;


},{"./clipgeometry":155}],162:[function(require,module,exports){
var ClipGeometry, StripGeometry;

ClipGeometry = require('./clipgeometry');

/*
Triangle strips arranged in items, columns and rows

+--+--+--+  +--+--+--+  +--+--+--+  +--+--+--+  
| /| /| /   | /| /| /   | /| /| /   | /| /| / 
+--+--+/    +--+--+/    +--+--+/    +--+--+/  

+--+--+--+  +--+--+--+  +--+--+--+  +--+--+--+  
| /| /| /   | /| /| /   | /| /| /   | /| /| / 
+--+--+/    +--+--+/    +--+--+/    +--+--+/  

+--+--+--+  +--+--+--+  +--+--+--+  +--+--+--+  
| /| /| /   | /| /| /   | /| /| /   | /| /| / 
+--+--+/    +--+--+/    +--+--+/    +--+--+/  

 */
StripGeometry = class StripGeometry extends ClipGeometry {
  constructor(options) {
    var base, depth, f, height, i, index, items, j, k, l, last, m, n, o, p, points, position, q, r, ref, ref1, ref2, ref3, ref4, ref5, samples, sides, strip, triangles, width, x, y, z;
    super(options);
    this._clipUniforms();
    this.items = items = +options.items || 2;
    this.width = width = +options.width || 1;
    this.height = height = +options.height || 1;
    this.depth = depth = +options.depth || 1;
    this.sides = sides = Math.max(0, items - 2);
    samples = width * height * depth;
    points = items * samples;
    triangles = sides * samples;
    this.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1));
    this.addAttribute('position4', new THREE.BufferAttribute(new Float32Array(points * 4), 4));
    this.addAttribute('strip', new THREE.BufferAttribute(new Float32Array(points * 3), 3));
    this._autochunk();
    index = this._emitter('index');
    position = this._emitter('position4');
    strip = this._emitter('strip');
    base = 0;
    for (i = k = 0, ref = samples; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
      o = base;
      for (j = m = 0, ref1 = sides; (0 <= ref1 ? m < ref1 : m > ref1); j = 0 <= ref1 ? ++m : --m) {
        if (j & 1) {
          index(o + 1);
          index(o);
          index(o + 2);
        } else {
          index(o);
          index(o + 1);
          index(o + 2);
        }
        o++;
      }
      base += items;
    }
    last = items - 1;
    for (z = n = 0, ref2 = depth; (0 <= ref2 ? n < ref2 : n > ref2); z = 0 <= ref2 ? ++n : --n) {
      for (y = p = 0, ref3 = height; (0 <= ref3 ? p < ref3 : p > ref3); y = 0 <= ref3 ? ++p : --p) {
        for (x = q = 0, ref4 = width; (0 <= ref4 ? q < ref4 : q > ref4); x = 0 <= ref4 ? ++q : --q) {
          f = 1;
          position(x, y, z, 0);
          strip(1, 2, f);
          for (l = r = 1, ref5 = last; (1 <= ref5 ? r < ref5 : r > ref5); l = 1 <= ref5 ? ++r : --r) {
            position(x, y, z, l);
            strip(l - 1, l + 1, f = -f);
          }
          position(x, y, z, last);
          strip(last - 2, last - 1, -f);
        }
      }
    }
    this._finalize();
    this.clip();
    return;
  }

  clip(width = this.width, height = this.height, depth = this.depth, items = this.items) {
    var sides;
    sides = Math.max(0, items - 2);
    this._clipGeometry(width, height, depth, items);
    return this._clipOffsets(3, width, height, depth, sides, this.width, this.height, this.depth, this.sides);
  }

};

module.exports = StripGeometry;


},{"./clipgeometry":155}],163:[function(require,module,exports){
var ClipGeometry, SurfaceGeometry;

ClipGeometry = require('./clipgeometry');

/*
Grid Surface

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
 */
SurfaceGeometry = class SurfaceGeometry extends ClipGeometry {
  constructor(options, build = true) {
    super();
    if (build) {
      // TODO not great... but use this pattern, maybe, to defer construction if
      // options are missing, NOT the boolean.
      this.construct(options);
    }
  }

  construct(options) {
    var base, closedX, closedY, edgeX, edgeY, edgerX, edgerY, height, i, index, j, k, l, layers, m, n, o, p, points, position, q, quads, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, s, segmentsX, segmentsY, surface, surfaces, triangles, width, wrapX, wrapY, x, y, z;
    this._clipUniforms();
    this.closedX = closedX = options.closedX || false;
    this.closedY = closedY = options.closedY || false;
    this.width = width = (+options.width || 2) + (closedX ? 1 : 0);
    this.height = height = (+options.height || 2) + (closedY ? 1 : 0);
    this.surfaces = surfaces = +options.surfaces || 1;
    this.layers = layers = +options.layers || 1;
    wrapX = width - (closedX ? 1 : 0);
    wrapY = height - (closedY ? 1 : 0);
    this.segmentsX = segmentsX = Math.max(0, width - 1);
    this.segmentsY = segmentsY = Math.max(0, height - 1);
    points = width * height * surfaces * layers;
    quads = segmentsX * segmentsY * surfaces * layers;
    triangles = quads * 2;
    this.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1));
    this.addAttribute('position4', new THREE.BufferAttribute(new Float32Array(points * 4), 4));
    this.addAttribute('surface', new THREE.BufferAttribute(new Float32Array(points * 2), 2));
    this._autochunk();
    index = this._emitter('index');
    position = this._emitter('position4');
    surface = this._emitter('surface');
    base = 0;
    for (i = m = 0, ref = surfaces * layers; (0 <= ref ? m < ref : m > ref); i = 0 <= ref ? ++m : --m) {
      for (j = n = 0, ref1 = segmentsY; (0 <= ref1 ? n < ref1 : n > ref1); j = 0 <= ref1 ? ++n : --n) {
        for (k = o = 0, ref2 = segmentsX; (0 <= ref2 ? o < ref2 : o > ref2); k = 0 <= ref2 ? ++o : --o) {
          index(base);
          index(base + 1);
          index(base + width);
          index(base + width);
          index(base + 1);
          index(base + width + 1);
          base++;
        }
        base++;
      }
      base += width;
    }
    edgerX = closedX ? function() {
      return 0;
    } : function(x) {
      if (x === 0) {
        return -1;
      } else if (x === segmentsX) {
        return 1;
      } else {
        return 0;
      }
    };
    edgerY = closedY ? function() {
      return 0;
    } : function(y) {
      if (y === 0) {
        return -1;
      } else if (y === segmentsY) {
        return 1;
      } else {
        return 0;
      }
    };
    for (l = p = 0, ref3 = layers; (0 <= ref3 ? p < ref3 : p > ref3); l = 0 <= ref3 ? ++p : --p) {
      for (z = q = 0, ref4 = surfaces; (0 <= ref4 ? q < ref4 : q > ref4); z = 0 <= ref4 ? ++q : --q) {
        for (y = r = 0, ref5 = height; (0 <= ref5 ? r < ref5 : r > ref5); y = 0 <= ref5 ? ++r : --r) {
          if (closedY) {
            y = y % wrapY;
          }
          edgeY = edgerY(y);
          for (x = s = 0, ref6 = width; (0 <= ref6 ? s < ref6 : s > ref6); x = 0 <= ref6 ? ++s : --s) {
            if (closedX) {
              x = x % wrapX;
            }
            edgeX = edgerX(x);
            position(x, y, z, l);
            surface(edgeX, edgeY);
          }
        }
      }
    }
    this._finalize();
    this.clip();
  }

  clip(width = this.width, height = this.height, surfaces = this.surfaces, layers = this.layers) {
    var segmentsX, segmentsY;
    segmentsX = Math.max(0, width - 1);
    segmentsY = Math.max(0, height - 1);
    this._clipGeometry(width, height, surfaces, layers);
    return this._clipOffsets(6, segmentsX, segmentsY, surfaces, layers, this.segmentsX, this.segmentsY, this.surfaces, this.layers);
  }

  map(width = this.width, height = this.height, surfaces = this.surfaces, layers = this.layers) {
    return this._clipMap(width, height, surfaces, layers);
  }

};

module.exports = SurfaceGeometry;


},{"./clipgeometry":155}],164:[function(require,module,exports){
exports.Scene = require('./scene');

exports.Factory = require('./factory');

exports.Renderable = require('./scene');

exports.Classes = require('./classes');


},{"./classes":152,"./factory":153,"./scene":177}],165:[function(require,module,exports){
var Arrow, ArrowGeometry, Base;

Base = require('./base');

ArrowGeometry = require('../geometry').ArrowGeometry;

Arrow = class Arrow extends Base {
  constructor(renderer, shaders, options) {
    var color, combine, f, factory, hasStyle, linear, map, mask, material, object, position, stpq, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, material, position, color, mask, map, combine, stpq, linear} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    hasStyle = uniforms.styleColor != null;
    this.geometry = new ArrowGeometry({
      sides: options.sides,
      samples: options.samples,
      strips: options.strips,
      ribbons: options.ribbons,
      layers: options.layers,
      anchor: options.anchor,
      flip: options.flip
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    v = factory.vertex;
    v.pipe(this._vertexColor(color, mask));
    v.require(this._vertexPosition(position, material, map, 1, stpq));
    v.pipe('arrow.position', this.uniforms);
    v.pipe('project.position', this.uniforms);
    factory.fragment = f = this._fragmentColor(hasStyle, material, color, mask, map, 1, stpq, combine, linear);
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({}));
    object = new THREE.Mesh(this.geometry, this.material);
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;
    this._raw(object);
    this.renders = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renders = this.geometry = this.material = null;
    return super.dispose();
  }

};

module.exports = Arrow;


},{"../geometry":158,"./base":166}],166:[function(require,module,exports){
var Base, Renderable, Util;

Renderable = require('../renderable');

Util = require('../../util');

Base = class Base extends Renderable {
  constructor(renderer, shaders, options) {
    var ref;
    super(renderer, shaders, options);
    this.zUnits = (ref = options.zUnits) != null ? ref : 0;
  }

  raw() {
    var i, len, object, ref;
    ref = this.renders;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      this._raw(object);
    }
    return null;
  }

  depth(write, test) {
    var i, len, object, ref;
    ref = this.renders;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      this._depth(object, write, test);
    }
    return null;
  }

  polygonOffset(factor, units) {
    var i, len, object, ref;
    ref = this.renders;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      this._polygonOffset(object, factor, units);
    }
    return null;
  }

  show(transparent, blending, order) {
    var i, len, object, ref, results;
    ref = this.renders;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      results.push(this._show(object, transparent, blending, order));
    }
    return results;
  }

  hide() {
    var i, len, object, ref;
    ref = this.renders;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      this._hide(object);
    }
    return null;
  }

  _material(options) {
    var fragmentPrefix, i, key, len, material, precision, ref, vertexPrefix;
    precision = this.renderer.getPrecision();
    vertexPrefix = `    precision ${precision} float;
    precision ${precision} int;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;`;
    fragmentPrefix = `    precision ${precision} float;
    precision ${precision} int;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;`;
    material = new THREE.RawShaderMaterial(options);
    ref = ['vertexGraph', 'fragmentGraph'];
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      material[key] = options[key];
    }
    material.vertexShader = [vertexPrefix, material.vertexShader].join('\n');
    material.fragmentShader = [fragmentPrefix, material.fragmentShader].join('\n');
    return material;
  }

  _raw(object) {
    object.rotationAutoUpdate = false;
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;
    return object.material.defaultAttributeValues = void 0;
  }

  _depth(object, write, test) {
    var m;
    m = object.material;
    m.depthWrite = write;
    return m.depthTest = test;
  }

  _polygonOffset(object, factor, units) {
    var enabled, m;
    units -= this.zUnits;
    enabled = units !== 0;
    m = object.material;
    m.polygonOffset = enabled;
    if (enabled) {
      m.polygonOffsetFactor = factor;
      return m.polygonOffsetUnits = units;
    }
  }

  _show(object, transparent, blending, order) {
    var m;
    // Force transparent to true to ensure all renderables drawn in order
    transparent = true;
    m = object.material;
    object.renderOrder = -order;
    object.visible = true;
    m.transparent = transparent;
    m.blending = blending;
    return null;
  }

  _hide(object) {
    return object.visible = false;
  }

  _vertexColor(color, mask) {
    var v;
    if (!(color || mask)) {
      return;
    }
    v = this.shaders.shader();
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (mask) {
      v.require(mask);
      v.pipe('mesh.vertex.mask', this.uniforms);
    }
    return v;
  }

  _vertexPosition(position, material, map, channels, stpq) {
    var defs, v;
    v = this.shaders.shader();
    if (map || (material && material !== true)) {
      defs = {};
      if (channels > 0 || stpq) {
        defs.POSITION_MAP = '';
      }
      if (channels > 0) {
        defs[['POSITION_U', 'POSITION_UV', 'POSITION_UVW', 'POSITION_UVWO'][channels - 1]] = '';
      }
      if (stpq) {
        defs.POSITION_STPQ = '';
      }
    }
    v.require(position);
    return v.pipe('mesh.vertex.position', this.uniforms, defs);
  }

  _fragmentColor(hasStyle, material, color, mask, map, channels, stpq, combine, linear) {
    var defs, f, gamma, join;
    f = this.shaders.shader();
    // metacode is terrible
    join = false;
    gamma = false;
    defs = {};
    if (channels > 0) {
      defs[['POSITION_U', 'POSITION_UV', 'POSITION_UVW', 'POSITION_UVWO'][channels - 1]] = '';
    }
    if (stpq) {
      defs.POSITION_STPQ = '';
    }
    if (hasStyle) {
      f.pipe('style.color', this.uniforms);
      join = true;
      if (color || map || material) {
        if (!linear || color) {
          f.pipe('mesh.gamma.in');
        }
        gamma = true;
      }
    }
    if (color) {
      f.isolate();
      f.pipe('mesh.fragment.color', this.uniforms);
      if (!linear || join) {
        f.pipe('mesh.gamma.in');
      }
      f.end();
      if (join) {
        f.pipe(Util.GLSL.binaryOperator('vec4', '*'));
      }
      if (linear && join) {
        f.pipe('mesh.gamma.out');
      }
      join = true;
      gamma = true;
    }
    if (map) {
      if (!join && combine) {
        f.pipe(Util.GLSL.constant('vec4', 'vec4(1.0)'));
      }
      f.isolate();
      f.require(map);
      f.pipe('mesh.fragment.map', this.uniforms, defs);
      if (!linear) {
        f.pipe('mesh.gamma.in');
      }
      f.end();
      if (combine) {
        f.pipe(combine);
      } else {
        if (join) {
          f.pipe(Util.GLSL.binaryOperator('vec4', '*'));
        }
      }
      join = true;
      gamma = true;
    }
    if (material) {
      if (!join) {
        f.pipe(Util.GLSL.constant('vec4', 'vec4(1.0)'));
      }
      if (material === true) {
        f.pipe('mesh.fragment.shaded', this.uniforms);
      } else {
        f.require(material);
        f.pipe('mesh.fragment.material', this.uniforms, defs);
      }
      gamma = true;
    }
    if (gamma && !linear) {
      f.pipe('mesh.gamma.out');
    }
    if (mask) {
      f.pipe('mesh.fragment.mask', this.uniforms);
      if (join) {
        f.pipe(Util.GLSL.binaryOperator('vec4', '*'));
      }
    }
    return f;
  }

};

module.exports = Base;


},{"../../util":190,"../renderable":176}],167:[function(require,module,exports){
var Base, Debug;

Base = require('./base');

Debug = class Debug extends Base {
  constructor(renderer, shaders, options) {
    var object;
    super(renderer, shaders, options);
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({
      map: options.map
    });
    this.material.side = THREE.DoubleSide;
    object = new THREE.Mesh(this.geometry, this.material);
    object.position.x += options.x || 0;
    object.position.y += options.y || 0;
    object.frustumCulled = false;
    object.scale.set(2, 2, 2);
    object.__debug = true;
    this.objects = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return super.dispose();
  }

};

module.exports = Debug;


},{"./base":166}],168:[function(require,module,exports){
var Base, Face, FaceGeometry;

Base = require('./base');

FaceGeometry = require('../geometry').FaceGeometry;

Face = class Face extends Base {
  constructor(renderer, shaders, options) {
    var color, combine, f, factory, hasStyle, linear, map, mask, material, object, position, stpq, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, material, position, color, mask, map, combine, stpq, linear} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    if (material == null) {
      material = true;
    }
    hasStyle = uniforms.styleColor != null;
    this.geometry = new FaceGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    v = factory.vertex;
    v.pipe(this._vertexColor(color, mask));
    v.require(this._vertexPosition(position, material, map, 2, stpq));
    if (!material) {
      v.pipe('face.position', this.uniforms);
    }
    if (material) {
      v.pipe('face.position.normal', this.uniforms);
    }
    v.pipe('project.position', this.uniforms);
    factory.fragment = f = this._fragmentColor(hasStyle, material, color, mask, map, 2, stpq, combine, linear);
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.renders = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renders = this.geometry = this.material = null;
    return super.dispose();
  }

};

module.exports = Face;


},{"../geometry":158,"./base":166}],169:[function(require,module,exports){
var Base, Line, LineGeometry;

Base = require('./base');

LineGeometry = require('../geometry').LineGeometry;

Line = class Line extends Base {
  constructor(renderer, shaders, options) {
    var clip, color, combine, defs, detail, f, factory, hasStyle, join, linear, map, mask, material, object, position, proximity, ref, stpq, stroke, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, material, position, color, mask, map, combine, stpq, linear, clip, stroke, join, proximity} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    stroke = [null, 'dotted', 'dashed'][stroke];
    hasStyle = uniforms.styleColor != null;
    // Line join
    join = (ref = ['miter', 'round', 'bevel'][join]) != null ? ref : 'miter';
    detail = {
      miter: 1,
      round: 4,
      bevel: 2
    }[join];
    this.geometry = new LineGeometry({
      samples: options.samples,
      strips: options.strips,
      ribbons: options.ribbons,
      layers: options.layers,
      anchor: options.anchor,
      closed: options.closed,
      detail: detail
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    defs = {};
    if (stroke) {
      defs.LINE_STROKE = '';
    }
    if (clip) {
      defs.LINE_CLIP = '';
    }
    if (proximity != null) {
      defs.LINE_PROXIMITY = '';
    }
    defs['LINE_JOIN_' + join.toUpperCase()] = '';
    if (detail > 1) {
      defs['LINE_JOIN_DETAIL'] = detail;
    }
    v = factory.vertex;
    v.pipe(this._vertexColor(color, mask));
    v.require(this._vertexPosition(position, material, map, 2, stpq));
    v.pipe('line.position', this.uniforms, defs);
    v.pipe('project.position', this.uniforms);
    f = factory.fragment;
    if (stroke) {
      f.pipe(`fragment.clip.${stroke}`, this.uniforms);
    }
    if (clip) {
      f.pipe('fragment.clip.ends', this.uniforms);
    }
    if (proximity != null) {
      f.pipe('fragment.clip.proximity', this.uniforms);
    }
    f.pipe(this._fragmentColor(hasStyle, material, color, mask, map, 2, stpq, combine, linear));
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.renders = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renders = this.geometry = this.material = null;
    return super.dispose();
  }

};

module.exports = Line;


},{"../geometry":158,"./base":166}],170:[function(require,module,exports){
var MemoScreen, Screen, Util;

Screen = require('./screen');

Util = require('../../util');

MemoScreen = class MemoScreen extends Screen {
  constructor(renderer, shaders, options) {
    var depth, height, i, inv, inv1, items, len, map, object, ref, stpq, uniforms, width;
    ({items, width, height, depth, stpq} = options);
    inv = function(x) {
      return 1 / Math.max(1, x);
    };
    inv1 = function(x) {
      return 1 / Math.max(1, x - 1);
    };
    uniforms = {
      remapUVScale: {
        type: 'v2',
        value: new THREE.Vector2(items * width, height * depth)
      },
      remapModulus: {
        type: 'v2',
        value: new THREE.Vector2(items, height)
      },
      remapModulusInv: {
        type: 'v2',
        value: new THREE.Vector2(inv(items), inv(height))
      },
      remapSTPQScale: {
        type: 'v4',
        value: new THREE.Vector4(inv1(width), inv1(height), inv1(depth), inv1(items))
      }
    };
    map = shaders.shader();
    map.pipe('screen.map.xyzw', uniforms);
    if (options.map != null) {
      if (stpq) {
        // Need artifical STPQs because the screen is not the real geometry
        map.pipe('screen.map.stpq', uniforms);
      }
      map.pipe(options.map);
    }
    super(renderer, shaders, {
      map,
      linear: true
    });
    this.memo = options;
    this.uniforms = uniforms;
    ref = this.renders;
    for (i = 0, len = ref.length; i < len; i++) {
      object = ref[i];
      object.transparent = false;
    }
    null;
  }

  cover(width = this.memo.width, height = this.memo.height, depth = this.memo.depth, items = this.memo.items) {
    var inv1, x, y;
    inv1 = function(x) {
      return 1 / Math.max(1, x - 1);
    };
    this.uniforms.remapSTPQScale.value.set(inv1(width), inv1(height), inv1(depth), inv1(items));
    x = width / this.memo.width;
    y = depth / this.memo.depth;
    if (this.memo.depth === 1) {
      y = height / this.memo.height;
    }
    return this.geometry.cover(x, y);
  }

};

module.exports = MemoScreen;


},{"../../util":190,"./screen":172}],171:[function(require,module,exports){
var Base, Point, SpriteGeometry;

Base = require('./base');

SpriteGeometry = require('../geometry').SpriteGeometry;

Point = class Point extends Base {
  constructor(renderer, shaders, options) {
    var _scale, _shape, alpha, color, combine, defines, edgeFactory, f, factory, fill, fillFactory, hasStyle, linear, map, mask, material, optical, pass, passes, position, ref, ref1, ref2, ref3, scales, shape, shapes, size, stpq, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, material, position, color, size, mask, map, combine, linear, shape, optical, fill, stpq} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    shape = (ref = +shape) != null ? ref : 0;
    if (fill == null) {
      fill = true;
    }
    hasStyle = uniforms.styleColor != null;
    shapes = ['circle', 'square', 'diamond', 'up', 'down', 'left', 'right'];
    passes = ['circle', 'generic', 'generic', 'generic', 'generic', 'generic', 'generic'];
    scales = [1.2, 1, 1.414, 1.16, 1.16, 1.16, 1.16];
    pass = (ref1 = passes[shape]) != null ? ref1 : passes[0];
    _shape = (ref2 = shapes[shape]) != null ? ref2 : shapes[0];
    _scale = (ref3 = optical && scales[shape]) != null ? ref3 : 1;
    alpha = fill ? pass : `${pass}.hollow`;
    this.geometry = new SpriteGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    defines = {
      POINT_SHAPE_SCALE: +(_scale + .00001)
    };
    // Shared vertex shader
    factory = shaders.material();
    v = factory.vertex;
    v.pipe(this._vertexColor(color, mask));
    // Point sizing
    if (size) {
      v.isolate();
      v.require(size);
      v.require('point.size.varying', this.uniforms);
      v.end();
    } else {
      v.require('point.size.uniform', this.uniforms);
    }
    v.require(this._vertexPosition(position, material, map, 2, stpq));
    v.pipe('point.position', this.uniforms, defines);
    v.pipe('project.position', this.uniforms);
    // Shared fragment shader
    factory.fragment = f = this._fragmentColor(hasStyle, material, color, mask, map, 2, stpq, combine, linear);
    // Split fragment into edge and fill pass for better z layering
    edgeFactory = shaders.material();
    edgeFactory.vertex.pipe(v);
    f = edgeFactory.fragment.pipe(factory.fragment);
    f.require(`point.mask.${_shape}`, this.uniforms);
    f.require(`point.alpha.${alpha}`, this.uniforms);
    f.pipe('point.edge', this.uniforms);
    fillFactory = shaders.material();
    fillFactory.vertex.pipe(v);
    f = fillFactory.fragment.pipe(factory.fragment);
    f.require(`point.mask.${_shape}`, this.uniforms);
    f.require(`point.alpha.${alpha}`, this.uniforms);
    f.pipe('point.fill', this.uniforms);
    this.fillMaterial = this._material(fillFactory.link({
      side: THREE.DoubleSide
    }));
    this.edgeMaterial = this._material(edgeFactory.link({
      side: THREE.DoubleSide
    }));
    this.fillObject = new THREE.Mesh(this.geometry, this.fillMaterial);
    this.edgeObject = new THREE.Mesh(this.geometry, this.edgeMaterial);
    this._raw(this.fillObject);
    this._raw(this.edgeObject);
    this.renders = [this.fillObject, this.edgeObject];
  }

  show(transparent, blending, order, depth) {
    this._show(this.edgeObject, true, blending, order, depth);
    return this._show(this.fillObject, transparent, blending, order, depth);
  }

  dispose() {
    this.geometry.dispose();
    this.edgeMaterial.dispose();
    this.fillMaterial.dispose();
    this.renders = this.edgeObject = this.fillObject = this.geometry = this.edgeMaterial = this.fillMaterial = null;
    return super.dispose();
  }

};

module.exports = Point;


},{"../geometry":158,"./base":166}],172:[function(require,module,exports){
var Base, Screen, ScreenGeometry, Util;

Base = require('./base');

ScreenGeometry = require('../geometry').ScreenGeometry;

Util = require('../../util');

Screen = class Screen extends Base {
  constructor(renderer, shaders, options) {
    var combine, f, factory, hasStyle, linear, map, object, stpq, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, map, combine, stpq, linear} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    hasStyle = uniforms.styleColor != null;
    this.geometry = new ScreenGeometry({
      width: options.width,
      height: options.height
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    v = factory.vertex;
    v.pipe('raw.position.scale', this.uniforms);
    v.fan();
    v.pipe('stpq.xyzw.2d', this.uniforms);
    v.next();
    v.pipe('screen.position', this.uniforms);
    v.join();
    factory.fragment = f = this._fragmentColor(hasStyle, false, null, null, map, 2, stpq, combine, linear);
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    object.frustumCulled = false;
    this._raw(object);
    this.renders = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renders = this.geometry = this.material = null;
    return super.dispose();
  }

};

module.exports = Screen;


},{"../../util":190,"../geometry":158,"./base":166}],173:[function(require,module,exports){
var Base, Sprite, SpriteGeometry;

Base = require('./base');

SpriteGeometry = require('../geometry').SpriteGeometry;

Sprite = class Sprite extends Base {
  constructor(renderer, shaders, options) {
    var color, combine, edgeFactory, f, factory, fillFactory, hasStyle, linear, map, mask, material, position, sprite, stpq, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, material, position, sprite, map, combine, linear, color, mask, stpq} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    hasStyle = uniforms.styleColor != null;
    this.geometry = new SpriteGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    // Shared vertex shader
    factory = shaders.material();
    v = factory.vertex;
    v.pipe(this._vertexColor(color, mask));
    v.require(this._vertexPosition(position, material, map, 2, stpq));
    v.require(sprite);
    v.pipe('sprite.position', this.uniforms);
    v.pipe('project.position', this.uniforms);
    // Shared fragment shader
    factory.fragment = f = this._fragmentColor(hasStyle, material, color, mask, map, 2, stpq, combine, linear);
    // Split fragment into edge and fill pass for better z layering
    edgeFactory = shaders.material();
    edgeFactory.vertex.pipe(v);
    edgeFactory.fragment.pipe(f);
    edgeFactory.fragment.pipe('fragment.transparent', this.uniforms);
    fillFactory = shaders.material();
    fillFactory.vertex.pipe(v);
    fillFactory.fragment.pipe(f);
    fillFactory.fragment.pipe('fragment.solid', this.uniforms);
    this.fillMaterial = this._material(fillFactory.link({
      side: THREE.DoubleSide
    }));
    this.edgeMaterial = this._material(edgeFactory.link({
      side: THREE.DoubleSide
    }));
    this.fillObject = new THREE.Mesh(this.geometry, this.fillMaterial);
    this.edgeObject = new THREE.Mesh(this.geometry, this.edgeMaterial);
    this._raw(this.fillObject);
    this._raw(this.edgeObject);
    this.renders = [this.fillObject, this.edgeObject];
  }

  show(transparent, blending, order, depth) {
    this._show(this.edgeObject, true, blending, order, depth);
    return this._show(this.fillObject, transparent, blending, order, depth);
  }

  dispose() {
    this.geometry.dispose();
    this.edgeMaterial.dispose();
    this.fillMaterial.dispose();
    this.nreders = this.geometry = this.edgeMaterial = this.fillMaterial = this.edgeObject = this.fillObject = null;
    return super.dispose();
  }

};

module.exports = Sprite;


},{"../geometry":158,"./base":166}],174:[function(require,module,exports){
var Base, Strip, StripGeometry;

Base = require('./base');

StripGeometry = require('../geometry').StripGeometry;

Strip = class Strip extends Base {
  constructor(renderer, shaders, options) {
    var color, combine, f, factory, hasStyle, linear, map, mask, material, object, position, stpq, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, material, position, color, mask, map, combine, linear, stpq} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    if (material == null) {
      material = true;
    }
    hasStyle = uniforms.styleColor != null;
    this.geometry = new StripGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    v = factory.vertex;
    v.pipe(this._vertexColor(color, mask));
    v.require(this._vertexPosition(position, material, map, 2, stpq));
    if (!material) {
      v.pipe('mesh.position', this.uniforms);
    }
    if (material) {
      v.pipe('strip.position.normal', this.uniforms);
    }
    v.pipe('project.position', this.uniforms);
    factory.fragment = f = this._fragmentColor(hasStyle, material, color, mask, map, 2, stpq, combine, linear);
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.renders = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renders = this.geometry = this.material = null;
    return super.dispose();
  }

};

module.exports = Strip;


},{"../geometry":158,"./base":166}],175:[function(require,module,exports){
var Base, Surface, SurfaceGeometry, Util;

Base = require('./base');

SurfaceGeometry = require('../geometry').SurfaceGeometry;

Util = require('../../util');

Surface = class Surface extends Base {
  constructor(renderer, shaders, options) {
    var color, combine, defs, f, factory, hasHollow, hasStyle, intUV, linear, map, mask, material, object, position, stpq, uniforms, v;
    super(renderer, shaders, options);
    ({uniforms, material, position, color, mask, map, combine, linear, stpq, intUV} = options);
    if (uniforms == null) {
      uniforms = {};
    }
    if (material == null) {
      material = true;
    }
    hasStyle = uniforms.styleColor != null;
    hasHollow = uniforms.surfaceHollow != null;
    this.geometry = new SurfaceGeometry({
      width: options.width,
      height: options.height,
      surfaces: options.surfaces,
      layers: options.layers,
      closedX: options.closedX,
      closedY: options.closedY
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    v = factory.vertex;
    if (intUV) {
      defs = {
        POSITION_UV_INT: ''
      };
    }
    v.pipe(this._vertexColor(color, mask));
    v.require(this._vertexPosition(position, material, map, 2, stpq));
    if (!material) {
      v.pipe('surface.position', this.uniforms, defs);
    }
    if (material) {
      v.pipe('surface.position.normal', this.uniforms, defs);
    }
    v.pipe('project.position', this.uniforms);
    factory.fragment = f = this._fragmentColor(hasStyle, material, color, mask, map, 2, stpq, combine, linear);
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.renders = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renders = this.geometry = this.material = null;
    return super.dispose();
  }

};

module.exports = Surface;


},{"../../util":190,"../geometry":158,"./base":166}],176:[function(require,module,exports){
var Renderable;

Renderable = class Renderable {
  constructor(renderer, shaders) {
    this.renderer = renderer;
    this.shaders = shaders;
    this.gl = this.renderer.context;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
  }

  dispose() {
    return this.uniforms = null;
  }

  _adopt(uniforms) {
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      this.uniforms[key] = value;
    }
  }

  _set(uniforms) {
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      if (this.uniforms[key] != null) {
        this.uniforms[key].value = value;
      }
    }
  }

};

module.exports = Renderable;


},{}],177:[function(require,module,exports){
var MathBox, Renderable, Scene,
  indexOf = [].indexOf;

Renderable = require('./renderable');

/*
 All MathBox renderables sit inside this root, to keep things tidy.
*/
MathBox = class MathBox extends THREE.Object3D {
  constructor() {
    super();
    this.rotationAutoUpdate = false;
    this.frustumCulled = false;
    this.matrixAutoUpdate = false;
  }

};

/*
 Holds the root and binds to a THREE.Scene

 Will hold objects and inject them a few at a time
 to avoid long UI blocks.

 Will render injected objects to a 1x1 scratch buffer to ensure availability
*/
Scene = class Scene extends Renderable {
  constructor(renderer, shaders, options) {
    super(renderer, shaders, options);
    this.root = new MathBox();
    if ((options != null ? options.scene : void 0) != null) {
      this.scene = options.scene;
    }
    if (this.scene == null) {
      this.scene = new THREE.Scene();
    }
    this.pending = [];
    this.async = 0;
    this.scratch = new THREE.WebGLRenderTarget(1, 1);
    this.camera = new THREE.PerspectiveCamera();
  }

  inject(scene) {
    if (scene != null) {
      this.scene = scene;
    }
    return this.scene.add(this.root);
  }

  unject() {
    var ref;
    return (ref = this.scene) != null ? ref.remove(this.root) : void 0;
  }

  add(object) {
    if (this.async) {
      return this.pending.push(object);
    } else {
      return this._add(object);
    }
  }

  remove(object) {
    this.pending = this.pending.filter(function(o) {
      return o !== object;
    });
    if (object.parent != null) {
      return this._remove(object);
    }
  }

  _add(object) {
    return this.root.add(object);
  }

  _remove(object) {
    return this.root.remove(object);
  }

  dispose() {
    if (this.root.parent != null) {
      return this.unject();
    }
  }

  warmup(n) {
    return this.async = +n || 0;
  }

  render() {
    var added, children, i, j, pending, ref, visible;
    if (!this.pending.length) {
      return;
    }
    ({children} = this.root);
    // Insert up to @async children
    added = [];
    for (i = j = 0, ref = this.async; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      pending = this.pending.shift();
      if (!pending) {
        break;
      }
      // Insert new child
      this._add(pending);
      added.push(added);
    }
    // Remember current visibility
    visible = children.map(function(o) {
      var v;
      return v = o.visible;
    });
    // Force only this child visible
    children.map(function(o) {
      return o.visible = indexOf.call(added, o) < 0;
    });
    // Render and throw away
    this.renderer.render(this.scene, this.camera, this.scratch);
    // Restore visibility
    return children.map(function(o, i) {
      return o.visible = visible[i];
    });
  }

  toJSON() {
    return this.root.toJSON();
  }

};

module.exports = Scene;


},{"./renderable":176}],178:[function(require,module,exports){
var Factory, ShaderGraph;

ShaderGraph = require('../../vendor/shadergraph/src');

Factory = function(snippets) {
  var fetch;
  fetch = function(name) {
    var element, ref, ref1, s, sel;
    // Built-in library
    s = snippets[name];
    if (s != null) {
      return s;
    }
    // Load from <script> tags by ID
    ref = (ref1 = name[0]) === '#' || ref1 === '.' || ref1 === ':' || ref1 === '[';
    sel = ref ? name : `#${name}`;
    element = document.querySelector(sel);
    if ((element != null) && element.tagName === 'SCRIPT') {
      return element.textContent || element.innerText;
    }
    throw new Error(`Unknown shader \`${name}\``);
  };
  return new ShaderGraph(fetch, {
    autoInspect: true
  });
};

module.exports = Factory;


},{"../../vendor/shadergraph/src":223}],179:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Snippets = require('../../build/shaders'); // Compiled in build step


},{"../../build/shaders":1,"./factory":178}],180:[function(require,module,exports){
// Threestrap plugin
THREE.Bootstrap.registerPlugin('splash', {
  defaults: {
    color: 'mono',
    fancy: true
  },
  listen: ['ready', 'mathbox/init:init', 'mathbox/progress:progress', 'mathbox/destroy:destroy'],
  uninstall: function() {
    return this.destroy();
  },
  ready: function(event, three) {
    if (three.MathBox && !this.div) {
      return init(event, three);
    }
  },
  init: function(event, three) {
    var color, div, html, l, x, y, z;
    this.destroy();
    ({color} = this.options);
    html = `<div class="mathbox-loader mathbox-splash-${color}">
  <div class="mathbox-logo">
    <div> <div></div><div></div><div></div> </div>
    <div> <div></div><div></div><div></div> </div>
  </div>
  <div class="mathbox-progress"><div></div></div>
</div>`;
    this.div = div = document.createElement('div');
    div.innerHTML = html;
    three.element.appendChild(div);
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    l = 1 / Math.sqrt(x * x + y * y + z * z);
    this.loader = div.querySelector('.mathbox-loader');
    this.bar = div.querySelector('.mathbox-progress > div');
    this.gyro = div.querySelectorAll('.mathbox-logo > div');
    this.transforms = ["rotateZ(22deg) rotateX(24deg) rotateY(30deg)", "rotateZ(11deg) rotateX(12deg) rotateY(15deg) scale3d(.6, .6, .6)"];
    this.random = [x * l, y * l, z * l];
    this.start = three.Time.now;
    return this.timer = null;
  },
  // Update splash screen state and animation
  progress: function(event, three) {
    var current, el, f, i, increment, k, len, ref, results, t, total, visible, weights, width;
    if (!this.div) {
      return;
    }
    ({current, total} = event);
    // Display splash screen
    visible = current < total;
    clearTimeout(this.timer);
    if (visible) {
      this.loader.classList.remove('mathbox-exit');
      this.loader.style.display = 'block';
    } else {
      this.loader.classList.add('mathbox-exit');
      this.timer = setTimeout((() => {
        return this.loader.style.display = 'none';
      }), 150);
    }
    // Update splash progress
    width = current < total ? (Math.round(1000 * current / total) * .1) + '%' : '100%';
    this.bar.style.width = width;
    if (this.options.fancy) {
      // Spinny gyros
      weights = this.random;
      // Lerp clock speed
      f = Math.max(0, Math.min(1, three.Time.now - this.start));
      increment = function(transform, j = 0) {
        return transform.replace(/(-?[0-9.e]+)deg/g, function(_, n) {
          return (+n + weights[j++] * f * three.Time.step * 60) + 'deg';
        });
      };
      ref = this.gyro;
      results = [];
      for (i = k = 0, len = ref.length; k < len; i = ++k) {
        el = ref[i];
        this.transforms[i] = t = increment(this.transforms[i]);
        results.push(el.style.transform = el.style.WebkitTransform = t);
      }
      return results;
    }
  },
  destroy: function() {
    var ref;
    if ((ref = this.div) != null) {
      ref.remove();
    }
    return this.div = null;
  }
});


},{}],181:[function(require,module,exports){
var Animation, Animator, Ease;

({Ease} = require('../util'));

Animator = class Animator {
  constructor(context) {
    this.context = context;
    this.anims = [];
  }

  make(type, options) {
    var anim;
    anim = new Animation(this, this.context.time, type, options);
    this.anims.push(anim);
    return anim;
  }

  unmake(anim) {
    var a;
    return this.anims = (function() {
      var i, len, ref, results;
      ref = this.anims;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        a = ref[i];
        if (a !== anim) {
          results.push(a);
        }
      }
      return results;
    }).call(this);
  }

  update() {
    var anim, time;
    ({time} = this.context);
    return this.anims = (function() {
      var i, len, ref, results;
      ref = this.anims;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        anim = ref[i];
        if (anim.update(time) !== false) {
          results.push(anim);
        }
      }
      return results;
    }).call(this);
  }

  lerp(type, from, to, f, value) {
    var emitter, fromE, lerp, toE;
    if (value == null) {
      value = type.make();
    }
    // Use the most appropriate interpolation method for the type

    // Direct lerp operator
    if (type.lerp) {
      value = type.lerp(from, to, value, f);
    // Substitute emitter
    } else if (type.emitter) {
      fromE = from.emitterFrom;
      toE = to.emitterTo;
      if ((fromE != null) && (toE != null) && fromE === toE) {
        fromE.lerp(f);
        return fromE;
      } else {
        emitter = type.emitter(from, to);
        from.emitterFrom = emitter;
        to.emitterTo = emitter;
      }
    // Generic binary operator
    } else if (type.op) {
      lerp = function(a, b) {
        if (a === +a && b === +b) {
          // Lerp numbers
          return a + (b - a) * f;
        } else {
          // No lerp
          if (f > .5) {
            return b;
          } else {
            return a;
          }
        }
      };
      value = type.op(from, to, value, lerp);
    } else {
      // No lerp
      value = f > .5 ? to : from;
    }
    return value;
  }

};

Animation = class Animation {
  constructor(animator, time1, type1, options1) {
    this.animator = animator;
    this.time = time1;
    this.type = type1;
    this.options = options1;
    this.value = this.type.make();
    this.target = this.type.make();
    this.queue = [];
  }

  dispose() {
    return this.animator.unmake(this);
  }

  set() {
    var invalid, target, value;
    target = this.target;
    value = arguments.length > 1 ? [].slice.call(arguments) : arguments[0];
    invalid = false;
    value = this.type.validate(value, target, function() {
      return invalid = true;
    });
    if (!invalid) {
      target = value;
    }
    this.cancel();
    this.target = this.value;
    this.value = target;
    return this.notify();
  }

  getTime() {
    var clock, time;
    clock = this.options.clock;
    time = clock ? clock.getTime() : this.time;
    if (this.options.realtime) {
      return time.time;
    } else {
      return time.clock;
    }
  }

  cancel(from) {
    var base, cancelled, i, len, queue, stage;
    if (from == null) {
      from = this.getTime();
    }
    queue = this.queue;
    cancelled = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = queue.length; i < len; i++) {
        stage = queue[i];
        if (stage.end >= from) {
          results.push(stage);
        }
      }
      return results;
    })();
    this.queue = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = queue.length; i < len; i++) {
        stage = queue[i];
        if (stage.end < from) {
          results.push(stage);
        }
      }
      return results;
    })();
    for (i = 0, len = cancelled.length; i < len; i++) {
      stage = cancelled[i];
      if (typeof stage.complete === "function") {
        stage.complete(false);
      }
    }
    if (typeof (base = this.options).complete === "function") {
      base.complete(false);
    }
  }

  notify() {
    var base;
    return typeof (base = this.options).step === "function" ? base.step(this.value) : void 0;
  }

  immediate(value, options) {
    var complete, delay, duration, ease, end, invalid, start, step, target, time;
    ({duration, delay, ease, step, complete} = options);
    time = this.getTime();
    start = time + delay;
    end = start + duration;
    invalid = false;
    target = this.type.make();
    value = this.type.validate(value, target, function() {
      invalid = true;
      return null;
    });
    if (value !== void 0) {
      target = value;
    }
    this.cancel(start);
    return this.queue.push({
      from: null,
      to: target,
      start,
      end,
      ease,
      step,
      complete
    });
  }

  update(time1) {
    var active, base, clock, complete, ease, end, f, from, method, queue, stage, start, step, to, value;
    this.time = time1;
    if (this.queue.length === 0) {
      return true;
    }
    clock = this.getTime();
    ({value, queue} = this);
    active = false;
    while (!active) {
      ({from, to, start, end, step, complete, ease} = stage = queue[0]);
      if (from == null) {
        from = stage.from = this.type.clone(this.value);
      }
      f = Ease.clamp(((clock - start) / Math.max(0.00001, end - start)) || 0, 0, 1);
      if (f === 0) { // delayed animation not yet active
        return;
      }
      method = (function() {
        switch (ease) {
          case 'linear':
          case 0:
            return null;
          case 'cosine':
          case 1:
            return Ease.cosine;
          case 'binary':
          case 2:
            return Ease.binary;
          case 'hold':
          case 3:
            return Ease.hold;
          default:
            return Ease.cosine;
        }
      })();
      if (method != null) {
        f = method(f);
      }
      active = f < 1;
      value = active ? this.animator.lerp(this.type, from, to, f, value) : to;
      if (typeof step === "function") {
        step(value);
      }
      if (!active) {
        if (typeof complete === "function") {
          complete(true);
        }
        if (typeof (base = this.options).complete === "function") {
          base.complete(true);
        }
        queue.shift();
        if (queue.length === 0) { // end of queue
          break;
        }
      }
    }
    this.value = value;
    return this.notify();
  }

};

module.exports = Animator;


},{"../util":190}],182:[function(require,module,exports){
var API, Util;

Util = require('../util');

API = class API {
  v2() {
    return this;
  }

  constructor(_context, _up, _targets) {
    var i, j, l, len, len1, ref, ref1, root, t, type;
    this._context = _context;
    this._up = _up;
    this._targets = _targets;
    root = this._context.controller.getRoot();
    if (this._targets == null) {
      this._targets = [root];
    }
    this.isRoot = this._targets.length === 1 && this._targets[0] === root;
    this.isLeaf = this._targets.length === 1 && (this._targets[0].children == null);
    ref = this._targets;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      t = ref[i];
      // Look like an array
      this[i] = t;
    }
    this.length = this._targets.length;
    ref1 = this._context.controller.getTypes();
    // Primitive factory
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      type = ref1[l];
      if (type !== 'root') {
        ((type) => {
          return this[type] = (options, binds) => {
            return this.add(type, options, binds);
          };
        })(type);
      }
    }
  }

  select(selector) {
    var targets;
    targets = this._context.model.select(selector, !this.isRoot ? this._targets : null);
    return this._push(targets);
  }

  eq(index) {
    if (this._targets.length > index) {
      return this._push([this._targets[index]]);
    }
    return this._push([]);
  }

  filter(callback) {
    var matcher;
    if (typeof callback === 'string') {
      matcher = this._context.model._matcher(callback);
      callback = function(x) {
        return matcher(x);
      };
    }
    return this._push(this._targets.filter(callback));
  }

  map(callback) {
    var i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      results.push(callback(this[i], i, this));
    }
    return results;
  }

  each(callback) {
    var i, j, ref;
    for (i = j = 0, ref = this.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      callback(this[i], i, this);
    }
    return this;
  }

  add(type, options, binds) {
    var controller, j, len, node, nodes, ref, target;
    // Make node/primitive
    controller = this._context.controller;
    if (this.isLeaf) {
      // Auto-pop if targeting leaf
      return this._pop().add(type, options, binds);
    }
    // Add to target
    nodes = [];
    ref = this._targets;
    for (j = 0, len = ref.length; j < len; j++) {
      target = ref[j];
      node = controller.make(type, options, binds);
      controller.add(node, target);
      nodes.push(node);
    }
    // Return changed selection
    return this._push(nodes);
  }

  remove(selector) {
    var j, len, ref, target;
    if (selector) {
      return this.select(selector).remove();
    }
    ref = this._targets.slice().reverse();
    for (j = 0, len = ref.length; j < len; j++) {
      target = ref[j];
      this._context.controller.remove(target);
    }
    return this._pop();
  }

  set(key, value) {
    var j, len, ref, target;
    ref = this._targets;
    for (j = 0, len = ref.length; j < len; j++) {
      target = ref[j];
      this._context.controller.set(target, key, value);
    }
    return this;
  }

  getAll(key) {
    var j, len, ref, results, target;
    ref = this._targets;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      target = ref[j];
      results.push(this._context.controller.get(target, key));
    }
    return results;
  }

  get(key) {
    var ref;
    return (ref = this._targets[0]) != null ? ref.get(key) : void 0;
  }

  evaluate(key, time) {
    var ref;
    return (ref = this._targets[0]) != null ? ref.evaluate(key, time) : void 0;
  }

  bind(key, value) {
    var j, len, ref, target;
    ref = this._targets;
    for (j = 0, len = ref.length; j < len; j++) {
      target = ref[j];
      this._context.controller.bind(target, key, value);
    }
    return this;
  }

  unbind(key) {
    var j, len, ref, target;
    ref = this._targets;
    for (j = 0, len = ref.length; j < len; j++) {
      target = ref[j];
      this._context.controller.unbind(target, key);
    }
    return this;
  }

  end() {
    return (this.isLeaf ? this._pop() : this)._pop();
  }

  _push(targets) {
    return new API(this._context, this, targets);
  }

  _pop() {
    var ref;
    return (ref = this._up) != null ? ref : this;
  }

  _reset() {
    var ref, ref1;
    return (ref = (ref1 = this._up) != null ? ref1.reset() : void 0) != null ? ref : this;
  }

  map(callback) {
    return this._targets.map(callback);
  }

  ["on"]() {
    var args;
    args = arguments;
    this._targets.map(function(x) {
      return x.on.apply(x, args);
    });
    return this;
  }

  ["off"]() {
    var args;
    args = arguments;
    this._targets.map(function(x) {
      return x.on.apply(x, args);
    });
    return this;
  }

  toString() {
    var tags;
    tags = this._targets.map(function(x) {
      return x.toString();
    });
    if (this._targets.length > 1) {
      return `[${tags.join(", ")}]`;
    } else {
      return tags[0];
    }
  }

  toMarkup() {
    var tags;
    tags = this._targets.map(function(x) {
      return x.toMarkup();
    });
    return tags.join("\n\n");
  }

  print() {
    Util.Pretty.print(this._targets.map(function(x) {
      return x.toMarkup();
    }).join("\n\n"));
    return this;
  }

  debug() {
    var getName, info, j, len, name, ref, shader, shaders;
    info = this.inspect();
    console.log('Renderables: ', info.renderables);
    console.log('Renders: ', info.renders);
    console.log('Shaders: ', info.shaders);
    getName = function(owner) {
      return owner.constructor.toString().match('function +([^(]*)')[1];
    };
    shaders = [];
    ref = info.shaders;
    for (j = 0, len = ref.length; j < len; j++) {
      shader = ref[j];
      name = getName(shader.owner);
      shaders.push(`${name} - Vertex`);
      shaders.push(shader.vertex);
      shaders.push(`${name} - Fragment`);
      shaders.push(shader.fragment);
    }
    return ShaderGraph.inspect(shaders);
  }

  inspect(selector, trait, print) {
    var _info, flatten, info, j, k, len, make, map, recurse, ref, renderables, self, target;
    if (typeof trait === 'boolean') {
      print = trait;
      trait = null;
    }
    if (print == null) {
      print = true;
    }
    // Recurse tree and extract all inserted renderables
    map = function(node) {
      var ref, ref1;
      return (ref = (ref1 = node.controller) != null ? ref1.objects : void 0) != null ? ref : [];
    };
    recurse = self = function(node, list = []) {
      var child, j, len, ref;
      if (!trait || node.traits.hash[trait]) {
        list.push(map(node));
      }
      if (node.children != null) {
        ref = node.children;
        for (j = 0, len = ref.length; j < len; j++) {
          child = ref[j];
          self(child, list);
        }
      }
      return list;
    };
    // Flatten arrays
    flatten = function(list) {
      list = list.reduce((function(a, b) {
        return a.concat(b);
      }), []);
      return list = list.filter(function(x, i) {
        return (x != null) && list.indexOf(x) === i;
      });
    };
    // Render descriptor
    make = function(renderable, render) {
      var d;
      d = {};
      d.owner = renderable;
      d.geometry = render.geometry;
      d.material = render.material;
      d.vertex = render.material.vertexGraph;
      d.fragment = render.material.fragmentGraph;
      return d;
    };
    info = {
      nodes: this._targets.slice(),
      renderables: [],
      renders: [],
      shaders: []
    };
    ref = this._targets;
    // Inspect all targets
    for (j = 0, len = ref.length; j < len; j++) {
      target = ref[j];
      if (print) {
        target.print(selector, 'info');
      }
      _info = {
        renderables: renderables = flatten(recurse(target)),
        renders: flatten(renderables.map(function(x) {
          return x.renders;
        })),
        shaders: flatten(renderables.map(function(x) {
          var ref1;
          return (ref1 = x.renders) != null ? ref1.map(function(r) {
            return make(x, r);
          }) : void 0;
        }))
      };
      for (k in _info) {
        info[k] = info[k].concat(_info[k]);
      }
    }
    return info;
  }

};

module.exports = API;


},{"../util":190}],183:[function(require,module,exports){
var Controller, Util;

Util = require('../util');

Controller = class Controller {
  constructor(model, primitives) {
    this.model = model;
    this.primitives = primitives;
  }

  getRoot() {
    return this.model.getRoot();
  }

  getTypes() {
    return this.primitives.getTypes();
  }

  make(type, options, binds) {
    return this.primitives.make(type, options, binds);
  }

  get(node, key) {
    return node.get(key);
  }

  set(node, key, value) {
    var e;
    try {
      return node.set(key, value);
    } catch (error) {
      e = error;
      node.print(null, 'warn');
      return console.error(e);
    }
  }

  bind(node, key, expr) {
    var e;
    try {
      return node.bind(key, expr);
    } catch (error) {
      e = error;
      node.print(null, 'warn');
      return console.error(e);
    }
  }

  unbind(node, key) {
    var e;
    try {
      return node.unbind(key);
    } catch (error) {
      e = error;
      node.print(null, 'warn');
      return console.error(e);
    }
  }

  add(node, target = this.model.getRoot()) {
    return target.add(node);
  }

  remove(node) {
    var target;
    target = node.parent;
    if (target) {
      return target.remove(node);
    }
  }

};

module.exports = Controller;


},{"../util":190}],184:[function(require,module,exports){
exports.Animator = require('./animator');

exports.API = require('./api');

exports.Controller = require('./controller');


},{"./animator":181,"./api":182,"./controller":183}],185:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"dup":34}],186:[function(require,module,exports){
// Recycled from threestrap

module.exports = self = {
  bind: function (context, globals) {
    return function (key, object) {

      // Prepare object
      if (!object.__binds) {
        object.__binds = [];
      }

      // Set base target
      var fallback = context;
      if (_.isArray(key)) {
        fallback = key[0];
        key = key[1];
      }

      // Match key
      var match = /^([^.:]*(?:\.[^.:]+)*)?(?:\:(.*))?$/.exec(key);
      var path = match[1].split(/\./g);

      var name = path.pop();
      var dest = match[2] || name;

      // Whitelisted objects
      var selector = path.shift();
      var target = {
        'this': object,
      }[selector] || globals[selector] || context[selector] || fallback;

      // Look up keys
      while (target && (key = path.shift())) { target = target[key] };

      // Attach event handler at last level
      if (target && (target.on || target.addEventListener)) {
        var callback = function (event) {
          object[dest] && object[dest](event, context);
        };

        // Polyfill for both styles of event listener adders
        self._polyfill(target, [ 'addEventListener', 'on' ], function (method) {
          target[method](name, callback);
        });

        // Store bind for removal later
        var bind = { target: target, name: name, callback: callback };
        object.__binds.push(bind);

        // Return callback
        return callback;
      }
      else {
        throw "Cannot bind '" + key + "' in " + this.__name;
      }
    };
  },

  unbind: function () {
    return function (object) {
      // Remove all binds belonging to object
      if (object.__binds) {

        object.__binds.forEach(function (bind) {

          // Polyfill for both styles of event listener removers
          self._polyfill(bind.target, [ 'removeEventListener', 'off' ], function (method) {
            bind.target[method](bind.name, bind.callback);
          });
        }.bind(this));

        object.__binds = [];
      }
    }
  },

  apply: function ( object ) {

    THREE.EventDispatcher.prototype.apply(object);

    object.trigger     = self._trigger;
    object.triggerOnce = self._triggerOnce;

    object.on = object.addEventListener;
    object.off = object.removeEventListener;
    object.dispatchEvent = object.trigger;

  },

  ////

  _triggerOnce: function (event) {
    this.trigger(event);
    if (this._listeners) {
      delete this._listeners[event.type]
    }
  },

  _trigger: function (event) {

    if (this._listeners === undefined) return;

    var type = event.type;
    var listeners = this._listeners[type];
    if (listeners !== undefined) {

      listeners = listeners.slice()
      var length = listeners.length;

      event.target = this;
      for (var i = 0; i < length; i++) {
        // add original target as parameter for convenience
        listeners[i].call(this, event, this);
      }
    }
  },

  _polyfill: function (object, methods, callback) {
    methods.map(function (method) { return object.method });
    if (methods.length) callback(methods[0]);
  },

};

},{}],187:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"dup":35}],188:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"dup":36}],189:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"dup":37}],190:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"./axis":185,"./data":187,"./ease":188,"./glsl":189,"./js":191,"./pretty":192,"./three":193,"./ticks":194,"./vdom":195,"dup":38}],191:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"dup":39}],192:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"dup":40}],193:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"dup":41}],194:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],195:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"dup":43}],196:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  Graph of nodes with outlets
*/
class Graph {
  static initClass() {
    this.index = 0;

    this.IN = 0;
    this.OUT = 1;
  }
  static id(name) { return ++Graph.index; }

  constructor(nodes, parent = null) {
    this.parent = parent;
    this.id    = Graph.id();
    this.nodes = [];
    nodes && this.add(nodes);
  }

  inputs() {
    const inputs = [];
    for (let node of Array.from(this.nodes)) {
      for (let outlet of Array.from(node.inputs)) { if (outlet.input === null) { inputs.push(outlet); } }
    }
    return inputs;
  }

  outputs() {
    const outputs = [];
    for (let node of Array.from(this.nodes)) {
      for (let outlet of Array.from(node.outputs)) { if (outlet.output.length === 0) { outputs.push(outlet); } }
    }
    return outputs;
  }

  getIn(name) { return (Array.from(this.inputs()).filter((outlet) => outlet.name === name))[0]; }
  getOut(name) { return (Array.from(this.outputs()).filter((outlet) => outlet.name === name))[0]; }

  add(node, ignore) {

    if (node.length) {
      for (let _node of Array.from(node)) { this.add(_node); }
      return;
    }

    if (node.graph && !ignore) { throw new Error("Adding node to two graphs at once"); }

    node.graph = this;
    return this.nodes.push(node);
  }

  remove(node, ignore) {
    if (node.length) {
      for (let _node of Array.from(node)) { this.remove(_node); }
      return;
    }

    if (node.graph !== this) { throw new Error("Removing node from wrong graph."); }

    ignore || node.disconnect();

    this.nodes.splice(this.nodes.indexOf(node), 1);
    return node.graph = null;
  }

  adopt(node) {
    if (node.length) {
      for (let _node of Array.from(node)) { this.adopt(_node); }
      return;
    }

    node.graph.remove(node, true);
    return this.add(node, true);
  }
}
Graph.initClass();

module.exports = Graph;

},{}],197:[function(require,module,exports){
exports.Graph  = require('./graph');
exports.Node   = require('./node');
exports.Outlet = require('./outlet');

exports.IN  = exports.Graph.IN;
exports.OUT = exports.Graph.OUT;

},{"./graph":196,"./node":198,"./outlet":199}],198:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Graph  = require('./graph');
const Outlet = require('./outlet');

/*
 Node in graph.
*/
class Node {
  static initClass() {
    this.index = 0;
  }
  static id(name) { return ++Node.index; }

  constructor(owner, outlets) {
    this.owner = owner;
    this.graph   = null;
    this.inputs  = [];
    this.outputs = [];
    this.all     = [];
    this.outlets = null;
    this.id      = Node.id();

    this.setOutlets(outlets);
  }

  // Retrieve input
  getIn(name) {
    return (Array.from(this.inputs).filter((outlet) => outlet.name === name))[0];
  }

  // Retrieve output
  getOut(name) {
    return (Array.from(this.outputs).filter((outlet) => outlet.name === name))[0];
  }

  // Retrieve by name
  get(name) {
    return this.getIn(name) || this.getOut(name);
  }

  // Set new outlet definition
  setOutlets(outlets) {
    if (outlets != null) {
      // First init
      let outlet;
      if ((this.outlets == null)) {
        this.outlets = {};
        for (outlet of Array.from(outlets)) {
          if (!(outlet instanceof Outlet)) { outlet = Outlet.make(outlet); }
          this._add(outlet);
        }
        return;
      }

      // Return new/old outlet matching hash key
      const hash = outlet => // Match by name, direction and type.
      [outlet.name, outlet.inout, outlet.type].join('-');

      // Build hash of new outlets
      const match = {};
      for (outlet of Array.from(outlets)) { match[hash(outlet)] = true; }

      // Remove missing outlets, record matches
      for (let key in this.outlets) {
        outlet = this.outlets[key];
        key = hash(outlet);
        if (match[key]) {
          match[key] = outlet;
        } else {
          this._remove(outlet);
        }
      }

      // Insert new outlets
      for (outlet of Array.from(outlets)) {
        // Find match by hash
        const existing = match[hash(outlet)];
        if (existing instanceof Outlet) {
          // Update existing outlets in place to retain connections.
          this._morph(existing, outlet);
        } else {
          // Spawn new outlet
          if (!(outlet instanceof Outlet)) { outlet = Outlet.make(outlet); }
          this._add(outlet);
        }
      }

      this;
    }
    return this.outlets;
  }

  // Connect to the target node by matching up inputs and outputs.
  connect(node, empty, force) {
    let dest, dests, hint, source, type;
    const outlets = {};
    const hints = {};

    const typeHint = outlet => type + '/' + outlet.hint;

    // Hash the types/hints of available target outlets.
    for (dest of Array.from(node.inputs)) {
      // Only autoconnect if not already connected
      var list;
      if (!force && dest.input) { continue; }

      // Match outlets by type/name hint, then type/position key
      ({
        type
      } = dest);
      hint = typeHint(dest);

      if (!hints[hint]) { hints[hint] = dest; }
      outlets[type] = (list = outlets[type] || []);
      list.push(dest);
    }

    // Available source outlets
    let sources = this.outputs;

    // Ignore connected source if only matching empties.
    sources = sources.filter(outlet => !(empty && outlet.output.length));

    // Match hints first
    for (source of Array.from(sources.slice())) {

      // Match outlets by type and name
      ({
        type
      } = source);
      hint = typeHint(source);
      dests = outlets[type];

      // Connect if found
      if (dest = hints[hint]) {
        source.connect(dest);

        // Remove from potential set
        delete hints[hint];
        dests  .splice(dests.indexOf(dest),     1);
        sources.splice(sources.indexOf(source), 1);
      }
    }

    // Match what's left
    if (!sources.length) { return this; }
    for (source of Array.from(sources.slice())) {

      ({
        type
      } = source);
      dests = outlets[type];

      // Match outlets by type and order
      if (dests && dests.length) {
        // Link up and remove from potential set
        source.connect(dests.shift());
      }
    }

    return this;
  }

  // Disconnect entire node
  disconnect(node) {
    let outlet;
    for (outlet of Array.from(this.inputs)) { outlet.disconnect(); }
    for (outlet of Array.from(this.outputs)) { outlet.disconnect(); }

    return this;
  }

  // Return hash key for outlet
  _key(outlet) {
    return [outlet.name, outlet.inout].join('-');
  }

  // Add outlet object to node
  _add(outlet) {
    const key = this._key(outlet);

    // Sanity checks
    if (outlet.node) { throw new Error("Adding outlet to two nodes at once."); }
    if (this.outlets[key]) { throw new Error(`Adding two identical outlets to same node. (${key})`); }

    // Link back outlet
    outlet.node = this;

    // Add to name hash and inout list
    if (outlet.inout === Graph.IN) { this.inputs.push(outlet); }
    if (outlet.inout === Graph.OUT) { this.outputs.push(outlet); }
    this.all.push(outlet);
    return this.outlets[key] = outlet;
  }

  // Morph outlet to other
  _morph(existing, outlet) {
    let key = this._key(outlet);
    delete this.outlets[key];

    existing.morph(outlet);

    key = this._key(outlet);
    return this.outlets[key] = outlet;
  }

  // Remove outlet object from node.
  _remove(outlet) {
    const key = this._key(outlet);
    const {
      inout
    } = outlet;

    // Sanity checks
    if (outlet.node !== this) { throw new Error("Removing outlet from wrong node."); }

    // Disconnect outlet.
    outlet.disconnect();

    // Unlink outlet.
    outlet.node = null;

    // Remove from name list and inout list.
    delete this.outlets[key];
    if (outlet.inout === Graph.IN) { this.inputs .splice(this.inputs .indexOf(outlet), 1); }
    if (outlet.inout === Graph.OUT) { this.outputs.splice(this.outputs.indexOf(outlet), 1); }
    this.all    .splice(this.all    .indexOf(outlet), 1);
    return this;
  }
}
Node.initClass();

module.exports = Node;

},{"./graph":196,"./outlet":199}],199:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Graph = require('./graph');

/*
  In/out outlet on node
*/
class Outlet {
  static initClass() {
  
    this.index = 0;
  }
  static make(outlet, extra) {
    if (extra == null) { extra = {}; }
    const meta = extra;
    if (outlet.meta != null) { for (let key in outlet.meta) { const value = outlet.meta[key]; meta[key] = value; } }
    return new Outlet(outlet.inout,
               outlet.name,
               outlet.hint,
               outlet.type,
               meta);
  }
  static id(name) {
    return `_io_${++Outlet.index}_${name}`;
  }

  static hint(name) {
    name = name.replace(/^_io_[0-9]+_/, '');
    name = name.replace(/_i_o$/, '');
    return name = name.replace(/(In|Out|Inout|InOut)$/, '');
  }

  constructor(inout, name, hint, type, meta, id) {
    this.inout = inout;
    this.name = name;
    this.hint = hint;
    this.type = type;
    if (meta == null) { meta = {}; }
    this.meta = meta;
    this.id = id;
    if (this.hint == null) {  this.hint = Outlet.hint(this.name); }

    this.node   = null;
    this.input  = null;
    this.output = [];
    if (this.id == null) {    this.id = Outlet.id(this.hint); }
  }

  // Change into given outlet without touching connections
  morph(outlet) {
    this.inout = outlet.inout;
    this.name  = outlet.name;
    this.hint  = outlet.hint;
    this.type  = outlet.type;
    return this.meta  = outlet.meta;
  }

  // Copy with unique name and cloned metadata
  dupe(name) {
    if (name == null) { name = this.id; }
    const outlet = Outlet.make(this);
    outlet.name = name;
    return outlet;
  }

  // Connect to given outlet
  connect(outlet) {

    // Auto-reverse in/out to out/in
    if ((this.inout === Graph.IN)  && (outlet.inout === Graph.OUT)) {
      return outlet.connect(this);
    }

    // Disallow bad combinations
    if ((this.inout !== Graph.OUT) || (outlet.inout !== Graph.IN)) {
      throw new Error("Can only connect out to in.");
    }

    // Check for existing connection
    if (outlet.input === this) { return; }

    // Disconnect existing connections
    outlet.disconnect();

    // Add new connection.
    outlet.input = this;
    return this.output.push(outlet);
  }

  // Disconnect given outlet (or all)
  disconnect(outlet) {
    // Disconnect input from the other side.
    if (this.input) {
      this.input.disconnect(this);
    }

    if (this.output.length) {

      if (outlet) {
        // Remove one outgoing connection.
        const index = this.output.indexOf(outlet);
        if (index >= 0) {
          this.output.splice(index, 1);
          return outlet.input = null;
        }

      } else {
        // Remove all outgoing connections.
        for (outlet of Array.from(this.output)) { outlet.input = null; }
        return this.output = [];
      }
    }
  }
}
Outlet.initClass();

module.exports = Outlet;

},{"./graph":196}],200:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Graph   = require('../graph');
const {
  Program
} = require('../linker');
const {
  Layout
} = require('../linker');

const debug = false;

class Block {
  static previous(outlet) { return (outlet.input != null ? outlet.input.node.owner : undefined); }

  constructor(delay) {
    // Subclasses can pass `delay` to allow them to initialize before they call
    // `@construct`.
    if (delay == null) { delay = false; }
    if (!delay) { this.construct(); }
  }

  construct() {
    let left;
    if (this.namespace == null) { this.namespace = Program.entry(); }
    return this.node       = new Graph.Node(this, (left = (typeof this.makeOutlets === 'function' ? this.makeOutlets() : undefined)) != null ? left : {});
  }

  refresh() {
    let left;
    return this.node.setOutlets((left = (typeof this.makeOutlets === 'function' ? this.makeOutlets() : undefined)) != null ? left : {});
  }

  clone() {
    return new Block;
  }

  // Compile a new program starting from this block
  compile(language, namespace) {
    const program = new Program(language, namespace != null ? namespace : Program.entry(), this.node.graph);
    this.call(program, 0);
    return program.assemble();
  }

  // Link up programs into a layout, starting from this block
  link(language, namespace) {
    const module = this.compile(language, namespace);

    const layout = new Layout(language, this.node.graph);
    this._include(module, layout, 0);
    this.export(layout, 0);
    return layout.link(module);
  }

  // Subclassed methods
  call(program, depth) {}
  callback(layout, depth, name, external, outlet) {}
  export(layout, depth) {}

  // Info string for debugging
  _info(suffix) {
    let string = (this.node.owner.snippet != null ? this.node.owner.snippet._name : undefined) != null ? (this.node.owner.snippet != null ? this.node.owner.snippet._name : undefined) : this.node.owner.namespace;
    if (suffix != null) { return string += '.' + suffix; }
  }

  // Create an outlet for a signature definition
  _outlet(def, props) {
    const outlet = Graph.Outlet.make(def, props);
    outlet.meta.def = def;
    return outlet;
  }

  // Make a call to this module in the given program
  _call(module, program, depth) {
    return program.call(this.node, module, depth);
  }

  // Require this module's dependencies in the given program
  _require(module, program) {
    return program.require(this.node, module);
  }

  // Make a call to all connected inputs
  _inputs(module, program, depth) {
    return (() => {
      const result = [];
      for (let arg of Array.from(module.main.signature)) {
        const outlet = this.node.get(arg.name);
        result.push(__guard__(Block.previous(outlet), x => x.call(program, depth + 1)));
      }
      return result;
    })();
  }

  // Insert callback to this module in the given layout
  _callback(module, layout, depth, name, external, outlet) {
    return layout.callback(this.node, module, depth, name, external, outlet);
  }

  // Include this module in the given layout
  _include(module, layout, depth) {
    return layout.include(this.node, module, depth);
  }

  // Link this module's connected callbacks
  _link(module, layout, depth) {
    debug && console.log('block::_link', this.toString(), module.namespace);
    return (() => {
      const result = [];
      for (let key of Array.from(module.symbols)) {
        const ext = module.externals[key];
        let outlet = this.node.get(ext.name);
        if (!outlet) { throw new OutletError(`External not found on ${this._info(ext.name)}`); }

        if (outlet.meta.child != null) { continue; }

        let [orig, parent, block] = Array.from([outlet, outlet, null]);
        while (!block && parent) {
          [parent, outlet] = Array.from([outlet.meta.parent, parent]);
        }

        block  = Block.previous(outlet);
        if (!block) { throw new OutletError(`Missing connection on ${this._info(ext.name)}`); }

        debug && console.log('callback -> ', this.toString(), ext.name, outlet);
        block.callback(layout, depth + 1, key, ext, outlet.input);
        result.push((block != null ? block.export(layout, depth + 1) : undefined));
      }
      return result;
    })();
  }

  // Trace backwards to discover callbacks further up
  _trace(module, layout, depth) {
    debug && console.log('block::_trace', this.toString(), module.namespace);
    return (() => {
      const result = [];
      for (let arg of Array.from(module.main.signature)) {
        const outlet = this.node.get(arg.name);
        result.push(__guard__(Block.previous(outlet), x => x.export(layout, depth + 1)));
      }
      return result;
    })();
  }
}

var OutletError = function(message) {
  const e = new Error(message);
  e.name = 'OutletError';
  return e;
};

OutletError.prototype = new Error;

module.exports = Block;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
},{"../graph":220,"../linker":225}],201:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Block   = require('./block');

class Call extends Block {
  constructor(snippet) {
    super(true);

    this.snippet = snippet;
    this.namespace = snippet.namespace;
    this.construct();
  }

  clone() {
    return new Call(this.snippet);
  }

  makeOutlets() {
    const main      = this.snippet.main.signature;
    const {
      externals
    } = this.snippet;
    const {
      symbols
    } = this.snippet;

    const params    = (Array.from(main).map((outlet) => this._outlet(outlet,         {callback: false})));
    const callbacks = (Array.from(symbols).map((key) => this._outlet(externals[key], {callback: true})));

    return params.concat(callbacks);
  }

  call(program, depth) {
    this._call(this.snippet, program, depth);
    return this._inputs(this.snippet, program, depth);
  }

  export(layout, depth) {
    if (!layout.visit(this.namespace, depth)) { return; }

    this._link(this.snippet, layout, depth);
    return this._trace(this.snippet, layout, depth);
  }
}

module.exports = Call;

},{"./block":200}],202:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Graph   = require('../graph');
const Block   = require('./block');

/*
  Re-use a subgraph as a callback
*/
class Callback extends Block {
  constructor(graph) {
    super(true);
    this.graph = graph;
    this.construct();
  }

  refresh() {
    super.refresh();
    return delete this.subroutine;
  }

  clone() {
    return new Callback(this.graph);
  }

  makeOutlets() {
    let outlet;
    this.make();

    const outlets = [];
    let ins     = [];
    let outs    = [];

    // Pass-through existing callbacks
    // Collect open inputs/outputs
    const handle = (outlet, list) => {
      if (outlet.meta.callback) {
        if (outlet.inout === Graph.IN) {
          // Dupe outlet and create two-way link between cloned outlets
          const dupe = outlet.dupe();
          if (dupe  .meta.child == null) { dupe.meta.child = outlet; }
          outlet.meta.parent = dupe;

          return outlets.push(dupe);
        }
      } else {
        return list.push(outlet.type);
      }
    };

    for (outlet of Array.from(this.graph.inputs())) { handle(outlet, ins); }
    for (outlet of Array.from(this.graph.outputs())) { handle(outlet, outs); }

    // Merge inputs/outputs into new callback signature
    ins  = ins.join(',');
    outs = outs.join(',');
    const type = `(${ins})(${outs})`;

    outlets.push({
      name:  'callback',
      type,
      inout: Graph.OUT,
      meta: {
        callback: true,
        def: this.subroutine.main
      }
    });

    return outlets;
  }

  make() {
    return this.subroutine = this.graph.compile(this.namespace);
  }

  export(layout, depth) {
    if (!layout.visit(this.namespace, depth)) { return; }

    this._link(this.subroutine, layout, depth);
    return this.graph.export(layout, depth);
  }

  call(program, depth) {
    return this._require(this.subroutine, program, depth);
  }

  callback(layout, depth, name, external, outlet) {
    this._include(this.subroutine, layout, depth);
    return this._callback(this.subroutine, layout, depth, name, external, outlet);
  }
}

module.exports = Callback;

},{"../graph":220,"./block":200}],203:[function(require,module,exports){
exports.Block    = require('./block');
exports.Call     = require('./call');
exports.Callback = require('./callback');
exports.Isolate  = require('./isolate');
exports.Join     = require('./join');

},{"./block":200,"./call":201,"./callback":202,"./isolate":204,"./join":205}],204:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Graph   = require('../graph');
const Block   = require('./block');

/*
  Isolate a subgraph as a single node
*/
class Isolate extends Block {
  constructor(graph) {
    super(true);
    this.graph = graph;
    this.construct();
  }

  refresh() {
    super.refresh();
    return delete this.subroutine;
  }

  clone() {
    return new Isolate(this.graph);
  }

  makeOutlets() {
    this.make();

    const outlets = [];

    const seen = {};
    const done = {};
    for (let set of ['inputs', 'outputs']) {
      for (let outlet of Array.from(this.graph[set]())) {
        // Preserve name of 'return' and 'callback' outlets
        let name = undefined;
        if (['return', 'callback'].includes(outlet.hint) &&
                              (outlet.inout === Graph.OUT)) { name = outlet.hint; }

        // Unless it already exists
        if (seen[name] != null) { name = undefined; }

        // Dupe outlet and remember link to original
        const dupe = outlet.dupe(name);
        if (dupe  .meta.child == null) { dupe.meta.child = outlet; }
        outlet.meta.parent = dupe;
        if (name != null) { seen[name] = true; }
        done[outlet.name] = dupe;

        outlets.push(dupe);
      }
    }

    return outlets;
  }

  make() {
    return this.subroutine = this.graph.compile(this.namespace);
  }

  call(program, depth) {
    this._call(this.subroutine, program, depth);
    return this._inputs(this.subroutine, program, depth);
  }

  export(layout, depth) {
    if (!layout.visit(this.namespace, depth)) { return; }

    // Link up with normal inputs
    this._link(this.subroutine, layout, depth);
    this._trace(this.subroutine, layout, depth);

    // Export callbacks needed to call the subroutine
    return this.graph.export(layout, depth);
  }

  callback(layout, depth, name, external, outlet) {
    outlet = outlet.meta.child;
    return outlet.node.owner.callback(layout, depth, name, external, outlet);
  }
}

module.exports = Isolate;

},{"../graph":220,"./block":200}],205:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Block   = require('./block');

/*
  Join multiple disconnected nodes
*/
class Join extends Block {
  constructor(nodes) {
    super(true);
    this.nodes = nodes;
    this.construct();
  }

  clone() {
    return new Join(this.nodes);
  }

  makeOutlets() { return []; }

  call(program, depth) {
    return (() => {
      const result = [];
      for (let node of Array.from(this.nodes)) {
        const block = node.owner;
        result.push(block.call(program, depth));
      }
      return result;
    })();
  }

  export(layout, depth) {
    return (() => {
      const result = [];
      for (let node of Array.from(this.nodes)) {
        const block = node.owner;
        result.push(block.export(layout, depth));
      }
      return result;
    })();
  }
}

module.exports = Join;

},{"./block":200}],206:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  Cache decorator  
  Fetches snippets once, clones for reuse
  Inline code is hashed to avoid bloat
*/
const queue = require('./queue');
const hash  = require('./hash');

const cache = function(fetch) {
  const cached = {};
  const push  = queue(100);

  // Snippet factory
  return function(name) {
    const key = name.length > 32 ? '##' + hash(name).toString(16) : name;

    // Push new key onto queue, see if an old key expired
    const expire = push(key);
    if (expire != null) { delete cached[expire]; }

    // Clone cached snippet
    if ((cached[key] == null)) { cached[key] = fetch(name); }
    return cached[key].clone();
  };
};

module.exports = cache;
},{"./hash":208,"./queue":212}],207:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  Graph
} = require('../graph');
const Block     = require('../block');
const Visualize = require('../visualize');

/*
  Chainable factory
  
  Exposes methods to build a graph incrementally
*/
class Factory {
  constructor(language, fetch, config) {
    this.language = language;
    this.fetch = fetch;
    this.config = config;
    this.graph();
  }

  // Combined call/concat shortcut
  pipe(name, uniforms, namespace, defines) {
    if (name instanceof Factory) {
      this._concat(name);
    } else if (name != null) {
      this._call(name, uniforms, namespace, defines);
    }
    return this;
  }

  // Old name
  call(name, uniforms, namespace, defines) {
    return this.pipe(name, uniforms, namespace, defines);
  }

  // Combined callback/import shortcut
  require(name, uniforms, namespace, defines) {
    if (name instanceof Factory) {
      this._import(name);
    } else if (name != null) {
      this.callback();
      this._call(name, uniforms, namespace, defines);
      this.end();
    }
    return this;
  }

  // Old name
  import(name, uniforms, namespace, defines) {
    return this.require(name, uniforms, namespace, defines);
  }

  // Create parallel branches that connect as one block to the end
  // (one outgoing connection per outlet)
  split() {
    this._group('_combine', true);
    return this;
  }

  // Create parallel branches that fan out from the end
  // (multiple outgoing connections per outlet)
  fan() {
    this._group('_combine', false);
    return this;
  }

  // Create isolated subgraph
  isolate() {
    this._group('_isolate');
    return this;
  }

  // Create callback subgraph
  callback() {
    this._group('_callback');
    return this;
  }

  // Next branch in group
  next() {
    this._next();
    return this;
  }

  // Connect branches to previous tail and add pass-through from end
  pass() {
    const pass = this._stack[2].end;
    this.end();
    this._state.end = this._state.end.concat(pass);
    return this;
  }

  // Leave nested branches and join up with main graph,
  // applying stored op along the way
  end() {
    const [sub, main] = Array.from(this._exit());
    const {
      op
    } = sub;
    if (this[op]) {
      this[op](sub, main);
    }
    return this;
  }

  // Old name
  join() {
    return this.end();
  }

  // Return finalized graph / reset factory
  graph() {
    // Pop remaining stack
    while ((this._stack != null ? this._stack.length : undefined) > 1) { this.end(); }

    // Remember terminating node(s) of graph
    if (this._graph) {
      this._tail(this._state, this._graph);
    }

    const graph = this._graph;

    this._graph = new Graph;
    this._state = new State;
    this._stack = [this._state];

    return graph;
  }

  // Compile shortcut (graph is thrown away)
  compile(namespace) {
    if (namespace == null) { namespace = 'main'; }
    return this.graph().compile(namespace);
  }

  // Link shortcut (graph is thrown away)
  link(namespace) {
    if (namespace == null) { namespace = 'main'; }
    return this.graph().link(namespace);
  }

  // Serialize for debug
  serialize() {
    return Visualize.serialize(this._graph);
  }

  // Return true if empty
  empty() { return this._graph.nodes.length === 0; }

  // Concatenate existing factory onto tail
  // Retains original factory
  _concat(factory) {
    // Ignore empty concat
    let block;
    if (factory._state.nodes.length === 0) { return this; }

    this._tail(factory._state, factory._graph);

    try {
      block = new Block.Isolate(factory._graph);
    } catch (error) {
      if (this.config.autoInspect) { Visualize.inspect(error, this._graph, factory); }
      throw error;
    }

    this._auto(block);
    return this;
  }

  // Add existing factory as callback
  // Retains original factory
  _import(factory) {
    // Check for empty require
    let block;
    if (factory._state.nodes.length === 0) { throw "Can't import empty callback"; }

    this._tail(factory._state, factory._graph);

    try {
      block = new Block.Callback(factory._graph);
    } catch (error) {
      if (this.config.autoInspect) { Visualize.inspect(error, this._graph, factory); }
      throw error;
    }

    this._auto(block);
    return this;
  }

  // Connect parallel branches to tail
  _combine(sub, main) {
    for (let to of Array.from(sub.start)) {
      for (let from of Array.from(main.end)) { from.connect(to, sub.multi); }
    }

    main.end   = sub.end;
    return main.nodes = main.nodes.concat(sub.nodes);
  }

  // Make subgraph and connect to tail 
  _isolate(sub, main) {
    if (sub.nodes.length) {
      let block;
      const subgraph = this._subgraph(sub);
      this._tail(sub, subgraph);

      try {
        block = new Block.Isolate(subgraph);
      } catch (error) {
        if (this.config.autoInspect) { Visualize.inspect(error, this._graph, subgraph); }
        throw error;
      }

      return this._auto(block);
    }
  }

  // Convert to callback and connect to tail
  _callback(sub, main) {
    if (sub.nodes.length) {
      let block;
      const subgraph = this._subgraph(sub);
      this._tail(sub, subgraph);

      try {
        block = new Block.Callback(subgraph);
      } catch (error) {
        if (this.config.autoInspect) { Visualize.inspect(error, this._graph, subgraph); }
        throw error;
      }

      return this._auto(block);
    }
  }

  // Create next call block
  _call(name, uniforms, namespace, defines) {
    const snippet = this.fetch(name);
    snippet.bind(this.config, uniforms, namespace, defines);
    const block = new Block.Call(snippet);
    return this._auto(block);
  }

  // Move current state into subgraph
  _subgraph(sub) {
    const subgraph = new Graph(null, this._graph);
    subgraph.adopt(sub.nodes);
    return subgraph;
  }

  // Finalize graph tail
  _tail(state, graph) {

    // Merge (unique) terminating ends into single tail node if needed
    let tail = state.end.concat(state.tail);
    tail = tail.filter((node, i) => tail.indexOf(node) === i);

    if (tail.length > 1) {
      tail = new Block.Join(tail);
      tail = [tail.node];
      this._graph.add(tail);
    }

    // Save single endpoint
    graph.tail = tail[0];
    state.end  = tail;
    state.tail = [];

    if (!graph.tail) {
      throw new Error("Cannot finalize empty graph");
    }

    // Add compile/link/export/inspect shortcut methods
    graph.compile = namespace => {
      if (namespace == null) { namespace = 'main'; }
      try {
        return graph.tail.owner.compile(this.language, namespace);
      } catch (error) {
        if (this.config.autoInspect) { graph.inspect(error); }
        throw error;
      }
    };

    graph.link    = namespace => {
      if (namespace == null) { namespace = 'main'; }
      try {
        return graph.tail.owner.link(this.language, namespace);
      } catch (error) {
        if (this.config.autoInspect) { graph.inspect(error); }
        throw error;
      }
    };

    graph.export  = (layout, depth) => {
      return graph.tail.owner.export(layout, depth);
    };

    return graph.inspect = (message = null) => Visualize.inspect(message, graph);
  }

  // Create group for branches or callbacks
  _group(op, multi) {
    this._push(op, multi); // Accumulator
    this._push();         // Current
    return this;
  }

  // Merge branch into accumulator and reset state
  _next() {
    const sub = this._pop();

    this._state.start = this._state.start.concat(sub.start);
    this._state.end   = this._state.end  .concat(sub.end);
    this._state.nodes = this._state.nodes.concat(sub.nodes);
    this._state.tail  = this._state.tail .concat(sub.tail);

    return this._push();
  }

  // Exit nested branches
  _exit() {
    this._next();
    this._pop();
    return [this._pop(), this._state];
  }

  // State stack
  _push(op, multi) {
    this._stack.unshift(new State(op, multi));
    return this._state = this._stack[0];
  }

  _pop() {
    let left;
    this._state = this._stack[1];
    if (this._state == null) { this._state = new State; }
    return (left = this._stack.shift()) != null ? left : new State;
  }

  // Auto append or insert depending on whether we have inputs
  _auto(block) {
    if (block.node.inputs.length) {
      return this._append(block);
    } else {
      return this._insert(block);
    }
  }

  // Add block and connect to end
  _append(block) {
    let end;
    const {
      node
    } = block;
    this._graph.add(node);

    for (end of Array.from(this._state.end)) { end.connect(node); }

    if (!this._state.start.length) { this._state.start = [node]; }
    this._state.end   = [node];

    this._state.nodes.push(node);
    if (!node.outputs.length) { return this._state.tail .push(node); }
  }

  // Add block and connect to start
  _prepend(block) {
    let start;
    const {
      node
    } = block;
    this._graph.add(node);

    for (start of Array.from(this._state.start)) { node.connect(start); }

    if (!this._state.end.length) { this._state.end   = [node]; }
    this._state.start = [node];

    this._state.nodes.push(node);
    if (!node.outputs.length) { return this._state.tail .push(node); }
  }

  // Insert loose block
  _insert(block) {
    const {
      node
    } = block;
    this._graph.add(node);

    this._state.start.push(node);
    this._state.end  .push(node);

    this._state.nodes.push(node);
    if (!node.outputs.length) { return this._state.tail .push(node); }
  }
}

class State {
  constructor(op = null, multi, start, end, nodes, tail) {
    this.op = op;
    if (multi == null) { multi = false; }
    this.multi = multi;
    if (start == null) { start = []; }
    this.start = start;
    if (end == null) { end = []; }
    this.end = end;
    if (nodes == null) { nodes = []; }
    this.nodes = nodes;
    if (tail == null) { tail = []; }
    this.tail = tail;
  }
}

module.exports = Factory;
},{"../block":203,"../graph":220,"../visualize":231}],208:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Hash string into a 32-bit key (murmurhash3)
const c1 = 0xcc9e2d51;
const c2 = 0x1b873593;
const c3 = 0xe6546b64;
const c4 = 0x85ebca6b;
const c5 = 0xc2b2ae35;

// Fix imul in old/broken browsers
let imul = function(a, b) {
  const ah = (a >>> 16) & 0xffff;
  const al = a & 0xffff;
  const bh = (b >>> 16) & 0xffff;
  const bl = b & 0xffff;
  return ((al * bl) + ((((ah * bl) + (al * bh)) << 16) >>> 0)) | 0;
};

if (Math.imul != null) {
  const test = Math.imul(0xffffffff, 5);
  if (test === -5) { ({
    imul
  } = Math); }
}


const hash = function(string) {
  let h;
  const n = string.length;
  let m = Math.floor(n / 2);
  let j = (h = 0);

  const next = () => string.charCodeAt(j++);
  const iterate = function(a, b) {
    let k  = a | (b << 16); // two utf-16 words
    k ^= (k << 9);      // whitening for ascii-only strings

    k  = imul(k, c1);
    k  = (k << 15) | (k >>> 17);
    k  = imul(k, c2);

    h ^= k;

    h  = (h << 13) | (h >>> 19);
    h  = imul(h, 5);
    return h  = (h + c3) | 0;
  };

  while (m--) { iterate(next(), next()); }
  if (n & 1) { iterate(next(), 0); }

  h ^= n;
  h ^= h >>> 16;
  h  = imul(h, c4);
  h ^= h >>> 13;
  h  = imul(h, c5);
  return h ^= h >>> 16;
};

module.exports = hash;
},{}],209:[function(require,module,exports){
exports.Factory  = require('./factory');
exports.Material = require('./material');

exports.library   = require('./library');
exports.cache     = require('./cache');
exports.queue     = require('./queue');
exports.hash      = require('./hash');

},{"./cache":206,"./factory":207,"./hash":208,"./library":210,"./material":211,"./queue":212}],210:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  Snippet library
  
  Takes:
    - Hash of snippets: named library
    - (name) -> getter: dynamic lookup
    - nothing:          no library, only pass in inline source code
  
  If 'name' contains any of "{;(#" it is assumed to be direct GLSL code.
*/
const library = function(language, snippets, load) {

  let callback = null;
  let used = {};

  if (snippets != null) {
    if (typeof snippets === 'function') {
      callback = name => load(language, name, snippets(name));
    } else if (typeof snippets === 'object') {
      callback = function(name) {
        if ((snippets[name] == null)) { throw new Error(`Unknown snippet \`${name}\``); }
        return load(language, name, snippets[name]);
      };
    }
  }

  const inline = code => load(language, '', code);

  if ((callback == null)) { return inline; }

  const fetch = function(name) {
    if (name.match(/[{;]/)) { return inline(name); }
    used[name] = true;
    return callback(name);
  };

  fetch.used = function(_used) { if (_used == null) { _used = used; } return used = _used; };

  return fetch;
};


module.exports = library;
},{}],211:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const debug = false;
const Visualize = require('../visualize');

const tick = function() {
  const now = +new Date;
  return function(label) {
    const delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

class Material {
  constructor(vertex, fragment) {
    this.vertex = vertex;
    this.fragment = fragment;
    if (debug) { this.tock = tick(); }
  }

  build(options) { return this.link(options); }
  link(options) {
    if (options == null) { options = {}; }
    const uniforms   = {};
    const varyings   = {};
    const attributes = {};

    const vertex   = this.vertex  .link('main');
    const fragment = this.fragment.link('main');

    for (let shader of [vertex, fragment]) {
      var key, value;
      for (key in shader.uniforms) { value = shader.uniforms[key]; uniforms[key]   = value; }
      for (key in shader.varyings) { value = shader.varyings[key]; varyings[key]   = value; }
      for (key in shader.attributes) { value = shader.attributes[key]; attributes[key] = value; }
    }

    options.vertexShader   = vertex  .code;
    options.vertexGraph    = vertex  .graph;
    options.fragmentShader = fragment.code;
    options.fragmentGraph  = fragment.graph;
    options.attributes     = attributes;
    options.uniforms       = uniforms;
    options.varyings       = varyings;
    options.inspect        = () => Visualize.inspect('Vertex Shader', vertex, 'Fragment Shader', fragment.graph);

    if (debug) { this.tock('Material build'); }

    return options;
  }

  inspect() {
    return Visualize.inspect('Vertex Shader', this.vertex, 'Fragment Shader', this.fragment.graph);
  }
}

module.exports = Material;

},{"../visualize":231}],212:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Least-recently-used queue for key expiry via linked list
const queue = function(limit) {
  if (limit == null) { limit = 100; }
  const map = {};

  let head  = null;
  let tail  = null;
  let count = 0;

  // Insert at front
  const add = function(item) {
    item.prev = null;
    item.next = head;

    if (head != null) { head.prev = item; }

    head      = item;
    if ((tail == null)) { return tail      = item; }
  };

  // Remove from list
  const remove = function(item) {
    const {
      prev
    } = item;
    const {
      next
    } = item;

    if (prev != null) { prev.next = next; }
    if (next != null) { next.prev = prev; }

    if (head === item) { head = next; }
    if (tail === item) { return tail = prev; }
  };

  // Push key to top of list
  return function(key) {
    let dead, item;
    if (item = map[key] && (item !== head)) {
      // Already in queue
      remove(item);
      add(item);

    } else {
      // Check capacity
      if (count === limit) {
        // Pop tail
        dead = tail.key;
        remove(tail);

        // Expire key
        delete map[dead];
      } else {
        count++;
      }

      // Replace head
      item = {next: head, prev: null, key};
      add(item);

      // Map record for lookup
      map[key] = item;
    }

    // Return expired key
    return dead;
  };
};

module.exports = queue;

},{}],213:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  Compile snippet back into GLSL, but with certain symbols replaced by prefixes / placeholders
*/

const compile = function(program) {
  const {ast, code, signatures} = program;

  // Prepare list of placeholders
  const placeholders = replaced(signatures);

  // Compile
  const assembler = string_compiler(code, placeholders);

  return [signatures, assembler];
};

// #####

const tick = function() {
  const now = +new Date;
  return function(label) {
    const delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

var replaced = function(signatures) {
  const out = {};
  const s = sig => out[sig.name] = true;

  s(signatures.main);

  // Prefix all global symbols
  for (let key of ['external', 'internal', 'varying', 'uniform', 'attribute']) {
    for (let sig of signatures[key]) { s(sig); }
  }

  return out;
};

/*
String-replacement based compiler
*/
var string_compiler = function(code, placeholders) {

  // Make regexp for finding placeholders
  // Replace on word boundaries
  let key;
  const re = new RegExp('\\b(' + ((() => {
    const result = [];
    for (key in placeholders) {
      result.push(key);
    }
    return result;
  })()).join('|') + ')\\b', 'g');

  // Strip comments
  code = code.replace(/\/\/[^\n]*/g, '');
  code = code.replace(/\/\*([^*]|\*[^\/])*\*\//g, '');

  // Strip all preprocessor commands (lazy)
  //code = code.replace /^#[^\n]*/mg, ''

  // Assembler function that takes namespace prefix and exceptions
  // and returns GLSL source code
  return function(prefix, exceptions, defines) {
    let key;
    if (prefix == null) { prefix = ''; }
    if (exceptions == null) { exceptions = {}; }
    if (defines == null) { defines = {}; }
    const replace = {};
    for (key in placeholders) {
      replace[key] = (exceptions[key] != null) ? key : prefix + key;
    }

    const compiled = code.replace(re, key => replace[key]);

    const defs = ((() => {
      const result1 = [];
      for (key in defines) {
        const value = defines[key];
        result1.push(`#define ${key} ${value}`);
      }
      return result1;
    })());
    if (defs.length) { defs.push(''); }
    return defs.join("\n") + compiled;
  };
};

module.exports = compile;

},{}],214:[function(require,module,exports){
module.exports = {
  SHADOW_ARG: '_i_o',
  RETURN_ARG: 'return'
};

},{}],215:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// AST node parsers

let decl;
module.exports = (decl = {});

decl.in    = 0;
decl.out   = 1;
decl.inout = 2;

const get = n => n.token.data;

decl.node = function(node) {

  if ((node.children[5] != null ? node.children[5].type : undefined) === 'function') {
    return decl.function(node);

  } else if ((node.token != null ? node.token.type : undefined) === 'keyword') {
    return decl.external(node);
  }
};

decl.external = function(node) {
  //    console.log 'external', node
  let c = node.children;

  let storage = get(c[1]);
  const struct  = get(c[3]);
  const type    = get(c[4]);
  const list    = c[5];

  if (!['attribute', 'uniform', 'varying'].includes(storage)) { storage = 'global'; }

  const out = [];

  for (let i = 0; i < list.children.length; i++) {
    c = list.children[i];
    if (c.type === 'ident') {
      const ident   = get(c);
      const next    = list.children[i + 1];
      const quant   = ((next != null ? next.type : undefined) === 'quantifier');

      out.push({
        decl: 'external',
        storage,
        type,
        ident,
        quant: !!quant,
        count: quant
      });
    }
  }

  return out;
};

decl.function = function(node) {
  const c = node.children;

  //    console.log 'function', node

  const storage = get(c[1]);
  const struct  = get(c[3]);
  const type    = get(c[4]);
  const func    = c[5];
  const ident   = get(func.children[0]);
  const args    = func.children[1];
  const body    = func.children[2];

  const decls = (Array.from(args.children).map((child) => decl.argument(child)));

  return [{
    decl: 'function',
    storage,
    type,
    ident,
    body: !!body,
    args: decls
  }
  ];
};

decl.argument = function(node) {
  const c = node.children;

  //    console.log 'argument', node

  const storage = get(c[1]);
  const inout   = get(c[2]);
  const type    = get(c[4]);
  const list    = c[5];
  const ident   = get(list.children[0]);
  const quant   = list.children[1];

  const count   = quant ? quant.children[0].token.data : undefined;

  return {
    decl: 'argument',
    storage,
    inout,
    type,
    ident,
    quant: !!quant,
    count
  };
};

decl.param = function(dir, storage, spec, quant, count) {
  let prefix = [];
  if (storage != null) { prefix.push(storage); }
  if (spec != null) { prefix.push(spec); }
  prefix.push('');

  prefix = prefix.join(' ');
  const suffix = quant ? '[' + count + ']' : '';
  if (dir !== '') { dir += ' '; }

  const f = (name, long) => (long ? dir : '') + `${prefix}${name}${suffix}`;
  f.split = dir => decl.param(dir, storage, spec, quant, count);

  return f;
};

// Three.js sugar
const win = typeof window !== 'undefined';
const threejs = win && !!window.THREE;

const defaults = {
  int:         0,
  float:       0,
  vec2:        threejs ? THREE.Vector2 : null,
  vec3:        threejs ? THREE.Vector3 : null,
  vec4:        threejs ? THREE.Vector4 : null,
  mat2:        null,
  mat3:        threejs ? THREE.Matrix3 : null,
  mat4:        threejs ? THREE.Matrix4 : null,
  sampler2D:   0,
  samplerCube: 0
};

const three = {
  int:         'i',
  float:       'f',
  vec2:        'v2',
  vec3:        'v3',
  vec4:        'v4',
  mat2:        'm2',
  mat3:        'm3',
  mat4:        'm4',
  sampler2D:   't',
  samplerCube: 't'
};

decl.type = function(name, spec, quant, count, dir, storage) {

  const dirs = {
    in:    decl.in,
    out:   decl.out,
    inout: decl.inout
  };

  const storages =
    {const: 'const'};

  let type    = three[spec];
  if (quant) { type   += 'v'; }

  let value   = defaults[spec];
  if (value != null ? value.call : undefined) { value   = new value; }
  if (quant) { value   = [value]; }

  const inout   = dirs[dir] != null ? dirs[dir] : dirs.in;
  storage = storages[storage];

  const param   = decl.param(dir, storage, spec, quant, count);
  return new Definition(name, type, spec, param, value, inout);
};

class Definition {
  constructor(name, type, spec, param, value, inout, meta) {
    this.name = name;
    this.type = type;
    this.spec = spec;
    this.param = param;
    this.value = value;
    this.inout = inout;
    this.meta = meta;
  }

  split() {
    // Split inouts
    const isIn  = (this.meta.shadowed != null);
    const dir   = isIn ? 'in' : 'out';
    const inout = isIn ? decl.in : decl.out;
    const param = this.param.split(dir);
    return new Definition(this.name, this.type, this.spec, param, this.value, inout);
  }

  copy(name, meta) {
    let def;
    return def = new Definition(name != null ? name : this.name, this.type, this.spec, this.param, this.value, this.inout, meta);
  }
}


},{}],216:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let _;
const Graph = require('../graph');
const $     = require('./constants');

/*
 GLSL code generator for compiler and linker stubs
*/

module.exports = (_ = {

  // Check if shadow outlet
  unshadow(name) {
    const real = name.replace($.SHADOW_ARG, '');
    if (real !== name) { return real; } else { return null; }
  },

  // Line joiners
  lines(lines) { return lines.join('\n'); },
  list(lines) { return lines.join(', '); },
  statements(lines) { return lines.join(';\n'); },

  // Function body
  body(entry) {
    return {
      entry,
      type:      'void',
      params:    [],
      signature: [],
      return:    '',
      vars:      {},
      calls:     [],
      post:      [],
      chain:     {}
    };
  },

  // Symbol define
  define(a, b) {
    return `#define ${a} ${b}`;
  },

  // Function define
  function(type, entry, params, vars, calls) {
    return `${type} ${entry}(${params}) {\n${vars}${calls}}`;
  },

  // Function invocation
  invoke(ret, entry, args) {
    ret = ret ? `${ret} = ` : '';
    args = _.list(args);
    return `  ${ret}${entry}(${args})`;
  },

  // Compare two signatures
  same(a, b) {
    for (let i = 0; i < a.length; i++) {
      const A = a[i];
      const B = b[i];
      if (!B) { return false; }
      if (A.type !== B.type) { return false; }
      if ((A.name === $.RETURN_ARG) !== (B.name === $.RETURN_ARG)) { return false; }
    }
    return true;
  },

  // Generate call signature for module invocation
  call(lookup, dangling, entry, signature, body) {
    const args      = [];
    let ret       = '';
    const rets      = 1;

    for (let arg of Array.from(signature)) {
      var id, shadow;
      const {
        name
      } = arg;

      let copy = (id = lookup(name));
      let other = null;
      let meta  = null;
      let omit  = false;
      const {
        inout
      } = arg;

      const isReturn = name === $.RETURN_ARG;

      // Shadowed inout: input side
      if (shadow = arg.meta != null ? arg.meta.shadowed : undefined) {
        other = lookup(shadow);
        if (other) {
          body.vars[other] = "  " + arg.param(other);
          body.calls.push(`  ${other} = ${id}`);

          if (!dangling(shadow)) {
            arg = arg.split();
          } else {
            meta = {shadowed: other};
          }
        }
      }

      // Shadowed inout: output side
      if (shadow = arg.meta != null ? arg.meta.shadow : undefined) {
        other = lookup(shadow);
        if (other) {
          if (!dangling(shadow)) {
            arg = arg.split();
            omit = true;
          } else {
            meta = {shadow: other};
            continue;
          }
        }
      }

      if (isReturn) {
        // Capture return value
        ret = id;
      } else if (!omit) {
        // Pass all non return, non shadow args in
        args.push(other != null ? other : id);
      }

      // Export argument if unconnected
      if (dangling(name)) {
        let op = 'push';
        if (isReturn) {
          if (body.return === '') {
            op = 'unshift';
            // Preserve 'return' arg name
            copy = name;
            body.type     = arg.spec;
            body.return   = `  return ${id}`;
            body.vars[id] = "  " + arg.param(id);
          } else {
            body.vars[id] = "  " + arg.param(id);
            body.params.push(arg.param(id, true));
          }
        } else {
          body.params.push(arg.param(id, true));
        }

        // Copy argument into new signature
        arg = arg.copy(copy, meta);
        body.signature[op](arg);
      } else {
        body.vars[id] = "  " + arg.param(id);
      }
    }

    return body.calls.push(_.invoke(ret, entry, args));
  },

  // Assemble main() function from body and call reference
  build(body, calls) {
    const {
      entry
    } = body;
    let code    = null;

    // Check if we're only calling one snippet with identical signature
    // and not building void main();
    if (calls && (calls.length === 1) && (entry !== 'main')) {
      const a = body;
      const b = calls[0].module;

      if (_.same(body.signature, b.main.signature)) {
        code = _.define(entry, b.entry);
      }
    }

    // Otherwise build function body
    if ((code == null)) {
      let vars    = ((() => {
        const result = [];
        for (let v in body.vars) {
          const decl = body.vars[v];
          result.push(decl);
        }
        return result;
      })());
      ({
        calls
      } = body);
      const {
        post
      } = body;
      let {
        params
      } = body;
      const {
        type
      } = body;
      const ret     = body.return;

      calls = calls.concat(post);
      if (ret !== '') { calls.push(ret); }
      calls.push('');

      if (vars.length) {
        vars.push('');
        vars = _.statements(vars) + '\n';
      } else {
        vars = '';
      }

      calls  = _.statements(calls);
      params = _.list(params);

      code   = _.function(type, entry, params, vars, calls);
    }

    return {
      signature: body.signature,
      code,
      name:      entry
    };
  },

  // Build links to other callbacks
  links(links) {
    const out = {
      defs: [],
      bodies: []
    };

    for (let l of Array.from(links)) { _.link(l, out); }

    out.defs   = _.lines(out.defs);
    out.bodies = _.statements(out.bodies);

    if (out.defs   === '') { delete out.defs; }
    if (out.bodies === '') { delete out.bodies; }

    return out;
  },

  // Link a module's entry point as a callback
  link: (link, out) => {
    let arg, list;
    const {module, name, external} = link;
    const {
      main
    } = module;
    const {
      entry
    } = module;

    // If signatures match, #define alias for the symbol
    if (_.same(main.signature, external.signature)) {
      return out.defs.push(_.define(name, entry));
    }

    // Signatures differ, build one-line callback to match defined prototype

    // Map names to names
    const ins  = [];
    const outs = [];
    let map  = {};
    const returnVar = [module.namespace, $.RETURN_ARG].join('');

    for (arg of Array.from(external.signature)) {
      list = arg.inout === Graph.IN ? ins : outs;
      list.push(arg);
    }

    for (arg of Array.from(main.signature)) {

      list = arg.inout === Graph.IN ? ins : outs;
      const other = list.shift();
      let _name = other.name;

      // Avoid 'return' keyword
      if (_name === $.RETURN_ARG) {
        _name = returnVar;
      }

      map[arg.name] = _name;
    }

    // Build function prototype to invoke the other side
    let _lookup = name => map[name];
    const _dangling = () => true;

    const inner   = _.body();
    _.call(_lookup, _dangling, entry, main.signature, inner);
    inner.entry = entry;

    // Avoid 'return' keyword
    map =
      {return: returnVar};
    _lookup = name => map[name] != null ? map[name] : name;

    // Build wrapper function for the calling side
    const outer   = _.body();
    const wrapper = _.call(_lookup, _dangling, entry, external.signature, outer);
    outer.calls = inner.calls;
    outer.entry = name;

    out.bodies.push(_.build(inner).code.split(' {')[0]);
    return out.bodies.push(_.build(outer).code);
  },

  // Remove all function prototypes to avoid redefinition errors
  defuse(code) {
    // Don't try this at home kids
    const re = /([A-Za-z0-9_]+\s+)?[A-Za-z0-9_]+\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*;\s*/mg;
    const strip = code => code.replace(re, m => '');

    // Split into scopes by braces
    const blocks = code.split(/(?=[{}])/g);
    let level  = 0;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      switch (b[0]) {
        case '{': level++; break;
        case '}': level--; break;
      }

      // Only mess with top level scope
      if (level === 0) {
        // Preprocessor lines will fuck us up. Split on them.
        const hash = b.split(/^[ \t]*#/m);
        for (let j = 0; j < hash.length; j++) {

          let line = hash[j];
          if (j > 0) {
            // Trim off preprocessor directive
            line = line.split(/\n/);
            const head = line.shift();
            const rest = line.join("\n");

            // Process rest
            hash[j] = [head, strip(rest)].join('\n');
          } else {
            // Process entire line
            hash[j] = strip(line);
          }
        }

        // Reassemble
        blocks[i] = hash.join('#');
      }
    }

    return code = blocks.join('');
  },

  // Remove duplicate uniforms / varyings / attributes
  dedupe(code) {
    const map = {};
    const re  = /((attribute|uniform|varying)\s+)[A-Za-z0-9_]+\s+([A-Za-z0-9_]+)\s*(\[[^\]]*\]\s*)?;\s*/mg;
    return code.replace(re, function(m, qual, type, name, struct) {
      if (map[name]) { return ''; }
      map[name] = true;
      return m;
    });
  },

  // Move definitions to top so they compile properly
  hoist(code) {

    const filter = function(lines, re) {
      const defs = [];
      const out = [];
      for (let line of Array.from(lines)) {
        const list = line.match(re) ? defs : out;
        list.push(line);
      }

      return defs.concat(out);
    };

    let lines = code.split("\n");

    // Hoist symbol defines to the top so (re)definitions use the right alias
    lines = filter(lines, /^#define ([^ ]+ _pg_[0-9]+_|_pg_[0-9]+_ [^ ]+)$/);

    // Hoist extensions
    lines = filter(lines, /^#extension/);

    return lines.join("\n");
  }
});

},{"../graph":220,"./constants":214}],217:[function(require,module,exports){
exports.compile  = require('./compile');
exports.parse    = require('./parse');
exports.generate = require('./generate');

const iterable = require('./constants');
for (let v = 0; v < iterable.length; v++) { const k = iterable[v]; exports[k] = v; }

},{"./compile":213,"./constants":214,"./generate":216,"./parse":218}],218:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const tokenizer = require('../../vendor/glsl-tokenizer');
const parser    = require('../../vendor/glsl-parser');
const decl      = require('./decl');
const $         = require('./constants');

let debug = false;

/*
parse GLSL into AST
extract all global symbols and make type signatures
*/
// Parse a GLSL snippet
const parse = function(name, code) {
  let program;
  const ast        = parseGLSL(name, code);
  return program    = processAST(ast, code);
};

// Parse GLSL language into AST
var parseGLSL = function(name, code) {

  let ast, errors, tock;
  if (debug) { tock = tick(); }

  // Sync stream hack (see /vendor/through)
  try {
    let array;
    array = tokenizer().process(parser(), code), [ast] = Array.from(array[0]), errors = array[1];
  } catch (e) {
    errors = [{message:e}];
  }

  if (debug) { tock('GLSL Tokenize & Parse'); }

  const fmt = function(code) {
    code = code.split("\n");
    const max  = ("" + code.length).length;
    const pad  = function(v) { if ((v = "" + v).length < max) { return ("       " + v).slice(-max); } else { return v; } };
    return code.map((line, i) => `${pad(i + 1)}: ${line}`).join("\n");
  };

  if (!ast || errors.length) {
    if (!name) { name = '(inline code)'; }
    console.warn(fmt(code));
    for (let error of Array.from(errors)) { console.error(`${name} -`, error.message); }
    throw new Error("GLSL parse error");
  }

  return ast;
};

// Process AST for compilation
var processAST = function(ast, code) {
  let tock;
  if (debug) { tock = tick(); }

  // Walk AST tree and collect global declarations
  const symbols = [];
  walk(mapSymbols, collect(symbols), ast, '');

  // Sort symbols into bins
  const [main, internals, externals] = Array.from(sortSymbols(symbols));

  // Extract storage/type signatures of symbols
  const signatures = extractSignatures(main, internals, externals);

  if (debug) { tock('GLSL AST'); }

  return {ast, code, signatures};
};

// Extract functions and external symbols from AST
var mapSymbols = function(node, collect) {
  switch (node.type) {
    case 'decl':
      collect(decl.node(node));
      return false;
      break;
  }
  return true;
};

var collect = out => (function(value) { if (value != null) { return Array.from(value).map((obj) => out.push(obj)); } });

// Identify internals, externals and main function
var sortSymbols = function(symbols) {
  let main = null;
  const internals = [];
  let externals = [];
  const maybe = {};
  let found = false;

  for (var s of Array.from(symbols)) {
    if (!s.body) {
      // Unmarked globals are definitely internal
      if (s.storage === 'global') {
        internals.push(s);

      // Possible external
      } else {
        externals.push(s);
        maybe[s.ident] = true;
      }
    } else {
      // Remove earlier forward declaration
      if (maybe[s.ident]) {
        externals = (Array.from(externals).filter((e) => e.ident !== s.ident));
        delete maybe[s.ident];
      }

      // Internal function
      internals.push(s);

      // Last function is main
      // unless there is a function called 'main'
      if (s.ident === 'main') {
        main = s;
        found = true;
      } else if (!found) {
        main = s;
      }
    }
  }

  return [main, internals, externals];
};

// Generate type signatures and appropriate ins/outs
var extractSignatures = function(main, internals, externals) {
  let symbol;
  const sigs = {
    uniform:   [],
    attribute: [],
    varying:   [],
    external:  [],
    internal:  [],
    global:    [],
    main:      null
  };

  const defn = symbol => decl.type(symbol.ident, symbol.type, symbol.quant, symbol.count, symbol.inout, symbol.storage);

  const func = function(symbol, inout) {
    let def;
    let d;
    const signature = (Array.from(symbol.args).map((arg) => defn(arg)));

    // Split inouts into in and out
    for (d of Array.from(signature)) {
      if (d.inout === decl.inout) {
        const a = d;
        const b = d.copy();

        a.inout  = decl.in;
        b.inout  = decl.out;
        b.meta   = {shadow: a.name};
        b.name  += $.SHADOW_ARG;
        a.meta   = {shadowed: b.name};

        signature.push(b);
      }
    }

    // Add output for return type
    if (symbol.type !== 'void') {
      signature.unshift(decl.type($.RETURN_ARG, symbol.type, false, '', 'out'));
    }

    // Make type string
    const inTypes  = ((() => {
      const result = [];
      for (d of Array.from(signature)) {         if (d.inout === decl.in) {
          result.push(d.type);
        }
      } 
      return result;
    })()).join(',');
    const outTypes = ((() => {
      const result1 = [];
      for (d of Array.from(signature)) {         if (d.inout === decl.out) {
          result1.push(d.type);
        }
      }
      return result1;
    })()).join(',');
    const type     = `(${inTypes})(${outTypes})`;

    return def = {
      name: symbol.ident,
      type,
      signature,
      inout,
      spec: symbol.type
    };
  };

  // Main
  sigs.main = func(main, decl.out);

  // Internals (for name replacement only)
  for (symbol of Array.from(internals)) {
    sigs.internal.push({
      name: symbol.ident});
  }

  // Externals
  for (symbol of Array.from(externals)) {
    switch (symbol.decl) {

      // Uniforms/attributes/varyings
      case 'external':
        var def = defn(symbol);
        sigs[symbol.storage].push(def);
        break;

      // Callbacks
      case 'function':
        def = func(symbol, decl.in);
        sigs.external.push(def);
        break;
    }
  }

  return sigs;
};

// Walk AST, apply map and collect values
debug = false;

var walk = function(map, collect, node, indent) {
  debug && console.log(indent, node.type, node.token != null ? node.token.data : undefined, node.token != null ? node.token.type : undefined);

  const recurse = map(node, collect);

  if (recurse) {
    for (let i = 0; i < node.children.length; i++) { const child = node.children[i]; walk(map, collect, child, indent + '  ', debug); }
  }

  return null;
};

// #####

var tick = function() {
  const now = +new Date;
  return function(label) {
    const delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};


module.exports = walk;
module.exports = parse;


},{"../../vendor/glsl-parser":234,"../../vendor/glsl-tokenizer":238,"./constants":214,"./decl":215}],219:[function(require,module,exports){
arguments[4][196][0].apply(exports,arguments)
},{"dup":196}],220:[function(require,module,exports){
arguments[4][197][0].apply(exports,arguments)
},{"./graph":219,"./node":221,"./outlet":222,"dup":197}],221:[function(require,module,exports){
arguments[4][198][0].apply(exports,arguments)
},{"./graph":219,"./outlet":222,"dup":198}],222:[function(require,module,exports){
arguments[4][199][0].apply(exports,arguments)
},{"./graph":219,"dup":199}],223:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Block     = require('./block');
const Factory   = require('./factory');
const GLSL      = require('./glsl');
const Graph     = require('./graph');
const Linker    = require('./linker');
const Visualize = require('./visualize');

const { library, cache } = Factory;
const { visualize, inspect } = Visualize;
const { Snippet } = Linker;

const merge = function(a, b) {
  if (b == null) { b = {}; }
  const out = {};
  for (let key in a) { const value = a[key]; out[key] = b[key] != null ? b[key] : a[key]; }
  return out;
};

class ShaderGraph {
  static initClass() {

    // Expose class hierarchy
    this.Block =     Block;
    this.Factory =   Factory;
    this.GLSL =      GLSL;
    this.Graph =     Graph;
    this.Linker =    Linker;
    this.Visualize = Visualize;
  }
  constructor(snippets, config) {
    if (!(this instanceof ShaderGraph)) { return new ShaderGraph(snippets, config); }

    const defaults = {
      globalUniforms:   false,
      globalVaryings:   true,
      globalAttributes: true,
      globals:          [],
      autoInspect:      false
    };

    this.config = merge(defaults, config);
    this.fetch  = cache(library(GLSL, snippets, Snippet.load));
  }

  shader(config) {
    if (config == null) { config = {}; }
    const _config = merge(this.config, config);
    return new Factory.Factory(GLSL, this.fetch, _config);
  }

  material(config) {
    return new Factory.Material(this.shader(config), this.shader(config));
  }

  inspect(shader) { return ShaderGraph.inspect(shader); }
  visualize(shader) { return ShaderGraph.visualize(shader); }

  // Static visualization method
  static inspect(shader) { return inspect(shader); }
  static visualize(shader) { return visualize(shader); }
}
ShaderGraph.initClass();

module.exports = ShaderGraph;
if (typeof window !== 'undefined') { window.ShaderGraph = ShaderGraph; }

},{"./block":203,"./factory":209,"./glsl":217,"./graph":220,"./linker":225,"./visualize":231}],224:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Graph      = require('../graph');
const Priority   = require('./priority');

/*
  Program assembler

  Builds composite program that can act as new module/snippet
  Unconnected input/outputs and undefined callbacks are exposed in the new global/main scope
  If there is only one call with an identical call signature, a #define is output instead.
*/
const assemble = function(language, namespace, calls, requires) {

  const {
    generate
  } = language;

  const externals  = {};
  const symbols    = [];
  const uniforms   = {};
  const varyings   = {};
  const attributes = {};
  const library    = {};

  const process = function() {

    let body;
    let ns;
    for (ns in requires) { const r = requires[ns]; required(r.node, r.module); }

    [body, calls] = Array.from(handle(calls));
    if (namespace != null) { body.entry    = namespace; }
    const main          = generate.build(body, calls);

    const sorted   = ((() => {
      const result = [];
      for (ns in library) {
        const lib = library[ns];
        result.push(lib);
      }
      return result;
    })()).sort((a, b) => Priority.compare(a.priority, b.priority));
    const includes = sorted.map(x => x.code);
    includes.push(main.code);
    const code = generate.lines(includes);

    // Build new virtual snippet
    return {
      namespace:   main.name,
      library,     // Included library functions
      body:        main.code,   // Snippet body
      code,        // Complete snippet (tests/debug)
      main,        // Function signature
      entry:       main.name,   // Entry point name
      symbols,
      externals,
      uniforms,
      varyings,
      attributes
    };
  };

  // Sort and process calls
  var handle = calls => {

    let c;
    calls = ((() => {
      const result = [];
      for (let ns in calls) {
        c = calls[ns];
        result.push(c);
      }
      return result;
    })());
    calls.sort((a, b) => b.priority - a.priority);

    // Call module in DAG chain
    const call = (node, module, priority) => {
      include(node, module, priority);
      const {
        main
      } = module;
      const {
        entry
      } = module;

      const _lookup   = name => lookup(node, name);
      const _dangling = name => isDangling(node, name);
      return generate.call(_lookup, _dangling, entry, main.signature, body);
    };

    var body = generate.body();
    for (c of Array.from(calls)) { call(c.node, c.module, c.priority); }

    return [body, calls];
  };

  // Adopt given code as a library at given priority
  const adopt = function(namespace, code, priority) {
    const record = library[namespace];
    if (record != null) {
      return record.priority = Priority.max(record.priority, priority);
    } else {
      return library[namespace] = {code, priority};
    }
  };

  // Include snippet for a call
  var include = function(node, module, priority) {
    let def, key;
    priority = Priority.make(priority);

    // Adopt snippet's libraries
    for (let ns in module.library) { const lib = module.library[ns]; adopt(ns, lib.code, Priority.nest(priority, lib.priority)); }

    // Adopt snippet body as library
    adopt(module.namespace, module.body, priority);

    // Adopt GL vars
    for (key in module.uniforms) { def = module.uniforms[key]; uniforms[key]   = def; }
    for (key in module.varyings) { def = module.varyings[key]; varyings[key]   = def; }
    for (key in module.attributes) { def = module.attributes[key]; attributes[key] = def; }

    return required(node, module);
  };

  var required = (node, module) => // Adopt external symbols
  (() => {
    const result = [];
    for (let key of Array.from(module.symbols)) {
      const ext = module.externals[key];
      if (isDangling(node, ext.name)) {
        const copy = {};
        for (let k in ext) { const v = ext[k]; copy[k] = v; }
        copy.name = lookup(node, ext.name);
        externals[key] = copy;
        result.push(symbols.push(key));
      } else {
        result.push(undefined);
      }
    }
    return result;
  })();

  // Check for dangling input/output
  var isDangling = function(node, name) {
    const outlet = node.get(name);

    if (outlet.inout === Graph.IN) {
      return outlet.input === null;

    } else if (outlet.inout === Graph.OUT) {
      return outlet.output.length === 0;
    }
  };

  // Look up unique name for outlet
  var lookup = function(node, name) {

    // Traverse graph edge
    let outlet = node.get(name);
    if (!outlet) { return null; }

    if (outlet.input) { outlet = outlet.input; }
    ({
      name
    } = outlet);

    return outlet.id;
  };

  return process();
};

module.exports = assemble;


},{"../graph":220,"./priority":228}],225:[function(require,module,exports){
exports.Snippet  = require('./snippet');
exports.Program  = require('./program');
exports.Layout   = require('./layout');
exports.assemble = require('./assemble');
exports.link     = require('./link');
exports.priority = require('./priority');

exports.load = exports.Snippet.load;

},{"./assemble":224,"./layout":226,"./link":227,"./priority":228,"./program":229,"./snippet":230}],226:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Snippet  = require('./snippet');
const link     = require('./link');

const debug = false;

/*
  Program linkage layout
  
  Entry points are added to its dependency graph
  Callbacks are linked either with a go-between function
  or a #define if the signatures are identical.
*/
class Layout {

  constructor(language, graph) {
    this.language = language;
    this.graph = graph;
    this.links    = [];
    this.includes = [];
    this.modules  = {};
    this.visits   = {};
  }

  // Link up a given named external to this module's entry point
  callback(node, module, priority, name, external) {
    return this.links.push({node, module, priority, name, external});
  }

  // Include this module of code
  include(node, module, priority) {
    let m;
    if ((m = this.modules[module.namespace]) != null) {
      return m.priority = Math.max(priority, m.priority);
    } else {
      this.modules[module.namespace] = true;
      return this.includes.push({node, module, priority});
    }
  }

  // Visit each namespace at most once to avoid infinite recursion
  visit(namespace) {
    debug && console.log('Visit', namespace, !this.visits[namespace]);
    if (this.visits[namespace]) { return false; }
    return this.visits[namespace] = true;
  }

  // Compile queued ops into result
  link(module) {
    const data          = link(this.language, this.links, this.includes, module);
    const snippet       = new Snippet;
    for (let key in data) { snippet[key]  = data[key]; }
    snippet.graph = this.graph;
    return snippet;
  }
}


module.exports = Layout;

},{"./link":227,"./snippet":230}],227:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Graph      = require('../graph');
const Priority   = require('./priority');

/*
 Callback linker
 
 Imports given modules and generates linkages for registered callbacks.

 Builds composite program with single module as exported entry point
*/

const link = function(language, links, modules, exported) {

  const {
    generate
  } = language;
  let includes   = [];

  const symbols    = [];
  const externals  = {};
  const uniforms   = {};
  const attributes = {};
  const varyings   = {};
  const library    = {};

  const process = function() {

    const exports = generate.links(links);

    const header = [];
    if (exports.defs != null) { header.push(exports.defs); }
    if (exports.bodies != null) { header.push(exports.bodies); }

    for (let m of Array.from(modules)) { include(m.node, m.module, m.priority); }
    const sorted   = ((() => {
      const result = [];
      for (let ns in library) {
        const lib = library[ns];
        result.push(lib);
      }
      return result;
    })()).sort((a, b) => Priority.compare(a.priority, b.priority));
    includes = sorted.map(x => x.code);

    let code =  generate.lines(includes);
    code =  generate.defuse(code);
    if (header.length) { code = [generate.lines(header), code].join("\n"); }
    code =  generate.hoist(code);
    code =  generate.dedupe(code);

    // Export module's externals
    const e = exported;
    return {
      namespace:   e.main.name,
      code,          // Complete snippet (tests/debug)
      main:        e.main,        // Function signature
      entry:       e.main.name,   // Entry point name
      externals,
      uniforms,
      attributes,
      varyings
    };
  };

  // Adopt given code as a library at given priority
  const adopt = function(namespace, code, priority) {
    const record = library[namespace];
    if (record != null) {
      return record.priority = Priority.max(record.priority, priority);
    } else {
      return library[namespace] = {code, priority};
    }
  };

  // Include piece of code
  var include = function(node, module, priority) {
    let def, key;
    priority = Priority.make(priority);

    // Adopt snippet's libraries
    for (let ns in module.library) { const lib = module.library[ns]; adopt(ns, lib.code, Priority.nest(priority, lib.priority)); }

    // Adopt snippet body as library
    adopt(module.namespace, module.body, priority);

    // Adopt externals
    for (key in module.uniforms) { def = module.uniforms[key]; uniforms[key]   = def; }
    for (key in module.varyings) { def = module.varyings[key]; varyings[key]   = def; }
    for (key in module.attributes) { def = module.attributes[key]; attributes[key] = def; }

    return (() => {
      const result = [];
      for (key of Array.from(module.symbols)) {
        const ext = module.externals[key];
        if (isDangling(node, ext.name)) {
          externals[key] = ext;
          result.push(symbols.push(key));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  };

  // Check for dangling input/output
  var isDangling = function(node, name) {
    const outlet = node.get(name);

    if (!outlet) {
      const module = (node.owner.snippet != null ? node.owner.snippet._name : undefined) != null ? (node.owner.snippet != null ? node.owner.snippet._name : undefined) : node.owner.namespace;
      throw new Error(`Unable to link program. Unlinked callback \`${name}\` on \`${module}\``);
    }

    if (outlet.inout === Graph.IN) {
      return outlet.input === null;

    } else if (outlet.inout === Graph.OUT) {
      return outlet.output.length === 0;
    }
  };

  return process();
};


module.exports = link;
},{"../graph":220,"./priority":228}],228:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
exports.make = function(x) {
  if ((x == null)) { x = []; }
  if (!(x instanceof Array)) { x = [+x != null ? +x : 0]; }
  return x;
};

exports.nest = (a, b) => a.concat(b);

exports.compare = function(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0, end = n, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
    const p = a[i];
    const q = b[i];
    if (p > q) {
      return -1;
    }
    if (p < q) {
      return 1;
    }
  }
  a = a.length;
  b = b.length;
  if (a > b) { return -1; } else if (a < b) { return 1; } else { return 0; }
};

exports.max  = function(a, b) {
  if (exports.compare(a, b) > 0) { return b; } else { return a; }
};

},{}],229:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Snippet  = require('./snippet');
const assemble = require('./assemble');

/*
  Program assembly model
  
  Snippets are added to its queue, registering calls and code includes.
  Calls are de-duped and scheduled at the earliest point required for correct data flow.
  
  When assemble() is called, it builds a main() function to
  execute all calls in final order.
  
  The result is a new instance of Snippet that acts as if it
  was parsed from the combined source of the component
  nodes.
*/
class Program {
  static initClass() {
    this.index = 0;
  }
  static entry() { return `_pg_${++Program.index}_`; }

  // Program starts out empty, ready to compile starting from a particular block
  constructor(language, namespace, graph) {
    this.language = language;
    this.namespace = namespace;
    this.graph = graph;
    this.calls      = {};
    this.requires   = {};
  }

  // Call a given module at certain priority
  call(node, module, priority) {
    let exists;
    const ns = module.namespace;

    // Merge all calls down into one with the right priority
    if ((exists = this.calls[ns])) {
      exists.priority = Math.max(exists.priority, priority);
    } else {
      this.calls[ns] = {node, module, priority};
    }

    return this;
  }

  // Require a given (callback) module's externals
  require(node, module) {
    const ns = module.namespace;
    return this.requires[ns] = {node, module};
  }

  // Compile queued ops into result
  assemble() {
    const data          = assemble(this.language, this.namespace != null ? this.namespace : Program.entry, this.calls, this.requires);
    const snippet       = new Snippet;
    for (let key in data) { snippet[key]  = data[key]; }
    snippet.graph = this.graph;
    return snippet;
  }
}
Program.initClass();

module.exports = Program;



},{"./assemble":224,"./snippet":230}],230:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Snippet {
  static initClass() {
    this.index = 0;
  }
  static namespace() { return `_sn_${++Snippet.index}_`; }

  static load(language, name, code) {
    const program          = language.parse(name, code);
    const [sigs, compiler] = Array.from(language.compile(program));
    return new Snippet(language, sigs, compiler, name, code);
  }

  constructor(language, _signatures, _compiler, _name, _original) {
    this.language = language;
    this._signatures = _signatures;
    this._compiler = _compiler;
    this._name = _name;
    this._original = _original;
    this.namespace  = null;
    this.code       = null;

    this.main       = null;
    this.entry      = null;

    this.uniforms   = null;
    this.externals  = null;
    this.symbols    = null;
    this.attributes = null;
    this.varyings   = null;

    // Tidy up object for export
    if (!this.language) { delete this.language; }
    if (!this._signatures) { delete this._signatures; }
    if (!this._compiler) { delete this._compiler; }
    if (!this._original) { delete this._original; }

    // Insert snippet name if not provided
    if (!this._name) { this._name = this._signatures != null ? this._signatures.main.name : undefined; }
  }

  clone() {
    return new Snippet(this.language, this._signatures, this._compiler, this._name, this._original);
  }

  bind(config, uniforms, namespace, defines) {

    // Alt syntax (namespace, uniforms, defines)
    let def, left;
    let v;
    if (uniforms === ('' + uniforms)) {
      [namespace, uniforms, defines] = Array.from([uniforms, namespace != null ? namespace : {}, defines != null ? defines : {}]);
    // Alt syntax (uniforms, defines)
    } else if (namespace !== ('' + namespace)) {
      [defines, namespace] = Array.from([namespace != null ? namespace : {}, undefined]);
    }

    // Prepare data structure
    this.main       = this._signatures.main;
    this.namespace  = (left = namespace != null ? namespace : this.namespace) != null ? left : Snippet.namespace();
    this.entry      = this.namespace + this.main.name;

    this.uniforms   = {};
    this.varyings   = {};
    this.attributes = {};
    this.externals  = {};
    this.symbols    = [];
    const exist       = {};
    const exceptions  = {};

    // Handle globals and locals for prefixing
    const global = function(name) {
      exceptions[name] = true;
      return name;
    };
    const local  = name => {
      return this.namespace + name;
    };

    // Apply config
    if (config.globals) { for (let key of Array.from(config.globals)) { global(key); } }
    const _u = config.globalUniforms   ? global : local;
    const _v = config.globalVaryings   ? global : local;
    const _a = config.globalAttributes ? global : local;
    const _e = local;

    // Build finalized properties
    const x = def       => {       return exist[def.name]           = true; };
    const u = (def, name) => {   return this.uniforms[_u(name != null ? name : def.name)] = def; };
    v = def       => {   return this.varyings[_v(def.name)]        = def; };
    const a = def       => { return this.attributes[_a(def.name)]        = def; };
    const e = def       => {
                        const name = _e(def.name);
                        this.externals[name]               = def;
                        return this.symbols.push(name);
                      };

    const redef = def => ({
      type: def.type,
      name: def.name,
      value: def.value
    });

    for (def of Array.from(this._signatures.uniform)) { x(def); }
    for (def of Array.from(this._signatures.uniform)) { u(redef(def)); }
    for (def of Array.from(this._signatures.varying)) { v(redef(def)); }
    for (def of Array.from(this._signatures.external)) { e(def); }
    for (def of Array.from(this._signatures.attribute)) { a(redef(def)); }
    for (let name in uniforms) { def = uniforms[name]; if (exist[name]) { u(def, name); } }

    this.body = (this.code = this._compiler(this.namespace, exceptions, defines));

    // Adds defs to original snippet for inspection
    if (defines) {
      const defs = ((() => {
        const result = [];
        for (let k in defines) {
          v = defines[k];
          result.push(`#define ${k} ${v}`);
        }
        return result;
      })()).join('\n');
      if (defs.length) { this._original = [defs, "//----------------------------------------", this._original].join("\n"); }
    }

    return null;
  }
}
Snippet.initClass();

module.exports = Snippet;
},{}],231:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let markup, serialize;
const {
  Graph
} = require('../Graph');

exports.serialize = (serialize = require('./serialize'));
exports.markup    = (markup    = require('./markup'));

const visualize = function(graph) {
  if (!graph) { return; }
  if (!graph.nodes) { return graph; }

  const data   = serialize(graph);
  return markup.process(data);
};

var resolve = function(arg) {
  if ((arg == null)) { return arg; }
  if (arg instanceof Array) { return arg.map(resolve); }
  if ((arg.vertex != null) && (arg.fragment != null)) { return [resolve(arg.vertex, resolve(arg.fragment))]; }
  if (arg._graph != null) { return arg._graph; }
  if (arg.graph != null) { return arg.graph; }
  return arg;
};

var merge = function(args) {
  let out = [];
  for (let arg of Array.from(args)) {
    if (arg instanceof Array) {
      out = out.concat(merge(arg));
    } else if (arg != null) {
      out.push(arg);
    }
  }
  return out;
};

exports.visualize = function() {
  const list = merge(resolve([].slice.call(arguments)));
  return markup.merge((Array.from(list).filter((graph) => graph).map((graph) => visualize(graph))));
};

exports.inspect = function() {
  const contents = exports.visualize.apply(null, arguments);
  const element  = markup.overlay(contents);

  for (let el of Array.from(document.querySelectorAll('.shadergraph-overlay'))) { el.remove(); }
  document.body.appendChild(element);
  contents.update();

  return element;
};

},{"../Graph":197,"./markup":232,"./serialize":233}],232:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const hash = require('../factory/hash');

const trim = string => ("" + string).replace(/^\s+|\s+$/g, '');

const cssColor = (r, g, b, alpha) => 'rgba(' + [r, g, b, alpha].join(', ') + ')';

const hashColor = function(string, alpha) {
  if (alpha == null) { alpha = 1; }
  const color = hash(string) ^ 0x123456;

  let r =  color & 0xFF;
  let g = (color >>> 8) & 0xFF;
  let b = (color >>> 16) & 0xFF;

  const max  = Math.max(r, g, b);
  const norm = 140 / max;
  const min  = Math.round(max / 3);

  r = Math.min(255, Math.round(norm * Math.max(r, min)));
  g = Math.min(255, Math.round(norm * Math.max(g, min)));
  b = Math.min(255, Math.round(norm * Math.max(b, min)));

  return cssColor(r, g, b, alpha);
};

const escapeText = function(string) {
  string = string != null ? string : "";
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};

const process = function(data) {
  const links = [];
  const el = _markup(data, links);
  el.update = () => connect(el, links);
  _activate(el);
  return el;
};

var _activate = function(el) {
  const codes = el.querySelectorAll('.shadergraph-code');
  return Array.from(codes).map((code) =>
    (function() {
      const popup = code;
      popup.parentNode.classList.add('shadergraph-has-code');
      return popup.parentNode.addEventListener('click', event => popup.style.display = {
        block: 'none',
        none:  'block'
      }[popup.style.display || 'none']);
    })());
};

const _order = function(data) {
  let link, node;
  const nodeMap = {};
  const linkMap = {};
  for (node of Array.from(data.nodes)) {
    nodeMap[node.id] = node;
  }

  for (link of Array.from(data.links)) {
    if (linkMap[link.from] == null) { linkMap[link.from] = []; }
    linkMap[link.from].push(link);
  }

  var recurse = function(node, depth) {
    let next;
    if (depth == null) { depth = 0; }
    node.depth = Math.max(node.depth != null ? node.depth : 0, depth);
    if (next = linkMap[node.id]) {
      for (link of Array.from(next)) { recurse(nodeMap[link.to], depth + 1); }
    }
    return null;
  };

  for (node of Array.from(data.nodes)) {
    if ((node.depth == null)) { recurse(node); }
  }

  return null;
};

var _markup = function(data, links) {
  let column;
  _order(data);

  const wrapper = document.createElement('div');
  wrapper.classList.add('shadergraph-graph');

  const columns = [];
  const outlets = {};

  for (let node of Array.from(data.nodes)) {
    var outlet;
    var block = document.createElement('div');
    block.classList.add("shadergraph-node");
    block.classList.add(`shadergraph-node-${node.type}`);

    block.innerHTML = `\
<div class="shadergraph-header">${escapeText(node.name)}</div>\
`;

    const addOutlet = function(outlet, inout) {
      const color = hashColor(outlet.type);

      const div = document.createElement('div');
      div.classList.add('shadergraph-outlet');
      div.classList.add(`shadergraph-outlet-${inout}`);
      div.innerHTML = `\
<div class="shadergraph-point" style="background: ${color}"></div>
<div class="shadergraph-type" style="color: ${color}">${escapeText(outlet.type)}</div>
<div class="shadergraph-name">${escapeText(outlet.name)}</div>\
`;
      block.appendChild(div);

      return outlets[outlet.id] = div.querySelector('.shadergraph-point');
    };

    for (outlet of Array.from(node.inputs)) { addOutlet(outlet, 'in'); }
    for (outlet of Array.from(node.outputs)) { addOutlet(outlet, 'out'); }

    if (node.graph != null) {
      block.appendChild(_markup(node.graph, links));
    } else {
      const clear = document.createElement('div');
      clear.classList.add('shadergraph-clear');
      block.appendChild(clear);
    }

    if (node.code != null) {
      const div = document.createElement('div');
      div.classList.add('shadergraph-code');
      div.innerHTML = escapeText(trim(node.code));
      block.appendChild(div);
    }

    column = columns[node.depth];
    if ((column == null)) {
      column = document.createElement('div');
      column.classList.add('shadergraph-column');
      columns[node.depth] = column;
    }
    column.appendChild(block);
  }

  for (column of Array.from(columns)) { if (column != null) { wrapper.appendChild(column); } }

  for (let link of Array.from(data.links)) {
    const color = hashColor(link.type);

    links.push({
      color,
      out: outlets[link.out],
      in:  outlets[link.in]});
  }

  return wrapper;
};

const sqr    = x => x * x;

const path   = function(x1, y1, x2, y2) {
  let h;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.sqrt(sqr(dx) + sqr(dy));

  const vert = Math.abs(dy) > Math.abs(dx);
  if (vert) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    const f = dy > 0 ? .3 : -.3;
    h = Math.min(Math.abs(dx) / 2, 20 + (d / 8));

    return [
      'M', x1, y1,
      'C', x1 + h, y1 + ',',
           mx, my - (d * f),
           mx, my,
      'C', mx, my + (d * f),
           x2 - h, y2 + ',',
           x2, y2,
    ].join(' ');
  } else {
    h = Math.min(Math.abs(dx) / 2.5, 20 + (d / 4));

    return [
      'M', x1, y1,
      'C', x1 + h, y1 + ',',
           x2 - h, y2 + ',',
           x2, y2,
    ].join(' ');
  }
};

const makeSVG = function(tag) {
  if (tag == null) { tag = 'svg'; }
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
};

var connect = function(element, links) {
  let link;
  if (element.parentNode == null) { return; }

  const ref = element.getBoundingClientRect();

  for (link of Array.from(links)) {
    const a = link.out.getBoundingClientRect();
    const b = link.in .getBoundingClientRect();

    link.coords = {
      x1: ((a.left + a.right)  / 2) - ref.left,
      y1: ((a.top  + a.bottom) / 2) - ref.top,
      x2: ((b.left + b.right)  / 2) - ref.left,
      y2: ((b.top  + b.bottom) / 2) - ref.top
    };
  }

  let svg = element.querySelector('svg');
  if (svg != null) { element.removeChild(svg); }

  let box = element;
  while (box.parentNode && (box.offsetHeight === 0)) { box = box.parentNode; }

  svg = makeSVG();
  svg.setAttribute('width',  box.offsetWidth);
  svg.setAttribute('height', box.offsetHeight);

  for (link of Array.from(links)) {
    const c = link.coords;

    const line = makeSVG('path');
    line.setAttribute('d', path(c.x1, c.y1, c.x2, c.y2));
    line.setAttribute('stroke',       link.color);
    line.setAttribute('stroke-width', 3);
    line.setAttribute('fill',         'transparent');
    svg.appendChild(line);
  }

  return element.appendChild(svg);
};

const overlay = function(contents) {
  const div = document.createElement('div');
  div.setAttribute('class', 'shadergraph-overlay');

  const close = document.createElement('div');
  close.setAttribute('class', 'shadergraph-close');
  close.innerHTML = '&times;';

  const view = document.createElement('div');
  view.setAttribute('class', 'shadergraph-view');

  const inside = document.createElement('div');
  inside.setAttribute('class', 'shadergraph-inside');

  inside.appendChild(contents);
  view.appendChild(inside);
  div.appendChild(view);
  div.appendChild(close);

  close.addEventListener('click', () => div.parentNode.removeChild(div));

  return div;
};

const wrap = function(markup) {
  if (markup instanceof Node) { return markup; }
  const p = document.createElement('span');
  p.innerText = markup != null ? markup : '';
  return p;
};

const merge = function(markup) {
  if (markup.length !== 1) {
    let el;
    const div = document.createElement('div');
    for (el of Array.from(markup)) { div.appendChild(wrap(el)); }
    div.update = () => (() => {
      const result = [];
      for (el of Array.from(markup)) {         result.push((typeof el.update === 'function' ? el.update() : undefined));
      }
      return result;
    })();
    return div;
  } else {
    return wrap(markup[0]);
  }
};

module.exports = {process, merge, overlay};


},{"../factory/hash":208}],233:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Dump graph for debug/visualization purposes
const Block = require('../block');

const isCallback = outlet => outlet.type[0] === '(';

var serialize = function(graph) {

  const nodes = [];
  const links = [];

  for (let node of Array.from(graph.nodes)) {
    var outlet;
    const record = {
      // Data
      id:    node.id,
      name:  null,
      type:  null,
      depth: null,
      graph: null,
      inputs:  [],
      outputs: []
    };

    nodes.push(record);

    const {
      inputs
    } = record;
    const {
      outputs
    } = record;

    const block = node.owner;

    if      (block instanceof Block.Call) {
      record.name  = block.snippet._name;
      record.type  = 'call';
      record.code  = block.snippet._original;

    } else if (block instanceof Block.Callback) {
      record.name  = "Callback";
      record.type  = 'callback';
      record.graph = serialize(block.graph);

    } else if (block instanceof Block.Isolate) {
      record.name  = 'Isolate';
      record.type  = 'isolate';
      record.graph = serialize(block.graph);

    } else if (block instanceof Block.Join) {
      record.name  = 'Join';
      record.type  = 'join';

    } else if (block != null) {
      if (record.name == null) { record.name = block.name != null ? block.name : block.type; }
      if (record.type == null) { record.type = block.type; }
      if (record.code == null) { record.code = block.code; }
      if (block.graph != null) { record.graph = serialize(block.graph); }
    }

    const format = function(type) {
      type = type.replace(")(", ")→(");
      return type = type.replace("()", "");
    };

    for (outlet of Array.from(node.inputs)) {
      inputs.push({
        id:   outlet.id,
        name: outlet.name,
        type: format(outlet.type),
        open: (outlet.input == null)
      });
    }

    for (outlet of Array.from(node.outputs)) {
      outputs.push({
        id:   outlet.id,
        name: outlet.name,
        type: format(outlet.type),
        open: !outlet.output.length
      });

      for (let other of Array.from(outlet.output)) {
        links.push({
          from: node.id,
          out:  outlet.id,
          to:   other.node.id,
          in:   other.id,
          type: format(outlet.type)
        });
      }
    }
  }

  return {nodes, links};
};

module.exports = serialize;
},{"../block":203}],234:[function(require,module,exports){
module.exports = require('./lib/index')

},{"./lib/index":236}],235:[function(require,module,exports){
var state
  , token
  , tokens
  , idx

var original_symbol = {
    nud: function() { return this.children && this.children.length ? this : fail('unexpected')() }
  , led: fail('missing operator')
}

var symbol_table = {}

function itself() {
  return this
}

symbol('(ident)').nud = itself
symbol('(keyword)').nud = itself
symbol('(builtin)').nud = itself
symbol('(literal)').nud = itself
symbol('(end)')

symbol(':')
symbol(';')
symbol(',')
symbol(')')
symbol(']')
symbol('}')

infixr('&&', 30)
infixr('||', 30)
infix('|', 43)
infix('^', 44)
infix('&', 45)
infix('==', 46)
infix('!=', 46)
infix('<', 47)
infix('<=', 47)
infix('>', 47)
infix('>=', 47)
infix('>>', 48)
infix('<<', 48)
infix('+', 50)
infix('-', 50)
infix('*', 60)
infix('/', 60)
infix('%', 60)
infix('?', 20, function(left) {
  this.children = [left, expression(0), (advance(':'), expression(0))]
  this.type = 'ternary'
  return this
})
infix('.', 80, function(left) {
  token.type = 'literal'
  state.fake(token)
  this.children = [left, token]
  advance()
  return this
})
infix('[', 80, function(left) {
  this.children = [left, expression(0)]
  this.type = 'binary'
  advance(']')
  return this
})
infix('(', 80, function(left) {
  this.children = [left]
  this.type = 'call'

  if(token.data !== ')') while(1) {
    this.children.push(expression(0))
    if(token.data !== ',') break
    advance(',')
  }
  advance(')')
  return this
})

prefix('-')
prefix('+')
prefix('!')
prefix('~')
prefix('defined')
prefix('(', function() {
  this.type = 'group'
  this.children = [expression(0)]
  advance(')')
  return this 
})
prefix('++')
prefix('--')
suffix('++')
suffix('--')

assignment('=')
assignment('+=')
assignment('-=')
assignment('*=')
assignment('/=')
assignment('%=')
assignment('&=')
assignment('|=')
assignment('^=')
assignment('>>=')
assignment('<<=')

module.exports = function(incoming_state, incoming_tokens) {
  state = incoming_state
  tokens = incoming_tokens
  idx = 0
  var result

  if(!tokens.length) return

  advance()
  result = expression(0)
  result.parent = state[0]
  emit(result)

  if(idx < tokens.length) {
    throw new Error('did not use all tokens')
  }

  result.parent.children = [result]

  function emit(node) {
    state.unshift(node, false)
    for(var i = 0, len = node.children.length; i < len; ++i) {
      emit(node.children[i])
    }
    state.shift()
  }

}

function symbol(id, binding_power) {
  var sym = symbol_table[id]
  binding_power = binding_power || 0
  if(sym) {
    if(binding_power > sym.lbp) {
      sym.lbp = binding_power
    }
  } else {
    sym = Object.create(original_symbol)
    sym.id = id 
    sym.lbp = binding_power
    symbol_table[id] = sym
  }
  return sym
}

function expression(rbp) {
  var left, t = token
  advance()

  left = t.nud()
  while(rbp < token.lbp) {
    t = token
    advance()
    left = t.led(left)
  }
  return left
}

function infix(id, bp, led) {
  var sym = symbol(id, bp)
  sym.led = led || function(left) {
    this.children = [left, expression(bp)]
    this.type = 'binary'
    return this
  }
}

function infixr(id, bp, led) {
  var sym = symbol(id, bp)
  sym.led = led || function(left) {
    this.children = [left, expression(bp - 1)]
    this.type = 'binary'
    return this
  }
  return sym
}

function prefix(id, nud) {
  var sym = symbol(id)
  sym.nud = nud || function() {
    this.children = [expression(70)]
    this.type = 'unary'
    return this
  }
  return sym
}

function suffix(id) {
  var sym = symbol(id, 150)
  sym.led = function(left) {
    this.children = [left]
    this.type = 'suffix'
    return this
  }
}

function assignment(id) {
  return infixr(id, 10, function(left) {
    this.children = [left, expression(9)]
    this.assignment = true
    this.type = 'assign'
    return this
  })
}

function advance(id) {
  var next
    , value
    , type
    , output

  if(id && token.data !== id) {
    return state.unexpected('expected `'+ id + '`, got `'+token.data+'`')
  }

  if(idx >= tokens.length) {
    token = symbol_table['(end)']
    return
  }

  next = tokens[idx++]
  value = next.data
  type = next.type

  if(type === 'ident') {
    output = state.scope.find(value) || state.create_node()
    type = output.type
  } else if(type === 'builtin') {
    output = symbol_table['(builtin)']
  } else if(type === 'keyword') {
    output = symbol_table['(keyword)']
  } else if(type === 'operator') {
    output = symbol_table[value]
    if(!output) {
      return state.unexpected('unknown operator `'+value+'`')
    }
  } else if(type === 'float' || type === 'integer') {
    type = 'literal'
    output = symbol_table['(literal)']
  } else {
    return state.unexpected('unexpected token.')
  }

  if(output) {
    if(!output.nud) { output.nud = itself }
    if(!output.children) { output.children = [] }
  }

  output = Object.create(output)
  output.token = next
  output.type = type
  if(!output.data) output.data = value

  return token = output
}

function fail(message) {
  return function() { return state.unexpected(message) }
}

},{}],236:[function(require,module,exports){
module.exports = parser

var through = require('../../through')
  , full_parse_expr = require('./expr')
  , Scope = require('./scope')

// singleton!
var Advance = new Object

var DEBUG = false

var _ = 0
  , IDENT = _++
  , STMT = _++
  , STMTLIST = _++
  , STRUCT = _++
  , FUNCTION = _++
  , FUNCTIONARGS = _++
  , DECL = _++
  , DECLLIST = _++
  , FORLOOP = _++
  , WHILELOOP = _++
  , IF = _++
  , EXPR = _++
  , PRECISION = _++
  , COMMENT = _++
  , PREPROCESSOR = _++
  , KEYWORD = _++
  , KEYWORD_OR_IDENT = _++
  , RETURN = _++
  , BREAK = _++
  , CONTINUE = _++
  , DISCARD = _++
  , DOWHILELOOP = _++
  , PLACEHOLDER = _++
  , QUANTIFIER = _++

var DECL_ALLOW_ASSIGN = 0x1
  , DECL_ALLOW_COMMA = 0x2
  , DECL_REQUIRE_NAME = 0x4
  , DECL_ALLOW_INVARIANT = 0x8
  , DECL_ALLOW_STORAGE = 0x10
  , DECL_NO_INOUT = 0x20
  , DECL_ALLOW_STRUCT = 0x40
  , DECL_STATEMENT = 0xFF
  , DECL_FUNCTION = DECL_STATEMENT & ~(DECL_ALLOW_ASSIGN | DECL_ALLOW_COMMA | DECL_NO_INOUT | DECL_ALLOW_INVARIANT | DECL_REQUIRE_NAME)
  , DECL_STRUCT = DECL_STATEMENT & ~(DECL_ALLOW_ASSIGN | DECL_ALLOW_INVARIANT | DECL_ALLOW_STORAGE | DECL_ALLOW_STRUCT)

var QUALIFIERS = ['const', 'attribute', 'uniform', 'varying']

var NO_ASSIGN_ALLOWED = false
  , NO_COMMA_ALLOWED = false

// map of tokens to stmt types
var token_map = {
    'block-comment': COMMENT
  , 'line-comment': COMMENT
  , 'preprocessor': PREPROCESSOR
}

// map of stmt types to human
var stmt_type = _ = [ 
    'ident'
  , 'stmt'
  , 'stmtlist'
  , 'struct'
  , 'function'
  , 'functionargs'
  , 'decl'
  , 'decllist'
  , 'forloop'
  , 'whileloop'
  , 'i'+'f'
  , 'expr'
  , 'precision'
  , 'comment'
  , 'preprocessor'
  , 'keyword'
  , 'keyword_or_ident'
  , 'return'
  , 'break'
  , 'continue'
  , 'discard'
  , 'do-while'
  , 'placeholder'
  , 'quantifier'
]

function parser() {
  var stmtlist = n(STMTLIST)
    , stmt = n(STMT)
    , decllist = n(DECLLIST)
    , precision = n(PRECISION)
    , ident = n(IDENT)
    , keyword_or_ident = n(KEYWORD_OR_IDENT)
    , fn = n(FUNCTION)
    , fnargs = n(FUNCTIONARGS)
    , forstmt = n(FORLOOP)
    , ifstmt = n(IF)
    , whilestmt = n(WHILELOOP)
    , returnstmt = n(RETURN)
    , dowhilestmt = n(DOWHILELOOP)
    , quantifier = n(QUANTIFIER)

  var parse_struct
    , parse_precision
    , parse_quantifier
    , parse_forloop
    , parse_if
    , parse_return
    , parse_whileloop
    , parse_dowhileloop
    , parse_function
    , parse_function_args

  var stream = through(write, end)
    , check = arguments.length ? [].slice.call(arguments) : []
    , depth = 0
    , state = []
    , tokens = []
    , whitespace = []
    , errored = false
    , program
    , token
    , node

  // setup state
  state.shift = special_shift
  state.unshift = special_unshift
  state.fake = special_fake
  state.unexpected = unexpected
  state.scope = new Scope(state)
  state.create_node = function() {
    var n = mknode(IDENT, token)
    n.parent = stream.program
    return n
  }

  setup_stative_parsers()

  // setup root node
  node = stmtlist()
  node.expecting = '(eof)'
  node.mode = STMTLIST
  node.token = {type: '(program)', data: '(program)'}
  program = node

  stream.program = program
  stream.scope = function(scope) {
    if(arguments.length === 1) {
      state.scope = scope
    }
    return state.scope
  }

  state.unshift(node)
  return stream

  // stream functions ---------------------------------------------

  function write(input) {
    if(input.type === 'whitespace' || input.type === 'line-comment' || input.type === 'block-comment') {

      whitespace.push(input)
      return
    }
    tokens.push(input)
    token = token || tokens[0]

    if(token && whitespace.length) {
      token.preceding = token.preceding || []
      token.preceding = token.preceding.concat(whitespace)
      whitespace = []
    }

    while(take()) switch(state[0].mode) {
      case STMT: parse_stmt(); break
      case STMTLIST: parse_stmtlist(); break
      case DECL: parse_decl(); break
      case DECLLIST: parse_decllist(); break
      case EXPR: parse_expr(); break
      case STRUCT: parse_struct(true, true); break
      case PRECISION: parse_precision(); break
      case IDENT: parse_ident(); break
      case KEYWORD: parse_keyword(); break
      case KEYWORD_OR_IDENT: parse_keyword_or_ident(); break
      case FUNCTION: parse_function(); break
      case FUNCTIONARGS: parse_function_args(); break
      case FORLOOP: parse_forloop(); break
      case WHILELOOP: parse_whileloop(); break
      case DOWHILELOOP: parse_dowhileloop(); break
      case RETURN: parse_return(); break
      case IF: parse_if(); break
      case QUANTIFIER: parse_quantifier(); break
    }
  }
  
  function end(tokens) {
    if(arguments.length) {
      write(tokens)
    }

    if(state.length > 1) {
      unexpected('unexpected EOF')
      return
    }

    stream.emit('end')
  }

  function take() {
    if(errored || !state.length)
      return false

    return (token = tokens[0]) && !stream.paused
  }

  // ----- state manipulation --------

  function special_fake(x) {
    state.unshift(x)
    state.shift()
  }

  function special_unshift(_node, add_child) {
    _node.parent = state[0]

    var ret = [].unshift.call(this, _node)

    add_child = add_child === undefined ? true : add_child

    if(DEBUG) {
      var pad = ''
      for(var i = 0, len = this.length - 1; i < len; ++i) {
        pad += ' |'
      }
      console.log(pad, '\\'+_node.type, _node.token.data)
    }

    if(add_child && node !== _node) node.children.push(_node)
    node = _node

    return ret
  }

  function special_shift() {
    var _node = [].shift.call(this)
      , okay = check[this.length]
      , emit = false

    if(DEBUG) {
      var pad = ''
      for(var i = 0, len = this.length; i < len; ++i) {
        pad += ' |'
      }
      console.log(pad, '/'+_node.type)
    }

    if(check.length) { 
      if(typeof check[0] === 'function') {
        emit = check[0](_node)
      } else if(okay !== undefined) {
        emit = okay.test ? okay.test(_node.type) : okay === _node.type
      }
    } else {
      emit = true
    }

    if(emit) stream.emit('data', _node) 
  
    node = _node.parent
    return _node
  }

  // parse states ---------------

  function parse_stmtlist() {
    // determine the type of the statement
    // and then start parsing
    return stative(
      function() { state.scope.enter(); return Advance }
    , normal_mode
    )()

    function normal_mode() {
      if(token.data === state[0].expecting) {
        return state.scope.exit(), state.shift()
      }
      switch(token.type) {
        case 'preprocessor':
          state.fake(adhoc())
          tokens.shift()
        return
        default:
          state.unshift(stmt())
        return 
      }
    }
  }

  function parse_stmt() {
    if(state[0].brace) {
      if(token.data !== '}') {
        return unexpected('expected `}`, got '+token.data)
      }
      state[0].brace = false
      return tokens.shift(), state.shift()
    }
    switch(token.type) {
      case 'eof': return state.shift()
      case 'keyword': 
        switch(token.data) {
          case 'for': return state.unshift(forstmt());
          case 'if': return state.unshift(ifstmt());
          case 'while': return state.unshift(whilestmt());
          case 'do': return state.unshift(dowhilestmt());
          case 'break': return state.fake(mknode(BREAK, token)), tokens.shift()
          case 'continue': return state.fake(mknode(CONTINUE, token)), tokens.shift()
          case 'discard': return state.fake(mknode(DISCARD, token)), tokens.shift()
          case 'return': return state.unshift(returnstmt());
          case 'precision': return state.unshift(precision());
        }
        return state.unshift(decl(DECL_STATEMENT))
      case 'ident':
        var lookup
        if(lookup = state.scope.find(token.data)) {
          if(lookup.parent.type === 'struct') {
            // this is strictly untrue, you could have an
            // expr that starts with a struct constructor.
            //      ... sigh
            return state.unshift(decl(DECL_STATEMENT))
          }
          return state.unshift(expr(';'))
        }
      case 'operator':
        if(token.data === '{') {
          state[0].brace = true
          var n = stmtlist()
          n.expecting = '}'
          return tokens.shift(), state.unshift(n)
        }
        if(token.data === ';') {
          return tokens.shift(), state.shift()
        }
      default: return state.unshift(expr(';'))
    }
  }

  function parse_decl() {
    var stmt = state[0]

    return stative(
      invariant_or_not,
      storage_or_not,
      parameter_or_not,
      precision_or_not,
      struct_or_type,
      maybe_name,
      maybe_lparen,     // lparen means we're a function
      is_decllist,
      done
    )()

    function invariant_or_not() {
      if(token.data === 'invariant') {
        if(stmt.flags & DECL_ALLOW_INVARIANT) {
          state.unshift(keyword())
          return Advance
        } else {
          return unexpected('`invariant` is not allowed here') 
        }
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function storage_or_not() {
      if(is_storage(token)) {
        if(stmt.flags & DECL_ALLOW_STORAGE) {
          state.unshift(keyword()) 
          return Advance
        } else {
          return unexpected('storage is not allowed here') 
        }
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function parameter_or_not() {
      if(is_parameter(token)) {
        if(!(stmt.flags & DECL_NO_INOUT)) {
          state.unshift(keyword()) 
          return Advance
        } else {
          return unexpected('parameter is not allowed here') 
        }
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function precision_or_not() {
      if(is_precision(token)) {
        state.unshift(keyword())
        return Advance
      } else {
        state.fake(mknode(PLACEHOLDER, {data: '', position: token.position}))
        return Advance
      }
    }

    function struct_or_type() {
      if(token.data === 'struct') {
        if(!(stmt.flags & DECL_ALLOW_STRUCT)) {
          return unexpected('cannot nest structs')
        }
        state.unshift(struct())
        return Advance
      }

      if(token.type === 'keyword') {
        state.unshift(keyword())
        return Advance
      }

      var lookup = state.scope.find(token.data)

      if(lookup) {
        state.fake(Object.create(lookup))
        tokens.shift()
        return Advance  
      }
      return unexpected('expected user defined type, struct or keyword, got '+token.data)
    }

    function maybe_name() {
      if(token.data === ',' && !(stmt.flags & DECL_ALLOW_COMMA)) {
        return state.shift()
      }

      if(token.data === '[') {
        // oh lord.
        state.unshift(quantifier())
        return
      }

      if(token.data === ')') return state.shift()

      if(token.data === ';') {
        return stmt.stage + 3
      }

      if(token.type !== 'ident') {
        console.log(token);
        return unexpected('expected identifier, got '+token.data)
      }

      stmt.collected_name = tokens.shift()
      return Advance      
    }

    function maybe_lparen() {
      if(token.data === '(') {
        tokens.unshift(stmt.collected_name)
        delete stmt.collected_name
        state.unshift(fn())
        return stmt.stage + 2 
      }
      return Advance
    }

    function is_decllist() {
      tokens.unshift(stmt.collected_name)
      delete stmt.collected_name
      state.unshift(decllist())
      return Advance
    }

    function done() {
      return state.shift()
    }
  }
  
  function parse_decllist() {
    // grab ident

    if(token.type === 'ident') {
      var name = token.data
      state.unshift(ident())
      state.scope.define(name)
      return
    }

    if(token.type === 'operator') {

      if(token.data === ',') {
        // multi-decl!
        if(!(state[1].flags & DECL_ALLOW_COMMA)) {
          return state.shift()
        }

        return tokens.shift()
      } else if(token.data === '=') {
        if(!(state[1].flags & DECL_ALLOW_ASSIGN)) return unexpected('`=` is not allowed here.')

        tokens.shift()

        state.unshift(expr(',', ';'))
        return
      } else if(token.data === '[') {
        state.unshift(quantifier())
        return
      }
    }
    return state.shift()
  }

  function parse_keyword_or_ident() {
    if(token.type === 'keyword') {
      state[0].type = 'keyword'
      state[0].mode = KEYWORD
      return
    }

    if(token.type === 'ident') {
      state[0].type = 'ident'
      state[0].mode = IDENT
      return
    }

    return unexpected('expected keyword or user-defined name, got '+token.data)
  }

  function parse_keyword() {
    if(token.type !== 'keyword') {
      return unexpected('expected keyword, got '+token.data)
    }

    return state.shift(), tokens.shift()
  }

  function parse_ident() {
    if(token.type !== 'ident') {
      return unexpected('expected user-defined name, got '+token.data)
    }

    state[0].data = token.data
    return state.shift(), tokens.shift()
  }


  function parse_expr() {
    var expecting = state[0].expecting

    state[0].tokens = state[0].tokens || []

    if(state[0].parenlevel === undefined) {
      state[0].parenlevel = 0
      state[0].bracelevel = 0
    }
    if(state[0].parenlevel < 1 && expecting.indexOf(token.data) > -1) {
      return parseexpr(state[0].tokens)
    }
    if(token.data === '(') {
      ++state[0].parenlevel
    } else if(token.data === ')') {
      --state[0].parenlevel
    }

    switch(token.data) {
      case '{': ++state[0].bracelevel; break
      case '}': --state[0].bracelevel; break
      case '(': ++state[0].parenlevel; break
      case ')': --state[0].parenlevel; break
    }

    if(state[0].parenlevel < 0) return unexpected('unexpected `)`')
    if(state[0].bracelevel < 0) return unexpected('unexpected `}`')

    state[0].tokens.push(tokens.shift())
    return

    function parseexpr(tokens) {
      return full_parse_expr(state, tokens), state.shift()
    }
  }

  // node types ---------------

  function n(type) {
    // this is a function factory that suffices for most kinds of expressions and statements
    return function() {
      return mknode(type, token)
    }
  }

  function adhoc() {
    return mknode(token_map[token.type], token, node)
  }

  function decl(flags) {
    var _ = mknode(DECL, token, node)
    _.flags = flags

    return _
  }

  function struct(allow_assign, allow_comma) {
    var _ = mknode(STRUCT, token, node)
    _.allow_assign = allow_assign === undefined ? true : allow_assign
    _.allow_comma = allow_comma === undefined ? true : allow_comma
    return _
  }

  function expr() {
    var n = mknode(EXPR, token, node)

    n.expecting = [].slice.call(arguments)
    return n
  }
  
  function keyword(default_value) {
    var t = token
    if(default_value) {
      t = {'type': '(implied)', data: '(default)', position: t.position} 
    }
    return mknode(KEYWORD, t, node)
  }

  // utils ----------------------------

  function unexpected(str) {
    errored = true
    stream.emit('error', new Error(
      (str || 'unexpected '+state) +
      ' at line '+state[0].token.line
    ))
  }

  function assert(type, data) {
    return 1,
      assert_null_string_or_array(type, token.type) && 
      assert_null_string_or_array(data, token.data)
  }

  function assert_null_string_or_array(x, y) {
    switch(typeof x) {
      case 'string': if(y !== x) {
        unexpected('expected `'+x+'`, got '+y+'\n'+token.data);
      } return !errored

      case 'object': if(x && x.indexOf(y) === -1) {
        unexpected('expected one of `'+x.join('`, `')+'`, got '+y);
      } return !errored
    }
    return true
  }

  // stative ----------------------------

  function stative() {
    var steps = [].slice.call(arguments)
      , step
      , result

    return function() {
      var current = state[0]

      current.stage || (current.stage = 0)

      step = steps[current.stage]
      if(!step) return unexpected('parser in undefined state!')

      result = step()

      if(result === Advance) return ++current.stage
      if(result === undefined) return
      current.stage = result
    } 
  }

  function advance(op, t) {
    t = t || 'operator'
    return function() {
      if(!assert(t, op)) return

      var last = tokens.shift()
        , children = state[0].children
        , last_node = children[children.length - 1]

      if(last_node && last_node.token && last.preceding) {
        last_node.token.succeeding = last_node.token.succeeding || []
        last_node.token.succeeding = last_node.token.succeeding.concat(last.preceding)
      }
      return Advance
    }
  }

  function advance_expr(until) {
    return function() { return state.unshift(expr(until)), Advance }
  }

  function advance_ident(declare) {
    return declare ? function() {
      var name = token.data
      return assert('ident') && (state.unshift(ident()), state.scope.define(name), Advance)
    } :  function() {
      if(!assert('ident')) return

      var s = Object.create(state.scope.find(token.data))
      s.token = token

      return (tokens.shift(), Advance)
    }
  }

  function advance_stmtlist() {
    return function() {
      var n = stmtlist()
      n.expecting = '}'
      return state.unshift(n), Advance
    }
  }

  function maybe_stmtlist(skip) {
    return function() {
      var current = state[0].stage
      if(token.data !== '{') { return state.unshift(stmt()), current + skip }
      return tokens.shift(), Advance
    }
  }

  function popstmt() {
    return function() { return state.shift(), state.shift() }
  }


  function setup_stative_parsers() {

    // could also be
    // struct { } decllist
    parse_struct =
        stative(
          advance('struct', 'keyword')
        , function() {
            if(token.data === '{') {
              state.fake(mknode(IDENT, {data:'', position: token.position, type:'ident'}))
              return Advance
            }

            return advance_ident(true)()
          }
        , function() { state.scope.enter(); return Advance }
        , advance('{')
        , function() {
            if(token.data === '}') {
              state.scope.exit()
              tokens.shift()
              return state.shift()
            }
            if(token.data === ';') { tokens.shift(); return }
            state.unshift(decl(DECL_STRUCT))
          }
        )

    parse_precision =
        stative(
          function() { return tokens.shift(), Advance }
        , function() { 
            return assert(
            'keyword', ['lowp', 'mediump', 'highp']
            ) && (state.unshift(keyword()), Advance) 
          }
        , function() { return (state.unshift(keyword()), Advance) }
        , function() { return state.shift() } 
        )

    parse_quantifier =
        stative(
          advance('[')
        , advance_expr(']')
        , advance(']')
        , function() { return state.shift() }
        )

    parse_forloop = 
        stative(
          advance('for', 'keyword')
        , advance('(')
        , function() {
            var lookup
            if(token.type === 'ident') {
              if(!(lookup = state.scope.find(token.data))) {
                lookup = state.create_node()
              }
             
              if(lookup.parent.type === 'struct') {
                return state.unshift(decl(DECL_STATEMENT)), Advance
              }
            } else if(token.type === 'builtin' || token.type === 'keyword') {
              return state.unshift(decl(DECL_STATEMENT)), Advance
            }
            return advance_expr(';')()
          }
        , advance(';')
        , advance_expr(';')
        , advance(';')
        , advance_expr(')')
        , advance(')')
        , maybe_stmtlist(3)
        , advance_stmtlist()
        , advance('}')
        , popstmt()
        )

    parse_if = 
        stative(
          advance('if', 'keyword')
        , advance('(')
        , advance_expr(')')
        , advance(')')
        , maybe_stmtlist(3)
        , advance_stmtlist()
        , advance('}')
        , function() {
            if(token.data === 'else') {
              return tokens.shift(), state.unshift(stmt()), Advance
            }
            return popstmt()()
          }
        , popstmt()
        )

    parse_return =
        stative(
          advance('return', 'keyword')
        , function() {
            if(token.data === ';') return Advance
            return state.unshift(expr(';')), Advance
          }
        , function() { tokens.shift(), popstmt()() } 
        )

    parse_whileloop =
        stative(
          advance('while', 'keyword')
        , advance('(')
        , advance_expr(')')
        , advance(')')
        , maybe_stmtlist(3)
        , advance_stmtlist()
        , advance('}')
        , popstmt()
        )

    parse_dowhileloop = 
      stative(
        advance('do', 'keyword')
      , maybe_stmtlist(3)
      , advance_stmtlist()
      , advance('}')
      , advance('while', 'keyword')
      , advance('(')
      , advance_expr(')')
      , advance(')')
      , popstmt()
      )

    parse_function =
      stative(
        function() {
          for(var i = 1, len = state.length; i < len; ++i) if(state[i].mode === FUNCTION) {
            return unexpected('function definition is not allowed within another function')
          }

          return Advance
        }
      , function() {
          if(!assert("ident")) return

          var name = token.data
            , lookup = state.scope.find(name)

          state.unshift(ident())
          state.scope.define(name)

          state.scope.enter(lookup ? lookup.scope : null)
          return Advance
        }
      , advance('(')
      , function() { return state.unshift(fnargs()), Advance }
      , advance(')')
      , function() { 
          // forward decl
          if(token.data === ';') {
            return state.scope.exit(), state.shift(), state.shift()
          }
          return Advance
        }
      , advance('{')
      , advance_stmtlist()
      , advance('}')
      , function() { state.scope.exit(); return Advance } 
      , function() { return state.shift(), state.shift(), state.shift() }
      )

    parse_function_args =
      stative(
        function() {
          if(token.data === 'void') { state.fake(keyword()); tokens.shift(); return Advance }
          if(token.data === ')') { state.shift(); return }
          if(token.data === 'struct') {
            state.unshift(struct(NO_ASSIGN_ALLOWED, NO_COMMA_ALLOWED))
            return Advance
          }
          state.unshift(decl(DECL_FUNCTION))
          return Advance
        }
      , function() {
          if(token.data === ',') { tokens.shift(); return 0 }
          if(token.data === ')') { state.shift(); return }
          unexpected('expected one of `,` or `)`, got '+token.data)
        }
      )
  }
}

function mknode(mode, sourcetoken) {
  return {
      mode: mode
    , token: sourcetoken
    , children: []
    , type: stmt_type[mode]
//    , id: (Math.random() * 0xFFFFFFFF).toString(16)
  }
}

function is_storage(token) {
  return token.data === 'const' ||
         token.data === 'attribute' ||
         token.data === 'uniform' ||
         token.data === 'varying'
}

function is_parameter(token) {
  return token.data === 'in' ||
         token.data === 'inout' ||
         token.data === 'out'
}

function is_precision(token) {
  return token.data === 'highp' ||
         token.data === 'mediump' ||
         token.data === 'lowp'
}

},{"../../through":242,"./expr":235,"./scope":237}],237:[function(require,module,exports){
module.exports = scope

function scope(state) {
  if(this.constructor !== scope)
    return new scope(state)

  this.state = state
  this.scopes = []
  this.current = null
}

var cons = scope
  , proto = cons.prototype

proto.enter = function(s) {
  this.scopes.push(
    this.current = this.state[0].scope = s || {}
  )
}

proto.exit = function() {
  this.scopes.pop()
  this.current = this.scopes[this.scopes.length - 1]
}

proto.define = function(str) {
  this.current[str] = this.state[0]
}

proto.find = function(name, fail) {
  for(var i = this.scopes.length - 1; i > -1; --i) {
    if(this.scopes[i].hasOwnProperty(name)) {
      return this.scopes[i][name]
    }
  }

  return null
}

},{}],238:[function(require,module,exports){
module.exports = tokenize

var through = require('../through')

var literals = require('./lib/literals')
  , operators = require('./lib/operators')
  , builtins = require('./lib/builtins')

var NORMAL = 999          // <-- never emitted
  , TOKEN = 9999          // <-- never emitted 
  , BLOCK_COMMENT = 0 
  , LINE_COMMENT = 1
  , PREPROCESSOR = 2
  , OPERATOR = 3
  , INTEGER = 4
  , FLOAT = 5
  , IDENT = 6
  , BUILTIN = 7
  , KEYWORD = 8
  , WHITESPACE = 9
  , EOF = 10 
  , HEX = 11

var map = [
    'block-comment'
  , 'line-comment'
  , 'preprocessor'
  , 'operator'
  , 'integer'
  , 'float'
  , 'ident'
  , 'builtin'
  , 'keyword'
  , 'whitespace'
  , 'eof'
  , 'integer'
]

function tokenize() {
  var stream = through(write, end)

  var i = 0
    , total = 0
    , mode = NORMAL 
    , c
    , last
    , content = []
    , token_idx = 0
    , token_offs = 0
    , line = 1
    , start = 0
    , isnum = false
    , isoperator = false
    , input = ''
    , len

  return stream

  function token(data) {
    if(data.length) {
      stream.queue({
        type: map[mode]
      , data: data
      , position: start
      , line: line
      })
    }
  }

  function write(chunk) {
    i = 0
    input += chunk.toString()
    len = input.length

    while(c = input[i], i < len) switch(mode) {
      case BLOCK_COMMENT: i = block_comment(); break
      case LINE_COMMENT: i = line_comment(); break
      case PREPROCESSOR: i = preprocessor(); break 
      case OPERATOR: i = operator(); break
      case INTEGER: i = integer(); break
      case HEX: i = hex(); break
      case FLOAT: i = decimal(); break
      case TOKEN: i = readtoken(); break
      case WHITESPACE: i = whitespace(); break
      case NORMAL: i = normal(); break
    }

    total += i
    input = input.slice(i)
  } 

  function end(chunk) {
    if(content.length) {
      token(content.join(''))
    }

    mode = EOF
    token('(eof)')

    stream.queue(null)
  }

  function normal() {
    content = content.length ? [] : content

    if(last === '/' && c === '*') {
      start = total + i - 1
      mode = BLOCK_COMMENT
      last = c
      return i + 1
    }

    if(last === '/' && c === '/') {
      start = total + i - 1
      mode = LINE_COMMENT
      last = c
      return i + 1
    }

    if(c === '#') {
      mode = PREPROCESSOR
      start = total + i
      return i
    }

    if(/\s/.test(c)) {
      mode = WHITESPACE
      start = total + i
      return i
    }

    isnum = /\d/.test(c)
    isoperator = /[^\w_]/.test(c)

    start = total + i
    mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN
    return i
  }

  function whitespace() {
    if(c === '\n') ++line

    if(/[^\s]/g.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function preprocessor() {
    if(c === '\n') ++line

    if(c === '\n' && last !== '\\') {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function line_comment() {
    return preprocessor()
  }

  function block_comment() {
    if(c === '/' && last === '*') {
      content.push(c)
      token(content.join(''))
      mode = NORMAL
      return i + 1
    }

    if(c === '\n') ++line

    content.push(c)
    last = c
    return i + 1
  }

  function operator() {
    if(last === '.' && /\d/.test(c)) {
      mode = FLOAT
      return i
    }

    if(last === '/' && c === '*') {
      mode = BLOCK_COMMENT
      return i
    }

    if(last === '/' && c === '/') {
      mode = LINE_COMMENT
      return i
    }

    if(c === '.' && content.length) {
      while(determine_operator(content));
      
      mode = FLOAT
      return i
    }

    if(c === ';') {
      if(content.length) while(determine_operator(content));
      token(c)
      mode = NORMAL
      return i + 1
    }

    var is_composite_operator = content.length === 2 && c !== '='
    if(/[\w_\d\s]/.test(c) || is_composite_operator) {
      while(determine_operator(content));
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function determine_operator(buf) {
    var j = 0
      , k = buf.length
      , idx

    do {
      idx = operators.indexOf(buf.slice(0, buf.length + j).join(''))
      if(idx === -1) { 
        j -= 1
        k -= 1
        if (k < 0) return 0
        continue
      }
      
      token(operators[idx])

      start += operators[idx].length
      content = content.slice(operators[idx].length)
      return content.length
    } while(1)
  }

  function hex() {
    if(/[^a-fA-F0-9]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1    
  }

  function integer() {
    if(c === '.') {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(c === 'x' && content.length === 1 && content[0] === '0') {
      mode = HEX
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function decimal() {
    if(c === 'f') {
      content.push(c)
      last = c
      i += 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function readtoken() {
    if(/[^\d\w_]/.test(c)) {
      var contentstr = content.join('')
      if(literals.indexOf(contentstr) > -1) {
        mode = KEYWORD
      } else if(builtins.indexOf(contentstr) > -1) {
        mode = BUILTIN
      } else {
        mode = IDENT
      }
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }
}

},{"../through":242,"./lib/builtins":239,"./lib/literals":240,"./lib/operators":241}],239:[function(require,module,exports){
module.exports = [
    'gl_Position'
  , 'gl_PointSize'
  , 'gl_ClipVertex'
  , 'gl_FragCoord'
  , 'gl_FrontFacing'
  , 'gl_FragColor'
  , 'gl_FragData'
  , 'gl_FragDepth'
  , 'gl_Color'
  , 'gl_SecondaryColor'
  , 'gl_Normal'
  , 'gl_Vertex'
  , 'gl_MultiTexCoord0'
  , 'gl_MultiTexCoord1'
  , 'gl_MultiTexCoord2'
  , 'gl_MultiTexCoord3'
  , 'gl_MultiTexCoord4'
  , 'gl_MultiTexCoord5'
  , 'gl_MultiTexCoord6'
  , 'gl_MultiTexCoord7'
  , 'gl_FogCoord'
  , 'gl_MaxLights'
  , 'gl_MaxClipPlanes'
  , 'gl_MaxTextureUnits'
  , 'gl_MaxTextureCoords'
  , 'gl_MaxVertexAttribs'
  , 'gl_MaxVertexUniformComponents'
  , 'gl_MaxVaryingFloats'
  , 'gl_MaxVertexTextureImageUnits'
  , 'gl_MaxCombinedTextureImageUnits'
  , 'gl_MaxTextureImageUnits'
  , 'gl_MaxFragmentUniformComponents'
  , 'gl_MaxDrawBuffers'
  , 'gl_ModelViewMatrix'
  , 'gl_ProjectionMatrix'
  , 'gl_ModelViewProjectionMatrix'
  , 'gl_TextureMatrix'
  , 'gl_NormalMatrix'
  , 'gl_ModelViewMatrixInverse'
  , 'gl_ProjectionMatrixInverse'
  , 'gl_ModelViewProjectionMatrixInverse'
  , 'gl_TextureMatrixInverse'
  , 'gl_ModelViewMatrixTranspose'
  , 'gl_ProjectionMatrixTranspose'
  , 'gl_ModelViewProjectionMatrixTranspose'
  , 'gl_TextureMatrixTranspose'
  , 'gl_ModelViewMatrixInverseTranspose'
  , 'gl_ProjectionMatrixInverseTranspose'
  , 'gl_ModelViewProjectionMatrixInverseTranspose'
  , 'gl_TextureMatrixInverseTranspose'
  , 'gl_NormalScale'
  , 'gl_DepthRangeParameters'
  , 'gl_DepthRange'
  , 'gl_ClipPlane'
  , 'gl_PointParameters'
  , 'gl_Point'
  , 'gl_MaterialParameters'
  , 'gl_FrontMaterial'
  , 'gl_BackMaterial'
  , 'gl_LightSourceParameters'
  , 'gl_LightSource'
  , 'gl_LightModelParameters'
  , 'gl_LightModel'
  , 'gl_LightModelProducts'
  , 'gl_FrontLightModelProduct'
  , 'gl_BackLightModelProduct'
  , 'gl_LightProducts'
  , 'gl_FrontLightProduct'
  , 'gl_BackLightProduct'
  , 'gl_FogParameters'
  , 'gl_Fog'
  , 'gl_TextureEnvColor'
  , 'gl_EyePlaneS'
  , 'gl_EyePlaneT'
  , 'gl_EyePlaneR'
  , 'gl_EyePlaneQ'
  , 'gl_ObjectPlaneS'
  , 'gl_ObjectPlaneT'
  , 'gl_ObjectPlaneR'
  , 'gl_ObjectPlaneQ'
  , 'gl_FrontColor'
  , 'gl_BackColor'
  , 'gl_FrontSecondaryColor'
  , 'gl_BackSecondaryColor'
  , 'gl_TexCoord'
  , 'gl_FogFragCoord'
  , 'gl_Color'
  , 'gl_SecondaryColor'
  , 'gl_TexCoord'
  , 'gl_FogFragCoord'
  , 'gl_PointCoord'
  , 'radians'
  , 'degrees'
  , 'sin'
  , 'cos'
  , 'tan'
  , 'asin'
  , 'acos'
  , 'atan'
  , 'pow'
  , 'exp'
  , 'log'
  , 'exp2'
  , 'log2'
  , 'sqrt'
  , 'inversesqrt'
  , 'abs'
  , 'sign'
  , 'floor'
  , 'ceil'
  , 'fract'
  , 'mod'
  , 'min'
  , 'max'
  , 'clamp'
  , 'mix'
  , 'step'
  , 'smoothstep'
  , 'length'
  , 'distance'
  , 'dot'
  , 'cross'
  , 'normalize'
  , 'faceforward'
  , 'reflect'
  , 'refract'
  , 'matrixCompMult'
  , 'lessThan'
  , 'lessThanEqual'
  , 'greaterThan'
  , 'greaterThanEqual'
  , 'equal'
  , 'notEqual'
  , 'any'
  , 'all'
  , 'not'
  , 'texture2D'
  , 'texture2DProj'
  , 'texture2DLod'
  , 'texture2DProjLod'
  , 'textureCube'
  , 'textureCubeLod'
]

},{}],240:[function(require,module,exports){
module.exports = [
  // current
    'precision'
  , 'highp'
  , 'mediump'
  , 'lowp'
  , 'attribute'
  , 'const'
  , 'uniform'
  , 'varying'
  , 'break'
  , 'continue'
  , 'do'
  , 'fo'+'r'
  , 'whi'+'le'
  , 'i'+'f'
  , 'else'
  , 'in'
  , 'out'
  , 'inout'
  , 'float'
  , 'int'
  , 'void'
  , 'bool'
  , 'true'
  , 'false'
  , 'discard'
  , 'return'
  , 'mat2'
  , 'mat3'
  , 'mat4'
  , 'vec2'
  , 'vec3'
  , 'vec4'
  , 'ivec2'
  , 'ivec3'
  , 'ivec4'
  , 'bvec2'
  , 'bvec3'
  , 'bvec4'
  , 'sampler1D'
  , 'sampler2D'
  , 'sampler3D'
  , 'samplerCube'
  , 'sampler1DShadow'
  , 'sampler2DShadow'
  , 'struct'

  // future
  , 'asm'
  , 'class'
  , 'union'
  , 'enum'
  , 'typedef'
  , 'template'
  , 'this'
  , 'packed'
  , 'goto'
  , 'switch'
  , 'default'
  , 'inline'
  , 'noinline'
  , 'volatile'
  , 'public'
  , 'static'
  , 'extern'
  , 'external'
  , 'interface'
  , 'long'
  , 'short'
  , 'double'
  , 'half'
  , 'fixed'
  , 'unsigned'
  , 'input'
  , 'output'
  , 'hvec2'
  , 'hvec3'
  , 'hvec4'
  , 'dvec2'
  , 'dvec3'
  , 'dvec4'
  , 'fvec2'
  , 'fvec3'
  , 'fvec4'
  , 'sampler2DRect'
  , 'sampler3DRect'
  , 'sampler2DRectShadow'
  , 'sizeof'
  , 'cast'
  , 'namespace'
  , 'using'
]

},{}],241:[function(require,module,exports){
module.exports = [
    '<<='
  , '>>='
  , '++'
  , '--'
  , '<<'
  , '>>'
  , '<='
  , '>='
  , '=='
  , '!='
  , '&&'
  , '||'
  , '+='
  , '-='
  , '*='
  , '/='
  , '%='
  , '&='
  , '^='
  , '|='
  , '('
  , ')'
  , '['
  , ']'
  , '.'
  , '!'
  , '~'
  , '*'
  , '/'
  , '%'
  , '+'
  , '-'
  , '<'
  , '>'
  , '&'
  , '^'
  , '|'
  , '?'
  , ':'
  , '='
  , ','
  , ';'
  , '{'
  , '}'
]

},{}],242:[function(require,module,exports){
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Synchronous stream wrapper for glsl tokenizer/parser

const through = function(write, end) {
  const output = [];
  const errors = [];

  return {
    output,
    parser: null,
    write,
    end,

    process(parser, data) {
      this.parser = parser;
      write(data);
      this.flush();
      return this.parser.flush();
    },

    flush() {
      end();
      return [output, errors];
    },

    // From tokenizer
    queue(obj) {
      if (obj != null) { return (this.parser != null ? this.parser.write(obj) : undefined); }
    },

    // From parser
    emit(type, node) {
      if (type === 'data') {
        if ((node.parent == null)) {
          output.push(node);
        }
      }
      if (type === 'error') {
        return errors.push(node);
      }
    }
  };
};

module.exports = through;
},{}]},{},[45]);
