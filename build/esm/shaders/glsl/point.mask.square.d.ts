declare var _default: "varying float vPixelSize;\n\nfloat getSquareMask(vec2 uv) {\n  vec2 a = abs(uv);\n  return max(a.x, a.y);\n}\n";
export default _default;
