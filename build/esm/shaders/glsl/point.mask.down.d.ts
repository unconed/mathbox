declare var _default: "varying float vPixelSize;\n\nfloat getTriangleDownMask(vec2 uv) {\n  uv.y += .25;\n  return max(uv.y, abs(uv.x) * .866 - uv.y * .5 + .6);\n}\n";
export default _default;
