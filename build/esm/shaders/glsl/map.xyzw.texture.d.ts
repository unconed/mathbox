declare var _default: "uniform float textureItems;\nuniform float textureHeight;\n\nvec2 mapXyzwTexture(vec4 xyzw) {\n  \n  float x = xyzw.x;\n  float y = xyzw.y;\n  float z = xyzw.z;\n  float i = xyzw.w;\n  \n  return vec2(i, y) + vec2(x, z) * vec2(textureItems, textureHeight);\n}\n\n";
export default _default;
