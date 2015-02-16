(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.MathBox.Shaders = {"arrow.position": "uniform float arrowSize;\nuniform float arrowSpace;\n\nattribute vec4 position4;\nattribute vec3 arrow;\nattribute vec2 attach;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvoid getArrowGeometry(vec4 xyzw, float near, float far, out vec3 left, out vec3 right, out vec3 start) {\n  right = getPosition(xyzw);\n  left  = getPosition(vec4(near, xyzw.yzw));\n  start = getPosition(vec4(far, xyzw.yzw));\n}\n\nmat4 getArrowMatrix(float size, vec3 left, vec3 right, vec3 start) {\n  \n  vec3 diff = left - right;\n  float l = length(diff);\n  if (l == 0.0) {\n    return mat4(1.0, 0.0, 0.0, 0.0,\n                0.0, 1.0, 0.0, 0.0,\n                0.0, 0.0, 1.0, 0.0,\n                0.0, 0.0, 0.0, 1.0);\n  }\n\n  // Construct TBN matrix around shaft\n  vec3 t = normalize(diff);\n  vec3 n = normalize(cross(t, t.yzx + vec3(.1, .2, .3)));\n  vec3 b = cross(n, t);\n  \n  // Shrink arrows when vector gets too small\n  // Approach linear scaling with cubic ease the smaller we get\n  diff = right - start;\n  l = length(diff) * arrowSpace;\n  float mini = clamp((3.0 - l / size) * .333, 0.0, 1.0);\n  float scale = 1.0 - mini * mini * mini;\n  \n  // Size to 2.5:1 ratio\n  size *= scale;\n  float sizeNB = size / 2.5;\n\n  // Anchor at end position\n  return mat4(vec4(n * sizeNB,  0),\n              vec4(b * sizeNB,  0),\n              vec4(t * size, 0),\n              vec4(right,  1.0));\n}\n\nvec3 getArrowPosition() {\n  vec3 left, right, start;\n  \n  getArrowGeometry(position4, attach.x, attach.y, left, right, start);\n  mat4 matrix = getArrowMatrix(arrowSize, left, right, start);\n  return (matrix * vec4(arrow.xyz, 1.0)).xyz;\n\n}\n",
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
"grid.position": "uniform vec4 gridPosition;\nuniform vec4 gridStep;\nuniform vec4 gridAxis;\n\nvec4 sampleData(vec2 xy);\n\nvec4 getGridPosition(vec4 xyzw) {\n  vec4 onAxis  = gridAxis * sampleData(vec2(xyzw.y, 0.0)).x;\n  vec4 offAxis = gridStep * xyzw.x + gridPosition;\n  return onAxis + offAxis;\n}\n",
"join.position": "uniform float joinStride;\nuniform float joinStrideInv;\n\nfloat getIndex(vec4 xyzw);\nvec4 getRest(vec4 xyzw);\nvec4 injectIndices(float a, float b);\n\nvec4 getJoinXYZW(vec4 xyzw) {\n\n  float a = getIndex(xyzw);\n  float b = a * joinStrideInv;\n\n  float integer  = floor(b);\n  float fraction = b - integer;\n  \n  return injectIndices(fraction * joinStride, integer) + getRest(xyzw);\n}\n",
"lerp.depth": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpDepth(vec4 xyzw) {\n  float x = xyzw.z * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.xy, i, xyzw.w);\n  vec4 xyzw2 = vec4(xyzw.xy, i + 1.0, xyzw.w);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.height": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpHeight(vec4 xyzw) {\n  float x = xyzw.y * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.x, i, xyzw.zw);\n  vec4 xyzw2 = vec4(xyzw.x, i + 1.0, xyzw.zw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.items": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpItems(vec4 xyzw) {\n  float x = xyzw.w * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(xyzw.xyz, i);\n  vec4 xyzw2 = vec4(xyzw.xyz, i + 1.0);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"lerp.width": "uniform float sampleRatio;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 lerpWidth(vec4 xyzw) {\n  float x = xyzw.x * sampleRatio;\n  float i = floor(x);\n  float f = x - i;\n    \n  vec4 xyzw1 = vec4(i, xyzw.yzw);\n  vec4 xyzw2 = vec4(i + 1.0, xyzw.yzw);\n  \n  vec4 a = sampleData(xyzw1);\n  vec4 b = sampleData(xyzw2);\n\n  return mix(a, b, f);\n}\n",
"line.position": "uniform float lineWidth;\nuniform float lineDepth;\nuniform vec4 geometryClip;\n\nattribute vec2 line;\nattribute vec4 position4;\n\n#ifdef LINE_STROKE\nvarying float vClipStrokeWidth;\nvarying float vClipStrokeIndex;\nvarying vec3  vClipStrokeEven;\nvarying vec3  vClipStrokeOdd;\nvarying vec3  vClipStrokePosition;\n#endif\n\n// External\nvec3 getPosition(vec4 xyzw);\n\n#ifdef LINE_CLIP\nuniform float clipRange;\nuniform vec2  clipStyle;\nuniform float clipSpace;\n\nattribute vec2 strip;\n\nvarying vec2 vClipEnds;\n\nvoid clipEnds(vec4 xyzw, vec3 pos) {\n\n  // Sample end of line strip\n  vec4 xyzwE = vec4(strip.y, xyzw.yzw);\n  vec3 end   = getPosition(xyzwE);\n\n  // Sample start of line strip\n  vec4 xyzwS = vec4(strip.x, xyzw.yzw);\n  vec3 start = getPosition(xyzwS);\n\n  // Measure length and adjust clip range\n  // Approach linear scaling with cubic ease the smaller we get\n  vec3 diff = end - start;\n  float l = length(vec2(length(diff), lineWidth)) * clipSpace;\n  float mini = clamp((3.0 - l / clipRange) * .333, 0.0, 1.0);\n  float scale = 1.0 - mini * mini * mini; \n  float range = clipRange * scale;\n  \n  vClipEnds = vec2(1.0);\n  \n  if (clipStyle.y > 0.0) {\n    // Clip end\n    float d = length(pos - end);\n    vClipEnds.x = d / range - 1.0;\n  }\n\n  if (clipStyle.x > 0.0) {\n    // Clip start \n    float d = length(pos - start);\n    vClipEnds.y = d / range - 1.0;\n  }\n}\n#endif\n\nconst float epsilon = 1e-5;\nvoid fixCenter(vec3 left, inout vec3 center, vec3 right) {\n  if (center.z >= 0.0) {\n    if (left.z < 0.0) {\n      float d = (center.z - epsilon) / (center.z - left.z);\n      center = mix(center, left, d);\n    }\n    else if (right.z < 0.0) {\n      float d = (center.z - epsilon) / (center.z - right.z);\n      center = mix(center, right, d);\n    }\n  }\n}\n\n\nvoid getLineGeometry(vec4 xyzw, float edge, out vec3 left, out vec3 center, out vec3 right) {\n  vec4 delta = vec4(1.0, 0.0, 0.0, 0.0);\n\n  center =                 getPosition(xyzw);\n  left   = (edge > -0.5) ? getPosition(xyzw - delta) : center;\n  right  = (edge < 0.5)  ? getPosition(xyzw + delta) : center;\n}\n\nvec3 getLineJoin(float edge, bool odd, vec3 left, vec3 center, vec3 right) {\n  vec2 join = vec2(1.0, 0.0);\n\n  fixCenter(left, center, right);\n\n  vec4 a = vec4(left.xy, right.xy);\n  vec4 b = a / vec4(left.zz, right.zz);\n\n  vec2 l = b.xy;\n  vec2 r = b.zw;\n  vec2 c = center.xy / center.z;\n\n  vec4 d = vec4(l, c) - vec4(c, r);\n  float l1 = dot(d.xy, d.xy);\n  float l2 = dot(d.zw, d.zw);\n\n  if (l1 + l2 > 0.0) {\n    \n    if (edge > 0.5 || l2 == 0.0) {\n      vec2 nl = normalize(l - c);\n      vec2 tl = vec2(nl.y, -nl.x);\n\n#ifdef LINE_STROKE\n      vClipStrokeEven = vClipStrokeOdd = normalize(left - center);\n#endif\n      join = tl;\n    }\n    else if (edge < -0.5 || l1 == 0.0) {\n      vec2 nr = normalize(c - r);\n      vec2 tr = vec2(nr.y, -nr.x);\n\n#ifdef LINE_STROKE\n      vClipStrokeEven = vClipStrokeOdd = normalize(center - right);\n#endif\n      join = tr;\n    }\n    else {\n      vec2 nl = normalize(d.xy);\n      vec2 nr = normalize(d.zw);\n\n      vec2 tl = vec2(nl.y, -nl.x);\n      vec2 tr = vec2(nr.y, -nr.x);\n\n      vec2 tc = normalize(tl + tr);\n    \n      float cosA = dot(nl, tc);\n      float sinA = max(0.1, abs(dot(tl, tc)));\n      float factor = cosA / sinA;\n      float scale = sqrt(1.0 + factor * factor);\n\n#ifdef LINE_STROKE\n      vec3 stroke1 = normalize(left - center);\n      vec3 stroke2 = normalize(center - right);\n\n      if (odd) {\n        vClipStrokeEven = stroke1;\n        vClipStrokeOdd  = stroke2;\n      }\n      else {\n        vClipStrokeEven = stroke2;\n        vClipStrokeOdd  = stroke1;\n      }\n#endif\n      join = tc * scale;\n    }\n    return vec3(join, 0.0);\n  }\n  else {\n    return vec3(0.0);\n  }\n\n}\n\nvec3 getLinePosition() {\n  vec3 left, center, right, join;\n\n  float edge = line.x;\n  float offset = line.y;\n\n  vec4 p = min(geometryClip, position4);\n\n  getLineGeometry(p, edge, left, center, right);\n\n#ifdef LINE_STROKE\n  vClipStrokePosition = center;\n  vClipStrokeIndex = p.x;\n  bool odd = mod(p.x, 2.0) >= 1.0;\n#else\n  bool odd = true;\n#endif\n\n  join = getLineJoin(edge, odd, left, center, right);\n  \n  float width = lineWidth * 0.5;\n  if (lineDepth < 1.0) {\n    width *= mix(max(0.00001, -center.z), 1.0, lineDepth);\n  }\n\n#ifdef LINE_STROKE\n  vClipStrokeWidth = width;\n#endif\n  \n  vec3 pos = center + join * offset * width;\n\n#ifdef LINE_CLIP\n  clipEnds(position4, pos);\n#endif\n\n  return pos;\n}\n",
"map.2d.data": "uniform vec2 dataResolution;\nuniform vec2 dataPointer;\n\nvec2 map2DData(vec2 xy) {\n  return fract((xy + dataPointer) * dataResolution);\n}\n",
"map.xyzw.2dv": "void mapXyzw2DV(vec4 xyzw, out vec2 xy, out float z) {\n  xy = xyzw.xy;\n  z  = xyzw.z;\n}\n\n",
"map.xyzw.texture": "uniform float textureItems;\nuniform float textureHeight;\n\nvec2 mapXyzwTexture(vec4 xyzw) {\n  \n  float x = xyzw.x;\n  float y = xyzw.y;\n  float z = xyzw.z;\n  float i = xyzw.w;\n  \n  return vec2(i, y) + vec2(x, z) * vec2(textureItems, textureHeight);\n}\n\n",
"mesh.fragment.color": "varying vec4 vColor;\n\nvec4 getColor(vec4 rgba) {\n  return rgba * vColor;\n}\n",
"mesh.position": "attribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvec3 getMeshPosition() {\n  return getPosition(position4);\n}\n",
"mesh.vertex.color": "attribute vec4 position4;\nvarying vec4 vColor;\n\n// External\nvec4 getSample(vec4 xyzw);\n\nvoid vertexColor() {\n  vColor = getSample(position4);\n}\n",
"polar.position": "uniform float polarBend;\nuniform float polarFocus;\nuniform float polarAspect;\nuniform float polarHelix;\n\nuniform mat4 viewMatrix;\n\nvec4 getPolarPosition(vec4 position) {\n  if (polarBend > 0.0001) {\n\n    vec2 xy = position.xy * vec2(polarBend, polarAspect);\n    float radius = polarFocus + xy.y;\n\n    return viewMatrix * vec4(\n      sin(xy.x) * radius,\n      (cos(xy.x) * radius - polarFocus) / polarAspect,\n      position.z + position.x * polarHelix * polarBend,\n      1.0\n    );\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"project.position": "uniform float styleZIndex;\n\nvoid setPosition(vec3 position) {\n  vec4 pos = projectionMatrix * vec4(position, 1.0);\n  pos.z *= (1.0 - styleZIndex / 32768.0);\n  gl_Position = pos;\n}\n",
"project.readback": "// This is three.js' global uniform, missing from fragment shaders.\nuniform mat4 projectionMatrix;\n\nvec4 readbackPosition(vec3 position) {\n  vec4 pos = projectionMatrix * vec4(position, 1.0);\n  if (pos.w < 0.0) {\n    return vec4(0.0, 0.0, -1.0, 0.0);\n  }\n  else {\n    return pos / pos.w;\n  }\n}\n",
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
"sprite.alpha.circle": "varying float vPixelSize;\n\nfloat getDiscAlpha(float mask) {\n  // Approximation: 1 - x*x is approximately linear around x = 1 with slope 2\n  return vPixelSize * (1.0 - mask);\n  //  return vPixelSize * 2.0 * (1.0 - sqrt(mask));\n}\n",
"sprite.alpha.circle.hollow": "varying float vPixelSize;\n\nfloat getDiscHollowAlpha(float mask) {\n  return vPixelSize * (0.5 - 2.0 * abs(sqrt(mask) - .75));\n}\n",
"sprite.alpha.generic": "varying float vPixelSize;\n\nfloat getGenericAlpha(float mask) {\n  return vPixelSize * 2.0 * (1.0 - mask);\n}\n",
"sprite.alpha.generic.hollow": "varying float vPixelSize;\n\nfloat getGenericHollowAlpha(float mask) {\n  return vPixelSize * (0.5 - 2.0 * abs(mask - .75));\n}\n",
"sprite.edge": "varying vec2 vSprite;\n\nfloat getSpriteMask(vec2 xy);\nfloat getSpriteAlpha(float mask);\n\nvoid setFragmentColorFill(vec4 color) {\n  float mask = getSpriteMask(vSprite);\n  if (mask > 1.0) {\n    discard;\n  }\n  float alpha = getSpriteAlpha(mask);\n  if (alpha >= 1.0) {\n    discard;\n  }\n  gl_FragColor = vec4(color.rgb, alpha * color.a);\n}\n",
"sprite.fill": "varying vec2 vSprite;\n\nfloat getSpriteMask(vec2 xy);\nfloat getSpriteAlpha(float mask);\n\nvoid setFragmentColorFill(vec4 color) {\n  float mask = getSpriteMask(vSprite);\n  if (mask > 1.0) {\n    discard;\n  }\n  float alpha = getSpriteAlpha(mask);\n  if (alpha < 1.0) {\n    discard;\n  }\n  gl_FragColor = color;\n}\n\n",
"sprite.mask.circle": "varying float vPixelSize;\n\nfloat getCircleMask(vec2 uv) {\n  return dot(uv, uv);\n}\n",
"sprite.mask.diamond": "varying float vPixelSize;\n\nfloat getDiamondMask(vec2 uv) {\n  vec2 a = abs(uv);\n  return a.x + a.y;\n}\n",
"sprite.mask.square": "varying float vPixelSize;\n\nfloat getSquareMask(vec2 uv) {\n  vec2 a = abs(uv);\n  return max(a.x, a.y);\n}\n",
"sprite.mask.triangle": "varying float vPixelSize;\n\nfloat getTriangleMask(vec2 uv) {\n  uv.y -= .25;\n  return max(-uv.y, abs(uv.x) * .866 + uv.y * .5 + .6);\n}\n",
"sprite.position": "uniform float pointSize;\nuniform float renderScale;\n\nattribute vec4 position4;\nattribute vec2 sprite;\n\nvarying vec2 vSprite;\nvarying float vPixelSize;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvec3 getPointPosition() {\n  vec3 center = getPosition(position4);\n\n  float pixelSize = renderScale * pointSize / -center.z;\n  float paddedSize = pixelSize + 0.5;\n  float padFactor = paddedSize / pixelSize;\n\n  vPixelSize = paddedSize;\n  vSprite    = sprite;\n\n  return center + vec3(sprite * pointSize * padFactor, 0.0);\n}\n",
"stereographic.position": "uniform float stereoBend;\n\nuniform mat4 viewMatrix;\n\nvec4 getStereoPosition(vec4 position) {\n  if (stereoBend > 0.0001) {\n\n    vec3 pos = position.xyz;\n    float r = length(pos);\n    float z = r + pos.z;\n    vec3 project = vec3(pos.xy / z, r);\n    \n    vec3 lerped = mix(pos, project, stereoBend);\n\n    return viewMatrix * vec4(lerped, 1.0);\n  }\n  else {\n    return viewMatrix * vec4(position.xyz, 1.0);\n  }\n}",
"stereographic4.position": "uniform float stereoBend;\nuniform vec4 basisScale;\nuniform vec4 basisOffset;\nuniform mat4 viewMatrix;\nuniform vec2 view4D;\n\nvec4 getStereographic4Position(vec4 position) {\n  \n  vec4 transformed;\n  if (stereoBend > 0.0001) {\n\n    float r = length(position);\n    float w = r + position.w;\n    vec4 project = vec4(position.xyz / w, r);\n    \n    transformed = mix(position, project, stereoBend);\n  }\n  else {\n    transformed = position;\n  }\n\n  vec4 pos4 = transformed * basisScale - basisOffset;\n  vec3 xyz = (viewMatrix * vec4(pos4.xyz, 1.0)).xyz;\n  return vec4(xyz, pos4.w * view4D.y + view4D.x);\n}\n",
"stpq.sample.2d": "varying vec2 vST;\n\nvec4 getSample(vec2 st);\n\nvec4 getSTSample() {\n  return getSample(vST);\n}\n",
"stpq.xyzw.2d": "varying vec2 vST;\n\nvoid setRawST(vec4 xyzw) {\n  vST = xyzw.xy;\n}\n",
"strip.position.normal": "attribute vec4 position4;\nattribute vec3 strip;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvoid getStripGeometry(vec4 xyzw, vec3 strip, out vec3 pos, out vec3 normal) {\n  vec3 a, b, c;\n\n  a   = getPosition(xyzw);\n  b   = getPosition(vec4(xyzw.xyz, strip.x));\n  c   = getPosition(vec4(xyzw.xyz, strip.y));\n\n  pos = getPosition(xyzw);\n  normal = normalize(cross(c - a, b - a)) * strip.z;\n}\n\nvec3 getStripPositionNormal() {\n  vec3 center, normal;\n\n  getStripGeometry(position4, strip, center, normal);\n  vNormal   = normal;\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);\n  vPosition = -center;\n\n  return center;\n}\n",
"style.color": "uniform vec3 styleColor;\nuniform float styleOpacity;\n\nvec4 getStyleColor() {\n  return vec4(styleColor, styleOpacity);\n}\n",
"style.color.shaded": "uniform vec3 styleColor;\nuniform float styleOpacity;\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvec4 getStyleColor() {\n  \n  vec3 color = styleColor * styleColor;\n  vec3 color2 = styleColor;\n\n  vec3 normal = normalize(vNormal);\n  vec3 light = normalize(vLight);\n  vec3 position = normalize(vPosition);\n  \n  float side    = gl_FrontFacing ? -1.0 : 1.0;\n  float cosine  = side * dot(normal, light);\n  float diffuse = mix(max(0.0, cosine), .5 + .5 * cosine, .1);\n  \n  vec3  halfLight = normalize(light + position);\n\tfloat cosineHalf = max(0.0, side * dot(normal, halfLight));\n\tfloat specular = pow(cosineHalf, 16.0);\n\t\n\treturn vec4(sqrt(color * (diffuse * .9 + .05) + .25 * color2 * specular), styleOpacity);\n}\n",
"surface.position": "attribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvec3 getSurfacePosition() {\n  return getPosition(position4);\n}\n",
"surface.position.normal": "attribute vec4 position4;\nattribute vec2 surface;\n\n// External\nvec3 getPosition(vec4 xyzw);\n\nvoid getSurfaceGeometry(vec4 xyzw, float edgeX, float edgeY, out vec3 left, out vec3 center, out vec3 right, out vec3 up, out vec3 down) {\n  vec4 deltaX = vec4(1.0, 0.0, 0.0, 0.0);\n  vec4 deltaY = vec4(0.0, 1.0, 0.0, 0.0);\n\n  /*\n  // high quality, 5 tap\n  center =                  getPosition(xyzw);\n  left   = (edgeX > -0.5) ? getPosition(xyzw - deltaX) : center;\n  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX) : center;\n  down   = (edgeY > -0.5) ? getPosition(xyzw - deltaY) : center;\n  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY) : center;\n  */\n  \n  // low quality, 3 tap\n  center =                  getPosition(xyzw);\n  left   =                  center;\n  down   =                  center;\n  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX) : (2.0 * center - getPosition(xyzw - deltaX));\n  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY) : (2.0 * center - getPosition(xyzw - deltaY));\n}\n\nvec3 getSurfaceNormal(vec3 left, vec3 center, vec3 right, vec3 up, vec3 down) {\n  vec3 dx = right - left;\n  vec3 dy = up    - down;\n  vec3 n = cross(dy, dx);\n  if (length(n) > 0.0) {\n    return normalize(n);\n  }\n  return vec3(0.0, 1.0, 0.0);\n}\n\nvarying vec3 vNormal;\nvarying vec3 vLight;\nvarying vec3 vPosition;\n\nvec3 getSurfacePositionNormal() {\n  vec3 left, center, right, up, down;\n\n  getSurfaceGeometry(position4, surface.x, surface.y, left, center, right, up, down);\n  vNormal   = getSurfaceNormal(left, center, right, up, down);\n  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);// - center);\n  vPosition = -center;\n  \n  return center;\n}\n",
"ticks.position": "uniform float tickSize;\nuniform vec4  tickAxis;\nuniform vec4  tickNormal;\n\nvec4 sampleData(vec2 xy);\n\nvec3 transformPosition(vec4 value);\n\nvec3 getTickPosition(vec4 xyzw) {\n\n  const float epsilon = 0.0001;\n  float line = xyzw.x - .5;\n\n  vec4 center = tickAxis * sampleData(vec2(xyzw.y, 0.0));\n  vec4 edge   = tickNormal * epsilon;\n\n  vec4 a = center;\n  vec4 b = center + edge;\n\n  vec3 c = transformPosition(a);\n  vec3 d = transformPosition(b);\n  \n  vec3 mid  = c;\n  vec3 side = normalize(d - c);\n\n  return mid + side * line * tickSize;\n}\n",
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

exports.makeEmitter = function(thunk, items, channels, indices) {
  var inner, middle, outer;
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
  middle = (function() {
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
  outer = (function() {
    switch (indices) {
      case 1:
        return function(i, emit) {
          return middle(emit);
        };
      case 2:
        return function(i, j, emit) {
          return middle(emit);
        };
      case 3:
        return function(i, j, k, emit) {
          return middle(emit);
        };
      case 4:
        return function(i, j, k, l, emit) {
          return middle(emit);
        };
      case 6:
        return function(i, j, k, l, m, n, emit) {
          return middle(emit);
        };
      case 8:
        return function(i, j, k, l, m, n, o, p, emit) {
          return middle(emit);
        };
    }
  })();
  outer.reset = thunk.reset;
  outer.rebind = thunk.rebind;
  return outer;
};

exports.normalizeEmitter = function(emitter, indices) {
  var arity, f;
  arity = emitter.length - 1;
  f = (function() {
    switch (indices) {
      case 1:
        switch (arity) {
          case 0:
            return function(i, emit) {
              return emitter(emit);
            };
          case 1:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 2:
        switch (arity) {
          case 0:
            return function(i, j, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, emit) {
              return emitter(i, emit);
            };
          case 2:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 3:
        switch (arity) {
          case 0:
            return function(i, j, k, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 4:
        switch (arity) {
          case 0:
            return function(i, j, k, l, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, l, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, l, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return function(i, j, k, l, emit) {
              return emitter(i, j, k, emit);
            };
          case 4:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 6:
        switch (arity) {
          case 0:
            return function(i, j, k, l, m, n, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, k, emit);
            };
          case 4:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, k, l, emit);
            };
          case 5:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, k, l, m, emit);
            };
          case 6:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 8:
        switch (arity) {
          case 0:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, emit);
            };
          case 4:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, emit);
            };
          case 5:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, m, emit);
            };
          case 6:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, m, n, emit);
            };
          case 7:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, m, n, o, emit);
            };
          case 8:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      default:
        throw "Invalid expression signature: " + emitter;
    }
  })();
  f.reset = emitter.reset;
  f.rebind = emitter.rebind;
  return f;
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
        var x, _ref1, _ref2;
        x = first[i++];
        if (i === a) {
          _ref1 = [0, j + 1], i = _ref1[0], j = _ref1[1];
          first = (_ref2 = data[j]) != null ? _ref2 : [];
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
        var x, _ref3, _ref4, _ref5, _ref6;
        x = first[i++];
        if (i === a) {
          _ref3 = [0, j + 1], i = _ref3[0], j = _ref3[1];
          if (j === b) {
            _ref4 = [0, k + 1], j = _ref4[0], k = _ref4[1];
            second = (_ref5 = data[k]) != null ? _ref5 : [];
          }
          first = (_ref6 = second[j]) != null ? _ref6 : [];
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
        var x, _ref10, _ref11, _ref6, _ref7, _ref8, _ref9;
        x = first[i++];
        if (i === a) {
          _ref6 = [0, j + 1], i = _ref6[0], j = _ref6[1];
          if (j === b) {
            _ref7 = [0, k + 1], j = _ref7[0], k = _ref7[1];
            if (k === c) {
              _ref8 = [0, l + 1], k = _ref8[0], l = _ref8[1];
              third = (_ref9 = data[l]) != null ? _ref9 : [];
            }
            second = (_ref10 = third[k]) != null ? _ref10 : [];
          }
          first = (_ref11 = second[j]) != null ? _ref11 : [];
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
        var x, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17;
        x = first[i++];
        if (i === a) {
          _ref10 = [0, j + 1], i = _ref10[0], j = _ref10[1];
          if (j === b) {
            _ref11 = [0, k + 1], j = _ref11[0], k = _ref11[1];
            if (k === c) {
              _ref12 = [0, l + 1], k = _ref12[0], l = _ref12[1];
              if (l === d) {
                _ref13 = [0, m + 1], l = _ref13[0], m = _ref13[1];
                fourth = (_ref14 = data[m]) != null ? _ref14 : [];
              }
              third = (_ref15 = fourth[l]) != null ? _ref15 : [];
            }
            second = (_ref16 = third[k]) != null ? _ref16 : [];
          }
          first = (_ref17 = second[j]) != null ? _ref17 : [];
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
var ease;

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
  swizzle = '.' + ('xyzw'.substr(0, to));
  from = 'vec' + from;
  to = 'vec' + to;
  if (to === 'vec1') {
    to = 'float';
  }
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
exports.Data = require('./data');

exports.Ticks = require('./ticks');

exports.Ease = require('./ease');

exports.GLSL = require('./glsl');

exports.Axis = require('./axis');

exports.JS = require('./js');

exports.Three = require('./three');


},{"./axis":19,"./data":20,"./ease":21,"./glsl":22,"./js":24,"./three":25,"./ticks":26}],24:[function(require,module,exports){
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
var Context, Model, Overlay, Primitives, Render, Shaders, Stage, Util;

Overlay = require('./overlay');

Model = require('./model');

Primitives = require('./primitives');

Render = require('./render');

Shaders = require('./shaders');

Stage = require('./stage');

Util = require('./util');

Context = (function() {
  Context.Namespace = {
    Model: Model,
    Stage: Stage,
    Render: Render,
    Shaders: Shaders,
    Primitives: Primitives,
    Util: Util
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
    this.renderables = new Render.Factory(renderer, Render.Classes, this.shaders);
    this.overlays = new Overlay.Factory(element, canvas, Overlay.Classes);
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


},{"./model":32,"./overlay":38,"./primitives":41,"./render":115,"./shaders":129,"./stage":134,"./util":139}],28:[function(require,module,exports){
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


},{"../build/shaders":1,"./context":27}],29:[function(require,module,exports){

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
          originals[short] = value;
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


},{}],30:[function(require,module,exports){
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


},{"./node":34}],31:[function(require,module,exports){
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


},{}],32:[function(require,module,exports){
exports.Attributes = require('./attributes');

exports.Group = require('./group');

exports.Guard = require('./guard');

exports.Model = require('./model');

exports.Node = require('./node');


},{"./attributes":29,"./group":30,"./guard":31,"./model":33,"./node":34}],33:[function(require,module,exports){
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


},{"cssauron":16}],34:[function(require,module,exports){
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


},{}],35:[function(require,module,exports){
var Classes;

Classes = {
  dom: require('./dom')
};

module.exports = Classes;


},{"./dom":36}],36:[function(require,module,exports){
var DOM, Overlay, descriptor, id,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Overlay = require('./overlay');

id = 0;

descriptor = function() {
  return {
    id: id++,
    type: null,
    props: null,
    children: null
  };
};

DOM = (function(_super) {
  __extends(DOM, _super);

  function DOM() {
    return DOM.__super__.constructor.apply(this, arguments);
  }

  DOM.prototype.init = function(options) {
    this.heap = [];
    this.last = null;
    return this.mount();
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
    this.element.removeChild(overlay);
    return this.overlay = null;
  };

  DOM.prototype.el = function(type, props, children) {
    var el;
    el = this.heap.length ? this.heap.pop() : descriptor();
    el.type = type != null ? type : 'div';
    el.props = props != null ? props : null;
    el.children = children != null ? children : null;
    return el;
  };

  DOM.prototype.recycle = function(el) {
    var child, children, _i, _len;
    if (!el.type) {
      return;
    }
    children = el.children;
    el.type = el.props = el.children = null;
    this.heap.push(el);
    if (children != null) {
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        this.recycle(child);
      }
    }
  };

  DOM.prototype.render = function(el) {
    var last, naked, node, overlay, parent;
    if (typeof el === 'string') {
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
    if (last != null) {
      this.recycle(last);
    }
    this.last = el;
  };

  DOM.prototype.apply = function(el, last, node, parent, index) {
    var child, childNodes, children, i, key, nextChildren, nextProps, props, same, value, _i, _j, _len, _len1, _ref;
    if (el != null) {
      if (last == null) {
        return this.insert(el, parent, index);
      } else {
        same = typeof el === typeof last && last !== null && el !== null && el.type === last.type;
        if (!same) {
          this.remove(node, parent);
          return this.insert(el, parent, index);
        } else {
          props = last != null ? last.props : void 0;
          nextProps = el.props;
          if (props != null) {
            for (key in props) {
              if (!nextProps.hasOwnProperty(key)) {
                this.unset(node, key, value);
              }
            }
          }
          if (nextProps != null) {
            for (key in nextProps) {
              value = nextProps[key];
              if (props[key] !== value) {
                this.set(node, key, value);
              }
            }
          }
          children = (_ref = last != null ? last.children : void 0) != null ? _ref : null;
          nextChildren = el.children;
          if (typeof nextChildren === 'string') {
            if (nextChildren !== children) {
              node.innerText = nextChildren;
            }
          } else if (nextChildren != null) {
            childNodes = node.childNodes;
            if (children != null) {
              for (i = _i = 0, _len = nextChildren.length; _i < _len; i = ++_i) {
                child = nextChildren[i];
                this.apply(child, children[i], childNodes[i], node, i);
              }
            } else {
              for (i = _j = 0, _len1 = nextChildren.length; _j < _len1; i = ++_j) {
                child = nextChildren[i];
                this.apply(child, null, childNodes[i], node, i);
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
      return this.remove(node, parent);
    }
  };

  DOM.prototype.insert = function(el, parent, index) {
    var child, children, i, key, node, value, _i, _len, _ref;
    if (index == null) {
      index = 0;
    }
    if (typeof el === 'string') {
      node = document.createTextNode(el);
    } else {
      node = document.createElement(el.type);
      _ref = el.props;
      for (key in _ref) {
        value = _ref[key];
        this.set(node, key, value);
      }
    }
    children = el.children;
    if (typeof children === 'string') {
      this.insert(children, node, 0);
    } else {
      if (children != null) {
        for (i = _i = 0, _len = children.length; _i < _len; i = ++_i) {
          child = children[i];
          this.insert(child, node, i);
        }
      }
    }
    parent.insertBefore(node, parent.childNodes[index]);
  };

  DOM.prototype.remove = function(node, parent) {
    return parent.removeChild(node);
  };

  DOM.prototype.set = function(node, key, value) {
    var k, v;
    if (key === 'style') {
      for (k in value) {
        v = value[k];
        node.style[k] = v;
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

  DOM.prototype.unset = function(node, key, value) {
    return node.removeAttribute(key);
  };

  return DOM;

})(Overlay);

module.exports = DOM;


},{"./overlay":39}],37:[function(require,module,exports){
var OverlayFactory;

OverlayFactory = (function() {
  function OverlayFactory(element, canvas, classes) {
    var div;
    this.element = element;
    this.canvas = canvas;
    this.classes = classes;
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


},{}],38:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Classes = require('./classes');

exports.Overlay = require('./overlay');


},{"./classes":35,"./factory":37,"./overlay":39}],39:[function(require,module,exports){
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


},{}],40:[function(require,module,exports){
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


},{"../util":139}],41:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Primitive = require('./primitive');

exports.Types = require('./types');


},{"./factory":40,"./primitive":42,"./types":65}],42:[function(require,module,exports){
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
    this._parent = this.node.parent.controller;
    this._root = this.node.root.controller;
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

  Primitive.prototype._attach = function(selector, trait, method, self) {
    var id, node, parent, previous, selection, watcher;
    if (self == null) {
      self = this;
    }
    if (typeof selector === 'object') {
      node = selector;
      if ((node != null) && __indexOf.call(node.traits, trait) >= 0) {
        return node.controller;
      }
    }
    if (selector === '<') {
      previous = this.node;
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


},{"../model":32}],43:[function(require,module,exports){
var Group, Parent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Parent = require('./parent');

Group = (function(_super) {
  __extends(Group, _super);

  function Group() {
    return Group.__super__.constructor.apply(this, arguments);
  }

  Group.traits = ['node', 'object', 'entity'];

  Group.prototype.make = function() {
    return this._helpers.object.make();
  };

  Group.prototype.unmake = function() {
    return this._helpers.object.unmake();
  };

  return Group;

})(Parent);

module.exports = Group;


},{"./parent":44}],44:[function(require,module,exports){
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


},{"../../primitive":42}],45:[function(require,module,exports){
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

  Root.traits = ['node', 'root', 'scene', 'transform'];

  Root.prototype.init = function() {
    this.size = null;
    return this.event = {
      type: 'root.update'
    };
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

  Root.prototype.update = function() {
    return this.trigger(this.event);
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


},{"../../../util":139,"./parent":44}],46:[function(require,module,exports){
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


},{"../../../util":139,"../../primitive":42}],47:[function(require,module,exports){
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
  array: require('./data/array'),
  interval: require('./data/interval'),
  matrix: require('./data/matrix'),
  area: require('./data/area'),
  voxel: require('./data/voxel'),
  volume: require('./data/volume'),
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
  rtt: require('./rtt/rtt'),
  compose: require('./rtt/compose'),
  label: require('./overlay/label')
};

module.exports = Classes;


},{"./base/group":43,"./base/root":45,"./data/area":48,"./data/array":49,"./data/interval":51,"./data/matrix":52,"./data/volume":53,"./data/voxel":54,"./draw/axis":55,"./draw/face":56,"./draw/grid":57,"./draw/line":58,"./draw/point":59,"./draw/strip":60,"./draw/surface":61,"./draw/ticks":62,"./draw/vector":63,"./operator/join":66,"./operator/lerp":67,"./operator/memo":68,"./operator/repeat":70,"./operator/resample":71,"./operator/split":72,"./operator/spread":73,"./operator/swizzle":74,"./operator/transpose":75,"./overlay/label":76,"./rtt/compose":78,"./rtt/rtt":79,"./transform/transform3":82,"./transform/transform4":83,"./transform/vertex":84,"./view/cartesian":86,"./view/cartesian4":87,"./view/polar":88,"./view/spherical":89,"./view/stereographic":90,"./view/stereographic4":91,"./view/view":92}],48:[function(require,module,exports){
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
    callback = Util.Data.normalizeEmitter(callback, 4);
    return function(i, j, emit) {
      var x, y;
      x = aX + bX * i;
      y = aY + bY * j;
      return callback(x, y, i, j, emit);
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


},{"../../../util":139,"./matrix":52}],49:[function(require,module,exports){
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
    this.buffer = this.spec = this.emitter = null;
    this.filled = false;
    this.space = {
      length: 0,
      history: 0
    };
    return this.used = {
      length: 0
    };
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
    var channels, data, dims, history, items, length, magFilter, minFilter, reserve, space, thunk, type;
    Array_.__super__.make.apply(this, arguments);
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    length = this._get('array.length');
    history = this._get('array.history');
    reserve = this._get('array.bufferLength');
    channels = this._get('data.dimensions');
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
    this.buffer = this._renderables.make('arrayBuffer', {
      length: space.length,
      history: space.history,
      channels: channels,
      items: items,
      minFilter: minFilter,
      magFilter: magFilter,
      type: type
    });
    if (data != null) {
      thunk = Util.Data.getThunk(data);
      return this.emitter = Util.Data.makeEmitter(thunk, items, channels, 1);
    }
  };

  Array_.prototype.unmake = function() {
    Array_.__super__.unmake.apply(this, arguments);
    if (this.buffer) {
      this.buffer.dispose();
      return this.buffer = this.spec = this.emitter = null;
    }
  };

  Array_.prototype.change = function(changed, touched, init) {
    var data, emitter, length;
    if (touched['texture'] || changed['array.history'] || changed['data.dimensions'] || changed['array.bufferLength']) {
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
      emitter = this.emitter;
      data = this._get('data.data');
      if (data == null) {
        emitter = this.callback(this._get('data.expression'));
      }
      return this.buffer.setCallback(emitter);
    }
  };

  Array_.prototype.callback = function(callback) {
    return Util.Data.normalizeEmitter(emitter, 1);
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


},{"../../../util":139,"./data":50}],50:[function(require,module,exports){
var Data, Source,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Source = require('../base/source');

Data = (function(_super) {
  __extends(Data, _super);

  function Data() {
    return Data.__super__.constructor.apply(this, arguments);
  }

  Data.traits = ['node', 'data', 'source', 'texture'];

  Data.prototype.update = function() {};

  Data.prototype.callback = function(callback) {
    return callback != null ? callback : function() {};
  };

  Data.prototype.make = function() {
    return this._listen('root', 'root.update', this.update);
  };

  Data.prototype.unmake = function() {};

  return Data;

})(Source);

module.exports = Data;


},{"../base/source":46}],51:[function(require,module,exports){
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
    callback = Util.Data.normalizeEmitter(callback, 2);
    return function(i, emit) {
      var x;
      x = a + b * i;
      return callback(x, i, emit);
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


},{"../../../util":139,"./array":49}],52:[function(require,module,exports){
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
    this.buffer = this.spec = this.emitter = null;
    this.filled = false;
    this.space = {
      width: 0,
      height: 0,
      history: 0
    };
    return this.used = {
      width: 0,
      height: 0
    };
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
    var channels, data, dims, height, history, items, magFilter, minFilter, reserveX, reserveY, space, thunk, type, width;
    Matrix.__super__.make.apply(this, arguments);
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    width = this._get('matrix.width');
    height = this._get('matrix.height');
    history = this._get('matrix.history');
    reserveX = this._get('matrix.bufferWidth');
    reserveY = this._get('matrix.bufferHeight');
    channels = this._get('data.dimensions');
    items = this._get('data.items');
    dims = this.spec = {
      channels: channels,
      items: items,
      width: width,
      height: height,
      depth: history
    };
    this.items = dims.items;
    this.channels = dims.channels;
    data = this._get('data.data');
    dims = Util.Data.getDimensions(data, dims);
    space = this.space;
    space.width = Math.max(reserveX, dims.width || 1);
    space.height = Math.max(reserveY, dims.height || 1);
    space.history = history;
    this.buffer = this._renderables.make('matrixBuffer', {
      width: space.width,
      height: space.height,
      history: space.history,
      channels: channels,
      items: items,
      minFilter: minFilter,
      magFilter: magFilter,
      type: type
    });
    if (data != null) {
      thunk = Util.Data.getThunk(data);
      return this.emitter = Util.Data.makeEmitter(thunk, items, channels, 2);
    }
  };

  Matrix.prototype.unmake = function() {
    Matrix.__super__.unmake.apply(this, arguments);
    if (this.buffer) {
      this.buffer.dispose();
      return this.buffer = this.spec = this.emitter = null;
    }
  };

  Matrix.prototype.change = function(changed, touched, init) {
    var data, emitter, height, width;
    if (touched['texture'] || changed['matrix.history'] || changed['data.dimensions'] || changed['matrix.bufferWidth'] || changed['matrix.bufferHeight']) {
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
      emitter = this.emitter;
      data = this._get('data.data');
      if (data == null) {
        emitter = this.callback(this._get('data.expression'));
      }
      return this.buffer.setCallback(emitter);
    }
  };

  Matrix.prototype.callback = function(callback) {
    return Util.Data.normalizeEmitter(emitter, 2);
  };

  Matrix.prototype.update = function() {
    var data, dims, filled, h, length, rebuild, space, step, used, w, _w;
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
      rebuild = false;
      if (dims.width > space.width) {
        rebuild = true;
        length = space.width;
        step = Math.min(128, length);
        space.width = Math.max(length + step, dims.width);
      }
      if (dims.height > space.height) {
        rebuild = true;
        length = space.height;
        step = Math.min(128, length);
        space.height = Math.max(length + step, dims.height);
      }
      if (rebuild) {
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


},{"../../../util":139,"./data":50}],53:[function(require,module,exports){
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
    callback = Util.Data.normalizeEmitter(callback, 6);
    return function(i, j, k, emit) {
      var x, y, z;
      x = aX + bX * i;
      y = aY + bY * j;
      z = aZ + bZ * k;
      return callback(x, y, z, i, j, k, emit);
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


},{"../../../util":139,"./voxel":54}],54:[function(require,module,exports){
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
    this.buffer = this.spec = this.emitter = null;
    this.filled = false;
    this.space = {
      width: 0,
      height: 0,
      depth: 0
    };
    return this.used = {
      width: 0,
      height: 0,
      depth: 0
    };
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
    var channels, data, depth, dims, height, items, magFilter, minFilter, reserveX, reserveY, reserveZ, space, thunk, type, width;
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
    channels = this._get('data.dimensions');
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
    this.buffer = this._renderables.make('voxelBuffer', {
      width: space.width,
      height: space.height,
      depth: space.depth,
      channels: channels,
      items: items,
      minFilter: minFilter,
      magFilter: magFilter,
      type: type
    });
    if (data != null) {
      thunk = Util.Data.getThunk(data);
      return this.emitter = Util.Data.makeEmitter(thunk, items, channels, 3);
    }
  };

  Voxel.prototype.unmake = function() {
    Voxel.__super__.unmake.apply(this, arguments);
    if (this.buffer) {
      this.buffer.dispose();
      return this.buffer = this.spec = this.emitter = null;
    }
  };

  Voxel.prototype.change = function(changed, touched, init) {
    var data, depth, emitter, height, width;
    if (touched['texture'] || changed['data.dimensions'] || changed['voxel.bufferWidth'] || changed['voxel.bufferHeight'] || changed['voxel.bufferDepth']) {
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
      emitter = this.emitter;
      data = this._get('data.data');
      if (data == null) {
        emitter = this.callback(this._get('data.expression'));
      }
      return this.buffer.setCallback(emitter);
    }
  };

  Voxel.prototype.callback = function(callback) {
    return Util.Data.normalizeEmitter(emitter, 3);
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


},{"../../../util":139,"./data":50}],55:[function(require,module,exports){
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
    var arrowUniforms, detail, end, lineUniforms, position, positionUniforms, samples, start, stroke, styleUniforms, uniforms;
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
    detail = this._get('axis.detail');
    samples = detail + 1;
    this.resolution = 1 / detail;
    start = this._get('arrow.start');
    end = this._get('arrow.end');
    stroke = this._get('line.stroke');
    uniforms = Util.JS.merge(arrowUniforms, lineUniforms, styleUniforms);
    this.line = this._renderables.make('line', {
      uniforms: uniforms,
      samples: samples,
      position: position,
      clip: start || end,
      stroke: stroke
    });
    this.arrows = [];
    uniforms = Util.JS.merge(arrowUniforms, styleUniforms);
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


},{"../../../util":139,"../../primitive":42}],56:[function(require,module,exports){
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
    items = dims.items;
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    if (this.face) {
      this.face.geometry.clip(width, height, depth, items);
    }
    if (this.line) {
      return this.line.geometry.clip(items, width, height, depth);
    }
  };

  Face.prototype.make = function() {
    var color, depth, dims, height, items, lineUniforms, objects, outline, position, shaded, solid, styleUniforms, swizzle, uniforms, width;
    this._helpers.bind.make({
      'geometry.points': 'source',
      'geometry.colors': 'source'
    });
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    dims = this.bind.points.getDimensions();
    items = dims.items;
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
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


},{"../../../util":139,"../../primitive":42}],57:[function(require,module,exports){
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
        var buffer, detail, line, lineUniforms, p, position, positionUniforms, resolution, samples, strips, styleUniforms, uniforms, values;
        detail = _this._get(first + 'axis.detail');
        samples = detail + 1;
        resolution = 1 / detail;
        strips = _this._helpers.scale.divide(second);
        buffer = _this._renderables.make('dataBuffer', {
          samples: strips,
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
        p.require(buffer.shader(_this._shaders.shader()));
        p.pipe('grid.position', positionUniforms);
        position = _this._helpers.position.pipeline(p);
        styleUniforms = _this._helpers.style.uniforms();
        lineUniforms = _this._helpers.line.uniforms();
        uniforms = Util.JS.merge(lineUniforms, styleUniforms);
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


},{"../../../util":139,"../../primitive":42}],58:[function(require,module,exports){
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
    var arrowUniforms, color, dims, end, layers, lineUniforms, position, ribbons, samples, start, strips, stroke, styleUniforms, uniforms;
    this._helpers.bind.make({
      'geometry.points': 'source',
      'geometry.colors': 'source'
    });
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    arrowUniforms = this._helpers.arrow.uniforms();
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
    uniforms = Util.JS.merge(arrowUniforms, lineUniforms, styleUniforms);
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
    uniforms = Util.JS.merge(arrowUniforms, styleUniforms);
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


},{"../../../util":139,"../../primitive":42}],59:[function(require,module,exports){
var Point, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Point = (function(_super) {
  __extends(Point, _super);

  Point.traits = ['node', 'object', 'style', 'point', 'geometry', 'position', 'bind', 'renderScale'];

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
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    items = dims.items;
    return this.point.geometry.clip(width, height, depth, items);
  };

  Point.prototype.make = function() {
    var color, depth, dims, fill, height, items, pointUniforms, position, renderUniforms, shape, styleUniforms, uniforms, width;
    this._helpers.bind.make({
      'geometry.points': 'source',
      'geometry.colors': 'source'
    });
    if (this.bind.points == null) {
      return;
    }
    this._helpers.renderScale.make();
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    dims = this.bind.points.getDimensions();
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    items = dims.items;
    styleUniforms = this._helpers.style.uniforms();
    pointUniforms = this._helpers.point.uniforms();
    renderUniforms = this._helpers.renderScale.uniforms();
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }
    shape = this._get('point.shape');
    fill = this._get('point.fill');
    uniforms = Util.JS.merge(renderUniforms, pointUniforms, styleUniforms);
    this.point = this._renderables.make('sprite', {
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
    this._helpers.renderScale.unmake();
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


},{"../../../util":139,"../../primitive":42}],60:[function(require,module,exports){
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
    items = dims.items;
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    return this.strip.geometry.clip(width, height, depth, items);
  };

  Strip.prototype.make = function() {
    var color, depth, dims, height, items, lineUniforms, position, styleUniforms, uniforms, width;
    this._helpers.bind.make({
      'geometry.points': 'source',
      'geometry.colors': 'source'
    });
    if (this.bind.points == null) {
      return;
    }
    position = this._shaders.shader();
    position = this.bind.points.sourceShader(position);
    position = this._helpers.position.pipeline(position);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    dims = this.bind.points.getDimensions();
    items = dims.items;
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
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


},{"../../../util":139,"../../primitive":42}],61:[function(require,module,exports){
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
    var color, depth, dims, first, height, layers, lineUniforms, objects, position, second, shaded, solid, stroke, styleUniforms, surfaceUniforms, uniforms, width, wireUniforms, wireXY, wireYX, zUnits;
    this._helpers.bind.make({
      'geometry.points': 'source',
      'geometry.colors': 'source'
    });
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
    wireUniforms.styleColor = this._attributes.make(this._types.color());
    wireUniforms.styleZIndex = this._attributes.make(this._types.number());
    this.wireColor = wireUniforms.styleColor.value;
    this.wireZIndex = wireUniforms.styleZIndex;
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
    uniforms = Util.JS.merge(lineUniforms, styleUniforms, wireUniforms);
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
      uniforms = Util.JS.merge(surfaceUniforms, styleUniforms);
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
      this.wireZIndex.value = this._get('style.zIndex') + 5;
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


},{"../../../util":139,"../../primitive":42}],62:[function(require,module,exports){
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
    var lineUniforms, p, position, positionUniforms, samples, styleUniforms, uniforms;
    this.resolution = samples = this._helpers.scale.divide('');
    this.buffer = this._renderables.make('dataBuffer', {
      samples: samples,
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
    p.require(this.buffer.shader(this._shaders.shader()));
    p.pipe('ticks.position', positionUniforms);
    styleUniforms = this._helpers.style.uniforms();
    lineUniforms = this._helpers.line.uniforms();
    uniforms = Util.JS.merge(lineUniforms, styleUniforms);
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


},{"../../../util":139,"../../primitive":42}],63:[function(require,module,exports){
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
    var arrowUniforms, color, dims, end, layers, lineUniforms, position, ribbons, samples, start, strips, stroke, styleUniforms, swizzle, uniforms;
    this._helpers.bind.make({
      'geometry.points': 'source',
      'geometry.colors': 'source'
    });
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
    uniforms = Util.JS.merge(arrowUniforms, lineUniforms, styleUniforms);
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
    uniforms = Util.JS.merge(arrowUniforms, styleUniforms);
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


},{"../../../util":139,"../../primitive":42}],64:[function(require,module,exports){
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
    make: function(map) {
      var key, name, selector, source, trait;
      this.bind = {};
      for (key in map) {
        trait = map[key];
        name = key.split(/\./g).pop();
        selector = this._get(key);
        source = selector != null ? this._attach(selector, trait, this.rebuild) : null;
        if (source != null) {
          this._listen(source, 'source.resize', this.resize);
          this._listen(source, 'source.rebuild', this.rebuild);
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
        styleZIndex: this.node.attributes['style.zIndex']
      };
    }
  },
  arrow: {
    uniforms: function() {
      var end, size, space, start, style;
      start = this._get('arrow.start');
      end = this._get('arrow.end');
      space = this._attributes.make(this._types.number(1 / (start + end)));
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
        pointSize: this.node.attributes['point.size']
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
        zFactor = this._get('style.zFactor');
        zUnits = this._get('style.zUnits');
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
          if (changed['style.zFactor']) {
            refresh = zFactor = _this._get('style.zFactor');
          }
          if (changed['style.zUnits']) {
            refresh = zUnits = _this._get('style.zUnits');
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
                o.polygonOffset(zFactor, zUnits);
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
  renderScale: {
    make: function() {
      var aspect, handler, height, root, scale, width;
      this.renderUniforms = {
        renderScale: scale = this._attributes.make(this._types.number(0)),
        renderAspect: aspect = this._attributes.make(this._types.number(0)),
        renderWidth: width = this._attributes.make(this._types.number(0)),
        renderHeight: height = this._attributes.make(this._types.number(0))
      };
      handler = (function(_this) {
        return function() {
          var size;
          if ((size = typeof root !== "undefined" && root !== null ? root.getSize() : void 0) != null) {
            width.value = size.renderWidth / 2;
            height.value = size.renderHeight / 2;
            aspect.value = size.aspect;
            return scale.value = height.value;
          }
        };
      })(this);
      root = this._listen('root', 'root.resize', handler);
      return handler();
    },
    unmake: function() {
      return delete this.renderUniforms;
    },
    get: function() {
      var u;
      u = this.renderUniforms;
      return {
        width: u.renderWidth.value,
        height: u.renderHeight.value,
        aspect: u.renderAspect.value,
        scale: u.renderScale.value
      };
    },
    uniforms: function() {
      return this.renderUniforms;
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


},{"../../util":139,"./view/view":92}],65:[function(require,module,exports){
var Model;

Model = require('../../model');

exports.Classes = require('./classes');

exports.Types = require('./types');

exports.Traits = require('./traits');

exports.Helpers = require('./helpers');


},{"../../model":32,"./classes":47,"./helpers":64,"./traits":80,"./types":85}],66:[function(require,module,exports){
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


},{"../../../util":139,"./operator":69}],67:[function(require,module,exports){
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
    shader.pipe(this.indexer);
    return Lerp.__super__.indexShader.apply(this, arguments);
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


},{"./operator":69}],68:[function(require,module,exports){
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
    items = dims.items;
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
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
      fragment: operator,
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
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
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


},{"../../../util":139,"./operator":69}],69:[function(require,module,exports){
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
    return this._helpers.bind.make({
      'operator.source': 'source'
    });
  };

  Operator.prototype.made = function() {
    return this.resize();
  };

  Operator.prototype.unmake = function() {
    return this._helpers.bind.unmake();
  };

  Operator.prototype.resize = function() {
    return this.trigger({
      type: 'source.resize'
    });
  };

  return Operator;

})(Source);

module.exports = Operator;


},{"../base/source":46}],70:[function(require,module,exports){
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
    return Repeat.__super__.indexShader.apply(this, arguments);
  };

  Repeat.prototype.sourceShader = function(shader) {
    shader.pipe(this.operator);
    return Repeat.__super__.sourceShader.apply(this, arguments);
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


},{"./operator":69}],71:[function(require,module,exports){
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
    return shader.pipe(this.indexer);
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
    dimensions = this._get('resample.dimensions');
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


},{"../../../util":139,"./operator":69}],72:[function(require,module,exports){
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
    return Split.__super__.indexShader.apply(this, arguments);
  };

  Split.prototype.sourceShader = function(shader) {
    shader.pipe(this.operator);
    return Split.__super__.sourceShader.apply(this, arguments);
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


},{"../../../util":139,"./operator":69}],73:[function(require,module,exports){
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
    var anchor, d, dims, els, factor, i, id, k, key, matrix, offset, order, spread, v, _i, _j, _len, _ref, _ref1;
    if (this.bind.source) {
      anchor = this._get('spread.anchor');
      dims = this.bind.source.getActive();
      matrix = this.spreadMatrix.value;
      els = matrix.elements;
      order = ['width', 'height', 'depth', 'items'];
      for (i = _i = 0, _len = order.length; _i < _len; i = ++_i) {
        key = order[i];
        id = "spread." + key;
        spread = this._get(id);
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


},{"./operator":69}],74:[function(require,module,exports){
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
    Swizzle.__super__.sourceShader.apply(this, arguments);
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


},{"../../../util":139,"./operator":69}],75:[function(require,module,exports){
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
    return Transpose.__super__.indexShader.apply(this, arguments);
  };

  Transpose.prototype.sourceShader = function(shader) {
    if (this.swizzler) {
      shader.pipe(this.swizzler);
    }
    return Transpose.__super__.sourceShader.apply(this, arguments);
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


},{"../../../util":139,"./operator":69}],76:[function(require,module,exports){
var Label, Overlay, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Overlay = require('./overlay');

Util = require('../../../util');

Label = (function(_super) {
  __extends(Label, _super);

  function Label() {
    return Label.__super__.constructor.apply(this, arguments);
  }

  Label.traits = ['node', 'bind', 'overlay', 'label', 'position', 'renderScale'];

  Label.prototype.init = function() {
    this.emitter = this.root = null;
    return this.active = {};
  };

  Label.prototype.make = function() {
    var depth, dims, height, indexer, indexing, isIndexed, items, position, projection, width, _base;
    Label.__super__.make.apply(this, arguments);
    this._helpers.bind.make({
      'label.source': 'source'
    });
    if (this.bind.source == null) {
      return;
    }
    indexing = this._get('label.indexing');
    this.root = this._inherit('root');
    this._listen('root', 'root.update', this.update);
    this.offset = this.node.attributes['label.offset'];
    this.snap = this.node.attributes['label.snap'];
    dims = this.bind.source.getDimensions();
    items = dims.items;
    width = dims.width;
    height = dims.height;
    depth = dims.depth;
    position = this.bind.source.sourceShader(this._shaders.shader());
    position = this._helpers.position.pipeline(position);
    projection = this._shaders.shader({
      globals: ['projectionMatrix']
    });
    projection.pipe('project.readback');
    position.pipe(projection);
    isIndexed = indexing === this.node.attributes['label.indexing']["enum"].original;
    indexer = this._shaders.shader();
    if (isIndexed) {
      indexer = typeof (_base = this.bind.source).indexShader === "function" ? _base.indexShader(indexer) : void 0;
    }
    this.readback = this._renderables.make('readback', {
      fragment: position,
      indexer: indexer,
      items: items,
      width: width,
      height: height,
      depth: depth,
      channels: 4
    });
    this.dom = this._overlays.make('dom', {
      items: items,
      width: width,
      height: height,
      depth: depth
    });
    return this._helpers.renderScale.make();
  };

  Label.prototype.unmake = function() {
    this._helpers.renderScale.unmake();
    this._helpers.bind.unmake();
    if (this.bind.source != null) {
      this.memo.unadopt(this.compose);
      this.memo.dispose();
      this.memo = this.compose = null;
      this.root = null;
      this.emitter = null;
      return this.active = {};
    }
  };

  Label.prototype.update = function() {
    if (this.readback == null) {
      return;
    }
    this.readback.update(this.root.getCamera());
    this.readback.iterate();
    return this.dom.render(this.emitter.nodes());
  };

  Label.prototype.callback = function(emitter) {
    var dom, f, height, nodes, offset, snap, uniforms, width;
    uniforms = this._helpers.renderScale.uniforms();
    width = uniforms.renderWidth;
    height = uniforms.renderHeight;
    offset = this.offset.value;
    snap = this.snap;
    dom = this.dom;
    nodes = [];
    f = function(i, j, k, l, x, y, z, w, index) {
      return emitter(i, j, k, l, x, y, z, w, function(label) {
        var display, props;
        if (label === +label) {
          label = "" + label;
        }
        x = (x + 1) * width.value + offset.x + 1e-5;
        y = (y - 1) * height.value + offset.y + 1e-5;
        if (snap.value) {
          x = Math.round(x);
          y = Math.round(y);
        }
        display = z < 0 ? 'none' : 'block';
        props = {
          className: 'mathbox-label',
          style: {
            transform: "translate(-50%, -50%) translate3d(" + x + "px, " + (-y) + "px, " + (-z) + "px)",
            display: display
          }
        };
        return nodes.push(dom.el('div', props, label));
      });
    };
    f.reset = function() {
      nodes = [];
      return typeof emitter.reset === "function" ? emitter.reset() : void 0;
    };
    f.nodes = function() {
      return nodes;
    };
    return f;
  };

  Label.prototype.resize = function() {
    var depth, height, items, width, _ref;
    this.active = (_ref = this.bind.source.getActive(), items = _ref.items, width = _ref.width, height = _ref.height, depth = _ref.depth, _ref);
    return this.readback.setActive(items, width, height, depth);
  };

  Label.prototype.change = function(changed, touched, init) {
    var data, emitter;
    if (changed['label.source']) {
      return this.rebuild();
    }
    if (this.bind.source == null) {
      return;
    }
    if (changed['label.data'] || changed['label.expression'] || init) {
      data = this._get('label.data');
      emitter = this._get('label.expression');
      if (data != null) {
        emitter = function() {
          return '';
        };
      } else {
        emitter = Util.Data.normalizeEmitter(emitter, 8);
      }
      this.emitter = emitter = this.callback(emitter);
      return this.readback.setCallback(emitter);
    }
  };

  return Label;

})(Overlay);

module.exports = Label;


},{"../../../util":139,"./overlay":77}],77:[function(require,module,exports){
var Overlay, Primitive, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../../primitive');

Util = require('../../../util');

Overlay = (function(_super) {
  __extends(Overlay, _super);

  function Overlay() {
    return Overlay.__super__.constructor.apply(this, arguments);
  }

  Overlay.traits = ['node', 'overlay'];

  return Overlay;

})(Primitive);

module.exports = Overlay;


},{"../../../util":139,"../../primitive":42}],78:[function(require,module,exports){
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
    this._helpers.bind.make({
      'operator.source': 'source'
    });
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
      fragment: fragment,
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


},{"../../../util":139,"../../primitive":42}],79:[function(require,module,exports){
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
    this.rtt = this.scene = this.width = this.height = this.history = this.size = null;
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
    var magFilter, minFilter, type, _ref, _ref1;
    this.parentRoot = this._inherit('root');
    this.size = this.parentRoot.getSize();
    this._listen(this.parentRoot, 'root.update', this.update);
    this._listen(this.parentRoot, 'root.resize', function(event) {
      return this.resize(event.size);
    });
    if (this.size == null) {
      return;
    }
    minFilter = this._get('texture.minFilter');
    magFilter = this._get('texture.magFilter');
    type = this._get('texture.type');
    this.width = (_ref = this._get('rtt.width')) != null ? _ref : this.size.renderWidth;
    this.height = (_ref1 = this._get('rtt.height')) != null ? _ref1 : this.size.renderHeight;
    this.history = this._get('rtt.history');
    if (this.scene == null) {
      this.scene = this._renderables.make('scene');
    }
    return this.rtt = this._renderables.make('renderToTexture', {
      scene: this.scene,
      width: this.width,
      height: this.height,
      frames: this.history,
      minFilter: minFilter,
      magFilter: magFilter,
      type: type
    });
  };

  RTT.prototype.made = function() {
    this.trigger({
      type: 'source.rebuild'
    });
    return this.trigger({
      type: 'root.resize',
      size: this.size
    });
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
    if (this.size != null) {
      if (this.rtt != null) {
        this.rtt.camera.aspect = this.size.aspect;
      }
      return this.rtt.camera.updateProjectionMatrix();
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
    this.size = size;
    return this.rebuild();
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


},{"../../../util":139,"../base/root":45}],80:[function(require,module,exports){
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
  style: {
    opacity: Types.number(1),
    color: Types.color(),
    blending: Types.blending(),
    zWrite: Types.bool(true),
    zTest: Types.bool(true),
    zIndex: Types.number(0),
    zOrder: Types.nullable(Types.int()),
    zFactor: Types.number(0),
    zUnits: Types.number(0)
  },
  overlay: {
    opacity: Types.number(1)
  },
  html: {
    element: Types.select()
  },
  label: {
    indexing: Types.indexing(),
    offset: Types.vec2(0, -20),
    snap: Types.bool(true),
    source: Types.select(),
    data: Types.nullable(Types.object()),
    expression: Types.nullable(Types.func())
  },
  point: {
    size: Types.number(.01),
    shape: Types.shape(),
    fill: Types.bool(true)
  },
  line: {
    width: Types.number(.01),
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
    size: Types.number(.07),
    start: Types.bool(false),
    end: Types.bool(false)
  },
  ticks: {
    size: Types.number(.05)
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
  geometry: {
    points: Types.select(),
    colors: Types.nullable(Types.select())
  },
  source: {
    hint: Types.nullable(Types.string())
  },
  data: {
    data: Types.nullable(Types.object()),
    expression: Types.nullable(Types.func()),
    live: Types.bool(true),
    dimensions: Types.int(3),
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
    anchor: Types.number(0)
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
    dimensions: Types.number(4),
    map: Types.mapping(),
    scale: Types.mapping('absolute'),
    shader: Types.nullable(Types.string()),
    items: Types.nullable(Types.int()),
    width: Types.nullable(Types.int()),
    height: Types.nullable(Types.int()),
    depth: Types.nullable(Types.int())
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


},{"./types":85}],81:[function(require,module,exports){
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


},{"../base/parent":44}],82:[function(require,module,exports){
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


},{"./transform":81}],83:[function(require,module,exports){
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


},{"./transform":81}],84:[function(require,module,exports){
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


},{"./transform":81}],85:[function(require,module,exports){
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
  nullable: function(type) {
    return {
      make: function() {
        return null;
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
        return new THREE.Matrix4(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
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
  }
};

module.exports = Types;


},{}],86:[function(require,module,exports){
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


},{"./view":92}],87:[function(require,module,exports){
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


},{"./view":92}],88:[function(require,module,exports){
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


},{"../../../util":139,"./view":92}],89:[function(require,module,exports){
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


},{"../../../util":139,"./view":92}],90:[function(require,module,exports){
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


},{"../../../util":139,"./view":92}],91:[function(require,module,exports){
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


},{"../../../util":139,"./view":92}],92:[function(require,module,exports){
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


},{"../transform/transform":81}],93:[function(require,module,exports){
var ArrayBuffer_, Buffer, DataTexture, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

DataTexture = require('./texture/datatexture');

Util = require('../../util');

ArrayBuffer_ = (function(_super) {
  __extends(ArrayBuffer_, _super);

  function ArrayBuffer_(renderer, shaders, options) {
    this.callback = options.callback || function() {};
    this.length = options.length || 1;
    this.history = options.history || 1;
    this.samples = this.length;
    ArrayBuffer_.__super__.constructor.call(this, renderer, shaders, options);
  }

  ArrayBuffer_.prototype.shader = function(shader) {
    if (this.items > 1) {
      shader.pipe('map.xyzw.texture', this.uniforms);
    } else {
      shader.pipe(Util.GLSL.truncateVec(4, 2));
    }
    return ArrayBuffer_.__super__.shader.call(this, shader);
  };

  ArrayBuffer_.prototype.build = function(options) {
    ArrayBuffer_.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.channels * this.items);
    this.texture = new DataTexture(this.gl, this.samples * this.items, this.history, this.channels, options);
    this.index = 0;
    this.filled = 0;
    this.pad = 0;
    this.streamer = this.generate(this.data);
    this.dataPointer = this.uniforms.dataPointer.value;
    this._adopt(this.texture.uniforms);
    return this._adopt({
      textureItems: {
        type: 'f',
        value: this.items
      },
      textureHeight: {
        type: 'f',
        value: 1
      }
    });
  };

  ArrayBuffer_.prototype.getFilled = function() {
    return this.filled;
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
    while (!done() && i < limit && callback(i++, emit) !== false) {
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

})(Buffer);

module.exports = ArrayBuffer_;


},{"../../util":139,"./buffer":94,"./texture/datatexture":100}],94:[function(require,module,exports){
var Buffer, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Util = require('../../util');

Buffer = (function(_super) {
  __extends(Buffer, _super);

  Buffer.iterationLimit = 0xFFFF;

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
      this.callback = options.callback || function(x) {};
    }
    Buffer.__super__.constructor.call(this, renderer, shaders);
    this.build(options);
  }

  Buffer.prototype.shader = function(shader) {
    shader.pipe("map.2d.data", this.uniforms);
    shader.pipe("sample.2d", this.uniforms);
    if (this.channels < 4) {
      shader.pipe(Util.GLSL.swizzleVec4(['0000', 'x000', 'xw00', 'xyz0'][this.channels]));
    }
    return shader;
  };

  Buffer.prototype.build = function() {
    this.callback = function() {};
    return this.uniforms = {
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2()
      }
    };
  };

  Buffer.prototype.dispose = function() {
    this.data = null;
    this.texture.dispose();
    return Buffer.__super__.dispose.apply(this, arguments);
  };

  Buffer.prototype.update = function() {
    var n;
    n = this.iterate();
    this.write(n);
    return n;
  };

  Buffer.prototype.copy = function(data) {
    var d, i, n, _i;
    n = Math.min(data.length, this.samples * this.channels * this.items);
    d = this.data;
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      d[i] = data[i];
    }
    return this.write(Math.floor(n / this.channels / this.items));
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


},{"../../util":139,"../renderable":126}],95:[function(require,module,exports){
var Buffer, DataBuffer, DataTexture,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

DataTexture = require('./texture/datatexture');

DataBuffer = (function(_super) {
  __extends(DataBuffer, _super);

  function DataBuffer(renderer, shaders, options) {
    DataBuffer.__super__.constructor.call(this, renderer, shaders, options);
  }

  DataBuffer.prototype.build = function(options) {
    DataBuffer.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.channels * this.items);
    this.texture = new DataTexture(this.gl, this.samples * this.items, 1, this.channels, options);
    this.dataPointer = this.uniforms.dataPointer.value;
    return this._adopt(this.texture.uniforms);
  };

  DataBuffer.prototype.write = function(n) {
    if (n == null) {
      n = this.samples * this.items;
    }
    this.texture.write(this.data, 0, 0, n, 1);
    return this.dataPointer.set(.5, .5);
  };

  return DataBuffer;

})(Buffer);

module.exports = DataBuffer;


},{"./buffer":94,"./texture/datatexture":100}],96:[function(require,module,exports){
var Buffer, DataTexture, MatrixBuffer, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

DataTexture = require('./texture/datatexture');

Util = require('../../util');

MatrixBuffer = (function(_super) {
  __extends(MatrixBuffer, _super);

  function MatrixBuffer(renderer, shaders, options) {
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.history = options.history || 1;
    this.samples = this.width * this.height;
    MatrixBuffer.__super__.constructor.call(this, renderer, shaders, options);
  }

  MatrixBuffer.prototype.shader = function(shader) {
    if (this.items > 1 || this.history > 1) {
      shader.pipe('map.xyzw.texture', this.uniforms);
    } else {
      shader.pipe(Util.GLSL.truncateVec(4, 2));
    }
    return MatrixBuffer.__super__.shader.call(this, shader);
  };

  MatrixBuffer.prototype.build = function(options) {
    MatrixBuffer.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.items * this.channels);
    this.texture = new DataTexture(this.gl, this.width * this.items, this.height * this.history, this.channels, options);
    this.index = 0;
    this.filled = 0;
    this.pad = {
      x: 0,
      y: 0
    };
    this.streamer = this.generate(this.data);
    this.dataPointer = this.uniforms.dataPointer.value;
    this._adopt(this.texture.uniforms);
    return this._adopt({
      textureItems: {
        type: 'f',
        value: this.items
      },
      textureHeight: {
        type: 'f',
        value: this.height
      }
    });
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
    while (!done() && k < limit) {
      k++;
      repeat = callback(i, j, emit);
      if (++i === n - pad) {
        skip(pad);
        i = 0;
        j++;
      }
      if (repeat === false) {
        break;
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

})(Buffer);

module.exports = MatrixBuffer;


},{"../../util":139,"./buffer":94,"./texture/datatexture":100}],97:[function(require,module,exports){
var Memo, RenderToTexture, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

RenderToTexture = require('./rendertotexture');

Util = require('../../util');


/*
Wrapped RTT for memoizing 4D arrays back to a 2D texture
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


},{"../../util":139,"../renderable":126,"./rendertotexture":99}],98:[function(require,module,exports){
var Buffer, Memo, MemoScreen, Readback, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Buffer = require('./buffer');

Memo = require('./memo');

MemoScreen = require('../meshes/memoscreen');

Util = require('../../util');


/*
Readback up to 4D array of up to 4D data from GL
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
    var channels, depth, encoder, fragment, h, height, indexer, isIndexed, items, sampler, stretch, w, width;
    fragment = options.fragment;
    indexer = options.indexer;
    isIndexed = (indexer != null) && !indexer.empty();
    items = this.items, width = this.width, height = this.height, depth = this.depth;
    sampler = fragment;
    if (indexer != null) {
      this._adopt({
        indexModulus: {
          type: 'v4',
          value: new THREE.Vector4(items, items * width, items * width * height, 1)
        }
      });
      sampler = this.shaders.shader();
      sampler.require(fragment);
      if (isIndexed) {
        sampler.require(indexer);
      }
      if (!isIndexed) {
        sampler.require(Util.GLSL.identity('vec4'));
      }
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
        fragment: sampler,
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
      fragment: sampler,
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
    if ((_ref1 = this.byteMemo) != null) {
      _ref1.render(camera);
    }
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
    n = this.width;
    m = this.height;
    o = this.depth;
    p = this.items;
    f = function(x, y, z, w) {
      var ii, index, jj, kk, ll;
      index = w;
      w = w;
      ll = w % p;
      w = (w - ll) / p;
      ii = w % n;
      w = (w - ii) / n;
      jj = w % m;
      w = (w - jj) / m;
      kk = w;
      return callback(ii, jj, kk, ll, x, y, z, w, index);
    };
    f.reset = function() {
      return typeof callback.reset === "function" ? callback.reset() : void 0;
    };
    return f;
  };

  Readback.prototype.iterate = function() {
    var consume, count, done, emit, i, j, k, l, limit, m, n, o, p, padW, padX, padY, padZ, repeat, reset, skip, _ref;
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


},{"../../util":139,"../meshes/memoscreen":121,"../renderable":126,"./buffer":94,"./memo":97}],99:[function(require,module,exports){
var RenderTarget, RenderToTexture, Renderable, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

RenderTarget = require('./texture/rendertarget');

Util = require('../../util');


/*
Render-To-Texture
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


},{"../../util":139,"../renderable":126,"./texture/rendertarget":101}],100:[function(require,module,exports){
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
    this.textureObject = new THREE.Texture(new Image(), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
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


},{"../../../Util":23}],101:[function(require,module,exports){

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


},{}],102:[function(require,module,exports){
var Buffer, DataTexture, Util, VoxelBuffer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

DataTexture = require('./texture/datatexture');

Util = require('../../util');

VoxelBuffer = (function(_super) {
  __extends(VoxelBuffer, _super);

  function VoxelBuffer(renderer, shaders, options) {
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.depth = options.depth || 1;
    this.samples = this.width * this.height * this.depth;
    VoxelBuffer.__super__.constructor.call(this, renderer, shaders, options);
  }

  VoxelBuffer.prototype.shader = function(shader) {
    if (this.items > 1 || this.depth > 1) {
      shader.pipe('map.xyzw.texture', this.uniforms);
    } else {
      shader.pipe(Util.GLSL.truncateVec(4, 2));
    }
    return VoxelBuffer.__super__.shader.call(this, shader);
  };

  VoxelBuffer.prototype.build = function(options) {
    VoxelBuffer.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.items * this.channels);
    this.texture = new DataTexture(this.gl, this.width * this.items, this.height * this.depth, this.channels, options);
    this.filled = 0;
    this.pad = {
      x: 0,
      y: 0,
      z: 0
    };
    this.streamer = this.generate(this.data);
    this.dataPointer = this.uniforms.dataPointer.value;
    this._adopt(this.texture.uniforms);
    return this._adopt({
      textureItems: {
        type: 'f',
        value: this.items
      },
      textureHeight: {
        type: 'f',
        value: this.height
      }
    });
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
    while (!done() && l < limit) {
      l++;
      repeat = callback(i, j, k, emit);
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
    return Math.floor(count() / this.items);
  };

  VoxelBuffer.prototype.write = function(n) {
    var height, width;
    if (n == null) {
      n = this.samples;
    }
    n *= this.items;
    width = this.width * this.items;
    height = Math.ceil(n / width);
    this.texture.write(this.data, 0, 0, width, height);
    this.dataPointer.set(.5, .5);
    return this.filled = 1;
  };

  return VoxelBuffer;

})(Buffer);

module.exports = VoxelBuffer;


},{"../../util":139,"./buffer":94,"./texture/datatexture":100}],103:[function(require,module,exports){
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


},{"./renderable":126}],104:[function(require,module,exports){
var Classes;

Classes = {
  sprite: require('./meshes/sprite'),
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
  renderToTexture: require('./buffer/rendertotexture'),
  memo: require('./buffer/memo'),
  readback: require('./buffer/readback'),
  scene: require('./scene'),
  camera: require('./camera')
};

module.exports = Classes;


},{"./buffer/arraybuffer":93,"./buffer/databuffer":95,"./buffer/matrixbuffer":96,"./buffer/memo":97,"./buffer/readback":98,"./buffer/rendertotexture":99,"./buffer/voxelbuffer":102,"./camera":103,"./meshes/arrow":116,"./meshes/debug":118,"./meshes/face":119,"./meshes/line":120,"./meshes/memoscreen":121,"./meshes/screen":122,"./meshes/sprite":123,"./meshes/strip":124,"./meshes/surface":125,"./scene":127}],105:[function(require,module,exports){
var RenderFactory;

RenderFactory = (function() {
  function RenderFactory(renderer, classes, shaders) {
    this.renderer = renderer;
    this.classes = classes;
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


},{}],106:[function(require,module,exports){
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


},{"./geometry":108}],107:[function(require,module,exports){
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


},{"./geometry":108}],108:[function(require,module,exports){
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


},{}],109:[function(require,module,exports){
exports.Geometry = require('./geometry');

exports.ArrowGeometry = require('./arrowgeometry');

exports.FaceGeometry = require('./facegeometry');

exports.LineGeometry = require('./linegeometry');

exports.ScreenGeometry = require('./screengeometry');

exports.SpriteGeometry = require('./spritegeometry');

exports.StripGeometry = require('./stripgeometry');

exports.SurfaceGeometry = require('./surfacegeometry');


},{"./arrowgeometry":106,"./facegeometry":107,"./geometry":108,"./linegeometry":110,"./screengeometry":111,"./spritegeometry":112,"./stripgeometry":113,"./surfacegeometry":114}],110:[function(require,module,exports){
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


},{"./geometry":108}],111:[function(require,module,exports){
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


},{"./surfacegeometry":114}],112:[function(require,module,exports){
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


},{"./geometry":108}],113:[function(require,module,exports){
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


},{"./geometry":108}],114:[function(require,module,exports){
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


},{"./geometry":108}],115:[function(require,module,exports){
exports.Scene = require('./scene');

exports.Factory = require('./factory');

exports.Renderable = require('./scene');

exports.Classes = require('./classes');


},{"./classes":104,"./factory":105,"./scene":127}],116:[function(require,module,exports){
var Arrow, ArrowGeometry, Base,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

ArrowGeometry = require('../geometry').ArrowGeometry;

Arrow = (function(_super) {
  __extends(Arrow, _super);

  function Arrow(renderer, shaders, options) {
    var color, f, factory, object, position, uniforms, v, _ref;
    Arrow.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
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
    f.pipe('style.color', this.uniforms);
    if (color) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      defaultAttributeValues: null,
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


},{"../geometry":109,"./base":117}],117:[function(require,module,exports){
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
    return object.matrixAutoUpdate = false;
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
    var m, z;
    transparent = true;
    z = transparent ? order : -order;
    m = object.material;
    object.renderDepth = z;
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


},{"../renderable":126}],118:[function(require,module,exports){
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


},{"./base":117}],119:[function(require,module,exports){
var Base, Face, FaceGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

FaceGeometry = require('../geometry').FaceGeometry;

Face = (function(_super) {
  __extends(Face, _super);

  function Face(renderer, shaders, options) {
    var color, f, factory, object, position, shaded, uniforms, v, _ref, _ref1;
    Face.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    shaded = (_ref1 = options.shaded) != null ? _ref1 : true;
    color = options.color;
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
    if (!shaded) {
      f.pipe('style.color', this.uniforms);
    }
    if (shaded) {
      f.pipe('style.color.shaded', this.uniforms);
    }
    if (color) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      defaultAttributeValues: null,
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


},{"../geometry":109,"./base":117}],120:[function(require,module,exports){
var Base, Line, LineGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

LineGeometry = require('../geometry').LineGeometry;

Line = (function(_super) {
  __extends(Line, _super);

  function Line(renderer, shaders, options) {
    var clip, color, defs, f, factory, object, position, stroke, uniforms, v, _ref;
    Line.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
    clip = options.clip;
    stroke = options.stroke;
    stroke = [null, 'dotted', 'dashed'][stroke];
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
    f.pipe('style.color', this.uniforms);
    if (color) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      defaultAttributeValues: null,
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


},{"../geometry":109,"./base":117}],121:[function(require,module,exports){
var MemoScreen, Screen, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Screen = require('./screen');

Util = require('../../util');

MemoScreen = (function(_super) {
  __extends(MemoScreen, _super);

  function MemoScreen(renderer, shaders, options) {
    var depth, fragment, height, items, object, uniforms, width, _i, _len, _ref;
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
    fragment = shaders.shader();
    fragment.pipe('screen.remap.4d.xyzw', uniforms);
    if (options.fragment != null) {
      fragment.pipe(options.fragment);
    }
    MemoScreen.__super__.constructor.call(this, renderer, shaders, {
      fragment: fragment
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


},{"../../util":139,"./screen":122}],122:[function(require,module,exports){
var Base, Screen, ScreenGeometry, Util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

ScreenGeometry = require('../geometry').ScreenGeometry;

Util = require('../../util');

Screen = (function(_super) {
  __extends(Screen, _super);

  function Screen(renderer, shaders, options) {
    var f, factory, fragment, hasStyle, object, uniforms, v, _ref;
    Screen.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    fragment = options.fragment;
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
    f.require(options.fragment);
    f.pipe('stpq.sample.2d');
    if (hasStyle) {
      f.pipe('style.color', this.uniforms);
      f.pipe(Util.GLSL.binaryOperator('vec4', '*'));
    }
    f.pipe('fragment.color');
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      defaultAttributeValues: null,
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


},{"../../util":139,"../geometry":109,"./base":117}],123:[function(require,module,exports){
var Base, Sprite, SpriteGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

SpriteGeometry = require('../geometry').SpriteGeometry;

Sprite = (function(_super) {
  __extends(Sprite, _super);

  function Sprite(renderer, shaders, options) {
    var alpha, color, edgeFactory, f, fill, fillFactory, mask, pass, passes, position, shape, shapes, uniforms, v, _ref, _ref1, _ref2, _ref3, _ref4;
    Sprite.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
    shape = (_ref1 = +options.shape) != null ? _ref1 : 0;
    fill = (_ref2 = options.fill) != null ? _ref2 : true;
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
    v.pipe('sprite.position', this.uniforms);
    v.pipe('project.position', this.uniforms);
    edgeFactory = shaders.material();
    edgeFactory.vertex.pipe(v);
    f = edgeFactory.fragment;
    f.pipe('style.color', this.uniforms);
    if (color) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.require("sprite.mask." + mask, this.uniforms);
    f.require("sprite.alpha." + alpha, this.uniforms);
    f.pipe('sprite.edge', this.uniforms);
    fillFactory = shaders.material();
    fillFactory.vertex.pipe(v);
    f = fillFactory.fragment;
    f.pipe('style.color', this.uniforms);
    if (color) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.require("sprite.mask." + mask, this.uniforms);
    f.require("sprite.alpha." + alpha, this.uniforms);
    f.pipe('sprite.fill', this.uniforms);
    this.edgeMaterial = this._material(edgeFactory.link({
      side: THREE.DoubleSide,
      defaultAttributeValues: null,
      index0AttributeName: "position4"
    }));
    this.fillMaterial = this._material(fillFactory.link({
      side: THREE.DoubleSide,
      defaultAttributeValues: null,
      index0AttributeName: "position4"
    }));
    this.edgeObject = new THREE.Mesh(this.geometry, this.edgeMaterial);
    this.fillObject = new THREE.Mesh(this.geometry, this.fillMaterial);
    this._raw(this.edgeObject);
    this._raw(this.fillObject);
    this.objects = [this.edgeObject, this.fillObject];
  }

  Sprite.prototype.show = function(transparent, blending, order, depth) {
    this._show(this.edgeObject, true, blending, order, depth);
    return this._show(this.fillObject, transparent, blending, order, depth);
  };

  Sprite.prototype.dispose = function() {
    this.geometry.dispose();
    this.edgeMaterial.dispose();
    this.fillMaterial.dispose();
    this.objects = this.edgeObject = this.fillObject = this.geometry = this.material = null;
    return Sprite.__super__.dispose.apply(this, arguments);
  };

  return Sprite;

})(Base);

module.exports = Sprite;


},{"../geometry":109,"./base":117}],124:[function(require,module,exports){
var Base, Strip, StripGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

StripGeometry = require('../geometry').StripGeometry;

Strip = (function(_super) {
  __extends(Strip, _super);

  function Strip(renderer, shaders, options) {
    var color, f, factory, object, position, shaded, uniforms, v, _ref, _ref1;
    Strip.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    shaded = (_ref1 = options.shaded) != null ? _ref1 : true;
    color = options.color;
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
    if (!shaded) {
      f.pipe('style.color', this.uniforms);
    }
    if (shaded) {
      f.pipe('style.color.shaded', this.uniforms);
    }
    if (color) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      defaultAttributeValues: null,
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


},{"../geometry":109,"./base":117}],125:[function(require,module,exports){
var Base, Surface, SurfaceGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Base = require('./base');

SurfaceGeometry = require('../geometry').SurfaceGeometry;

Surface = (function(_super) {
  __extends(Surface, _super);

  function Surface(renderer, shaders, options) {
    var color, f, factory, object, position, shaded, uniforms, v, _ref, _ref1;
    Surface.__super__.constructor.call(this, renderer, shaders, options);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    color = options.color;
    shaded = (_ref1 = options.shaded) != null ? _ref1 : true;
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
    if (!shaded) {
      f.pipe('style.color', this.uniforms);
    }
    if (shaded) {
      f.pipe('style.color.shaded', this.uniforms);
    }
    if (color) {
      f.pipe('mesh.fragment.color', this.uniforms);
    }
    f.pipe('fragment.color', this.uniforms);
    this.material = this._material(factory.link({
      side: THREE.DoubleSide,
      defaultAttributeValues: null,
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


},{"../geometry":109,"./base":117}],126:[function(require,module,exports){
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


},{}],127:[function(require,module,exports){
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


},{"./renderable":126}],128:[function(require,module,exports){
var Factory;

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


},{}],129:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Snippets = MathBox.Shaders;


},{"./factory":128}],130:[function(require,module,exports){
var Animator;

Animator = (function() {
  function Animator(model) {
    this.model = model;
  }

  Animator.prototype.update = function() {};

  return Animator;

})();

module.exports = Animator;


},{}],131:[function(require,module,exports){
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


},{}],132:[function(require,module,exports){
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


},{}],133:[function(require,module,exports){
var Director;

Director = (function() {
  function Director(model, script) {
    this.model = model;
    this.script = script;
  }

  return Director;

})();

module.exports = Director;


},{}],134:[function(require,module,exports){
exports.Animator = require('./animator');

exports.API = require('./api');

exports.Controller = require('./controller');

exports.Director = require('./director');


},{"./animator":130,"./api":131,"./controller":132,"./director":133}],135:[function(require,module,exports){
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


},{}],136:[function(require,module,exports){
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

exports.makeEmitter = function(thunk, items, channels, indices) {
  var inner, middle, outer;
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
  middle = (function() {
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
  outer = (function() {
    switch (indices) {
      case 1:
        return function(i, emit) {
          return middle(emit);
        };
      case 2:
        return function(i, j, emit) {
          return middle(emit);
        };
      case 3:
        return function(i, j, k, emit) {
          return middle(emit);
        };
      case 4:
        return function(i, j, k, l, emit) {
          return middle(emit);
        };
      case 6:
        return function(i, j, k, l, m, n, emit) {
          return middle(emit);
        };
      case 8:
        return function(i, j, k, l, m, n, o, p, emit) {
          return middle(emit);
        };
    }
  })();
  outer.reset = thunk.reset;
  outer.rebind = thunk.rebind;
  return outer;
};

exports.normalizeEmitter = function(emitter, indices) {
  var arity, f;
  arity = emitter.length - 1;
  f = (function() {
    switch (indices) {
      case 1:
        switch (arity) {
          case 0:
            return function(i, emit) {
              return emitter(emit);
            };
          case 1:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 2:
        switch (arity) {
          case 0:
            return function(i, j, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, emit) {
              return emitter(i, emit);
            };
          case 2:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 3:
        switch (arity) {
          case 0:
            return function(i, j, k, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 4:
        switch (arity) {
          case 0:
            return function(i, j, k, l, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, l, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, l, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return function(i, j, k, l, emit) {
              return emitter(i, j, k, emit);
            };
          case 4:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 6:
        switch (arity) {
          case 0:
            return function(i, j, k, l, m, n, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, k, emit);
            };
          case 4:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, k, l, emit);
            };
          case 5:
            return function(i, j, k, l, m, n, emit) {
              return emitter(i, j, k, l, m, emit);
            };
          case 6:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      case 8:
        switch (arity) {
          case 0:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(emit);
            };
          case 1:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, emit);
            };
          case 2:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, emit);
            };
          case 3:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, emit);
            };
          case 4:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, emit);
            };
          case 5:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, m, emit);
            };
          case 6:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, m, n, emit);
            };
          case 7:
            return function(i, j, k, l, m, n, o, p, emit) {
              return emitter(i, j, k, l, m, n, o, emit);
            };
          case 8:
            return emitter;
          default:
            throw "Invalid expression signature: " + emitter;
        }
        break;
      default:
        throw "Invalid expression signature: " + emitter;
    }
  })();
  f.reset = emitter.reset;
  f.rebind = emitter.rebind;
  return f;
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
        var x, _ref1, _ref2;
        x = first[i++];
        if (i === a) {
          _ref1 = [0, j + 1], i = _ref1[0], j = _ref1[1];
          first = (_ref2 = data[j]) != null ? _ref2 : [];
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
        var x, _ref3, _ref4, _ref5, _ref6;
        x = first[i++];
        if (i === a) {
          _ref3 = [0, j + 1], i = _ref3[0], j = _ref3[1];
          if (j === b) {
            _ref4 = [0, k + 1], j = _ref4[0], k = _ref4[1];
            second = (_ref5 = data[k]) != null ? _ref5 : [];
          }
          first = (_ref6 = second[j]) != null ? _ref6 : [];
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
        var x, _ref10, _ref11, _ref6, _ref7, _ref8, _ref9;
        x = first[i++];
        if (i === a) {
          _ref6 = [0, j + 1], i = _ref6[0], j = _ref6[1];
          if (j === b) {
            _ref7 = [0, k + 1], j = _ref7[0], k = _ref7[1];
            if (k === c) {
              _ref8 = [0, l + 1], k = _ref8[0], l = _ref8[1];
              third = (_ref9 = data[l]) != null ? _ref9 : [];
            }
            second = (_ref10 = third[k]) != null ? _ref10 : [];
          }
          first = (_ref11 = second[j]) != null ? _ref11 : [];
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
        var x, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17;
        x = first[i++];
        if (i === a) {
          _ref10 = [0, j + 1], i = _ref10[0], j = _ref10[1];
          if (j === b) {
            _ref11 = [0, k + 1], j = _ref11[0], k = _ref11[1];
            if (k === c) {
              _ref12 = [0, l + 1], k = _ref12[0], l = _ref12[1];
              if (l === d) {
                _ref13 = [0, m + 1], l = _ref13[0], m = _ref13[1];
                fourth = (_ref14 = data[m]) != null ? _ref14 : [];
              }
              third = (_ref15 = fourth[l]) != null ? _ref15 : [];
            }
            second = (_ref16 = third[k]) != null ? _ref16 : [];
          }
          first = (_ref17 = second[j]) != null ? _ref17 : [];
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


},{}],137:[function(require,module,exports){
var ease;

ease = {
  cosine: function(x) {
    return .5 - .5 * Math.cos(x * π);
  }
};

module.exports = ease;


},{}],138:[function(require,module,exports){
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
  swizzle = '.' + ('xyzw'.substr(0, to));
  from = 'vec' + from;
  to = 'vec' + to;
  if (to === 'vec1') {
    to = 'float';
  }
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


},{}],139:[function(require,module,exports){
exports.Data = require('./data');

exports.Ticks = require('./ticks');

exports.Ease = require('./ease');

exports.GLSL = require('./glsl');

exports.Axis = require('./axis');

exports.JS = require('./js');

exports.Three = require('./three');


},{"./axis":135,"./data":136,"./ease":137,"./glsl":138,"./js":140,"./three":141,"./ticks":142}],140:[function(require,module,exports){
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


},{}],141:[function(require,module,exports){
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


},{}],142:[function(require,module,exports){

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


},{}]},{},[28])