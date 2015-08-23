uniform float sphericalBend;
uniform float sphericalFocus;
uniform float sphericalAspectX;
uniform float sphericalAspectY;
uniform float sphericalScaleY;

uniform mat4 viewMatrix;

vec4 getSphericalPosition(vec4 position, inout vec4 stpq) {
  if (sphericalBend > 0.0001) {

    vec3 xyz = position.xyz * vec3(sphericalBend, sphericalBend / sphericalAspectY * sphericalScaleY, sphericalAspectX);
    float radius = sphericalFocus + xyz.z;
    float cosine = cos(xyz.y) * radius;

    return viewMatrix * vec4(
      sin(xyz.x) * cosine,
      sin(xyz.y) * radius * sphericalAspectY,
      (cos(xyz.x) * cosine - sphericalFocus) / sphericalAspectX,
      1.0
    );
  }
  else {
    return viewMatrix * vec4(position.xyz, 1.0);
  }
}