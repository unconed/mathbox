uniform float tickSize;
uniform vec4  tickAxis;
uniform vec4  tickNormal;

vec4 sampleData(float x);

vec3 transformPosition(vec4 value);

vec3 getTickPosition(vec4 xyzw) {

  const float epsilon = 0.0001;
  float line = xyzw.x - .5;

  vec4 center = tickAxis * sampleData(xyzw.y);
  vec4 edge   = tickNormal * epsilon;

  vec4 a = center;
  vec4 b = center + edge;

  vec3 c = transformPosition(a);
  vec3 d = transformPosition(b);
  
  vec3 mid  = c;
  vec3 side = normalize(d - c);

  return mid + side * line * tickSize;
}
