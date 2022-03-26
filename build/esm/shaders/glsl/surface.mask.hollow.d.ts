declare var _default: "attribute vec4 position4;\n\nfloat getSurfaceHollowMask(vec4 xyzw) {\n  vec4 df = abs(fract(position4) - .5);\n  vec2 df2 = min(df.xy, df.zw);\n  float df3 = min(df2.x, df2.y);\n  return df3;\n}";
export default _default;
