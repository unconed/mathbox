exports.swizzleVec4 = (order) ->
  "vec4 swizzle(vec4 xyzw) { return xyzw.#{order}; }\n"

