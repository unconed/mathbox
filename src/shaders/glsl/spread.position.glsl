uniform int spreadAxis;
uniform float spreadOffset;
uniform vec4 spreadVector;

// External
vec4 getValue(vec4 xyzw);

vec4 getSpreadValue(vec4 xyzw) {

  vec4 sample = getValue(xyzw);

  float offset = spreadOffset;
  if      (spreadAxis == 1) offset += xyzw.x;
  else if (spreadAxis == 2) offset += xyzw.y;
  else if (spreadAxis == 3) offset += xyzw.z;
  else if (spreadAxis == 4) offset += xyzw.w;
  
  return sample + spreadVector * offset;
}
