uniform float sampleRatio;

// External
vec4 sampleData(vec4 xyzw);

vec4 lerpWidth(vec4 xyzw) {
  float x = xyzw.x * sampleRatio;
  float i = floor(x);
  float f = x - i;
    
  vec4 xyzw1 = vec4(i, xyzw.yzw);
  vec4 xyzw2 = vec4(i + 1.0, xyzw.yzw);
  
  vec4 a = sampleData(xyzw1);
  vec4 b = sampleData(xyzw2);

  return mix(a, b, f);
}
