uniform float subdivideBevel;

// External
vec4 sampleData(vec4 xyzw);

vec4 subdivideItemsLerp(vec4 xyzw) {
  float x = xyzw.w;
  float i = floor(x);
  float f = x - i;

  float minf = subdivideBevel * min(f, 1.0 - f);
  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;

  vec4 xyzw1 = vec4(xyzw.xyz, i);
  vec4 xyzw2 = vec4(xyzw.xyz, i + 1.0);
  
  vec4 a = sampleData(xyzw1);
  vec4 b = sampleData(xyzw2);

  return mix(a, b, g);
}
