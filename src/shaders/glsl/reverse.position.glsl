uniform vec4 reverseScale;
uniform vec4 reverseOffset;

vec4 getReverseOffset(vec4 xyzw) {
  return xyzw * reverseScale + reverseOffset;
}
