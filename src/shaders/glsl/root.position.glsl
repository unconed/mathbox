vec3 getRootPosition(vec4 position, in vec4 stpqIn, out vec4 stpqOut) {
  stpqOut = stpqIn; // avoid inout confusion
  return position.xyz;
}