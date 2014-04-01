uniform float polarBend;
uniform float polarFocus;
uniform float polarAspect;
uniform float polarHelix;

uniform mat4 viewMatrix;

vec4 getPolarPosition(vec4 position) {
  if (polarBend > 0.0001) {

    vec2 xy = position.xy * vec2(polarBend, polarAspect);
    float radius = polarFocus + xy.y;

    return viewMatrix * vec4(
      sin(xy.x) * radius,
      (cos(xy.x) * radius - polarFocus) / polarAspect,
      position.z + position.x * polarHelix * polarBend,
      1.0
    );
  }
  else {
    return viewMatrix * vec4(position.xyz, 1.0);
  }
}