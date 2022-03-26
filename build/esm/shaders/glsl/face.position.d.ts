declare var _default: "uniform vec4 geometryClip;\nattribute vec4 position4;\n\n// External\nvec3 getPosition(vec4 xyzw, float canonical);\n\nvec3 getFacePosition() {\n  vec4 p = min(geometryClip, position4);\n  return getPosition(p, 1.0);\n}\n";
export default _default;
