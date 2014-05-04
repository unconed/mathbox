uniform float sampleRatio;

// External
vec4 sampleData(vec4 xyzi);

vec4 lerpHeight(vec4 xyzi) {
  float x = xyzi.y * sampleRatio;
  float i = floor(x);
  float f = x - i;
    
  vec4 xyzi1 = vec4(xyzi.x, i, xyzi.zw);
  vec4 xyzi2 = vec4(xyzi.x, i + 1.0, xyzi.zw);
  
  vec4 a = sampleData(xyzi1);
  vec4 b = sampleData(xyzi2);

  return mix(a, b, f);
}
