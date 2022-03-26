declare var _default: "varying float vPixelSize;\n\nfloat getTriangleLeftMask(vec2 uv) {\n  uv.x += .25;\n  return max(uv.x, abs(uv.y) * .866 - uv.x * .5 + .6);\n}\n";
export default _default;
