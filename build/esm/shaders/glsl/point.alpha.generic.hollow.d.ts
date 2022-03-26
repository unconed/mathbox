declare var _default: "varying float vPixelSize;\n\nfloat getGenericHollowAlpha(float mask) {\n  return vPixelSize * (0.5 - 2.0 * abs(mask - .75));\n}\n";
export default _default;
