uniform vec4 splitScale;
uniform vec4 splitModulus;
uniform vec4 splitDimensions;

vec4 getSplitXYZW(vec4 xyzw) {
  vec4 base = floor(xyzw * splitScale);
  vec4 offset = mod(xyzw, splitModulus);
  
  vec4 result = base + vec4(offset.yz, 0.0, offset.x) * splitDimensions;
  return result;
}
