uniform float tickSize;
uniform vec4  tickAxis;
uniform vec4  tickNormal;

vec4 sampleData(vec2 xy);

vec3 transformPosition(vec4 value);

vec3 getTickPosition(vec2 xy) {

  const float epsilon = 0.0001;
  float line = xy.x * 2.0 - 1.0;

  vec4 center = tickAxis * sampleData(vec2(xy.y, 0.0));
  vec4 edge   = tickNormal * epsilon;

  vec4 a = center;
  vec4 b = center + edge;

  vec3 c = transformPosition(a);
  vec3 d = transformPosition(b);
  
  vec3 mid  = c;
  vec3 side = normalize(d - c);

  return mid + side * line * tickSize;
}
