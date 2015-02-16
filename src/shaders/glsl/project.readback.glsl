// This is three.js' global uniform, missing from fragment shaders.
uniform mat4 projectionMatrix;

vec4 readbackPosition(vec3 position) {
  vec4 pos = projectionMatrix * vec4(position, 1.0);
  if (pos.w < 0.0) {
    return vec4(0.0, 0.0, -1.0, 0.0);
  }
  else {
    return pos / pos.w;
  }
}
