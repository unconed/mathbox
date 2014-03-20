void setPosition(vec3 position) {
  gl_Position = projectionMatrix * vec4(position, 1.0);
}
