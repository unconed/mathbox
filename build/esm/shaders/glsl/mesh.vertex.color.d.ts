declare var _default: "attribute vec4 position4;\nuniform vec4 geometryClip;\nvarying vec4 vColor;\n\n// External\nvec4 getSample(vec4 xyzw);\n\nvoid vertexColor() {\n  vec4 p = min(geometryClip, position4);\n  vColor = getSample(p);\n}\n";
export default _default;
