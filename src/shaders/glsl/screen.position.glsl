void setScreenPosition(vec4 position) {
  gl_Position = vec4(position.xy * 2.0 - 1.0, 0.5, 1.0);
}
