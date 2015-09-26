uniform vec4 geometryClip;
attribute vec4 position4;
attribute vec3 strip;

// External
vec3 getPosition(vec4 xyzw, float canonical);

varying vec3 vNormal;
varying vec3 vLight;
varying vec3 vPosition;

void getStripGeometry(vec4 xyzw, vec3 strip, out vec3 pos, out vec3 normal) {
  vec3 a, b, c;

  a   = getPosition(xyzw, 1.0);
  b   = getPosition(vec4(xyzw.xyz, strip.x), 0.0);
  c   = getPosition(vec4(xyzw.xyz, strip.y), 0.0);

  normal = normalize(cross(c - a, b - a)) * strip.z;
  
  pos = a;
}

vec3 getStripPositionNormal() {
  vec3 center, normal;

  vec4 p = min(geometryClip, position4);

  getStripGeometry(p, strip, center, normal);
  vNormal   = normal;
  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);
  vPosition = -center;

  return center;
}
