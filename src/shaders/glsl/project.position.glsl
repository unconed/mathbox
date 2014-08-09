uniform float styleZIndex;

void setPosition(vec3 position) {
  vec4 pos = projectionMatrix * vec4(position, 1.0);
  pos.z *= (1.0 - styleZIndex / 32768.0);
  gl_Position = pos;
}
