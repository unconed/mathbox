declare var _default: "attribute vec4 position4;\nuniform vec4 geometryResolution;\nuniform vec4 geometryClip;\nvarying float vMask;\n\n// External\nfloat getSample(vec4 xyzw);\n\nvoid maskLevel() {\n  vec4 p = min(geometryClip, position4);\n  vMask = getSample(p * geometryResolution);\n}\n";
export default _default;
