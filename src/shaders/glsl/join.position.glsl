uniform float joinStride;
uniform float joinStrideInv;

float getIndex(vec4 xyzw);
vec4 getRest(vec4 xyzw);
vec4 injectIndices(float a, float b);

vec4 getJoinXYZW(vec4 xyzw) {

  float a = getIndex(xyzw);
  float b = a * joinStrideInv;

  float integer  = floor(b);
  float fraction = b - integer;
  
  return injectIndices(fraction * joinStride, integer) + getRest(xyzw);
}
