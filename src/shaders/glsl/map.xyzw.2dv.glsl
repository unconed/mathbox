void mapXyzw2DV(vec4 xyzw, out vec2 xy, out float z) {
  xy = xyzw.xy;
  z  = xyzw.z;
}

