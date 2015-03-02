void setFragmentColor(vec4 color) {
  if (color.a >= 1.0) discard;
  gl_FragColor = color;
}