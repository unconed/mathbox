uniform vec4 mapSize;
uniform vec4 geometryResolution;
uniform vec4 geometryClip;
attribute vec4 position4;
attribute vec2 surface;

// External
vec3 getPosition(vec4 xyzw, float canonical);

void getSurfaceGeometry(vec4 xyzw, float edgeX, float edgeY, out vec3 left, out vec3 center, out vec3 right, out vec3 up, out vec3 down) {
  vec4 deltaX = vec4(1.0, 0.0, 0.0, 0.0);
  vec4 deltaY = vec4(0.0, 1.0, 0.0, 0.0);

  /*
  // high quality, 5 tap
  center =                  getPosition(xyzw, 1.0);
  left   = (edgeX > -0.5) ? getPosition(xyzw - deltaX, 0.0) : center;
  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX, 0.0) : center;
  down   = (edgeY > -0.5) ? getPosition(xyzw - deltaY, 0.0) : center;
  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY, 0.0) : center;
  */
  
  // low quality, 3 tap
  center =                  getPosition(xyzw, 1.0);
  left   =                  center;
  down   =                  center;
  right  = (edgeX < 0.5)  ? getPosition(xyzw + deltaX, 0.0) : (2.0 * center - getPosition(xyzw - deltaX, 0.0));
  up     = (edgeY < 0.5)  ? getPosition(xyzw + deltaY, 0.0) : (2.0 * center - getPosition(xyzw - deltaY, 0.0));
}

vec3 getSurfaceNormal(vec3 left, vec3 center, vec3 right, vec3 up, vec3 down) {
  vec3 dx = right - left;
  vec3 dy = up    - down;
  vec3 n = cross(dy, dx);
  if (length(n) > 0.0) {
    return normalize(n);
  }
  return vec3(0.0, 1.0, 0.0);
}

varying vec3 vNormal;
varying vec3 vLight;
varying vec3 vPosition;

vec3 getSurfacePositionNormal() {
  vec3 left, center, right, up, down;

  vec4 p = min(geometryClip, position4);

  getSurfaceGeometry(p, surface.x, surface.y, left, center, right, up, down);
  vNormal   = getSurfaceNormal(left, center, right, up, down);
  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz); // hardcoded directional light
  vPosition = -center;

#ifdef POSITION_UV
#ifdef POSITION_UV_INT
  vUV = -.5 + (position4.xy * geometryResolution.xy) * mapSize.xy;
#else
  vUV = position4.xy * geometryResolution.xy;
#endif
#endif
  
  return center;
}
