declare var _default: "varying float vPixelSize;\n\nfloat getGenericAlpha(float mask) {\n  return vPixelSize * 2.0 * (1.0 - mask);\n}\n";
export default _default;
