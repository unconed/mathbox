declare var _default: "void setFragmentColor(vec4 color) {\n  if (color.a < 1.0) discard;\n  gl_FragColor = color;\n}";
export default _default;
