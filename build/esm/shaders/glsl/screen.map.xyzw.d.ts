declare var _default: "uniform vec2 remapUVScale;\nuniform vec2 remapModulus;\nuniform vec2 remapModulusInv;\n\nvec4 screenMapXYZW(vec4 uvwo, vec4 stpq) {\n  vec2 st = floor(remapUVScale * uvwo.xy);\n  vec2 xy = st * remapModulusInv;\n  vec2 ixy = floor(xy);\n  vec2 fxy = xy - ixy;\n  vec2 zw = fxy * remapModulus;\n  return vec4(ixy.x, zw.y, ixy.y, zw.x);\n}\n";
export default _default;
