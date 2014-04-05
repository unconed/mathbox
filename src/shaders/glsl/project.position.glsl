uniform float styleZBias;

void setPosition(vec3 position) {
  vec4 pos = projectionMatrix * vec4(position, 1.0);
  pos.z *= (1.0 - styleZBias / 32768.0);
  gl_Position = pos;
}
