uniform float worldUnit;
uniform float focusDepth;
uniform float tickSize;
uniform float tickEpsilon;
uniform vec3  tickNormal;
uniform vec2  tickStrip;

vec4 getSample(vec4 xyzw);

vec3 transformPosition(vec4 position, vec4 stpq);

vec3 getTickPosition(vec4 xyzw, vec4 stpq) {

  float epsilon = tickEpsilon;

  // determine tick direction
  float leftX  = max(tickStrip.x, xyzw.y - 1.0);
  float rightX = min(tickStrip.y, xyzw.y + 1.0);
  
  vec4 left    = getSample(vec4(leftX,  xyzw.zw, 0.0));
  vec4 right   = getSample(vec4(rightX, xyzw.zw, 0.0));
  vec4 diff    = right - left;

  vec3 normal  = cross(normalize(diff.xyz + vec3(diff.w)), tickNormal);
  float bias   = max(0.0, 1.0 - length(normal) * 2.0);
       normal  = mix(normal, tickNormal.yzx, bias * bias);
  
  // transform (point) and (point + delta)
  vec4 center  = getSample(vec4(xyzw.yzw, 0.0));
  vec4 delta   = vec4(normal, 0.0) * epsilon;

  vec4 a = center;
  vec4 b = center + delta;

  vec3 c = transformPosition(a, stpq);
  vec3 d = transformPosition(b, stpq);
  
  // sample on either side to create line
  float line = xyzw.x - .5;
  vec3  mid  = c;
  vec3  side = normalize(d - c);

  return mid + side * line * tickSize * worldUnit * focusDepth;
}
