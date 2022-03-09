export default /* glsl */ `// External
vec4 sampleData(vec4 xyzw);

vec4 lerpHeight(vec4 xyzw) {
  float x = xyzw.y;
  float i = floor(x);
  float f = x - i;
    
  vec4 xyzw1 = vec4(xyzw.x, i, xyzw.zw);
  vec4 xyzw2 = vec4(xyzw.x, i + 1.0, xyzw.zw);
  
  vec4 a = sampleData(xyzw1);
  vec4 b = sampleData(xyzw2);

  return mix(a, b, f);
}
`;