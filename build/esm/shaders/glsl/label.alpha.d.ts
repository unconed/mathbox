declare var _default: "varying float vPixelSize;\n\nvec4 getLabelAlphaColor(vec4 color, vec4 sample) {\n  float mask = clamp(sample.r * 1000.0, 0.0, 1.0);\n  float alpha = (sample.r - .5) * vPixelSize + .5;\n  float a = mask * alpha * color.a;\n  if (a <= 0.0) discard;\n  return vec4(color.xyz, a);\n}\n";
export default _default;
