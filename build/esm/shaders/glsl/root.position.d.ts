declare var _default: "vec3 getRootPosition(vec4 position, in vec4 stpqIn, out vec4 stpqOut) {\n  stpqOut = stpqIn; // avoid inout confusion\n  return position.xyz;\n}";
export default _default;
