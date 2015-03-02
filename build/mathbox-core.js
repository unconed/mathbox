(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.MathBox.Shaders = {"arrow.position": "uniform float worldUnit;\nuniform float lineDepth;\nuniform float lineWidth;\n\nuniform float arrowSize;\nuniform float arrowSpace;\n\nattribute vec4 position4;\nattribute vec3 arrow;\nattribute vec2 attach;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvoid getArrowGeometry(vec4 xyzw, float near, float far, out vec3 left, out vec3 right, out vec3 start) {\n  right = getPosition(xyzw);\n  left  = getPosition(vec4(near, xyzw.yzw));\n  start = getPosition(vec4(far, xyzw.yzw));\n}\n\nmat4 getArrowMatrix(vec3 left, vec3 right, vec3 start) {\n\n  float depth = 1.0;\n  if (lineDepth < 1.0) {\n    // Depth blending\n    float z = max(0.00001, -right.z);\n    depth = mix(z, 1.0, lineDepth);\n  }\n    \n  vec3 diff = left - right;\n  float l = length(diff);\n  if (l == 0.0) {\n    return mat4(1.0, 0.0, 0.0, 0.0,\n                0.0, 1.0, 0.0, 0.0,\n                0.0, 0.0, 1.0, 0.0,\n                0.0, 0.0, 0.0, 1.0);\n  }\n\n  // Construct TBN matrix around shaft\n  vec3 t = normalize(diff);\n  vec3 n = normalize(cross(t, t.yzx + vec3(.1, .2, .3)));\n  vec3 b = cross(n, t);\n  \n  // Shrink arrows when vector gets too small\n  // Approach linear scaling with cubic ease the smaller we get\n  float size = arrowSize * lineWidth * worldUnit * depth * 1.25;\n  diff = right - start;\n  l = length(diff) * arrowSpace;\n  float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);\n  float scale = 1.0 - mini * mini * mini;\n  float range = size * scale;\n  \n  // Size to 2.5:1 ratio\n  float rangeNB = range / 2.5;\n\n  // Anchor at end position\n  return mat4(vec4(n * rangeNB,  0),\n              vec4(b * rangeNB,  0),\n              vec4(t * range, 0),\n              vec4(right,  1.0));\n}\n\nvec3 getArrowPosition() {\n  vec3 left, right, start;\n  \n  getArrowGeometry(position4, attach.x, attach.y, left, right, start);\n  mat4 matrix = getArrowMatrix(left, right, start);\n  return (matrix * vec4(arrow.xyz, 1.0)).xyz;\n\n}\n",
"axis.position": "uniform vec4 axisStep;\nuniform vec4 axisPosition;\n\nvec4 getAxisPosition(vec4 xyzw) {\n  return axisStep * xyzw.x + axisPosition;\n}\n",
"cartesian.position": "uniform mat4 viewMatrix;\n\nvec4 getCartesianPosition(vec4 position) {\n  return viewMatrix * vec4(position.xyz, 1.0);\n}\n",
"cartesian4.position": "uniform vec4 basisScale;\nuniform vec4 basisOffset;\nuniform vec4 viewScale;\nuniform vec4 viewOffset;\n\nvec4 getCartesian4Position(vec4 position) {\n  return position * basisScale + basisOffset;\n}\n",
"color.opaque": "vec4 opaqueColor(vec4 color) {\n  return vec4(color.rgb, 1.0);\n}\n",
"face.position": "attribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvec3 getFacePosition() {\n  return getPosition(position4);\n}\n",
"face.position.normal": "attribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvoid getFaceGeometry(vec4 xyzw, out vec3 pos, out vec3 normal) {\n  vec3 a, b, c;\n\n  a   = getPosition(vec4(xyzw.xyz, 0.0));\n  b   = getPosition(vec4(xyzw.xyz, 1.0));\n  c   = getPosition(vec4(xyzw.xyz, 2.0));\n\n  pos = getPosition(xyzw);\n  normal = normalize(cross(c - a, b - a));\n}\n\nvec3 getFacePositionNormal() {\n  vec3 center, normal;\n\n  getFaceGeometry(position4, center, normal);\n  vNormal   = normal;\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);\n  vPosition = -center;\n\n  return center;\n}\n",
"float.encode": "/*\nFloat encoding technique by\nCarlos Scheidegger\nhttps://github.com/cscheid/lux/blob/master/src/shade/bits/encode_float.js\n\nConversion to GLSL by:\nhttp://concord-consortium.github.io/lab/experiments/webgl-gpgpu/script.js\n*/\n\nfloat shift_right(float v, float amt) { \n  v = floor(v) + 0.5; \n  return floor(v / exp2(amt)); \n}\n\nfloat shift_left(float v, float amt) { \n  return floor(v * exp2(amt) + 0.5); \n}\n\nfloat mask_last(float v, float bits) { \n  return mod(v, shift_left(1.0, bits)); \n}\n\nfloat extract_bits(float num, float from, float to) { \n  from = floor(from + 0.5); to = floor(to + 0.5); \n  return mask_last(shift_right(num, from), to - from); \n}\n\nvec4 encode_float(float val) { \n  if (val == 0.0) return vec4(0, 0, 0, 0); \n  float valuesign = val > 0.0 ? 0.0 : 1.0; \n  val = abs(val); \n  float exponent = floor(log2(val)); \n  float biased_exponent = exponent + 127.0; \n  float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0; \n  float t = biased_exponent / 2.0; \n  float last_bit_of_biased_exponent = fract(t) * 2.0; \n  float remaining_bits_of_biased_exponent = floor(t); \n  float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0; \n  float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0; \n  float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0; \n  float byte1 = (valuesign * 128.0 + remaining_bits_of_biased_exponent) / 255.0; \n  return vec4(byte4, byte3, byte2, byte1); \n}\n",
"float.index.pack": "uniform vec4 indexModulus;\n\nvec4 getSample(vec4 xyzw);\nvec4 getIndex(vec4 xyzw);\n\nvec4 floatPackIndex(vec4 xyzw) {\n  vec4 value = getSample(xyzw);\n  vec4 index = getIndex(xyzw);\n\n  vec4 offset = floor(index + .5) * indexModulus;\n  vec2 sum2 = offset.xy + offset.zw;\n  float sum = sum2.x + sum2.y;\n  return vec4(value.xyz, sum);\n}",
"float.stretch": "vec4 getSample(vec4 xyzw);\n\nfloat floatStretch(vec4 xyzw, float channelIndex) {\n  vec4 sample = getSample(xyzw);\n  vec2 xy = channelIndex > 1.5 ? sample.zw : sample.xy;\n  return mod(channelIndex, 2.0) > .5 ? xy.y : xy.x;\n}",
"fragment.clip.dashed": "varying float vClipStrokeWidth;\nvarying float vClipStrokeIndex;\nvarying vec3  vClipStrokeEven;\nvarying vec3  vClipStrokeOdd;\nvarying vec3  vClipStrokePosition;\n\nvoid clipStrokeFragment() {\n  bool odd = mod(vClipStrokeIndex, 2.0) >= 1.0;\n\n  vec3 tangent;\n  if (odd) {\n    tangent = vClipStrokeOdd;\n  }\n  else {\n    tangent = vClipStrokeEven;\n  }\n\n  float travel = dot(vClipStrokePosition, normalize(tangent)) / vClipStrokeWidth;\n  if (mod(travel, 16.0) > 8.0) {\n    discard;\n  }\n}\n",
"fragment.clip.dotted": "varying float vClipStrokeWidth;\nvarying float vClipStrokeIndex;\nvarying vec3  vClipStrokeEven;\nvarying vec3  vClipStrokeOdd;\nvarying vec3  vClipStrokePosition;\n\nvoid clipStrokeFragment() {\n  bool odd = mod(vClipStrokeIndex, 2.0) >= 1.0;\n\n  vec3 tangent;\n  if (odd) {\n    tangent = vClipStrokeOdd;\n  }\n  else {\n    tangent = vClipStrokeEven;\n  }\n\n  float travel = dot(vClipStrokePosition, normalize(tangent)) / vClipStrokeWidth;\n  if (mod(travel, 4.0) > 2.0) {\n    discard;\n  }\n}\n",
"fragment.clip.ends": "varying vec2 vClipEnds;\n\nvoid clipEndsFragment() {\n  if (vClipEnds.x < 0.0 || vClipEnds.y < 0.0) discard;\n}\n",
"fragment.color": "void setFragmentColor(vec4 color) {\n  gl_FragColor = color;\n}",
"fragment.solid": "void setFragmentColor(vec4 color) {\n  if (color.a < 1.0) discard;\n  gl_FragColor = color;\n}",
"fragment.transparent": "void setFragmentColor(vec4 color) {\n  if (color.a >= 1.0) discard;\n  gl_FragColor = color;\n}",
"grid.position": "uniform vec4 gridPosition;\nuniform vec4 gridStep;\nuniform vec4 gridAxis;\n\nvec4 sampleData(vec2 xy);\n\nvec4 getGridPosition(vec4 xyzw) {\n  vec4 onAxis  = gridAxis * sampleData(vec2(xyzw.y, 0.0)).x;\n  vec4 offAxis = gridStep * xyzw.x + gridPosition;\n  return onAxis + offAxis;\n}\n",
"join.position": "uniform float joinStride;\nuniform float joinStrideInv;\n\nfloat getIndex(vec4 xyzw);\nvec4 getRest(vec4 xyzw);\nvec4 injectIndices(float a, float b);\n\nvec4 getJoinXYZW(vec4 xyzw) {\n\n  float a = getIndex(xyzw);\n  float b = a * joinStrideInv;\n\n  float integer  = floor(b);\n  float fraction = b - integer;\n  \n  return injectIndices(fraction * joinStride, integer) + getRest(xyzw);\n}\n",
"label.alpha": "varying float vPixelSize;\n\nvec4 getLabelAlphaColor(vec4 sample, vec4 color) {\n  float mask = clamp(sample.r * 1000.0, 0.0, 1.0);\n  float alpha = (sample.r - .5) * vPixelSize + .5;\n  float a = mask * alpha * color.a;\n  if (a <= 0.0) discard;\n  return vec4(color.xyz, a);\n}\n",
"label.outline": "uniform float outlineExpand;\nuniform float outlineStep;\nuniform vec3  outlineColor;\n\nvarying float vPixelSize;\n\nconst float PIXEL_STEP = 255.0 / 16.0;\n\nvec4 getLabelOutlineColor(vec4 sample, vec4 color) {\n  //return vec4(color.xyz, 1.0);\n  float ps = vPixelSize * PIXEL_STEP;\n  float os = outlineStep;\n\n  float sdf = sample.r - .5 + outlineExpand;\n  vec2  sdfs = vec2(sdf, sdf + os);\n  vec2  alpha = clamp(sdfs * ps + .5, 0.0, 1.0);\n\n  if (alpha.y <= 0.0) {\n    discard;\n  }\n\n  vec3  blend = color.xyz;\n  if (alpha.y > alpha.x) {\n    blend = sqrt(mix(outlineColor * outlineColor, blend * blend, alpha.x));\n  }\n  \n  return vec4(blend, alpha.y * color.a);\n}\n",
"lerp.depth": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpDepth(vec4 xyzw) {\n  float x = xyzw.z * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.xy, i, xyzw.w);\n  vec4 xyzw2 = vec4(xyzw.xy, i + 1.0, xyzw.w);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.height": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpHeight(vec4 xyzw) {\n  float x = xyzw.y * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.x, i, xyzw.zw);\n  vec4 xyzw2 = vec4(xyzw.x, i + 1.0, xyzw.zw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.items": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpItems(vec4 xyzw) {\n  float x = xyzw.w * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.xyz, i);\n  vec4 xyzw2 = vec4(xyzw.xyz, i + 1.0);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.width": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpWidth(vec4 xyzw) {\n  float x = xyzw.x * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(i, xyzw.yzw);\n  vec4 xyzw2 = vec4(i + 1.0, xyzw.yzw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"line.position": "uniform float worldUnit;\nuniform float lineWidth;\nuniform float lineDepth;\nuniform vec4 geometryClip;\n\nattribute vec2 line;\nattribute vec4 position4;\n\n#ifdef LINE_STROKE\nvarying float vClipStrokeWidth;\nvarying float vClipStrokeIndex;\nvarying vec3  vClipStrokeEven;\nvarying vec3  vClipStrokeOdd;\nvarying vec3  vClipStrokePosition;\n#endif\n\n// External\nvec3 getPosition(vec4 xyzw);\n\n#ifdef LINE_CLIP\nuniform float clipRange;\nuniform vec2  clipStyle;\nuniform float clipSpace;\n\nattribute vec2 strip;\n\nvarying vec2 vClipEnds;\n\nvoid clipEnds(vec4 xyzw, vec3 center, vec3 pos, float depth) {\n\n  // Sample end of line strip\n  vec4 xyzwE = vec4(strip.y, xyzw.yzw);\n  vec3 end   = getPosition(xyzwE);\n\n  // Sample start of line strip\n  vec4 xyzwS = vec4(strip.x, xyzw.yzw);\n  vec3 start = getPosition(xyzwS);\n\n  // Absolute arrow length (=2.5x radius)\n  float size = clipRange * lineWidth * worldUnit * depth * 1.25;\n\n  // Measure length and adjust clip range\n  // Approach linear scaling with cubic ease the smaller we get\n  vec3 diff = end - start;\n  float l = length(diff) * clipSpace;\n  float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);\n  float scale = 1.0 - mini * mini * mini; \n  float invrange = 1.0 / (size * scale);\n  \n  vClipEnds = vec2(1.0);\n\n  if (clipStyle.y > 0.0) {\n    // Clip end\n    diff = normalize(end - center);\n    float d = dot(end - pos, diff);\n    vClipEnds.x = d * invrange - 1.0;\n  }\n\n  if (clipStyle.x > 0.0) {\n    // Clip start \n    diff = normalize(center - start);\n    float d = dot(pos - start, diff);\n    vClipEnds.y = d * invrange - 1.0;\n  }\n\n\n}\n#endif\n\nconst float epsilon = 1e-5;\nvoid fixCenter(vec3 left, inout vec3 center, vec3 right) {\n  if (center.z >= 0.0) {\n    if (left.z < 0.0) {\n      float d = (center.z - epsilon) / (center.z - left.z);\n      center = mix(center, left, d);\n    }\n    else if (right.z < 0.0) {\n      float d = (center.z - epsilon) / (center.z - right.z);\n      center = mix(center, right, d);\n    }\n  }\n}\n\n\nvoid getLineGeometry(vec4 xyzw, float edge, out vec3 left, out vec3 center, out vec3 right) {\n  vec4 delta = vec4(1.0, 0.0, 0.0, 0.0);\n\n  center =                 getPosition(xyzw);\n  left   = (edge > -0.5) ? getPosition(xyzw - delta) : center;\n  right  = (edge < 0.5)  ? getPosition(xyzw + delta) : center;\n}\n\nvec3 getLineJoin(float edge, bool odd, vec3 left, vec3 center, vec3 right, float width) {\n  vec2 join = vec2(1.0, 0.0);\n\n  fixCenter(left, center, right);\n\n  vec4 a = vec4(left.xy, right.xy);\n  vec4 b = a / vec4(left.zz, right.zz);\n\n  vec2 l = b.xy;\n  vec2 r = b.zw;\n  vec2 c = center.xy / center.z;\n\n  vec4 d = vec4(l, c) - vec4(c, r);\n  float l1 = dot(d.xy, d.xy);\n  float l2 = dot(d.zw, d.zw);\n\n  if (l1 + l2 > 0.0) {\n    \n    if (edge > 0.5 || l2 == 0.0) {\n      vec2 nl = normalize(l - c);\n      vec2 tl = vec2(nl.y, -nl.x);\n\n#ifdef LINE_STROKE\n      vClipStrokeEven = vClipStrokeOdd = normalize(left - center);\n#endif\n      join = tl;\n    }\n    else if (edge < -0.5 || l1 == 0.0) {\n      vec2 nr = normalize(c - r);\n      vec2 tr = vec2(nr.y, -nr.x);\n\n#ifdef LINE_STROKE\n      vClipStrokeEven = vClipStrokeOdd = normalize(center - right);\n#endif\n      join = tr;\n    }\n    else {\n      // Limit join stretch for tiny segments\n      float lmin2 = min(l1, l2) / (width * width);\n      \n      vec2 nl = normalize(d.xy);\n      vec2 nr = normalize(d.zw);\n\n      vec2 tl = vec2(nl.y, -nl.x);\n      vec2 tr = vec2(nr.y, -nr.x);\n\n      vec2 tc = normalize(tl + tr);\n    \n      float cosA = dot(nl, tc);\n      float sinA = max(0.1, abs(dot(tl, tc)));\n      float factor = cosA / sinA;\n      float scale = sqrt(1.0 + min(lmin2, factor * factor));\n\n#ifdef LINE_STROKE\n      vec3 stroke1 = normalize(left - center);\n      vec3 stroke2 = normalize(center - right);\n\n      if (odd) {\n        vClipStrokeEven = stroke1;\n        vClipStrokeOdd  = stroke2;\n      }\n      else {\n        vClipStrokeEven = stroke2;\n        vClipStrokeOdd  = stroke1;\n      }\n#endif\n      join = tc * scale;\n    }\n    return vec3(join, 0.0);\n  }\n  else {\n    return vec3(0.0);\n  }\n\n}\n\nvec3 getLinePosition() {\n  vec3 left, center, right, join;\n\n  float edge = line.x;\n  float offset = line.y;\n\n  vec4 p = min(geometryClip, position4);\n\n  // Get position + adjacent neighbours\n  getLineGeometry(p, edge, left, center, right);\n\n#ifdef LINE_STROKE\n  // Set parameters for line stroke fragment shader\n  vClipStrokePosition = center;\n  vClipStrokeIndex = p.x;\n  bool odd = mod(p.x, 2.0) >= 1.0;\n#else\n  bool odd = true;\n#endif\n\n  // Divide line width up/down\n  float width = lineWidth * 0.5;\n\n  float depth = 1.0;\n  if (lineDepth < 1.0) {\n    // Depth blending\n    float z = max(0.00001, -center.z);\n    depth = mix(z, 1.0, lineDepth);\n    width *= depth;\n  }\n\n  // Convert to world units\n  width *= worldUnit;\n\n  join = getLineJoin(edge, odd, left, center, right, width);\n\n#ifdef LINE_STROKE\n  vClipStrokeWidth = width;\n#endif\n  \n  vec3 pos = center + join * offset * width;\n\n#ifdef LINE_CLIP\n  clipEnds(position4, center, pos, depth);\n#endif\n\n  return pos;\n}\n",
"map.2d.data": "uniform vec2 dataResolution;\nuniform vec2 dataPointer;\n\nvec2 map2DData(vec2 xy) {\n  return fract((xy + dataPointer) * dataResolution);\n}\n",
"map.xyzw.2dv": "void mapXyzw2DV(vec4 xyzw, out vec2 xy, out float z) {\n  xy = xyzw.xy;\n  z  = xyzw.z;\n}\n\n",
"map.xyzw.texture": "uniform float textureItems;\nuniform float textureHeight;\n\nvec2 mapXyzwTexture(vec4 xyzw) {\n  \n  float x = xyzw.x;\n  float y = xyzw.y;\n  float z = xyzw.z;\n  float i = xyzw.w;\n  \n  return vec2(i, y) + vec2(x, z) * vec2(textureItems, textureHeight);\n}\n\n",
"mesh.fragment.blend": "varying vec4 vColor;\n\nvec4 blendColor(vec4 rgba) {\n  return rgba * vColor;\n}\n",
"mesh.fragment.color": "varying vec4 vColor;\n\nvec4 getColor() {\n  return vColor;\n}\n",
"mesh.position": "attribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvec3 getMeshPosition() {\n  return getPosition(position4);\n}\n",
"mesh.vertex.color": "attribute vec4 position4;\nvarying vec4 vColor;\n\n// External\nvec4 getSample(vec4 xyzw);\n\nvoid vertexColor() {\n  vColor = getSample(position4);\n}\n",
"point.alpha.circle": "varying float vPixelSize;\n\nfloat getDiscAlpha(float mask) {\n  // Approximation: 1 - x*x is approximately linear around x = 1 with slope 2\n  return vPixelSize * (1.0 - mask);\n  //  return vPixelSize * 2.0 * (1.0 - sqrt(mask));\n}\n",
"point.alpha.circle.hollow": "varying float vPixelSize;\n\nfloat getDiscHollowAlpha(float mask) {\n  return vPixelSize * (0.5 - 2.0 * abs(sqrt(mask) - .75));\n}\n",
"point.alpha.generic": "varying float vPixelSize;\n\nfloat getGenericAlpha(float mask) {\n  return vPixelSize * 2.0 * (1.0 - mask);\n}\n",
"point.alpha.generic.hollow": "varying float vPixelSize;\n\nfloat getGenericHollowAlpha(float mask) {\n  return vPixelSize * (0.5 - 2.0 * abs(mask - .75));\n}\n",
"point.edge": "varying vec2 vSprite;\n\nfloat getSpriteMask(vec2 xy);\nfloat getSpriteAlpha(float mask);\n\nvoid setFragmentColorFill(vec4 color) {\n  float mask = getSpriteMask(vSprite);\n  if (mask > 1.0) {\n    discard;\n  }\n  float alpha = getSpriteAlpha(mask);\n  if (alpha >= 1.0) {\n    discard;\n  }\n  gl_FragColor = vec4(color.rgb, alpha * color.a);\n}\n",
"point.fill": "varying vec2 vSprite;\n\nfloat getSpriteMask(vec2 xy);\nfloat getSpriteAlpha(float mask);\n\nvoid setFragmentColorFill(vec4 color) {\n  float mask = getSpriteMask(vSprite);\n  if (mask > 1.0) {\n    discard;\n  }\n  float alpha = getSpriteAlpha(mask);\n  if (alpha < 1.0) {\n    discard;\n  }\n  gl_FragColor = color;\n}\n\n",
"point.mask.circle": "varying float vPixelSize;\n\nfloat getCircleMask(vec2 uv) {\n  return dot(uv, uv);\n}\n",
"point.mask.diamond": "varying float vPixelSize;\n\nfloat getDiamondMask(vec2 uv) {\n  vec2 a = abs(uv);\n  return a.x + a.y;\n}\n",
"point.mask.square": "varying float vPixelSize;\n\nfloat getSquareMask(vec2 uv) {\n  vec2 a = abs(uv);\n  return max(a.x, a.y);\n}\n",
"point.mask.triangle": "varying float vPixelSize;\n\nfloat getTriangleMask(vec2 uv) {\n  uv.y -= .25;\n  return max(-uv.y, abs(uv.x) * .866 + uv.y * .5 + .6);\n}\n",
"point.position": "uniform float pointSize;\nuniform float pointDepth;\n\nuniform float pixelUnit;\nuniform float renderScale;\nuniform float renderScaleInv;\n\nattribute vec4 position4;\nattribute vec2 sprite;\n\nvarying vec2 vSprite;\nvarying float vPixelSize;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvec3 getPointPosition() {\n  vec3 center = getPosition(position4);\n\n  // Depth blending\n  // TODO: orthographic camera\n  // Workaround: set depth = 0\n  float z = -center.z;\n  float depth = mix(z, 1.0, pointDepth);\n  \n  // Match device/unit mapping \n  // Sprite goes from -1..1, width = 2.\n  float size = pointSize * pixelUnit * .5;\n  float depthSize = depth * size;\n  \n  // Pad sprite by half a pixel to make the anti-aliasing straddle the pixel edge\n  // Note: pixelsize measures radius\n  float pixelSize = .5 * (pointDepth > 0.0 ? depthSize / z : size);\n  float paddedSize = pixelSize + 0.5;\n  float padFactor = paddedSize / pixelSize;\n\n  vPixelSize = paddedSize;\n  vSprite    = sprite;\n\n  return center + vec3(sprite * depthSize * renderScaleInv * padFactor, 0.0);\n}\n",
"polar.position": "uniform float polarBend;\nuniform float polarFocus;\nuniform float polarAspect;\nuniform float polarHelix;\n\nuniform mat4 viewMatrix;\n\nvec4 getPolarPosition(vec4 position) {\n  if (polarBend > 0.0001) {\n\n    vec2 xy = position.xy * vec2(polarBend, polarAspect);\n    float radius = polarFocus + xy.y;\n\n    return viewMatrix * vec4(\n      sin(xy.x) * radius,\n      (cos(xy.x) * radius - polarFocus) / polarAspect,\n      position.z + position.x * polarHelix * polarBend,\n      1.0\n    );\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"project.position": "uniform float styleZBias;\nuniform float styleZIndex;\n\nvoid setPosition(vec3 position) {\n  vec4 pos = projectionMatrix * vec4(position, 1.0);\n\n  // Apply relative Z bias\n  float bias  = (1.0 - styleZBias / 32768.0);\n  pos.z *= bias;\n  \n  // Apply large scale Z index changes\n  if (styleZIndex > 0.0) {\n    float z = pos.z / pos.w;\n    pos.z = ((z + 1.0) / (styleZIndex + 1.0) - 1.0) * pos.w;\n  }\n  \n  gl_Position = pos;\n}",
"project.readback": "// This is three.js' global uniform, missing from fragment shaders.\nuniform mat4 projectionMatrix;\n\nvec4 readbackPosition(vec3 position) {\n  vec4 pos = projectionMatrix * vec4(position, 1.0);\n  vec3 final = pos.xyz / pos.w;\n  if (final.z < -1.0) {\n    return vec4(0.0, 0.0, 0.0, -1.0);\n  }\n  else {\n    return vec4(final, -position.z);\n  }\n}\n",
"raw.position.scale": "uniform vec4 geometryScale;\nattribute vec4 position4;\n\nvec4 getRawPositionScale() {\n  return geometryScale * position4;\n}\n",
"repeat.position": "uniform vec4 repeatModulus;\n\nvec4 getRepeatXYZW(vec4 xyzw) {\n  return mod(xyzw + .5, repeatModulus) - .5;\n}\n",
"resample.relative": "uniform vec4 resampleFactor;\n\nvec4 resampleRelative(vec4 xyzw) {\n  return xyzw * resampleFactor;\n}",
"sample.2d": "uniform sampler2D dataTexture;\n\nvec4 sample2D(vec2 uv) {\n  return texture2D(dataTexture, uv);\n}\n",
"screen.position": "void setScreenPosition(vec4 position) {\n  gl_Position = vec4(position.xy * 2.0 - 1.0, 0.5, 1.0);\n}\n",
"screen.remap.2d.xyzw": "uniform vec2 remap2DScale;\n\nvec4 screenRemap2Dxyzw(vec2 uv) {\n  return vec4(floor(remap2DScale * uv), 0.0, 0.0);\n}\n",
"screen.remap.4d.xyzw": "uniform vec2 remap2DScale;\nuniform vec2 remapModulus;\nuniform vec2 remapModulusInv;\n\nvec4 screenRemap4Dxyzw(vec2 uv) {\n  vec2 st = floor(remap2DScale * uv);\n  vec2 xy = st * remapModulusInv;\n  vec2 ixy = floor(xy);\n  vec2 fxy = xy - ixy;\n  vec2 zw = fxy * remapModulus;\n  return vec4(ixy.x, zw.y, ixy.y, zw.x);\n}\n",
"spherical.position": "uniform float sphericalBend;\nuniform float sphericalFocus;\nuniform float sphericalAspectX;\nuniform float sphericalAspectY;\nuniform float sphericalScaleY;\n\nuniform mat4 viewMatrix;\n\nvec4 getSphericalPosition(vec4 position) {\n  if (sphericalBend > 0.0001) {\n\n    vec3 xyz = position.xyz * vec3(sphericalBend, sphericalBend / sphericalAspectY * sphericalScaleY, sphericalAspectX);\n    float radius = sphericalFocus + xyz.z;\n    float cosine = cos(xyz.y) * radius;\n\n    return viewMatrix * vec4(\n      sin(xyz.x) * cosine,\n      sin(xyz.y) * radius * sphericalAspectY,\n      (cos(xyz.x) * cosine - sphericalFocus) / sphericalAspectX,\n      1.0\n    );\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"split.position": "uniform float splitStride;\n\nvec2 getIndices(vec4 xyzw);\nvec4 getRest(vec4 xyzw);\nvec4 injectIndex(float v);\n\nvec4 getSplitXYZW(vec4 xyzw) {\n  vec2 uv = getIndices(xyzw);\n  float offset = uv.x + uv.y * splitStride;\n  return injectIndex(offset) + getRest(xyzw);\n}\n",
"spread.position": "uniform vec4 spreadOffset;\nuniform mat4 spreadMatrix;\n\n// External\nvec4 getSample(vec4 xyzw);\n\nvec4 getSpreadSample(vec4 xyzw) {\n  vec4 sample = getSample(xyzw);\n  return sample + spreadMatrix * (spreadOffset + xyzw);\n}\n",
"sprite.fragment": "varying vec2 vSprite;\n\nvec4 getSample(vec2 xy);\n\nvec4 getSpriteColor() {\n  return getSample(vSprite);\n}",
"sprite.position": "uniform vec2 spriteOffset;\nuniform float spriteScale;\nuniform float spriteDepth;\nuniform float spriteSnap;\n\nuniform vec2 renderOdd;\nuniform float renderScale;\nuniform float renderScaleInv;\nuniform float pixelUnit;\n\nattribute vec4 position4;\nattribute vec2 sprite;\n\nvarying vec2 vSprite;\nvarying float vPixelSize;\n\n// External\nvec3 getPosition(vec4 xyzw);\nvec4 getSprite(vec4 xyzw);\n\nvec3 getSpritePosition() {\n  vec3 center = getPosition(position4);\n  vec4 atlas = getSprite(position4);\n\n  // Sprite goes from -1..1, width = 2.\n  // -1..1 -> -0.5..0.5\n  vec2 halfSprite = sprite * .5;\n  vec2 halfFlipSprite = vec2(halfSprite.x, -halfSprite.y);\n\n  // Assign UVs\n  vSprite = atlas.xy + atlas.zw * (halfFlipSprite + .5);\n\n  // Depth blending\n  // TODO: orthographic camera\n  // Workaround: set depth = 0\n  float z = -center.z;\n  float depth = mix(z, 1.0, spriteDepth);\n  \n  // Match device/unit mapping \n  float size = pixelUnit * spriteScale;\n  float depthSize = depth * size;\n\n  // Calculate pixelSize for anti-aliasing\n  float pixelSize = (spriteDepth > 0.0 ? depthSize / z : size);\n  vPixelSize = pixelSize;\n\n  // Position sprite\n  vec2 atlasOdd = fract(atlas.zw / 2.0);\n  vec2 offset = (spriteOffset + halfSprite * atlas.zw) * depthSize;\n  if (spriteSnap > 0.5) {\n    // Snap to pixel\n    return vec3(((floor(center.xy / center.z * renderScale) + renderOdd + atlasOdd) * center.z + offset) * renderScaleInv, center.z);\n  }\n  else {\n    // Place directly\n    return center + vec3(offset * renderScaleInv, 0.0);\n  }\n\n}\n",
"stereographic.position": "uniform float stereoBend;\n\nuniform mat4 viewMatrix;\n\nvec4 getStereoPosition(vec4 position) {\n  if (stereoBend > 0.0001) {\n\n    vec3 pos = position.xyz;\n    float r = length(pos);\n    float z = r + pos.z;\n    vec3 project = vec3(pos.xy / z, r);\n    \n    vec3 lerped = mix(pos, project, stereoBend);\n\n    return viewMatrix * vec4(lerped, 1.0);\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"stereographic4.position": "uniform float stereoBend;\nuniform vec4 basisScale;\nuniform vec4 basisOffset;\nuniform mat4 viewMatrix;\nuniform vec2 view4D;\n\nvec4 getStereographic4Position(vec4 position) {\n  \n  vec4 transformed;\n  if (stereoBend > 0.0001) {\n\n    float r = length(position);\n    float w = r + position.w;\n    vec4 project = vec4(position.xyz / w, r);\n    \n    transformed = mix(position, project, stereoBend);\n  }\n  else {\n    transformed = position;\n  }\n\n  vec4 pos4 = transformed * basisScale - basisOffset;\n  vec3 xyz = (viewMatrix * vec4(pos4.xyz, 1.0)).xyz;\n  return vec4(xyz, pos4.w * view4D.y + view4D.x);\n}\n",
"stpq.sample.2d": "varying vec2 vST;\n\nvec4 getSample(vec2 st);\n\nvec4 getSTSample() {\n  return getSample(vST);\n}\n",
"stpq.xyzw.2d": "varying vec2 vST;\n\nvoid setRawST(vec4 xyzw) {\n  vST = xyzw.xy;\n}\n",
"strip.position.normal": "attribute vec4 position4;\nattribute vec3 strip;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvoid getStripGeometry(vec4 xyzw, vec3 strip, out vec3 pos, out vec3 normal) {\n  vec3 a, b, c;\n\n  a   = getPosition(xyzw);\n  b   = getPosition(vec4(xyzw.xyz, strip.x));\n  c   = getPosition(vec4(xyzw.xyz, strip.y));\n\n  pos = getPosition(xyzw);\n  normal = normalize(cross(c - a, b - a)) * strip.z;\n}\n\nvec3 getStripPositionNormal() {\n  vec3 center, normal;\n\n  getStripGeometry(position4, strip, center, normal);\n  vNormal   = normal;\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);\n  vPosition = -center;\n\n  return center;\n}\n",
"style.color": "uniform vec3 styleColor;\nuniform float styleOpacity;\n\nvec4 getStyleColor() {\n  return vec4(styleColor, styleOpacity);\n}\n",
"style.color.shaded": "uniform vec3 styleColor;\nuniform float styleOpacity;\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvec4 getStyleColor() {\n  \n  vec3 color = styleColor * styleColor;\n  vec3 color2 = styleColor;\n\n  vec3 normal = normalize(vNormal);\n  vec3 light = normalize(vLight);\n  vec3 position = normalize(vPosition);\n  \n  float side    = gl_FrontFacing ? -1.0 : 1.0;\n  float cosine  = side * dot(normal, light);\n  float diffuse = mix(max(0.0, cosine), .5 + .5 * cosine, .1);\n  \n  vec3  halfLight = normalize(light + position);\n\tfloat cosineHalf = max(0.0, side * dot(normal, halfLight));\n\tfloat specular = pow(cosineHalf, 16.0);\n\t\n\treturn vec4(sqrt(color * (diffuse * .9 + .05) + .25 * color2 * specular), styleOpacity);\n}\n",
"surface.position": "attribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvec3 getSurfacePosition() {\n  return getPosition(position4);\n}\n",
"surface.position.normal": "attribute vec4 position4;\nattribute vec2 surface;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvoid getSurfaceGeometry(vec4 xyzw, float edgeX, float edgeY, out vec3 left, out vec3 center, out vec3 right, out vec3 up, out vec3 down) {\n  vec4 deltaX = vec4(1.0, 0.0, 0.0, 0.0);\n  vec4 deltaY = vec4(0.0, 1.0, 0.0, 0.0);\n\n  /*\n  // high quality, 5 tap\n  center =                  getPosition(xyzw);\n  left   = (edgeX > -0.5) ? getPosition(xyzw - deltaX) : center;\n  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX) : center;\n  down   = (edgeY > -0.5) ? getPosition(xyzw - deltaY) : center;\n  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY) : center;\n  */\n  \n  // low quality, 3 tap\n  center =                  getPosition(xyzw);\n  left   =                  center;\n  down   =                  center;\n  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX) : (2.0 * center - getPosition(xyzw - deltaX));\n  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY) : (2.0 * center - getPosition(xyzw - deltaY));\n}\n\nvec3 getSurfaceNormal(vec3 left, vec3 center, vec3 right, vec3 up, vec3 down) {\n  vec3 dx = right - left;\n  vec3 dy = up    - down;\n  vec3 n = cross(dy, dx);\n  if (length(n) > 0.0) {\n    return normalize(n);\n  }\n  return vec3(0.0, 1.0, 0.0);\n}\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvec3 getSurfacePositionNormal() {\n  vec3 left, center, right, up, down;\n\n  getSurfaceGeometry(position4, surface.x, surface.y, left, center, right, up, down);\n  vNormal   = getSurfaceNormal(left, center, right, up, down);\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);// - center);\n  vPosition = -center;\n  \n  return center;\n}\n",
"ticks.position": "uniform float tickSize;\nuniform vec4  tickAxis;\nuniform vec4  tickNormal;\n\nvec4 sampleData(float x);\n\nvec3 transformPosition(vec4 value);\n\nvec3 getTickPosition(vec4 xyzw) {\n\n  const float epsilon = 0.0001;\n  float line = xyzw.x - .5;\n\n  vec4 center = tickAxis * sampleData(xyzw.y);\n  vec4 edge   = tickNormal * epsilon;\n\n  vec4 a = center;\n  vec4 b = center + edge;\n\n  vec3 c = transformPosition(a);\n  vec3 d = transformPosition(b);\n  \n  vec3 mid  = c;\n  vec3 side = normalize(d - c);\n\n  return mid + side * line * tickSize;\n}\n",
"transform3.position": "uniform mat4 transformMatrix;\n\nvec4 transformPosition(vec4 position) {\n  return transformMatrix * vec4(position.xyz, 1.0);\n}\n",
"transform4.position": "uniform mat4 transformMatrix;\nuniform vec4 transformOffset;\n\nvec4 transformPosition(vec4 position) {\n  return transformMatrix * position + transformOffset;\n}\n",
"view.position": "// Implicit three.js uniform\n// uniform mat4 viewMatrix;\n\nvec4 getViewPosition(vec4 position) {\n  return (viewMatrix * vec4(position.xyz, 1.0));\n}"};

},{}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

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
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
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

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
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
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
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
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
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

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":3,"ieee754":4}],3:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
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

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],4:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],5:[function(require,module,exports){
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
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
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

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
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

module.exports = Duplex;
var inherits = require('inherits');
var setImmediate = require('process/browser.js').nextTick;
var Readable = require('./readable.js');
var Writable = require('./writable.js');

inherits(Duplex, Readable);

Duplex.prototype.write = Writable.prototype.write;
Duplex.prototype.end = Writable.prototype.end;
Duplex.prototype._write = Writable.prototype._write;

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  var self = this;
  setImmediate(function () {
    self.end();
  });
}

},{"./readable.js":12,"./writable.js":14,"inherits":6,"process/browser.js":10}],9:[function(require,module,exports){
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
Stream.Readable = require('./readable.js');
Stream.Writable = require('./writable.js');
Stream.Duplex = require('./duplex.js');
Stream.Transform = require('./transform.js');
Stream.PassThrough = require('./passthrough.js');

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

},{"./duplex.js":8,"./passthrough.js":11,"./readable.js":12,"./transform.js":13,"./writable.js":14,"events":5,"inherits":6}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],11:[function(require,module,exports){
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

module.exports = PassThrough;

var Transform = require('./transform.js');
var inherits = require('inherits');
inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./transform.js":13,"inherits":6}],12:[function(require,module,exports){
(function (process){
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

module.exports = Readable;
Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;
var Stream = require('./index.js');
var Buffer = require('buffer').Buffer;
var setImmediate = require('process/browser.js').nextTick;
var StringDecoder;

var inherits = require('inherits');
inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (typeof chunk === 'string' && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null || chunk === undefined) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || n === null) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
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

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode &&
      !er) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    setImmediate(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
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
    setImmediate(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
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

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    setImmediate(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  // check for listeners before emit removes one-time listeners.
  var errListeners = EE.listenerCount(dest, 'error');
  function onerror(er) {
    unpipe();
    if (errListeners === 0 && EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  dest.once('error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    setImmediate(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      setImmediate(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, function (x) {
      return self.emit.apply(self, ev, x);
    });
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted && state.calledRead) {
    state.ended = true;
    setImmediate(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require("+xKvab"))
},{"+xKvab":7,"./index.js":9,"buffer":2,"events":5,"inherits":6,"process/browser.js":10,"string_decoder":15}],13:[function(require,module,exports){
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

module.exports = Transform;

var Duplex = require('./duplex.js');
var inherits = require('inherits');
inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
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
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var rs = stream._readableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./duplex.js":8,"inherits":6}],14:[function(require,module,exports){
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
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;
Writable.WritableState = WritableState;

var isUint8Array = typeof Uint8Array !== 'undefined'
  ? function (x) { return x instanceof Uint8Array }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'Uint8Array'
  }
;
var isArrayBuffer = typeof ArrayBuffer !== 'undefined'
  ? function (x) { return x instanceof ArrayBuffer }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'ArrayBuffer'
  }
;

var inherits = require('inherits');
var Stream = require('./index.js');
var setImmediate = require('process/browser.js').nextTick;
var Buffer = require('buffer').Buffer;

inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

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

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];
}

function Writable(options) {
  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Stream.Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  setImmediate(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    setImmediate(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (!Buffer.isBuffer(chunk) && isUint8Array(chunk))
    chunk = new Buffer(chunk);
  if (isArrayBuffer(chunk) && typeof Uint8Array !== 'undefined')
    chunk = new Buffer(new Uint8Array(chunk));
  
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  state.needDrain = !ret;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    setImmediate(function() {
      cb(er);
    });
  else
    cb(er);

  stream.emit('error', er);
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

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

    if (sync) {
      setImmediate(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  cb();
  if (finished)
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

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      setImmediate(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

},{"./index.js":9,"buffer":2,"inherits":6,"process/browser.js":10}],15:[function(require,module,exports){
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

var Buffer = require('buffer').Buffer;

function assertEncoding(encoding) {
  if (encoding && !Buffer.isEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  this.charBuffer = new Buffer(6);
  this.charReceived = 0;
  this.charLength = 0;
};


StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  var offset = 0;

  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var i = (buffer.length >= this.charLength - this.charReceived) ?
                this.charLength - this.charReceived :
                buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, offset, i);
    this.charReceived += (i - offset);
    offset = i;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (i == buffer.length) return charStr;

    // otherwise cut off the characters end from the beginning of this buffer
    buffer = buffer.slice(i, buffer.length);
    break;
  }

  var lenIncomplete = this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - lenIncomplete, end);
    this.charReceived = lenIncomplete;
    end -= lenIncomplete;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    this.charBuffer.write(charStr.charAt(charStr.length - 1), this.encoding);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }

  return i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 2;
  this.charLength = incomplete ? 2 : 0;
  return incomplete;
}

function base64DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 3;
  this.charLength = incomplete ? 3 : 0;
  return incomplete;
}

},{"buffer":2}],16:[function(require,module,exports){
module.exports = language

var tokenizer = require('./tokenizer')

function language(lookups) {
  return function(selector) {
    return parse(selector, remap(lookups))
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

function parse(selector, options) {
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
        token.type === 'attr' ? attr(token) :
        token.type === ':' || token.type === '::' ? pseudo(token) :
        token.type === '*' ? Boolean :
        matches(token.type, token.data)
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

  function matches(type, data) {
    return function(node) {
      return options[type](node) == data
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
    return valid_pseudo(options, token.data)
  }

}

function entry(node, next, subj) {
  return next(node, subj) ? node : null
}

function valid_pseudo(options, match) {
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
    return valid_any_match(options, match.slice(4, -1))
  }

  if(match.indexOf('not') === 0) {
    return valid_not_match(options, match.slice(4, -1))
  }

  return function() {
    return false
  }
}

function valid_not_match(options, selector) {
  var fn = parse(selector, options)

  return not_function
  
  function not_function(node) {
    return !fn(node, true)
  }
}

function valid_any_match(options, selector) {
  var fn = parse(selector, options)

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

},{"./tokenizer":18}],17:[function(require,module,exports){
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
    if(data == null) _ended = true
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


}).call(this,require("+xKvab"))
},{"+xKvab":7,"stream":9}],18:[function(require,module,exports){
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
    if(gathered.length === 0) {
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
    if(!gathered.length) {
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

},{"through":17}],19:[function(require,module,exports){
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
  return function(x, dx, bend, f) {
    var abs, fabs, max, min, x1, x2;
    if (f == null) {
      f = 0;
    }
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


},{}],20:[function(require,module,exports){
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

exports.getDimensions = function(data, spec) {
  var channels, depth, dims, height, items, levels, n, nesting, sizes, width, _ref, _ref1, _ref2, _ref3, _ref4;
  if (spec == null) {
    spec = {};
  }
  items = spec.items, channels = spec.channels, width = spec.width, height = spec.height, depth = spec.depth;
  dims = {};
  if (!data || !data.length) {
    return {
      items: items,
      channels: channels,
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
  n = (_ref = sizes.pop()) != null ? _ref : 1;
  if (levels <= 1) {
    n /= (_ref1 = dims.channels) != null ? _ref1 : 1;
  }
  if (levels <= 2) {
    n /= (_ref2 = dims.items) != null ? _ref2 : 1;
  }
  if (levels <= 3) {
    n /= (_ref3 = dims.width) != null ? _ref3 : 1;
  }
  if (levels <= 4) {
    n /= (_ref4 = dims.height) != null ? _ref4 : 1;
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

exports.makeEmitter = function(thunk, items, channels) {
  var inner, outer;
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
  outer = (function() {
    switch (items) {
      case 0:
        return function() {
          return true;
        };
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
      case 6:
        return function(emit) {
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
  outer.reset = thunk.reset;
  outer.rebind = thunk.rebind;
  return outer;
};

exports.getThunk = function(data) {
  var a, b, c, d, done, first, fourth, i, j, k, l, m, nesting, second, sizes, third, thunk, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
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
      first = (_ref = data[j]) != null ? _ref : [];
      thunk = function() {
        var x, _ref1;
        x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          first = (_ref1 = data[j]) != null ? _ref1 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref1;
        i = j = 0;
        first = (_ref1 = data[j]) != null ? _ref1 : [];
      };
      break;
    case 3:
      i = j = k = 0;
      second = (_ref1 = data[k]) != null ? _ref1 : [];
      first = (_ref2 = second[j]) != null ? _ref2 : [];
      thunk = function() {
        var x, _ref3, _ref4;
        x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          if (j === b) {
            j = 0;
            k++;
            second = (_ref3 = data[k]) != null ? _ref3 : [];
          }
          first = (_ref4 = second[j]) != null ? _ref4 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref3, _ref4;
        i = j = k = 0;
        second = (_ref3 = data[k]) != null ? _ref3 : [];
        first = (_ref4 = second[j]) != null ? _ref4 : [];
      };
      break;
    case 4:
      i = j = k = l = 0;
      third = (_ref3 = data[l]) != null ? _ref3 : [];
      second = (_ref4 = third[k]) != null ? _ref4 : [];
      first = (_ref5 = second[j]) != null ? _ref5 : [];
      thunk = function() {
        var x, _ref6, _ref7, _ref8;
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
              third = (_ref6 = data[l]) != null ? _ref6 : [];
            }
            second = (_ref7 = third[k]) != null ? _ref7 : [];
          }
          first = (_ref8 = second[j]) != null ? _ref8 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref6, _ref7, _ref8;
        i = j = k = l = 0;
        third = (_ref6 = data[l]) != null ? _ref6 : [];
        second = (_ref7 = third[k]) != null ? _ref7 : [];
        first = (_ref8 = second[j]) != null ? _ref8 : [];
      };
      break;
    case 5:
      i = j = k = l = m = 0;
      fourth = (_ref6 = data[m]) != null ? _ref6 : [];
      third = (_ref7 = fourth[l]) != null ? _ref7 : [];
      second = (_ref8 = third[k]) != null ? _ref8 : [];
      first = (_ref9 = second[j]) != null ? _ref9 : [];
      thunk = function() {
        var x, _ref10, _ref11, _ref12, _ref13;
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
                fourth = (_ref10 = data[m]) != null ? _ref10 : [];
              }
              third = (_ref11 = fourth[l]) != null ? _ref11 : [];
            }
            second = (_ref12 = third[k]) != null ? _ref12 : [];
          }
          first = (_ref13 = second[j]) != null ? _ref13 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref10, _ref11, _ref12, _ref13;
        i = j = k = l = m = 0;
        fourth = (_ref10 = data[m]) != null ? _ref10 : [];
        third = (_ref11 = fourth[l]) != null ? _ref11 : [];
        second = (_ref12 = third[k]) != null ? _ref12 : [];
        first = (_ref13 = second[j]) != null ? _ref13 : [];
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
  return {
    emit: emit,
    consume: consume,
    skip: skip,
    count: count,
    done: done,
    reset: reset
  };
};


},{}],21:[function(require,module,exports){
var ease, π;

π = Math.PI;

ease = {
  cosine: function(x) {
    return .5 - .5 * Math.cos(x * π);
  }
};

module.exports = ease;


},{}],22:[function(require,module,exports){
var index, letters, parseOrder, toFloatString, toType,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

exports.mapByte2FloatOffset = function(stretch) {
  var factor;
  if (stretch == null) {
    stretch = 4;
  }
  factor = toFloatString(stretch);
  return "vec4 float2ByteIndex(vec4 xyzw, out float channelIndex) {\n  float relative = xyzw.w / " + factor + ";\n  float w = floor(relative);\n  channelIndex = (relative - w) * " + factor + ";\n  return vec4(xyzw.xyz, w);\n}";
};

exports.sample2DArray = function(textures) {
  var body, divide;
  divide = function(a, b) {
    var mid, out;
    if (a === b) {
      out = "return texture2D(dataTextures[" + a + "], uv);";
    } else {
      mid = Math.ceil(a + (b - a) / 2);
      out = "if (z < " + (mid - .5) + ") {\n  " + (divide(a, mid - 1)) + "\n}\nelse {\n  " + (divide(mid, b)) + "\n}";
    }
    return out = out.replace(/\n/g, "\n  ");
  };
  body = divide(0, textures - 1);
  return "uniform sampler2D dataTextures[" + textures + "];\n\nvec4 sample2DArray(vec2 uv, float z) {\n  " + body + "\n}";
};

exports.binaryOperator = function(type, op, curry) {
  type = toType(type);
  if (curry != null) {
    return "" + type + " binaryOperator(" + type + " a) {\n  return a " + op + " " + curry + ";\n}";
  } else {
    return "" + type + " binaryOperator(" + type + " a, " + type + " b) {\n  return a " + op + " b;\n}";
  }
};

exports.extendVec = function(from, to, value) {
  var ctor, diff, parts, _i, _results;
  if (value == null) {
    value = 0;
  }
  if (from > to) {
    return exports.truncateVec(from, to);
  }
  diff = to - from;
  from = toType(from);
  to = toType(to);
  value = toFloatString(value);
  parts = (function() {
    _results = [];
    for (var _i = 0; 0 <= diff ? _i <= diff : _i >= diff; 0 <= diff ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).map(function(x) {
    if (x) {
      return value;
    } else {
      return 'v';
    }
  });
  ctor = parts.join(',');
  return "" + to + " extendVec(" + from + " v) { return " + to + "(" + ctor + "); }";
};

exports.truncateVec = function(from, to) {
  var swizzle;
  if (from < to) {
    return exports.extendVec(from, to);
  }
  swizzle = '.' + ('xyzw'.substr(0, to));
  from = toType(from);
  to = toType(to);
  return "" + to + " truncateVec(" + from + " v) { return v" + swizzle + "; }";
};

exports.injectVec4 = function(order) {
  var args, channel, i, mask, swizzler, _i, _len;
  swizzler = ['0.0', '0.0', '0.0', '0.0'];
  order = parseOrder(order);
  order = order.map(function(v) {
    if (v === "" + v) {
      return index[v];
    } else {
      return v;
    }
  });
  for (i = _i = 0, _len = order.length; _i < _len; i = ++_i) {
    channel = order[i];
    swizzler[channel] = ['a', 'b', 'c', 'd'][i];
  }
  mask = swizzler.slice(0, 4).join(', ');
  args = ['float a', 'float b', 'float c', 'float d'].slice(0, order.length);
  return "vec4 inject(" + args + ") {\n  return vec4(" + mask + ");\n}";
};

exports.swizzleVec4 = function(order, size) {
  var lookup, mask;
  if (size == null) {
    size = null;
  }
  lookup = ['0.0', 'xyzw.x', 'xyzw.y', 'xyzw.z', 'xyzw.w'];
  if (size == null) {
    size = order.length;
  }
  order = parseOrder(order);
  order = order.map(function(v) {
    if (__indexOf.call([0, 1, 2, 3, 4], +v) >= 0) {
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
  return ("vec" + size + " swizzle(vec4 xyzw) {\n  return vec" + size + "(" + mask + ");\n}").replace(/vec1/g, 'float');
};

exports.invertSwizzleVec4 = function(order) {
  var i, j, letter, mask, src, swizzler, _i, _len;
  swizzler = ['0.0', '0.0', '0.0', '0.0'];
  order = parseOrder(order);
  order = order.map(function(v) {
    if (v === +v) {
      return letters[v - 1];
    } else {
      return v;
    }
  });
  for (i = _i = 0, _len = order.length; _i < _len; i = ++_i) {
    letter = order[i];
    src = letters[i];
    j = index[letter];
    swizzler[j] = "xyzw." + src;
  }
  mask = swizzler.join(', ');
  return "vec4 invertSwizzle(vec4 xyzw) {\n  return vec4(" + mask + ");\n}";
};

exports.identity = function(type) {
  var args;
  args = [].slice.call(arguments);
  if (args.length > 1) {
    args = args.map(function(t, i) {
      return ['inout', t, String.fromCharCode(97 + i)].join(' ');
    });
    args = args.join(', ');
    return "void identity(" + args + ") { }";
  } else {
    return "" + type + " identity(" + type + " x) {\n  return x;\n}";
  }
};


},{}],23:[function(require,module,exports){
exports.Axis = require('./axis');

exports.Data = require('./data');

exports.Ease = require('./ease');

exports.GLSL = require('./glsl');

exports.JS = require('./js');

exports.Three = require('./three');

exports.Ticks = require('./ticks');

exports.VDOM = require('./vdom');


},{"./axis":19,"./data":20,"./ease":21,"./glsl":22,"./js":24,"./three":25,"./ticks":26,"./vdom":27}],24:[function(require,module,exports){
exports.merge = function() {
  var k, obj, v, x, _i, _len;
  x = {};
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    obj = arguments[_i];
    for (k in obj) {
      v = obj[k];
      x[k] = v;
    }
  }
  return x;
};

exports.clone = function(o) {
  return JSON.parse(JSON.serialize(o));
};


},{}],25:[function(require,module,exports){
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


},{}],26:[function(require,module,exports){

/*
 Generate equally spaced ticks in a range at sensible positions.
 
 @param min/max - Minimum and maximum of range
 @param n - Desired number of ticks in range
 @param unit - Base unit of scale (e.g. 1 or π).
 @param scale - Division scale (e.g. 2 = binary division, or 10 = decimal division).
 @param inclusive - Whether to add ticks at the edges
 @param bias - Integer to bias divisions one or more levels up or down (to create nested scales)
 */
var LINEAR, LOG, linear, log, make;

linear = function(min, max, n, unit, base, inclusive, bias) {
  var distance, edge, factor, factors, i, ideal, ref, span, step, steps, _i, _results;
  n || (n = 10);
  bias || (bias = 0);
  span = max - min;
  ideal = span / n;
  unit || (unit = 1);
  base || (base = 10);
  ref = unit * (bias + Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base))));
  factors = base % 2 === 0 ? [base / 2, 1, 1 / 2] : base % 3 === 0 ? [base / 3, 1, 1 / 3] : [1];
  steps = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = factors.length; _i < _len; _i++) {
      factor = factors[_i];
      _results.push(ref * factor);
    }
    return _results;
  })();
  distance = Infinity;
  step = steps.reduce(function(ref, step) {
    var d, f;
    f = step / ideal;
    d = Math.max(f, 1 / f);
    if (d < distance) {
      distance = d;
      return step;
    } else {
      return ref;
    }
  }, ref);
  edge = +(!inclusive);
  min = (Math.ceil(min / step) + edge) * step;
  max = (Math.floor(max / step) - edge) * step;
  n = Math.ceil((max - min) / step);
  _results = [];
  for (i = _i = 0; 0 <= n ? _i <= n : _i >= n; i = 0 <= n ? ++_i : --_i) {
    _results.push(min + i * step);
  }
  return _results;
};


/*
 Generate logarithmically spaced ticks in a range at sensible positions.
 */

log = function(min, max, n, unit, base, inclusive, bias) {
  throw "Log ticks not yet implemented.";

  /*
  base = Math.log(base)
  ibase = 1 / base
  l = (x) -> Math.log(x) * ibase
  
   * Generate linear scale in log space at (base - 1) divisions
  ticks = Linear(l(min), l(max), n, unit, Math.max(2, scale - 1), inclusive, bias)
  
   * Remap ticks within each order of magnitude
  for tick in ticks
    floor = Math.floor tick
    frac = tick - floor
  
    ref = Math.exp floor * base
    value = ref * Math.round 1 + (base - 1) * frac
   */
};

LINEAR = 0;

LOG = 1;

make = function(type, min, max, ticks, unit, base, inclusive, bias) {
  switch (type) {
    case LINEAR:
      return linear(min, max, ticks, unit, base, inclusive, bias);
    case LOG:
      return log(min, max, ticks, unit, base, inclusive, bias);
  }
};

exports.make = make;

exports.linear = linear;

exports.log = log;


},{}],27:[function(require,module,exports){
var HEAP, apply, descriptor, element, hint, id, insert, key, map, prop, recycle, remove, set, unset, _i, _len, _ref;

HEAP = [];

id = 0;

descriptor = function() {
  return {
    id: id++,
    type: null,
    props: null,
    children: null
  };
};

hint = function(n) {
  var i, _i, _results;
  n *= 2;
  n = Math.max(0, HEAP.length - n);
  _results = [];
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    _results.push(HEAP.push(descriptor()));
  }
  return _results;
};

element = function(type, props, children) {
  var el;
  el = HEAP.length ? HEAP.pop() : descriptor();
  el.type = type != null ? type : 'div';
  el.props = props != null ? props : null;
  el.children = children != null ? children : null;
  return el;
};

recycle = function(el) {
  var child, children, _i, _len;
  if (!el.type) {
    return;
  }
  children = el.children;
  el.type = el.props = el.children = null;
  HEAP.push(el);
  if (children != null) {
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      recycle(child);
    }
  }
};

apply = function(el, last, node, parent, index) {
  var child, childNodes, children, i, key, nextChildren, nextProps, props, ref, same, value, _i, _j, _len, _len1, _ref, _ref1;
  if (el != null) {
    if (last == null) {
      return insert(el, parent, index);
    } else {
      same = typeof el === typeof last && last !== null && el !== null && el.type === last.type;
      if (!same) {
        remove(node, parent);
        return insert(el, parent, index);
      } else {
        props = last != null ? last.props : void 0;
        nextProps = el.props;
        if (props != null) {
          for (key in props) {
            if (!nextProps.hasOwnProperty(key)) {
              unset(node, key);
            }
          }
        }
        if (nextProps != null) {
          for (key in nextProps) {
            value = nextProps[key];
            if ((ref = props[key]) !== value) {
              set(node, key, value, ref);
            }
          }
        }
        children = (_ref = last != null ? last.children : void 0) != null ? _ref : null;
        nextChildren = el.children;
        if ((_ref1 = typeof nextChildren) === 'string' || _ref1 === 'number') {
          if (nextChildren !== children) {
            node.textContent = nextChildren;
          }
        } else if (nextChildren != null) {
          if (nextChildren.type != null) {
            apply(nextChildren, children, node.childNodes[0], node, 0);
          } else {
            childNodes = node.childNodes;
            if (children != null) {
              for (i = _i = 0, _len = nextChildren.length; _i < _len; i = ++_i) {
                child = nextChildren[i];
                apply(child, children[i], childNodes[i], node, i);
              }
            } else {
              for (i = _j = 0, _len1 = nextChildren.length; _j < _len1; i = ++_j) {
                child = nextChildren[i];
                apply(child, null, childNodes[i], node, i);
              }
            }
          }
        } else if (children != null) {
          node.innerHTML = '';
        }
        return;
      }
    }
  }
  if (last != null) {
    return remove(node, parent);
  }
};

insert = function(el, parent, index) {
  var child, children, i, key, node, value, _i, _len, _ref, _ref1, _ref2;
  if (index == null) {
    index = 0;
  }
  if ((_ref = typeof el) === 'string' || _ref === 'number') {
    node = document.createTextNode(el);
  } else {
    node = document.createElement(el.type);
    _ref1 = el.props;
    for (key in _ref1) {
      value = _ref1[key];
      set(node, key, value);
    }
  }
  children = el.children;
  if ((_ref2 = typeof children) === 'string' || _ref2 === 'number') {
    node.textContent = children;
  } else if (children != null) {
    if (children.type != null) {
      insert(children, node, 0);
    } else {
      for (i = _i = 0, _len = children.length; _i < _len; i = ++_i) {
        child = children[i];
        insert(child, node, i);
      }
    }
  }
  parent.insertBefore(node, parent.childNodes[index]);
};

remove = function(node, parent) {
  return parent.removeChild(node);
};

prop = function(key) {
  var prefix, prefixes, _i, _len;
  if (document.documentElement.style[key] != null) {
    return key;
  }
  key = key[0].toUpperCase() + key.slice(1);
  prefixes = ['webkit', 'moz', 'ms', 'o'];
  for (_i = 0, _len = prefixes.length; _i < _len; _i++) {
    prefix = prefixes[_i];
    if (document.documentElement.style[prefix + key] != null) {
      return prefix + key;
    }
  }
};

map = {};

_ref = ['transform'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  key = _ref[_i];
  map[key] = prop(key);
}

set = function(node, key, value, orig) {
  var k, v, _ref1;
  if (key === 'style') {
    for (k in value) {
      v = value[k];
      if ((orig != null ? orig[k] : void 0) !== v) {
        node.style[(_ref1 = map[k]) != null ? _ref1 : k] = v;
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

unset = function(node, key) {
  return node.removeAttribute(key);
};

module.exports = {
  element: element,
  recycle: recycle,
  apply: apply,
  hint: hint
};


},{}],28:[function(require,module,exports){
var Context, Model, Overlay, Primitives, Render, Shaders, Stage, Util;

Model = require('./model');

Overlay = require('./overlay');

Primitives = require('./primitives');

Render = require('./render');

Shaders = require('./shaders');

Stage = require('./stage');

Util = require('./util');

Context = (function() {
  Context.Namespace = {
    Model: Model,
    Overlay: Overlay,
    Primitives: Primitives,
    Render: Render,
    Shaders: Shaders,
    Stage: Stage,
    Util: Util,
    DOM: Overlay.Classes.dom
  };

  function Context(renderer, scene, camera, script) {
    var canvas, element;
    if (scene == null) {
      scene = null;
    }
    if (camera == null) {
      camera = null;
    }
    if (script == null) {
      script = [];
    }
    this.canvas = canvas = renderer.domElement;
    this.element = element = canvas.parentNode;
    this.shaders = new Shaders.Factory(Shaders.Snippets);
    this.renderables = new Render.Factory(Render.Classes, renderer, this.shaders);
    this.overlays = new Overlay.Factory(Overlay.Classes, element, canvas);
    this.scene = this.renderables.make('scene', {
      scene: scene
    });
    this.camera = this.renderables.make('camera', {
      camera: camera
    });
    this.attributes = new Model.Attributes(Primitives.Types);
    this.primitives = new Primitives.Factory(Primitives.Types, this);
    this.root = this.primitives.make('root');
    this.model = new Model.Model(this.root);
    this.guard = new Model.Guard;
    this.controller = new Stage.Controller(this.model, this.primitives);
    this.animator = new Stage.Animator(this.model);
    this.director = new Stage.Director(this.controller, this.animator, script);
    this.api = new Stage.API(this);
    window.model = this.model;
    window.root = this.model.root;
  }

  Context.prototype.init = function() {
    this.scene.inject();
    return this.overlays.inject();
  };

  Context.prototype.destroy = function() {
    this.scene.unject();
    return this.overlays.unject();
  };

  Context.prototype.resize = function(size) {
    return this.root.controller.resize(size);
  };

  Context.prototype.pre = function() {
    var _base;
    return typeof (_base = this.root.controller).pre === "function" ? _base.pre() : void 0;
  };

  Context.prototype.update = function() {
    var _base;
    this.animator.update();
    this.guard.iterate((function(_this) {
      return function() {
        var change;
        change = _this.attributes.digest();
        return change || (change = _this.model.digest());
      };
    })(this));
    return typeof (_base = this.root.controller).update === "function" ? _base.update() : void 0;
  };

  Context.prototype.render = function() {
    var _base;
    return typeof (_base = this.root.controller).render === "function" ? _base.render() : void 0;
  };

  Context.prototype.post = function() {
    var _base;
    return typeof (_base = this.root.controller).post === "function" ? _base.post() : void 0;
  };

  return Context;

})();

module.exports = Context;


},{"./model":33,"./overlay":39,"./primitives":42,"./render":123,"./shaders":138,"./stage":143,"./util":148}],29:[function(require,module,exports){
var Context, k, mathBox, v, _ref;

mathBox = function(options) {
  var three, _ref;
  if (options == null) {
    options = {};
  }
  three = THREE.Bootstrap(options);
  if (three.MathBox == null) {
    three.install('mathbox');
  }
  return (_ref = three.mathbox) != null ? _ref : three;
};

window.π = Math.PI;

window.τ = π * 2;

window.MathBox = exports;

window.mathBox = exports.mathBox = mathBox;

exports.version = '2';

require('../build/shaders');

Context = require('./context');

_ref = Context.Namespace;
for (k in _ref) {
  v = _ref[k];
  exports[k] = v;
}

THREE.Bootstrap.registerPlugin('mathbox', {
  defaults: {
    init: true
  },
  listen: ['ready', 'pre', 'render', 'update', 'post', 'resize'],
  install: function(three) {
    var inited;
    inited = false;
    this.first = true;
    return three.MathBox = {
      init: (function(_this) {
        return function(options) {
          var camera, scene, script;
          if (inited) {
            return;
          }
          inited = true;
          scene = (options != null ? options.scene : void 0) || _this.options.scene || three.scene;
          camera = (options != null ? options.camera : void 0) || _this.options.camera || three.camera;
          script = (options != null ? options.script : void 0) || _this.options.script;
          _this.context = new Context(three.renderer, scene, camera, script);
          _this.context.api.three = three;
          three.mathbox = _this.context.api;
          _this.context.init();
          return _this.context.resize(three.Size);
        };
      })(this),
      destroy: (function(_this) {
        return function() {
          if (!inited) {
            return;
          }
          inited = false;
          _this.context.destroy();
          delete three.mathbox;
          delete _this.context.api.three;
          return delete _this.context;
        };
      })(this),
      object: (function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.context) != null ? _ref1.scene.root : void 0;
        };
      })(this)
    };
  },
  uninstall: function(three) {
    three.MathBox.destroy();
    return delete three.MathBox;
  },
  ready: function(event, three) {
    if (this.options.init) {
      return three.MathBox.init();
    }
  },
  resize: function(event, three) {
    var _ref1;
    return (_ref1 = this.context) != null ? _ref1.resize(three.Size) : void 0;
  },
  pre: function(event, three) {
    var _ref1;
    return (_ref1 = this.context) != null ? _ref1.pre() : void 0;
  },
  update: function(event, three) {
    var _ref1;
    return (_ref1 = this.context) != null ? _ref1.update() : void 0;
  },
  render: function(event, three) {
    var _ref1;
    return (_ref1 = this.context) != null ? _ref1.render() : void 0;
  },
  post: function(event, three) {
    var fmt, info, _ref1;
    if ((_ref1 = this.context) != null) {
      _ref1.post();
    }
    if (this.first) {
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
      this.first = false;
      info = three.renderer.info.render;
      return console.log(fmt(info.faces) + ' faces  ', fmt(info.vertices) + ' vertices  ', fmt(info.calls) + ' calls');
    }
  }
});


/*
 */


},{"../build/shaders":1,"./context":28}],30:[function(require,module,exports){

/*
 Custom attribute model
 - Organizes attributes by trait
 - Provides shorthand aliases to access via flat namespace API .get(key)
 - Provides constant-time .get() access to flat dictionary
 - Originally passed values are preserved and can be fetched via .get(true), .get(key, true)
 - Values are stored in three.js uniform-style objects so they can be bound as GL uniforms
 - Type validators and setters avoid copying value objects on write
 - Value is double-buffered to detect changes and nops
 - Coalesces update notifications per object and per trait
 
  Actual type and trait definitions are injected from Primitives
 */
var Attributes, Data;

Attributes = (function() {
  function Attributes(definitions) {
    this.traits = definitions.Traits;
    this.types = definitions.Types;
    this.pending = [];
  }

  Attributes.prototype.make = function(type) {
    return {
      "enum": typeof type["enum"] === "function" ? type["enum"]() : void 0,
      type: typeof type.uniform === "function" ? type.uniform() : void 0,
      value: type.make()
    };
  };

  Attributes.prototype.apply = function(object, traits) {
    if (traits == null) {
      traits = [];
    }
    return new Data(object, traits, this);
  };

  Attributes.prototype.queue = function(callback) {
    return this.pending.push(callback);
  };

  Attributes.prototype.digest = function() {
    var callback, calls, _i, _len, _ref;
    if (!this.pending.length) {
      return false;
    }
    _ref = [this.pending, []], calls = _ref[0], this.pending = _ref[1];
    for (_i = 0, _len = calls.length; _i < _len; _i++) {
      callback = calls[_i];
      callback();
    }
    return true;
  };

  Attributes.prototype.getTrait = function(name) {
    return this.traits[name];
  };

  return Attributes;

})();

Data = (function() {
  function Data(object, traits, attributes) {
    var attr, change, changed, define, digest, dirty, equalors, equals, event, flattened, get, getNS, key, list, makers, mapTo, name, ns, options, originals, set, short, shorthand, spec, to, touched, trait, unique, validate, validators, value, values, _i, _len, _ref, _ref1, _ref2;
    if (traits == null) {
      traits = [];
    }
    flattened = {};
    originals = {};
    mapTo = {};
    to = function(name) {
      var _ref;
      return (_ref = mapTo[name]) != null ? _ref : name;
    };
    define = function(name, alias) {
      if (mapTo[alias]) {
        throw "Duplicate property `" + alias + "`";
      }
      return mapTo[alias] = name;
    };
    get = (function(_this) {
      return function(key) {
        var _ref, _ref1, _ref2;
        return (_ref = (_ref1 = _this[key]) != null ? _ref1.value : void 0) != null ? _ref : (_ref2 = _this[to(key)]) != null ? _ref2.value : void 0;
      };
    })(this);
    set = (function(_this) {
      return function(key, value, ignore) {
        var attr, replace, short, valid, _ref;
        key = to(key);
        if (validators[key] == null) {
          throw "Setting unknown property '" + key + "'";
        }
        attr = _this[key];
        valid = true;
        replace = validate(key, value, attr.last, function() {
          valid = false;
          return null;
        });
        if (replace === void 0) {
          replace = attr.last;
        }
        if (valid) {
          _ref = [replace, attr.value], attr.value = _ref[0], attr.last = _ref[1];
          short = attr.short;
          flattened[short] = replace;
          if (!ignore) {
            originals[short] = value;
          }
          if (!(ignore || equals(key, attr.value, attr.last))) {
            change(key, value);
          }
        }
        return valid;
      };
    })(this);
    object.get = (function(_this) {
      return function(key, original) {
        if ((key != null) && key !== true) {
          if (original) {
            return originals[to(key)];
          } else {
            return get(key);
          }
        } else {
          if (key || original) {
            return originals;
          } else {
            return flattened;
          }
        }
      };
    })(this);
    object.set = function(key, value, ignore) {
      var options;
      if ((key != null) && (value != null)) {
        set(key, value, ignore);
      } else {
        options = key;
        for (key in options) {
          value = options[key];
          set(key, value, ignore);
        }
      }
    };
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
      var make, replace, target;
      key = to(key);
      make = makers[key];
      if (make != null) {
        target = make();
      }
      replace = validate(key, value, target, function() {
        throw "Invalid value for `" + key + "`";
      });
      if (replace !== void 0) {
        return replace;
      } else {
        return target;
      }
    };
    dirty = false;
    changed = {};
    touched = {};
    getNS = function(key) {
      return key.split('.')[0];
    };
    change = (function(_this) {
      return function(key, value) {
        var trait;
        if (!dirty) {
          dirty = true;
          attributes.queue(digest);
        }
        trait = getNS(key);
        changed[key] = true;
        return touched[trait] = true;
      };
    })(this);
    event = {
      type: 'change',
      changed: null,
      touched: null
    };
    digest = function() {
      var changes, dummy, touches, trait, _ref, _results;
      event.changed = changed;
      event.touched = touched;
      changes = {};
      touches = {};
      dirty = false;
      event.type = 'change';
      object.trigger(event);
      _ref = event.touched;
      _results = [];
      for (trait in _ref) {
        dummy = _ref[trait];
        event.type = "change:" + trait;
        _results.push(object.trigger(event));
      }
      return _results;
    };
    shorthand = function(name) {
      var parts, suffix;
      parts = name.split(/\./g);
      suffix = parts.pop();
      parts.pop();
      parts.unshift(suffix);
      return parts.reduce(function(a, b) {
        return a + b.charAt(0).toUpperCase() + b.substring(1);
      });
    };
    list = [];
    values = {};
    for (_i = 0, _len = traits.length; _i < _len; _i++) {
      trait = traits[_i];
      _ref = trait.split(':'), trait = _ref[0], ns = _ref[1];
      name = ns ? [ns, trait].join('.') : trait;
      spec = attributes.getTrait(trait);
      list.push(trait);
      if (!spec) {
        continue;
      }
      for (key in spec) {
        options = spec[key];
        key = [name, key].join('.');
        short = shorthand(key);
        this[key] = attr = {
          short: short,
          "enum": typeof options["enum"] === "function" ? options["enum"]() : void 0,
          type: typeof options.uniform === "function" ? options.uniform() : void 0,
          last: options.make(),
          value: value = options.make()
        };
        define(key, short);
        flattened[short] = value;
        makers[key] = options.make;
        validators[key] = (_ref1 = options.validate) != null ? _ref1 : function(v) {
          return v;
        };
        equalors[key] = (_ref2 = options.equals) != null ? _ref2 : function(a, b) {
          return a === b;
        };
      }
    }
    unique = list.filter(function(object, i) {
      return list.indexOf(object) === i;
    });
    object.traits = unique;
    null;
  }

  return Data;

})();

module.exports = Attributes;


},{}],31:[function(require,module,exports){
var Group, Node,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Node = require('./node');

Group = (function(_super) {
  __extends(Group, _super);

  function Group(options, type, traits, attributes) {
    Group.__super__.constructor.call(this, options, type, traits, attributes);
    this.children = [];
    this.on('reindex', (function(_this) {
      return function(event) {
        var child, _i, _len, _ref, _results;
        _ref = _this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.trigger(event));
        }
        return _results;
      };
    })(this));
  }

  Group.prototype.add = function(node) {
    var _ref;
    if ((_ref = node.parent) != null) {
      _ref.remove(node);
    }
    node._index(this.children.length, this);
    this.children.push(node);
    return node._added(this);
  };

  Group.prototype.remove = function(node) {
    var i, index, _i, _len, _ref, _results;
    index = this.children.indexOf(node);
    if (index === -1) {
      return;
    }
    this.children = this.children.splice(index, 1);
    node._index(null);
    node._removed(this);
    _ref = this.children;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      node = _ref[i];
      if (i >= index) {
        _results.push(node._index(i));
      }
    }
    return _results;
  };

  Group.prototype.empty = function() {
    var children, node, _i, _len, _results;
    children = this.children.slice();
    _results = [];
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      node = children[_i];
      _results.push(this.remove(node));
    }
    return _results;
  };

  return Group;

})(Node);

module.exports = Group;


},{"./node":35}],32:[function(require,module,exports){
var Guard;

Guard = (function() {
  function Guard(limit) {
    this.limit = limit != null ? limit : 10;
  }

  Guard.prototype.iterate = function(callback) {
    var limit, run;
    limit = this.limit;
    while (run = callback()) {
      if (!--limit) {
        throw "Exceeded iteration limit in digest.";
      }
    }
    return null;
  };

  return Guard;

})();

module.exports = Guard;


},{}],33:[function(require,module,exports){
exports.Attributes = require('./attributes');

exports.Group = require('./group');

exports.Guard = require('./guard');

exports.Model = require('./model');

exports.Node = require('./node');


},{"./attributes":30,"./group":31,"./guard":32,"./model":34,"./node":35}],34:[function(require,module,exports){
var ALL, CLASS, ID, Model, TRAIT, TYPE, cssauron, language,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

cssauron = require('cssauron');

ALL = '*';

ID = /^#([A-Za-z0-9_])$/;

CLASS = /^\.([A-Za-z0-9_]+)$/;

TRAIT = /^\[([A-Za-z0-9_]+)\]$/;

TYPE = /^[A-Za-z0-9_]+$/;

language = null;


/*

  Model that wraps a root node and its children.
  
  Monitors adds, removals and ID/class changes.
  Enables CSS selectors, both querying and watching.

  Watchers are primed differentially as changes come in,
  and fired with digest().
 */

Model = (function() {
  function Model(root) {
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
    this.event = {
      type: 'update'
    };
    if (language == null) {
      language = cssauron({
        tag: 'type',
        id: 'id',
        "class": "classes.join(' ')",
        parent: 'parent',
        children: 'children',
        attr: 'traits.hash[attr]'
      });
    }
    add = (function(_this) {
      return function(event) {
        return adopt(event.node);
      };
    })(this);
    remove = (function(_this) {
      return function(event) {
        return dispose(event.node);
      };
    })(this);
    this.root.on('add', add);
    this.root.on('remove', remove);
    adopt = (function(_this) {
      return function(node) {
        addNode(node);
        addType(node);
        addTraits(node);
        node.on('change:node', update);
        update(null, node, true);
        return force(node);
      };
    })(this);
    dispose = (function(_this) {
      return function(node) {
        removeNode(node);
        removeType(node);
        removeTraits(node);
        removeID(node.id);
        removeClasses(node.classes);
        node.off('change:node', update);
        return force(node);
      };
    })(this);
    prime = (function(_this) {
      return function(node) {
        var watcher, _i, _len, _ref;
        _ref = _this.watchers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          watcher = _ref[_i];
          watcher.match = watcher.matcher(node);
        }
        return null;
      };
    })(this);
    check = (function(_this) {
      return function(node) {
        var watcher, _i, _len, _ref;
        _ref = _this.watchers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          watcher = _ref[_i];
          _this.fire || (_this.fire = watcher.fire || (watcher.fire = watcher.match !== watcher.matcher(node)));
        }
        return null;
      };
    })(this);
    force = (function(_this) {
      return function(node) {
        var watcher, _i, _len, _ref;
        _ref = _this.watchers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          watcher = _ref[_i];
          _this.fire || (_this.fire = watcher.fire || (watcher.fire = watcher.matcher(node)));
        }
        return null;
      };
    })(this);
    this.digest = (function(_this) {
      return function() {
        var watcher, _i, _len, _ref;
        if (!_this.fire) {
          return false;
        }
        _ref = _this.watchers.slice();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          watcher = _ref[_i];
          if (!watcher.fire) {
            continue;
          }
          watcher.fire = false;
          watcher.handler();
        }
        _this.fire = false;
        return true;
      };
    })(this);
    update = (function(_this) {
      return function(event, node, init) {
        var classes, id, klass, primed, _id, _klass, _ref, _ref1;
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
          classes = (_ref = node.get('node.classes')) != null ? _ref : [];
          klass = classes.join(',');
          if (klass !== ((_ref1 = node.classes) != null ? _ref1.klass : void 0)) {
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
    })(this);
    addTags = function(sets, tags, node) {
      var k, list, _i, _len, _ref;
      if (tags == null) {
        return;
      }
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        k = tags[_i];
        list = (_ref = sets[k]) != null ? _ref : [];
        list.push(node);
        sets[k] = list;
      }
      return null;
    };
    removeTags = function(sets, tags, node) {
      var index, k, list, _i, _len;
      if (tags == null) {
        return;
      }
      for (_i = 0, _len = tags.length; _i < _len; _i++) {
        k = tags[_i];
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
    hashTags = function(array) {
      var hash, klass, _i, _len, _results;
      if (!(array.length > 0)) {
        return;
      }
      hash = array.hash = {};
      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        klass = array[_i];
        _results.push(hash[klass] = true);
      }
      return _results;
    };
    unhashTags = function(array) {
      return delete array.hash;
    };
    addID = (function(_this) {
      return function(id, node) {
        if (_this.ids[id]) {
          throw "Duplicate id `" + id + "`";
        }
        if (id != null) {
          _this.ids[id] = [node];
        }
        return node.id = id;
      };
    })(this);
    removeID = (function(_this) {
      return function(id, node) {
        if (id != null) {
          delete _this.ids[id];
        }
        return delete node.id;
      };
    })(this);
    addClasses = (function(_this) {
      return function(classes, node) {
        addTags(_this.classes, classes, node);
        if (classes != null) {
          return hashTags(classes);
        }
      };
    })(this);
    removeClasses = (function(_this) {
      return function(classes, node) {
        removeTags(_this.classes, classes, node);
        if (classes != null) {
          return unhashTags(classes);
        }
      };
    })(this);
    addNode = (function(_this) {
      return function(node) {
        return _this.nodes.push(node);
      };
    })(this);
    removeNode = (function(_this) {
      return function(node) {
        return _this.nodes.splice(_this.nodes.indexOf(node), 1);
      };
    })(this);
    addType = (function(_this) {
      return function(node) {
        return addTags(_this.types, [node.type], node);
      };
    })(this);
    removeType = (function(_this) {
      return function(node) {
        return removeTags(_this.types, [node.type], node);
      };
    })(this);
    addTraits = (function(_this) {
      return function(node) {
        addTags(_this.traits, node.traits, node);
        return hashTags(node.traits);
      };
    })(this);
    removeTraits = (function(_this) {
      return function(node) {
        removeTags(_this.traits, node.traits, node);
        return unhashTags(node.traits);
      };
    })(this);
    adopt(this.root);
    this.root.trigger({
      type: 'added'
    });
  }

  Model.prototype.filter = function(nodes, selector) {
    var matcher, node, _i, _len, _results;
    matcher = this._matcher(selector);
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      if (matcher(node)) {
        _results.push(node);
      }
    }
    return _results;
  };

  Model.prototype.ancestry = function(nodes, parents) {
    var node, out, parent, _i, _len;
    out = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      parent = node.parent;
      while (parent != null) {
        if (__indexOf.call(parents, parent) >= 0) {
          out.push(node);
          continue;
        }
        parent = node.parent;
      }
    }
    return out;
  };

  Model.prototype.select = function(selector, parents) {
    var matches;
    matches = this._select(selector);
    if (parents != null) {
      matches = this.ancestry(unique, parents);
    }
    matches.sort(function(a, b) {
      return b.order - a.order;
    });
    return matches;
  };

  Model.prototype.watch = function(selector, handler) {
    var watcher;
    handler.unwatch = (function(_this) {
      return function() {
        return _this.unwatch(handler);
      };
    })(this);
    handler.watcher = watcher = {
      handler: handler,
      matcher: this._matcher(selector),
      match: false,
      fire: false
    };
    this.watchers.push(watcher);
    return this.select(selector);
  };

  Model.prototype.unwatch = function(handler) {
    var watcher;
    watcher = handler.watcher;
    if (watcher == null) {
      return;
    }
    this.watchers.splice(this.watchers.indexOf(watcher), 1);
    delete handler.unwatch;
    return delete handler.watcher;
  };

  Model.prototype._simplify = function(s) {
    var all, found, id, klass, trait, type, _ref, _ref1, _ref2, _ref3;
    s = s.replace(/^\s+/, '');
    s = s.replace(/\s+$/, '');
    found = all = s === ALL;
    if (!found) {
      found = id = (_ref = s.match(ID)) != null ? _ref[1] : void 0;
    }
    if (!found) {
      found = klass = (_ref1 = s.match(CLASS)) != null ? _ref1[1] : void 0;
    }
    if (!found) {
      found = trait = (_ref2 = s.match(TRAIT)) != null ? _ref2[1] : void 0;
    }
    if (!found) {
      found = type = (_ref3 = s.match(TYPE)) != null ? _ref3[0] : void 0;
    }
    return [all, id, klass, trait, type];
  };

  Model.prototype._matcher = function(s) {
    var all, id, klass, trait, type, _ref;
    _ref = this._simplify(s), all = _ref[0], id = _ref[1], klass = _ref[2], trait = _ref[3], type = _ref[4];
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
        var _ref1;
        return (_ref1 = node.classes) != null ? _ref1.hash[klass] : void 0;
      });
    }
    if (trait) {
      return (function(node) {
        var _ref1;
        return (_ref1 = node.traits) != null ? _ref1.hash[trait] : void 0;
      });
    }
    if (type) {
      return (function(node) {
        return node.type === type;
      });
    }
    return language(s);
  };

  Model.prototype._select = function(s) {
    var all, id, klass, trait, type, _ref, _ref1, _ref2, _ref3, _ref4;
    _ref = this._simplify(s), all = _ref[0], id = _ref[1], klass = _ref[2], trait = _ref[3], type = _ref[4];
    if (all) {
      return this.nodes;
    }
    if (id) {
      return (_ref1 = this.ids[id]) != null ? _ref1 : [];
    }
    if (klass) {
      return (_ref2 = this.classes[klass]) != null ? _ref2 : [];
    }
    if (trait) {
      return (_ref3 = this.traits[trait]) != null ? _ref3 : [];
    }
    if (type) {
      return (_ref4 = this.types[type]) != null ? _ref4 : [];
    }
    return this.filter(this.nodes, s);
  };

  Model.prototype.getRoot = function() {
    return this.root;
  };

  return Model;

})();

module.exports = Model;


},{"cssauron":16}],35:[function(require,module,exports){
var Node;

Node = (function() {
  function Node(options, type, traits, attributes) {
    this.type = type;
    if (traits == null) {
      traits = [];
    }
    this.attributes = attributes.apply(this, traits);
    this.parent = this.root = this.path = this.index = null;
    this.set(options, null, true);
  }

  Node.prototype.toString = function() {
    var out, _ref;
    out = this.type;
    if (this.id) {
      out += '#' + this.id;
    }
    if ((_ref = this.classes) != null ? _ref.length : void 0) {
      out += '.' + this.classes.join('.');
    }
    return out;
  };

  Node.prototype._added = function(parent) {
    var event;
    this.parent = parent;
    this.root = parent.root;
    event = {
      type: 'add',
      node: this,
      parent: this.parent
    };
    if (this.root) {
      this.root.trigger(event);
    }
    event.type = 'added';
    return this.trigger(event);
  };

  Node.prototype._removed = function() {
    var event;
    this.root = this.parent = null;
    event = {
      type: 'remove',
      node: this
    };
    if (this.root) {
      this.root.trigger(event);
    }
    event.type = 'removed';
    return this.trigger(event);
  };

  Node.prototype._index = function(index, parent) {
    var path, _ref;
    if (parent == null) {
      parent = this.parent;
    }
    this.index = index;
    this.path = path = index != null ? ((_ref = parent != null ? parent.path : void 0) != null ? _ref : []).concat([index]) : null;
    this.order = path != null ? this._encode(path) : Infinity;
    if (this.root != null) {
      return this.trigger({
        type: 'reindex'
      });
    }
  };

  Node.prototype._encode = function(path) {
    var a, b, f, g, index, k, lerp, map, _i, _len, _ref;
    k = 3;
    map = function(x) {
      return k / (x + k);
    };
    lerp = function(t) {
      return b + (a - b) * t;
    };
    a = 1 + 1 / k;
    b = 0;
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      index = path[_i];
      f = map(index + 1);
      g = map(index + 2);
      _ref = [lerp(f), lerp(g)], a = _ref[0], b = _ref[1];
    }
    return a;
  };

  return Node;

})();

THREE.Binder.apply(Node.prototype);

module.exports = Node;


},{}],36:[function(require,module,exports){
var Classes;

Classes = {
  dom: require('./dom')
};

module.exports = Classes;


},{"./dom":37}],37:[function(require,module,exports){
var DOM, Overlay, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Overlay = require('./overlay');

Util = require('../util');

DOM = (function(_super) {
  __extends(DOM, _super);

  function DOM() {
    return DOM.__super__.constructor.apply(this, arguments);
  }

  DOM.prototype.el = Util.VDOM.element;

  DOM.prototype.hint = Util.VDOM.hint;

  DOM.prototype.apply = Util.VDOM.apply;

  DOM.prototype.recycle = Util.VDOM.recycle;

  DOM.prototype.init = function(options) {
    return this.last = null;
  };

  DOM.prototype.dispose = function() {
    this.unmount();
    return DOM.__super__.dispose.apply(this, arguments);
  };

  DOM.prototype.mount = function() {
    var overlay;
    overlay = document.createElement('div');
    overlay.classList.add('mathbox-overlay');
    this.element.appendChild(overlay);
    return this.overlay = overlay;
  };

  DOM.prototype.unmount = function(overlay) {
    if (overlay.parentNode) {
      this.element.removeChild(overlay);
    }
    return this.overlay = null;
  };

  DOM.prototype.render = function(el) {
    var last, naked, node, overlay, parent, _ref;
    if (!this.overlay) {
      this.mount();
    }
    if ((_ref = typeof el) === 'string' || _ref === 'number') {
      el = this.el('div', null, el);
    }
    if (el instanceof Array) {
      el = this.el('div', null, el);
    }
    naked = el.type === 'div';
    last = this.last;
    overlay = this.overlay;
    node = naked ? overlay : overlay.childNodes[0];
    parent = naked ? overlay.parentNode : overlay;
    if (!last && node) {
      last = this.el('div');
    }
    this.apply(el, last, node, parent, 0);
    this.last = el;
    if (last != null) {
      this.recycle(last);
    }
  };

  return DOM;

})(Overlay);

module.exports = DOM;


},{"../util":148,"./overlay":40}],38:[function(require,module,exports){
var OverlayFactory;

OverlayFactory = (function() {
  function OverlayFactory(classes, element, canvas) {
    var div;
    this.classes = classes;
    this.element = element;
    this.canvas = canvas;
    div = document.createElement('div');
    div.classList.add('mathbox-overlays');
    this.div = div;
  }

  OverlayFactory.prototype.inject = function() {
    return this.element.insertBefore(this.div, this.canvas);
  };

  OverlayFactory.prototype.unject = function() {
    return this.element.removeChild(this.div);
  };

  OverlayFactory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  OverlayFactory.prototype.make = function(type, options) {
    return new this.classes[type](this.div, options);
  };

  return OverlayFactory;

})();

module.exports = OverlayFactory;


},{}],39:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Classes = require('./classes');

exports.Overlay = require('./overlay');


},{"./classes":36,"./factory":38,"./overlay":40}],40:[function(require,module,exports){
var Overlay;

Overlay = (function() {
  function Overlay(element, options) {
    this.element = element;
    if (typeof this.init === "function") {
      this.init(options);
    }
  }

  Overlay.prototype.dispose = function() {};

  return Overlay;

})();

module.exports = Overlay;


},{}],41:[function(require,module,exports){
var PrimitiveFactory, Util;

Util = require('../util');

PrimitiveFactory = (function() {
  function PrimitiveFactory(definitions, context) {
    this.context = context;
    this.classes = definitions.Classes;
    this.helpers = definitions.Helpers;
  }

  PrimitiveFactory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  PrimitiveFactory.prototype.make = function(type, options) {
    var controller, klass, model, modelKlass;
    if (options == null) {
      options = {};
    }
    klass = this.classes[type];
    if (!klass) {
      throw "Unknown primitive class `" + type + "`";
    }
    modelKlass = klass.model;
    options = Util.JS.merge(klass.defaults, options);
    model = new modelKlass(options, type, klass.traits, this.context.attributes);
    controller = new klass(model, this.context, this.helpers);

    /*
    guard        = @context.guard
    guard.apply    model
    guard.apply    controller
     */
    return model;
  };

  return PrimitiveFactory;

})();

module.exports = PrimitiveFactory;


},{"../util":148}],42:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Primitive = require('./primitive');

exports.Types = require('./types');


},{"./factory":41,"./primitive":43,"./types":69}],43:[function(require,module,exports){
var Model, Primitive,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Model = require('../model');

Primitive = (function() {
  Primitive.Node = Model.Node;

  Primitive.Group = Model.Group;

  Primitive.model = Primitive.Node;

  Primitive.traits = [];

  function Primitive(node, _context, helpers) {
    this.node = node;
    this._context = _context;
    this._attributes = this._context.attributes;
    this._renderables = this._context.renderables;
    this._shaders = this._context.shaders;
    this._overlays = this._context.overlays;
    this._types = this._attributes.types;
    this.node.controller = this;
    this.traits = this.node.traits;
    this.node.on('added', (function(_this) {
      return function(event) {
        return _this._added();
      };
    })(this));
    this.node.on('removed', (function(_this) {
      return function(event) {
        return _this._removed();
      };
    })(this));
    this.node.on('change', (function(_this) {
      return function(event) {
        if (_this._root) {
          return _this.change(event.changed, event.touched);
        }
      };
    })(this));
    this._get = this.node.get.bind(this.node);
    this._helpers = helpers(this, this.node.traits);
    this._handlers = {
      inherit: {},
      listen: [],
      watch: []
    };
    this._root = this._parent = null;
    this.init();
  }

  Primitive.prototype.is = function(trait) {
    return this.traits.hash[trait];
  };

  Primitive.prototype.init = function() {};

  Primitive.prototype.make = function() {};

  Primitive.prototype.made = function() {};

  Primitive.prototype.unmake = function(rebuild) {};

  Primitive.prototype.unmade = function() {};

  Primitive.prototype.change = function(changed, touched, init) {};

  Primitive.prototype.rebuild = function() {
    if (this._root) {
      this.unmake(true);
      this._unlisten();
      this._unattach();
      this.unmade();
      this.make();
      this.refresh();
      return this.made();
    }
  };

  Primitive.prototype.refresh = function() {
    return this.change({}, {}, true);
  };

  Primitive.prototype._added = function() {
    var _ref, _ref1;
    this._parent = (_ref = this.node.parent) != null ? _ref.controller : void 0;
    this._root = (_ref1 = this.node.root) != null ? _ref1.controller : void 0;
    this.make();
    this.refresh();
    return this.made();
  };

  Primitive.prototype._removed = function() {
    this.unmake();
    this._unlisten();
    this._unattach();
    this._root = null;
    return this._parent = null;
  };

  Primitive.prototype._listen = function(object, type, method, self) {
    var handler;
    if (self == null) {
      self = this;
    }
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
  };

  Primitive.prototype._unlisten = function() {
    var handler, object, type, _i, _len, _ref, _ref1;
    if (!this._handlers.listen.length) {
      return;
    }
    _ref = this._handlers.listen;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], object = _ref1[0], type = _ref1[1], handler = _ref1[2];
      object.off(type, handler);
    }
    return this._handlers.listen = [];
  };

  Primitive.prototype._inherit = function(trait) {
    var cached, _ref;
    cached = this._handlers.inherit[trait];
    if (cached !== void 0) {
      return cached;
    }
    return this._handlers.inherit[trait] = (_ref = this._parent) != null ? _ref._find(trait != null ? trait : null) : void 0;
  };

  Primitive.prototype._find = function(trait) {
    var _ref;
    if (this.is(trait)) {
      return this;
    }
    return (_ref = this._parent) != null ? _ref._find(trait) : void 0;
  };

  Primitive.prototype._uninherit = function() {
    return this._handlers.inherit = {};
  };

  Primitive.prototype._attach = function(selector, trait, method, self, start) {
    var id, node, parent, previous, selection, watcher;
    if (self == null) {
      self = this;
    }
    if (start == null) {
      start = this;
    }
    if (typeof selector === 'object') {
      if (selector._up) {
        selector = selector[0];
      }
      node = selector;
      if ((node != null) && __indexOf.call(node.traits, trait) >= 0) {
        return node.controller;
      }
    }
    if (selector === '<') {
      previous = start.node;
      while (previous) {
        parent = previous.parent;
        if (!parent) {
          break;
        }
        previous = parent.children[previous.index - 1];
        if (!previous) {
          previous = parent;
        }
        if ((previous != null) && __indexOf.call(previous.traits, trait) >= 0) {
          return previous.controller;
        }
      }
    } else if (typeof selector === 'string') {
      watcher = method.bind(self);
      this._handlers.watch.push(watcher);
      selection = this._root.watch(selector, watcher);
      node = selection[0];
      if ((node != null) && __indexOf.call(node.traits, trait) >= 0) {
        return node.controller;
      }
    }
    if (this.node.id != null) {
      id = "#" + this.node.id;
    }
    throw "Could not find " + trait + " `" + selector + "` on `" + this.node.type + (id != null ? id : '') + "`";
    return null;
  };

  Primitive.prototype._unattach = function() {
    var watcher, _i, _len, _ref;
    if (!this._handlers.watch.length) {
      return;
    }
    _ref = this._handlers.watch;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      watcher = _ref[_i];
      if (watcher != null) {
        watcher.unwatch();
      }
    }
    return this._handlers.watch = [];
  };

  return Primitive;

})();

THREE.Binder.apply(Primitive.prototype);

module.exports = Primitive;


},{"../model":33}],44:[function(require,module,exports){
var Group, Parent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Parent = require('./parent');

Group = (function(_super) {
  __extends(Group, _super);

  function Group() {
    return Group.__super__.constructor.apply(this, arguments);
  }

  Group.traits = ['node', 'object', 'entity', 'group'];

  Group.prototype.make = function() {
    return this._helpers.object.make();
  };

  Group.prototype.unmake = function() {
    return this._helpers.object.unmake();
  };

  return Group;

})(Parent);

module.exports = Group;


},{"./parent":45}],45:[function(require,module,exports){
var Parent, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Parent = (function(_super) {
  __extends(Parent, _super);

  function Parent() {
    return Parent.__super__.constructor.apply(this, arguments);
  }

  Parent.model = Primitive.Group;

  Parent.traits = ['node'];

  return Parent;

})(Primitive);

module.exports = Parent;


},{"../../primitive":43}],46:[function(require,module,exports){
var Parent, Root, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Parent = require('./parent');

Util = require('../../../util');

Root = (function(_super) {
  __extends(Root, _super);

  function Root() {
    return Root.__super__.constructor.apply(this, arguments);
  }

  Root.traits = ['node', 'root', 'scene', 'transform', 'unit'];

  Root.prototype.init = function() {
    this.size = null;
    this.cameraEvent = {
      type: 'root.camera'
    };
    this.updateEvent = {
      type: 'root.update'
    };
    return this.postEvent = {
      type: 'root.post'
    };
  };

  Root.prototype.make = function() {
    return this._helpers.unit.make();
  };

  Root.prototype.unmake = function() {
    return this._helpers.unit.unmake();
  };

  Root.prototype.adopt = function(renderable) {
    var object, _i, _len, _ref, _results;
    _ref = renderable.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this._context.scene.add(object));
    }
    return _results;
  };

  Root.prototype.unadopt = function(renderable) {
    var object, _i, _len, _ref, _results;
    _ref = renderable.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this._context.scene.remove(object));
    }
    return _results;
  };

  Root.prototype.select = function(selector) {
    return this.node.model.select(selector);
  };

  Root.prototype.watch = function(selector, handler) {
    return this.node.model.watch(selector, handler);
  };

  Root.prototype.unwatch = function(handler) {
    return this.node.model.unwatch(handler);
  };

  Root.prototype.resize = function(size) {
    this.size = size;
    return this.trigger({
      type: 'root.resize',
      size: size
    });
  };

  Root.prototype.getSize = function() {
    return this.size;
  };

  Root.prototype.getUnit = function() {
    return this._helpers.unit.get();
  };

  Root.prototype.getUnitUniforms = function() {
    return this._helpers.unit.uniforms();
  };

  Root.prototype.pre = function() {
    return this.getCamera().updateProjectionMatrix();
  };

  Root.prototype.update = function() {
    return this.trigger(this.updateEvent);
  };

  Root.prototype.post = function() {
    return this.trigger(this.postEvent);
  };

  Root.prototype.getCamera = function() {
    return this._context.camera.get();
  };

  Root.prototype.transform = function(shader, pass) {
    if (pass === 2) {
      return shader.pipe('view.position');
    }
    if (pass === 3) {
      return shader.pipe(Util.GLSL.truncateVec(4, 3));
    }
    return shader;
  };

  return Root;

})(Parent);

module.exports = Root;


},{"../../../util":148,"./parent":45}],47:[function(require,module,exports){
var Primitive, Source, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Source = (function(_super) {
  __extends(Source, _super);

  function Source() {
    return Source.__super__.constructor.apply(this, arguments);
  }

  Source.traits = ['node', 'data', 'source', 'index'];

  Source.prototype.made = function() {
    return this.trigger({
      type: 'source.rebuild'
    });
  };

  Source.prototype.indexShader = function(shader) {
    return shader.pipe(Util.GLSL.identity('vec4'));
  };

  Source.prototype.sourceShader = function(shader) {
    return shader.pipe(Util.GLSL.identity('vec4'));
  };

  Source.prototype.getDimensions = function() {
    return {
      items: 1,
      width: 1,
      height: 1,
      depth: 1
    };
  };

  Source.prototype.getActive = function() {
    return {
      items: 1,
      width: 1,
      height: 1,
      depth: 1
    };
  };

  return Source;

})(Primitive);

module.exports = Source;


},{"../../../util":148,"../../primitive":43}],48:[function(require,module,exports){
var Parent, Unit, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Parent = require('./parent');

Util = require('../../../util');

Unit = (function(_super) {
  __extends(Unit, _super);

  function Unit() {
    return Unit.__super__.constructor.apply(this, arguments);
  }

  Unit.traits = ['node', 'unit'];

  Unit.prototype.make = function() {
    return this._helpers.unit.make();
  };

  Unit.prototype.unmake = function() {
    return this._helpers.unit.unmake();
  };

  Unit.prototype.getUnit = function() {
    return this._helpers.unit.get();
  };

  Unit.prototype.getUnitUniforms = function() {
    return this._helpers.unit.uniforms();
  };

  return Unit;

})(Parent);

module.exports = Unit;


},{"../../../util":148,"./parent":45}],49:[function(require,module,exports){
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
  label: require('./draw/label'),
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
  array: require('./data/array'),
  interval: require('./data/interval'),
  matrix: require('./data/matrix'),
  area: require('./data/area'),
  voxel: require('./data/voxel'),
  volume: require('./data/volume'),
  text: require('./data/text'),
  html: require('./overlay/html'),
  dom: require('./overlay/dom'),
  join: require('./operator/join'),
  lerp: require('./operator/lerp'),
  memo: require('./operator/memo'),
  resample: require('./operator/resample'),
  repeat: require('./operator/repeat'),
  swizzle: require('./operator/swizzle'),
  spread: require('./operator/spread'),
  split: require('./operator/split'),
  transpose: require('./operator/transpose'),
  group: require('./base/group'),
  root: require('./base/root'),
  unit: require('./base/unit'),
  rtt: require('./rtt/rtt'),
  compose: require('./rtt/compose')
};

module.exports = Classes;


},{"./base/group":44,"./base/root":46,"./base/unit":48,"./data/area":50,"./data/array":51,"./data/interval":53,"./data/matrix":54,"./data/text":55,"./data/volume":56,"./data/voxel":57,"./draw/axis":58,"./draw/face":59,"./draw/grid":60,"./draw/label":61,"./draw/line":62,"./draw/point":63,"./draw/strip":64,"./draw/surface":65,"./draw/ticks":66,"./draw/vector":67,"./operator/join":70,"./operator/lerp":71,"./operator/memo":72,"./operator/repeat":74,"./operator/resample":75,"./operator/split":76,"./operator/spread":77,"./operator/swizzle":78,"./operator/transpose":79,"./overlay/dom":80,"./overlay/html":81,"./rtt/compose":82,"./rtt/rtt":83,"./transform/transform3":86,"./transform/transform4":87,"./transform/vertex":88,"./view/cartesian":90,"./view/cartesian4":91,"./view/polar":92,"./view/spherical":93,"./view/stereographic":94,"./view/stereographic4":95,"./view/view":96}],50:[function(require,module,exports){
var Area, Matrix, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Matrix = require('./matrix');

Util = require('../../../util');

Area = (function(_super) {
  __extends(Area, _super);

  function Area() {
    return Area.__super__.constructor.apply(this, arguments);
  }

  Area.traits = ['node', 'data', 'source', 'matrix', 'texture', 'span:x', 'span:y', 'area', 'sampler:x', 'sampler:y'];

  Area.prototype.callback = function(callback) {
    var aX, aY, bX, bY, centeredX, centeredY, dimensions, height, inverseX, inverseY, rangeX, rangeY, spanX, spanY, width;
    dimensions = this._get('area.axes');
    width = this._get('matrix.width');
    height = this._get('matrix.height');
    centeredX = this._get('x.sampler.centered');
    centeredY = this._get('y.sampler.centered');
    rangeX = this._helpers.span.get('x.', dimensions[0]);
    rangeY = this._helpers.span.get('y.', dimensions[1]);
    aX = rangeX.x;
    aY = rangeY.x;
    spanX = rangeX.y - rangeX.x;
    spanY = rangeY.y - rangeY.x;
    if (centeredX) {
      inverseX = 1 / Math.max(1, width);
      aX += spanX * inverseX / 2;
    } else {
      inverseX = 1 / Math.max(1, width - 1);
    }
    if (centeredY) {
      inverseY = 1 / Math.max(1, height);
      aY += spanY * inverseY / 2;
    } else {
      inverseY = 1 / Math.max(1, height - 1);
    }
    bX = spanX * inverseX;
    bY = spanY * inverseY;
    return function(emit, i, j) {
      var x, y;
      x = aX + bX * i;
      y = aY + bY * j;
      return callback(emit, x, y, i, j);
    };
  };

  Area.prototype.make = function() {
    Area.__super__.make.apply(this, arguments);
    return this._helpers.span.make();
  };

  Area.prototype.unmake = function() {
    Area.__super__.unmake.apply(this, arguments);
    return this._helpers.span.unmake();
  };

  return Area;

})(Matrix);

module.exports = Area;


},{"../../../util":148,"./matrix":54}],51:[function(require,module,exports){
var Array_, Data, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Data = require('./data');

Util = require('../../../util');

Array_ = (function(_super) {
  __extends(Array_, _super);

  function Array_() {
    return Array_.__super__.constructor.apply(this, arguments);
  }

  Array_.traits = ['node', 'data', 'source', 'array', 'texture'];

  Array_.prototype.init = function() {
    this.buffer = this.spec = null;
    this.filled = false;
    this.space = {
      length: 0,
      history: 0
    };
    this.used = {
      length: 0
    };
    this.storage = 'arrayBuffer';
    return Array_.__super__.init.apply(this, arguments);
  };

  Array_.prototype.sourceShader = function(shader) {
    return this.buffer.shader(shader);
  };

  Array_.prototype.getDimensions = function() {
    var space;
    space = this.space;
    return {
      items: this.items,
      width: space.length,
      height: space.history,
      depth: 1
    };
  };

  Array_.prototype.getActive = function() {
    var used;
    used = this.used;
    return {
      items: this.items,
      width: used.length,
      height: this.buffer.getFilled(),
      depth: 1
    };
  };

  Array_.prototype.make = function() {
    var channels, data, dims, history, items, length, magFilter, minFilter, reserve, space, type, _base;
    Array_.__super__.make.apply(this, arguments);
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    length = this._get('array.length');
    history = this._get('array.history');
    reserve = this._get('array.bufferLength');
    channels = this._get('data.channels');
    items = this._get('data.items');
    dims = this.spec = {
      channels: channels,
      items: items,
      width: length
    };
    this.items = dims.items;
    this.channels = dims.channels;
    data = this._get('data.data');
    dims = Util.Data.getDimensions(data, dims);
    space = this.space;
    space.length = Math.max(reserve, dims.width || 1);
    space.history = history;
    if ((_base = this.spec).width == null) {
      _base.width = 1;
    }
    return this.buffer = this._renderables.make(this.storage, {
      length: space.length,
      history: space.history,
      channels: channels,
      items: items,
      minFilter: minFilter,
      magFilter: magFilter,
      type: type
    });
  };

  Array_.prototype.unmake = function() {
    Array_.__super__.unmake.apply(this, arguments);
    if (this.buffer) {
      this.buffer.dispose();
      return this.buffer = this.spec = null;
    }
  };

  Array_.prototype.change = function(changed, touched, init) {
    var length;
    if (touched['texture'] || changed['array.history'] || changed['data.dimensions'] || changed['data.items'] || changed['array.bufferLength']) {
      return this.rebuild();
    }
    if (!this.buffer) {
      return;
    }
    if (changed['array.length']) {
      length = this._get('array.length');
      if (length > this.space.length) {
        return this.rebuild();
      }
    }
    if (changed['data.expression'] || changed['data.data'] || init) {
      return this.buffer.setCallback(this.emitter());
    }
  };

  Array_.prototype.callback = function(callback) {
    return callback;
  };

  Array_.prototype.update = function() {
    var data, dims, filled, l, length, space, used;
    if (!this.buffer) {
      return;
    }
    if (!(!this.filled || this._get('data.live'))) {
      return;
    }
    data = this._get('data.data');
    space = this.space;
    used = this.used;
    filled = this.buffer.getFilled();
    l = used.length;
    if (data != null) {
      dims = Util.Data.getDimensions(data, this.spec);
      if (dims.width > space.length) {
        this.rebuild();
      }
      used.length = dims.width;
      this.buffer.setActive(used.length);
      this.buffer.callback.rebind(data);
      this.buffer.update();
    } else {
      this.buffer.setActive(this.spec.width);
      length = this.buffer.update();
      used.length = length;
    }
    this.filled = true;
    if (used.length !== l || filled !== this.buffer.getFilled()) {
      return this.trigger({
        type: 'source.resize'
      });
    }
  };

  return Array_;

})(Data);

module.exports = Array_;


},{"../../../util":148,"./data":52}],52:[function(require,module,exports){
var Data, Source, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Source = require('../base/source');

Util = require('../../../util');

Data = (function(_super) {
  __extends(Data, _super);

  function Data() {
    return Data.__super__.constructor.apply(this, arguments);
  }

  Data.traits = ['node', 'data', 'source', 'texture'];

  Data.prototype.init = function() {
    this.dataEmitter = null;
    return this.dataSizes = null;
  };

  Data.prototype.update = function() {};

  Data.prototype.emitter = function() {
    var channels, data, emitter, items, last, sizes, thunk;
    data = this._get('data.data');
    if (data != null) {
      last = this.dataSizes;
      sizes = Util.Data.getSizes(data);
      if (!last || last.length !== sizes.length) {
        channels = this._get('data.channels');
        items = this._get('data.items');
        thunk = Util.Data.getThunk(data);
        this.dataEmitter = this.callback(Util.Data.makeEmitter(thunk, items, channels));
        this.dataSizes = sizes;
      }
      emitter = this.dataEmitter;
    } else {
      emitter = this.callback(this._get('data.expression'));
    }
    return emitter;
  };

  Data.prototype.callback = function(callback) {
    return callback != null ? callback : function() {};
  };

  Data.prototype.make = function() {
    return this._listen('root', 'root.update', this.update);
  };

  Data.prototype.unmake = function() {
    this.dataEmitter = null;
    return this.dataSizes = null;
  };

  return Data;

})(Source);

module.exports = Data;


},{"../../../util":148,"../base/source":47}],53:[function(require,module,exports){
var Interval, Util, _Array,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_Array = require('./array');

Util = require('../../../util');

Interval = (function(_super) {
  __extends(Interval, _super);

  function Interval() {
    return Interval.__super__.constructor.apply(this, arguments);
  }

  Interval.traits = ['node', 'data', 'source', 'texture', 'array', 'span', 'interval', 'sampler'];

  Interval.prototype.callback = function(callback) {
    var a, b, centered, dimension, inverse, length, range, span;
    dimension = this._get('interval.axis');
    length = this._get('array.length');
    centered = this._get('sampler.centered');
    range = this._helpers.span.get('', dimension);
    a = range.x;
    span = range.y - range.x;
    if (centered) {
      inverse = 1 / Math.max(1, length);
      a += span * inverse / 2;
    } else {
      inverse = 1 / Math.max(1, length - 1);
    }
    b = span * inverse;
    return function(emit, i) {
      var x;
      x = a + b * i;
      return callback(emit, x, i);
    };
  };

  Interval.prototype.make = function() {
    Interval.__super__.make.apply(this, arguments);
    return this._helpers.span.make();
  };

  Interval.prototype.unmake = function() {
    Interval.__super__.unmake.apply(this, arguments);
    return this._helpers.span.unmake();
  };

  return Interval;

})(_Array);

module.exports = Interval;


},{"../../../util":148,"./array":51}],54:[function(require,module,exports){
var Data, Matrix, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Data = require('./data');

Util = require('../../../util');

Matrix = (function(_super) {
  __extends(Matrix, _super);

  function Matrix() {
    return Matrix.__super__.constructor.apply(this, arguments);
  }

  Matrix.traits = ['node', 'data', 'source', 'texture', 'matrix'];

  Matrix.prototype.init = function() {
    this.buffer = this.spec = null;
    this.filled = false;
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
    return Matrix.__super__.init.apply(this, arguments);
  };

  Matrix.prototype.sourceShader = function(shader) {
    return this.buffer.shader(shader);
  };

  Matrix.prototype.getDimensions = function() {
    var space;
    space = this.space;
    return {
      items: this.items,
      width: space.width,
      height: space.height,
      depth: space.history
    };
  };

  Matrix.prototype.getActive = function() {
    var used;
    used = this.used;
    return {
      items: this.items,
      width: used.width,
      height: used.height,
      depth: this.buffer.getFilled()
    };
  };

  Matrix.prototype.make = function() {
    var channels, data, dims, height, history, items, magFilter, minFilter, reserveX, reserveY, space, type, width, _base, _base1;
    Matrix.__super__.make.apply(this, arguments);
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    width = this._get('matrix.width');
    height = this._get('matrix.height');
    history = this._get('matrix.history');
    reserveX = this._get('matrix.bufferWidth');
    reserveY = this._get('matrix.bufferHeight');
    channels = this._get('data.channels');
    items = this._get('data.items');
    dims = this.spec = {
      channels: channels,
      items: items,
      width: width,
      height: height
    };
    this.items = dims.items;
    this.channels = dims.channels;
    data = this._get('data.data');
    dims = Util.Data.getDimensions(data, dims);
    space = this.space;
    space.width = Math.max(reserveX, dims.width || 1);
    space.height = Math.max(reserveY, dims.height || 1);
    space.history = history;
    if ((_base = this.spec).width == null) {
      _base.width = 1;
    }
    if ((_base1 = this.spec).height == null) {
      _base1.height = 1;
    }
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
  };

  Matrix.prototype.unmake = function() {
    Matrix.__super__.unmake.apply(this, arguments);
    if (this.buffer) {
      this.buffer.dispose();
      return this.buffer = this.spec = null;
    }
  };

  Matrix.prototype.change = function(changed, touched, init) {
    var height, width;
    if (touched['texture'] || changed['matrix.history'] || changed['data.channels'] || changed['data.items'] || changed['matrix.bufferWidth'] || changed['matrix.bufferHeight']) {
      return this.rebuild();
    }
    if (!this.buffer) {
      return;
    }
    if (changed['matrix.width']) {
      width = this._get('matrix.width');
      if (width > this.space.width) {
        return this.rebuild();
      }
    }
    if (changed['matrix.height']) {
      height = this._get('matrix.height');
      if (height > this.space.height) {
        return this.rebuild();
      }
    }
    if (changed['data.expression'] || changed['data.data'] || init) {
      return this.buffer.setCallback(this.emitter());
    }
  };

  Matrix.prototype.callback = function(callback) {
    return callback;
  };

  Matrix.prototype.update = function() {
    var data, dims, filled, h, length, space, used, w, _w;
    if (!this.buffer) {
      return;
    }
    if (!(!this.filled || this._get('data.live'))) {
      return;
    }
    data = this._get('data.data');
    space = this.space;
    used = this.used;
    filled = this.buffer.getFilled();
    w = used.width;
    h = used.height;
    if (data != null) {
      dims = Util.Data.getDimensions(data, this.spec);
      if (dims.width > space.width || dims.height > space.height) {
        this.rebuild();
      }
      used.width = dims.width;
      used.height = dims.height;
      this.buffer.setActive(used.width, used.height);
      this.buffer.callback.rebind(data);
      this.buffer.update();
    } else {
      this.buffer.setActive(this.spec.width, this.spec.height);
      length = this.buffer.update();
      used.width = _w = this.spec.width;
      used.height = Math.ceil(length / _w);
      if (used.height === 1) {
        used.width = length;
      }
    }
    this.filled = true;
    if (used.width !== w || used.height !== h || filled !== this.buffer.getFilled()) {
      return this.trigger({
        type: 'source.resize'
      });
    }
  };

  return Matrix;

})(Data);

module.exports = Matrix;


},{"../../../util":148,"./data":52}],55:[function(require,module,exports){
var Text, Util, Voxel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Voxel = require('./voxel');

Util = require('../../../util');

Text = (function(_super) {
  __extends(Text, _super);

  function Text() {
    return Text.__super__.constructor.apply(this, arguments);
  }

  Text.traits = ['node', 'data', 'source', 'texture', 'voxel', 'text'];

  Text.defaults = {
    channels: 4,
    minFilter: 'linear',
    magFilter: 'linear'
  };

  Text.prototype.init = function() {
    Text.__super__.init.apply(this, arguments);
    return this.atlas = null;
  };

  Text.prototype.textIsSDF = function() {
    return this._get('text.expand') > 0;
  };

  Text.prototype.textHeight = function() {
    return this._get('text.detail');
  };

  Text.prototype.textShader = function(shader) {
    return this.atlas.shader(shader);
  };

  Text.prototype.make = function() {
    var detail, expand, font, magFilter, minFilter, style, type;
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    font = this._get('text.font');
    style = this._get('text.style');
    detail = this._get('text.detail');
    expand = this._get('text.expand');
    this.atlas = this._renderables.make('textAtlas', {
      font: font,
      size: detail,
      style: style,
      outline: expand,
      minFilter: minFilter,
      magFilter: magFilter,
      type: type
    });
    return Text.__super__.make.apply(this, arguments);
  };

  Text.prototype.unmake = function() {
    Text.__super__.unmake.apply(this, arguments);
    if (this.atlas) {
      this.atlas.dispose();
      return this.atlas = null;
    }
  };

  Text.prototype.update = function() {
    this.atlas.begin();
    Text.__super__.update.apply(this, arguments);
    return this.atlas.end();
  };

  Text.prototype.change = function(changed, touched, init) {
    if (touched['text']) {
      return this.rebuild();
    }
    return Text.__super__.change.call(this, changed, touched, init);
  };

  Text.prototype.callback = function(callback) {
    var atlas, buffer, text;
    text = '';
    atlas = this.atlas;
    buffer = function(t) {
      return text = t;
    };
    return function(emit, i, j, k, l) {
      callback(buffer, i, j, k, l);
      return atlas.map(text, emit);
    };
  };

  return Text;

})(Voxel);

module.exports = Text;


},{"../../../util":148,"./voxel":57}],56:[function(require,module,exports){
var Util, Volume, Voxel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Voxel = require('./voxel');

Util = require('../../../util');

Volume = (function(_super) {
  __extends(Volume, _super);

  function Volume() {
    return Volume.__super__.constructor.apply(this, arguments);
  }

  Volume.traits = ['node', 'data', 'source', 'texture', 'voxel', 'span:x', 'span:y', 'span:z', 'volume', 'sampler:x', 'sampler:y', 'sampler:z'];

  Volume.prototype.callback = function(callback) {
    var aX, aY, aZ, bX, bY, bZ, centeredX, centeredY, centeredZ, depth, dimensions, height, inverseX, inverseY, inverseZ, rangeX, rangeY, rangeZ, spanX, spanY, spanZ, width;
    dimensions = this._get('volume.axes');
    width = this._get('voxel.width');
    height = this._get('voxel.height');
    depth = this._get('voxel.depth');
    centeredX = this._get('x.sampler.centered');
    centeredY = this._get('y.sampler.centered');
    centeredZ = this._get('z.sampler.centered');
    rangeX = this._helpers.span.get('x.', dimensions[0]);
    rangeY = this._helpers.span.get('y.', dimensions[1]);
    rangeZ = this._helpers.span.get('z.', dimensions[2]);
    aX = rangeX.x;
    aY = rangeY.x;
    aZ = rangeZ.x;
    spanX = rangeX.y - rangeX.x;
    spanY = rangeY.y - rangeY.x;
    spanZ = rangeZ.y - rangeZ.x;
    if (centeredX) {
      inverseX = 1 / Math.max(1, width);
      aX += spanX * inverseX / 2;
    } else {
      inverseX = 1 / Math.max(1, width - 1);
    }
    if (centeredY) {
      inverseY = 1 / Math.max(1, height);
      aY += spanY * inverseY / 2;
    } else {
      inverseY = 1 / Math.max(1, height - 1);
    }
    if (centeredZ) {
      inverseZ = 1 / Math.max(1, depth);
      aZ += spanZ * inverseZ / 2;
    } else {
      inverseZ = 1 / Math.max(1, depth - 1);
    }
    bX = spanX * inverseX;
    bY = spanY * inverseY;
    bZ = spanZ * inverseZ;
    return function(emit, i, j, k) {
      var x, y, z;
      x = aX + bX * i;
      y = aY + bY * j;
      z = aZ + bZ * k;
      return callback(emit, x, y, z, i, j, k);
    };
  };

  Volume.prototype.make = function() {
    Volume.__super__.make.apply(this, arguments);
    return this._helpers.span.make();
  };

  Volume.prototype.unmake = function() {
    Volume.__super__.unmake.apply(this, arguments);
    return this._helpers.span.unmake();
  };

  return Volume;

})(Voxel);

module.exports = Volume;


},{"../../../util":148,"./voxel":57}],57:[function(require,module,exports){
var Data, Util, Voxel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Data = require('./data');

Util = require('../../../util');

Voxel = (function(_super) {
  __extends(Voxel, _super);

  function Voxel() {
    return Voxel.__super__.constructor.apply(this, arguments);
  }

  Voxel.traits = ['node', 'data', 'source', 'texture', 'voxel'];

  Voxel.prototype.init = function() {
    this.buffer = this.spec = null;
    this.filled = false;
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
    return Voxel.__super__.init.apply(this, arguments);
  };

  Voxel.prototype.sourceShader = function(shader) {
    return this.buffer.shader(shader);
  };

  Voxel.prototype.getDimensions = function() {
    var space;
    space = this.space;
    return {
      items: this.items,
      width: space.width,
      height: space.height,
      depth: space.depth
    };
  };

  Voxel.prototype.getActive = function() {
    var used;
    used = this.used;
    return {
      items: this.items,
      width: used.width,
      height: used.height,
      depth: used.depth * this.buffer.getFilled()
    };
  };

  Voxel.prototype.make = function() {
    var channels, data, depth, dims, height, items, magFilter, minFilter, reserveX, reserveY, reserveZ, space, type, width, _base, _base1, _base2;
    Voxel.__super__.make.apply(this, arguments);
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    width = this._get('voxel.width');
    height = this._get('voxel.height');
    depth = this._get('voxel.depth');
    reserveX = this._get('voxel.bufferWidth');
    reserveY = this._get('voxel.bufferHeight');
    reserveZ = this._get('voxel.bufferDepth');
    channels = this._get('data.channels');
    items = this._get('data.items');
    dims = this.spec = {
      channels: channels,
      items: items,
      width: width,
      height: height,
      depth: depth
    };
    this.items = dims.items;
    this.channels = dims.channels;
    data = this._get('data.data');
    dims = Util.Data.getDimensions(data, dims);
    space = this.space;
    space.width = Math.max(reserveX, dims.width || 1);
    space.height = Math.max(reserveY, dims.height || 1);
    space.depth = Math.max(reserveZ, dims.depth || 1);
    if ((_base = this.spec).width == null) {
      _base.width = 1;
    }
    if ((_base1 = this.spec).height == null) {
      _base1.height = 1;
    }
    if ((_base2 = this.spec).depth == null) {
      _base2.depth = 1;
    }
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
  };

  Voxel.prototype.unmake = function() {
    Voxel.__super__.unmake.apply(this, arguments);
    if (this.buffer) {
      this.buffer.dispose();
      return this.buffer = this.spec = null;
    }
  };

  Voxel.prototype.change = function(changed, touched, init) {
    var depth, height, width;
    if (touched['texture'] || changed['data.channels'] || changed['data.items'] || changed['voxel.bufferWidth'] || changed['voxel.bufferHeight'] || changed['voxel.bufferDepth']) {
      return this.rebuild();
    }
    if (!this.buffer) {
      return;
    }
    if (changed['voxel.width']) {
      width = this._get('voxel.width');
      if (width > this.space.width) {
        return this.rebuild();
      }
    }
    if (changed['voxel.height']) {
      height = this._get('voxel.height');
      if (height > this.space.height) {
        return this.rebuild();
      }
    }
    if (changed['voxel.depth']) {
      depth = this._get('voxel.depth');
      if (depth > this.space.depth) {
        return this.rebuild();
      }
    }
    if (changed['data.expression'] || changed['data.data'] || init) {
      return this.buffer.setCallback(this.emitter());
    }
  };

  Voxel.prototype.callback = function(callback) {
    return callback;
  };

  Voxel.prototype.update = function() {
    var d, data, dims, filled, h, length, space, used, w, _h, _w;
    if (!this.buffer) {
      return;
    }
    if (!(!this.filled || this._get('data.live'))) {
      return;
    }
    data = this._get('data.data');
    space = this.space;
    used = this.used;
    filled = this.buffer.getFilled();
    w = used.width;
    h = used.height;
    d = used.depth;
    if (data != null) {
      dims = Util.Data.getDimensions(data, this.spec);
      if (dims.width > space.width || dims.height > space.height || dims.depth > space.depth) {
        this.rebuild();
      }
      used.width = dims.width;
      used.height = dims.height;
      used.depth = dims.depth;
      this.buffer.setActive(used.width, used.height, used.depth);
      this.buffer.callback.rebind(data);
      this.buffer.update();
    } else {
      this.buffer.setActive(this.spec.width, this.spec.height, this.spec.depth);
      length = this.buffer.update();
      used.width = _w = this.spec.width;
      used.height = _h = this.spec.height;
      used.depth = Math.ceil(length / _w / _h);
      if (used.depth === 1) {
        used.height = Math.ceil(length / _w);
        if (used.height === 1) {
          used.width = length;
        }
      }
    }
    this.filled = true;
    if (used.width !== w || used.height !== h || used.depth !== d || filled !== this.buffer.getFilled()) {
      return this.trigger({
        type: 'source.resize'
      });
    }
  };

  return Voxel;

})(Data);

module.exports = Voxel;


},{"../../../util":148,"./data":52}],58:[function(require,module,exports){
var Axis, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Axis = (function(_super) {
  __extends(Axis, _super);

  Axis.traits = ['node', 'object', 'style', 'line', 'axis', 'span', 'interval', 'arrow', 'position'];

  function Axis(node, context, helpers) {
    Axis.__super__.constructor.call(this, node, context, helpers);
    this.axisPosition = this.axisStep = this.resolution = this.line = this.arrows = null;
  }

  Axis.prototype.make = function() {
    var arrowUniforms, detail, end, lineUniforms, position, positionUniforms, samples, start, stroke, styleUniforms, uniforms, unitUniforms;
    positionUniforms = {
      axisPosition: this._attributes.make(this._types.vec4()),
      axisStep: this._attributes.make(this._types.vec4())
    };
    this.axisPosition = positionUniforms.axisPosition.value;
    this.axisStep = positionUniforms.axisStep.value;
    position = this._shaders.shader();
    position.pipe('axis.position', positionUniforms);
    position = this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    arrowUniforms = this._helpers.arrow.uniforms();
    unitUniforms = this._inherit('unit').getUnitUniforms();
    detail = this._get('axis.detail');
    samples = detail + 1;
    this.resolution = 1 / detail;
    start = this._get('arrow.start');
    end = this._get('arrow.end');
    stroke = this._get('line.stroke');
    uniforms = Util.JS.merge(arrowUniforms, lineUniforms, styleUniforms, unitUniforms);
    this.line = this._renderables.make('line', {
      uniforms: uniforms,
      samples: samples,
      position: position,
      clip: start || end,
      stroke: stroke
    });
    this.arrows = [];
    if (start) {
      this.arrows.push(this._renderables.make('arrow', {
        uniforms: uniforms,
        flip: true,
        samples: samples,
        position: position
      }));
    }
    if (end) {
      this.arrows.push(this._renderables.make('arrow', {
        uniforms: uniforms,
        samples: samples,
        position: position
      }));
    }
    this._helpers.object.make(this.arrows.concat([this.line]));
    return this._helpers.span.make();
  };

  Axis.prototype.unmake = function() {
    this._helpers.object.unmake();
    return this._helpers.span.unmake();
  };

  Axis.prototype.change = function(changed, touched, init) {
    var dimension, max, min, range;
    if (changed['axis.detail'] || changed['line.stroke']) {
      return this.rebuild();
    }
    if (touched['interval'] || touched['span'] || touched['view'] || init) {
      dimension = this._get('interval.axis');
      range = this._helpers.span.get('', dimension);
      min = range.x;
      max = range.y;
      Util.Axis.setDimension(this.axisPosition, dimension).multiplyScalar(min);
      return Util.Axis.setDimension(this.axisStep, dimension).multiplyScalar((max - min) * this.resolution);
    }
  };

  return Axis;

})(Primitive);

module.exports = Axis;


},{"../../../util":148,"../../primitive":43}],59:[function(require,module,exports){
var Face, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Face = (function(_super) {
  __extends(Face, _super);

  Face.traits = ['node', 'object', 'style', 'line', 'mesh', 'face', 'geometry', 'position', 'bind'];

  function Face(node, context, helpers) {
    Face.__super__.constructor.call(this, node, context, helpers);
    this.face = null;
  }

  Face.prototype.resize = function() {
    var depth, dims, height, items, width;
    if (this.bind.points == null) {
      return;
    }
    dims = this.bind.points.getActive();
    items = dims.items, width = dims.width, height = dims.height, depth = dims.depth;
    if (this.face) {
      this.face.geometry.clip(width, height, depth, items);
    }
    if (this.line) {
      return this.line.geometry.clip(items, width, height, depth);
    }
  };

  Face.prototype.make = function() {
    var color, depth, dims, height, items, lineUniforms, objects, outline, position, shaded, solid, styleUniforms, swizzle, uniforms, width;
    this._helpers.bind.make([
      {
        to: 'geometry.points',
        trait: 'source'
      }, {
        to: 'geometry.colors',
        trait: 'source'
      }
    ]);
    if (this.bind.points == null) {
      return;
    }
    position = this.bind.points.sourceShader(this._shaders.shader());
    position = this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    dims = this.bind.points.getDimensions();
    items = dims.items, width = dims.width, height = dims.height, depth = dims.depth;
    outline = this._get('face.outline');
    shaded = this._get('mesh.shaded');
    solid = this._get('mesh.solid');
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }
    objects = [];
    if (outline) {
      swizzle = this._shaders.shader();
      swizzle.pipe(Util.GLSL.swizzleVec4('yzwx'));
      swizzle.pipe(position);
      uniforms = Util.JS.merge(lineUniforms, styleUniforms);
      this.line = this._renderables.make('line', {
        uniforms: uniforms,
        samples: items,
        ribbons: width,
        strips: height,
        layers: depth,
        position: swizzle,
        color: color
      });
      objects.push(this.line);
    }
    if (solid) {
      uniforms = Util.JS.merge(styleUniforms, {});
      this.face = this._renderables.make('face', {
        uniforms: uniforms,
        width: width,
        height: height,
        depth: depth,
        items: items,
        position: position,
        color: color,
        shaded: shaded
      });
      objects.push(this.face);
    }
    return this._helpers.object.make(objects);
  };

  Face.prototype.made = function() {
    return this.resize();
  };

  Face.prototype.unmake = function() {
    this._helpers.bind.unmake();
    this._helpers.object.unmake();
    return this.face = this.line = null;
  };

  Face.prototype.change = function(changed, touched, init) {
    if (changed['geometry.points']) {
      return this.rebuild();
    }
  };

  return Face;

})(Primitive);

module.exports = Face;


},{"../../../util":148,"../../primitive":43}],60:[function(require,module,exports){
var Grid, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Grid = (function(_super) {
  __extends(Grid, _super);

  Grid.traits = ['node', 'object', 'style', 'line', 'grid', 'area', 'position', 'axis:x', 'axis:y', 'scale:x', 'scale:y', 'span:x', 'span:y'];

  function Grid(node, context, helpers) {
    Grid.__super__.constructor.call(this, node, context, helpers);
    this.axes = null;
  }

  Grid.prototype.make = function() {
    var axis, first, lines, second, stroke;
    axis = (function(_this) {
      return function(first, second) {
        var buffer, detail, line, lineUniforms, p, position, positionUniforms, resolution, samples, strips, styleUniforms, uniforms, unitUniforms, values;
        detail = _this._get(first + 'axis.detail');
        samples = detail + 1;
        resolution = 1 / detail;
        strips = _this._helpers.scale.divide(second);
        buffer = _this._renderables.make('dataBuffer', {
          width: strips,
          channels: 1
        });
        positionUniforms = {
          gridPosition: _this._attributes.make(_this._types.vec4()),
          gridStep: _this._attributes.make(_this._types.vec4()),
          gridAxis: _this._attributes.make(_this._types.vec4())
        };
        values = {
          gridPosition: positionUniforms.gridPosition.value,
          gridStep: positionUniforms.gridStep.value,
          gridAxis: positionUniforms.gridAxis.value
        };
        p = position = _this._shaders.shader();
        p.require(buffer.shader(_this._shaders.shader(), 2));
        p.pipe('grid.position', positionUniforms);
        position = _this._helpers.position.pipeline(p);
        styleUniforms = _this._helpers.style.uniforms();
        lineUniforms = _this._helpers.line.uniforms();
        unitUniforms = _this._inherit('unit').getUnitUniforms();
        uniforms = Util.JS.merge(lineUniforms, styleUniforms, unitUniforms);
        line = _this._renderables.make('line', {
          uniforms: uniforms,
          samples: samples,
          strips: strips,
          position: position,
          stroke: stroke
        });
        return {
          first: first,
          second: second,
          resolution: resolution,
          samples: samples,
          line: line,
          buffer: buffer,
          values: values
        };
      };
    })(this);
    first = this._get('grid.first');
    second = this._get('grid.second');
    stroke = this._get('line.stroke');
    this.axes = [];
    first && this.axes.push(axis('x.', 'y.'));
    second && this.axes.push(axis('y.', 'x.'));
    lines = (function() {
      var _i, _len, _ref, _results;
      _ref = this.axes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        axis = _ref[_i];
        _results.push(axis.line);
      }
      return _results;
    }).call(this);
    this._helpers.object.make(lines);
    return this._helpers.span.make();
  };

  Grid.prototype.unmake = function() {
    var axis, _i, _len, _ref;
    this._helpers.object.unmake();
    this._helpers.span.unmake();
    _ref = this.axes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      axis = _ref[_i];
      axis.buffer.dispose();
    }
    return this.axes = null;
  };

  Grid.prototype.change = function(changed, touched, init) {
    var axes, axis, first, range1, range2, second;
    if (changed['x.axis.detail'] || changed['y.axis.detail'] || changed['grid.first'] || changed['grid.second'] || changed['line.stroke']) {
      return this.rebuild();
    }
    axis = (function(_this) {
      return function(x, y, range1, range2, axis) {
        var buffer, first, line, max, min, n, resolution, samples, second, ticks, values;
        first = axis.first, second = axis.second, resolution = axis.resolution, samples = axis.samples, line = axis.line, buffer = axis.buffer, values = axis.values;
        min = range1.x;
        max = range1.y;
        Util.Axis.setDimension(values.gridPosition, x).multiplyScalar(min);
        Util.Axis.setDimension(values.gridStep, x).multiplyScalar((max - min) * resolution);
        min = range2.x;
        max = range2.y;
        ticks = _this._helpers.scale.generate(second, buffer, min, max);
        Util.Axis.setDimension(values.gridAxis, y);
        n = ticks.length;
        return line.geometry.clip(samples, n, 1, 1);
      };
    })(this);
    if (touched['x'] || touched['y'] || touched['area'] || touched['grid'] || touched['view'] || init) {
      axes = this._get('area.axes');
      range1 = this._helpers.span.get('x.', axes[0]);
      range2 = this._helpers.span.get('y.', axes[1]);
      first = this._get('grid.first');
      second = this._get('grid.second');
      if (first) {
        axis(axes[0], axes[1], range1, range2, this.axes[0]);
      }
      if (second) {
        return axis(axes[1], axes[0], range2, range1, this.axes[+first]);
      }
    }
  };

  return Grid;

})(Primitive);

module.exports = Grid;


},{"../../../util":148,"../../primitive":43}],61:[function(require,module,exports){
var Label, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Label = (function(_super) {
  __extends(Label, _super);

  function Label() {
    return Label.__super__.constructor.apply(this, arguments);
  }

  Label.traits = ['node', 'bind', 'object', 'style', 'label', 'attach', 'geometry', 'position'];

  Label.defaults = {
    color: '#000000'
  };

  Label.prototype.make = function() {
    var color, combine, depth, height, items, labelUniforms, map, pointDims, position, snippet, sprite, styleUniforms, textDims, textIsSDF, uniforms, unitUniforms, width;
    Label.__super__.make.apply(this, arguments);
    this._helpers.bind.make([
      {
        to: 'label.text',
        trait: 'text'
      }, {
        to: 'geometry.points',
        trait: 'source'
      }, {
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
    pointDims = this.bind.points.getDimensions();
    textDims = this.bind.text.getDimensions();
    textIsSDF = this.bind.text.textIsSDF();
    items = Math.min(pointDims.items, textDims.items);
    width = Math.min(pointDims.width, textDims.width);
    height = Math.min(pointDims.height, textDims.height);
    depth = Math.min(pointDims.depth, textDims.depth);
    position = this.bind.points.sourceShader(this._shaders.shader());
    position = this._helpers.position.pipeline(position);
    sprite = this.bind.text.sourceShader(this._shaders.shader());
    map = this.bind.text.textShader(this._shaders.shader());
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
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }
    styleUniforms = this._helpers.style.uniforms();
    unitUniforms = this._inherit('unit').getUnitUniforms();
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
      color: color
    });
    return this._helpers.object.make([this.sprite]);
  };

  Label.prototype.unmake = function() {
    this._helpers.bind.unmake();
    this._helpers.object.unmake();
    return this.sprite = null;
  };

  Label.prototype.resize = function() {
    var depth, height, items, pointDims, textDims, width;
    pointDims = this.bind.points.getActive();
    textDims = this.bind.text.getActive();
    items = Math.min(pointDims.items, textDims.items);
    width = Math.min(pointDims.width, textDims.width);
    height = Math.min(pointDims.height, textDims.height);
    depth = Math.min(pointDims.depth, textDims.depth);
    return this.sprite.geometry.clip(width, height, depth, items);
  };

  Label.prototype.change = function(changed, touched, init) {
    var expand, height, outline, scale, size;
    if (touched['geometry'] || changed['label.text']) {
      return this.rebuild();
    }
    if (this.bind.points == null) {
      return;
    }
    size = this._get('label.size');
    outline = this._get('label.outline');
    expand = this._get('label.expand');
    height = this.bind.text.textHeight();
    scale = size / height;
    this.outlineExpand.value = expand / scale * 16 / 255;
    this.outlineStep.value = outline / scale * 16 / 255;
    return this.spriteScale.value = scale;
  };

  return Label;

})(Primitive);

module.exports = Label;


},{"../../../util":148,"../../primitive":43}],62:[function(require,module,exports){
var Line, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Line = (function(_super) {
  __extends(Line, _super);

  Line.traits = ['node', 'object', 'style', 'line', 'arrow', 'geometry', 'position', 'bind', 'attach'];

  function Line(node, context, helpers) {
    Line.__super__.constructor.call(this, node, context, helpers);
    this.line = this.arrows = null;
  }

  Line.prototype.resize = function() {
    var arrow, dims, layers, ribbons, samples, strips, _i, _len, _ref, _results;
    if (this.bind.points == null) {
      return;
    }
    dims = this.bind.points.getActive();
    samples = dims.width;
    strips = dims.height;
    ribbons = dims.depth;
    layers = dims.items;
    this.line.geometry.clip(samples, strips, ribbons, layers);
    _ref = this.arrows;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arrow = _ref[_i];
      _results.push(arrow.geometry.clip(samples, strips, ribbons, layers));
    }
    return _results;
  };

  Line.prototype.make = function() {
    var arrowUniforms, color, dims, end, layers, lineUniforms, position, ribbons, samples, start, strips, stroke, styleUniforms, uniforms, unitUniforms;
    this._helpers.bind.make([
      {
        to: 'geometry.points',
        trait: 'source'
      }, {
        to: 'geometry.colors',
        trait: 'source'
      }
    ]);
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    arrowUniforms = this._helpers.arrow.uniforms();
    unitUniforms = this._inherit('unit').getUnitUniforms();
    start = this._get('arrow.start');
    end = this._get('arrow.end');
    stroke = this._get('line.stroke');
    dims = this.bind.points.getDimensions();
    samples = dims.width;
    strips = dims.height;
    ribbons = dims.depth;
    layers = dims.items;
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }
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
      stroke: stroke
    });
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
        color: color
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
        color: color
      }));
    }
    return this._helpers.object.make(this.arrows.concat([this.line]));
  };

  Line.prototype.made = function() {
    return this.resize();
  };

  Line.prototype.unmake = function() {
    this._helpers.bind.unmake();
    this._helpers.object.unmake();
    return this.line = this.arrows = null;
  };

  Line.prototype.change = function(changed, touched, init) {
    if (changed['geometry.points'] || changed['line.stroke'] || changed['arrow.start'] || changed['arrow.end']) {
      return this.rebuild();
    }
  };

  return Line;

})(Primitive);

module.exports = Line;


},{"../../../util":148,"../../primitive":43}],63:[function(require,module,exports){
var Point, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Point = (function(_super) {
  __extends(Point, _super);

  Point.traits = ['node', 'object', 'style', 'point', 'geometry', 'position', 'bind'];

  function Point(node, context, helpers) {
    Point.__super__.constructor.call(this, node, context, helpers);
    this.point = null;
  }

  Point.prototype.resize = function() {
    var depth, dims, height, items, width;
    if (this.bind.points == null) {
      return;
    }
    dims = this.bind.points.getActive();
    items = dims.items, width = dims.width, height = dims.height, depth = dims.depth;
    return this.point.geometry.clip(width, height, depth, items);
  };

  Point.prototype.make = function() {
    var color, depth, dims, fill, height, items, pointUniforms, position, shape, styleUniforms, uniforms, unitUniforms, width;
    this._helpers.bind.make([
      {
        to: 'geometry.points',
        trait: 'source'
      }, {
        to: 'geometry.colors',
        trait: 'source'
      }
    ]);
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    dims = this.bind.points.getDimensions();
    items = dims.items, width = dims.width, height = dims.height, depth = dims.depth;
    styleUniforms = this._helpers.style.uniforms();
    pointUniforms = this._helpers.point.uniforms();
    unitUniforms = this._inherit('unit').getUnitUniforms();
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }
    shape = this._get('point.shape');
    fill = this._get('point.fill');
    uniforms = Util.JS.merge(unitUniforms, pointUniforms, styleUniforms);
    this.point = this._renderables.make('point', {
      uniforms: uniforms,
      width: width,
      height: height,
      depth: depth,
      items: items,
      position: position,
      color: color,
      shape: shape,
      fill: fill
    });
    return this._helpers.object.make([this.point]);
  };

  Point.prototype.made = function() {
    return this.resize();
  };

  Point.prototype.unmake = function() {
    this._helpers.bind.unmake();
    this._helpers.object.unmake();
    return this.point = null;
  };

  Point.prototype.change = function(changed, touched, init) {
    if (changed['geometry.points'] || changed['point.shape'] || changed['point.fill']) {
      return this.rebuild();
    }
  };

  return Point;

})(Primitive);

module.exports = Point;


},{"../../../util":148,"../../primitive":43}],64:[function(require,module,exports){
var Primitive, Strip, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Strip = (function(_super) {
  __extends(Strip, _super);

  Strip.traits = ['node', 'object', 'style', 'line', 'mesh', 'geometry', 'position', 'bind'];

  function Strip(node, context, helpers) {
    Strip.__super__.constructor.call(this, node, context, helpers);
    this.strip = null;
  }

  Strip.prototype.resize = function() {
    var depth, dims, height, items, width;
    if (this.bind.points == null) {
      return;
    }
    dims = this.bind.points.getActive();
    items = dims.items, width = dims.width, height = dims.height, depth = dims.depth;
    return this.strip.geometry.clip(width, height, depth, items);
  };

  Strip.prototype.make = function() {
    var color, depth, dims, height, items, lineUniforms, position, styleUniforms, uniforms, width;
    this._helpers.bind.make([
      {
        to: 'geometry.points',
        trait: 'source'
      }, {
        to: 'geometry.colors',
        trait: 'source'
      }
    ]);
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    dims = this.bind.points.getDimensions();
    items = dims.items, width = dims.width, height = dims.height, depth = dims.depth;
    if (this.bind.colors) {
      color = this._shaders.shader();
      color = this.bind.colors.sourceShader(color);
    }

    /*
    uniforms = Util.JS.merge arrowUniforms, lineUniforms, styleUniforms
    @line = @_renderables.make 'line',
              uniforms: uniforms
              samples:  samples
              ribbons:  ribbons
              strips:   strips
              layers:   layers
              position: position
              color:    color
              clip:     start or end
     */
    uniforms = Util.JS.merge(styleUniforms, {});
    this.strip = this._renderables.make('strip', {
      uniforms: uniforms,
      width: width,
      height: height,
      depth: depth,
      items: items,
      position: position,
      color: color
    });
    return this._helpers.object.make([this.strip]);
  };

  Strip.prototype.made = function() {
    return this.resize();
  };

  Strip.prototype.unmake = function() {
    this._helpers.bind.unmake();
    this._helpers.object.unmake();
    return this.strip = null;
  };

  Strip.prototype.change = function(changed, touched, init) {
    if (changed['geometry.points']) {
      return this.rebuild();
    }
  };

  return Strip;

})(Primitive);

module.exports = Strip;


},{"../../../util":148,"../../primitive":43}],65:[function(require,module,exports){
var Primitive, Surface, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Surface = (function(_super) {
  __extends(Surface, _super);

  Surface.traits = ['node', 'object', 'style', 'line', 'mesh', 'geometry', 'surface', 'position', 'grid', 'bind'];

  function Surface(node, context, helpers) {
    Surface.__super__.constructor.call(this, node, context, helpers);
    this.line1 = this.line2 = this.surface = null;
  }

  Surface.prototype.resize = function() {
    var depth, dims, height, layers, width;
    if (this.bind.points == null) {
      return;
    }
    dims = this.bind.points.getActive();
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    layers = dims.items;
    if (this.surface) {
      this.surface.geometry.clip(width, height, depth, layers);
    }
    if (this.line1) {
      this.line1.geometry.clip(width, height, depth, layers);
    }
    if (this.line2) {
      return this.line2.geometry.clip(height, width, depth, layers);
    }
  };

  Surface.prototype.make = function() {
    var color, depth, dims, first, height, layers, lineUniforms, objects, position, second, shaded, solid, stroke, styleUniforms, surfaceUniforms, uniforms, unitUniforms, width, wireUniforms, wireXY, wireYX, zUnits;
    this._helpers.bind.make([
      {
        to: 'geometry.points',
        trait: 'source'
      }, {
        to: 'geometry.colors',
        trait: 'source'
      }
    ]);
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    wireXY = position;
    wireYX = this._shaders.shader();
    wireYX.pipe(Util.GLSL.swizzleVec4('yxzw'));
    wireYX.pipe(position);
    styleUniforms = this._helpers.style.uniforms();
    wireUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    surfaceUniforms = this._helpers.surface.uniforms();
    unitUniforms = this._inherit('unit').getUnitUniforms();
    wireUniforms.styleColor = this._attributes.make(this._types.color());
    wireUniforms.styleZBias = this._attributes.make(this._types.number());
    this.wireColor = wireUniforms.styleColor.value;
    this.wireZBias = wireUniforms.styleZBias;
    this.wireScratch = new THREE.Color;
    dims = this.bind.points.getDimensions();
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    layers = dims.items;
    shaded = this._get('mesh.shaded');
    solid = this._get('mesh.solid');
    first = this._get('grid.first');
    second = this._get('grid.second');
    stroke = this._get('line.stroke');
    objects = [];
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }
    uniforms = Util.JS.merge(unitUniforms, lineUniforms, styleUniforms, wireUniforms);
    zUnits = first || second ? -50 : 0;
    if (first) {
      this.line1 = this._renderables.make('line', {
        uniforms: uniforms,
        samples: width,
        strips: height,
        ribbons: depth,
        layers: layers,
        position: wireXY,
        color: color,
        zUnits: -zUnits,
        stroke: stroke
      });
      objects.push(this.line1);
    }
    if (second) {
      this.line2 = this._renderables.make('line', {
        uniforms: uniforms,
        samples: height,
        strips: width,
        ribbons: depth,
        layers: layers,
        position: wireYX,
        color: color,
        zUnits: -zUnits,
        stroke: stroke
      });
      objects.push(this.line2);
    }
    if (solid) {
      uniforms = Util.JS.merge(unitUniforms, surfaceUniforms, styleUniforms);
      this.surface = this._renderables.make('surface', {
        uniforms: uniforms,
        width: width,
        height: height,
        surfaces: depth,
        layers: layers,
        position: position,
        color: color,
        shaded: shaded,
        zUnits: zUnits,
        stroke: stroke
      });
      objects.push(this.surface);
    }
    return this._helpers.object.make(objects);
  };

  Surface.prototype.made = function() {
    return this.resize();
  };

  Surface.prototype.unmake = function() {
    this._helpers.bind.unmake();
    this._helpers.object.unmake();
    return this.line1 = this.line2 = this.surface = null;
  };

  Surface.prototype.change = function(changed, touched, init) {
    var c, color, solid;
    if (changed['geometry.points'] || changed['mesh.shaded'] || changed['mesh.solid'] || changed['line.stroke'] || touched['grid']) {
      return this.rebuild();
    }
    if (changed['style.color'] || changed['mesh.solid'] || init) {
      solid = this._get('mesh.solid');
      color = this._get('style.color');
      this.wireZBias.value = this._get('style.zBias') + 5;
      this.wireColor.copy(color);
      if (solid) {
        c = this.wireScratch;
        c.setRGB(color.x, color.y, color.z);
        c.convertGammaToLinear().multiplyScalar(.75).convertLinearToGamma();
        this.wireColor.x = c.r;
        this.wireColor.y = c.g;
        return this.wireColor.z = c.b;
      }
    }
  };

  return Surface;

})(Primitive);

module.exports = Surface;


},{"../../../util":148,"../../primitive":43}],66:[function(require,module,exports){
var Primitive, Ticks, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Ticks = (function(_super) {
  __extends(Ticks, _super);

  Ticks.traits = ['node', 'object', 'style', 'line', 'ticks', 'interval', 'span', 'scale', 'position'];

  function Ticks(node, context, helpers) {
    Ticks.__super__.constructor.call(this, node, context, helpers);
    this.tickAxis = this.tickNormal = this.resolution = this.line = null;
  }

  Ticks.prototype.make = function() {
    var lineUniforms, p, position, positionUniforms, samples, styleUniforms, uniforms, unitUniforms;
    this.resolution = samples = this._helpers.scale.divide('');
    this.buffer = this._renderables.make('dataBuffer', {
      width: samples,
      channels: 1
    });
    positionUniforms = {
      tickSize: this.node.attributes['ticks.size'],
      tickAxis: this._attributes.make(this._types.vec4()),
      tickNormal: this._attributes.make(this._types.vec4())
    };
    this.tickAxis = positionUniforms.tickAxis.value;
    this.tickNormal = positionUniforms.tickNormal.value;
    p = position = this._shaders.shader();
    p.require(this._helpers.position.pipeline(this._shaders.shader()));
    p.require(this.buffer.shader(this._shaders.shader(), 1));
    p.pipe('ticks.position', positionUniforms);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    unitUniforms = this._inherit('unit').getUnitUniforms();
    uniforms = Util.JS.merge(lineUniforms, styleUniforms, unitUniforms);
    this.line = this._renderables.make('line', {
      uniforms: uniforms,
      samples: 2,
      strips: samples,
      position: position
    });
    this._helpers.object.make([this.line]);
    return this._helpers.span.make();
  };

  Ticks.prototype.unmake = function() {
    this.line = this.tickAxis = this.tickNormal = null;
    this._helpers.object.unmake();
    return this._helpers.span.unmake();
  };

  Ticks.prototype.change = function(changed, touched, init) {
    var dimension, max, min, n, range, ticks;
    if (changed['scale.divide']) {
      return this.rebuild();
    }
    if (touched['view'] || touched['interval'] || touched['span'] || touched['scale'] || init) {
      dimension = this._get('interval.axis');
      range = this._helpers.span.get('', dimension);
      min = range.x;
      max = range.y;
      ticks = this._helpers.scale.generate('', this.buffer, min, max);
      Util.Axis.setDimension(this.tickAxis, dimension);
      Util.Axis.setDimensionNormal(this.tickNormal, dimension);
      n = ticks.length;
      return this.line.geometry.clip(2, n);
    }
  };

  return Ticks;

})(Primitive);

module.exports = Ticks;


},{"../../../util":148,"../../primitive":43}],67:[function(require,module,exports){
var Primitive, Util, Vector,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Vector = (function(_super) {
  __extends(Vector, _super);

  Vector.traits = ['node', 'object', 'style', 'line', 'arrow', 'geometry', 'position', 'bind'];

  function Vector(node, context, helpers) {
    Vector.__super__.constructor.call(this, node, context, helpers);
    this.line = this.arrows = null;
  }

  Vector.prototype.resize = function() {
    var arrow, dims, layers, ribbons, samples, strips, _i, _len, _ref, _results;
    if (this.bind.points == null) {
      return;
    }
    dims = this.bind.points.getActive();
    samples = dims.items;
    strips = dims.width;
    ribbons = dims.height;
    layers = dims.depth;
    this.line.geometry.clip(samples, strips, ribbons, layers);
    _ref = this.arrows;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arrow = _ref[_i];
      _results.push(arrow.geometry.clip(samples, strips, ribbons, layers));
    }
    return _results;
  };

  Vector.prototype.make = function() {
    var arrowUniforms, color, dims, end, layers, lineUniforms, position, ribbons, samples, start, strips, stroke, styleUniforms, swizzle, uniforms, unitUniforms;
    this._helpers.bind.make([
      {
        to: 'geometry.points',
        trait: 'source'
      }, {
        to: 'geometry.colors',
        trait: 'source'
      }
    ]);
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    swizzle = Util.GLSL.swizzleVec4('yzwx');
    position.pipe(swizzle);
    this.bind.points.sourceShader(position);
    this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    arrowUniforms = this._helpers.arrow.uniforms();
    unitUniforms = this._inherit('unit').getUnitUniforms();
    start = this._get('arrow.start');
    end = this._get('arrow.end');
    stroke = this._get('line.stroke');
    dims = this.bind.points.getDimensions();
    samples = dims.items;
    strips = dims.width;
    ribbons = dims.height;
    layers = dims.depth;
    if (this.bind.colors) {
      color = this._shaders.shader();
      color.pipe(swizzle);
      this.bind.colors.sourceShader(color);
    }
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
      stroke: stroke
    });
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
        color: color
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
        color: color
      }));
    }
    return this._helpers.object.make(this.arrows.concat([this.line]));
  };

  Vector.prototype.made = function() {
    return this.resize();
  };

  Vector.prototype.unmake = function() {
    this._helpers.bind.unmake();
    this._helpers.object.unmake();
    return this.line = this.arrows = null;
  };

  Vector.prototype.change = function(changed, touched, init) {
    if (changed['geometry.points'] || changed['arrow.start'] || changed['arrow.end']) {
      return this.rebuild();
    }
  };

  return Vector;

})(Primitive);

module.exports = Vector;


},{"../../../util":148,"../../primitive":43}],68:[function(require,module,exports){
var Util, View, helpers,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Util = require('../../util');

View = require('./view/view');


/*

This is the general dumping ground for trait behavior.

Helpers are auto-attached to primitives that have the matching trait
 */

helpers = {
  bind: {
    make: function(slots) {
      var name, selector, slot, source, start, to, trait, unique, _i, _len;
      this.bind = {};
      this.bound = [];
      for (_i = 0, _len = slots.length; _i < _len; _i++) {
        slot = slots[_i];
        to = slot.to, trait = slot.trait;
        name = to.split(/\./g).pop();
        selector = this._get(to);
        source = null;
        if (selector != null) {
          start = this;
          unique = false;
          while (!unique) {
            start = source = this._attach(selector, trait, this.rebuild, this, start);
            unique = (source == null) || this.bound.indexOf(source) < 0;
          }
        }
        if (source != null) {
          this._listen(source, 'source.resize', this.resize);
          this._listen(source, 'source.rebuild', this.rebuild);
          this.bound.push(source);
        }
        this.bind[name] = source;
      }
      return null;
    },
    unmake: function() {
      if (!this.bind) {
        return;
      }
      return delete this.bind;
    }
  },
  span: {
    make: function() {
      this.spanView = this._inherit('view');
      return this._listen('view', 'view.range', this.refresh);
    },
    unmake: function() {
      return delete this.spanView;
    },
    get: (function() {
      var def;
      def = new THREE.Vector2(-1, 1);
      return function(prefix, dimension) {
        var range, _ref, _ref1;
        range = this._get(prefix + 'span.range');
        if (range != null) {
          return range;
        }
        return (_ref = (_ref1 = this.spanView) != null ? _ref1.axis(dimension) : void 0) != null ? _ref : def;
      };
    })()
  },
  scale: {
    divide: function(prefix) {
      var divide;
      divide = this._get(prefix + 'scale.divide');
      return Math.round(divide * 2.5);
    },
    generate: function(prefix, buffer, min, max) {
      var base, divide, mode, ticks, unit;
      divide = this._get(prefix + 'scale.divide');
      unit = this._get(prefix + 'scale.unit');
      base = this._get(prefix + 'scale.base');
      mode = this._get(prefix + 'scale.mode');
      ticks = Util.Ticks.make(mode, min, max, divide, unit, base, true, 0);
      buffer.copy(ticks);
      return ticks;
    }
  },
  style: {
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
    uniforms: function() {
      var end, size, space, start, style;
      start = this._get('arrow.start');
      end = this._get('arrow.end');
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
    uniforms: function() {
      return {
        pointSize: this.node.attributes['point.size'],
        pointDepth: this.node.attributes['point.depth']
      };
    }
  },
  line: {
    uniforms: function() {
      return {
        lineWidth: this.node.attributes['line.width'],
        lineDepth: this.node.attributes['line.depth']
      };
    }
  },
  surface: {
    uniforms: function() {
      return {};
    }
  },
  position: {
    pipeline: function(shader) {
      var pass, _i, _ref;
      for (pass = _i = 0; _i <= 3; pass = ++_i) {
        shader = (_ref = this._inherit('transform')) != null ? _ref.transform(shader, pass) : void 0;
      }
      return shader;
    }
  },
  object: {
    make: function(objects) {
      var blending, e, hasStyle, last, object, objectParent, objectScene, onChange, onVisible, opacity, visible, zFactor, zOrder, zTest, zUnits, zWrite, _i, _len, _ref;
      this.objects = objects != null ? objects : [];
      objectParent = this._inherit('object');
      objectScene = this._inherit('scene');
      e = {
        type: 'object.visible'
      };
      opacity = blending = zOrder = zUnits = zFactor = null;
      hasStyle = __indexOf.call(this.traits, 'style') >= 0;
      opacity = 1;
      visible = this._get('object.visible');
      blending = THREE.NormalBlending;
      zWrite = true;
      zTest = true;
      if (hasStyle) {
        opacity = this._get('style.opacity');
        blending = this._get('style.blending');
        zOrder = this._get('style.zOrder');
        zWrite = this._get('style.zWrite');
        zTest = this._get('style.zTest');
      }
      onChange = (function(_this) {
        return function(event) {
          var changed, refresh;
          changed = event.changed;
          refresh = null;
          if (changed['object.visible']) {
            refresh = visible = _this._get('object.visible');
          }
          if (changed['style.opacity']) {
            refresh = opacity = _this._get('style.opacity');
          }
          if (changed['style.blending']) {
            refresh = blending = _this._get('style.blending');
          }
          if (changed['style.zWrite']) {
            refresh = zWrite = _this._get('style.zWrite');
          }
          if (changed['style.zTest']) {
            refresh = zTest = _this._get('style.zTest');
          }
          if (refresh != null) {
            return onVisible();
          }
        };
      })(this);
      last = null;
      onVisible = (function(_this) {
        return function() {
          var active, o, order, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
          order = zOrder != null ? zOrder : _this.node.order;
          active = visible;
          if (active) {
            active = opacity > 0;
          }
          if (active && (objectParent != null)) {
            active = objectParent.isVisible;
          }
          if (active) {
            if (hasStyle) {
              _ref = _this.objects;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                o = _ref[_i];
                o.show(opacity < 1, blending, order);
                o.depth(zWrite, zTest);
              }
            } else {
              _ref1 = _this.objects;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                o = _ref1[_j];
                o.show(true, blending, order);
              }
            }
          } else {
            _ref2 = _this.objects;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              o = _ref2[_k];
              o.hide();
            }
          }
          _this.isVisible = active;
          if (last !== active) {
            _this.trigger(e);
          }
          return last = active;
        };
      })(this);
      this._listen(this.node, 'change:object', onChange);
      this._listen(this.node, 'change:style', onChange);
      this._listen(this.node, 'reindex', onVisible);
      if (objectParent) {
        this._listen(objectParent, 'object.visible', onVisible);
      }
      _ref = this.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        objectScene.adopt(object);
      }
      return onVisible();
    },
    unmake: function(dispose) {
      var object, objectScene, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (dispose == null) {
        dispose = true;
      }
      if (!this.objects) {
        return;
      }
      objectScene = this._inherit('scene');
      _ref = this.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        objectScene.unadopt(object);
      }
      if (dispose) {
        _ref1 = this.objects;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          object = _ref1[_j];
          _results.push(object.dispose());
        }
        return _results;
      }
    }
  },
  unit: {
    make: function() {
      var bottom, handler, pixelRatio, pixelUnit, renderAspect, renderHeight, renderOdd, renderScale, renderScaleInv, renderWidth, root, top, viewHeight, viewWidth, worldUnit, π;
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
        renderOdd: renderOdd = this._attributes.make(this._types.vec2())
      };
      top = new THREE.Vector3();
      bottom = new THREE.Vector3();
      handler = (function(_this) {
        return function() {
          var camera, dpr, fov, fovtan, isAbsolute, m, map, measure, pixel, rscale, scale, size, world;
          if ((size = typeof root !== "undefined" && root !== null ? root.getSize() : void 0) == null) {
            return;
          }
          π = Math.PI;
          scale = _this._get('unit.scale');
          map = _this._get('unit.map');
          fov = _this._get('unit.fov');
          isAbsolute = scale === null;
          measure = 1;
          if ((camera = typeof root !== "undefined" && root !== null ? root.getCamera() : void 0)) {
            m = camera.projectionMatrix;
            top.set(0, -.5, 1).applyProjection(m);
            bottom.set(0, .5, 1).applyProjection(m);
            top.sub(bottom);
            measure = top.y;
          }
          dpr = size.renderHeight / size.viewHeight;
          fovtan = fov != null ? Math.tan(fov * π / 360) / measure : 1;
          pixel = isAbsolute ? dpr : size.renderHeight / scale * fovtan;
          rscale = size.renderHeight * measure / 2;
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
          return renderOdd.value.set(size.renderWidth % 2, size.renderHeight % 2).multiplyScalar(.5);
        };
      })(this);
      root = this.is('root') ? this : this._inherit('root');
      this._listen(root, 'root.update', handler);
      return handler();
    },
    unmake: function() {
      return delete this.unitUniforms;
    },
    get: function() {
      var k, u, v, _ref;
      u = {};
      _ref = this.unitUniforms;
      for (k in _ref) {
        v = _ref[k];
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
  var h, key, method, methods, trait, _i, _len;
  h = {};
  for (_i = 0, _len = traits.length; _i < _len; _i++) {
    trait = traits[_i];
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


},{"../../util":148,"./view/view":96}],69:[function(require,module,exports){
var Model;

Model = require('../../model');

exports.Classes = require('./classes');

exports.Types = require('./types');

exports.Traits = require('./traits');

exports.Helpers = require('./helpers');


},{"../../model":33,"./classes":49,"./helpers":68,"./traits":84,"./types":89}],70:[function(require,module,exports){
var Join, Operator, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Util = require('../../../util');


/*
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  overlap:     Types.int(0)
 */

Join = (function(_super) {
  __extends(Join, _super);

  function Join() {
    return Join.__super__.constructor.apply(this, arguments);
  }

  Join.traits = ['node', 'bind', 'operator', 'source', 'index', 'join'];

  Join.prototype.indexShader = function(shader) {
    shader.pipe(this.operator);
    return Join.__super__.indexShader.call(this, shader);
  };

  Join.prototype.sourceShader = function(shader) {
    shader.pipe(this.operator);
    return Join.__super__.sourceShader.call(this, shader);
  };

  Join.prototype.getDimensions = function() {
    return this._resample(this.bind.source.getDimensions());
  };

  Join.prototype.getActive = function() {
    return this._resample(this.bind.source.getActive());
  };

  Join.prototype._resample = function(dims) {
    var axis, dim, i, index, labels, length, mapped, order, out, overlap, product, set, stride, _i, _len, _ref;
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
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = mapped.length; _i < _len; _i++) {
        dim = mapped[_i];
        _results.push(dims[dim]);
      }
      return _results;
    })();
    product = ((_ref = set[index + 1]) != null ? _ref : 1) * stride;
    set.splice(index, 2, product);
    set = set.slice(0, 3);
    set.push(1);
    out = {};
    for (i = _i = 0, _len = mapped.length; _i < _len; i = ++_i) {
      dim = mapped[i];
      out[dim] = set[i];
    }
    return out;
  };

  Join.prototype.make = function() {
    var axis, dims, index, labels, length, major, order, overlap, permute, rest, stride, transform, uniforms;
    Join.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    order = this._get('join.order');
    axis = this._get('join.axis');
    overlap = this._get('join.overlap');

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
    permute = order.join('');
    index = permute.indexOf(axis);
    rest = permute.replace(axis, '00').substring(0, 4);
    labels = [null, 'width', 'height', 'depth', 'items'];
    major = labels[axis];
    dims = this.bind.source.getDimensions();
    length = dims[major];
    overlap = Math.min(length - 1, overlap);
    stride = length - overlap;
    uniforms = {
      joinStride: this._attributes.make(this._types.number(stride)),
      joinStrideInv: this._attributes.make(this._types.number(1 / stride))
    };
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
  };

  Join.prototype.unmake = function() {
    return Join.__super__.unmake.apply(this, arguments);
  };

  Join.prototype.change = function(changed, touched, init) {
    if (touched['join'] || touched['operator']) {
      return this.rebuild();
    }
  };

  return Join;

})(Operator);

module.exports = Join;


},{"../../../util":148,"./operator":73}],71:[function(require,module,exports){
var Lerp, Operator,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Lerp = (function(_super) {
  __extends(Lerp, _super);

  function Lerp() {
    return Lerp.__super__.constructor.apply(this, arguments);
  }

  Lerp.traits = ['node', 'bind', 'operator', 'source', 'index', 'lerp', 'sampler'];

  Lerp.prototype.indexShader = function(shader) {
    return shader.pipe(this.indexer);
  };

  Lerp.prototype.sourceShader = function(shader) {
    return shader.pipe(this.operator);
  };

  Lerp.prototype.getDimensions = function() {
    return this._resample(this.bind.source.getDimensions());
  };

  Lerp.prototype.getActive = function() {
    return this._resample(this.bind.source.getActive());
  };

  Lerp.prototype._resample = function(dims) {
    var r;
    r = this.resample;
    return {
      items: Math.floor(r.items * dims.items),
      width: Math.floor(r.width * dims.width),
      height: Math.floor(r.height * dims.height),
      depth: Math.floor(r.depth * dims.depth)
    };
  };

  Lerp.prototype.make = function() {
    var centered, dims, id, indexer, key, ratio, size, transform, uniforms, _ref;
    Lerp.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    transform = this.bind.source.sourceShader(this._shaders.shader());
    indexer = this._shaders.shader();
    centered = this._get('sampler.centered');
    this.resample = {};
    dims = this.bind.source.getDimensions();
    for (key in dims) {
      id = "lerp." + key;
      size = (_ref = this._get(id)) != null ? _ref : dims[key];
      this.resample[key] = size / dims[key];
      if (size !== dims[key]) {
        ratio = centered ? dims[key] / Math.max(1, size) : (dims[key] - 1) / Math.max(1, size - 1);
        uniforms = {
          sampleRatio: this._attributes.make(this._types.number(ratio))
        };
        transform = this._shaders.shader().require(transform);
        transform.pipe(id, uniforms);
      }
    }
    this.operator = transform;
    return this.indexer = indexer;
  };

  Lerp.prototype.unmake = function() {
    return Lerp.__super__.unmake.apply(this, arguments);
  };

  Lerp.prototype.change = function(changed, touched, init) {
    if (touched['lerp'] || touched['operator']) {
      return this.rebuild();
    }
  };

  return Lerp;

})(Operator);

module.exports = Lerp;


},{"./operator":73}],72:[function(require,module,exports){
var Memo, Operator, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Util = require('../../../util');

Memo = (function(_super) {
  __extends(Memo, _super);

  function Memo() {
    return Memo.__super__.constructor.apply(this, arguments);
  }

  Memo.traits = ['node', 'bind', 'operator', 'source', 'index', 'texture', 'memo'];

  Memo.prototype.sourceShader = function(shader) {
    return this.memo.shaderAbsolute(shader, 1);
  };

  Memo.prototype.make = function() {
    var depth, dims, height, items, magFilter, minFilter, operator, type, width;
    Memo.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    this._listen('root', 'root.update', this.update);
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    dims = this.bind.source.getDimensions();
    items = dims.items, width = dims.width, height = dims.height, depth = dims.depth;
    this.memo = this._renderables.make('memo', {
      items: items,
      width: width,
      height: height,
      depth: depth,
      minFilter: minFilter,
      magFilter: magFilter,
      type: type
    });
    operator = this._shaders.shader();
    this.bind.source.sourceShader(operator);
    this.compose = this._renderables.make('memoScreen', {
      map: operator,
      items: items,
      width: width,
      height: height,
      depth: depth
    });
    return this.memo.adopt(this.compose);
  };

  Memo.prototype.unmake = function() {
    Memo.__super__.unmake.apply(this, arguments);
    if (this.bind.source != null) {
      this.memo.unadopt(this.compose);
      this.memo.dispose();
      return this.memo = this.compose = null;
    }
  };

  Memo.prototype.update = function() {
    var _ref;
    return (_ref = this.memo) != null ? _ref.render() : void 0;
  };

  Memo.prototype.resize = function() {
    var depth, dims, height, width;
    if (this.bind.source == null) {
      return;
    }
    dims = this.bind.source.getActive();
    width = dims.width, height = dims.height, depth = dims.depth;
    this.compose.cover(width, height, depth);
    return Memo.__super__.resize.apply(this, arguments);
  };

  Memo.prototype.change = function(changed, touched, init) {
    if (touched['texture'] || touched['operator']) {
      return this.rebuild();
    }
  };

  return Memo;

})(Operator);

module.exports = Memo;


},{"../../../util":148,"./operator":73}],73:[function(require,module,exports){
var Operator, Source,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Source = require('../base/source');

Operator = (function(_super) {
  __extends(Operator, _super);

  function Operator() {
    return Operator.__super__.constructor.apply(this, arguments);
  }

  Operator.traits = ['node', 'bind', 'operator', 'source', 'index'];

  Operator.prototype.indexShader = function(shader) {
    var _ref;
    return (_ref = this.bind.source) != null ? typeof _ref.indexShader === "function" ? _ref.indexShader(shader) : void 0 : void 0;
  };

  Operator.prototype.sourceShader = function(shader) {
    var _ref;
    return (_ref = this.bind.source) != null ? typeof _ref.sourceShader === "function" ? _ref.sourceShader(shader) : void 0 : void 0;
  };

  Operator.prototype.getDimensions = function() {
    return this.bind.source.getDimensions();
  };

  Operator.prototype.getActive = function() {
    return this.bind.source.getActive();
  };

  Operator.prototype.make = function() {
    Operator.__super__.make.apply(this, arguments);
    return this._helpers.bind.make([
      {
        to: 'operator.source',
        trait: 'source'
      }
    ]);
  };

  Operator.prototype.made = function() {
    this.resize();
    return Operator.__super__.made.apply(this, arguments);
  };

  Operator.prototype.unmake = function() {
    return this._helpers.bind.unmake();
  };

  Operator.prototype.resize = function(rebuild) {
    return this.trigger({
      type: 'source.resize'
    });
  };

  return Operator;

})(Source);

module.exports = Operator;


},{"../base/source":47}],74:[function(require,module,exports){
var Operator, Repeat,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Repeat = (function(_super) {
  __extends(Repeat, _super);

  function Repeat() {
    return Repeat.__super__.constructor.apply(this, arguments);
  }

  Repeat.traits = ['node', 'bind', 'operator', 'source', 'index', 'repeat'];

  Repeat.prototype.indexShader = function(shader) {
    shader.pipe(this.operator);
    return Repeat.__super__.indexShader.call(this, shader);
  };

  Repeat.prototype.sourceShader = function(shader) {
    shader.pipe(this.operator);
    return Repeat.__super__.sourceShader.call(this, shader);
  };

  Repeat.prototype.getDimensions = function() {
    return this._resample(this.bind.source.getDimensions());
  };

  Repeat.prototype.getActive = function() {
    return this._resample(this.bind.source.getActive());
  };

  Repeat.prototype._resample = function(dims) {
    var r;
    r = this.resample;
    return {
      items: r.items * dims.items,
      width: r.width * dims.width,
      height: r.height * dims.height,
      depth: r.depth * dims.depth
    };
  };

  Repeat.prototype.make = function() {
    var transform, uniforms;
    Repeat.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    this.resample = {};
    uniforms = {
      repeatModulus: this._attributes.make(this._types.vec4())
    };
    this.repeatModulus = uniforms.repeatModulus;
    transform = this._shaders.shader();
    transform.pipe('repeat.position', uniforms);
    return this.operator = transform;
  };

  Repeat.prototype.unmake = function() {
    return Repeat.__super__.unmake.apply(this, arguments);
  };

  Repeat.prototype.resize = function() {
    var dims;
    if (this.bind.source != null) {
      dims = this.bind.source.getActive();
      this.repeatModulus.value.set(dims.width, dims.height, dims.depth, dims.items);
    }
    return Repeat.__super__.resize.apply(this, arguments);
  };

  Repeat.prototype.change = function(changed, touched, init) {
    var id, key, _i, _len, _ref, _results;
    if (touched['operator'] || touched['repeat']) {
      return this.rebuild();
    }
    if (init) {
      _ref = ['items', 'width', 'height', 'depth'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        id = "repeat." + key;
        _results.push(this.resample[key] = this._get(id));
      }
      return _results;
    }
  };

  return Repeat;

})(Operator);

module.exports = Repeat;


},{"./operator":73}],75:[function(require,module,exports){
var Operator, Resample, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Util = require('../../../util');

Resample = (function(_super) {
  __extends(Resample, _super);

  function Resample() {
    return Resample.__super__.constructor.apply(this, arguments);
  }

  Resample.traits = ['node', 'bind', 'operator', 'source', 'index', 'resample', 'sampler'];

  Resample.prototype.indexShader = function(shader) {
    shader.pipe(this.indexer);
    return Resample.__super__.indexShader.call(this, shader);
  };

  Resample.prototype.sourceShader = function(shader) {
    return shader.pipe(this.operator);
  };

  Resample.prototype.getDimensions = function() {
    return this._resample(this.bind.source.getDimensions());
  };

  Resample.prototype.getActive = function() {
    return this._resample(this.bind.source.getActive());
  };

  Resample.prototype._resample = function(dims) {
    var r;
    r = this.resampled;
    if (this.scaled) {
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
    return dims;
  };

  Resample.prototype.make = function() {
    var centered, depth, dimensions, height, indexer, indices, items, map, operator, relativeMap, relativeScale, scale, shader, shifted, type, uniforms, width;
    Resample.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    indices = this._get('resample.indices');
    dimensions = this._get('resample.channels');
    shader = this._get('resample.shader');
    map = this._get('resample.map');
    scale = this._get('resample.scale');
    items = this._get('resample.items');
    width = this._get('resample.width');
    height = this._get('resample.height');
    depth = this._get('resample.depth');
    centered = this._get('sampler.centered');
    relativeMap = map === this.node.attributes['resample.map']["enum"].relative;
    relativeScale = scale === this.node.attributes['resample.scale']["enum"].relative;
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
    operator = this._shaders.shader();
    indexer = this._shaders.shader();
    type = [null, this._types.number, this._types.vec2, this._types.vec3, this._types.vec4][indices];
    uniforms = {
      dataSize: this._attributes.make(type(0, 0, 0, 0)),
      dataResolution: this._attributes.make(type(0, 0, 0, 0)),
      dataOffset: this._attributes.make(this._types.vec2(.5, .5)),
      targetSize: this._attributes.make(type(0, 0, 0, 0)),
      targetResolution: this._attributes.make(type(0, 0, 0, 0)),
      targetOffset: this._attributes.make(this._types.vec2(.5, .5)),
      resampleFactor: this._attributes.make(type(0, 0, 0, 0))
    };
    this.dataResolution = uniforms.dataResolution;
    this.dataSize = uniforms.dataSize;
    this.targetResolution = uniforms.targetResolution;
    this.targetSize = uniforms.targetSize;
    this.resampleFactor = uniforms.resampleFactor;
    shifted = false;
    if (relativeMap) {
      if ((items != null) || (width != null) || (height != null) || (depth != null)) {
        if (centered) {
          shifted = true;
          operator.pipe(Util.GLSL.binaryOperator('vec4', '+', '.5'));
          indexer.pipe(Util.GLSL.binaryOperator('vec4', '+', '.5'));
        }
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
      if (centered && !shifted) {
        operator.pipe(Util.GLSL.binaryOperator(indices, '+', '.5'));
      }
      operator.callback();
      if (shifted) {
        operator.pipe(Util.GLSL.binaryOperator(indices, '-', '.5'));
      }
      if (indices !== 4) {
        operator.pipe(Util.GLSL.extendVec(indices, 4));
      }
      operator.pipe(this.bind.source.sourceShader(this._shaders.shader()));
      if (dimensions !== 4) {
        operator.pipe(Util.GLSL.truncateVec(4, dimensions));
      }
      operator.join();
      operator.pipe(shader, uniforms);
      if (dimensions !== 4) {
        operator.pipe(Util.GLSL.extendVec(dimensions, 4));
      }
    } else {
      if (shifted) {
        operator.pipe(Util.GLSL.binaryOperator('vec4', '-', '.5'));
      }
      operator.pipe(this.bind.source.sourceShader(this._shaders.shader()));
    }
    this.operator = operator;
    this.indexer = indexer;
    this.indices = indices;
    this.centered = centered;
    return this.scaled = relativeScale;
  };

  Resample.prototype.unmake = function() {
    Resample.__super__.unmake.apply(this, arguments);
    return this.operator = null;
  };

  Resample.prototype.resize = function() {
    var dims, rd, rh, ri, rw, target;
    if (this.bind.source == null) {
      return;
    }
    dims = this.bind.source.getActive();
    target = this.getActive();
    if (this.centered) {
      ri = dims.items / Math.max(1, target.items);
      rw = dims.width / Math.max(1, target.width);
      rh = dims.height / Math.max(1, target.height);
      rd = dims.depth / Math.max(1, target.depth);
    } else {
      ri = (dims.items - 1) / Math.max(1, target.items - 1);
      rw = (dims.width - 1) / Math.max(1, target.width - 1);
      rh = (dims.height - 1) / Math.max(1, target.height - 1);
      rd = (dims.depth - 1) / Math.max(1, target.depth - 1);
    }
    if (this.indices === 1) {
      this.dataResolution.value = 1 / dims.width;
      this.targetResolution.value = 1 / target.width;
      this.dataSize.value = dims.width;
      this.targetSize.value = target.width;
      this.resampleFactor.value = rw;
    } else {
      this.dataResolution.value.set(1 / dims.width, 1 / dims.height, 1 / dims.depth, 1 / dims.items);
      this.targetResolution.value.set(1 / target.width, 1 / target.height, 1 / target.depth, 1 / target.items);
      this.dataSize.value.set(dims.width, dims.height, dims.depth, dims.items);
      this.targetSize.value.set(target.width, target.height, target.depth, target.items);
      this.resampleFactor.value.set(rw, rh, rd, ri);
    }
    return Resample.__super__.resize.apply(this, arguments);
  };

  Resample.prototype.change = function(changed, touched, init) {
    if (touched['operator'] || touched['resample'] || touched['sampler']) {
      return this.rebuild();
    }
  };

  return Resample;

})(Operator);

module.exports = Resample;


},{"../../../util":148,"./operator":73}],76:[function(require,module,exports){
var Operator, Split, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Util = require('../../../util');


/*
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  length:      Types.int(1)
  overlap:     Types.int(0)
 */

Split = (function(_super) {
  __extends(Split, _super);

  function Split() {
    return Split.__super__.constructor.apply(this, arguments);
  }

  Split.traits = ['node', 'bind', 'operator', 'source', 'index', 'split'];

  Split.prototype.indexShader = function(shader) {
    shader.pipe(this.operator);
    return Split.__super__.indexShader.call(this, shader);
  };

  Split.prototype.sourceShader = function(shader) {
    shader.pipe(this.operator);
    return Split.__super__.sourceShader.call(this, shader);
  };

  Split.prototype.getDimensions = function() {
    return this._resample(this.bind.source.getDimensions());
  };

  Split.prototype.getActive = function() {
    return this._resample(this.bind.source.getActive());
  };

  Split.prototype._resample = function(dims) {
    var axis, dim, i, index, labels, length, mapped, order, out, overlap, remain, set, stride, _i, _len;
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
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = mapped.length; _i < _len; _i++) {
        dim = mapped[_i];
        _results.push(dims[dim]);
      }
      return _results;
    })();
    remain = Math.floor((set[index] - overlap) / stride);
    set.splice(index, 1, length, remain);
    set = set.slice(0, 4);
    out = {};
    for (i = _i = 0, _len = mapped.length; _i < _len; i = ++_i) {
      dim = mapped[i];
      out[dim] = set[i];
    }
    return out;
  };

  Split.prototype.make = function() {
    var axis, index, length, order, overlap, permute, rest, split, stride, transform, uniforms, _ref;
    Split.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    order = this._get('split.order');
    axis = this._get('split.axis');
    overlap = this._get('split.overlap');
    length = this._get('split.length');

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
    permute = order.join('');
    index = permute.indexOf(axis);
    split = permute[index] + ((_ref = permute[index + 1]) != null ? _ref : 0);
    rest = permute.replace(split[1], '').replace(split[0], '0') + '0';
    overlap = Math.min(length - 1, overlap);
    stride = length - overlap;
    uniforms = {
      splitStride: this._attributes.make(this._types.number(stride))
    };
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
  };

  Split.prototype.unmake = function() {
    return Split.__super__.unmake.apply(this, arguments);
  };

  Split.prototype.change = function(changed, touched, init) {
    if (changed['split.axis'] || changed['split.order'] || touched['operator']) {
      return this.rebuild();
    }
  };

  return Split;

})(Operator);

module.exports = Split;


},{"../../../util":148,"./operator":73}],77:[function(require,module,exports){
var Operator, Spread,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Spread = (function(_super) {
  __extends(Spread, _super);

  function Spread() {
    return Spread.__super__.constructor.apply(this, arguments);
  }

  Spread.traits = ['node', 'bind', 'operator', 'source', 'index', 'spread'];

  Spread.prototype.sourceShader = function(shader) {
    return shader.pipe(this.operator);
  };

  Spread.prototype.make = function() {
    var transform, uniforms;
    Spread.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    uniforms = {
      spreadMatrix: this._attributes.make(this._types.mat4()),
      spreadOffset: this._attributes.make(this._types.vec4())
    };
    this.spreadMatrix = uniforms.spreadMatrix;
    this.spreadOffset = uniforms.spreadOffset;
    transform = this._shaders.shader();
    transform.require(this.bind.source.sourceShader(this._shaders.shader()));
    transform.pipe('spread.position', uniforms);
    return this.operator = transform;
  };

  Spread.prototype.unmake = function() {
    return Spread.__super__.unmake.apply(this, arguments);
  };

  Spread.prototype.resize = function() {
    var align, anchor, d, dims, els, factor, i, k, key, matrix, offset, order, spread, v, _i, _j, _len, _ref, _ref1;
    if (this.bind.source) {
      dims = this.bind.source.getActive();
      matrix = this.spreadMatrix.value;
      els = matrix.elements;
      order = ['width', 'height', 'depth', 'items'];
      align = ['alignWidth', 'alignHeight', 'alignDepth', 'alignItems'];
      for (i = _i = 0, _len = order.length; _i < _len; i = ++_i) {
        key = order[i];
        spread = this._get("spread." + key);
        anchor = this._get("spread." + align[i]);
        factor = 0;
        if (spread != null) {
          d = (_ref = dims[key]) != null ? _ref : 1;
          offset = -(d - 1) * (.5 - anchor * .5);
        } else {
          offset = 0;
        }
        for (k = _j = 0; _j < 4; k = ++_j) {
          v = (_ref1 = spread != null ? spread.getComponent(k) : void 0) != null ? _ref1 : 0;
          els[i * 4 + k] = v * 2;
        }
        this.spreadOffset.value.setComponent(i, offset);
      }
    }
    return Spread.__super__.resize.apply(this, arguments);
  };

  Spread.prototype.change = function(changed, touched, init) {
    if (touched['operator']) {
      return this.rebuild();
    }
  };

  return Spread;

})(Operator);

module.exports = Spread;


},{"./operator":73}],78:[function(require,module,exports){
var Operator, Swizzle, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Util = require('../../../util');

Swizzle = (function(_super) {
  __extends(Swizzle, _super);

  function Swizzle() {
    return Swizzle.__super__.constructor.apply(this, arguments);
  }

  Swizzle.traits = ['node', 'bind', 'operator', 'source', 'index', 'swizzle'];

  Swizzle.prototype.sourceShader = function(shader) {
    shader = Swizzle.__super__.sourceShader.call(this, shader);
    if (this.swizzler) {
      shader.pipe(this.swizzler);
    }
    return shader;
  };

  Swizzle.prototype.make = function() {
    var order;
    Swizzle.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    order = this._get('swizzle.order');
    if (order.join() !== '1234') {
      return this.swizzler = Util.GLSL.swizzleVec4(order, 4);
    }
  };

  Swizzle.prototype.unmake = function() {
    Swizzle.__super__.unmake.apply(this, arguments);
    return this.swizzler = null;
  };

  Swizzle.prototype.change = function(changed, touched, init) {
    if (touched['swizzle'] || touched['operator']) {
      return this.rebuild();
    }
  };

  return Swizzle;

})(Operator);

module.exports = Swizzle;


},{"../../../util":148,"./operator":73}],79:[function(require,module,exports){
var Operator, Transpose, Util, labels,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Operator = require('./operator');

Util = require('../../../util');

labels = {
  1: 'width',
  2: 'height',
  3: 'depth',
  4: 'items'
};

Transpose = (function(_super) {
  __extends(Transpose, _super);

  function Transpose() {
    return Transpose.__super__.constructor.apply(this, arguments);
  }

  Transpose.traits = ['node', 'bind', 'operator', 'source', 'index', 'transpose'];

  Transpose.prototype.indexShader = function(shader) {
    if (this.swizzler) {
      shader.pipe(this.swizzler);
    }
    return Transpose.__super__.indexShader.call(this, shader);
  };

  Transpose.prototype.sourceShader = function(shader) {
    if (this.swizzler) {
      shader.pipe(this.swizzler);
    }
    return Transpose.__super__.sourceShader.call(this, shader);
  };

  Transpose.prototype.getDimensions = function() {
    return this._remap(this.transpose, this.bind.source.getDimensions());
  };

  Transpose.prototype.getActive = function() {
    return this._remap(this.transpose, this.bind.source.getActive());
  };

  Transpose.prototype._remap = function(transpose, dims) {
    var dst, i, out, src, _i, _ref;
    out = {};
    for (i = _i = 0; _i <= 3; i = ++_i) {
      dst = labels[i + 1];
      src = labels[transpose[i]];
      out[dst] = (_ref = dims[src]) != null ? _ref : 1;
    }
    return out;
  };

  Transpose.prototype.make = function() {
    var order;
    Transpose.__super__.make.apply(this, arguments);
    if (this.bind.source == null) {
      return;
    }
    order = this._get('transpose.order');
    if (order.join() !== '1234') {
      this.swizzler = Util.GLSL.invertSwizzleVec4(order);
    }
    this.transpose = order;
    return this.trigger({
      type: 'source.rebuild'
    });
  };

  Transpose.prototype.unmake = function() {
    Transpose.__super__.unmake.apply(this, arguments);
    return this.swizzler = null;
  };

  Transpose.prototype.change = function(changed, touched, init) {
    if (touched['transpose'] || touched['operator']) {
      return this.rebuild();
    }
  };

  return Transpose;

})(Operator);

module.exports = Transpose;


},{"../../../util":148,"./operator":73}],80:[function(require,module,exports){
var DOM, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

DOM = (function(_super) {
  __extends(DOM, _super);

  function DOM() {
    return DOM.__super__.constructor.apply(this, arguments);
  }

  DOM.traits = ['node', 'bind', 'object', 'overlay', 'dom', 'attach', 'position'];

  DOM.prototype.init = function() {
    this.emitter = this.root = null;
    return this.active = {};
  };

  DOM.prototype.make = function() {
    var depth, height, htmlDims, indexer, items, pointDims, position, projection, width;
    DOM.__super__.make.apply(this, arguments);
    this._helpers.bind.make([
      {
        to: 'dom.html',
        trait: 'html'
      }, {
        to: 'dom.points',
        trait: 'source'
      }
    ]);
    if (!((this.bind.points != null) && (this.bind.html != null))) {
      return;
    }
    this.root = this._inherit('root');
    this._listen('root', 'root.update', this.update);
    this._listen('root', 'root.post', this.post);
    pointDims = this.bind.points.getDimensions();
    htmlDims = this.bind.html.getDimensions();
    items = Math.min(pointDims.items, htmlDims.items);
    width = Math.min(pointDims.width, htmlDims.width);
    height = Math.min(pointDims.height, htmlDims.height);
    depth = Math.min(pointDims.depth, htmlDims.depth);
    position = this.bind.points.sourceShader(this._shaders.shader());
    position = this._helpers.position.pipeline(position);
    projection = this._shaders.shader({
      globals: ['projectionMatrix']
    });
    projection.pipe('project.readback');
    position.pipe(projection);
    indexer = this._shaders.shader();
    this.readback = this._renderables.make('readback', {
      map: position,
      indexer: indexer,
      items: items,
      width: width,
      height: height,
      depth: depth,
      channels: 4
    });
    this.dom = this._overlays.make('dom');
    this.dom.hint(items * width * height * depth * 2);
    return this.readback.setCallback(this.emitter = this.callback(this.bind.html.nodes()));

    /*
    dbg = @_renderables.make 'debug',
            map: @readback.readFloat()
     *            map: @readback.readByte()
    scene = @_inherit 'scene'
    scene.adopt dbg
     */
  };

  DOM.prototype.unmake = function() {
    if (this.readback != null) {
      this.readback.dispose();
      this.dom.dispose();
      this.readback = this.dom = null;
      this.root = null;
      this.emitter = null;
      this.active = {};
    }
    return this._helpers.bind.unmake();
  };

  DOM.prototype.update = function() {
    var _ref;
    if (this.readback == null) {
      return;
    }
    return this.readback.update((_ref = this.root) != null ? _ref.getCamera() : void 0);
  };

  DOM.prototype.post = function() {
    if (this.readback == null) {
      return;
    }
    this.readback.post();
    if (this._get('object.visible')) {
      this.readback.iterate();
      return this.dom.render(this.emitter.nodes());
    } else {
      return this.dom.render([]);
    }
  };

  DOM.prototype.callback = function(data) {
    var attr, color, colorString, depth, el, f, height, nodes, offset, opacity, outline, props, size, snap, strideI, strideJ, strideK, uniforms, width, zoom;
    uniforms = this._inherit('unit').getUnitUniforms();
    width = uniforms.viewWidth;
    height = uniforms.viewHeight;
    attr = this.node.attributes['dom.attributes'];
    size = this.node.attributes['dom.size'];
    zoom = this.node.attributes['dom.zoom'];
    color = this.node.attributes['dom.color'];
    outline = this.node.attributes['dom.outline'];
    opacity = this.node.attributes['overlay.opacity'];
    offset = this.node.attributes['attach.offset'];
    depth = this.node.attributes['attach.depth'];
    snap = this.node.attributes['attach.snap'];
    el = this.dom.el;
    nodes = [];
    props = null;
    strideI = strideJ = strideK = 0;
    colorString = '';
    f = function(x, y, z, w, i, j, k, l) {
      var a, alpha, clip, flatZ, iw, label, ox, oy, s, scale, v, xx, yy, _ref;
      label = data[l + strideI * i + strideJ * j + strideK * k];
      clip = w < 0;
      iw = 1 / w;
      flatZ = 1 + (iw - 1) * depth.value;
      scale = clip ? 0 : flatZ;
      ox = +offset.value.x * scale;
      oy = +offset.value.y * scale;
      xx = (x + 1) * width.value * .5 + ox;
      yy = (y - 1) * height.value * .5 + oy;
      xx /= zoom.value;
      yy /= zoom.value;
      if (snap.value) {
        xx = Math.round(xx);
        yy = Math.round(yy);
      }
      alpha = Math.min(.999, clip ? 0 : opacity.value);
      props = {
        className: "mathbox-outline-" + (Math.round(outline.value)),
        style: {
          fontSize: "" + size.value + "px",
          zoom: zoom.value,
          transform: "translate3d(" + xx + "px, " + (-yy) + "px, " + (1 - w) + "px) translate(-50%, -50%) scale(" + scale + "," + scale + ")",
          opacity: alpha
        }
      };
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
      props.className += ' ' + ((_ref = a != null ? a.className : void 0) != null ? _ref : 'mathbox-label');
      return nodes.push(el('div', props, label));
    };
    f.reset = (function(_this) {
      return function() {
        var c, m, _ref;
        nodes = [];
        _ref = [_this.strideI, _this.strideJ, _this.strideK], strideI = _ref[0], strideJ = _ref[1], strideK = _ref[2];
        c = color.value;
        m = function(x) {
          return Math.floor(x * 255);
        };
        return colorString = c ? "rgb(" + [m(c.x), m(c.y), m(c.z)] + ")" : '';
      };
    })(this);
    f.nodes = function() {
      return nodes;
    };
    return f;
  };

  DOM.prototype.resize = function() {
    var depth, height, htmlDims, items, pointDims, sI, sJ, sK, width;
    if (this.readback == null) {
      return;
    }
    pointDims = this.bind.points.getActive();
    htmlDims = this.bind.html.getActive();
    items = Math.min(pointDims.items, htmlDims.items);
    width = Math.min(pointDims.width, htmlDims.width);
    height = Math.min(pointDims.height, htmlDims.height);
    depth = Math.min(pointDims.depth, htmlDims.depth);
    this.readback.setActive(items, width, height, depth);
    this.strideI = sI = htmlDims.items;
    this.strideJ = sJ = sI * htmlDims.width;
    return this.strideK = sK = sJ * htmlDims.height;
  };

  DOM.prototype.change = function(changed, touched, init) {
    if (touched['dom']) {
      return this.rebuild();
    }
  };

  return DOM;

})(Primitive);

module.exports = DOM;


},{"../../../util":148,"../../primitive":43}],81:[function(require,module,exports){
var HTML, Util, Voxel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Voxel = require('../data/voxel');

Util = require('../../../util');

HTML = (function(_super) {
  __extends(HTML, _super);

  function HTML() {
    return HTML.__super__.constructor.apply(this, arguments);
  }

  HTML.traits = ['node', 'data', 'voxel', 'html'];

  HTML.defaults = {
    channels: 1
  };

  HTML.prototype.init = function() {
    HTML.__super__.init.apply(this, arguments);
    return this.storage = 'pushBuffer';
  };

  HTML.prototype.make = function() {
    var depth, height, items, width, _ref;
    HTML.__super__.make.apply(this, arguments);
    _ref = this.getDimensions(), items = _ref.items, width = _ref.width, height = _ref.height, depth = _ref.depth;
    this.dom = this._overlays.make('dom');
    return this.dom.hint(items * width * height * depth);
  };

  HTML.prototype.unmake = function() {
    HTML.__super__.unmake.apply(this, arguments);
    if (dom) {
      this.dom.dispose();
      return this.dom = null;
    }
  };

  HTML.prototype.update = function() {
    return HTML.__super__.update.apply(this, arguments);
  };

  HTML.prototype.change = function(changed, touched, init) {
    if (touched['html']) {
      return this.rebuild();
    }
    return HTML.__super__.change.call(this, changed, touched, init);
  };

  HTML.prototype.nodes = function() {
    return this.buffer.read();
  };

  HTML.prototype.callback = function(callback) {
    var el;
    el = this.dom.el;
    return function(emit, i, j, k, l) {
      return callback(emit, el, i, j, k, l);
    };
  };

  return HTML;

})(Voxel);

module.exports = HTML;


},{"../../../util":148,"../data/voxel":57}],82:[function(require,module,exports){
var Compose, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Compose = (function(_super) {
  __extends(Compose, _super);

  function Compose() {
    return Compose.__super__.constructor.apply(this, arguments);
  }

  Compose.traits = ['node', 'bind', 'object', 'operator', 'style', 'compose'];

  Compose.defaults = {
    zWrite: false,
    zTest: false,
    color: '#ffffff'
  };

  Compose.prototype.init = function() {
    return this.compose = null;
  };

  Compose.prototype.resize = function() {
    var depth, dims, height, layers, width;
    if (!(this.compose && this.bind.source)) {
      return;
    }
    dims = this.bind.source.getActive();
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    layers = dims.items;
    return this.remap2DScale.set(width, height);
  };

  Compose.prototype.make = function() {
    var alpha, composeUniforms, fragment, resampleUniforms;
    this._helpers.bind.make([
      {
        to: 'operator.source',
        trait: 'source'
      }
    ]);
    if (this.bind.source == null) {
      return;
    }
    resampleUniforms = {
      remap2DScale: this._attributes.make(this._types.vec2())
    };
    this.remap2DScale = resampleUniforms.remap2DScale.value;
    fragment = this._shaders.shader();
    alpha = this._get('compose.alpha');
    if (this.bind.source.is('image')) {
      fragment = this.bind.source.imageShader(fragment);
    } else {
      fragment.pipe('screen.remap.2d.xyzw', resampleUniforms);
      fragment = this.bind.source.sourceShader(fragment);
    }
    if (!alpha) {
      fragment.pipe('color.opaque');
    }
    composeUniforms = this._helpers.style.uniforms();
    this.compose = this._renderables.make('screen', {
      map: fragment,
      uniforms: composeUniforms
    });
    return this._helpers.object.make([this.compose]);
  };

  Compose.prototype.made = function() {
    return this.resize();
  };

  Compose.prototype.unmake = function() {
    this._helpers.bind.unmake();
    return this._helpers.object.unmake();
  };

  Compose.prototype.change = function(changed, touched, init) {
    if (changed['operator.source'] || changed['compose.alpha']) {
      return this.rebuild();
    }
  };

  return Compose;

})(Primitive);

module.exports = Compose;


},{"../../../util":148,"../../primitive":43}],83:[function(require,module,exports){
var RTT, Root, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Root = require('../base/root');

Util = require('../../../util');

RTT = (function(_super) {
  __extends(RTT, _super);

  function RTT() {
    return RTT.__super__.constructor.apply(this, arguments);
  }

  RTT.traits = ['node', 'root', 'scene', 'transform', 'texture', 'rtt', 'source', 'index', 'image'];

  RTT.defaults = {
    minFilter: 'linear',
    magFilter: 'linear',
    type: 'unsignedByte'
  };

  RTT.prototype.init = function() {
    this.rtt = this.scene = this.width = this.height = this.history = this.rootSize = this.size = null;
    return this.event = {
      type: 'root.update'
    };
  };

  RTT.prototype.indexShader = function(shader) {
    return shader;
  };

  RTT.prototype.imageShader = function(shader) {
    return this.rtt.shaderRelative(shader);
  };

  RTT.prototype.sourceShader = function(shader) {
    return this.rtt.shaderAbsolute(shader, this.history);
  };

  RTT.prototype.update = function() {
    var _ref;
    this.trigger(this.event);
    return (_ref = this.rtt) != null ? _ref.render() : void 0;
  };

  RTT.prototype.getDimensions = function() {
    return {
      items: 1,
      width: this.width,
      height: this.height,
      depth: this.history
    };
  };

  RTT.prototype.getActive = function() {
    return this.getDimensions();
  };

  RTT.prototype.make = function() {
    var aspect, height, history, magFilter, minFilter, type, viewHeight, viewWidth, width;
    this.parentRoot = this._inherit('root');
    this.rootSize = this.parentRoot.getSize();
    this._listen(this.parentRoot, 'root.update', this.update);
    this._listen(this.parentRoot, 'root.resize', function(event) {
      return this.resize(event.size);
    });
    if (this.rootSize == null) {
      return;
    }
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    width = this._get('rtt.width');
    height = this._get('rtt.height');
    history = this._get('rtt.history');
    this.width = width != null ? width : this.rootSize.renderWidth;
    this.height = height != null ? height : this.rootSize.renderHeight;
    this.history = history;
    this.aspect = aspect = this.width / this.height;
    if (this.scene == null) {
      this.scene = this._renderables.make('scene');
    }
    this.rtt = this._renderables.make('renderToTexture', {
      scene: this.scene,
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
    this.size = {
      renderWidth: this.width,
      renderHeight: this.height,
      aspect: aspect,
      viewWidth: viewWidth,
      viewHeight: viewHeight,
      pixelRatio: this.height / viewHeight
    };
    this.rtt.camera.aspect = aspect;
    return this.rtt.camera.updateProjectionMatrix();
  };

  RTT.prototype.made = function() {
    this.trigger({
      type: 'source.rebuild'
    });
    if (this.size) {
      return this.trigger({
        type: 'root.resize',
        size: this.size
      });
    }
  };

  RTT.prototype.unmake = function(rebuild) {
    this.parentRoot.off('root.update', this.updateHandler);
    this.parentRoot.off('root.resize', this.resizeHandler);
    if (this.rtt == null) {
      return;
    }
    this.rtt.dispose();
    if (!rebuild) {
      this.scene.dispose();
    }
    return this.rtt = this.width = this.height = this.history = null;
  };

  RTT.prototype.change = function(changed, touched, init) {
    if (touched['texture'] || changed['rtt.width'] || changed['rtt.height']) {
      return this.rebuild();
    }
  };

  RTT.prototype.adopt = function(renderable) {
    var object, _i, _len, _ref, _results;
    _ref = renderable.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this.scene.add(object));
    }
    return _results;
  };

  RTT.prototype.unadopt = function(renderable) {
    var object, _i, _len, _ref, _results;
    _ref = renderable.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this.scene.remove(object));
    }
    return _results;
  };

  RTT.prototype.resize = function(size) {
    var height, width;
    this.rootSize = size;
    width = this._get('rtt.width');
    height = this._get('rtt.height');
    if (!this.rtt || (width == null) || (height == null)) {
      return this.rebuild();
    }
  };

  RTT.prototype.transform = function(shader, pass) {
    if (pass === 2) {
      return shader.pipe('view.position');
    }
    if (pass === 3) {
      return shader.pipe(Util.GLSL.truncateVec(4, 3));
    }
    return shader;
  };

  return RTT;

})(Root);

module.exports = RTT;


},{"../../../util":148,"../base/root":46}],84:[function(require,module,exports){
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
    fov: Types.nullable(Types.number())
  },
  span: {
    range: Types.nullable(Types.vec2(-1, 1))
  },
  view: {
    range: Types.array(Types.vec2(-1, 1), 4)
  },
  view3: {
    position: Types.vec3(),
    rotation: Types.quat(),
    scale: Types.vec3(1, 1, 1)
  },
  view4: {
    position: Types.vec4(),
    scale: Types.vec4(1, 1, 1, 1)
  },
  vertex: {
    pass: Types.vertexPass(),
    shader: Types.nullable(Types.string())
  },
  transform3: {
    pass: Types.vertexPass(),
    position: Types.vec3(),
    rotation: Types.quat(),
    scale: Types.vec3(1, 1, 1),
    matrix: Types.mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
  },
  transform4: {
    pass: Types.vertexPass(),
    position: Types.vec4(),
    scale: Types.vec4(1, 1, 1, 1),
    matrix: Types.mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
  },
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
  scale: {
    divide: Types.number(10),
    unit: Types.number(1),
    base: Types.number(10),
    mode: Types.scale()
  },
  grid: {
    first: Types.bool(true),
    second: Types.bool(true)
  },
  axis: {
    detail: Types.int(1)
  },
  source: {
    hint: Types.nullable(Types.string())
  },
  data: {
    data: Types.nullable(Types.object()),
    expression: Types.nullable(Types.func()),
    live: Types.bool(true),
    channels: Types.int(3),
    items: Types.int(1)
  },
  sampler: {
    centered: Types.bool(false)
  },
  array: {
    length: Types.nullable(Types.int(1)),
    history: Types.int(1),
    bufferLength: Types.int(1)
  },
  matrix: {
    width: Types.nullable(Types.int(1)),
    height: Types.nullable(Types.int(1)),
    history: Types.int(1),
    bufferWidth: Types.int(1),
    bufferHeight: Types.int(1)
  },
  voxel: {
    width: Types.nullable(Types.int(1)),
    height: Types.nullable(Types.int(1)),
    depth: Types.nullable(Types.int(1)),
    bufferWidth: Types.int(1),
    bufferHeight: Types.int(1),
    bufferDepth: Types.int(1)
  },
  style: {
    opacity: Types.number(1),
    color: Types.color(),
    blending: Types.blending(),
    zWrite: Types.bool(true),
    zTest: Types.bool(true),
    zIndex: Types.absolute(Types.round()),
    zBias: Types.number(0),
    zOrder: Types.nullable(Types.int())
  },
  geometry: {
    points: Types.select(),
    colors: Types.nullable(Types.select())
  },
  point: {
    size: Types.number(4),
    shape: Types.shape(),
    fill: Types.bool(true),
    depth: Types.number(1)
  },
  line: {
    width: Types.number(2),
    depth: Types.number(1),
    stroke: Types.stroke()
  },
  mesh: {
    solid: Types.bool(true),
    shaded: Types.bool(true)
  },
  face: {
    outline: Types.bool(false)
  },
  arrow: {
    size: Types.number(3),
    start: Types.bool(false),
    end: Types.bool(false)
  },
  ticks: {
    size: Types.number(.05)
  },
  attach: {
    offset: Types.vec2(0, -20),
    snap: Types.bool(true),
    depth: Types.number(0)
  },
  text: {
    font: Types.string(),
    style: Types.string(),
    detail: Types.number(24),
    expand: Types.number(4)
  },
  label: {
    text: Types.select(),
    size: Types.number(16),
    outline: Types.number(2),
    expand: Types.number(0),
    background: Types.color(1, 1, 1)
  },
  overlay: {
    opacity: Types.number(1)
  },
  html: {
    font: Types.string(),
    style: Types.string()
  },
  dom: {
    points: Types.select(),
    html: Types.select(),
    size: Types.number(16),
    outline: Types.number(2),
    zoom: Types.number(1),
    color: Types.nullable(Types.color()),
    attributes: Types.nullable(Types.object())
  },
  texture: {
    minFilter: Types.filter('nearest'),
    magFilter: Types.filter('nearest'),
    type: Types.type('float')
  },
  operator: {
    source: Types.select()
  },
  spread: {
    items: Types.nullable(Types.vec4()),
    width: Types.nullable(Types.vec4()),
    height: Types.nullable(Types.vec4()),
    depth: Types.nullable(Types.vec4()),
    alignItems: Types.anchor(),
    alignWidth: Types.anchor(),
    alignHeight: Types.anchor(),
    alignDepth: Types.anchor()
  },
  split: {
    order: Types.transpose('wxyz'),
    axis: Types.axis(),
    length: Types.int(1),
    overlap: Types.int(0)
  },
  join: {
    order: Types.transpose('wxyz'),
    axis: Types.axis(),
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
  lerp: {
    items: Types.nullable(Types.int()),
    width: Types.nullable(Types.int()),
    height: Types.nullable(Types.int()),
    depth: Types.nullable(Types.int())
  },
  resample: {
    indices: Types.number(4),
    channels: Types.number(4),
    map: Types.mapping(),
    scale: Types.mapping('absolute'),
    shader: Types.nullable(Types.string()),
    items: Types.nullable(Types.int()),
    width: Types.nullable(Types.int()),
    height: Types.nullable(Types.int()),
    depth: Types.nullable(Types.int())
  },
  readback: {
    indexed: Types.bool()
  },
  root: {
    camera: Types.nullable(Types.select())
  },
  rtt: {
    width: Types.nullable(Types.int()),
    height: Types.nullable(Types.int()),
    history: Types.int(1)
  },
  compose: {
    alpha: Types.bool(false)
  }
};

module.exports = Traits;


},{"./types":89}],85:[function(require,module,exports){
var Parent, Transform,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Parent = require('../base/parent');

Transform = (function(_super) {
  __extends(Transform, _super);

  function Transform() {
    return Transform.__super__.constructor.apply(this, arguments);
  }

  Transform.traits = ['node', 'transform'];

  Transform.prototype.transform = function(shader, pass) {
    return this._inherit('transform').transform(shader, pass);
  };

  return Transform;

})(Parent);

module.exports = Transform;


},{"../base/parent":45}],86:[function(require,module,exports){
var Transform, Transform3,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Transform = require('./transform');

Transform3 = (function(_super) {
  __extends(Transform3, _super);

  function Transform3() {
    return Transform3.__super__.constructor.apply(this, arguments);
  }

  Transform3.traits = ['node', 'transform', 'transform3'];

  Transform3.prototype.make = function() {
    this.uniforms = {
      transformMatrix: this._attributes.make(this._types.mat4())
    };
    return this.transformMatrix = this.uniforms.transformMatrix.value;
  };

  Transform3.prototype.unmake = function() {
    return delete this.uniforms;
  };

  Transform3.prototype.change = function(changed, touched, init) {
    var m, p, q, s, t;
    if (changed['transform3.pass']) {
      return this.rebuild();
    }
    if (!(touched['transform3'] || init)) {
      return;
    }
    this.pass = this._get('transform3.pass');
    p = this._get('transform3.position');
    q = this._get('transform3.rotation');
    s = this._get('transform3.scale');
    m = this._get('transform3.matrix');
    t = this.transformMatrix;
    t.compose(p, q, s);
    if (m != null) {
      return t.multiplyMatrices(t, m);
    }
  };

  Transform3.prototype.transform = function(shader, pass) {
    if (pass === this.pass) {
      shader.pipe('transform3.position', this.uniforms);
    }
    return Transform3.__super__.transform.call(this, shader, pass);
  };

  return Transform3;

})(Transform);

module.exports = Transform3;


},{"./transform":85}],87:[function(require,module,exports){
var Transform, Transform4,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Transform = require('./transform');

Transform4 = (function(_super) {
  __extends(Transform4, _super);

  function Transform4() {
    return Transform4.__super__.constructor.apply(this, arguments);
  }

  Transform4.traits = ['node', 'transform', 'transform4'];

  Transform4.prototype.make = function() {
    this.uniforms = {
      transformMatrix: this._attributes.make(this._types.mat4()),
      transformOffset: this.node.attributes['transform4.position']
    };
    return this.transformMatrix = this.uniforms.transformMatrix.value;
  };

  Transform4.prototype.unmake = function() {
    return delete this.uniforms;
  };

  Transform4.prototype.change = function(changed, touched, init) {
    var m, s, t;
    if (changed['transform4.pass']) {
      return this.rebuild();
    }
    if (!(touched['transform4'] || init)) {
      return;
    }
    this.pass = this._get('transform4.pass');
    s = this._get('transform4.scale');
    m = this._get('transform4.matrix');
    t = this.transformMatrix;
    t.copy(m);
    return t.scale(s);
  };

  Transform4.prototype.transform = function(shader, pass) {
    if (pass === this.pass) {
      shader.pipe('transform4.position', this.uniforms);
    }
    return Transform4.__super__.transform.call(this, shader, pass);
  };

  return Transform4;

})(Transform);

module.exports = Transform4;


},{"./transform":85}],88:[function(require,module,exports){
var Transform, Vertex,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Transform = require('./transform');

Vertex = (function(_super) {
  __extends(Vertex, _super);

  function Vertex() {
    return Vertex.__super__.constructor.apply(this, arguments);
  }

  Vertex.traits = ['node', 'transform', 'vertex'];

  Vertex.prototype.change = function(changed, touched, init) {
    if (touched['vertex']) {
      return this.rebuild();
    }
    this.shader = this._get('vertex.shader');
    return this.pass = this._get('vertex.pass');
  };

  Vertex.prototype.transform = function(shader, pass) {
    if (pass === this.pass) {
      shader.pipe(this.shader, this.uniforms);
    }
    return Vertex.__super__.transform.call(this, shader, pass);
  };

  return Vertex;

})(Transform);

module.exports = Vertex;


},{"./transform":85}],89:[function(require,module,exports){
var Types,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Types = {
  array: function(type, size, value) {
    if (value == null) {
      value = null;
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
        var i, _i, _results;
        if (value != null) {
          return value.slice();
        }
        if (!size) {
          return [];
        }
        _results = [];
        for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
          _results.push(type.make());
        }
        return _results;
      },
      validate: function(value, target, invalid) {
        var i, input, l, replace, _i, _ref;
        if ((value.constructor != null) && value.constructor === Array) {
          l = target.length = size ? size : value.length;
          for (i = _i = 0; 0 <= l ? _i < l : _i > l; i = 0 <= l ? ++_i : --_i) {
            input = (_ref = value[i]) != null ? _ref : type.make();
            replace = type.validate(input, target[i], invalid);
            if (replace !== void 0) {
              target[i] = replace;
            }
          }
        } else {
          invalid();
        }
      },
      equals: function(a, b) {
        var al, bl, i, l, _i;
        al = a.length;
        bl = b.length;
        if (al !== bl) {
          return false;
        }
        l = Math.min(al, bl);
        for (i = _i = 0; 0 <= l ? _i < l : _i > l; i = 0 <= l ? ++_i : --_i) {
          if (!(typeof type.equals === "function" ? type.equals(a[i], b[i]) : void 0)) {
            return false;
          }
        }
        return true;
      }
    };
  },
  letters: function(type, size, value) {
    var array, i, v, _i, _len;
    if (value == null) {
      value = null;
    }
    if (value != null) {
      if (value === "" + value) {
        value = value.split('');
      }
      for (i = _i = 0, _len = value.length; _i < _len; i = ++_i) {
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
      }
    };
  },
  absolute: function(type) {
    var value;
    value = type.make();
    return {
      make: function() {
        return value;
      },
      uniform: function() {
        return type.uniform();
      },
      validate: function(value, target, invalid) {
        return Math.abs(+type.validate(value, target, invalid));
      }
    };
  },
  nullable: function(type, make) {
    var value;
    if (make == null) {
      make = false;
    }
    value = make ? type.make() : null;
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
        value = type.validate(value, target, invalid);
        if (value !== void 0) {
          return value;
        } else {
          return target;
        }
      },
      equals: function(a, b) {
        var an, bn, _ref;
        an = a === null;
        bn = b === null;
        if (an && bn) {
          return true;
        }
        if (an ^ bn) {
          return false;
        }
        return (_ref = typeof type.equals === "function" ? type.equals(a, b) : void 0) != null ? _ref : a === b;
      }
    };
  },
  "enum": function(value, keys, map) {
    var i, key, values, _i, _len;
    if (map == null) {
      map = {};
    }
    values = {};
    for (i = _i = 0, _len = keys.length; _i < _len; i = ++_i) {
      key = keys[i];
      if (map[key] == null) {
        map[key] = i;
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
      "enum": function() {
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
  select: function(value) {
    if (value == null) {
      value = '<';
    }
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
        if (value === true || value === false) {
          return value;
        }
      }
    };
  },
  int: function(value) {
    if (value == null) {
      value = 0;
    }
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
      }
    };
  },
  round: function(value) {
    if (value == null) {
      value = 0;
    }
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
      }
    };
  },
  number: function(value) {
    if (value == null) {
      value = 0;
    }
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
      }
    };
  },
  string: function(value) {
    if (value == null) {
      value = '';
    }
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
      }
    };
  },
  vec2: function(x, y) {
    var defaults;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    defaults = [x, y];
    return {
      uniform: function() {
        return 'v2';
      },
      make: function() {
        return new THREE.Vector2(x, y);
      },
      validate: function(value, target, invalid) {
        var xx, yy, _ref, _ref1;
        if (value instanceof THREE.Vector2) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          xx = (_ref = value.x) != null ? _ref : x;
          yy = (_ref1 = value.y) != null ? _ref1 : y;
          target.set(xx, yy);
        } else {
          return invalid();
        }
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y;
      }
    };
  },
  ivec2: function(x, y) {
    var validate, vec2;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    vec2 = Types.vec2(x, y);
    validate = vec2.validate;
    return vec2.validate = function(value, target, invalid) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
    };
  },
  vec3: function(x, y, z) {
    var defaults;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    defaults = [x, y, z];
    return {
      uniform: function() {
        return 'v3';
      },
      make: function() {
        return new THREE.Vector3(x, y, z);
      },
      validate: function(value, target, invalid) {
        var xx, yy, zz, _ref, _ref1, _ref2;
        if (value instanceof THREE.Vector3) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          xx = (_ref = value.x) != null ? _ref : x;
          yy = (_ref1 = value.y) != null ? _ref1 : y;
          zz = (_ref2 = value.z) != null ? _ref2 : z;
          target.set(xx, yy, zz);
        } else {
          return invalid();
        }
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
      }
    };
  },
  ivec3: function(x, y, z) {
    var validate, vec3;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    vec3 = Types.vec3(x, y, z);
    validate = vec3.validate;
    return vec3.validate = function(value, target) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      target.z = Math.round(target.z);
    };
  },
  vec4: function(x, y, z, w) {
    var defaults;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 0;
    }
    defaults = [x, y, z, w];
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Vector4(x, y, z, w);
      },
      validate: function(value, target, invalid) {
        var ww, xx, yy, zz, _ref, _ref1, _ref2, _ref3;
        if (value instanceof THREE.Vector4) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          xx = (_ref = value.x) != null ? _ref : x;
          yy = (_ref1 = value.y) != null ? _ref1 : y;
          zz = (_ref2 = value.z) != null ? _ref2 : z;
          ww = (_ref3 = value.w) != null ? _ref3 : w;
          target.set(xx, yy, zz, ww);
        } else {
          return invalid();
        }
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
      }
    };
  },
  ivec4: function(x, y, z, w) {
    var validate, vec4;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 0;
    }
    vec4 = Types.vec4(x, y, z, w);
    validate = vec4.validate;
    return vec4.validate = function(value, target) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      target.z = Math.round(target.z);
      target.w = Math.round(target.w);
    };
  },
  mat4: function(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    var defaults;
    if (n11 == null) {
      n11 = 1;
    }
    if (n12 == null) {
      n12 = 0;
    }
    if (n13 == null) {
      n13 = 0;
    }
    if (n14 == null) {
      n14 = 0;
    }
    if (n21 == null) {
      n21 = 0;
    }
    if (n22 == null) {
      n22 = 1;
    }
    if (n23 == null) {
      n23 = 0;
    }
    if (n24 == null) {
      n24 = 0;
    }
    if (n31 == null) {
      n31 = 0;
    }
    if (n32 == null) {
      n32 = 0;
    }
    if (n33 == null) {
      n33 = 1;
    }
    if (n34 == null) {
      n34 = 0;
    }
    if (n41 == null) {
      n41 = 0;
    }
    if (n42 == null) {
      n42 = 0;
    }
    if (n43 == null) {
      n43 = 0;
    }
    if (n44 == null) {
      n44 = 1;
    }
    defaults = [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44];
    return {
      uniform: function() {
        return 'm4';
      },
      make: function() {
        var m;
        m = new THREE.Matrix4;
        m.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
        return m;
      },
      validate: function(value, target, invalid) {
        if (value instanceof THREE.Matrix4) {
          return target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          return target.set.apply(target, value);
        } else {
          return invalid();
        }
      }
    };
  },
  quat: function(x, y, z, w) {
    var vec4;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 1;
    }
    vec4 = Types.vec4(x, y, z, w);
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Quaternion;
      },
      validate: function(value, target, invalid) {
        var ret;
        if (value instanceof THREE.Quaternion) {
          target.copy(value);
        } else {
          ret = vec4.validate(value, target, invalid);
        }
        (ret != null ? ret : target).normalize();
        return ret;
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
      }
    };
  },
  color: function(r, g, b) {
    var vec3;
    if (r == null) {
      r = .5;
    }
    if (g == null) {
      g = .5;
    }
    if (b == null) {
      b = .5;
    }
    vec3 = Types.vec3(r, g, b);
    return {
      uniform: function() {
        return 'v3';
      },
      make: function() {
        return new THREE.Vector3(r, g, b);
      },
      validate: function(value, target, invalid) {
        if (value === "" + value) {
          value = new THREE.Color().setStyle(value);
        } else if (value === +value) {
          value = new THREE.Color(value);
        }
        if (value instanceof THREE.Color) {
          return target.set(value.r, value.g, value.b);
        } else {
          return vec3.validate(value, target, invalid);
        }
      },
      equals: function(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
      }
    };
  },
  axis: function(value, allowZero) {
    var map, range, v;
    if (value == null) {
      value = 1;
    }
    if (allowZero == null) {
      allowZero = false;
    }
    map = {
      x: 1,
      y: 2,
      z: 3,
      w: 4,
      i: 4,
      "null": 0,
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
        var _ref;
        if ((v = map[value]) != null) {
          value = v;
        }
        value = (_ref = Math.round(value)) != null ? _ref : 0;
        if (__indexOf.call(range, value) >= 0) {
          return value;
        }
        return invalid();
      }
    };
  },
  transpose: function(order) {
    var axesArray, looseArray;
    if (order == null) {
      order = [1, 2, 3, 4];
    }
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
          var _i, _len, _results;
          _results = [];
          for (i = _i = 0, _len = temp.length; _i < _len; i = ++_i) {
            letter = temp[i];
            _results.push(temp.indexOf(letter) === i);
          }
          return _results;
        })();
        if (unique.indexOf(false) < 0) {
          return axesArray.validate(temp, target, invalid);
        }
        return invalid();
      },
      equals: function(a, b) {
        return axesArray.equals(a, b);
      }
    };
  },
  swizzle: function(order, size) {
    var axesArray, looseArray;
    if (order == null) {
      order = [1, 2, 3, 4];
    }
    if (size == null) {
      size = 4;
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
      equals: function(a, b) {
        return axesArray.equals(a, b);
      }
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
      equals: function(a, b) {
        return stringArray.equals(a, b);
      }
    };
  },
  blending: function(value) {
    var keys;
    if (value == null) {
      value = 'normal';
    }
    keys = ['no', 'normal', 'add', 'subtract', 'multiply', 'custom'];
    return Types["enum"](value, keys);
  },
  filter: function(value) {
    var map;
    if (value == null) {
      value = 'nearest';
    }
    map = {
      nearest: THREE.NearestFilter,
      nearestMipMapNearest: THREE.NearestMipMapNearestFilter,
      nearestMipMapLinear: THREE.NearestMipMapLinearFilter,
      linear: THREE.LinearFilter,
      linearMipMapNearest: THREE.LinearMipMapNearestFilter,
      linearMipmapLinear: THREE.LinearMipMapLinearFilter
    };
    return Types["enum"](value, [], map);
  },
  type: function(value) {
    var map;
    if (value == null) {
      value = 'unsignedByte';
    }
    map = {
      unsignedByte: THREE.UnsignedByteType,
      byte: THREE.ByteType,
      short: THREE.ShortType,
      unsignedShort: THREE.UnsignedShortType,
      int: THREE.IntType,
      unsignedInt: THREE.UnsignedIntType,
      float: THREE.FloatType
    };
    return Types["enum"](value, [], map);
  },
  scale: function(value) {
    var keys;
    if (value == null) {
      value = 'linear';
    }
    keys = ['linear', 'log'];
    return Types["enum"](value, keys);
  },
  mapping: function(value) {
    var keys;
    if (value == null) {
      value = 'relative';
    }
    keys = ['relative', 'absolute'];
    return Types["enum"](value, keys);
  },
  indexing: function(value) {
    var keys;
    if (value == null) {
      value = 'original';
    }
    keys = ['original', 'final'];
    return Types["enum"](value, keys);
  },
  shape: function(value) {
    var keys;
    if (value == null) {
      value = 'circle';
    }
    keys = ['circle', 'square', 'diamond', 'triangle'];
    return Types["enum"](value, keys);
  },
  stroke: function(value) {
    var keys;
    if (value == null) {
      value = 'solid';
    }
    keys = ['solid', 'dotted', 'dashed'];
    return Types["enum"](value, keys);
  },
  vertexPass: function(value) {
    var keys;
    if (value == null) {
      value = 'view';
    }
    keys = ['data', 'view', 'world', 'eye'];
    return Types["enum"](value, keys);
  },
  anchor: function(value) {
    var map, _ref;
    if (value == null) {
      value = 'middle';
    }
    map = {
      first: 1,
      middle: 0,
      last: -1
    };
    value = (_ref = map[value]) != null ? _ref : +value;
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
      }
    };
  }
};

module.exports = Types;


},{}],90:[function(require,module,exports){
var Cartesian, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Cartesian = (function(_super) {
  __extends(Cartesian, _super);

  function Cartesian() {
    return Cartesian.__super__.constructor.apply(this, arguments);
  }

  Cartesian.traits = ['node', 'object', 'view', 'view3', 'transform'];

  Cartesian.prototype.make = function() {
    Cartesian.__super__.make.apply(this, arguments);
    this.uniforms = {
      viewMatrix: this._attributes.make(this._types.mat4())
    };
    this.viewMatrix = this.uniforms.viewMatrix.value;
    return this.objectMatrix = new THREE.Matrix4;
  };

  Cartesian.prototype.unmake = function() {
    Cartesian.__super__.unmake.apply(this, arguments);
    delete this.viewMatrix;
    delete this.objectMatrix;
    return delete this.uniforms;
  };

  Cartesian.prototype.change = function(changed, touched, init) {
    var dx, dy, dz, o, q, r, s, sx, sy, sz, x, y, z;
    if (!(touched['view'] || touched['view3'] || init)) {
      return;
    }
    o = this._get('view3.position');
    s = this._get('view3.scale');
    q = this._get('view3.rotation');
    r = this._get('view.range');
    x = r[0].x;
    y = r[1].x;
    z = r[2].x;
    dx = (r[0].y - x) || 1;
    dy = (r[1].y - y) || 1;
    dz = (r[2].y - z) || 1;
    sx = s.x;
    sy = s.y;
    sz = s.z;
    this.viewMatrix.set(2 / dx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1);
    this.objectMatrix.compose(o, q, s);
    this.viewMatrix.multiplyMatrices(this.objectMatrix, this.viewMatrix);
    if (changed['view.range']) {
      return this.trigger({
        type: 'view.range'
      });
    }
  };

  Cartesian.prototype.transform = function(shader, pass) {
    if (pass === 1) {
      shader.pipe('cartesian.position', this.uniforms);
    }
    return Cartesian.__super__.transform.call(this, shader, pass);
  };

  return Cartesian;

})(View);

module.exports = Cartesian;


},{"./view":96}],91:[function(require,module,exports){
var Cartesian4, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Cartesian4 = (function(_super) {
  __extends(Cartesian4, _super);

  function Cartesian4() {
    return Cartesian4.__super__.constructor.apply(this, arguments);
  }

  Cartesian4.traits = ['node', 'object', 'view', 'view4', 'transform'];

  Cartesian4.prototype.make = function() {
    Cartesian4.__super__.make.apply(this, arguments);
    this.uniforms = {
      basisOffset: this._attributes.make(this._types.vec4()),
      basisScale: this._attributes.make(this._types.vec4())
    };
    this.basisScale = this.uniforms.basisScale.value;
    return this.basisOffset = this.uniforms.basisOffset.value;
  };

  Cartesian4.prototype.unmake = function() {
    Cartesian4.__super__.unmake.apply(this, arguments);
    delete this.basisScale;
    delete this.basisOffset;
    return delete this.uniforms;
  };

  Cartesian4.prototype.change = function(changed, touched, init) {
    var dw, dx, dy, dz, mult, p, r, s, w, x, y, z;
    if (!(touched['view'] || touched['view4'] || init)) {
      return;
    }
    p = this._get('view4.position');
    s = this._get('view4.scale');
    r = this._get('view.range');
    x = r[0].x;
    y = r[1].x;
    z = r[2].x;
    w = r[3].x;
    dx = (r[0].y - x) || 1;
    dy = (r[1].y - y) || 1;
    dz = (r[2].y - z) || 1;
    dw = (r[3].y - w) || 1;
    mult = function(a, b) {
      a.x *= b.x;
      a.y *= b.y;
      a.z *= b.z;
      return a.w *= b.w;
    };
    this.basisScale.set(2 / dx, 2 / dy, 2 / dz, 2 / dw);
    this.basisOffset.set(-(2 * x + dx) / dx, -(2 * y + dy) / dy, -(2 * z + dz) / dz, -(2 * w + dw) / dw);
    mult(this.basisScale, s);
    mult(this.basisOffset, s);
    this.basisOffset.add(p);
    if (changed['view.range']) {
      return this.trigger({
        type: 'view.range'
      });
    }
  };

  Cartesian4.prototype.transform = function(shader, pass) {
    if (pass === 1) {
      shader.pipe('cartesian4.position', this.uniforms);
    }
    return Cartesian4.__super__.transform.call(this, shader, pass);
  };

  return Cartesian4;

})(View);

module.exports = Cartesian4;


},{"./view":96}],92:[function(require,module,exports){
var Polar, Util, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Util = require('../../../util');

Polar = (function(_super) {
  __extends(Polar, _super);

  function Polar() {
    return Polar.__super__.constructor.apply(this, arguments);
  }

  Polar.traits = ['node', 'object', 'view', 'view3', 'polar', 'transform'];

  Polar.prototype.make = function() {
    var types;
    Polar.__super__.make.apply(this, arguments);
    types = this._attributes.types;
    this.uniforms = {
      polarBend: this.node.attributes['polar.bend'],
      polarHelix: this.node.attributes['polar.helix'],
      polarFocus: this._attributes.make(types.number()),
      polarAspect: this._attributes.make(types.number()),
      viewMatrix: this._attributes.make(types.mat4())
    };
    this.viewMatrix = this.uniforms.viewMatrix.value;
    this.objectMatrix = new THREE.Matrix4();
    return this.aspect = 1;
  };

  Polar.prototype.unmake = function() {
    Polar.__super__.unmake.apply(this, arguments);
    delete this.viewMatrix;
    delete this.objectMatrix;
    delete this.aspect;
    return delete this.uniforms;
  };

  Polar.prototype.change = function(changed, touched, init) {
    var ady, aspect, bend, dx, dy, dz, fdx, focus, helix, idx, o, q, r, s, sdx, sdy, sx, sy, sz, x, y, z, _ref;
    if (!(touched['view'] || touched['view3'] || touched['polar'] || init)) {
      return;
    }
    this.helix = helix = this._get('polar.helix');
    this.bend = bend = this._get('polar.bend');
    this.focus = focus = bend > 0 ? 1 / bend - 1 : 0;
    o = this._get('view3.position');
    s = this._get('view3.scale');
    q = this._get('view3.rotation');
    r = this._get('view.range');
    x = r[0].x;
    y = r[1].x;
    z = r[2].x;
    dx = (r[0].y - x) || 1;
    dy = (r[1].y - y) || 1;
    dz = (r[2].y - z) || 1;
    sx = s.x;
    sy = s.y;
    sz = s.z;
    idx = dx > 0 ? 1 : -1;
    _ref = Util.Axis.recenterAxis(y, dy, bend), y = _ref[0], dy = _ref[1];
    ady = Math.abs(dy);
    fdx = dx + (ady * idx - dx) * bend;
    sdx = fdx / sx;
    sdy = dy / sy;
    this.aspect = aspect = Math.abs(sdx / sdy);
    this.uniforms.polarFocus.value = focus;
    this.uniforms.polarAspect.value = aspect;
    this.viewMatrix.set(2 / fdx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1);
    this.objectMatrix.compose(o, q, s);
    this.viewMatrix.multiplyMatrices(this.objectMatrix, this.viewMatrix);
    if (changed['view.range'] || touched['polar']) {
      return this.trigger({
        type: 'view.range'
      });
    }
  };

  Polar.prototype.transform = function(shader, pass) {
    if (pass === 1) {
      shader.pipe('polar.position', this.uniforms);
    }
    return Polar.__super__.transform.call(this, shader, pass);
  };

  Polar.prototype.axis = function(dimension) {
    var max, min, range;
    range = this._get('view.range')[dimension - 1];
    min = range.x;
    max = range.y;
    if (dimension === 2 && this.bend > 0) {
      max = Math.max(Math.abs(max), Math.abs(min));
      min = Math.max(-this.focus / this.aspect + .001, min);
    }
    return new THREE.Vector2(min, max);
  };

  return Polar;

})(View);

module.exports = Polar;


},{"../../../util":148,"./view":96}],93:[function(require,module,exports){
var Spherical, Util, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Util = require('../../../util');

Spherical = (function(_super) {
  __extends(Spherical, _super);

  function Spherical() {
    return Spherical.__super__.constructor.apply(this, arguments);
  }

  Spherical.traits = ['node', 'object', 'view', 'view3', 'spherical', 'transform'];

  Spherical.prototype.make = function() {
    var types;
    Spherical.__super__.make.apply(this, arguments);
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
    this.objectMatrix = new THREE.Matrix4();
    this.aspectX = 1;
    return this.aspectY = 1;
  };

  Spherical.prototype.unmake = function() {
    Spherical.__super__.unmake.apply(this, arguments);
    delete this.viewMatrix;
    delete this.objectMatrix;
    delete this.aspectX;
    delete this.aspectY;
    return delete this.uniforms;
  };

  Spherical.prototype.change = function(changed, touched, init) {
    var adz, aspectX, aspectY, aspectZ, bend, dx, dy, dz, fdx, fdy, focus, idx, idy, o, q, r, s, scaleY, sdx, sdy, sdz, sx, sy, sz, x, y, z, _ref, _ref1;
    if (!(touched['view'] || touched['view3'] || touched['spherical'] || init)) {
      return;
    }
    this.bend = bend = this._get('spherical.bend');
    this.focus = focus = bend > 0 ? 1 / bend - 1 : 0;
    o = this._get('view3.position');
    s = this._get('view3.scale');
    q = this._get('view3.rotation');
    r = this._get('view.range');
    x = r[0].x;
    y = r[1].x;
    z = r[2].x;
    dx = (r[0].y - x) || 1;
    dy = (r[1].y - y) || 1;
    dz = (r[2].y - z) || 1;
    sx = s.x;
    sy = s.y;
    sz = s.z;
    _ref = Util.Axis.recenterAxis(y, dy, bend), y = _ref[0], dy = _ref[1];
    _ref1 = Util.Axis.recenterAxis(z, dz, bend), z = _ref1[0], dz = _ref1[1];
    idx = dx > 0 ? 1 : -1;
    idy = dy > 0 ? 1 : -1;
    adz = Math.abs(dz);
    fdx = dx + (adz * idx - dx) * bend;
    fdy = dy + (adz * idy - dy) * bend;
    sdx = fdx / sx;
    sdy = fdy / sy;
    sdz = dz / sz;
    this.aspectX = aspectX = Math.abs(sdx / sdz);
    this.aspectY = aspectY = Math.abs(sdy / sdz / aspectX);
    aspectZ = dy / dx * sx / sy * 2;
    this.scaleY = scaleY = Math.min(aspectY / bend, 1 + (aspectZ - 1) * bend);
    this.uniforms.sphericalBend.value = bend;
    this.uniforms.sphericalFocus.value = focus;
    this.uniforms.sphericalAspectX.value = aspectX;
    this.uniforms.sphericalAspectY.value = aspectY;
    this.uniforms.sphericalScaleY.value = scaleY;
    this.viewMatrix.set(2 / fdx, 0, 0, -(2 * x + dx) / dx, 0, 2 / fdy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1);
    this.objectMatrix.compose(o, q, s);
    this.viewMatrix.multiplyMatrices(this.objectMatrix, this.viewMatrix);
    if (changed['view.range'] || touched['spherical']) {
      return this.trigger({
        type: 'view.range'
      });
    }
  };

  Spherical.prototype.transform = function(shader, pass) {
    if (pass === 1) {
      shader.pipe('spherical.position', this.uniforms);
    }
    return Spherical.__super__.transform.call(this, shader, pass);
  };

  Spherical.prototype.axis = function(dimension) {
    var max, min, range;
    range = this._get('view.range')[dimension - 1];
    min = range.x;
    max = range.y;
    if (dimension === 3 && this.bend > 0) {
      max = Math.max(Math.abs(max), Math.abs(min));
      min = Math.max(-this.focus / this.aspectX + .001, min);
    }
    return new THREE.Vector2(min, max);
  };

  return Spherical;

})(View);

module.exports = Spherical;


},{"../../../util":148,"./view":96}],94:[function(require,module,exports){
var Stereographic, Util, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Util = require('../../../util');

Stereographic = (function(_super) {
  __extends(Stereographic, _super);

  function Stereographic() {
    return Stereographic.__super__.constructor.apply(this, arguments);
  }

  Stereographic.traits = ['node', 'object', 'view', 'view3', 'stereographic', 'transform'];

  Stereographic.prototype.make = function() {
    var types;
    Stereographic.__super__.make.apply(this, arguments);
    types = this._attributes.types;
    this.uniforms = {
      stereoBend: this.node.attributes['stereographic.bend'],
      viewMatrix: this._attributes.make(this._types.mat4())
    };
    this.viewMatrix = this.uniforms.viewMatrix.value;
    return this.objectMatrix = new THREE.Matrix4();
  };

  Stereographic.prototype.unmake = function() {
    Stereographic.__super__.unmake.apply(this, arguments);
    delete this.viewMatrix;
    delete this.rotationMatrix;
    return delete this.uniforms;
  };

  Stereographic.prototype.change = function(changed, touched, init) {
    var bend, dx, dy, dz, o, q, r, s, sx, sy, sz, x, y, z, _ref;
    if (!(touched['view'] || touched['view3'] || touched['stereographic'] || init)) {
      return;
    }
    this.bend = bend = this._get('stereographic.bend');
    o = this._get('view3.position');
    s = this._get('view3.scale');
    q = this._get('view3.rotation');
    r = this._get('view.range');
    x = r[0].x;
    y = r[1].x;
    z = r[2].x;
    dx = (r[0].y - x) || 1;
    dy = (r[1].y - y) || 1;
    dz = (r[2].y - z) || 1;
    sx = s.x;
    sy = s.y;
    sz = s.z;
    _ref = Util.Axis.recenterAxis(z, dz, bend, 1), z = _ref[0], dz = _ref[1];
    this.uniforms.stereoBend.value = bend;
    this.viewMatrix.set(2 / dx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1);
    this.objectMatrix.compose(o, q, s);
    this.viewMatrix.multiplyMatrices(this.objectMatrix, this.viewMatrix);
    if (changed['view.range'] || touched['stereographic']) {
      return this.trigger({
        type: 'view.range'
      });
    }
  };

  Stereographic.prototype.transform = function(shader, pass) {
    if (pass === 1) {
      shader.pipe('stereographic.position', this.uniforms);
    }
    return Stereographic.__super__.transform.call(this, shader, pass);
  };

  return Stereographic;

})(View);

module.exports = Stereographic;


},{"../../../util":148,"./view":96}],95:[function(require,module,exports){
var Stereographic4, Util, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Util = require('../../../util');

Stereographic4 = (function(_super) {
  __extends(Stereographic4, _super);

  function Stereographic4() {
    return Stereographic4.__super__.constructor.apply(this, arguments);
  }

  Stereographic4.traits = ['node', 'object', 'view', 'view4', 'stereographic', 'transform'];

  Stereographic4.prototype.make = function() {
    Stereographic4.__super__.make.apply(this, arguments);
    this.uniforms = {
      basisOffset: this._attributes.make(this._types.vec4()),
      basisScale: this._attributes.make(this._types.vec4()),
      stereoBend: this.node.attributes['stereographic.bend']
    };
    this.basisScale = this.uniforms.basisScale.value;
    return this.basisOffset = this.uniforms.basisOffset.value;
  };

  Stereographic4.prototype.unmake = function() {
    Stereographic4.__super__.unmake.apply(this, arguments);
    delete this.basisScale;
    delete this.basisOffset;
    return delete this.uniforms;
  };

  Stereographic4.prototype.change = function(changed, touched, init) {
    var bend, dw, dx, dy, dz, mult, p, r, s, w, x, y, z, _ref;
    if (!(touched['view'] || touched['view4'] || touched['stereographic'] || init)) {
      return;
    }
    this.bend = bend = this._get('stereographic.bend');
    p = this._get('view4.position');
    s = this._get('view4.scale');
    r = this._get('view.range');
    x = r[0].x;
    y = r[1].x;
    z = r[2].x;
    w = r[3].x;
    dx = (r[0].y - x) || 1;
    dy = (r[1].y - y) || 1;
    dz = (r[2].y - z) || 1;
    dw = (r[3].y - w) || 1;
    mult = function(a, b) {
      a.x *= b.x;
      a.y *= b.y;
      a.z *= b.z;
      return a.w *= b.w;
    };
    _ref = Util.Axis.recenterAxis(w, dw, bend, 1), w = _ref[0], dw = _ref[1];
    this.basisScale.set(2 / dx, 2 / dy, 2 / dz, 2 / dw);
    this.basisOffset.set(-(2 * x + dx) / dx, -(2 * y + dy) / dy, -(2 * z + dz) / dz, -(2 * w + dw) / dw);
    mult(this.basisScale, s);
    mult(this.basisOffset, s);
    this.basisOffset.add(p);
    if (changed['view.range'] || touched['stereographic']) {
      return this.trigger({
        type: 'view.range'
      });
    }
  };

  Stereographic4.prototype.transform = function(shader, pass) {
    if (pass === 1) {
      shader.pipe('stereographic4.position', this.uniforms);
    }
    return Stereographic4.__super__.transform.call(this, shader, pass);
  };

  return Stereographic4;

})(View);

module.exports = Stereographic4;


},{"../../../util":148,"./view":96}],96:[function(require,module,exports){
var Transform, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Transform = require('../transform/transform');

View = (function(_super) {
  __extends(View, _super);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.traits = ['node', 'object', 'view', 'transform'];

  View.prototype.make = function() {
    return this._helpers.object.make();
  };

  View.prototype.unmake = function() {
    return this._helpers.object.unmake();
  };

  View.prototype.axis = function(dimension) {
    return this._get('view.range')[dimension - 1];
  };

  return View;

})(Transform);

module.exports = View;


},{"../transform/transform":85}],97:[function(require,module,exports){
var ArrayBuffer_, DataBuffer, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

DataBuffer = require('./databuffer');

Util = require('../../util');


/*
 * 1D + history array
 */

ArrayBuffer_ = (function(_super) {
  __extends(ArrayBuffer_, _super);

  function ArrayBuffer_(renderer, shaders, options) {
    this.length = options.length || 1;
    this.history = options.history || 1;
    this.samples = this.length;
    options.width = this.length;
    options.height = this.history;
    options.depth = 1;
    ArrayBuffer_.__super__.constructor.call(this, renderer, shaders, options);
  }

  ArrayBuffer_.prototype.build = function(options) {
    ArrayBuffer_.__super__.build.apply(this, arguments);
    this.index = 0;
    this.pad = 0;
    return this.streamer = this.generate(this.data);
  };

  ArrayBuffer_.prototype.setActive = function(i) {
    return this.pad = this.length - i;
  };

  ArrayBuffer_.prototype.iterate = function() {
    var callback, count, done, emit, i, limit, reset, skip, _ref;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    _ref = this.streamer, emit = _ref.emit, skip = _ref.skip, count = _ref.count, done = _ref.done, reset = _ref.reset;
    reset();
    limit = this.samples - this.pad;
    i = 0;
    while (!done() && i < limit && callback(emit, i++) !== false) {
      true;
    }
    return Math.floor(count() / this.items);
  };

  ArrayBuffer_.prototype.write = function(n) {
    if (n == null) {
      n = this.samples;
    }
    n *= this.items;
    this.texture.write(this.data, 0, this.index, n, 1);
    this.dataPointer.set(.5, this.index + .5);
    this.index = (this.index + this.history - 1) % this.history;
    return this.filled = Math.min(this.history, this.filled + 1);
  };

  return ArrayBuffer_;

})(DataBuffer);

module.exports = ArrayBuffer_;


},{"../../util":148,"./databuffer":100}],98:[function(require,module,exports){
var Atlas, BackedTexture, DataTexture, Renderable, Row, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

Atlas = (function(_super) {
  __extends(Atlas, _super);

  function Atlas(renderer, shaders, options) {
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
    Atlas.__super__.constructor.call(this, renderer, shaders);
    this.build(options);
  }

  Atlas.prototype.shader = function(shader) {
    shader.pipe("map.2d.data", this.uniforms);
    shader.pipe("sample.2d", this.uniforms);
    if (this.channels < 4) {
      shader.pipe(Util.GLSL.swizzleVec4(['0000', 'x000', 'xw00', 'xyz0'][this.channels]));
    }
    return shader;
  };

  Atlas.prototype.build = function(options) {
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
  };

  Atlas.prototype.reset = function() {
    this.rows = [];
    return this.bottom = 0;
  };

  Atlas.prototype.resize = function(width, height) {
    if (!this.backed) {
      throw "Cannot resize unbacked texture atlas";
    }
    if (width > 2048 && height > 2048) {
      console.warn("Giant atlas " + width + "x" + height + ".");
    } else {
      console.info("Resizing atlas " + width + "x" + height + ".");
    }
    this.texture.resize(width, height);
    this.width = width;
    this.height = height;
    return this.samples = width * height;
  };

  Atlas.prototype.collapse = function(row) {
    var rows;
    rows = this.rows;
    rows.splice(rows.indexOf(row), 1);
    this.bottom = rows[rows.length - 1].bottom;
    if (this.last === row) {
      return this.last = null;
    }
  };

  Atlas.prototype.allocate = function(key, width, height, emit) {
    var bottom, gap, h, i, index, max, row, top, w, _i, _len, _ref;
    w = this.width;
    h = this.height;
    max = height * 2;
    if (width > w) {
      this.resize(w * 2, h * 2);
      this.last = null;
      return this.allocate(key, width, height, emit);
    }
    row = this.last;
    if (row != null) {
      if (row.height >= height && row.height < max && row.width + width <= w) {
        row.append(key, width, height, emit);
        return;
      }
    }
    bottom = 0;
    index = -1;
    top = 0;
    _ref = this.rows;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      row = _ref[i];
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
    if (index >= 0) {
      row = new Row(top, height);
      this.rows.splice(index, 0, row);
    } else {
      top = bottom;
      bottom += height;
      if (bottom >= h) {
        this.resize(w * 2, h * 2);
        this.last = null;
        return this.allocate(key, width, height, emit);
      }
      row = new Row(top, height);
      this.rows.push(row);
      this.bottom = bottom;
    }
    row.append(key, width, height, emit);
    this.last = row;
  };

  Atlas.prototype.read = function() {
    return this.texture.textureObject;
  };

  Atlas.prototype.write = function(data, x, y, w, h) {
    return this.texture.write(data, x, y, w, h);
  };

  Atlas.prototype.dispose = function() {
    this.texture.dispose();
    this.data = null;
    return Atlas.__super__.dispose.apply(this, arguments);
  };

  return Atlas;

})(Renderable);

Row = (function() {
  function Row(top, height) {
    this.top = top;
    this.bottom = top + height;
    this.width = 0;
    this.height = height;
    this.alive = 0;
    this.keys = [];
  }

  Row.prototype.append = function(key, width, height, emit) {
    var x, y;
    x = this.width;
    y = this.top;
    this.alive++;
    this.width += width;
    this.keys.push(key);
    return emit(this, x, y);
  };

  return Row;

})();

module.exports = Atlas;


},{"../../util":148,"../renderable":135,"./texture/backedtexture":107,"./texture/datatexture":108}],99:[function(require,module,exports){
var Buffer, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Util = require('../../util');


/*
 * Base class for sample buffers
 */

Buffer = (function(_super) {
  __extends(Buffer, _super);

  function Buffer(renderer, shaders, options) {
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
    Buffer.__super__.constructor.call(this, renderer, shaders);
  }

  Buffer.prototype.dispose = function() {
    return Buffer.__super__.dispose.apply(this, arguments);
  };

  Buffer.prototype.update = function() {
    var n;
    n = this.iterate();
    this.write(n);
    return n;
  };

  Buffer.prototype.setActive = function(i, j, k, l) {};

  Buffer.prototype.setCallback = function(callback) {
    this.callback = callback;
  };

  Buffer.prototype.write = function() {};

  Buffer.prototype.iterate = function() {};

  Buffer.prototype.generate = function(data) {
    return Util.Data.getStreamer(data, this.samples, this.channels, this.items);
  };

  return Buffer;

})(Renderable);

module.exports = Buffer;


},{"../../util":148,"../renderable":135}],100:[function(require,module,exports){
var Buffer, DataBuffer, DataTexture, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

DataBuffer = (function(_super) {
  __extends(DataBuffer, _super);

  function DataBuffer(renderer, shaders, options) {
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.depth = options.depth || 1;
    if (this.samples == null) {
      this.samples = this.width * this.height * this.depth;
    }
    DataBuffer.__super__.constructor.call(this, renderer, shaders, options);
    this.build(options);
  }

  DataBuffer.prototype.shader = function(shader, indices) {
    if (indices == null) {
      indices = 4;
    }
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
    shader.pipe("map.2d.data", this.uniforms);
    shader.pipe("sample.2d", this.uniforms);
    if (this.channels < 4) {
      shader.pipe(Util.GLSL.swizzleVec4(['0000', 'x000', 'xw00', 'xyz0'][this.channels]));
    }
    return shader;
  };

  DataBuffer.prototype.build = function(options) {
    this.data = new Float32Array(this.samples * this.channels * this.items);
    this.texture = new DataTexture(this.gl, this.items * this.width, this.height * this.depth, this.channels, options);
    this.filled = 0;
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
    return this.dataPointer = this.uniforms.dataPointer.value;
  };

  DataBuffer.prototype.dispose = function() {
    this.data = null;
    this.texture.dispose();
    return DataBuffer.__super__.dispose.apply(this, arguments);
  };

  DataBuffer.prototype.getFilled = function() {
    return this.filled;
  };

  DataBuffer.prototype.copy = function(data) {
    var d, i, n, _i;
    n = Math.min(data.length, this.samples * this.channels * this.items);
    d = this.data;
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      d[i] = data[i];
    }
    return this.write(Math.ceil(n / this.channels / this.items));
  };

  DataBuffer.prototype.write = function(n) {
    var height, width;
    if (n == null) {
      n = this.samples;
    }
    height = n / this.width;
    n *= this.items;
    width = height < 1 ? n : this.items * this.width;
    height = Math.ceil(height);
    this.texture.write(this.data, 0, 0, width, height);
    this.dataPointer.set(.5, .5);
    return this.filled = 1;
  };

  return DataBuffer;

})(Buffer);

module.exports = DataBuffer;


},{"../../util":148,"./buffer":99,"./texture/datatexture":108}],101:[function(require,module,exports){
var DataBuffer, MatrixBuffer, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

DataBuffer = require('./databuffer');

Util = require('../../util');


/*
 * 2D + history array
 */

MatrixBuffer = (function(_super) {
  __extends(MatrixBuffer, _super);

  function MatrixBuffer(renderer, shaders, options) {
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.history = options.history || 1;
    this.samples = this.width * this.height;
    options.depth = this.history;
    MatrixBuffer.__super__.constructor.call(this, renderer, shaders, options);
  }

  MatrixBuffer.prototype.build = function(options) {
    MatrixBuffer.__super__.build.apply(this, arguments);
    this.index = 0;
    this.pad = {
      x: 0,
      y: 0
    };
    return this.streamer = this.generate(this.data);
  };

  MatrixBuffer.prototype.getFilled = function() {
    return this.filled;
  };

  MatrixBuffer.prototype.setActive = function(i, j) {
    var _ref;
    return _ref = [this.width - i, this.height - j], this.pad.x = _ref[0], this.pad.y = _ref[1], _ref;
  };

  MatrixBuffer.prototype.iterate = function() {
    var callback, count, done, emit, i, j, k, limit, n, pad, repeat, reset, skip, _ref;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    _ref = this.streamer, emit = _ref.emit, skip = _ref.skip, count = _ref.count, done = _ref.done, reset = _ref.reset;
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
  };

  MatrixBuffer.prototype.write = function(n) {
    var height, width;
    if (n == null) {
      n = this.samples;
    }
    n *= this.items;
    width = this.width * this.items;
    height = Math.ceil(n / width);
    this.texture.write(this.data, 0, this.index * this.height, width, height);
    this.dataPointer.set(.5, this.index * this.height + .5);
    this.index = (this.index + this.history - 1) % this.history;
    return this.filled = Math.min(this.history, this.filled + 1);
  };

  return MatrixBuffer;

})(DataBuffer);

module.exports = MatrixBuffer;


},{"../../util":148,"./databuffer":100}],102:[function(require,module,exports){
var Memo, RenderToTexture, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

RenderToTexture = require('./rendertotexture');

Util = require('../../util');


/*
 * Wrapped RTT for memoizing 4D arrays back to a 2D texture
 */

Memo = (function(_super) {
  __extends(Memo, _super);

  function Memo(renderer, shaders, options) {
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
    options.format = THREE.RGBAFormat;
    options.width = this._width = this.items * this.width;
    options.height = this._height = this.height * this.depth;
    options.frames = 1;
    delete options.items;
    delete options.depth;
    delete options.channels;
    Memo.__super__.constructor.call(this, renderer, shaders, options);
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

  Memo.prototype.shaderAbsolute = function(shader) {
    if (shader == null) {
      shader = this.shaders.shader();
    }
    shader.pipe('map.xyzw.texture', this.uniforms);
    return Memo.__super__.shaderAbsolute.call(this, shader, 1, 2);
  };

  return Memo;

})(RenderToTexture);

module.exports = Memo;


},{"../../util":148,"../renderable":135,"./rendertotexture":105}],103:[function(require,module,exports){
var Buffer, PushBuffer, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

Util = require('../../util');


/*
 * Buffer for CPU-side use
 */

PushBuffer = (function(_super) {
  __extends(PushBuffer, _super);

  function PushBuffer(renderer, shaders, options) {
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.depth = options.depth || 1;
    if (this.samples == null) {
      this.samples = this.width * this.height * this.depth;
    }
    PushBuffer.__super__.constructor.call(this, renderer, shaders, options);
    this.build(options);
  }

  PushBuffer.prototype.build = function(options) {
    this.data = [];
    this.data.length = this.samples;
    this.filled = 0;
    this.pad = {
      x: 0,
      y: 0,
      z: 0
    };
    return this.streamer = this.generate(this.data);
  };

  PushBuffer.prototype.dispose = function() {
    this.data = null;
    return PushBuffer.__super__.dispose.apply(this, arguments);
  };

  PushBuffer.prototype.getFilled = function() {
    return this.filled;
  };

  PushBuffer.prototype.setActive = function(i, j, k) {
    var _ref;
    return _ref = [this.width - i, this.height - j, this.depth - k], this.pad.x = _ref[0], this.pad.y = _ref[1], this.pad.z = _ref[2], _ref;
  };

  PushBuffer.prototype.read = function() {
    return this.data;
  };

  PushBuffer.prototype.copy = function(data) {
    var d, i, n, _i, _results;
    n = Math.min(data.length, this.samples * this.channels * this.items);
    d = this.data;
    _results = [];
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      _results.push(d[i] = data[i]);
    }
    return _results;
  };

  PushBuffer.prototype.iterate = function() {
    var callback, count, done, emit, i, j, k, l, limit, m, n, o, padX, padY, repeat, reset, skip, _ref;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    _ref = this.streamer, emit = _ref.emit, skip = _ref.skip, count = _ref.count, done = _ref.done, reset = _ref.reset;
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
    return Math.floor(count() / this.items);
  };

  return PushBuffer;

})(Buffer);

module.exports = PushBuffer;


},{"../../util":148,"./buffer":99}],104:[function(require,module,exports){
var Buffer, Memo, MemoScreen, Readback, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Buffer = require('./buffer');

Memo = require('./memo');

MemoScreen = require('../meshes/memoscreen');

Util = require('../../util');


/*
 * Readback up to 4D array of up to 4D data from GL
 */

Readback = (function(_super) {
  __extends(Readback, _super);

  function Readback(renderer, shaders, options) {
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
    this.isFloat = this.type === THREE.FloatType;
    this.active = this.sampled = this.rect = this.pad = null;
    Readback.__super__.constructor.call(this, renderer, shaders);
    this.build(options);

    /*
     * log precision
    gl = @gl
    for name, pass of {Vertex: gl.VERTEX_SHADER, Fragment: gl.FRAGMENT_SHADER}
      bits = for prec in [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT]
        gl.getShaderPrecisionFormat(pass, prec).precision
      console.log name, 'shader precision',  bits
     */
  }

  Readback.prototype.build = function(options) {
    var channels, depth, encoder, h, height, indexer, isIndexed, items, map, sampler, stretch, w, width;
    map = options.map;
    indexer = options.indexer;
    isIndexed = (indexer != null) && !indexer.empty();
    items = this.items, width = this.width, height = this.height, depth = this.depth;
    sampler = map;
    if (isIndexed) {
      this._adopt({
        indexModulus: {
          type: 'v4',
          value: new THREE.Vector4(items, items * width, items * width * height, 1)
        }
      });
      sampler = this.shaders.shader();
      sampler.require(map);
      sampler.require(indexer);
      sampler.pipe('float.index.pack', this.uniforms);
    }
    if (this.isFloat && this.channels > 1) {
      this.floatMemo = new Memo(this.renderer, this.shaders, {
        items: items,
        channels: 4,
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
        depth: depth
      });
      this.floatMemo.adopt(this.floatCompose);
      sampler = this.shaders.shader();
      this.floatMemo.shaderAbsolute(sampler);
    }
    if (this.isFloat) {
      stretch = this.channels;
      channels = 4;
    } else {
      stretch = 1;
      channels = this.channels;
    }
    if (stretch > 1) {
      encoder = this.shaders.shader();
      encoder.pipe(Util.GLSL.mapByte2FloatOffset(stretch));
      encoder.require(sampler);
      encoder.pipe('float.stretch');
      encoder.pipe('float.encode');
      sampler = encoder;
    } else if (this.isFloat) {
      encoder = this.shaders.shader();
      encoder.pipe(sampler);
      encoder.pipe(Util.GLSL.truncateVec4(4, 1));
      encoder.pipe('float.encode');
      sampler = encoder;
    }
    this.byteMemo = new Memo(this.renderer, this.shaders, {
      items: items * stretch,
      channels: 4,
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
      depth: depth
    });
    this.byteMemo.adopt(this.byteCompose);
    w = items * width * stretch;
    h = height * depth;
    this.samples = this.width * this.height * this.depth;
    this.bytes = new Uint8Array(w * h * 4);
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
  };

  Readback.prototype.generate = function(data) {
    return Util.Data.getStreamer(data, this.samples, 4, this.items);
  };

  Readback.prototype.setActive = function(items, width, height, depth) {
    var h, w, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    if (!(items !== this.active.items || width !== this.active.width || height !== this.active.height || depth !== this.active.depth)) {
      return;
    }
    _ref = [items, width, height, depth], this.active.items = _ref[0], this.active.width = _ref[1], this.active.height = _ref[2], this.active.depth = _ref[3];
    if ((_ref1 = this.floatCompose) != null) {
      _ref1.cover(width, height, depth);
    }
    if ((_ref2 = this.byteCompose) != null) {
      _ref2.cover(width * this.stretch, height, depth);
    }
    items = this.items;
    width = this.active.width;
    height = this.depth === 1 ? this.active.height : this.height;
    depth = this.active.depth;
    w = items * width * this.stretch;
    h = height * depth;
    _ref3 = [items, width, height, depth], this.sampled.items = _ref3[0], this.sampled.width = _ref3[1], this.sampled.height = _ref3[2], this.sampled.depth = _ref3[3];
    _ref4 = [w, h], this.rect.w = _ref4[0], this.rect.h = _ref4[1];
    return _ref5 = [this.sampled.width - this.active.width, this.sampled.height - this.active.height, this.sampled.depth - this.active.depth, this.sampled.items - this.active.items], this.pad.x = _ref5[0], this.pad.y = _ref5[1], this.pad.z = _ref5[2], this.pad.w = _ref5[3], _ref5;
  };

  Readback.prototype.update = function(camera) {
    var _ref, _ref1;
    if ((_ref = this.floatMemo) != null) {
      _ref.render(camera);
    }
    return (_ref1 = this.byteMemo) != null ? _ref1.render(camera) : void 0;
  };

  Readback.prototype.post = function() {
    this.renderer.setRenderTarget(this.byteMemo.target.write);
    return this.gl.readPixels(0, 0, this.rect.w, this.rect.h, gl.RGBA, gl.UNSIGNED_BYTE, this.bytes);
  };

  Readback.prototype.readFloat = function(n) {
    var _ref;
    return (_ref = this.floatMemo) != null ? _ref.read(n) : void 0;
  };

  Readback.prototype.readByte = function(n) {
    var _ref;
    return (_ref = this.byteMemo) != null ? _ref.read(n) : void 0;
  };

  Readback.prototype.setCallback = function(callback) {
    return this.emitter = this.callback(callback);
  };

  Readback.prototype.callback = function(callback) {
    var f, m, n, o, p;
    if (!this.isIndexed) {
      return callback;
    }
    n = this.width;
    m = this.height;
    o = this.depth;
    p = this.items;
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
  };

  Readback.prototype.iterate = function() {
    var callback, consume, count, done, emit, i, j, k, l, limit, m, n, o, p, padW, padX, padY, padZ, repeat, reset, skip, _ref;
    emit = this.emitter;
    if (typeof emit.reset === "function") {
      emit.reset();
    }
    _ref = this.streamer, consume = _ref.consume, skip = _ref.skip, count = _ref.count, done = _ref.done, reset = _ref.reset;
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
  };

  Readback.prototype.dispose = function() {
    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    if ((_ref = this.floatMemo) != null) {
      _ref.unadopt(this.floatCompose);
    }
    if ((_ref1 = this.floatMemo) != null) {
      _ref1.dispose();
    }
    if ((_ref2 = this.floatCompose) != null) {
      _ref2.dispose();
    }
    if ((_ref3 = this.byteMemo) != null) {
      _ref3.unadopt(this.byteCompose);
    }
    if ((_ref4 = this.byteMemo) != null) {
      _ref4.dispose();
    }
    if ((_ref5 = this.byteCompose) != null) {
      _ref5.dispose();
    }
    return this.floatMemo = this.byteMemo = this.floatCompose = this.byteCompose = null;
  };

  return Readback;

})(Renderable);

module.exports = Readback;


},{"../../util":148,"../meshes/memoscreen":129,"../renderable":135,"./buffer":99,"./memo":102}],105:[function(require,module,exports){
var RenderTarget, RenderToTexture, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

RenderTarget = require('./texture/rendertarget');

Util = require('../../util');


/*
 * Render-To-Texture with history
 */

RenderToTexture = (function(_super) {
  __extends(RenderToTexture, _super);

  function RenderToTexture(renderer, shaders, options) {
    var _ref;
    this.scene = (_ref = options.scene) != null ? _ref : new THREE.Scene();
    RenderToTexture.__super__.constructor.call(this, renderer, shaders);
    this.build(options);
  }

  RenderToTexture.prototype.shaderRelative = function(shader) {
    if (shader == null) {
      shader = this.shaders.shader();
    }
    return shader.pipe("sample.2d", this.uniforms);
  };

  RenderToTexture.prototype.shaderAbsolute = function(shader, frames, indices) {
    var sample2DArray;
    if (frames == null) {
      frames = 1;
    }
    if (indices == null) {
      indices = 4;
    }
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
  };

  RenderToTexture.prototype.build = function(options) {
    var _base;
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(new THREE.Vector3());
    if (typeof (_base = this.scene).inject === "function") {
      _base.inject();
    }
    this.target = new RenderTarget(this.gl, options.width, options.height, options.frames, options);
    this.target.warmup((function(_this) {
      return function(target) {
        return _this.renderer.setRenderTarget(target);
      };
    })(this));
    this.renderer.setRenderTarget(null);
    this._adopt(this.target.uniforms);
    this._adopt({
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2(.5, .5)
      }
    });
    return this.filled = 0;
  };

  RenderToTexture.prototype.adopt = function(renderable) {
    var object, _i, _len, _ref, _results;
    _ref = renderable.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this.scene.add(object));
    }
    return _results;
  };

  RenderToTexture.prototype.unadopt = function(renderable) {
    var object, _i, _len, _ref, _results;
    _ref = renderable.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this.scene.remove(object));
    }
    return _results;
  };

  RenderToTexture.prototype.render = function(camera) {
    var _ref;
    if (camera == null) {
      camera = this.camera;
    }
    this.renderer.render((_ref = this.scene.scene) != null ? _ref : this.scene, camera, this.target.write);
    this.target.cycle();
    if (this.filled < this.target.frames) {
      return this.filled++;
    }
  };

  RenderToTexture.prototype.read = function(frame) {
    if (frame == null) {
      frame = 0;
    }
    return this.target.reads[Math.abs(frame)];
  };

  RenderToTexture.prototype.getFrames = function() {
    return this.target.frames;
  };

  RenderToTexture.prototype.getFilled = function() {
    return this.filled;
  };

  RenderToTexture.prototype.dispose = function() {
    var _base;
    if (typeof (_base = this.scene).unject === "function") {
      _base.unject();
    }
    this.scene = this.camera = null;
    this.target.dispose();
    return RenderToTexture.__super__.dispose.apply(this, arguments);
  };

  return RenderToTexture;

})(Renderable);

module.exports = RenderToTexture;


},{"../../util":148,"../renderable":135,"./texture/rendertarget":109}],106:[function(require,module,exports){
var Atlas, SCRATCH_SIZE, TextAtlas,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Atlas = require('./atlas');

SCRATCH_SIZE = 512 / 16;


/*
 * Dynamic text atlas
 * - Stores entire strings as sprites
 * - Renders alpha mask (fast) or signed distance field (slow)
 * - Emits (x,y,width,height) pointers into the atlas
 */

TextAtlas = (function(_super) {
  __extends(TextAtlas, _super);

  function TextAtlas(renderer, shaders, options) {
    var ua, _ref, _ref1, _ref2, _ref3;
    this.font = (_ref = options.font) != null ? _ref : 'sans-serif';
    this.size = options.size || 24;
    this.style = (_ref1 = options.style) != null ? _ref1 : 'normal';
    this.outline = (_ref2 = +((_ref3 = options.outline) != null ? _ref3 : 5)) != null ? _ref2 : 0;
    options.width || (options.width = 64);
    options.height || (options.height = 64);
    options.type = THREE.UnsignedByteType;
    options.channels = 1;
    options.backed = true;
    this.gamma = 1;
    if (typeof navigator !== 'undefined') {
      ua = navigator.userAgent;
      if (ua.match(/Chrome/) && ua.match(/OS X/)) {
        this.gamma = .5;
      }
    }
    this.scratchW = this.scratchH = 0;
    TextAtlas.__super__.constructor.call(this, renderer, shaders, options);
  }

  TextAtlas.prototype.build = function(options) {
    var canvas, colors, context, dilate, hex, i, lineHeight, maxWidth, scratch, _i;
    TextAtlas.__super__.build.call(this, options);
    lineHeight = 16;
    lineHeight = this.size;
    lineHeight += 3 + 2 * Math.min(1, this.outline);
    maxWidth = SCRATCH_SIZE * lineHeight;
    canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = lineHeight;
    context = canvas.getContext('2d');
    context.font = "" + this.style + " " + this.size + "px " + this.font;
    context.fillStyle = '#FF0000';
    context.textAlign = 'left';
    context.textBaseline = 'bottom';
    context.lineJoin = 'round';

    /*
    document.body.appendChild canvas
    canvas.setAttribute('style', "position: absolute; top: 0; left: 0; z-index: 100; border: 1px solid red; background: rgba(255,0,255,.25);")
     */
    colors = [];
    dilate = this.outline * 3;
    for (i = _i = 0; 0 <= dilate ? _i < dilate : _i > dilate; i = 0 <= dilate ? ++_i : --_i) {
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
  };

  TextAtlas.prototype.reset = function() {
    TextAtlas.__super__.reset.apply(this, arguments);
    return this.mapped = {};
  };

  TextAtlas.prototype.begin = function() {
    var row, _i, _len, _ref, _results;
    _ref = this.rows;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      row = _ref[_i];
      _results.push(row.alive = 0);
    }
    return _results;
  };

  TextAtlas.prototype.end = function() {
    var key, mapped, row, _i, _j, _len, _len1, _ref, _ref1;
    mapped = this.mapped;
    _ref = this.rows.slice();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      row = _ref[_i];
      if (!(row.alive === 0)) {
        continue;
      }
      _ref1 = row.keys;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        key = _ref1[_j];
        delete mapped[key];
      }
      this.collapse(row);
    }
  };

  TextAtlas.prototype.map = function(text, emit) {
    var allocate, c, data, h, mapped, w, write;
    mapped = this.mapped;
    c = mapped[text];
    if (c != null) {
      c.row.alive++;
      return emit(c.x, c.y, c.w, c.h);
    }
    this.draw(text);
    data = this.scratch;
    w = this.scratchW;
    h = this.scratchH;
    allocate = this._allocate;
    write = this._write;
    return allocate(text, w, h, function(row, x, y) {
      mapped[text] = {
        x: x,
        y: y,
        w: w,
        h: h,
        row: row
      };
      write(data, x, y, w, h);
      return emit(x, y, w, h);
    });
  };

  TextAtlas.prototype.draw = function(text) {
    var a, b, c, colors, ctx, data, dst, gamma, h, i, imageData, j, m, mask, max, o, w, x, y, _i, _j, _k, _ref, _ref1, _ref2;
    w = this.width;
    h = this.lineHeight;
    o = this.outline;
    ctx = this.context;
    dst = this.scratch;
    max = this.maxWidth;
    colors = this.colors;
    x = o + 1;
    y = Math.round(h * 1.05 - 1);
    m = ctx.measureText(text);
    w = Math.min(max, Math.ceil(m.width + 2 * x));
    ctx.clearRect(0, 0, w, h);
    if (this.outline === 0) {
      ctx.fillText(text, x, y);
      data = (imageData = ctx.getImageData(0, 0, w, h)).data;
      j = 3;
      for (i = _i = 0, _ref = data.length / 4; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        dst[i] = data[j];
        j += 4;
      }
      this.scratchW = w;
      return this.scratchH = h;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      for (i = _j = _ref1 = o + 1; _ref1 <= 1 ? _j <= 1 : _j >= 1; i = _ref1 <= 1 ? ++_j : --_j) {
        j = i > 1 ? i * 2 - 2 : i;
        ctx.strokeStyle = colors[j - 1];
        ctx.lineWidth = j;
        ctx.strokeText(text, x, y);
      }
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillText(text, x, y);
      data = (imageData = ctx.getImageData(0, 0, w, h)).data;
      j = 0;
      gamma = this.gamma;
      for (i = _k = 0, _ref2 = data.length / 4; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        a = data[j];
        mask = a ? data[j + 1] / a : 1;
        if (gamma === .5) {
          mask = Math.sqrt(mask);
        }
        mask = Math.min(1, Math.max(0, mask));
        b = 256 - a;
        c = b + (a - b) * mask;
        dst[i] = Math.max(0, Math.min(255, c + 2));
        j += 4;
      }

      /*
      j = 0
      for i in [0...data.length / 4]
        v = dst[i]
         *data[j] = v
         *data[j+1] = v
        data[j+2] = v
        data[j+3] = 255
        j += 4
      ctx.putImageData imageData, 0, 0
       */
      this.scratchW = w;
      return this.scratchH = h;
    }
  };

  return TextAtlas;

})(Atlas);

module.exports = TextAtlas;


},{"./atlas":98}],107:[function(require,module,exports){
var BackedTexture, DataTexture, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Util = require('../../../Util');

DataTexture = require('./datatexture');


/*
Manually allocated GL texture for data streaming, locally backed.

Allows partial updates via subImage.
Contains local copy of its data to allow quick resizing without gl.copyTexImage2d
(which requires render-to-framebuffer)
 */

BackedTexture = (function(_super) {
  __extends(BackedTexture, _super);

  function BackedTexture(gl, width, height, channels, options) {
    BackedTexture.__super__.constructor.call(this, gl, width, height, channels, options);
    this.data = new this.ctor(this.n);
  }

  BackedTexture.prototype.resize = function(width, height) {
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
  };

  BackedTexture.prototype.write = function(src, x, y, w, h) {
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
    return BackedTexture.__super__.write.call(this, src, x, y, w, h);
  };

  BackedTexture.prototype.dispose = function() {
    this.data = null;
    return BackedTexture.__super__.dispose.apply(this, arguments);
  };

  return BackedTexture;

})(DataTexture);

module.exports = BackedTexture;


},{"../../../Util":23,"./datatexture":108}],108:[function(require,module,exports){
var DataTexture, Util;

Util = require('../../../Util');


/*
Manually allocated GL texture for data streaming.

Allows partial updates via subImage.
 */

DataTexture = (function() {
  function DataTexture(gl, width, height, channels, options) {
    var magFilter, minFilter, type, _ref, _ref1, _ref2;
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.channels = channels;
    this.n = this.width * this.height * this.channels;
    gl = this.gl;
    minFilter = (_ref = options.minFilter) != null ? _ref : THREE.NearestFilter;
    magFilter = (_ref1 = options.magFilter) != null ? _ref1 : THREE.NearestFilter;
    type = (_ref2 = options.type) != null ? _ref2 : THREE.FloatType;
    this.minFilter = Util.Three.paramToGL(gl, minFilter);
    this.magFilter = Util.Three.paramToGL(gl, minFilter);
    this.type = Util.Three.paramToGL(gl, type);
    this.ctor = Util.Three.paramToArrayStorage(type);
    this.build();
  }

  DataTexture.prototype.build = function() {
    var gl;
    gl = this.gl;
    this.texture = gl.createTexture();
    this.format = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][this.channels];
    this.format3 = [null, THREE.LuminanceFormat, THREE.LuminanceAlphaFormat, THREE.RGBFormat, THREE.RGBAFormat][this.channels];
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
    this.data = new this.ctor(this.n);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, this.data);
    this.textureObject = new THREE.Texture(new Image(), THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
    this.textureObject.__webglInit = true;
    this.textureObject.__webglTexture = this.texture;
    this.textureObject.format = this.format3;
    this.textureObject.type = THREE.FloatType;
    this.textureObject.unpackAlignment = 1;
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
  };

  DataTexture.prototype.write = function(data, x, y, w, h) {
    var gl;
    gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    return gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, this.format, this.type, data);
  };

  DataTexture.prototype.dispose = function() {
    this.gl.deleteTexture(this.texture);
    this.textureObject.__webglInit = false;
    this.textureObject.__webglTexture = null;
    return this.textureObject = this.texture = null;
  };

  return DataTexture;

})();

module.exports = DataTexture;


},{"../../../Util":23}],109:[function(require,module,exports){

/*
Virtual RenderTarget that cycles through multiple frames
Provides easy access to past rendered frames
@reads[] and @write contain THREE.WebGLRenderTargets whose internal pointers are rotated automatically
 */
var RenderTarget;

RenderTarget = (function() {
  function RenderTarget(gl, width, height, frames, options) {
    this.gl = gl;
    if (options == null) {
      options = {};
    }
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

  RenderTarget.prototype.build = function() {
    var i, make;
    make = (function(_this) {
      return function() {
        return new THREE.WebGLRenderTarget(_this.width, _this.height, _this.options);
      };
    })(this);
    this.targets = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.buffers; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(make());
      }
      return _results;
    }).call(this);
    this.reads = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.buffers; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(make());
      }
      return _results;
    }).call(this);
    this.write = make();
    this.index = 0;
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
  };

  RenderTarget.prototype.cycle = function() {
    var add, buffers, copy, i, keys, read, _i, _len, _ref;
    keys = ['__webglTexture', '__webglFramebuffer', '__webglRenderbuffer'];
    buffers = this.buffers;
    copy = function(a, b) {
      var key, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        b[key] = a[key];
      }
      return null;
    };
    add = function(i, j) {
      return (i + j + buffers * 2) % buffers;
    };
    copy(this.write, this.targets[this.index]);
    _ref = this.reads;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      read = _ref[i];
      copy(this.targets[add(this.index, -i)], read);
    }
    this.index = add(this.index, 1);
    return copy(this.targets[this.index], this.write);
  };

  RenderTarget.prototype.warmup = function(callback) {
    var i, _i, _ref, _results;
    _results = [];
    for (i = _i = 0, _ref = this.buffers; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      callback(this.write);
      _results.push(this.cycle());
    }
    return _results;
  };

  RenderTarget.prototype.dispose = function() {
    var target, _i, _len, _ref;
    _ref = this.targets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      target = _ref[_i];
      target.dispose();
    }
    return this.targets = this.reads = this.write = null;
  };

  return RenderTarget;

})();

module.exports = RenderTarget;


},{}],110:[function(require,module,exports){
var DataBuffer, Util, VoxelBuffer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

DataBuffer = require('./databuffer');

Util = require('../../util');

VoxelBuffer = (function(_super) {
  __extends(VoxelBuffer, _super);

  function VoxelBuffer() {
    return VoxelBuffer.__super__.constructor.apply(this, arguments);
  }

  VoxelBuffer.prototype.build = function(options) {
    VoxelBuffer.__super__.build.apply(this, arguments);
    this.pad = {
      x: 0,
      y: 0,
      z: 0
    };
    return this.streamer = this.generate(this.data);
  };

  VoxelBuffer.prototype.getFilled = function() {
    return this.filled;
  };

  VoxelBuffer.prototype.setActive = function(i, j, k) {
    var _ref;
    return _ref = [this.width - i, this.height - j, this.depth - k], this.pad.x = _ref[0], this.pad.y = _ref[1], this.pad.z = _ref[2], _ref;
  };

  VoxelBuffer.prototype.iterate = function() {
    var callback, count, done, emit, i, j, k, l, limit, m, n, o, padX, padY, repeat, reset, skip, _ref;
    callback = this.callback;
    if (typeof callback.reset === "function") {
      callback.reset();
    }
    _ref = this.streamer, emit = _ref.emit, skip = _ref.skip, count = _ref.count, done = _ref.done, reset = _ref.reset;
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
  };

  return VoxelBuffer;

})(DataBuffer);

module.exports = VoxelBuffer;


},{"../../util":148,"./databuffer":100}],111:[function(require,module,exports){
var Camera, Renderable,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('./renderable');


/*
 Holds the external camera
 */

Camera = (function(_super) {
  __extends(Camera, _super);

  function Camera(renderer, shaders, options) {
    Camera.__super__.constructor.call(this, renderer, shaders, options);
    if ((options != null ? options.camera : void 0) != null) {
      this.camera = options.camera;
    }
    if (this.camera == null) {
      this.camera = new THREE.PerspectiveCamera;
    }
  }

  Camera.prototype.get = function() {
    return this.camera;
  };

  Camera.prototype.dispose = function() {
    return delete this.camera;
  };

  return Camera;

})(Renderable);

module.exports = Camera;


},{"./renderable":135}],112:[function(require,module,exports){
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
  scene: require('./scene'),
  camera: require('./camera')
};

module.exports = Classes;


},{"./buffer/arraybuffer":97,"./buffer/atlas":98,"./buffer/databuffer":100,"./buffer/matrixbuffer":101,"./buffer/memo":102,"./buffer/pushbuffer":103,"./buffer/readback":104,"./buffer/rendertotexture":105,"./buffer/textatlas":106,"./buffer/voxelbuffer":110,"./camera":111,"./meshes/arrow":124,"./meshes/debug":126,"./meshes/face":127,"./meshes/line":128,"./meshes/memoscreen":129,"./meshes/point":130,"./meshes/screen":131,"./meshes/sprite":132,"./meshes/strip":133,"./meshes/surface":134,"./scene":136}],113:[function(require,module,exports){
var RenderFactory;

RenderFactory = (function() {
  function RenderFactory(classes, renderer, shaders) {
    this.classes = classes;
    this.renderer = renderer;
    this.shaders = shaders;
  }

  RenderFactory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  RenderFactory.prototype.make = function(type, options) {
    return new this.classes[type](this.renderer, this.shaders, options);
  };

  return RenderFactory;

})();

module.exports = RenderFactory;


},{}],114:[function(require,module,exports){
var ArrowGeometry, Geometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');


/*
Cones to attach as arrowheads on line strips

.....> .....> .....> .....>

.....> .....> .....> .....>

.....> .....> .....> .....>
 */

ArrowGeometry = (function(_super) {
  __extends(ArrowGeometry, _super);

  function ArrowGeometry(options) {
    var a, anchor, angle, arrow, arrows, attach, b, back, base, c, circle, far, flip, i, index, k, l, layers, near, points, position, ribbons, samples, sides, step, strips, tip, triangles, x, y, z, _i, _j, _k, _l, _m, _n, _o, _ref, _ref1;
    ArrowGeometry.__super__.constructor.call(this, options);
    this.geometryClip = new THREE.Vector4;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: 'v4',
      value: this.geometryClip
    };
    this.sides = sides = +options.sides || 12;
    this.samples = samples = +options.samples || 2;
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.layers = layers = +options.layers || 1;
    this.flip = flip = (_ref = options.flip) != null ? _ref : false;
    this.anchor = anchor = (_ref1 = options.anchor) != null ? _ref1 : flip ? 0 : samples - 1;
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
    for (k = _i = 0; 0 <= sides ? _i < sides : _i > sides; k = 0 <= sides ? ++_i : --_i) {
      angle = k / sides * τ;
      circle.push([Math.cos(angle), Math.sin(angle), 1]);
    }
    base = 0;
    for (i = _j = 0; 0 <= arrows ? _j < arrows : _j > arrows; i = 0 <= arrows ? ++_j : --_j) {
      tip = base++;
      back = tip + sides + 1;
      for (k = _k = 0; 0 <= sides ? _k < sides : _k > sides; k = 0 <= sides ? ++_k : --_k) {
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
    for (l = _l = 0; 0 <= layers ? _l < layers : _l > layers; l = 0 <= layers ? ++_l : --_l) {
      for (z = _m = 0; 0 <= ribbons ? _m < ribbons : _m > ribbons; z = 0 <= ribbons ? ++_m : --_m) {
        for (y = _n = 0; 0 <= strips ? _n < strips : _n > strips; y = 0 <= strips ? ++_n : --_n) {
          position(x, y, z, l);
          arrow(0, 0, 0);
          attach(near, far);
          for (k = _o = 0; 0 <= sides ? _o < sides : _o > sides; k = 0 <= sides ? ++_o : --_o) {
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

  ArrowGeometry.prototype.clip = function(samples, strips, ribbons, layers) {
    var dims, maxs, quads, segments;
    if (samples == null) {
      samples = this.samples;
    }
    if (strips == null) {
      strips = this.strips;
    }
    if (ribbons == null) {
      ribbons = this.ribbons;
    }
    if (layers == null) {
      layers = this.layers;
    }
    segments = Math.max(0, samples - 1);
    this.geometryClip.set(segments, strips, ribbons, layers);
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
  };

  return ArrowGeometry;

})(Geometry);

module.exports = ArrowGeometry;


},{"./geometry":116}],115:[function(require,module,exports){
var FaceGeometry, Geometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');


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

FaceGeometry = (function(_super) {
  __extends(FaceGeometry, _super);

  function FaceGeometry(options) {
    var base, depth, height, i, index, items, j, l, points, position, samples, sides, triangles, width, x, y, z, _i, _j, _k, _l, _m, _n;
    FaceGeometry.__super__.constructor.call(this, options);
    this.geometryClip = new THREE.Vector4;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: 'v4',
      value: this.geometryClip
    };
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
    for (i = _i = 0; 0 <= samples ? _i < samples : _i > samples; i = 0 <= samples ? ++_i : --_i) {
      for (j = _j = 0; 0 <= sides ? _j < sides : _j > sides; j = 0 <= sides ? ++_j : --_j) {
        index(base);
        index(base + j + 1);
        index(base + j + 2);
      }
      base += items;
    }
    for (z = _k = 0; 0 <= depth ? _k < depth : _k > depth; z = 0 <= depth ? ++_k : --_k) {
      for (y = _l = 0; 0 <= height ? _l < height : _l > height; y = 0 <= height ? ++_l : --_l) {
        for (x = _m = 0; 0 <= width ? _m < width : _m > width; x = 0 <= width ? ++_m : --_m) {
          for (l = _n = 0; 0 <= items ? _n < items : _n > items; l = 0 <= items ? ++_n : --_n) {
            position(x, y, z, l);
          }
        }
      }
    }
    this._finalize();
    this.clip();
    return;
  }

  FaceGeometry.prototype.clip = function(width, height, depth, items) {
    var dims, maxs, sides, tris;
    if (width == null) {
      width = this.width;
    }
    if (height == null) {
      height = this.height;
    }
    if (depth == null) {
      depth = this.depth;
    }
    if (items == null) {
      items = this.items;
    }
    sides = Math.max(0, items - 2);
    this.geometryClip.set(width, height, depth, items);
    dims = [depth, height, width, sides];
    maxs = [this.depth, this.height, this.width, this.sides];
    tris = this._reduce(dims, maxs);
    return this._offsets([
      {
        start: 0,
        count: tris * 3
      }
    ]);
  };

  return FaceGeometry;

})(Geometry);

module.exports = FaceGeometry;


},{"./geometry":116}],116:[function(require,module,exports){
var Geometry, debug, tick,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

debug = false;

tick = function() {
  var now;
  now = +(new Date);
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

Geometry = (function(_super) {
  __extends(Geometry, _super);

  function Geometry() {
    THREE.BufferGeometry.call(this);
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

  Geometry.prototype._reduce = function(dims, maxs) {
    var dim, i, max, multiple, quads, _i, _len;
    multiple = false;
    for (i = _i = 0, _len = dims.length; _i < _len; i = ++_i) {
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
  };

  Geometry.prototype._emitter = function(name) {
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
  };

  Geometry.prototype._autochunk = function() {
    var array, attribute, indexed, name, numItems, _ref;
    indexed = this.attributes.index;
    _ref = this.attributes;
    for (name in _ref) {
      attribute = _ref[name];
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
  };

  Geometry.prototype._finalize = function() {
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
  };

  Geometry.prototype._chunks = function(array, limit) {
    var a, b, chunks, end, i, j1, j2, j3, jmax, jmin, last, n, o, push, start, _i;
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
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
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
  };

  Geometry.prototype._chunkify = function(attrib, chunks) {
    var chunk, from, i, offset, to, _i, _j, _len, _ref, _ref1;
    if (!attrib.u16) {
      return;
    }
    from = attrib.array;
    to = attrib.u16;
    for (_i = 0, _len = chunks.length; _i < _len; _i++) {
      chunk = chunks[_i];
      offset = chunk.index;
      for (i = _j = _ref = chunk.start, _ref1 = chunk.end; _ref <= _ref1 ? _j < _ref1 : _j > _ref1; i = _ref <= _ref1 ? ++_j : --_j) {
        to[i] = from[i] - offset;
      }
    }
    attrib.array = attrib.u16;
    return delete attrib.u16;
  };

  Geometry.prototype._offsets = function(offsets) {
    var chunk, chunks, end, offset, out, start, _end, _i, _j, _len, _len1, _start;
    if (!this.chunked) {
      this.offsets = offsets;
    } else {
      chunks = this.chunks;
      out = this.offsets;
      out.length = null;
      for (_i = 0, _len = offsets.length; _i < _len; _i++) {
        offset = offsets[_i];
        start = offset.start;
        end = offset.count - start;
        for (_j = 0, _len1 = chunks.length; _j < _len1; _j++) {
          chunk = chunks[_j];
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
  };

  return Geometry;

})(THREE.BufferGeometry);

module.exports = Geometry;


},{}],117:[function(require,module,exports){
exports.Geometry = require('./geometry');

exports.ArrowGeometry = require('./arrowgeometry');

exports.FaceGeometry = require('./facegeometry');

exports.LineGeometry = require('./linegeometry');

exports.ScreenGeometry = require('./screengeometry');

exports.SpriteGeometry = require('./spritegeometry');

exports.StripGeometry = require('./stripgeometry');

exports.SurfaceGeometry = require('./surfacegeometry');


},{"./arrowgeometry":114,"./facegeometry":115,"./geometry":116,"./linegeometry":118,"./screengeometry":119,"./spritegeometry":120,"./stripgeometry":121,"./surfacegeometry":122}],118:[function(require,module,exports){
var Geometry, LineGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');


/*
Line strips arranged in columns and rows

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+
 */

LineGeometry = (function(_super) {
  __extends(LineGeometry, _super);

  function LineGeometry(options) {
    var base, edge, i, index, j, k, l, layers, line, points, position, quads, ribbons, samples, segments, strip, strips, triangles, x, y, z, _i, _j, _k, _l, _m, _n, _o, _ref;
    LineGeometry.__super__.constructor.call(this, options);
    this.geometryClip = new THREE.Vector4;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: 'v4',
      value: this.geometryClip
    };
    this.samples = samples = +options.samples || 2;
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.layers = layers = +options.layers || 1;
    this.segments = segments = samples - 1;
    points = samples * strips * ribbons * layers * 2;
    quads = segments * strips * ribbons * layers;
    triangles = quads * 2;
    this.addAttribute('index', new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1));
    this.addAttribute('position4', new THREE.BufferAttribute(new Float32Array(points * 4), 4));
    this.addAttribute('line', new THREE.BufferAttribute(new Float32Array(points * 2), 2));
    this.addAttribute('strip', new THREE.BufferAttribute(new Float32Array(points * 2), 2));
    this._autochunk();
    index = this._emitter('index');
    position = this._emitter('position4');
    line = this._emitter('line');
    strip = this._emitter('strip');
    base = 0;
    for (i = _i = 0, _ref = ribbons * layers; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0; 0 <= strips ? _j < strips : _j > strips; j = 0 <= strips ? ++_j : --_j) {
        for (k = _k = 0; 0 <= segments ? _k < segments : _k > segments; k = 0 <= segments ? ++_k : --_k) {
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
    for (l = _l = 0; 0 <= layers ? _l < layers : _l > layers; l = 0 <= layers ? ++_l : --_l) {
      for (z = _m = 0; 0 <= ribbons ? _m < ribbons : _m > ribbons; z = 0 <= ribbons ? ++_m : --_m) {
        for (y = _n = 0; 0 <= strips ? _n < strips : _n > strips; y = 0 <= strips ? ++_n : --_n) {
          for (x = _o = 0; 0 <= samples ? _o < samples : _o > samples; x = 0 <= samples ? ++_o : --_o) {
            edge = x === 0 ? -1 : x === segments ? 1 : 0;
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
    this._finalize();
    this.clip();
    return;
  }

  LineGeometry.prototype.clip = function(samples, strips, ribbons, layers) {
    var dims, maxs, quads, segments;
    if (samples == null) {
      samples = this.samples;
    }
    if (strips == null) {
      strips = this.strips;
    }
    if (ribbons == null) {
      ribbons = this.ribbons;
    }
    if (layers == null) {
      layers = this.layers;
    }
    segments = samples - 1;
    this.geometryClip.set(segments, strips - 1, ribbons - 1, layers - 1);
    dims = [layers, ribbons, strips, segments];
    maxs = [this.layers, this.ribbons, this.strips, this.segments];
    quads = this._reduce(dims, maxs);
    return this._offsets([
      {
        start: 0,
        count: quads * 6
      }
    ]);
  };

  return LineGeometry;

})(Geometry);

module.exports = LineGeometry;


},{"./geometry":116}],119:[function(require,module,exports){
var ScreenGeometry, SurfaceGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

ScreenGeometry = (function(_super) {
  __extends(ScreenGeometry, _super);

  function ScreenGeometry(options) {
    var _ref, _ref1;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryScale = {
      type: 'v4',
      value: new THREE.Vector4
    };
    options.width = Math.max(2, (_ref = +options.width) != null ? _ref : 2);
    options.height = Math.max(2, (_ref1 = +options.height) != null ? _ref1 : 2);
    this.cover();
    ScreenGeometry.__super__.constructor.call(this, options);
  }

  ScreenGeometry.prototype.cover = function(scaleX, scaleY, scaleZ, scaleW) {
    this.scaleX = scaleX != null ? scaleX : 1;
    this.scaleY = scaleY != null ? scaleY : 1;
    this.scaleZ = scaleZ != null ? scaleZ : 1;
    this.scaleW = scaleW != null ? scaleW : 1;
  };

  ScreenGeometry.prototype.clip = function(width, height, surfaces, layers) {
    var invert;
    if (width == null) {
      width = this.width;
    }
    if (height == null) {
      height = this.height;
    }
    if (surfaces == null) {
      surfaces = this.surfaces;
    }
    if (layers == null) {
      layers = this.layers;
    }
    ScreenGeometry.__super__.clip.call(this, width, height, surfaces, layers);
    invert = function(x) {
      return 1 / Math.max(1, x - 1);
    };
    return this.uniforms.geometryScale.value.set(invert(width) * this.scaleX, invert(height) * this.scaleY, invert(surfaces) * this.scaleZ, invert(layers) * this.scaleW);
  };

  return ScreenGeometry;

})(SurfaceGeometry);

module.exports = ScreenGeometry;


},{"./surfacegeometry":122}],120:[function(require,module,exports){
var Geometry, SpriteGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');


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

SpriteGeometry = (function(_super) {
  __extends(SpriteGeometry, _super);

  function SpriteGeometry(options) {
    var base, depth, height, i, index, items, l, points, position, quad, samples, sprite, triangles, v, width, x, y, z, _i, _j, _k, _l, _len, _m, _n;
    SpriteGeometry.__super__.constructor.call(this, options);
    this.geometryClip = new THREE.Vector4;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: 'v4',
      value: this.geometryClip
    };
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
    for (i = _i = 0; 0 <= samples ? _i < samples : _i > samples; i = 0 <= samples ? ++_i : --_i) {
      index(base);
      index(base + 1);
      index(base + 2);
      index(base + 1);
      index(base + 2);
      index(base + 3);
      base += 4;
    }
    for (z = _j = 0; 0 <= depth ? _j < depth : _j > depth; z = 0 <= depth ? ++_j : --_j) {
      for (y = _k = 0; 0 <= height ? _k < height : _k > height; y = 0 <= height ? ++_k : --_k) {
        for (x = _l = 0; 0 <= width ? _l < width : _l > width; x = 0 <= width ? ++_l : --_l) {
          for (l = _m = 0; 0 <= items ? _m < items : _m > items; l = 0 <= items ? ++_m : --_m) {
            for (_n = 0, _len = quad.length; _n < _len; _n++) {
              v = quad[_n];
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

  SpriteGeometry.prototype.clip = function(width, height, depth, items) {
    var dims, maxs, quads;
    if (width == null) {
      width = this.width;
    }
    if (height == null) {
      height = this.height;
    }
    if (depth == null) {
      depth = this.depth;
    }
    if (items == null) {
      items = this.items;
    }
    this.geometryClip.set(width, height, depth, items);
    dims = [depth, height, width, items];
    maxs = [this.depth, this.height, this.width, this.items];
    quads = this._reduce(dims, maxs);
    return this._offsets([
      {
        start: 0,
        count: quads * 6
      }
    ]);
  };

  return SpriteGeometry;

})(Geometry);

module.exports = SpriteGeometry;


},{"./geometry":116}],121:[function(require,module,exports){
var Geometry, StripGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');


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

StripGeometry = (function(_super) {
  __extends(StripGeometry, _super);

  function StripGeometry(options) {
    var base, depth, f, height, i, index, items, j, l, last, o, points, position, samples, sides, strip, triangles, width, x, y, z, _i, _j, _k, _l, _m, _n;
    StripGeometry.__super__.constructor.call(this, options);
    this.geometryClip = new THREE.Vector4;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: 'v4',
      value: this.geometryClip
    };
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
    for (i = _i = 0; 0 <= samples ? _i < samples : _i > samples; i = 0 <= samples ? ++_i : --_i) {
      o = base;
      for (j = _j = 0; 0 <= sides ? _j < sides : _j > sides; j = 0 <= sides ? ++_j : --_j) {
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
    for (z = _k = 0; 0 <= depth ? _k < depth : _k > depth; z = 0 <= depth ? ++_k : --_k) {
      for (y = _l = 0; 0 <= height ? _l < height : _l > height; y = 0 <= height ? ++_l : --_l) {
        for (x = _m = 0; 0 <= width ? _m < width : _m > width; x = 0 <= width ? ++_m : --_m) {
          f = 1;
          position(x, y, z, 0);
          strip(1, 2, f);
          for (l = _n = 1; 1 <= last ? _n < last : _n > last; l = 1 <= last ? ++_n : --_n) {
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

  StripGeometry.prototype.clip = function(width, height, depth, items) {
    var dims, maxs, sides, tris;
    if (width == null) {
      width = this.width;
    }
    if (height == null) {
      height = this.height;
    }
    if (depth == null) {
      depth = this.depth;
    }
    if (items == null) {
      items = this.items;
    }
    sides = Math.max(0, items - 2);
    this.geometryClip.set(width, height, depth, items);
    dims = [depth, height, width, sides];
    maxs = [this.depth, this.height, this.width, this.sides];
    tris = this._reduce(dims, maxs);
    return this._offsets([
      {
        start: 0,
        count: tris * 3
      }
    ]);
  };

  return StripGeometry;

})(Geometry);

module.exports = StripGeometry;


},{"./geometry":116}],122:[function(require,module,exports){
var Geometry, SurfaceGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');


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

SurfaceGeometry = (function(_super) {
  __extends(SurfaceGeometry, _super);

  function SurfaceGeometry(options) {
    var base, edgeX, edgeY, height, i, index, j, k, l, layers, points, position, quads, segmentsX, segmentsY, surface, surfaces, triangles, width, x, y, z, _i, _j, _k, _l, _m, _n, _o, _ref;
    SurfaceGeometry.__super__.constructor.call(this, options);
    this.geometryClip = new THREE.Vector4;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: 'v4',
      value: this.geometryClip
    };
    this.width = width = +options.width || 2;
    this.height = height = +options.height || 2;
    this.surfaces = surfaces = +options.surfaces || 1;
    this.layers = layers = +options.layers || 1;
    this.segmentsX = segmentsX = width - 1;
    this.segmentsY = segmentsY = height - 1;
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
    for (i = _i = 0, _ref = surfaces * layers; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0; 0 <= segmentsY ? _j < segmentsY : _j > segmentsY; j = 0 <= segmentsY ? ++_j : --_j) {
        for (k = _k = 0; 0 <= segmentsX ? _k < segmentsX : _k > segmentsX; k = 0 <= segmentsX ? ++_k : --_k) {
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
    for (l = _l = 0; 0 <= layers ? _l < layers : _l > layers; l = 0 <= layers ? ++_l : --_l) {
      for (z = _m = 0; 0 <= surfaces ? _m < surfaces : _m > surfaces; z = 0 <= surfaces ? ++_m : --_m) {
        for (y = _n = 0; 0 <= height ? _n < height : _n > height; y = 0 <= height ? ++_n : --_n) {
          edgeY = y === 0 ? -1 : y === segmentsY ? 1 : 0;
          for (x = _o = 0; 0 <= width ? _o < width : _o > width; x = 0 <= width ? ++_o : --_o) {
            edgeX = x === 0 ? -1 : x === segmentsX ? 1 : 0;
            position(x, y, z, l);
            surface(edgeX, edgeY);
          }
        }
      }
    }
    this._finalize();
    this.clip();
    return;
  }

  SurfaceGeometry.prototype.clip = function(width, height, surfaces, layers) {
    var dims, maxs, quads, segmentsX, segmentsY;
    if (width == null) {
      width = this.width;
    }
    if (height == null) {
      height = this.height;
    }
    if (surfaces == null) {
      surfaces = this.surfaces;
    }
    if (layers == null) {
      layers = this.layers;
    }
    segmentsX = Math.max(0, width - 1);
    segmentsY = Math.max(0, height - 1);
    this.geometryClip.set(segmentsX, segmentsY, surfaces, layers);
    dims = [layers, surfaces, segmentsY, segmentsX];
    maxs = [this.layers, this.surfaces, this.segmentsY, this.segmentsX];
    quads = this._reduce(dims, maxs);
    return this._offsets([
      {
        start: 0,
        count: quads * 6
      }
    ]);
  };

  return SurfaceGeometry;

})(Geometry);

module.exports = SurfaceGeometry;


},{"./geometry":116}],123:[function(require,module,exports){
exports.Scene = require('./scene');

exports.Factory = require('./factory');

exports.Renderable = require('./scene');

exports.Classes = require('./classes');


},{"./classes":112,"./factory":113,"./scene":136}],124:[function(require,module,exports){
var Arrow, ArrowGeometry, Base,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

ArrowGeometry = require('../geometry').ArrowGeometry;

Arrow = (function(_super) {
  __extends(Arrow, _super);

  function Arrow(renderer, shaders, options) {
    var color, f, factory, hasStyle, object, position, uniforms, v, _ref;
    Arrow.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
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
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (position) {
      v.require(position);
    }
    v.pipe('arrow.position', this.uniforms);
    v.pipe('project.position', this.uniforms);
    f = factory.fragment;
    if (hasStyle) {
      f.pipe('style.color', this.uniforms);
    }
    if (color && hasStyle) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    if (color && !hasStyle) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      index0AttributeName: "position4"
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;
    this._raw(object);
    this.objects = [object];
  }

  Arrow.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return Arrow.__super__.dispose.apply(this, arguments);
  };

  return Arrow;

})(Base);

module.exports = Arrow;


},{"../geometry":117,"./base":125}],125:[function(require,module,exports){
var Base, Renderable,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Base = (function(_super) {
  __extends(Base, _super);

  function Base(renderer, shaders, options) {
    var _ref;
    Base.__super__.constructor.call(this, renderer, shaders, options);
    this.zUnits = (_ref = options.zUnits) != null ? _ref : 0;
  }

  Base.prototype.raw = function() {
    var object, _i, _len, _ref;
    _ref = this.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this._raw(object);
    }
    return null;
  };

  Base.prototype.depth = function(write, test) {
    var object, _i, _len, _ref;
    _ref = this.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this._depth(object, write, test);
    }
    return null;
  };

  Base.prototype.polygonOffset = function(factor, units) {
    var object, _i, _len, _ref;
    _ref = this.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this._polygonOffset(object, factor, units);
    }
    return null;
  };

  Base.prototype.show = function(transparent, blending, order) {
    var object, _i, _len, _ref, _results;
    _ref = this.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      _results.push(this._show(object, transparent, blending, order));
    }
    return _results;
  };

  Base.prototype.hide = function() {
    var object, _i, _len, _ref;
    _ref = this.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this._hide(object);
    }
    return null;
  };

  Base.prototype._material = function(options) {
    var key, material, _i, _len, _ref;
    material = new THREE.ShaderMaterial(options);
    _ref = ['vertexGraph', 'fragmentGraph'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      material[key] = options[key];
    }
    return material;
  };

  Base.prototype._raw = function(object) {
    object.rotationAutoUpdate = false;
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;
    return object.material.defaultAttributeValues = void 0;
  };

  Base.prototype._depth = function(object, write, test) {
    var m;
    m = object.material;
    m.depthWrite = write;
    return m.depthTest = test;
  };

  Base.prototype._polygonOffset = function(object, factor, units) {
    var enabled, m;
    units -= this.zUnits;
    enabled = units !== 0;
    m = object.material;
    m.polygonOffset = enabled;
    if (enabled) {
      m.polygonOffsetFactor = factor;
      return m.polygonOffsetUnits = units;
    }
  };

  Base.prototype._show = function(object, transparent, blending, order) {
    var m;
    transparent = true;
    m = object.material;
    object.renderOrder = -order;
    object.visible = true;
    m.transparent = transparent;
    m.blending = blending;
    return null;
  };

  Base.prototype._hide = function(object) {
    return object.visible = false;
  };

  return Base;

})(Renderable);

module.exports = Base;


},{"../renderable":135}],126:[function(require,module,exports){
var Base, Debug,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

Debug = (function(_super) {
  __extends(Debug, _super);

  function Debug(renderer, shaders, options) {
    var object;
    Debug.__super__.constructor.call(this, renderer, shaders, options);
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

  Debug.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return Debug.__super__.dispose.apply(this, arguments);
  };

  return Debug;

})(Base);

module.exports = Debug;


},{"./base":125}],127:[function(require,module,exports){
var Base, Face, FaceGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

FaceGeometry = require('../geometry').FaceGeometry;

Face = (function(_super) {
  __extends(Face, _super);

  function Face(renderer, shaders, options) {
    var color, f, factory, hasStyle, object, position, shaded, uniforms, v, _ref, _ref1;
    Face.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    shaded = (_ref1 = options.shaded) != null ? _ref1 : true;
    color = options.color;
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
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (position) {
      v.require(position);
    }
    v.split();
    if (!shaded) {
      v.pipe('face.position', this.uniforms);
    }
    if (shaded) {
      v.pipe('face.position.normal', this.uniforms);
    }
    v.pass();
    v.pipe('project.position', this.uniforms);
    f = factory.fragment;
    if (!shaded && hasStyle) {
      f.pipe('style.color', this.uniforms);
    }
    if (shaded && hasStyle) {
      f.pipe('style.color.shaded', this.uniforms);
    }
    if (color && hasStyle) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    if (color && !hasStyle) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.objects = [object];
  }

  Face.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return Face.__super__.dispose.apply(this, arguments);
  };

  return Face;

})(Base);

module.exports = Face;


},{"../geometry":117,"./base":125}],128:[function(require,module,exports){
var Base, Line, LineGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

LineGeometry = require('../geometry').LineGeometry;

Line = (function(_super) {
  __extends(Line, _super);

  function Line(renderer, shaders, options) {
    var clip, color, defs, f, factory, hasStyle, object, position, stroke, uniforms, v, _ref;
    Line.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
    clip = options.clip;
    stroke = options.stroke;
    stroke = [null, 'dotted', 'dashed'][stroke];
    hasStyle = uniforms.styleColor != null;
    this.geometry = new LineGeometry({
      samples: options.samples,
      strips: options.strips,
      ribbons: options.ribbons,
      layers: options.layers,
      anchor: options.anchor
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
    v = factory.vertex;
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (position) {
      v.require(position);
    }
    v.pipe('line.position', this.uniforms, defs);
    v.pipe('project.position', this.uniforms);
    f = factory.fragment;
    if (stroke) {
      f.pipe("fragment.clip." + stroke, this.uniforms);
    }
    if (clip) {
      f.pipe('fragment.clip.ends', this.uniforms);
    }
    if (hasStyle) {
      f.pipe('style.color', this.uniforms);
    }
    if (color && hasStyle) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    if (color && !hasStyle) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.objects = [object];
  }

  Line.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return Line.__super__.dispose.apply(this, arguments);
  };

  return Line;

})(Base);

module.exports = Line;


},{"../geometry":117,"./base":125}],129:[function(require,module,exports){
var MemoScreen, Screen, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Screen = require('./screen');

Util = require('../../util');

MemoScreen = (function(_super) {
  __extends(MemoScreen, _super);

  function MemoScreen(renderer, shaders, options) {
    var depth, height, items, map, object, uniforms, width, _i, _len, _ref;
    this.memo = (items = options.items, width = options.width, height = options.height, depth = options.depth, options);
    uniforms = {
      remap2DScale: {
        type: 'v2',
        value: new THREE.Vector2(items * width, height * depth)
      },
      remapModulus: {
        type: 'v2',
        value: new THREE.Vector2(items, height)
      },
      remapModulusInv: {
        type: 'v2',
        value: new THREE.Vector2(1 / items, 1 / height)
      }
    };
    map = shaders.shader();
    map.pipe('screen.remap.4d.xyzw', uniforms);
    if (options.map != null) {
      map.pipe(options.map);
    }
    MemoScreen.__super__.constructor.call(this, renderer, shaders, {
      map: map
    });
    _ref = this.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      object.transparent = false;
    }
    null;
  }

  MemoScreen.prototype.cover = function(width, height, depth) {
    var x, y;
    if (width == null) {
      width = this.memo.width;
    }
    if (height == null) {
      height = this.memo.height;
    }
    if (depth == null) {
      depth = this.memo.depth;
    }
    x = width / this.memo.width;
    y = depth / this.memo.depth;
    if (this.memo.depth === 1) {
      y = height / this.memo.height;
    }
    return this.geometry.cover(x, y);
  };

  return MemoScreen;

})(Screen);

module.exports = MemoScreen;


},{"../../util":148,"./screen":131}],130:[function(require,module,exports){
var Base, Point, SpriteGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

SpriteGeometry = require('../geometry').SpriteGeometry;

Point = (function(_super) {
  __extends(Point, _super);

  function Point(renderer, shaders, options) {
    var alpha, color, edgeFactory, f, fill, fillFactory, hasStyle, mask, pass, passes, position, shape, shapes, uniforms, v, _ref, _ref1, _ref2, _ref3, _ref4;
    Point.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
    shape = (_ref1 = +options.shape) != null ? _ref1 : 0;
    fill = (_ref2 = options.fill) != null ? _ref2 : true;
    hasStyle = uniforms.styleColor != null;
    shapes = ['circle', 'square', 'diamond', 'triangle'];
    passes = ['circle', 'generic', 'generic', 'generic'];
    mask = (_ref3 = shapes[shape]) != null ? _ref3 : shapes[0];
    pass = (_ref4 = passes[shape]) != null ? _ref4 : passes[0];
    alpha = fill ? pass : "" + pass + ".hollow";
    this.geometry = new SpriteGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    v = shaders.shader();
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (position) {
      v.require(position);
    }
    v.pipe('point.position', this.uniforms);
    v.pipe('project.position', this.uniforms);
    edgeFactory = shaders.material();
    edgeFactory.vertex.pipe(v);
    f = edgeFactory.fragment;
    f.pipe('style.color', this.uniforms);
    if (color) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    f.require("point.mask." + mask, this.uniforms);
    f.require("point.alpha." + alpha, this.uniforms);
    f.pipe('point.edge', this.uniforms);
    fillFactory = shaders.material();
    fillFactory.vertex.pipe(v);
    f = fillFactory.fragment;
    f.pipe('style.color', this.uniforms);
    if (color) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    f.require("point.mask." + mask, this.uniforms);
    f.require("point.alpha." + alpha, this.uniforms);
    f.pipe('point.fill', this.uniforms);
    this.fillMaterial = this._material(fillFactory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    this.edgeMaterial = this._material(edgeFactory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    this.fillObject = new THREE.Mesh(this.geometry, this.fillMaterial);
    this.edgeObject = new THREE.Mesh(this.geometry, this.edgeMaterial);
    this._raw(this.fillObject);
    this._raw(this.edgeObject);
    this.objects = [this.fillObject, this.edgeObject];
  }

  Point.prototype.show = function(transparent, blending, order, depth) {
    this._show(this.edgeObject, true, blending, order, depth);
    return this._show(this.fillObject, transparent, blending, order, depth);
  };

  Point.prototype.dispose = function() {
    this.geometry.dispose();
    this.edgeMaterial.dispose();
    this.fillMaterial.dispose();
    this.objects = this.edgeObject = this.fillObject = this.geometry = this.edgeMaterial = this.fillMaterial = null;
    return Point.__super__.dispose.apply(this, arguments);
  };

  return Point;

})(Base);

module.exports = Point;


},{"../geometry":117,"./base":125}],131:[function(require,module,exports){
var Base, Screen, ScreenGeometry, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

ScreenGeometry = require('../geometry').ScreenGeometry;

Util = require('../../util');

Screen = (function(_super) {
  __extends(Screen, _super);

  function Screen(renderer, shaders, options) {
    var combine, f, factory, hasStyle, map, object, uniforms, v, _ref;
    Screen.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    map = options.map;
    combine = options.combine;
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
    f = factory.fragment;
    f.require(options.map);
    f.pipe('stpq.sample.2d');
    if (hasStyle) {
      f.pipe('style.color', this.uniforms);
      if (combine) {
        f.pipe(combine);
      }
      if (!combine) {
        f.pipe(Util.GLSL.binaryOperator('vec4', '*'));
      }
    }
    f.pipe('fragment.color');
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    object.frustumCulled = false;
    this._raw(object);
    this.objects = [object];
  }

  Screen.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return Screen.__super__.dispose.apply(this, arguments);
  };

  return Screen;

})(Base);

module.exports = Screen;


},{"../../util":148,"../geometry":117,"./base":125}],132:[function(require,module,exports){
var Base, Sprite, SpriteGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

SpriteGeometry = require('../geometry').SpriteGeometry;

Sprite = (function(_super) {
  __extends(Sprite, _super);

  function Sprite(renderer, shaders, options) {
    var blend, color, combine, edgeFactory, f, factory, fillFactory, hasStyle, map, position, sprite, uniforms, v, _ref;
    Sprite.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    sprite = options.sprite;
    map = options.map;
    combine = options.combine;
    color = options.color;
    hasStyle = uniforms.styleColor != null;
    this.geometry = new SpriteGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    v = factory.vertex;
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (position) {
      v.require(position);
    }
    if (sprite) {
      v.require(sprite);
    }
    v.pipe('sprite.position', this.uniforms);
    v.pipe('project.position', this.uniforms);
    blend = color || hasStyle;
    f = factory.fragment;
    if (blend) {
      f.split();
    }
    f.require(map);
    f.pipe('sprite.fragment', this.uniforms);
    if (blend) {
      f.next();
    }
    if (hasStyle) {
      f.pipe('style.color', this.uniforms);
    }
    if (color && hasStyle) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    if (color && !hasStyle) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    if (blend) {
      f.join();
    }
    if (combine) {
      f.pipe(combine);
    }
    if (!combine) {
      f.pipe(Util.GLSL.binaryOperator('vec4', '*'));
    }
    edgeFactory = shaders.material();
    edgeFactory.vertex.pipe(v);
    edgeFactory.fragment.pipe(f);
    edgeFactory.fragment.pipe('fragment.transparent', this.uniforms);
    fillFactory = shaders.material();
    fillFactory.vertex.pipe(v);
    fillFactory.fragment.pipe(f);
    fillFactory.fragment.pipe('fragment.solid', this.uniforms);
    this.fillMaterial = this._material(fillFactory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    this.edgeMaterial = this._material(edgeFactory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    this.fillObject = new THREE.Mesh(this.geometry, this.fillMaterial);
    this.edgeObject = new THREE.Mesh(this.geometry, this.edgeMaterial);
    this._raw(this.fillObject);
    this._raw(this.edgeObject);
    this.objects = [this.fillObject, this.edgeObject];
  }

  Sprite.prototype.show = function(transparent, blending, order, depth) {
    this._show(this.edgeObject, true, blending, order, depth);
    return this._show(this.fillObject, transparent, blending, order, depth);
  };

  Sprite.prototype.dispose = function() {
    this.geometry.dispose();
    this.edgeMaterial.dispose();
    this.fillMaterial.dispose();
    this.objects = this.geometry = this.edgeMaterial = this.fillMaterial = this.edgeObject = this.fillObject = null;
    return Sprite.__super__.dispose.apply(this, arguments);
  };

  return Sprite;

})(Base);

module.exports = Sprite;


},{"../geometry":117,"./base":125}],133:[function(require,module,exports){
var Base, Strip, StripGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

StripGeometry = require('../geometry').StripGeometry;

Strip = (function(_super) {
  __extends(Strip, _super);

  function Strip(renderer, shaders, options) {
    var color, f, factory, hasStyle, object, position, shaded, uniforms, v, _ref, _ref1;
    Strip.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    shaded = (_ref1 = options.shaded) != null ? _ref1 : true;
    color = options.color;
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
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (position) {
      v.require(position);
    }
    v.split();
    if (!shaded) {
      v.pipe('mesh.position', this.uniforms);
    }
    if (shaded) {
      v.pipe('strip.position.normal', this.uniforms);
    }
    v.pass();
    v.pipe('project.position', this.uniforms);
    f = factory.fragment;
    if (!shaded && hasStyle) {
      f.pipe('style.color', this.uniforms);
    }
    if (shaded && hasStyle) {
      f.pipe('style.color.shaded', this.uniforms);
    }
    if (color && hasStyle) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    if (color && !hasStyle) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.objects = [object];
  }

  Strip.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return Strip.__super__.dispose.apply(this, arguments);
  };

  return Strip;

})(Base);

module.exports = Strip;


},{"../geometry":117,"./base":125}],134:[function(require,module,exports){
var Base, Surface, SurfaceGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

SurfaceGeometry = require('../geometry').SurfaceGeometry;

Surface = (function(_super) {
  __extends(Surface, _super);

  function Surface(renderer, shaders, options) {
    var color, f, factory, hasStyle, object, position, shaded, uniforms, v, _ref, _ref1;
    Surface.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
    shaded = (_ref1 = options.shaded) != null ? _ref1 : true;
    hasStyle = uniforms.styleColor != null;
    this.geometry = new SurfaceGeometry({
      width: options.width,
      height: options.height,
      surfaces: options.surfaces,
      layers: options.layers
    });
    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);
    factory = shaders.material();
    v = factory.vertex;
    if (color) {
      v.require(color);
      v.pipe('mesh.vertex.color', this.uniforms);
    }
    if (position) {
      v.require(position);
    }
    if (!shaded) {
      v.pipe('surface.position', this.uniforms);
    }
    if (shaded) {
      v.pipe('surface.position.normal', this.uniforms);
    }
    v.pipe('project.position', this.uniforms);
    f = factory.fragment;
    if (!shaded && hasStyle) {
      f.pipe('style.color', this.uniforms);
    }
    if (shaded && hasStyle) {
      f.pipe('style.color.shaded', this.uniforms);
    }
    if (color && hasStyle) {
      f.pipe('mesh.fragment.blend', this.uniforms);
    }
    if (color && !hasStyle) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      index0AttributeName: "position4"
    }));
    object = new THREE.Mesh(this.geometry, this.material);
    this._raw(object);
    this.objects = [object];
  }

  Surface.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.objects = this.geometry = this.material = null;
    return Surface.__super__.dispose.apply(this, arguments);
  };

  return Surface;

})(Base);

module.exports = Surface;


},{"../geometry":117,"./base":125}],135:[function(require,module,exports){
var Renderable;

Renderable = (function() {
  function Renderable(renderer, shaders) {
    this.renderer = renderer;
    this.shaders = shaders;
    this.gl = this.renderer.context;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
  }

  Renderable.prototype.dispose = function() {
    return this.uniforms = null;
  };

  Renderable.prototype._adopt = function(uniforms) {
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      this.uniforms[key] = value;
    }
  };

  Renderable.prototype._set = function(uniforms) {
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      if (this.uniforms[key] != null) {
        this.uniforms[key].value = value;
      }
    }
  };

  return Renderable;

})();

module.exports = Renderable;


},{}],136:[function(require,module,exports){
var MathBox, Renderable, Scene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('./renderable');


/*
 All MathBox renderables sit inside this root, to keep things tidy.
 */

MathBox = (function(_super) {
  __extends(MathBox, _super);

  function MathBox() {
    MathBox.__super__.constructor.apply(this, arguments);
    this.rotationAutoUpdate = false;
    this.frustumCulled = false;
    this.matrixAutoUpdate = false;
  }

  return MathBox;

})(THREE.Object3D);


/*
 Holds the root and binds to a THREE.Scene
 */

Scene = (function(_super) {
  __extends(Scene, _super);

  function Scene(renderer, shaders, options) {
    Scene.__super__.constructor.call(this, renderer, shaders, options);
    this.root = new MathBox;
    if ((options != null ? options.scene : void 0) != null) {
      this.scene = options.scene;
    }
    if (this.scene == null) {
      this.scene = new THREE.Scene;
    }
  }

  Scene.prototype.inject = function(scene) {
    if (scene != null) {
      this.scene = scene;
    }
    return this.scene.add(this.root);
  };

  Scene.prototype.unject = function() {
    var _ref;
    return (_ref = this.scene) != null ? _ref.remove(this.root) : void 0;
  };

  Scene.prototype.add = function(object) {
    return this.root.add(object);
  };

  Scene.prototype.remove = function(object) {
    return this.root.remove(object);
  };

  Scene.prototype.dispose = function() {
    if (this.root.parent != null) {
      return this.unject();
    }
  };

  return Scene;

})(Renderable);

module.exports = Scene;


},{"./renderable":135}],137:[function(require,module,exports){
var Factory, ShaderGraph;

ShaderGraph = require('../../vendor/shadergraph/src');

Factory = function(snippets) {
  var fetch;
  fetch = function(name) {
    var element, s;
    s = snippets[name];
    if (s != null) {
      return s;
    }
    element = document.getElementById(name);
    if ((element != null) && element.tagName === 'SCRIPT') {
      return element.textContent || element.innerText;
    }
    throw "Unknown shader `" + name + "`";
  };
  return new ShaderGraph(fetch, {
    autoInspect: true
  });
};

module.exports = Factory;


},{"../../vendor/shadergraph/src":180}],138:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Snippets = MathBox.Shaders;


},{"./factory":137}],139:[function(require,module,exports){
var Animator;

Animator = (function() {
  function Animator(model) {
    this.model = model;
  }

  Animator.prototype.update = function() {};

  return Animator;

})();

module.exports = Animator;


},{}],140:[function(require,module,exports){
var API;

API = (function() {
  function API(_context, _up, _targets) {
    var i, root, t, type, _i, _j, _len, _len1, _ref, _ref1;
    this._context = _context;
    this._up = _up;
    this._targets = _targets;
    root = this._context.controller.getRoot();
    if (this._targets == null) {
      this._targets = [root];
    }
    this.isRoot = this._targets.length === 1 && this._targets[0] === root;
    this.isLeaf = this._targets.length === 1 && (this._targets[0].children == null);
    _ref = this._targets;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      t = _ref[i];
      this[i] = t;
    }
    this.length = this._targets.length;
    _ref1 = this._context.controller.getTypes();
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      type = _ref1[_j];
      if (type !== 'root') {
        (function(_this) {
          return (function(type) {
            return _this[type] = function(options) {
              return _this.add(type, options);
            };
          });
        })(this)(type);
      }
    }
  }

  API.prototype.select = function(selector) {
    var targets;
    targets = this._context.model.select(selector, !this.isRoot ? _targets : null);
    return this._push(targets);
  };

  API.prototype.eq = function(index) {
    if (this._targets.length > index) {
      return this._push([this._targets[index]]);
    }
    return this._push([]);
  };

  API.prototype.each = function(callback) {
    var i, _i, _ref;
    for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      callback(this[i], i, this);
    }
    return this;
  };

  API.prototype.add = function(type, options) {
    var controller, node, nodes, target, _i, _len, _ref;
    controller = this._context.controller;
    if (this.isLeaf) {
      return this._pop().add(type, options);
    }
    nodes = [];
    _ref = this._targets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      target = _ref[_i];
      node = controller.make(type, options);
      controller.add(node, target);
      nodes.push(node);
    }
    return this._push(nodes);
  };

  API.prototype.remove = function(selector) {
    var target, _i, _len, _ref, _results;
    if (selector) {
      return this.select(selector).remove();
    }
    _ref = this._targets;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      target = _ref[_i];
      _results.push(this._context.controller.remove(target));
    }
    return _results;
  };

  API.prototype.set = function(key, value) {
    var target, _i, _len, _ref;
    _ref = this._targets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      target = _ref[_i];
      this._context.controller.set(target, key, value);
    }
    return this;
  };

  API.prototype.get = function(selector) {
    var target, _i, _len, _ref, _results;
    if (selector) {
      return this.select(selector).get();
    }
    _ref = this._targets;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      target = _ref[_i];
      _results.push(this._context.controller.get(target));
    }
    return _results;
  };

  API.prototype.end = function() {
    return (this.isLeaf ? this._pop() : this)._pop();
  };

  API.prototype._push = function(targets) {
    return new API(this._context, this, targets);
  };

  API.prototype._pop = function() {
    var _ref;
    return (_ref = this._up) != null ? _ref : this;
  };

  API.prototype._reset = function() {
    var _ref, _ref1;
    return (_ref = (_ref1 = this._up) != null ? _ref1.reset() : void 0) != null ? _ref : this;
  };

  return API;

})();

module.exports = API;


},{}],141:[function(require,module,exports){
var Controller;

Controller = (function() {
  function Controller(model, primitives) {
    this.model = model;
    this.primitives = primitives;
  }

  Controller.prototype._name = function(node) {
    var n;
    n = node.type;
    if (node.id) {
      n += "#" + node.id;
    }
    if (node.classes.length) {
      n += "." + (node.classes.join('.'));
    }
    return "[" + n + "]";
  };

  Controller.prototype.getRoot = function() {
    return this.model.getRoot();
  };

  Controller.prototype.getTypes = function() {
    return this.primitives.getTypes();
  };

  Controller.prototype.make = function(type, options) {
    return this.primitives.make(type, options);
  };

  Controller.prototype.get = function(node) {
    return node.get();
  };

  Controller.prototype.set = function(node, key, value) {
    var e;
    try {
      return node.set(key, value);
    } catch (_error) {
      e = _error;
      return console.warn(this._name(node), e);
    }
  };

  Controller.prototype.add = function(node, target) {
    if (target == null) {
      target = this.model.getRoot();
    }
    return target.add(node);
  };

  Controller.prototype.remove = function(node) {
    var target;
    target = node.parent;
    if (target) {
      return target.remove(node);
    }
  };

  return Controller;

})();

module.exports = Controller;


},{}],142:[function(require,module,exports){
var Director;

Director = (function() {
  function Director(model, script) {
    this.model = model;
    this.script = script;
  }

  return Director;

})();

module.exports = Director;


},{}],143:[function(require,module,exports){
exports.Animator = require('./animator');

exports.API = require('./api');

exports.Controller = require('./controller');

exports.Director = require('./director');


},{"./animator":139,"./api":140,"./controller":141,"./director":142}],144:[function(require,module,exports){
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
  return function(x, dx, bend, f) {
    var abs, fabs, max, min, x1, x2;
    if (f == null) {
      f = 0;
    }
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


},{}],145:[function(require,module,exports){
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

exports.getDimensions = function(data, spec) {
  var channels, depth, dims, height, items, levels, n, nesting, sizes, width, _ref, _ref1, _ref2, _ref3, _ref4;
  if (spec == null) {
    spec = {};
  }
  items = spec.items, channels = spec.channels, width = spec.width, height = spec.height, depth = spec.depth;
  dims = {};
  if (!data || !data.length) {
    return {
      items: items,
      channels: channels,
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
  n = (_ref = sizes.pop()) != null ? _ref : 1;
  if (levels <= 1) {
    n /= (_ref1 = dims.channels) != null ? _ref1 : 1;
  }
  if (levels <= 2) {
    n /= (_ref2 = dims.items) != null ? _ref2 : 1;
  }
  if (levels <= 3) {
    n /= (_ref3 = dims.width) != null ? _ref3 : 1;
  }
  if (levels <= 4) {
    n /= (_ref4 = dims.height) != null ? _ref4 : 1;
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

exports.makeEmitter = function(thunk, items, channels) {
  var inner, outer;
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
  outer = (function() {
    switch (items) {
      case 0:
        return function() {
          return true;
        };
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
      case 6:
        return function(emit) {
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
  outer.reset = thunk.reset;
  outer.rebind = thunk.rebind;
  return outer;
};

exports.getThunk = function(data) {
  var a, b, c, d, done, first, fourth, i, j, k, l, m, nesting, second, sizes, third, thunk, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
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
      first = (_ref = data[j]) != null ? _ref : [];
      thunk = function() {
        var x, _ref1;
        x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          first = (_ref1 = data[j]) != null ? _ref1 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref1;
        i = j = 0;
        first = (_ref1 = data[j]) != null ? _ref1 : [];
      };
      break;
    case 3:
      i = j = k = 0;
      second = (_ref1 = data[k]) != null ? _ref1 : [];
      first = (_ref2 = second[j]) != null ? _ref2 : [];
      thunk = function() {
        var x, _ref3, _ref4;
        x = first[i++];
        if (i === a) {
          i = 0;
          j++;
          if (j === b) {
            j = 0;
            k++;
            second = (_ref3 = data[k]) != null ? _ref3 : [];
          }
          first = (_ref4 = second[j]) != null ? _ref4 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref3, _ref4;
        i = j = k = 0;
        second = (_ref3 = data[k]) != null ? _ref3 : [];
        first = (_ref4 = second[j]) != null ? _ref4 : [];
      };
      break;
    case 4:
      i = j = k = l = 0;
      third = (_ref3 = data[l]) != null ? _ref3 : [];
      second = (_ref4 = third[k]) != null ? _ref4 : [];
      first = (_ref5 = second[j]) != null ? _ref5 : [];
      thunk = function() {
        var x, _ref6, _ref7, _ref8;
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
              third = (_ref6 = data[l]) != null ? _ref6 : [];
            }
            second = (_ref7 = third[k]) != null ? _ref7 : [];
          }
          first = (_ref8 = second[j]) != null ? _ref8 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref6, _ref7, _ref8;
        i = j = k = l = 0;
        third = (_ref6 = data[l]) != null ? _ref6 : [];
        second = (_ref7 = third[k]) != null ? _ref7 : [];
        first = (_ref8 = second[j]) != null ? _ref8 : [];
      };
      break;
    case 5:
      i = j = k = l = m = 0;
      fourth = (_ref6 = data[m]) != null ? _ref6 : [];
      third = (_ref7 = fourth[l]) != null ? _ref7 : [];
      second = (_ref8 = third[k]) != null ? _ref8 : [];
      first = (_ref9 = second[j]) != null ? _ref9 : [];
      thunk = function() {
        var x, _ref10, _ref11, _ref12, _ref13;
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
                fourth = (_ref10 = data[m]) != null ? _ref10 : [];
              }
              third = (_ref11 = fourth[l]) != null ? _ref11 : [];
            }
            second = (_ref12 = third[k]) != null ? _ref12 : [];
          }
          first = (_ref13 = second[j]) != null ? _ref13 : [];
        }
        return x;
      };
      thunk.reset = function() {
        var _ref10, _ref11, _ref12, _ref13;
        i = j = k = l = m = 0;
        fourth = (_ref10 = data[m]) != null ? _ref10 : [];
        third = (_ref11 = fourth[l]) != null ? _ref11 : [];
        second = (_ref12 = third[k]) != null ? _ref12 : [];
        first = (_ref13 = second[j]) != null ? _ref13 : [];
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
  return {
    emit: emit,
    consume: consume,
    skip: skip,
    count: count,
    done: done,
    reset: reset
  };
};


},{}],146:[function(require,module,exports){
var ease, π;

π = Math.PI;

ease = {
  cosine: function(x) {
    return .5 - .5 * Math.cos(x * π);
  }
};

module.exports = ease;


},{}],147:[function(require,module,exports){
var index, letters, parseOrder, toFloatString, toType,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

exports.mapByte2FloatOffset = function(stretch) {
  var factor;
  if (stretch == null) {
    stretch = 4;
  }
  factor = toFloatString(stretch);
  return "vec4 float2ByteIndex(vec4 xyzw, out float channelIndex) {\n  float relative = xyzw.w / " + factor + ";\n  float w = floor(relative);\n  channelIndex = (relative - w) * " + factor + ";\n  return vec4(xyzw.xyz, w);\n}";
};

exports.sample2DArray = function(textures) {
  var body, divide;
  divide = function(a, b) {
    var mid, out;
    if (a === b) {
      out = "return texture2D(dataTextures[" + a + "], uv);";
    } else {
      mid = Math.ceil(a + (b - a) / 2);
      out = "if (z < " + (mid - .5) + ") {\n  " + (divide(a, mid - 1)) + "\n}\nelse {\n  " + (divide(mid, b)) + "\n}";
    }
    return out = out.replace(/\n/g, "\n  ");
  };
  body = divide(0, textures - 1);
  return "uniform sampler2D dataTextures[" + textures + "];\n\nvec4 sample2DArray(vec2 uv, float z) {\n  " + body + "\n}";
};

exports.binaryOperator = function(type, op, curry) {
  type = toType(type);
  if (curry != null) {
    return "" + type + " binaryOperator(" + type + " a) {\n  return a " + op + " " + curry + ";\n}";
  } else {
    return "" + type + " binaryOperator(" + type + " a, " + type + " b) {\n  return a " + op + " b;\n}";
  }
};

exports.extendVec = function(from, to, value) {
  var ctor, diff, parts, _i, _results;
  if (value == null) {
    value = 0;
  }
  if (from > to) {
    return exports.truncateVec(from, to);
  }
  diff = to - from;
  from = toType(from);
  to = toType(to);
  value = toFloatString(value);
  parts = (function() {
    _results = [];
    for (var _i = 0; 0 <= diff ? _i <= diff : _i >= diff; 0 <= diff ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).map(function(x) {
    if (x) {
      return value;
    } else {
      return 'v';
    }
  });
  ctor = parts.join(',');
  return "" + to + " extendVec(" + from + " v) { return " + to + "(" + ctor + "); }";
};

exports.truncateVec = function(from, to) {
  var swizzle;
  if (from < to) {
    return exports.extendVec(from, to);
  }
  swizzle = '.' + ('xyzw'.substr(0, to));
  from = toType(from);
  to = toType(to);
  return "" + to + " truncateVec(" + from + " v) { return v" + swizzle + "; }";
};

exports.injectVec4 = function(order) {
  var args, channel, i, mask, swizzler, _i, _len;
  swizzler = ['0.0', '0.0', '0.0', '0.0'];
  order = parseOrder(order);
  order = order.map(function(v) {
    if (v === "" + v) {
      return index[v];
    } else {
      return v;
    }
  });
  for (i = _i = 0, _len = order.length; _i < _len; i = ++_i) {
    channel = order[i];
    swizzler[channel] = ['a', 'b', 'c', 'd'][i];
  }
  mask = swizzler.slice(0, 4).join(', ');
  args = ['float a', 'float b', 'float c', 'float d'].slice(0, order.length);
  return "vec4 inject(" + args + ") {\n  return vec4(" + mask + ");\n}";
};

exports.swizzleVec4 = function(order, size) {
  var lookup, mask;
  if (size == null) {
    size = null;
  }
  lookup = ['0.0', 'xyzw.x', 'xyzw.y', 'xyzw.z', 'xyzw.w'];
  if (size == null) {
    size = order.length;
  }
  order = parseOrder(order);
  order = order.map(function(v) {
    if (__indexOf.call([0, 1, 2, 3, 4], +v) >= 0) {
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
  return ("vec" + size + " swizzle(vec4 xyzw) {\n  return vec" + size + "(" + mask + ");\n}").replace(/vec1/g, 'float');
};

exports.invertSwizzleVec4 = function(order) {
  var i, j, letter, mask, src, swizzler, _i, _len;
  swizzler = ['0.0', '0.0', '0.0', '0.0'];
  order = parseOrder(order);
  order = order.map(function(v) {
    if (v === +v) {
      return letters[v - 1];
    } else {
      return v;
    }
  });
  for (i = _i = 0, _len = order.length; _i < _len; i = ++_i) {
    letter = order[i];
    src = letters[i];
    j = index[letter];
    swizzler[j] = "xyzw." + src;
  }
  mask = swizzler.join(', ');
  return "vec4 invertSwizzle(vec4 xyzw) {\n  return vec4(" + mask + ");\n}";
};

exports.identity = function(type) {
  var args;
  args = [].slice.call(arguments);
  if (args.length > 1) {
    args = args.map(function(t, i) {
      return ['inout', t, String.fromCharCode(97 + i)].join(' ');
    });
    args = args.join(', ');
    return "void identity(" + args + ") { }";
  } else {
    return "" + type + " identity(" + type + " x) {\n  return x;\n}";
  }
};


},{}],148:[function(require,module,exports){
exports.Axis = require('./axis');

exports.Data = require('./data');

exports.Ease = require('./ease');

exports.GLSL = require('./glsl');

exports.JS = require('./js');

exports.Three = require('./three');

exports.Ticks = require('./ticks');

exports.VDOM = require('./vdom');


},{"./axis":144,"./data":145,"./ease":146,"./glsl":147,"./js":149,"./three":150,"./ticks":151,"./vdom":152}],149:[function(require,module,exports){
exports.merge = function() {
  var k, obj, v, x, _i, _len;
  x = {};
  for (_i = 0, _len = arguments.length; _i < _len; _i++) {
    obj = arguments[_i];
    for (k in obj) {
      v = obj[k];
      x[k] = v;
    }
  }
  return x;
};

exports.clone = function(o) {
  return JSON.parse(JSON.serialize(o));
};


},{}],150:[function(require,module,exports){
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


},{}],151:[function(require,module,exports){

/*
 Generate equally spaced ticks in a range at sensible positions.
 
 @param min/max - Minimum and maximum of range
 @param n - Desired number of ticks in range
 @param unit - Base unit of scale (e.g. 1 or π).
 @param scale - Division scale (e.g. 2 = binary division, or 10 = decimal division).
 @param inclusive - Whether to add ticks at the edges
 @param bias - Integer to bias divisions one or more levels up or down (to create nested scales)
 */
var LINEAR, LOG, linear, log, make;

linear = function(min, max, n, unit, base, inclusive, bias) {
  var distance, edge, factor, factors, i, ideal, ref, span, step, steps, _i, _results;
  n || (n = 10);
  bias || (bias = 0);
  span = max - min;
  ideal = span / n;
  unit || (unit = 1);
  base || (base = 10);
  ref = unit * (bias + Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base))));
  factors = base % 2 === 0 ? [base / 2, 1, 1 / 2] : base % 3 === 0 ? [base / 3, 1, 1 / 3] : [1];
  steps = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = factors.length; _i < _len; _i++) {
      factor = factors[_i];
      _results.push(ref * factor);
    }
    return _results;
  })();
  distance = Infinity;
  step = steps.reduce(function(ref, step) {
    var d, f;
    f = step / ideal;
    d = Math.max(f, 1 / f);
    if (d < distance) {
      distance = d;
      return step;
    } else {
      return ref;
    }
  }, ref);
  edge = +(!inclusive);
  min = (Math.ceil(min / step) + edge) * step;
  max = (Math.floor(max / step) - edge) * step;
  n = Math.ceil((max - min) / step);
  _results = [];
  for (i = _i = 0; 0 <= n ? _i <= n : _i >= n; i = 0 <= n ? ++_i : --_i) {
    _results.push(min + i * step);
  }
  return _results;
};


/*
 Generate logarithmically spaced ticks in a range at sensible positions.
 */

log = function(min, max, n, unit, base, inclusive, bias) {
  throw "Log ticks not yet implemented.";

  /*
  base = Math.log(base)
  ibase = 1 / base
  l = (x) -> Math.log(x) * ibase
  
   * Generate linear scale in log space at (base - 1) divisions
  ticks = Linear(l(min), l(max), n, unit, Math.max(2, scale - 1), inclusive, bias)
  
   * Remap ticks within each order of magnitude
  for tick in ticks
    floor = Math.floor tick
    frac = tick - floor
  
    ref = Math.exp floor * base
    value = ref * Math.round 1 + (base - 1) * frac
   */
};

LINEAR = 0;

LOG = 1;

make = function(type, min, max, ticks, unit, base, inclusive, bias) {
  switch (type) {
    case LINEAR:
      return linear(min, max, ticks, unit, base, inclusive, bias);
    case LOG:
      return log(min, max, ticks, unit, base, inclusive, bias);
  }
};

exports.make = make;

exports.linear = linear;

exports.log = log;


},{}],152:[function(require,module,exports){
var HEAP, apply, descriptor, element, hint, id, insert, key, map, prop, recycle, remove, set, unset, _i, _len, _ref;

HEAP = [];

id = 0;

descriptor = function() {
  return {
    id: id++,
    type: null,
    props: null,
    children: null
  };
};

hint = function(n) {
  var i, _i, _results;
  n *= 2;
  n = Math.max(0, HEAP.length - n);
  _results = [];
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    _results.push(HEAP.push(descriptor()));
  }
  return _results;
};

element = function(type, props, children) {
  var el;
  el = HEAP.length ? HEAP.pop() : descriptor();
  el.type = type != null ? type : 'div';
  el.props = props != null ? props : null;
  el.children = children != null ? children : null;
  return el;
};

recycle = function(el) {
  var child, children, _i, _len;
  if (!el.type) {
    return;
  }
  children = el.children;
  el.type = el.props = el.children = null;
  HEAP.push(el);
  if (children != null) {
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      recycle(child);
    }
  }
};

apply = function(el, last, node, parent, index) {
  var child, childNodes, children, i, key, nextChildren, nextProps, props, ref, same, value, _i, _j, _len, _len1, _ref, _ref1;
  if (el != null) {
    if (last == null) {
      return insert(el, parent, index);
    } else {
      same = typeof el === typeof last && last !== null && el !== null && el.type === last.type;
      if (!same) {
        remove(node, parent);
        return insert(el, parent, index);
      } else {
        props = last != null ? last.props : void 0;
        nextProps = el.props;
        if (props != null) {
          for (key in props) {
            if (!nextProps.hasOwnProperty(key)) {
              unset(node, key);
            }
          }
        }
        if (nextProps != null) {
          for (key in nextProps) {
            value = nextProps[key];
            if ((ref = props[key]) !== value) {
              set(node, key, value, ref);
            }
          }
        }
        children = (_ref = last != null ? last.children : void 0) != null ? _ref : null;
        nextChildren = el.children;
        if ((_ref1 = typeof nextChildren) === 'string' || _ref1 === 'number') {
          if (nextChildren !== children) {
            node.textContent = nextChildren;
          }
        } else if (nextChildren != null) {
          if (nextChildren.type != null) {
            apply(nextChildren, children, node.childNodes[0], node, 0);
          } else {
            childNodes = node.childNodes;
            if (children != null) {
              for (i = _i = 0, _len = nextChildren.length; _i < _len; i = ++_i) {
                child = nextChildren[i];
                apply(child, children[i], childNodes[i], node, i);
              }
            } else {
              for (i = _j = 0, _len1 = nextChildren.length; _j < _len1; i = ++_j) {
                child = nextChildren[i];
                apply(child, null, childNodes[i], node, i);
              }
            }
          }
        } else if (children != null) {
          node.innerHTML = '';
        }
        return;
      }
    }
  }
  if (last != null) {
    return remove(node, parent);
  }
};

insert = function(el, parent, index) {
  var child, children, i, key, node, value, _i, _len, _ref, _ref1, _ref2;
  if (index == null) {
    index = 0;
  }
  if ((_ref = typeof el) === 'string' || _ref === 'number') {
    node = document.createTextNode(el);
  } else {
    node = document.createElement(el.type);
    _ref1 = el.props;
    for (key in _ref1) {
      value = _ref1[key];
      set(node, key, value);
    }
  }
  children = el.children;
  if ((_ref2 = typeof children) === 'string' || _ref2 === 'number') {
    node.textContent = children;
  } else if (children != null) {
    if (children.type != null) {
      insert(children, node, 0);
    } else {
      for (i = _i = 0, _len = children.length; _i < _len; i = ++_i) {
        child = children[i];
        insert(child, node, i);
      }
    }
  }
  parent.insertBefore(node, parent.childNodes[index]);
};

remove = function(node, parent) {
  return parent.removeChild(node);
};

prop = function(key) {
  var prefix, prefixes, _i, _len;
  if (document.documentElement.style[key] != null) {
    return key;
  }
  key = key[0].toUpperCase() + key.slice(1);
  prefixes = ['webkit', 'moz', 'ms', 'o'];
  for (_i = 0, _len = prefixes.length; _i < _len; _i++) {
    prefix = prefixes[_i];
    if (document.documentElement.style[prefix + key] != null) {
      return prefix + key;
    }
  }
};

map = {};

_ref = ['transform'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  key = _ref[_i];
  map[key] = prop(key);
}

set = function(node, key, value, orig) {
  var k, v, _ref1;
  if (key === 'style') {
    for (k in value) {
      v = value[k];
      if ((orig != null ? orig[k] : void 0) !== v) {
        node.style[(_ref1 = map[k]) != null ? _ref1 : k] = v;
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

unset = function(node, key) {
  return node.removeAttribute(key);
};

module.exports = {
  element: element,
  recycle: recycle,
  apply: apply,
  hint: hint
};


},{}],153:[function(require,module,exports){

/*
  Graph of nodes with outlets
 */
var Graph;

Graph = (function() {
  Graph.index = 0;

  Graph.id = function(name) {
    return ++Graph.index;
  };

  Graph.IN = 0;

  Graph.OUT = 1;

  function Graph(nodes, parent) {
    this.parent = parent != null ? parent : null;
    this.id = Graph.id();
    this.nodes = [];
    nodes && this.add(nodes);
  }

  Graph.prototype.inputs = function() {
    var inputs, node, outlet, _i, _j, _len, _len1, _ref, _ref1;
    inputs = [];
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _ref1 = node.inputs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        outlet = _ref1[_j];
        if (outlet.input === null) {
          inputs.push(outlet);
        }
      }
    }
    return inputs;
  };

  Graph.prototype.outputs = function() {
    var node, outlet, outputs, _i, _j, _len, _len1, _ref, _ref1;
    outputs = [];
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _ref1 = node.outputs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        outlet = _ref1[_j];
        if (outlet.output.length === 0) {
          outputs.push(outlet);
        }
      }
    }
    return outputs;
  };

  Graph.prototype.getIn = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.inputs();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Graph.prototype.getOut = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.outputs();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Graph.prototype.add = function(node, ignore) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.add(_node);
      }
      return;
    }
    if (node.graph && !ignore) {
      throw "Adding node to two graphs at once";
    }
    node.graph = this;
    return this.nodes.push(node);
  };

  Graph.prototype.remove = function(node, ignore) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.remove(_node);
      }
      return;
    }
    if (node.graph !== this) {
      throw "Removing node from wrong graph.";
    }
    ignore || node.disconnect();
    this.nodes.splice(this.nodes.indexOf(node), 1);
    return node.graph = null;
  };

  Graph.prototype.adopt = function(node) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.adopt(_node);
      }
      return;
    }
    node.graph.remove(node, true);
    return this.add(node, true);
  };

  return Graph;

})();

module.exports = Graph;


},{}],154:[function(require,module,exports){
exports.Graph = require('./graph');

exports.Node = require('./node');

exports.Outlet = require('./outlet');

exports.IN = exports.Graph.IN;

exports.OUT = exports.Graph.OUT;


},{"./graph":153,"./node":155,"./outlet":156}],155:[function(require,module,exports){
var Graph, Node, Outlet;

Graph = require('./graph');

Outlet = require('./outlet');


/*
 Node in graph.
 */

Node = (function() {
  Node.index = 0;

  Node.id = function(name) {
    return ++Node.index;
  };

  function Node(owner, outlets) {
    this.owner = owner;
    this.graph = null;
    this.inputs = [];
    this.outputs = [];
    this.all = [];
    this.outlets = null;
    this.id = Node.id();
    this.setOutlets(outlets);
  }

  Node.prototype.getIn = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.inputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Node.prototype.getOut = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.outputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Node.prototype.get = function(name) {
    return this.getIn(name) || this.getOut(name);
  };

  Node.prototype.setOutlets = function(outlets) {
    var existing, hash, key, match, outlet, _i, _j, _k, _len, _len1, _len2, _ref;
    if (outlets != null) {
      if (this.outlets == null) {
        this.outlets = {};
        for (_i = 0, _len = outlets.length; _i < _len; _i++) {
          outlet = outlets[_i];
          if (!(outlet instanceof Outlet)) {
            outlet = Outlet.make(outlet);
          }
          this._add(outlet);
        }
        return;
      }
      hash = function(outlet) {
        return [outlet.name, outlet.inout, outlet.type].join('-');
      };
      match = {};
      for (_j = 0, _len1 = outlets.length; _j < _len1; _j++) {
        outlet = outlets[_j];
        match[hash(outlet)] = true;
      }
      _ref = this.outlets;
      for (key in _ref) {
        outlet = _ref[key];
        key = hash(outlet);
        if (match[key]) {
          match[key] = outlet;
        } else {
          this._remove(outlet);
        }
      }
      for (_k = 0, _len2 = outlets.length; _k < _len2; _k++) {
        outlet = outlets[_k];
        existing = match[hash(outlet)];
        if (existing instanceof Outlet) {
          this._morph(existing, outlet);
        } else {
          if (!(outlet instanceof Outlet)) {
            outlet = Outlet.make(outlet);
          }
          this._add(outlet);
        }
      }
      this;
    }
    return this.outlets;
  };

  Node.prototype.connect = function(node, empty, force) {
    var hint, hints, others, outlet, outlets, type, _i, _j, _len, _len1, _ref, _ref1;
    outlets = {};
    hints = {};
    _ref = node.inputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      if (!force && outlet.input) {
        continue;
      }
      type = outlet.type;
      hint = [type, outlet.hint].join('-');
      if (!hints[hint]) {
        hints[hint] = outlet;
      }
      outlets[type] = outlets[type] || [];
      outlets[type].push(outlet);
    }
    _ref1 = this.outputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      if (empty && outlet.output.length) {
        continue;
      }
      type = outlet.type;
      hint = [type, outlet.hint].join('-');
      others = outlets[type];
      if (hints[hint]) {
        hints[hint].connect(outlet);
        delete hints[hint];
        others.splice(others.indexOf(outlet), 1);
        continue;
      }
      if (others && others.length) {
        others.shift().connect(outlet);
      }
    }
    return this;
  };

  Node.prototype.disconnect = function(node) {
    var outlet, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.inputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      outlet.disconnect();
    }
    _ref1 = this.outputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      outlet.disconnect();
    }
    return this;
  };

  Node.prototype._key = function(outlet) {
    return [outlet.name, outlet.inout].join('-');
  };

  Node.prototype._add = function(outlet) {
    var key;
    key = this._key(outlet);
    if (outlet.node) {
      throw "Adding outlet to two nodes at once.";
    }
    if (this.outlets[key]) {
      throw "Adding two identical outlets to same node. (" + key + ")";
    }
    outlet.node = this;
    if (outlet.inout === Graph.IN) {
      this.inputs.push(outlet);
    }
    if (outlet.inout === Graph.OUT) {
      this.outputs.push(outlet);
    }
    this.all.push(outlet);
    return this.outlets[key] = outlet;
  };

  Node.prototype._morph = function(existing, outlet) {
    var key;
    key = this._key(outlet);
    delete this.outlets[key];
    existing.morph(outlet);
    key = this._key(outlet);
    return this.outlets[key] = outlet;
  };

  Node.prototype._remove = function(outlet) {
    var inout, key;
    key = this._key(outlet);
    inout = outlet.inout;
    if (outlet.node !== this) {
      throw "Removing outlet from wrong node.";
    }
    outlet.disconnect();
    outlet.node = null;
    delete this.outlets[key];
    if (outlet.inout === Graph.IN) {
      this.inputs.splice(this.inputs.indexOf(outlet), 1);
    }
    if (outlet.inout === Graph.OUT) {
      this.outputs.splice(this.outputs.indexOf(outlet), 1);
    }
    this.all.splice(this.all.indexOf(outlet), 1);
    return this;
  };

  return Node;

})();

module.exports = Node;


},{"./graph":153,"./outlet":156}],156:[function(require,module,exports){
var Graph, Outlet;

Graph = require('./graph');


/*
  In/out outlet on node
 */

Outlet = (function() {
  Outlet.make = function(outlet, extra) {
    var key, meta, value, _ref;
    if (extra == null) {
      extra = {};
    }
    meta = extra;
    if (outlet.meta != null) {
      _ref = outlet.meta;
      for (key in _ref) {
        value = _ref[key];
        meta[key] = value;
      }
    }
    return new Outlet(outlet.inout, outlet.name, outlet.hint, outlet.type, meta);
  };

  Outlet.index = 0;

  Outlet.id = function(name) {
    return "_io_" + (++Outlet.index) + "_" + name;
  };

  Outlet.hint = function(name) {
    name = name.replace(/^(_io_[0-9]+_)/, '');
    return name = name.replace(/(In|Out|Inout|InOut)$/, '');
  };

  function Outlet(inout, name, hint, type, meta, id) {
    this.inout = inout;
    this.name = name;
    this.hint = hint;
    this.type = type;
    this.meta = meta != null ? meta : {};
    this.id = id;
    if (this.hint == null) {
      this.hint = Outlet.hint(name);
    }
    this.node = null;
    this.input = null;
    this.output = [];
    if (this.id == null) {
      this.id = Outlet.id(this.hint);
    }
  }

  Outlet.prototype.morph = function(outlet) {
    this.inout = outlet.inout;
    this.name = outlet.name;
    this.hint = outlet.hint;
    this.type = outlet.type;
    return this.meta = outlet.meta;
  };

  Outlet.prototype.dupe = function(name) {
    var outlet;
    if (name == null) {
      name = this.id;
    }
    outlet = Outlet.make(this);
    outlet.name = name;
    return outlet;
  };

  Outlet.prototype.connect = function(outlet) {
    if (this.inout === Graph.IN && outlet.inout === Graph.OUT) {
      return outlet.connect(this);
    }
    if (this.inout !== Graph.OUT || outlet.inout !== Graph.IN) {
      throw "Can only connect out to in.";
    }
    if (outlet.input === this) {
      return;
    }
    outlet.disconnect();
    outlet.input = this;
    return this.output.push(outlet);
  };

  Outlet.prototype.disconnect = function(outlet) {
    var index, _i, _len, _ref;
    if (this.input) {
      this.input.disconnect(this);
    }
    if (this.output.length) {
      if (outlet) {
        index = this.output.indexOf(outlet);
        if (index >= 0) {
          this.output.splice(index, 1);
          return outlet.input = null;
        }
      } else {
        _ref = this.output;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          outlet = _ref[_i];
          outlet.input = null;
        }
        return this.output = [];
      }
    }
  };

  return Outlet;

})();

module.exports = Outlet;


},{"./graph":153}],157:[function(require,module,exports){
var Block, Graph, Layout, Program, debug;

Graph = require('../graph');

Program = require('../linker').Program;

Layout = require('../linker').Layout;

debug = false;

Block = (function() {
  Block.previous = function(outlet) {
    var _ref;
    return (_ref = outlet.input) != null ? _ref.node.owner : void 0;
  };

  function Block() {
    var _ref;
    if (this.namespace == null) {
      this.namespace = Program.entry();
    }
    this.node = new Graph.Node(this, (_ref = typeof this.makeOutlets === "function" ? this.makeOutlets() : void 0) != null ? _ref : {});
  }

  Block.prototype.refresh = function() {
    var _ref;
    return this.node.setOutlets((_ref = typeof this.makeOutlets === "function" ? this.makeOutlets() : void 0) != null ? _ref : {});
  };

  Block.prototype.clone = function() {
    return new Block;
  };

  Block.prototype.compile = function(language, namespace) {
    var program;
    program = new Program(language, namespace != null ? namespace : Program.entry(), this.node.graph);
    this.call(program, 0);
    return program.assemble();
  };

  Block.prototype.link = function(language, namespace) {
    var layout, module;
    module = this.compile(language, namespace);
    layout = new Layout(language, this.node.graph);
    this._include(module, layout, 0);
    this["export"](layout, 0);
    return layout.link(module);
  };

  Block.prototype.call = function(program, depth) {};

  Block.prototype.callback = function(layout, depth, name, external, outlet) {};

  Block.prototype["export"] = function(layout, depth) {};

  Block.prototype._info = function(suffix) {
    var string, _ref, _ref1;
    string = (_ref = (_ref1 = this.node.owner.snippet) != null ? _ref1._name : void 0) != null ? _ref : this.node.owner.namespace;
    if (suffix != null) {
      return string += '.' + suffix;
    }
  };

  Block.prototype._outlet = function(def, props) {
    var outlet;
    outlet = Graph.Outlet.make(def, props);
    outlet.meta.def = def;
    return outlet;
  };

  Block.prototype._call = function(module, program, depth) {
    return program.call(this.node, module, depth);
  };

  Block.prototype._require = function(module, program) {
    return program.require(this.node, module);
  };

  Block.prototype._inputs = function(module, program, depth) {
    var arg, outlet, _i, _len, _ref, _ref1, _results;
    _ref = module.main.signature;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      outlet = this.node.get(arg.name);
      _results.push((_ref1 = Block.previous(outlet)) != null ? _ref1.call(program, depth + 1) : void 0);
    }
    return _results;
  };

  Block.prototype._callback = function(module, layout, depth, name, external, outlet) {
    return layout.callback(this.node, module, depth, name, external, outlet);
  };

  Block.prototype._include = function(module, layout, depth) {
    return layout.include(this.node, module, depth);
  };

  Block.prototype._link = function(module, layout, depth) {
    var block, ext, key, orig, outlet, parent, _i, _len, _ref, _ref1, _ref2, _results;
    debug && console.log('block::_link', this.toString(), module.namespace);
    _ref = module.symbols;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      ext = module.externals[key];
      outlet = this.node.get(ext.name);
      if (!outlet) {
        throw Error("OutletError: External not found on " + (this._info(ext.name)));
      }
      if (outlet.meta.child != null) {
        continue;
      }
      _ref1 = [outlet, outlet, null], orig = _ref1[0], parent = _ref1[1], block = _ref1[2];
      while (!block && parent) {
        _ref2 = [outlet.meta.parent, parent], parent = _ref2[0], outlet = _ref2[1];
      }
      block = Block.previous(outlet);
      if (!block) {
        throw Error("OutletError: Missing connection on " + (this._info(ext.name)));
      }
      debug && console.log('callback -> ', this.toString(), ext.name, outlet);
      block.callback(layout, depth + 1, key, ext, outlet.input);
      _results.push(block != null ? block["export"](layout, depth + 1) : void 0);
    }
    return _results;
  };

  Block.prototype._trace = function(module, layout, depth) {
    var arg, outlet, _i, _len, _ref, _ref1, _results;
    debug && console.log('block::_trace', this.toString(), module.namespace);
    _ref = module.main.signature;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      outlet = this.node.get(arg.name);
      _results.push((_ref1 = Block.previous(outlet)) != null ? _ref1["export"](layout, depth + 1) : void 0);
    }
    return _results;
  };

  return Block;

})();

module.exports = Block;


},{"../graph":177,"../linker":182}],158:[function(require,module,exports){
var Block, Call,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Block = require('./block');

Call = (function(_super) {
  __extends(Call, _super);

  function Call(snippet) {
    this.snippet = snippet;
    this.namespace = this.snippet.namespace;
    Call.__super__.constructor.apply(this, arguments);
  }

  Call.prototype.clone = function() {
    return new Call(this.snippet);
  };

  Call.prototype.makeOutlets = function() {
    var callbacks, externals, key, main, outlet, params, symbols;
    main = this.snippet.main.signature;
    externals = this.snippet.externals;
    symbols = this.snippet.symbols;
    params = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = main.length; _i < _len; _i++) {
        outlet = main[_i];
        _results.push(this._outlet(outlet, {
          callback: false
        }));
      }
      return _results;
    }).call(this);
    callbacks = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = symbols.length; _i < _len; _i++) {
        key = symbols[_i];
        _results.push(this._outlet(externals[key], {
          callback: true
        }));
      }
      return _results;
    }).call(this);
    return params.concat(callbacks);
  };

  Call.prototype.call = function(program, depth) {
    this._call(this.snippet, program, depth);
    return this._inputs(this.snippet, program, depth);
  };

  Call.prototype["export"] = function(layout, depth) {
    if (!layout.visit(this.namespace, depth)) {
      return;
    }
    this._link(this.snippet, layout, depth);
    return this._trace(this.snippet, layout, depth);
  };

  return Call;

})(Block);

module.exports = Call;


},{"./block":157}],159:[function(require,module,exports){
var Block, Callback, Graph,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Graph = require('../graph');

Block = require('./block');


/*
  Re-use a subgraph as a callback
 */

Callback = (function(_super) {
  __extends(Callback, _super);

  function Callback(graph) {
    this.graph = graph;
    Callback.__super__.constructor.apply(this, arguments);
  }

  Callback.prototype.refresh = function() {
    Callback.__super__.refresh.apply(this, arguments);
    return delete this.subroutine;
  };

  Callback.prototype.clone = function() {
    return new Callback(this.graph);
  };

  Callback.prototype.makeOutlets = function() {
    var handle, ins, outlet, outlets, outs, type, _i, _j, _len, _len1, _ref, _ref1;
    this.make();
    outlets = [];
    ins = [];
    outs = [];
    handle = (function(_this) {
      return function(outlet, list) {
        var dupe, _base;
        if (outlet.meta.callback) {
          if (outlet.inout === Graph.IN) {
            dupe = outlet.dupe();
            if ((_base = dupe.meta).child == null) {
              _base.child = outlet;
            }
            outlet.meta.parent = dupe;
            return outlets.push(dupe);
          }
        } else {
          return list.push(outlet.type);
        }
      };
    })(this);
    _ref = this.graph.inputs();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      handle(outlet, ins);
    }
    _ref1 = this.graph.outputs();
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      handle(outlet, outs);
    }
    ins = ins.join(',');
    outs = outs.join(',');
    type = "(" + ins + ")(" + outs + ")";
    outlets.push({
      name: 'callback',
      type: type,
      inout: Graph.OUT,
      meta: {
        callback: true,
        def: this.subroutine.main
      }
    });
    return outlets;
  };

  Callback.prototype.make = function() {
    return this.subroutine = this.graph.compile(this.namespace);
  };

  Callback.prototype["export"] = function(layout, depth) {
    if (!layout.visit(this.namespace, depth)) {
      return;
    }
    this._link(this.subroutine, layout, depth);
    return this.graph["export"](layout, depth);
  };

  Callback.prototype.call = function(program, depth) {
    return this._require(this.subroutine, program, depth);
  };

  Callback.prototype.callback = function(layout, depth, name, external, outlet) {
    this._include(this.subroutine, layout, depth);
    return this._callback(this.subroutine, layout, depth, name, external, outlet);
  };

  return Callback;

})(Block);

module.exports = Callback;


},{"../graph":177,"./block":157}],160:[function(require,module,exports){
exports.Block = require('./block');

exports.Call = require('./call');

exports.Callback = require('./callback');

exports.Isolate = require('./isolate');

exports.Join = require('./join');


},{"./block":157,"./call":158,"./callback":159,"./isolate":161,"./join":162}],161:[function(require,module,exports){
var Block, Graph, Isolate,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Graph = require('../graph');

Block = require('./block');


/*
  Isolate a subgraph as a single node
 */

Isolate = (function(_super) {
  __extends(Isolate, _super);

  function Isolate(graph) {
    this.graph = graph;
    Isolate.__super__.constructor.apply(this, arguments);
  }

  Isolate.prototype.refresh = function() {
    Isolate.__super__.refresh.apply(this, arguments);
    return delete this.subroutine;
  };

  Isolate.prototype.clone = function() {
    return new Isolate(this.graph);
  };

  Isolate.prototype.makeOutlets = function() {
    var done, dupe, name, outlet, outlets, seen, set, _base, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    this.make();
    outlets = [];
    seen = {};
    done = {};
    _ref = ['inputs', 'outputs'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      set = _ref[_i];
      _ref1 = this.graph[set]();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        outlet = _ref1[_j];
        name = void 0;
        if (((_ref2 = outlet.hint) === 'return' || _ref2 === 'callback') && outlet.inout === Graph.OUT) {
          name = outlet.hint;
        }
        if (seen[name] != null) {
          name = void 0;
        }
        dupe = outlet.dupe(name);
        if ((_base = dupe.meta).child == null) {
          _base.child = outlet;
        }
        outlet.meta.parent = dupe;
        if (name != null) {
          seen[name] = true;
        }
        done[outlet.name] = dupe;
        outlets.push(dupe);
      }
    }
    return outlets;
  };

  Isolate.prototype.make = function() {
    return this.subroutine = this.graph.compile(this.namespace);
  };

  Isolate.prototype.call = function(program, depth) {
    this._call(this.subroutine, program, depth);
    return this._inputs(this.subroutine, program, depth);
  };

  Isolate.prototype["export"] = function(layout, depth) {
    if (!layout.visit(this.namespace, depth)) {
      return;
    }
    this._link(this.subroutine, layout, depth);
    this._trace(this.subroutine, layout, depth);
    return this.graph["export"](layout, depth);
  };

  Isolate.prototype.callback = function(layout, depth, name, external, outlet) {
    outlet = outlet.meta.child;
    return outlet.node.owner.callback(layout, depth, name, external, outlet);
  };

  return Isolate;

})(Block);

module.exports = Isolate;


},{"../graph":177,"./block":157}],162:[function(require,module,exports){
var Block, Join,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Block = require('./block');


/*
  Join multiple disconnected nodes
 */

Join = (function(_super) {
  __extends(Join, _super);

  function Join(nodes) {
    this.nodes = nodes;
    Join.__super__.constructor.apply(this, arguments);
  }

  Join.prototype.clone = function() {
    return new Join(this.nodes);
  };

  Join.prototype.makeOutlets = function() {
    return [];
  };

  Join.prototype.call = function(program, depth) {
    var block, node, _i, _len, _ref, _results;
    _ref = this.nodes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      block = node.owner;
      _results.push(block.call(program, depth));
    }
    return _results;
  };

  Join.prototype["export"] = function(layout, depth) {
    var block, node, _i, _len, _ref, _results;
    _ref = this.nodes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      block = node.owner;
      _results.push(block["export"](layout, depth));
    }
    return _results;
  };

  return Join;

})(Block);

module.exports = Join;


},{"./block":157}],163:[function(require,module,exports){

/*
  Cache decorator  
  Fetches snippets once, clones for reuse
  Inline code is hashed to avoid bloat
 */
var cache, hash, queue;

queue = require('./queue');

hash = require('./hash');

cache = function(fetch) {
  var cached, push;
  cached = {};
  push = queue(100);
  return function(name) {
    var expire, key;
    key = name.length > 32 ? '##' + hash(name).toString(16) : name;
    expire = push(key);
    if (expire != null) {
      delete cached[expire];
    }
    if (cached[key] == null) {
      cached[key] = fetch(name);
    }
    return cached[key].clone();
  };
};

module.exports = cache;


},{"./hash":165,"./queue":169}],164:[function(require,module,exports){
var Block, Factory, Graph, State, Visualize;

Graph = require('../graph').Graph;

Block = require('../block');

Visualize = require('../visualize');


/*
  Chainable factory
  
  Exposes methods to build a graph incrementally
 */

Factory = (function() {
  function Factory(language, fetch, config) {
    this.language = language;
    this.fetch = fetch;
    this.config = config;
    this.graph();
  }

  Factory.prototype.pipe = function(name, uniforms, namespace, defines) {
    if (name instanceof Factory) {
      this._concat(name);
    } else {
      this._call(name, uniforms, namespace, defines);
    }
    return this;
  };

  Factory.prototype.call = function(name, uniforms, namespace, defines) {
    return this.pipe(name, uniforms, namespace, defines);
  };

  Factory.prototype.require = function(name, uniforms, namespace, defines) {
    if (name instanceof Factory) {
      this._import(name);
    } else {
      this.callback();
      this._call(name, uniforms, namespace, defines);
      this.end();
    }
    return this;
  };

  Factory.prototype["import"] = function(name, uniforms, namespace, defines) {
    return this.require(name, uniforms, namespace, defines);
  };

  Factory.prototype.split = function() {
    this._group('_combine', true);
    return this;
  };

  Factory.prototype.fan = function() {
    this._group('_combine', false);
    return this;
  };

  Factory.prototype.isolate = function() {
    this._group('_isolate');
    return this;
  };

  Factory.prototype.callback = function() {
    this._group('_callback');
    return this;
  };

  Factory.prototype.next = function() {
    this._next();
    return this;
  };

  Factory.prototype.pass = function() {
    var pass;
    pass = this._stack[2].end;
    this.end();
    this._state.end = this._state.end.concat(pass);
    return this;
  };

  Factory.prototype.end = function() {
    var main, op, sub, _ref;
    _ref = this._exit(), sub = _ref[0], main = _ref[1];
    op = sub.op;
    if (this[op]) {
      this[op](sub, main);
    }
    return this;
  };

  Factory.prototype.join = function() {
    return this.end();
  };

  Factory.prototype.graph = function() {
    var graph, _ref;
    while (((_ref = this._stack) != null ? _ref.length : void 0) > 1) {
      this.end();
    }
    if (this._graph) {
      this._tail(this._state, this._graph);
    }
    graph = this._graph;
    this._graph = new Graph;
    this._state = new State;
    this._stack = [this._state];
    return graph;
  };

  Factory.prototype.compile = function(namespace) {
    if (namespace == null) {
      namespace = 'main';
    }
    return this.graph().compile(namespace);
  };

  Factory.prototype.link = function(namespace) {
    if (namespace == null) {
      namespace = 'main';
    }
    return this.graph().link(namespace);
  };

  Factory.prototype.serialize = function() {
    return Visualize.serialize(this._graph);
  };

  Factory.prototype.empty = function() {
    return this._graph.nodes.length === 0;
  };

  Factory.prototype._concat = function(factory) {
    var block, error;
    this._tail(factory._state, factory._graph);
    try {
      block = new Block.Isolate(factory._graph);
    } catch (_error) {
      error = _error;
      if (this.config.autoInspect) {
        Visualize.inspect(error, this._graph, factory);
      }
      throw error;
    }
    this._auto(block);
    return this;
  };

  Factory.prototype._import = function(factory) {
    var block, error;
    this._tail(factory._state, factory._graph);
    try {
      block = new Block.Callback(factory._graph);
    } catch (_error) {
      error = _error;
      if (this.config.autoInspect) {
        Visualize.inspect(error, this._graph, factory);
      }
      throw error;
    }
    this._auto(block);
    return this;
  };

  Factory.prototype._combine = function(sub, main) {
    var from, to, _i, _j, _len, _len1, _ref, _ref1;
    _ref = sub.start;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      to = _ref[_i];
      _ref1 = main.end;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        from = _ref1[_j];
        from.connect(to, sub.multi);
      }
    }
    main.end = sub.end;
    return main.nodes = main.nodes.concat(sub.nodes);
  };

  Factory.prototype._isolate = function(sub, main) {
    var block, error, subgraph;
    if (sub.nodes.length) {
      subgraph = this._subgraph(sub);
      this._tail(sub, subgraph);
      try {
        block = new Block.Isolate(subgraph);
      } catch (_error) {
        error = _error;
        if (this.config.autoInspect) {
          Visualize.inspect(error, this._graph, subgraph);
        }
        throw error;
      }
      return this._auto(block);
    }
  };

  Factory.prototype._callback = function(sub, main) {
    var block, error, subgraph;
    if (sub.nodes.length) {
      subgraph = this._subgraph(sub);
      this._tail(sub, subgraph);
      try {
        block = new Block.Callback(subgraph);
      } catch (_error) {
        error = _error;
        if (this.config.autoInspect) {
          Visualize.inspect(error, this._graph, subgraph);
        }
        throw error;
      }
      return this._auto(block);
    }
  };

  Factory.prototype._call = function(name, uniforms, namespace, defines) {
    var block, snippet;
    snippet = this.fetch(name);
    snippet.bind(this.config, uniforms, namespace, defines);
    block = new Block.Call(snippet);
    return this._auto(block);
  };

  Factory.prototype._subgraph = function(sub) {
    var subgraph;
    subgraph = new Graph;
    subgraph.adopt(sub.nodes);
    return subgraph;
  };

  Factory.prototype._tail = function(state, graph) {
    var tail;
    tail = state.end.concat(state.tail);
    tail = tail.filter(function(node, i) {
      return tail.indexOf(node) === i;
    });
    if (tail.length > 1) {
      tail = new Block.Join(tail);
      tail = [tail.node];
    }
    graph.tail = tail[0];
    state.end = tail;
    state.tail = [];
    if (!graph.tail) {
      throw "Cannot finalize empty graph";
    }
    graph.compile = (function(_this) {
      return function(namespace) {
        var error;
        if (namespace == null) {
          namespace = 'main';
        }
        try {
          return graph.tail.owner.compile(_this.language, namespace);
        } catch (_error) {
          error = _error;
          if (_this.config.autoInspect) {
            graph.inspect(error);
          }
          throw error;
        }
      };
    })(this);
    graph.link = (function(_this) {
      return function(namespace) {
        var error;
        if (namespace == null) {
          namespace = 'main';
        }
        try {
          return graph.tail.owner.link(_this.language, namespace);
        } catch (_error) {
          error = _error;
          if (_this.config.autoInspect) {
            graph.inspect(error);
          }
          throw error;
        }
      };
    })(this);
    graph["export"] = (function(_this) {
      return function(layout, depth) {
        return graph.tail.owner["export"](layout, depth);
      };
    })(this);
    return graph.inspect = function(message) {
      if (message == null) {
        message = null;
      }
      return Visualize.inspect(message, graph);
    };
  };

  Factory.prototype._group = function(op, multi) {
    this._push(op, multi);
    this._push();
    return this;
  };

  Factory.prototype._next = function() {
    var sub;
    sub = this._pop();
    this._state.start = this._state.start.concat(sub.start);
    this._state.end = this._state.end.concat(sub.end);
    this._state.nodes = this._state.nodes.concat(sub.nodes);
    this._state.tail = this._state.tail.concat(sub.tail);
    return this._push();
  };

  Factory.prototype._exit = function() {
    this._next();
    this._pop();
    return [this._pop(), this._state];
  };

  Factory.prototype._push = function(op, multi) {
    this._stack.unshift(new State(op, multi));
    return this._state = this._stack[0];
  };

  Factory.prototype._pop = function() {
    var _ref;
    this._state = this._stack[1];
    if (this._state == null) {
      this._state = new State;
    }
    return (_ref = this._stack.shift()) != null ? _ref : new State;
  };

  Factory.prototype._auto = function(block) {
    if (block.node.inputs.length) {
      return this._append(block);
    } else {
      return this._insert(block);
    }
  };

  Factory.prototype._append = function(block) {
    var end, node, _i, _len, _ref;
    node = block.node;
    this._graph.add(node);
    _ref = this._state.end;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      end = _ref[_i];
      end.connect(node);
    }
    if (!this._state.start.length) {
      this._state.start = [node];
    }
    this._state.end = [node];
    this._state.nodes.push(node);
    if (!node.outputs.length) {
      return this._state.tail.push(node);
    }
  };

  Factory.prototype._prepend = function(block) {
    var node, start, _i, _len, _ref;
    node = block.node;
    this._graph.add(node);
    _ref = this._state.start;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      start = _ref[_i];
      node.connect(start);
    }
    if (!this._state.end.length) {
      this._state.end = [node];
    }
    this._state.start = [node];
    this._state.nodes.push(node);
    if (!node.outputs.length) {
      return this._state.tail.push(node);
    }
  };

  Factory.prototype._insert = function(block) {
    var node;
    node = block.node;
    this._graph.add(node);
    this._state.start.push(node);
    this._state.end.push(node);
    this._state.nodes.push(node);
    if (!node.outputs.length) {
      return this._state.tail.push(node);
    }
  };

  return Factory;

})();

State = (function() {
  function State(op, multi, start, end, nodes, tail) {
    this.op = op != null ? op : null;
    this.multi = multi != null ? multi : false;
    this.start = start != null ? start : [];
    this.end = end != null ? end : [];
    this.nodes = nodes != null ? nodes : [];
    this.tail = tail != null ? tail : [];
  }

  return State;

})();

module.exports = Factory;


},{"../block":160,"../graph":177,"../visualize":188}],165:[function(require,module,exports){
var c1, c2, c3, c4, c5, hash, imul, test;

c1 = 0xcc9e2d51;

c2 = 0x1b873593;

c3 = 0xe6546b64;

c4 = 0x85ebca6b;

c5 = 0xc2b2ae35;

imul = function(a, b) {
  var ah, al, bh, bl;
  ah = (a >>> 16) & 0xffff;
  al = a & 0xffff;
  bh = (b >>> 16) & 0xffff;
  bl = b & 0xffff;
  return (al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0;
};

if (Math.imul != null) {
  test = Math.imul(0xffffffff, 5);
  if (test === -5) {
    imul = Math.imul;
  }
}

hash = function(string) {
  var h, iterate, j, m, n, next;
  n = string.length;
  m = Math.floor(n / 2);
  j = h = 0;
  next = function() {
    return string.charCodeAt(j++);
  };
  iterate = function(a, b) {
    var k;
    k = a | (b << 16);
    k ^= k << 9;
    k = imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = imul(k, c2);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = imul(h, 5);
    return h = (h + c3) | 0;
  };
  while (m--) {
    iterate(next(), next());
  }
  if (n & 1) {
    iterate(next(), 0);
  }
  h ^= n;
  h ^= h >>> 16;
  h = imul(h, c4);
  h ^= h >>> 13;
  h = imul(h, c5);
  return h ^= h >>> 16;
};

module.exports = hash;


},{}],166:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Material = require('./material');

exports.library = require('./library');

exports.cache = require('./cache');

exports.queue = require('./queue');

exports.hash = require('./hash');


},{"./cache":163,"./factory":164,"./hash":165,"./library":167,"./material":168,"./queue":169}],167:[function(require,module,exports){

/*
  Snippet library
  
  Takes:
    - Hash of snippets: named library
    - (name) -> getter: dynamic lookup
    - nothing:          no library, only pass in inline source code
  
  If 'name' contains any of "{;(#" it is assumed to be direct GLSL code.
 */
var library;

library = function(language, snippets, load) {
  var callback, inline;
  callback = null;
  if (snippets != null) {
    if (typeof snippets === 'function') {
      callback = function(name) {
        return load(language, name, snippets(name));
      };
    } else if (typeof snippets === 'object') {
      callback = function(name) {
        if (snippets[name] == null) {
          throw "Unknown snippet `" + name + "`";
        }
        return load(language, name, snippets[name]);
      };
    }
  }
  inline = function(code) {
    return load(language, '', code);
  };
  if (callback == null) {
    return inline;
  }
  return function(name) {
    if (name.match(/[{;(#]/)) {
      return inline(name);
    }
    return callback(name);
  };
};

module.exports = library;


},{}],168:[function(require,module,exports){
var Material, debug, tick;

debug = false;

tick = function() {
  var now;
  now = +(new Date);
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

Material = (function() {
  function Material(vertex, fragment) {
    this.vertex = vertex;
    this.fragment = fragment;
    if (debug) {
      this.tock = tick();
    }
  }

  Material.prototype.build = function(options) {
    return this.link(options);
  };

  Material.prototype.link = function(options) {
    var attributes, fragment, key, shader, uniforms, value, varyings, vertex, _i, _len, _ref, _ref1, _ref2, _ref3;
    if (options == null) {
      options = {};
    }
    uniforms = {};
    varyings = {};
    attributes = {};
    vertex = this.vertex.link('main');
    fragment = this.fragment.link('main');
    _ref = [vertex, fragment];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shader = _ref[_i];
      _ref1 = shader.uniforms;
      for (key in _ref1) {
        value = _ref1[key];
        uniforms[key] = value;
      }
      _ref2 = shader.varyings;
      for (key in _ref2) {
        value = _ref2[key];
        varyings[key] = value;
      }
      _ref3 = shader.attributes;
      for (key in _ref3) {
        value = _ref3[key];
        attributes[key] = value;
      }
    }
    options.vertexShader = vertex.code;
    options.vertexGraph = vertex.graph;
    options.fragmentShader = fragment.code;
    options.fragmentGraph = fragment.graph;
    options.attributes = attributes;
    options.uniforms = uniforms;
    options.varyings = varyings;
    if (debug) {
      this.tock('Material build');
    }
    return options;
  };

  return Material;

})();

module.exports = Material;


},{}],169:[function(require,module,exports){
var queue;

queue = function(limit) {
  var add, count, head, map, remove, tail;
  if (limit == null) {
    limit = 100;
  }
  map = {};
  head = null;
  tail = null;
  count = 0;
  add = function(item) {
    item.prev = null;
    item.next = head;
    if (head != null) {
      head.prev = item;
    }
    head = item;
    if (tail == null) {
      return tail = item;
    }
  };
  remove = function(item) {
    var next, prev;
    prev = item.prev;
    next = item.next;
    if (prev != null) {
      prev.next = next;
    }
    if (next != null) {
      next.prev = prev;
    }
    if (head === item) {
      head = next;
    }
    if (tail === item) {
      return tail = prev;
    }
  };
  return function(key) {
    var dead, item;
    if (item = map[key] && item !== head) {
      remove(item);
      add(item);
    } else {
      if (count === limit) {
        dead = tail.key;
        remove(tail);
        delete map[dead];
      } else {
        count++;
      }
      item = {
        next: head,
        prev: null,
        key: key
      };
      add(item);
      map[key] = item;
    }
    return dead;
  };
};

module.exports = queue;


},{}],170:[function(require,module,exports){

/*
  Compile snippet back into GLSL, but with certain symbols replaced by prefixes / placeholders
 */
var compile, replaced, string_compiler, tick;

compile = function(program) {
  var assembler, ast, code, placeholders, signatures;
  ast = program.ast, code = program.code, signatures = program.signatures;
  placeholders = replaced(signatures);
  assembler = string_compiler(code, placeholders);
  return [signatures, assembler];
};

tick = function() {
  var now;
  now = +(new Date);
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

replaced = function(signatures) {
  var key, out, s, sig, _i, _j, _len, _len1, _ref, _ref1;
  out = {};
  s = function(sig) {
    return out[sig.name] = true;
  };
  s(signatures.main);
  _ref = ['external', 'internal', 'varying', 'uniform', 'attribute'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    key = _ref[_i];
    _ref1 = signatures[key];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      sig = _ref1[_j];
      s(sig);
    }
  }
  return out;
};


/*
String-replacement based compiler
 */

string_compiler = function(code, placeholders) {
  var key, re;
  re = new RegExp('\\b(' + ((function() {
    var _results;
    _results = [];
    for (key in placeholders) {
      _results.push(key);
    }
    return _results;
  })()).join('|') + ')\\b', 'g');
  code = code.replace(/\/\/[^\n]*/g, '');
  code = code.replace(/\/\*([^*]|\*[^\/])*\*\//g, '');
  return function(prefix, exceptions, defines) {
    var compiled, defs, replace, value;
    if (prefix == null) {
      prefix = '';
    }
    if (exceptions == null) {
      exceptions = {};
    }
    if (defines == null) {
      defines = {};
    }
    replace = {};
    for (key in placeholders) {
      replace[key] = exceptions[key] != null ? key : prefix + key;
    }
    compiled = code.replace(re, function(key) {
      return replace[key];
    });
    defs = (function() {
      var _results;
      _results = [];
      for (key in defines) {
        value = defines[key];
        _results.push("#define " + key + " " + value);
      }
      return _results;
    })();
    if (defs.length) {
      defs.push('');
    }
    return defs.join("\n") + compiled;
  };
};

module.exports = compile;


},{}],171:[function(require,module,exports){
module.exports = {
  SHADOW_ARG: '_i_o',
  RETURN_ARG: 'return'
};


},{}],172:[function(require,module,exports){
var Definition, decl, defaults, get, three, threejs, win;

module.exports = decl = {};

decl["in"] = 0;

decl.out = 1;

decl.inout = 2;

get = function(n) {
  return n.token.data;
};

decl.node = function(node) {
  var _ref, _ref1;
  if (((_ref = node.children[5]) != null ? _ref.type : void 0) === 'function') {
    return decl["function"](node);
  } else if (((_ref1 = node.token) != null ? _ref1.type : void 0) === 'keyword') {
    return decl.external(node);
  }
};

decl.external = function(node) {
  var c, i, ident, list, next, out, quant, storage, struct, type, _i, _len, _ref;
  c = node.children;
  storage = get(c[1]);
  struct = get(c[3]);
  type = get(c[4]);
  list = c[5];
  if (storage !== 'attribute' && storage !== 'uniform' && storage !== 'varying') {
    storage = 'global';
  }
  out = [];
  _ref = list.children;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    c = _ref[i];
    if (c.type === 'ident') {
      ident = get(c);
      next = list.children[i + 1];
      quant = (next != null ? next.type : void 0) === 'quantifier';
      out.push({
        decl: 'external',
        storage: storage,
        type: type,
        ident: ident,
        quant: !!quant,
        count: quant
      });
    }
  }
  return out;
};

decl["function"] = function(node) {
  var args, body, c, child, decls, func, ident, storage, struct, type;
  c = node.children;
  storage = get(c[1]);
  struct = get(c[3]);
  type = get(c[4]);
  func = c[5];
  ident = get(func.children[0]);
  args = func.children[1];
  body = func.children[2];
  decls = (function() {
    var _i, _len, _ref, _results;
    _ref = args.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      _results.push(decl.argument(child));
    }
    return _results;
  })();
  return [
    {
      decl: 'function',
      storage: storage,
      type: type,
      ident: ident,
      body: !!body,
      args: decls
    }
  ];
};

decl.argument = function(node) {
  var c, count, ident, inout, list, quant, storage, type;
  c = node.children;
  storage = get(c[1]);
  inout = get(c[2]);
  type = get(c[4]);
  list = c[5];
  ident = get(list.children[0]);
  quant = list.children[1];
  count = quant ? quant.children[0].token.data : void 0;
  return {
    decl: 'argument',
    storage: storage,
    inout: inout,
    type: type,
    ident: ident,
    quant: !!quant,
    count: count
  };
};

decl.param = function(dir, storage, spec, quant, count) {
  var f, prefix, suffix;
  prefix = [];
  if (storage != null) {
    prefix.push(storage);
  }
  if (spec != null) {
    prefix.push(spec);
  }
  prefix.push('');
  prefix = prefix.join(' ');
  suffix = quant ? '[' + count + ']' : '';
  if (dir !== '') {
    dir += ' ';
  }
  f = function(name, long) {
    return (long ? dir : '') + ("" + prefix + name + suffix);
  };
  f.split = function(dir) {
    return decl.param(dir, storage, spec, quant, count);
  };
  return f;
};

win = typeof window !== 'undefined';

threejs = win && !!window.THREE;

defaults = {
  int: 0,
  float: 0,
  vec2: threejs ? THREE.Vector2 : null,
  vec3: threejs ? THREE.Vector3 : null,
  vec4: threejs ? THREE.Vector4 : null,
  mat2: null,
  mat3: threejs ? THREE.Matrix3 : null,
  mat4: threejs ? THREE.Matrix4 : null,
  sampler2D: 0,
  samplerCube: 0
};

three = {
  int: 'i',
  float: 'f',
  vec2: 'v2',
  vec3: 'v3',
  vec4: 'v4',
  mat2: 'm2',
  mat3: 'm3',
  mat4: 'm4',
  sampler2D: 't',
  samplerCube: 't'
};

decl.type = function(name, spec, quant, count, dir, storage) {
  var dirs, inout, param, storages, type, value, _ref;
  dirs = {
    "in": decl["in"],
    out: decl.out,
    inout: decl.inout
  };
  storages = {
    "const": 'const'
  };
  type = three[spec];
  if (quant) {
    type += 'v';
  }
  value = defaults[spec];
  if (value != null ? value.call : void 0) {
    value = new value;
  }
  if (quant) {
    value = [value];
  }
  inout = (_ref = dirs[dir]) != null ? _ref : dirs["in"];
  storage = storages[storage];
  param = decl.param(dir, storage, spec, quant, count);
  return new Definition(name, type, spec, param, value, inout);
};

Definition = (function() {
  function Definition(name, type, spec, param, value, inout, meta) {
    this.name = name;
    this.type = type;
    this.spec = spec;
    this.param = param;
    this.value = value;
    this.inout = inout;
    this.meta = meta;
  }

  Definition.prototype.split = function() {
    var dir, inout, isIn, param;
    isIn = this.meta.shadowed != null;
    dir = isIn ? 'in' : 'out';
    inout = isIn ? decl["in"] : decl.out;
    param = this.param.split(dir);
    return new Definition(this.name, this.type, this.spec, param, this.value, inout);
  };

  Definition.prototype.copy = function(name, meta) {
    var def;
    return def = new Definition(name != null ? name : this.name, this.type, this.spec, this.param, this.value, this.inout, meta);
  };

  return Definition;

})();


},{}],173:[function(require,module,exports){
var $, Graph, _;

Graph = require('../graph');

$ = require('./constants');


/*
 GLSL code generator for compiler and linker stubs
 */

module.exports = _ = {
  unshadow: function(name) {
    var real;
    real = name.replace($.SHADOW_ARG, '');
    if (real !== name) {
      return real;
    } else {
      return null;
    }
  },
  lines: function(lines) {
    return lines.join('\n');
  },
  list: function(lines) {
    return lines.join(', ');
  },
  statements: function(lines) {
    return lines.join(';\n');
  },
  body: function(entry) {
    return {
      entry: entry,
      type: 'void',
      params: [],
      signature: [],
      "return": '',
      vars: {},
      calls: [],
      post: [],
      chain: {}
    };
  },
  define: function(a, b) {
    return "#define " + a + " " + b;
  },
  "function": function(type, entry, params, vars, calls) {
    return "" + type + " " + entry + "(" + params + ") {\n" + vars + calls + "}";
  },
  invoke: function(ret, entry, args) {
    ret = ret ? "" + ret + " = " : '';
    args = _.list(args);
    return "  " + ret + entry + "(" + args + ")";
  },
  same: function(a, b) {
    var A, B, i, _i, _len;
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      A = a[i];
      B = b[i];
      if (!B) {
        return false;
      }
      if (A.type !== B.type) {
        return false;
      }
      if ((A.name === $.RETURN_ARG) !== (B.name === $.RETURN_ARG)) {
        return false;
      }
    }
    return true;
  },
  call: function(lookup, dangling, entry, signature, body) {
    var arg, args, copy, id, inout, isReturn, meta, name, omit, other, ret, rets, shadow, _i, _len, _ref, _ref1;
    args = [];
    ret = '';
    rets = 1;
    for (_i = 0, _len = signature.length; _i < _len; _i++) {
      arg = signature[_i];
      name = arg.name;
      copy = id = lookup(name);
      other = null;
      meta = null;
      omit = false;
      inout = arg.inout;
      isReturn = name === $.RETURN_ARG;
      if (shadow = (_ref = arg.meta) != null ? _ref.shadowed : void 0) {
        other = lookup(shadow);
        if (other) {
          body.vars[other] = "  " + arg.param(other);
          body.calls.push("  " + other + " = " + id);
          if (!dangling(shadow)) {
            arg = arg.split();
          } else {
            meta = {
              shadowed: other
            };
          }
        }
      }
      if (shadow = (_ref1 = arg.meta) != null ? _ref1.shadow : void 0) {
        other = lookup(shadow);
        if (other) {
          if (!dangling(shadow)) {
            arg = arg.split();
            omit = true;
          } else {
            meta = {
              shadow: other
            };
            continue;
          }
        }
      }
      if (isReturn) {
        ret = id;
      } else if (!omit) {
        args.push(other != null ? other : id);
      }
      if (dangling(name)) {
        if (isReturn) {
          if (body["return"] === '') {
            copy = name;
            body.type = arg.spec;
            body["return"] = "  return " + id;
            body.vars[id] = "  " + arg.param(id);
          } else {
            body.vars[id] = "  " + arg.param(id);
            body.params.push(arg.param(id, true));
          }
        } else {
          body.params.push(arg.param(id, true));
        }
        arg = arg.copy(copy, meta);
        body.signature.push(arg);
      } else {
        body.vars[id] = "  " + arg.param(id);
      }
    }
    return body.calls.push(_.invoke(ret, entry, args));
  },
  build: function(body, calls) {
    var a, b, code, decl, entry, params, post, ret, type, v, vars;
    entry = body.entry;
    code = null;
    if (calls && calls.length === 1 && entry !== 'main') {
      a = body;
      b = calls[0].module;
      if (_.same(body.signature, b.main.signature)) {
        code = _.define(entry, b.entry);
      }
    }
    if (code == null) {
      vars = (function() {
        var _ref, _results;
        _ref = body.vars;
        _results = [];
        for (v in _ref) {
          decl = _ref[v];
          _results.push(decl);
        }
        return _results;
      })();
      calls = body.calls;
      post = body.post;
      params = body.params;
      type = body.type;
      ret = body["return"];
      calls = calls.concat(post);
      if (ret !== '') {
        calls.push(ret);
      }
      calls.push('');
      if (vars.length) {
        vars.push('');
        vars = _.statements(vars) + '\n';
      } else {
        vars = '';
      }
      calls = _.statements(calls);
      params = _.list(params);
      code = _["function"](type, entry, params, vars, calls);
    }
    return {
      signature: body.signature,
      code: code,
      name: entry
    };
  },
  links: function(links) {
    var l, out, _i, _len;
    out = {
      defs: [],
      bodies: []
    };
    for (_i = 0, _len = links.length; _i < _len; _i++) {
      l = links[_i];
      _.link(l, out);
    }
    out.defs = _.lines(out.defs);
    out.bodies = _.statements(out.bodies);
    if (out.defs === '') {
      delete out.defs;
    }
    if (out.bodies === '') {
      delete out.bodies;
    }
    return out;
  },
  link: (function(_this) {
    return function(link, out) {
      var arg, entry, external, inner, ins, list, main, map, module, name, other, outer, outs, returnVar, wrapper, _dangling, _i, _j, _len, _len1, _lookup, _name, _ref, _ref1;
      module = link.module, name = link.name, external = link.external;
      main = module.main;
      entry = module.entry;
      if (_.same(main.signature, external.signature)) {
        return out.defs.push(_.define(name, entry));
      }
      ins = [];
      outs = [];
      map = {};
      returnVar = [module.namespace, $.RETURN_ARG].join('');
      _ref = external.signature;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        list = arg.inout === Graph.IN ? ins : outs;
        list.push(arg);
      }
      _ref1 = main.signature;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        arg = _ref1[_j];
        list = arg.inout === Graph.IN ? ins : outs;
        other = list.shift();
        _name = other.name;
        if (_name === $.RETURN_ARG) {
          _name = returnVar;
        }
        map[arg.name] = _name;
      }
      _lookup = function(name) {
        return map[name];
      };
      _dangling = function() {
        return true;
      };
      inner = _.body();
      _.call(_lookup, _dangling, entry, main.signature, inner);
      inner.entry = entry;
      map = {
        "return": returnVar
      };
      _lookup = function(name) {
        var _ref2;
        return (_ref2 = map[name]) != null ? _ref2 : name;
      };
      outer = _.body();
      wrapper = _.call(_lookup, _dangling, entry, external.signature, outer);
      outer.calls = inner.calls;
      outer.entry = name;
      out.bodies.push(_.build(inner).code.split(' {')[0]);
      return out.bodies.push(_.build(outer).code);
    };
  })(this),
  defuse: function(code) {
    var b, blocks, hash, head, i, j, level, line, re, rest, strip, _i, _j, _len, _len1;
    re = /([A-Za-z0-9_]+\s+)?[A-Za-z0-9_]+\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*;\s*/mg;
    strip = function(code) {
      return code.replace(re, function(m) {
        return '';
      });
    };
    blocks = code.split(/(?=[{}])/g);
    level = 0;
    for (i = _i = 0, _len = blocks.length; _i < _len; i = ++_i) {
      b = blocks[i];
      switch (b[0]) {
        case '{':
          level++;
          break;
        case '}':
          level--;
      }
      if (level === 0) {
        hash = b.split(/^[ \t]*#/m);
        for (j = _j = 0, _len1 = hash.length; _j < _len1; j = ++_j) {
          line = hash[j];
          if (j > 0) {
            line = line.split(/\n/);
            head = line.shift();
            rest = line.join("\n");
            hash[j] = [head, strip(rest)].join('\n');
          } else {
            hash[j] = strip(line);
          }
        }
        blocks[i] = hash.join('#');
      }
    }
    return code = blocks.join('');
  },
  dedupe: function(code) {
    var map, re;
    map = {};
    re = /((attribute|uniform|varying)\s+)[A-Za-z0-9_]+\s+([A-Za-z0-9_]+)\s*(\[[^\]]*\]\s*)?;\s*/mg;
    return code.replace(re, function(m, qual, type, name, struct) {
      if (map[name]) {
        return '';
      }
      map[name] = true;
      return m;
    });
  },
  hoist: function(code) {
    var defs, line, lines, list, out, re, _i, _len;
    re = /^#define ([^ ]+ _pg_[0-9]+_|_pg_[0-9]+_ [^ ]+)$/;
    lines = code.split(/\n/g);
    defs = [];
    out = [];
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      list = line.match(re) ? defs : out;
      list.push(line);
    }
    return defs.concat(out).join("\n");
  }
};


},{"../graph":177,"./constants":171}],174:[function(require,module,exports){
var k, v, _i, _len, _ref;

exports.compile = require('./compile');

exports.parse = require('./parse');

exports.generate = require('./generate');

_ref = require('./constants');
for (v = _i = 0, _len = _ref.length; _i < _len; v = ++_i) {
  k = _ref[v];
  exports[k] = v;
}


},{"./compile":170,"./constants":171,"./generate":173,"./parse":175}],175:[function(require,module,exports){
var $, collect, debug, decl, extractSignatures, mapSymbols, parse, parseGLSL, parser, processAST, sortSymbols, tick, tokenizer, walk;

tokenizer = require('../../vendor/glsl-tokenizer');

parser = require('../../vendor/glsl-parser');

decl = require('./decl');

$ = require('./constants');

debug = false;


/*
parse GLSL into AST
extract all global symbols and make type signatures
 */

parse = function(name, code) {
  var ast, program;
  ast = parseGLSL(name, code);
  return program = processAST(ast, code);
};

parseGLSL = function(name, code) {
  var ast, error, errors, tock, _i, _len, _ref, _ref1;
  if (debug) {
    tock = tick();
  }
  _ref = tokenizer().process(parser(), code), (_ref1 = _ref[0], ast = _ref1[0]), errors = _ref[1];
  if (debug) {
    tock('GLSL Tokenize & Parse');
  }
  if (!ast || errors.length) {
    if (!name) {
      name = '(inline code)';
    }
    for (_i = 0, _len = errors.length; _i < _len; _i++) {
      error = errors[_i];
      console.error("[ShaderGraph] " + name + " -", error.message);
    }
    throw "GLSL parse error";
  }
  return ast;
};

processAST = function(ast, code) {
  var externals, internals, main, signatures, symbols, tock, _ref;
  if (debug) {
    tock = tick();
  }
  symbols = [];
  walk(mapSymbols, collect(symbols), ast, '');
  _ref = sortSymbols(symbols), main = _ref[0], internals = _ref[1], externals = _ref[2];
  signatures = extractSignatures(main, internals, externals);
  if (debug) {
    tock('GLSL AST');
  }
  return {
    ast: ast,
    code: code,
    signatures: signatures
  };
};

mapSymbols = function(node, collect) {
  switch (node.type) {
    case 'decl':
      collect(decl.node(node));
      return false;
  }
  return true;
};

collect = function(out) {
  return function(value) {
    var obj, _i, _len, _results;
    if (value != null) {
      _results = [];
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        obj = value[_i];
        _results.push(out.push(obj));
      }
      return _results;
    }
  };
};

sortSymbols = function(symbols) {
  var e, externals, found, internals, main, maybe, s, _i, _len;
  main = null;
  internals = [];
  externals = [];
  maybe = {};
  found = false;
  for (_i = 0, _len = symbols.length; _i < _len; _i++) {
    s = symbols[_i];
    if (!s.body) {
      if (s.storage === 'global') {
        internals.push(s);
      } else {
        externals.push(s);
        maybe[s.ident] = true;
      }
    } else {
      if (maybe[s.ident]) {
        externals = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = externals.length; _j < _len1; _j++) {
            e = externals[_j];
            if (e.ident !== s.ident) {
              _results.push(e);
            }
          }
          return _results;
        })();
        delete maybe[s.ident];
      }
      internals.push(s);
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

extractSignatures = function(main, internals, externals) {
  var def, defn, func, sigs, symbol, _i, _j, _len, _len1;
  sigs = {
    uniform: [],
    attribute: [],
    varying: [],
    external: [],
    internal: [],
    global: [],
    main: null
  };
  defn = function(symbol) {
    return decl.type(symbol.ident, symbol.type, symbol.quant, symbol.count, symbol.inout, symbol.storage);
  };
  func = function(symbol, inout) {
    var a, arg, b, d, def, ins, outs, signature, type, _i, _len;
    signature = (function() {
      var _i, _len, _ref, _results;
      _ref = symbol.args;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        _results.push(defn(arg));
      }
      return _results;
    })();
    for (_i = 0, _len = signature.length; _i < _len; _i++) {
      d = signature[_i];
      if (!(d.inout === decl.inout)) {
        continue;
      }
      a = d;
      b = d.copy();
      a.inout = decl["in"];
      b.inout = decl.out;
      b.meta = {
        shadow: a.name
      };
      b.name += $.SHADOW_ARG;
      a.meta = {
        shadowed: b.name
      };
      signature.push(b);
    }
    if (symbol.type !== 'void') {
      signature.push(decl.type($.RETURN_ARG, symbol.type, false, '', 'out'));
    }
    ins = ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = signature.length; _j < _len1; _j++) {
        d = signature[_j];
        if (d.inout === decl["in"]) {
          _results.push(d.type);
        }
      }
      return _results;
    })()).join(',');
    outs = ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = signature.length; _j < _len1; _j++) {
        d = signature[_j];
        if (d.inout === decl.out) {
          _results.push(d.type);
        }
      }
      return _results;
    })()).join(',');
    type = "(" + ins + ")(" + outs + ")";
    return def = {
      name: symbol.ident,
      type: type,
      signature: signature,
      inout: inout,
      spec: symbol.type
    };
  };
  sigs.main = func(main, decl.out);
  for (_i = 0, _len = internals.length; _i < _len; _i++) {
    symbol = internals[_i];
    sigs.internal.push({
      name: symbol.ident
    });
  }
  for (_j = 0, _len1 = externals.length; _j < _len1; _j++) {
    symbol = externals[_j];
    switch (symbol.decl) {
      case 'external':
        def = defn(symbol);
        sigs[symbol.storage].push(def);
        break;
      case 'function':
        def = func(symbol, decl["in"]);
        sigs.external.push(def);
    }
  }
  return sigs;
};

debug = false;

walk = function(map, collect, node, indent) {
  var child, i, recurse, _i, _len, _ref, _ref1, _ref2;
  debug && console.log(indent, node.type, (_ref = node.token) != null ? _ref.data : void 0, (_ref1 = node.token) != null ? _ref1.type : void 0);
  recurse = map(node, collect);
  if (recurse) {
    _ref2 = node.children;
    for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
      child = _ref2[i];
      walk(map, collect, child, indent + '  ', debug);
    }
  }
  return null;
};

tick = function() {
  var now;
  now = +(new Date);
  return function(label) {
    var delta;
    delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

module.exports = walk;

module.exports = parse;


},{"../../vendor/glsl-parser":191,"../../vendor/glsl-tokenizer":195,"./constants":171,"./decl":172}],176:[function(require,module,exports){

/*
  Graph of nodes with outlets
 */
var Graph;

Graph = (function() {
  Graph.index = 0;

  Graph.id = function(name) {
    return ++Graph.index;
  };

  Graph.IN = 0;

  Graph.OUT = 1;

  function Graph(nodes, parent) {
    this.parent = parent != null ? parent : null;
    this.id = Graph.id();
    this.nodes = [];
    nodes && this.add(nodes);
  }

  Graph.prototype.inputs = function() {
    var inputs, node, outlet, _i, _j, _len, _len1, _ref, _ref1;
    inputs = [];
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _ref1 = node.inputs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        outlet = _ref1[_j];
        if (outlet.input === null) {
          inputs.push(outlet);
        }
      }
    }
    return inputs;
  };

  Graph.prototype.outputs = function() {
    var node, outlet, outputs, _i, _j, _len, _len1, _ref, _ref1;
    outputs = [];
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _ref1 = node.outputs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        outlet = _ref1[_j];
        if (outlet.output.length === 0) {
          outputs.push(outlet);
        }
      }
    }
    return outputs;
  };

  Graph.prototype.getIn = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.inputs();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Graph.prototype.getOut = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.outputs();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Graph.prototype.add = function(node, ignore) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.add(_node);
      }
      return;
    }
    if (node.graph && !ignore) {
      throw "Adding node to two graphs at once";
    }
    node.graph = this;
    return this.nodes.push(node);
  };

  Graph.prototype.remove = function(node, ignore) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.remove(_node);
      }
      return;
    }
    if (node.graph !== this) {
      throw "Removing node from wrong graph.";
    }
    ignore || node.disconnect();
    this.nodes.splice(this.nodes.indexOf(node), 1);
    return node.graph = null;
  };

  Graph.prototype.adopt = function(node) {
    var _i, _len, _node;
    if (node.length) {
      for (_i = 0, _len = node.length; _i < _len; _i++) {
        _node = node[_i];
        this.adopt(_node);
      }
      return;
    }
    node.graph.remove(node, true);
    return this.add(node, true);
  };

  return Graph;

})();

module.exports = Graph;


},{}],177:[function(require,module,exports){
exports.Graph = require('./graph');

exports.Node = require('./node');

exports.Outlet = require('./outlet');

exports.IN = exports.Graph.IN;

exports.OUT = exports.Graph.OUT;


},{"./graph":176,"./node":178,"./outlet":179}],178:[function(require,module,exports){
var Graph, Node, Outlet;

Graph = require('./graph');

Outlet = require('./outlet');


/*
 Node in graph.
 */

Node = (function() {
  Node.index = 0;

  Node.id = function(name) {
    return ++Node.index;
  };

  function Node(owner, outlets) {
    this.owner = owner;
    this.graph = null;
    this.inputs = [];
    this.outputs = [];
    this.all = [];
    this.outlets = null;
    this.id = Node.id();
    this.setOutlets(outlets);
  }

  Node.prototype.getIn = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.inputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Node.prototype.getOut = function(name) {
    var outlet;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.outputs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        outlet = _ref[_i];
        if (outlet.name === name) {
          _results.push(outlet);
        }
      }
      return _results;
    }).call(this))[0];
  };

  Node.prototype.get = function(name) {
    return this.getIn(name) || this.getOut(name);
  };

  Node.prototype.setOutlets = function(outlets) {
    var existing, hash, key, match, outlet, _i, _j, _k, _len, _len1, _len2, _ref;
    if (outlets != null) {
      if (this.outlets == null) {
        this.outlets = {};
        for (_i = 0, _len = outlets.length; _i < _len; _i++) {
          outlet = outlets[_i];
          if (!(outlet instanceof Outlet)) {
            outlet = Outlet.make(outlet);
          }
          this._add(outlet);
        }
        return;
      }
      hash = function(outlet) {
        return [outlet.name, outlet.inout, outlet.type].join('-');
      };
      match = {};
      for (_j = 0, _len1 = outlets.length; _j < _len1; _j++) {
        outlet = outlets[_j];
        match[hash(outlet)] = true;
      }
      _ref = this.outlets;
      for (key in _ref) {
        outlet = _ref[key];
        key = hash(outlet);
        if (match[key]) {
          match[key] = outlet;
        } else {
          this._remove(outlet);
        }
      }
      for (_k = 0, _len2 = outlets.length; _k < _len2; _k++) {
        outlet = outlets[_k];
        existing = match[hash(outlet)];
        if (existing instanceof Outlet) {
          this._morph(existing, outlet);
        } else {
          if (!(outlet instanceof Outlet)) {
            outlet = Outlet.make(outlet);
          }
          this._add(outlet);
        }
      }
      this;
    }
    return this.outlets;
  };

  Node.prototype.connect = function(node, empty, force) {
    var hint, hints, others, outlet, outlets, type, _i, _j, _len, _len1, _ref, _ref1;
    outlets = {};
    hints = {};
    _ref = node.inputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      if (!force && outlet.input) {
        continue;
      }
      type = outlet.type;
      hint = [type, outlet.hint].join('-');
      if (!hints[hint]) {
        hints[hint] = outlet;
      }
      outlets[type] = outlets[type] || [];
      outlets[type].push(outlet);
    }
    _ref1 = this.outputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      if (empty && outlet.output.length) {
        continue;
      }
      type = outlet.type;
      hint = [type, outlet.hint].join('-');
      others = outlets[type];
      if (hints[hint]) {
        hints[hint].connect(outlet);
        delete hints[hint];
        others.splice(others.indexOf(outlet), 1);
        continue;
      }
      if (others && others.length) {
        others.shift().connect(outlet);
      }
    }
    return this;
  };

  Node.prototype.disconnect = function(node) {
    var outlet, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.inputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      outlet = _ref[_i];
      outlet.disconnect();
    }
    _ref1 = this.outputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      outlet.disconnect();
    }
    return this;
  };

  Node.prototype._key = function(outlet) {
    return [outlet.name, outlet.inout].join('-');
  };

  Node.prototype._add = function(outlet) {
    var key;
    key = this._key(outlet);
    if (outlet.node) {
      throw "Adding outlet to two nodes at once.";
    }
    if (this.outlets[key]) {
      throw "Adding two identical outlets to same node. (" + key + ")";
    }
    outlet.node = this;
    if (outlet.inout === Graph.IN) {
      this.inputs.push(outlet);
    }
    if (outlet.inout === Graph.OUT) {
      this.outputs.push(outlet);
    }
    this.all.push(outlet);
    return this.outlets[key] = outlet;
  };

  Node.prototype._morph = function(existing, outlet) {
    var key;
    key = this._key(outlet);
    delete this.outlets[key];
    existing.morph(outlet);
    key = this._key(outlet);
    return this.outlets[key] = outlet;
  };

  Node.prototype._remove = function(outlet) {
    var inout, key;
    key = this._key(outlet);
    inout = outlet.inout;
    if (outlet.node !== this) {
      throw "Removing outlet from wrong node.";
    }
    outlet.disconnect();
    outlet.node = null;
    delete this.outlets[key];
    if (outlet.inout === Graph.IN) {
      this.inputs.splice(this.inputs.indexOf(outlet), 1);
    }
    if (outlet.inout === Graph.OUT) {
      this.outputs.splice(this.outputs.indexOf(outlet), 1);
    }
    this.all.splice(this.all.indexOf(outlet), 1);
    return this;
  };

  return Node;

})();

module.exports = Node;


},{"./graph":176,"./outlet":179}],179:[function(require,module,exports){
var Graph, Outlet;

Graph = require('./graph');


/*
  In/out outlet on node
 */

Outlet = (function() {
  Outlet.make = function(outlet, extra) {
    var key, meta, value, _ref;
    if (extra == null) {
      extra = {};
    }
    meta = extra;
    if (outlet.meta != null) {
      _ref = outlet.meta;
      for (key in _ref) {
        value = _ref[key];
        meta[key] = value;
      }
    }
    return new Outlet(outlet.inout, outlet.name, outlet.hint, outlet.type, meta);
  };

  Outlet.index = 0;

  Outlet.id = function(name) {
    return "_io_" + (++Outlet.index) + "_" + name;
  };

  Outlet.hint = function(name) {
    name = name.replace(/^(_io_[0-9]+_)/, '');
    return name = name.replace(/(In|Out|Inout|InOut)$/, '');
  };

  function Outlet(inout, name, hint, type, meta, id) {
    this.inout = inout;
    this.name = name;
    this.hint = hint;
    this.type = type;
    this.meta = meta != null ? meta : {};
    this.id = id;
    if (this.hint == null) {
      this.hint = Outlet.hint(name);
    }
    this.node = null;
    this.input = null;
    this.output = [];
    if (this.id == null) {
      this.id = Outlet.id(this.hint);
    }
  }

  Outlet.prototype.morph = function(outlet) {
    this.inout = outlet.inout;
    this.name = outlet.name;
    this.hint = outlet.hint;
    this.type = outlet.type;
    return this.meta = outlet.meta;
  };

  Outlet.prototype.dupe = function(name) {
    var outlet;
    if (name == null) {
      name = this.id;
    }
    outlet = Outlet.make(this);
    outlet.name = name;
    return outlet;
  };

  Outlet.prototype.connect = function(outlet) {
    if (this.inout === Graph.IN && outlet.inout === Graph.OUT) {
      return outlet.connect(this);
    }
    if (this.inout !== Graph.OUT || outlet.inout !== Graph.IN) {
      throw "Can only connect out to in.";
    }
    if (outlet.input === this) {
      return;
    }
    outlet.disconnect();
    outlet.input = this;
    return this.output.push(outlet);
  };

  Outlet.prototype.disconnect = function(outlet) {
    var index, _i, _len, _ref;
    if (this.input) {
      this.input.disconnect(this);
    }
    if (this.output.length) {
      if (outlet) {
        index = this.output.indexOf(outlet);
        if (index >= 0) {
          this.output.splice(index, 1);
          return outlet.input = null;
        }
      } else {
        _ref = this.output;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          outlet = _ref[_i];
          outlet.input = null;
        }
        return this.output = [];
      }
    }
  };

  return Outlet;

})();

module.exports = Outlet;


},{"./graph":176}],180:[function(require,module,exports){
var Block, Factory, GLSL, Graph, Linker, ShaderGraph, Snippet, Visualize, cache, inspect, library, merge, visualize;

Block = require('./block');

Factory = require('./factory');

GLSL = require('./glsl');

Graph = require('./graph');

Linker = require('./linker');

Visualize = require('./visualize');

library = Factory.library;

cache = Factory.cache;

visualize = Visualize.visualize;

inspect = Visualize.inspect;

Snippet = Linker.Snippet;

merge = function(a, b) {
  var key, out, value, _ref;
  if (b == null) {
    b = {};
  }
  out = {};
  for (key in a) {
    value = a[key];
    out[key] = (_ref = b[key]) != null ? _ref : a[key];
  }
  return out;
};

ShaderGraph = (function() {
  function ShaderGraph(snippets, config) {
    var defaults;
    if (!(this instanceof ShaderGraph)) {
      return new ShaderGraph(snippets, config);
    }
    defaults = {
      globalUniforms: false,
      globalVaryings: true,
      globalAttributes: true,
      globals: [],
      autoInspect: false
    };
    this.config = merge(defaults, config);
    this.fetch = cache(library(GLSL, snippets, Snippet.load));
  }

  ShaderGraph.prototype.shader = function(config) {
    var _config;
    if (config == null) {
      config = {};
    }
    _config = merge(this.config, config);
    return new Factory.Factory(GLSL, this.fetch, _config);
  };

  ShaderGraph.prototype.material = function(config) {
    return new Factory.Material(this.shader(config), this.shader(config));
  };

  ShaderGraph.prototype.overlay = function(shader) {
    return ShaderGraph.overlay(shader);
  };

  ShaderGraph.prototype.visualize = function(shader) {
    return ShaderGraph.visualize(shader);
  };

  ShaderGraph.Block = Block;

  ShaderGraph.Factory = Factory;

  ShaderGraph.GLSL = GLSL;

  ShaderGraph.Graph = Graph;

  ShaderGraph.Linker = Linker;

  ShaderGraph.Visualize = Visualize;

  ShaderGraph.inspect = function(shader) {
    return inspect(shader);
  };

  ShaderGraph.visualize = function(shader) {
    return visualize(shader);
  };

  return ShaderGraph;

})();

module.exports = ShaderGraph;

if (typeof window !== 'undefined') {
  window.ShaderGraph = ShaderGraph;
}


},{"./block":160,"./factory":166,"./glsl":174,"./graph":177,"./linker":182,"./visualize":188}],181:[function(require,module,exports){
var Graph, Priority, assemble;

Graph = require('../graph');

Priority = require('./priority');


/*
  Program assembler

  Builds composite program that can act as new module/snippet
  Unconnected input/outputs and undefined callbacks are exposed in the new global/main scope
  If there is only one call with an identical call signature, a #define is output instead.
 */

assemble = function(language, namespace, calls, requires) {
  var adopt, attributes, externals, generate, handle, include, isDangling, library, lookup, process, required, symbols, uniforms, varyings;
  generate = language.generate;
  externals = {};
  symbols = [];
  uniforms = {};
  varyings = {};
  attributes = {};
  library = {};
  process = function() {
    var body, code, includes, lib, main, ns, r, sorted, _ref;
    for (ns in requires) {
      r = requires[ns];
      required(r.node, r.module);
    }
    _ref = handle(calls), body = _ref[0], calls = _ref[1];
    if (namespace != null) {
      body.entry = namespace;
    }
    main = generate.build(body, calls);
    sorted = ((function() {
      var _results;
      _results = [];
      for (ns in library) {
        lib = library[ns];
        _results.push(lib);
      }
      return _results;
    })()).sort(function(a, b) {
      return Priority.compare(a.priority, b.priority);
    });
    includes = sorted.map(function(x) {
      return x.code;
    });
    includes.push(main.code);
    code = generate.lines(includes);
    return {
      namespace: main.name,
      library: library,
      body: main.code,
      code: code,
      main: main,
      entry: main.name,
      symbols: symbols,
      externals: externals,
      uniforms: uniforms,
      varyings: varyings,
      attributes: attributes
    };
  };
  handle = (function(_this) {
    return function(calls) {
      var body, c, call, ns, _i, _len;
      calls = (function() {
        var _results;
        _results = [];
        for (ns in calls) {
          c = calls[ns];
          _results.push(c);
        }
        return _results;
      })();
      calls.sort(function(a, b) {
        return b.priority - a.priority;
      });
      call = function(node, module, priority) {
        var entry, main, _dangling, _lookup;
        include(node, module, priority);
        main = module.main;
        entry = module.entry;
        _lookup = function(name) {
          return lookup(node, name);
        };
        _dangling = function(name) {
          return isDangling(node, name);
        };
        return generate.call(_lookup, _dangling, entry, main.signature, body);
      };
      body = generate.body();
      for (_i = 0, _len = calls.length; _i < _len; _i++) {
        c = calls[_i];
        call(c.node, c.module, c.priority);
      }
      return [body, calls];
    };
  })(this);
  adopt = function(namespace, code, priority) {
    var record;
    record = library[namespace];
    if (record != null) {
      return record.priority = Priority.max(record.priority, priority);
    } else {
      return library[namespace] = {
        code: code,
        priority: priority
      };
    }
  };
  include = function(node, module, priority) {
    var def, key, lib, ns, _ref, _ref1, _ref2, _ref3;
    priority = Priority.make(priority);
    _ref = module.library;
    for (ns in _ref) {
      lib = _ref[ns];
      adopt(ns, lib.code, Priority.nest(priority, lib.priority));
    }
    adopt(module.namespace, module.body, priority);
    _ref1 = module.uniforms;
    for (key in _ref1) {
      def = _ref1[key];
      uniforms[key] = def;
    }
    _ref2 = module.varyings;
    for (key in _ref2) {
      def = _ref2[key];
      varyings[key] = def;
    }
    _ref3 = module.attributes;
    for (key in _ref3) {
      def = _ref3[key];
      attributes[key] = def;
    }
    return required(node, module);
  };
  required = function(node, module) {
    var copy, ext, k, key, v, _i, _len, _ref, _results;
    _ref = module.symbols;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      ext = module.externals[key];
      if (isDangling(node, ext.name)) {
        copy = {};
        for (k in ext) {
          v = ext[k];
          copy[k] = v;
        }
        copy.name = lookup(node, ext.name);
        externals[key] = copy;
        _results.push(symbols.push(key));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  isDangling = function(node, name) {
    var outlet;
    outlet = node.get(name);
    if (outlet.inout === Graph.IN) {
      return outlet.input === null;
    } else if (outlet.inout === Graph.OUT) {
      return outlet.output.length === 0;
    }
  };
  lookup = function(node, name) {
    var outlet;
    outlet = node.get(name);
    if (!outlet) {
      return null;
    }
    if (outlet.input) {
      outlet = outlet.input;
    }
    name = outlet.name;
    return outlet.id;
  };
  return process();
};

module.exports = assemble;


},{"../graph":177,"./priority":185}],182:[function(require,module,exports){
exports.Snippet = require('./snippet');

exports.Program = require('./program');

exports.Layout = require('./layout');

exports.assemble = require('./assemble');

exports.link = require('./link');

exports.priority = require('./priority');

exports.load = exports.Snippet.load;


},{"./assemble":181,"./layout":183,"./link":184,"./priority":185,"./program":186,"./snippet":187}],183:[function(require,module,exports){
var Layout, Snippet, debug, link;

Snippet = require('./snippet');

link = require('./link');

debug = false;


/*
  Program linkage layout
  
  Entry points are added to its dependency graph
  Callbacks are linked either with a go-between function
  or a #define if the signatures are identical.
 */

Layout = (function() {
  function Layout(language, graph) {
    this.language = language;
    this.graph = graph;
    this.links = [];
    this.includes = [];
    this.modules = {};
    this.visits = {};
  }

  Layout.prototype.callback = function(node, module, priority, name, external) {
    return this.links.push({
      node: node,
      module: module,
      priority: priority,
      name: name,
      external: external
    });
  };

  Layout.prototype.include = function(node, module, priority) {
    var m;
    if ((m = this.modules[module.namespace]) != null) {
      return m.priority = Math.max(priority, m.priority);
    } else {
      this.modules[module.namespace] = true;
      return this.includes.push({
        node: node,
        module: module,
        priority: priority
      });
    }
  };

  Layout.prototype.visit = function(namespace) {
    debug && console.log('Visit', namespace, !this.visits[namespace]);
    if (this.visits[namespace]) {
      return false;
    }
    return this.visits[namespace] = true;
  };

  Layout.prototype.link = function(module) {
    var data, key, snippet;
    data = link(this.language, this.links, this.includes, module);
    snippet = new Snippet;
    for (key in data) {
      snippet[key] = data[key];
    }
    snippet.graph = this.graph;
    return snippet;
  };

  return Layout;

})();

module.exports = Layout;


},{"./link":184,"./snippet":187}],184:[function(require,module,exports){
var Graph, Priority, link;

Graph = require('../graph');

Priority = require('./priority');


/*
 Callback linker
 
 Imports given modules and generates linkages for registered callbacks.

 Builds composite program with single module as exported entry point
 */

link = function(language, links, modules, exported) {
  var adopt, attributes, externals, generate, include, includes, isDangling, library, process, symbols, uniforms, varyings;
  generate = language.generate;
  includes = [];
  symbols = [];
  externals = {};
  uniforms = {};
  attributes = {};
  varyings = {};
  library = {};
  process = function() {
    var code, e, exports, header, lib, m, ns, sorted, _i, _len;
    exports = generate.links(links);
    header = [];
    if (exports.defs != null) {
      header.push(exports.defs);
    }
    if (exports.bodies != null) {
      header.push(exports.bodies);
    }
    for (_i = 0, _len = modules.length; _i < _len; _i++) {
      m = modules[_i];
      include(m.node, m.module, m.priority);
    }
    sorted = ((function() {
      var _results;
      _results = [];
      for (ns in library) {
        lib = library[ns];
        _results.push(lib);
      }
      return _results;
    })()).sort(function(a, b) {
      return Priority.compare(a.priority, b.priority);
    });
    includes = sorted.map(function(x) {
      return x.code;
    });
    code = generate.lines(includes);
    code = generate.defuse(code);
    if (header.length) {
      code = [generate.lines(header), code].join("\n");
    }
    code = generate.hoist(code);
    code = generate.dedupe(code);
    e = exported;
    return {
      namespace: e.main.name,
      code: code,
      main: e.main,
      entry: e.main.name,
      externals: externals,
      uniforms: uniforms,
      attributes: attributes,
      varyings: varyings
    };
  };
  adopt = function(namespace, code, priority) {
    var record;
    record = library[namespace];
    if (record != null) {
      return record.priority = Priority.max(record.priority, priority);
    } else {
      return library[namespace] = {
        code: code,
        priority: priority
      };
    }
  };
  include = function(node, module, priority) {
    var def, ext, key, lib, ns, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _results;
    priority = Priority.make(priority);
    _ref = module.library;
    for (ns in _ref) {
      lib = _ref[ns];
      adopt(ns, lib.code, Priority.nest(priority, lib.priority));
    }
    adopt(module.namespace, module.body, priority);
    _ref1 = module.uniforms;
    for (key in _ref1) {
      def = _ref1[key];
      uniforms[key] = def;
    }
    _ref2 = module.varyings;
    for (key in _ref2) {
      def = _ref2[key];
      varyings[key] = def;
    }
    _ref3 = module.attributes;
    for (key in _ref3) {
      def = _ref3[key];
      attributes[key] = def;
    }
    _ref4 = module.symbols;
    _results = [];
    for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
      key = _ref4[_i];
      ext = module.externals[key];
      if (isDangling(node, ext.name)) {
        externals[key] = ext;
        _results.push(symbols.push(key));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  isDangling = function(node, name) {
    var module, outlet, _ref, _ref1;
    outlet = node.get(name);
    if (!outlet) {
      module = (_ref = (_ref1 = node.owner.snippet) != null ? _ref1._name : void 0) != null ? _ref : node.owner.namespace;
      throw "Unable to link program. Unlinked callback `" + name + "` on `" + module + "`";
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


},{"../graph":177,"./priority":185}],185:[function(require,module,exports){
exports.make = function(x) {
  if (x == null) {
    x = [];
  }
  if (!(x instanceof Array)) {
    x = [+x != null ? +x : 0];
  }
  return x;
};

exports.nest = function(a, b) {
  return a.concat(b);
};

exports.compare = function(a, b) {
  var i, n, p, q, _i;
  n = Math.min(a.length, b.length);
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    p = a[i];
    q = b[i];
    if (p > q) {
      return -1;
    }
    if (p < q) {
      return 1;
    }
  }
  a = a.length;
  b = b.length;
  if (a > b) {
    return -1;
  } else if (a < b) {
    return 1;
  } else {
    return 0;
  }
};

exports.max = function(a, b) {
  if (exports.compare(a, b) > 0) {
    return b;
  } else {
    return a;
  }
};


},{}],186:[function(require,module,exports){
var Program, Snippet, assemble;

Snippet = require('./snippet');

assemble = require('./assemble');


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

Program = (function() {
  Program.index = 0;

  Program.entry = function() {
    return "_pg_" + (++Program.index) + "_";
  };

  function Program(language, namespace, graph) {
    this.language = language;
    this.namespace = namespace;
    this.graph = graph;
    this.calls = {};
    this.requires = {};
  }

  Program.prototype.call = function(node, module, priority) {
    var exists, ns;
    ns = module.namespace;
    if (exists = this.calls[ns]) {
      exists.priority = Math.max(exists.priority, priority);
    } else {
      this.calls[ns] = {
        node: node,
        module: module,
        priority: priority
      };
    }
    return this;
  };

  Program.prototype.require = function(node, module) {
    var ns;
    ns = module.namespace;
    return this.requires[ns] = {
      node: node,
      module: module
    };
  };

  Program.prototype.assemble = function() {
    var data, key, snippet, _ref;
    data = assemble(this.language, (_ref = this.namespace) != null ? _ref : Program.entry, this.calls, this.requires);
    snippet = new Snippet;
    for (key in data) {
      snippet[key] = data[key];
    }
    snippet.graph = this.graph;
    return snippet;
  };

  return Program;

})();

module.exports = Program;


},{"./assemble":181,"./snippet":187}],187:[function(require,module,exports){
var Snippet;

Snippet = (function() {
  Snippet.index = 0;

  Snippet.namespace = function() {
    return "_sn_" + (++Snippet.index) + "_";
  };

  Snippet.load = function(language, name, code) {
    var compiler, program, sigs, _ref;
    program = language.parse(name, code);
    _ref = language.compile(program), sigs = _ref[0], compiler = _ref[1];
    return new Snippet(language, sigs, compiler, name, code);
  };

  function Snippet(language, _signatures, _compiler, _name, _original) {
    var _ref;
    this.language = language;
    this._signatures = _signatures;
    this._compiler = _compiler;
    this._name = _name;
    this._original = _original;
    this.namespace = null;
    this.code = null;
    this.main = null;
    this.entry = null;
    this.uniforms = null;
    this.externals = null;
    this.symbols = null;
    this.attributes = null;
    this.varyings = null;
    if (!this.language) {
      delete this.language;
    }
    if (!this._signatures) {
      delete this._signatures;
    }
    if (!this._compiler) {
      delete this._compiler;
    }
    if (!this._original) {
      delete this._original;
    }
    if (!this._name) {
      this._name = (_ref = this._signatures) != null ? _ref.main.name : void 0;
    }
  }

  Snippet.prototype.clone = function() {
    return new Snippet(this.language, this._signatures, this._compiler, this._name, this._original);
  };

  Snippet.prototype.bind = function(config, uniforms, namespace, defines) {
    var a, def, e, exceptions, exist, global, key, local, name, redef, u, v, x, _a, _e, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _u, _v;
    if (uniforms === '' + uniforms) {
      _ref = [uniforms, namespace != null ? namespace : {}, defines != null ? defines : {}], namespace = _ref[0], uniforms = _ref[1], defines = _ref[2];
    } else if (namespace !== '' + namespace) {
      _ref1 = [namespace != null ? namespace : {}, void 0], defines = _ref1[0], namespace = _ref1[1];
    }
    this.main = this._signatures.main;
    this.namespace = (_ref2 = namespace != null ? namespace : this.namespace) != null ? _ref2 : Snippet.namespace();
    this.entry = this.namespace + this.main.name;
    this.uniforms = {};
    this.varyings = {};
    this.attributes = {};
    this.externals = {};
    this.symbols = [];
    exist = {};
    exceptions = {};
    global = function(name) {
      exceptions[name] = true;
      return name;
    };
    local = (function(_this) {
      return function(name) {
        return _this.namespace + name;
      };
    })(this);
    if (config.globals) {
      _ref3 = config.globals;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        key = _ref3[_i];
        global(key);
      }
    }
    _u = config.globalUniforms ? global : local;
    _v = config.globalVaryings ? global : local;
    _a = config.globalAttributes ? global : local;
    _e = local;
    x = (function(_this) {
      return function(def) {
        return exist[def.name] = true;
      };
    })(this);
    u = (function(_this) {
      return function(def, name) {
        return _this.uniforms[_u(name != null ? name : def.name)] = def;
      };
    })(this);
    v = (function(_this) {
      return function(def) {
        return _this.varyings[_v(def.name)] = def;
      };
    })(this);
    a = (function(_this) {
      return function(def) {
        return _this.attributes[_a(def.name)] = def;
      };
    })(this);
    e = (function(_this) {
      return function(def) {
        var name;
        name = _e(def.name);
        _this.externals[name] = def;
        return _this.symbols.push(name);
      };
    })(this);
    redef = function(def) {
      return {
        type: def.type,
        name: def.name,
        value: def.value
      };
    };
    _ref4 = this._signatures.uniform;
    for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
      def = _ref4[_j];
      x(def);
    }
    _ref5 = this._signatures.uniform;
    for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
      def = _ref5[_k];
      u(redef(def));
    }
    _ref6 = this._signatures.varying;
    for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
      def = _ref6[_l];
      v(redef(def));
    }
    _ref7 = this._signatures.external;
    for (_m = 0, _len4 = _ref7.length; _m < _len4; _m++) {
      def = _ref7[_m];
      e(def);
    }
    _ref8 = this._signatures.attribute;
    for (_n = 0, _len5 = _ref8.length; _n < _len5; _n++) {
      def = _ref8[_n];
      a(redef(def));
    }
    for (name in uniforms) {
      def = uniforms[name];
      if (exist[name]) {
        u(def, name);
      }
    }
    this.body = this.code = this._compiler(this.namespace, exceptions, defines);
    return null;
  };

  return Snippet;

})();

module.exports = Snippet;


},{}],188:[function(require,module,exports){
var Graph, markup, merge, resolve, serialize, visualize;

Graph = require('../Graph').Graph;

exports.serialize = serialize = require('./serialize');

exports.markup = markup = require('./markup');

visualize = function(graph) {
  var data;
  if (!graph) {
    return;
  }
  if (!graph.nodes) {
    return graph;
  }
  data = serialize(graph);
  return markup.process(data);
};

resolve = function(arg) {
  if (arg == null) {
    return arg;
  }
  if (arg instanceof Array) {
    return arg.map(resolve);
  }
  if ((arg.vertex != null) && (arg.fragment != null)) {
    return [resolve(arg.vertex, resolve(arg.fragment))];
  }
  if (arg._graph != null) {
    return arg._graph;
  }
  return arg;
};

merge = function(args) {
  var arg, out, _i, _len;
  out = [];
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    if (arg instanceof Array) {
      out = out.concat(merge(arg));
    } else if (arg != null) {
      out.push(arg);
    }
  }
  return out;
};

exports.visualize = function() {
  var graph, list;
  list = merge(resolve([].slice.call(arguments)));
  return markup.merge((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      graph = list[_i];
      if (graph) {
        _results.push(visualize(graph));
      }
    }
    return _results;
  })());
};

exports.inspect = function() {
  var contents, element;
  contents = exports.visualize.apply(null, arguments);
  element = markup.overlay(contents);
  document.body.appendChild(element);
  contents.update();
  return element;
};


},{"../Graph":154,"./markup":189,"./serialize":190}],189:[function(require,module,exports){
var connect, cssColor, escapeText, hash, hashColor, makeSVG, merge, overlay, path, process, sqr, trim, wrap, _activate, _markup, _order;

hash = require('../factory/hash');

trim = function(string) {
  return ("" + string).replace(/^\s+|\s+$/g, '');
};

cssColor = function(r, g, b, alpha) {
  return 'rgba(' + [r, g, b, alpha].join(', ') + ')';
};

hashColor = function(string, alpha) {
  var b, color, g, max, min, norm, r;
  if (alpha == null) {
    alpha = 1;
  }
  color = hash(string) ^ 0x123456;
  r = color & 0xFF;
  g = (color >>> 8) & 0xFF;
  b = (color >>> 16) & 0xFF;
  max = Math.max(r, g, b);
  norm = 140 / max;
  min = Math.round(max / 3);
  r = Math.min(255, Math.round(norm * Math.max(r, min)));
  g = Math.min(255, Math.round(norm * Math.max(g, min)));
  b = Math.min(255, Math.round(norm * Math.max(b, min)));
  return cssColor(r, g, b, alpha);
};

escapeText = function(string) {
  string = string != null ? string : "";
  return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
};

process = function(data) {
  var el, links;
  links = [];
  el = _markup(data, links);
  el.update = function() {
    return connect(el, links);
  };
  _activate(el);
  return el;
};

_activate = function(el) {
  var code, codes, _i, _len, _results;
  codes = el.querySelectorAll('.shadergraph-code');
  _results = [];
  for (_i = 0, _len = codes.length; _i < _len; _i++) {
    code = codes[_i];
    _results.push((function() {
      var popup;
      popup = code;
      popup.parentNode.classList.add('shadergraph-has-code');
      return popup.parentNode.addEventListener('click', function(event) {
        return popup.style.display = {
          block: 'none',
          none: 'block'
        }[popup.style.display || 'none'];
      });
    })());
  }
  return _results;
};

_order = function(data) {
  var link, linkMap, node, nodeMap, recurse, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2;
  nodeMap = {};
  linkMap = {};
  _ref = data.nodes;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    node = _ref[_i];
    nodeMap[node.id] = node;
  }
  _ref1 = data.links;
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    link = _ref1[_j];
    if (linkMap[_name = link.from] == null) {
      linkMap[_name] = [];
    }
    linkMap[link.from].push(link);
  }
  recurse = function(node, depth) {
    var next, _k, _len2, _ref2;
    if (depth == null) {
      depth = 0;
    }
    node.depth = Math.max((_ref2 = node.depth) != null ? _ref2 : 0, depth);
    if (next = linkMap[node.id]) {
      for (_k = 0, _len2 = next.length; _k < _len2; _k++) {
        link = next[_k];
        recurse(nodeMap[link.to], depth + 1);
      }
    }
    return null;
  };
  _ref2 = data.nodes;
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    node = _ref2[_k];
    if (node.depth == null) {
      recurse(node);
    }
  }
  return null;
};

_markup = function(data, links) {
  var addOutlet, block, clear, color, column, columns, div, link, node, outlet, outlets, wrapper, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3;
  _order(data);
  wrapper = document.createElement('div');
  wrapper.classList.add('shadergraph-graph');
  columns = [];
  outlets = {};
  _ref = data.nodes;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    node = _ref[_i];
    block = document.createElement('div');
    block.classList.add("shadergraph-node");
    block.classList.add("shadergraph-node-" + node.type);
    block.innerHTML = "<div class=\"shadergraph-header\">" + (escapeText(node.name)) + "</div>";
    addOutlet = function(outlet, inout) {
      var color, div;
      color = hashColor(outlet.type);
      div = document.createElement('div');
      div.classList.add('shadergraph-outlet');
      div.classList.add("shadergraph-outlet-" + inout);
      div.innerHTML = "<div class=\"shadergraph-point\" style=\"background: " + color + "\"></div>\n<div class=\"shadergraph-type\" style=\"color: " + color + "\">" + (escapeText(outlet.type)) + "</div>\n<div class=\"shadergraph-name\">" + (escapeText(outlet.name)) + "</div>";
      block.appendChild(div);
      return outlets[outlet.id] = div.querySelector('.shadergraph-point');
    };
    _ref1 = node.inputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      addOutlet(outlet, 'in');
    }
    _ref2 = node.outputs;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      outlet = _ref2[_k];
      addOutlet(outlet, 'out');
    }
    if (node.graph != null) {
      block.appendChild(_markup(node.graph, links));
    } else {
      clear = document.createElement('div');
      clear.classList.add('shadergraph-clear');
      block.appendChild(clear);
    }
    if (node.code != null) {
      div = document.createElement('div');
      div.classList.add('shadergraph-code');
      div.innerHTML = escapeText(trim(node.code));
      block.appendChild(div);
    }
    column = columns[node.depth];
    if (column == null) {
      column = document.createElement('div');
      column.classList.add('shadergraph-column');
      columns[node.depth] = column;
    }
    column.appendChild(block);
  }
  for (_l = 0, _len3 = columns.length; _l < _len3; _l++) {
    column = columns[_l];
    if (column != null) {
      wrapper.appendChild(column);
    }
  }
  _ref3 = data.links;
  for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
    link = _ref3[_m];
    color = hashColor(link.type);
    links.push({
      color: color,
      out: outlets[link.out],
      "in": outlets[link["in"]]
    });
  }
  return wrapper;
};

sqr = function(x) {
  return x * x;
};

path = function(x1, y1, x2, y2) {
  var d, dx, dy, f, h, mx, my, vert;
  dx = x2 - x1;
  dy = y2 - y1;
  d = Math.sqrt(sqr(dx) + sqr(dy));
  vert = Math.abs(dy) > Math.abs(dx);
  if (vert) {
    mx = (x1 + x2) / 2;
    my = (y1 + y2) / 2;
    f = dy > 0 ? .3 : -.3;
    h = Math.min(Math.abs(dx) / 2, 20 + d / 8);
    return ['M', x1, y1, 'C', x1 + h, y1 + ',', mx, my - d * f, mx, my, 'C', mx, my + d * f, x2 - h, y2 + ',', x2, y2].join(' ');
  } else {
    h = Math.min(Math.abs(dx) / 2.5, 20 + d / 4);
    return ['M', x1, y1, 'C', x1 + h, y1 + ',', x2 - h, y2 + ',', x2, y2].join(' ');
  }
};

makeSVG = function(tag) {
  if (tag == null) {
    tag = 'svg';
  }
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
};

connect = function(element, links) {
  var a, b, box, c, line, link, ref, svg, _i, _j, _len, _len1;
  if (element.parentNode == null) {
    return;
  }
  ref = element.getBoundingClientRect();
  for (_i = 0, _len = links.length; _i < _len; _i++) {
    link = links[_i];
    a = link.out.getBoundingClientRect();
    b = link["in"].getBoundingClientRect();
    link.coords = {
      x1: (a.left + a.right) / 2 - ref.left,
      y1: (a.top + a.bottom) / 2 - ref.top,
      x2: (b.left + b.right) / 2 - ref.left,
      y2: (b.top + b.bottom) / 2 - ref.top
    };
  }
  svg = element.querySelector('svg');
  if (svg != null) {
    element.removeChild(svg);
  }
  box = element;
  while (box.parentNode && box.offsetHeight === 0) {
    box = box.parentNode;
  }
  svg = makeSVG();
  svg.setAttribute('width', box.offsetWidth);
  svg.setAttribute('height', box.offsetHeight);
  for (_j = 0, _len1 = links.length; _j < _len1; _j++) {
    link = links[_j];
    c = link.coords;
    line = makeSVG('path');
    line.setAttribute('d', path(c.x1, c.y1, c.x2, c.y2));
    line.setAttribute('stroke', link.color);
    line.setAttribute('stroke-width', 3);
    line.setAttribute('fill', 'transparent');
    svg.appendChild(line);
  }
  return element.appendChild(svg);
};

overlay = function(contents) {
  var close, div, inside, view;
  div = document.createElement('div');
  div.setAttribute('class', 'shadergraph-overlay');
  close = document.createElement('div');
  close.setAttribute('class', 'shadergraph-close');
  close.innerHTML = '&times;';
  view = document.createElement('div');
  view.setAttribute('class', 'shadergraph-view');
  inside = document.createElement('div');
  inside.setAttribute('class', 'shadergraph-inside');
  inside.appendChild(contents);
  view.appendChild(inside);
  div.appendChild(view);
  div.appendChild(close);
  close.addEventListener('click', function() {
    return div.parentNode.removeChild(div);
  });
  return div;
};

wrap = function(markup) {
  var div;
  if (markup instanceof Node) {
    return markup;
  }
  div = document.createElement('div');
  div.innerText = markup != null ? markup : '';
  return div;
};

merge = function(markup) {
  var div, el, _i, _len;
  if (markup.length !== 1) {
    div = document.createElement('div');
    for (_i = 0, _len = markup.length; _i < _len; _i++) {
      el = markup[_i];
      div.appendChild(wrap(el));
    }
    div.update = function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = markup.length; _j < _len1; _j++) {
        el = markup[_j];
        _results.push(typeof el.update === "function" ? el.update() : void 0);
      }
      return _results;
    };
    return div;
  } else {
    return wrap(markup[0]);
  }
};

module.exports = {
  process: process,
  merge: merge,
  overlay: overlay
};


},{"../factory/hash":165}],190:[function(require,module,exports){
var Block, isCallback, serialize;

Block = require('../block');

isCallback = function(outlet) {
  return outlet.type[0] === '(';
};

serialize = function(graph) {
  var block, format, inputs, links, node, nodes, other, outlet, outputs, record, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
  nodes = [];
  links = [];
  _ref = graph.nodes;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    node = _ref[_i];
    record = {
      id: node.id,
      name: null,
      type: null,
      depth: null,
      graph: null,
      inputs: [],
      outputs: []
    };
    nodes.push(record);
    inputs = record.inputs;
    outputs = record.outputs;
    block = node.owner;
    if (block instanceof Block.Call) {
      record.name = block.snippet._name;
      record.type = 'call';
      record.code = block.snippet._original;
    } else if (block instanceof Block.Callback) {
      record.name = "Callback";
      record.type = 'callback';
      record.graph = serialize(block.graph);
    } else if (block instanceof Block.Isolate) {
      record.name = 'Isolate';
      record.type = 'isolate';
      record.graph = serialize(block.graph);
    } else if (block instanceof Block.Join) {
      record.name = 'Join';
      record.type = 'join';
    }
    format = function(type) {
      type = type.replace(")(", ")→(");
      return type = type.replace("()", "");
    };
    _ref1 = node.inputs;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      outlet = _ref1[_j];
      inputs.push({
        id: outlet.id,
        name: outlet.name,
        type: format(outlet.type),
        open: outlet.input == null
      });
    }
    _ref2 = node.outputs;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      outlet = _ref2[_k];
      outputs.push({
        id: outlet.id,
        name: outlet.name,
        type: format(outlet.type),
        open: !outlet.output.length
      });
      _ref3 = outlet.output;
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        other = _ref3[_l];
        links.push({
          from: node.id,
          out: outlet.id,
          to: other.node.id,
          "in": other.id,
          type: format(outlet.type)
        });
      }
    }
  }
  return {
    nodes: nodes,
    links: links
  };
};

module.exports = serialize;


},{"../block":160}],191:[function(require,module,exports){
module.exports = require('./lib/index')

},{"./lib/index":193}],192:[function(require,module,exports){
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

},{}],193:[function(require,module,exports){
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

},{"../../through":199,"./expr":192,"./scope":194}],194:[function(require,module,exports){
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

},{}],195:[function(require,module,exports){
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

},{"../through":199,"./lib/builtins":196,"./lib/literals":197,"./lib/operators":198}],196:[function(require,module,exports){
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

},{}],197:[function(require,module,exports){
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

},{}],198:[function(require,module,exports){
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

},{}],199:[function(require,module,exports){
var through;

through = function(write, end) {
  var errors, output;
  output = [];
  errors = [];
  return {
    output: output,
    parser: null,
    write: write,
    end: end,
    process: function(parser, data) {
      this.parser = parser;
      write(data);
      this.flush();
      return this.parser.flush();
    },
    flush: function() {
      end();
      return [output, errors];
    },
    queue: function(obj) {
      var _ref;
      if (obj != null) {
        return (_ref = this.parser) != null ? _ref.write(obj) : void 0;
      }
    },
    emit: function(type, node) {
      if (type === 'data') {
        if (node.parent == null) {
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


},{}]},{},[29])