attribute vec4 position4;

// External
vec3 getPosition(vec4 xyzw, float canonical);

varying vec3 vNormal;
varying vec3 vLight;
varying vec3 vPosition;

void getFaceGeometry(vec4 xyzw, out vec3 pos, out vec3 normal) {
  vec3 a, b, c;

  a   = getPosition(vec4(xyzw.xyz, 0.0), 0.0);
  b   = getPosition(vec4(xyzw.xyz, 1.0), 0.0);
  c   = getPosition(vec4(xyzw.xyz, 2.0), 0.0);

  pos = getPosition(xyzw, 1.0);
  normal = normalize(cross(c - a, b - a));
}

vec3 getFacePositionNormal() {
  vec3 center, normal;

  getFaceGeometry(position4, center, normal);
  vNormal   = normal;
  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz);
  vPosition = -center;

  return center;
}
